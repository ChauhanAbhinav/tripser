import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Sparkles, ChevronRight, Sun, Snowflake,
  CloudRain, Map, Hotel, Utensils, Activity, Gem, X,
  TrendingUp, Globe, Shield, Star, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';

interface SearchResult {
  id: number; name: string; location: string; country: string;
  city: string; category: string; sub_category?: string;
  image_url?: string; popularity_score?: number; avg_cost_pp?: number;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  attraction: { label: 'Attraction', icon: TrendingUp, color: 'text-primary',    bg: 'bg-primary/10' },
  hidden_gem: { label: 'Hidden Gem', icon: Gem,        color: 'text-purple-600', bg: 'bg-purple-100' },
  restaurant: { label: 'Restaurant', icon: Utensils,   color: 'text-amber-600',  bg: 'bg-amber-100'  },
  stay:       { label: 'Stay',       icon: Hotel,      color: 'text-blue-600',   bg: 'bg-blue-100'   },
  activity:   { label: 'Activity',   icon: Activity,   color: 'text-green-600',  bg: 'bg-green-100'  },
};

const FILTER_CHIPS = [
  { key: '',           label: 'All',         icon: Globe      },
  { key: 'attraction', label: 'Attractions', icon: TrendingUp },
  { key: 'hidden_gem', label: 'Hidden Gems', icon: Gem        },
  { key: 'restaurant', label: 'Restaurants', icon: Utensils   },
  { key: 'stay',       label: 'Stays',       icon: Hotel      },
  { key: 'activity',   label: 'Activities',  icon: Activity   },
];

const TRENDING = ['Rome', 'Tokyo', 'Bali', 'Tbilisi', 'Kyoto'];

function AdvancedSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async (q: string, cat: string) => {
    if (!q.trim() && !cat) { setResults([]); return; }
    setLoading(true);
    try {
      let qb = supabase
        .from('places')
        .select('id,name,location,country,city,category,sub_category,image_url,popularity_score,avg_cost_pp')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(14);
      if (cat) qb = qb.eq('category', cat);
      if (q.trim()) qb = qb.or(`name.ilike.%${q}%,location.ilike.%${q}%,city.ilike.%${q}%,country.ilike.%${q}%`);
      const { data } = await qb;
      setResults(data || []);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length >= 1) debounceRef.current = setTimeout(() => search(val, activeFilter), 280);
    else { setResults([]); setOpen(false); }
  };

  const handleFilterChip = (key: string) => {
    const next = activeFilter === key ? '' : key;
    setActiveFilter(next);
    search(query, next);
    inputRef.current?.focus();
  };

  const handleSelect = (r: SearchResult) => {
    setOpen(false); setQuery(r.name);
    navigate(`/discovery/place/${r.id}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); setOpen(false);
    navigate(query.trim() ? `/discovery?q=${encodeURIComponent(query)}&cat=${activeFilter}` : '/discovery');
  };

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 transition-all">
          <div className="pl-5 pr-3 shrink-0">
            <Search size={18} className="text-primary" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => { if (results.length > 0 || activeFilter) setOpen(true); }}
            placeholder="Search places, hidden gems, restaurants, activities…"
            className="flex-1 py-4 pr-2 outline-none text-accent placeholder:text-gray-400 bg-transparent text-sm font-medium min-w-0"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); setOpen(false); }} className="p-2 text-gray-400 hover:text-accent transition-colors shrink-0">
              <X size={15} />
            </button>
          )}
          <div className="w-px h-8 bg-gray-100 shrink-0 mx-1" />
          <div className="flex items-center gap-1 px-2 shrink-0">
            <button type="submit" className="hidden sm:flex px-3 py-2 text-xs font-bold text-gray-500 hover:text-accent bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors items-center gap-1.5">
              <Search size={13} /> Discover
            </button>
            <button type="button" onClick={() => navigate(query.trim() ? `/planner?dest=${encodeURIComponent(query)}` : '/planner')} className="px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <Map size={13} /> Plan Trip
            </button>
          </div>
        </div>
      </form>

      {/* Filter chips */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
        {FILTER_CHIPS.map(chip => {
          const Icon = chip.icon;
          const active = activeFilter === chip.key;
          return (
            <button key={chip.key} onClick={() => handleFilterChip(chip.key)}
              className={cn("flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all",
              active ? "bg-accent text-white border-accent shadow-sm" : "bg-white text-muted border-gray-200 hover:bg-gray-50 hover:text-accent"
              )}>
              <Icon size={11} /> {chip.label}
            </button>
          );
        })}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {loading ? (
              <div className="p-5 flex items-center gap-3 text-gray-400">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching…</span>
              </div>
            ) : Object.entries(grouped).map(([cat, items]) => {
              const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.attraction;
              const Icon = cfg.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <div className={cn("p-1 rounded-md", cfg.bg)}><Icon size={11} className={cfg.color} /></div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{cfg.label}s</span>
                    <span className="text-[10px] text-gray-300 ml-auto">{items.length}</span>
                  </div>
                  {items.map(r => (
                    <button key={r.id} onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 group/item">
                      <div className={cn("w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center", cfg.bg)}>
                        {r.image_url ? <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" /> : <Icon size={14} className={cfg.color} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent text-sm group-hover/item:text-primary transition-colors truncate">{r.name}</span>
                          <span className={cn("shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full", cfg.bg, cfg.color)}>{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={9} className="text-gray-400 shrink-0" />
                          <span className="text-[11px] text-gray-400 truncate">{r.city}{r.city !== r.country ? `, ${r.country}` : ''}</span>
                          {r.avg_cost_pp != null && r.avg_cost_pp > 0 && <><span className="text-gray-200">·</span><span className="text-[11px] font-bold text-primary">${r.avg_cost_pp}</span></>}
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-gray-300 group-hover/item:text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              );
            })}
            {results.length > 0 && (
              <button onClick={handleSubmit as any} className="w-full py-3 text-xs font-bold text-primary hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 border-t border-gray-100">
                <Search size={11} /> See all results for "{query || activeFilter}"
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trending */}
      <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
        <span className="text-xs text-muted font-medium flex items-center gap-1"><TrendingUp size={11} /> Trending:</span>
        {TRENDING.map(tag => (
          <button key={tag} onClick={() => { setQuery(tag); handleInput(tag); }}
            className="px-3 py-1 rounded-full bg-white border border-gray-200 text-muted hover:bg-gray-50 hover:text-accent text-xs font-medium transition-all">
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Seasonal picks data (curated itinerary-style) ─────────────────────────────
const SEASONAL_PICKS = [
  {
    title: 'Spring in Kyoto',
    destination: 'Kyoto',
    days: 7,
    budget: '$2,200',
    desc: 'Cherry blossoms, bamboo groves, and sake bars. Best booked 6 weeks ahead.',
    icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50',
    img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop',
    rating: 4.9, reviews: 312,
  },
  {
    title: 'Summer in Amalfi',
    destination: 'Amalfi',
    days: 5,
    budget: '$3,500',
    desc: 'Clifftop villages, hidden coves, and limoncello. Beat the crowds with our routes.',
    icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50',
    img: 'https://images.unsplash.com/photo-1533421644343-45b606a69f48?w=800&auto=format&fit=crop',
    rating: 4.8, reviews: 198,
  },
  {
    title: 'Winter in Lofoten',
    destination: 'Lofoten',
    days: 6,
    budget: '$1,800',
    desc: 'Northern lights, rorbu cabins, and dramatic fjords. Solo-friendly and safe.',
    icon: Snowflake, color: 'text-teal-500', bg: 'bg-teal-50',
    img: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800&auto=format&fit=crop',
    rating: 4.9, reviews: 144,
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gray-50">

      {/* ── HERO (IMAGE & HEADINGS) ────────────────────────────────────── */}
      <section className="relative w-full h-[65vh] min-h-[500px] max-h-[800px] flex items-center justify-center pt-20">

        {/* BG image — full bleed */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&auto=format&fit=crop&q=80"
            alt="Travel background"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Dark overlays for text legibility */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">

          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8 shadow-sm"
          >
            <Sparkles size={12} className="text-amber-400" /> Personalised travel planner
          </motion.span>

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white leading-tight tracking-tight mb-6 drop-shadow-md">
              Plan Less. <span className="text-primary">Travel More.</span>
            </h1>
          </motion.div>

          {/* Sub-tagline — above search bar */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/90 text-lg sm:text-xl font-medium mb-10 max-w-xl mx-auto leading-relaxed drop-shadow-md"
          >
            Plan your next trip in a few minutes. Safety-first itineraries, hidden gems, and real community insights.
          </motion.p>
        </div>

        {/* Floating stats — desktop only */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3"
        >
          {[
            { val: '50K+', label: 'Travelers' },
            { val: '9.8',  label: 'Safety avg' },
            { val: '200+', label: 'Hidden gems' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-4 text-white text-center">
              <p className="text-2xl font-display font-bold">{val}</p>
              <p className="text-xs text-white/55 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── SEARCH BAR BLOCK ────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-8 px-4 sm:px-6 mb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AdvancedSearch />
          </motion.div>
        </div>
      </section>

      {/* ── SEASONAL PICKS ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-2">Curated Itineraries</span>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-accent">Seasonal Budget Picks</h2>
            </div>
            <button onClick={() => navigate('/discovery')} className="text-primary font-bold hover:underline flex items-center gap-1 text-sm self-start">
              Explore all destinations <ChevronRight size={15} />
            </button>
          </div>
          {/* Clarification subtitle */}
          <p className="text-muted text-sm mb-10 max-w-lg">
            These are curated multi-day trip templates — complete itineraries with handpicked places, estimated budget, and AI-optimised routing. Click any to open in the planner.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {SEASONAL_PICKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/planner?dest=${encodeURIComponent(item.destination)}&days=${item.days}`)}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                {/* Cover image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={item.img} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Days + budget overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-white/90 backdrop-blur text-accent text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <Clock size={10} /> {item.days} days
                    </span>
                    <span className="bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{item.budget}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <h3 className="font-bold text-accent group-hover:text-primary transition-colors">{item.title}</h3>
                  </div>
                  <p className="text-muted text-xs mb-4 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star size={12} className="fill-amber-400" /> {item.rating} <span className="text-gray-300 font-normal">({item.reviews})</span>
                    </div>
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      Open in Planner <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-2">What We Do</span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-accent">Everything You Need</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Sparkles, title: 'AI Itineraries',  desc: 'Personalised day-by-day plans ranked by safety, vibe, and budget.', color: 'text-primary',    bg: 'bg-primary/10' },
              { icon: Shield,   title: 'Safety First',    desc: 'Every route scored for safety. Solo and family trips prioritised.',   color: 'text-green-500',  bg: 'bg-green-50'   },
              { icon: Gem,      title: 'Hidden Gems',     desc: 'Curated local spots with 4× better value than tourist hotspots.',    color: 'text-purple-500', bg: 'bg-purple-50'  },
              { icon: Map,      title: 'Full Control',    desc: 'Swap stops, adjust budget, drag to reorder — it\'s your trip.',     color: 'text-blue-500',   bg: 'bg-blue-50'    },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center text-center"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={26} />
                </div>
                <h3 className="text-base font-bold text-accent mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}