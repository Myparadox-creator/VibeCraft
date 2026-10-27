import { NextResponse } from "next/server";
import { generateEventPlanWithAI } from "@/lib/gemini/generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, eventType, targetDate, guestCount, totalBudget, currency, location, themeNotes } = body;

    if (!title || !eventType) {
      return NextResponse.json({ error: "Title and Event Type are required" }, { status: 400 });
    }

    const plan = await generateEventPlanWithAI({
      title,
      eventType,
      targetDate: targetDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      guestCount: Number(guestCount) || 50,
      totalBudget: Number(totalBudget) || 10000,
      currency: currency || "USD",
      location: location || "Downtown Venue",
      themeNotes: themeNotes || "",
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("AI Plan Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate event plan", details: error?.message },
      { status: 500 }
    );
  }
}
