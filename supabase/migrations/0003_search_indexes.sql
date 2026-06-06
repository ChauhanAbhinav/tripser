-- ==========================================
-- 0003_search_indexes.sql
-- Search optimization for the advanced search bar.
-- No schema changes — existing places table handles all
-- categories via the `category` column:
--   attraction | restaurant | stay | hidden_gem | activity
-- ==========================================

-- ── Full-text search column ────────────────────────────────────────────────
ALTER TABLE places ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

UPDATE places
SET search_vector = to_tsvector('english',
  coalesce(name, '') || ' ' ||
  coalesce(city, '') || ' ' ||
  coalesce(country, '') || ' ' ||
  coalesce(location, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(array_to_string(tags, ' '), '') || ' ' ||
  coalesce(array_to_string(vibes, ' '), '') || ' ' ||
  coalesce(sub_category, '')
);

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_places_search_vector
  ON places USING GIN(search_vector);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION places_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.city, '') || ' ' ||
    coalesce(NEW.country, '') || ' ' ||
    coalesce(NEW.location, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.vibes, ' '), '') || ' ' ||
    coalesce(NEW.sub_category, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS places_search_vector_trigger ON places;
CREATE TRIGGER places_search_vector_trigger
  BEFORE INSERT OR UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION places_search_vector_update();

-- ── Additional performance indexes ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_places_city_country
  ON places(city, country)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_places_category_active
  ON places(category, popularity_score DESC)
  WHERE is_active = true;

-- Trigram extension must exist before the index that uses it
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_places_name_trgm
  ON places USING GIN(name gin_trgm_ops);

-- ── Unified search RPC ────────────────────────────────────────────────────────
-- Called by Home.tsx / Discovery.tsx for the advanced search dropdown.
-- Groups results by category, returns up to `max_per_category` per group.
CREATE OR REPLACE FUNCTION search_places(
  p_query       TEXT    DEFAULT '',
  p_category    TEXT    DEFAULT '',
  p_limit       INTEGER DEFAULT 12
)
RETURNS TABLE (
  id              INTEGER,
  name            TEXT,
  slug            TEXT,
  category        TEXT,
  sub_category    TEXT,
  city            TEXT,
  country         TEXT,
  location        TEXT,
  description     TEXT,
  image_url       TEXT,
  avg_cost_pp     NUMERIC,
  popularity_score NUMERIC,
  safety_score    NUMERIC,
  tags            TEXT[],
  rank            REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.name, p.slug, p.category, p.sub_category,
    p.city, p.country, p.location, p.description,
    p.image_url, p.avg_cost_pp, p.popularity_score,
    p.safety_score, p.tags,
    CASE
      WHEN p_query = '' THEN p.popularity_score::REAL
      ELSE ts_rank(p.search_vector, plainto_tsquery('english', p_query))
    END AS rank
  FROM places p
  WHERE
    p.is_active = true
    AND (p_category = '' OR p.category = p_category)
    AND (
      p_query = ''
      OR p.search_vector @@ plainto_tsquery('english', p_query)
      OR p.name ILIKE '%' || p_query || '%'
      OR p.city ILIKE '%' || p_query || '%'
      OR p.country ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, p.popularity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant anon/authenticated access
GRANT EXECUTE ON FUNCTION search_places(TEXT, TEXT, INTEGER) TO anon, authenticated;

-- ── RLS: ensure place_stats is public ─────────────────────────────────────────
ALTER TABLE place_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Place stats are viewable by everyone" ON place_stats;
CREATE POLICY "Place stats are viewable by everyone"
  ON place_stats FOR SELECT USING (true);

-- ── live_vibes RLS (was missing) ─────────────────────────────────────────────
ALTER TABLE live_vibes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Live vibes are viewable by everyone" ON live_vibes;
CREATE POLICY "Live vibes are viewable by everyone"
  ON live_vibes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create live vibes" ON live_vibes;
CREATE POLICY "Authenticated users can create live vibes"
  ON live_vibes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);