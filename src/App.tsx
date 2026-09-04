import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
    </BrowserRouter>);

}