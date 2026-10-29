import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { BidsAwards } from './pages/BidsAwards';
import { Transparency } from './pages/Transparency';
import { Officials } from './pages/Officials';
import { Barangays } from './pages/Barangays';
import { Tourism } from './pages/Tourism';
import { TourismDetail } from './pages/TourismDetail';
import { News } from './pages/News';
import { NewsDetail } from './pages/NewsDetail';
import { Contact } from './pages/Contact';
import { Offices } from './pages/Offices';
import { ReportConcern } from './pages/ReportConcern';
import { Privacy } from './pages/Privacy';
import { FOI } from './pages/FOI';
import { NotFound } from './pages/NotFound';
import { supabase } from './lib/supabaseClient';

// Admin Context
import { AdminAuthProvider } from './contexts/AdminAuthContext';

/* The admin portal is loaded only when someone opens it: residents on phones never download it
 * (it was most of a single 1 MB bundle). The pages use named exports, hence the mapping. */
function lazyNamed<K extends string>(load: () => Promise<Record<K, React.ComponentType<any>>>, name: K) {
  return React.lazy(() => load().then((m) => ({ default: m[name] })));
}
const AdminLayout = lazyNamed(() => import('./components/admin/AdminLayout'), 'AdminLayout');
const AdminLogin = lazyNamed(() => import('./pages/admin/AdminLogin'), 'AdminLogin');
const AdminDashboard = lazyNamed(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminNews = lazyNamed(() => import('./pages/admin/AdminNews'), 'AdminNews');
const AdminServices = lazyNamed(() => import('./pages/admin/AdminServices'), 'AdminServices');
const AdminBarangays = lazyNamed(() => import('./pages/admin/AdminBarangays'), 'AdminBarangays');
const AdminOfficials = lazyNamed(() => import('./pages/admin/AdminOfficials'), 'AdminOfficials');
const AdminOffices = lazyNamed(() => import('./pages/admin/AdminOffices'), 'AdminOffices');
const AdminTransparency = lazyNamed(() => import('./pages/admin/AdminTransparency'), 'AdminTransparency');
const AdminBidsAwards = lazyNamed(() => import('./pages/admin/AdminBidsAwards'), 'AdminBidsAwards');
const AdminChatLogs = lazyNamed(() => import('./pages/admin/AdminChatLogs'), 'AdminChatLogs');
const AdminMessages = lazyNamed(() => import('./pages/admin/AdminMessages'), 'AdminMessages');
const AdminChatbotResponses = lazyNamed(() => import('./pages/admin/AdminChatbotResponses'), 'AdminChatbotResponses');
const AdminSettings = lazyNamed(() => import('./pages/admin/AdminSettings'), 'AdminSettings');

function AdminLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-muted text-[0.875rem] text-ink-muted" role="status">
      Loading the admin portal…
    </div>
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
    // Opt in to React Router v7 behaviour now (silences the console warnings on every page).
    // Safe here: every link in the app is an absolute path, so the splat-route change to
    // relative link resolution affects nothing.
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminAuthProvider>
        <Routes>
          {/* Admin Login Screen */}
          <Route
            path="/admin/login"
            element={
              <React.Suspense fallback={<AdminLoading />}>
                <AdminLogin />
              </React.Suspense>
            }
          />

          {/* Protected Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <React.Suspense fallback={<AdminLoading />}>
                <AdminLayout>
                  <React.Suspense fallback={<AdminLoading />}>
                    <Outlet />
                  </React.Suspense>
                </AdminLayout>
              </React.Suspense>
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
                  <Route path="/bids" element={<BidsAwards />} />
                  <Route path="/transparency" element={<Transparency />} />
                  <Route path="/officials" element={<Officials />} />
                  <Route path="/barangays" element={<Barangays />} />
                  <Route path="/tourism" element={<Tourism />} />
                  <Route path="/tourism/:id" element={<TourismDetail />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/offices" element={<Offices />} />
                  <Route path="/report" element={<ReportConcern />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/foi" element={<FOI />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}