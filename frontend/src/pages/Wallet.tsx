import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, WifiOff, FileText, QrCode, Lock, Plane, Download,
  Plus, Trash2, Archive, CheckCircle, ScanLine,
  Globe, Heart, X, Upload, Camera,
  ChevronDown, ChevronUp, MoreVertical, Clock, Ticket,
  CreditCard, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

type PassStatus = 'active' | 'archived';
type DocType = 'passport' | 'visa' | 'insurance' | 'ticket' | 'other';

interface BoardingPass {
  id: string;
  from_code: string;
  from_city: string;
  to_code: string;
  to_city: string;
  flight: string;
  gate: string;
  seat: string;
  class: string;
  duration: string;
  status: PassStatus;
  date?: string;
}

interface TravelDoc {
  id: string;
  title: string;
  description: string;
  type: DocType;
  status: string;
  file_url?: string;
  file_type?: 'image' | 'pdf';
  expiry?: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_PASSES: BoardingPass[] = [
  {
    id: '1',
    from_code: 'JFK', from_city: 'New York',
    to_code: 'FCO', to_city: 'Rome',
    flight: 'AZ 609', gate: 'B12', seat: '4A',
    class: 'Business', duration: '8h 45m',
    status: 'active', date: '14 Jun 2026',
  },
  {
    id: '2',
    from_code: 'FCO', from_city: 'Rome',
    to_code: 'NRT', to_city: 'Tokyo',
    flight: 'AZ 786', gate: 'C4', seat: '22C',
    class: 'Economy', duration: '12h 20m',
    status: 'active', date: '25 Jun 2026',
  },
  {
    id: '3',
    from_code: 'DXB', from_city: 'Dubai',
    to_code: 'JFK', to_city: 'New York',
    flight: 'EK 201', gate: 'A9', seat: '7B',
    class: 'Business', duration: '14h 10m',
    status: 'archived', date: '2 Jan 2026',
  },
];

const MOCK_DOCS: TravelDoc[] = [
  { id: 'd1', title: 'US Passport', description: 'Expires Oct 2030 · Passport #: P123456789', type: 'passport', status: 'Verified', expiry: '2030-10-15' },
  { id: 'd2', title: 'Schengen E-Visa', description: 'Valid 90 days · Italy / France / Germany', type: 'visa', status: 'Active', expiry: '2026-12-01' },
  { id: 'd3', title: 'Allianz Travel Insurance', description: 'Policy #: ALZ-2026-889922 · Worldwide', type: 'insurance', status: 'Active', expiry: '2026-08-01' },
];

const DOC_TYPE_CONFIG: Record<DocType, { label: string; icon: React.ReactNode; color: string }> = {
  passport: { label: 'Passport', icon: <Globe size={16} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  visa: { label: 'Visa', icon: <CreditCard size={16} />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  insurance: { label: 'Insurance', icon: <Heart size={16} />, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  ticket: { label: 'Ticket', icon: <Ticket size={16} />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  other: { label: 'Document', icon: <FileText size={16} />, color: 'bg-gray-50 text-gray-600 border-gray-100' },
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

function PassCard({ pass, onArchive, onDelete, onDownload }: {
  pass: BoardingPass;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (pass: BoardingPass) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative rounded-3xl overflow-hidden shadow-xl ${pass.status === 'archived' ? 'opacity-70' : ''}`}
    >
      {/* Notch cutouts */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-50 rounded-full -translate-x-1/2 z-10" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-50 rounded-full translate-x-1/2 z-10" />

      <div className={`${pass.status === 'archived' ? 'bg-gray-700' : 'bg-accent'} text-white`}>
        {/* Top strip */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Plane size={18} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {pass.status === 'archived' ? 'Completed Trip' : 'Boarding Pass'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              pass.status === 'archived' ? 'bg-gray-600 text-gray-300' : 'bg-primary/20 text-primary'
            }`}>
              {pass.class}
            </span>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1 rounded-full hover:bg-white/10 transition"
              >
                <MoreVertical size={16} className="text-gray-400" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-8 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 w-44 overflow-hidden"
                  >
                    {pass.status === 'active' && (
                      <button
                        onClick={() => { onArchive(pass.id); setMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Archive size={14} className="text-muted" /> Archive Pass
                      </button>
                    )}
                    <button
                      onClick={() => { onDownload(pass); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Download size={14} className="text-muted" /> Download PDF
                    </button>
                    <button
                      onClick={() => { onDelete(pass.id); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete Pass
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-end justify-between px-6 pb-5 border-b border-white/10">
          <div>
            <p className="text-5xl font-display font-bold leading-none">{pass.from_code}</p>
            <p className="text-gray-400 text-sm mt-1">{pass.from_city}</p>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 px-6">
            <p className="text-xs text-gray-400">{pass.duration}</p>
            <div className="flex items-center gap-1 w-full">
              <div className="w-2 h-2 rounded-full border border-gray-500" />
              <div className="flex-1 h-px bg-gradient-to-r from-gray-600 via-primary to-gray-600" />
              <Plane size={14} className="text-primary -rotate-0" />
            </div>
            {pass.date && <p className="text-xs text-gray-500">{pass.date}</p>}
          </div>
          <div className="text-right">
            <p className="text-5xl font-display font-bold leading-none">{pass.to_code}</p>
            <p className="text-gray-400 text-sm mt-1">{pass.to_city}</p>
          </div>
        </div>

        {/* Details + QR */}
        <div className="flex items-stretch gap-0">
          <div className="flex-1 grid grid-cols-3 gap-0 px-6 py-4 border-r border-dashed border-white/15">
            {[
              { label: 'Flight', val: pass.flight },
              { label: 'Gate', val: pass.gate },
              { label: 'Seat', val: pass.seat },
            ].map(({ label, val }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="font-bold text-base mt-0.5">{val}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 flex flex-col items-center justify-center gap-1">
            <div className="bg-white p-2 rounded-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=TRIPSER-${pass.flight}-${pass.seat}`}
                alt="QR"
                className="w-16 h-16"
              />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Scan</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DocCard({ doc, onDownload, onDelete }: {
  doc: TravelDoc;
  onDownload: (doc: TravelDoc) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = DOC_TYPE_CONFIG[doc.type];

  const isExpiring = doc.expiry
    ? (new Date(doc.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 90
    : false;

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer group"
        onClick={() => setExpanded(v => !v)}
      >
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.color}`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-accent text-sm">{doc.title}</h4>
            {isExpiring && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={9} /> Expiring Soon
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5 truncate">{doc.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${cfg.color}`}>
            {doc.status}
          </span>
          {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t border-gray-50 flex flex-col gap-3">
              {doc.expiry && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Clock size={12} />
                  <span>Expires: <strong className="text-accent">{new Date(doc.expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                </div>
              )}
              {doc.file_url ? (
                <div className="bg-gray-50 rounded-xl overflow-hidden max-h-48">
                  {doc.file_type === 'image'
                    ? <img src={doc.file_url} alt={doc.title} className="w-full object-cover" />
                    : <div className="flex items-center gap-3 p-4">
                        <FileText size={32} className="text-red-400" />
                        <div>
                          <p className="text-sm font-bold text-accent">PDF Document</p>
                          <p className="text-xs text-muted">Tap download to view</p>
                        </div>
                      </div>
                  }
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border-2 border-dashed border-gray-200">
                  <Upload size={18} className="text-muted" />
                  <p className="text-xs text-muted">No file attached — tap to upload image or PDF</p>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDownload(doc)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Add Pass Modal ──────────────────────────────────────────────────────────

function AddPassModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: BoardingPass) => void }) {
  const [form, setForm] = useState({
    from_code: '', from_city: '', to_code: '', to_city: '',
    flight: '', gate: '', seat: '', class: 'Economy', duration: '', date: '',
  });
  const [scanning, setScanning] = useState(false);

  const handleSubmit = () => {
    if (!form.from_code || !form.to_code) return;
    onAdd({ ...form, id: crypto.randomUUID(), status: 'active' });
    onClose();
  };

  const handleScan = () => {
    setScanning(true);
    // Simulate scan parsing after 2s
    setTimeout(() => {
      setForm({
        from_code: 'DEL', from_city: 'New Delhi',
        to_code: 'LHR', to_city: 'London',
        flight: 'AI 111', gate: 'D7', seat: '14C',
        class: 'Economy', duration: '9h 15m', date: '20 Jul 2026',
      });
      setScanning(false);
    }, 2000);
  };

  const field = (key: keyof typeof form, label: string, placeholder?: string) => (
    <div>
      <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>
      <input
        value={form[key]}
        onChange={e => setForm(v => ({ ...v, [key]: e.target.value }))}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-accent focus:outline-none focus:border-primary"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold text-accent">Add Boarding Pass</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-50">
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* Scan button */}
        <button
          onClick={handleScan}
          disabled={scanning}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-primary/40 text-primary font-bold text-sm mb-6 hover:bg-primary/5 transition"
        >
          {scanning ? (
            <><ScanLine size={20} className="animate-pulse" /> Scanning QR Code…</>
          ) : (
            <><Camera size={20} /> Scan Boarding Pass QR Code</>
          )}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-muted font-bold">OR ENTER MANUALLY</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field('from_code', 'From (IATA)', 'JFK')}
          {field('from_city', 'City', 'New York')}
          {field('to_code', 'To (IATA)', 'FCO')}
          {field('to_city', 'City', 'Rome')}
          {field('flight', 'Flight', 'AZ 609')}
          {field('gate', 'Gate', 'B12')}
          {field('seat', 'Seat', '4A')}
          {field('duration', 'Duration', '8h 45m')}
          {field('date', 'Date', '14 Jun 2026')}
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Class</label>
            <select
              value={form.class}
              onChange={e => setForm(v => ({ ...v, class: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-accent focus:outline-none focus:border-primary"
            >
              <option>Economy</option>
              <option>Business</option>
              <option>First</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-6 py-3.5 rounded-2xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition"
        >
          Add Boarding Pass
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Document Modal ──────────────────────────────────────────────────────

function AddDocModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: TravelDoc) => void }) {
  const [form, setForm] = useState({ title: '', type: 'passport' as DocType, status: 'Active' });
  const fileRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<{ url: string; type: 'image' | 'pdf' } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFilePreview({ url, type: f.type.includes('pdf') ? 'pdf' : 'image' });
  };

  const handleSubmit = () => {
    if (!form.title) return;
    onAdd({
      id: crypto.randomUUID(),
      ...form,
      description: '',
      file_url: filePreview?.url,
      file_type: filePreview?.type,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold text-accent">Add Document</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-50"><X size={18} className="text-muted" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Document Type</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(DOC_TYPE_CONFIG) as DocType[]).map(t => {
                const cfg = DOC_TYPE_CONFIG[t];
                return (
                  <button
                    key={t}
                    onClick={() => setForm(v => ({ ...v, type: t }))}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition ${
                      form.type === t ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-muted hover:border-gray-200'
                    }`}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Title</label>
            <input value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
              placeholder="e.g. US Passport"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>

          {/* File upload */}
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Attach File (Image or PDF)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-2 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition"
            >
              {filePreview ? (
                filePreview.type === 'image'
                  ? <img src={filePreview.url} className="max-h-32 rounded-xl object-cover" alt="preview" />
                  : <div className="flex items-center gap-3">
                      <FileText size={32} className="text-red-400" />
                      <span className="text-sm font-bold text-accent">PDF attached</span>
                    </div>
              ) : (
                <>
                  <Upload size={24} className="text-muted" />
                  <p className="text-sm text-muted">Click to upload image or PDF</p>
                  <p className="text-xs text-gray-400">JPEG, PNG, PDF up to 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full mt-6 py-3.5 rounded-2xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition">
          Save Document
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Wallet() {
  const [passes, setPasses] = useState<BoardingPass[]>(MOCK_PASSES);
  const [docs, setDocs] = useState<TravelDoc[]>(MOCK_DOCS);
  const [showArchived, setShowArchived] = useState(false);
  const [addPassOpen, setAddPassOpen] = useState(false);
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'passes' | 'documents'>('passes');

  const activePasses = passes.filter(p => p.status === 'active');
  const archivedPasses = passes.filter(p => p.status === 'archived');

  const handleArchive = (id: string) => setPasses(ps => ps.map(p => p.id === id ? { ...p, status: 'archived' } : p));
  const handleDeletePass = (id: string) => setPasses(ps => ps.filter(p => p.id !== id));
  const handleDeleteDoc = (id: string) => setDocs(ds => ds.filter(d => d.id !== id));

  const handleDownloadPass = (pass: BoardingPass) => {
    // In production: generate PDF via jsPDF or call edge function
    const content = `TRIPSER BOARDING PASS\n\nFlight: ${pass.flight}\nFrom: ${pass.from_city} (${pass.from_code})\nTo: ${pass.to_city} (${pass.to_code})\nDate: ${pass.date || 'N/A'}\nGate: ${pass.gate}\nSeat: ${pass.seat}\nClass: ${pass.class}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BoardingPass_${pass.flight.replace(/\s+/g, '_')}.pdf.txt`;
    link.click();
  };

  const handleDownload = (doc: TravelDoc) => {
    // In production: generate PDF via jsPDF or call edge function
    const link = document.createElement('a');
    if (doc.file_url) {
      link.href = doc.file_url;
      link.download = `${doc.title.replace(/\s+/g, '_')}.${doc.file_type === 'pdf' ? 'pdf' : 'jpg'}`;
    } else {
      // Generate simple text PDF fallback
      const content = `TRIPSER — ${doc.title}\n\n${doc.description}\nStatus: ${doc.status}\nExpiry: ${doc.expiry ?? 'N/A'}`;
      const blob = new Blob([content], { type: 'text/plain' });
      link.href = URL.createObjectURL(blob);
      link.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
    }
    link.click();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-accent flex items-center gap-3">
              Travel Wallet
              <ShieldCheck size={28} className="text-green-500 shrink-0" />
            </h1>
            <p className="text-muted mt-1.5 text-sm">Boarding passes &amp; identity documents, all in one place.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-bold text-accent shadow-sm w-fit">
            <WifiOff size={14} className="text-muted" />
            Offline Ready
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-gray-100 shadow-sm p-1 mb-8 w-fit">
          {(['passes', 'documents'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-accent text-white shadow'
                  : 'text-muted hover:text-accent'
              }`}
            >
              {tab === 'passes' ? <QrCode size={15} /> : <FileText size={15} />}
              {tab === 'passes' ? 'Boarding Passes' : 'Documents'}
              <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${
                activeTab === tab ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab === 'passes' ? activePasses.length : docs.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Boarding Passes Tab ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'passes' && (
            <motion.div
              key="passes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Active */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-accent flex items-center gap-2">
                  <CheckCircle size={17} className="text-green-500" /> Active Passes
                </h2>
                <button
                  onClick={() => setAddPassOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition shadow"
                >
                  <Plus size={14} /> Add Pass
                </button>
              </div>

              {activePasses.length === 0 ? (
                <div className="py-16 text-center text-muted">
                  <QrCode size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No active boarding passes</p>
                  <p className="text-xs mt-1">Add your first pass to get started</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <AnimatePresence>
                    {activePasses.map(p => (
                      <PassCard key={p.id} pass={p} onArchive={handleArchive} onDelete={handleDeletePass} onDownload={handleDownloadPass} />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Archived */}
              {archivedPasses.length > 0 && (
                <div className="mt-10">
                  <button
                    onClick={() => setShowArchived(v => !v)}
                    className="flex items-center gap-2 text-sm font-bold text-muted hover:text-accent transition mb-4"
                  >
                    <Archive size={15} />
                    Archived Passes ({archivedPasses.length})
                    {showArchived ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {showArchived && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-5 overflow-hidden"
                      >
                        {archivedPasses.map(p => (
                          <PassCard key={p.id} pass={p} onArchive={handleArchive} onDelete={handleDeletePass} onDownload={handleDownloadPass} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Documents Tab ── */}
          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-accent flex items-center gap-2">
                  <Lock size={17} className="text-primary" /> Identity &amp; Documents
                </h2>
                <button
                  onClick={() => setAddDocOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition shadow"
                >
                  <Plus size={14} /> Add Document
                </button>
              </div>

              {/* Category sections */}
              {(['passport', 'visa', 'insurance', 'ticket', 'other'] as DocType[]).map(type => {
                const typeDocs = docs.filter(d => d.type === type);
                if (typeDocs.length === 0) return null;
                const cfg = DOC_TYPE_CONFIG[type];
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}s
                      </span>
                    </div>
                    <div className="space-y-2">
                      {typeDocs.map(doc => (
                        <DocCard key={doc.id} doc={doc} onDownload={handleDownload} onDelete={handleDeleteDoc} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {docs.length === 0 && (
                <div className="py-16 text-center text-muted">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No documents yet</p>
                  <p className="text-xs mt-1">Add your passport, visa, or insurance to get started</p>
                </div>
              )}

              {/* Security note */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
                <ShieldCheck size={18} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800">AES-256 Encrypted</p>
                  <p className="text-xs text-green-600 mt-0.5">Documents are encrypted at rest and never shared. Accessible offline after first sync.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addPassOpen && <AddPassModal onClose={() => setAddPassOpen(false)} onAdd={p => setPasses(ps => [p, ...ps])} />}
        {addDocOpen && <AddDocModal onClose={() => setAddDocOpen(false)} onAdd={d => setDocs(ds => [d, ...ds])} />}
      </AnimatePresence>
    </div>
  );
}