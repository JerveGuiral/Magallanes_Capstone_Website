import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
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

// Admin Context & Layout
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { AdminLayout } from './components/admin/AdminLayout';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminNews } from './pages/admin/AdminNews';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminBarangays } from './pages/admin/AdminBarangays';
import { AdminOfficials } from './pages/admin/AdminOfficials';
import { AdminOffices } from './pages/admin/AdminOffices';
import { AdminTransparency } from './pages/admin/AdminTransparency';
import { AdminBidsAwards } from './pages/admin/AdminBidsAwards';
import { AdminChatLogs } from './pages/admin/AdminChatLogs';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminChatbotResponses } from './pages/admin/AdminChatbotResponses';
import { AdminSettings } from './pages/admin/AdminSettings';

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
          {/* Admin Login Screen */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="barangays" element={<AdminBarangays />} />
            <Route path="officials" element={<AdminOfficials />} />
            <Route path="offices" element={<AdminOffices />} />
            <Route path="transparency" element={<AdminTransparency />} />
            <Route path="bids-awards" element={<AdminBidsAwards />} />
            <Route path="chat-logs" element={<AdminChatLogs />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="chatbot-responses" element={<AdminChatbotResponses />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Public Website Routes */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/transparency" element={<Transparency />} />
                  <Route path="/officials" element={<Officials />} />
                  <Route path="/barangays" element={<Barangays />} />
                  <Route path="/tourism" element={<Tourism />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}