import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, WifiOff, FileText, QrCode, Lock, Plane, Download, ChevronRight, Fingerprint } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabaseClient';

export default function Wallet() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [documents, setDocuments] = useState<any[]>([
    { title: 'US Passport', description: 'Exp: Oct 2030', status: 'Verified' },
    { title: 'Schengen E-Visa', description: 'Valid: 90 Days', status: 'Active' },
    { title: 'Travel Insurance', description: 'Allianz Global', status: 'Active' }
  ]);

  useEffect(() => {
    async function loadDocuments() {
      if (isUnlocked) {
        try {
          let fetchedDocs: any[] | null = null;
          try { fetchedDocs = await api.getTravelDocuments(); } catch (e) {}
          if (!fetchedDocs || fetchedDocs.length === 0) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data } = await supabase.from('travel_documents').select('*').eq('user_id', user.id);
              if (data) fetchedDocs = data;
            }
          }
          if (fetchedDocs && fetchedDocs.length > 0) {
            setDocuments(fetchedDocs);
          }
        } catch (error) {
          console.error("Failed to fetch documents", error);
        }
      }
    }
    loadDocuments();
  }, [isUnlocked]);

  const handleBiometricUnlock = () => {
    setIsAuthenticating(true);
    // Simulate FaceID / Fingerprint scan delay
    setTimeout(() => {
      setIsAuthenticating(false);
      setIsUnlocked(true);
    }, 1500);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-accent mb-2">Secure Travel Vault</h2>
          <p className="text-muted text-sm mb-8">
            Your passports, visas, and booking QR codes are AES-256 encrypted and accessible offline.
          </p>
          
          <button 
            onClick={handleBiometricUnlock}
            disabled={isAuthenticating}
            className="w-full py-4 rounded-xl bg-accent text-white font-bold flex items-center justify-center gap-3 hover:bg-accent/90 transition-all group relative overflow-hidden"
          >
            {isAuthenticating ? (
              <Fingerprint size={24} className="animate-pulse text-primary" />
            ) : (
              <Fingerprint size={24} className="group-hover:scale-110 transition-transform" />
            )}
            {isAuthenticating ? 'Verifying Identity...' : 'Unlock with Biometrics'}
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted font-medium">
            <ShieldCheck size={14} className="text-green-500" />
            Bank-grade Security
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent flex items-center gap-3">
              Travel Wallet
              <ShieldCheck size={28} className="text-green-500" />
            </h1>
            <p className="text-muted mt-2 text-sm sm:text-base">All your essential documents, unified and synced.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-bold text-accent shadow-sm">
            <WifiOff size={16} className="text-muted" />
            Offline Ready
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: QR & Tickets */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg text-accent flex items-center gap-2 mb-4">
              <QrCode size={20} className="text-primary" />
              Active Boarding Passes
            </h3>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent text-white rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8"
            >
              {/* Ticket Details */}
              <div className="flex-1 w-full relative z-10 border-b md:border-b-0 md:border-r border-white/20 pb-6 md:pb-0 md:pr-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <Plane size={24} className="text-primary" />
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Business</span>
                </div>
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                  <div>
                    <p className="text-4xl font-display font-bold">JFK</p>
                    <p className="text-gray-400 text-sm">New York</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <p className="text-xs text-gray-400 mb-1">8h 45m</p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-display font-bold">FCO</p>
                    <p className="text-gray-400 text-sm">Rome</p>
                  </div>
                </div>
                <div className="flex justify-between bg-white/10 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Flight</p>
                    <p className="font-bold">AZ 609</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Gate</p>
                    <p className="font-bold">B12</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Seat</p>
                    <p className="font-bold">4A</p>
                  </div>
                </div>
              </div>
              
              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shrink-0">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TripsySecureTicket" alt="QR Code" className="w-32 h-32 mb-2" />
                <p className="text-accent text-xs font-bold uppercase tracking-widest">Ready to Scan</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Identity Documents */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-accent flex items-center gap-2 mb-4">
              <FileText size={20} className="text-primary" />
              Identity & Visas
            </h3>
            
            {documents.map((doc, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary transition-all">
                <div>
                  <h4 className="font-bold text-accent">{doc.title}</h4>
                  <p className="text-xs text-muted mt-1">{doc.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">{doc.status}</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}

            <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-muted font-bold flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all">
              <Download size={18} />
              Import Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}