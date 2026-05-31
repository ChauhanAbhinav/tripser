import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, ThumbsUp, MapPin, Shield, Volume2,
  MessageSquare, Plus, CheckCircle2, Loader2,
  Wifi, WifiOff, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // adjust path as needed
import { useAuth } from '../hooks/userAuth'; // adjust path as needed
import { useToast } from '../components/Toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VotingOption {
  id: number;
  board_id: number;
  name: string;
  price: string;
  votes: number;
  hasVoted?: boolean;
}

interface VotingBoard {
  id: number;
  title: string;
  category: string;
  members: number;
  options: VotingOption[];
}

interface LiveVibe {
  id: number;
  user: string;
  location: string;
  time: string;
  safety: number;
  sensory: string;
  message: string;
  tags: string[];
  isNew?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RealtimeDot({ connected }: { connected: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold">
      {connected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
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

function NewBadge() {
  return (
    <motion.span
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary text-white rounded-md"
    >
      <Sparkles size={9} /> New
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [boards, setBoards] = useState<VotingBoard[]>([]);
  const [vibes, setVibes] = useState<LiveVibe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState<Set<number>>(new Set());

  // Track new-item IDs so we can flash the "New" badge briefly
  const newVibeIds = useRef<Set<number>>(new Set());
  const [, forceUpdate] = useState(0);

  // -------------------------------------------------------------------------
  // Initial Data Load
  // -------------------------------------------------------------------------

  const loadBoards = useCallback(async () => {
    const { data: boardData } = await supabase
      .from('voting_boards')
      .select('*, voting_options(*)')
      .order('created_at', { ascending: false });

    if (!boardData) return;

    // Fetch which options the current user has voted for
    let votedOptionIds: Set<number> = new Set();
    if (user) {
      const { data: votes } = await supabase
        .from('user_votes')
        .select('option_id')
        .eq('user_id', user.id);
      if (votes) votes.forEach(v => votedOptionIds.add(v.option_id));
    }

    setBoards(
      boardData.map(b => ({
        id: b.id,
        title: b.title,
        category: b.category,
        members: b.members,
        options: (b.voting_options as VotingOption[]).map(opt => ({
          ...opt,
          hasVoted: votedOptionIds.has(opt.id),
        })),
      }))
    );
  }, [user]);

  const loadVibes = useCallback(async () => {
    const { data } = await supabase
      .from('live_vibes')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!data) return;

    setVibes(
      data.map(v => ({
        id: v.id,
        user: v.profiles?.full_name || 'Anonymous Traveler',
        location: v.location,
        time: timeAgo(v.created_at),
        safety: v.safety_score,
        sensory: v.sensory_status,
        message: v.message,
        tags: v.tags || [],
      }))
    );
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([loadBoards(), loadVibes()]);
      setIsLoading(false);
    }
    init();
  }, [loadBoards, loadVibes]);

  // -------------------------------------------------------------------------
  // Supabase Realtime Subscriptions
  // -------------------------------------------------------------------------

  useEffect(() => {
    // --- Channel: Live Vibes ---
    const vibesChannel = supabase
      .channel('community:live_vibes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_vibes' },
        async (payload) => {
          const row = payload.new as any;

          // Fetch the poster's profile
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
            safety: row.safety_score,
            sensory: row.sensory_status,
            message: row.message,
            tags: row.tags || [],
            isNew: true,
          };

          newVibeIds.current.add(row.id);
          setVibes(prev => [newVibe, ...prev.slice(0, 19)]);

          // Remove "New" badge after 8 seconds
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

    // --- Channel: Voting Options ---
    const votesChannel = supabase
      .channel('community:voting_options')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'voting_options' },
        (payload) => {
          const updated = payload.new as VotingOption;
          setBoards(prev =>
            prev.map(board => ({
              ...board,
              options: board.options.map(opt =>
                opt.id === updated.id ? { ...opt, votes: updated.votes } : opt
              ),
            }))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'voting_options' },
        (payload) => {
          const newOpt = payload.new as VotingOption;
          setBoards(prev =>
            prev.map(board =>
              board.id === newOpt.board_id
                ? { ...board, options: [...board.options, { ...newOpt, hasVoted: false }] }
                : board
            )
          );
        }
      )
      .subscribe();

    // --- Channel: Voting Boards (new boards) ---
    const boardsChannel = supabase
      .channel('community:voting_boards')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'voting_boards' },
        (payload) => {
          const newBoard = payload.new as any;
          setBoards(prev => [{ ...newBoard, options: [] }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vibesChannel);
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(boardsChannel);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Voting Action
  // -------------------------------------------------------------------------

  const handleVote = useCallback(async (optionId: number) => {
    if (!user) {
      toast('Please sign in to vote.', 'info');
      return;
    }
    if (votingInProgress.has(optionId)) return;

    setVotingInProgress(prev => new Set(prev).add(optionId));

    try {
      const { data, error } = await supabase.rpc('cast_vote', {
        p_option_id: optionId,
        p_user_id: user.id,
      });

      if (error) throw error;

      const { action, votes } = data as { action: 'added' | 'removed'; votes: number };

      setBoards(prev =>
        prev.map(board => ({
          ...board,
          options: board.options.map(opt =>
            opt.id === optionId
              ? { ...opt, votes, hasVoted: action === 'added' }
              : opt
          ),
        }))
      );
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setVotingInProgress(prev => {
        const next = new Set(prev);
        next.delete(optionId);
        return next;
      });
    }
  }, [user, votingInProgress]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent">
              Community Hub
            </h1>
            <p className="text-muted mt-2 text-sm sm:text-base flex items-center gap-2">
              Connect, vote on plans, and stay safe with real-time traveler insights.
              <RealtimeDot connected={realtimeConnected} />
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto mt-4 md:mt-0">
            <button className="w-full sm:w-auto btn-secondary py-2.5 sm:py-2 px-6 flex items-center justify-center gap-2 text-sm sm:text-base">
              <MapPin size={18} /> Check-In
            </button>
            <button className="w-full sm:w-auto btn-primary py-2.5 sm:py-2 px-6 flex items-center justify-center gap-2 text-sm sm:text-base">
              <Plus size={18} /> New Board
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted">
            <Loader2 className="animate-spin mb-4 text-primary" size={32} />
            <p>Syncing Community Hub...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">

            {/* ---- Left: Group Voting Boards ---- */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2 mb-2">
                <Users className="text-primary" /> Group Voting Boards
              </h2>

              <AnimatePresence initial={false}>
                {boards.map(board => (
                  <motion.div
                    key={board.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-accent mb-1">{board.title}</h3>
                        <p className="text-sm text-muted">
                          Voting on:{' '}
                          <span className="font-semibold text-primary">{board.category}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium text-accent">
                        <Users size={14} className="text-muted" /> {board.members}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {board.options.map(option => {
                        const isVoting = votingInProgress.has(option.id);
                        const maxVotes = Math.max(...board.options.map(o => o.votes), 1);
                        const pct = Math.round((option.votes / maxVotes) * 100);

                        return (
                          <div
                            key={option.id}
                            className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-2xl border transition-all overflow-hidden ${
                              option.hasVoted
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                            }`}
                          >
                            {/* Vote progress bar */}
                            <div
                              className="absolute inset-0 bg-primary/5 transition-all duration-700 ease-out pointer-events-none"
                              style={{ width: `${pct}%` }}
                            />

                            <div className="relative">
                              <p className="font-bold text-accent flex items-center gap-2">
                                {option.name}
                                {option.hasVoted && (
                                  <CheckCircle2 size={16} className="text-primary" />
                                )}
                              </p>
                              <p className="text-xs text-muted mt-1">{option.price}</p>
                            </div>

                            <button
                              onClick={() => handleVote(option.id)}
                              disabled={isVoting}
                              className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors w-full sm:w-auto ${
                                option.hasVoted
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-accent hover:bg-gray-200 shadow-sm'
                              } disabled:opacity-60`}
                            >
                              {isVoting ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <ThumbsUp
                                  size={16}
                                  className={option.hasVoted ? 'fill-white' : ''}
                                />
                              )}
                              <motion.span
                                key={option.votes}
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                              >
                                {option.votes}
                              </motion.span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {boards.length === 0 && (
                <div className="text-center py-16 text-muted">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No boards yet — create the first one!</p>
                </div>
              )}
            </div>

            {/* ---- Right: Live Vibe Check-ins ---- */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2 mb-2">
                <MessageSquare className="text-secondary" /> Live Vibe Check-ins
              </h2>

              <AnimatePresence initial={false}>
                {vibes.map(vibe => (
                  <motion.div
                    key={vibe.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden"
                  >
                    {/* Highlight strip for new vibes */}
                    {newVibeIds.current.has(vibe.id) && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute top-0 left-0 right-0 h-0.5 bg-primary origin-left"
                      />
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold shrink-0">
                          {vibe.user.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-accent flex items-center">
                            {vibe.user}
                            <AnimatePresence>
                              {newVibeIds.current.has(vibe.id) && <NewBadge />}
                            </AnimatePresence>
                          </p>
                          <p className="text-xs text-muted flex items-center gap-1">
                            <MapPin size={12} /> {vibe.location} • {vibe.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold shrink-0">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${safetyColor(vibe.safety)}`}>
                          <Shield size={14} /> {vibe.safety}
                        </span>
                        <span className="flex items-center gap-1 text-purple-500 bg-purple-50 px-2 py-1 rounded-lg">
                          <Volume2 size={14} /> {vibe.sensory}
                        </span>
                      </div>
                    </div>

                    <p className="text-accent text-sm leading-relaxed mb-4">{vibe.message}</p>

                    <div className="flex flex-wrap gap-2">
                      {vibe.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-muted rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {vibes.length === 0 && (
                <div className="text-center py-16 text-muted">
                  <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No check-ins yet — be the first!</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}