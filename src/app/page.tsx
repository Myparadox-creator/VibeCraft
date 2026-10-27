"use client";

import Link from "next/link";
import {
  Sparkles,
  Calendar,
  PieChart,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  Users,
  Compass,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useEventContext } from "@/context/EventContext";
import { formatCurrency } from "@/lib/utils";

export default function LandingPage() {
  const { events, setCurrentEventId } = useEventContext();

  return (
    <div className="relative overflow-hidden pb-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-fuchsia-600/20 via-pink-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-60 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3.5 py-1 text-xs sm:text-sm text-fuchsia-300 backdrop-blur-md mb-6 animate-pulse-subtle">
          <Sparkles className="h-4 w-4 text-fuchsia-400" />
          <span>Next-Generation AI Event Planning Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Unforgettable Events,{" "}
          <span className="text-gradient">Orchestrated by AI.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From high-stakes weddings to milestone birthdays and community galas. VibeCraft generates
          instant budget splits, minute-by-minute run-of-show timelines, and tactical vendor checklists in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard/new">
            <Button variant="glow" size="lg" className="gap-2 text-base shadow-glow">
              <Sparkles className="h-5 w-5" />
              <span>Launch AI Event Wizard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="secondary" size="lg" className="text-base gap-2">
              <Calendar className="h-5 w-5 text-fuchsia-400" />
              <span>View Active Showcase</span>
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Supabase PostgreSQL & JWT Auth
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-400" />
            Powered by Google Gemini AI
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-fuchsia-400" />
            Multi-Tenant Row Level Security
          </span>
        </div>
      </section>

      {/* Featured Showcase Events */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <Badge variant="glow" className="mb-2">
              Curated Demonstrations
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Explore Live Event Architectures
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select an event to inspect its real-time budget ledger, run-of-show, and vendor CRM.
            </p>
          </div>
          <Link href="/dashboard" className="mt-4 md:mt-0 text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1">
            Browse all events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((evt) => (
            <Card
              key={evt.id}
              className="group hover:border-fuchsia-500/40 hover:shadow-glow transition-all duration-300 flex flex-col justify-between"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="glow" className="capitalize">
                    {evt.event_type}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {evt.target_date}
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-fuchsia-300 transition-colors">
                  {evt.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {evt.theme_description || "A personalized event planned with VibeCraft."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-pink-400" />
                    {evt.guest_count} Guests
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(evt.total_budget, evt.currency)}
                  </span>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/events/${evt.id}`}
                    onClick={() => setCurrentEventId(evt.id)}
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Pillar Deep Dives */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="glow" className="mb-3">
            Core Modules
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Engineered for Flawless Execution
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            No spreadsheets, no fragmented chat threads. Everything your team needs in one intelligent console.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">GenAI Concept Studio</CardTitle>
              <CardDescription>
                Personalized color palettes, sensory themes, signature drink recipes, and guest surprise activities generated on demand.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                <PieChart className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Smart Budget Optimizer</CardTitle>
              <CardDescription>
                Real-time financial allocation by category with automated overspend alerts and vendor payment milestone tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-2">
                <Clock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Dynamic Run-of-Show</CardTitle>
              <CardDescription>
                Hour-by-hour day-of schedules reverse-engineered from your event start time with contingency weather buffers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Vendor CRM & RFPs</CardTitle>
              <CardDescription>
                Pre-built negotiation questions, contract status pipelines, and customized checklists for caterers, DJs, and venues.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Senior Developer Technical Architecture Callout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl">
            <Badge variant="glow" className="mb-3">
              Developer Architecture
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Enterprise Full-Stack Architecture
            </h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Designed with strict software engineering principles: Next.js 14 App Router, Supabase PostgreSQL with
              Row-Level Security (RLS), JWT session cookies, and Google Gemini generative models.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 font-mono">
                PostgreSQL + RLS
              </span>
              <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 font-mono">
                JWT Auth
              </span>
              <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 font-mono">
                Next.js 14 SSR
              </span>
              <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 font-mono">
                Gemini 1.5 Flash
              </span>
              <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 font-mono">
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
