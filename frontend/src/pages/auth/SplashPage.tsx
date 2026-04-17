import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import appIcon from '@/assets/bc.png';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute w-72 h-72 bg-brand-600/20 rounded-full blur-3xl top-10 -right-20 pointer-events-none" />
      <div className="absolute w-56 h-56 bg-brand-400/10 rounded-full blur-3xl bottom-20 -left-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-5"
      >
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-brand-600/40">
          <img src={appIcon} alt="App icon" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 text-slate-500 text-sm"
      >
        Your local marketplace
      </motion.p>
    </div>
  );
};
