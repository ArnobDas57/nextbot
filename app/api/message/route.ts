// app/api/message/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    const completion = await openai.completions.create({
      model: "text-davinci-003",
      prompt: userMessage,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 256,
    });

    const message = completion.choices[0]?.text?.trim();

    return NextResponse.json({ message });
  } catch (err: unknown) {
    const errorMessage =
      typeof err === "object" && err !== null && "message" in err
        ? (err as { message: string }).message
        : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
