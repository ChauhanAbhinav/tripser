import React from 'react';
import { Smartphone, Bell } from 'lucide-react';

export default function MobileApp() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
          <Smartphone size={40} />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-accent mb-6">
          Tripsy in your pocket.
        </h1>
        <p className="text-muted text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
          We are working hard to bring the ultimate travel planning experience to iOS and Android. 
          Offline access, real-time collaboration, and instant itinerary updates are coming soon.
        </p>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Bell className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-accent">Get notified</h2>
          </div>
          <p className="text-sm text-muted mb-6">
            Join the waitlist to be the first to know when our mobile app drops.
          </p>
          <form className="flex flex-col gap-3" onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks! We'll be in touch.");
          }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-sm font-medium text-accent"
              required
            />
            <button type="submit" className="w-full btn-primary py-3 rounded-xl font-bold">
              Join Waitlist
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}