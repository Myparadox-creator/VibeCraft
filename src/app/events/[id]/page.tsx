"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  PieChart,
  Clock,
  CheckSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Users,
} from "lucide-react";
import { useEventContext } from "@/context/EventContext";
import { EventHeader } from "@/components/navigation/EventHeader";
import { AICoPilotDrawer } from "@/components/ai/AICoPilotDrawer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, calculateBudgetMetrics, calculateDaysRemaining } from "@/lib/utils";

export default function EventOverviewPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { events, currentEvent, setCurrentEventId, budgetItems, milestones, vendors } = useEventContext();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    if (eventId && currentEvent?.id !== eventId) {
      setCurrentEventId(eventId);
    }
  }, [eventId, currentEvent?.id, setCurrentEventId]);

  const event = events.find((e) => e.id === eventId) || currentEvent;

  if (!event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400">Loading event workspace...</p>
        </div>
      </div>
    );
  }

  const { allocated, actual, remaining, percentageSpent, isOverBudget } = calculateBudgetMetrics(
    budgetItems,
    event.total_budget
  );

  const countdown = calculateDaysRemaining(event.target_date);
  const completedMilestones = milestones.filter((m) => m.is_completed).length;
  const bookedVendors = vendors.filter((v) => v.contract_status === "booked").length;

  return (
    <div>
      <EventHeader event={event} onOpenAIChat={() => setIsAIChatOpen(true)} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Countdown</p>
                  <p className="text-2xl font-bold text-white mt-1">{countdown.label}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Target: {formatDate(event.target_date)}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Budget Spent</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {formatCurrency(actual, event.currency)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <Progress value={percentageSpent} />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{percentageSpent}% of total</span>
                  <span>{formatCurrency(remaining, event.currency)} left</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Milestones</p>
                  <p className="text-2xl font-bold text-fuchsia-400 mt-1">
                    {completedMilestones} / {milestones.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {milestones.length > 0
                  ? `${Math.round((completedMilestones / milestones.length) * 100)}% completed`
                  : "No milestones yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Booked Vendors</p>
                  <p className="text-2xl font-bold text-pink-400 mt-1">
                    {bookedVendors} / {vendors.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <CheckSquare className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {vendors.filter((v) => v.contract_status === "quoted").length} awaiting quotes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Theme & Concept Highlight */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <Badge variant="glow" className="mb-1">
                    Design & Aesthetic
                  </Badge>
                  <CardTitle className="text-lg">Event Vision & Mood</CardTitle>
                </div>
                <Link href={`/events/${event.id}/ideas`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-fuchsia-400 text-xs">
                    <span>Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {event.theme_description ||
                    "No description provided. Use the AI Concept Studio to generate tailored palettes, decor themes, and sensory guest moments."}
                </p>
              </CardContent>
            </Card>

            {/* Upcoming Milestones */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Next Run-of-Show Milestones</CardTitle>
                  <CardDescription className="text-xs">Immediate tasks to keep on schedule</CardDescription>
                </div>
                <Link href={`/events/${event.id}/timeline`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-fuchsia-400 text-xs">
                    <span>Full Schedule</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {milestones.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No milestones scheduled.</p>
                ) : (
                  milestones.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            m.is_completed
                              ? "border-emerald-500 bg-emerald-500 text-slate-950"
                              : "border-slate-600"
                          }`}
                        >
                          {m.is_completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              m.is_completed ? "line-through text-slate-500" : "text-white"
                            }`}
                          >
                            {m.title}
                          </p>
                          <span className="text-[10px] text-slate-400">{m.phase}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {m.is_completed ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Financial Health Mini-Card */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Budget Breakdown</CardTitle>
                <Link href={`/events/${event.id}/budget`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-fuchsia-400 text-xs">
                    <span>Ledger</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {budgetItems.slice(0, 4).map((b) => (
                    <div key={b.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 truncate max-w-[140px]">{b.category}</span>
                      <span className="font-semibold text-slate-100">
                        {formatCurrency(b.actual_amount || b.allocated_amount, event.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Total Budget:</span>
                  <span className="text-emerald-400">
                    {formatCurrency(event.total_budget, event.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Pipeline Snapshot */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Vendor Pipeline</CardTitle>
                <Link href={`/events/${event.id}/vendors`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-fuchsia-400 text-xs">
                    <span>Manage</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {vendors.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between items-center p-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{v.vendor_name}</p>
                      <p className="text-[10px] text-slate-400">{v.category}</p>
                    </div>
                    <Badge
                      variant={
                        v.contract_status === "booked"
                          ? "success"
                          : v.contract_status === "quoted"
                          ? "warning"
                          : "secondary"
                      }
                      className="capitalize text-[10px]"
                    >
                      {v.contract_status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
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
