export interface NewsAnnouncement {
  id: string;
  title: string;
  title_bisaya?: string;
  body: string;
  body_bisaya?: string;
  category: 'advisory' | 'event' | 'general';
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  name_bisaya?: string;
  category: string;
  requirements: string;
  requirements_bisaya?: string;
  fee?: string;
  processing_time?: string;
  office?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BarangayItem {
  id: string;
  name: string;
  captain_name?: string;
  contact_number?: string;
  address?: string;
  population?: number;
  created_at?: string;
}

export interface OfficialItem {
  id: string;
  full_name: string;
  position: string;
  photo_url?: string;
  term_start?: string;
  term_end?: string;
  is_current: boolean;
  display_order: number;
  created_at?: string;
}

export interface OfficeItem {
  id: string;
  name: string;
  head_name?: string;
  location?: string;
  contact_number?: string;
  email?: string;
  office_hours?: string;
  created_at?: string;
}

export interface TransparencyDocument {
  id: string;
  title: string;
  category: 'budget' | 'procurement' | 'org-chart' | 'saln' | 'other';
  file_url: string;
  fiscal_year?: string;
  is_archived?: boolean;
  uploaded_at?: string;
  uploaded_by?: string;
}

export interface BidAward {
  id: string;
  title: string;
  reference_number?: string;
  status: 'open' | 'closed' | 'awarded';
  posting_date: string;
  bid_opening_date?: string;
  award_date?: string;
  awarded_to?: string;
  document_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatbotSessionLog {
  id: string;
  session_id: string;
  user_message: string;
  detected_intent: string;
  bot_response: string;
  language_detected: 'english' | 'bisaya' | string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface IntentResponse {
  id: string;
  intent_name: string;
  response_en: string;
  response_bisaya: string;
  updated_at?: string;
}
