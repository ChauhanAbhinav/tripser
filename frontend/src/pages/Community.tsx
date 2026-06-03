import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  Shield,
  Sparkles,
  Star,
  ThumbsUp,
  WifiOff,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getValidatedAuthSession } from '../lib/authSession';
import { useToast } from '../components/Toast';

interface LiveVibe {
  id: number;
  user: string;
  location: string;
  time: string;
  safety: number;
  sensory: string;
  message: string;
  tags: string[];
  upvotes: number;
  hasVoted?: boolean;
}

interface Place {
  id: number;
  name: string;
  location: string;
  safety_score?: number | null;
  sensory_score?: number | null;
  tags?: string[] | null;
  image_url?: string | null;
}

interface TravelStory {
  id: string;
  title: string;
  excerpt?: string | null;
  body: string;
  image_url?: string | null;
  mood?: string | null;
  created_at: string;
  author: string;
  place?: string | null;
  location?: string | null;
}

const insightTypes = [
  { value: 'vibe_check' as const, label: 'Vibe Checkin' },
  { value: 'review', label: 'Review' },
  { value: 'tip', label: 'Tip' },
  { value: 'safety_note', label: 'Safety Note' },
] as const;

type InsightType = typeof insightTypes[number]['value'];

const vibeOptions = [
  { value: 'Great', label: 'Great', score: 9 },
  { value: 'Calm', label: 'Calm', score: 8 },
  { value: 'Busy', label: 'Busy', score: 7 },
  { value: 'Needs caution', label: 'Needs caution', score: 5 },
];

const reviewSignals = ['Good', 'Moderate', 'Bad'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

function safetyColor(score: number): string {
  if (score >= 9) return 'text-emerald-600 bg-emerald-50';
  if (score >= 7) return 'text-amber-600 bg-amber-50';
  return 'text-red-500 bg-red-50';
}

function RealtimeDot({ connected }: { connected: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold">
      {connected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-emerald-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff size={12} className="text-gray-400" />
          <span className="text-gray-400">Offline</span>
        </>
      )}
    </span>
  );
}

export default function Community() {
  const { toast } = useToast();
  const newVibeIds = useRef<Set<number>>(new Set());

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [vibes, setVibes] = useState<LiveVibe[]>([]);
  const [stories, setStories] = useState<TravelStory[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState<Set<number>>(new Set());
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [, forceUpdate] = useState(0);
  const [insightForm, setInsightForm] = useState({
    gemId: '',
    type: 'vibe_check' as InsightType,
    vibe: 'Great',
    reviewSignal: 'Good',
    rating: 5,
    message: '',
  });
  const [storyForm, setStoryForm] = useState({
    gemId: '',
    title: '',
    excerpt: '',
    body: '',
    mood: 'Memorable',
  });

  useEffect(() => {
    getValidatedAuthSession().then(({ user }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        return;
      }

      setTimeout(() => {
        getValidatedAuthSession().then(({ user }) => {
          setUser(user);
        });
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(async (currentUser: any) => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (data) setProfile(data);
  }, []);

  const loadPlaces = useCallback(async () => {
    const { data } = await supabase
      .from('places')
      .select('id, name, location, safety_score, sensory_score, tags, image_url')
      .order('created_at', { ascending: false });

    setPlaces(data || []);
    if (data?.[0]) {
      setInsightForm(prev => prev.gemId ? prev : { ...prev, gemId: String(data[0].id) });
      setStoryForm(prev => prev.gemId ? prev : { ...prev, gemId: String(data[0].id) });
    }
  }, []);

  const loadStories = useCallback(async () => {
    const { data } = await supabase
      .from('travel_stories')
      .select('*, profiles(full_name), places(name, location, image_url)')
      .order('created_at', { ascending: false })
      .limit(6);

    setStories((data || []).map((story: any) => ({
      id: story.id,
      title: story.title,
      excerpt: story.excerpt,
      body: story.body,
      image_url: story.image_url || story.places?.image_url,
      mood: story.mood,
      created_at: story.created_at,
      author: story.profiles?.full_name || 'Anonymous Traveler',
      place: story.places?.name,
      location: story.places?.location,
    })));
  }, []);

  const loadVibes = useCallback(async (currentUser?: any) => {
    const { data } = await supabase
      .from('live_vibes')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    let votedVibeIds = new Set<number>();
    if (currentUser) {
      const { data: votes } = await supabase
        .from('live_vibe_votes')
        .select('live_vibe_id')
        .eq('user_id', currentUser.id);

      votedVibeIds = new Set((votes || []).map(vote => vote.live_vibe_id));
    }

    setVibes((data || []).map(v => ({
      id: v.id,
      user: v.profiles?.full_name || 'Anonymous Traveler',
      location: v.location,
      time: timeAgo(v.created_at),
      safety: Number(v.safety_score),
      sensory: v.sensory_status,
      message: v.message,
      tags: v.tags || [],
      upvotes: Number(v.upvotes || 0),
      hasVoted: votedVibeIds.has(v.id),
    })));
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        await Promise.all([loadVibes(), loadPlaces(), loadStories()]);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [loadPlaces, loadStories, loadVibes]);

  useEffect(() => {
    if (!user) return;
    loadProfile(user);
    loadVibes(user);
  }, [loadProfile, loadVibes, user]);

  useEffect(() => {
    const vibesChannel = supabase
      .channel('community:live_vibes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_vibes' },
        async (payload) => {
          const row = payload.new as any;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', row.user_id)
            .single();

          const newVibe: LiveVibe = {
            id: row.id,
            user: profile?.full_name || 'Anonymous Traveler',
            location: row.location,
            time: 'just now',
            safety: Number(row.safety_score),
            sensory: row.sensory_status,
            message: row.message,
            tags: row.tags || [],
            upvotes: Number(row.upvotes || 0),
            hasVoted: false,
          };

          newVibeIds.current.add(row.id);
          setVibes(prev => [newVibe, ...prev.filter(v => v.id !== row.id)].slice(0, 20));

          setTimeout(() => {
            newVibeIds.current.delete(row.id);
            forceUpdate(n => n + 1);
          }, 8000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'live_vibes' },
        (payload) => {
          setVibes(prev => prev.filter(v => v.id !== (payload.old as any).id));
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(vibesChannel);
    };
  }, []);

  useEffect(() => {
    const storiesChannel = supabase
      .channel('community:travel_stories')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'travel_stories' },
        () => {
          loadStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storiesChannel);
    };
  }, [loadStories]);

  const handleShareInsight = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast('Please sign in to share an insight.', 'info');
      return;
    }

    const selectedPlace = places.find(place => String(place.id) === insightForm.gemId);
    const message = insightForm.message.trim();
    if (!selectedPlace || !message) {
      toast('Choose a place and add a helpful note.', 'info');
      return;
    }

    setIsSharing(true);

    if (insightForm.type === 'vibe_check') {
      const selectedVibe = vibeOptions.find(vibe => vibe.value === insightForm.vibe) || vibeOptions[0];
      const { error } = await supabase.from('live_vibes').insert({
        user_id: user.id,
        location: `${selectedPlace.name}, ${selectedPlace.location}`,
        safety_score: selectedPlace.safety_score || selectedVibe.score,
        sensory_status: selectedVibe.label,
        message,
        tags: ['vibe-check', ...(selectedPlace.tags || []).slice(0, 2)],
      });

      setIsSharing(false);

      if (error) {
        toast(`Could not share vibe checkin: ${error.message}`, 'error');
        return;
      }

      setInsightForm(prev => ({ ...prev, type: 'vibe_check', vibe: 'Great', reviewSignal: 'Good', rating: 5, message: '' }));
      toast('Vibe checkin shared.', 'success');
      return;
    }

    const insightType = insightTypes.find(type => type.value === insightForm.type);
    const { error: insightError } = await supabase.from('place_insights').insert({
      place_id: selectedPlace.id,
      user_id: user.id,
      type: insightForm.type,
      title: `${insightType?.label || 'Insight'} for ${selectedPlace.name}`,
      body: insightForm.type === 'review' ? `${insightForm.reviewSignal}: ${message}` : message,
      rating: insightForm.type === 'review' ? insightForm.rating : null,
    });

    if (insightError) {
      setIsSharing(false);
      toast(`Could not share insight: ${insightError.message}`, 'error');
      return;
    }

    setIsSharing(false);
    setInsightForm(prev => ({ ...prev, type: 'vibe_check', vibe: 'Great', reviewSignal: 'Good', rating: 5, message: '' }));
    toast('Place insight saved to Discovery.', 'success');
  };

  const handleUpvoteVibe = async (vibeId: number) => {
    if (!user) {
      toast('Please sign in to upvote vibe checkins.', 'info');
      return;
    }
    if (votingInProgress.has(vibeId)) return;

    setVotingInProgress(prev => new Set(prev).add(vibeId));

    const { data, error } = await supabase.rpc('toggle_live_vibe_upvote', {
      p_vibe_id: vibeId,
      p_user_id: user.id,
    });

    if (error) {
      toast(`Could not update vote: ${error.message}`, 'error');
    } else {
      setVibes(prev => prev.map(vibe => (
        vibe.id === vibeId
          ? { ...vibe, upvotes: Number(data?.upvotes || 0), hasVoted: Boolean(data?.hasVoted) }
          : vibe
      )));
    }

    setVotingInProgress(prev => {
      const next = new Set(prev);
      next.delete(vibeId);
      return next;
    });
  };

  const handleSaveStory = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast('Please sign in to share a travel story.', 'info');
      return;
    }

    const title = storyForm.title.trim();
    const body = storyForm.body.trim();
    if (!title || !body) {
      toast('Add a title and story before sharing.', 'info');
      return;
    }

    const selectedPlace = places.find(place => String(place.id) === storyForm.gemId);
    setIsSavingStory(true);

    const { error } = await supabase.from('travel_stories').insert({
      user_id: user.id,
      place_id: selectedPlace ? selectedPlace.id : null,
      title,
      excerpt: storyForm.excerpt.trim() || body.slice(0, 140),
      body,
      mood: storyForm.mood,
      image_url: selectedPlace?.image_url || null,
    });

    setIsSavingStory(false);

    if (error) {
      toast(`Could not share story: ${error.message}`, 'error');
      return;
    }

    setStoryForm(prev => ({ ...prev, title: '', excerpt: '', body: '', mood: 'Memorable' }));
    setIsStoryModalOpen(false);
    loadStories();
    toast('Travel story shared.', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-accent sm:text-4xl">
              Community
            </h1>
            <RealtimeDot connected={realtimeConnected} />
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Helpful signals from real travelers: what feels good, what to avoid, and which hidden gems are worth your time.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted">
            <Loader2 className="mb-4 animate-spin text-primary" size={32} />
            <p>Loading community insights...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <section className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HeartHandshake size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      Community Karma
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-accent sm:text-3xl">
                      {profile?.community_karma || 0} travelers found your insights helpful
                    </h2>
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  Every useful tip makes the next trip easier.
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] sm:gap-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-accent">
                    <MessageSquare className="text-primary" /> Live Vibe Checkins
                  </h2>
                </div>

                <AnimatePresence initial={false}>
                  {vibes.slice(0, 6).map(vibe => (
                    <motion.article
                      key={vibe.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      layout
                      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                    >
                      {newVibeIds.current.has(vibe.id) && (
                        <div className="absolute left-0 right-0 top-0 h-1 bg-primary" />
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                            {vibe.user.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-accent">
                              {vibe.user}
                              {newVibeIds.current.has(vibe.id) && (
                                <span className="ml-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                  New
                                </span>
                              )}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                              <MapPin size={12} /> {vibe.location} • {vibe.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2 text-xs font-bold">
                          <span className={`flex items-center gap-1 rounded-lg px-2 py-1 ${safetyColor(vibe.safety)}`}>
                            <Shield size={13} /> {vibe.safety}
                          </span>
                          <span className="rounded-lg bg-purple-50 px-2 py-1 text-purple-600">
                            {vibe.sensory}
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-accent">{vibe.message}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {vibe.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleUpvoteVibe(vibe.id)}
                        disabled={votingInProgress.has(vibe.id)}
                        className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors disabled:opacity-60 ${
                          vibe.hasVoted
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-accent hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        <ThumbsUp size={16} className={vibe.hasVoted ? 'fill-white' : ''} />
                        {vibe.upvotes}
                      </button>
                    </motion.article>
                  ))}
                </AnimatePresence>

                {vibes.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-muted">
                    <MapPin size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No checkins yet.</p>
                  </div>
                )}
              </section>

              <div className="space-y-6 sm:space-y-8">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="flex items-center gap-2 text-2xl font-bold text-accent">
                        <BookOpen className="text-primary" /> Travel Stories
                      </h2>
                      <p className="mt-1 text-sm text-muted">Moments from fellow travelers</p>
                    </div>
                    <button
                      onClick={() => setIsStoryModalOpen(true)}
                      className="rounded-xl border border-gray-200 p-2 text-accent transition-colors hover:border-primary hover:text-primary"
                      aria-label="Add travel story"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {stories.length > 0 ? stories.map(story => (
                      <Link
                        key={story.id}
                        to={`/community/stories/${story.id}`}
                        className="block overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition-all hover:border-primary/40 hover:bg-white hover:shadow-sm"
                      >
                        {story.image_url && (
                          <img
                            src={story.image_url}
                            alt={story.title}
                            className="h-28 w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="p-4">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <p className="text-sm font-bold text-accent">{story.title}</p>
                            {story.mood && (
                              <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                                {story.mood}
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-muted line-clamp-2">{story.excerpt || story.body}</p>
                          <p className="mt-3 text-xs font-semibold text-primary">
                            {story.author}{story.place ? ` • ${story.place}` : ''}
                          </p>
                        </div>
                      </Link>
                    )) : (
                      <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-muted">
                        <BookOpen size={30} className="mx-auto mb-3 opacity-25" />
                        <p className="font-medium">Be the first to share a travel story.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="flex items-center gap-2 text-2xl font-bold text-accent">
                        <Plus className="text-primary" /> Share an Insight
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        Share a quick vibe checkin, or add structured place knowledge to Discovery.
                      </p>
                    </div>
                    <Sparkles className="shrink-0 text-primary/40" size={26} />
                  </div>

                  <form onSubmit={handleShareInsight} className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                        Place
                      </span>
                      <select
                        value={insightForm.gemId}
                        onChange={event => setInsightForm(prev => ({ ...prev, gemId: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                      >
                        {places.map(place => (
                          <option key={place.id} value={place.id}>
                            {place.name} - {place.location}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                          Type
                        </span>
                        <select
                          value={insightForm.type}
                          onChange={event => setInsightForm(prev => ({ ...prev, type: event.target.value as InsightType }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                        >
                          {insightTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                          {insightForm.type === 'vibe_check' ? 'Vibe' : insightForm.type === 'review' ? 'Review Signal' : 'Priority'}
                        </span>
                        {insightForm.type === 'vibe_check' ? (
                          <select
                            value={insightForm.vibe}
                            onChange={event => setInsightForm(prev => ({ ...prev, vibe: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                          >
                            {vibeOptions.map(vibe => (
                              <option key={vibe.value} value={vibe.value}>{vibe.label}</option>
                            ))}
                          </select>
                        ) : insightForm.type === 'review' ? (
                          <select
                            value={insightForm.reviewSignal}
                            onChange={event => setInsightForm(prev => ({ ...prev, reviewSignal: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                          >
                            {reviewSignals.map(signal => (
                              <option key={signal} value={signal}>{signal}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex min-h-[46px] items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-muted">
                            Linked to selected place
                          </div>
                        )}
                      </label>
                    </div>

                    {insightForm.type === 'review' && (
                      <div>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                          Rating
                        </span>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setInsightForm(prev => ({ ...prev, rating: star }))}
                              className="rounded-lg p-1 text-amber-400 transition-transform hover:scale-110"
                              aria-label={`${star} star rating`}
                            >
                              <Star
                                size={26}
                                className={star <= insightForm.rating ? 'fill-amber-400' : 'text-gray-300'}
                              />
                            </button>
                          ))}
                          <span className="ml-1 text-sm font-bold text-accent">
                            {insightForm.rating}/5
                          </span>
                        </div>
                      </div>
                    )}

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                        {insightForm.type === 'vibe_check' ? 'Checkin note' : 'Helpful note'}
                      </span>
                      <textarea
                        value={insightForm.message}
                        onChange={event => setInsightForm(prev => ({ ...prev, message: event.target.value }))}
                        rows={4}
                        maxLength={240}
                        placeholder={insightForm.type === 'vibe_check' ? 'What is the place feeling like right now?' : 'What should another traveler know before they go?'}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm leading-relaxed text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isSharing || places.length === 0}
                      className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {insightForm.type === 'vibe_check' ? 'Share Vibe Checkin' : 'Save to Discovery'}
                    </button>

                    {places.length === 0 && (
                      <p className="flex items-center gap-2 text-sm text-muted">
                        <CheckCircle2 size={16} className="text-primary" />
                        Add places in Discovery to unlock place-specific insights.
                      </p>
                    )}
                  </form>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isStoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/40 px-4 py-4 sm:items-center sm:justify-center"
            onClick={() => setIsStoryModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
              onClick={event => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-accent">Add Travel Story</h2>
                  <p className="mt-1 text-sm text-muted">Share a memorable moment from a place.</p>
                </div>
                <button
                  onClick={() => setIsStoryModalOpen(false)}
                  className="rounded-full bg-gray-100 p-2 text-accent transition-colors hover:bg-gray-200"
                  aria-label="Close story form"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveStory} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                    Place
                  </span>
                  <select
                    value={storyForm.gemId}
                    onChange={event => setStoryForm(prev => ({ ...prev, gemId: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                  >
                    {places.map(place => (
                      <option key={place.id} value={place.id}>
                        {place.name} - {place.location}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-[1fr_0.6fr]">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                      Title
                    </span>
                    <input
                      value={storyForm.title}
                      onChange={event => setStoryForm(prev => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                      placeholder="A morning I still remember"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                      Mood
                    </span>
                    <select
                      value={storyForm.mood}
                      onChange={event => setStoryForm(prev => ({ ...prev, mood: event.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                    >
                      {['Memorable', 'Peaceful', 'Surprising', 'Helpful', 'Emotional'].map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                    Short preview
                  </span>
                  <input
                    value={storyForm.excerpt}
                    onChange={event => setStoryForm(prev => ({ ...prev, excerpt: event.target.value }))}
                    maxLength={160}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                    placeholder="One sentence that captures the moment"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                    Story
                  </span>
                  <textarea
                    value={storyForm.body}
                    onChange={event => setStoryForm(prev => ({ ...prev, body: event.target.value }))}
                    rows={6}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm leading-relaxed text-accent outline-none transition-colors focus:border-primary focus:bg-white"
                    placeholder="What happened, what did it feel like, and what should others know?"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSavingStory}
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold disabled:opacity-60"
                >
                  {isSavingStory ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Share Story
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
