/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discovery from './pages/Discovery';
import Planner from './pages/Planner';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background selection:bg-primary/30">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        
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
                <h4 className="font-bold text-accent mb-6">Company</h4>
                <ul className="space-y-4 text-muted text-sm">
                  <li><a href="#" className="hover:text-primary">About</a></li>
                  <li><a href="#" className="hover:text-primary">Careers</a></li>
                  <li><a href="#" className="hover:text-primary">Mobile</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-accent mb-6">Contact</h4>
                <ul className="space-y-4 text-muted text-sm">
                  <li><a href="#" className="hover:text-primary">Help/FAQ</a></li>
                  <li><a href="#" className="hover:text-primary">Press</a></li>
                  <li><a href="#" className="hover:text-primary">Affiliates</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-accent mb-6">More</h4>
                <ul className="space-y-4 text-muted text-sm">
                  <li><a href="#" className="hover:text-primary">Airlinefees</a></li>
                  <li><a href="#" className="hover:text-primary">Airline</a></li>
                  <li><a href="#" className="hover:text-primary">Low fare tips</a></li>
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
  );
}

