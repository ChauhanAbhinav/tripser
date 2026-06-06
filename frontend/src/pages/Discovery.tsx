import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search, Filter, MapPin, Shield, Accessibility, Volume2,
  Heart, Sparkles, ChevronRight, Map, LayoutGrid, RefreshCw,
  Hotel, Utensils, Activity, Gem, TrendingUp, Globe, X, Compass
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';

interface Destination {
  id: number;
  name: string;
  location: string;
  city: string;
  country: string;
  description: string;
  image: string;
  price: string;
  avg_cost_pp?: number;
  safety: number;
  accessibility: number;
  sensory: number;
  tags: string[];
  category: string;
  popularity_score: number;
}

type ScoreFilters = { safety: boolean; accessibility: boolean; sensory: boolean };

const CATEGORY_CHIPS = [
  { key: '',           label: 'All',         icon: Globe      },
  { key: 'attraction', label: 'Attractions', icon: TrendingUp },
  { key: 'hidden_gem', label: 'Hidden Gems', icon: Gem        },
  { key: 'restaurant', label: 'Restaurants', icon: Utensils   },
  { key: 'stay',       label: 'Stays',       icon: Hotel      },
  { key: 'activity',   label: 'Activities',  icon: Activity   },
];

const CAT_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  attraction:  { label: 'Attraction', color: 'text-primary',    bg: 'bg-primary/10'   },
  hidden_gem:  { label: 'Hidden Gem', color: 'text-purple-600', bg: 'bg-purple-100'   },
  restaurant:  { label: 'Restaurant', color: 'text-amber-600',  bg: 'bg-amber-100'    },
  stay:        { label: 'Stay',       color: 'text-blue-600',   bg: 'bg-blue-100'     },
  activity:    { label: 'Activity',   color: 'text-green-600',  bg: 'bg-green-100'    },
};

const normalizePlace = (p: any): Destination => ({
  id:              p.id,
  name:            p.name,
  location:        p.location,
  city:            p.city || '',
  country:         p.country || '',
  description:     p.description || '',
  image:           p.image_url || '',
  price:           p.price_range || '',
  avg_cost_pp:     p.avg_cost_pp,
  safety:          Number(p.safety_score ?? 0),
  accessibility:   Number(p.accessibility_score ?? 0),
  sensory:         Number(p.sensory_score ?? 0),
  tags:            p.tags || [],
  category:        p.category || 'attraction',
  popularity_score:Number(p.popularity_score ?? 0),
});

const applyFilters = (d: Destination[], f: ScoreFilters, cat: string) =>
  d.filter(x =>
    (!cat || x.category === cat) &&
    (!f.safety       || x.safety       >= 8.5) &&
    (!f.accessibility || x.accessibility >= 7.5) &&
    (!f.sensory       || x.sensory       >= 8.5)
  );

export default function Discovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query,   setQuery]   = useState(searchParams.get('q')   || '');
  const [catFilter, setCatFilter] = useState(searchParams.get('cat') || '');
  const [allDest, setAllDest] = useState<Destination[]>([]);
  const [dest,    setDest]    = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [scoreFilters, setScoreFilters] = useState<ScoreFilters>({ safety: false, accessibility: false, sensory: false });

  const fetchPlaces = useCallback(async (q: string, cat: string) => {
    setLoading(true);
    try {
      let qb = supabase
        .from('places')
        .select('*')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(60);

      if (cat) qb = qb.eq('category', cat);
      if (q.trim()) qb = qb.or(`name.ilike.%${q}%,location.ilike.%${q}%,city.ilike.%${q}%,country.ilike.%${q}%`);

      const { data } = await qb;
      const normalized = (data || []).map(normalizePlace);
      setAllDest(normalized);
      setDest(applyFilters(normalized, scoreFilters, cat));
    } catch { setDest([]); }
    finally { setLoading(false); }
  }, [scoreFilters]);

  useEffect(() => { fetchPlaces(query, catFilter); }, []);

  useEffect(() => {
    setDest(applyFilters(allDest, scoreFilters, catFilter));
  }, [scoreFilters, catFilter, allDest]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaces(query, catFilter);
    setSearchParams({ q: query, cat: catFilter });
  };

  const handleCatChip = (key: string) => {
    const next = catFilter === key ? '' : key;
    setCatFilter(next);
    fetchPlaces(query, next);
  };

  const toggleScore = (key: keyof ScoreFilters) => setScoreFilters(p => ({ ...p, [key]: !p[key] }));

  const activeScoreCount = Object.values(scoreFilters).filter(Boolean).length;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent flex items-center gap-3">
              Discovery <Compass size={28} className="text-primary shrink-0" /> 
            </h1>
            <p className="text-muted mt-1 text-sm">{dest.length} places found{catFilter ? ` · ${CAT_BADGE[catFilter]?.label}s` : ''}</p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search destinations…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-sm font-medium text-accent"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); fetchPlaces('', catFilter); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent">
                  <X size={14} />
                </button>
              )}
            </div>
            <button disabled={loading} type="submit" className="btn-primary px-4 py-2.5 flex items-center gap-1.5 text-sm disabled:opacity-70">
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
              Search
            </button>
          </form>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {CATEGORY_CHIPS.map(chip => {
            const Icon = chip.icon;
            const active = catFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => handleCatChip(chip.key)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all",
                  active
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-white text-muted border-gray-200 hover:border-accent/40 hover:text-accent"
                )}
              >
                <Icon size={13} /> {chip.label}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-base mb-5 flex items-center gap-2">
                <Filter size={16} /> Filters
                {activeScoreCount > 0 && (
                  <span className="ml-auto text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {activeScoreCount} active
                  </span>
                )}
              </h3>

              <div className="space-y-4">
                {([
                  { id: 'safety',       label: 'Safety First',    icon: Shield,       color: 'text-green-500',  hint: '≥ 8.5 score' },
                  { id: 'accessibility',label: 'Accessible',       icon: Accessibility,color: 'text-blue-500',   hint: '≥ 7.5 score' },
                  { id: 'sensory',      label: 'Low Sensory',      icon: Volume2,      color: 'text-purple-500', hint: '≥ 8.5 score' },
                ] as const).map(f => (
                  <label key={f.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <f.icon size={16} className={f.color} />
                      <div>
                        <span className="text-accent font-medium text-sm group-hover:text-primary transition-colors block">{f.label}</span>
                        <span className="text-[10px] text-muted">{f.hint}</span>
                      </div>
                    </div>
                    <input type="checkbox" checked={scoreFilters[f.id]} onChange={() => toggleScore(f.id)} className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer" />
                  </label>
                ))}
              </div>

              {activeScoreCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-muted">{dest.length} of {allDest.length} shown</span>
                  <button onClick={() => setScoreFilters({ safety: false, accessibility: false, sensory: false })} className="text-xs text-primary font-bold hover:underline">Clear</button>
                </div>
              )}
            </div>

            {/* View toggle */}
            <div className="bg-white border border-gray-200 rounded-2xl p-1 flex">
              <button onClick={() => setViewMode('grid')} className={cn("flex-1 py-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors", viewMode === 'grid' ? "bg-accent text-white" : "text-muted hover:text-accent")}>
                <LayoutGrid size={14} /> Grid
              </button>
              <button onClick={() => setViewMode('map')} className={cn("flex-1 py-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors", viewMode === 'map' ? "bg-accent text-white" : "text-muted hover:text-accent")}>
                <Map size={14} /> Map
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-5">
                {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-gray-100" />)}
              </div>
            ) : dest.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Sparkles size={36} className="text-gray-300 mb-4" />
                <p className="text-accent font-bold text-lg">No destinations found</p>
                <p className="text-muted text-sm mt-1">{activeScoreCount > 0 ? 'Try relaxing your filters' : 'Try a different search'}</p>
              </div>
            ) : viewMode === 'map' ? (
              <div className="bg-slate-100 w-full h-[600px] rounded-3xl border border-gray-200 overflow-hidden relative flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1600" alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-accent">
                  Add VITE_MAPBOX_TOKEN to enable map
                </div>
                {dest.slice(0,8).map((d, i) => (
                  <div key={d.id} className="absolute" style={{ top: `${25 + (i % 3) * 25}%`, left: `${15 + (i % 5) * 18}%` }}>
                    <button onClick={() => navigate(`/discovery/place/${d.id}`)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-primary text-primary hover:scale-110 transition-transform">
                      <MapPin size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {dest.map((d, i) => {
                  const badge = CAT_BADGE[d.category] || CAT_BADGE.attraction;
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                    >
                      <div className="relative h-52 overflow-hidden bg-gray-100">
                        {d.image ? (
                          <img
                            src={d.image} alt={d.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><Globe size={40} /></div>
                        )}
                        <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                          <Heart size={15} />
                        </button>
                        {/* Category badge */}
                        <span className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-sm bg-white/90", badge.color)}>
                          {badge.label}
                        </span>
                        {/* Tags */}
                        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                          {d.tags.slice(0,2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-accent">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-base font-bold text-accent group-hover:text-primary transition-colors">{d.name}</h3>
                            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {d.city}{d.city !== d.country ? `, ${d.country}` : ''}
                            </p>
                          </div>
                          {d.avg_cost_pp != null && d.avg_cost_pp > 0 && (
                            <span className="text-primary font-bold text-sm shrink-0 ml-2">${d.avg_cost_pp}<span className="text-xs text-muted font-medium">/pp</span></span>
                          )}
                        </div>

                        <p className="text-muted text-xs mb-4 line-clamp-2 leading-relaxed">{d.description}</p>

                        <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-50 mb-4">
                          {[
                            { label: 'Safety',  val: d.safety,        color: 'text-green-600'  },
                            { label: 'Access',  val: d.accessibility, color: 'text-blue-600'   },
                            { label: 'Sensory', val: d.sensory,       color: 'text-purple-600' },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="text-center">
                              <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">{label}</p>
                              <p className={cn("text-xs font-bold", color)}>{val.toFixed(1)}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/discovery/place/${d.id}`)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-accent hover:border-primary hover:text-primary transition-colors">
                            View Place
                          </button>
                          <button onClick={() => navigate(`/planner?dest=${encodeURIComponent(d.city || d.name)}`)} className="flex-1 btn-primary py-2.5 rounded-xl text-xs flex items-center justify-center gap-1">
                            Plan Trip <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}