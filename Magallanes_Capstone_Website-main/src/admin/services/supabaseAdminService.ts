import { supabase, isConfigured } from '../../lib/supabaseClient';
import {
  NewsAnnouncement,
  ServiceItem,
  BarangayItem,
  OfficialItem,
  OfficeItem,
  TransparencyDocument,
  BidAward,
  ChatbotSessionLog,
  ContactMessage,
  IntentResponse,
} from '../types';
import {
  INITIAL_NEWS,
  INITIAL_SERVICES,
  INITIAL_BARANGAYS,
  INITIAL_OFFICIALS,
  INITIAL_OFFICES,
  INITIAL_TRANSPARENCY,
  INITIAL_BIDS,
  INITIAL_CHAT_LOGS,
  INITIAL_MESSAGES,
  INITIAL_INTENTS,
} from './mockData';

// Local storage helper for fallback/demo persistence
function getStored<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(`admin_db_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return fallback;
}

function setStored<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(`admin_db_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

export const isSupabaseLive = Boolean(supabase && isConfigured);

export const supabaseAdmin = {
  // 1. News & Announcements
  async getNews(): Promise<NewsAnnouncement[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('news_announcements')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local news store:', err);
      }
    }
    return getStored<NewsAnnouncement>('news', INITIAL_NEWS);
  },

  async saveNews(item: Partial<NewsAnnouncement>): Promise<NewsAnnouncement> {
    const isEdit = Boolean(item.id);
    const id = item.id || 'news-' + Date.now();
    const payload: NewsAnnouncement = {
      id,
      title: item.title || '',
      title_bisaya: item.title_bisaya || '',
      body: item.body || '',
      body_bisaya: item.body_bisaya || '',
      category: item.category || 'general',
      is_published: item.is_published ?? true,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isEdit) {
          const { data, error } = await supabase
            .from('news_announcements')
            .update(payload)
            .eq('id', id)
            .select()
            .single();
          if (!error && data) return data;
        } else {
          const { data, error } = await supabase
            .from('news_announcements')
            .insert([payload])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (err) {
        console.warn('Supabase news save fallback:', err);
      }
    }

    const current = getStored<NewsAnnouncement>('news', INITIAL_NEWS);
    const updated = isEdit ? current.map((n) => (n.id === id ? payload : n)) : [payload, ...current];
    setStored('news', updated);
    return payload;
  },

  async deleteNews(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('news_announcements').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete news err:', err);
      }
    }
    const current = getStored<NewsAnnouncement>('news', INITIAL_NEWS);
    setStored('news', current.filter((n) => n.id !== id));
    return true;
  },

  // 2. Services (Citizen's Charter)
  async getServices(): Promise<ServiceItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local services store:', err);
      }
    }
    return getStored<ServiceItem>('services', INITIAL_SERVICES);
  },

  async saveService(item: Partial<ServiceItem>): Promise<ServiceItem> {
    const isEdit = Boolean(item.id);
    const id = item.id || 'srv-' + Date.now();
    const payload: ServiceItem = {
      id,
      name: item.name || '',
      name_bisaya: item.name_bisaya || '',
      category: item.category || 'General',
      requirements: item.requirements || '',
      requirements_bisaya: item.requirements_bisaya || '',
      fee: item.fee || 'None',
      processing_time: item.processing_time || '1 day',
      office: item.office || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isEdit) {
          const { data } = await supabase.from('services').update(payload).eq('id', id).select().single();
          if (data) return data;
        } else {
          const { data } = await supabase.from('services').insert([payload]).select().single();
          if (data) return data;
        }
      } catch (err) {
        console.warn('Supabase service save fallback:', err);
      }
    }

    const current = getStored<ServiceItem>('services', INITIAL_SERVICES);
    const updated = isEdit ? current.map((s) => (s.id === id ? payload : s)) : [payload, ...current];
    setStored('services', updated);
    return payload;
  },

  async deleteService(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<ServiceItem>('services', INITIAL_SERVICES);
    setStored('services', current.filter((s) => s.id !== id));
    return true;
  },

  // 3. Barangays
  async getBarangays(): Promise<BarangayItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('barangays')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local barangays store:', err);
      }
    }
    return getStored<BarangayItem>('barangays', INITIAL_BARANGAYS);
  },

  async saveBarangay(item: Partial<BarangayItem>): Promise<BarangayItem> {
    const isEdit = Boolean(item.id);
    const id = item.id || 'bgy-' + Date.now();
    const payload: BarangayItem = {
      id,
      name: item.name || '',
      captain_name: item.captain_name || '',
      contact_number: item.contact_number || '',
      address: item.address || '',
      population: Number(item.population) || 0,
      created_at: item.created_at || new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isEdit) {
          const { data } = await supabase.from('barangays').update(payload).eq('id', id).select().single();
          if (data) return data;
        } else {
          const { data } = await supabase.from('barangays').insert([payload]).select().single();
          if (data) return data;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    const current = getStored<BarangayItem>('barangays', INITIAL_BARANGAYS);
    const updated = isEdit ? current.map((b) => (b.id === id ? payload : b)) : [...current, payload];
    setStored('barangays', updated);
    return payload;
  },

  async deleteBarangay(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('barangays').delete().eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<BarangayItem>('barangays', INITIAL_BARANGAYS);
    setStored('barangays', current.filter((b) => b.id !== id));
    return true;
  },

  // 4. Officials
  async getOfficials(): Promise<OfficialItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('officials')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local officials store:', err);
      }
    }
    return getStored<OfficialItem>('officials', INITIAL_OFFICIALS);
  },

  async saveOfficial(item: Partial<OfficialItem>): Promise<OfficialItem> {
    const isEdit = Boolean(item.id);
    const id = item.id || 'off-' + Date.now();
    const payload: OfficialItem = {
      id,
      full_name: item.full_name || '',
      position: item.position || '',
      photo_url: item.photo_url || '',
      term_start: item.term_start || '',
      term_end: item.term_end || '',
      is_current: item.is_current ?? true,
      display_order: Number(item.display_order) || 1,
      created_at: item.created_at || new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isEdit) {
          const { data } = await supabase.from('officials').update(payload).eq('id', id).select().single();
          if (data) return data;
        } else {
          const { data } = await supabase.from('officials').insert([payload]).select().single();
          if (data) return data;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    const current = getStored<OfficialItem>('officials', INITIAL_OFFICIALS);
    const updated = isEdit ? current.map((o) => (o.id === id ? payload : o)) : [...current, payload];
    setStored('officials', updated);
    return payload;
  },

  async deleteOfficial(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('officials').delete().eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<OfficialItem>('officials', INITIAL_OFFICIALS);
    setStored('officials', current.filter((o) => o.id !== id));
    return true;
  },

  // 5. Offices
  async getOffices(): Promise<OfficeItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('offices')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local offices store:', err);
      }
    }
    return getStored<OfficeItem>('offices', INITIAL_OFFICES);
  },

  async saveOffice(item: Partial<OfficeItem>): Promise<OfficeItem> {
    const isEdit = Boolean(item.id);
    const id = item.id || 'ofc-' + Date.now();
    const payload: OfficeItem = {
      id,
      name: item.name || '',
      head_name: item.head_name || '',
      location: item.location || '',
      contact_number: item.contact_number || '',
      email: item.email || '',
      office_hours: item.office_hours || '8:00 AM – 5:00 PM',
      created_at: item.created_at || new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isEdit) {
          const { data } = await supabase.from('offices').update(payload).eq('id', id).select().single();
          if (data) return data;
        } else {
          const { data } = await supabase.from('offices').insert([payload]).select().single();
          if (data) return data;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    const current = getStored<OfficeItem>('offices', INITIAL_OFFICES);
    const updated = isEdit ? current.map((o) => (o.id === id ? payload : o)) : [...current, payload];
    setStored('offices', updated);
    return payload;
  },

  async deleteOffice(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('offices').delete().eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<OfficeItem>('offices', INITIAL_OFFICES);
    setStored('offices', current.filter((o) => o.id !== id));
    return true;
  },

  // 6. Transparency Documents
  async getTransparency(): Promise<TransparencyDocument[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transparency_documents')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local transparency store:', err);
      }
    }
    return getStored<TransparencyDocument>('transparency', INITIAL_TRANSPARENCY);
  },

  async uploadTransparency(item: Partial<TransparencyDocument>): Promise<TransparencyDocument> {
    const id = 'trn-' + Date.now();
    const payload: TransparencyDocument = {
      id,
      title: item.title || '',
      category: item.category || 'budget',
      file_url: item.file_url || '',
      fiscal_year: item.fiscal_year || new Date().getFullYear().toString(),
      is_archived: false,
      uploaded_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data } = await supabase.from('transparency_documents').insert([payload]).select().single();
        if (data) return data;
      } catch (err) {
        console.warn(err);
      }
    }

    const current = getStored<TransparencyDocument>('transparency', INITIAL_TRANSPARENCY);
    const updated = [payload, ...current];
    setStored('transparency', updated);
    return payload;
  },

  async archiveTransparency(id: string, is_archived = true): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('transparency_documents').update({ is_archived }).eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<TransparencyDocument>('transparency', INITIAL_TRANSPARENCY);
    setStored(
      'transparency',
      current.map((t) => (t.id === id ? { ...t, is_archived } : t))
    );
    return true;
  },

  // 7. Bids & Awards (RA 9184)
  async getBids(): Promise<BidAward[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bids_awards')
          .select('*')
          .order('posting_date', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local bids store:', err);
      }
    }
    return getStored<BidAward>('bids', INITIAL_BIDS);
  },

  async saveBid(item: Partial<BidAward>): Promise<BidAward> {
    const isEdit = Boolean(item.id);
    const id = item.id || 'bid-' + Date.now();
    const payload: BidAward = {
      id,
      title: item.title || '',
      reference_number: item.reference_number || '',
      status: item.status || 'open',
      posting_date: item.posting_date || new Date().toISOString().split('T')[0],
      bid_opening_date: item.bid_opening_date || '',
      award_date: item.award_date || '',
      awarded_to: item.awarded_to || '',
      document_url: item.document_url || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isEdit) {
          const { data } = await supabase.from('bids_awards').update(payload).eq('id', id).select().single();
          if (data) return data;
        } else {
          const { data } = await supabase.from('bids_awards').insert([payload]).select().single();
          if (data) return data;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    const current = getStored<BidAward>('bids', INITIAL_BIDS);
    const updated = isEdit ? current.map((b) => (b.id === id ? payload : b)) : [payload, ...current];
    setStored('bids', updated);
    return payload;
  },

  async deleteBid(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('bids_awards').delete().eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<BidAward>('bids', INITIAL_BIDS);
    setStored('bids', current.filter((b) => b.id !== id));
    return true;
  },

  // 8. Chatbot Session Logs (Read-only + CSV Exporter)
  async getChatLogs(): Promise<ChatbotSessionLog[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chatbot_session_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local chat logs:', err);
      }
    }
    return getStored<ChatbotSessionLog>('chat_logs', INITIAL_CHAT_LOGS);
  },

  // 9. Contact Messages Inbox
  async getMessages(): Promise<ContactMessage[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local messages store:', err);
      }
    }
    return getStored<ContactMessage>('messages', INITIAL_MESSAGES);
  },

  async markMessageRead(id: string, is_read = true): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('contact_messages').update({ is_read }).eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<ContactMessage>('messages', INITIAL_MESSAGES);
    setStored('messages', current.map((m) => (m.id === id ? { ...m, is_read } : m)));
    return true;
  },

  async archiveMessage(id: string, is_archived = true): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('contact_messages').update({ is_archived }).eq('id', id);
      } catch (err) {
        console.warn(err);
      }
    }
    const current = getStored<ContactMessage>('messages', INITIAL_MESSAGES);
    setStored('messages', current.map((m) => (m.id === id ? { ...m, is_archived } : m)));
    return true;
  },

  // 10. Intent Responses
  async getIntentResponses(): Promise<IntentResponse[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('intent_responses')
          .select('*')
          .order('intent_name', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local intent responses:', err);
      }
    }
    return getStored<IntentResponse>('intents', INITIAL_INTENTS);
  },

  async saveIntentResponse(item: Partial<IntentResponse>): Promise<IntentResponse> {
    const isEdit = Boolean(item.id);
    const id = item.id || 'intent-' + Date.now();
    const payload: IntentResponse = {
      id,
      intent_name: item.intent_name || '',
      response_en: item.response_en || '',
      response_bisaya: item.response_bisaya || '',
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        if (isEdit) {
          const { data } = await supabase.from('intent_responses').update(payload).eq('id', id).select().single();
          if (data) return data;
        } else {
          const { data } = await supabase.from('intent_responses').insert([payload]).select().single();
          if (data) return data;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    const current = getStored<IntentResponse>('intents', INITIAL_INTENTS);
    const updated = isEdit ? current.map((i) => (i.id === id ? payload : i)) : [...current, payload];
    setStored('intents', updated);
    return payload;
  },

  // Storage Upload Helper for 'public-documents' bucket
  async uploadFileToStorage(file: File, folder = 'general'): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    if (supabase) {
      try {
        const { error: uploadErr } = await supabase.storage.from('public-documents').upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
        if (!uploadErr) {
          const { data } = supabase.storage.from('public-documents').getPublicUrl(fileName);
          if (data?.publicUrl) return data.publicUrl;
        } else {
          console.warn('Supabase storage upload error:', uploadErr.message);
        }
      } catch (err) {
        console.warn('Supabase upload exception:', err);
      }
    }
    // Safe simulated storage URL for testing when storage bucket is not configured
    return `https://storage.magallanes.gov.ph/public-documents/${fileName}`;
  },
};
