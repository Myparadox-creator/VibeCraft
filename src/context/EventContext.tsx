"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
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
  user: User | null;
  session: Session | null;
  isAuthenticating: boolean;
  signOut: () => Promise<void>;
  events: EventItem[];
  currentEvent: EventItem | null;
  budgetItems: BudgetItem[];
  milestones: TimelineMilestone[];
  vendors: VendorTask[];
  isLoading: boolean;
  setCurrentEventId: (id: string) => void;
  createEventWithPlan: (event: Omit<EventItem, "id" | "created_at">, plan?: GeneratedPlan) => Promise<string>;
  addBudgetItem: (item: Omit<BudgetItem, "id" | "event_id">) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
  toggleMilestone: (id: string) => Promise<void>;
  addMilestone: (milestone: Omit<TimelineMilestone, "id" | "event_id">) => Promise<void>;
  updateVendorStatus: (id: string, status: VendorTask["contract_status"]) => Promise<void>;
  toggleVendorTask: (vendorId: string, taskId: string) => Promise<void>;
  addVendor: (vendor: Omit<VendorTask, "id" | "event_id">) => Promise<void>;
  isDemoMode: boolean;
  recheckSupabaseConfig: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [vendors, setVendors] = useState<VendorTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Re-check Supabase configuration state
  const recheckSupabaseConfig = useCallback(() => {
    const configured = isSupabaseConfigured();
    setIsDemoMode(!configured);
  }, []);

  // 1. Initialize Supabase Auth Listener
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsDemoMode(!configured);

    if (configured) {
      try {
        const supabase: any = createClient();
        // Check current active session
        supabase.auth.getSession().then(({ data: { session } }: any) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticating(false);
        });

        // Listen for auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticating(false);
        });

        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Supabase client init error:", err);
        setIsAuthenticating(false);
      }
    } else {
      setIsAuthenticating(false);
    }
  }, []);

  // 2. Fetch Data (from Supabase if configured & user logged in, otherwise localStorage/mock)
  const fetchEventDetails = useCallback(async (eventId: string, supabaseClient?: any) => {
    if (supabaseClient) {
      try {
        const [bRes, mRes, vRes] = await Promise.all([
          supabaseClient.from("budget_items").select("*").eq("event_id", eventId),
          supabaseClient.from("timeline_milestones").select("*").eq("event_id", eventId).order("order_index", { ascending: true }),
          supabaseClient.from("vendors_tasks").select("*").eq("event_id", eventId),
        ]);

        if (bRes.data) setBudgetItems(bRes.data);
        if (mRes.data) setMilestones(mRes.data);
        if (vRes.data) {
          const formatted = vRes.data.map((item: any) => ({
            ...item,
            checklist_tasks: Array.isArray(item.checklist_tasks) ? item.checklist_tasks : [],
          }));
          setVendors(formatted);
        }
      } catch (err) {
        console.error("Error fetching event details from Supabase:", err);
      }
    } else {
      // Local demo storage fallback
      if (typeof window !== "undefined") {
        const storedBudget = localStorage.getItem("vibecraft_budget");
        const storedTimeline = localStorage.getItem("vibecraft_timeline");
        const storedVendors = localStorage.getItem("vibecraft_vendors");

        const allBudgets = storedBudget ? JSON.parse(storedBudget) : MOCK_BUDGET_ITEMS;
        const allTimeline = storedTimeline ? JSON.parse(storedTimeline) : MOCK_TIMELINE;
        const allVendors = storedVendors ? JSON.parse(storedVendors) : MOCK_VENDORS;

        setBudgetItems(allBudgets[eventId] || []);
        setMilestones(allTimeline[eventId] || []);
        setVendors(allVendors[eventId] || []);
      }
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const configured = isSupabaseConfigured();

      if (configured && user) {
        try {
          const supabase: any = createClient();
          const { data: userEvents, error } = await supabase
            .from("events")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && userEvents && userEvents.length > 0) {
            setEvents(userEvents as any);
            const first = userEvents[0] as any;
            setCurrentEvent(first);
            await fetchEventDetails(first.id, supabase);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Supabase live load error:", err);
        }
      }

      // Demo/Fallback Mode
      if (typeof window !== "undefined") {
        try {
          const storedEvents = localStorage.getItem("vibecraft_events");
          const initialEvents: EventItem[] = storedEvents ? JSON.parse(storedEvents) : MOCK_EVENTS;
          setEvents(initialEvents);

          const initialEvent = initialEvents[0] || null;
          setCurrentEvent(initialEvent);

          if (initialEvent) {
            await fetchEventDetails(initialEvent.id);
          }
        } catch (e) {
          console.error("Local storage load error:", e);
          setEvents(MOCK_EVENTS);
          setCurrentEvent(MOCK_EVENTS[0]);
        }
      }
      setIsLoading(false);
    };

    if (!isAuthenticating) {
      loadInitialData();
    }
  }, [user, isAuthenticating, fetchEventDetails]);

  const setCurrentEventId = (id: string) => {
    const evt = events.find((e) => e.id === id);
    if (!evt) return;
    setCurrentEvent(evt);

    if (isSupabaseConfigured() && user) {
      const supabase: any = createClient();
      fetchEventDetails(id, supabase);
    } else {
      fetchEventDetails(id);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase: any = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const createEventWithPlan = async (
    eventData: Omit<EventItem, "id" | "created_at">,
    plan?: GeneratedPlan
  ): Promise<string> => {
    const configured = isSupabaseConfigured();

    // LIVE SUPABASE INSERTION
    if (configured && user) {
      try {
        const supabase: any = createClient();
        const { data: newEvt, error: evtErr } = await supabase
          .from("events")
          .insert({
            user_id: user.id,
            title: eventData.title,
            event_type: eventData.event_type,
            target_date: eventData.target_date,
            location: eventData.location,
            guest_count: Number(eventData.guest_count),
            total_budget: Number(eventData.total_budget),
            currency: eventData.currency || "USD",
            theme_description: eventData.theme_description,
          })
          .select()
          .single();

        if (evtErr) throw evtErr;

        const eventId = newEvt.id;

        // Insert initial budget items
        if (plan?.budget_breakdown && plan.budget_breakdown.length > 0) {
          const budgetInserts = plan.budget_breakdown.map((b) => ({
            event_id: eventId,
            category: b.category,
            item_name: `${b.category} Core Allocation`,
            allocated_amount: b.recommended_amount,
            actual_amount: 0,
            payment_status: "unpaid",
            notes: b.tips,
          }));
          await supabase.from("budget_items").insert(budgetInserts);
        }

        // Insert timeline milestones
        if (plan?.timeline_phases && plan.timeline_phases.length > 0) {
          const timelineInserts = plan.timeline_phases.map((p, idx) => ({
            event_id: eventId,
            phase: p.phase,
            title: p.title,
            description: p.description,
            is_completed: false,
            order_index: idx + 1,
          }));
          await supabase.from("timeline_milestones").insert(timelineInserts);
        }

        // Insert vendors
        if (plan?.vendor_checklists && plan.vendor_checklists.length > 0) {
          const vendorInserts = plan.vendor_checklists.map((v, idx) => ({
            event_id: eventId,
            category: v.category,
            vendor_name: `${v.category} Specialist`,
            contract_status: "prospect",
            checklist_tasks: v.key_questions_to_ask.map((q, qIdx) => ({
              id: `vt-${idx}-${qIdx}`,
              text: q,
              done: false,
            })),
          }));
          await supabase.from("vendors_tasks").insert(vendorInserts);
        }

        setEvents([newEvt as any, ...events]);
        setCurrentEvent(newEvt as any);
        await fetchEventDetails(eventId, supabase);

        return eventId;
      } catch (err) {
        console.error("Error creating event in Supabase, falling back to local:", err);
      }
    }

    // LOCAL STORAGE FALLBACK
    const newId = `evt-${Date.now()}`;
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    setCurrentEvent(newEvent);

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
      : [];

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
      : [];

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

    if (typeof window !== "undefined") {
      localStorage.setItem("vibecraft_events", JSON.stringify(updatedEvents));
      const allBudgets = JSON.parse(localStorage.getItem("vibecraft_budget") || "{}");
      allBudgets[newId] = initialBudgets;
      localStorage.setItem("vibecraft_budget", JSON.stringify(allBudgets));

      const allTimeline = JSON.parse(localStorage.getItem("vibecraft_timeline") || "{}");
      allTimeline[newId] = initialMilestones;
      localStorage.setItem("vibecraft_timeline", JSON.stringify(allTimeline));

      const allVendors = JSON.parse(localStorage.getItem("vibecraft_vendors") || "{}");
      allVendors[newId] = initialVendors;
      localStorage.setItem("vibecraft_vendors", JSON.stringify(allVendors));
    }

    return newId;
  };

  const addBudgetItem = async (item: Omit<BudgetItem, "id" | "event_id">) => {
    if (!currentEvent) return;

    if (isSupabaseConfigured() && user) {
      try {
        const supabase: any = createClient();
        const { data, error } = await supabase
          .from("budget_items")
          .insert({
            event_id: currentEvent.id,
            category: item.category,
            item_name: item.item_name,
            allocated_amount: item.allocated_amount,
            actual_amount: item.actual_amount,
            payment_status: item.payment_status,
            notes: item.notes,
          })
          .select()
          .single();

        if (!error && data) {
          setBudgetItems([...budgetItems, data as any]);
          return;
        }
      } catch (err) {
        console.error("Supabase budget insert error:", err);
      }
    }

    // Local fallback
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

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    if (!currentEvent) return;

    if (isSupabaseConfigured() && user) {
      try {
        const supabase: any = createClient();
        await supabase.from("budget_items").update(updates as any).eq("id", id);
      } catch (err) {
        console.error("Supabase budget update error:", err);
      }
    }

    const updated = budgetItems.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setBudgetItems(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_budget");
      const all = stored ? JSON.parse(stored) : { ...MOCK_BUDGET_ITEMS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_budget", JSON.stringify(all));
    }
  };

  const deleteBudgetItem = async (id: string) => {
    if (!currentEvent) return;

    if (isSupabaseConfigured() && user) {
      try {
        const supabase: any = createClient();
        await supabase.from("budget_items").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase budget delete error:", err);
      }
    }

    const updated = budgetItems.filter((item) => item.id !== id);
    setBudgetItems(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_budget");
      const all = stored ? JSON.parse(stored) : { ...MOCK_BUDGET_ITEMS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_budget", JSON.stringify(all));
    }
  };

  const toggleMilestone = async (id: string) => {
    if (!currentEvent) return;
    const target = milestones.find((m) => m.id === id);
    if (!target) return;
    const nextState = !target.is_completed;

    if (isSupabaseConfigured() && user) {
      try {
        const supabase: any = createClient();
        await supabase.from("timeline_milestones").update({ is_completed: nextState }).eq("id", id);
      } catch (err) {
        console.error("Supabase milestone toggle error:", err);
      }
    }

    const updated = milestones.map((m) => (m.id === id ? { ...m, is_completed: nextState } : m));
    setMilestones(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_timeline");
      const all = stored ? JSON.parse(stored) : { ...MOCK_TIMELINE };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_timeline", JSON.stringify(all));
    }
  };

  const addMilestone = async (milestone: Omit<TimelineMilestone, "id" | "event_id">) => {
    if (!currentEvent) return;

    if (isSupabaseConfigured() && user) {
      try {
        const supabase: any = createClient();
        const { data, error } = await supabase
          .from("timeline_milestones")
          .insert({
            event_id: currentEvent.id,
            phase: milestone.phase,
            title: milestone.title,
            description: milestone.description,
            is_completed: false,
            order_index: milestones.length + 1,
          })
          .select()
          .single();

        if (!error && data) {
          setMilestones([...milestones, data as any]);
          return;
        }
      } catch (err) {
        console.error("Supabase milestone add error:", err);
      }
    }

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

  const updateVendorStatus = async (id: string, status: VendorTask["contract_status"]) => {
    if (!currentEvent) return;

    if (isSupabaseConfigured() && user) {
      try {
        const supabase: any = createClient();
        await supabase.from("vendors_tasks").update({ contract_status: status }).eq("id", id);
      } catch (err) {
        console.error("Supabase vendor status update error:", err);
      }
    }

    const updated = vendors.map((v) => (v.id === id ? { ...v, contract_status: status } : v));
    setVendors(updated);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_vendors");
      const all = stored ? JSON.parse(stored) : { ...MOCK_VENDORS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_vendors", JSON.stringify(all));
    }
  };

  const toggleVendorTask = async (vendorId: string, taskId: string) => {
    if (!currentEvent) return;

    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        const tasks = v.checklist_tasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        );
        return { ...v, checklist_tasks: tasks };
      }
      return v;
    });
    setVendors(updated);

    if (isSupabaseConfigured() && user) {
      try {
        const targetVendor = updated.find((v) => v.id === vendorId);
        if (targetVendor) {
          const supabase: any = createClient();
          await supabase
            .from("vendors_tasks")
            .update({ checklist_tasks: targetVendor.checklist_tasks as any })
            .eq("id", vendorId);
        }
      } catch (err) {
        console.error("Supabase toggle task error:", err);
      }
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibecraft_vendors");
      const all = stored ? JSON.parse(stored) : { ...MOCK_VENDORS };
      all[currentEvent.id] = updated;
      localStorage.setItem("vibecraft_vendors", JSON.stringify(all));
    }
  };

  const addVendor = async (vendor: Omit<VendorTask, "id" | "event_id">) => {
    if (!currentEvent) return;

    if (isSupabaseConfigured() && user) {
      try {
        const supabase: any = createClient();
        const { data, error } = await supabase
          .from("vendors_tasks")
          .insert({
            event_id: currentEvent.id,
            category: vendor.category,
            vendor_name: vendor.vendor_name,
            contact_email: vendor.contact_email,
            contact_phone: vendor.contact_phone,
            contract_status: vendor.contract_status,
            checklist_tasks: vendor.checklist_tasks as any,
            notes: vendor.notes,
          })
          .select()
          .single();

        if (!error && data) {
          setVendors([...vendors, { ...data, checklist_tasks: vendor.checklist_tasks } as any]);
          return;
        }
      } catch (err) {
        console.error("Supabase vendor add error:", err);
      }
    }

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
        user,
        session,
        isAuthenticating,
        signOut,
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
        recheckSupabaseConfig,
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
