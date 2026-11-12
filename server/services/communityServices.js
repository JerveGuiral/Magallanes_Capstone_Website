// server/services/communityServices.js
//
// The second set of answers found online (November 2026), for questions the panel/visitor test
// left unanswered: first-time jobseekers, barangay certificates, building and zoning permits,
// marriage with a foreigner, PhilHealth, child protection and VAWC, the health centre's
// programmes, livestock and fishponds, hazards and earthquakes, jobs and training, and how the
// Sangguniang Bayan works. Each answer names the office that handles it and says to confirm the
// local details there — none of these is a Magallanes checklist. Merged into publicServices.js,
// which routes questions to them by keyword and exports them to Dialogflow and responses.js.
//
// Sources:
//   - First-time jobseekers: RA 11261 (barangay certification, 6 months' residency, valid one year,
//     once only; fees waived for NBI, police and barangay clearances, PSA documents, TIN, medical
//     certificates from government hospitals).
//   - Building: PD 1096 (National Building Code) and its IRR — ancillary permits (electrical,
//     plumbing, fencing, demolition) and the certificate of occupancy (Sec. 309); locational
//     clearance from the zoning administrator before the building permit; Ease of Doing Business
//     Act (RA 11032 Sec. 9): 3, 7 and 20 working days for simple, complex and highly technical
//     applications.
//   - Business retirement: Local Government Code Sec. 145 (sworn statement of gross sales, taxes
//     due). Tricycle franchises: LGC Sec. 447(a)(3)(vi) (the Sangguniang Bayan regulates them).
//   - Marriage: Family Code Arts. 17 (10-day posting), 20 (license valid 120 days anywhere in the
//     Philippines), 21 (certificate of legal capacity for a foreign national). Local copies: LCRO
//     Municipal Forms 1A, 2A, 3A.
//   - PhilHealth: Universal Health Care Act (RA 11223) — every Filipino is a member; registration
//     with the PhilHealth Member Registration Form (PMRF).
//   - Day care: RA 6972 (a day care centre in every barangay); RA 10410 (Early Years Act).
//   - Child protection: RA 7610; VAWC: RA 9262 (Barangay Protection Order, barangay VAW desk, PNP
//     Women and Children Protection Desk).
//   - Health programmes: DOH National Immunization Program (BCG and hepatitis B at birth; penta,
//     OPV and PCV at 6, 10 and 14 weeks; IPV at 14 weeks; MMR at 9 and 12 months); RA 10354
//     (free family planning at public health facilities); DOH National TB Program (free
//     screening and treatment); DOH oral health programme; DOH 4S against dengue; facility-based
//     delivery and PhilHealth's maternity care package.
//   - PHIVOLCS (earthquakes and tsunami); HazardHunterPH (https://hazardhunter.georisk.gov.ph).
//   - Government jobs: RA 7041 (vacancies published and posted), CSC Form 212 (Personal Data
//     Sheet). ALS: DepEd. TESDA: Training for Work Scholarship (TWSP). Scholarships: CHED Tulong
//     Dunong / TES (UniFAST), DOST-SEI.
//   - Complaints: Hotline 8888, the Office of the Ombudsman, the Civil Service Commission's
//     Contact Center ng Bayan. Citizen's Charter: RA 11032 Sec. 6.
//   - Sangguniang Bayan: LGC Sec. 52 (at least one regular session a week, open to the public),
//     Sec. 59 (ordinances posted at the Municipal Hall). Terms: LGC Sec. 43 — local officials
//     elected in May 2025 serve until noon of June 30, 2028.

import { HOTLINES } from './generalInfo.js';

export const COMMUNITY_ENTRIES = [
  // ---- Certificates and clearances ----
  {
    name: 'jobs.first-time-jobseeker.inquire',
    phrases: [
      'How do I get a first time jobseeker certificate?', 'First time jobseeker certification', 'Are clearances free for first time job seekers?',
      'Is the NBI clearance free for fresh graduates?', 'What is RA 11261?', 'First time jobseekers assistance act', 'Free documents for first job',
      'I am applying for my first job, are my documents free?', 'Barangay certification for first time jobseeker', 'Oath of undertaking first time jobseeker',
      'Unsaon pagkuha og first time jobseeker certificate?', 'Libre ba ang clearance sa first time job seeker?', 'Libre ba ang NBI sa bag-ong graduate?',
      'Unang trabaho nako, libre ba ang mga dokumento?', 'Asa makuha ang certification sa first time jobseeker?',
    ],
    english:
      "Under the First Time Jobseekers Assistance Act (RA 11261), your first job application's government documents are free.\n1. Get a Barangay Certification as a first-time jobseeker from your Barangay Hall (you must have lived in the barangay for at least 6 months) and sign the Oath of Undertaking there.\n2. Present it to get, free of charge: NBI, police and barangay clearances, PSA birth and marriage certificates, your TIN, and a medical certificate from a government hospital (laboratory tests are not covered).\nThe certification is valid for one year and can be used only once.",
    bisaya:
      'Ubos sa First Time Jobseekers Assistance Act (RA 11261), libre ang mga dokumento sa gobyerno para sa imong unang pag-apply og trabaho.\n1. Kuha og Barangay Certification isip first-time jobseeker sa imong Barangay Hall (kinahanglan nagpuyo ka sa barangay sulod sa 6 ka bulan o labaw) ug pirmahi didto ang Oath of Undertaking.\n2. Ipakita kini aron makakuha nga libre sa: NBI, police ug barangay clearance, PSA birth ug marriage certificate, TIN, ug medical certificate gikan sa ospital sa gobyerno (dili apil ang laboratory test).\nAng certification balido sulod sa usa ka tuig ug magamit ra kausa.',
  },
  {
    name: 'clearance.indigency.inquire',
    phrases: [
      'How do I get a certificate of indigency?', 'Where can I get a certificate of indigency?', 'Requirements for certificate of indigency',
      'Who issues the certificate of indigency?', 'Is the certificate of indigency free?', 'Indigency certificate for hospital', 'Barangay indigency',
      'Certificate of indigency for scholarship', 'I need a certificate of indigency', 'Indigent certificate',
      'Unsaon pagkuha og certificate of indigency?', 'Asa makuha ang indigency?', 'Unsa ang requirements sa certificate of indigency?',
      'Libre ba ang certificate of indigency?', 'Kinahanglan ko og indigency para sa ospital',
    ],
    english:
      "A certificate of indigency is issued by the barangay where you live — ask at your Barangay Hall and bring a valid ID; the barangay sets any fee (it is often free). For financial, medical or burial assistance, the MSWDO may also do a short interview or case study. Ask me about AICS assistance for what else to bring.",
    bisaya:
      'Ang certificate of indigency gihatag sa barangay diin ka nagpuyo — pangutana sa imong Barangay Hall ug pagdala og valid ID; ang barangay ang motakda kung naa bay bayad (kasagaran libre). Para sa tabang pinansyal, medikal o sa lubong, mahimo pud ka interbyuhon o himoan og case study sa MSWDO. Pangutana nako bahin sa AICS para sa uban pang dad-on.',
  },
  {
    name: 'clearance.good-moral.inquire',
    phrases: [
      'How do I get a certificate of good moral character?', 'Where can I get a good moral certificate?', 'Barangay good moral certificate',
      'Good moral for employment', 'Good moral certificate requirements', 'Who issues a certificate of good moral?', 'I need a good moral for school',
      'Good moral from the barangay', 'Certificate of good moral character for scholarship', 'Good moral certification',
      'Unsaon pagkuha og certificate of good moral?', 'Asa makuha ang good moral?', 'Kinahanglan ko og good moral para sa trabaho',
      'Good moral gikan sa barangay', 'Unsa ang requirements sa good moral?',
    ],
    english:
      "It depends on who asks for it:\n• For a job or as a resident — a Barangay Certification of Good Moral Character from your Barangay Hall. Bring a valid ID; the barangay sets the fee.\n• For school or a scholarship — usually from your last school's guidance or registrar's office.\nIf it is for your first job, ask for the first-time jobseeker certification too — it makes your clearances free.",
    bisaya:
      'Depende kung kinsa ang nangayo:\n• Para sa trabaho o isip residente — Barangay Certification of Good Moral Character gikan sa imong Barangay Hall. Pagdala og valid ID; ang barangay ang motakda sa bayad.\n• Para sa eskwelahan o scholarship — kasagaran gikan sa guidance o registrar\'s office sa imong katapusang eskwelahan.\nKung para sa imong unang trabaho, pangayo pud og first-time jobseeker certification — libre na ang imong mga clearance.',
  },
  {
    name: 'clearance.mayor.inquire',
    phrases: [
      "How do I get a mayor's clearance?", "Mayor's clearance for employment", "Requirements for mayor's clearance", "Where do I get a mayor's clearance?",
      "How much is the mayor's clearance?", "Mayor's clearance for abroad", "I need a mayor's clearance for work", "Who issues the mayor's clearance?",
      "Mayor's certification", 'Clearance from the mayor',
      "Unsaon pagkuha og mayor's clearance?", 'Asa makuha ang clearance sa mayor?', "Unsa ang requirements sa mayor's clearance?",
      "Pila ang mayor's clearance?", 'Kinahanglan ko og clearance sa mayor para sa trabaho',
    ],
    english:
      `A mayor's clearance is requested at the Mayor's Office in the Municipal Hall. Offices usually ask for a barangay clearance, a police clearance, your Community Tax Certificate (cedula) and a valid ID — confirm the list and fee with the Mayor's Office at 0948-623-6977 before you go. (A "mayor's permit" for a store is the business permit — ask me about that.)`,
    bisaya:
      `Ang mayor's clearance gikuha sa Mayor's Office sa Munisipyo. Kasagaran gipangayo ang barangay clearance, police clearance, imong Cedula (Community Tax Certificate) ug valid ID — kumpirmaha ang listahan ug bayad sa Mayor's Office sa 0948-623-6977 sa dili pa ka moadto. (Ang "mayor's permit" para sa tindahan kay business permit — pangutana nako bahin ana.)`,
  },

  // ---- Building, zoning and business ----
  {
    name: 'permit.zoning.inquire',
    phrases: [
      'How do I get a zoning clearance?', 'How do I get a locational clearance?', 'What is a locational clearance?', 'Where do I apply for zoning clearance?',
      'Is zoning clearance needed for a building permit?', 'Zoning certification for my lot', 'Requirements for locational clearance', 'Who issues locational clearance?',
      'Zoning clearance Magallanes', 'Locational clearance for business',
      'Unsaon pagkuha og zoning clearance?', 'Asa makuha ang locational clearance?', 'Unsa ang locational clearance?',
      'Kinahanglan ba ang zoning clearance sa building permit?', 'Unsa ang requirements sa locational clearance?',
    ],
    english:
      "A locational (zoning) clearance confirms that what you plan to build or operate is allowed where your lot is. It comes from the town's zoning administrator — the Municipal Planning and Development Office (MPDO) at the Municipal Hall — and is needed before a building permit. Usually bring the lot's title or tax declaration (or a lease or authority from the owner), a vicinity map or lot plan, and your building plans; ask the MPDO about the fee.",
    bisaya:
      'Ang locational (zoning) clearance nagpamatuod nga gitugotan ang imong itukod o operahan sa lugar sa imong yuta. Gikan kini sa zoning administrator sa lungsod — ang Municipal Planning and Development Office (MPDO) sa Munisipyo — ug kinahanglan una kini sa building permit. Kasagaran dad-a ang titulo o tax declaration sa yuta (o kontrata sa abang o pagtugot sa tag-iya), vicinity map o lot plan, ug imong building plans; pangutana sa MPDO kung pila ang bayad.',
  },
  {
    name: 'permit.building.occupancy.inquire',
    phrases: [
      'How do I get a certificate of occupancy?', 'What is a certificate of occupancy?', 'Requirements for occupancy permit', 'Occupancy permit after construction',
      'Do I need an occupancy permit for my new house?', 'Who issues the certificate of occupancy?', 'Occupancy certificate requirements',
      'Can I move in without a certificate of occupancy?', 'Occupancy permit Magallanes', 'Certificate of occupancy for business',
      'Unsaon pagkuha og certificate of occupancy?', 'Asa makuha ang occupancy permit?', 'Unsa ang requirements sa occupancy permit?',
      'Kinahanglan ba og occupancy permit sa bag-ong balay?', 'Occupancy permit para sa bag-ong balay',
    ],
    english:
      "When construction is finished, apply for a Certificate of Occupancy at the Office of the Building Official (Municipal Engineering Office) before using the building (National Building Code, Sec. 309). Usually bring the Certificate of Completion signed by the owner and the engineer or architect, the as-built plans, and the construction logbook; the office inspects the building and assesses the fee. A business also needs it for its permit.",
    bisaya:
      'Kung nahuman na ang pagtukod, mag-apply og Certificate of Occupancy sa Office of the Building Official (Municipal Engineering Office) sa dili pa gamiton ang building (National Building Code, Sec. 309). Kasagaran dad-a ang Certificate of Completion nga gipirmahan sa tag-iya ug sa engineer o architect, ang as-built plans, ug ang construction logbook; inspeksyonon sa opisina ang building ug i-assess ang bayad. Kinahanglan pud kini sa negosyo para sa iyang permit.',
  },
  {
    name: 'permit.building.ancillary.inquire',
    phrases: [
      'Do I need an electrical permit?', 'How do I get a fencing permit?', 'Do I need a permit to build a fence?', 'Electrical permit requirements',
      'Do I need a plumbing permit?', 'How do I get a demolition permit?', 'Electrical inspection for a new connection', 'What is a CFEI?',
      'Permit for wiring my house', 'Fence permit Magallanes',
      'Unsaon pagkuha og fencing permit?', 'Kinahanglan ba og permit sa koral?', 'Unsaon pagkuha og electrical permit?',
      'Kinahanglan ba og permit sa pag-wiring sa balay?', 'Asa makuha ang demolition permit?',
    ],
    english:
      "Electrical, plumbing, mechanical, fencing and demolition permits are \"ancillary\" permits under the National Building Code. They are issued by the Office of the Building Official (Municipal Engineering Office) — with the building permit for a new building, or on their own for a fence, a renovation or a demolition. Bring the plans for that work, signed and sealed by a licensed engineer (an electrical engineer for wiring). For a new electric connection, ANECO asks for the Certificate of Final Electrical Inspection (CFEI) from the same office.",
    bisaya:
      'Ang electrical, plumbing, mechanical, fencing ug demolition permit kay mga "ancillary" permit ubos sa National Building Code. Gihatag kini sa Office of the Building Official (Municipal Engineering Office) — uban sa building permit kung bag-ong building, o lahi kung koral, renovation o demolition. Dad-a ang plano sa maong trabaho, pirmado ug selyado sa lisensyado nga engineer (electrical engineer kung wiring). Para sa bag-ong koneksyon sa kuryente, mangayo ang ANECO og Certificate of Final Electrical Inspection (CFEI) gikan sa samang opisina.',
  },
  {
    name: 'permit.building.process.inquire',
    phrases: [
      'How long does it take to get a building permit?', 'Building permit processing time', 'How many days for a building permit?',
      'When will my building permit be released?', 'How long is the building permit process?', 'Building permit release',
      'Pila ka adlaw ang building permit?', 'Kadugay sa building permit', 'Kanus-a ma-release ang building permit?', 'Pila ka adlaw ang pag-process sa building permit?',
      'Dugay ba ang building permit?', 'Pila ka semana ang building permit?', 'Processing sa building permit', 'Gaano katagal ang building permit?', 'How fast can I get a building permit?',
    ],
    english:
      "Under the Ease of Doing Business Act (RA 11032), an office must act on a complete application within 3 working days for a simple one, 7 for a complex one and 20 for a highly technical one. Most house building permits are complex applications; the clock starts once every requirement and clearance (including the locational clearance and the BFP's fire safety evaluation) is in. Ask the Office of the Building Official (Municipal Engineering Office) for the expected release date of yours.",
    bisaya:
      'Ubos sa Ease of Doing Business Act (RA 11032), kinahanglan aksyonan sa opisina ang kompleto nga aplikasyon sulod sa 3 ka adlaw sa trabaho kung simple, 7 kung complex, ug 20 kung highly technical. Ang kadaghanan sa building permit sa balay kay complex; magsugod ang ihap kung kompleto na ang tanang requirements ug clearance (apil ang locational clearance ug fire safety evaluation sa BFP). Pangutana sa Office of the Building Official (Municipal Engineering Office) kanus-a ma-release ang imo.',
  },
  {
    name: 'permit.business.retirement.inquire',
    phrases: [
      'How do I close my business?', 'How do I retire my business?', 'Business retirement requirements', 'I want to close my store, what do I do?',
      'Do I need to report that I closed my business?', 'Closure of business permit', 'Requirements for business closure', 'How to stop my business permit',
      'Retirement of business Magallanes', 'I stopped operating my business',
      'Unsaon pagsira sa akong negosyo?', 'Mo-undang na ko sa akong negosyo, unsay buhaton?', 'Unsa ang requirements sa pag-retire sa negosyo?',
      'Unsaon pag-close sa business permit?', 'Gisirhan na nako ang tindahan, kinahanglan ba i-report?',
    ],
    english:
      "To close (retire) a business, apply for business retirement at the BPLO in the Municipal Hall. Under the Local Government Code (Sec. 145) you submit a sworn statement of your gross sales or receipts for the year and pay any business tax still due. Offices usually also ask for your last business permit and receipts and a barangay certification that the business has closed. Then cancel your DTI, SEC or CDA registration and your BIR registration. Confirm the checklist with the BPLO.",
    bisaya:
      'Para isira (i-retire) ang negosyo, mag-apply og business retirement sa BPLO sa Munisipyo. Ubos sa Local Government Code (Sec. 145), isumite ang sworn statement sa imong gross sales o kita sa tuig ug bayri ang nahabilin nga business tax. Kasagaran pangayoon pud ang imong katapusang business permit ug mga resibo, ug barangay certification nga sirado na ang negosyo. Dayon ipa-cancel ang imong rehistro sa DTI, SEC o CDA ug sa BIR. Kumpirmaha ang checklist sa BPLO.',
  },
  {
    name: 'permit.business.payment.inquire',
    phrases: [
      'Can I pay my business permit online?', 'Can I pay the business permit through GCash?', 'Is there online payment for business permits?',
      'Where do I pay my business permit fees?', 'How do I pay the business tax?', 'Online payment for mayor\'s permit', 'Can I pay business tax online?',
      'Pay business permit using Maya', 'Where to pay the assessment for my business?', 'Do you accept online payment for permits?',
      'Pwede ba magbayad online sa business permit?', 'Pwede ba GCash ang bayad sa business permit?', 'Asa magbayad sa business permit?',
      'Naa bay online payment sa permit?', 'Asa bayran ang assessment sa akong negosyo?',
    ],
    english:
      "Online payment for business permits isn't offered on this website yet. After the BPLO assesses your fees, pay at the Municipal Treasurer's Office in the Municipal Hall and keep the official receipt — you need it for your permit and next year's renewal. Ask the BPLO whether any other payment channel is accepted.",
    bisaya:
      'Wala pay online nga bayad sa business permit niining website. Human i-assess sa BPLO ang imong bayronon, bayri kini sa Municipal Treasurer\'s Office sa Munisipyo ug tipigi ang official receipt — kinahanglan kini sa imong permit ug sa renewal sa sunod tuig. Pangutana sa BPLO kung naa bay laing paagi sa pagbayad.',
  },
  {
    name: 'permit.tricycle.inquire',
    phrases: [
      'How do I get a tricycle franchise?', 'What are the requirements for MTOP?', 'How do I renew my tricycle franchise?', 'Motorized tricycle operator permit',
      'Where do I apply for a tricycle franchise?', 'Do I need a franchise to drive a tricycle?', 'MTOP requirements Magallanes', 'Tricycle permit',
      'Franchise for my motorela', 'Who grants tricycle franchises?',
      'Unsa ang requirements sa MTOP sa tricycle?', 'Unsaon pagkuha og prangkisa sa tricycle?', 'Asa mag-apply og franchise sa traysikol?',
      'Unsaon pag-renew sa prangkisa sa tricycle?', 'Kinahanglan ba og franchise para mopasada og tricycle?',
    ],
    english:
      "Tricycles for hire need a Motorized Tricycle Operator's Permit (MTOP), a franchise granted by the municipality — the Sangguniang Bayan regulates tricycles under the Local Government Code (Sec. 447) and the town's tricycle ordinance. Ask at the Mayor's Office or the Sangguniang Bayan office in the Municipal Hall. Usually bring the LTO certificate of registration and official receipt, the driver's license, a barangay clearance and your cedula; the ordinance sets the routes, fees and renewal.",
    bisaya:
      'Ang tricycle nga mopasada kinahanglan og Motorized Tricycle Operator\'s Permit (MTOP), prangkisa nga gihatag sa munisipyo — ang Sangguniang Bayan ang nag-regulate sa tricycle ubos sa Local Government Code (Sec. 447) ug sa ordinansa sa lungsod bahin sa tricycle. Pangutana sa Mayor\'s Office o sa opisina sa Sangguniang Bayan sa Munisipyo. Kasagaran dad-a ang certificate of registration ug official receipt gikan sa LTO, lisensya sa drayber, barangay clearance ug imong cedula; ang ordinansa ang motakda sa ruta, bayad ug renewal.',
  },

  // ---- Civil registry ----
  {
    name: 'civil.registry.foreigner-marriage.inquire',
    phrases: [
      'Can a foreigner get married in Magallanes?', 'Requirements for marrying a foreigner', 'My fiance is a foreigner, what do we need?',
      'What is a certificate of legal capacity to marry?', 'Marriage license for a foreign national', 'Can I marry an American here?',
      'Foreigner marriage requirements Philippines', 'Where does my foreign fiance get the legal capacity certificate?', 'Marrying a foreigner in the Philippines',
      'Unsaon pagpakasal sa langyaw?', 'Pwede ba magpakasal ang foreigner diri sa Magallanes?', 'Unsa ang requirements kung foreigner akong pakaslan?',
      'Langyaw akong uyab, unsa among kinahanglan para makasal?', 'Asa makuha ang legal capacity sa foreigner?', 'Kasal sa foreigner requirements',
    ],
    english:
      "Yes. You still apply for a marriage license at the Local Civil Registry Office of either party's residence. The foreign partner must also submit a Certificate of Legal Capacity to Contract Marriage from their embassy or consulate (Family Code, Art. 21), and their passport. Documents not in English or Filipino need an official translation. The license is released after the 10-day posting, like any other.",
    bisaya:
      'Oo. Mag-apply gihapon og marriage license sa Local Civil Registry Office sa lugar nga gipuy-an sa usa kaninyo. Ang langyaw nga partner kinahanglan mosumite og Certificate of Legal Capacity to Contract Marriage gikan sa ilang embassy o consulate (Family Code, Art. 21), ug iyang passport. Ang dokumento nga dili English o Filipino kinahanglan og opisyal nga hubad. Ma-release ang lisensya human sa 10 ka adlaw nga pagpaskil, sama sa uban.',
  },
  {
    name: 'civil.registry.marriage.time.inquire',
    phrases: [
      'How long does it take to get a marriage license?', 'How many days before the marriage license is released?', 'How long is a marriage license valid?',
      'When does a marriage license expire?', 'Why is the marriage license posted for 10 days?', 'Marriage license processing time',
      'Can we use the marriage license in another town?', 'How soon can we marry after applying for a license?', 'Marriage license release date',
      'Pila ka adlaw ang marriage license?', 'Kanus-a ma-release ang marriage license?', 'Hangtod kanus-a balido ang marriage license?',
      'Kadugay sa marriage license', 'Magamit ba ang marriage license sa laing lungsod?', 'Pila ka adlaw ipaskil ang marriage license?',
    ],
    english:
      "After you apply, the Local Civil Registry Office posts the application for 10 consecutive days (Family Code, Art. 17); the license is released after that if no one objects — so plan for at least two weeks, plus the time to finish the pre-marriage counseling. The license is valid for 120 days from release and can be used anywhere in the Philippines (Art. 20).",
    bisaya:
      'Human ka mag-apply, ipaskil sa Local Civil Registry Office ang aplikasyon sulod sa 10 ka sunod-sunod nga adlaw (Family Code, Art. 17); ma-release ang lisensya human niana kung walay mosupak — mao nga plano og labing menos duha ka semana, apil ang panahon sa pre-marriage counseling. Balido ang lisensya sulod sa 120 ka adlaw gikan sa pag-release ug magamit bisan asa sa Pilipinas (Art. 20).',
  },
  {
    name: 'civil.registry.copy.inquire',
    phrases: [
      'How do I get a copy of my marriage certificate?', 'Where can I get a copy of my birth certificate?', 'Certified true copy of a death certificate',
      'Local copy of birth certificate', 'What is Form 1A?', 'Copy of marriage contract', 'I need a copy of my birth certificate for school',
      'Where do I get a certified copy of my marriage certificate?', 'Can the LCR give a copy of my birth certificate?', 'Copy of birth certificate Magallanes',
      'Unsaon pagkuha og kopya sa marriage certificate?', 'Asa makakuha og kopya sa akong birth certificate?', 'Kopya sa death certificate',
      'Certified true copy sa birth certificate', 'Asa makuha ang kopya sa marriage contract?',
    ],
    english:
      "There are two kinds of copies:\n• Local copy — a certified copy or transcription (Municipal Form 1A for birth, 2A for death, 3A for marriage) from the Local Civil Registry Office, if the event was registered in Magallanes. Bring a valid ID; ask the office about the fee.\n• PSA copy — on security paper from the Philippine Statistics Authority, which most passports, visas and employers require. Ask me how to get a PSA copy.",
    bisaya:
      'Duha ka klase sa kopya:\n• Lokal nga kopya — certified copy o transcription (Municipal Form 1A para sa birth, 2A para sa death, 3A para sa marriage) gikan sa Local Civil Registry Office, kung sa Magallanes narehistro. Pagdala og valid ID; pangutana sa opisina kung pila ang bayad.\n• PSA nga kopya — sa security paper gikan sa Philippine Statistics Authority, nga gipangayo sa kadaghanan sa passport, visa ug employer. Pangutana nako unsaon pagkuha og PSA nga kopya.',
  },

  // ---- Social services ----
  {
    name: 'social.philhealth.inquire',
    phrases: [
      'How do I get PhilHealth?', 'How do I register for PhilHealth?', 'Where is the PhilHealth office?', 'How do I get a PhilHealth ID?',
      'Am I automatically a PhilHealth member?', 'PhilHealth for indigents', 'How do I update my PhilHealth record?', 'PhilHealth requirements',
      'What is the PMRF?', 'PhilHealth contribution', 'Unsaon pagkuha og PhilHealth?', 'Unsaon pagparehistro sa PhilHealth?', 'Asa ang opisina sa PhilHealth?',
      'Libre ba ang PhilHealth sa pobre?', 'Unsa ang requirements sa PhilHealth?',
    ],
    english:
      "Under the Universal Health Care Act (RA 11223) every Filipino is a PhilHealth member. To get your PhilHealth number, fill out the PhilHealth Member Registration Form (PMRF) and submit it with a valid ID at a PhilHealth office or Local Health Insurance Office (the nearest are in Butuan City), or register through PhilHealth's online member portal. Indigent families may be covered as sponsored members — ask the MSWDO. With PhilHealth you can also register for YAKAP at the Rural Health Unit.",
    bisaya:
      'Ubos sa Universal Health Care Act (RA 11223), miyembro sa PhilHealth ang matag Pilipino. Para makakuha og PhilHealth number, pun-a ang PhilHealth Member Registration Form (PMRF) ug isumite uban sa valid ID sa opisina sa PhilHealth o Local Health Insurance Office (ang pinakaduol naa sa Butuan City), o magparehistro sa online member portal sa PhilHealth. Ang pobre nga pamilya mahimong masakop isip sponsored member — pangutana sa MSWDO. Kung naa kay PhilHealth, makaparehistro pud ka sa YAKAP sa Rural Health Unit.',
  },
  {
    name: 'social.daycare.inquire',
    phrases: [
      'Is there a day care center?', 'Where can I enroll my child in day care?', 'Is day care free?', 'What age can my child start day care?',
      'Child development center Magallanes', 'Day care in my barangay', 'Requirements for day care enrollment', 'Who runs the day care centers?',
      'Is there a preschool for 3 year olds?', 'Day care worker', 'Naa bay day care sa among barangay?', 'Asa ma-enroll akong anak sa day care?',
      'Libre ba ang day care?', 'Pila ka tuig pwede mo-day care ang bata?', 'Unsa ang requirements sa day care?',
    ],
    english:
      "By law (RA 6972) every barangay should have a day care centre, now called a Child Development Center, run with the MSWDO. They take children aged 3 to 4 for early learning before kindergarten, and the public ones are free. Enroll at the centre in your barangay — usually with the child's birth certificate and immunization record — or ask your Barangay Hall or the MSWDO which centre serves your area.",
    bisaya:
      'Sumala sa balaod (RA 6972), ang matag barangay kinahanglan naay day care center, nga gitawag na karon og Child Development Center, uban sa MSWDO. Modawat kini og mga bata nga 3 hangtod 4 anyos para sa sayong pagkat-on sa dili pa mo-kindergarten, ug libre ang publiko. Mag-enroll sa center sa imong barangay — kasagaran uban sa birth certificate ug immunization record sa bata — o pangutana sa Barangay Hall o sa MSWDO kung asa nga center ang para sa inyong lugar.',
  },
  {
    name: 'social.child-protection.inquire',
    phrases: [
      'How do I report child abuse?', 'A child is being abused, who do I call?', 'Where can I report child labor?', 'My neighbor hurts their child',
      'Who protects abused children?', 'Report child neglect', 'Child trafficking report', 'A minor is being exploited', 'What is RA 7610?',
      'Unsaon pag-report sa pang-abuso sa bata?', 'Naay bata nga gibunalan, asa ko mo-report?', 'Kinsa ang tawagan kung gi-abuso ang bata?',
      'Gisakitan sa iyang ginikanan ang bata', 'Asa i-report ang child labor?', 'Naay menor de edad nga gi-exploit',
    ],
    english:
      `If a child is in danger now, call 911 or the PNP at ${HOTLINES.pnp}. To report abuse, neglect, exploitation or child labor (RA 7610), go to:\n• the MSWDO at the Municipal Hall, whose social workers handle child protection cases;\n• the PNP's Women and Children Protection Desk; or\n• your Barangay Hall (Barangay Council for the Protection of Children).\nYou can report without being the child's relative, and your identity is kept confidential.`,
    bisaya:
      `Kung naa sa peligro ang bata karon, tawag sa 911 o sa PNP sa ${HOTLINES.pnp}. Para mo-report sa pang-abuso, pagpasagad, pagpahimulos o child labor (RA 7610), adto sa:\n• MSWDO sa Munisipyo, kansang mga social worker ang nagdumala sa mga kaso sa child protection;\n• Women and Children Protection Desk sa PNP; o\n• imong Barangay Hall (Barangay Council for the Protection of Children).\nPwede ka mo-report bisan dili ka paryente sa bata, ug tagoan ang imong pagkatawo.`,
  },
  {
    name: 'social.vawc.inquire',
    phrases: [
      'Where can women report violence or abuse?', 'My husband hurts me, where can I go?', 'How do I get a protection order?', 'What is a Barangay Protection Order?',
      'How do I file a VAWC case?', 'Domestic violence help', 'Where is the VAW desk?', 'My partner threatens me', 'What is RA 9262?',
      'Asa mo-report ang babaye nga gi-abuso?', 'Gibunalan ko sa akong bana, asa ko moadto?', 'Unsaon pagkuha og protection order?',
      'Gihulga ko sa akong uyab', 'Asa ang VAWC desk?', 'Unsaon pag-file og kaso sa VAWC?',
    ],
    english:
      `If you are in danger now, call 911 or the PNP at ${HOTLINES.pnp}. Under the Anti-Violence Against Women and Their Children Act (RA 9262):\n• Your Barangay Hall has a VAW Desk; the Punong Barangay can issue a Barangay Protection Order (BPO) the same day, ordering the abuser to stop and stay away.\n• The PNP's Women and Children Protection Desk takes complaints and helps you file a case.\n• The MSWDO gives counseling and temporary shelter referrals.\nPhysical, sexual, psychological and economic abuse are all covered.`,
    bisaya:
      `Kung naa ka sa peligro karon, tawag sa 911 o sa PNP sa ${HOTLINES.pnp}. Ubos sa Anti-Violence Against Women and Their Children Act (RA 9262):\n• Ang imong Barangay Hall naay VAW Desk; ang Punong Barangay makahatag og Barangay Protection Order (BPO) sa samang adlaw, nga nagmando sa nang-abuso nga mohunong ug molikay kanimo.\n• Ang Women and Children Protection Desk sa PNP modawat og reklamo ug motabang sa pag-file og kaso.\n• Ang MSWDO mohatag og counseling ug referral sa temporaryong kapuy-an.\nSakop ang pisikal, sekswal, sikolohikal ug ekonomikanhong pang-abuso.`,
  },

  // ---- Rural Health Unit programmes ----
  {
    name: 'rhu.immunization.inquire',
    phrases: [
      'When is the vaccination schedule for babies?', 'Are baby vaccines free?', 'What vaccines does my baby need?', 'Where can my child get vaccinated?',
      'Immunization schedule for infants', 'When is the measles vaccine given?', 'BCG vaccine for newborn', 'Free vaccines at the health center',
      'My baby missed a vaccine, what do I do?', 'Routine immunization for children',
      'Naa bay libre nga bakuna para sa bata?', 'Kanus-a ang bakuna sa bata?', 'Asa magpabakuna sa akong anak?', 'Unsa nga bakuna ang kinahanglan sa bata?',
      'Iskedyul sa bakuna sa masuso',
    ],
    english:
      "Routine vaccines for babies are free at the Rural Health Unit and the barangay health stations (DOH National Immunization Program). The usual schedule:\n• At birth: BCG and hepatitis B\n• 6, 10 and 14 weeks: pentavalent, oral polio and pneumococcal (PCV), plus IPV at 14 weeks\n• 9 and 12 months: measles-mumps-rubella (MMR)\nBring the baby's immunization card. Ask your barangay health worker or the RHU for the vaccination day in your barangay, and catch up on any missed dose.",
    bisaya:
      'Libre ang mga routine nga bakuna sa masuso sa Rural Health Unit ug sa mga barangay health station (DOH National Immunization Program). Ang kasagarang iskedyul:\n• Pagkatawo: BCG ug hepatitis B\n• 6, 10 ug 14 ka semana: pentavalent, oral polio ug pneumococcal (PCV), ug IPV sa 14 ka semana\n• 9 ug 12 ka bulan: measles-mumps-rubella (MMR)\nDad-a ang immunization card sa bata. Pangutana sa imong barangay health worker o sa RHU kanus-a ang adlaw sa bakuna sa inyong barangay, ug i-catch up ang nalaktawan nga dose.',
  },
  {
    name: 'rhu.family-planning.inquire',
    phrases: [
      'Where can I get family planning services?', 'Are contraceptives free?', 'Where can I get birth control pills?', 'Family planning methods available',
      'Can I get an implant at the health center?', 'Where can I get injectables?', 'Free condoms', 'Ligation or vasectomy in Magallanes',
      'Family planning counseling', 'Is family planning free at the RHU?',
      'Asa makakuha og family planning?', 'Libre ba ang pills?', 'Asa magpa-implant?', 'Naa bay family planning sa health center?',
      'Unsa ang mga pamaagi sa family planning?', 'What days is family planning at the RHU?', 'Is family planning open on Friday?', 'Family planning schedule',
      'Kanus-a ang family planning sa RHU?', 'Abri ba ang family planning karong Biyernes?', 'Unsa oras ang family planning?',
    ],
    english:
      "Family planning at the Magallanes Rural Health Unit and Family Planning Center: Monday to Friday, 8 AM–5 PM. Counseling and methods are free at public health facilities under the Responsible Parenthood and Reproductive Health Act (RA 10354). Pills, condoms, injectables and, where a trained provider is available, implants and IUDs are offered; for ligation or vasectomy the RHU refers you to a hospital.",
    bisaya:
      'Family planning sa Magallanes Rural Health Unit and Family Planning Center: Lunes hangtod Biyernes, 8 AM–5 PM. Libre ang counseling ug mga pamaagi sa mga pasilidad sa panglawas sa gobyerno ubos sa Responsible Parenthood and Reproductive Health Act (RA 10354). Naay pills, condom, injectable ug, kung naay trained nga provider, implant ug IUD; para sa ligation o vasectomy, i-refer ka sa RHU sa ospital.',
  },
  {
    name: 'rhu.tb.inquire',
    phrases: [
      'Is there free TB check-up?', 'Where can I get tested for TB?', 'Is TB treatment free?', 'I have had a cough for two weeks', 'TB DOTS center',
      'Free TB medicine', 'Where can I get a chest x-ray for TB?', 'How long is TB treatment?', 'TB screening Magallanes', 'Tuberculosis test',
      'Naa bay libre nga check-up sa TB?', 'Libre ba ang tambal sa TB?', 'Duha na ka semana akong ubo', 'Asa magpa-test sa TB?', 'Ubo nga dugay na',
    ],
    english:
      "TB screening and treatment are free under the DOH National TB Program. If you have had a cough for 2 weeks or more, fever, night sweats or weight loss, go to the Rural Health Unit: it checks your sputum or refers you for an x-ray, and gives the full course of TB medicines free (usually 6 months), with health workers following up. Finishing the whole course is what cures TB.",
    bisaya:
      'Libre ang screening ug tambal sa TB ubos sa DOH National TB Program. Kung duha ka semana o labaw na imong ubo, o naay hilanat, singot sa gabii o pagniwang, adto sa Rural Health Unit: susihon ang imong plema o i-refer ka sa x-ray, ug hatagan ka og libre nga tibuok kurso sa tambal sa TB (kasagaran 6 ka bulan), nga sundan sa mga health worker. Ang paghuman sa tibuok kurso ang makaayo sa TB.',
  },
  {
    name: 'rhu.dental.inquire',
    phrases: [
      'Is there a dentist at the RHU?', 'Free tooth extraction', 'Where can I get dental check-up?', 'Is there a free dentist in Magallanes?',
      'My tooth hurts, where can I go?', 'Dental services at the health center', 'Free dental for children', 'Dentist schedule at the RHU',
      'Tooth extraction Magallanes', 'Dental clinic', 'Naa bay dentista sa RHU?', 'Naa bay libre nga bunot?', 'Sakit akong ngipon, asa ko moadto?',
      'Asa magpa-check sa ngipon?', 'Naa bay dentist sa health center?', 'What days is the dentist at the RHU?', 'Is dental open on Friday?',
      'Dental schedule', 'Kanus-a ang dental sa RHU?', 'Naa bay dentista karong Biyernes?', 'Unsa nga adlaw ang dental?',
    ],
    english:
      "Dental care at the Magallanes Rural Health Unit is on Monday and Tuesday, 8 AM–5 PM. Under the DOH oral health programme, basic dental care — check-ups, tooth extraction and fluoride for children — is usually free; confirm with the RHU. For severe pain with swelling or fever, go to a hospital.",
    bisaya:
      'Ang dental care sa Magallanes Rural Health Unit kay Lunes ug Martes, 8 AM–5 PM. Ubos sa oral health program sa DOH, ang basic nga dental care — check-up, pagbunot og ngipon ug fluoride sa mga bata — kasagaran libre; kumpirmaha sa RHU. Kung grabe ang sakit ug naay hubag o hilanat, adto sa ospital.',
  },
  {
    name: 'rhu.dengue.inquire',
    phrases: [
      'Where can I get a dengue test?', 'What do I do if I think I have dengue?', 'Is there a dengue outbreak?', 'Dengue symptoms', 'Dengue test free?',
      'My child has a fever for 3 days', 'How to prevent dengue', 'Where can I get an NS1 test?', 'Fogging in our barangay', 'Dengue in Magallanes',
      'Asa magpa-test sa dengue?', 'Basin naa koy dengue', 'Tulo na ka adlaw ang hilanat sa akong anak', 'Unsaon paglikay sa dengue?', 'Naa bay fogging sa among lugar?',
    ],
    english:
      "A fever of 2 days or more — especially with headache, body pain, rashes or bleeding — should be checked early: go to the Rural Health Unit, which refers you for a dengue test (NS1 or a blood count) at a hospital or laboratory. Go straight to a hospital for severe stomach pain, vomiting, bleeding or extreme weakness. Prevent it with the DOH \"4S\": search and destroy mosquito breeding sites, self-protect, seek early consultation, and support fogging only in outbreak areas. For fogging requests, ask your barangay or the RHU.",
    bisaya:
      'Ang hilanat nga 2 ka adlaw o labaw — labi na kung naay sakit sa ulo, sakit sa lawas, pantal o pagdugo — ipasusi dayon: adto sa Rural Health Unit, nga mo-refer kanimo sa dengue test (NS1 o blood count) sa ospital o laboratoryo. Diretso sa ospital kung grabe ang sakit sa tiyan, nagsuka, nagdugo o luya kaayo. Likayi kini pinaagi sa "4S" sa DOH: pangitaa ug gub-a ang pangitlogan sa lamok, panalipdi ang kaugalingon, pakonsulta dayon, ug suportahi ang fogging sa mga lugar nga naay outbreak ra. Para sa fogging, pangutana sa imong barangay o sa RHU.',
  },
  {
    name: 'rhu.birthing.inquire',
    phrases: [
      'Is there a lying-in or birthing clinic?', 'Where can I give birth in Magallanes?', 'Does the RHU accept deliveries?', 'Is giving birth free with PhilHealth?',
      'Can I give birth at home?', 'Birthing facility near Magallanes', 'Where do pregnant women deliver?', 'Maternity care package PhilHealth', 'Midwife in Magallanes',
      'Asa manganak dinhi sa Magallanes?', 'Naa bay paanakan sa RHU?', 'Libre ba ang pagpanganak kung naay PhilHealth?', 'Pwede ba manganak sa balay?',
      'Asa ang lying-in nga duol?', 'Asa manganak ang buntis?',
    ],
    english:
      "The DOH asks mothers to give birth in a health facility with a trained midwife, nurse or doctor rather than at home. Ask the Rural Health Unit or your barangay midwife whether the RHU has an accredited birthing facility, and plan where you'll deliver during your prenatal check-ups; complicated pregnancies are referred to a hospital (the nearest are in Butuan City). PhilHealth's maternity care package pays for a normal delivery at accredited facilities.",
    bisaya:
      'Gisugo sa DOH nga manganak ang inahan sa pasilidad sa panglawas uban sa trained nga midwife, nurse o doktor, dili sa balay. Pangutana sa Rural Health Unit o sa imong barangay midwife kung naay accredited nga birthing facility ang RHU, ug plano-a kung asa ka manganak samtang nagpa-prenatal check-up; ang komplikado nga pagmabdos i-refer sa ospital (ang pinakaduol naa sa Butuan City). Ang maternity care package sa PhilHealth mobayad sa normal nga pagpanganak sa accredited nga pasilidad.',
  },

  // ---- What visitors asked that Magi could not answer (visitor test, 12 November 2026) ----
  // National agencies: where to go, since none of these is an LGU transaction. Sources: RA 8189
  // (voter registration: 18 by election day, 1 year in the Philippines, 6 months in the town);
  // RA 11055 (PhilSys, free registration); DFA passport fees (₱950 regular, ₱1,200 expedited);
  // LTO (student permit from age 16, LTMS portal); SSS My.SSS; Pag-IBIG Virtual Pag-IBIG (24 monthly
  // savings for a multi-purpose loan); RA 9003 (waste segregation, no open burning); NDRRMC flood
  // advice; DOH free flu and pneumococcal vaccines for senior citizens.
  {
    name: 'rhu.adult-vaccine.inquire',
    phrases: [
      'Where can I get a COVID vaccine?', 'Is there a COVID booster at the RHU?', 'Flu vaccine for senior citizens', 'Is the flu shot free for seniors?',
      'Pneumonia vaccine for the elderly', 'Vaccines for adults', 'Where can my lola get a flu vaccine?', 'Is there a free pneumococcal vaccine?',
      'Asa makakuha og bakuna sa COVID?', 'Naa bay booster sa RHU?', 'Libre ba ang bakuna sa trangkaso sa senior?', 'Bakuna sa pneumonia para sa tigulang',
      'Asa magpabakuna ang senior?', 'Naa bay flu vaccine karon?',
      'Is there a COVID vaccine schedule?', 'Bakuna sa COVID para sa hamtong',
    ],
    english:
      'Vaccines for adults and senior citizens: the DOH gives free flu (influenza) and pneumococcal (pneumonia) vaccines to senior citizens through health centers, while supplies last — ask the Rural Health Unit when the next schedule is. For COVID-19 vaccines and boosters, ask the RHU whether they are available. Bring your senior citizen ID or vaccination card.',
    bisaya:
      'Bakuna para sa mga hamtong ug senior citizen: ang DOH mohatag og libre nga bakuna sa trangkaso (flu) ug pneumococcal (pneumonia) sa mga senior citizen pinaagi sa mga health center, samtang naa pay suplay — pangutana sa Rural Health Unit kanus-a ang sunod nga iskedyul. Para sa bakuna ug booster sa COVID-19, pangutana sa RHU kung naa bay available. Dad-a ang imong senior citizen ID o vaccination card.',
  },
  {
    name: 'env.garbage.inquire',
    phrases: [
      'When is the garbage collection?', 'What is the garbage collection schedule?', 'Is there a garbage truck in our barangay?', 'How do I segregate my garbage?',
      'Who collects the garbage?', 'Garbage pickup schedule', 'Our garbage was not picked up', 'Waste collection in Magallanes',
      'Kanus-a ang kolekta sa basura?', 'Unsa nga adlaw mokuha ang trak sa basura?', 'Naa bay mokuha sa basura sa among barangay?', 'Unsaon pag-segregate sa basura?',
      'Wala gikuha among basura', 'Schedule sa basura',
      'Basura schedule sa among barangay', 'Who do I ask about garbage collection?',
    ],
    english:
      'The garbage collection schedule is set per barangay and isn\'t on this website yet — ask your Barangay Hall for your area\'s collection day. Segregate your waste before collection (RA 9003): biodegradable, recyclable and residual. Burning garbage is not allowed. To report a missed collection, use the Report a Concern page of this website.',
    bisaya:
      'Ang iskedyul sa pagkolekta sa basura gitakda matag barangay ug wala pa kini niining website — pangutana sa imong Barangay Hall kanus-a ang adlaw sa kolekta sa inyong lugar. I-segregate ang basura sa dili pa kolektahon (RA 9003): biodegradable, recyclable ug residual. Dili tugot ang pagsunog og basura. Para i-report ang wala nakuha nga basura, gamita ang Report a Concern page niining website.',
  },
  {
    name: 'tourism.food.inquire',
    phrases: [
      'Where can I eat in Magallanes?', 'Are there restaurants in Magallanes?', 'Where to eat near the Bay Walk?', 'Is there a good restaurant here?',
      'Where can we have a meal in Magallanes?', 'Food in Magallanes', 'Is there a cafe in Magallanes?', 'What is the local food in Magallanes?',
      'Asa ta mokaon diri?', 'Naa bay restaurant sa Magallanes?', 'Asa nindot mokaon sa Magallanes?', 'Naa bay karinderya duol sa Bay Walk?', 'Asa makakaon og paniudto sa Poblacion?',
      'Any good place to eat here?', 'Where can tourists eat in Magallanes?',
    ],
    english:
      'Restaurants and eateries aren\'t listed on this website yet, so I can\'t recommend one. Try the Poblacion town centre, around the Municipal Hall, the public market and the Bay Walk, or ask a tricycle driver.',
    bisaya:
      'Wala pa nalista niining website ang mga restaurant ug karinderya, mao nga dili pa ko makarekomenda. Sulayi sa Poblacion, palibot sa Munisipyo, sa merkado ug sa Bay Walk, o pangutana sa tricycle driver.',
  },
  {
    name: 'transport.land.inquire',
    phrases: [
      'How much is the jeep fare to Butuan?', 'Jeepney fare from Magallanes to Butuan', 'Is there a van to Butuan?', 'How much is the tricycle fare?',
      'Habal-habal fare', 'How do I get to Butuan without the boat?', 'Is there a bus to Magallanes?', 'Multicab fare to Butuan',
      'Pila ang plete sa jeep paingon Butuan?', 'Pila ang pamasahe sa tricycle?', 'Naa bay van paingon Butuan?', 'Pila ang plete sa habal-habal?', 'Unsay sakyan paingon Butuan?',
      'Pila ang plete sa van paingon Butuan?', 'How much is the fare to Butuan by jeep?', 'Is there a jeepney to Butuan?',
    ],
    english:
      'Fares for jeepneys, vans, tricycles and habal-habal between Magallanes and Butuan City aren\'t on record — ask the driver or at the terminal. Road fares are set by the LTFRB, and tricycle fares within town by the municipality. The passenger boat to Butuan takes about 45 minutes — ask me for the boat schedule.',
    bisaya:
      'Wala pa sa rekord ang plete sa jeep, van, tricycle ug habal-habal tali sa Magallanes ug Butuan City — pangutana sa driver o sa terminal. Ang plete sa dalan gitakda sa LTFRB, ug ang plete sa tricycle sulod sa lungsod sa munisipyo. Ang baroto paingon Butuan mga 45 minutos — pangutana nako sa iskedyul sa baroto.',
  },
  {
    name: 'places.banks.inquire',
    phrases: [
      'Is there a bank in Magallanes?', 'Is there an ATM here?', 'Where can I withdraw money?', 'Is there a GCash cash-in in Magallanes?',
      'Where is the nearest remittance center?', 'Is there a Palawan Express or Cebuana here?', 'Where is a padala center?', 'Remittance center in Magallanes',
      'Naa bay bangko sa Magallanes?', 'Naa bay ATM diri?', 'Asa makawithdraw?', 'Naa bay GCash padala diri?', 'Asa ang padala center?', 'Asa makapadala og kwarta?',
      'Naa bay cash-in diri?', 'Is there a pawnshop with padala in Magallanes?',
    ],
    english:
      'I don\'t have a list of banks, ATMs or remittance centers (padala, GCash cash-in) in Magallanes yet. Butuan City, next to Magallanes, has banks and ATMs. For the nearest padala or cash-in outlet, ask around the Poblacion town centre.',
    bisaya:
      'Wala pa koy lista sa mga bangko, ATM o padala center (padala, GCash cash-in) sa Magallanes. Ang Butuan City, silingan sa Magallanes, naay mga bangko ug ATM. Para sa pinakaduol nga padala o cash-in, pangutana sa Poblacion.',
  },
  {
    name: 'tourism.beach.inquire',
    phrases: [
      'Is there a beach in Magallanes?', 'Where can we swim in Magallanes?', 'Where to swim in Magallanes', 'Is there a beach near Butuan?',
      'Where can we go swimming?', 'Is the beach open to the public?', 'Naa bay baybayon sa Magallanes?', 'Asa mi makalangoy diri?', 'Naa bay beach diri?',
      'Asa nindot maligo sa dagat?',
      'Where is the nearest beach?', 'Is there a public beach here?', 'Naa bay dagat nga malanguyan?', 'Beach near the Poblacion', 'Asa ang beach sa Magallanes?', 'Can we swim at the Bay Walk?',
    ],
    english:
      'Magallanes faces Butuan Bay, where the Agusan River meets the sea. For a beach stay, Horizon Bay Resort & Events Place in Purok 4, Barangay Santo Niño is a beachfront resort (0917 717 7985; on Facebook as "Horizon BAY"). The Bay Walk in Poblacion is the waterfront promenade, best at sunset.',
    bisaya:
      'Ang Magallanes nag-atubang sa Butuan Bay, diin ang Agusan River motagbo sa dagat. Para sa beach, ang Horizon Bay Resort & Events Place sa Purok 4, Barangay Santo Niño usa ka beachfront resort (0917 717 7985; sa Facebook isip "Horizon BAY"). Ang Bay Walk sa Poblacion mao ang baybayon nga lakaw-lakawan, nindot sa pagsalop sa adlaw.',
  },
  {
    name: 'disaster.flood.inquire',
    phrases: [
      'What should I do during a flood?', 'There is floodwater in our area, what do I do?', 'Flood safety tips', 'How do I prepare for a flood?',
      'The water is rising in our house', 'What to do when there is a flood', 'Baha sa among lugar unsa akong buhaton?', 'Unsa ang buhaton kung baha?',
      'Nagsaka na ang tubig sa among balay', 'Unsaon pag-andam sa baha?',
      'What do we do if our barangay floods?', 'Flood preparedness tips', 'Unsa ang angay buhaton sa baha?', 'Nag-baha na, unsa man ang buhaton?', 'Flood safety advice', 'Mga tip kung naay baha',
    ],
    english: `If floodwater is rising:\n• Move to higher ground or your barangay's evacuation center — ask your Barangay Hall which one.\n• Turn off the electricity at the main switch before water reaches it.\n• Don't walk or drive through floodwater, and keep children away from it.\n• Bring IDs, medicines, water and a phone.\nIf someone is trapped or in danger, call MERT at ${HOTLINES.mert} or 911. Follow the LGU's advisories on its Facebook page and the News page of this website.`,
    bisaya: `Kung nagsaka ang tubig sa baha:\n• Balhin sa taas nga lugar o sa evacuation center sa inyong barangay — pangutana sa Barangay Hall kung asa.\n• Patya ang kuryente sa main switch sa dili pa maabot sa tubig.\n• Ayaw paglakaw o pagmaneho agi sa baha, ug ilayo ang mga bata niini.\n• Dad-a ang ID, tambal, tubig ug cellphone.\nKung naay natanggong o nameligro, tawag sa MERT sa ${HOTLINES.mert} o sa 911. Sunda ang mga abiso sa LGU sa Facebook page niini ug sa News page niining website.`,
  },
  {
    name: 'national.lost-id.inquire',
    phrases: [
      'I lost my ID, what should I do?', 'How do I replace a lost ID?', 'Lost driver\'s license', 'I lost my national ID', 'Lost postal ID',
      'What do I need for a lost ID?', 'Affidavit of loss for ID', 'Nawala akong ID unsa akong buhaton?', 'Nawala akong lisensya', 'Nawala ang akong UMID card',
      'Unsaon pag-ilis sa nawala nga ID?',
      'I lost my wallet with my IDs', 'Nawala akong UMID', 'Lost PWD ID what to do', 'How do I get an affidavit of loss?',
    ],
    english:
      'For a lost ID:\n1. Get a notarized affidavit of loss.\n2. Apply for a replacement at the office that issued it — National ID: a PhilSys registration center; driver\'s license: the LTO; UMID: the SSS; postal ID: PHLPost; senior citizen ID: the Office of Senior Citizens; PWD or solo parent ID: the MSWDO; voter certification: COMELEC.\nIf the ID could be misused, report the loss to the police (PNP: ' + HOTLINES.pnp + ').',
    bisaya:
      'Kung nawala ang ID:\n1. Pagkuha og notarized nga affidavit of loss.\n2. Mag-apply og puli sa opisina nga nag-isyu niini — National ID: PhilSys registration center; lisensya: LTO; UMID: SSS; postal ID: PHLPost; senior citizen ID: Office of Senior Citizens; PWD o solo parent ID: MSWDO; voter certification: COMELEC.\nKung basin gamiton kini sa uban, i-report sa pulis (PNP: ' + HOTLINES.pnp + ').',
  },
  {
    name: 'national.comelec.inquire',
    phrases: [
      'How do I register as a voter?', 'Voter registration in Magallanes', 'Where is the COMELEC office?', 'Can I register to vote?',
      'How do I transfer my voter registration to Magallanes?', 'Voter\'s certification', 'When is voter registration?', 'COMELEC Magallanes',
      'Unsaon pagparehistro isip botante?', 'Asa magparehistro sa pagboto?', 'Asa ang COMELEC?', 'Unsaon pag-update sa akong pagkabotante?', 'Kanus-a ang registration sa botante?',
      'How do I get a voter certificate?', 'Can I still register for the elections?',
    ],
    english:
      'Voter registration is done at the COMELEC Office of the Election Officer of Magallanes, during the registration periods COMELEC announces. You must be 18 or older on election day, and have lived in the Philippines for at least a year and in Magallanes for at least six months (RA 8189). Bring a valid ID; you can fill out the form online at https://comelec.gov.ph before you go. Transfers and voter certifications are handled by the same office.',
    bisaya:
      'Ang pagparehistro isip botante buhaton sa COMELEC Office of the Election Officer sa Magallanes, sa mga panahon sa registration nga ipahibalo sa COMELEC. Kinahanglan 18 anyos pataas ka sa adlaw sa eleksyon, ug nagpuyo sa Pilipinas labing menos usa ka tuig ug sa Magallanes labing menos unom ka bulan (RA 8189). Pagdala og valid ID; pwede nimo i-fill out ang form online sa https://comelec.gov.ph sa dili pa moadto. Ang transfer ug voter certification, sa samang opisina.',
  },
  {
    name: 'national.philsys.inquire',
    phrases: [
      'How do I get a National ID?', 'National ID registration', 'Where can I register for PhilSys?', 'Is the National ID free?', 'How do I get my ePhilID?',
      'Where do I claim my National ID?', 'PhilSys registration in Magallanes', 'Unsaon pagkuha og National ID?', 'Asa magparehistro sa National ID?',
      'Libre ba ang National ID?', 'Asa makuha ang akong National ID?', 'Naa bay PhilSys registration diri?',
      'When will my National ID arrive?', 'How do I get the digital National ID?', 'Unsa ang requirements sa National ID?',
    ],
    english:
      'The National ID (PhilSys) is free. Register at a PhilSys registration center — the PSA also holds registration in towns from time to time, so ask at the Municipal Hall. Bring a PSA birth certificate or a valid government ID. You can check your registration and get the digital ePhilID at https://philsys.gov.ph.',
    bisaya:
      'Libre ang National ID (PhilSys). Magparehistro sa PhilSys registration center — usahay naay registration ang PSA sa mga lungsod, mao nga pangutana sa Munisipyo. Pagdala og PSA birth certificate o valid nga ID sa gobyerno. Ma-check nimo ang imong registration ug makuha ang digital nga ePhilID sa https://philsys.gov.ph.',
  },
  {
    name: 'national.passport.inquire',
    phrases: [
      'How do I apply for a passport?', 'Where can I get a passport?', 'Passport requirements', 'How much is a passport?', 'DFA online booking',
      'Is there a DFA office in Butuan?', 'Passport renewal', 'Unsaon pag-apply og passport?', 'Asa makakuha og passport?', 'Pila ang passport?', 'Asa ang DFA?',
      'Book a passport online', 'Unsa ang requirements sa passport?', 'How long does a passport take?', 'Where is the DFA in Butuan?',
    ],
    english:
      'Passports are issued by the Department of Foreign Affairs (DFA). Book an appointment online at https://passport.gov.ph — the nearest DFA consular office is in Butuan City. Bring your PSA birth certificate and a valid ID. The fee is ₱950 (regular) or ₱1,200 (expedited).',
    bisaya:
      'Ang passport gihatag sa Department of Foreign Affairs (DFA). Pag-book og appointment online sa https://passport.gov.ph — ang pinakaduol nga DFA consular office naa sa Butuan City. Dad-a ang PSA birth certificate ug valid ID. Ang bayad ₱950 (regular) o ₱1,200 (expedited).',
  },
  {
    name: 'national.lto.inquire',
    phrases: [
      'How do I get a driver\'s license?', 'Where is the LTO office?', 'Student permit requirements', 'How do I renew my driver\'s license?',
      'LTO near Magallanes', 'How do I register my motorcycle?', 'Unsaon pagkuha og lisensya sa pagdrive?', 'Asa ang LTO?', 'Unsaon pag-renew sa lisensya?',
      'Asa iparehistro ang motor?',
      'Driver\'s license renewal requirements', 'Unsa ang requirements sa student permit?', 'How much is a driver\'s license?', 'Where can I take the driving exam?', 'Unsaon pagkuha og student permit?',
    ],
    english:
      'Driver\'s licenses and vehicle registration are handled by the Land Transportation Office (LTO). Start online at the LTMS portal (https://portal.lto.gov.ph), then go to the LTO district office in Butuan City. A student permit comes first (from age 16), then a non-professional license after the required driving course.',
    bisaya:
      'Ang lisensya sa pagdrive ug rehistro sa sakyanan gihatag sa Land Transportation Office (LTO). Sugdi online sa LTMS portal (https://portal.lto.gov.ph), unya adto sa LTO district office sa Butuan City. Una ang student permit (sugod 16 anyos), unya ang non-professional nga lisensya human sa gikinahanglan nga driving course.',
  },
  {
    name: 'national.sss.inquire',
    phrases: [
      'How do I check my SSS contributions?', 'Where is the SSS office?', 'How do I pay my SSS?', 'SSS loan', 'How do I get an SSS number?', 'UMID application',
      'Unsaon pag-check sa akong SSS?', 'Asa ang SSS?', 'Unsaon paghulog sa SSS?', 'Unsaon pagkuha og SSS number?',
      'SSS benefits', 'How do I get my SSS ID?', 'How do I register to SSS?', 'Unsaon pag-apply sa SSS loan?', 'Asa magbayad sa SSS?',
    ],
    english:
      'SSS contributions, loans and membership are handled by the Social Security System. Check and pay your contributions, apply for loans or get an SSS number online through My.SSS at https://www.sss.gov.ph or the SSS mobile app; for other concerns, the nearest SSS branch is in Butuan City.',
    bisaya:
      'Ang kontribusyon, loan ug pagka-miyembro sa SSS gidumala sa Social Security System. I-check ug bayri ang imong kontribusyon, mag-apply og loan o mokuha og SSS number online pinaagi sa My.SSS sa https://www.sss.gov.ph o sa SSS mobile app; sa ubang concern, ang pinakaduol nga SSS branch naa sa Butuan City.',
  },
  {
    name: 'national.pagibig.inquire',
    phrases: [
      'How do I apply for a Pag-IBIG loan?', 'Pag-IBIG multi-purpose loan', 'Where is the Pag-IBIG office?', 'How do I check my Pag-IBIG contributions?',
      'Pag-IBIG housing loan', 'Pag-IBIG calamity loan', 'Unsaon pag-apply og Pag-IBIG loan?', 'Asa ang Pag-IBIG?', 'Unsaon pag-check sa akong Pag-IBIG?',
      'How do I become a Pag-IBIG member?', 'Pag-IBIG MP2 savings', 'Unsaon pagkuha og Pag-IBIG number?', 'Pag-IBIG loan requirements', 'Asa magbayad sa Pag-IBIG?', 'Pag-IBIG calamity loan requirements',
    ],
    english:
      'Pag-IBIG loans (multi-purpose, calamity and housing) and contributions are handled by the Pag-IBIG Fund. Apply online through Virtual Pag-IBIG at https://www.pagibigfund.gov.ph, or at the Pag-IBIG branch in Butuan City. A multi-purpose loan usually needs at least 24 monthly contributions.',
    bisaya:
      'Ang mga loan sa Pag-IBIG (multi-purpose, calamity ug housing) ug kontribusyon gidumala sa Pag-IBIG Fund. Mag-apply online pinaagi sa Virtual Pag-IBIG sa https://www.pagibigfund.gov.ph, o sa Pag-IBIG branch sa Butuan City. Ang multi-purpose loan kasagaran nanginahanglan og labing menos 24 ka bulan nga kontribusyon.',
  },

  // ---- Agriculture and fisheries ----
  {
    name: 'agri.livestock.inquire',
    phrases: [
      'Unsaon pagpabakuna sa akong baboy?', 'How do I get my pigs vaccinated?', 'My pigs are sick, who do I call?', 'Is there a veterinarian in Magallanes?',
      'African swine fever in our barangay', 'My chickens are dying', 'Free deworming for goats', 'Animal health services', 'Vaccine for my carabao',
      'Where do I report sick livestock?', 'Nagmasakiton akong mga baboy', 'Naa bay beterinaryo sa Magallanes?', 'Namatay akong mga manok, asa ko mo-report?',
      'Bakuna sa kanding ug baka', 'Naa bay ASF sa among lugar?',
    ],
    english:
      "For vaccination, deworming and sick animals, go to the Municipal Agriculture Office at the Municipal Hall — its livestock technicians work with the Provincial Veterinary Office. Report pigs or chickens that suddenly fall sick or die right away, and don't sell, butcher or move them: African swine fever and bird flu spread fast, and early reporting protects your neighbours' animals too.",
    bisaya:
      'Para sa bakuna, deworming ug masakiton nga hayop, adto sa Municipal Agriculture Office sa Munisipyo — ang ilang mga livestock technician nagtrabaho uban sa Provincial Veterinary Office. I-report dayon ang baboy o manok nga kalit nga nasakit o namatay, ug ayaw kini ibaligya, ihawa o ibalhin: dali mokaylap ang African swine fever ug bird flu, ug ang sayo nga pag-report manalipod pud sa mga hayop sa imong silingan.',
  },
  {
    name: 'agri.fishpond.inquire',
    phrases: [
      'Do I need a permit for a fishpond?', 'How do I get a fishpond lease?', 'Permit for a fish cage', 'Fish pen permit in the river',
      'Who issues fishpond permits?', 'Can I build a fishpond on my land?', 'Fishpond lease agreement', 'Aquaculture permit', 'Bangus farm permit',
      'Kinahanglan ba og permit ang punuan?', 'Unsaon pagkuha og permit sa fish cage?', 'Asa mag-apply og fishpond lease?', 'Permit sa fish pen sa suba',
      'Pwede ba magbuhat og fishpond sa akong yuta?', 'Kinsa ang naghatag og permit sa fishpond?',
    ],
    english:
      "It depends on where the fishpond is:\n• On public land (such as mangrove or foreshore areas) — a Fishpond Lease Agreement from the Bureau of Fisheries and Aquatic Resources (BFAR) is required; mangroves are protected, so check first.\n• Fish cages and pens in municipal waters — a permit or license from the municipality, through the Municipal Agriculture Office, under the Fisheries Code.\n• On your own titled land — register the farm with the Municipal Agriculture Office.\nStart with the Municipal Agriculture Office; it tells you which applies.",
    bisaya:
      'Depende kung asa ang punuan:\n• Sa yuta sa gobyerno (sama sa bakhawan o baybayon) — kinahanglan og Fishpond Lease Agreement gikan sa Bureau of Fisheries and Aquatic Resources (BFAR); protektado ang bakhawan, mao nga susiha una.\n• Fish cage ug fish pen sa municipal waters — permit o lisensya gikan sa munisipyo, pinaagi sa Municipal Agriculture Office, ubos sa Fisheries Code.\n• Sa imong kaugalingong yuta nga naay titulo — iparehistro ang farm sa Municipal Agriculture Office.\nSugdi sa Municipal Agriculture Office; sultihan ka nila kung unsa ang angay.',
  },

  // ---- Disaster ----
  {
    name: 'disaster.hazard.inquire',
    phrases: [
      'Where are the evacuation centers?', 'Which barangays are flood-prone?', 'Is our area prone to flooding?', 'Where do we go when we evacuate?',
      'Hazard map of Magallanes', 'Is Magallanes at risk of storm surge?', 'Landslide-prone areas', 'Evacuation plan for my barangay', 'Where is the nearest evacuation center?',
      'Asa ang evacuation center?', 'Asa mi mobakwit?', 'Bahaon ba ang among lugar?', 'Unsa nga barangay ang bahaon?', 'Hazard map sa Magallanes',
      'Asa ang pinakaduol nga evacuation center?',
    ],
    english:
      `Magallanes is at the mouth of the Agusan River on Butuan Bay, so low-lying and coastal areas can flood or be hit by storm surge. Evacuation centres (often schools and covered courts) are assigned per barangay by the MDRRMO — ask your Barangay Hall now which one is yours, before you need it. To check your own location's flood, storm-surge and landslide risk, use the government's HazardHunterPH (https://hazardhunter.georisk.gov.ph). During an emergency, follow barangay and MDRRMO instructions and call MERT at ${HOTLINES.mert} or 911.`,
    bisaya:
      `Ang Magallanes naa sa baba sa Agusan River sa Butuan Bay, mao nga ang ubos ug duol sa baybayon nga lugar mahimong bahaon o maigo sa storm surge. Ang mga evacuation center (kasagaran eskwelahan ug covered court) gitakda matag barangay sa MDRRMO — pangutana karon sa imong Barangay Hall kung asa ang inyo, sa dili pa kinahanglanon. Para masusi ang peligro sa baha, storm surge ug landslide sa imong lugar, gamita ang HazardHunterPH sa gobyerno (https://hazardhunter.georisk.gov.ph). Kung naay emergency, sunda ang barangay ug MDRRMO ug tawag sa MERT sa ${HOTLINES.mert} o 911.`,
  },
  {
    name: 'disaster.earthquake.inquire',
    phrases: [
      'Was there an earthquake?', 'Is there an earthquake now?', 'What do I do during an earthquake?', 'Is there a tsunami warning?', 'Earthquake update',
      'Where can I check earthquake reports?', 'What should I do after an earthquake?', 'Is Magallanes at risk of tsunami?', 'Earthquake drill',
      'Naa bay linog karon?', 'Unsa ang buhaton kung naay linog?', 'Naa bay tsunami?', 'Asa makita ang update sa linog?', 'Kusog ang linog ganiha',
      'Unsa ang buhaton human sa linog?',
    ],
    english:
      `I don't have live earthquake data — check PHIVOLCS (https://phivolcs.dost.gov.ph or its Facebook page) for magnitude, location and any tsunami warning. During shaking: Drop, Cover and Hold On, away from windows. After a strong quake near the coast, or if the sea suddenly recedes, move to high ground at once — don't wait for an official warning. Check for injuries and gas leaks, and call MERT at ${HOTLINES.mert} or 911 for help.`,
    bisaya:
      `Wala koy live nga datos sa linog — tan-awa ang PHIVOLCS (https://phivolcs.dost.gov.ph o ang ilang Facebook page) para sa kakusgon, lugar ug bisan unsang pahibalo sa tsunami. Samtang naglinog: Drop, Cover and Hold On, layo sa bintana. Human sa kusog nga linog duol sa baybayon, o kung kalit nga mohubas ang dagat, adto dayon sa taas nga lugar — ayaw na hulata ang opisyal nga pahibalo. Susiha kung naay naangol o nag-leak nga gas, ug tawag sa MERT sa ${HOTLINES.mert} o 911 para sa tabang.`,
  },

  // ---- Jobs and education ----
  {
    name: 'jobs.lgu.inquire',
    phrases: [
      'Are there job vacancies at the municipal hall?', 'How do I apply for a job at the LGU?', 'Is the LGU hiring?', 'Job openings in the municipality',
      'How do I apply for a government job in Magallanes?', 'Where are LGU vacancies posted?', 'What do I need to apply for a job at the municipal hall?',
      'CS Form 212 for an LGU job application', 'Job order positions at the municipality', 'Plantilla positions Magallanes',
      'Naa bay bakante nga trabaho sa munisipyo?', 'Unsaon pag-apply og trabaho sa LGU?', 'Nag-hire ba ang munisipyo?', 'Asa makita ang job vacancies sa LGU?',
      'Unsa ang dad-on para mag-apply og trabaho sa munisipyo?',
    ],
    english:
      "Vacant LGU positions must be published and posted before they are filled (RA 7041) — check the bulletin boards at the Municipal Hall, the CSC job portal (https://csc.gov.ph/career) and the LGU's Facebook page. Apply at the Human Resource Management Office (HRMO) with an application letter, the Personal Data Sheet (CSC Form 212) with its work experience sheet, and copies of your eligibility, transcript or diploma, and training certificates. For private-sector jobs and DOLE programmes, ask me about the PESO.",
    bisaya:
      'Ang bakante nga posisyon sa LGU kinahanglan i-publish ug ipaskil sa dili pa pun-an (RA 7041) — tan-awa ang mga bulletin board sa Munisipyo, ang CSC job portal (https://csc.gov.ph/career) ug ang Facebook page sa LGU. Mag-apply sa Human Resource Management Office (HRMO) uban ang application letter, ang Personal Data Sheet (CSC Form 212) ug ang work experience sheet niini, ug kopya sa imong eligibility, transcript o diploma, ug training certificate. Para sa trabaho sa pribado ug mga programa sa DOLE, pangutana nako bahin sa PESO.',
  },
  {
    name: 'education.als.inquire',
    phrases: [
      'Is there an ALS program?', 'How do I enroll in ALS?', 'I did not finish high school, can I still study?', 'Alternative Learning System Magallanes',
      'Is ALS free?', 'Can adults enroll in ALS?', 'How do I get a high school diploma as an adult?', 'ALS for out-of-school youth', 'Where are ALS classes held?',
      'Naa bay ALS diri?', 'Unsaon pag-enroll sa ALS?', 'Wala ko nakahuman og high school, makaeskwela pa ba ko?', 'Libre ba ang ALS?',
      'Pwede ba ang hamtong mo-ALS?', 'Asa ang klase sa ALS?',
    ],
    english:
      "Yes — DepEd's Alternative Learning System (ALS) is free for out-of-school youth and adults who didn't finish elementary or high school. You study in flexible sessions with an ALS teacher, and passing the assessment earns an elementary or junior high school certificate you can use to continue to senior high school. Enroll at the nearest public school or ask the DepEd Division of Agusan del Norte for the ALS teacher in your area.",
    bisaya:
      'Oo — libre ang Alternative Learning System (ALS) sa DepEd para sa out-of-school youth ug mga hamtong nga wala nakahuman og elementarya o high school. Moeskwela ka sa flexible nga oras uban sa ALS teacher, ug kung makapasar sa assessment, makakuha ka og certificate sa elementarya o junior high school nga magamit para mopadayon sa senior high school. Mag-enroll sa pinakaduol nga public school o pangutana sa DepEd Division of Agusan del Norte kung kinsa ang ALS teacher sa inyong lugar.',
  },
  {
    name: 'education.tesda.inquire',
    phrases: [
      'Unsaon pag-apply sa TESDA training?', 'How do I apply for a TESDA scholarship?', 'Free TESDA courses', 'Where is the TESDA office?',
      'Vocational training near Magallanes', 'How do I get an NC II?', 'TESDA online courses', 'Skills training for out-of-school youth', 'TWSP scholarship',
      'Asa ang TESDA?', 'Naa bay libre nga training sa TESDA?', 'Unsaon pagkuha og NC II?', 'Skills training para sa walay trabaho',
      'TESDA scholarship requirements', 'Short courses sa TESDA',
    ],
    english:
      "TESDA offers free skills training through its scholarships (such as the Training for Work Scholarship Program) at accredited training centres, and the assessment for a National Certificate (NC II and others). Apply at the TESDA Agusan del Norte Provincial Office in Butuan City or at an accredited school, usually with a PSA birth certificate, your diploma or transcript, and ID photos. Free online courses are at the TESDA Online Program (https://e-tesda.gov.ph). The PESO also announces training schedules.",
    bisaya:
      'Ang TESDA naghatag og libre nga skills training pinaagi sa ilang mga scholarship (sama sa Training for Work Scholarship Program) sa mga accredited nga training center, ug sa assessment para sa National Certificate (NC II ug uban pa). Mag-apply sa TESDA Agusan del Norte Provincial Office sa Butuan City o sa accredited nga eskwelahan, kasagaran uban sa PSA birth certificate, diploma o transcript, ug ID nga picture. Ang libre nga online courses naa sa TESDA Online Program (https://e-tesda.gov.ph). Ang PESO pud mopahibalo sa iskedyul sa training.',
  },
  {
    name: 'education.scholarship.inquire',
    phrases: [
      'Naa bay scholarship ang munisipyo?', 'Is there a scholarship for college students?', 'How do I apply for a scholarship?', 'Scholarship programs in Magallanes',
      'CHED scholarship requirements', 'Tulong Dunong program', 'DOST scholarship', 'Free tuition in state universities', 'Is there an LGU scholarship?',
      'Unsaon pag-apply og scholarship?', 'Naa bay scholarship para sa college?', 'Scholarship sa LGU', 'Libre ba ang tuition sa state university?',
      'Requirements sa scholarship', 'Asa mag-apply og scholarship?',
    ],
    english:
      "Ask the Mayor's Office whether the LGU has its own scholarship this year. National options:\n• Free tuition at state universities and colleges (RA 10931), such as Caraga State University in Butuan City.\n• CHED scholarships and the Tulong Dunong / Tertiary Education Subsidy (UniFAST), applied for through your school.\n• DOST-SEI scholarships for science, math and engineering students, by exam.\n• TESDA scholarships for skills training.\nFor educational assistance in a crisis, ask the MSWDO about AICS.",
    bisaya:
      'Pangutana sa Mayor\'s Office kung naay kaugalingong scholarship ang LGU karong tuiga. Ang mga nasyonal nga kapilian:\n• Libre nga tuition sa state universities ug colleges (RA 10931), sama sa Caraga State University sa Butuan City.\n• CHED scholarship ug ang Tulong Dunong / Tertiary Education Subsidy (UniFAST), i-apply pinaagi sa imong eskwelahan.\n• DOST-SEI scholarship para sa science, math ug engineering, pinaagi sa exam.\n• TESDA scholarship para sa skills training.\nPara sa tabang sa edukasyon kung naay krisis, pangutana sa MSWDO bahin sa AICS.',
  },

  // ---- Governance ----
  {
    name: 'governance.complaint.inquire',
    phrases: [
      'How do I file a complaint against an employee?', 'How do I report corruption?', 'An employee was rude to me', 'Unsaon pag-report sa kurapsyon?',
      'Where can I report a fixer?', 'How do I complain about slow service at the municipal hall?', 'Report a government employee asking for a bribe',
      'What is hotline 8888?', 'How do I file a case with the Ombudsman?', 'Complaint against a barangay official',
      'Asa mo-reklamo bahin sa empleyado sa munisipyo?', 'Bastos ang empleyado, asa ko mo-report?', 'Nangayo og lagay ang empleyado',
      'Unsaon pag-file og reklamo sa Ombudsman?', 'Reklamo sa hinay nga serbisyo sa munisipyo',
    ],
    english:
      "You can complain about a public employee's service, conduct or corruption through:\n• Hotline 8888 — the national Citizens' Complaint Center (call 8888).\n• The Civil Service Commission's Contact Center ng Bayan (https://contactcenterngbayan.gov.ph), for poor frontline service, fixers and red tape.\n• The Office of the Ombudsman (https://www.ombudsman.gov.ph), for graft, bribery and misconduct of officials and employees.\nYou can also write to the head of the office or the Mayor's Office, or use the Report a Concern form on this website. Note the date, office and names, and keep any receipts.",
    bisaya:
      'Pwede ka mo-reklamo bahin sa serbisyo, binuhatan o kurapsyon sa empleyado sa gobyerno pinaagi sa:\n• Hotline 8888 — ang nasyonal nga Citizens\' Complaint Center (tawag sa 8888).\n• Contact Center ng Bayan sa Civil Service Commission (https://contactcenterngbayan.gov.ph), para sa dili maayo nga serbisyo, fixer ug red tape.\n• Office of the Ombudsman (https://www.ombudsman.gov.ph), para sa graft, lagay ug sayop nga binuhatan sa mga opisyal ug empleyado.\nPwede pud ka mosulat sa hepe sa opisina o sa Mayor\'s Office, o gamita ang Report a Concern form niining website. Isulat ang petsa, opisina ug mga ngalan, ug tipigi ang mga resibo.',
  },
  {
    name: 'governance.sb-session.inquire',
    phrases: [
      'When is the next Sangguniang Bayan session?', 'Can the public attend SB sessions?', 'When does the SB meet?', 'Schedule of the municipal council session',
      'How do I attend a public hearing?', 'Where are SB sessions held?', 'How do I speak in an SB session?', 'Regular session of the Sangguniang Bayan',
      'How often does the SB meet?', 'Can I watch the council session?', 'Kanus-a ang sesyon sa SB?', 'Pwede ba motambong sa sesyon sa Sangguniang Bayan?',
      'Asa himoon ang sesyon sa SB?', 'Kanus-a ang public hearing?', 'Pila ka beses magsesyon ang SB?',
    ],
    english:
      "Under the Local Government Code (Sec. 52), the Sangguniang Bayan holds a regular session at least once a week, on a day and time it sets by ordinance, at the Municipal Hall — and sessions are open to the public unless a closed session is called. Ask the Office of the Vice Mayor / Sangguniang Bayan for this week's schedule and agenda, and to request time to speak or to attend a public hearing.",
    bisaya:
      'Ubos sa Local Government Code (Sec. 52), ang Sangguniang Bayan magsesyon og labing menos kausa matag semana, sa adlaw ug oras nga gitakda niini pinaagi sa ordinansa, sa Munisipyo — ug bukas ang sesyon sa publiko gawas kung closed session. Pangutana sa Office of the Vice Mayor / Sangguniang Bayan bahin sa iskedyul ug agenda karong semanaha, ug kung gusto ka mosulti o motambong sa public hearing.',
  },
  {
    name: 'governance.ordinances.inquire',
    phrases: [
      'Where can I read the municipal ordinances?', 'Is there a curfew in Magallanes?', 'Copy of a municipal ordinance', 'List of ordinances',
      'What are the local laws in Magallanes?', 'Curfew for minors', 'Where are ordinances posted?', 'Is there a liquor ban?', 'Anti-smoking ordinance',
      'Asa mabasa ang mga ordinansa sa munisipyo?', 'Naa bay curfew diri?', 'Kopya sa ordinansa', 'Unsa ang mga ordinansa sa Magallanes?',
      'Curfew sa mga menor de edad', 'Asa gipaskil ang mga ordinansa?',
    ],
    english:
      "Municipal ordinances — including any curfew, liquor or smoking rules — are passed by the Sangguniang Bayan. They are not posted on this website yet. By law (Local Government Code, Sec. 59) each ordinance is posted at the Municipal Hall's bulletin board and in other public places, and you can ask the Sangguniang Bayan office for a copy or request one through FOI. For curfew hours in your area, ask your Barangay Hall or the PNP.",
    bisaya:
      'Ang mga ordinansa sa munisipyo — apil ang curfew, ug mga lagda sa ilimnon o pagpanigarilyo — gipasar sa Sangguniang Bayan. Wala pa kini nakapost niining website. Sumala sa balaod (Local Government Code, Sec. 59), ang matag ordinansa ipaskil sa bulletin board sa Munisipyo ug sa ubang publiko nga lugar, ug pwede ka mangayo og kopya sa opisina sa Sangguniang Bayan o pinaagi sa FOI. Para sa oras sa curfew sa inyong lugar, pangutana sa Barangay Hall o sa PNP.',
  },
  {
    name: 'governance.citizens-charter.inquire',
    phrases: [
      "Where can I see the Citizen's Charter?", "What is the Citizen's Charter?", "Citizen's Charter of Magallanes", "Where is the Citizen's Charter posted?",
      "Is there a Citizen's Charter at the municipal hall?", "Citizen's Charter of the BPLO", "Citizen's Charter requirements and fees", "Copy of the Citizen's Charter",
      "Does the LGU follow its Citizen's Charter?", 'Ease of doing business charter',
      "Asa makita ang Citizen's Charter?", "Unsa ang Citizen's Charter?", "Naa bay Citizen's Charter sa munisipyo?", "Asa gipaskil ang Citizen's Charter?",
      "Kopya sa Citizen's Charter",
    ],
    english:
      "The Citizen's Charter lists each office's services, requirements, fees, steps and processing time. Under the Ease of Doing Business Act (RA 11032, Sec. 6) every office must post it at its entrance or the most visible spot and online. It isn't on this website yet — look for it at the Municipal Hall, or ask the office you're transacting with. If an office goes past its charter's processing time, you can complain through Hotline 8888 or the CSC Contact Center ng Bayan.",
    bisaya:
      'Ang Citizen\'s Charter naglista sa mga serbisyo, requirements, bayad, lakang ug kadugayon sa matag opisina. Ubos sa Ease of Doing Business Act (RA 11032, Sec. 6), kinahanglan ipaskil kini sa matag opisina sa ganghaan o sa labing makita nga dapit ug online. Wala pa kini niining website — pangitaa sa Munisipyo, o pangutana sa opisina nga imong gi-transaksyonan. Kung molapas ang opisina sa kadugayon sa ilang charter, pwede ka mo-reklamo pinaagi sa Hotline 8888 o sa CSC Contact Center ng Bayan.',
  },
  {
    name: 'governance.term.inquire',
    phrases: [
      'Kanus-a mahuman ang termino sa mayor?', "When does the mayor's term end?", 'How long is the term of the mayor?', 'When is the next local election?',
      'Until when are the current officials in office?', 'How many terms can a mayor serve?', 'When is the next election in Magallanes?', 'Term of office of councilors',
      'How long do local officials serve?', 'When were the current officials elected?', 'Pila ka tuig ang termino sa mayor?', 'Kanus-a ang sunod nga eleksyon?',
      'Hangtod kanus-a ang mga opisyal karon?', 'Pila ka termino ang mayor?', 'Kanus-a gipili ang mga opisyal karon?',
    ],
    english:
      "Local officials serve 3-year terms, up to three consecutive terms (Local Government Code, Sec. 43). The current Mayor, Vice Mayor and Sangguniang Bayan members were elected in May 2025, and their term ends at noon on June 30, 2028; the next local election is in May 2028.",
    bisaya:
      'Ang mga lokal nga opisyal naglingkod og 3 ka tuig matag termino, hangtod tulo ka sunod-sunod nga termino (Local Government Code, Sec. 43). Ang Mayor, Vice Mayor ug mga miyembro sa Sangguniang Bayan karon gipili niadtong Mayo 2025, ug mahuman ang ilang termino sa udto sa Hunyo 30, 2028; ang sunod nga lokal nga eleksyon sa Mayo 2028.',
  },

  // ---- Utilities and facilities ----
  // No public source names Magallanes's water provider or a booking procedure for its courts
  // (searched November 2026), so these say where to ask instead of naming one.
  {
    name: 'utilities.water.inquire',
    phrases: [
      'Who do I call about a water problem?', 'How do I apply for a water connection?', 'There is no water in our area', 'Who is the water provider in Magallanes?',
      'Is there a water district in Magallanes?', 'Who fixes broken water pipes?','Our water is dirty, who do I tell?', 'Water interruption in our barangay',
      'Where do I pay my water bill?', 'New water connection requirements', 'Walay tubig sa among lugar', 'Kinsa ang tawagan kung walay tubig?',
      'Unsaon pag-apply og koneksyon sa tubig?', 'Naa bay nabuak nga tubo sa tubig', 'Asa magbayad sa bayronon sa tubig?',
    ],
    english:
      "I don't have the water provider for each area yet — depending on where you live, water may come from a waterworks system or a barangay water system. For a new connection, a bill or a problem with your supply, ask at your Barangay Hall which system serves your area and how to reach it, or call the Mayor's Office at 0948-623-6977. To report a broken pipe, a leak or no water in your area, use the Report a Concern form on this website so the right office can act on it.",
    bisaya:
      'Wala pa nako ang tag-supply sa tubig sa matag lugar — depende kung asa ka nagpuyo, ang tubig mahimong gikan sa waterworks system o sa water system sa barangay. Para sa bag-ong koneksyon, bayronon o problema sa supply, pangutana sa imong Barangay Hall kung unsa nga system ang nagserbisyo sa inyong lugar ug unsaon pagkontak niini, o tawag sa Mayor\'s Office sa 0948-623-6977. Para mo-report sa nabuak nga tubo, nag-leak o walay tubig sa inyong lugar, gamita ang Report a Concern form niining website aron maaksyonan sa angay nga opisina.',
  },
  {
    name: 'places.covered-court.inquire',
    phrases: [
      'Can I reserve the covered court?', 'How do I book the gym?', 'Can we use the covered court for a birthday party?', 'How much is the rent of the covered court?',
      'Can we borrow the basketball court for a league?', 'Who manages the covered court?', 'Reserve the gymnasium for an event', 'Use of the municipal gym',
      'Schedule of the covered court', 'Can I rent the plaza for an event?', 'Pwede ba mo-reserve sa covered court?', 'Unsaon pag-book sa gym?',
      'Pila ang abang sa covered court?', 'Pwede ba mi mogamit sa court para sa liga?', 'Kinsa ang nagdumala sa covered court?',
    ],
    english:
      "To use a barangay covered court, ask at that barangay's Barangay Hall — the barangay sets its schedule, rules and any fee. For a municipal gym, plaza or other LGU facility, write a request to the Mayor's Office with the date, time and purpose; municipal property is managed by the General Services Office. Ask early, since leagues and town events book them first.",
    bisaya:
      'Para mogamit sa covered court sa barangay, pangutana sa Barangay Hall sa maong barangay — ang barangay ang motakda sa iskedyul, lagda ug bisan unsang bayad. Para sa gym, plaza o ubang pasilidad sa munisipyo, magsulat og hangyo sa Mayor\'s Office uban ang petsa, oras ug katuyoan; ang mga propiedad sa munisipyo gidumala sa General Services Office. Pangutana og sayo, kay ang mga liga ug kalihokan sa lungsod ang unang nagpa-book.',
  },
];

// Keyword routes, tried before publicServices.js's own. Each names its topic plainly.
const BUSINESS = /\b(business|negosyo|store|tindahan|shop|sari-sari)\b/i;
const FEE = /\b(how\s*much|magkano|tag\s*pila|tagpila|bayad|fees?|cost)\b/i;
const asksFee = (q) => FEE.test(q) || (/\bpila\b/i.test(q) && !/\bpila\s*(na\s*)?ka\b/i.test(q));
const LICENSE_TIME = /\b(how\s*long|how\s*many\s*days|pila\s*ka\s*(adlaw|semana|bulan)|kadugay|dugay|gaano\s*katagal|valid\w*|balido|expir\w*|mag-?expire|posting|ipaskil|release\w*|ma-?release|another\s*town|laing\s*lungsod|10\s*days|processing|how\s*soon)\b/i;
const ANIMAL = /\b(dogs?|iro|cats?|iring|rabies|animals?|hayop|baboy|pigs?|hogs?|manok|chickens?|livestock|kanding|goats?|baka|cows?|carabaos?|kabaw)\b/i;

export const COMMUNITY_ROUTES = [
  // What visitors asked that Magi could not answer (visitor test, 12 November 2026). First, so
  // "tricycle fare" is not the franchise and "lost ID" not the ID itself.
  ['national.lost-id.inquire', (q) => /\b(lost|nawala|nawad-?an|nawagtang|missing)\b/i.test(q) && /\b(ids?|licen[cs]e|lisensya|passport|card|umid)\b/i.test(q)],
  ['rhu.adult-vaccine.inquire', (q) =>
    (/\b(covid\w*|flu|trangkaso|influenza|pneumo\w*)\b/i.test(q) && /\b(vaccin\w*|bakuna|magpabakuna|shots?|boosters?|jab)\b/i.test(q)) ||
    /\b(covid|covid-?19)\s*boosters?\b/i.test(q) ||
    (/\b(vaccin\w*|bakuna|magpabakuna)\b/i.test(q) && /\b(seniors?|adults?|elderly|tigulang|lolo|lola|hamtong)\b/i.test(q) && !ANIMAL.test(q))],
  ['national.comelec.inquire', (q) => !/\b(birth\s*cert\w*|psa|cenomar|marriage\s*cert\w*|nbi|clearances?|baptismal|certificates?)\b/i.test(q) && /\b(comelec|voters?|voter'?s|botante|pagkabotante|register\s*to\s*vote|election\s*officer)\b/i.test(q) && !/\b(term|termino|winners?|results?)\b/i.test(q)],
  ['national.philsys.inquire', (q) => !/\b(birth\s*cert\w*|psa|cenomar|marriage\s*cert\w*|nbi|clearances?|baptismal|certificates?)\b/i.test(q) && /\b(national\s*id|philsys|phil\s*id|philid|e-?philid|e-?phil\s*id)\b/i.test(q)],
  ['national.passport.inquire', (q) => !/\b(birth\s*cert\w*|psa|cenomar|marriage\s*cert\w*|nbi|clearances?|baptismal|certificates?)\b/i.test(q) && /\b(passports?|pasaporte|dfa)\b/i.test(q)],
  ['national.lto.inquire', (q) => !/\b(birth\s*cert\w*|psa|cenomar|marriage\s*cert\w*|nbi|clearances?|baptismal|certificates?)\b/i.test(q) &&
    /\blto\b|\bltms\b|\bdriver'?s?\s*licen[cs]e\b|\bstudent\s*(driver'?s?\s*)?permit\b/i.test(q) ||
    (/\b(lisensya|licen[cs]e)\b/i.test(q) && /\b(drive|driving|pagdrive|pag-?drive|motor\w*|sakyanan|car)\b/i.test(q)) ||
    (/\b(register|regist\w*|\w*rehistro)\b/i.test(q) && /\b(motorcycle|motor|sakyanan|vehicle|car)\b/i.test(q) && !/\b(tricycle|franchise|boat|baroto)\b/i.test(q))],
  ['national.sss.inquire', (q) => !/\b(birth\s*cert\w*|psa|cenomar|marriage\s*cert\w*|nbi|clearances?|baptismal|certificates?)\b/i.test(q) && /\b(sss|umid|social\s*security)\b/i.test(q)],
  ['national.pagibig.inquire', (q) => /\b(pag-?\s*ibig|hdmf)\b/i.test(q)],
  ['transport.land.inquire', (q) =>
    /\b(jeep\w*|vans?|multicab|habal-?habal|bus|tricycle|traysikol|trisikad)\b/i.test(q) && /\b(fares?|pamasahe|plete|how\s*much|pila|magkano|bayad|sakyan|commute)\b/i.test(q) &&
    !/\b(franchise|prangkisa|mtop|permit|register|rehistro)\b/i.test(q)],
  ['places.banks.inquire', (q) =>
    /\b(banks?|bangko|atms?|remittance|padala|gcash|palawan|cebuana|lhuillier|western\s*union|money\s*transfer|cash-?in|withdraw\w*|makawithdraw)\b/i.test(q) &&
    !/\b(permit|tax|amilyar|bills?|fees?|bayad\s*sa|pay\s*(my|the|for)|landbank\s*loan|loan)\b/i.test(q)],
  ['env.garbage.inquire', (q) =>
    /\b(garbage|basura|trash|waste)\b/i.test(q) && /\b(collect\w*|kolekta\w*|pick\s*-?up|schedule|iskedyul|kanus-?a|when|trucks?|trak|segregat\w*|nakuha|mokuha)\b/i.test(q) &&
    !/\b(burn\w*|\w*sunog\w*|report\w*|i-?report|mo-?report)\b/i.test(q)],
  ['tourism.food.inquire', (q) =>
    (/\b(eat|kaon|mokaon|makakaon|restaurants?|eatery|eateries|karinderya|carinderia|cafe|caf[eé]s|foods?|pagkaon|lunch|paniudto|dinner|panihapon)\b/i.test(q) &&
      /\b(where|asa|saan|recommend\w*|best|nindot|good|naa\s*bay|places?|local|any)\b/i.test(q) &&
      !/\b(permit|requirements?|sanitary|health|business|negosyo|open\s*an?|magbukas|licen[cs]e|handlers?|fish|isda|vegetables?|utanon)\b/i.test(q))],
  ['tourism.beach.inquire', (q) => /\b(beach\w*|baybayon|swimming|swim|langoy|makalangoy|maligo)\b/i.test(q) && !/\b(flood\w*|baha|storm|surge|tsunami|evacuat\w*)\b/i.test(q)],
  // Water supply and bills — not flood water, nor the sanitary permit's water analysis. "Where do I
  // report…" keeps the Report a Concern answer.
  ['utilities.water.inquire', (q) =>
    /\b(water|tubig)\b/i.test(q) &&
    /\b(connection|koneksyon|connect|apply|suppl\w*|problems?|problema|walay|wala|no\s*water|leak\w*|nag-?leak|pipes?|tubo|bills?|bayronon|call|tawag|provid\w*|district|waterworks|interruption|dirty|hugaw|nabuak|broken)\b/i.test(q) &&
    !/\b(flood\w*|baha|analysis|test|sample|sanitary|drinking\s*water\s*for|report\w*|i-?report|mo-?report|mag-?report)\b/i.test(q)],
  ['places.covered-court.inquire', (q) =>
    /\b(covered\s*courts?|gym|gymnasium|basketball\s*courts?|court|plaza|function\s*hall|multi-?purpose\s*hall)\b/i.test(q) &&
    /\b(reserv\w*|book\w*|rent\w*|abang|use|gamit|mogamit|borrow|hulam|events?|party|liga|league|schedule|manages?|nagdumala)\b/i.test(q) &&
    !/\b(supreme|judge|kaso|case)\b/i.test(q)],
  ['jobs.first-time-jobseeker.inquire', (q) => /\bfirst[\s-]*time\s*(job\s*-?\s*seekers?|jobseekers?|job\s*hunters?)\b|\bra\s*11261\b/i.test(q) ||
    (/\b(fresh\s*grad\w*|bag-?ong\s*graduate|first\s*job|unang\s*trabaho)\b/i.test(q) && /\b(free|libre|waive\w*|clearances?|nbi|documents?|dokumento)\b/i.test(q))],
  ['clearance.indigency.inquire', (q) => /\b(indigen\w*)\b/i.test(q) && !/\b(aics|burial|medical|assistance|tabang|lubong|phil-?health)\b/i.test(q)],
  ['clearance.good-moral.inquire', (q) => /\bgood\s*moral\b/i.test(q)],
  ['clearance.mayor.inquire', (q) => /\bmayor'?s?\s*(clearance|certification)\b|\bclearance\s*(sa|from\s*the)\s*mayor\b/i.test(q)],
  ['permit.zoning.inquire', (q) => /\b(zoning|locational|location\s*clearance)\b/i.test(q)],
  ['permit.building.occupancy.inquire', (q) => /\boccupancy\b/i.test(q)],
  ['permit.building.process.inquire', (q) =>
    /\b(building|bilding|balay|house|construction|pagtukod)\b/i.test(q) && /\bpermit\b/i.test(q) && /\b(how\s*long|how\s*many\s*days|how\s*fast|pila\s*ka\s*(adlaw|semana|bulan)|kadugay|dugay|gaano\s*katagal|processing|process\w*\s*time|release\w*|ma-?release)\b/i.test(q) && !BUSINESS.test(q)],
  ['permit.building.ancillary.inquire', (q) =>
    /\bcfei\b/i.test(q) ||
    (/\b(fenc\w*|koral|electrical|wiring|plumbing|demolition|demolish)\b/i.test(q) && /\b(permits?|inspection|certificate|kinahanglan|need)\b/i.test(q) && !BUSINESS.test(q) && !asksFee(q))],
  ['permit.business.retirement.inquire', (q) =>
    /\b(close|closed|closing|closure|retire\w*|stop\w*|isira|pagsira|sirado|sirhan|gisirhan|undang|mo-?undang|pag-?undang)\b/i.test(q) && BUSINESS.test(q) && !/\b(time|oras|open|abri|what\s*time|hours?)\b/i.test(q)],
  // Where and how to pay, online or at the counter — not how much ("pila" is the fees answer).
  // A building permit is paid as its own fee ("Asa magbayad sa building permit?" got this answer).
  ['permit.business.payment.inquire', (q) =>
    /\b(business|negosyo|permits?|mayor'?s?|assessment)\b/i.test(q) &&
    ((/\b(pay|payment|bayad|magbayad|bayran|bayri)\b/i.test(q) && /\b(online|gcash|maya|paymaya|internet|e-?payment|bank\s*transfer)\b/i.test(q)) ||
      /\b(where|asa|diin|how)\s*(do\s*i\s*|to\s*|can\s*i\s*|ko\s*|mi\s*|ta\s*)?(pay|magbayad|bayran|bayri)\b|\bunsaon\s*(pag)?bayad\b/i.test(q)) &&
    !/\b(how\s*much|magkano|pila)\b/i.test(q) &&
    !/\b(building|bilding|balay|house|construction|occupancy|fenc\w*|demolition|electrical)\b/i.test(q)],
  ['permit.tricycle.inquire', (q) => /\b(mtop|tricycles?|traysikol|trisikad|pedicab|motorela)\b/i.test(q) || (/\b(franchise|prangkisa)\b/i.test(q) && /\b(motor\w*|pasada|sakyanan|vehicle)\b/i.test(q))],
  ['civil.registry.foreigner-marriage.inquire', (q) =>
    /\blegal\s*capacity\b/i.test(q) ||
    (/\b(foreigner|foreign\w*|dayuhan|langyaw|american|amerikano)\b/i.test(q) && /\b(marr\w*|\w*kasal\w*|pakaslan|kaslon|\w*minyo|wedding|fianc\w*)\b/i.test(q))],
  ['civil.registry.marriage.time.inquire', (q) => /\b(marriage|marry|kasal)\b/i.test(q) && /\blicen[cs]e\b/i.test(q) && LICENSE_TIME.test(q) && !asksFee(q)],
  ['civil.registry.copy.inquire', (q) =>
    /\bform\s*[123]a\b/i.test(q) ||
    (/\b(copy|copies|kopya|certified\s*true)\b/i.test(q) && /\b(birth|marriage|death|kasal|katawo|natawo|namatay)\b/i.test(q) && !/\b(psa|nso|tax|declaration)\b/i.test(q) && !asksFee(q))],
  ['social.philhealth.inquire', (q) => /\b(phil-?health|pmrf)\b/i.test(q) && !/\b(yakap|konsulta|hospitals?|ospital|maternity|birth|\w*panganak|deliver\w*|nabayri|unpaid|expired|na-?expire)\b/i.test(q)],
  ['social.daycare.inquire', (q) => /\b(day\s*-?care|daycare|child\s*development\s*(center|centre|workers?)|pre-?school|nursery)\b/i.test(q)],
  ['social.child-protection.inquire', (q) =>
    /\bchild\s*(abuse|labou?r|trafficking|neglect)\b|\bra\s*7610\b/i.test(q) ||
    (/\b(child|children|bata|anak|minors?|menor)\b/i.test(q) && /\b(abus\w*|maltreat\w*|hurts?|hurting|gibunalan|gisakitan|gipasakitan|neglect\w*|exploit\w*|gi-?exploit|trafficking|bullied|bullying)\b/i.test(q))],
  ['social.vawc.inquire', (q) =>
    /\bvawc?\b|\bra\s*9262\b|\bviolence\s*against\s*women\b|\bdomestic\s*violence\b|\b(barangay\s*)?protection\s*order\b|\bbpo\b/i.test(q) ||
    (/\b(women|woman|wife|asawa|babaye|bana|husband|partner|uyab|live-?in)\b/i.test(q) &&
      /\b(abus\w*|gi-?abuso|violen\w*|hurts?|hurting|beats?|gibunalan|gisakitan|nanakit|nagbunal|harass\w*|rape|gi-?rape|threat\w*|gihulga|hulga)\b/i.test(q))],
  ['rhu.immunization.inquire', (q) =>
    /\b(vaccin\w*|bakuna|magpabakuna|immuni[sz]\w*|bcg|measles|tigdas|polio|pentavalent|mmr)\b/i.test(q) && !ANIMAL.test(q) && !/\b(covid|flu|trangkaso|pneumonia|seniors?)\b/i.test(q)],
  ['rhu.family-planning.inquire', (q) =>
    /\b(family\s*planning|contracept\w*|birth\s*control|pills|condoms?|implants?|iud|injectables?|dmpa|ligation|tubal|vasectomy)\b/i.test(q)],
  ['rhu.tb.inquire', (q) => /\b(tb|tuberculosis|tisis|dots)\b|\b(ubo\s*nga\s*dugay|dugay\s*na\s*(akong\s*)?ubo|cough\s*for\s*(two|2|three|3)\s*weeks|persistent\s*cough)\b/i.test(q) || (/\bubo\b/i.test(q) && /\bsemana\b/i.test(q))],
  ['rhu.dental.inquire', (q) => /\b(dentists?|dentista|dental|ngipon|bunot|tooth|teeth|toothache)\b/i.test(q)],
  ['rhu.dengue.inquire', (q) => /\b(dengue|denggi|dengi|ns1|fogging)\b/i.test(q) || (/\b(hilanat|fever)\b/i.test(q) && /\b(2|3|duha|tulo|two|three)\s*(na\s*)?(ka\s*)?(adlaw|days?)\b/i.test(q))],
  ['rhu.birthing.inquire', (q) =>
    /\b(lying-?in|birthing|paanakan|manganak|manganganak|pagpanganak|give\s*birth|giving\s*birth|deliver\w*\s*(my|a|the|our)?\s*baby|deliveries|maternity|midwife)\b/i.test(q) || (/\b(pregnant|buntis)\b/i.test(q) && /\b(deliver\w*|manganak)\b/i.test(q))],
  ['agri.livestock.inquire', (q) =>
    /\b(veterinar\w*|beterinaryo|asf|african\s*swine|swine\s*fever|bird\s*flu|animal\s*health)\b/i.test(q) ||
    /\b(baboy|pigs?|hogs?|swine|manok|chickens?|kanding|goats?|baka|cows?|carabaos?|kabaw|livestock|poultry|animals?|hayop|mananap)\b/i.test(q) &&
    /\b(vaccin\w*|bakuna|magpabakuna|pagpabakuna|sick|sakit|nasakit|nagmasakiton|masakiton|disease|asf|swine\s*fever|bird\s*flu|vet\w*|beterinaryo|deworm\w*|namatay|died|dying)\b/i.test(q) &&
    !/\b(insur\w*|pcic|bite|paak|gipaak|kagat)\b/i.test(q)],
  ['agri.fishpond.inquire', (q) => /\b(fishponds?|fish\s*ponds?|punuan|fish\s*cages?|fish\s*pens?|aquacultur\w*|(bangus|tilapia|prawn|hipon)\s*farms?)\b/i.test(q)],
  ['disaster.hazard.inquire', (q) =>
    /\b(evacuat\w*|bakwit\w*|mobakwit|pagbakwit|flood-?prone|prone|hazard\s*maps?|hazards?|storm\s*surge|landslides?|bahaon)\b/i.test(q) && !/\b(fire\s*safety|business|negosyo)\b/i.test(q)],
  ['disaster.earthquake.inquire', (q) => /\b(linog|earthquakes?|lindol|tsunami|phivolcs|aftershocks?)\b/i.test(q)],
  ['jobs.lgu.inquire', (q) =>
    /\b(jobs?|vacanc\w*|bakante|hiring|nag-?hire|trabaho|employment|plantilla|job\s*order|apply\s*for\s*work)\b/i.test(q) &&
    // "is there any employment in magallanes" names the town rather than the LGU.
    /\b(lgu|municipal\w*|munisipyo|government|gobyerno|hall|town\s*hall|magallanes|lungsod)\b/i.test(q) &&
    !/\b(spes|tupad|peso|students?|estudyante|summer|first[\s-]*time)\b/i.test(q) ||
    /\b(plantilla|cs\s*form\s*212)\b/i.test(q)],
  ['education.tesda.inquire', (q) => /\b(tesda|vocational|tech-?voc|skills?\s*training|nc\s*(i{1,3}|[123])|national\s*certificate|short\s*courses?|twsp)\b/i.test(q)],
  ['education.als.inquire', (q) => /\b(als|alternative\s*learning|out-?of-?school|wala\s*(ko\s*)?nakahuman|did\s*not\s*finish|didn'?t\s*finish|drop-?\s*out|dropout)\b/i.test(q) ||
    (/\b(diploma|high\s*school)\b/i.test(q) && /\b(adults?|hamtong|working)\b/i.test(q))],
  ['education.scholarship.inquire', (q) => /\b(scholar\w*|iskolar\w*|tulong\s*dunong|ched|unifast|dost-?sei|free\s*tuition|libre\s*nga\s*tuition)\b|\b(libre|free)\b.*\btuition\b|\btuition\b.*\b(libre|free)\b/i.test(q) && !/\b(good\s*moral|indigen\w*)\b/i.test(q)],
  ['governance.complaint.inquire', (q) =>
    /\b(corrupt\w*|kurapsyon|korapsyon|kurakot|bribe\w*|lagay|suhol|ombudsman|8888|fixers?|red\s*tape|graft)\b/i.test(q) ||
    (/\b(rude|bastos|sungit|masungit|discourteous)\b/i.test(q) && /\b(employees?|empleyado|staff|personnel|kawani)\b/i.test(q)) ||
    (/\b(complain\w*|reklamo|mo-?reklamo|magreklamo|report|i-?report|mo-?report|file)\b/i.test(q) &&
      /\b(employees?|empleyado|staff|personnel|kawani|rude|bastos|slow\s*service|hinay\s*nga\s*serbisyo|barangay\s*official|official)\b/i.test(q))],
  ['governance.sb-session.inquire', (q) =>
    (/\b(sessions?|sesyon|magsesyon|public\s*hearings?|meet|meets|meeting)\b/i.test(q) && /\b(sb|sangguniang|sanggunian|council|konseho)\b/i.test(q)) || /\bpublic\s*hearings?\b/i.test(q)],
  ['governance.ordinances.inquire', (q) => /\b(ordinances?|ordinansa|curfew|kurpyu|liquor\s*ban|local\s*laws?)\b/i.test(q)],
  ['governance.citizens-charter.inquire', (q) => /\bcitizen'?s?\s*charter\b|\bcharter\b/i.test(q)],
  ['governance.term.inquire', (q) =>
    (/\b(term|terms|termino)\b/i.test(q) && /\b(mayor|vice|officials?|opisyal|sb|konsehal|councilors?|serve|mahuman|end|ends|until|hangtod)\b/i.test(q)) ||
    (/\b(until\s*when|hangtod\s*kanus-?a|how\s*long\s*do)\b/i.test(q) && /\b(officials?|opisyal|mayor|in\s*office|serve)\b/i.test(q)) ||
    /\b(next\s*(local\s*)?elections?|sunod\s*nga\s*eleksyon|kanus-?a\s*ang\s*eleksyon|when\s*is\s*the\s*(next\s*)?election|when\s*were\s*the\s*(current\s*)?officials\s*elected|kanus-?a\s*gipili)\b/i.test(q)],
];
