"use client";

import Link from "next/link";
import { Sparkles, Calendar, PlusCircle, ShieldCheck, Database, Menu, X } from "lucide-react";
import { useEventContext } from "@/context/EventContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function Navbar() {
  const { currentEvent, events, setCurrentEventId, isDemoMode } = useEventContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-amber-500 shadow-glow transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Vibe<span className="text-gradient">Craft</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">
                AI Event Architect
              </span>
            </div>
          </Link>

          {/* Event Switcher */}
          {events.length > 0 && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
              <Calendar className="h-4 w-4 text-slate-400" />
              <select
                aria-label="Active Event Selection"
                value={currentEvent?.id || ""}
                onChange={(e) => setCurrentEventId(e.target.value)}
                className="bg-slate-900/90 text-xs text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 max-w-[200px] truncate"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>

          {currentEvent && (
            <Link
              href={`/events/${currentEvent.id}`}
              className="text-sm font-medium text-slate-300 hover:text-fuchsia-400 transition-colors"
            >
              Current Event
            </Link>
          )}

          <Link href="/dashboard/new">
            <Button variant="glow" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Event Wizard</span>
            </Button>
          </Link>

          {/* Database indicator */}
          <div className="flex items-center pl-2">
            {isDemoMode ? (
              <Badge variant="warning" className="gap-1">
                <Database className="h-3 w-3" />
                <span>Demo Mode</span>
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Supabase Live</span>
              </Badge>
            )}
          </div>

          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 py-1"
          >
            Dashboard
          </Link>
          {currentEvent && (
            <Link
              href={`/events/${currentEvent.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-fuchsia-400 py-1"
            >
              Current Event: {currentEvent.title}
            </Link>
          )}
          <Link
            href="/dashboard/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1"
          >
            <Button variant="glow" size="sm" className="w-full">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI Event Wizard
            </Button>
          </Link>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">
              {isDemoMode ? "Active: Local Demo Storage" : "Active: Supabase Cloud"}
            </span>
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
