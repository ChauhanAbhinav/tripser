-- ==========================================
-- supabase/seed.sql
-- Run: supabase db reset (applies migrations + this seed)
-- ==========================================

-- ==========================================
-- 1. PLACES
-- ==========================================

INSERT INTO places (name, location, description, image_url, price_range, safety_score, accessibility_score, sensory_score, tags) VALUES
  (
    'Kotor Old Town',
    'Montenegro',
    'A walled medieval city on the Adriatic coast, far less crowded than Dubrovnik. Cobblestone streets, cat cafes, and stunning bay views.',
    'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&auto=format',
    '$800 - $1,200',
    9.2, 7.5, 8.0,
    ARRAY['Hidden Gem', 'Safe', 'Historic']
  ),
  (
    'Matera',
    'Italy',
    'Ancient cave city (Sassi) carved into rock — one of the oldest continuously inhabited settlements on Earth. Eerily beautiful at night.',
    'https://images.unsplash.com/photo-1533421644343-45b606a69f48?w=800&auto=format',
    '$900 - $1,400',
    8.8, 6.5, 9.1,
    ARRAY['UNESCO', 'Quiet', 'Unique', 'Solo Friendly']
  ),
  (
    'Luang Prabang',
    'Laos',
    'Serene Buddhist temples, night markets, turquoise waterfalls, and monk alms-giving ceremonies. Minimal tourist crowds year-round.',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format',
    '$600 - $1,000',
    8.5, 7.0, 9.3,
    ARRAY['Spiritual', 'Budget', 'Nature', 'Solo Friendly']
  ),
  (
    'Gjirokastra',
    'Albania',
    'A UNESCO-listed Ottoman stone city perched in the mountains. Almost entirely undiscovered by mainstream tourism.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format',
    '$500 - $800',
    8.0, 6.0, 9.5,
    ARRAY['Hidden Gem', 'Historic', 'Budget']
  ),
  (
    'Chefchaouen',
    'Morocco',
    'The famous Blue City nestled in the Rif Mountains. Labyrinthine medina painted in every shade of blue — incredibly photogenic and calm.',
    'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&auto=format',
    '$700 - $1,100',
    8.3, 6.8, 8.7,
    ARRAY['Scenic', 'Culture', 'Photography', 'Women Friendly']
  ),
  (
    'Tbilisi Old Town',
    'Georgia',
    'Sulfur bathhouses, cliff-side churches, eclectic architecture mixing Persian, Russian, and European styles. Incredible food scene on a budget.',
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&auto=format',
    '$600 - $1,000',
    8.6, 7.2, 8.4,
    ARRAY['Hidden Gem', 'Foodie', 'Architecture', 'Budget']
  );

INSERT INTO place_hidden_gems (place_id, name, description, image_url, tags)
SELECT id, 'Quiet backstreet viewpoint', 'A calmer photo stop away from the main walking route.', image_url, ARRAY['Quiet', 'Viewpoint']
FROM places;

INSERT INTO place_things_to_do (place_id, name, description, image_url, category)
SELECT id, 'Slow local walk', 'A low-pressure route to understand the place before planning the rest of the day.', image_url, 'Walk'
FROM places;

INSERT INTO place_attractions (place_id, name, description, image_url, popularity_score)
SELECT id, name || ' main landmark', 'The most recognizable anchor point for first-time visitors.', image_url, 8.5
FROM places;

INSERT INTO place_faqs (place_id, question, answer, sort_order)
SELECT id, 'When should I visit?', 'Earlier in the day is usually calmer, cooler, and easier for photos.', 1
FROM places;

-- ==========================================
-- 2. LIVE VIBES (no user_id — public check-ins)
-- ==========================================
-- Note: user_id is nullable in RLS so anonymous vibes work for seeding

INSERT INTO live_vibes (user_id, location, safety_score, sensory_status, message, tags) VALUES
  (NULL, 'Kotor Old Town, Montenegro', 9.1, 'Calm', 'Wandering the walls at sunrise — completely empty, totally magical. Felt very safe as a solo woman.', ARRAY['Solo Female', 'Safe', 'Morning']),
  (NULL, 'Chefchaouen Medina, Morocco', 7.8, 'Moderate', 'Beautiful but busy around noon. Side streets are quieter. Locals very friendly.', ARRAY['Culture', 'Moderate Crowds']),
  (NULL, 'Luang Prabang Night Market, Laos', 8.5, 'Lively', 'Night market buzzing tonight — great energy, not overwhelming. Grab the noodle soup!', ARRAY['Food', 'Nightlife', 'Budget']),
  (NULL, 'Tbilisi Sulfur Baths, Georgia', 9.0, 'Relaxed', 'Private bath booked for $15. Incredibly relaxing, staff very helpful. Highly recommend.', ARRAY['Wellness', 'Budget', 'Hidden Gem']),
  (NULL, 'Matera Sassi, Italy', 8.7, 'Quiet', 'Golden hour light on the cave houses — took 200 photos. Almost no one around at 6am.', ARRAY['Photography', 'Solo', 'Quiet']);
