"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Palette,
  Lightbulb,
  Copy,
  Check,
  RefreshCw,
  Heart,
  Gift,
  Coffee,
  Music,
} from "lucide-react";
import { useEventContext } from "@/context/EventContext";
import { EventHeader } from "@/components/navigation/EventHeader";
import { AICoPilotDrawer } from "@/components/ai/AICoPilotDrawer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventIdea } from "@/types/event";
import { MOCK_GENAI_IDEAS } from "@/lib/mock-data";

export default function EventIdeasPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { events, currentEvent } = useEventContext();

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ideas, setIdeas] = useState<EventIdea[]>(MOCK_GENAI_IDEAS.creative_ideas);

  const event = events.find((e) => e.id === eventId) || currentEvent;

  if (!event) return null;

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleGenerateFreshIdeas = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title,
          eventType: event.event_type,
          targetDate: event.target_date,
          guestCount: event.guest_count,
          totalBudget: event.total_budget,
          currency: event.currency,
          location: event.location,
          themeNotes: "Generate 3 completely unique, unforgettable guest surprise elements",
        }),
      });
      const data = await res.json();
      if (data.plan && data.plan.creative_ideas) {
        setIdeas((prev) => [...data.plan.creative_ideas, ...prev]);
      }
    } catch (err) {
      console.error("Failed to generate ideas:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const palette = MOCK_GENAI_IDEAS.color_palette;

  return (
    <div>
      <EventHeader event={event} onOpenAIChat={() => setIsAIChatOpen(true)} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              AI Concept Studio & Moodboard
            </h2>
            <p className="text-sm text-slate-400">
              Personalized aesthetic themes, custom color harmonies, and delightful guest experiences.
            </p>
          </div>

          <Button
            onClick={handleGenerateFreshIdeas}
            variant="glow"
            size="md"
            disabled={isRefreshing}
            className="gap-2 shadow-glow"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Generate New Ideas with Gemini</span>
          </Button>
        </div>

        {/* Theme Vision Banner */}
        <Card className="border-fuchsia-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-glow">
          <Badge variant="glow" className="mb-2">
            Active Theme Architecture
          </Badge>
          <h3 className="text-2xl font-extrabold text-white">
            {event.theme_description || MOCK_GENAI_IDEAS.theme_name}
          </h3>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            {MOCK_GENAI_IDEAS.vibe_summary}
          </p>

          {/* Color Swatches */}
          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Palette className="h-3.5 w-3.5 text-fuchsia-400" />
              Harmonized Color Palette (Click hex to copy)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {palette.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyHex(color.hex)}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 hover:border-slate-700 transition-all text-left group"
                >
                  <div
                    className="h-8 w-8 rounded-lg border border-white/20 shadow-sm shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{color.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 group-hover:text-fuchsia-400 flex items-center gap-1">
                      {copiedHex === color.hex ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> Copied
                        </span>
                      ) : (
                        <span>{color.hex}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Personalized Concept Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Curated High-Impact Touches
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea, idx) => (
              <Card
                key={idea.id || idx}
                className="border-slate-800 bg-slate-900/60 hover:border-fuchsia-500/40 hover:shadow-glow transition-all flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="glow" className="capitalize text-[10px]">
                      {idea.category}
                    </Badge>
                    <Badge variant="warning" className="text-[10px]">
                      {idea.estimated_impact} Impact
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mt-2 text-white">
                    {idea.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-300 leading-relaxed mt-2">
                    {idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                    {idea.aesthetic_keywords?.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[10px] rounded-md bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-800"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <AICoPilotDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        event={event}
      />
    </div>
  );
}
