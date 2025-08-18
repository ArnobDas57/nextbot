// app/api/message/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing Gemini API token in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.message) {
      return NextResponse.json(
        { error: "Missing message in request body." },
        { status: 400 }
      );
    }

    const userMessage = body.message;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "You are a helpful and concise assistant." }],
        },
        { role: "user", parts: [{ text: String(userMessage) }] },
      ],
      generationConfig: { temperature: 0.7 },
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const responseText = parts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => p?.text ?? "")
      .join("")
      .trim();

    if (!responseText) {
      return NextResponse.json(
        { error: "No response from Gemini." },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: responseText });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Gemini API error:", err);

    return NextResponse.json(
      { error: err?.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
