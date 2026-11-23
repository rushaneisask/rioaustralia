/**
 * Market rate finder for RIO Australia.
 *
 * Finds PUBLICLY LISTED commercial-cleaning prices around south-east Melbourne and the
 * Mornington Peninsula, and writes them to research/market-rates-<date>.{json,md}.
 *
 * Two stages, both driven from this code:
 *   1. Research: Claude uses Anthropic's server-side web search + web fetch tools to find and
 *      read pages that publish prices, then writes up every price with its source URL.
 *   2. Extract: a second call turns that write-up into a strict JSON table (structured outputs).
 *      Code then drops any record whose source URL was not actually retrieved in stage 1,
 *      so prices can't be invented.
 *
 * Only public web pages are used. It never contacts businesses or requests quotes.
 *
 * Run:  npm run research:rates
 * Auth: ANTHROPIC_API_KEY in the environment (see tools/market-rates/README.md).
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { mkdir, writeFile } from "node:fs/promises";
import { ExtractedRates, type RateRecord } from "./schema";

const MODEL = "claude-opus-5-5";
const MAX_SEARCHES = 30;
const MAX_FETCHES = 30;
const MAX_PAUSE_RESUMES = 8;

// Refusal fallback (server-side): if a safety classifier declines, the API re-runs the
// request on a fallback model inside the same call. "default" routes by refusal category.
const FALLBACK: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: "default" } = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

const client = new Anthropic();

const RESEARCH_SYSTEM = `You are a market researcher for a small commercial cleaning business in south-east Melbourne, Australia (Cranbourne down to Mornington and the Mornington Peninsula). The business cleans offices (law, accounting, general), medical and dental clinics, and real estate agencies on fixed recurring contracts (1 to 5 cleans per week), plus steam cleaning and window cleaning up to 10 m.

Your job: find prices that are PUBLICLY PUBLISHED on the web for comparable commercial cleaning in Melbourne, prioritising south-east Melbourne and the Mornington Peninsula.

Good sources:
- Cleaning companies' own websites that list rates (hourly rates, per-clean prices, "from $X", monthly packages, per-square-metre pricing).
- Australian cost guides and marketplaces that publish typical commercial cleaning rates (for example hipages, Oneflare, ServiceSeeking, Airtasker cost guides).
- The Fair Work Ombudsman pay guide for the Cleaning Services Award (the legal minimum hourly wage for a cleaner, which is the cost floor, not a selling price).

Rules:
- Record only prices that are actually stated on a page you retrieved. Never estimate, infer or round a price yourself.
- Note for every price: the business or publication, the exact page URL, the area, the service type, what the price is per (hour, clean, week, month, square metre), whether GST is included if stated, and any conditions (minimum hours, size, frequency).
- Copy a short verbatim snippet showing each price.
- Skip residential-only and end-of-lease prices unless nothing commercial exists for that source. If you include them, label them clearly.
- It is expected that many commercial cleaners do not publish prices. Say so rather than padding the list.
- Do not contact anyone, fill in forms or request quotes.

Finish with a plain write-up listing every price found (one per line with all the details above), followed by a short note on gaps and caveats.`;

const RESEARCH_PROMPT = `Research publicly listed commercial cleaning prices for offices, medical/dental clinics and real estate agencies in south-east Melbourne and the Mornington Peninsula (and Melbourne-wide guides if local prices are scarce). Also find the current Cleaning Services Award minimum adult hourly rate from the Fair Work Ombudsman. Aim for at least 15 distinct priced sources if they exist.`;

const EXTRACT_SYSTEM = `You convert a market research write-up into structured records. Use only information present in the write-up. Do not add, estimate or change any price, URL or business. If a line lacks a URL or a concrete number, leave it out. Keep each quote verbatim and under 200 characters.`;

type Usage = { input: number; output: number; searches: number; fetches: number };

function addUsage(total: Usage, u: Anthropic.Beta.BetaUsage | undefined) {
  if (!u) return;
  total.input += (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
  total.output += u.output_tokens ?? 0;
  total.searches += u.server_tool_use?.web_search_requests ?? 0;
  total.fetches += u.server_tool_use?.web_fetch_requests ?? 0;
}

/** Collect every URL the server-side tools actually returned, so stage 2 can be verified. */
function collectUrls(content: Anthropic.Beta.BetaContentBlock[], into: Set<string>) {
  for (const block of content) {
    if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const r of block.content) if (r.type === "web_search_result") into.add(normaliseUrl(r.url));
    } else if (block.type === "web_fetch_tool_result" && block.content.type === "web_fetch_result") {
      into.add(normaliseUrl(block.content.url));
    }
  }
}

function normaliseUrl(u: string) {
  try {
    const url = new URL(u);
    url.hash = "";
    for (const k of [...url.searchParams.keys()]) if (k.startsWith("utm_")) url.searchParams.delete(k);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}${url.search}`.toLowerCase();
  } catch {
    return u.toLowerCase();
  }
}

function textOf(content: Anthropic.Beta.BetaContentBlock[]) {
  return content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

async function research(usage: Usage) {
  const urls = new Set<string>();
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: RESEARCH_PROMPT }];
  const tools: Anthropic.Beta.BetaToolUnion[] = [
    {
      type: "web_search_20260209",
      name: "web_search",
      max_uses: MAX_SEARCHES,
      user_location: { type: "approximate", city: "Melbourne", region: "Victoria", country: "AU", timezone: "Australia/Melbourne" },
    },
    { type: "web_fetch_20260209", name: "web_fetch", max_uses: MAX_FETCHES },
  ];

  let writeUp = "";
  for (let turn = 0; turn <= MAX_PAUSE_RESUMES; turn++) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      ...FALLBACK,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      system: RESEARCH_SYSTEM,
      tools,
      messages,
    });
    let dots = 0;
    stream.on("streamEvent", (e) => {
      if (e.type === "content_block_start" && e.content_block.type === "server_tool_use") {
        process.stdout.write(e.content_block.name === "web_search" ? "s" : "f");
        if (++dots % 60 === 0) process.stdout.write("\n");
      }
    });
    const message = await stream.finalMessage();
    addUsage(usage, message.usage);
    collectUrls(message.content, urls);

    if (message.stop_reason === "refusal") {
      throw new Error(`Research was declined (${message.stop_details?.category ?? "no category"}).`);
    }
    if (message.stop_reason === "pause_turn") {
      // Long server-tool turn: send it back unchanged so the server continues where it left off.
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    if (message.stop_reason === "max_tokens") throw new Error("Research write-up hit max_tokens.");
    writeUp = textOf(message.content);
    break;
  }
  process.stdout.write("\n");
  if (!writeUp) throw new Error("Research did not finish within the resume limit.");
  return { writeUp, urls };
}

async function extract(writeUp: string, usage: Usage) {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    output_config: { effort: "low", format: betaZodOutputFormat(ExtractedRates) },
    system: EXTRACT_SYSTEM,
    messages: [{ role: "user", content: `<write_up>\n${writeUp}\n</write_up>` }],
  });
  addUsage(usage, response.usage);
  if (response.stop_reason === "refusal") throw new Error("Extraction was declined.");
  if (!response.parsed_output) throw new Error(`Extraction returned no parseable output (stop: ${response.stop_reason}).`);
  return response.parsed_output;
}

/* ------------------------------ statistics ------------------------------ */

const exGst = (r: RateRecord, v: number) => (r.gst === "inc" ? v / 1.1 : v);

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function summarise(records: RateRecord[]) {
  const commercial = new Set(["office_regular", "medical_dental", "real_estate_retail", "general_commercial"]);
  const groups = new Map<string, number[]>();
  for (const r of records) {
    if (r.price_basis === "award_min_hourly") continue;
    const key = `${commercial.has(r.service) ? "commercial" : r.service} / ${r.price_basis}`;
    const mid = r.amount_high ? (r.amount_low + r.amount_high) / 2 : r.amount_low;
    const list = groups.get(key) ?? [];
    list.push(exGst(r, mid));
    groups.set(key, list);
  }
  return [...groups.entries()]
    .map(([key, values]) => {
      const s = [...values].sort((a, b) => a - b);
      return { group: key, count: s.length, min: s[0], p25: quantile(s, 0.25), median: quantile(s, 0.5), p75: quantile(s, 0.75), max: s[s.length - 1] };
    })
    .sort((a, b) => b.count - a.count);
}

/* --------------------------------- main --------------------------------- */

const money = (n: number) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : "-");

async function main() {
  const started = Date.now();
  const usage: Usage = { input: 0, output: 0, searches: 0, fetches: 0 };

  console.log("Stage 1/2: researching published prices (s = search, f = page read)...");
  const { writeUp, urls } = await research(usage);
  console.log(`  ${urls.size} distinct pages retrieved.`);

  console.log("Stage 2/2: extracting and verifying records...");
  const extracted = await extract(writeUp, usage);
  const verified = extracted.records.filter((r) => urls.has(normaliseUrl(r.source_url)));
  const dropped = extracted.records.filter((r) => !urls.has(normaliseUrl(r.source_url)));
  const award = verified.filter((r) => r.price_basis === "award_min_hourly");
  const summary = summarise(verified);

  const date = new Date().toISOString().slice(0, 10);
  await mkdir("research", { recursive: true });
  const out = {
    generated_at: new Date().toISOString(),
    model: MODEL,
    region: "South-east Melbourne & Mornington Peninsula (Melbourne-wide guides included)",
    note: "Publicly listed prices only. Amounts in AUD. Summary statistics are ex-GST (GST-inclusive prices divided by 1.1).",
    summary,
    award_reference: award,
    records: verified,
    dropped_unverified: dropped,
    caveats: extracted.notes,
    usage,
  };
  await writeFile(`research/market-rates-${date}.json`, JSON.stringify(out, null, 2));

  const md = [
    `# Market rates: commercial cleaning, south-east Melbourne (${date})`,
    "",
    "Publicly listed prices only. Summary amounts are AUD **ex GST**.",
    "",
    "## Summary",
    "",
    "| Group | Sources | Low | 25% | Median | 75% | High |",
    "|---|---|---|---|---|---|---|",
    ...summary.map((s) => `| ${s.group} | ${s.count} | ${money(s.min)} | ${money(s.p25)} | ${money(s.median)} | ${money(s.p75)} | ${money(s.max)} |`),
    "",
    "## Award minimum (cost floor)",
    "",
    ...(award.length ? award.map((a) => `- ${money(a.amount_low)}/hr (${a.gst}) – ${a.business}: ${a.source_url}`) : ["- Not found this run."]),
    "",
    "## Every price found",
    "",
    "| Business | Area | Service | Basis | Price | GST | Conditions | Source |",
    "|---|---|---|---|---|---|---|---|",
    ...verified.map(
      (r) =>
        `| ${r.business} | ${r.area ?? "-"} | ${r.service} | ${r.price_basis} | ${money(r.amount_low)}${r.amount_high ? `–${money(r.amount_high)}` : ""} | ${r.gst} | ${(r.conditions ?? "-").replace(/\|/g, "/")} | [link](${r.source_url}) |`,
    ),
    "",
    "## Caveats",
    "",
    ...extracted.notes.map((n) => `- ${n}`),
    ...(dropped.length ? [`- ${dropped.length} record(s) dropped because their URL was not among the pages actually retrieved.`] : []),
    "",
    "## Run details",
    "",
    `- Model: ${MODEL}; ${usage.searches} searches, ${usage.fetches} page reads; ${usage.input.toLocaleString()} input / ${usage.output.toLocaleString()} output tokens; ${Math.round((Date.now() - started) / 1000)}s.`,
  ].join("\n");
  await writeFile(`research/market-rates-${date}.md`, md);

  // Opus 5.5: $4 per million input tokens, $20 per million output tokens. Web search/fetch fees are separate.
  const tokenCost = (usage.input * 4 + usage.output * 20) / 1_000_000;
  console.log(`\nDone: ${verified.length} verified prices (${dropped.length} dropped as unverifiable).`);
  console.log(`Saved research/market-rates-${date}.md and .json`);
  console.log(`Usage: ${usage.searches} searches, ${usage.fetches} page reads, ~US$${tokenCost.toFixed(2)} in tokens (plus Anthropic's per-search fee).`);
}

main().catch((err) => {
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("No valid Anthropic API key. Set ANTHROPIC_API_KEY (see tools/market-rates/README.md).");
  } else if (err instanceof Anthropic.RateLimitError) {
    console.error("Rate limited by the Anthropic API. Wait a minute and run again.");
  } else if (err instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${err.status}: ${err.message}`);
  } else {
    console.error(err instanceof Error ? err.message : err);
  }
  process.exit(1);
});
