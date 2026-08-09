import { LEGAL_COMPANY, LEGAL_CONTACT_EMAIL } from "./legal-config";

export type LegalSection = {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalPageContent = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const LAST_UPDATED = LEGAL_COMPANY.lastUpdated;

export const impressumPage: LegalPageContent = {
  slug: "impressum",
  title: "Impressum",
  metaTitle: "Impressum | WORKPUNKT",
  metaDescription:
    "Legal imprint for WORKPUNKT UG (haftungsbeschränkt), including company details, commercial register, VAT ID and contact information.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: "Information pursuant to § 5 Digital Services Act (DDG)",
      paragraphs: [],
    },
    {
      heading: "Company Details",
      paragraphs: [
        "WORKPUNKT UG (haftungsbeschränkt)",
        "Antonienstraße 21",
        "13403 Berlin",
        "Germany",
        "The company is registered with the Commercial Register of the Local Court (Amtsgericht) Charlottenburg under HRB 284702 B.",
      ],
    },
    {
      heading: "Managing Director",
      paragraphs: ["Priiya Rao"],
    },
    {
      heading: "Commercial Register",
      paragraphs: [
        "Register Court: Amtsgericht Charlottenburg",
        "Commercial Register Number: HRB 284702 B",
      ],
    },
    {
      heading: "VAT Identification Number",
      paragraphs: ["DE461805583"],
    },
    {
      heading: "Contact",
      paragraphs: [
        `Email: ${LEGAL_CONTACT_EMAIL}`,
        "Website: https://workpunkt.com",
      ],
    },
    {
      heading: "Business Activities",
      paragraphs: [
        "Educational consulting, career and study guidance, business and management consulting, market research consulting, strategic consulting, digital transformation consulting and related support services.",
      ],
    },
    {
      heading: "Responsible for Editorial Content",
      paragraphs: [
        "Priiya Rao",
        "WORKPUNKT UG (haftungsbeschränkt)",
        "Antonienstraße 21",
        "13403 Berlin",
        "Germany",
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
    {
      heading: "Consumer Dispute Resolution",
      paragraphs: [
        "The European Commission provides an Online Dispute Resolution (ODR) platform: https://ec.europa.eu/consumers/odr/",
        "WORKPUNKT UG (haftungsbeschränkt) is neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.",
      ],
    },
    {
      heading: "Liability for Content",
      paragraphs: [
        "The content of this website has been created with the greatest possible care. However, we cannot guarantee that all information is complete, accurate or up to date.",
      ],
    },
    {
      heading: "Liability for External Links",
      paragraphs: [
        "This website contains links to external websites operated by third parties. Responsibility for the content of linked websites always lies with the respective operator.",
      ],
    },
    {
      heading: "Intellectual Property",
      paragraphs: [
        "All content published on this website is protected by copyright and other intellectual property laws. Any reproduction, distribution, modification or commercial use without prior written permission is prohibited unless permitted by law.",
      ],
    },
    {
      heading: "Trademarks",
      paragraphs: [
        "'WORKPUNKT' and associated brand assets are the intellectual property of WORKPUNKT UG (haftungsbeschränkt).",
      ],
    },
    {
      heading: "Contact for Legal Notices",
      paragraphs: [LEGAL_CONTACT_EMAIL],
    },
    {
      paragraphs: ["© 2026 WORKPUNKT UG (haftungsbeschränkt). All rights reserved."],
    },
  ],
};

export const privacyPolicyPage: LegalPageContent = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  metaTitle: "Privacy Policy | WORKPUNKT",
  metaDescription:
    "How WORKPUNKT UG (haftungsbeschränkt) collects, uses, stores and protects personal data when you use the Workpunkt website and services.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: "1. Data Controller",
      paragraphs: [
        "WORKPUNKT UG (haftungsbeschränkt)",
        "Antonienstraße 21",
        "13403 Berlin",
        "Germany",
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
    {
      heading: "2. Scope",
      paragraphs: [
        "This Privacy Policy explains how we collect, use, store and protect personal data when you use the Workpunkt website and services.",
      ],
    },
    {
      heading: "3. Personal Data We Collect",
      paragraphs: [],
      bullets: [
        "Contact form submissions",
        "Student application forms",
        "Newsletter subscriptions",
        "Email communications",
        "Information voluntarily provided during consultations",
      ],
    },
    {
      heading: "4. Purposes of Processing",
      paragraphs: [
        "We process your data to respond to enquiries, assess eligibility for educational services, communicate with applicants, provide consultancy services, process payments, and comply with legal obligations.",
      ],
    },
    {
      heading: "5. Legal Basis",
      paragraphs: [
        "Processing is based on GDPR Articles 6(1)(a), 6(1)(b), 6(1)(c) and 6(1)(f), where applicable.",
      ],
    },
    {
      heading: "6. Service Providers",
      paragraphs: [
        "Hosting: Vercel",
        "Payments: Stripe",
        "CRM: Airtable",
        "Booking: Airtable Forms",
        "These providers process data only as necessary to deliver their services.",
      ],
    },
    {
      heading: "7. Cookies",
      paragraphs: [
        "We use essential cookies required for the operation of the website. If analytics or marketing cookies are enabled, consent will be requested before they are placed.",
      ],
    },
    {
      heading: "8. Newsletter",
      paragraphs: [
        "You may unsubscribe from marketing communications at any time using the unsubscribe link or by contacting us.",
      ],
    },
    {
      heading: "9. Data Retention",
      paragraphs: [
        "Personal data is retained only as long as necessary for the stated purposes or as required by law.",
      ],
    },
    {
      heading: "10. Your Rights",
      paragraphs: [
        "You have the right to access, rectify, erase, restrict processing, object to processing, withdraw consent where applicable, and request data portability.",
      ],
    },
    {
      heading: "11. Security",
      paragraphs: [
        "We implement appropriate technical and organisational measures to protect personal information against unauthorised access, disclosure or loss.",
      ],
    },
    {
      heading: "12. Contact",
      paragraphs: [
        `For privacy-related enquiries or to exercise your GDPR rights, contact: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
    {
      heading: "13. Changes",
      paragraphs: [
        "We may update this Privacy Policy from time to time. The latest version will always be published on this page.",
      ],
    },
  ],
};

export const termsOfServicePage: LegalPageContent = {
  slug: "terms-of-service",
  title: "Terms of Service",
  metaTitle: "Terms of Service | WORKPUNKT",
  metaDescription:
    "Terms governing access to and use of the Workpunkt website and education consulting services provided by WORKPUNKT UG (haftungsbeschränkt).",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: "1. Acceptance",
      paragraphs: [
        "By accessing or using Workpunkt's website or services, you agree to these Terms of Service.",
      ],
    },
    {
      heading: "2. About Workpunkt",
      paragraphs: [
        "WORKPUNKT UG (haftungsbeschränkt) provides education consulting, career guidance, university admissions support, visa guidance, and related services.",
      ],
    },
    {
      heading: "3. Services",
      paragraphs: [
        "Services may include consultations, university application support, document review, visa guidance, accommodation assistance, webinars, digital resources and educational programmes.",
      ],
    },
    {
      heading: "4. Client Responsibilities",
      paragraphs: [
        "Clients must provide complete, accurate and truthful information and submit documents within required deadlines.",
      ],
    },
    {
      heading: "5. No Guarantee",
      paragraphs: [
        "Workpunkt does not guarantee admission, scholarships, visas, internships or employment. Final decisions are made solely by universities, embassies and relevant authorities.",
      ],
    },
    {
      heading: "6. Fees and Payments",
      paragraphs: [
        "Fees are communicated before engagement. Payment confirms acceptance of the applicable proposal or service agreement.",
      ],
    },
    {
      heading: "7. Third-Party Costs",
      paragraphs: [
        "University fees, APS fees, embassy fees, blocked accounts, translations and other third-party costs are not included unless explicitly stated.",
      ],
    },
    {
      heading: "8. Intellectual Property",
      paragraphs: [
        "All materials, guides, templates, videos and digital resources remain the intellectual property of Workpunkt and may not be copied or redistributed without written permission.",
      ],
    },
    {
      heading: "9. Website Use",
      paragraphs: [
        "Users must not misuse the website, attempt unauthorised access or interfere with its operation.",
      ],
    },
    {
      heading: "10. Limitation of Liability",
      paragraphs: [
        "To the extent permitted by law, Workpunkt shall not be liable for indirect or consequential losses arising from the use of its services or website.",
      ],
    },
    {
      heading: "11. Privacy",
      paragraphs: [
        "Personal data is processed in accordance with the Workpunkt Privacy Policy.",
      ],
    },
    {
      heading: "12. Governing Law",
      paragraphs: [
        "These Terms shall be governed by the laws of the Federal Republic of Germany. The place of jurisdiction, where legally permissible, is Berlin.",
      ],
    },
    {
      heading: "13. Contact",
      paragraphs: [
        `Questions regarding these Terms may be sent to ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const refundPolicyPage: LegalPageContent = {
  slug: "refund-policy",
  title: "Refund & Cancellation Policy",
  metaTitle: "Refund & Cancellation Policy | WORKPUNKT",
  metaDescription:
    "Refund and cancellation terms for consulting, admission support, digital courses and webinars offered by WORKPUNKT UG (haftungsbeschränkt).",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: "1. Purpose",
      paragraphs: [
        "This policy explains the circumstances under which refunds or cancellations may apply for services purchased from WORKPUNKT UG (haftungsbeschränkt).",
      ],
    },
    {
      heading: "2. Consulting Services",
      paragraphs: [
        "Consultation fees are non-refundable once the consultation has taken place. If Workpunkt cancels a consultation, the client may choose a full refund or rescheduling.",
      ],
    },
    {
      heading: "3. Education & Admission Services",
      paragraphs: [
        "Refund eligibility for admission support packages is governed by the signed service agreement. Work already completed, including counselling, profile evaluation, document review or university applications, may be deducted from any approved refund.",
      ],
    },
    {
      heading: "4. Digital Courses & Webinars",
      paragraphs: [
        "Unless otherwise stated on the purchase page, payments for digital products, recorded courses and webinar access are non-refundable once access has been granted.",
      ],
    },
    {
      heading: "5. Third-Party Fees",
      paragraphs: [
        "Payments made to universities, APS, embassies, language schools, accommodation providers, payment processors or other third parties are subject to the respective provider's policies and are not controlled by Workpunkt.",
      ],
    },
    {
      heading: "6. Cancellation by Client",
      paragraphs: [
        `Clients wishing to cancel a service must submit their request in writing to ${LEGAL_CONTACT_EMAIL}. Cancellation requests are assessed according to the applicable service agreement.`,
      ],
    },
    {
      heading: "7. Cancellation by Workpunkt",
      paragraphs: [
        "If Workpunkt is unable to provide a purchased service, clients will be offered an alternative date, an equivalent service or an appropriate refund where applicable.",
      ],
    },
    {
      heading: "8. Chargebacks",
      paragraphs: [
        "Clients are encouraged to contact Workpunkt before initiating a payment dispute. Fraudulent or abusive chargebacks may result in suspension of services while the matter is investigated.",
      ],
    },
    {
      heading: "9. Exceptions",
      paragraphs: [
        "Nothing in this policy limits mandatory consumer rights available under applicable law.",
      ],
    },
    {
      heading: "10. Contact",
      paragraphs: [
        `Questions regarding refunds or cancellations should be sent to ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const cookiePolicyPage: LegalPageContent = {
  slug: "cookie-policy",
  title: "Cookie Policy",
  metaTitle: "Cookie Policy | WORKPUNKT",
  metaDescription:
    "How WORKPUNKT UG (haftungsbeschränkt) uses cookies and similar technologies on www.workpunkt.com, including consent and management options.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: "1. Introduction",
      paragraphs: [
        "This Cookie Policy explains how WORKPUNKT UG (haftungsbeschränkt) uses cookies and similar technologies on www.workpunkt.com.",
      ],
    },
    {
      heading: "2. What Are Cookies?",
      paragraphs: [
        "Cookies are small text files stored on your device that help websites function correctly, improve performance and remember user preferences.",
      ],
    },
    {
      heading: "3. Cookies We Use",
      paragraphs: [],
    },
    {
      heading: "Essential Cookies",
      paragraphs: [
        "These cookies are necessary for the operation and security of the website.",
      ],
    },
    {
      heading: "Functional Cookies",
      paragraphs: [
        "These cookies remember user preferences where applicable.",
      ],
    },
    {
      heading: "Analytics Cookies",
      paragraphs: [
        "If enabled, analytics cookies help us understand how visitors use our website. These cookies will only be placed after your consent where required by law.",
      ],
    },
    {
      heading: "4. Third-Party Services",
      paragraphs: [
        "Our website may use trusted third-party providers including Vercel (hosting), Stripe (payments), Airtable (CRM), and Notion forms (booking and enquiries). These services may set their own cookies or similar technologies where necessary.",
      ],
    },
    {
      heading: "5. Consent",
      paragraphs: [
        "Where required by applicable law, non-essential cookies will only be activated after you have provided your consent through our cookie banner. You may withdraw or change your preferences at any time.",
      ],
    },
    {
      heading: "6. Managing Cookies",
      paragraphs: [
        "You can control or delete cookies through your browser settings. Disabling certain cookies may affect the functionality of the website.",
      ],
    },
    {
      heading: "7. Changes to This Policy",
      paragraphs: [
        "We may update this Cookie Policy from time to time. The latest version will always be published on this page.",
      ],
    },
    {
      heading: "8. Contact",
      paragraphs: [
        "For questions regarding this Cookie Policy, please contact:",
        "WORKPUNKT UG (haftungsbeschränkt)",
        "Antonienstraße 21",
        "13403 Berlin",
        "Germany",
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
};

export const trustCentrePage: LegalPageContent = {
  slug: "trust",
  title: "Trust Centre",
  metaTitle: "Trust Centre | WORKPUNKT",
  metaDescription:
    "Workpunkt Trust Centre covering transparency, data protection, security and responsible student support commitments.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      paragraphs: [
        "Welcome to the Workpunkt Trust Centre. This page brings together the information that demonstrates our commitment to transparency, data protection, security and responsible student support.",
      ],
    },
    {
      heading: "Our Commitments",
      paragraphs: [],
      bullets: [
        "Registered company in Germany",
        "GDPR-focused handling of personal data",
        "Transparent pricing and policies",
        "Secure online payments",
        "Ethical education consulting",
        "Clear communication with students, parents and partners",
      ],
    },
    {
      heading: "Data Protection",
      paragraphs: [
        "We process personal information only for legitimate educational and business purposes. Personal data is handled in accordance with our Privacy Policy and applicable data protection laws.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "Our website is hosted on Vercel and uses secure HTTPS encryption. Payments are processed through Stripe. Access to student information is restricted to authorised personnel only.",
      ],
    },
    {
      heading: "Transparency",
      paragraphs: ["Our legal documents are available at all times:"],
      bullets: [
        "Impressum",
        "Privacy Policy",
        "Terms of Service",
        "Cookie Policy",
        "Refund & Cancellation Policy",
      ],
    },
    {
      heading: "Our Services",
      paragraphs: [
        "Workpunkt supports students through university admissions, career guidance, visa guidance, application strategy, webinars and educational programmes.",
      ],
    },
    {
      heading: "Need Assistance?",
      paragraphs: [
        "If you have questions about our services, data protection or legal policies, please contact us.",
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
};

export const allLegalPages: LegalPageContent[] = [
  impressumPage,
  privacyPolicyPage,
  termsOfServicePage,
  refundPolicyPage,
  cookiePolicyPage,
  trustCentrePage,
];

export function getLegalPageBySlug(slug: string): LegalPageContent | undefined {
  return allLegalPages.find((page) => page.slug === slug);
}
