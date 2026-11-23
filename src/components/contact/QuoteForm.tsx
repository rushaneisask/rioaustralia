"use client";

import { useRef, useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { formatQuote, MIN_FILL_MS, validateQuote, type QuoteErrors, type QuoteInput } from "@/lib/quote";
import { ArrowIcon, CheckIcon, PhoneIcon } from "@/components/ui/primitives";

const f = site.contactPage.form;
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "fallback"; body: string } | { kind: "error" };

const empty: QuoteInput = {
  name: "",
  business: "",
  phone: "",
  email: "",
  businessType: "",
  suburb: "",
  size: "",
  frequency: "",
  services: [],
  message: "",
};

const field =
  "w-full min-h-12 rounded-2xl bg-white px-4 py-3 text-base text-ink ring-1 ring-line placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-aqua-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[#c2410c]";
const label = "mb-2 block font-display text-[0.95rem] font-semibold text-ink";

export function QuoteForm() {
  const [v, setV] = useState<QuoteInput>(empty);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [startedAt] = useState(() => Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const summary = useRef<HTMLDivElement>(null);

  const set = <K extends keyof QuoteInput>(k: K, val: QuoteInput[K]) => setV((s) => ({ ...s, [k]: val }));
  const toggleService = (s: string) =>
    setV((st) => ({ ...st, services: st.services.includes(s) ? st.services.filter((x) => x !== s) : [...st.services, s] }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (honeypot.current?.value) return; // bot
    const errs = validateQuote(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    if (Date.now() - startedAt < MIN_FILL_MS) {
      setErrors({ name: f.errors.tooFast });
      return;
    }
    const body = formatQuote(v);
    if (!WEB3FORMS_KEY) {
      setStatus({ kind: "fallback", body });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New quote request: ${v.business || v.name} (${v.suburb})`,
          from_name: `${site.name} website`,
          replyto: v.email || undefined,
          ...v,
          services: v.services.join(", "),
          notes: v.message,
          message: body,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) setStatus({ kind: "sent" });
      else setStatus({ kind: "fallback", body });
    } catch {
      setStatus({ kind: "fallback", body });
    }
  }

  if (status.kind === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-[2rem] bg-white p-8 ring-1 ring-aqua-300 sm:p-10">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-aqua-100 text-teal-700">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="font-display text-3xl font-semibold text-ink">{f.successTitle}</h2>
        <p className="text-lg text-ink-soft">{f.successBody}</p>
      </div>
    );
  }

  if (status.kind === "fallback") {
    const sms = `${site.contact.smsHref}?&body=${encodeURIComponent(status.body)}`;
    return (
      <div role="status" className="flex flex-col items-start gap-5 rounded-[2rem] bg-white p-8 ring-1 ring-aqua-300 sm:p-10">
        <h2 className="font-display text-3xl font-semibold text-ink">{f.fallbackTitle}</h2>
        <p className="text-lg text-ink-soft">{f.fallbackBody}</p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a href={sms} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 font-display font-semibold text-white hover:bg-teal-900">
            {f.fallbackSms} <ArrowIcon />
          </a>
          {site.contact.email ? (
            <a
              href={`mailto:${site.contact.email}?subject=${encodeURIComponent("Quote request")}&body=${encodeURIComponent(status.body)}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-display font-semibold text-teal-900 ring-1 ring-line hover:bg-aqua-100"
            >
              {f.fallbackEmail}
            </a>
          ) : null}
          <a href={site.contact.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-aqua-100 px-6 font-display font-semibold text-teal-900">
            <PhoneIcon /> {site.contact.phone}
          </a>
        </div>
        <pre className="mt-2 w-full overflow-auto whitespace-pre-wrap rounded-2xl bg-mist p-4 text-sm text-ink-soft">{status.body}</pre>
      </div>
    );
  }

  const errList = Object.values(errors);

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[2rem] bg-white/80 p-6 ring-1 ring-line backdrop-blur-sm sm:p-10">
      {errList.length ? (
        <div ref={summary} tabIndex={-1} role="alert" className="mb-6 rounded-2xl bg-coral-soft px-5 py-4 text-[#9a3412] focus:outline-none">
          <ul className="list-disc pl-5">
            {errList.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {status.kind === "error" ? (
        <p role="alert" className="mb-6 rounded-2xl bg-coral-soft px-5 py-4 text-[#9a3412]">
          {f.errorBody}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className={label}>
            {f.name} <span className="text-[#c2410c]">*</span>
          </label>
          <input id="q-name" autoComplete="name" className={field} value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "q-name-err" : undefined} />
          {errors.name ? <p id="q-name-err" className="mt-1.5 text-sm text-[#9a3412]">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="q-business" className={label}>
            {f.business}
          </label>
          <input id="q-business" autoComplete="organization" className={field} value={v.business} onChange={(e) => set("business", e.target.value)} />
        </div>
        <div>
          <label htmlFor="q-phone" className={label}>
            {f.phone}
          </label>
          <input id="q-phone" type="tel" inputMode="tel" autoComplete="tel" className={field} value={v.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? "q-contact-err" : undefined} />
        </div>
        <div>
          <label htmlFor="q-email" className={label}>
            {f.email}
          </label>
          <input id="q-email" type="email" inputMode="email" autoComplete="email" className={field} value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email || !!errors.contact} aria-describedby={errors.email ? "q-email-err" : errors.contact ? "q-contact-err" : undefined} />
          {errors.email ? <p id="q-email-err" className="mt-1.5 text-sm text-[#9a3412]">{errors.email}</p> : null}
        </div>
        {errors.contact ? (
          <p id="q-contact-err" className="-mt-3 text-sm text-[#9a3412] sm:col-span-2">
            {errors.contact}
          </p>
        ) : null}
        <div>
          <label htmlFor="q-type" className={label}>
            {f.businessType}
          </label>
          <select id="q-type" className={`${field} cursor-pointer appearance-none`} value={v.businessType} onChange={(e) => set("businessType", e.target.value)}>
            <option value="">—</option>
            {f.businessTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="q-suburb" className={label}>
            {f.suburb} <span className="text-[#c2410c]">*</span>
          </label>
          <input id="q-suburb" autoComplete="address-level2" className={field} value={v.suburb} onChange={(e) => set("suburb", e.target.value)} aria-invalid={!!errors.suburb} aria-describedby={errors.suburb ? "q-suburb-err" : undefined} />
          {errors.suburb ? <p id="q-suburb-err" className="mt-1.5 text-sm text-[#9a3412]">{errors.suburb}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-size" className={label}>
            {f.size}
          </label>
          <input id="q-size" className={field} value={v.size} onChange={(e) => set("size", e.target.value)} aria-describedby="q-size-hint" />
          <p id="q-size-hint" className="mt-1.5 text-sm text-ink-soft">
            {f.sizeHint}
          </p>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className={label}>{f.frequency}</legend>
          <div className="flex flex-wrap gap-2">
            {f.frequencies.map((fr) => (
              <label key={fr} className="cursor-pointer">
                <input type="radio" name="frequency" value={fr} checked={v.frequency === fr} onChange={() => set("frequency", fr)} className="peer sr-only" />
                <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white px-4 font-display font-semibold text-teal-900 ring-1 ring-line transition-colors peer-checked:bg-brand peer-checked:text-white peer-checked:ring-brand peer-focus-visible:ring-2 peer-focus-visible:ring-aqua-500">
                  {fr}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="sm:col-span-2">
          <legend className={label}>{f.services}</legend>
          <div className="flex flex-wrap gap-2">
            {site.cleaning.services.items.map((s) => (
              <label key={s.id} className="cursor-pointer">
                <input type="checkbox" checked={v.services.includes(s.title)} onChange={() => toggleService(s.title)} className="peer sr-only" />
                <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-medium text-teal-900 ring-1 ring-line transition-colors peer-checked:bg-aqua-100 peer-checked:ring-aqua-500 peer-focus-visible:ring-2 peer-focus-visible:ring-aqua-500">
                  {s.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <label htmlFor="q-msg" className={label}>
            {f.message}
          </label>
          <textarea id="q-msg" rows={4} className={`${field} resize-y`} value={v.message} onChange={(e) => set("message", e.target.value)} aria-describedby="q-msg-hint" />
          <p id="q-msg-hint" className="mt-1.5 text-sm text-ink-soft">
            {f.messageHint}
          </p>
        </div>

        {/* honeypot: hidden from people, tempting for bots */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="q-website">Website</label>
          <input id="q-website" ref={honeypot} tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="mt-8 inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 font-display text-lg font-semibold text-white shadow-[0_10px_30px_-10px_rgba(11,122,133,0.65)] transition-all hover:bg-teal-900 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {status.kind === "sending" ? f.sending : f.submit} <ArrowIcon />
      </button>
    </form>
  );
}
