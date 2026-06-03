import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronLeft, Loader2, MapPin, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface StoryDetails {
  id: string;
  title: string;
  excerpt?: string | null;
  body: string;
  image_url?: string | null;
  mood?: string | null;
  created_at: string;
  author: string;
  avatar?: string | null;
  place?: {
    id: number;
    name: string;
    location: string;
    image_url?: string | null;
  } | null;
}

function fallbackImage(seed: string) {
  const images = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&auto=format&fit=crop',
  ];
  return images[seed.length % images.length];
}

export default function TravelStoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStory = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    const { data } = await supabase
      .from('travel_stories')
      .select('*, profiles(full_name, avatar_url), places(id, name, location, image_url)')
      .eq('id', id)
      .single();

    if (data) {
      setStory({
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        image_url: data.image_url || data.places?.image_url,
        mood: data.mood,
        created_at: data.created_at,
        author: data.profiles?.full_name || 'Anonymous Traveler',
        avatar: data.profiles?.avatar_url,
        place: data.places,
      });
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="flex flex-col items-center justify-center py-24 text-muted">
          <Loader2 className="mb-4 animate-spin text-primary" size={32} />
          <p>Loading travel story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-lg font-bold text-accent">Story not found</p>
          <Link to="/community" className="mt-4 inline-flex font-bold text-primary">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = story.image_url || fallbackImage(story.title);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <section className="relative min-h-[560px] bg-accent pt-24 text-white">
        <img
          src={heroImage}
          alt={story.title}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/35" />

        <div className="relative mx-auto flex min-h-[560px] max-w-5xl flex-col justify-end px-4 pb-10 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/community')}
            className="mb-auto mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur transition-colors hover:bg-white/25"
          >
            <ChevronLeft size={16} /> Community
          </button>

          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {story.mood && (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                  {story.mood}
                </span>
              )}
              {story.place && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                  {story.place.name}
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">{story.title}</h1>
            {story.excerpt && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{story.excerpt}</p>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-bold text-white">
                  {story.avatar ? (
                    <img src={story.avatar} alt={story.author} className="h-full w-full object-cover" />
                  ) : (
                    story.author.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-bold text-accent">{story.author}</p>
                  <p className="text-xs text-muted">{new Date(story.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </section>

            {story.place && (
              <Link
                to={`/discovery/place/${story.place.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                  <MapPin size={15} /> Place
                </p>
                <h2 className="text-lg font-bold text-accent">{story.place.name}</h2>
                <p className="mt-1 text-sm text-muted">{story.place.location}</p>
              </Link>
            )}
          </aside>

          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-2 text-primary">
              <BookOpen size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Travel Story</span>
            </div>
            <div className="space-y-5 text-base leading-8 text-accent">
              {story.body.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-primary/10 p-5 text-sm leading-relaxed text-accent">
              <div className="mb-2 flex items-center gap-2 font-bold text-primary">
                <Sparkles size={16} /> From the community
              </div>
              Real traveler stories help make places feel less abstract before you go.
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
