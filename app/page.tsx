"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Particles from "./ui/Particles";
import Logo from "./ui/Logo";

export default function Page() {
  const [messages, setMessages] = useState([
    {
      type: "response",
      text: "Welcome to the NextBot, how can I help you today?",
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
    <div className="relative min-h-screen bg-transparent flex flex-col items-center justify-start">
      {/* Background Particles */}
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        <Particles
          particleColors={["#772CE8"]}
          particleCount={400}
          particleSpread={10}
          speed={0.4}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Centered Logo */}
      <div className="w-full flex justify-center mt-6 mb-4 z-10">
        <Logo />
      </div>

      <div className="chat-box relative z-10 mx-auto mt-10 max-w-xl rounded-2xl bg-white shadow-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
        {/* Header */}
        <div className="chat-box-header text-lg font-semibold p-4 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          🤖 NextBot
        </div>

        {/* Messages */}
        <div
          className="chat-box-body flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-gray-900"
          ref={chatBoxRef}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg w-fit max-w-[80%] text-sm ${
                msg.type === "user"
                  ? "bg-blue-100 dark:bg-blue-600 ml-auto text-right text-black dark:text-white"
                  : "bg-gray-200 dark:bg-gray-700 mr-auto text-left text-black dark:text-gray-200"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          ))}

          {/* Loading Animation */}
          {isLoading && (
            <div className="response loading animate-pulse text-gray-400 dark:text-gray-500">
              <p>{loadingDots}</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-box-footer p-4 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center gap-2 rounded-lg">
          <input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 shadow"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
