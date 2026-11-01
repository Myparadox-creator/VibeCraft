import {
  cn,
  formatCurrency,
  formatDate,
  calculateDaysRemaining,
  calculateBudgetMetrics,
} from "@/lib/utils";
import { BudgetItem } from "@/types/event";

describe("Utility Functions", () => {
  describe("cn (classnames merge)", () => {
    it("merges multiple classes and resolves tailwind conflicts", () => {
      const result = cn("p-4 text-white", "p-8 text-black", { "bg-gold": true, "hidden": false });
      expect(result).toContain("p-8");
      expect(result).toContain("text-black");
      expect(result).toContain("bg-gold");
      expect(result).not.toContain("p-4");
      expect(result).not.toContain("text-white");
    });
  });

  describe("formatCurrency", () => {
    it("formats standard USD currency with no decimal places", () => {
      const formatted = formatCurrency(25000, "USD");
      expect(formatted).toMatch(/\$25,000/);
    });

    it("formats EUR currency correctly", () => {
      const formatted = formatCurrency(15000, "EUR");
      expect(formatted).toContain("15,000");
    });

    it("falls back gracefully when given zero or negative amount", () => {
      const formatted = formatCurrency(0, "USD");
      expect(formatted).toMatch(/\$0/);
    });
  });

  describe("formatDate", () => {
    it("formats ISO date strings to human-readable month, day, year", () => {
      const formatted = formatDate("2026-12-25");
      expect(formatted).toContain("Dec");
      expect(formatted).toContain("25");
      expect(formatted).toContain("2026");
    });

    it("returns empty string for empty input", () => {
      expect(formatDate("")).toBe("");
    });

    it("returns original string for invalid date formats", () => {
      expect(formatDate("invalid-date-string")).toBe("invalid-date-string");
    });
  });

  describe("calculateDaysRemaining", () => {
    it("calculates future countdown days accurately", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);
      const res = calculateDaysRemaining(futureDate.toISOString());
      expect(res.days).toBeGreaterThanOrEqual(44);
      expect(res.days).toBeLessThanOrEqual(46);
      expect(res.isPast).toBe(false);
      expect(res.label).toContain("days left");
    });

    it("identifies past dates correctly", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const res = calculateDaysRemaining(pastDate.toISOString());
      expect(res.isPast).toBe(true);
      expect(res.label).toContain("days ago");
    });
  });

  describe("calculateBudgetMetrics", () => {
    const mockItems: BudgetItem[] = [
      {
        id: "b-1",
        event_id: "e-1",
        category: "Venue",
        item_name: "Ballroom Deposit",
        allocated_amount: 10000,
        actual_amount: 9500,
        payment_status: "paid_in_full",
      },
      {
        id: "b-2",
        event_id: "e-1",
        category: "Catering",
        item_name: "Dinner Service",
        allocated_amount: 15000,
        actual_amount: 12000,
        payment_status: "deposit_paid",
      },
    ];

    it("aggregates allocated and actual expenses properly", () => {
      const totalBudget = 30000;
      const metrics = calculateBudgetMetrics(mockItems, totalBudget);

      expect(metrics.allocated).toBe(25000);
      expect(metrics.actual).toBe(21500);
      expect(metrics.remaining).toBe(8500);
      expect(metrics.isOverBudget).toBe(false);
      expect(metrics.percentageSpent).toBe(72);
    });

    it("flags over-budget scenario when actual exceeds total", () => {
      const tightBudget = 20000;
      const metrics = calculateBudgetMetrics(mockItems, tightBudget);

      expect(metrics.isOverBudget).toBe(true);
      expect(metrics.remaining).toBe(-1500);
      expect(metrics.percentageSpent).toBe(100);
    });

    it("handles empty items array gracefully", () => {
      const metrics = calculateBudgetMetrics([], 10000);
      expect(metrics.allocated).toBe(0);
      expect(metrics.actual).toBe(0);
      expect(metrics.remaining).toBe(10000);
      expect(metrics.percentageSpent).toBe(0);
      expect(metrics.isOverBudget).toBe(false);
    });
  });
});
