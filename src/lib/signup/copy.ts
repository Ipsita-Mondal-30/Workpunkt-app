export const studentSignUpCopy = {
  subtitle: "No credit card. No fees. Application is completely free.",
  title: "Create Your Free Account",
  fields: {
    firstName: { label: "First name", placeholder: "Enter first name" },
    lastName: { label: "Last name", placeholder: "Enter last name" },
    email: { label: "Email address", placeholder: "you@email.com" },
    mobile: { label: "Mobile (WhatsApp)", placeholder: "9876543210" },
    source: { label: "How did you hear about us?", placeholder: "Select source" },
  },
  submit: "Continue to Application →",
  continuing: "Continuing…",
  creating: "Creating account…",
  continuingMessage: "Account created. Setting up your session…",
  emailBackupMessage:
    "We also emailed a backup link to {email} so you can resume later on another device.",
  footerPrefix: "Already have an account?",
  footerLink: "Sign in",
} as const;

export const studentAcademicCopy = {
  title: "Academic Background",
  subtitle: "Tell us about your qualifications",
  fields: {
    qualification: {
      label: "Current or most recent qualification",
      placeholder: "Select qualification",
      hint: "Choose the option that best matches your current education level.",
    },
    institution: { label: "Institution / school name", placeholder: "DPS, Delhi" },
    year: {
      label: "Year of completion",
      placeholder: "2025",
      hint: "Use the year you finished or expect to finish, e.g. 2025.",
    },
    grade: { label: "Percentage / CGPA", placeholder: "85% or 8.2 CGPA" },
    boards: { label: "Board", placeholder: "Select board" },
    boardsOther: { label: "Board name", placeholder: "Enter your board name" },
    studyGoal: {
      label: "What would you like to study in Germany?",
      placeholder: "e.g. Business Administration, Computer Science…",
    },
    studyLevel: { label: "Preferred study level", placeholder: "Select level" },
    languageCert: { label: "Language certificate", placeholder: "Select certificate" },
    intake: {
      label: "Target intake",
      placeholder: "Select intake",
      hint: "Pick Winter 2026 or Summer 2027 — these are the intakes we support right now.",
    },
  },
  submit: "Next — Upload Documents →",
  skip: "Add documents later — back to sign in",
} as const;

export const studentUploadCopy = {
  title: "Upload Your Documents",
  subtitle: "PDF or JPG · You can upload incomplete and complete later",
  missingNoteBold: "Missing documents?",
  missingNoteBody:
    "Submit what you have. Our team will review and tell you exactly what else is needed on your Zoom call.",
  submit: "Submit Application →",
  submitIncomplete: "Submit Incomplete — Complete Later",
} as const;

export const studentSubmittedCopy = {
  title: "Application Submitted! 🎉",
  subtitle:
    "Your application has been received. Our team will review it within 24 hours and get back to you with next steps.",
  referenceLabel: "Application reference",
  nextTitle: "What happens next?",
  nextSteps: [
    {
      id: "email",
      title: "Check Your Email",
      description:
        "We've sent a confirmation to your email with your application reference.",
    },
    {
      id: "review",
      title: "Review in 24 Hours",
      description:
        "Our team reviews every application within 24 hours and sends next steps.",
    },
    {
      id: "zoom",
      title: "Zoom Call Scheduled",
      description:
        "Your counsellor will schedule a Zoom call to finalise your university options.",
    },
  ],
  cta: "Go to sign in",
} as const;

export const partnerSignUpCopy = {
  title: "Become a Workpunkt Partner",
  step1Subtitle: "Step 1 of 2 — Basic Information & Partner Type",
  step2Subtitle: "Step 2 of 2 — Help us understand your business",
  fields: {
    fullName: { label: "Full name", placeholder: "Rahul Mehta" },
    designation: { label: "Designation", placeholder: "Director / Counsellor" },
    workEmail: { label: "Work email", placeholder: "rahul@agency.com" },
    whatsapp: { label: "WhatsApp number", placeholder: "9876543210" },
    organisation: { label: "Organisation name", placeholder: "Global Study Solutions" },
    cityCountry: { label: "City / Country", placeholder: "New Delhi, India" },
    partnerType: { label: "Partner type", placeholder: "Select partner type" },
    goals: "I want to partner with Workpunkt for",
    germanyExperience: "I have recruited students for Germany before",
    annual: {
      label: "How many students do you recruit annually?",
      placeholder: "Select range",
    },
    countries: {
      label: "How many countries do you currently recruit for?",
      placeholder: "Select range",
    },
    sourcing: "Primary student sourcing method",
    team: {
      label: "How many team members will handle student applications?",
      placeholder: "Select team size",
    },
    why: {
      label: "Why do you want to partner with Workpunkt specifically?",
      placeholder: "Tell us in your own words...",
    },
  },
  continue: "Continue to Qualification Questions →",
  submit: "Submit Application →",
  submitting: "Submitting…",
  footerPrefix: "Already registered?",
  footerLink: "Sign in here",
} as const;

export const partnerSubmittedCopy = {
  title: "Application Submitted!",
  subtitle:
    "Thank you for applying to become a Workpunkt Partner. We've received your application and our team will be in touch within 24–48 hours to schedule your Zoom verification call.",
  nextTitle: "What happens next",
  emailCardTitle: "Check your email",
  emailCardBodyPrefix: "A confirmation has been sent to ",
  emailCardBodySuffix: " with your application reference number and next steps.",
  signInLink: "← Already approved? Sign in",
  steps: [
    {
      id: "submitted",
      title: "Application submitted ✓",
      timing: "Right now",
      status: "complete" as const,
    },
    {
      id: "email",
      titlePrefix: "Confirmation email sent to ",
      titleSuffix: " ✓",
      timing: "Just now",
      status: "complete" as const,
    },
    {
      id: "review",
      title: "Team reviews your application",
      timing: "Within 24–48 hours",
      status: "pending" as const,
      stepNumber: 2,
    },
    {
      id: "zoom",
      title: "Zoom verification call scheduled",
      status: "pending" as const,
      stepNumber: 3,
    },
    {
      id: "contract",
      title: "Contract auto-generated & sent for signature",
      status: "pending" as const,
      stepNumber: 4,
    },
    {
      id: "access",
      title: "Platform access granted — onboarding begins",
      status: "pending" as const,
      stepNumber: 5,
    },
  ],
} as const;
