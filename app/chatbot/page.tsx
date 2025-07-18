// app/chat/page.tsx or pages/chat.tsx (depending on your router)

"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import "./styles.css"; // Make sure styles.css is globally imported

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      type: "response",
      text: "Welcome to the Coding Nexus AI, how can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loadingDots, setLoadingDots] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      interval = setInterval(() => {
        setLoadingDots((prev) => {
          if (prev.length >= 3) return ".";
          return prev + ".";
        });
      }, 250);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { type: "message", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { type: "message", text: trimmed },
        { type: "response", text: data.message },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          type: "response",
          text:
            typeof err === "object" && err !== null && "message" in err
              ? `Error: ${(err as { message: string }).message}`
              : "An unknown error occurred.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingDots("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div>
      <div className="logo-container">
        <a href="https://www.youtube.com/@CodingNexus">
          <Image src="/logo.png" width={150} height={150} alt="Logo" />
        </a>
      </div>

      <div className="chat-box">
        <div className="chat-box-header">Coding Nexus</div>
        <div className="chat-box-body" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.type}>
              <p>{msg.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="response loading">
              <p>{loadingDots}</p>
            </div>
          )}
        </div>

        <div className="chat-box-footer">
          <input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>

      <div className="codingnexus">
        <a href="https://www.youtube.com/@CodingNexus">
          Created by Coding Nexus
        </a>
      </div>
    </div>
  );
}
