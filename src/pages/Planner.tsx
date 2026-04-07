import React, { useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
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
import { cn } from '@/src/lib/utils';

const INITIAL_ITEMS = [
  { id: '1', type: 'flight', time: '09:00 AM', title: 'Flight to Rome', location: 'JFK Airport', status: 'On Time' },
  { id: '2', type: 'hotel', time: '02:00 PM', title: 'Check-in: Hotel de la Ville', location: 'Via Sistina, 69', status: 'Confirmed' },
  { id: '3', type: 'food', time: '07:30 PM', title: 'Dinner at Armando al Pantheon', location: 'Salita de\' Crescenzi, 31', status: 'Reserved' },
];

export default function Planner() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [isPivoting, setIsPivoting] = useState(false);
  const [showPivotAlert, setShowPivotAlert] = useState(false);

  const handlePivot = () => {
    setIsPivoting(true);
    // Simulate AI re-routing
    setTimeout(() => {
      setItems(prev => [
        { id: '0', type: 'alert', time: 'ASAP', title: 'Flight Delayed: 2h', location: 'Re-routing active', status: 'Action Required' },
        ...prev
      ]);
      setIsPivoting(false);
      setShowPivotAlert(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-accent">Trip Planner</h1>
            <p className="text-muted mt-2">Drag and drop to reorder. AI handles the rest.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePivot}
              disabled={isPivoting}
              className={cn(
                "btn-primary bg-accent flex items-center gap-2 relative overflow-hidden group",
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
            <button className="p-3 bg-white rounded-xl border border-gray-200 text-accent hover:border-primary transition-all">
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
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 -z-10" />

          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-6">
            {items.map((item) => (
              <Reorder.Item 
                key={item.id} 
                value={item}
                className="relative pl-20"
              >
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute left-[26px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10",
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
          <div className="relative pl-20 mt-8">
             <div className="absolute left-[26px] top-6 w-4 h-4 rounded-full bg-gray-200 border-4 border-white" />
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
              <button className="btn-primary py-2 px-6 flex items-center gap-2">
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
              <button className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                View Heatmap
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Utensils size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
