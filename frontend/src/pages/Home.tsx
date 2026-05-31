import React, { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Sparkles, Play, ChevronRight, Sun, Snowflake, CloudRain, CloudSun, Plane, Ticket, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/discovery?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -z-10 w-72 h-72 sm:w-[600px] sm:h-[600px] bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 w-72 h-72 sm:w-[400px] sm:h-[400px] bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full min-w-0"
          >
            <span className="text-primary font-bold uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-6 block leading-snug">
              Plan your next trip in few minutes
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-accent leading-tight mb-4 sm:mb-8">
              Plan Less, <br />
              <span className="relative">
                Travel More
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 400 20" fill="none">
                  <path d="M3.5 16.5C100 5 300 5 396.5 16.5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-muted text-base sm:text-lg mb-6 sm:mb-10 max-w-lg leading-relaxed">
              A next-gen travel app that creates personalized itineraries that are safe, efficient, and entirely hassle-free. Leave the planning to us and get ready for unforgettable adventures tailored just for your unique travel style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
              <button onClick={() => navigate('/discovery')} className="w-full sm:w-auto btn-secondary px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2">
                Find out more
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-4 group py-3 sm:py-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform shrink-0">
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
              className="mt-10 sm:mt-16 w-full max-w-xl"
            >
              <form onSubmit={handleSearch} className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-1.5 sm:p-2 w-full">
                  <div className="flex-1 flex items-center pl-3 sm:pl-4 pr-2 sm:pr-4 min-w-0">
                    <Sparkles className="text-primary mr-2 sm:mr-3 shrink-0" size={20} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    placeholder="Where to? (e.g. 'Hidden gems in Italy')"
                      className="w-full py-2.5 sm:py-3 outline-none text-accent placeholder:text-muted/60 bg-transparent text-sm sm:text-base min-w-0 truncate"
                    />
                  </div>
                <button type="submit" className="bg-accent text-white p-2.5 sm:p-4 rounded-lg hover:bg-opacity-90 transition-all shrink-0">
                    <Search size={20} />
                  </button>
                </div>
              </form>
              <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar w-full -mx-1 px-1 sm:mx-0 sm:px-0">
                {['Solo Friendly', 'Hidden Gems', 'Accessible', 'Budget Friendly'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="whitespace-nowrap flex-shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-gray-200 text-xs sm:text-sm text-muted hover:border-primary hover:text-primary transition-all"
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

        {/* Seasonal Budget Recommendations */}
        <section className="py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-primary font-bold uppercase tracking-widest text-sm block mb-2">Curated For You</span>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-accent">Seasonal Budget Picks</h2>
            </div>
            <button className="text-primary font-bold hover:underline flex items-center gap-1">View all <ChevronRight size={16}/></button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Spring in Kyoto", desc: "Cherry blossom season with optimized early bookings.", price: "$2,200", icon: Sun, color: "text-orange-500", bg: "bg-orange-50" },
              { title: "Summer in Amalfi", desc: "Beat the crowds with our hidden gem coastal routes.", price: "$3,500", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-50" },
              { title: "Winter in Lofoten", desc: "Northern lights hunting for the Solo Pioneer.", price: "$1,800", icon: Snowflake, color: "text-teal-500", bg: "bg-teal-50" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.bg} ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted text-sm mb-6">{item.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Est. Budget</span>
                  <span className="font-bold text-accent">{item.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Category Section */}
        <section className="pb-24">
          <div className="text-center mb-16">
            <span className="text-primary font-bold uppercase tracking-widest text-sm block mb-2">Category</span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-accent mt-2">We Offer Best Services</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: CloudSun, title: 'Calculated Weather', desc: 'Built Wicket longer admire do barton vanity itself do in it.', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: Plane, title: 'Best Flights', desc: 'Engrossed listening. Park gate sell they west hard for the.', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Ticket, title: 'Local Events', desc: 'Barton vanity itself do in it. Preferd to men it engrossed listening.', color: 'text-purple-500', bg: 'bg-purple-50' },
              { icon: Settings, title: 'Customization', desc: 'We deliver outsourced aviation services for military customers.', color: 'text-green-500', bg: 'bg-green-50' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-accent mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
