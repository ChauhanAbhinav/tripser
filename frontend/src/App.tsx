/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discovery from './pages/Discovery';
import PlaceDetails from './pages/PlaceDetails';
import TravelStoryDetails from './pages/TravelStoryDetails';
import Planner from './pages/Planner';
import Itinerary from './pages/Itinerary';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';
import SOSButton from './components/SOSButton';
import About from './pages/About';
import Community from './pages/Community';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import CompleteProfileModal from './components/CompleteProfileModal';
import MyTrips from './pages/MyTrips';
import FAQ from './pages/FAQ';
import MobileApp from './pages/MobileApp';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-background selection:bg-primary/30">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/discovery/place/:id" element={<PlaceDetails />} />
              <Route path="/community/stories/:id" element={<TravelStoryDetails />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/community" element={<Community />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/mobile" element={<MobileApp />} />
            </Routes>
          </main>

          {/* Global Safety Layer */}
          <SOSButton />
          
          {/* Global Profile Completion */}
          <CompleteProfileModal />

          {/* Footer */}
          <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl font-display font-bold text-accent">Tripsy</span>
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    Say goodbye to planning stress and hello to unforgettable adventures.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-accent mb-6">Tripsy</h4>
                  <ul className="space-y-4 text-muted text-sm">
                    <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                    <li><Link to="/mobile" className="hover:text-primary transition-colors">Mobile App</Link></li>
                    <li><Link to="/faq" className="hover:text-primary transition-colors">Help & FAQ</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-accent mb-6">Tools</h4>
                  <ul className="space-y-4 text-muted text-sm">
                    <li><Link to="/planner" className="hover:text-primary transition-colors">Trip Planner</Link></li>
                    <li><Link to="/dashboard?tab=expenses" className="hover:text-primary transition-colors">Budget Calculator</Link></li>
                    <li><Link to="/dashboard?tab=packing" className="hover:text-primary transition-colors">Packing List</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-accent mb-6">More</h4>
                  <ul className="space-y-4 text-muted text-sm">
                    <li><Link to="/my-trips" className="hover:text-primary transition-colors">My Trips</Link></li>
                    <li><Link to="/wallet" className="hover:text-primary transition-colors">Travel Wallet</Link></li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 text-center text-muted text-xs">
                <p>© 2026 Tripser. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ToastProvider>
  );
}
