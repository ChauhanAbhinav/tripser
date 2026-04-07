import React from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Award, 
  Leaf, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  ChevronRight,
  Map as MapIcon,
  Star
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const STATS = [
  { label: 'Miles Traveled', value: '12,450', icon: Globe, color: 'text-blue-500' },
  { label: 'Hours Saved', value: '48h', icon: Clock, color: 'text-primary' },
  { label: 'Budget Efficiency', value: '94%', icon: DollarSign, color: 'text-green-500' },
];

const BADGES = [
  { name: 'Solo Pioneer', icon: '🏔️', date: 'Mar 2024' },
  { name: 'Safety Sentinel', icon: '🛡️', date: 'Jan 2024' },
  { name: 'Hidden Gem Hunter', icon: '💎', date: 'Dec 2023' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg">
                <Award size={16} />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-display font-bold text-accent">Welcome back, Sarah!</h1>
              <p className="text-muted mt-1">Level 12 Traveler • Gold Status</p>
              
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span className="text-sm font-bold">TQ Score: 842</span>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-2">
                  <Leaf size={16} className="text-green-500" />
                  <span className="text-sm font-bold">Eco Index: A+</span>
                </div>
              </div>
            </div>

            <button className="btn-primary">Edit Profile</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Map */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <stat.icon className={cn("mb-4", stat.color)} size={24} />
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-accent mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* World Map Placeholder */}
            <div className="bg-accent text-white p-8 rounded-3xl relative overflow-hidden h-[400px]">
              <div className="relative z-10 h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-2">Your World Map</h3>
                <p className="text-gray-400">14 Countries Visited • 3 Continents</p>
                
                <div className="flex-1 flex items-center justify-center">
                  <Globe size={160} className="text-white/10 animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm font-medium bg-white/10 backdrop-blur px-6 py-3 rounded-full border border-white/20">
                      Interactive 3D Map Loading...
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-accent bg-gray-200" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-accent bg-primary flex items-center justify-center text-[10px] font-bold">
                      +12
                    </div>
                  </div>
                  <button className="text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    View Full Map <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Badges & Community */}
          <div className="space-y-8">
            {/* Achievement Badges */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
                <Award size={20} className="text-primary" />
                Achievements
              </h3>
              <div className="space-y-4">
                {BADGES.map((badge, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 group hover:bg-primary/5 transition-colors">
                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{badge.icon}</div>
                    <div>
                      <h4 className="font-bold text-accent">{badge.name}</h4>
                      <p className="text-xs text-muted">Earned {badge.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 text-primary text-sm font-bold flex items-center justify-center gap-1">
                View All Badges <ChevronRight size={14} />
              </button>
            </div>

            {/* Community Karma */}
            <div className="bg-secondary text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Community Karma</h3>
                <div className="flex items-center gap-2 mb-6">
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold">4.9 Rating</span>
                </div>
                <p className="text-sm text-white/80 mb-6">
                  You've helped 124 solo travelers with your safety reviews this month.
                </p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-3/4" />
                </div>
                <p className="text-[10px] mt-2 text-white/60">750/1000 points to "Safety Sentinel Elite"</p>
              </div>
              <div className="absolute -bottom-6 -right-6 opacity-10">
                <Users size={120} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
