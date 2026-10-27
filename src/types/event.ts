export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate' | 'other';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid_in_full';

export type VendorStatus = 'prospect' | 'contacted' | 'quoted' | 'booked' | 'declined';

export interface EventItem {
  id: string;
  user_id?: string;
  title: string;
  event_type: EventType;
  target_date: string;
  location: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  theme_description: string;
  created_at: string;
  updated_at?: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  item_name: string;
  allocated_amount: number;
  actual_amount: number;
  payment_status: PaymentStatus;
  due_date?: string;
  notes?: string;
}

export interface TimelineMilestone {
  id: string;
  event_id: string;
  phase: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  is_completed: boolean;
  order_index: number;
}

export interface VendorTask {
  id: string;
  event_id: string;
  category: string;
  vendor_name: string;
  contact_email?: string;
  contact_phone?: string;
  contract_status: VendorStatus;
  estimated_cost?: number;
  checklist_tasks: { id: string; text: string; done: boolean }[];
  notes?: string;
}

export interface EventIdea {
  id: string;
  title: string;
  description: string;
  category: 'decor' | 'entertainment' | 'food' | 'activity' | 'favors';
  aesthetic_keywords: string[];
  estimated_impact: 'High' | 'Medium' | 'Delight';
}

export interface GeneratedPlan {
  theme_name: string;
  vibe_summary: string;
  color_palette: { name: string; hex: string }[];
  budget_breakdown: { category: string; percentage: number; recommended_amount: number; tips: string }[];
  timeline_phases: { phase: string; title: string; description: string; target_timeframe: string }[];
  vendor_checklists: { category: string; key_questions_to_ask: string[]; recommended_actions: string[] }[];
  creative_ideas: EventIdea[];
}
