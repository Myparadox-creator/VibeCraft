import { buildEventPlanPrompt, buildCoPilotChatPrompt } from "@/lib/gemini/prompts";

describe("Gemini Prompt Engineering Builders", () => {
  it("builds a comprehensive JSON-schema constrained prompt for event plans", () => {
    const prompt = buildEventPlanPrompt({
      title: "Royal Crimson Gala",
      eventType: "wedding",
      targetDate: "2027-06-15",
      guestCount: 250,
      totalBudget: 75000,
      currency: "USD",
      location: "Grand Heritage Palace",
      themeNotes: "Royal velvet luxury with vintage gold accents",
    });

    expect(prompt).toContain("Royal Crimson Gala");
    expect(prompt).toContain("wedding");
    expect(prompt).toContain("250 attendees");
    expect(prompt).toContain("75000 USD");
    expect(prompt).toContain("Grand Heritage Palace");
    expect(prompt).toContain("budget_breakdown");
    expect(prompt).toContain("timeline_phases");
    expect(prompt).toContain("vendor_checklists");
    expect(prompt).toContain("creative_ideas");
  });

  it("builds co-pilot chat prompt containing event context and user query", () => {
    const context = "Event: Sapphire Birthday Gala | Budget: $20,000 | Location: Malibu";
    const userMessage = "How can I cut 15% from catering without guests noticing?";

    const prompt = buildCoPilotChatPrompt(context, userMessage);

    expect(prompt).toContain("Senior AI Event Co-Pilot");
    expect(prompt).toContain(context);
    expect(prompt).toContain(userMessage);
    expect(prompt).toContain("budget tradeoffs");
  });
});
