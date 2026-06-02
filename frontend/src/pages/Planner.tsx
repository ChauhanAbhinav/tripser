import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { Map as MapGL } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Clock,
  MapPin,
  Map,
  X,
  WifiOff,
  Save,
  Plane,
  Hotel,
  Utensils,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Plus,
  MoreVertical,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { generatePivotItinerary } from '../services/gemini';
import { api } from '../services/api';

interface ItineraryItem {
  id: string;
  type: 'flight' | 'hotel' | 'food' | 'alert' | 'transit';
  time: string;
  title: string;
  location: string;
  status?: string;
}

const INITIAL_ITEMS: ItineraryItem[] = [
  { id: '1', type: 'flight', time: '09:00 AM', title: 'Flight to Rome', location: 'JFK Airport', status: 'On Time' },
  { id: '2', type: 'hotel', time: '02:00 PM', title: 'Check-in: Hotel de la Ville', location: 'Via Sistina, 69', status: 'Confirmed' },
  { id: '3', type: 'food', time: '07:30 PM', title: 'Dinner at Armando al Pantheon', location: "Salita de' Crescenzi, 31", status: 'Reserved' },
];

export default function Planner() {
  const [items, setItems] = useState<ItineraryItem[]>(INITIAL_ITEMS);
  const [isPivoting, setIsPivoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPivotAlert, setShowPivotAlert] = useState(false);
  const [activeMap, setActiveMap] = useState<'safewalk' | 'sensory' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handlePivot = async () => {
    setIsPivoting(true);
    setShowPivotAlert(false);

    const disruption = "Flight to Rome delayed by 2 hours due to weather. Push all subsequent plans back by 2 hours.";
    const newItinerary = await generatePivotItinerary(items, disruption);

    if (newItinerary && Array.isArray(newItinerary)) {
      setItems(newItinerary as ItineraryItem[]);
    } else {
      const alertItem: ItineraryItem = {
        id: `alert-${Date.now()}`,
        type: 'alert',
        time: 'ASAP',
        title: 'Flight Delayed: 2h',
        location: 'Re-routing active',
        status: 'Action Required',
      };
      setItems(prev => [alertItem, ...prev]);
    }

    setIsPivoting(false);
    setShowPivotAlert(true);
  };

  const handleSaveTrip = async () => {
    setIsSaving(true);
    try {
      await api.saveItinerary("Weekend in Rome", "Rome, Italy", items);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Failed to save trip", error instanceof Error ? error.message : error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent">Trip Planner</h1>
            <p className="text-muted mt-2 text-sm sm:text-base">Drag and drop to reorder. AI handles the rest.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleSaveTrip}
              disabled={isSaving || saveStatus === 'saved'}
              className="flex-1 sm:flex-none btn-secondary py-2 px-4 sm:px-6 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {saveStatus === 'saved' ? <ShieldCheck size={18} className="text-green-500" /> : <Save size={18} />}
              {saveStatus === 'saved' ? 'Saved' : isSaving ? 'Saving...' : 'Save Trip'}
            </button>

            <button
              onClick={handlePivot}
              disabled={isPivoting}
              className={cn(
                "flex-1 sm:flex-none btn-primary bg-accent flex items-center justify-center gap-2 relative overflow-hidden group text-sm sm:text-base",
                isPivoting && "opacity-80"
              )}
            >
              {isPivoting ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              )}
              AI Pivot
              {isPivoting && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
            </button>
            <button className="hidden sm:flex p-3 bg-white rounded-xl border border-gray-200 text-accent hover:border-primary transition-all">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Pivot Alert */}
        {showPivotAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-primary">
              <AlertCircle size={20} />
              <p className="font-medium">AI has detected a delay. Your itinerary has been optimized.</p>
            </div>
            <button onClick={() => setShowPivotAlert(false)} className="text-primary hover:underline text-sm font-bold">
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-200 -z-10" />

          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-6">
            {items.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="relative pl-12 sm:pl-20"
              >
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute left-[18px] sm:left-[26px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10",
                  item.type === 'alert' ? "bg-red-500" : "bg-primary"
                )} />

                <div className={cn(
                  "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing",
                  item.type === 'alert' && "border-red-100 bg-red-50/30"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        item.type === 'flight' && "bg-blue-50 text-blue-500",
                        item.type === 'hotel' && "bg-orange-50 text-orange-500",
                        item.type === 'food' && "bg-green-50 text-green-500",
                        item.type === 'alert' && "bg-red-100 text-red-500",
                      )}>
                        {item.type === 'flight' && <Plane size={24} />}
                        {item.type === 'hotel' && <Hotel size={24} />}
                        {item.type === 'food' && <Utensils size={24} />}
                        {item.type === 'alert' && <AlertCircle size={24} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-muted" />
                          <span className="text-sm font-bold text-muted">{item.time}</span>
                          {item.type === 'alert' && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">Urgent</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-accent">{item.title}</h3>
                        <div className="flex items-center gap-1 text-muted text-sm mt-1">
                          <MapPin size={14} />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          item.status === 'Confirmed' ? "text-green-500" : "text-muted"
                        )}>
                          {item.status}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <ShieldCheck size={12} className="text-green-500" />
                          <span className="text-[10px] text-muted">Safe-Walk Verified</span>
                        </div>
                      </div>
                      <button className="text-gray-300 hover:text-accent transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Add Item Placeholder */}
          <div className="relative pl-12 sm:pl-20 mt-8">
            <div className="absolute left-[18px] sm:left-[26px] top-6 w-4 h-4 rounded-full bg-gray-200 border-4 border-white" />
            <button className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-200 text-muted hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 font-medium">
              <Plus size={20} />
              Add to Itinerary
            </button>
          </div>
        </div>

        {/* Safety & Navigation Quick Actions */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="bg-accent text-white p-8 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Safe-Walk Routing</h3>
              <p className="text-gray-300 mb-6">Navigation that prioritizes well-lit, high-traffic paths for solo travelers.</p>
              <button onClick={() => setActiveMap('safewalk')} className="btn-primary py-2 px-6 flex items-center gap-2">
                Start Navigation
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck size={120} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-accent mb-4">Sensory Mapping</h3>
              <p className="text-muted mb-6">Real-time crowd/noise heatmaps for neurodivergent or elderly travelers.</p>
              <button onClick={() => setActiveMap('sensory')} className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                View Heatmap
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Utensils size={120} />
            </div>
          </div>
        </div>

        {/* Map Modal Overlay */}
        <AnimatePresence>
          {activeMap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveMap(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 h-[80vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeMap === 'safewalk' ? 'bg-primary/10 text-primary' : 'bg-purple-100 text-purple-500'}`}>
                      {activeMap === 'safewalk' ? <ShieldCheck size={24} /> : <Utensils size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-accent">
                        {activeMap === 'safewalk' ? 'Safe-Walk Navigation' : 'Live Sensory Heatmap'}
                      </h3>
                      <p className="text-sm text-muted flex items-center gap-2">
                        <MapPin size={14} /> Local Routing <span className="mx-2">•</span> <WifiOff size={14} /> Available Offline
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setActiveMap(null)} className="p-2 text-gray-400 hover:text-accent bg-gray-50 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {import.meta.env.VITE_MAPBOX_TOKEN ? (
                    <MapGL
                      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                      initialViewState={{ longitude: 12.4964, latitude: 41.9028, zoom: 14 }}
                      mapStyle={activeMap === 'safewalk' ? "mapbox://styles/mapbox/navigation-night-v1" : "mapbox://styles/mapbox/dark-v11"}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <>
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
                        alt="Map Engine"
                        className={`absolute inset-0 w-full h-full object-cover opacity-60 ${activeMap === 'sensory' ? 'hue-rotate-180 contrast-150 saturate-200' : 'grayscale'}`}
                      />
                      <div className="relative z-10 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50 max-w-xs text-center">
                        <Map size={32} className="mx-auto text-primary mb-2" />
                        <p className="font-bold text-accent">Mapbox Rendering Engine</p>
                        <p className="text-xs text-muted">Add VITE_MAPBOX_TOKEN to .env</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
