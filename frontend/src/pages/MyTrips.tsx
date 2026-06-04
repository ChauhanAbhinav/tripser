import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Plus, Loader2, ChevronRight, Navigation, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/userAuth';
import { useToast } from '../components/Toast';

interface SavedItinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
];

// Helper to deterministically pick a beautiful fallback image based on trip ID
function getTripImage(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
}

export default function MyTrips() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [trips, setTrips] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchTrips() {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setTrips(data);
      }
      setIsLoading(false);
    }

    fetchTrips();
  }, [user]);

  const handleDeleteTrip = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the itinerary
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    
    setIsDeleting(id);
    const { error } = await supabase.from('itineraries').delete().eq('id', id);
    
    if (error) {
      toast(`Failed to delete trip: ${error.message}`, 'error');
    } else {
      setTrips(prev => prev.filter(t => t.id !== id));
      toast('Trip deleted successfully.', 'success');
    }
    setIsDeleting(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="text-primary mb-4" size={48} />
        <h2 className="text-2xl font-bold text-accent mb-2">Sign in to view your trips</h2>
        <p className="text-muted mb-6">Create an account to save and manage your itineraries.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent">My Trips</h1>
            <p className="text-muted mt-2 font-medium text-sm sm:text-base">Manage your upcoming adventures and past memories.</p>
          </div>
          <button onClick={() => navigate('/planner')} className="btn-primary py-3 px-6 flex items-center justify-center gap-2">
            <Plus size={18} /> Plan New Trip
          </button>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
            <Navigation size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-accent mb-2">No trips planned yet</h3>
            <p className="text-muted mb-6 max-w-md">Your saved itineraries will appear here. Start by exploring destinations or jumping straight into the planner.</p>
            <button onClick={() => navigate('/planner')} className="btn-secondary py-2.5 px-6">
              Start Planning
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {trips.map((trip, i) => (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all flex flex-col overflow-hidden group">
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <img src={getTripImage(trip.id)} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-white font-display font-bold text-2xl line-clamp-1">{trip.title}</h3>
                  </div>
                  <button onClick={(e) => handleDeleteTrip(e, trip.id)} disabled={isDeleting === trip.id} className="absolute top-4 right-4 p-2.5 bg-white/20 hover:bg-red-500 hover:text-white text-white backdrop-blur-md rounded-full transition-all disabled:opacity-50">
                    {isDeleting === trip.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-muted text-sm font-medium mb-3">
                    <MapPin size={16} className="text-primary" /> {trip.destination}
                  </div>
                  {trip.start_date && (
                    <div className="flex items-center gap-2 text-muted text-sm font-medium mb-6">
                      <Calendar size={16} className="text-primary" /> {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {trip.end_date && ` — ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </div>
                  )}
                  <Link to={`/itinerary?id=${trip.id}`} className="mt-auto w-full py-3 bg-gray-50 text-accent font-bold rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                    View Itinerary <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}