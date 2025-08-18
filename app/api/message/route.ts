// app/api/message/route.ts
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

    const result = await model.generateContent([
      "You are a helpful and concise assistant.",
      userMessage,
    ]);

    const responseText = result.response.text().trim();

    if (!responseText?.length) {
      return NextResponse.json(
        { error: "No response from Gemini." },
        { status: 500 }
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
