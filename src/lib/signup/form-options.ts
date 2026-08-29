/** Mirrors Workpunkt website private-application and partner-register options. */

export const PRIVATE_LEAD_SOURCE_OPTIONS = [
  { value: "google-search", label: "Google Search" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "webinar", label: "Webinar" },
  { value: "school-college-counsellor", label: "School / College Counsellor" },
  { value: "friend-family-referral", label: "Friend / Family Referral" },
  { value: "education-fair-event", label: "Education Fair / Event" },
  { value: "university-partner", label: "University Partner" },
  { value: "whatsapp-group", label: "WhatsApp Group" },
  { value: "email-newsletter", label: "Email / Newsletter" },
  { value: "other", label: "Other" },
] as const;

export function labelForPrivateLeadSource(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const byValue = PRIVATE_LEAD_SOURCE_OPTIONS.find((option) => option.value === trimmed);
  if (byValue) return byValue.label;

  const byLabel = PRIVATE_LEAD_SOURCE_OPTIONS.find(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  return byLabel?.label ?? trimmed;
}

export const PRIVATE_QUALIFICATION_OPTIONS = [
  { value: "class-10", label: "Class 10 / Secondary School" },
  { value: "class-12", label: "Class 12 / High School (in progress)" },
  { value: "class-12-completed", label: "Class 12 / High School (completed)" },
  { value: "bachelors-in-progress", label: "Bachelor's degree (in progress)" },
  { value: "bachelors-completed", label: "Bachelor's degree (completed)" },
  { value: "masters-in-progress", label: "Master's degree (in progress)" },
  { value: "masters-completed", label: "Master's degree (completed)" },
] as const;

export const PRIVATE_STUDY_LEVEL_OPTIONS = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "fully-funded-phd", label: "Fully Funded PhD" },
  { value: "ausbildung", label: "Ausbildung" },
  { value: "chancenkarte", label: "Chancenkarte" },
  { value: "paid-internships", label: "Paid Internships" },
] as const;

export const PRIVATE_LANGUAGE_CERT_OPTIONS = [
  { value: "ielts", label: "IELTS" },
  { value: "toefl", label: "TOEFL" },
  { value: "yet-to-appear", label: "Yet to appear" },
  { value: "others", label: "Others" },
] as const;

export const PRIVATE_BOARD_OPTIONS = [
  { value: "cbse-state", label: "CBSE/State Boards" },
  { value: "icse-isc", label: "ICSE/ISC" },
  { value: "ibdp", label: "IBDP" },
  { value: "cambridge-a-levels", label: "Cambridge A-levels" },
  { value: "nios", label: "NIOS" },
  { value: "others", label: "Others" },
] as const;

export const PRIVATE_INTAKE_FORM_OPTIONS = [
  { value: "winter-2026", label: "Winter 2026" },
  { value: "summer-2027", label: "Summer 2027" },
] as const;

export const PRIVATE_REQUIRED_DOCUMENTS = [
  { id: "marksheets", title: "Marksheets / Transcripts", hint: "All years required" },
  { id: "passport", title: "Passport", hint: "Bio page scan" },
  { id: "photograph", title: "Passport Photograph", hint: "" },
] as const;

export const PRIVATE_OPTIONAL_DOCUMENTS = [
  { id: "cv", title: "CV / Resume", hint: "Optional but helpful" },
  { id: "language", title: "Language Certificate", hint: "If available" },
] as const;

export const PARTNER_TYPE_OPTIONS = [
  "Independent B2B Agent",
  "School Partner",
  "School Counsellor (Institutional)",
  "Independent Counsellor (Commercial)",
] as const;

export const PARTNER_GOALS = [
  {
    id: "student-recruitment",
    emoji: "🎓",
    label: "Student Recruitment — German Universities",
  },
  {
    id: "ausbildung",
    emoji: "🏠",
    label: "Ausbildung / Vocational Placement",
  },
  {
    id: "counsellor-training",
    emoji: "🎓",
    label: "School Counsellor Training Programme",
  },
  {
    id: "institutional-mou",
    emoji: "🤝",
    label: "Institutional MOU Partnership",
  },
] as const;

export const PARTNER_GOAL_ID_TO_SERVICE: Record<(typeof PARTNER_GOALS)[number]["id"], string> = {
  "student-recruitment": "Student Recruitment — German Universities",
  ausbildung: "Ausbildung / Vocational Placement",
  "counsellor-training": "School Counsellor Training Programme",
  "institutional-mou": "Institutional MOU Partnership",
};

export const PARTNER_SOURCING_METHODS = [
  { id: "school-partnerships", label: "School / College Partnerships" },
  { id: "social-media", label: "Social Media / Digital Marketing" },
  { id: "education-fairs", label: "Education Fairs & Exhibitions" },
  { id: "walk-in", label: "Walk-in Enquiries" },
  { id: "referrals", label: "Referrals from Past Students" },
] as const;

export const PARTNER_SOURCING_ID_TO_LABEL: Record<
  (typeof PARTNER_SOURCING_METHODS)[number]["id"],
  string
> = {
  "school-partnerships": "School / College Partnerships",
  "social-media": "Social Media / Digital Marketing",
  "education-fairs": "Education Fairs & Exhibitions",
  "walk-in": "Walk-in Enquiries",
  referrals: "Referrals from Past Students",
};

export const PARTNER_ANNUAL_STUDENTS_OPTIONS = [
  "0–25 students",
  "26–100 students",
  "101–300 students",
  "300+ students",
] as const;

export const PARTNER_COUNTRIES_RECRUITED_OPTIONS = [
  "Germany Only",
  "2–3 Countries",
  "4–6 Countries",
  "7+ Countries",
] as const;

export const PARTNER_TEAM_SIZE_OPTIONS = [
  "Just Me",
  "2–3 People",
  "4–6 People",
  "7+ People",
] as const;
