"use client";

import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Users,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { useEventContext } from "@/context/EventContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, calculateDaysRemaining } from "@/lib/utils";
import { EventType } from "@/types/event";

export default function DashboardPage() {
  const { events, setCurrentEventId, budgetItems, milestones, vendors } = useEventContext();
  const [filterType, setFilterType] = useState<string>("all");

  const filteredEvents = events.filter((e) => {
    if (filterType === "all") return true;
    return e.event_type === filterType;
  });

  const totalBudgetManaged = events.reduce((sum, e) => sum + (Number(e.total_budget) || 0), 0);
  const totalGuests = events.reduce((sum, e) => sum + (Number(e.guest_count) || 0), 0);
  const completedMilestones = milestones.filter((m) => m.is_completed).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Event Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your weddings, birthdays, and community gatherings with AI-powered agility.
          </p>
        </div>

        <Link href="/dashboard/new">
          <Button variant="glow" size="md" className="gap-2 shadow-glow">
            <Sparkles className="h-4 w-4" />
            <span>Create Event with AI</span>
          </Button>
        </Link>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Events</p>
              <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Portfolio Budget</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(totalBudgetManaged)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total RSVP Count</p>
              <p className="text-2xl font-bold text-pink-400 mt-1">{totalGuests.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Completed Milestones</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{completedMilestones} Done</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="h-3.5 w-3.5" /> Filter:
        </span>
        {["all", "wedding", "birthday", "community", "corporate"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition-colors ${
              filterType === type
                ? "bg-fuchsia-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => {
          const countdown = calculateDaysRemaining(evt.target_date);

          return (
            <Card
              key={evt.id}
              className="border-slate-800/80 bg-slate-900/50 hover:border-fuchsia-500/40 hover:shadow-glow transition-all duration-300 flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="glow" className="capitalize text-[11px]">
                    {evt.event_type}
                  </Badge>
                  <Badge
                    variant={countdown.isPast ? "secondary" : "warning"}
                    className="font-mono text-[10px]"
                  >
                    {countdown.label}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold mt-2 text-white line-clamp-1">
                  {evt.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {evt.theme_description || "GenAI curated event architecture."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2 text-xs text-slate-300 border-y border-slate-800/60 py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-medium text-slate-200">{formatDate(evt.target_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium text-slate-200 truncate max-w-[180px]">
                      {evt.location || "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Budget:</span>
                    <span className="font-semibold text-emerald-400">
                      {formatCurrency(evt.total_budget, evt.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/events/${evt.id}`}
                    onClick={() => setCurrentEventId(evt.id)}
                    className="w-full"
                  >
                    <Button variant="glow" size="sm" className="w-full gap-1.5">
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty Add Card */}
        <Link
          href="/dashboard/new"
          className="border-2 border-dashed border-slate-800 hover:border-fuchsia-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center group transition-colors min-h-[260px] bg-slate-950/40"
        >
          <div className="h-12 w-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform mb-3 shadow-glow">
            <PlusCircle className="h-6 w-6" />
          </div>
          <h4 className="text-base font-semibold text-white group-hover:text-fuchsia-300 transition-colors">
            New Event Architecture
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            Input your vision and let Gemini AI formulate budgets, timelines, and checklists.
          </p>
        </Link>
      </div>
    </div>
  );
}
