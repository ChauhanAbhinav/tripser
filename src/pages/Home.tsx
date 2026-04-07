import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Calendar, Sparkles, Play, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/discovery?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-bold uppercase tracking-widest text-sm mb-6 block">
              Plan your next trip in few minutes
            </span>
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-accent leading-tight mb-8">
              Plan Less, <br />
              <span className="relative">
                Travel More
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 400 20" fill="none">
                  <path d="M3.5 16.5C100 5 300 5 396.5 16.5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-muted text-lg mb-10 max-w-lg leading-relaxed">
            A next-gen travel app that creates personalized itineraries that are safe, efficient, and entirely hassle-free. Leave the planning to us and get ready for unforgettable adventures tailored just for your unique travel style.
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <button onClick={() => navigate('/discovery')} className="btn-secondary px-8 py-4 text-lg flex items-center gap-2">
                Find out more
              </button>
              <button className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                  <Play fill="currentColor" size={16} />
                </div>
                <span className="text-muted font-medium group-hover:text-accent transition-colors">Play Demo</span>
              </button>
            </div>

            {/* AI Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 max-w-xl"
            >
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2">
                  <div className="flex-1 flex items-center px-4">
                    <Sparkles className="text-primary mr-3" size={20} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Where do you want to go? (e.g. 'Hidden gem in Italy for a solo woman')"
                      className="w-full py-3 outline-none text-accent placeholder:text-muted/60"
                    />
                  </div>
                  <button type="submit" className="bg-accent text-white p-4 rounded-lg hover:bg-opacity-90 transition-all">
                    <Search size={20} />
                  </button>
                </div>
              </form>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {['Solo Friendly', 'Hidden Gems', 'Accessible', 'Budget Friendly'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="whitespace-nowrap px-4 py-1.5 rounded-full border border-gray-200 text-sm text-muted hover:border-primary hover:text-primary transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=800" 
              alt="Traveler" 
              className="rounded-2xl shadow-2xl relative z-10"
              referrerPolicy="no-referrer"
            />
            {/* Floating elements */}
            <div className="absolute -top-10 -right-10 z-20 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted">AI Suggestion</p>
                  <p className="text-sm font-bold">Amalfi Coast</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 z-20 bg-white p-4 rounded-2xl shadow-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted">Safety Score</p>
                  <p className="text-sm font-bold">9.8/10</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Section */}
        <section className="py-24">
          <div className="text-center mb-16">
            <span className="text-muted font-semibold uppercase tracking-widest text-sm">Category</span>
            <h2 className="text-4xl font-display font-bold text-accent mt-2">We Offer Best Services</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '📡', title: 'Calculated Weather', desc: 'Built Wicket longer admire do barton vanity itself do in it.' },
              { icon: '✈️', title: 'Best Flights', desc: 'Engrossed listening. Park gate sell they west hard for the.', active: true },
              { icon: '🎤', title: 'Local Events', desc: 'Barton vanity itself do in it. Preferd to men it engrossed listening.' },
              { icon: '⚙️', title: 'Customization', desc: 'We deliver outsourced aviation services for military customers.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className={cn(
                  "p-8 rounded-3xl text-center transition-all relative group",
                  item.active ? "bg-white shadow-2xl" : "hover:bg-white hover:shadow-xl"
                )}
              >
                {item.active && <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary rounded-tl-3xl -z-10" />}
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
