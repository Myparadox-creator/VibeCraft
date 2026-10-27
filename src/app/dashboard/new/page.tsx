"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Palette,
  Heart,
  PartyPopper,
  Trees,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EventType, GeneratedPlan } from "@/types/event";
import { useEventContext } from "@/context/EventContext";
import { formatCurrency } from "@/lib/utils";

export default function NewEventWizardPage() {
  const router = useRouter();
  const { createEventWithPlan } = useEventContext();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [targetDate, setTargetDate] = useState("2027-05-15");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState<number>(100);
  const [totalBudget, setTotalBudget] = useState<number>(30000);
  const [currency, setCurrency] = useState("USD");
  const [themeNotes, setThemeNotes] = useState("");

  // AI Generated Output State
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const eventTypes: { type: EventType; label: string; icon: any; defaultBudget: number; defaultGuests: number }[] = [
    { type: "wedding", label: "Dream Wedding", icon: Heart, defaultBudget: 35000, defaultGuests: 120 },
    { type: "birthday", label: "Milestone Birthday", icon: PartyPopper, defaultBudget: 7500, defaultGuests: 50 },
    { type: "community", label: "Community / Festival", icon: Trees, defaultBudget: 15000, defaultGuests: 300 },
    { type: "corporate", label: "Corporate / Gala", icon: Briefcase, defaultBudget: 25000, defaultGuests: 150 },
  ];

  const handleSelectEventType = (type: EventType) => {
    setEventType(type);
    const preset = eventTypes.find((t) => t.type === type);
    if (preset) {
      setTotalBudget(preset.defaultBudget);
      setGuestCount(preset.defaultGuests);
    }
  };

  const handleRunAIPlanner = async () => {
    if (!title.trim()) {
      alert("Please provide an event title.");
      return;
    }

    setIsGenerating(true);
    setStep(2);

    // Dynamic progressive feedback simulation
    setGenerationProgress("Synthesizing theme aesthetic and color palette...");
    const t1 = setTimeout(() => {
      setGenerationProgress("Calculating optimal category budget allocations...");
    }, 900);
    const t2 = setTimeout(() => {
      setGenerationProgress("Reverse-engineering run-of-show timeline milestones...");
    }, 1800);
    const t3 = setTimeout(() => {
      setGenerationProgress("Drafting vendor negotiation checklists...");
    }, 2700);

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          eventType,
          targetDate,
          location,
          guestCount,
          totalBudget,
          currency,
          themeNotes,
        }),
      });

      const data = await res.json();
      if (data.plan) {
        setGeneratedPlan(data.plan);
      }
    } catch (err) {
      console.error("AI Plan Generation failed:", err);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsGenerating(false);
      setStep(3);
    }
  };

  const handleFinalDeploy = async () => {
    const newId = await createEventWithPlan(
      {
        title,
        event_type: eventType,
        target_date: targetDate,
        location,
        guestCount: Number(guestCount),
        total_budget: Number(totalBudget),
        currency,
        theme_description: generatedPlan?.vibe_summary || themeNotes,
      } as any,
      generatedPlan || undefined
    );

    router.push(`/events/${newId}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Wizard Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
          <span>Interactive AI Architect</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Create Your Next Event
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          Tell Gemini AI your basic parameters. In seconds, get a full budget breakdown, customized
          milestones, and vendor checklist.
        </p>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? "text-fuchsia-400" : "text-slate-600"}`}>
            <span className="h-6 w-6 rounded-full border border-current flex items-center justify-center">1</span>
            Parameters
          </div>
          <div className="h-0.5 w-8 bg-slate-800" />
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? "text-fuchsia-400" : "text-slate-600"}`}>
            <span className="h-6 w-6 rounded-full border border-current flex items-center justify-center">2</span>
            AI Synthesis
          </div>
          <div className="h-0.5 w-8 bg-slate-800" />
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 3 ? "text-fuchsia-400" : "text-slate-600"}`}>
            <span className="h-6 w-6 rounded-full border border-current flex items-center justify-center">3</span>
            Review & Deploy
          </div>
        </div>
      </div>

      {/* STEP 1: FORM INPUTS */}
      {step === 1 && (
        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle>Event Fundamentals</CardTitle>
            <CardDescription>
              Select your event category and basic logistics so the AI models the appropriate budget splits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Type Grid */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Event Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {eventTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = eventType === t.type;
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => handleSelectEventType(t.type)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-fuchsia-500 bg-fuchsia-500/10 text-white shadow-glow"
                          : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${isSelected ? "text-fuchsia-400" : "text-slate-500"}`} />
                      <span className="text-xs font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Event Title</label>
                <Input
                  required
                  placeholder="e.g. Maya & Lucas Golden Hour Wedding"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Target Date</label>
                <Input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>

            {/* Location & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Location / City</label>
                <Input
                  placeholder="e.g. Napa Valley, CA or City Park"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Expected Guests</label>
                <Input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Total Budget & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Total Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="number"
                    min={100}
                    step={100}
                    className="pl-10"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Currency</label>
                <select
                  aria-label="Event Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            {/* Style & Vision Notes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Aesthetic Vision, Mood & Special Wishes (Optional)
              </label>
              <Textarea
                placeholder="e.g. Candlelit rustic romantic vibe, natural greenery, late-night taco truck, intimate acoustic music."
                value={themeNotes}
                onChange={(e) => setThemeNotes(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="glow"
              size="lg"
              onClick={handleRunAIPlanner}
              className="w-full gap-2 shadow-glow text-base"
              disabled={!title.trim()}
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate Event Blueprint with Gemini AI</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: GENERATING ANIMATION */}
      {step === 2 && isGenerating && (
        <Card className="border-fuchsia-500/40 bg-slate-900/90 p-12 text-center shadow-glow">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-amber-500 text-white shadow-glow animate-bounce">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">AI Co-Pilot is Architecting Your Event</h3>
          <p className="mt-3 text-sm text-fuchsia-300 font-medium animate-pulse">
            {generationProgress || "Processing high-dimensional event parameters..."}
          </p>
          <div className="mt-8 max-w-xs mx-auto">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-fuchsia-500 to-amber-500 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: REVIEW AI PLAN & DEPLOY */}
      {step === 3 && generatedPlan && (
        <div className="space-y-6">
          <Card className="border-fuchsia-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="glow">AI Generated Blueprint</Badge>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs">
                  ← Edit Parameters
                </Button>
              </div>
              <CardTitle className="text-2xl font-extrabold text-white mt-2">
                {generatedPlan.theme_name}
              </CardTitle>
              <CardDescription className="text-slate-300 text-sm leading-relaxed">
                {generatedPlan.vibe_summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Color Swatches */}
              {generatedPlan.color_palette && generatedPlan.color_palette.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-fuchsia-400" />
                    Color Palette
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedPlan.color_palette.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5"
                      >
                        <div
                          className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-medium text-slate-200">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Budget Allocation */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Optimized Budget Breakdown ({formatCurrency(totalBudget, currency)})
                </h4>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80">
                  {generatedPlan.budget_breakdown.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{item.category}</span>
                        <span className="text-slate-400 text-[11px]">{item.tips}</span>
                      </div>
                      <div className="text-right pl-4 shrink-0">
                        <span className="font-bold text-emerald-400 block">
                          {formatCurrency(item.recommended_amount, currency)}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Milestones */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  Run-of-Show Milestones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedPlan.timeline_phases.map((phase, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1"
                    >
                      <Badge variant="secondary" className="text-[10px]">
                        {phase.phase}
                      </Badge>
                      <p className="text-xs font-semibold text-white">{phase.title}</p>
                      <p className="text-[11px] text-slate-400 leading-snug">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleFinalDeploy}
                  variant="glow"
                  size="lg"
                  className="w-full gap-2 text-base shadow-glow"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Deploy & Open Event Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
