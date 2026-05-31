import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Globe, Trophy, Leaf, Users, Clock, DollarSign, Award, ChevronRight, Loader2, CheckSquare, Square, WalletCards, Receipt } from 'lucide-react';
import { api } from '../services/api';

const STATS = [
  { label: 'Total Miles', value: '24,500', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Hours Saved by AI', value: '142h', icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Budget Efficiency', value: '+15%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
];

const BADGES = [
  { id: 1, name: 'Solo Pioneer', desc: 'Completed 5 solo trips', icon: '🌟', unlocked: true },
  { id: 2, name: 'Safety Sentinel', desc: 'Left 10 safety reviews', icon: '🛡️', unlocked: true },
  { id: 3, name: 'Hidden Gem Hunter', desc: 'Visited 3 remote spots', icon: '💎', unlocked: false },
];

const MOCK_PACKING = [
  { category: 'Essentials', items: [{ name: 'Passport & Visa', packed: true }, { name: 'Travel Adapter', packed: false }] },
  { category: 'Clothing (Kyoto: 65°F)', items: [{ name: 'Light Jacket', packed: true }, { name: 'Comfort Walking Shoes', packed: false }] }
];

const MOCK_EXPENSES = [
  { id: 1, title: 'Flight to Haneda', amount: 850, category: 'Transport', date: 'Oct 12' },
  { id: 2, title: 'Ryokan Deposit', amount: 320, category: 'Accommodation', date: 'Oct 14' },
  { id: 3, title: 'Sushi Dinner', amount: 45, category: 'Food', date: 'Oct 15' },
];

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'packing' | 'expenses'>('overview');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getUserProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50 text-muted">
        <Loader2 className="animate-spin mb-4 text-primary" size={32} />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
              <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"} alt="User Profile" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent">{profile?.full_name || 'Sarah Connor'}</h1>
              <p className="text-muted mt-1 flex items-center gap-2">
                <MapPin size={16} /> Currently exploring: <span className="font-medium text-accent">Kyoto, Japan</span>
              </p>
            </div>
          </div>
          <button className="w-full sm:w-auto btn-primary py-2.5 sm:py-2 px-6 text-sm sm:text-base">Edit Profile</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 sm:gap-6 mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setActiveTab('overview')} className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-accent'}`}>Overview</button>
          <button onClick={() => setActiveTab('packing')} className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'packing' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-accent'}`}>AI Packing List</button>
          <button onClick={() => setActiveTab('expenses')} className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-accent'}`}>Budget & Expenses</button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Map */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Engagement Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STATS.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-sm font-bold text-muted uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-accent mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* 3D Map Placeholder */}
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm">
                <h3 className="font-bold text-accent flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  Visited Places Scratch Map
                </h3>
              </div>
              {/* This is a placeholder for the future Mapbox 3D integration */}
              <div className="w-full h-[400px] bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                  alt="Map Placeholder" 
                  className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
                />
                <button className="relative z-10 bg-accent text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                  Unlock Interactive 3D Map
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: TQ & Badges */}
          <div className="space-y-8">
            
            {/* Traveler Quotient (TQ) */}
            <div className="bg-accent text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Traveler Quotient</h3>
                  <span className="text-3xl font-display font-bold text-primary">{profile?.tq_score || 84}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2"><Leaf size={16} className="text-green-400" /> Sustainability</span>
                      <span className="font-bold">{profile?.sustainability_index || 92}/100</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-400 h-full" style={{ width: `${profile?.sustainability_index || 92}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2"><Globe size={16} className="text-blue-400" /> Diversity Score</span>
                      <span className="font-bold">{profile?.diversity_score || 75}/100</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full" style={{ width: `${profile?.diversity_score || 75}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2"><Users size={16} className="text-purple-400" /> Community Karma</span>
                      <span className="font-bold">{profile?.community_karma || 1250} pts</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full" style={{ width: `${Math.min((profile?.community_karma || 1250) / 20, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <Trophy size={150} />
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-accent flex items-center gap-2">
                  <Award size={20} className="text-primary" />
                  Digital Trophies
                </h3>
                <button className="text-sm text-primary font-bold hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {BADGES.map((badge) => (
                  <div key={badge.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${badge.unlocked ? 'border-primary/20 bg-primary/5' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-accent text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'packing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
                <CheckSquare className="text-primary" /> AI Packing List
              </h2>
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">Kyoto, Japan</span>
            </div>
            <div className="space-y-6">
              {MOCK_PACKING.map((cat, i) => (
                <div key={i}>
                  <h3 className="font-bold text-accent mb-3 text-sm uppercase tracking-wider">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer bg-gray-50">
                        {item.packed ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted" />}
                        <span className={`font-medium ${item.packed ? 'text-muted line-through' : 'text-accent'}`}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-xl text-muted font-bold hover:text-primary hover:border-primary transition-colors">
              + Add Custom Item
            </button>
          </motion.div>
        )}

        {activeTab === 'expenses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2"><WalletCards className="text-primary" /> Budget Tracker</h2>
              <div className="text-right">
                <p className="text-xs text-muted font-bold uppercase tracking-wider">Total Spent</p>
                <p className="text-3xl font-display font-bold text-accent">$1,215<span className="text-sm text-muted">.00</span></p>
              </div>
            </div>
            
            <div className="space-y-4">
              {MOCK_EXPENSES.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-muted">
                      {expense.category === 'Transport' && <Globe size={18} />}
                      {expense.category === 'Accommodation' && <CheckSquare size={18} />}
                      {expense.category === 'Food' && <Receipt size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-accent">{expense.title}</h4>
                      <p className="text-xs text-muted">{expense.category} • {expense.date}</p>
                    </div>
                  </div>
                  <div className="font-bold text-accent">${expense.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors">
              Log New Expense
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}