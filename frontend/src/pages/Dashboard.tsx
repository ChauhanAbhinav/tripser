import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Globe, Trophy, Leaf, Users, Clock, DollarSign, Award, ChevronRight, Loader2, CheckSquare, Square, WalletCards, Receipt, X, Camera, Plus, Archive, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { PACKING_ITEMS, searchItems } from '../lib/packingList';
import { useToast } from '../components/Toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATS = [
  { label: 'Total Miles', value: '24,500', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Hours Saved by AI', value: '142h', icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Budget Efficiency', value: '+15%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
];

const BADGES = [
  { id: 1, name: 'Solo Pioneer', desc: 'Completed 5 solo trips', icon: '🌟', unlocked: true },
  { id: 2, name: 'Safety Sentinel', desc: 'Left 10 safety reviews', icon: '🛡️', unlocked: true },
  { id: 3, name: 'Hidden Gem Hunter', desc: 'Visited 3 remote spots', icon: '💎', unlocked: false },
];

const toTitleCase = (str: string) => {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

type PackingItem = { id: string; name: string; packed: boolean; category?: string };
export type PackingListType = { id: string; category: string; items: PackingItem[], completed: boolean };

export const EXPENSE_CATEGORIES = [
  { id: 'accommodation', label: 'Accommodation', icon: '🏨', color: 'text-indigo-500', bg: 'bg-indigo-50', hex: '#6366f1' },
  { id: 'food',          label: 'Food & Drink',  icon: '🍜', color: 'text-amber-500', bg: 'bg-amber-50', hex: '#f59e0b' },
  { id: 'transport',     label: 'Transport',     icon: '🚌', color: 'text-blue-500', bg: 'bg-blue-50', hex: '#3b82f6' },
  { id: 'activities',    label: 'Activities',    icon: '🎭', color: 'text-emerald-500', bg: 'bg-emerald-50', hex: '#10b981' },
  { id: 'shopping',      label: 'Shopping',      icon: '🛍️', color: 'text-pink-500', bg: 'bg-pink-50', hex: '#ec4899' },
  { id: 'health',        label: 'Health',        icon: '💊', color: 'text-red-500', bg: 'bg-red-50', hex: '#ef4444' },
  { id: 'misc',          label: 'Miscellaneous', icon: '📦', color: 'text-purple-500', bg: 'bg-purple-50', hex: '#8b5cf6' },
];

const MOCK_FRIENDS = [
  { id: 'f1', name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'f2', name: 'Mike',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  { id: 'f3', name: 'Alex',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
];

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'packing'>('overview');
  const { toast } = useToast();

  // Packing List State
  const [packingLists, setPackingLists] = useState<PackingListType[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [packingSubTab, setPackingSubTab] = useState<'active' | 'completed'>('active');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  
  // Budget & Expenses State
  const [budgets, setBudgets] = useState<any[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ tripName: '', amount: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], paidBy: 'self', splitWith: ['self'] });
  const [isPaidByOpen, setIsPaidByOpen] = useState(false);
  const [isSplitWithOpen, setIsSplitWithOpen] = useState(false);

  // Profile Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [profileData, listsResponse, budgetRes, expensesRes] = await Promise.all([
          api.getUserProfile(),
          supabase
            .from('packing_lists')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('trip_budgets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
        ]);

        setProfile(profileData);
        if (listsResponse.data) {
          setPackingLists(listsResponse.data);
        } else if (listsResponse.error) {
          console.error("Fetch Packing Lists Error:", listsResponse.error);
        }
        if (budgetRes.data) {
          setBudgets(budgetRes.data);
          if (budgetRes.data.length > 0) setSelectedBudgetId(budgetRes.data[0].id);
        }
        if (expensesRes.data) {
          setExpenses(expensesRes.data);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Realtime Expenses Sync
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_expenses')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'expenses' }, (payload) => {
        setExpenses(prev => {
          if (prev.find(e => e.id === payload.new.id)) return prev;
          return [payload.new, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- Dynamic Database Handlers ---
  const handleCreateList = async (category: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const newList: PackingListType = {
      id: generateUUID(),
      category,
      items: [],
      completed: false
    };

    setPackingLists(prev => [newList, ...prev]);
    setPackingSubTab('active');
    setSelectedListId(newList.id);

    const { error } = await supabase.from('packing_lists').insert({
      id: newList.id,
      user_id: session.user.id,
      category: newList.category,
      completed: newList.completed,
      items: newList.items
    });
    if (error) {
      console.error("DB Insert Error:", error);
      toast(`DB Error: ${error.message}`, 'error');
    }
  };

  const handleUpdateList = async (id: string, updatedList: PackingListType) => {
    setPackingLists(prev => prev.map(l => l.id === id ? updatedList : l));
    
    const { error } = await supabase.from('packing_lists').update({
      category: updatedList.category,
      completed: updatedList.completed,
      items: updatedList.items
    }).eq('id', id);
    if (error) {
      console.error("DB Update Error:", error);
      toast(`Sync Error: ${error.message}`, 'error');
    }
  };

  const handleDeleteList = async (id: string) => {
    setPackingLists(prev => prev.filter(l => l.id !== id));
    if (selectedListId === id) setSelectedListId(null);
    
    const { error } = await supabase.from('packing_lists').delete().eq('id', id);
    if (error) {
      console.error("DB Delete Error:", error);
      toast(`Delete Error: ${error.message}`, 'error');
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let avatarUrl = profile.avatar_url;

      // If the user selected a new image, upload it to Supabase Storage
      if (editAvatarFile) {
        const fileExt = editAvatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, editAvatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrlData.publicUrl;
      }

      // Update the Database row
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: editName, avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update Auth User Metadata so the Navbar and session stay in sync seamlessly
      await supabase.auth.updateUser({
        data: { full_name: editName, avatar_url: avatarUrl, picture: avatarUrl }
      });

      setProfile({ ...profile, full_name: editName, avatar_url: avatarUrl });
      setIsEditModalOpen(false);
      toast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error saving profile", error);
      toast("Failed to save profile. Ensure 'avatars' storage bucket is public.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBudget = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !budgetForm.amount || !budgetForm.tripName) return;

    const { data, error } = await supabase.from('trip_budgets').insert({
      user_id: session.user.id,
      trip_name: toTitleCase(budgetForm.tripName.trim()),
      total_budget: Number(budgetForm.amount),
      currency: 'USD'
    }).select().single();

    if (error) {
      toast(`Error setting budget: ${error.message}`, 'error');
    } else {
      setBudgets([data, ...budgets]);
      setSelectedBudgetId(data.id);
      setIsBudgetModalOpen(false);
      setBudgetForm({ tripName: '', amount: '' });
      toast('Budget set successfully!', 'success');
    }
  };

  const handleSaveExpense = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !expenseForm.amount || !expenseForm.title || !selectedBudgetId) return;

    const { data, error } = await supabase.from('expenses').insert({
      user_id: session.user.id,
      trip_budget_id: selectedBudgetId,
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      title: toTitleCase(expenseForm.title.trim()),
      date: expenseForm.date,
      currency: 'USD',
      paid_by: expenseForm.paidBy,
      split_with: expenseForm.splitWith
    }).select().single();

    if (error) {
      toast(`Error logging expense: ${error.message}`, 'error');
    } else {
      setExpenses([data, ...expenses]);
      setIsExpenseModalOpen(false);
      setExpenseForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], paidBy: 'self', splitWith: ['self'] });
      toast('Expense logged successfully!', 'success');
    }
  };

  // Compute the current selected list for the Packing Tab
  const filteredLists = packingLists.filter(l => packingSubTab === 'completed' ? l.completed : !l.completed);
  let currentList = filteredLists.find(l => l.id === selectedListId);
  if (!currentList && filteredLists.length > 0) {
    currentList = filteredLists[0]; // Auto-select first in view if none matched
  }

  // Compute Budget Metrics & State
  const currentBudget = budgets.find(b => b.id === selectedBudgetId) || budgets[0];
  const currentExpenses = expenses.filter(e => e.trip_budget_id === currentBudget?.id);

  const totalBudget = currentBudget?.total_budget || 0;
  const tripDays = 5; // Default trip duration
  const dailyBudget = totalBudget / tripDays;

  const today = new Date().toISOString().split('T')[0];
  let todaySpent = 0;
  
  const byCategory: Record<string, number> = {};
  EXPENSE_CATEGORIES.forEach(c => byCategory[c.id] = 0);

  // Compute balances
  const balances: Record<string, number> = {};
  
  // Group Members Helper
  const GROUP_MEMBERS = [
    { id: 'self', name: 'Me', avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || 'self'}` },
    ...MOCK_FRIENDS
  ];
  GROUP_MEMBERS.forEach(m => balances[m.id] = 0);

  const totalSpent = currentExpenses.reduce((sum, exp) => {
    const amt = Number(exp.amount);
    if (exp.date === today) todaySpent += amt;
    if (byCategory[exp.category] !== undefined) {
      byCategory[exp.category] += amt;
    } else {
      byCategory['misc'] = (byCategory['misc'] || 0) + amt;
    }

    // Compute Balances globally for the entire group (Splitwise logic)
    const split = exp.split_with || [];
    const paidBy = exp.paid_by || 'self';
    if (split.length > 0) {
      const amountPerPerson = amt / split.length;
      if (balances[paidBy] !== undefined) balances[paidBy] += amt; // Payer is credited the full amount
      split.forEach((id: string) => {
        if (balances[id] !== undefined) balances[id] -= amountPerPerson; // Splitters are debited their share
      });
    }

    return sum + amt;
  }, 0);

  const remaining = totalBudget - totalSpent;
  const pctSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const chartData = EXPENSE_CATEGORIES.map(c => ({
    name: c.label,
    value: byCategory[c.id],
    hex: c.hex
  })).filter(d => d.value > 0);

  // Simplified Payment Calculator
  const debtors = Object.keys(balances).filter(k => balances[k] < -0.01).map(k => ({ id: k, amount: -balances[k] })).sort((a,b) => b.amount - a.amount);
  const creditors = Object.keys(balances).filter(k => balances[k] > 0.01).map(k => ({ id: k, amount: balances[k] })).sort((a,b) => b.amount - a.amount);
  const payments: any[] = [];
  let i = 0, j = 0;
  while(i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amt = Math.min(d.amount, c.amount);
    payments.push({ from: d.id, to: c.id, amount: amt });
    d.amount -= amt;
    c.amount -= amt;
    if (d.amount < 0.01) i++;
    if (c.amount < 0.01) j++;
  }

  const renderSplitText = (paidBy: string, splitWith: string[]) => {
    const payer = GROUP_MEMBERS.find(m => m.id === paidBy)?.name || 'Unknown';
    if (!splitWith || splitWith.length === 0 || (splitWith.length === 1 && splitWith[0] === paidBy)) {
      return <span className="text-red-500">Paid by {payer}</span>;
    }
    const splitNames = splitWith.map(id => GROUP_MEMBERS.find(m => m.id === id)?.name || 'Unknown').join(', ');
    return (
      <><span className="text-red-500">Paid by {payer}</span> <span className="text-gray-300 mx-1.5">•</span> <span className="text-emerald-500">Split with {splitNames}</span></>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50 text-muted">
        <Loader2 className="animate-spin mb-4 text-primary" size={32} />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || 'traveler'}`} 
                alt="User Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent">{profile?.full_name || 'Traveler'}</h1>
              <p className="text-muted mt-1 flex items-center gap-2">
                <MapPin size={16} /> Currently exploring: <span className="font-medium text-accent">Kyoto, Japan</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditName(profile?.full_name || '');
              setEditAvatarPreview(profile?.avatar_url || '');
              setEditAvatarFile(null);
              setIsEditModalOpen(true);
            }}
            className="w-full sm:w-auto btn-primary py-2.5 sm:py-2 px-6 text-sm sm:text-base"
          >
            Edit Profile
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 sm:gap-6 mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setActiveTab('overview')} className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-accent'}`}>Overview</button>
          <button onClick={() => setActiveTab('expenses')} className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-accent'}`}>Budget & Expenses</button>
          <button onClick={() => setActiveTab('packing')} className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'packing' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-accent'}`}>Packing List</button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Map */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Engagement Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STATS.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-sm font-bold text-muted uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-accent mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* 3D Map Placeholder */}
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm">
                <h3 className="font-bold text-accent flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  Visited Places Scratch Map
                </h3>
              </div>
              {/* This is a placeholder for the future Mapbox 3D integration */}
              <div className="w-full h-[400px] bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                  alt="Map Placeholder" 
                  className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
                />
                <button className="relative z-10 bg-accent text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                  Unlock Interactive 3D Map
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: TQ & Badges */}
          <div className="space-y-8">
            
            {/* Traveler Quotient (TQ) */}
            <div className="bg-accent text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Traveler Quotient</h3>
                  <span className="text-3xl font-display font-bold text-primary">{profile?.tq_score || 84}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2"><Leaf size={16} className="text-green-400" /> Sustainability</span>
                      <span className="font-bold">{profile?.sustainability_index || 92}/100</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-400 h-full" style={{ width: `${profile?.sustainability_index || 92}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2"><Globe size={16} className="text-blue-400" /> Diversity Score</span>
                      <span className="font-bold">{profile?.diversity_score || 75}/100</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full" style={{ width: `${profile?.diversity_score || 75}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2"><Users size={16} className="text-purple-400" /> Community Karma</span>
                      <span className="font-bold">{profile?.community_karma || 1250} pts</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full" style={{ width: `${Math.min((profile?.community_karma || 1250) / 20, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <Trophy size={150} />
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-accent flex items-center gap-2">
                  <Award size={20} className="text-primary" />
                  Digital Trophies
                </h3>
                <button className="text-sm text-primary font-bold hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {BADGES.map((badge) => (
                  <div key={badge.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${badge.unlocked ? 'border-primary/20 bg-primary/5' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-accent text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'expenses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2"><WalletCards className="text-primary" /> Budget Tracker</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
              
              {/* Sidebar - Budgets */}
              <div className="w-full md:w-1/3 space-y-4">
                <button onClick={() => { setBudgetForm({tripName: '', amount: ''}); setIsBudgetModalOpen(true); }} className="w-full btn-primary py-3 flex justify-center items-center gap-2 rounded-xl">
                   <Plus size={18} /> Add Trip Budget
                </button>
                <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pb-4">
                  {budgets.map(b => (
                     <button key={b.id} onClick={() => setSelectedBudgetId(b.id)} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex justify-between items-center ${currentBudget?.id === b.id ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-accent hover:bg-gray-100 border border-gray-100'}`}>
                       <span className="truncate pr-2">{b.trip_name}</span>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${currentBudget?.id === b.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-muted'}`}>${b.total_budget}</span>
                     </button>
                  ))}
                  {budgets.length === 0 && (
                    <p className="text-sm text-muted text-center py-8">No budgets added yet.</p>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="w-full md:w-2/3 bg-gray-50/50 rounded-2xl border border-gray-100 p-4 sm:p-6 min-h-[400px] flex flex-col">
                {currentBudget ? (
                  <>
                    <div className="flex flex-wrap items-end justify-between mb-6 border-b border-gray-200 pb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-2xl text-accent">{currentBudget.trip_name}</h3>
                          <button
                            onClick={() => setBudgetToDelete(currentBudget.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-muted text-sm font-medium">Total Trip Budget: <span className="text-accent font-bold text-base bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200 ml-1">${currentBudget.total_budget}</span></p>
                      </div>
                      <div className="text-right mt-4 sm:mt-0">
                        <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Total Spent</p>
                        <p className="text-3xl font-display font-bold text-accent">${totalSpent.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Remaining Bar & Charts */}
                    <div className="mb-6 p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex-1 w-full">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-accent">Remaining: ${remaining.toFixed(2)}</span>
                          <span className="text-muted text-sm font-bold">{pctSpent.toFixed(0)}% Spent</span>
                        </div>
                        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-6">
                          <div className={`h-full transition-all ${pctSpent > 100 ? 'bg-red-500' : pctSpent > 75 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${Math.min(pctSpent, 100)}%` }} />
                        </div>
                        <div className="space-y-3">
                          {chartData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.hex }} />
                                <span className="text-muted font-medium">{d.name}</span>
                              </div>
                              <span className="font-bold text-accent">${d.value.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {chartData.length > 0 && (
                        <div className="w-32 h-32 sm:w-48 sm:h-48 shrink-0 mx-auto">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={chartData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.hex} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Splitwise-Style Balances & Payments */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-bold text-accent mb-3">Group Balances</h4>
                        <div className="space-y-2">
                          {GROUP_MEMBERS.map(f => {
                            const bal = balances[f.id];
                            if (bal === 0) return null;
                            return (
                              <div key={f.id} className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><img src={f.avatar} className="w-5 h-5 rounded-full bg-gray-100" /> {f.name}</span>
                                <span className={`font-bold ${bal > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {bal > 0 ? `+$${bal.toFixed(2)}` : `-$${Math.abs(bal).toFixed(2)}`}
                                </span>
                              </div>
                            );
                          })}
                          {Object.values(balances).every(b => b === 0) && (
                            <p className="text-xs text-muted">All settled up!</p>
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-sm font-bold text-accent mb-3">Group Payments</h4>
                        <div className="space-y-2">
                          {payments.length === 0 ? (
                            <p className="text-xs text-muted">No payments needed.</p>
                          ) : payments.map((p, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                              <span className="flex items-center gap-1.5 text-muted font-medium">
                                 <img src={GROUP_MEMBERS.find(m => m.id === p.from)?.avatar} className="w-5 h-5 rounded-full" /> 
                                 <span className="text-xs text-accent">{GROUP_MEMBERS.find(m => m.id === p.from)?.name}</span>
                                 <ChevronRight size={14} className="text-gray-300" />
                                 <img src={GROUP_MEMBERS.find(m => m.id === p.to)?.avatar} className="w-5 h-5 rounded-full" /> 
                                 <span className="text-xs text-accent">{GROUP_MEMBERS.find(m => m.id === p.to)?.name}</span>
                              </span>
                              <span className="font-bold text-accent">${p.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Persistent UI Alerts */}
                    {remaining < 0 && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
                        <AlertCircle size={24} className="shrink-0" /> 
                        <div>
                          <p className="font-bold">Over Budget Alert!</p>
                          <p className="text-sm font-medium">You have exceeded this trip's budget by ${Math.abs(remaining).toFixed(2)}.</p>
                        </div>
                      </div>
                    )}
                    {remaining >= 0 && pctSpent >= 80 && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center gap-3 shadow-sm">
                        <AlertCircle size={24} className="shrink-0" /> 
                        <div>
                          <p className="font-bold">Approaching Limit</p>
                          <p className="text-sm font-medium">You have used {pctSpent.toFixed(0)}% of your budget. Only ${remaining.toFixed(2)} left.</p>
                        </div>
                      </div>
                    )}

                    {/* Expenses List */}
                    <div className="space-y-3 mb-6">
                      {currentExpenses.map((expense) => {
                        const cat = EXPENSE_CATEGORIES.find(c => c.id === expense.category) || EXPENSE_CATEGORIES[6];
                        return (
                        <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-white shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm text-2xl ${cat.bg} ${cat.color}`}>
                              {cat.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-accent">{expense.title}</h4>
                              <p className="text-xs text-muted mt-1">{cat.label} • {expense.date}</p>
                              <p className="text-[11px] bg-slate-50 border border-slate-200 inline-block px-2 py-1 rounded-md mt-1.5 font-bold shadow-sm tracking-wide">
                                {renderSplitText(expense.paid_by || 'self', expense.split_with || [])}
                              </p>
                            </div>
                          </div>
                          <div className="font-bold text-accent">${Number(expense.amount).toFixed(2)}</div>
                        </div>
                      )})}
                      {currentExpenses.length === 0 && (
                        <div className="text-center text-muted py-8 border-2 border-dashed border-gray-200 rounded-xl">
                          No expenses logged yet.
                        </div>
                      )}
                    </div>

                    <button onClick={() => {
                       setExpenseForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], paidBy: 'self', splitWith: ['self', ...MOCK_FRIENDS.map(f=>f.id)] });
                       setIsExpenseModalOpen(true);
                    }} className="w-full mt-auto py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                      <Plus size={18} /> Log New Expense
                    </button>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted flex-1 py-12">
                     <WalletCards size={48} className="mb-4 opacity-20" />
                     <p className="text-sm font-medium">Select a trip to view its budget</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'packing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
                <CheckSquare className="text-primary" /> Packing List
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
              {/* Sidebar - Trip Locations */}
              <div className="w-full md:w-1/3 space-y-4">
                {/* Sub tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                   <button onClick={() => setPackingSubTab('active')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg ${packingSubTab === 'active' ? 'bg-white shadow-sm text-accent' : 'text-muted'}`}>Active</button>
                   <button onClick={() => setPackingSubTab('completed')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg ${packingSubTab === 'completed' ? 'bg-white shadow-sm text-accent' : 'text-muted'}`}>Completed</button>
                </div>

                {/* Input for new trip */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Trip name (e.g. Goa)"
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newListName.trim()) {
                        handleCreateList(toTitleCase(newListName.trim()));
                        setNewListName('');
                      }
                    }}
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary transition-all shadow-sm"
                  />
                  <button
                    onClick={() => {
                      if (newListName.trim()) {
                        handleCreateList(toTitleCase(newListName.trim()));
                        setNewListName('');
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* List of Trips */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pb-4">
                  {filteredLists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${currentList?.id === list.id ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-accent hover:bg-gray-100 border border-gray-100'}`}
                    >
                      <span className="truncate pr-2">{list.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${currentList?.id === list.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-muted'}`}>{list.items.length}</span>
                    </button>
                  ))}
                  {filteredLists.length === 0 && (
                    <p className="text-sm text-muted text-center py-8">No {packingSubTab} trips found.</p>
                  )}
                </div>
              </div>

              {/* Main Area - Selected List Items */}
              <div className="w-full md:w-2/3 bg-gray-50/50 rounded-2xl border border-gray-100 p-4 sm:p-6 min-h-[400px] flex flex-col">
                {currentList ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <h3 className="font-bold text-xl text-accent">{currentList.category}</h3>
                      <div className="flex items-center gap-2">
                        {!currentList.completed ? (
                          <button
                            onClick={() => {
                              handleUpdateList(currentList!.id, { ...currentList!, completed: true });
                            }}
                            className="text-xs font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Archive size={14} /> Complete Trip
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleUpdateList(currentList!.id, { ...currentList!, completed: false });
                            }}
                            className="text-xs font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <RefreshCw size={14} /> Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setListToDelete(currentList!.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1.5 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {currentList.items.length > 0 && (
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider">
                          {currentList.items.filter(i => i.packed).length} / {currentList.items.length} Packed
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              handleUpdateList(currentList!.id, { ...currentList!, items: currentList!.items.map(i => ({ ...i, packed: true })) });
                            }}
                            className="text-xs font-bold text-primary hover:underline transition-all"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300 text-xs">|</span>
                          <button
                            onClick={() => {
                              handleUpdateList(currentList!.id, { ...currentList!, items: currentList!.items.map(i => ({ ...i, packed: false })) });
                            }}
                            className="text-xs font-bold text-muted hover:text-accent hover:underline transition-all"
                          >
                            Unselect All
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1 pb-0.5 no-scrollbar">
                      {currentList.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white shadow-sm group">
                          <button onClick={() => {
                            handleUpdateList(currentList!.id, { ...currentList!, items: currentList!.items.map(i => i.id === item.id ? { ...i, packed: !i.packed } : i) });
                          }}>
                            {item.packed ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted hover:text-primary transition-colors" />}
                          </button>
                          <span className={`flex-1 font-medium ${item.packed ? 'text-muted line-through' : 'text-accent'}`}>{item.name}</span>
                          <button 
                            onClick={() => {
                              handleUpdateList(currentList!.id, { ...currentList!, items: currentList!.items.filter(i => i.id !== item.id) });
                            }}
                            className="text-gray-400 hover:text-orange-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      {currentList.items.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-muted text-sm border-2 border-dashed border-gray-200 rounded-xl">
                          No items added yet.
                        </div>
                      )}
                    </div>

                    {/* Add new item */}
                    {!currentList.completed && (
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="Add an item..."
                            value={newItemNames[currentList.id] || ''}
                            onChange={e => setNewItemNames({ ...newItemNames, [currentList.id]: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && newItemNames[currentList.id]?.trim()) {
                                const titleCasedName = toTitleCase(newItemNames[currentList.id].trim());
                                handleUpdateList(currentList!.id, { ...currentList!, items: [...currentList!.items, { id: generateUUID(), name: titleCasedName, packed: false, category: 'Custom' }] });
                                setNewItemNames({ ...newItemNames, [currentList.id]: '' });
                              }
                            }}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary transition-all bg-white shadow-sm"
                          />
                          <button 
                            onClick={() => {
                              if (newItemNames[currentList.id]?.trim()) {
                                const titleCasedName = toTitleCase(newItemNames[currentList.id].trim());
                                handleUpdateList(currentList!.id, { ...currentList!, items: [...currentList!.items, { id: generateUUID(), name: titleCasedName, packed: false, category: 'Custom' }] });
                                setNewItemNames({ ...newItemNames, [currentList.id]: '' });
                              }
                            }}
                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-md"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        
                        {/* Auto-Suggestions */}
                        {(() => {
                          const inputVal = newItemNames[currentList.id] || '';
                          let suggestions = inputVal.trim() ? searchItems(inputVal) : PACKING_ITEMS.filter(i => i.essential);
                          
                          // Filter out items already in the list
                          const existingNames = new Set(currentList.items.map(i => i.name.toLowerCase()));
                          suggestions = suggestions.filter(s => !existingNames.has(s.name.toLowerCase())).slice(0, 6);

                          if (suggestions.length === 0) return null;

                          return (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {suggestions.map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                      handleUpdateList(currentList!.id, { ...currentList!, items: [...currentList!.items, { id: generateUUID(), name: s.name, packed: false, category: s.category }] });
                                    setNewItemNames({ ...newItemNames, [currentList!.id]: '' });
                                  }}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-primary/10 text-muted hover:text-primary text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Plus size={12} /> {s.name}
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-muted flex-1 py-12">
                     <CheckSquare size={48} className="mb-4 opacity-20" />
                     <p className="text-sm font-medium">Select a trip to view its packing list</p>
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10 overflow-visible"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-accent">Edit Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-accent bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 mb-4 group cursor-pointer shadow-sm">
                    <img 
                      src={editAvatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || 'traveler'}`} 
                      alt="Preview" 
                      className="w-full h-full object-cover bg-gray-100" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white mb-1" />
                      <span className="text-white text-xs font-bold">Change</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditAvatarFile(file);
                          setEditAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium"
                  />
                </div>

                <button 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-base disabled:opacity-70 transition-all"
                >
                  {isSavingProfile ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {listToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-accent mb-2">Delete Trip?</h3>
              <p className="text-muted text-sm mb-6">This action cannot be undone. All packed items in this list will be permanently removed.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setListToDelete(null)}
                  className="flex-1 py-3 bg-gray-100 text-accent font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleDeleteList(listToDelete!);
                    setListToDelete(null);
                    toast("Packing list deleted successfully.", "success");
                  }}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Budget Confirmation Modal */}
      <AnimatePresence>
        {budgetToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-accent mb-2">Delete Budget?</h3>
              <p className="text-muted text-sm mb-6">This action cannot be undone. All expenses logged under this budget will be permanently removed.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setBudgetToDelete(null)}
                  className="flex-1 py-3 bg-gray-100 text-accent font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    const id = budgetToDelete;
                    setBudgets(prev => prev.filter(b => b.id !== id));
                    setExpenses(prev => prev.filter(e => e.trip_budget_id !== id));
                    if (selectedBudgetId === id) {
                      const remaining = budgets.filter(b => b.id !== id);
                      setSelectedBudgetId(remaining.length > 0 ? remaining[0].id : null);
                    }
                    setBudgetToDelete(null);
                    toast("Budget deleted successfully.", "success");
                    
                    await supabase.from('trip_budgets').delete().eq('id', id);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Set Budget Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-accent">Set Trip Budget</h3>
                <button onClick={() => setIsBudgetModalOpen(false)} className="text-gray-400 hover:text-accent bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">Trip Name</label>
                  <input 
                    type="text" 
                    value={budgetForm.tripName}
                    onChange={(e) => setBudgetForm({ ...budgetForm, tripName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium mb-4"
                    placeholder="e.g., Weekend in Rome"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">Total Amount (USD)</label>
                  <input 
                    type="number" 
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium text-xl"
                    placeholder="2500"
                  />
                </div>
                <button 
                  onClick={handleSaveBudget}
                  disabled={!budgetForm.amount || !budgetForm.tripName}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-base disabled:opacity-70 transition-all"
                >
                  Save Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-accent">Log Expense</h3>
                <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-accent bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-accent mb-2">Amount</label>
                    <input 
                      type="number" 
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium text-xl"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-accent mb-2">Date</label>
                    <input 
                      type="date" 
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">Title</label>
                  <input 
                    type="text" 
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium"
                    placeholder="E.g., Sushi Dinner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {EXPENSE_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setExpenseForm({ ...expenseForm, category: cat.id })}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${expenseForm.category === cat.id ? 'border-primary bg-primary/10' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <span className="text-xl mb-1">{cat.icon}</span>
                        <span className="text-[10px] font-medium text-accent truncate w-full text-center">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 relative">
                  {/* Transparent overlay to catch outside clicks for the custom dropdowns */}
                  {(isPaidByOpen || isSplitWithOpen) && (
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsPaidByOpen(false); setIsSplitWithOpen(false); }} />
                  )}

                  {/* Paid By Single Select */}
                  <div className="flex-1 relative z-50">
                    <label className="block text-sm font-medium text-accent mb-2">Paid By</label>
                    <button type="button" onClick={() => { setIsPaidByOpen(!isPaidByOpen); setIsSplitWithOpen(false); }} className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                      <div className="flex items-center gap-2">
                        <img src={GROUP_MEMBERS.find(m => m.id === expenseForm.paidBy)?.avatar} className="w-5 h-5 rounded-full bg-gray-200" />
                        <span className="text-sm font-medium text-accent truncate">{GROUP_MEMBERS.find(m => m.id === expenseForm.paidBy)?.name}</span>
                      </div>
                      <ChevronDown size={16} className="text-muted" />
                    </button>
                    {isPaidByOpen && (
                      <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                        {GROUP_MEMBERS.map(m => (
                          <div key={m.id} onClick={() => { setExpenseForm({ ...expenseForm, paidBy: m.id }); setIsPaidByOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                            <img src={m.avatar} className="w-6 h-6 rounded-full bg-gray-100" />
                            <span className="text-sm font-medium text-accent">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Split With Multi Select */}
                  <div className="flex-1 relative z-50">
                    <label className="block text-sm font-medium text-accent mb-2">Split With</label>
                    <button type="button" onClick={() => { setIsSplitWithOpen(!isSplitWithOpen); setIsPaidByOpen(false); }} className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                      <span className="text-sm font-medium text-accent truncate">
                        {expenseForm.splitWith.length === 0 ? "No one" : expenseForm.splitWith.map(id => GROUP_MEMBERS.find(m => m.id === id)?.name).join(', ')}
                      </span>
                      <ChevronDown size={16} className="text-muted" />
                    </button>
                    {isSplitWithOpen && (
                      <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        {GROUP_MEMBERS.map(m => {
                          const isSelected = expenseForm.splitWith.includes(m.id);
                          return (
                            <div key={m.id} onClick={() => setExpenseForm(prev => ({ ...prev, splitWith: isSelected ? prev.splitWith.filter(id => id !== m.id) : [...prev.splitWith, m.id] }))} className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                              <div className="flex items-center gap-3">
                                <img src={m.avatar} className="w-6 h-6 rounded-full bg-gray-100" />
                                <span className="text-sm font-medium text-accent">{m.name}</span>
                              </div>
                              {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-gray-300" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

            <button 
              onClick={handleSaveExpense}
              disabled={!expenseForm.amount || !expenseForm.title}
              className="w-full mt-2 btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-base disabled:opacity-70 transition-all"
            >
              Save Expense
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
</div>
  );
}