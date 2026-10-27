"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  PieChart,
  Clock,
  CheckSquare,
  Sparkles,
  LayoutDashboard,
  BotMessageSquare,
} from "lucide-react";
import { EventItem } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, calculateDaysRemaining } from "@/lib/utils";

interface EventHeaderProps {
  event: EventItem;
  onOpenAIChat?: () => void;
}

export function EventHeader({ event, onOpenAIChat }: EventHeaderProps) {
  const pathname = usePathname();
  const countdown = calculateDaysRemaining(event.target_date);

  const tabs = [
    { label: "Overview", href: `/events/${event.id}`, icon: LayoutDashboard },
    { label: "Budget & Expenses", href: `/events/${event.id}/budget`, icon: PieChart },
    { label: "Timeline & Milestones", href: `/events/${event.id}/timeline`, icon: Clock },
    { label: "Vendors & Checklist", href: `/events/${event.id}/vendors`, icon: CheckSquare },
    { label: "AI Concept Studio", href: `/events/${event.id}/ideas`, icon: Sparkles },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/40 pt-6 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Info Banner */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="glow" className="capitalize">
                {event.event_type}
              </Badge>
              <Badge
                variant={countdown.isPast ? "secondary" : "warning"}
                className="gap-1 font-mono font-semibold"
              >
                <Calendar className="h-3 w-3" />
                {countdown.label}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-fuchsia-400" />
                {formatDate(event.target_date)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  {event.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-pink-400" />
                {event.guest_count} Guests
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Budget: {formatCurrency(event.total_budget, event.currency)}
              </span>
            </div>
          </div>

          {/* Quick AI Trigger */}
          {onOpenAIChat && (
            <div className="flex items-center gap-3">
              <Button onClick={onOpenAIChat} variant="glow" size="sm" className="gap-2 shadow-glow">
                <BotMessageSquare className="h-4 w-4" />
                <span>Ask AI Co-Pilot</span>
              </Button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto space-x-1 border-t border-slate-800/80 pt-2 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/5 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-fuchsia-400" : "text-slate-400"}`} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
