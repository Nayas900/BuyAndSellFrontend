import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/stores/authStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<Props> = ({ open, onClose }) => {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!location.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ location: location.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-4"
          >
            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl mb-6 sm:mb-0"
            >
              {/* Skip button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <MapPin size={26} className="text-brand-600" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 text-center">Where are you?</h2>
              <p className="text-sm text-slate-500 text-center mt-1 mb-6">
                Buyers will see your location when browsing listings.
              </p>

              <input
                type="text"
                placeholder="e.g. Kurukshetra, Haryana"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              />

              <button
                onClick={handleSave}
                disabled={!location.trim() || saving}
                className="mt-4 w-full py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Set Location'}
              </button>

              <button
                onClick={onClose}
                className="mt-2 w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
