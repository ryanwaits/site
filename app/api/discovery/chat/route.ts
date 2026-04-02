import Anthropic from "@anthropic-ai/sdk";
import { DISCOVERY_SECTIONS } from "@/app/lib/discovery-sections";

const SYSTEM_PROMPT = `You are an AI discovery assistant for an AI consulting practice. You're conducting a business assessment to understand a potential client's workflows, pain points, and opportunities for AI integration.

Your role: Ask questions conversationally, acknowledge responses warmly, and ask brief follow-ups when answers are vague or thin. Keep it natural — like a smart friend asking about their business, not a survey.

Tone: Conversational and direct. Never corporate, never salesy. Pragmatic. Understated confidence. Dry humor that doesn't try too hard.

Rules:
- Keep responses SHORT (2-3 sentences max)
- Acknowledge what they said specifically (reflect back a detail, don't just say "great!")
- If their answer is vague, ask ONE specific follow-up
- If their answer is detailed enough, acknowledge and signal you're moving on
- Never repeat questions they've already answered
- Be warm but efficient — respect their time
- Don't use bullet points or markdown in responses
- End each response with either a follow-up question OR a transition to the next topic`;

export async function POST(request: Request) {
  let body: { messages?: unknown; sectionId?: string; questionIndex?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages, sectionId, questionIndex } = body;

  if (!Array.isArray(messages) || !sectionId) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
