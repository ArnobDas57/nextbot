"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Particles from "./ui/Particles";
import Logo from "./ui/Logo";
import Footer from "./ui/Footer";

type Role = "user" | "response";
type ChatMsg = {
  id: string;
  type: Role;
  text: string;
  ts: number; // epoch ms
};

function formatTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(ts);
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: crypto.randomUUID(),
      type: "response",
      text: "Welcome to **NextBot** — how can I help you today?",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Smooth scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = "0px";
    const newHeight = Math.min(el.scrollHeight, 160); // up to ~3-4 lines
    el.style.height = newHeight + "px";
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      type: "user",
      text: trimmed,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      // Read the body ONCE
      const data = await res.json();
      if (!res.ok) {
        const errText =
          typeof data?.error === "string" ? data.error : `HTTP ${res.status}`;
        throw new Error(errText);
      }

      const botMsg: ChatMsg = {
        id: crypto.randomUUID(),
        type: "response",
        text: String(data.message ?? ""),
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "An unknown error occurred.";
      const botErr: ChatMsg = {
        id: crypto.randomUUID(),
        type: "response",
        text: `**Error:** ${msg}`,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botErr]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col items-center justify-start">
      {/* Background Particles */}
      <div className="fixed inset-0 -z-50 flex w-full h-full">
        <Particles
          particleColors={["#772CE8"]}
          particleCount={400}
          particleSpread={10}
          speed={0.4}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Top Bar */}
      <div className="w-full flex justify-center mt-6 mb-4 z-10">
        <Logo />
      </div>

      {/* Chat Container */}
      <div className="relative z-10 mx-auto mt-8 w-full max-w-2xl h-[680px] rounded-2xl border border-purple-400 bg-white/20 dark:bg-purple-900/40 backdrop-blur-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center gap-2">
            <div className="flex w-8 mr-1">
              <Logo />
            </div>
            <h1 className="text-xl font-bold tracking-wide text-fuchsia-50">
              NextBot
            </h1>
          </div>
          {/* (Optional) Placeholder for theme toggle or settings */}
          {/* <button className="text-white/80 hover:text-white transition">⚙️</button> */}
        </div>

        {/* Messages */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white/60 dark:bg-purple-950/60"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar (left for bot, right for user) */}
              {msg.type === "response" && (
                <div className="flex w-7 mr-1">
                  <Logo />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow ${
                  msg.type === "user"
                    ? "bg-blue-100 dark:bg-blue-600 text-black dark:text-white rounded-br-sm"
                    : "bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-bl-sm"
                }`}
              >
                {msg.type === "response" ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none
                               prose-headings:text-purple-200
                               prose-strong:text-white
                               prose-a:text-blue-200 prose-a:underline
                               prose-code:text-white prose-pre:bg-black/30"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noreferrer" />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Timestamp */}
                <div
                  className={`mt-1 text-[10px] ${
                    msg.type === "user"
                      ? "text-black/50 dark:text-white/60 text-right"
                      : "text-white/70"
                  }`}
                >
                  {formatTime(msg.ts)}
                </div>
              </div>

              {msg.type === "user" && (
                <div className="shrink-0 select-none rounded-full w-8 h-8 bg-blue-600 text-white grid place-items-center shadow">
                  🧑
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 justify-start">
              <div className="shrink-0 rounded-full w-8 h-8 bg-purple-600 text-white grid place-items-center shadow">
                🤖
              </div>
              <div className="rounded-2xl px-4 py-3 bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow">
                <div className="flex gap-1">
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  >
                    ●
                  </span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "120ms" }}
                  >
                    ●
                  </span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "240ms" }}
                  >
                    ●
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/40 dark:border-white/10 bg-white/50 dark:bg-black/20 rounded-b-2xl">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask a question… "
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none rounded-xl px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="rounded-xl px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium shadow transition"
            >
              Send
            </button>
          </div>
          <div className="mt-5 text-[11px] text-black/60 dark:text-white/50">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded">
              Enter
            </kbd>{" "}
            to send •{" "}
            <kbd className="px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded">
              Shift
            </kbd>
            +
            <kbd className="px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded">
              Enter
            </kbd>{" "}
            for a new line
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
