import { supabase } from '../lib/supabaseClient';

// --- Type Definitions for all 10 Supabase Tables ---

export interface NewsAnnouncement {
  id: string;
  title: string;
  title_bisaya?: string | null;
  body: string;
  body_bisaya?: string | null;
  category: 'advisory' | 'event' | 'general';
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  name_bisaya?: string | null;
  category?: string | null;
  requirements: string;
  requirements_bisaya?: string | null;
  fee?: string | null;
  processing_time?: string | null;
  office?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BarangayItem {
  id: string;
  name: string;
  captain_name?: string | null;
  contact_number?: string | null;
  address?: string | null;
  population?: number | null;
  created_at?: string;
}

export interface OfficialItem {
  id: string;
  full_name: string;
  position: string;
  photo_url?: string | null;
  term_start?: string | null;
  term_end?: string | null;
  is_current: boolean;
  display_order: number;
  created_at?: string;
}

export interface OfficeItem {
  id: string;
  name: string;
  head_name?: string | null;
  location?: string | null;
  contact_number?: string | null;
  email?: string | null;
  office_hours?: string | null;
  created_at?: string;
}

export interface TransparencyDoc {
  id: string;
  title: string;
  category: 'budget' | 'procurement' | 'org-chart' | 'saln' | 'other';
  file_url: string;
  fiscal_year?: string | null;
  uploaded_at?: string;
  uploaded_by?: string | null;
  is_archived?: boolean;
}

export interface BidAwardItem {
  id: string;
  title: string;
  reference_number?: string | null;
  status: 'open' | 'closed' | 'awarded';
  posting_date: string;
  bid_opening_date?: string | null;
  award_date?: string | null;
  awarded_to?: string | null;
  document_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatSessionLog {
  id: string;
  session_id: string;
  user_message?: string | null;
  detected_intent?: string | null;
  bot_response?: string | null;
  language_detected?: string | null;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at?: string;
}

export interface IntentResponse {
  id: string;
  intent_name: string;
  response_en: string;
  response_bisaya: string;
  updated_at?: string;
}

// Check if Supabase client is initialized
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// Storage bucket name
export const STORAGE_BUCKET = 'public-documents';

// Storage Upload Helper
export async function uploadPublicDocument(file: File, folder = 'transparency'): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) {
    return { url: null, error: 'Supabase client is not configured. Please provide VITE_SUPABASE_URL in .env' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${folder}/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'File upload failed' };
  }
}

// Generic CRUD helpers for tables
export const adminService = {
  // 1. News & Announcements
  async getNews() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('news_announcements').select('*').order('created_at', { ascending: false });
  },
  async createNews(item: Omit<NewsAnnouncement, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('news_announcements').insert([item]).select().single();
  },
  async updateNews(id: string, updates: Partial<NewsAnnouncement>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('news_announcements').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  },
  async deleteNews(id: string) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('news_announcements').delete().eq('id', id);
  },

  // 2. Services (Citizen's Charter)
  async getServices() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('services').select('*').order('name', { ascending: true });
  },
  async createService(item: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('services').insert([item]).select().single();
  },
  async updateService(id: string, updates: Partial<ServiceItem>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('services').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  },
  async deleteService(id: string) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('services').delete().eq('id', id);
  },

  // 3. Barangays
  async getBarangays() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('barangays').select('*').order('name', { ascending: true });
  },
  async createBarangay(item: Omit<BarangayItem, 'id' | 'created_at'>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('barangays').insert([item]).select().single();
  },
  async updateBarangay(id: string, updates: Partial<BarangayItem>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('barangays').update(updates).eq('id', id).select().single();
  },
  async deleteBarangay(id: string) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('barangays').delete().eq('id', id);
  },

  // 4. Officials
  async getOfficials() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('officials').select('*').order('display_order', { ascending: true });
  },
  async createOfficial(item: Omit<OfficialItem, 'id' | 'created_at'>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('officials').insert([item]).select().single();
  },
  async updateOfficial(id: string, updates: Partial<OfficialItem>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('officials').update(updates).eq('id', id).select().single();
  },
  async deleteOfficial(id: string) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('officials').delete().eq('id', id);
  },

  // 5. Offices
  async getOffices() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('offices').select('*').order('name', { ascending: true });
  },
  async createOffice(item: Omit<OfficeItem, 'id' | 'created_at'>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('offices').insert([item]).select().single();
  },
  async updateOffice(id: string, updates: Partial<OfficeItem>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('offices').update(updates).eq('id', id).select().single();
  },
  async deleteOffice(id: string) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('offices').delete().eq('id', id);
  },

  // 6. Transparency Documents
  async getTransparencyDocs() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('transparency_documents').select('*').order('uploaded_at', { ascending: false });
  },
  async createTransparencyDoc(item: Omit<TransparencyDoc, 'id' | 'uploaded_at'>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('transparency_documents').insert([item]).select().single();
  },
  async archiveTransparencyDoc(id: string, is_archived = true) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('transparency_documents').update({ is_archived }).eq('id', id).select().single();
  },
  async deleteTransparencyDoc(id: string) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('transparency_documents').delete().eq('id', id);
  },

  // 7. Bids & Awards
  async getBidsAwards() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('bids_awards').select('*').order('posting_date', { ascending: false });
  },
  async createBidAward(item: Omit<BidAwardItem, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('bids_awards').insert([item]).select().single();
  },
  async updateBidAward(id: string, updates: Partial<BidAwardItem>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('bids_awards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  },
  async deleteBidAward(id: string) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('bids_awards').delete().eq('id', id);
  },

  // 8. Chatbot Session Logs (read-only)
  async getChatLogs(limit = 100) {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('chatbot_session_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  },

  // 9. Contact Messages
  async getContactMessages() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
  },
  async updateMessageStatus(id: string, updates: { is_read?: boolean; is_archived?: boolean }) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('contact_messages').update(updates).eq('id', id).select().single();
  },

  // 10. Intent Responses
  async getIntentResponses() {
    if (!supabase) return { data: [], error: null };
    return await supabase.from('intent_responses').select('*').order('intent_name', { ascending: true });
  },
  async upsertIntentResponse(item: { intent_name: string; response_en: string; response_bisaya: string }) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('intent_responses').upsert(
      { ...item, updated_at: new Date().toISOString() },
      { onConflict: 'intent_name' }
    ).select().single();
  },
  async updateIntentResponse(id: string, updates: Partial<IntentResponse>) {
    if (!supabase) throw new Error('Supabase client not connected');
    return await supabase.from('intent_responses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  },

  // Dashboard Overview Metrics Aggregator
  async getDashboardStats() {
    if (!supabase) {
      return {
        newsCount: 0,
        unreadMessages: 0,
        pendingBids: 0,
        servicesCount: 0,
        barangaysCount: 0,
        chatLogsCount: 0,
        urgentBids: [],
      };
    }

    try {
      const [
        newsRes,
        messagesRes,
        bidsRes,
        servicesRes,
        barangaysRes,
        chatLogsRes
      ] = await Promise.all([
        supabase.from('news_announcements').select('id, is_published', { count: 'exact' }),
        supabase.from('contact_messages').select('id, is_read, is_archived', { count: 'exact' }),
        supabase.from('bids_awards').select('*').order('posting_date', { ascending: false }),
        supabase.from('services').select('id', { count: 'exact' }),
        supabase.from('barangays').select('id', { count: 'exact' }),
        supabase.from('chatbot_session_logs').select('id', { count: 'exact' }),
      ]);

      const unreadCount = messagesRes.data?.filter(m => !m.is_read && !m.is_archived).length || 0;
      const allBids = bidsRes.data || [];
      const pendingBidsCount = allBids.filter(b => b.status === 'open').length;

      // Identify bids opening in the next 3 days or open past opening date
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      const urgentBids = allBids.filter(bid => {
        if (bid.status !== 'open' || !bid.bid_opening_date) return false;
        const opening = new Date(bid.bid_opening_date);
        return opening <= threeDaysFromNow;
      });

      return {
        newsCount: newsRes.count || newsRes.data?.length || 0,
        unreadMessages: unreadCount,
        pendingBids: pendingBidsCount,
        servicesCount: servicesRes.count || servicesRes.data?.length || 0,
        barangaysCount: barangaysRes.count || barangaysRes.data?.length || 0,
        chatLogsCount: chatLogsRes.count || chatLogsRes.data?.length || 0,
        urgentBids: urgentBids.slice(0, 5),
      };
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      return {
        newsCount: 0,
        unreadMessages: 0,
        pendingBids: 0,
        servicesCount: 0,
        barangaysCount: 0,
        chatLogsCount: 0,
        urgentBids: [],
      };
    }
  },
};
