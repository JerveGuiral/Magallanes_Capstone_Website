-- ===========================================================================
-- Magallanes LGU — replace placeholder content with the real directory
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to run twice: inserts skip rows that already exist (matched by name),
-- and the deletes target specific test rows by id.
--
-- Sources:
--   - "Directory LGU Magallanes" supplied by the municipality (22 Oct 2026):
--     elected officials, local functionaries, Punong Barangays, emails.
--   - Mayor's Office contact card supplied by the LGU (Oct 2026).
--   - Service requirements: the same checklists the chatbot answers with
--     (server/services/responses.js), so the website and the bot agree.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Remove test data
-- ---------------------------------------------------------------------------
-- Test news posts ("fasfadfadsfasdf", "dfafadfadfas", "fafdf", "Free tae").
delete from public.news_announcements
where id in (
  '12b5853f-7af7-4b96-9219-09d3907fa077',
  '20d4022f-a7bf-41a6-a242-50bfb2461933',
  '158f2ca2-31eb-4e9d-8bac-45ade00c38ad',
  '43019d1b-894f-4bf3-b53f-c0d349c4ed2d'
);

-- Placeholder officials: the invented "Hon. Isidro C. Villanueva" and the test row "kaa".
delete from public.officials
where id in (
  '70e0f339-3860-4ff2-bcc4-fc6beb6adc96',
  '96cc1ddb-d5cf-41d7-9430-579666d2a5da'
);


-- ---------------------------------------------------------------------------
-- 2. Officials (Officials page)
-- ---------------------------------------------------------------------------
-- Elected officials serve the 30 June 2025 – 30 June 2028 term. Appointed
-- department heads have no fixed term. The page groups rows by position:
-- "Mayor" → Executive, "SB Member" → Sangguniang Bayan, anything else →
-- Department Heads.
insert into public.officials (full_name, position, term_start, term_end, is_current, display_order)
select v.full_name, v.position, v.term_start::date, v.term_end::date, true, v.display_order
from (values
  ('Hon. Cesar C. Cumba, Jr.',            'Municipal Mayor',                                              '2025-06-30', '2028-06-30',  1),
  ('Hon. Reynaldo T. Salon',              'Vice Mayor',                                                   '2025-06-30', '2028-06-30',  2),
  ('Hon. Keefe Blue R. Leonar',           'SB Member',                                                    '2025-06-30', '2028-06-30', 10),
  ('Hon. James T. Cuta',                  'SB Member',                                                    '2025-06-30', '2028-06-30', 11),
  ('Hon. Martina A. Castrodes',           'SB Member',                                                    '2025-06-30', '2028-06-30', 12),
  ('Hon. Carlito C. Cumba',               'SB Member',                                                    '2025-06-30', '2028-06-30', 13),
  ('Hon. Amanoden A. Mulok',              'SB Member',                                                    '2025-06-30', '2028-06-30', 14),
  ('Hon. James M. Dela Fuerta',           'SB Member',                                                    '2025-06-30', '2028-06-30', 15),
  ('Hon. Galo T. Torralba',               'SB Member',                                                    '2025-06-30', '2028-06-30', 16),
  ('Hon. Rolando C. Dapar',               'SB Member',                                                    '2025-06-30', '2028-06-30', 17),
  ('Marifi T. Casaña',                    'Municipal Budget Officer / Local Civil Registrar (Designate)', null, null, 20),
  ('Aura R. Cadenas',                     'Municipal Accountant',                                         null, null, 21),
  ('Jessie M. Rodas',                     'Human Resource Management Officer',                            null, null, 22),
  ('EnP. Alexander Ariel A. Eleazar',     'Municipal Planning and Development Coordinator / MDRRM Officer', null, null, 23),
  ('Geymar S. Monsales',                  'Municipal Treasurer',                                          null, null, 24),
  ('Michael S. Atega',                    'Municipal Social Welfare and Development Officer',             null, null, 25),
  ('Aljane B. Inguillo',                  'Economic Enterprises Development and Management Officer (Designate)', null, null, 26),
  ('Dr. Breech Martin Pabas',             'Municipal Health Officer',                                     null, null, 27),
  ('Engr. Adonis C. Dispo',               'Municipal Engineer',                                           null, null, 28),
  ('Rey S. Jaudian',                      'Environment and Natural Resources Officer (Designate)',        null, null, 29),
  ('Roselyn R. Morondoz',                 'Municipal Agriculturist',                                      null, null, 30),
  ('Norma C. Sarigumba',                  'Municipal Assessor',                                           null, null, 31),
  ('Emmanuel A. Lavador',                 'General Services Officer',                                     null, null, 32)
) as v(full_name, position, term_start, term_end, display_order)
where not exists (select 1 from public.officials o where o.full_name = v.full_name);


-- ---------------------------------------------------------------------------
-- 3. Barangays (Barangays page) — Punong Barangay of each of the 8 barangays
-- ---------------------------------------------------------------------------
insert into public.barangays (name, captain_name, address)
select v.name, v.captain_name, v.address
from (values
  ('Buhang',        'Hon. Anecita R. Loja',        'Barangay Buhang, Magallanes, Agusan del Norte'),
  ('Caloc-an',      'Hon. Julius C. Perang',       'Barangay Caloc-an, Magallanes, Agusan del Norte'),
  ('Guiasan',       'Hon. Armando T. Batiancila',  'Barangay Guiasan, Magallanes, Agusan del Norte'),
  ('Marcos',        'Hon. Victor D. Custan',       'Barangay Marcos, Magallanes, Agusan del Norte'),
  ('Poblacion',     'Hon. Cheryl M. Erro',         'Barangay Poblacion, Magallanes, Agusan del Norte'),
  ('Santo Niño',    'Hon. Allan C. Anunciado',     'Barangay Santo Niño, Magallanes, Agusan del Norte'),
  ('Santo Rosario', 'Hon. Cleopatra C. Roces',     'Barangay Santo Rosario, Magallanes, Agusan del Norte'),
  ('Taod-oy',       'Hon. Beinvinido P. Eroa',     'Barangay Taod-oy, Magallanes, Agusan del Norte')
) as v(name, captain_name, address)
where not exists (select 1 from public.barangays b where b.name = v.name);


-- ---------------------------------------------------------------------------
-- 4. Offices (Contact page → Office directory)
-- ---------------------------------------------------------------------------
-- Only the Mayor's Office and the Sangguniang Bayan have published contacts;
-- the other offices show their head until the LGU provides office numbers.
insert into public.offices (name, head_name, location, contact_number, email)
select v.name, v.head_name, v.location, v.contact_number, v.email
from (values
  ('Office of the Mayor',                                   'Hon. Cesar C. Cumba, Jr.',        'Municipal Hall, Poblacion', '0948-623-6977', 'mayorsoffice2019.magallanesadn@gmail.com'),
  ('Office of the Vice Mayor / Sangguniang Bayan',          'Hon. Reynaldo T. Salon',          'Municipal Hall, Poblacion', null,            '17sbmagallanes@gmail.com'),
  ('Municipal Budget Office',                               'Marifi T. Casaña',                null, null, null),
  ('Local Civil Registry Office',                           'Marifi T. Casaña (Designate)',    null, null, null),
  ('Municipal Accounting Office',                           'Aura R. Cadenas',                 null, null, null),
  ('Human Resource Management Office',                      'Jessie M. Rodas',                 null, null, null),
  ('Municipal Planning and Development Office',             'EnP. Alexander Ariel A. Eleazar', null, null, null),
  ('Municipal Disaster Risk Reduction and Management Office', 'EnP. Alexander Ariel A. Eleazar', null, null, null),
  ('Municipal Treasurer''s Office',                         'Geymar S. Monsales',              null, null, null),
  ('Municipal Social Welfare and Development Office',       'Michael S. Atega',                null, null, null),
  ('Municipal Economic Enterprises Development and Management Office', 'Aljane B. Inguillo (Designate)', null, null, null),
  ('Municipal Health Office / Rural Health Unit',            'Dr. Breech Martin Pabas',         null, null, null),
  ('Municipal Engineering Office',                          'Engr. Adonis C. Dispo',           null, null, null),
  ('Municipal Environment and Natural Resources Office',    'Rey S. Jaudian (Designate)',      null, null, null),
  ('Municipal Agriculture Office',                          'Roselyn R. Morondoz',             null, null, null),
  ('Municipal Assessor''s Office',                          'Norma C. Sarigumba',              null, null, null),
  ('General Services Office',                               'Emmanuel A. Lavador',             null, null, null)
) as v(name, head_name, location, contact_number, email)
where not exists (select 1 from public.offices o where o.name = v.name);


-- ---------------------------------------------------------------------------
-- 5. Services (Services page and the homepage "Start a transaction" list)
-- ---------------------------------------------------------------------------
-- Same requirement lists the chatbot gives. Fees and processing times are only
-- filled in where they are known; the rest stays empty rather than guessed.
insert into public.services (name, category, office, requirements, requirements_bisaya, fee, processing_time)
select v.name, v.category, v.office, v.requirements, v.requirements_bisaya, v.fee, v.processing_time
from (values
  (
    'New Business Permit', 'Business permit', 'Business Permits and Licensing Office (BPLO)',
    E'1. DTI or SEC registration\n2. Barangay Clearance\n3. Valid government-issued ID\n4. Locational/Zoning Clearance\n5. Fire Safety Inspection Certificate\n6. Sanitary Permit\n7. Proof of address or lease contract',
    E'1. DTI o SEC registration\n2. Barangay Clearance\n3. Valid ID\n4. Locational/Zoning Clearance\n5. Fire Safety Inspection Certificate\n6. Sanitary Permit\n7. Proof sa address o lease contract',
    'Assessed by the BPLO based on business type, capital investment or gross receipts',
    '1–3 working days once all documents, inspections and clearances are complete'
  ),
  (
    'Business Permit Renewal', 'Business permit', 'Business Permits and Licensing Office (BPLO)',
    E'1. Previous year''s Business Permit and Official Receipts\n2. Barangay Clearance for renewal\n3. Income Tax Return (ITR) or Financial Statements\n4. Updated Sanitary and Fire Inspection Clearances',
    E'1. Daang Business Permit ug resibo\n2. Barangay Clearance for Renewal\n3. ITR o Financial Statement\n4. Updated Sanitary ug Fire Inspection Clearance',
    'Assessed by the BPLO based on gross receipts',
    null
  ),
  (
    'Building Permit', 'Building permit', 'Municipal Engineering Office',
    E'1. Building Plans, Architectural/Civil, signed and sealed (5 copies)\n2. Electrical Diagram/Plans, signed and sealed (4 copies)\n3. Bill of Materials for the building, with estimate (5 copies)\n4. Bill of Materials for electrical works, with estimate (4 copies)\n5. Notarized Building Application Form (5 copies)\n6. Plumbing/Sanitary Plan, signed and sealed (4 copies)\n7. Barangay Clearance Certificate (1 copy)\n8. Long brown envelopes (2 pieces)',
    E'1. Building Plans, Architectural/Civil, sign & sealed (5 copies)\n2. Electrical Diagram/Plans, sign & sealed (4 copies)\n3. Bill of Materials para sa building nga naay estimate (5 copies)\n4. Bill of Materials para sa electrical nga naay estimate (4 copies)\n5. Notarized Building Application Form (5 copies)\n6. Plumbing/Sanitary Plan, sign & sealed (4 copies)\n7. Barangay Clearance Certificate (1 copy)\n8. Long brown envelope (2 ka buok)',
    null,
    null
  ),
  (
    'Barangay Clearance', 'Barangay clearance', 'Barangay Hall where you live or where your business is located',
    E'1. Valid ID\n2. Community Tax Certificate (Cedula)',
    E'1. Valid ID\n2. Cedula (Community Tax Certificate)',
    null,
    null
  ),
  (
    'Community Tax Certificate (Cedula)', 'Tax — community tax', 'Municipal Treasurer''s Office',
    E'1. Valid ID',
    E'1. Valid ID',
    '₱5.00 basic tax, plus ₱1.00 for every ₱1,000 of income or gross receipts (maximum ₱5,000) — Local Government Code, Sec. 157',
    null
  ),
  (
    'Late Registration of Birth', 'Civil registry', 'Local Civil Registry Office (LCRO)',
    E'1. PSA Negative Result\n2. National ID (1 year old and above)\n3. 2x2 picture with white background (unedited, front-facing)\n4. Affidavit of Two (2) Disinterested Persons\n5. Any two documents showing the child''s name (e.g. Baptismal Certificate, school records, ITR, medical/immunization record, Voter Registration Record, PhilHealth MDR)\n6. Valid ID of informant, or Senior Citizen ID\n7. Marriage Certificate of the document owner, if applicable\n8. Siblings'' birth certificates, if applicable\n9. Any two documents showing the identity of the parents\n10. Barangay Certification as proof of residency\n11. For an illegitimate child, if applicable: Affidavit of Acknowledgment / Admission of Paternity, Affidavit to Use the Surname of the Father, and Certificate of Registration',
    E'1. PSA Negative Result\n2. National ID (kung 1 ka tuig pataas)\n3. 2x2 nga picture nga puti ang background (dili edited, nag-atubang)\n4. Affidavit of Two (2) Disinterested Persons\n5. Bisan unsang duha ka dokumento nga nagpakita sa ngalan sa bata\n6. Valid ID sa informant (o Senior Citizen ID)\n7. Marriage Certificate sa tag-iya sa dokumento, kung aplikable\n8. Birth certificate sa mga igsoon, kung aplikable\n9. Bisan unsang duha ka dokumento nga nagpamatuod sa identity sa mga ginikanan\n10. Barangay Certification isip pamatuod nga diri ka nagpuyo\n11. Para sa illegitimate nga anak, kung aplikable: Affidavit of Acknowledgment/Admission of Paternity, AUSF, ug Certificate of Registration',
    null,
    null
  ),
  (
    'Marriage License Application', 'Civil registry', 'Local Civil Registry Office (LCRO)',
    E'For both bride and groom:\n1. Birth Certificate\n2. Cedula (current year)\n3. CENOMAR (PSA)\n4. Pre-Marriage Counseling Certificate (MSWD)\n5. Personal appearance of parent/s for consent or advice (if 18 to 25 years old)\n6. Death Certificate (widow/widower only)\n7. Court Decree/Order (if the previous marriage was annulled or nullified)\n8. Legal Capacity to Contract Marriage (foreigners only)\n9. Divorce papers, if divorced\n10. Valid IDs\n11. Barangay Certification',
    E'Para sa LALAKI ug BABAYE:\n1. Birth Certificate\n2. Cedula (karon nga tuig)\n3. CENOMAR (PSA)\n4. Pre-Marriage Counseling Certificate (MSWD)\n5. Personal nga pag-adto sa ginikanan para sa consent o advice (kung 18 hangtod 25 anyos)\n6. Death Certificate (para sa biyuda/biyudo lang)\n7. Court Decree/Order (kung na-annul o na-nullify ang kasal)\n8. Legal Capacity to Contract Marriage (para sa foreigner lang)\n9. Divorce papers, kung na-divorce\n10. Valid IDs\n11. Barangay Certification',
    null,
    'At least 10 days — the application is posted publicly for 10 consecutive days before the license is issued (Family Code, Art. 17)'
  )
) as v(name, category, office, requirements, requirements_bisaya, fee, processing_time)
where not exists (select 1 from public.services s where s.name = v.name);


-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
select 'officials' as table_name, count(*) from public.officials where is_current
union all select 'barangays', count(*) from public.barangays
union all select 'offices', count(*) from public.offices
union all select 'services', count(*) from public.services
union all select 'news_announcements', count(*) from public.news_announcements;
