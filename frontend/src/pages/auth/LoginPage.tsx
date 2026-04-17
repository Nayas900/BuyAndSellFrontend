import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import appIcon from '@/assets/bc.png';
import api from '@/lib/api';

interface MarketplaceStats {
  activeListings: number;
  happyUsers: number;
  weeklyListings: number;
  avgRating: number | null;
}

const formatCompactCount = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
  if (value >= 1_000) return `${Math.floor(value / 1_000)}K+`;
  return `${value}`;
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isLoading, user } = useAuthStore();
  const [stats, setStats] = React.useState<MarketplaceStats>({
    activeListings: 0,
    happyUsers: 0,
    weeklyListings: 0,
    avgRating: null,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;
    api.get<MarketplaceStats>('/products/stats/marketplace')
      .then(({ data }) => {
        if (mounted) setStats(data);
      })
      .catch(() => {
        // Keep zero fallback if stats API fails.
      });
    return () => { mounted = false; };
  }, []);

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/', { replace: true });
    } catch {
      // error is set in store; nothing to do here
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 xl:w-3/5 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-800" />
        <div className="absolute w-96 h-96 bg-brand-600/20 rounded-full blur-3xl top-0 right-0 pointer-events-none" />
        <div className="absolute w-64 h-64 bg-blue-400/10 rounded-full blur-3xl bottom-20 left-10 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <img src={appIcon} alt="App icon" className="w-16 h-16 rounded-3xl object-cover shadow-xl shadow-brand-600/30" />
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-4">
            Buy & sell<br />
            <span className="text-brand-400">anything,</span><br />
            locally.
          </h2>
          <p className="text-slate-400 text-lg">Kurukshetra's most trusted peer-to-peer marketplace.</p>

          <div className="flex gap-8 mt-10">
            {[
              { value: formatCompactCount(stats.activeListings), label: 'Active Listings' },
              { value: formatCompactCount(stats.happyUsers), label: 'Happy Users' },
              { value: stats.avgRating === null ? 'N/A' : `${stats.avgRating.toFixed(1)}★`, label: 'Avg. Rating' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-8">
            <TrendingUp size={15} className="text-brand-400" />
            <span className="text-slate-400 text-sm">
              {stats.weeklyListings.toLocaleString('en-IN')} listings posted this week
            </span>
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">© 2026. All rights reserved.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white lg:rounded-l-[2.5rem]">
        {/* Mobile dark header */}
        <div className="lg:hidden flex flex-col items-center pt-20 pb-10 bg-slate-900 relative overflow-hidden">
          <div className="absolute w-72 h-72 bg-brand-600/20 rounded-full blur-3xl top-10 -right-20 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-brand-600/30 mb-4"
          >
            <img src={appIcon} alt="App icon" className="w-full h-full object-cover" />
          </motion.div>
          <p className="text-slate-400 text-sm mt-1">Your local marketplace</p>
        </div>

        {/* Form content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12"
        >
          <div className="w-full max-w-sm">
            {/* Desktop logo */}
            <div className="hidden lg:flex mb-10">
              <img src={appIcon} alt="App icon" className="w-10 h-10 rounded-xl object-cover" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome</h2>
            <p className="text-slate-500 text-sm mb-8">
              Sign in to access your account and start trading.
            </p>

            {/* Google Sign-In button (rendered by Google SDK) */}
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex items-center gap-3 py-3.5 px-6 border border-surface-border rounded-xl text-slate-600 text-sm">
                  <div className="w-4 h-4 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
                  Signing you in…
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => {
                    // Google popup closed or failed — nothing to do
                  }}
                  size="large"
                  shape="rectangular"
                  theme="outline"
                  text="continue_with"
                  width="320"
                />
              )}
            </div>

            {/* Divider + trust copy */}
            <div className="mt-8 pt-8 border-t border-surface-border text-center space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                By continuing, you agree to our{' '}
                <span className="text-brand-600 cursor-pointer hover:underline">Terms</span> and{' '}
                <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Secured by Google OAuth 2.0. We never store your password.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
