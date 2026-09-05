import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Transparency } from './pages/Transparency';
import { Officials } from './pages/Officials';
import { Barangays } from './pages/Barangays';
import { Tourism } from './pages/Tourism';
import { News } from './pages/News';
import { Contact } from './pages/Contact';
import { supabase } from './lib/supabaseClient';

// Admin Imports
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLogin } from './admin/pages/AdminLogin';
import { DashboardOverview } from './admin/pages/DashboardOverview';
import { NewsManager } from './admin/pages/NewsManager';
import { ServicesManager } from './admin/pages/ServicesManager';
import { BarangaysManager } from './admin/pages/BarangaysManager';
import { OfficialsManager } from './admin/pages/OfficialsManager';
import { OfficesManager } from './admin/pages/OfficesManager';
import { TransparencyManager } from './admin/pages/TransparencyManager';
import { BidsAwardsManager } from './admin/pages/BidsAwardsManager';
import { ChatLogsViewer } from './admin/pages/ChatLogsViewer';
import { MessagesInbox } from './admin/pages/MessagesInbox';
import { ChatbotResponsesManager } from './admin/pages/ChatbotResponsesManager';
import { AdminSettings } from './admin/pages/AdminSettings';

// Protected Route wrapper for Admin Portal
function ProtectedAdminRoute() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface font-sans text-sm text-slate-500">
        Authenticating administrator session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

// Public Citizen Layout Wrapper
function PublicLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function App() {
  useEffect(() => {
    try {
      if (supabase) {
        console.log('[Supabase] Client initialized successfully on app load.');
      }
    } catch (err) {
      console.error('[Supabase] Initialization error:', err);
    }
  }, []);

  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Public Citizen Portal Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/officials" element={<Officials />} />
            <Route path="/barangays" element={<Barangays />} />
            <Route path="/tourism" element={<Tourism />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Portal Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<DashboardOverview />} />
            <Route path="news" element={<NewsManager />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="barangays" element={<BarangaysManager />} />
            <Route path="officials" element={<OfficialsManager />} />
            <Route path="offices" element={<OfficesManager />} />
            <Route path="transparency" element={<TransparencyManager />} />
            <Route path="bids-awards" element={<BidsAwardsManager />} />
            <Route path="chat-logs" element={<ChatLogsViewer />} />
            <Route path="messages" element={<MessagesInbox />} />
            <Route path="chatbot-responses" element={<ChatbotResponsesManager />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback to Public Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}