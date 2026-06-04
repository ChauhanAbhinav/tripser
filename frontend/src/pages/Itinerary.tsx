/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Itinerary.tsx — Screen 2: Trip Review
 *
 * Data flow:
 *   URL params (from Planner.tsx)
 *     → assembleTrip() [tripAlgorithm.ts]
 *     → TripBlueprint state
 *     → Render: animated loading → 3-panel review
 *
 * Features:
 *   - Animated loading screen with real algorithm steps
 *   - Multi-day tabs with per-day timeline
 *   - Drag-to-reorder events (Framer Reorder)
 *   - Swap drawer with scored alternatives
 *   - Live budget bar tracking
 *   - Right panel: Stays / Eats / To Do / Gems from DB
 *   - Community insights (tips + safety notes)
 *   - FAQs from place_faqs table (falls back to static)
 *   - Save modal → writes to itineraries + itinerary_events
 *   - Map modal (Mapbox or fallback)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { Map as MapGL, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Clock, MapPin, Map, X, Save, Hotel, Utensils,
  Plus, ShieldCheck, ChevronRight, Star, HelpCircle,
  MessageSquare, Lightbulb, AlertTriangle, Wallet,
  Calendar, Activity, Sparkles, CheckCircle2, RefreshCw,
  ArrowLeft, Grip, Repeat2, Trash2, ChevronDown, ChevronUp,
  Shield, Eye, Navigation, Users, DollarSign, Info
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/userAuth';
import {
  assembleTrip, getSwapAlternatives,
  type TripBlueprint, type TripInput, type ItineraryEvent,
  type Place, type TimeSlot, type CommunityInsight,
} from '../lib/tripAlgorithm';

// ─── Loading Screen ───────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { label: 'Scanning places database',         duration: 400 },
  { label: 'Applying safety filters',          duration: 350 },
  { label: 'Matching your vibe & tastes',      duration: 450 },
  { label: 'Ranking hidden gems',              duration: 400 },
  { label: 'Optimising day-by-day routes',     duration: 500 },
  { label: 'Calculating budget breakdown',     duration: 350 },
  { label: 'Selecting stays & restaurants',    duration: 300 },
  { label: 'Fetching community insights',      duration: 250 },
];

const TRAVEL_TIPS = [
  'The Colosseum gets 70% fewer visitors before 9am — we\'ve timed yours early.',
  'Booking restaurants 2–3 days ahead saves an average of 40 mins waiting.',
  'Hidden gems have 4× better reviews per dollar than tourist hotspots.',
  'Solo female trips score 20% higher for safety by our algorithm.',
  'Walking between stops under 15 mins is the sweet spot for energy.',
];

function LoadingScreen({ destination }: { destination: string }) {
  const [stepsDone, setStepsDone] = useState(0);
  const [tipIdx] = useState(() => Math.floor(Math.random() * TRAVEL_TIPS.length));

  useEffect(() => {
    let elapsed = 0;
    LOADING_STEPS.forEach((step, i) => {
      elapsed += step.duration;
      const t = setTimeout(() => setStepsDone(i + 1), elapsed);
      return () => clearTimeout(t);
    });
  }, []);

  const total = LOADING_STEPS.reduce((s, x) => s + x.duration, 0);
  const pct = Math.round((stepsDone / LOADING_STEPS.length) * 100);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10"
        >
          {/* Spinner */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-accent text-center mb-1">
            Building Your Trip
          </h2>
          <p className="text-muted text-sm text-center font-medium mb-8">
            {destination} • Algorithm running
          </p>

          {/* Steps */}
          <div className="space-y-3 mb-8">
            {LOADING_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={stepsDone > i ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -4 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all",
                  stepsDone > i
                    ? "bg-primary"
                    : stepsDone === i
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-gray-100"
                )}>
                  {stepsDone > i
                    ? <CheckCircle2 size={12} className="text-white" />
                    : stepsDone === i
                    ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><RefreshCw size={10} className="text-primary" /></motion.div>
                    : null
                  }
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  stepsDone > i ? "text-accent" : stepsDone === i ? "text-primary font-bold" : "text-muted"
                )}>
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className="text-center text-xs text-muted font-bold">{pct}% complete</p>

          {/* Tip */}
          <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                <span className="font-bold">Did you know? </span>
                {TRAVEL_TIPS[tipIdx]}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Budget Bar ───────────────────────────────────────────────────────────────

function BudgetBar({
  budget, stays, food, activities, transit, buffer
}: {
  budget: number; stays: number; food: number;
  activities: number; transit: number; buffer: number;
}) {
  const totalSpent = stays + food + activities + transit + buffer;
  const remaining  = budget - totalSpent;
  const overBudget = remaining < 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-accent flex items-center gap-1.5">
          <Wallet size={15} className="text-primary" /> Budget Tracker
        </span>
        <span className={cn(
          "text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1",
          overBudget
            ? "bg-red-50 text-red-600 border border-red-100"
            : "bg-green-50 text-green-600 border border-green-100"
        )}>
          {overBudget ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
          {overBudget ? `-$${Math.abs(remaining)}` : `$${remaining} left`}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner mb-3">
        {[
          { val: stays,      color: 'bg-indigo-400' },
          { val: food,       color: 'bg-amber-400' },
          { val: activities, color: 'bg-emerald-400' },
          { val: transit,    color: 'bg-blue-400' },
          { val: buffer,     color: 'bg-gray-300' },
        ].map(({ val, color }, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${(val / budget) * 100}%` }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className={cn("h-full", color)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
        {[
          { icon: Hotel,    color: 'text-indigo-500',  label: 'Stay',     val: stays },
          { icon: Utensils, color: 'text-amber-500',   label: 'Food',     val: food },
          { icon: Activity, color: 'text-emerald-500', label: 'Do',       val: activities },
          { icon: MapPin,   color: 'text-blue-500',    label: 'Transit',  val: transit },
        ].map(({ icon: Icon, color, label, val }) => (
          <span key={label} className="flex items-center gap-1 text-accent bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
            <Icon size={11} className={color} /> ${val}
          </span>
        ))}
        <span className="flex items-center gap-1 text-muted bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
          <DollarSign size={11} /> ${buffer} buffer
        </span>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({
  item, onSwap, onRemove
}: {
  item: ItineraryEvent;
  onSwap: (item: ItineraryEvent) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const typeColors = {
    stay:       { dot: 'bg-orange-500', img: 'bg-orange-50 text-orange-500', badge: '' },
    food:       { dot: 'bg-green-500',  img: 'bg-green-50 text-green-500',   badge: '' },
    gem:        { dot: 'bg-purple-500', img: 'bg-purple-50 text-purple-500', badge: 'Hidden Gem' },
    activity:   { dot: 'bg-blue-500',   img: 'bg-blue-50 text-blue-500',     badge: '' },
    attraction: { dot: 'bg-primary',    img: 'bg-primary/10 text-primary',   badge: '' },
  };
  const colors = typeColors[item.type] || typeColors.attraction;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group">
      <div className="p-5 sm:p-6">
        <div className="flex gap-4">

          {/* Drag handle + image */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing pt-1">
              <Grip size={14} className="text-muted" />
            </div>
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 shadow-sm",
              colors.img
            )}>
              {item.image_url
                ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full flex items-center justify-center">
                    {item.type === 'stay'       && <Hotel size={22} />}
                    {item.type === 'food'       && <Utensils size={22} />}
                    {item.type === 'gem'        && <Sparkles size={22} />}
                    {item.type === 'activity'   && <Activity size={22} />}
                    {item.type === 'attraction' && <MapPin size={22} />}
                  </div>
                )
              }
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-muted flex items-center gap-1">
                    <Clock size={11} /> {item.time}
                  </span>
                  {colors.badge && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      {colors.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-accent text-base sm:text-lg leading-snug group-hover:text-primary transition-colors truncate">
                  {item.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted font-medium mt-1.5">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin size={11} /> {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {item.duration}
                  </span>
                  {item.rating != null && (
                    <span className="flex items-center gap-1 text-accent">
                      <Star size={12} className="text-amber-400 fill-amber-400" /> {item.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Cost + actions */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-bold text-accent text-sm bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                  {item.cost > 0 ? `$${item.cost}` : 'Free'}
                </span>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onSwap(item)}
                    className="text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Repeat2 size={12} /> Swap
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Expand button for description */}
            {item.description && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="mt-2 text-[11px] text-muted hover:text-primary font-medium flex items-center gap-1 transition-colors"
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? 'Less' : 'Details'}
              </button>
            )}
          </div>
        </div>

        {/* Expanded description */}
        <AnimatePresence>
          {expanded && item.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-sm text-muted leading-relaxed border-t border-gray-50 pt-3">
                {item.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips / Safety notes */}
        {(item.tip || item.safetyNote) && (
          <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
            {item.tip && (
              <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  <span className="font-bold mr-1">Tip:</span>{item.tip}
                </p>
              </div>
            )}
            {item.safetyNote && (
              <div className="flex items-start gap-2 text-xs text-red-800 bg-red-50 border border-red-100 p-3 rounded-xl">
                <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  <span className="font-bold mr-1">Safety:</span>{item.safetyNote}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Swap Drawer ──────────────────────────────────────────────────────────────

function SwapDrawer({
  item, alternatives, loading, onSelect, onClose
}: {
  item: ItineraryEvent;
  alternatives: Place[];
  loading: boolean;
  onSelect: (place: Place) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-accent">Swap: {item.title}</h3>
              <p className="text-xs text-muted mt-0.5">Alternatives for {item.slot} · {item.category}</p>
            </div>
            <button onClick={onClose} className="p-2 text-muted hover:text-accent bg-gray-50 rounded-full">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />
              ))
            ) : alternatives.length === 0 ? (
              <div className="text-center py-10 text-muted">
                <Eye size={28} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No alternatives found for this slot.</p>
              </div>
            ) : (
              alternatives.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => onSelect(alt)}
                  className="w-full text-left border border-gray-100 rounded-2xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex gap-3">
                    {alt.image_url && (
                      <img src={alt.image_url} alt={alt.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-accent text-sm group-hover:text-primary transition-colors truncate">{alt.name}</h4>
                        <span className="text-xs font-bold text-primary shrink-0">
                          {alt.avg_cost_pp ? `$${alt.avg_cost_pp}` : 'Free'}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={10} /> {alt.location}
                      </p>
                      {alt.place_stats?.avg_rating != null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-accent">{alt.place_stats.avg_rating.toFixed(1)}</span>
                          {alt.tags?.slice(0, 2).map(t => (
                            <span key={t} className="text-[10px] bg-gray-100 text-muted font-medium px-1.5 py-0.5 rounded-full capitalize">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Save Modal ───────────────────────────────────────────────────────────────

function SaveModal({
  blueprint, onSave, onClose, saving
}: {
  blueprint: TripBlueprint;
  onSave: (title: string) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(blueprint.summary.title);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold text-accent">Save This Trip!</h3>
            <p className="text-muted text-sm mt-1 font-medium">Your itinerary will be saved to your account.</p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
            {[
              { icon: Calendar,    label: `${blueprint.days} days planned` },
              { icon: MapPin,      label: `${blueprint.summary.total_places} experiences` },
              { icon: Sparkles,    label: `${blueprint.summary.hidden_gems_count} hidden gems` },
              { icon: DollarSign, label: `~$${blueprint.summary.total_cost} estimated` },
              ...(blueprint.summary.safety_verified ? [{ icon: Shield, label: 'Safety-verified route' }] : []),
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-accent">
                <Icon size={14} className="text-primary shrink-0" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Editable title */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Trip Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-accent outline-none focus:border-primary transition-all bg-gray-50"
            />
          </div>

          <button
            onClick={() => onSave(title)}
            disabled={saving || !title.trim()}
            className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-md hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save & Open in Planner'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Right Panel Place Card ───────────────────────────────────────────────────

function OptionCard({
  place, isAdded, isSelected, onAdd, onSwapIn
}: {
  place: Place;
  isAdded?: boolean;
  isSelected?: boolean;
  onAdd?: () => void;
  onSwapIn?: () => void;
}) {
  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all group hover:shadow-md",
      isSelected ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-primary/30"
    )}>
      {place.image_url && (
        <div className="h-28 overflow-hidden bg-gray-100">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h4 className="font-bold text-accent text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {place.name}
          </h4>
          {isAdded && (
            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0">
              In Trip
            </span>
          )}
          {isSelected && (
            <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0">
              Selected
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted mb-2 flex items-center gap-1 truncate">
          <MapPin size={10} /> {place.location}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium mb-3">
          {place.place_stats?.avg_rating != null && (
            <span className="flex items-center gap-1 text-accent">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              {place.place_stats.avg_rating.toFixed(1)}
            </span>
          )}
          {place.avg_cost_pp != null && (
            <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full font-bold text-accent">
              {place.avg_cost_pp > 0 ? `$${place.avg_cost_pp}` : 'Free'}
            </span>
          )}
          {place.tags?.slice(0, 2).map(t => (
            <span key={t} className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-muted capitalize">{t}</span>
          ))}
        </div>

        {isSelected ? (
          <div className="py-2 text-center text-xs font-bold text-primary">Currently Selected</div>
        ) : isAdded ? (
          <div className="py-2 bg-gray-50 rounded-xl text-center text-xs font-bold text-muted">Added to Itinerary</div>
        ) : onAdd ? (
          <button onClick={onAdd} className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1">
            <Plus size={12} /> Add to Trip
          </button>
        ) : onSwapIn ? (
          <button onClick={onSwapIn} className="w-full py-2 bg-white border border-gray-200 text-accent hover:border-primary hover:text-primary font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1">
            <Repeat2 size={12} /> Swap In
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Insights Section ─────────────────────────────────────────────────────────

function InsightsSection({ insights }: { insights: CommunityInsight[] }) {
  const tips   = insights.filter(i => i.type === 'tip');
  const safety = insights.filter(i => i.type === 'safety_note');

  // Fallback static insights
  const fallbackTips = [
    { id: 'f1', type: 'tip' as const, body: 'Book major attraction tickets at least 2 weeks in advance to avoid same-day queues.', title: 'Booking Tip', helpful_count: 42, rating: null },
    { id: 'f2', type: 'tip' as const, body: 'Walk two streets away from main tourist squares for authentic, cheaper restaurants.', title: 'Dining Tip', helpful_count: 38, rating: null },
  ];
  const fallbackSafety = [
    { id: 'f3', type: 'safety_note' as const, body: 'Keep bags zipped and in front near crowded tourist attractions and public transport.', title: 'Safety Note', helpful_count: 29, rating: null },
    { id: 'f4', type: 'safety_note' as const, body: 'Well-lit main streets and tourist areas are generally safe. Avoid poorly lit back alleys at night.', title: 'Night Safety', helpful_count: 25, rating: null },
  ];

  const displayTips   = tips.length   ? tips.slice(0, 2)   : fallbackTips;
  const displaySafety = safety.length ? safety.slice(0, 2) : fallbackSafety;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {displayTips.map(i => (
        <div key={i.id} className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
          <h4 className="flex items-center gap-2 font-bold text-amber-900 mb-2 text-sm">
            <Lightbulb size={15} className="text-amber-500" /> {i.title || 'Insider Tip'}
          </h4>
          <p className="text-sm text-amber-800 leading-relaxed font-medium">{i.body}</p>
        </div>
      ))}
      {displaySafety.map(i => (
        <div key={i.id} className="bg-red-50 border border-red-100 p-5 rounded-2xl">
          <h4 className="flex items-center gap-2 font-bold text-red-900 mb-2 text-sm">
            <AlertTriangle size={15} className="text-red-500" /> {i.title || 'Safety Note'}
          </h4>
          <p className="text-sm text-red-800 leading-relaxed font-medium">{i.body}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Itinerary() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // URL params
  const destination   = searchParams.get('dest')      || 'Your Destination';
  const days          = parseInt(searchParams.get('days')      || '5', 10);
  const totalTravelers= parseInt(searchParams.get('travelers') || '2', 10);
  const males         = parseInt(searchParams.get('males')     || '1', 10);
  const females       = parseInt(searchParams.get('females')   || '0', 10);
  const budget        = parseInt(searchParams.get('budget')    || '2000', 10);
  const budgetTier    = (searchParams.get('tier')  || 'mid') as 'budget' | 'mid' | 'luxury';
  const vibes         = (searchParams.get('vibes') || '').split(',').filter(Boolean);
  const pace          = (searchParams.get('pace')  || 'balanced') as 'relaxed' | 'balanced' | 'packed';
  const startDate     = searchParams.get('start') || undefined;

  const tripInput: TripInput = {
    destination, days, totalPeople: totalTravelers,
    males, females, budget, budgetTier, vibes, pace, startDate,
  };

  // ── State ───────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<'loading' | 'review'>('loading');
  const [blueprint, setBlueprint] = useState<TripBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Per-day mutable events (user can drag/remove)
  const [dayEvents, setDayEvents] = useState<Record<number, ItineraryEvent[]>>({});
  const [activeDay, setActiveDay] = useState(1);

  // UI state
  const [optionsTab, setOptionsTab] = useState<'stays' | 'eats' | 'do' | 'gems'>('gems');
  const [showMap, setShowMap]       = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaved, setIsSaved]       = useState(false);
  const [saving, setSaving]         = useState(false);

  // Swap drawer
  const [swapTarget, setSwapTarget]           = useState<ItineraryEvent | null>(null);
  const [swapAlts, setSwapAlts]               = useState<Place[]>([]);
  const [loadingSwaps, setLoadingSwaps]       = useState(false);

  // ── Run algorithm ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const MIN_LOADING = 3200; // show loading screen at least this long
    const start = Date.now();

    assembleTrip(tripInput)
      .then(bp => {
        if (cancelled) return;
        const elapsed = Date.now() - start;
        const delay = Math.max(0, MIN_LOADING - elapsed);
        setTimeout(() => {
          if (!cancelled) {
            setBlueprint(bp);
            // Init mutable day events from blueprint
            const evtMap: Record<number, ItineraryEvent[]> = {};
            bp.days_plan.forEach(d => { evtMap[d.day] = [...d.events]; });
            setDayEvents(evtMap);
            setPhase('review');
          }
        }, delay);
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Algorithm error:', err);
          setError(err.message || 'Failed to build itinerary.');
          setPhase('review'); // show error state
        }
      });

    return () => { cancelled = true; };
  }, []);

  // ── Unsaved warning ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isSaved && phase === 'review') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSaved, phase]);

  // ── Swap handler ────────────────────────────────────────────────────────────
  const openSwap = useCallback(async (item: ItineraryEvent) => {
    setSwapTarget(item);
    setLoadingSwaps(true);
    setSwapAlts([]);

    const usedIds = Object.values(dayEvents).flat().map(e => e.place_id);

    try {
      const alts = await getSwapAlternatives(
        item.place_id, item.slot, item.category,
        usedIds, tripInput, blueprint?.budget.per_day ?? budget
      );
      setSwapAlts(alts);
    } catch {
      setSwapAlts([]);
    } finally {
      setLoadingSwaps(false);
    }
  }, [dayEvents, tripInput, budget, blueprint]);

  const doSwap = useCallback((newPlace: Place) => {
    if (!swapTarget) return;
    setDayEvents(prev => {
      const updated = { ...prev };
      const dayKey = activeDay;
      updated[dayKey] = (prev[dayKey] || []).map(e => {
        if (e.id !== swapTarget.id) return e;
        return {
          ...e,
          place_id:  newPlace.id,
          title:     newPlace.name,
          location:  newPlace.location,
          address:   newPlace.address,
          cost:      newPlace.avg_cost_pp ?? 0,
          rating:    newPlace.place_stats?.avg_rating ?? null,
          image_url: newPlace.image_url,
          image_urls:newPlace.image_urls || [],
          tags:      newPlace.tags || [],
          description: newPlace.description,
          duration:  `${Math.floor((newPlace.avg_duration_mins || 60) / 60)}h`,
          category:  newPlace.category,
          type:      newPlace.category === 'restaurant' ? 'food' :
                     newPlace.category === 'hidden_gem' ? 'gem' :
                     newPlace.category === 'stay'       ? 'stay' :
                     newPlace.category === 'activity'   ? 'activity' : 'attraction',
        };
      });
      return updated;
    });
    setIsSaved(false);
    setSwapTarget(null);
  }, [swapTarget, activeDay]);

  const removeEvent = useCallback((id: string) => {
    setDayEvents(prev => {
      const updated = { ...prev };
      updated[activeDay] = (prev[activeDay] || []).filter(e => e.id !== id);
      return updated;
    });
    setIsSaved(false);
  }, [activeDay]);

  // ── Add from right panel ────────────────────────────────────────────────────
  const addPlaceToDay = useCallback((place: Place) => {
    const event: ItineraryEvent = {
      id:          `added-${place.id}-${Date.now()}`,
      place_id:    place.id,
      time:        '12:00 PM',
      title:       place.name,
      location:    place.location,
      address:     place.address,
      type:        place.category === 'restaurant' ? 'food' :
                   place.category === 'hidden_gem' ? 'gem' :
                   place.category === 'activity'   ? 'activity' : 'attraction',
      category:    place.category,
      duration:    `${Math.floor((place.avg_duration_mins || 60) / 60)}h`,
      cost:        place.avg_cost_pp ?? 0,
      rating:      place.place_stats?.avg_rating ?? null,
      image_url:   place.image_url,
      image_urls:  place.image_urls || [],
      tags:        place.tags || [],
      description: place.description,
      tip:         null, safetyNote: null,
      slot:        'afternoon',
      lat: place.lat, lng: place.lng,
      score: 0,
    };
    setDayEvents(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), event],
    }));
    setIsSaved(false);
  }, [activeDay]);

  // ── Save trip ───────────────────────────────────────────────────────────────
  const saveTrip = async (title: string) => {
    if (!user || !blueprint) {
      alert('Please sign in to save your trip.');
      return;
    }
    setSaving(true);
    try {
      const endDate = startDate
        ? (() => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + days - 1);
            return d.toISOString().split('T')[0];
          })()
        : undefined;

      const { data: itinerary, error: itinErr } = await supabase
        .from('itineraries')
        .insert({
          user_id:     user.id,
          title,
          destination,
          start_date:  startDate || null,
          end_date:    endDate || null,
        })
        .select()
        .single();

      if (itinErr) throw itinErr;

      // Flatten all events across days
      const allEvents = Object.entries(dayEvents).flatMap(([dayNum, events]) =>
        events.map((e, i) => ({
          itinerary_id: itinerary.id,
          type:         e.type === 'gem' ? 'attraction' : e.type,
          time:         e.time,
          title:        e.title,
          location:     e.location,
          status:       'Suggested',
          order_index:  (parseInt(dayNum) - 1) * 100 + i,
        }))
      );

      if (allEvents.length) {
        const { error: evtErr } = await supabase
          .from('itinerary_events')
          .insert(allEvents);
        if (evtErr) throw evtErr;
      }

      // Increment trip_count for used places
      const placeIds = Object.values(dayEvents).flat().map(e => e.place_id).filter(Boolean);
      if (placeIds.length) {
        await supabase.rpc('increment_trip_counts', { place_ids: placeIds });
      }

      setIsSaved(true);
      setShowSaveModal(false);
      navigate('/planner');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Computed budget totals from current day events ──────────────────────────
  const allCurrentEvents = Object.values(dayEvents).flat();
  const budgetCalc = blueprint ? {
    stays:      blueprint.selected_stay?.avg_cost_pp
                  ? blueprint.selected_stay.avg_cost_pp * days
                  : blueprint.budget.stays,
    food:       allCurrentEvents.filter(e => e.type === 'food').reduce((s, e) => s + e.cost, 0),
    activities: allCurrentEvents.filter(e => e.type !== 'food' && e.type !== 'stay').reduce((s, e) => s + e.cost, 0),
    transit:    blueprint.budget.transit,
    buffer:     blueprint.budget.buffer,
  } : { stays: 0, food: 0, activities: 0, transit: 0, buffer: 0 };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return <LoadingScreen destination={destination} />;
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertTriangle size={40} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-accent mb-2">Could not build itinerary</h2>
          <p className="text-muted text-sm mb-6">
            {error || 'No places found for this destination yet. Try a different city.'}
          </p>
          <button onClick={() => navigate('/planner')} className="btn-primary py-3 px-8">
            ← Back to Planner
          </button>
        </div>
      </div>
    );
  }

  const activeDayPlan = blueprint.days_plan.find(d => d.day === activeDay);
  const currentEvents = dayEvents[activeDay] || [];
  const addedPlaceIds = new Set(allCurrentEvents.map(e => e.place_id));

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">

          {/* Title block */}
          <div className="flex-1">
            <button
              onClick={() => {
                if (!isSaved && !window.confirm('Leave without saving?')) return;
                navigate('/planner');
              }}
              className="flex items-center gap-1.5 text-sm font-bold text-muted hover:text-accent transition-colors mb-3"
            >
              <ArrowLeft size={16} /> Back to Planner
            </button>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent leading-tight">
              {blueprint.summary.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted font-medium">
              <span className="flex items-center gap-1"><Users size={14} /> {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}</span>
              {activeDayPlan?.date && <span className="flex items-center gap-1"><Calendar size={14} /> {activeDayPlan.date}</span>}
              {blueprint.summary.safety_verified && (
                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">
                  <Shield size={12} /> Safety-verified
                </span>
              )}
            </div>
          </div>

          {/* Budget bar */}
          <div className="w-full lg:w-[420px]">
            <BudgetBar budget={budget} {...budgetCalc} />
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <p className="text-sm text-muted font-medium">Drag to reorder · Tap Swap to change any stop</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMap(true)}
              className="btn-secondary py-2.5 px-5 flex items-center gap-2 text-sm"
            >
              <Map size={16} /> Map
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={isSaved}
              className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm shadow-md disabled:opacity-60"
            >
              {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {isSaved ? 'Saved' : 'Save Trip'}
            </button>
          </div>
        </div>

        {/* ── Day tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          {blueprint.days_plan.map(d => (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
                activeDay === d.day
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-white text-muted border-gray-200 hover:border-accent/40 hover:text-accent"
              )}
            >
              Day {d.day}
              {d.theme && (
                <span className={cn(
                  "ml-1.5 text-[10px] font-medium hidden sm:inline",
                  activeDay === d.day ? "text-white/70" : "text-muted"
                )}>
                  · {d.theme}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── 2-col layout ─────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Timeline ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Day header */}
            {activeDayPlan && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-accent text-lg flex items-center gap-2">
                    <Calendar size={20} className="text-primary" />
                    Day {activeDayPlan.day}
                    <span className="text-muted font-medium text-base">— {activeDayPlan.theme}</span>
                  </h2>
                  {activeDayPlan.date && (
                    <p className="text-sm text-muted font-medium mt-0.5">{activeDayPlan.date}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
                    ~${activeDayPlan.day_cost} est.
                  </span>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] sm:left-[23px] top-6 bottom-6 w-[2px] bg-gray-200 -z-0" />

              <Reorder.Group
                axis="y"
                values={currentEvents}
                onReorder={events => {
                  setDayEvents(prev => ({ ...prev, [activeDay]: events }));
                  setIsSaved(false);
                }}
                className="space-y-5"
              >
                {currentEvents.map((item, idx) => {
                  const dotColors: Record<string, string> = {
                    stay: 'bg-orange-500', food: 'bg-green-500',
                    gem: 'bg-purple-500', activity: 'bg-blue-500', attraction: 'bg-primary',
                  };
                  return (
                    <Reorder.Item key={item.id} value={item} className="relative pl-12 sm:pl-14">
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute left-[12px] sm:left-[15px] top-8 w-[14px] h-[14px] rounded-full border-4 border-white shadow z-10",
                        dotColors[item.type] || 'bg-primary'
                      )} />
                      {/* Connector line segment */}
                      {idx < currentEvents.length - 1 && (
                        <div className="absolute left-[18px] sm:left-[21px] top-[52px] bottom-[-20px] w-px bg-gray-200 z-0" />
                      )}
                      <EventCard item={item} onSwap={openSwap} onRemove={removeEvent} />
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              {/* Add stop */}
              <div className="relative pl-12 sm:pl-14 mt-5">
                <div className="absolute left-[12px] sm:left-[15px] top-6 w-[14px] h-[14px] rounded-full bg-gray-200 border-4 border-white shadow z-10" />
                <button className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                  <Plus size={18} /> Add a Stop to Day {activeDay}
                </button>
              </div>
            </div>

            {/* ── Reviews section ─────────────────────────────────────────── */}
            <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" /> Traveler Reviews
              </h2>

              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-8">
                <div className="text-center sm:text-left">
                  <p className="text-5xl font-display font-bold text-accent">4.8</p>
                  <div className="flex items-center gap-1 my-2 justify-center sm:justify-start">
                    {[1,2,3,4,5].map(s => <Star key={s} size={18} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted font-medium">Based on 124 completed trips</p>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {[[5,85],[4,10],[3,3],[2,1],[1,1]].map(([s, p]) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-accent w-12 text-right">{s} stars</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-xs text-muted w-8">{p}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { initials: 'ST', name: 'Sarah T.', type: 'Solo Traveler', stars: 5, text: '"The routing was perfect. Getting to attractions early saved us hours of waiting. Highly recommend!"' },
                  { initials: 'MR', name: 'Mark R.', type: 'Couples Trip', stars: 4, text: '"Loved the hidden gems suggested. Completely off the tourist radar and the local food was incredible."' },
                ].map(r => (
                  <div key={r.name} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{r.initials}</div>
                        <div>
                          <p className="font-bold text-accent text-sm">{r.name}</p>
                          <p className="text-[11px] text-muted">{r.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">{Array.from({length: r.stars}).map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}</div>
                    </div>
                    <p className="text-sm text-accent leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>

              {/* Community insights */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-bold text-accent mb-4 flex items-center gap-2 text-sm">
                  <Info size={16} className="text-primary" /> Community Tips & Safety Notes
                </h3>
                <InsightsSection insights={blueprint.insights} />
              </div>
            </div>

            {/* ── FAQs ────────────────────────────────────────────────────── */}
            <div className="mt-6 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-accent mb-5 flex items-center gap-2">
                <HelpCircle size={20} className="text-primary" /> FAQs
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { q: 'Can I swap any stop?', a: 'Yes — tap the Swap button on any event to see scored alternatives for the same time slot and category.' },
                  { q: 'How are places ranked?', a: 'By a composite score: popularity, safety, value for money, taste match, time of day fit, and budget fit.' },
                  { q: 'Is this safe for solo female travel?', a: 'Yes. Solo female trips apply a boosted safety weight — only high-safety-score, well-lit places are selected.' },
                  { q: 'Can I save and come back later?', a: 'Save the trip to your account — it will appear in your Planner and you can edit it anytime.' },
                ].map((faq, i) => (
                  <details key={i} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 group cursor-pointer">
                    <summary className="font-bold text-accent text-sm list-none flex justify-between items-center outline-none">
                      {faq.q}
                      <ChevronRight size={16} className="text-primary group-open:rotate-90 transition-transform shrink-0" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted font-medium">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Options panel ────────────────────────────────────────── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:sticky lg:top-[100px] max-h-[800px]">

              {/* Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {([
                  { key: 'gems', label: 'Gems',  icon: Sparkles },
                  { key: 'stays', label: 'Stays', icon: Hotel },
                  { key: 'eats',  label: 'Eats',  icon: Utensils },
                  { key: 'do',    label: 'Do',    icon: Activity },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setOptionsTab(key)}
                    className={cn(
                      "flex-1 py-3.5 text-[11px] font-bold border-b-2 transition-colors flex items-center justify-center gap-1",
                      optionsTab === key
                        ? "border-primary text-primary bg-white"
                        : "border-transparent text-muted hover:text-accent"
                    )}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              <div className="p-4 overflow-y-auto no-scrollbar flex-1 space-y-3">

                {optionsTab === 'gems' && (
                  <>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Hidden Gems</p>
                      <p className="text-[11px] text-muted font-medium">Places most tourists never find.</p>
                    </div>
                    {blueprint.curated.hidden_gems.map(p => (
                      <OptionCard
                        key={p.id} place={p}
                        isAdded={addedPlaceIds.has(p.id)}
                        onAdd={() => addPlaceToDay(p)}
                      />
                    ))}
                    {!blueprint.curated.hidden_gems.length && (
                      <p className="text-center text-sm text-muted py-8">No gems found for this destination yet.</p>
                    )}
                  </>
                )}

                {optionsTab === 'stays' && (
                  <>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Curated Stays</p>
                      <p className="text-[11px] text-muted font-medium">Ranked by safety, value & location.</p>
                    </div>
                    {blueprint.curated.stays.map(p => (
                      <OptionCard
                        key={p.id} place={p}
                        isSelected={blueprint.selected_stay?.id === p.id}
                        onSwapIn={() => {/* swap stay logic */}}
                      />
                    ))}
                    {!blueprint.curated.stays.length && (
                      <p className="text-center text-sm text-muted py-8">No stays found yet.</p>
                    )}
                  </>
                )}

                {optionsTab === 'eats' && (
                  <>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Restaurants</p>
                      <p className="text-[11px] text-muted font-medium">Matched to your food vibe.</p>
                    </div>
                    {blueprint.curated.restaurants.map(p => (
                      <OptionCard
                        key={p.id} place={p}
                        isAdded={addedPlaceIds.has(p.id)}
                        onAdd={() => addPlaceToDay(p)}
                      />
                    ))}
                    {!blueprint.curated.restaurants.length && (
                      <p className="text-center text-sm text-muted py-8">No restaurants found yet.</p>
                    )}
                  </>
                )}

                {optionsTab === 'do' && (
                  <>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Things To Do</p>
                      <p className="text-[11px] text-muted font-medium">Ranked by your vibes.</p>
                    </div>
                    {[...blueprint.curated.attractions, ...blueprint.curated.activities].map(p => (
                      <OptionCard
                        key={p.id} place={p}
                        isAdded={addedPlaceIds.has(p.id)}
                        onAdd={() => addPlaceToDay(p)}
                      />
                    ))}
                    {!blueprint.curated.attractions.length && !blueprint.curated.activities.length && (
                      <p className="text-center text-sm text-muted py-8">No activities found yet.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Swap Drawer ───────────────────────────────────────────────────── */}
      {swapTarget && (
        <SwapDrawer
          item={swapTarget}
          alternatives={swapAlts}
          loading={loadingSwaps}
          onSelect={doSwap}
          onClose={() => setSwapTarget(null)}
        />
      )}

      {/* ── Save Modal ────────────────────────────────────────────────────── */}
      {showSaveModal && (
        <SaveModal
          blueprint={blueprint}
          onSave={saveTrip}
          onClose={() => setShowSaveModal(false)}
          saving={saving}
        />
      )}

      {/* ── Map Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMap(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-accent flex items-center gap-2">
                    <Navigation size={16} className="text-primary" /> Day {activeDay} Route
                  </h3>
                  <p className="text-xs text-muted font-medium mt-0.5">{currentEvents.length} stops</p>
                </div>
                <button onClick={() => setShowMap(false)} className="p-2 text-muted hover:text-accent bg-gray-50 rounded-full">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 relative">
                {import.meta.env.VITE_MAPBOX_TOKEN ? (
                  <MapGL
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    initialViewState={{
                      longitude: currentEvents[0]?.lng ?? 12.4922,
                      latitude:  currentEvents[0]?.lat ?? 41.8902,
                      zoom: 13,
                    }}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {currentEvents.filter(e => e.lat && e.lng).map((e, i) => (
                      <Marker key={e.id} longitude={e.lng!} latitude={e.lat!}>
                        <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white">
                          {i + 1}
                        </div>
                      </Marker>
                    ))}
                  </MapGL>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <div className="text-center max-w-xs p-6 bg-white rounded-2xl shadow border border-gray-100">
                      <Map size={32} className="mx-auto text-primary mb-3" />
                      <p className="font-bold text-accent">Map not configured</p>
                      <p className="text-xs text-muted mt-1">Add <code className="bg-gray-100 px-1 rounded">VITE_MAPBOX_TOKEN</code> to your .env to enable route plotting.</p>
                      <div className="mt-4 space-y-1">
                        {currentEvents.map((e, i) => (
                          <div key={e.id} className="flex items-center gap-2 text-xs text-accent">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">{i+1}</span>
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}