import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Accessibility,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Loader2,
  MapPin,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  price: string;
  safety: number;
  accessibility: number;
  sensory: number;
  tags: string[];
}

interface PlaceInsight {
  id: string;
  type: 'review' | 'tip' | 'safety_note';
  title?: string | null;
  body: string;
  rating?: number | null;
  created_at: string;
  profiles?: {
    full_name?: string | null;
  } | null;
}

const normalizeGem = (gem: any): Destination => ({
  id: gem.id,
  name: gem.name,
  location: gem.location,
  description: gem.description || '',
  image: gem.image_url || gem.image || '',
  price: gem.price_range || gem.price || 'N/A',
  safety: Number(gem.safety_score ?? gem.safety ?? 0),
  accessibility: Number(gem.accessibility_score ?? gem.accessibility ?? 0),
  sensory: Number(gem.sensory_score ?? gem.sensory ?? 0),
  tags: gem.tags || [],
});

const insightLabels = {
  review: 'Reviews',
  tip: 'Tips',
  safety_note: 'Safety Notes',
};

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={15}
          className={star <= rating ? 'fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export default function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Destination | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Destination[]>([]);
  const [insights, setInsights] = useState<PlaceInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlace = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    const [{ data: gem }, { data: otherGems }, { data: placeInsights }] = await Promise.all([
      supabase.from('hidden_gems').select('*').eq('id', Number(id)).single(),
      supabase.from('hidden_gems').select('*').neq('id', Number(id)).limit(3),
      supabase
        .from('place_insights')
        .select('*, profiles(full_name)')
        .eq('hidden_gem_id', Number(id))
        .order('created_at', { ascending: false }),
    ]);

    if (gem) setPlace(normalizeGem(gem));
    setNearbyPlaces((otherGems || []).map(normalizeGem));
    setInsights((placeInsights || []) as PlaceInsight[]);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadPlace();
  }, [loadPlace]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="flex flex-col items-center justify-center py-24 text-muted">
          <Loader2 className="mb-4 animate-spin text-primary" size={32} />
          <p>Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-lg font-bold text-accent">Place not found</p>
          <Link to="/discovery" className="mt-4 inline-flex font-bold text-primary">
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const reviews = insights.filter(insight => insight.type === 'review');
  const tips = insights.filter(insight => insight.type === 'tip');
  const safetyNotes = insights.filter(insight => insight.type === 'safety_note');
  const averageRating = reviews.length
    ? reviews.reduce((sum, insight) => sum + Number(insight.rating || 0), 0) / reviews.length
    : 0;

  const thingsToDo = [
    `Take a slow walk through ${place.name}`,
    `Find a local cafe or viewpoint in ${place.location}`,
    `Save time for photos, food, and a quiet reset`,
  ];

  const attractions = [
    `${place.name} main viewpoint`,
    `${place.location} local market`,
    `${place.location} old streets and cultural stops`,
  ];

  const faqs = [
    {
      question: `Is ${place.name} safe for travelers?`,
      answer: `The current safety score is ${place.safety.toFixed(1)}. Read community safety notes before you go.`,
    },
    {
      question: 'When should I visit?',
      answer: 'Earlier in the day is usually better for calmer crowds, better light, and easier planning.',
    },
    {
      question: 'Can I plan a full trip from here?',
      answer: 'Yes. Use Plan a Trip and Tripser will take you into the planner flow.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <section className="relative min-h-[520px] bg-accent pt-24 text-white">
        {place.image && (
          <img
            src={place.image}
            alt={place.name}
            className="absolute inset-0 h-full w-full object-cover opacity-55"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/discovery')}
            className="mb-auto mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur transition-colors hover:bg-white/25"
          >
            <ChevronLeft size={16} /> Discovery
          </button>

          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              {place.tags.slice(0, 4).map(tag => (
                <span key={tag} className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-display text-4xl font-bold sm:text-6xl">{place.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-white/90">
              <MapPin size={18} /> {place.location}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
              {place.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/planner')}
                className="btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold"
              >
                Plan a Trip <ChevronRight size={18} />
              </button>
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm font-bold">{averageRating.toFixed(1)}/5 traveler rating</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-accent">Place Snapshot</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-green-50 p-3 text-center">
                  <Shield className="mx-auto mb-1 text-green-600" size={18} />
                  <p className="text-xs font-bold text-muted">Safety</p>
                  <p className="font-bold text-green-700">{place.safety.toFixed(1)}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <Accessibility className="mx-auto mb-1 text-blue-600" size={18} />
                  <p className="text-xs font-bold text-muted">Access</p>
                  <p className="font-bold text-blue-700">{place.accessibility.toFixed(1)}</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 text-center">
                  <Volume2 className="mx-auto mb-1 text-purple-600" size={18} />
                  <p className="text-xs font-bold text-muted">Sensory</p>
                  <p className="font-bold text-purple-700">{place.sensory.toFixed(1)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-accent">
                <Sparkles size={18} className="text-primary" /> Nearby Hidden Gems
              </h2>
              <div className="space-y-3">
                {nearbyPlaces.map(nearby => (
                  <Link
                    key={nearby.id}
                    to={`/discovery/place/${nearby.id}`}
                    className="block rounded-xl border border-gray-100 p-3 transition-colors hover:border-primary/40"
                  >
                    <p className="font-bold text-accent">{nearby.name}</p>
                    <p className="mt-1 text-xs text-muted">{nearby.location}</p>
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-2xl font-bold text-accent">Things To Do</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {thingsToDo.map(item => (
                  <div key={item} className="rounded-xl bg-gray-50 p-4 text-sm font-semibold text-accent">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-2xl font-bold text-accent">Popular Attractions</h2>
              <div className="space-y-3">
                {attractions.map(item => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
                    <MapPin className="text-primary" size={18} />
                    <span className="font-semibold text-accent">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-2xl font-bold text-accent">Community Insights</h2>
              <div className="grid gap-5 lg:grid-cols-3">
                {([
                  { type: 'review' as const, icon: MessageSquare, items: reviews },
                  { type: 'tip' as const, icon: Lightbulb, items: tips },
                  { type: 'safety_note' as const, icon: AlertTriangle, items: safetyNotes },
                ]).map(section => (
                  <div key={section.type}>
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-accent">
                      <section.icon className="text-primary" size={17} />
                      {insightLabels[section.type]}
                    </h3>
                    <div className="space-y-3">
                      {section.items.length > 0 ? section.items.map(insight => (
                        <article key={insight.id} className="rounded-xl bg-gray-50 p-4">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-accent">
                              {insight.title || insightLabels[insight.type].slice(0, -1)}
                            </p>
                            {insight.rating && renderStars(insight.rating)}
                          </div>
                          <p className="text-sm leading-relaxed text-muted">{insight.body}</p>
                          <p className="mt-3 text-xs font-semibold text-primary">
                            {insight.profiles?.full_name || 'Anonymous Traveler'}
                          </p>
                        </article>
                      )) : (
                        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-muted">
                          No {insightLabels[section.type].toLowerCase()} yet.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-accent">
                <HelpCircle className="text-primary" size={22} /> FAQs
              </h2>
              <div className="space-y-3">
                {faqs.map(faq => (
                  <details key={faq.question} className="rounded-xl border border-gray-100 p-4">
                    <summary className="cursor-pointer font-bold text-accent">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
