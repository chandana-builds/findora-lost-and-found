-- ==============================================================================
-- FINDORA LOST & FOUND PLATFORM - COMPREHENSIVE PRODUCTION DATABASE SCHEMA
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ITEMS TABLE (Lost & Found reports)
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    report_type TEXT NOT NULL CHECK (report_type IN ('lost', 'found')),
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Electronics',
        'Documents & IDs',
        'Bags & Wallets',
        'Keys',
        'Clothing & Footwear',
        'Books & Stationery',
        'Jewelry & Accessories',
        'Medical & Health',
        'Other'
    )),
    description TEXT NOT NULL,
    identifying_features TEXT,
    color TEXT,
    brand TEXT,
    event_date DATE NOT NULL,
    location TEXT NOT NULL,
    organization_type TEXT NOT NULL CHECK (organization_type IN (
        'College / University',
        'School',
        'Hospital / Healthcare',
        'Office / Corporate',
        'Shopping Mall',
        'Library',
        'Public Transit / Station',
        'Public Park / Street',
        'Airport',
        'Other Location'
    )),
    image_path TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_claim', 'reunited', 'closed', 'withdrawn')),
    contact_preference TEXT DEFAULT 'in_app' CHECK (contact_preference IN ('in_app', 'email', 'phone')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_report_type ON public.items(report_type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_trgm_name ON public.items USING gin (item_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_items_trgm_desc ON public.items USING gin (description gin_trgm_ops);

-- 3. MATCHES TABLE (Pairwise algorithmic matches)
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    lost_item_id TEXT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    found_item_id TEXT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'potential' CHECK (status IN ('potential', 'dismissed', 'confirmed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_item_match UNIQUE (lost_item_id, found_item_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_lost ON public.matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found ON public.matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON public.matches(match_score DESC);

-- 4. CLAIM REQUESTS TABLE (Ownership verification)
CREATE TABLE IF NOT EXISTS public.claim_requests (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    claimant_name TEXT NOT NULL,
    claimant_email TEXT NOT NULL,
    message TEXT NOT NULL,
    private_verification_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_claims_item ON public.claim_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON public.claim_requests(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claim_requests(status);

-- 5. NOTIFICATIONS TABLE (In-app notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('match_found', 'claim_submitted', 'claim_status_updated', 'item_reunited', 'report_updated', 'system')),
    related_item_id TEXT,
    related_claim_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(recipient_id, is_read);

-- 6. ACTIVITY LOGS (Auditing)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Anyone can read basic public profile, users can update only their own
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Items: Anyone can view active reports (lost & found)
CREATE POLICY "Public items are viewable by everyone" 
ON public.items FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create items" 
ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items or admin" 
ON public.items FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own items or admin" 
ON public.items FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Matches: Viewable if user owns lost or found item, or is admin
CREATE POLICY "Users can view matches related to their items" 
ON public.matches FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.items i
        WHERE (i.id = matches.lost_item_id OR i.id = matches.found_item_id)
        AND (i.user_id = auth.uid() OR public.is_admin())
    )
);

-- Claim Requests: Only claimant, item finder, or admin can read claim details
CREATE POLICY "Claimant and item finder can view claim" 
ON public.claim_requests FOR SELECT USING (
    claimant_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.items i
        WHERE i.id = claim_requests.item_id AND i.user_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY "Authenticated users can submit claims" 
ON public.claim_requests FOR INSERT WITH CHECK (claimant_id = auth.uid());

CREATE POLICY "Finder or admin can update claim status" 
ON public.claim_requests FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.items i
        WHERE i.id = claim_requests.item_id AND i.user_id = auth.uid()
    )
    OR public.is_admin()
);

-- Notifications: Only recipient can see their notifications
CREATE POLICY "Users view only their notifications" 
ON public.notifications FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read" 
ON public.notifications FOR UPDATE USING (recipient_id = auth.uid());

-- Storage Bucket setup:
INSERT INTO storage.buckets (id, name, public)
VALUES ('findora-items', 'findora-items', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'findora-items');

CREATE POLICY "Authenticated users can upload item images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'findora-items' AND auth.role() = 'authenticated');
