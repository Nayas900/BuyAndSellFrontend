import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextInput } from '@/components/inputs/TextInput';
import { Button } from '@/components/ui/Button';
import appIcon from '@/assets/bc.png';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* ── Left branding panel (desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 xl:w-3/5 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-800" />
        <div className="absolute w-96 h-96 bg-brand-600/20 rounded-full blur-3xl -top-10 right-0 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <img src={appIcon} alt="App icon" className="w-10 h-10 rounded-2xl object-cover shadow-xl shadow-brand-600/30" />
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-4">
            Join thousands<br />
            of <span className="text-brand-400">local traders</span>.
          </h2>
          <p className="text-slate-400 text-lg">Create your free account and start buying or selling in minutes.</p>

          <ul className="mt-10 space-y-3">
            {[
              'Free to list items',
              'Secure messaging with buyers',
              'Verified seller badge',
              'No commissions on sales',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-brand-600/30 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">© 2026. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-white lg:rounded-l-[2.5rem]">
        {/* Mobile top */}
        <div className="lg:hidden flex flex-col items-center pt-16 pb-8 bg-slate-900 relative overflow-hidden">
          <div className="absolute w-72 h-72 bg-brand-600/20 rounded-full blur-3xl -top-10 -right-20 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-brand-600/30 mb-3"
          >
            <img src={appIcon} alt="App icon" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-10"
        >
          <div className="max-w-sm w-full mx-auto lg:mx-0">
            <div className="hidden lg:flex mb-10">
              <img src={appIcon} alt="App icon" className="w-10 h-10 rounded-xl object-cover" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
            <p className="text-slate-500 text-sm mb-8">Create your account and get started</p>

            <div className="space-y-4">
              <TextInput label="Full Name" type="text" placeholder="Your name" icon={<UserIcon size={16} />} />
              <TextInput label="Phone Number" type="tel" placeholder="+91 98765 43210" icon={<Phone size={16} />} />
              <TextInput label="Email" type="email" placeholder="you@email.com" icon={<Mail size={16} />} />
              <TextInput
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            <p className="text-xs text-slate-400 mt-4">
              By signing up, you agree to our{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Terms</span> and{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <Button fullWidth size="lg" className="mt-6" onClick={() => navigate('/')}>
              Create Account
            </Button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-brand-600 font-semibold hover:underline">
                Login
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
