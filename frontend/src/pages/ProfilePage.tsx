import React, { useState, useRef } from 'react';
import {
  ShoppingBag, HelpCircle, Heart, Star, UserCircle,
  Settings, ChevronRight, LogOut, Edit3, MapPin,
  Calendar, Shield, Camera, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import useAuthStore from '@/stores/authStore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { nameAvatar } from '@/lib/adapters';

const menuItems = [
  { icon: ShoppingBag, label: 'My Trades',   sublabel: 'Check your trading history',     path: '/trades' },
  { icon: HelpCircle,  label: 'Help Center', sublabel: 'Help regarding your recent trades', path: '/help' },
  { icon: Heart,       label: 'Favorites',   sublabel: 'Your collection',                path: '/saved' },
  { icon: Star,        label: 'Ratings',     sublabel: 'Your ratings',                   path: '/ratings' },
  { icon: UserCircle,  label: 'My Profile',  sublabel: 'Change your profile details',    path: '/edit-profile' },
  { icon: Settings,    label: 'Settings',    sublabel: 'App preferences & privacy',      path: '/settings' },
];

const profileTabs = ['About', 'Reviews'];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('About');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const displayName   = user?.name   || 'Guest';
  const displayAvatar = user?.avatar || nameAvatar(displayName);
  const displayLoc    = user?.location || 'Location not set';
  const displayJoined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      await updateProfile({ avatar: url } as Parameters<typeof updateProfile>[0]);
    } catch {
      // silently fail — user sees no change
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const AvatarBlock = ({ size = 'md' }: { size?: 'md' | 'lg' }) => {
    const dim = size === 'lg' ? 'w-20 h-20' : 'w-20 h-20';
    return (
      <div className="relative shrink-0">
        <img src={displayAvatar} alt={displayName} className={`${dim} rounded-full object-cover ring-4 ring-brand-100`} />
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-md"
        >
          {uploadingAvatar
            ? <Loader2 size={13} className="text-white animate-spin" />
            : <Camera size={13} className="text-white" />
          }
        </button>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>
    );
  };

  return (
    <PageShell>
      {/* ── Mobile header ── */}
      <div className="lg:hidden bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-slate-800">Profile</h1>
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center">
            <Edit3 size={16} className="text-slate-600" />
          </motion.button>
        </div>

        <div className="flex items-center gap-4">
          <AvatarBlock />
          <div>
            <h2 className="text-lg font-bold text-slate-800">{displayName}</h2>
            <p className="text-sm text-brand-600 font-medium">KKR Member</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <MapPin size={11} className="text-brand-500" />
              {displayLoc}
            </div>
          </div>
        </div>

        {user?.bio && <p className="mt-3 text-sm text-slate-500 leading-relaxed">{user.bio}</p>}

        <button
          onClick={handleLogout}
          className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 rounded-xl text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>

      {/* ── Desktop two-column ── */}
      <div className="lg:flex lg:gap-8 lg:px-6 lg:pt-8 lg:pb-10">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-5 w-72 xl:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-brand-600 to-brand-400 relative">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white to-transparent" />
            </div>
            <div className="px-5 pb-5 -mt-10 relative">
              <div className="flex items-end justify-between mb-3">
                {/* Desktop avatar with upload */}
                <div className="relative shrink-0">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center ring-2 ring-white shadow"
                  >
                    {uploadingAvatar
                      ? <Loader2 size={11} className="text-white animate-spin" />
                      : <Camera size={11} className="text-white" />
                    }
                  </button>
                </div>
              </div>
              <h2 className="text-lg font-bold text-slate-800">{displayName}</h2>
              <p className="text-sm text-brand-600 font-medium">KKR Member</p>
              {user?.bio && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{user.bio}</p>}
              <div className="flex flex-col gap-1.5 mt-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={12} className="text-brand-500 shrink-0" />{displayLoc}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={12} className="text-brand-500 shrink-0" />Joined {displayJoined}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield size={12} className="text-emerald-500 shrink-0" />Verified Account
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-card divide-y divide-surface-border">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-muted transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-brand-600" />
                  </div>
                  <span className="flex-1 font-medium text-slate-700 text-sm">{item.label}</span>
                  <ChevronRight size={14} className="text-slate-400 shrink-0" />
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl shadow-card text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors duration-150"
          >
            <LogOut size={16} /> Log Out
          </motion.button>
        </aside>

        {/* Right column */}
        <div className="flex-1 min-w-0">
          {/* Desktop tab bar */}
          <div className="hidden lg:flex gap-1 bg-white rounded-2xl shadow-card p-1.5 mb-6">
            {profileTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-surface-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile menu list */}
          <div className="lg:hidden px-4 pt-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-card divide-y divide-surface-border">
              {menuItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-surface-muted transition-colors duration-150"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.sublabel}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Desktop tab content */}
          <div className="hidden lg:block">
            {activeTab === 'About' && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-slate-800 mb-4">About {displayName}</h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin,    label: 'Location',     value: displayLoc },
                    { icon: Calendar,  label: 'Member since', value: displayJoined },
                    { icon: Shield,    label: 'Status',       value: 'Verified' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-semibold text-slate-700">{value}</p>
                      </div>
                    </div>
                  ))}
                  {user?.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                        <UserCircle size={16} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                      </div>
                    </div>
                  )}
                  {user?.bio && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <Edit3 size={16} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Bio</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{user.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="space-y-4">
                {[
                  { name: 'Priya Das',    rating: 5, text: 'Very smooth transaction. Item was exactly as described!', date: '2 days ago' },
                  { name: 'Amit Roy',     rating: 5, text: 'Quick response, honest seller. Highly recommend.',        date: '1 week ago' },
                  { name: 'Sneha Ghosh',  rating: 4, text: 'Good experience overall. Minor delay in response.',       date: '2 weeks ago' },
                ].map((review) => (
                  <div key={review.name} className="bg-white rounded-2xl p-5 shadow-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
                        <span className="text-brand-600 font-bold text-sm">{review.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{review.name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};
