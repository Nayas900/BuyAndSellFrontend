import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SplashPage } from '@/pages/auth/SplashPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { PostAdPage } from '@/pages/PostAdPage';
import { InboxPage } from '@/pages/chat/InboxPage';
import { ConversationPage } from '@/pages/chat/ConversationPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SavedPage } from '@/pages/SavedPage';
import { MyTradesPage } from '@/pages/MyTradesPage';
import { NotificationsPage } from '@/pages/NotificationsPage';

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Public browsing */}
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />

      {/* Protected */}
      <Route path="/sell" element={<ProtectedRoute><PostAdPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
      <Route path="/trades" element={<ProtectedRoute><MyTradesPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
