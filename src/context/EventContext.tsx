"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  EventItem,
  BudgetItem,
  TimelineMilestone,
  VendorTask,
  GeneratedPlan,
} from "@/types/event";
import {
  MOCK_EVENTS,
  MOCK_BUDGET_ITEMS,
  MOCK_TIMELINE,
  MOCK_VENDORS,
} from "@/lib/mock-data";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

interface EventContextType {
  events: EventItem[];
  currentEvent: EventItem | null;
  budgetItems: BudgetItem[];
  milestones: TimelineMilestone[];
  vendors: VendorTask[];
  isLoading: boolean;
  setCurrentEventId: (id: string) => void;
  createEventWithPlan: (event: Omit<EventItem, "id" | "created_at">, plan?: GeneratedPlan) => Promise<string>;
  addBudgetItem: (item: Omit<BudgetItem, "id" | "event_id">) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  toggleMilestone: (id: string) => void;
  addMilestone: (milestone: Omit<TimelineMilestone, "id" | "event_id">) => void;
  updateVendorStatus: (id: string, status: VendorTask["contract_status"]) => void;
  toggleVendorTask: (vendorId: string, taskId: string) => void;
  addVendor: (vendor: Omit<VendorTask, "id" | "event_id">) => void;
  isDemoMode: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [vendors, setVendors] = useState<VendorTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Initialize data from localStorage or mock
  useEffect(() => {
    const supabaseReady = isSupabaseConfigured();
    setIsDemoMode(!supabaseReady);

    if (typeof window !== "undefined") {
      try {
        const storedEvents = localStorage.getItem("vibecraft_events");
        const storedBudget = localStorage.getItem("vibecraft_budget");
        const storedTimeline = localStorage.getItem("vibecraft_timeline");
        const storedVendors = localStorage.getItem("vibecraft_vendors");

        const initialEvents: EventItem[] = storedEvents ? JSON.parse(storedEvents) : MOCK_EVENTS;
        setEvents(initialEvents);

        const initialEvent = initialEvents[0] || null;
        setCurrentEvent(initialEvent);

        if (initialEvent) {
          const allBudgets = storedBudget ? JSON.parse(storedBudget) : MOCK_BUDGET_ITEMS;
          const allTimeline = storedTimeline ? JSON.parse(storedTimeline) : MOCK_TIMELINE;
          const allVendors = storedVendors ? JSON.parse(storedVendors) : MOCK_VENDORS;

          setBudgetItems(allBudgets[initialEvent.id] || []);
          setMilestones(allTimeline[initialEvent.id] || []);
          setVendors(allVendors[initialEvent.id] || []);
        }
      } catch (e) {
        console.error("Local storage sync error:", e);
        setEvents(MOCK_EVENTS);
        setCurrentEvent(MOCK_EVENTS[0]);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const setCurrentEventId = (id: string) => {
    const evt = events.find((e) => e.id === id);
    if (!evt) return;
    setCurrentEvent(evt);

    if (typeof window !== "undefined") {
      const storedBudget = localStorage.getItem("vibecraft_budget");
      const storedTimeline = localStorage.getItem("vibecraft_timeline");
      const storedVendors = localStorage.getItem("vibecraft_vendors");

      const allBudgets = storedBudget ? JSON.parse(storedBudget) : MOCK_BUDGET_ITEMS;
      const allTimeline = storedTimeline ? JSON.parse(storedTimeline) : MOCK_TIMELINE;
      const allVendors = storedVendors ? JSON.parse(storedVendors) : MOCK_VENDORS;

      setBudgetItems(allBudgets[id] || []);
      setMilestones(allTimeline[id] || []);
      setVendors(allVendors[id] || []);
    }
  };

  const createEventWithPlan = async (
    eventData: Omit<EventItem, "id" | "created_at">,
    plan?: GeneratedPlan
  ): Promise<string> => {
    const newId = `evt-${Date.now()}`;
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    setCurrentEvent(newEvent);

    // Generate initial budget items from plan or defaults
    const initialBudgets: BudgetItem[] = plan
      ? plan.budget_breakdown.map((b, idx) => ({
          id: `b-${newId}-${idx}`,
          event_id: newId,
          category: b.category,
          item_name: `${b.category} Core Allocation`,
          allocated_amount: b.recommended_amount,
          actual_amount: 0,
          payment_status: "unpaid",
          notes: b.tips,
        }))
      : [
          {
            id: `b-${newId}-1`,
            event_id: newId,
            category: "Venue",
            item_name: "Venue Booking Deposit",
            allocated_amount: Math.round(eventData.total_budget * 0.4),
            actual_amount: 0,
            payment_status: "unpaid",
          },
        ];

    // Generate initial timeline
    const initialMilestones: TimelineMilestone[] = plan
      ? plan.timeline_phases.map((p, idx) => ({
          id: `t-${newId}-${idx}`,
          event_id: newId,
          phase: p.phase,
          title: p.title,
          description: p.description,
          is_completed: false,
          order_index: idx + 1,
        }))
      : [
          {
            id: `t-${newId}-1`,
            event_id: newId,
            phase: "Initial Planning",
            title: "Confirm Date & Budget",
            is_completed: true,
            order_index: 1,
          },
        ];

    // Generate initial vendors
    const initialVendors: VendorTask[] = plan
      ? plan.vendor_checklists.map((v, idx) => ({
          id: `v-${newId}-${idx}`,
          event_id: newId,
          category: v.category,
          vendor_name: `${v.category} Candidate`,
          contract_status: "prospect",
          checklist_tasks: v.key_questions_to_ask.map((q, qIdx) => ({
            id: `vt-${idx}-${qIdx}`,
            text: q,
            done: false,
          })),
        }))
      : [];

    setBudgetItems(initialBudgets);
    setMilestones(initialMilestones);
    setVendors(initialVendors);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("vibecraft_events", JSON.stringify(updatedEvents));

      const storedBudget = localStorage.getItem("vibecraft_budget");
      const allBudgets = storedBudget ? JSON.parse(storedBudget) : { ...MOCK_BUDGET_ITEMS };
      allBudgets[newId] = initialBudgets;
      localStorage.setItem("vibecraft_budget", JSON.stringify(allBudgets));

      const storedTimeline = localStorage.getItem("vibecraft_timeline");
      const allTimeline = storedTimeline ? JSON.parse(storedTimeline) : { ...MOCK_TIMELINE };
      allTimeline[newId] = initialMilestones;
      localStorage.setItem("vibecraft_timeline", JSON.stringify(allTimeline));

      const storedVendors = localStorage.getItem("vibecraft_vendors");
      const allVendors = storedVendors ? JSON.parse(storedVendors) : { ...MOCK_VENDORS };
      allVendors[newId] = initialVendors;
      localStorage.setItem("vibecraft_vendors", JSON.stringify(allVendors));
    }

    return newId;
  };

  const addBudgetItem = (item: Omit<BudgetItem, "id" | "event_id">) => {
    if (!currentEvent) return;
    const newItem: BudgetItem = {
      ...item,
      id: `b-${Date.now()}`,
      event_id: currentEvent.id,
    };
    const updated = [...budgetItems, newItem];
    setBudgetItems(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_budget");
      const all = stored ? JSON.parse(stored) : { ...MOCK_BUDGET_ITEMS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_budget", JSON.stringify(all));
    }
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    if (!currentEvent) return;
    const updated = budgetItems.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setBudgetItems(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_budget");
      const all = stored ? JSON.parse(stored) : { ...MOCK_BUDGET_ITEMS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_budget", JSON.stringify(all));
    }
  };

  const deleteBudgetItem = (id: string) => {
    if (!currentEvent) return;
    const updated = budgetItems.filter((item) => item.id !== id);
    setBudgetItems(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_budget");
      const all = stored ? JSON.parse(stored) : { ...MOCK_BUDGET_ITEMS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_budget", JSON.stringify(all));
    }
  };

  const toggleMilestone = (id: string) => {
    if (!currentEvent) return;
    const updated = milestones.map((m) =>
      m.id === id ? { ...m, is_completed: !m.is_completed } : m
    );
    setMilestones(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_timeline");
      const all = stored ? JSON.parse(stored) : { ...MOCK_TIMELINE };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_timeline", JSON.stringify(all));
    }
  };

  const addMilestone = (milestone: Omit<TimelineMilestone, "id" | "event_id">) => {
    if (!currentEvent) return;
    const newM: TimelineMilestone = {
      ...milestone,
      id: `t-${Date.now()}`,
      event_id: currentEvent.id,
    };
    const updated = [...milestones, newM];
    setMilestones(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_timeline");
      const all = stored ? JSON.parse(stored) : { ...MOCK_TIMELINE };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_timeline", JSON.stringify(all));
    }
  };

  const updateVendorStatus = (id: string, status: VendorTask["contract_status"]) => {
    if (!currentEvent) return;
    const updated = vendors.map((v) => (v.id === id ? { ...v, contract_status: status } : v));
    setVendors(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_vendors");
      const all = stored ? JSON.parse(stored) : { ...MOCK_VENDORS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_vendors", JSON.stringify(all));
    }
  };

  const toggleVendorTask = (vendorId: string, taskId: string) => {
    if (!currentEvent) return;
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        return {
          ...v,
          checklist_tasks: v.checklist_tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        };
      }
      return v;
    });
    setVendors(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_vendors");
      const all = stored ? JSON.parse(stored) : { ...MOCK_VENDORS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_vendors", JSON.stringify(all));
    }
  };

  const addVendor = (vendor: Omit<VendorTask, "id" | "event_id">) => {
    if (!currentEvent) return;
    const newV: VendorTask = {
      ...vendor,
      id: `v-${Date.now()}`,
      event_id: currentEvent.id,
    };
    const updated = [...vendors, newV];
    setVendors(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_vendors");
      const all = stored ? JSON.parse(stored) : { ...MOCK_VENDORS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_vendors", JSON.stringify(all));
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        currentEvent,
        budgetItems,
        milestones,
        vendors,
        isLoading,
        setCurrentEventId,
        createEventWithPlan,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        toggleMilestone,
        addMilestone,
        updateVendorStatus,
        toggleVendorTask,
        addVendor,
        isDemoMode,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
}
