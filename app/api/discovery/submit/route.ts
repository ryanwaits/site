import { Resend } from "resend";
import { DISCOVERY_SECTIONS } from "@/app/lib/discovery-sections";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

function buildEmailHtml(
  clientName: string,
  clientEmail: string,
  responses: Record<string, Message[]>
): string {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let sectionsHtml = "";
  for (const section of DISCOVERY_SECTIONS) {
    const sectionResponses = responses[section.id];
    if (!sectionResponses || sectionResponses.length === 0) continue;

    let exchangesHtml = "";
    for (const msg of sectionResponses) {
      if (msg.role === "assistant") {
        exchangesHtml += `<p style="color:#666;font-size:13px;margin:8px 0 4px;"><strong>Q:</strong> ${escapeHtml(msg.content)}</p>`;
      } else if (msg.role === "user") {
        exchangesHtml += `<p style="color:#1a1a1a;font-size:14px;margin:4px 0 12px;padding-left:12px;border-left:3px solid #e0e0e0;">${escapeHtml(msg.content)}</p>`;
      }
    }

    sectionsHtml += `
      <div style="margin-bottom:28px;">
        <h2 style="font-size:16px;color:#333;margin:0 0 12px;padding-bottom:6px;border-bottom:1px solid #eee;">${escapeHtml(section.label)}</h2>
        ${exchangesHtml}
      </div>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1a1a;">
      <div style="margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid #1a1a1a;">
        <h1 style="font-size:22px;margin:0 0 8px;">Discovery: ${escapeHtml(clientName)}</h1>
        <p style="color:#666;font-size:14px;margin:0;">
          ${escapeHtml(clientEmail)} &middot; ${date}
        </p>
      </div>
      ${sectionsHtml}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;color:#999;font-size:12px;">
        Submitted via ryanwaits.com/start
      </div>
    </body>
    </html>`;
}

export async function POST(request: Request) {
  let body: {
    responses?: Record<string, Message[]>;
    clientName?: string;
    clientEmail?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { responses, clientName, clientEmail } = body;

  if (!responses || !clientName) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const html = buildEmailHtml(
    clientName,
    clientEmail || "not provided",
    responses
  );

  const { error } = await getResend().emails.send({
    from: "Discovery <leads@ryanwaits.com>",
    to: "ryan.waits@gmail.com",
    subject: `New Discovery: ${clientName} — ${date}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return Response.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
