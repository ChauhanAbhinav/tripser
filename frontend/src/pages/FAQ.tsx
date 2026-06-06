import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';

const FAQS = [
  { q: 'How does the Trip Planner algorithm work?', a: 'Our algorithm analyzes thousands of data points including safety scores, sensory levels, opening hours, and your specific vibes to construct an optimized day-by-day plan instantly.' },
  { q: 'Is Tripser really free to use?', a: 'Yes! Core features like generating itineraries, saving packing lists, and using the community tools are completely free for all travelers.' },
  { q: 'How does the split budget calculator work?', a: 'In your Dashboard, you can log expenses and select which friends you are splitting the cost with. Tripser will automatically calculate "who owes who" behind the scenes.' },
  { q: 'Can I use Tripser offline?', a: 'Currently, you need an internet connection to generate new trips and sync expenses. We are working on an offline-first mobile app coming soon!' },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        <div className="text-center mb-12 w-full max-w-3xl">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-display font-bold text-accent mb-4">Help & FAQ</h1>
          <p className="text-muted text-lg font-medium">Everything you need to know about using Tripser.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 w-full max-w-3xl">
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="border border-gray-100 rounded-2xl p-5 bg-gray-50 hover:bg-gray-100/50 transition-colors group cursor-pointer">
                <summary className="font-bold text-accent text-base list-none flex justify-between items-center outline-none">
                  {faq.q}
                  <ChevronRight size={18} className="text-primary group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted font-medium border-t border-gray-200 pt-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center w-full max-w-3xl">
          <p className="text-muted text-sm font-medium">Still have questions?</p>
          <button className="mt-3 font-bold text-primary hover:underline">
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}