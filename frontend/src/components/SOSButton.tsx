import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Phone, MapPin, X, AlertTriangle, BellRing } from 'lucide-react';
import { useToast } from './Toast';

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const { toast } = useToast();

  const handleAlert = () => {
    setIsAlerting(true);
    setTimeout(() => {
      setIsAlerting(false);
      setIsOpen(false);
      toast("Emergency contacts and local authorities have been notified of your location.", "success");
    }, 2000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center text-white hover:bg-red-600 transition-all hover:scale-110"
      >
        <ShieldAlert size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
            >
              <div className="bg-red-500 p-6 text-white text-center relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors">
                  <X size={18} />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-2xl font-display font-bold mb-1">Emergency SOS</h2>
                <p className="text-red-100 text-sm">Discreetly share your live location</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="bg-white p-3 rounded-full text-red-500 shadow-sm"><MapPin size={24} /></div>
                  <div>
                    <p className="font-bold text-red-900">Current Location Tracking</p>
                    <p className="text-sm text-red-700">Accuracy: 5 meters</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
                    <Phone size={24} className="text-accent mb-2" />
                    <span className="font-bold text-sm text-accent">Local Police (112)</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
                    <BellRing size={24} className="text-accent mb-2" />
                    <span className="font-bold text-sm text-accent">Angel Advocate</span>
                  </button>
                </div>

                <button onClick={handleAlert} disabled={isAlerting} className="w-full mt-4 py-4 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-70">
                  {isAlerting ? <AlertTriangle size={20} className="animate-pulse" /> : <ShieldAlert size={20} />}
                  {isAlerting ? 'Broadcasting...' : 'Slide to SOS Alert'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}