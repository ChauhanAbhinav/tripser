import { supabase } from '../lib/supabaseClient';

interface ItineraryEvent {
  type: 'flight' | 'hotel' | 'food' | 'alert' | 'transit';
  time: string;
  title: string;
  location: string;
  status?: string;
}

export const api = {
  // Fetch Community Live Vibes
  async getLiveVibes() {
    const { data, error } = await supabase
      .from('live_vibes')
      .select(`*, profiles (full_name, avatar_url)`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching vibes:', error);
      return null;
    }
    return data;
  },

  // Invoke a secure Supabase Edge Function
  async processSecureCheckout(planType: string) {
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: { planType },
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw error;
    }
    
    return data;
  },

  // Fetch User Profile Data
  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  // Fetch Travel Documents for Wallet
  async getTravelDocuments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('travel_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching travel documents:', error);
      return null;
    }
    return data;
  },

  // Fetch Itinerary Events
  async getItineraryEvents(itineraryId: string) {
    const { data, error } = await supabase
      .from('itinerary_events')
      .select('*')
      .eq('itinerary_id', itineraryId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching itinerary events:', error);
      return null;
    }
    return data;
  },

  // Fetch Places from the database
  async getPlaces() {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching places:', error);
      return [];
    }
    return data;
  },

  async getHiddenGems() {
    return this.getPlaces();
  },

  // Save AI-Generated Itinerary to Supabase
  async saveItinerary(title: string, destination: string, events: ItineraryEvent[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Insert the main Itinerary record
    const { data: itinerary, error: itinError } = await supabase
      .from('itineraries')
      .insert([{ user_id: user.id, title, destination }])
      .select()
      .single();

    if (itinError || !itinerary) {
      console.error('Error saving itinerary:', itinError);
      return null;
    }

    // 2. Insert all corresponding itinerary events
    const formattedEvents = events.map((event, index) => ({
      itinerary_id: itinerary.id,
      type: event.type,
      time: event.time,
      title: event.title,
      location: event.location,
      status: event.status || 'Confirmed',
      order_index: index
    }));

    const { error: eventsError } = await supabase
      .from('itinerary_events')
      .insert(formattedEvents);

    if (eventsError) {
      console.error('Error saving events:', eventsError);
      return null;
    }

    return itinerary.id;
  }
};
