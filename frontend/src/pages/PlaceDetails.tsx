import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Accessibility,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  Lightbulb,
  Loader2,
  MapPin,
  MessageSquare,
  Shield,
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
  profiles?: {
    full_name?: string | null;
  } | null;
}

const normalizePlace = (gem: any): Destination => ({
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

function imageFor(seed: string, index: number) {
  const images = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=900&auto=format&fit=crop',
  ];
  return images[(seed.length + index) % images.length];
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-accent">{title}</h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <button className="w-fit rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-accent transition-colors hover:border-primary hover:text-primary">
        View more
      </button>
    </div>
  );
}

function ImageCard({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="h-44 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-accent">{title}</h3>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
    </article>
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
      supabase.from('places').select('*').eq('id', Number(id)).single(),
      supabase.from('places').select('*').neq('id', Number(id)).limit(3),
      supabase
        .from('place_insights')
        .select('*, profiles(full_name)')
        .eq('place_id', Number(id))
        .order('created_at', { ascending: false }),
    ]);

    if (gem) setPlace(normalizePlace(gem));
    setNearbyPlaces((otherGems || []).map(normalizePlace));
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

  const hiddenGems = [
    { title: `Quiet corner near ${place.name}`, subtitle: 'A calmer stop away from the main flow', image: imageFor(place.name, 0) },
    { title: `${place.location} local favorite`, subtitle: 'A low-key place worth asking locals about', image: imageFor(place.location, 1) },
    { title: 'Small viewpoint nearby', subtitle: 'Good for a short detour and better photos', image: imageFor(place.name + place.location, 2) },
  ];

  const thingsToDo = [
    { title: `Slow walk through ${place.name}`, subtitle: 'Best for first impressions and quiet discovery', image: imageFor(place.name, 3) },
    { title: `Local cafe in ${place.location}`, subtitle: 'Pause, people-watch, and map the rest of your day', image: imageFor(place.location, 4) },
    { title: 'Golden-hour photo stop', subtitle: 'Save time for soft light, views, and a reset', image: imageFor(place.name, 5) },
  ];

  const attractions = [
    { title: `${place.name} main viewpoint`, subtitle: 'The easiest anchor for a short visit', image: imageFor(place.name, 6) },
    { title: `${place.location} local market`, subtitle: 'Food, small shops, and local texture', image: imageFor(place.location, 7) },
    { title: 'Old streets and cultural stops', subtitle: 'A simple route for history and atmosphere', image: imageFor(place.name, 8) },
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/35" />

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
              <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                {reviews.length > 0 ? renderStars(Math.round(averageRating)) : renderStars(0)}
                <span className="text-sm font-bold">
                  {reviews.length > 0 ? `${averageRating.toFixed(1)}/5 traveler rating` : 'No traveler rating yet'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section>
            <SectionHeader title="Hidden Gems" subtitle={`Low-key finds inside and around ${place.name}.`} />
            <div className="grid gap-5 md:grid-cols-3">
              {hiddenGems.map(gem => (
                <ImageCard key={gem.title} title={gem.title} subtitle={gem.subtitle} image={gem.image} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Things To Do" subtitle="Simple, high-signal ideas for spending your time well." />
            <div className="grid gap-5 md:grid-cols-3">
              {thingsToDo.map(item => (
                <ImageCard key={item.title} title={item.title} subtitle={item.subtitle} image={item.image} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Popular Attractions" subtitle="Recognizable stops that help anchor the itinerary." />
            <div className="grid gap-5 md:grid-cols-3">
              {attractions.map(item => (
                <ImageCard key={item.title} title={item.title} subtitle={item.subtitle} image={item.image} />
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-accent">
                <Compass className="text-primary" size={20} /> Snapshot
              </h2>
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

              {nearbyPlaces.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Nearby Places</h3>
                  <div className="space-y-2">
                    {nearbyPlaces.map(nearby => (
                      <Link
                        key={nearby.id}
                        to={`/discovery/place/${nearby.id}`}
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm font-bold text-accent transition-colors hover:text-primary"
                      >
                        {nearby.name}
                        <ChevronRight size={15} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xl font-bold text-accent">Community Insights</h2>
              <div className="space-y-3">
                {([
                  { type: 'review' as const, icon: MessageSquare, items: reviews },
                  { type: 'tip' as const, icon: Lightbulb, items: tips },
                  { type: 'safety_note' as const, icon: AlertTriangle, items: safetyNotes },
                ]).map(section => (
                  <details key={section.type} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-bold text-accent">
                        <section.icon className="text-primary" size={17} />
                        {insightLabels[section.type]}
                      </span>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-muted">
                        {section.items.length}
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      {section.items.length > 0 ? section.items.map(insight => (
                        <article key={insight.id} className="rounded-xl bg-white p-4">
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-muted">
                          No {insightLabels[section.type].toLowerCase()} yet.
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-accent">
              <HelpCircle className="text-primary" size={22} /> FAQs
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {faqs.map(faq => (
                <details key={faq.question} className="rounded-xl border border-gray-100 p-4">
                  <summary className="cursor-pointer font-bold text-accent">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
