/** Shared quote-form validation and message formatting (used by the form and any future server). */
import { site } from "@/content/site";

export type QuoteInput = {
  name: string;
  business: string;
  phone: string;
  email: string;
  businessType: string;
  suburb: string;
  size: string;
  frequency: string;
  services: string[];
  message: string;
};

export type QuoteErrors = Partial<Record<"name" | "contact" | "email" | "suburb", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_FILL_MS = 3500;

export function validateQuote(q: QuoteInput): QuoteErrors {
  const e = site.contactPage.form.errors;
  const errors: QuoteErrors = {};
  if (q.name.trim().length < 2) errors.name = e.name;
  if (!q.phone.trim() && !q.email.trim()) errors.contact = e.phoneOrEmail;
  if (q.email.trim() && !EMAIL.test(q.email.trim())) errors.email = e.email;
  if (q.suburb.trim().length < 2) errors.suburb = e.suburb;
  return errors;
}

export function formatQuote(q: QuoteInput) {
  const f = site.contactPage.form;
  const lines = [
    `Quote request: ${site.name}`,
    `${f.name}: ${q.name}`,
    q.business && `${f.business}: ${q.business}`,
    q.phone && `${f.phone}: ${q.phone}`,
    q.email && `${f.email}: ${q.email}`,
    q.businessType && `${f.businessType}: ${q.businessType}`,
    `${f.suburb}: ${q.suburb}`,
    q.size && `${f.size}: ${q.size}`,
    q.frequency && `${f.frequency}: ${q.frequency}`,
    q.services.length ? `${f.services}: ${q.services.join(", ")}` : "",
    q.message && `${f.message} ${q.message}`,
  ];
  return lines.filter(Boolean).join("\n");
}
