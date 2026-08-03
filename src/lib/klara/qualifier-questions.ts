export type QualifierQuestion = {
  id: number;
  prompt: string;
  options: [string, string, string, string, string];
};

/** Mirrors website QUALIFIER_QUESTIONS for offline UI. */
export const QUALIFIER_QUESTIONS: QualifierQuestion[] = [
  {
    id: 1,
    prompt: "A machine on the line breaks. Your instinct?",
    options: [
      "Diagnose logically",
      "Open it up and fix it",
      "Calculate downtime cost",
      "Redesign it",
      "Research root cause",
    ],
  },
  {
    id: 2,
    prompt: "Pick the win that feels best.",
    options: [
      "Solved a hard problem",
      "Built something with your hands",
      "Closed a deal",
      "Created something original",
      "Discovered something new",
    ],
  },
  {
    id: 3,
    prompt: "Your ideal workday is mostly…",
    options: [
      "Numbers & logic",
      "Tools & making",
      "People & selling",
      "Design & ideas",
      "Experiments & data",
    ],
  },
  {
    id: 4,
    prompt: "When a group project stalls, you usually…",
    options: [
      "Break the problem into steps",
      "Jump in and start building a prototype",
      "Align stakeholders and next actions",
      "Sketch a fresh approach",
      "Gather evidence before deciding",
    ],
  },
  {
    id: 5,
    prompt: "Which feedback makes you feel most proud?",
    options: [
      "That was brilliantly reasoned",
      "That actually works in the real world",
      "That moved the needle for the business",
      "That was beautifully original",
      "That uncovered something we didn't know",
    ],
  },
  {
    id: 6,
    prompt: "Pick a weekend project.",
    options: [
      "Debug a tricky puzzle or algorithm",
      "Repair or assemble something physical",
      "Pitch or sell an idea to friends",
      "Design a poster, product, or story",
      "Run a small experiment and log results",
    ],
  },
  {
    id: 7,
    prompt: "In a crisis, others rely on you to…",
    options: [
      "Stay calm and analyse options",
      "Take hands-on action immediately",
      "Negotiate and coordinate people",
      "Invent a creative workaround",
      "Find facts others missed",
    ],
  },
  {
    id: 8,
    prompt: "Which field feels closest to you right now?",
    options: [
      "Engineering / Computer Science",
      "Applied sciences / Trades / Making",
      "Business / Management / Marketing",
      "Design / Arts / Media",
      "Research / Natural sciences / Data",
    ],
  },
  {
    id: 9,
    prompt: "You learn best when you…",
    options: [
      "Study theories and models",
      "Practice by doing",
      "Discuss and persuade",
      "Explore visuals and stories",
      "Test hypotheses carefully",
    ],
  },
  {
    id: 10,
    prompt: "Your north-star career moment would be…",
    options: [
      "Solving an unsolved technical challenge",
      "Shipping something people can use",
      "Growing a product or market",
      "Launching a creative breakthrough",
      "Publishing a meaningful discovery",
    ],
  },
];
