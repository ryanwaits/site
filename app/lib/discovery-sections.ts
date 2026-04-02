export interface Section {
  id: string;
  label: string;
  questions: string[];
}

export const DISCOVERY_SECTIONS: Section[] = [
  {
    id: "intro",
    label: "Getting Started",
    questions: [
      "What do you do? Give me the quick version — what's your business and who do you serve?",
    ],
  },
  {
    id: "business",
    label: "Your Business",
    questions: [
      "How long have you been doing this, and are you solo or do you have a team?",
      "What does a good month look like revenue-wise? Are you at capacity or could you handle more?",
    ],
  },
  {
    id: "workflow",
    label: "Daily Workflow",
    questions: [
      "Walk me through a typical workday. What eats the most time?",
      "What's repetitive? What falls through the cracks or never gets done?",
    ],
  },
  {
    id: "tools",
    label: "Tools & Software",
    questions: [
      "What apps and software do you use for work? Include stuff you barely use — that's useful info too. Rough monthly costs if you know them.",
      "Do any of those tools give you reports or dashboards — like email open rates, lead stats, website analytics? Even if you don't look at them much.",
    ],
  },
  {
    id: "clients",
    label: "Leads & Clients",
    questions: [
      "Where do most of your leads come from? When a new one comes in, what happens — how fast do you respond, what's the follow-up process?",
      "Roughly how many new leads or inquiries come in per week? And after a deal is done, do you have a system for staying in touch or getting referrals?",
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Content",
    questions: [
      "Are you doing any marketing — social media, email, ads, content? What's working, what's not, what do you wish you were doing?",
    ],
  },
  {
    id: "painpoints",
    label: "Pain Points & Goals",
    questions: [
      "If you could clone yourself for one task, what would that clone do? What's the thing you keep saying you'll get to but never do?",
      "If there was ONE number in your business you could improve — response time, close rate, retention, whatever — what would it be?",
      "Where do you want your business to be in 6-12 months? What's the #1 thing holding you back?",
    ],
  },
  {
    id: "practical",
    label: "Practical Details",
    questions: [
      "Roughly what are you spending per month on tools and software? Have you worked with a consultant or coach before — how'd that go?",
      "How comfortable are you with tech — if someone set up AI tools for you and showed you how to use them, would you be good running them day-to-day?",
    ],
  },
];
