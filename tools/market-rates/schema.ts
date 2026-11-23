import { z } from "zod";

/** One publicly listed price, exactly as found on a web page. */
export const RateRecord = z.object({
  business: z.string().describe("Business or publication name as shown on the page"),
  source_url: z.string().describe("The exact URL of the page the price was read from"),
  source_type: z
    .enum(["competitor_site", "price_guide", "directory_listing", "award_rate", "other"])
    .describe("competitor_site = a cleaning company's own site; price_guide = a cost guide/article; award_rate = Fair Work award minimum"),
  area: z.string().nullable().describe("Suburb/region the price applies to, or null if not stated"),
  service: z
    .enum([
      "office_regular",
      "medical_dental",
      "real_estate_retail",
      "general_commercial",
      "window",
      "steam_carpet",
      "end_of_lease",
      "residential",
      "other",
    ])
    .describe("What kind of cleaning the price is for"),
  price_basis: z
    .enum(["per_hour", "per_clean", "per_week", "per_month", "per_sqm", "fixed_from", "award_min_hourly"])
    .describe("What the amount is charged per"),
  amount_low: z.number().describe("Price in AUD (the single price, or the low end of a range)"),
  amount_high: z.number().nullable().describe("High end of a range in AUD, or null for a single price"),
  gst: z.enum(["inc", "ex", "unknown"]).describe("Whether the price includes GST"),
  conditions: z
    .string()
    .nullable()
    .describe("Size, frequency, minimum hours, or other conditions attached to the price, or null"),
  quote: z.string().describe("A short verbatim snippet (under 200 characters) from the page showing the price"),
});
export type RateRecord = z.infer<typeof RateRecord>;

export const ExtractedRates = z.object({
  records: z.array(RateRecord),
  notes: z.array(z.string()).describe("Caveats about the market data, e.g. most firms do not publish prices"),
});
export type ExtractedRates = z.infer<typeof ExtractedRates>;
