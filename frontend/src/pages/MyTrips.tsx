/**
 * MyTrips.tsx — Screen: Saved Itineraries
 *
 * Data flow:
 *   Supabase → itineraries (with itinerary_events count)
 *   → TripCard grid → Detail drawer (events list)
 *
 * Features:
 *   - Animated page load with staggered cards
 *   - Status badges (Upcoming / Ongoing / Completed / Draft)
 *   - Search + filter by status
 *   - Trip detail side-drawer with event timeline
 *   - Delete with confirm
 *   - Empty state for new users
 *   - Continue in Planner / View Itinerary actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Calendar, Users, Wallet, ArrowRight,
  Trash2, X, Clock, CheckCircle2, Plane,
  Search, Filter, Plus, RefreshCw, Hotel,
  Utensils, Activity, Star, ChevronRight,
  Sparkles, AlertTriangle, Eye, Edit3,
  Globe, BookOpen, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/userAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedTrip {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  event_count?: number;
  events?: TripEvent[];
}

interface TripEvent {
  id: string;
  type: string;
  time: string;
  title: string;
  location: string;
  status: string;
  order_index: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTripStatus(trip: SavedTrip): 'upcoming' | 'ongoing' | 'completed' | 'draft' {
  if (!trip.start_date) return 'draft';
  const now = new Date();
  const start = new Date(trip.start_date);
  const end = trip.end_date ? new Date(trip.end_date) : new Date(start.getTime() + 86400000 * 5);
  if (now < start) return 'upcoming';
  if (now > end)   return 'completed';
  return 'ongoing';
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDays(trip: SavedTrip): number {
  if (!trip.start_date || !trip.end_date) return 0;
  const ms = new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime();
  return Math.round(ms / 86400000) + 1;
}

function getDestinationImage(destination: string): string {
  const map: Record<string, string> = {
    rome:     'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format',
    tokyo:    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format',
    bali:     'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format',
    paris:    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format',
    london:   'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format',
    dubai:    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format',
    barcelona:'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&auto=format',
    default:  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format',
  };
  const key = destination.toLowerCase().split(',')[0].trim();
  return map[key] || map.default;
}

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-500'   },
  ongoing:   { label: 'Ongoing',   bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', dot: 'bg-green-500'  },
  completed: { label: 'Completed', bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200',  dot: 'bg-gray-400'   },
  draft:     { label: 'Draft',     bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', dot: 'bg-amber-400'  },
};

const EVENT_ICON: Record<string, React.ElementType> = {
  stay:       Hotel,
  food:       Utensils,
  activity:   Activity,
  attraction: MapPin,
  flight:     Plane,
  transit:    Plane,
};

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({
  trip, index, onOpen, onDelete
}: {
  trip: SavedTrip;
  index: number;
  onOpen: (t: SavedTrip) => void;
  onDelete: (id: string) => void;
}) {
  const status = getTripStatus(trip);
  const cfg    = STATUS_CONFIG[status];
  const days   = getDays(trip);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group overflow-hidden"
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {!imgError ? (
          <img
            src={getDestinationImage(trip.destination)}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Globe size={40} className="text-primary/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm',
            cfg.bg, cfg.text, cfg.border
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(trip.id); }}
          className="absolute top-3 right-3 p-1.5 bg-black/30 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
        >
          <Trash2 size={13} />
        </button>

        {/* Destination name */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-lg leading-snug drop-shadow-sm">
            {trip.destination}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="font-bold text-accent text-base leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {trip.title}
        </h3>

        <div className="space-y-1.5 text-[12px] text-muted font-medium mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-primary shrink-0" />
            {trip.start_date
              ? `${formatDate(trip.start_date)}${trip.end_date ? ` → ${formatDate(trip.end_date)}` : ''}`
              : 'No dates set'}
          </div>
          {days > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-primary shrink-0" />
              {days} day{days !== 1 ? 's' : ''}
            </div>
          )}
          {trip.event_count != null && (
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary shrink-0" />
              {trip.event_count} experience{trip.event_count !== 1 ? 's' : ''} planned
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onOpen(trip)}
            className="flex-1 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye size={13} /> View Trip
          </button>
          <button
            onClick={() => onOpen(trip)}
            className="p-2.5 bg-gray-50 border border-gray-200 text-accent hover:border-primary hover:text-primary rounded-xl transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Trip Detail Drawer ───────────────────────────────────────────────────────

function TripDrawer({
  trip, onClose, onNavigate
}: {
  trip: SavedTrip;
  onClose: () => void;
  onNavigate: (trip: SavedTrip) => void;
}) {
  const status = getTripStatus(trip);
  const cfg    = STATUS_CONFIG[status];
  const days   = getDays(trip);
  const grouped: Record<string, TripEvent[]> = {};

  (trip.events || []).forEach(e => {
    const key = `Day ${Math.floor(e.order_index / 100) + 1}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 36 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="relative h-52 shrink-0 overflow-hidden bg-gray-100">
          <img
            src={getDestinationImage(trip.destination)}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-0 left-0 p-5">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border mb-2',
              cfg.bg, cfg.text, cfg.border
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
              {cfg.label}
            </span>
            <h2 className="text-white font-display font-bold text-xl leading-snug drop-shadow-sm">
              {trip.title}
            </h2>
            <p className="text-white/80 text-sm font-medium mt-0.5 flex items-center gap-1">
              <MapPin size={13} /> {trip.destination}
            </p>
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100 shrink-0">
          {[
            { icon: Calendar, label: 'Start', val: formatDate(trip.start_date) },
            { icon: Clock,    label: 'Days',  val: days > 0 ? `${days}d` : '—' },
            { icon: Sparkles, label: 'Stops', val: String(trip.event_count ?? 0) },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex flex-col items-center py-4 px-3">
              <Icon size={14} className="text-primary mb-1" />
              <span className="text-[11px] text-muted font-medium">{label}</span>
              <span className="font-bold text-accent text-sm mt-0.5">{val}</span>
            </div>
          ))}
        </div>

        {/* Events timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <BookOpen size={28} className="text-muted/30 mb-3" />
              <p className="text-sm font-medium text-muted">No events saved yet.</p>
              <p className="text-xs text-muted/70 mt-1">Open this trip in the planner to add stops.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([day, events]) => (
              <div key={day} className="mb-6">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{day}</p>
                <div className="relative">
                  <div className="absolute left-[9px] top-2 bottom-2 w-[1.5px] bg-gray-100" />
                  <div className="space-y-3">
                    {events.sort((a, b) => a.order_index - b.order_index).map(e => {
                      const Icon = EVENT_ICON[e.type] || MapPin;
                      return (
                        <div key={e.id} className="relative pl-8 flex items-start gap-3">
                          <div className="absolute left-0 top-3 w-[18px] h-[18px] rounded-full bg-white border-2 border-primary/30 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Icon size={12} className="text-primary shrink-0" />
                              <span className="text-[11px] font-bold text-muted">{e.time}</span>
                              <span className={cn(
                                'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                e.status === 'Confirmed'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-amber-50 text-amber-700'
                              )}>
                                {e.status}
                              </span>
                            </div>
                            <p className="font-bold text-accent text-sm leading-snug">{e.title}</p>
                            <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1 truncate">
                              <MapPin size={9} /> {e.location}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 bg-white p-4 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-50 border border-gray-200 text-accent font-bold text-sm rounded-2xl hover:border-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onNavigate(trip)}
            className="flex-1 py-3 bg-accent text-white font-bold text-sm rounded-2xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            Open in Planner <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onPlan }: { onPlan: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-primary/8 rounded-3xl flex items-center justify-center">
          <Globe size={40} className="text-primary/40" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-md">
          <Plane size={16} className="text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-accent mb-2">No trips saved yet</h3>
      <p className="text-muted text-sm font-medium max-w-xs leading-relaxed mb-8">
        Build your first trip with the AI planner — pick a destination, set your vibe, and we'll handle the rest.
      </p>
      <button
        onClick={onPlan}
        className="btn-primary py-3 px-8 flex items-center gap-2 font-bold shadow-md"
      >
        <Plus size={18} /> Plan My First Trip
      </button>

      <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm w-full">
        {[
          { icon: Shield,  label: 'Safety-first routing' },
          { icon: Sparkles,label: 'Hidden gem picks'    },
          { icon: Wallet,  label: 'Budget tracking'     },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
            <Icon size={18} className="text-primary mx-auto mb-1.5" />
            <p className="text-[11px] font-bold text-muted leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  onConfirm, onCancel, loading
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-accent mb-2">Delete this trip?</h3>
          <p className="text-muted text-sm font-medium mb-6">This will permanently remove the itinerary and all saved events. You can't undo this.</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-50 border border-gray-200 text-accent font-bold rounded-2xl hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all',       label: 'All Trips' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'ongoing',   label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'draft',     label: 'Drafts' },
] as const;

export default function MyTrips() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trips, setTrips]           = useState<SavedTrip[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<typeof FILTER_TABS[number]['key']>('all');
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // ── Fetch trips ─────────────────────────────────────────────────────────────
  const fetchTrips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('itineraries')
        .select(`
          id, title, destination, start_date, end_date, created_at,
          itinerary_events ( id, type, time, title, location, status, order_index )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped: SavedTrip[] = (data || []).map((row: any) => ({
        id:           row.id,
        title:        row.title,
        destination:  row.destination,
        start_date:   row.start_date,
        end_date:     row.end_date,
        created_at:   row.created_at,
        event_count:  row.itinerary_events?.length ?? 0,
        events:       row.itinerary_events ?? [],
      }));

      setTrips(mapped);
    } catch (e: any) {
      setError(e.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // ── Delete trip ──────────────────────────────────────────────────────────────
  const doDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error: err } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', deleteId);
      if (err) throw err;
      setTrips(prev => prev.filter(t => t.id !== deleteId));
      if (selectedTrip?.id === deleteId) setSelectedTrip(null);
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // ── Open drawer with events ──────────────────────────────────────────────────
  const openTrip = (trip: SavedTrip) => setSelectedTrip(trip);

  // ── Filtered trips ───────────────────────────────────────────────────────────
  const filtered = trips.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' || getTripStatus(t) === filter;
    return matchesSearch && matchesFilter;
  });

  // ── Status counts for tabs ───────────────────────────────────────────────────
  const counts = trips.reduce((acc, t) => {
    const s = getTripStatus(t);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ─────────────────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <Shield size={40} className="mx-auto text-primary/40 mb-4" />
          <h2 className="text-xl font-bold text-accent mb-2">Sign in to view your trips</h2>
          <p className="text-muted text-sm mb-6 font-medium">Your saved itineraries live here.</p>
          <button onClick={() => navigate('/auth')} className="btn-primary py-3 px-8">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-display font-bold text-accent leading-tight"
            >
              My Trips
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted font-medium mt-1"
            >
              {trips.length} saved itinerar{trips.length !== 1 ? 'ies' : 'y'}
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate('/planner')}
            className="btn-primary py-3 px-6 flex items-center gap-2 font-bold shadow-md self-start sm:self-auto"
          >
            <Plus size={18} /> New Trip
          </motion.button>
        </div>

        {/* ── Stats strip ─────────────────────────────────────────────────── */}
        {trips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {[
              { icon: Globe,       label: 'Total Trips',    val: trips.length,              color: 'text-primary' },
              { icon: Plane,       label: 'Upcoming',       val: counts.upcoming  || 0,     color: 'text-blue-500' },
              { icon: CheckCircle2,label: 'Completed',      val: counts.completed || 0,     color: 'text-green-500' },
              { icon: Star,        label: 'Avg Experiences',val: trips.length
                ? Math.round(trips.reduce((s, t) => s + (t.event_count ?? 0), 0) / trips.length)
                : 0, color: 'text-amber-500' },
            ].map(({ icon: Icon, label, val, color }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className={cn("p-2 bg-gray-50 rounded-xl", color)}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-accent">{val}</p>
                  <p className="text-[11px] text-muted font-medium">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Search + filter bar ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search trips…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-accent placeholder:text-muted outline-none focus:border-primary transition-colors bg-white"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map(tab => {
              const count = tab.key === 'all' ? trips.length : (counts[tab.key] || 0);
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                    filter === tab.key
                      ? "bg-accent text-white border-accent shadow-sm"
                      : "bg-white text-muted border-gray-200 hover:border-accent/40 hover:text-accent"
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center",
                      filter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-muted"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Trips grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="h-44 bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-2/3" />
                  <div className="h-9 bg-gray-100 rounded-xl animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-16">
            <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
            <p className="text-accent font-bold mb-1">Failed to load trips</p>
            <p className="text-muted text-sm mb-4">{error}</p>
            <button onClick={fetchTrips} className="btn-primary py-2 px-6 flex items-center gap-2 mx-auto">
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.length === 0 ? (
              trips.length === 0
                ? <EmptyState onPlan={() => navigate('/planner')} />
                : (
                  <div className="col-span-full text-center py-16">
                    <Search size={28} className="mx-auto text-muted/30 mb-3" />
                    <p className="text-accent font-bold mb-1">No trips match</p>
                    <p className="text-muted text-sm">Try a different search or filter.</p>
                  </div>
                )
            ) : (
              filtered.map((trip, i) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={i}
                  onOpen={openTrip}
                  onDelete={id => setDeleteId(id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Trip detail drawer ───────────────────────────────────────────── */}
      {selectedTrip && (
        <TripDrawer
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onNavigate={trip => {
            setSelectedTrip(null);
            navigate(`/planner?tripId=${trip.id}`);
          }}
        />
      )}

      {/* ── Delete confirm modal ─────────────────────────────────────────── */}
      {deleteId && (
        <DeleteModal
          onConfirm={doDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}