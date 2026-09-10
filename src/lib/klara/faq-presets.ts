export type FaqPreset = {
  id: string;
  question: string;
  answer: string;
};

export const SUPPORT_FAQ_PRESETS: FaqPreset[] = [
  {
    id: "start-application",
    question: "When should I start my Germany application process?",
    answer: `Ideally, start 10–12 months before your intended intake. The recommended order is:

1. Research universities and programs
2. Prepare language test scores (IELTS/TOEFL/German)
3. Apply for APS (Indian students)
4. Submit university applications
5. Receive admission letter
6. Open blocked account
7. Arrange health insurance
8. Apply for student visa

Starting early helps avoid delays caused by APS processing, university admissions, and visa appointment waiting times.`,
  },
  {
    id: "blocked-account",
    question: "What is a blocked account and how much do I need?",
    answer:
      "A blocked account (Sperrkonto) is a special bank account required to prove financial self-sufficiency for a German student visa. As of 2026, the required block amount remains €11,904 per year (€992 per month).",
  },
  {
    id: "money-needed",
    question: "How much money do I need before moving to Germany as a student?",
    answer: `Most students should budget for:

• Blocked Account: €11,904 per year (€992 per month), as required for 2026
• Visa and document expenses
• Flight tickets
• Initial accommodation deposit (usually 2–3 months' rent)
• First month's living expenses

In total, students typically need access to around €13,000–€15,000 before departure, depending on city and accommodation costs.`,
  },
  {
    id: "jobs-after-graduation",
    question: "Can I get a job easily after graduating from a German university?",
    answer: `Germany offers excellent post-study opportunities, especially in Engineering, IT, Data Science, Automotive, Manufacturing, Healthcare, and Finance. After graduation, students can apply for an 18-month Job Seeker Residence Permit to search for qualified employment. Once employed, graduates may transition to a Work Permit or EU Blue Card and later become eligible for Permanent Residence.

Learning German significantly improves job opportunities, even for graduates of English-taught programs.`,
  },
  {
    id: "german-for-english-program",
    question: "Do I need to know German if my program is taught in English?",
    answer: `No. For English-taught programs, universities generally require proof of English proficiency (IELTS, TOEFL, or equivalent) rather than German language skills.

However, learning German is strongly recommended because it helps with:

• Finding part-time jobs
• Securing internships
• Daily life and administrative tasks
• Building social connections
• Improving long-term career prospects in Germany

Even reaching A2–B1 German level can provide a major advantage.`,
  },
];

export const FAQ_WELCOME_MESSAGE =
  "Hi! I'm here to help with your Germany journey. Pick a question below or talk to a counsellor when you're ready.";

export const FAQ_SESSION_STORAGE_KEY = "wp-support-chat-faq";

export const AI_CHAT_WELCOME_MESSAGE =
  "Hi! I'm Klara. Ask me anything about studying in Germany or our counselling process — or pick a quick question below.";
