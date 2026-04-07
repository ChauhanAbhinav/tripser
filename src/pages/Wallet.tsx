import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet as WalletIcon, 
  Plus, 
  CreditCard, 
  FileText, 
  Shield, 
  Smartphone, 
  ChevronRight,
  Lock,
  QrCode,
  Download
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const DOCUMENTS = [
  { id: 1, type: 'Passport', name: 'Passport - John Doe', expiry: '2028-12-01', icon: FileText, color: 'bg-blue-50 text-blue-500' },
  { id: 2, type: 'Visa', name: 'Japan e-Visa', expiry: '2026-05-15', icon: FileText, color: 'bg-purple-50 text-purple-500' },
  { id: 3, type: 'Insurance', name: 'Travel Guard Policy', expiry: '2026-04-20', icon: Shield, color: 'bg-green-50 text-green-500' },
];

const BOARDING_PASSES = [
  { id: 1, flight: 'AA 234', from: 'JFK', to: 'FCO', date: 'Apr 12', seat: '12A', gate: 'B4' },
];

export default function Wallet() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-accent">Travel Wallet</h1>
            <p className="text-muted mt-2">Secure, biometric-locked storage for your essentials.</p>
          </div>
          
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Document
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Wallet Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Boarding Passes */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Smartphone size={20} className="text-primary" />
                Active Boarding Passes
              </h2>
              <div className="space-y-4">
                {BOARDING_PASSES.map((pass) => (
                  <motion.div 
                    key={pass.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-accent text-white rounded-3xl overflow-hidden shadow-xl"
                  >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <QrCode size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Flight Number</p>
                          <p className="font-bold">{pass.flight}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Departure</p>
                        <p className="font-bold">{pass.date}</p>
                      </div>
                    </div>
                    
                    <div className="p-8 flex items-center justify-between relative">
                      <div className="text-center">
                        <h3 className="text-4xl font-display font-bold">{pass.from}</h3>
                        <p className="text-xs text-gray-400 mt-1">New York</p>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center px-8">
                        <div className="w-full h-px border-t border-dashed border-white/30 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent px-2">
                            <Smartphone size={16} className="text-primary" />
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="text-4xl font-display font-bold">{pass.to}</h3>
                        <p className="text-xs text-gray-400 mt-1">Rome</p>
                      </div>
                    </div>

                    <div className="bg-white/5 p-6 flex justify-around text-center">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Gate</p>
                        <p className="font-bold">{pass.gate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Seat</p>
                        <p className="font-bold">{pass.seat}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Boarding</p>
                        <p className="font-bold">08:15 AM</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Documents List */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Travel Documents
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {DOCUMENTS.map((doc) => (
                  <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", doc.color)}>
                        <doc.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-accent">{doc.type}</h4>
                        <p className="text-xs text-muted">{doc.name}</p>
                      </div>
                    </div>
                    <button className="text-gray-300 group-hover:text-primary transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-bold text-accent mb-4">Travel Vault</h3>
              <p className="text-muted leading-relaxed mb-6">
                Your documents are encrypted with AES-256 and accessible offline. Biometric unlock required for viewing.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Shield size={14} />
                  <span>End-to-end Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Shield size={14} />
                  <span>Offline Sync Enabled</span>
                </div>
              </div>
              <button className="w-full mt-8 btn-primary py-3 rounded-xl">
                Manage Security
              </button>
            </div>

            <div className="bg-accent text-white p-8 rounded-3xl relative overflow-hidden">
               <h4 className="text-lg font-bold mb-4">One-Touch SOS</h4>
               <p className="text-sm text-gray-400 mb-6">Instantly share your location and documents with local emergency services.</p>
               <button className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-colors">
                 Activate SOS
               </button>
               <div className="absolute -bottom-4 -right-4 opacity-10">
                 <Shield size={100} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
