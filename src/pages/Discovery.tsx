import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, MapPin, Shield, Accessibility, Volume2, Star, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { getTravelAdvice } from '@/src/services/gemini';

const MOCK_DESTINATIONS = [
  {
    id: 1,
    name: 'Matera, Italy',
    image: 'https://images.unsplash.com/photo-1523592121529-f6d0ee0b9a73?auto=format&fit=crop&q=80&w=600',
    price: '$1,200',
    safety: 9.8,
    accessibility: 7.5,
    sensory: 9.0,
    tags: ['Hidden Gem', 'Quiet', 'Historical'],
    description: 'Ancient cave dwellings turned into luxury stays. Perfect for solo travelers seeking peace.'
  },
  {
    id: 2,
    name: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600',
    price: '$2,500',
    safety: 9.9,
    accessibility: 9.5,
    sensory: 8.5,
    tags: ['Safe', 'Accessible', 'Cultural'],
    description: 'The pinnacle of safety and accessibility. Serene temples and hyper-local experiences.'
  },
  {
    id: 3,
    name: 'Lofoten, Norway',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
    price: '$1,800',
    safety: 9.7,
    accessibility: 6.0,
    sensory: 9.8,
    tags: ['Nature', 'Hidden Gem', 'Adventure'],
    description: 'Dramatic peaks and quiet fishing villages. Ideal for the "Solo Pioneer".'
  }
];

export default function Discovery() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [aiAdvice, setAiAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    safety: false,
    accessibility: false,
    sensory: false
  });

  useEffect(() => {
    if (query) {
      handleAiSearch();
    }
  }, []);

  const handleAiSearch = async () => {
    setLoading(true);
    const advice = await getTravelAdvice(`Suggest a hidden gem for: ${query}. Focus on safety, accessibility, and sensory details.`);
    setAiAdvice(advice || '');
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-accent">Discovery</h1>
            <p className="text-muted mt-2">Find your next "Hidden Gem" with AI precision.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-white"
              />
            </div>
            <button onClick={handleAiSearch} className="btn-primary flex items-center gap-2">
              <Sparkles size={18} />
              AI Search
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Filter size={18} />
                Filters
              </h3>
              
              <div className="space-y-4">
                {[
                  { id: 'safety', label: 'Safety First', icon: Shield, color: 'text-green-500' },
                  { id: 'accessibility', label: 'Accessible', icon: Accessibility, color: 'text-blue-500' },
                  { id: 'sensory', label: 'Quiet/Sensory', icon: Volume2, color: 'text-purple-500' },
                ].map((f) => (
                  <label key={f.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <f.icon size={18} className={f.color} />
                      <span className="text-accent font-medium group-hover:text-primary transition-colors">{f.label}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={filters[f.id as keyof typeof filters]}
                      onChange={() => setFilters(prev => ({ ...prev, [f.id]: !prev[f.id as keyof typeof filters] }))}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                ))}
              </div>

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

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {MOCK_DESTINATIONS.map((dest, i) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={dest.image} 
                        alt={dest.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 bg-white/90 backdrop-blur rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                          <Heart size={18} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        {dest.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-accent">{dest.name}</h3>
                          <div className="flex items-center gap-1 text-muted text-sm mt-1">
                            <MapPin size={14} />
                            <span>Western Europe</span>
                          </div>
                        </div>
                        <span className="text-primary font-bold text-lg">{dest.price}</span>
                      </div>
                      
                      <p className="text-muted text-sm mb-6 line-clamp-2">
                        {dest.description}
                      </p>

                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-50">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Safety</p>
                          <div className="flex items-center justify-center gap-1 text-green-600 font-bold">
                            <Shield size={12} />
                            {dest.safety}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Access</p>
                          <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
                            <Accessibility size={12} />
                            {dest.accessibility}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Sensory</p>
                          <div className="flex items-center justify-center gap-1 text-purple-600 font-bold">
                            <Volume2 size={12} />
                            {dest.sensory}
                          </div>
                        </div>
                      </div>

                      <button className="w-full mt-4 btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                        Plan Trip
                        <ChevronRight size={18} />
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
