-- ==========================================
-- 0004_wallet_extensions.sql
-- Extends travel_documents for file uploads (image/pdf),
-- expiry date, and boarding_passes table for full pass flow.
-- ==========================================

-- ── Extend travel_documents ───────────────────────────────────────────────────
ALTER TABLE travel_documents
  ADD COLUMN IF NOT EXISTS file_type  TEXT CHECK (file_type IN ('image', 'pdf')),
  ADD COLUMN IF NOT EXISTS expiry     DATE,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- ── Boarding passes table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS boarding_passes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  from_code   TEXT NOT NULL,
  from_city   TEXT NOT NULL,
  to_code     TEXT NOT NULL,
  to_city     TEXT NOT NULL,
  flight      TEXT NOT NULL,
  gate        TEXT,
  seat        TEXT,
  class       TEXT DEFAULT 'Economy',
  duration    TEXT,
  travel_date DATE,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  qr_data     TEXT, -- raw scan payload if scanned
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE boarding_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boarding passes"
  ON boarding_passes FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_boarding_passes_user_status
  ON boarding_passes(user_id, status);

-- ── Storage bucket for document files ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );