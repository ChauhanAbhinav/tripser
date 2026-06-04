/**
 * tripAlgorithm.ts
 * Pure rule-based trip assembly engine. No AI, no backend.
 * Fetches places from Supabase, scores them, builds a day-by-day blueprint.
 */

import { supabase } from './supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripInput {
  destination: string;
  days: number;
  totalPeople: number;
  males: number;
  females: number;
  budget: number;           // total trip budget USD
  budgetTier: 'budget' | 'mid' | 'luxury';
  vibes: string[];          // e.g. ['history', 'food', 'hidden-gems']
  pace: 'relaxed' | 'balanced' | 'packed';
  startDate?: string;       // ISO date string
}

export interface Place {
  id: number;
  name: string;
  slug: string;
  category: string;         // 'attraction' | 'restaurant' | 'stay' | 'hidden_gem' | 'activity'
  sub_category: string | null;
  city: string;
  country: string;
  location: string;
  address: string | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[];
  price_range: string | null;
  price_tier: string;
  avg_cost_pp: number | null;
  avg_duration_mins: number;
  best_time_of_day: string[] | null;  // ['morning', 'afternoon', 'evening']
  best_months: number[] | null;
  safety_score: number | null;
  accessibility_score: number | null;
  sensory_score: number | null;
  popularity_score: number;
  value_score: number;
  tags: string[];
  vibes: string[];
  lat: number | null;
  lng: number | null;
  place_stats?: {
    view_count: number;
    save_count: number;
    trip_count: number;
    review_count: number;
    avg_rating: number;
  };
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface ItineraryEvent {
  id: string;
  place_id: number;
  time: string;
  title: string;
  location: string;
  address: string | null;
  type: 'stay' | 'attraction' | 'food' | 'gem' | 'activity';
  category: string;
  duration: string;
  cost: number;
  rating: number | null;
  image_url: string | null;
  image_urls: string[];
  tags: string[];
  description: string | null;
  tip: string | null;
  safetyNote: string | null;
  slot: TimeSlot;
  lat: number | null;
  lng: number | null;
  score: number;
}

export interface DayPlan {
  day: number;
  date: string | null;       // formatted date string
  theme: string;
  events: ItineraryEvent[];
  day_cost: number;
}

export interface BudgetBreakdown {
  total: number;
  stays: number;
  food: number;
  activities: number;
  transit: number;
  buffer: number;
  per_day: number;
  per_person_per_day: number;
}

export interface TripBlueprint {
  destination: string;
  days: number;
  input: TripInput;
  summary: {
    title: string;
    total_cost: number;
    total_places: number;
    hidden_gems_count: number;
    safety_verified: boolean;
  };
  budget: BudgetBreakdown;
  days_plan: DayPlan[];
  curated: {
    stays: Place[];
    restaurants: Place[];
    hidden_gems: Place[];
    attractions: Place[];
    activities: Place[];
  };
  selected_stay: Place | null;
  insights: CommunityInsight[];
}

export interface CommunityInsight {
  id: string;
  type: 'tip' | 'safety_note' | 'review';
  title: string | null;
  body: string;
  rating: number | null;
  helpful_count: number;
  author?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PACE_CONFIG = {
  relaxed:  { slotsPerDay: 2, slots: ['morning', 'evening'] as TimeSlot[] },
  balanced: { slotsPerDay: 3, slots: ['morning', 'afternoon', 'evening'] as TimeSlot[] },
  packed:   { slotsPerDay: 4, slots: ['morning', 'morning', 'afternoon', 'evening'] as TimeSlot[] },
};

const SLOT_TIMES: Record<TimeSlot, string> = {
  morning:   '09:00 AM',
  afternoon: '01:00 PM',
  evening:   '07:00 PM',
};

// Which categories fit each slot
const CATEGORY_BY_SLOT: Record<TimeSlot, string[]> = {
  morning:   ['attraction', 'hidden_gem', 'activity'],
  afternoon: ['activity', 'attraction', 'hidden_gem'],
  evening:   ['restaurant', 'activity', 'hidden_gem'],
};

// Budget allocation ratios
const BUDGET_RATIOS = {
  stays:      0.35,
  food:       0.25,
  activities: 0.20,
  transit:    0.12,
  buffer:     0.08,
};

// Tag alias map — user vibe → DB tags
const VIBE_TAG_MAP: Record<string, string[]> = {
  'history':      ['history', 'historic', 'heritage', 'ancient', 'museum', 'ruins'],
  'food':         ['food', 'restaurant', 'dining', 'cuisine', 'street-food', 'cafe'],
  'beach':        ['beach', 'coast', 'ocean', 'sea', 'swimming', 'sand'],
  'hiking':       ['hiking', 'trekking', 'outdoor', 'nature', 'mountain', 'trail'],
  'markets':      ['market', 'shopping', 'bazaar', 'souk', 'local'],
  'arts':         ['art', 'culture', 'gallery', 'museum', 'architecture', 'design'],
  'nature':       ['nature', 'park', 'garden', 'wildlife', 'outdoor', 'green'],
  'nightlife':    ['nightlife', 'bar', 'club', 'live-music', 'evening', 'social'],
  'hidden-gems':  ['hidden', 'off-beaten', 'local', 'secret', 'undiscovered'],
  'wellness':     ['spa', 'wellness', 'yoga', 'relaxation', 'calm', 'peaceful'],
  'adventure':    ['adventure', 'extreme', 'sport', 'active', 'thrill'],
  'social':       ['social', 'community', 'local', 'meetup', 'tour'],
};

// Day themes based on what was placed
const DAY_THEMES = [
  'History & Discovery',
  'Food & Culture',
  'Adventure Day',
  'Hidden Gems Day',
  'Arts & Exploration',
  'Relaxation Day',
  'Local Life Day',
  'Explorer Day',
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

interface RankingContext {
  currentSlot: TimeSlot;
  remainingBudget: number;
  selectedPlaces: Place[];
  isSoloFemale: boolean;
}

function getWeights(input: TripInput) {
  const base = {
    popularity: 0.25,
    safety:     0.20,
    value:      0.15,
    tasteMatch: 0.25,
    timeOfDay:  0.10,
    budgetFit:  0.05,
  };

  // Solo female → safety first
  if (input.females > 0 && input.totalPeople <= 2 && input.males === 0) {
    base.safety     = 0.35;
    base.popularity = 0.20;
    base.tasteMatch = 0.20;
    base.value      = 0.10;
  }

  // Budget travelers care about value
  if (input.budgetTier === 'budget') {
    base.value      = 0.30;
    base.popularity = 0.15;
  }

  // Luxury: taste over value
  if (input.budgetTier === 'luxury') {
    base.popularity = 0.15;
    base.value      = 0.05;
    base.tasteMatch = 0.35;
  }

  return base;
}

function scorePopularity(place: Place): number {
  const stats = place.place_stats;
  if (!stats) return (place.popularity_score || 0) * 10;
  return Math.min(
    (stats.trip_count  / 100) * 5 +
    (stats.save_count  / 200) * 3 +
    ((stats.avg_rating || 0) / 5) * 2,
    10
  );
}

function scoreTasteMatch(place: Place, vibes: string[]): number {
  if (!vibes.length) return 5;
  const placeTags = [...(place.tags || []), ...(place.vibes || [])].map(t => t.toLowerCase());
  // Expand user vibes to aliases
  const expanded = vibes.flatMap(v => VIBE_TAG_MAP[v] || [v]);
  const matches = expanded.filter(tag =>
    placeTags.some(pt => pt.includes(tag) || tag.includes(pt))
  ).length;
  return Math.min((matches / Math.max(expanded.length, 1)) * 10 * 2, 10);
}

function scoreValue(place: Place, input: TripInput): number {
  if (!place.avg_cost_pp) return 5;
  const dailyBudgetPP = (input.budget / input.days) / Math.max(input.totalPeople, 1);
  const ratio = place.avg_cost_pp / dailyBudgetPP;
  if (ratio <= 0.05) return 6;
  if (ratio <= 0.15) return 9;
  if (ratio <= 0.30) return 10;
  if (ratio <= 0.50) return 7;
  if (ratio <= 0.80) return 4;
  return 1;
}

function scoreTimeOfDay(place: Place, slot: TimeSlot): number {
  if (!place.best_time_of_day?.length) return 6;
  return place.best_time_of_day.includes(slot) ? 10 : 3;
}

function scoreBudgetFit(place: Place, remaining: number): number {
  if (!place.avg_cost_pp || remaining <= 0) return 5;
  if (place.avg_cost_pp <= remaining * 0.15) return 10;
  if (place.avg_cost_pp <= remaining * 0.30) return 8;
  if (place.avg_cost_pp <= remaining * 0.50) return 5;
  if (place.avg_cost_pp <= remaining)        return 2;
  return 0;
}

function scoreFreshness(place: Place, selectedPlaces: Place[]): number {
  const sameSub = selectedPlaces.filter(p => p.sub_category && p.sub_category === place.sub_category).length;
  const sameCat = selectedPlaces.filter(p => p.category === place.category).length;
  if (sameSub === 0 && sameCat === 0) return 1.0;
  if (sameSub === 1 || sameCat === 1) return 0.65;
  if (sameSub >= 2 || sameCat >= 2)   return 0.30;
  return 0.15;
}

export function scorePlace(
  place: Place,
  input: TripInput,
  context: RankingContext
): number {
  const w = getWeights(input);

  const pop      = scorePopularity(place);
  const safety   = (place.safety_score ?? 5);
  const value    = scoreValue(place, input);
  const taste    = scoreTasteMatch(place, input.vibes);
  const time     = scoreTimeOfDay(place, context.currentSlot);
  const budget   = scoreBudgetFit(place, context.remainingBudget);
  const fresh    = scoreFreshness(place, context.selectedPlaces);

  const raw =
    pop    * w.popularity +
    safety * w.safety     +
    value  * w.value      +
    taste  * w.tasteMatch +
    time   * w.timeOfDay  +
    budget * w.budgetFit;

  return raw * fresh;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryToType(category: string): ItineraryEvent['type'] {
  if (category === 'restaurant') return 'food';
  if (category === 'hidden_gem') return 'gem';
  if (category === 'stay')       return 'stay';
  if (category === 'activity')   return 'activity';
  return 'attraction';
}

function formatDuration(mins: number): string {
  if (mins < 60)  return `${mins} min`;
  if (mins === 60) return '1 hr';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}.${Math.round(m / 6)} hrs` : `${h} hrs`;
}

function formatDate(startDate: string | undefined, dayIndex: number): string | null {
  if (!startDate) return null;
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function pickDayTheme(events: ItineraryEvent[]): string {
  const cats = events.map(e => e.category);
  const hasGem  = cats.includes('hidden_gem');
  const foodCnt = cats.filter(c => c === 'restaurant').length;
  const hasAct  = cats.includes('activity');

  if (hasGem && foodCnt >= 1) return 'Hidden Gems & Flavours';
  if (hasGem)                 return 'Hidden Gems Day';
  if (foodCnt >= 2)           return 'Food & Culture Day';
  if (hasAct)                 return 'Adventure Day';

  // Rotate through themes based on day number (passed in)
  return 'Explorer Day';
}

function buildEvent(place: Place, slot: TimeSlot, dayNum: number, idx: number): ItineraryEvent {
  return {
    id:          `day${dayNum}-${idx}-${place.id}`,
    place_id:    place.id,
    time:        SLOT_TIMES[slot],
    title:       place.name,
    location:    place.location,
    address:     place.address,
    type:        categoryToType(place.category),
    category:    place.category,
    duration:    formatDuration(place.avg_duration_mins || 60),
    cost:        place.avg_cost_pp ?? 0,
    rating:      place.place_stats?.avg_rating ?? null,
    image_url:   place.image_url,
    image_urls:  place.image_urls || [],
    tags:        place.tags || [],
    description: place.description,
    tip:         null,   // enriched from place_insights after assembly
    safetyNote:  null,
    slot,
    lat:         place.lat,
    lng:         place.lng,
    score:       0,
  };
}

function calcBudget(input: TripInput): BudgetBreakdown {
  const { budget, days, totalPeople } = input;
  return {
    total:              budget,
    stays:              Math.round(budget * BUDGET_RATIOS.stays),
    food:               Math.round(budget * BUDGET_RATIOS.food),
    activities:         Math.round(budget * BUDGET_RATIOS.activities),
    transit:            Math.round(budget * BUDGET_RATIOS.transit),
    buffer:             Math.round(budget * BUDGET_RATIOS.buffer),
    per_day:            Math.round(budget / days),
    per_person_per_day: Math.round(budget / Math.max(totalPeople, 1) / days),
  };
}

// ─── Pool helpers ─────────────────────────────────────────────────────────────

interface PlacePools {
  attractions: Place[];
  restaurants: Place[];
  hidden_gems: Place[];
  activities:  Place[];
  stays:       Place[];
}

function buildPools(places: Place[]): PlacePools {
  return {
    attractions: places.filter(p => p.category === 'attraction'),
    restaurants: places.filter(p => p.category === 'restaurant'),
    hidden_gems: places.filter(p => p.category === 'hidden_gem'),
    activities:  places.filter(p => p.category === 'activity'),
    stays:       places.filter(p => p.category === 'stay'),
  };
}

function getPool(pools: PlacePools, category: string): Place[] {
  if (category === 'attraction') return pools.attractions;
  if (category === 'restaurant') return pools.restaurants;
  if (category === 'hidden_gem') return pools.hidden_gems;
  if (category === 'activity')   return pools.activities;
  return [];
}

function rankAndPick(pool: Place[], input: TripInput, count: number): Place[] {
  return pool
    .map(p => ({
      place: p,
      score: scorePlace(p, input, {
        currentSlot:     'morning',
        remainingBudget: input.budget,
        selectedPlaces:  [],
        isSoloFemale:    input.females > 0 && input.males === 0,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(s => s.place);
}

function selectBestStay(stays: Place[], stayBudget: number, input: TripInput): Place | null {
  if (!stays.length) return null;

  const isSoloFemale = input.females > 0 && input.males === 0;
  const nightlyBudget = stayBudget / input.days;

  return stays
    .filter(s => !s.avg_cost_pp || s.avg_cost_pp <= nightlyBudget * 1.3)
    .sort((a, b) => {
      // Solo female → prioritize safety
      if (isSoloFemale) {
        const safeDiff = (b.safety_score ?? 0) - (a.safety_score ?? 0);
        if (Math.abs(safeDiff) > 0.5) return safeDiff;
      }
      // Then popularity
      return (b.popularity_score ?? 0) - (a.popularity_score ?? 0);
    })[0] ?? stays[0];
}

// ─── Day builder ──────────────────────────────────────────────────────────────

function buildDay(
  dayNumber: number,
  input: TripInput,
  pools: PlacePools,
  budget: BudgetBreakdown,
  usedPlaceIds: Set<number>,
): DayPlan {
  const paceConfig = PACE_CONFIG[input.pace];
  const slots = paceConfig.slots;
  const events: ItineraryEvent[] = [];
  const selectedToday: Place[] = [];
  let remainingDayBudget = budget.per_day;

  // Track slot index for packed pace (can repeat slots)
  let eventIdx = 0;

  for (const slot of slots) {
    const categories = CATEGORY_BY_SLOT[slot];

    for (const category of categories) {
      const pool = getPool(pools, category);
      const candidates = pool.filter(p => !usedPlaceIds.has(p.id));

      if (!candidates.length) continue;

      const scored = candidates
        .map(place => ({
          place,
          score: scorePlace(place, input, {
            currentSlot:     slot,
            remainingBudget: remainingDayBudget,
            selectedPlaces:  selectedToday,
            isSoloFemale:    input.females > 0 && input.males === 0,
          }),
        }))
        .sort((a, b) => b.score - a.score);

      // Pick from top 3 with slight randomness for variety
      const topN  = scored.slice(0, 3);
      const pickIdx = topN.length > 1 ? Math.floor(Math.random() * Math.min(topN.length, 2)) : 0;
      const picked = topN[pickIdx];

      if (!picked) continue;

      const cost = picked.place.avg_cost_pp ?? 0;
      if (cost > remainingDayBudget && remainingDayBudget < budget.per_day * 0.1) continue;

      const event = buildEvent(picked.place, slot, dayNumber, eventIdx++);
      event.score = picked.score;

      events.push(event);
      selectedToday.push(picked.place);
      usedPlaceIds.add(picked.place.id);
      remainingDayBudget -= cost;
      break; // one place per slot
    }
  }

  const dayCost = budget.per_day - remainingDayBudget;
  const theme = pickDayTheme(events);

  return {
    day:      dayNumber,
    date:     formatDate(input.startDate, dayNumber - 1),
    theme,
    events,
    day_cost: Math.round(dayCost),
  };
}

// ─── Insight enrichment ───────────────────────────────────────────────────────

async function fetchInsights(destination: string): Promise<CommunityInsight[]> {
  // Fetch tips and safety notes for places in this city
  const { data: places } = await supabase
    .from('places')
    .select('id')
    .ilike('city', `%${destination}%`)
    .limit(50);

  if (!places?.length) return [];

  const ids = places.map(p => p.id);

  const { data } = await supabase
    .from('place_insights')
    .select('id, type, title, body, rating, helpful_count, profiles(full_name)')
    .in('place_id', ids)
    .in('type', ['tip', 'safety_note'])
    .order('helpful_count', { ascending: false })
    .limit(8);

  return (data || []).map((d: any) => ({
    id:            d.id,
    type:          d.type,
    title:         d.title,
    body:          d.body,
    rating:        d.rating,
    helpful_count: d.helpful_count,
    author:        d.profiles?.full_name ?? 'Traveler',
  }));
}

// ─── Main assembler ───────────────────────────────────────────────────────────

export async function assembleTrip(input: TripInput): Promise<TripBlueprint> {
  const isSoloFemale = input.females > 0 && input.males === 0;
  const minSafety    = isSoloFemale ? 7.0 : 4.0;

  // 1. Fetch all candidate places for this city (top 300, sorted by popularity)
  const { data: allPlaces, error } = await supabase
    .from('places')
    .select(`
      *,
      place_stats (
        view_count, save_count, trip_count, review_count, avg_rating
      )
    `)
    .ilike('city', `%${input.destination}%`)
    .eq('is_active', true)
    .gte('safety_score', minSafety)
    .order('popularity_score', { ascending: false })
    .limit(300);

  if (error) throw new Error(`DB error: ${error.message}`);

  // Graceful fallback — if no places found for exact city, broaden search
  const places: Place[] = allPlaces?.length
    ? allPlaces
    : (await supabase
        .from('places')
        .select('*, place_stats(view_count, save_count, trip_count, review_count, avg_rating)')
        .ilike('city', `%${input.destination.split(' ')[0]}%`)
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(300)
      ).data || [];

  // 2. Split into pools
  const pools = buildPools(places);

  // 3. Budget allocation
  const budget = calcBudget(input);

  // 4. Select stay (anchors budget)
  const selectedStay = selectBestStay(pools.stays, budget.stays, input);

  // 5. Build each day
  const usedPlaceIds = new Set<number>();
  // Don't reuse the selected stay in timeline events
  if (selectedStay) usedPlaceIds.add(selectedStay.id);

  const days_plan: DayPlan[] = [];
  for (let d = 1; d <= input.days; d++) {
    days_plan.push(buildDay(d, input, pools, budget, usedPlaceIds));
  }

  // 6. Curated options for right panel (exclude already used)
  const curated = {
    stays:       rankAndPick(pools.stays,       input, 4),
    restaurants: rankAndPick(pools.restaurants, input, 6),
    hidden_gems: rankAndPick(pools.hidden_gems, input, 6),
    attractions: rankAndPick(pools.attractions, input, 6),
    activities:  rankAndPick(pools.activities,  input, 6),
  };

  // 7. Community insights for this destination
  const insights = await fetchInsights(input.destination);

  // 8. Calculate real totals
  const allEvents  = days_plan.flatMap(d => d.events);
  const totalCost  = allEvents.reduce((sum, e) => sum + e.cost, 0) + (selectedStay?.avg_cost_pp ?? 0) * input.days;
  const gemCount   = allEvents.filter(e => e.type === 'gem').length;

  return {
    destination: input.destination,
    days:        input.days,
    input,
    summary: {
      title:              `${input.days} Days in ${input.destination}`,
      total_cost:         Math.round(totalCost),
      total_places:       allEvents.length,
      hidden_gems_count:  gemCount,
      safety_verified:    isSoloFemale,
    },
    budget,
    days_plan,
    curated,
    selected_stay: selectedStay,
    insights,
  };
}

// ─── Swap alternatives ────────────────────────────────────────────────────────
// Called when user taps "Swap" on an event — returns scored alternatives for same slot

export async function getSwapAlternatives(
  placeId: number,
  slot: TimeSlot,
  category: string,
  usedIds: number[],
  input: TripInput,
  remainingBudget: number,
): Promise<Place[]> {
  const isSoloFemale = input.females > 0 && input.males === 0;

  const { data } = await supabase
    .from('places')
    .select('*, place_stats(view_count, save_count, trip_count, review_count, avg_rating)')
    .ilike('city', `%${input.destination}%`)
    .eq('category', category)
    .eq('is_active', true)
    .gte('safety_score', isSoloFemale ? 7.0 : 4.0)
    .not('id', 'in', `(${[placeId, ...usedIds].join(',')})`)
    .order('popularity_score', { ascending: false })
    .limit(30);

  const candidates: Place[] = data || [];

  return candidates
    .map(p => ({
      place: p,
      score: scorePlace(p, input, {
        currentSlot:     slot,
        remainingBudget,
        selectedPlaces:  [],
        isSoloFemale,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.place);
}