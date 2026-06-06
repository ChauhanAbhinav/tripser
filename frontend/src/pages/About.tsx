import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Shield, Gem, Map, Users, ChevronRight, Sparkles, Globe } from 'lucide-react';

const TEAM = [
  { name: 'Aria Chen',    role: 'Founder & CEO',       avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria'    },
  { name: 'Marcus Vidal', role: 'Head of Product',      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'  },
  { name: 'Priya Sharma', role: 'Lead Engineer',        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'   },
  { name: 'Leo Park',     role: 'Community & Growth',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo'     },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Globe size={40} />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-display font-bold text-accent mb-6"
        >
          About Tripsy
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted text-lg font-medium max-w-2xl mx-auto leading-relaxed"
        >
          We built Tripser because travel planning shouldn't take longer than the trip itself. A personalized planner that puts safety, authenticity, and your budget first.
        </motion.p>
      </div>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 pt-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-3">Our Mission</span>
            <h2 className="text-3xl font-display font-bold text-accent mb-5">More travel, less planning anxiety.</h2>
            <p className="text-muted text-base leading-relaxed mb-5">
              We believe every traveler deserves a personalised, safe, and affordable itinerary — whether they're solo-travelling for the first time or a seasoned explorer chasing off-the-beaten-path experiences.
            </p>
            <p className="text-muted text-base leading-relaxed">
              Our algorithm weighs safety scores, real community insights, hidden gem ratings, and your budget to build day-by-day plans you can actually trust.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield,  label: 'Safety First',    desc: 'Every route scored and verified by community data.',    color: 'text-green-600',  bg: 'bg-green-50'  },
              { icon: Gem,     label: 'Hidden Gems',     desc: 'Places the algorithm finds that guides overlook.',      color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Map,     label: 'Smart Routing',   desc: 'Optimised day plans that respect your energy and time.',color: 'text-primary',    bg: 'bg-primary/10'},
              { icon: Users,   label: 'Community',       desc: 'Real traveler tips and live safety check-ins.',         color: 'text-amber-600',  bg: 'bg-amber-50'  },
            ].map(v => (
              <div key={v.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${v.bg}`}>
                  <v.icon size={18} className={v.color} />
                </div>
                <h4 className="font-bold text-accent text-sm mb-1">{v.label}</h4>
                <p className="text-muted text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '50,000+', label: 'Trips planned'    },
            { val: '200+',    label: 'Hidden gems'      },
            { val: '9.8/10',  label: 'Avg safety score' },
            { val: '120+',    label: 'Destinations'     },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-3xl font-display font-bold text-accent mb-1">{val}</p>
              <p className="text-muted text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-2">The People</span>
          <h2 className="text-3xl font-display font-bold text-accent">Built by travelers, for travelers.</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map(person => (
            <div key={person.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-all">
              <img src={person.avatar} alt={person.name} className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-100" />
              <h4 className="font-bold text-accent">{person.name}</h4>
              <p className="text-muted text-xs font-medium mt-1">{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 text-center pb-8">
        <h3 className="text-2xl font-display font-bold text-accent mb-4">Ready to plan your next trip?</h3>
        <p className="text-muted mb-6">Takes less than 2 minutes to build a full AI itinerary.</p>
        <button onClick={() => navigate('/planner')} className="btn-primary py-3 px-8 inline-flex items-center gap-2 font-bold shadow-md">
          Start Planning <ChevronRight size={16} />
        </button>
      </section>
    </div>
  );
}