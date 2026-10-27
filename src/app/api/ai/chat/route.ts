import { NextResponse } from "next/server";
import { chatWithAIPlanner } from "@/lib/gemini/generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventContext, message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const reply = await chatWithAIPlanner(eventContext || "General Event Planning", message);
    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to respond", details: error?.message },
      { status: 500 }
    );
  }
}
