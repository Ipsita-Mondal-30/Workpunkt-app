const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KNOWN_INVALID_TLDS = new Set(["comm"]);

export function normalizeLeadEmail(value: string): { ok: true; email: string } | { ok: false } {
  const email = value.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false };
  }

  const tld = email.slice(email.lastIndexOf(".") + 1).toLowerCase();
  if (KNOWN_INVALID_TLDS.has(tld)) {
    return { ok: false };
  }

  return { ok: true, email };
}
