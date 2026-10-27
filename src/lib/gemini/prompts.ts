import { EventType } from "@/types/event";

export function buildEventPlanPrompt(params: {
  title: string;
  eventType: EventType;
  targetDate: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  location: string;
  themeNotes?: string;
}) {
  return `You are a world-class luxury event architect and senior event producer specializing in ${params.eventType}s.
Design a comprehensive, highly personalized event strategy for the following:

- Event Title: ${params.title}
- Event Type: ${params.eventType}
- Target Date: ${params.targetDate}
- Location / Setting: ${params.location || "City center venue"}
- Guest Count: ${params.guestCount} attendees
- Total Budget: ${params.totalBudget} ${params.currency}
- Style & Vision Notes: ${params.themeNotes || "Modern, memorable, and elegant"}

You must return a valid, well-structured JSON object conforming strictly to this format:
{
  "theme_name": "A creative, evocative title for the theme",
  "vibe_summary": "A 2-sentence high-level aesthetic and emotional description of the event experience",
  "color_palette": [
    { "name": "Color name", "hex": "#HEXVAL" }
  ],
  "budget_breakdown": [
    {
      "category": "e.g. Venue & Rentals",
      "percentage": 30,
      "recommended_amount": 15000,
      "tips": "Tactical advice on how to optimize this category"
    }
  ],
  "timeline_phases": [
    {
      "phase": "e.g. 6 Months Out",
      "title": "Milestone title",
      "description": "Clear action step",
      "target_timeframe": "Month 1-2"
    }
  ],
  "vendor_checklists": [
    {
      "category": "Category name",
      "key_questions_to_ask": [
        "Critical question 1",
        "Critical question 2"
      ],
      "recommended_actions": [
        "Contract tip or verification step"
      ]
    }
  ],
  "creative_ideas": [
    {
      "id": "idea-1",
      "title": "Unique touch title",
      "description": "Specific, memorable execution detail for guests",
      "category": "decor",
      "aesthetic_keywords": ["keyword1", "keyword2"],
      "estimated_impact": "High"
    }
  ]
}

Ensure the sum of percentage values in budget_breakdown equals 100%. Ensure realistic numbers reflecting ${params.currency} currency. Return ONLY the JSON object.`;
}

export function buildCoPilotChatPrompt(eventContext: string, userMessage: string) {
  return `You are VibeCraft's Senior AI Event Co-Pilot. You have 15+ years of experience planning high-profile weddings, unforgettable milestone birthdays, and massive community galas.
Current Event Context:
${eventContext}

User Query:
${userMessage}

Guidelines:
1. Be encouraging, organized, and decisively tactical.
2. Give actionable suggestions, numbers, and scripts whenever asked.
3. If they ask about budget tradeoffs, explain what to cut without sacrificing guest experience.
4. Keep the tone warm, sophisticated, and confidence-inspiring.`;
}
