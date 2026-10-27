"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Filter,
  Check,
  Circle,
  Flag,
} from "lucide-react";
import { useEventContext } from "@/context/EventContext";
import { EventHeader } from "@/components/navigation/EventHeader";
import { AICoPilotDrawer } from "@/components/ai/AICoPilotDrawer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function EventTimelinePage() {
  const params = useParams();
  const eventId = params.id as string;
  const { events, currentEvent, milestones, toggleMilestone, addMilestone } = useEventContext();

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // New milestone state
  const [newPhase, setNewPhase] = useState("Planning Milestones");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const event = events.find((e) => e.id === eventId) || currentEvent;

  if (!event) return null;

  const filteredMilestones = milestones.filter((m) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return m.is_completed;
    if (activeFilter === "pending") return !m.is_completed;
    if (activeFilter === "day_of") return m.phase.toLowerCase().includes("day-of");
    return true;
  });

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMilestone({
      phase: newPhase,
      title: newTitle,
      description: newDescription,
      is_completed: false,
      order_index: milestones.length + 1,
    });

    setNewTitle("");
    setNewDescription("");
    setIsAddModalOpen(false);
  };

  const completedCount = milestones.filter((m) => m.is_completed).length;

  return (
    <div>
      <EventHeader event={event} onOpenAIChat={() => setIsAIChatOpen(true)} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Timeline & Run-of-Show Engine
            </h2>
            <p className="text-sm text-slate-400">
              Manage countdown milestones, vendor arrival calls, and minute-by-minute execution.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} variant="glow" size="md" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Milestone</span>
            </Button>
          </div>
        </div>

        {/* Progress summary banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {completedCount} of {milestones.length} Milestones Completed
              </p>
              <p className="text-xs text-slate-400">
                {milestones.length > 0 && Math.round((completedCount / milestones.length) * 100)}% of the master roadmap achieved
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: "all", label: "All Items" },
              { id: "pending", label: "Pending" },
              { id: "completed", label: "Completed" },
              { id: "day_of", label: "Day-of Run of Show" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  activeFilter === f.id
                    ? "bg-fuchsia-600 text-white"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Timeline Track */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-6 my-6">
          {filteredMilestones.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-950/40">
              No milestones found for this filter.
            </div>
          ) : (
            filteredMilestones.map((m) => (
              <div key={m.id} className="relative group">
                {/* Node on vertical line */}
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className={`absolute -left-[31px] sm:-left-[39px] top-4 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    m.is_completed
                      ? "border-emerald-500 bg-emerald-500 text-slate-950 shadow-sm"
                      : "border-slate-600 bg-slate-900 group-hover:border-fuchsia-500 text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </button>

                {/* Milestone Card */}
                <div
                  onClick={() => toggleMilestone(m.id)}
                  className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                    m.is_completed
                      ? "border-slate-800/60 bg-slate-950/40 opacity-75"
                      : "border-slate-800 bg-slate-900/70 hover:border-fuchsia-500/40 hover:shadow-glow"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <Badge variant={m.is_completed ? "secondary" : "glow"} className="text-[10px]">
                      {m.phase}
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {m.is_completed ? "Completed" : "Action Required"}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-bold transition-colors ${
                      m.is_completed ? "line-through text-slate-500" : "text-white"
                    }`}
                  >
                    {m.title}
                  </h3>

                  {m.description && (
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Run-of-Show Milestone"
        description="Insert a target deadline or day-of agenda item into the chronological tracker."
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Phase / Stage</label>
            <select
              aria-label="Milestone Phase"
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="Planning Milestones">Planning Milestones (Months Out)</option>
              <option value="Final Month Countdown">Final Month Countdown</option>
              <option value="Day-of Run of Show">Day-of Run of Show (Minute-by-Minute)</option>
              <option value="Post-Event Wrapup">Post-Event Wrapup & Thank Yous</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Milestone Title</label>
            <Input
              required
              placeholder="e.g. 5:30 PM - Sunset First Dance & Golden Hour Toast"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Description / Logistical Notes</label>
            <Textarea
              placeholder="e.g. Ensure DJ cues song 'Beyond' and videographer is stationed at east terrace."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow">
              Add Milestone
            </Button>
          </div>
        </form>
      </Modal>

      <AICoPilotDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        event={event}
      />
    </div>
  );
}
