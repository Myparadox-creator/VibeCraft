import { generateEventPlanWithAI, chatWithAIPlanner } from "@/lib/gemini/generator";

describe("Event Plan Generation Engine", () => {
  it("generates a high-fidelity procedural plan when API key is missing (dual-engine fallback)", async () => {
    const plan = await generateEventPlanWithAI({
      title: "Golden Hour Terrace Wedding",
      eventType: "wedding",
      targetDate: "2026-10-15",
      guestCount: 150,
      totalBudget: 50000,
      currency: "USD",
      location: "Carmel-by-the-Sea",
      themeNotes: "Sunset coastal romance with organic florals",
    });

    expect(plan).toBeDefined();
    expect(plan.theme_name).toBeDefined();
    expect(plan.vibe_summary).toContain("Carmel-by-the-Sea");
    expect(plan.color_palette.length).toBeGreaterThanOrEqual(4);
    expect(plan.budget_breakdown.length).toBeGreaterThanOrEqual(5);

    // Sum of budget categories
    const totalPercentage = plan.budget_breakdown.reduce((sum, item) => sum + item.percentage, 0);
    expect(totalPercentage).toBeGreaterThanOrEqual(95);
    expect(totalPercentage).toBeLessThanOrEqual(105);

    // Verify timeline and vendor components exist
    expect(plan.timeline_phases.length).toBeGreaterThanOrEqual(3);
    expect(plan.vendor_checklists.length).toBeGreaterThanOrEqual(2);
    expect(plan.creative_ideas.length).toBeGreaterThanOrEqual(1);
  });

  it("provides contextual tactical fallback replies in chat copilot", async () => {
    const context = "Event: Milestone 30th Birthday | Budget: $10,000";
    
    const budgetReply = await chatWithAIPlanner(context, "How do I save budget on catering?");
    expect(budgetReply.toLowerCase()).toContain("budget");

    const rainReply = await chatWithAIPlanner(context, "What if there is rain weather?");
    expect(rainReply.toLowerCase()).toContain("plan b");

    const vendorReply = await chatWithAIPlanner(context, "How to tip vendor contracts?");
    expect(vendorReply.toLowerCase()).toContain("vendor");
  });
});
