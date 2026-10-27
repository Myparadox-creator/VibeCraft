-- VibeCraft: GenAI-Powered Event Planning Assistant Schema
-- Execute in Supabase SQL Editor

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('wedding', 'birthday', 'community', 'corporate', 'other')),
  target_date DATE NOT NULL,
  location TEXT,
  guest_count INTEGER DEFAULT 0 NOT NULL,
  total_budget NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  theme_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. BUDGET ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  allocated_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  actual_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid_in_full')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. TIMELINE MILESTONES TABLE
CREATE TABLE IF NOT EXISTS public.timeline_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. VENDORS & TASKS TABLE
CREATE TABLE IF NOT EXISTS public.vendors_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  contract_status TEXT DEFAULT 'prospect' CHECK (contract_status IN ('prospect', 'contacted', 'quoted', 'booked', 'declined')),
  checklist_tasks JSONB DEFAULT '[]'::jsonb NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. AI GENERATION LOGS
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PROFILES
CREATE POLICY "Users can read and update own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- POLICIES FOR EVENTS
CREATE POLICY "Users can manage own events"
  ON public.events FOR ALL
  USING (auth.uid() = user_id);

-- POLICIES FOR BUDGET ITEMS
CREATE POLICY "Users can manage budget items through their events"
  ON public.budget_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = budget_items.event_id AND events.user_id = auth.uid()));

-- POLICIES FOR TIMELINE MILESTONES
CREATE POLICY "Users can manage milestones through their events"
  ON public.timeline_milestones FOR ALL
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = timeline_milestones.event_id AND events.user_id = auth.uid()));

-- POLICIES FOR VENDORS & TASKS
CREATE POLICY "Users can manage vendors through their events"
  ON public.vendors_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = vendors_tasks.event_id AND events.user_id = auth.uid()));

-- POLICIES FOR AI LOGS
CREATE POLICY "Users can view AI logs for their events"
  ON public.ai_generation_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = ai_generation_logs.event_id AND events.user_id = auth.uid()));

-- TRIGGER TO AUTOMATICALLY CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
