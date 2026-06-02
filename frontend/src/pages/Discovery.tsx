import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search, Filter, MapPin, Shield, Accessibility, Volume2,
  Heart, Sparkles, ChevronRight, Map, LayoutGrid, RefreshCw
} from 'lucide-react';
import { getTravelAdvice, getStructuredDestinations } from '../services/gemini';
import { api } from '../services/api';
import { supabase } from '../lib/supabaseClient';

interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  price: string;
  safety: number;
  accessibility: number;
  sensory: number;
  tags: string[];
}

type Filters = {
  safety: boolean;
  accessibility: boolean;
  sensory: boolean;
};

// Normalize raw DB gem → component shape
const normalizeGem = (gem: any): Destination => ({
  id: gem.id,
  name: gem.name,
  location: gem.location,
  description: gem.description || '',
  image: gem.image_url || gem.image || '',
  price: gem.price_range || gem.price || 'N/A',
  safety: Number(gem.safety_score ?? gem.safety ?? 0),
  accessibility: Number(gem.accessibility_score ?? gem.accessibility ?? 0),
  sensory: Number(gem.sensory_score ?? gem.sensory ?? 0),
  tags: gem.tags || [],
});

const applyFilters = (destinations: Destination[], filters: Filters): Destination[] => {
  return destinations.filter(dest => {
    if (filters.safety && dest.safety < 8.5) return false;
    if (filters.accessibility && dest.accessibility < 7.5) return false;
    if (filters.sensory && dest.sensory < 8.5) return false;
    return true;
  });
};

const FALLBACK_GEMS: Destination[] = [
  {
    id: 1,
    name: 'Kotor Old Town',
    location: 'Montenegro',
    description: 'A walled medieval city on the Adriatic coast, far less crowded than Dubrovnik.',
    image: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&auto=format',
    price: '$800 - $1,200',
    safety: 9.2, accessibility: 7.5, sensory: 8.0,
    tags: ['Hidden Gem', 'Safe', 'Historic']
  },
  {
    id: 2,
    name: 'Matera',
    location: 'Italy',
    description: 'Ancient cave city carved into rock — eerily beautiful at night.',
    image: 'https://images.unsplash.com/photo-1533421644343-45b606a69f48?w=800&auto=format',
    price: '$900 - $1,400',
    safety: 8.8, accessibility: 6.5, sensory: 9.1,
    tags: ['UNESCO', 'Quiet', 'Unique']
  }
];

export default function Discovery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [aiAdvice, setAiAdvice] = useState('');
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]); // unfiltered source
  const [destinations, setDestinations] = useState<Destination[]>([]);       // filtered display
  const [loading, setLoading] = useState(false);
  const [orchestratingId, setOrchestratingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<Filters>({
    safety: false,
    accessibility: false,
    sensory: false,
  });

  // ─── Load DB gems on mount ───────────────────────────────────────────────
  const loadDatabaseGems = useCallback(async () => {
    setLoading(true);
    try {
      let dbGems: any[] | null = null;
      try { dbGems = await api.getHiddenGems(); } catch (e) {}
      
      if (!dbGems || dbGems.length === 0) {
        const { data } = await supabase.from('hidden_gems').select('*');
        if (data) dbGems = data;
      }

      if (Array.isArray(dbGems) && dbGems.length > 0) {
        const normalized = dbGems.map(normalizeGem);
        setAllDestinations(normalized);
        setDestinations(applyFilters(normalized, filters));
      } else {
        setAllDestinations(FALLBACK_GEMS);
        setDestinations(applyFilters(FALLBACK_GEMS, filters));
      }
    } catch (err) {
      console.error('Failed to load hidden gems:', err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (query) {
      handleAiSearch();
    } else {
      loadDatabaseGems();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Re-apply filters whenever they change ───────────────────────────────
  useEffect(() => {
    if (allDestinations.length > 0) {
      setDestinations(applyFilters(allDestinations, filters));
    }
  }, [filters, allDestinations]);

  // ─── AI Search ───────────────────────────────────────────────────────────
  const handleAiSearch = async () => {
    setLoading(true);
    try {
      const [advice, structuredData] = await Promise.all([
        getTravelAdvice(
          `Suggest a hidden gem for: ${query}. Focus on safety, accessibility, and sensory details.`
        ),
        getStructuredDestinations(query || 'hidden gems for solo travelers'),
      ]);

      setAiAdvice(advice || 'Here are some curated suggestions based on your search.');

      if (Array.isArray(structuredData) && structuredData.length > 0) {
        const normalized = structuredData.map(normalizeGem);
        setAllDestinations(normalized);
        setDestinations(applyFilters(normalized, filters));
      } else {
        setAllDestinations(FALLBACK_GEMS);
        setDestinations(applyFilters(FALLBACK_GEMS, filters));
      }
    } catch (err) {
      console.error('AI search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanTrip = (id: number) => {
    setOrchestratingId(id);
    setTimeout(() => navigate('/planner'), 2000);
  };

  const toggleFilter = (key: keyof Filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent">Discovery</h1>
            <p className="text-muted mt-2 text-sm sm:text-base">Find your next "Hidden Gem" with AI precision.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
            <div className="relative flex-1 w-full md:w-96 min-w-0">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                placeholder="Search destinations..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-white text-sm sm:text-base"
              />
            </div>
            <button
              onClick={handleAiSearch}
              disabled={loading}
              className="w-full sm:w-auto btn-primary py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-70"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
              AI Search
            </button>
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex justify-end mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-muted hover:text-accent'}`}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-accent text-white' : 'text-muted hover:text-accent'}`}
            >
              <Map size={16} /> Map
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Filter size={18} />
                Filters
              </h3>

              <div className="space-y-4">
                {([
                  { id: 'safety', label: 'Safety First', icon: Shield, color: 'text-green-500', hint: '≥ 8.5 score' },
                  { id: 'accessibility', label: 'Accessible', icon: Accessibility, color: 'text-blue-500', hint: '≥ 7.5 score' },
                  { id: 'sensory', label: 'Quiet / Sensory', icon: Volume2, color: 'text-purple-500', hint: '≥ 8.5 score' },
                ] as const).map((f) => (
                  <label key={f.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <f.icon size={18} className={f.color} />
                      <div>
                        <span className="text-accent font-medium group-hover:text-primary transition-colors block">
                          {f.label}
                        </span>
                        <span className="text-[10px] text-muted">{f.hint}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={filters[f.id]}
                      onChange={() => toggleFilter(f.id)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {/* Active filter count */}
              {Object.values(filters).some(Boolean) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {destinations.length} of {allDestinations.length} shown
                  </span>
                  <button
                    onClick={() => setFilters({ safety: false, accessibility: false, sensory: false })}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="font-bold mb-4">Budget Range</h4>
                <input type="range" className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>$500</span>
                  <span>$10,000+</span>
                </div>
              </div>
            </div>

            {/* AI Insight Card */}
            {aiAdvice && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent text-white p-6 rounded-2xl shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={64} />
                </div>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-secondary" />
                  Seamless AI Insight
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "{aiAdvice.substring(0, 200)}..."
                </p>
                <button className="mt-4 text-secondary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Read full guide <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-gray-100" />
                ))}
              </div>

            ) : destinations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Sparkles size={40} className="text-gray-300 mb-4" />
                <p className="text-accent font-bold text-lg">No destinations found</p>
                <p className="text-muted text-sm mt-1">
                  {Object.values(filters).some(Boolean)
                    ? 'Try relaxing your filters'
                    : 'Try an AI search above'}
                </p>
              </div>

            ) : viewMode === 'map' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-100 w-full h-[600px] sm:h-[800px] rounded-3xl border border-gray-200 overflow-hidden relative shadow-inner flex items-center justify-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600"
                  alt="Map Placeholder"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-accent">
                  Interactive Mapbox SDK View (Add VITE_MAPBOX_TOKEN)
                </div>
                {destinations.map((dest, i) => (
                  <div key={dest.id} className="absolute" style={{ top: `${30 + (i * 20)}%`, left: `${40 + (i * 15)}%` }}>
                    <div className="group relative">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary text-primary cursor-pointer hover:scale-110 transition-transform">
                        <MapPin size={20} />
                      </div>
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        <img src={dest.image} alt={dest.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                        <p className="font-bold text-sm text-accent leading-tight">{dest.name}</p>
                        <p className="text-primary font-bold text-xs">{dest.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>

            ) : (
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {destinations.map((dest, i) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100"
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      {dest.image ? (
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <MapPin size={40} />
                        </div>
                      )}
                      <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                        <Heart size={18} />
                      </button>
                      <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                        {(dest.tags || []).slice(0, 3).map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-accent">{dest.name}</h3>
                          <div className="flex items-center gap-1 text-muted text-sm mt-1">
                            <MapPin size={14} />
                            <span>{dest.location}</span>
                          </div>
                        </div>
                        <span className="text-primary font-bold text-lg whitespace-nowrap ml-2">{dest.price}</span>
                      </div>

                      <p className="text-muted text-sm mb-6 line-clamp-2">{dest.description}</p>

                      {/* Scores */}
                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-50">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Safety</p>
                          <div className="flex items-center justify-center gap-1 text-green-600 font-bold">
                            <Shield size={12} />
                            {dest.safety?.toFixed(1) ?? '—'}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Access</p>
                          <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
                            <Accessibility size={12} />
                            {dest.accessibility?.toFixed(1) ?? '—'}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Sensory</p>
                          <div className="flex items-center justify-center gap-1 text-purple-600 font-bold">
                            <Volume2 size={12} />
                            {dest.sensory?.toFixed(1) ?? '—'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePlanTrip(dest.id)}
                        disabled={orchestratingId === dest.id}
                        className="w-full mt-4 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-80 transition-all"
                      >
                        {orchestratingId === dest.id ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Orchestrating...
                          </>
                        ) : (
                          <>
                            Plan Trip
                            <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
