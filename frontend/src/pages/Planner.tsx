/**
 * Planner.tsx — UI refresh only. Zero functionality changes.
 * Design: matches Wallet/Discovery/Dashboard card language.
 *   - bg-gray-50 base, white cards, rounded-3xl, shadow-sm border border-gray-100
 *   - Hero: cinematic gradient with subtle dot grid (kept), tightened copy
 *   - Form: unified card with clean section labels (no heavy divider lines)
 *   - Right rail: unchanged structure, tighter visual language
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, Users, Wallet, Zap, MapPin, Clock,
  ChevronRight, Star, Sparkles, Shield, Globe, ArrowRight,
  Mountain, Utensils, Palette, Waves, ShoppingBag, Leaf,
  Music, Eye, Smile, Compass, Plus, Minus, X, CheckCircle2,
  Hotel, Plane, BookOpen, TrendingUp, Heart
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/userAuth';
import { cn } from '../lib/utils';

interface City {
  id: string; name: string; country: string; country_code: string;
  safety_score: number; avg_daily_budget_mid: number; best_months: number[];
}
interface TripTemplate {
  id: string; title: string; days: number; pace: string; budget_tier: string;
  tags: string[]; use_count: number; is_featured: boolean; cities?: { name: string; country: string };
}
interface SavedItinerary {
  id: string; title: string; destination: string;
  start_date: string; end_date: string; created_at: string;
}

const POPULAR_DESTINATIONS = [
  { name: 'Rome', country: 'Italy', emoji: '🏛' },
  { name: 'Tokyo', country: 'Japan', emoji: '⛩' },
  { name: 'Bali', country: 'Indonesia', emoji: '🌴' },
  { name: 'Paris', country: 'France', emoji: '🗼' },
  { name: 'New York', country: 'USA', emoji: '🗽' },
  { name: 'Barcelona', country: 'Spain', emoji: '🎨' },
];

const VIBE_OPTIONS = [
  { id: 'history',     label: 'History',       icon: BookOpen,    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { id: 'food',        label: 'Food & Drink',   icon: Utensils,    color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
  { id: 'beach',       label: 'Beach',          icon: Waves,       color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
  { id: 'hiking',      label: 'Hiking',         icon: Mountain,    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
  { id: 'markets',     label: 'Markets',        icon: ShoppingBag, color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  { id: 'arts',        label: 'Arts & Culture', icon: Palette,     color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { id: 'nature',      label: 'Nature',         icon: Leaf,        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { id: 'nightlife',   label: 'Nightlife',      icon: Music,       color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { id: 'hidden-gems', label: 'Hidden Gems',    icon: Eye,         color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
  { id: 'wellness',    label: 'Wellness',       icon: Smile,       color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
  { id: 'adventure',   label: 'Adventure',      icon: Compass,     color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
  { id: 'social',      label: 'Social',         icon: Users,       color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
];

const PACE_OPTIONS = [
  { id: 'relaxed',  label: 'Relaxed',  icon: '😌', description: '2–3 stops/day', sub: 'Slow travel, lots of rest' },
  { id: 'balanced', label: 'Balanced', icon: '⚖️', description: '4–5 stops/day', sub: 'Mix of activity & rest' },
  { id: 'packed',   label: 'Packed',   icon: '⚡', description: '6+ stops/day',  sub: 'Maximum sights & experiences' },
];

const BUDGET_TIERS = [
  { id: 'budget',  label: 'Budget',  icon: '💰', desc: '< $80/day',   color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { id: 'mid',     label: 'Mid',     icon: '🎯', desc: '$80–200/day', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { id: 'luxury',  label: 'Luxury',  icon: '💎', desc: '$200+/day',   color: 'border-amber-200 bg-amber-50 text-amber-800' },
];

const DURATION_PRESETS = [3, 5, 7, 10, 14];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Section Label — uniform with other pages ───────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-6 pb-4 border-t border-gray-50">
      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

const Counter = ({
  value, onChange, min = 0, max = 20, label, sublabel
}: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; label: string; sublabel?: string;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="font-semibold text-accent text-sm">{label}</p>
      {sublabel && <p className="text-xs text-muted mt-0.5">{sublabel}</p>}
    </div>
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-30"
        disabled={value <= min}>
        <Minus size={14} />
      </button>
      <span className="w-6 text-center font-bold text-accent text-lg">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-30"
        disabled={value >= max}>
        <Plus size={14} />
      </button>
    </div>
  </div>
);

export default function Planner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  const [destination, setDestination] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(5);
  const [males, setMales] = useState(1);
  const [females, setFemales] = useState(0);
  const isSoloFemale = females === 1 && males === 0;
  const totalTravelers = males + females;
  const [budget, setBudget] = useState(1500);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'mid' | 'luxury'>('mid');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [pace, setPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [templates, setTemplates] = useState<TripTemplate[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedItinerary[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchCities = useCallback(async (q: string) => {
    if (q.length < 2) { setCityResults([]); return; }
    const { data } = await supabase.from('cities').select('id,name,country,country_code,safety_score,avg_daily_budget_mid,best_months').ilike('name', `${q}%`).eq('is_active', true).limit(6);
    setCityResults(data || []);
  }, []);

  useEffect(() => { const t = setTimeout(() => searchCities(destinationQuery), 200); return () => clearTimeout(t); }, [destinationQuery, searchCities]);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      const { data } = await supabase.from('trip_templates').select('*, cities(name, country)').eq('is_featured', true).order('use_count', { ascending: false }).limit(6);
      setTemplates(data || []);
      setLoadingTemplates(false);
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      setLoadingSaved(true);
      const { data } = await supabase.from('itineraries').select('id,title,destination,start_date,end_date,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4);
      setSavedTrips(data || []);
      setLoadingSaved(false);
    };
    fetchSaved();
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (budget < 500) setBudgetTier('budget');
    else if (budget < 2000) setBudgetTier('mid');
    else setBudgetTier('luxury');
  }, [budget]);

  const toggleVibe = (id: string) => setSelectedVibes(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);

  const selectDestination = (name: string, city?: City) => {
    setDestination(name); setDestinationQuery(name); setSelectedCity(city || null); setShowDropdown(false);
    if (city?.avg_daily_budget_mid) { const suggested = Math.round(city.avg_daily_budget_mid * days * totalTravelers); setBudget(Math.max(200, Math.min(suggested, 10000))); }
  };

  const useTemplate = (t: TripTemplate) => {
    if (t.cities) selectDestination(t.cities.name);
    setDays(t.days); setPace(t.pace as any); setBudgetTier(t.budget_tier as any);
    setBudget(t.budget_tier === 'budget' ? 800 : t.budget_tier === 'luxury' ? 4000 : 1500);
    const vibes = t.tags.filter(tag => VIBE_OPTIONS.some(v => v.id === tag || v.label.toLowerCase() === tag.toLowerCase()));
    if (vibes.length) setSelectedVibes(vibes);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!destination.trim()) e.destination = 'Please enter a destination.';
    if (totalTravelers === 0) e.travelers = 'Add at least one traveler.';
    if (selectedVibes.length === 0) e.vibes = 'Pick at least one vibe.';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const params = new URLSearchParams({ dest: destination, days: String(days), travelers: String(totalTravelers), males: String(males), females: String(females), budget: String(budget), tier: budgetTier, vibes: selectedVibes.join(','), pace, ...(startDate && { start: startDate }) });
    navigate(`/itinerary?${params.toString()}`);
  };

  const budgetLabel = budget < 500 ? `$${budget} — Backpacker` : budget < 1200 ? `$${budget} — Budget` : budget < 3000 ? `$${budget} — Comfortable` : budget < 6000 ? `$${budget} — Premium` : `$${budget} — Luxury`;
  const budgetPerPersonPerDay = totalTravelers > 0 && days > 0 ? Math.round(budget / totalTravelers / days) : 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero — unified with Home.tsx pattern ── */}
      <div className="relative bg-accent overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Badge — matches Home badge style */}
            <motion.span initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Sparkles size={11} className="text-primary" /> Personalised trip Planner
            </motion.span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-4">
              Build your perfect<br /><span className="text-primary">trip in seconds.</span>
            </h1>
            <p className="text-white/60 text-base sm:text-lg font-medium max-w-lg leading-relaxed mb-8">
              Smart routing, safety-verified places, hidden gems — day-by-day in under 3 seconds.
            </p>
            <div className="flex flex-wrap gap-5">
              {[
                { icon: Globe, label: '120+ Destinations' },
                { icon: MapPin, label: '50K+ Places' },
                { icon: Shield, label: 'Safety-verified' },
                { icon: TrendingUp, label: 'Smart ranking' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/55 text-sm font-medium">
                  <Icon size={14} className="text-primary" /> {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ── CENTER: Form card — uniform rounded-3xl white card ── */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Card header — matches Wallet/Dashboard tab header pattern */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h2 className="font-display font-bold text-accent text-xl">Plan Your Trip</h2>
                  <p className="text-xs text-muted mt-0.5">Fill in the details — we handle the rest.</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Compass size={20} className="text-primary" />
                </div>
              </div>

              <div className="px-8 py-6">

                {/* 1. Destination */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-3">Where are you going?</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {POPULAR_DESTINATIONS.map(d => (
                      <button key={d.name} type="button" onClick={() => selectDestination(d.name)}
                        className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                          destination === d.name ? "bg-accent text-white border-accent shadow-sm" : "bg-white text-muted border-gray-200 hover:border-accent hover:text-accent")}>
                        {d.emoji} {d.name}
                      </button>
                    ))}
                  </div>
                  <div ref={searchRef} className="relative">
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                      <input type="text" value={destinationQuery}
                        onChange={e => { setDestinationQuery(e.target.value); setDestination(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search any city or country…"
                        className={cn("w-full pl-11 pr-10 py-3 rounded-2xl border text-sm font-medium text-accent placeholder:text-muted/50 outline-none transition-all",
                          errors.destination ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-primary focus:bg-white")} />
                      {destination && (
                        <button type="button" onClick={() => { setDestination(''); setDestinationQuery(''); setSelectedCity(null); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-accent">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {showDropdown && cityResults.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute z-50 top-full mt-2 w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                          {cityResults.map(city => (
                            <button key={city.id} type="button" onClick={() => selectDestination(city.name, city)}
                              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <MapPin size={13} className="text-primary" />
                                </div>
                                <div>
                                  <p className="font-bold text-accent text-sm">{city.name}</p>
                                  <p className="text-xs text-muted">{city.country}</p>
                                </div>
                              </div>
                              {city.safety_score > 0 && (
                                <span className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">
                                  <Shield size={11} /> {city.safety_score}
                                </span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.destination && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.destination}</p>}
                  {selectedCity?.best_months?.length ? (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted font-medium">Best time:</span>
                      {selectedCity.best_months.map(m => (
                        <span key={m} className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{MONTH_NAMES[m - 1]}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <SectionLabel label="When & How Long" />

                {/* 2. Dates & Duration */}
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Start Date <span className="font-normal normal-case text-muted/50">(optional)</span></label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-accent outline-none focus:border-primary focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Duration</label>
                    <div className="flex gap-2 flex-wrap">
                      {DURATION_PRESETS.map(d => (
                        <button key={d} type="button" onClick={() => setDays(d)}
                          className={cn("flex-1 min-w-[44px] py-3 rounded-xl text-sm font-bold border transition-all",
                            days === d ? "bg-accent text-white border-accent shadow-sm" : "bg-gray-50 text-muted border-gray-200 hover:border-accent hover:text-accent")}>
                          {d}d
                        </button>
                      ))}
                      <input type="number" value={!DURATION_PRESETS.includes(days) ? days : ''} onChange={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= 30) setDays(v); }}
                        placeholder="?" min={1} max={30}
                        className="flex-1 min-w-[44px] py-3 rounded-xl text-sm font-bold border border-dashed border-gray-300 bg-gray-50 text-center text-accent outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                <SectionLabel label="Who's Coming" />

                {/* 3. Travelers */}
                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 mb-2">
                  <Counter value={males}   onChange={setMales}   label="Men"   sublabel="Male travelers" min={0} />
                  <Counter value={females} onChange={setFemales} label="Women" sublabel="Female travelers" min={0} />
                </div>
                <AnimatePresence>
                  {isSoloFemale && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-3 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <Shield size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-800">Solo female trip detected</p>
                          <p className="text-xs text-blue-600 mt-0.5">Safety-first routing applied. Only well-lit, highly-rated routes selected.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {errors.travelers && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.travelers}</p>}

                <SectionLabel label="Budget" />

                {/* 4. Budget */}
                <div className="mb-2">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-sm font-bold text-accent">{budgetLabel}</span>
                    {budgetPerPersonPerDay > 0 && <span className="text-xs text-muted font-medium">≈ ${budgetPerPersonPerDay}/person/day</span>}
                  </div>
                  <input type="range" min={200} max={15000} step={100} value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full h-2 rounded-full accent-primary cursor-pointer mb-4" />
                  <div className="flex gap-3">
                    {BUDGET_TIERS.map(t => (
                      <button key={t.id} type="button" onClick={() => { setBudgetTier(t.id as any); setBudget(t.id === 'budget' ? 600 : t.id === 'luxury' ? 4000 : 1500); }}
                        className={cn("flex-1 py-3 px-2 rounded-2xl border-2 text-center transition-all",
                          budgetTier === t.id ? t.color + ' border-current shadow-sm' : 'bg-gray-50 border-gray-200 text-muted hover:border-gray-300')}>
                        <div className="text-lg mb-0.5">{t.icon}</div>
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[10px] font-medium opacity-70">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <SectionLabel label="Your Vibe" />

                {/* 5. Vibes */}
                <div className="mb-2">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {VIBE_OPTIONS.map(vibe => {
                      const Icon = vibe.icon;
                      const active = selectedVibes.includes(vibe.id);
                      return (
                        <button key={vibe.id} type="button" onClick={() => toggleVibe(vibe.id)}
                          className={cn("flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all text-center",
                            active ? vibe.color + ' border-current shadow-sm scale-[1.02]' : 'bg-white border-gray-200 text-muted hover:border-gray-300 hover:text-accent')}>
                          <Icon size={17} className={active ? 'opacity-100' : 'opacity-60'} />
                          <span className="text-[11px] font-bold leading-tight">{vibe.label}</span>
                          {active && <CheckCircle2 size={11} className="opacity-70" />}
                        </button>
                      );
                    })}
                  </div>
                  {selectedVibes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-xs text-muted font-medium self-center">Selected:</span>
                      {selectedVibes.map(id => {
                        const v = VIBE_OPTIONS.find(x => x.id === id);
                        return v ? (
                          <span key={id} className="text-xs bg-accent/10 text-accent font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            {v.label}
                            <button onClick={() => toggleVibe(id)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  {errors.vibes && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.vibes}</p>}
                </div>

                <SectionLabel label="Travel Pace" />

                {/* 6. Pace */}
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {PACE_OPTIONS.map(p => (
                    <button key={p.id} type="button" onClick={() => setPace(p.id as any)}
                      className={cn("py-4 px-3 rounded-2xl border-2 text-center transition-all",
                        pace === p.id ? "bg-accent text-white border-accent shadow-md" : "bg-white border-gray-200 text-accent hover:border-accent/40")}>
                      <div className="text-2xl mb-2">{p.icon}</div>
                      <div className={cn("text-sm font-bold", pace === p.id ? 'text-white' : 'text-accent')}>{p.label}</div>
                      <div className={cn("text-[11px] font-semibold mt-0.5", pace === p.id ? 'text-white/70' : 'text-primary')}>{p.description}</div>
                      <div className={cn("text-[10px] font-medium mt-1", pace === p.id ? 'text-white/50' : 'text-muted')}>{p.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Submit — consistent with other CTAs */}
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <motion.button type="button" onClick={handleSubmit} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-accent text-white font-bold text-base rounded-2xl shadow-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-3 group">
                    <Sparkles size={20} className="text-primary" />
                    Build My Perfect Trip
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <p className="text-center text-xs text-muted mt-3 font-medium">No AI fluff — pure smart algorithm. Results in under 3 seconds.</p>
                </div>
              </div>
            </motion.div>

            {/* Saved Itineraries */}
            {user && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-accent flex items-center gap-2">
                    <BookOpen size={17} className="text-primary" /> Your Saved Trips
                  </h3>
                  <span className="text-xs text-muted font-medium">{savedTrips.length} trip{savedTrips.length !== 1 ? 's' : ''}</span>
                </div>
                {loadingSaved ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
                  </div>
                ) : savedTrips.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                    <Plane size={26} className="mx-auto text-muted/30 mb-3" />
                    <p className="text-muted text-sm font-medium">No saved trips yet.</p>
                    <p className="text-muted/60 text-xs mt-1">Build your first trip above!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {savedTrips.map(trip => (
                      <motion.button key={trip.id} whileHover={{ y: -2 }} onClick={() => navigate(`/itinerary?id=${trip.id}`)}
                        className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-primary/30 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <MapPin size={16} className="text-primary" />
                          </div>
                          <ChevronRight size={15} className="text-muted group-hover:text-primary transition-colors mt-0.5" />
                        </div>
                        <h4 className="font-bold text-accent text-sm group-hover:text-primary transition-colors leading-snug">{trip.title}</h4>
                        <p className="text-xs text-muted font-medium mt-0.5">{trip.destination}</p>
                        {trip.start_date && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                            <Calendar size={10} />
                            {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ── RIGHT RAIL — uniform white cards ── */}
          <div className="w-full xl:w-[360px] shrink-0 space-y-5">
            <div className="xl:sticky xl:top-[100px] space-y-5">

              {/* How it works — matches accent card in Dashboard */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                className="bg-accent rounded-3xl p-6 text-white overflow-hidden relative">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/20" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap size={16} className="text-primary" />
                    <span className="font-bold text-xs uppercase tracking-widest">How It Works</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { n: '01', t: 'Fill the form', d: 'Destination, dates, vibes, budget' },
                      { n: '02', t: 'Algorithm scores places', d: 'Popularity, safety, value, taste match' },
                      { n: '03', t: 'Day-by-day plan built', d: 'Optimized slots, no duplicates' },
                      { n: '04', t: 'Review & customize', d: 'Swap anything, add stops' },
                    ].map(step => (
                      <div key={step.n} className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xs font-mono shrink-0 mt-0.5">{step.n}</span>
                        <div>
                          <p className="font-bold text-sm text-white">{step.t}</p>
                          <p className="text-white/50 text-xs mt-0.5 font-medium">{step.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Featured Templates — uniform white card */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h3 className="font-bold text-accent text-sm flex items-center gap-2">
                      <Star size={14} className="text-amber-400 fill-amber-400" /> Featured Trips
                    </h3>
                    <p className="text-xs text-muted mt-0.5">One tap to pre-fill the form</p>
                  </div>
                </div>
                <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto no-scrollbar">
                  {loadingTemplates ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />)
                  ) : templates.length === 0 ? (
                    [
                      { id: 'f1', title: '5 Days in Rome', days: 5, pace: 'balanced', budget_tier: 'mid', tags: ['history', 'food', 'gems'], use_count: 1240, is_featured: true, cities: { name: 'Rome', country: 'Italy' } },
                      { id: 'f2', title: 'Tokyo in 7 Days', days: 7, pace: 'packed', budget_tier: 'mid', tags: ['food', 'arts', 'nightlife'], use_count: 980, is_featured: true, cities: { name: 'Tokyo', country: 'Japan' } },
                      { id: 'f3', title: 'Bali Retreat', days: 10, pace: 'relaxed', budget_tier: 'budget', tags: ['beach', 'wellness', 'nature'], use_count: 754, is_featured: true, cities: { name: 'Bali', country: 'Indonesia' } },
                      { id: 'f4', title: 'Paris Weekend', days: 3, pace: 'balanced', budget_tier: 'luxury', tags: ['arts', 'food', 'history'], use_count: 632, is_featured: true, cities: { name: 'Paris', country: 'France' } },
                    ].map(t => <TemplateCard key={t.id} template={t} onUse={useTemplate} />)
                  ) : (
                    templates.map(t => <TemplateCard key={t.id} template={t} onUse={useTemplate} />)
                  )}
                </div>
              </motion.div>

              {/* Trust signals — uniform white card */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[{ val: '50K+', label: 'Trips built' }, { val: '4.9★', label: 'Avg rating' }, { val: '120+', label: 'Cities' }].map(s => (
                    <div key={s.label}>
                      <p className="text-xl font-display font-bold text-accent">{s.val}</p>
                      <p className="text-xs text-muted font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template: t, onUse }: { template: TripTemplate; onUse: (t: TripTemplate) => void }) {
  const paceColor = t.pace === 'relaxed' ? 'text-green-600 bg-green-50' : t.pace === 'packed' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
  const tierColor = t.budget_tier === 'budget' ? 'text-emerald-700 bg-emerald-50' : t.budget_tier === 'luxury' ? 'text-amber-700 bg-amber-50' : 'text-blue-700 bg-blue-50';
  return (
    <motion.div whileHover={{ y: -1 }} className="border border-gray-100 rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group bg-gray-50/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-accent text-sm group-hover:text-primary transition-colors truncate">{t.title}</h4>
          {t.cities && <p className="text-xs text-muted font-medium mt-0.5 flex items-center gap-1"><MapPin size={9} /> {t.cities.name}, {t.cities.country}</p>}
        </div>
        {t.is_featured && <Star size={13} className="text-amber-400 fill-amber-400 shrink-0 mt-0.5" />}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[10px] font-bold bg-gray-100 text-accent px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={9} /> {t.days}d</span>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", paceColor)}>{t.pace}</span>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", tierColor)}>{t.budget_tier}</span>
        {t.use_count > 0 && <span className="text-[10px] font-bold text-muted ml-auto flex items-center gap-1"><Heart size={9} className="text-rose-400" /> {t.use_count.toLocaleString()}</span>}
      </div>
      <button type="button" onClick={() => onUse(t)} className="w-full py-2 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
        Use Template <ArrowRight size={11} />
      </button>
    </motion.div>
  );
}