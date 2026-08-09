/** Canonical public contact for legal pages and forms. */
export const LEGAL_CONTACT_EMAIL = "contact@workpunkt.com" as const;

export const LEGAL_COMPANY = {
  name: "WORKPUNKT UG (haftungsbeschränkt)",
  street: "Antonienstraße 21",
  postalCity: "13403 Berlin",
  country: "Germany",
  registerCourt: "Amtsgericht Charlottenburg",
  registerNumber: "HRB 284702 B",
  vatId: "DE461805583",
  managingDirector: "Priiya Rao",
  website: "https://workpunkt.com",
  email: LEGAL_CONTACT_EMAIL,
  lastUpdated: "09 August 2026",
} as const;

export const legalPaths = {
  impressum: "/impressum",
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
  refundPolicy: "/refund-policy",
  cookiePolicy: "/cookie-policy",
  trust: "/trust",
} as const;

export type LegalPathKey = keyof typeof legalPaths;

/** In-app expo-router paths for offline legal documents. */
export const legalAppRoutes = {
  impressum: "/legal/impressum",
  privacyPolicy: "/legal/privacy-policy",
  termsOfService: "/legal/terms-of-service",
  refundPolicy: "/legal/refund-policy",
  cookiePolicy: "/legal/cookie-policy",
  trust: "/legal/trust",
} as const;

export type LegalSlug =
  | "impressum"
  | "privacy-policy"
  | "terms-of-service"
  | "refund-policy"
  | "cookie-policy"
  | "trust";

export const legalNavLinks = [
  { label: "Privacy Policy", slug: "privacy-policy" as const, href: legalAppRoutes.privacyPolicy },
  { label: "Impressum", slug: "impressum" as const, href: legalAppRoutes.impressum },
  { label: "Terms of Service", slug: "terms-of-service" as const, href: legalAppRoutes.termsOfService },
  { label: "Refund Policy", slug: "refund-policy" as const, href: legalAppRoutes.refundPolicy },
  { label: "Cookie Policy", slug: "cookie-policy" as const, href: legalAppRoutes.cookiePolicy },
  { label: "Trust Centre", slug: "trust" as const, href: legalAppRoutes.trust },
] as const;

export const legalPublicPaths = Object.values(legalPaths);
