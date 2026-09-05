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

export const INITIAL_NEWS: NewsAnnouncement[] = [
  {
    id: 'news-1',
    title: 'Typhoon Preparation Advisory: LGU Activates Incident Command Post',
    title_bisaya: 'Pahimangno sa Pagpangandam sa Bagyo: Gi-aktibo sa LGU ang Incident Command Post',
    body: 'In anticipation of incoming low pressure disturbance, MDRRMO has hoisted Alert Level 2 across all delta river barangays. Evacuation centers are on standby.',
    body_bisaya: 'Tungod sa gipaabot nga dautan nga panahon, gipataas sa MDRRMO ang Alert Level 2 sa tanang barangay duol sa suba. Andam na ang mga evacuation centers.',
    category: 'advisory',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'news-2',
    title: 'Distribution of Free Hybrid Rice Seeds & Organic Fertilizers to Farmers',
    title_bisaya: 'Pagpanghatag sa Libreng Binhi sa Humay ug Organikong Abono sa mga Mag-uuma',
    body: 'The Municipal Agriculture Office conducted ceremonial turnover of high-yield hybrid palay seed bags to 180 registered rice farmers in Barangay Taod-oy.',
    body_bisaya: 'Gipahigayon sa Municipal Agriculture Office ang turnover sa mga de-kalidad nga binhi sa palay alang sa 180 ka mag-uuma sa Barangay Taod-oy.',
    category: 'general',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'news-3',
    title: 'Annual Lisagan Festival Cultural Dance Competition Announced',
    title_bisaya: 'Gipahibalo ang Tinuig nga Lisagan Festival Sayaw Pasundayag',
    body: 'Registration is officially open for the inter-barangay street dancing and cultural presentation scheduled for the 3rd week of October.',
    body_bisaya: 'Bukas na ang rehistrasyon alang sa indigay sa sayaw sa kadalanan tali sa mga barangay karong umaabot nga ikatulong semana sa Oktubre.',
    category: 'event',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Application for New Business Permit',
    name_bisaya: 'Pag-apply og Bag-ong Business Permit',
    category: 'Business & Trade',
    requirements: '1. DTI/SEC Registration, 2. Barangay Business Clearance, 3. Contract of Lease / Title, 4. Fire Safety Inspection Certificate.',
    requirements_bisaya: '1. DTI/SEC Rehistrasyon, 2. Barangay Business Clearance, 3. Kontrata sa Abang / Titulo, 4. Fire Safety Certificate.',
    fee: 'Variable based on capitalization schedule',
    processing_time: '1 to 2 business days',
    office: 'Business Permits and Licensing Office (BPLO)',
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    name: 'Issuance of Certificate of Live Birth / Marriage',
    name_bisaya: 'Pagkuha og Sertipiko sa Pagkatawo / Kasal',
    category: 'Civil Registry',
    requirements: '1. Valid Government ID, 2. Accomplished request slip, 3. Authorization letter if representative.',
    requirements_bisaya: '1. Balidong ID sa gobyerno, 2. Nalamdagang porma sa hangyo, 3. Sulat pagtugot kon representante.',
    fee: '₱100.00 per certified copy',
    processing_time: '30 minutes to 1 hour',
    office: 'Local Civil Registry Office (LCRO)',
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    name: 'Municipal Health Consultation & Lab Services',
    name_bisaya: 'Konsultasyon sa Panglawas ug Serbisyong Medikal',
    category: 'Health & Wellness',
    requirements: '1. PhilHealth ID or Member Data Record, 2. Barangay Health Card / Valid ID.',
    requirements_bisaya: '1. PhilHealth ID o MDR, 2. Barangay Health Card / Balidong ID.',
    fee: 'Free (Basic primary healthcare)',
    processing_time: 'Within the day (Queue-based)',
    office: 'Municipal Health Office (MHO)',
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_BARANGAYS: BarangayItem[] = [
  { id: 'bgy-1', name: 'Poblacion', captain_name: 'Hon. Jose M. Santos', contact_number: '0917 111 2233', address: 'Riverside Street, Poblacion', population: 3840 },
  { id: 'bgy-2', name: 'Buhang', captain_name: 'Hon. Maria Elena Ruiz', contact_number: '0918 222 3344', address: 'Coastal Highway, Buhang', population: 2950 },
  { id: 'bgy-3', name: 'Caloc-an', captain_name: 'Hon. Danilo P. Flores', contact_number: '0920 333 4455', address: 'Caloc-an Delta Road', population: 2410 },
  { id: 'bgy-4', name: 'Guiasan', captain_name: 'Hon. Ernesto S. Beltran', contact_number: '0922 444 5566', address: 'Guiasan Riverbank', population: 1890 },
  { id: 'bgy-5', name: 'Marcos', captain_name: 'Hon. Roberto T. Alvarez', contact_number: '0917 555 6677', address: 'National Highway, Marcos', population: 2120 },
  { id: 'bgy-6', name: 'Santo Niño', captain_name: 'Hon. Clara B. Manalo', contact_number: '0919 666 7788', address: 'Purok 2, Santo Niño', population: 2780 },
  { id: 'bgy-7', name: 'Santo Rosario', captain_name: 'Hon. Gabriel K. Tan', contact_number: '0921 777 8899', address: 'Purok 1, Santo Rosario', population: 1650 },
  { id: 'bgy-8', name: 'Taod-oy', captain_name: 'Hon. Fernando L. Cruz', contact_number: '0923 888 9900', address: 'Upland Road, Taod-oy', population: 1980 }
];

export const INITIAL_OFFICIALS: OfficialItem[] = [
  { id: 'off-1', full_name: 'Hon. Isidro C. Villanueva', position: 'Municipal Mayor', photo_url: '', term_start: '2025-06-30', term_end: '2028-06-30', is_current: true, display_order: 1 },
  { id: 'off-2', full_name: 'Hon. Aurora M. Bagsic', position: 'Municipal Vice Mayor', photo_url: '', term_start: '2025-06-30', term_end: '2028-06-30', is_current: true, display_order: 2 },
  { id: 'off-3', full_name: 'Hon. Rodolfo T. Ampatuan', position: 'SB Member (Appropriations)', photo_url: '', term_start: '2025-06-30', term_end: '2028-06-30', is_current: true, display_order: 3 },
  { id: 'off-4', full_name: 'Hon. Marissa L. Obrero', position: 'SB Member (Health)', photo_url: '', term_start: '2025-06-30', term_end: '2028-06-30', is_current: true, display_order: 4 },
  { id: 'off-5', full_name: 'Hon. Nestor P. Cabahug', position: 'SB Member (Agriculture)', photo_url: '', term_start: '2025-06-30', term_end: '2028-06-30', is_current: true, display_order: 5 }
];

export const INITIAL_OFFICES: OfficeItem[] = [
  { id: 'ofc-1', name: 'Office of the Municipal Mayor', head_name: 'Hon. Isidro C. Villanueva', location: '2nd Floor, Executive Wing', contact_number: '(085) 343-2001', email: 'mayor@magallanes.gov.ph', office_hours: '8:00 AM – 5:00 PM (Mon-Fri)' },
  { id: 'ofc-2', name: 'Business Permits and Licensing Office (BPLO)', head_name: 'Mr. Ernesto V. Dalisay', location: 'Ground Floor, Room 102', contact_number: '(085) 343-2015', email: 'bplo@magallanes.gov.ph', office_hours: '8:00 AM – 5:00 PM' },
  { id: 'ofc-3', name: 'Municipal Disaster Risk Reduction & Management Office (MDRRMO)', head_name: 'Engr. Luzviminda A. Cortes', location: 'MDRRMO Operations Center', contact_number: '0917 000 0000', email: 'mdrrmo@magallanes.gov.ph', office_hours: '24/7 Hotline Operations' },
  { id: 'ofc-4', name: 'Municipal Planning & Development Office (MPDO)', head_name: 'Mr. Bienvenido S. Tabada', location: '2nd Floor, Room 204', contact_number: '(085) 343-2022', email: 'mpdo@magallanes.gov.ph', office_hours: '8:00 AM – 5:00 PM' }
];

export const INITIAL_TRANSPARENCY: TransparencyDocument[] = [
  { id: 'trn-1', title: 'Annual Budget & Statement of Receipts 2026', category: 'budget', file_url: 'https://example.com/budget-2026.pdf', fiscal_year: '2026', is_archived: false, uploaded_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'trn-2', title: 'Annual Investment Program (AIP) 2026', category: 'budget', file_url: 'https://example.com/aip-2026.pdf', fiscal_year: '2026', is_archived: false, uploaded_at: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'trn-3', title: 'Quarterly Procurement Monitoring Report (Q2)', category: 'procurement', file_url: 'https://example.com/procurement-q2.pdf', fiscal_year: '2026', is_archived: false, uploaded_at: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 'trn-4', title: 'LGU Organizational Structure & Staffing Pattern', category: 'org-chart', file_url: 'https://example.com/orgchart.pdf', fiscal_year: '2025-2028', is_archived: false, uploaded_at: new Date(Date.now() - 86400000 * 45).toISOString() }
];

export const INITIAL_BIDS: BidAward[] = [
  {
    id: 'bid-1',
    title: 'Construction of Flood Control Dike Along Lower Baug River Delta',
    reference_number: 'ITB-2026-008',
    status: 'open',
    posting_date: '2026-09-01',
    bid_opening_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Within 3 days -> highlights!
    document_url: 'https://example.com/itb-flood-control.pdf',
    created_at: new Date().toISOString()
  },
  {
    id: 'bid-2',
    title: 'Procurement of Emergency Medical Equipment & Ambulatory Supplies',
    reference_number: 'ITB-2026-006',
    status: 'closed',
    posting_date: '2026-08-10',
    bid_opening_date: '2026-08-25',
    award_date: '2026-09-02',
    awarded_to: 'Caraga Medical Supplies Distribution Inc.',
    document_url: 'https://example.com/noa-medical.pdf',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 'bid-3',
    title: 'Supply and Delivery of 100 Bags Hybrid Rice Seeds for Farmers',
    reference_number: 'ITB-2026-007',
    status: 'awarded',
    posting_date: '2026-08-15',
    bid_opening_date: '2026-08-28',
    award_date: '2026-09-03',
    awarded_to: 'AgriPro Seedlings & Fertilizers Enterprise',
    document_url: 'https://example.com/award-seeds.pdf',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export const INITIAL_CHAT_LOGS: ChatbotSessionLog[] = [
  {
    id: 'log-1',
    session_id: 'sess-84920481',
    user_message: 'Unsaon pag apply ug business permit?',
    detected_intent: 'Permit Inquiry',
    bot_response: 'Para sa bag-ong Business Permit, adto sa BPLO sa Ground Floor. Kinahanglan nimo ang DTI/SEC registration, Barangay Clearance, ug Fire Safety Certificate.',
    language_detected: 'bisaya',
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString()
  },
  {
    id: 'log-2',
    session_id: 'sess-91283746',
    user_message: 'What are the office hours of the municipal hall?',
    detected_intent: 'Office Hours',
    bot_response: 'Municipal Hall offices are open Monday to Friday, from 8:00 AM to 5:00 PM.',
    language_detected: 'english',
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString()
  },
  {
    id: 'log-3',
    session_id: 'sess-10293847',
    user_message: 'Asa dapit ang munisipyo sa Magallanes?',
    detected_intent: 'Location Direction',
    bot_response: 'Ang Magallanes Municipal Hall nahimutang sa Barangay Poblacion, daplin sa Agusan River delta.',
    language_detected: 'bisaya',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString()
  },
  {
    id: 'log-4',
    session_id: 'sess-55829103',
    user_message: 'Pila bayad sa cedula?',
    detected_intent: 'Community Tax Certificate',
    bot_response: 'Ang bayad sa Community Tax Certificate (Cedula) magdepende sa imong kita o suholan. Kuhaa kini sa Municipal Treasury Office.',
    language_detected: 'bisaya',
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString()
  }
];

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Juan Dela Cruz',
    email: 'juandelacruz@gmail.com',
    message: 'Good day. I would like to ask if the MDRRMO provides free lifejackets for small local fishermen in Barangay Buhang? Thank you.',
    is_read: false,
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'msg-2',
    name: 'Maria Clarissa Tan',
    email: 'maria.tan@outlook.com',
    message: 'Greetings! We are planning an educational study tour to Magallanes Centennial Tree. Do we need to submit a prior courtesy letter to the Tourism Office?',
    is_read: true,
    is_archived: false,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'msg-3',
    name: 'Engr. Reynaldo Gomez',
    email: 'rgomez_builders@yahoo.com',
    message: 'Inquiring regarding the opening date and eligibility document submissions for ITB-2026-008 (Flood Control Dike).',
    is_read: true,
    is_archived: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const INITIAL_INTENTS: IntentResponse[] = [
  {
    id: 'intent-1',
    intent_name: 'Permit Inquiry',
    response_en: 'To apply for a Business Permit, visit the BPLO at Ground Floor Room 102. Prepare DTI/SEC registration, Barangay Clearance, Contract of Lease, and Fire Safety Inspection Certificate.',
    response_bisaya: 'Para sa bag-ong Business Permit, bisitaha ang BPLO sa Ground Floor Room 102. Ihanda ang DTI/SEC registration, Barangay Clearance, Kontrata sa Abang, ug Fire Safety Certificate.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'intent-2',
    intent_name: 'Civil Registry Inquiry',
    response_en: 'For Birth, Marriage, or Death Certificates, visit the Local Civil Registry Office (LCRO) on the Ground Floor. Processing typically takes 30-60 minutes.',
    response_bisaya: 'Alang sa Sertipiko sa Pagkatawo, Kasal, o Kamatayon, adto sa Local Civil Registry Office (LCRO) sa Ground Floor. Ang proseso mokuha og mga 30 hangtod 60 minutos.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'intent-3',
    intent_name: 'Emergency Assistance',
    response_en: 'For medical, flood, or disaster emergencies, immediately contact our 24/7 MDRRMO hotline at (085) 000-0000 or 0917 000 0000.',
    response_bisaya: 'Alang sa emerhensiya sa baha o kalamidad, tawag dayon sa atong 24/7 MDRRMO hotline sa (085) 000-0000 o 0917 000 0000.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'intent-4',
    intent_name: 'Tourism & Centennial Tree',
    response_en: 'Welcome to Magallanes! The Century-old Bituag Tree is located in Barangay Caloc-an. Open daily from 8:00 AM to 5:00 PM.',
    response_bisaya: 'Maayong pag-abot sa Magallanes! Ang kapin usa ka gatos ka tuig nga Kahoy sa Bituag nahimutang sa Barangay Caloc-an. Bukas kini adlaw-adlaw gikan 8:00 AM hangtod 5:00 PM.',
    updated_at: new Date().toISOString()
  }
];
