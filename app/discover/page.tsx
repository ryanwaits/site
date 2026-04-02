"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DISCOVERY_SECTIONS } from "@/app/lib/discovery-sections";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function DiscoverPage() {
  const [started, setStarted] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allResponses, setAllResponses] = useState<Record<string, Message[]>>(
    {}
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const w = window as any;
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const currentSection = DISCOVERY_SECTIONS[sectionIndex];
  const isComplete = sectionIndex >= DISCOVERY_SECTIONS.length;
  const totalQuestions = DISCOVERY_SECTIONS.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );
  const completedQuestions =
    DISCOVERY_SECTIONS.slice(0, sectionIndex).reduce(
      (sum, s) => sum + s.questions.length,
      0
    ) + questionIndex;
  const progress = Math.round((completedQuestions / totalQuestions) * 100);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus();
  }, [isStreaming]);

  const startDiscovery = useCallback(() => {
    if (!clientName.trim()) return;
    setStarted(true);
    const firstQ = DISCOVERY_SECTIONS[0].questions[0];
    const greeting: Message = {
      role: "assistant",
      content: `Hey ${clientName.split(" ")[0]}! Thanks for taking the time. This should take about 15-20 minutes — just answer naturally, no wrong answers. Let's start simple:\n\n${firstQ}`,
    };
    setMessages([greeting]);
  }, [clientName]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || isComplete) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    const sectionId = currentSection.id;
    setAllResponses((prev) => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), ...updatedMessages.slice(-2)],
    }));

    try {
      const res = await fetch("/api/discovery/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          sectionId: currentSection.id,
          questionIndex,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      if (reader) {
        const aiMsg: Message = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, aiMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiResponse += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: aiResponse,
            };
            return updated;
          });
        }
      }

      const nextQIndex = questionIndex + 1;
      if (nextQIndex < currentSection.questions.length) {
        setQuestionIndex(nextQIndex);
      } else {
        const nextSection = sectionIndex + 1;
        if (nextSection < DISCOVERY_SECTIONS.length) {
          setSectionIndex(nextSection);
          setQuestionIndex(0);
        } else {
          setSectionIndex(DISCOVERY_SECTIONS.length);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Try sending that again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [
    input,
    isStreaming,
    isComplete,
    messages,
    currentSection,
    questionIndex,
    sectionIndex,
  ]);

  const toggleRecording = useCallback(() => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/discovery/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: allResponses,
          clientName,
          clientEmail,
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // Responses are in state — not lost
    } finally {
      setSubmitting(false);
    }
  }, [allResponses, clientName, clientEmail]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Welcome screen
  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-lg w-full space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl tracking-tight" style={{ fontFamily: "var(--font-family-serif)" }}>
              AI Workflow Assessment
            </h1>
            <p className="text-[var(--color-muted)] text-lg leading-relaxed">
              Answer a few questions about your business and I'll put together a
              breakdown of where AI can help — prioritized by impact.
            </p>
            <p className="text-[var(--color-muted)] text-sm">
              Takes about 15-20 minutes. Think about the stuff you wish you
              could just hand off — the things you'd tell an assistant to handle
              if you had one around the corner.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider text-[var(--color-muted)]">
                Your name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && clientName.trim()) {
                    (e.target as HTMLInputElement)
                      .closest("div.space-y-4")
                      ?.querySelector<HTMLInputElement>("input[type=email]")
                      ?.focus();
                  }
                }}
                placeholder="e.g. Sarah Mitchell"
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider text-[var(--color-muted)]">
                Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startDiscovery()}
                placeholder="sarah@company.com"
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              />
            </div>
            <button
              onClick={startDiscovery}
              disabled={!clientName.trim()}
              className="w-full px-6 py-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-medium text-lg disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Let's go
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submitted screen
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <div className="text-5xl text-[var(--color-accent)]">&#10003;</div>
          <h1 className="text-3xl tracking-tight" style={{ fontFamily: "var(--font-family-serif)" }}>
            All done!
          </h1>
          <p className="text-[var(--color-muted)] text-lg leading-relaxed">
            Thanks {clientName.split(" ")[0]}. I'll review your responses and
            put together a personalized breakdown of where AI can help your
            business. Expect to hear from me within a couple days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--color-bg)]/80 backdrop-blur-sm border-b border-[var(--color-border)] px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]" style={{ fontFamily: "var(--font-family-mono)" }}>
            {isComplete
              ? "Complete!"
              : `${currentSection.label} \u00b7 ${sectionIndex + 1}/${DISCOVERY_SECTIONS.length}`}
          </span>
          <span className="text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-family-mono)" }}>
            {isComplete ? 100 : progress}%
          </span>
        </div>
        <div className="mt-2 h-0.5 bg-[var(--color-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
            style={{ width: `${isComplete ? 100 : progress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)] rounded-br-sm"
                  : "bg-[var(--color-border)] text-[var(--color-text)] rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-border)] px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="animate-pulse text-[var(--color-muted)]">
                ...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Complete state */}
      {isComplete && !submitted && (
        <div className="px-4 py-6 border-t border-[var(--color-border)]">
          <p className="text-[var(--color-muted)] mb-4 text-center text-sm">
            That's everything I need. Ready to submit?
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-6 py-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-medium hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Submitting..." : "Submit responses"}
          </button>
        </div>
      )}

      {/* Input */}
      {!isComplete && (
        <div className="sticky bottom-0 bg-[var(--color-bg)] border-t border-[var(--color-border)] px-4 py-3">
          <div className="flex items-end gap-2">
            {speechSupported && (
              <button
                onClick={toggleRecording}
                className={`shrink-0 p-3 rounded-full transition-colors cursor-pointer ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecording ? "Listening..." : "Type your response..."
              }
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 max-h-32 text-[15px]"
              style={{
                height: "auto",
                minHeight: "48px",
                overflow: input.split("\n").length > 3 ? "auto" : "hidden",
              }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 128) + "px";
              }}
              disabled={isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="shrink-0 p-3 rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] disabled:opacity-30 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
