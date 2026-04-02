import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Workflow Assessment — Ryan Waits",
  description:
    "Answer a few questions about your business. Get a personalized breakdown of where AI can help — prioritized by impact.",
};

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
