// app/api/message/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API token in environment variables.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful and concise assistant." },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    const responseText = chat.choices[0]?.message?.content?.trim();

    if (!responseText?.length) {
      return NextResponse.json(
        { error: "No response from OpenAI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: responseText });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("OpenAI API error:", err.response?.data || err.message);

    if (err.response?.status === 429) {
      return NextResponse.json(
        { error: "You have exceeded your OpenAI API quota or rate limits." },
        { status: 429 }
      );
    }

    const errorMessage =
      typeof err === "object" && err !== null && "message" in err
        ? (err as { message: string }).message
        : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
