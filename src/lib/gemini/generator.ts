import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeneratedPlan, EventType } from "@/types/event";
import { buildEventPlanPrompt, buildCoPilotChatPrompt } from "./prompts";
import { MOCK_GENAI_IDEAS } from "@/lib/mock-data";

export async function generateEventPlanWithAI(params: {
  title: string;
  eventType: EventType;
  targetDate: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  location: string;
  themeNotes?: string;
}): Promise<GeneratedPlan> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const prompt = buildEventPlanPrompt(params);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      if (parsed && parsed.budget_breakdown && parsed.timeline_phases) {
        return parsed as GeneratedPlan;
      }
    } catch (err) {
      console.warn("Gemini API call failed or timed out, falling back to intelligent procedural planner:", err);
    }
  }

  // Graceful deterministic fallback generator tailored to event type
  return generateProceduralPlan(params);
}

export async function chatWithAIPlanner(
  eventContext: string,
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = buildCoPilotChatPrompt(eventContext, userMessage);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn("Gemini chat error, falling back:", err);
    }
  }

  // Procedural intelligent fallback replies based on keywords
  const lower = userMessage.toLowerCase();
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("save")) {
    return `Based on your budget, the smartest strategy is to allocate 40-45% to Venue & Catering (as that directly impacts guest comfort), 12% to Photography (your permanent legacy), and trim floral costs by using lush local greenery and focal candle clusters. Consider skipping physical wedding programs to save $300-$500!`;
  }
  if (lower.includes("rain") || lower.includes("weather") || lower.includes("contingency")) {
    return `For outdoor elements, always have a 'Plan B' 72 hours prior: secure clear-top tent rentals with side walls, ensure walkways have rubber mats or wood decking for heels, and purchase 30 matching transparent umbrellas—they make for breathtaking rainy day photos!`;
  }
  if (lower.includes("vendor") || lower.includes("tip") || lower.includes("contract")) {
    return `Vendor rule of thumb: Always ask for their overtime hourly rate upfront before signing, verify if hot vendor meals are mandatory in their rider, and prepare cash tip envelopes (15-20% for catering staff, $50-$100 for lead photo/DJ assistants) the morning of the event.`;
  }
  return `That's a fantastic idea for ${paramsTitle(eventContext)}! To execute this flawlessly, make sure you designate a point person (like a bridesmaid, best man, or day-of coordinator) rather than handling it yourself on the day. Would you like me to outline a timeline checklist for this?`;
}

function paramsTitle(context: string): string {
  try {
    const match = context.match(/Event: ([^\n]+)/);
    return match ? match[1] : "your event";
  } catch {
    return "your event";
  }
}

function generateProceduralPlan(params: {
  title: string;
  eventType: EventType;
  guestCount: number;
  totalBudget: number;
  currency: string;
  location: string;
  themeNotes?: string;
}): GeneratedPlan {
  const budget = params.totalBudget || 10000;

  if (params.eventType === "wedding") {
    return {
      theme_name: params.themeNotes ? `${params.themeNotes} Aesthetic` : "Timeless Romance & Warm Luminescence",
      vibe_summary: `An enchanting celebration in ${params.location || "a picturesque setting"}, blending refined elegance, intimate candlelight, and effortless guest flow.`,
      color_palette: [
        { name: "Champagne Glow", hex: "#F7E7CE" },
        { name: "Dusty Rose", hex: "#DCAE96" },
        { name: "Sage Olive", hex: "#8A9A5B" },
        { name: "Antique Gold", hex: "#CFB53B" },
        { name: "Ivory Silk", hex: "#FFFFF0" },
      ],
      budget_breakdown: [
        { category: "Venue & Rentals", percentage: 32, recommended_amount: Math.round(budget * 0.32), tips: "Confirm if tables, chairs, and restrooms are covered." },
        { category: "Catering & Bar", percentage: 30, recommended_amount: Math.round(budget * 0.30), tips: "Signature cocktails rather than a full open top-shelf bar can save up to 25%." },
        { category: "Photo & Cinema", percentage: 12, recommended_amount: Math.round(budget * 0.12), tips: "Book 8 hours centered around sunset rather than full day." },
        { category: "Florals & Decor", percentage: 10, recommended_amount: Math.round(budget * 0.10), tips: "Repurpose ceremony flowers for reception tables." },
        { category: "Music & Audio", percentage: 8, recommended_amount: Math.round(budget * 0.08), tips: "Duo for ceremony and dynamic DJ for dancing." },
        { category: "Contingency Fund", percentage: 8, recommended_amount: Math.round(budget * 0.08), tips: "Keep as buffer for surprise tips and minor alterations." },
      ],
      timeline_phases: [
        { phase: "8-12 Months Out", title: "Venue & Key Vendors", description: "Secure location, photographer, and catering provider.", target_timeframe: "Month 1-3" },
        { phase: "4-6 Months Out", title: "Attire & Invitations", description: "Design invites, dress fittings, food tastings.", target_timeframe: "Month 6" },
        { phase: "1-2 Months Out", title: "RSVPs & Seating Chart", description: "Lock in final headcounts, dietary restrictions, day-of timeline.", target_timeframe: "Month 10" },
        { phase: "Day-Of", title: "Run of Show Execution", description: "Hair/makeup, first look, ceremony, dining, send-off.", target_timeframe: "Event Day" },
      ],
      vendor_checklists: [
        {
          category: "Catering",
          key_questions_to_ask: ["Are taxes and service charges itemized?", "What is the policy for vendor meals?"],
          recommended_actions: ["Request gluten-free/allergy substitutions at no extra fee."],
        },
        {
          category: "Photography",
          key_questions_to_ask: ["Do you provide raw files or only edited finals?", "What is the delivery turnaround?"],
          recommended_actions: ["Supply a must-have family member shot list."],
        },
      ],
      creative_ideas: [
        {
          id: "idea-w1",
          title: "Audio Guestbook on Vintage Rotary Phone",
          description: "Guests record voicemail messages for the couple throughout the night.",
          category: "activity",
          aesthetic_keywords: ["vintage", "interactive", "nostalgic"],
          estimated_impact: "High",
        },
        {
          id: "idea-w2",
          title: "Late-Night Artisanal Gelato or Churro Cart",
          description: "Surprise guests at 10 PM on the dance floor with fresh warm churros or small-batch gelato.",
          category: "food",
          aesthetic_keywords: ["delight", "sweet", "party"],
          estimated_impact: "Delight",
        },
      ],
    };
  }

  // Fallback for Birthday & Community
  return {
    ...MOCK_GENAI_IDEAS,
    theme_name: `${params.title} - Modern Experience`,
    budget_breakdown: [
      { category: "Venue & Staging", percentage: 35, recommended_amount: Math.round(budget * 0.35), tips: "Verify sound permits and load-in windows." },
      { category: "Food & Beverage", percentage: 30, recommended_amount: Math.round(budget * 0.30), tips: "Food trucks or curated buffet stations keep energy lively." },
      { category: "Entertainment & DJ", percentage: 15, recommended_amount: Math.round(budget * 0.15), tips: "Interactive MC or live performer boosts engagement." },
      { category: "Decor & Photo Moments", percentage: 12, recommended_amount: Math.round(budget * 0.12), tips: "Focal branded photobooth backdrop generates organic social shares." },
      { category: "Staff & Permits", percentage: 8, recommended_amount: Math.round(budget * 0.08), tips: "Security, sanitation, and municipal park permits." },
    ],
  };
}
