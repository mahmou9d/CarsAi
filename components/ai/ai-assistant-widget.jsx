"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { X, Send, RotateCcw, ExternalLink } from "lucide-react";
import { askCarAssistant } from "@/actions/assistant";
import { usePathname } from "next/navigation";

const SUGGESTIONS = [
  {
    label: "🚗 Available Cars",
    query: "Which cars do you currently have in stock?",
  },
  {
    label: "💰 Financing & EMI",
    query: "How does car financing and monthly payment work?",
  },
  { label: "📅 Free Test Drive", query: "How can I book a free test drive?" },
  {
    label: "🔄 Trade-in Value",
    query: "How do I trade in or sell my current vehicle?",
  },
  {
    label: "🛡️ 150-Point Inspection",
    query: "Tell me about your 150-point certified inspection.",
  },
];

// The CarsAi logo mark (red circle with speed stripes)
function LogoMark({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#E4141B] ${className}`}
    >
      <span className="absolute h-10 w-1.5 -translate-x-1 -skew-x-[20deg] bg-white/95" />
      <span className="absolute h-10 w-1 translate-x-1.5 -skew-x-[20deg] bg-white/60" />
    </span>
  );
}

/**
 * Simple markdown text parser:
 * - [Link Label](/path) to Next.js <Link>
 * - **bold** to <strong>bold</strong>
 * - Bullet lists into clean styled items
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;

        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const content = isBullet ? trimmed.slice(2) : trimmed;

        const parts = [];
        const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
        let lastIdx = 0;
        let match;

        while ((match = regex.exec(content)) !== null) {
          if (match.index > lastIdx) {
            parts.push(content.substring(lastIdx, match.index));
          }

          if (match[1] && match[2]) {
            parts.push(
              <Link
                key={`link-${lIdx}-${match.index}`}
                href={match[2]}
                className="inline-flex items-center gap-0.5 rounded font-semibold text-[#E4141B] underline underline-offset-2 transition-colors hover:text-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
              >
                <span>{match[1]}</span>
                <ExternalLink
                  className="inline h-3 w-3 shrink-0"
                  aria-hidden="true"
                />
              </Link>,
            );
          } else if (match[3]) {
            parts.push(
              <strong
                key={`bold-${lIdx}-${match.index}`}
                className="font-semibold text-black"
              >
                {match[3]}
              </strong>,
            );
          }

          lastIdx = regex.lastIndex;
        }

        if (lastIdx < content.length) {
          parts.push(content.substring(lastIdx));
        }

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-1">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-[#E4141B]"
              />
              <span>{parts}</span>
            </div>
          );
        }

        return <p key={lIdx}>{parts}</p>;
      })}
    </div>
  );
}

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm your CarsAi Concierge.\nHow can I help you today with our available inventory, financing plans, or scheduling a free test drive?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pathname = usePathname();

  // Extract current car ID if on car details page
  const carIdMatch = pathname?.match(/\/cars\/([a-zA-Z0-9-]+)$/);
  const currentCarId = carIdMatch ? carIdMatch[1] : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Focus the input when the window opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async (messageToSend) => {
    const text = typeof messageToSend === "string" ? messageToSend : input;
    if (!text || typeof text !== "string" || !text.trim() || loading) return;

    const userMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await askCarAssistant({
        message: text.trim(),
        history: updatedMessages.slice(-6),
        currentCarId,
      });

      if (res && res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "You can browse all our certified cars at [All Cars](/cars), or contact our Cairo showroom directly at +20 100 901 4597.",
          },
        ]);
      }
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "You can browse all our certified cars at [All Cars](/cars), or contact our Cairo showroom directly at +20 100 901 4597.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Welcome back! 🚗 Conversation restarted. Ask me anything about our vehicles, pricing, loan calculators, or scheduling a test drive.",
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {/* Launcher */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open CarsAi Concierge chat"
          className="group flex h-14 items-center gap-3 rounded-full bg-[#161213] pl-2 pr-5 text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-12px_rgba(228,20,27,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]"
        >
          <span className="relative">
            <LogoMark className="size-10" />
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-[#161213] bg-emerald-400"
            />
          </span>
          <span className="text-sm font-semibold">
            Ask Cars<span className="text-[#E4141B]">Ai</span>
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="CarsAi Concierge chat"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="flex h-[560px] max-h-[85vh] w-[92vw] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10 duration-300 animate-in fade-in slide-in-from-bottom-6 sm:w-[410px]"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between bg-[#161213] px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <LogoMark className="size-10" />
              <div>
                <p className="font-montserrat text-base font-[800] leading-tight tracking-tight">
                  CarsAi Concierge
                </p>
                <p className="flex items-center gap-1.5 text-xs text-white/60">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-emerald-400"
                  />
                  Online now
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Restart chat"
                aria-label="Restart chat"
                className="grid size-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="grid size-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <span
              aria-hidden="true"
              className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_12px_2px_rgba(228,20,27,0.6)]"
            />
          </div>

          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto bg-white p-4"
          >
            {messages.map((m, idx) => {
              const isUser = m.role === "user";

              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 ${
                      isUser
                        ? "rounded-2xl rounded-br-md bg-[#E4141B] text-white"
                        : "rounded-2xl rounded-bl-md bg-[#F3F1EC] text-gray-800"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {m.content}
                      </p>
                    ) : (
                      <FormattedMessage text={m.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#F3F1EC] px-4 py-3.5">
                  <span className="sr-only">Checking inventory…</span>
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      aria-hidden="true"
                      className="size-2 animate-bounce rounded-full bg-[#E4141B] motion-reduce:animate-none"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length <= 3 && (
            <div className="scrollbar-none flex gap-2 overflow-x-auto border-t border-black/5 bg-white px-3 py-2.5">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => handleSend(sug.query)}
                  className="shrink-0 rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-[#E4141B] hover:text-[#E4141B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-black/5 bg-white p-3"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Message
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              type="text"
              placeholder="Ask about cars, pricing, test drives…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-full border border-black/10 bg-[#F3F1EC] px-4 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E4141B] text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
