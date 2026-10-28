// server/services/businessPermit.js
//
// Business permits: the single source for both the Dialogflow intents
// (scripts/build-dialogflow-intents.mjs) and the chat server's replies, like officials.js.
//
// Sources (October 2026):
//   - The BPLO's printed checklist "2.A For New Applicant" and its "Local Clearances" list
//     (photographed by the capstone team) — the new-permit requirements, word for word.
//   - Capstone interview with a Magallanes municipal official, 28 October 2026: DTI for a
//     sari-sari store, barangay business clearance from the barangay where the business is,
//     the January renewal window and its usual extension, online sellers, and the BFP clearance.
//     Where the interview and the checklist differ (the interview said "SEC for co-ops"), the
//     printed checklist wins: CDA for cooperatives.
//   - Fees, processing time, office location and renewal checklist: carried over unchanged from
//     the answers the bot already gave. Confirm them through the LGU questionnaire (Part 5).

// Every business-permit answer opens this context for FOLLOWUP_LIFESPAN turns (officials.js; 3,
// set on the context by the ZIP build, scripts/build-dialogflow-intents.mjs). While it is
// alive, short follow-ups ("how much?", "pila ka adlaw?", "asa?", "how about online sellers?")
// match the follow-up intents below instead of the fallback. refineIntent() in languageDetect.js
// reads the same context id for its own keyword rescue rules.
export const BUSINESS_CONTEXT = 'business-permit-followup';

const RENEWAL_WINDOW = {
  english:
    'Renewal runs every January, from the first working days of the month until January 20. The Sangguniang Bayan, with the Mayor\'s approval, usually extends it to January 30. If there is no extension, late renewals are penalized starting January 21.',
  bisaya:
    'Ang renewal kada Enero, sugod sa unang mga adlaw sa trabaho sa bulan hangtod Enero 20. Kasagaran gi-extend kini sa Sangguniang Bayan, uban ang pagtugot sa Mayor, hangtod Enero 30. Kung walay extension, ang mag-renew og ulahi pagapenaltyan sugod Enero 21.',
};

const ANSWERS = {
  new: {
    english:
      'Requirements for a NEW business permit (BPLO checklist):\n1. Barangay Business Clearance — from the barangay where your business is located\n2. Community Tax Certificate (Cedula)\n3. Business registration:\n   • DTI — single proprietorship (for example, a sari-sari store)\n   • SEC — corporation\n   • CDA — cooperative\nLocal clearances:\n4. Block tiendas, public market occupants and water refilling stations: go to the MEEDMO\n5. Sanitary Permit / Health Certificate\n6. Zoning Clearance\n7. Assessor\'s Clearance\n8. Municipal Engineering Office clearance\n9. Bureau of Fire Protection (BFP) clearance\n10. MENRO Certification\nYou can ask me how much it costs, how long it takes, or where to apply.',
    bisaya:
      'Mga requirements para sa BAG-ONG business permit (checklist sa BPLO):\n1. Barangay Business Clearance — gikan sa barangay diin nahimutang ang imong negosyo\n2. Community Tax Certificate (Cedula)\n3. Rehistro sa negosyo:\n   • DTI — single proprietorship (pananglitan, sari-sari store)\n   • SEC — corporation\n   • CDA — cooperative\nMga local clearance:\n4. Sa mga block tienda, nag-okupar sa public market, ug water refilling station: adto sa MEEDMO\n5. Sanitary Permit / Health Certificate\n6. Zoning Clearance\n7. Assessor\'s Clearance\n8. Clearance gikan sa Municipal Engineering Office\n9. Clearance gikan sa Bureau of Fire Protection (BFP)\n10. MENRO Certification\nPwede ka mangutana kung pila ang bayad, unsa kadugay, o asa mag-apply.',
  },
  fees: {
    english:
      'Fees are based on your business type, capital investment, or gross receipts — the Business Permits and Licensing Office (BPLO) at the Municipal Hall will provide the exact assessment.',
    bisaya:
      'Ang bayad depende sa klase sa negosyo, kapital, o gross receipts — ang Business Permits and Licensing Office (BPLO) sa Munisipyo ang maghatag sa eksaktong assessment.',
  },
  process: {
    english:
      'Processing a business permit typically takes 1 to 3 working days once all required documents, inspections, and clearances are submitted.',
    bisaya:
      'Ang pagproseso sa business permit kasagarang molungtad og 1 hangtod 3 ka adlaw kung kompleto na ang tanang gikinahanglan nga dokumento ug clearance.',
  },
  location: {
    english:
      'You can submit your application at the Business Permits and Licensing Office (BPLO) on the Ground Floor of the Magallanes Municipal Hall in Poblacion, during office hours.',
    bisaya:
      'Mahimo nimong isumite ang imong aplikasyon sa Business Permits and Licensing Office (BPLO) sa Ground Floor sa Magallanes Municipal Hall sa Poblacion, sa oras sa opisina.',
  },
  renew: {
    english: `${RENEWAL_WINDOW.english}\n\nFor renewal, please prepare: (1) Previous Year Business Permit & Official Receipts, (2) Barangay Clearance for Renewal, (3) Income Tax Return (ITR) or Financial Statements, and (4) Updated Sanitary & Fire Inspection Clearances.`,
    bisaya: `${RENEWAL_WINDOW.bisaya}\n\nPara sa renewal, andama palihug: (1) Daang Business Permit ug resibo, (2) Barangay Clearance for Renewal, (3) ITR o Financial Statement, ug (4) Updated Sanitary ug Fire Inspection Clearance.`,
  },
  deadline: {
    english: `${RENEWAL_WINDOW.english} The BPLO at the Municipal Hall can tell you the exact penalty for a late renewal.`,
    bisaya: `${RENEWAL_WINDOW.bisaya} Ang BPLO sa Munisipyo ang makasulti sa eksaktong penalty sa ulahi nga renewal.`,
  },
  registration: {
    english:
      'Register your business with the agency that matches its type:\n• DTI — single proprietorship, owned by one person (a sari-sari store, carinderia or small shop)\n• SEC — corporation or partnership\n• CDA — cooperative\nThe registration is one of the requirements for the business permit at the BPLO.',
    bisaya:
      'Iparehistro ang imong negosyo sa ahensya nga angay sa klase niini:\n• DTI — single proprietorship, usa ra ka tag-iya (sari-sari store, karinderya o gamay nga tindahan)\n• SEC — corporation o partnership\n• CDA — kooperatiba\nKini nga rehistro usa sa mga requirements sa business permit sa BPLO.',
  },
  barangay: {
    english:
      'Get the Barangay Business Clearance from the barangay where your BUSINESS is located, not where you live — the barangay certifies the business address. For example, if you live in Santo Rosario but your store is in Poblacion, get it from Barangay Poblacion.',
    bisaya:
      'Kuhaa ang Barangay Business Clearance sa barangay diin nahimutang ang imong NEGOSYO, dili sa imong gipuy-an — ang barangay ang mo-certify sa address sa negosyo. Pananglitan, kung nagpuyo ka sa Santo Rosario apan ang imong tindahan naa sa Poblacion, sa Barangay Poblacion ka mokuha.',
  },
  fire: {
    english:
      'Yes. Most businesses need a clearance from the Bureau of Fire Protection (BFP) before the business permit is released — even a small sari-sari store. Only a few kinds of business are exempt; the BPLO can tell you if yours is one of them.',
    bisaya:
      'Oo. Kadaghanan sa negosyo kinahanglan og clearance gikan sa Bureau of Fire Protection (BFP) sa dili pa ma-release ang business permit — bisan gamay nga sari-sari store. Pipila ra ka klase sa negosyo ang exempted; ang BPLO ang makasulti kung apil ang imoha.',
  },
  meedmo: {
    english:
      'Block tiendas, occupants of public spaces such as the public market, and water refilling stations get their clearance from the MEEDMO (Municipal Economic Enterprises Development and Management Office) before applying for the business permit at the BPLO.',
    bisaya:
      'Ang mga block tienda, nag-okupar sa publikong lugar sama sa public market, ug water refilling station mokuha sa ilang clearance sa MEEDMO (Municipal Economic Enterprises Development and Management Office) sa dili pa mag-apply og business permit sa BPLO.',
  },
  online: {
    english:
      'Some online sellers in Magallanes have secured a business permit, but most have not. To find out what your online or home-based business needs, ask the BPLO at the Municipal Hall. A business owned by one person registers with the DTI.',
    bisaya:
      'Naay pipila ka online seller sa Magallanes nga nakakuha na og business permit, apan kadaghanan wala pa. Aron mahibal-an kung unsa ang kinahanglan sa imong online o home-based nga negosyo, pangutana sa BPLO sa Munisipyo. Ang negosyo nga usa ra ang tag-iya magparehistro sa DTI.',
  },
};

// Main intents: each answers one topic and opens the follow-up context.
const MAIN_INTENTS = [
  {
    name: 'permit.business.new.inquire',
    answer: 'new',
    phrases: [
      'How do I get a business permit?', 'What are the requirements for a business permit?', 'Requirements for a new business permit',
      'I want to start a business, what do I need?', 'How to apply for a business permit', 'What do I need to open a sari-sari store?',
      'What are the requirements to open a store?', 'business permit requirements', 'new business permit', 'busness permt requirment',
      'How do I apply for a mayor\'s permit for my business?', 'What documents do I need for a business permit?',
      'I want to open a small carinderia, what permits do I need?', 'Checklist for a new business permit', 'What clearances do I need for a business?',
      'Unsa ang requirements sa business permit?', 'Unsaon pagkuha og business permit?', 'Unsa ang kinahanglan sa bag-ong negosyo?',
      'Gusto ko magtukod og negosyo, unsa akong kinahanglan?', 'Unsa ang requirements para magbukas og sari-sari store?',
      'Unsaon pag-apply og business permit?', 'Mga requirements sa negosyo', 'Unsa ang mga clearance para sa negosyo?',
      'Ano ang requirements sa business permit?', 'Paano kumuha ng business permit?', 'Ano ang kailangan para magbukas ng tindahan?',
    ],
  },
  {
    name: 'permit.business.fees.inquire',
    answer: 'fees',
    phrases: [
      'How much is a business permit?', 'How much does a business permit cost?', 'Business permit fee', 'What are the business permit fees?',
      'How much do I pay for a business permit?', 'How much is the mayor\'s permit for a sari-sari store?', 'How is the business permit fee computed?',
      'business permit price', 'Fee for a new business permit', 'Pila ang bayad sa business permit?', 'Tagpila ang business permit?',
      'Pila ang bayronon sa business permit?', 'Pila bayad sa permit sa negosyo?', 'Pila ang bayad sa sari-sari store nga permit?',
      'Magkano ang business permit?', 'Magkano ang bayad sa business permit?', 'Magkano ang permit ng tindahan?',
    ],
  },
  {
    name: 'permit.business.process.inquire',
    answer: 'process',
    phrases: [
      'How long does it take to get a business permit?', 'How long is the processing of a business permit?', 'Business permit processing time',
      'How many days to process a business permit?', 'When will my business permit be released?', 'How fast can I get a business permit?',
      'business permit processing', 'Can I get my business permit the same day?', 'Pila ka adlaw ang business permit?',
      'Unsa kadugay ang pagproseso sa business permit?', 'Kanus-a ma-release ang business permit?', 'Dugay ba ang business permit?',
      'Pila ka adlaw makuha ang permit sa negosyo?', 'Gaano katagal ang business permit?', 'Ilang araw bago makuha ang business permit?',
      'Kailan makukuha ang business permit?',
    ],
  },
  {
    name: 'permit.business.location.inquire',
    answer: 'location',
    phrases: [
      'Where do I apply for a business permit?', 'Where is the BPLO?', 'Where is the business permit office?', 'Where can I get a business permit?',
      'Which office handles business permits?', 'Where do I submit my business permit application?', 'BPLO location', 'Business Permits and Licensing Office',
      'Where do I go for my mayor\'s permit?', 'Asa mag-apply og business permit?', 'Asa ang BPLO?', 'Asa ang opisina sa business permit?',
      'Asa ko mokuha og business permit?', 'Asa isumite ang business permit?', 'Saan kukuha ng business permit?', 'Saan ang opisina ng BPLO?',
    ],
  },
  {
    name: 'permit.business.renew.inquire',
    answer: 'renew',
    phrases: [
      'How do I renew my business permit?', 'Business permit renewal', 'Requirements for business permit renewal', 'renew business permit',
      'What do I need to renew my business permit?', 'When can I renew my business permit?', 'How to renew a mayor\'s permit',
      'I need to renew my permit for my store', 'Business permit renewal requirements', 'Unsaon pag-renew sa akong business permit?',
      'Unsa ang requirements sa renewal sa business permit?', 'Mag-renew ko sa akong business permit', 'Kanus-a ang renewal sa business permit?',
      'Renewal sa permit sa negosyo', 'Paano mag-renew ng business permit?', 'Ano ang requirements sa renewal ng business permit?',
    ],
  },
  {
    name: 'permit.business.renewal-deadline.inquire',
    answer: 'deadline',
    phrases: [
      'When is the deadline for business permit renewal?', 'What is the last day to renew my business permit?', 'Until when can I renew my business permit?',
      'Is there a penalty for late renewal of business permit?', 'What happens if I renew my business permit late?', 'Is the renewal deadline extended?',
      'Business permit renewal deadline', 'Late renewal penalty', 'Is January 20 the deadline for business permits?', 'Can I still renew in February?',
      'Kanus-a ang deadline sa renewal sa business permit?', 'Hangtod kanus-a ang renewal sa business permit?', 'Naa bay multa kung ma-late ko og renew?',
      'Ma-penaltyan ba ko kung ulahi ko mag-renew?', 'Gi-extend ba ang renewal sa business permit?', 'Kailan ang deadline ng renewal ng business permit?',
      'May multa ba kapag late ang renewal?',
    ],
  },
  {
    name: 'permit.business.registration.inquire',
    answer: 'registration',
    phrases: [
      'Do I register with DTI or SEC?', 'Where do I register my business name?', 'Do I need DTI registration for a sari-sari store?',
      'How do I register a cooperative?', 'Where do I register a corporation?', 'DTI or SEC for a small business?', 'What is DTI registration for?',
      'Is SEC registration needed for a sari-sari store?', 'Where do cooperatives register?', 'Single proprietorship registration',
      'DTI ba o SEC ang akong adtoan?', 'Asa iparehistro ang ngalan sa akong negosyo?', 'Kinahanglan ba og DTI ang sari-sari store?',
      'Asa magparehistro ang kooperatiba?', 'Asa magparehistro ang corporation?', 'Sa DTI ba o sa SEC magparehistro?', 'Saan magpaparehistro ng negosyo?',
      'Kailangan ba ng DTI ang sari-sari store?',
    ],
  },
  {
    name: 'permit.business.barangay-clearance.inquire',
    answer: 'barangay',
    phrases: [
      'Where do I get a barangay business clearance?', 'Do I get the barangay clearance where I live or where my business is?',
      'I live in Santo Rosario but my store is in Poblacion, where do I get the barangay clearance?', 'Barangay clearance for business',
      'Which barangay issues my business clearance?', 'My business is in another barangay, where do I get clearance?', 'Barangay business clearance',
      'Business clearance from the barangay', 'Is the barangay clearance for business based on my residence?', 'Asa ko mokuha og barangay business clearance?',
      'Sa barangay ba nako mokuha o sa barangay sa akong negosyo?', 'Nagpuyo ko sa Santo Rosario pero ang tindahan sa Poblacion, asa ko mokuha og clearance?',
      'Asa mokuha og barangay clearance para sa negosyo?', 'Barangay clearance para sa tindahan', 'Saan kukuha ng barangay business clearance?',
      'Barangay clearance para sa negosyo, saan?',
    ],
  },
  {
    name: 'permit.business.fire-safety.inquire',
    answer: 'fire',
    phrases: [
      'Do I need a BFP clearance for my business?', 'Do I need a fire safety inspection for a sari-sari store?', 'Is a fire clearance required for a business permit?',
      'Is the BFP clearance needed even for a small store?', 'Fire safety inspection certificate for business', 'Are any businesses exempt from the BFP clearance?',
      'BFP requirement for business permit', 'Do small stores need a fire permit?', 'Kinahanglan ba og BFP clearance ang akong negosyo?',
      'Need ba ug fire safety inspection para sa sari-sari store?', 'Kinahanglan ba og fire clearance bisan gamay ra nga tindahan?', 'Apil ba ang sari-sari store sa BFP?',
      'Naa bay negosyo nga dili kinahanglan og BFP clearance?', 'Kailangan ba ng BFP clearance ang sari-sari store?', 'Kailangan ba ng fire safety inspection sa negosyo?',
      'Fire clearance para sa tindahan',
    ],
  },
  {
    name: 'permit.business.meedmo.inquire',
    answer: 'meedmo',
    phrases: [
      'Where do I get clearance for a water refilling station?', 'I want to open a water refilling station', 'What is the MEEDMO?',
      'How do I get a stall at the public market?', 'I want to sell at the public market, where do I go?', 'Block tienda business permit',
      'Clearance for a market stall', 'Who handles the public market stalls?', 'Where do market vendors get clearance?', 'MEEDMO clearance',
      'Asa mokuha og clearance para sa water refilling station?', 'Gusto ko magbaligya sa merkado, asa ko moadto?', 'Unsaon pagkuha og puesto sa merkado?',
      'Asa ang clearance sa block tienda?', 'Unsa ang MEEDMO?', 'Paano kumuha ng puwesto sa palengke?', 'Saan kukuha ng clearance para sa water refilling station?',
    ],
  },
  {
    name: 'permit.business.online.inquire',
    answer: 'online',
    phrases: [
      'Do online sellers need a business permit?', 'I sell food online, do I need a permit?', 'Do I need a business permit for my online shop?',
      'Is a business permit required for home-based businesses?', 'Do Facebook sellers need a permit?', 'I sell on Shopee, do I need a business permit?',
      'Business permit for online business', 'Do I need a permit to sell online?', 'Online selling permit', 'Kinahanglan ba og business permit ang online seller?',
      'Nagbaligya ko og pagkaon online, kinahanglan ba ko og permit?', 'Kinahanglan ba og permit ang online nga negosyo?', 'Online business permit sa Magallanes',
      'Naa bay permit ang mga online seller?', 'Kailangan ba ng business permit ang online seller?', 'Kailangan ba ng permit ang online na negosyo?',
    ],
  },
];

// Follow-up intents: short questions that only make sense inside a business-permit thread.
// They match only while BUSINESS_CONTEXT is alive, and resolveBusinessFollowup() turns each into
// the main intent whose answer it is asking for.
const FOLLOWUP_INTENTS = [
  {
    name: 'permit.business.followup.fees.inquire',
    target: 'permit.business.fees.inquire',
    phrases: [
      'How much?', 'How much is it?', 'How much does it cost?', 'How much will I pay?', 'What is the fee?', 'how much are the fees?', 'Is it expensive?',
      'Pila?', 'Pila man?', 'Tagpila?', 'Pila ang bayad?', 'Pila bayad ana?', 'Mahal ba?', 'Magkano?', 'Magkano po?', 'Magkano ang bayad?',
    ],
  },
  {
    name: 'permit.business.followup.process.inquire',
    target: 'permit.business.process.inquire',
    phrases: [
      'How long?', 'How long does it take?', 'how long is the processing time?', 'How many days?', 'When will it be released?', 'Is it fast?',
      'Same day?', 'Pila ka adlaw?', 'Unsa kadugay?', 'Dugay ba?', 'Kanus-a ma-release?', 'Pila ka adlaw ang processing?', 'Gaano katagal?',
      'Ilang araw?', 'Kailan makukuha?',
    ],
  },
  {
    name: 'permit.business.followup.location.inquire',
    target: 'permit.business.location.inquire',
    phrases: [
      'Where?', 'Where do I go?', 'Where do I apply?', 'where is the office located to apply?', 'Which office?', 'Where do I submit it?',
      'Where is that office?', 'Asa?', 'Asa man?', 'Asa ko moadto?', 'Asa mag-apply?', 'Asa isumite?', 'Asa dapit?', 'Saan?', 'Saan po?',
      'Saan mag-apply?',
    ],
  },
  {
    name: 'permit.business.followup.requirements.inquire',
    target: 'permit.business.new.inquire',
    phrases: [
      'What are the requirements?', 'What do I need?', 'What documents do I need?', 'What should I bring?', 'Requirements?', 'And the requirements?',
      'What clearances?', 'Unsa ang requirements?', 'Unsa akong kinahanglan?', 'Unsa ang dad-on?', 'Unsa ang mga dokumento?', 'Requirements pud?',
      'Ano ang requirements?', 'Ano ang kailangan?', 'Ano ang dadalhin?',
    ],
  },
  {
    name: 'permit.business.followup.renewal.inquire',
    target: 'permit.business.renew.inquire',
    phrases: [
      'How about renewal?', 'And for renewal?', 'What if I am renewing?', 'How do I renew it?', 'What about renewing?', 'Renewal?', 'For renewal naman?',
      'Unsaon pag-renew?', 'Unsaon kung mag-renew?', 'Sa renewal?', 'Kung renewal?', 'Paano mag-renew?', 'Paano kung renewal?', 'Renewal pud?',
      'How about renewing next year?',
    ],
  },
  {
    name: 'permit.business.followup.deadline.inquire',
    target: 'permit.business.renewal-deadline.inquire',
    phrases: [
      'When is the deadline?', 'Until when?', 'What is the last day?', 'Is there a penalty?', 'What if I am late?', 'Is it extended?', 'Deadline?',
      'Kanus-a ang deadline?', 'Hangtod kanus-a?', 'Naa bay multa?', 'Unsa kung ma-late ko?', 'Gi-extend ba?', 'Kailan ang deadline?', 'May multa ba?',
      'Hanggang kailan?',
    ],
  },
  {
    name: 'permit.business.followup.registration.inquire',
    target: 'permit.business.registration.inquire',
    phrases: [
      'How about a cooperative?', 'What if it is a corporation?', 'DTI or SEC?', 'Where do I register it?', 'And for a coop?', 'What about a partnership?',
      'Is DTI enough?', 'Sa kooperatiba?', 'Kung corporation?', 'DTI ba o SEC?', 'Asa iparehistro?', 'Kung coop?', 'Paano kung kooperatiba?',
      'Saan ipaparehistro?', 'Kung partnership?',
    ],
  },
  {
    name: 'permit.business.followup.online.inquire',
    target: 'permit.business.online.inquire',
    phrases: [
      'What if I only sell online?', 'How about online sellers?', 'Online lang ko', 'And for online selling?', 'Even if it is just online?',
      'What about a home-based business?', 'Kung online lang?', 'Online lang man akong baligya', 'Sa online seller?', 'Online pud?',
      'Kahit online lang?', 'Paano kung online lang?', 'How about Facebook selling?', 'Kung sa balay ra?', 'Home-based lang',
    ],
  },
  {
    name: 'permit.business.followup.fire-safety.inquire',
    target: 'permit.business.fire-safety.inquire',
    phrases: [
      'Do I need a BFP clearance too?', 'What about the fire clearance?', 'Even a sari-sari store?', 'Even a small store?', 'BFP too?',
      'Is the fire inspection needed?', 'Bisan sari-sari store lang?', 'Bisan gamay lang nga tindahan?', 'Apil ba ang BFP?', 'Kinahanglan pud og BFP?',
      'Kahit sari-sari store lang?', 'Kailangan din ba ng BFP?', 'How about the BFP?', 'Fire safety pud?', 'Apil ba ang tindahan?',
    ],
  },
];

// More Bisaya, the way residents actually type it — casual, short, unpunctuated, "unsa-on" and
// "kanusa" spellings, English mixed in. Most Magallanes residents ask in Bisaya, so every intent
// carries at least as many Bisaya phrasings as English ones. Kept apart from the lists above so
// the balance per intent is easy to see.
const BISAYA_PHRASES = {
  'permit.business.new.inquire': [
    'unsay requirements sa permit sa negosyo', 'unsa mga kinahanglan sa bag-ong negosyo', 'unsaon pag kuha og mayors permit',
    'requirements para sari sari store', 'magbukas ko og tindahan unsa akong kinahanglanon', 'unsa ang dad-on para sa business permit',
    'unsa-on pag apply og business permit', 'gusto ko mag negosyo unsa requirements', 'unsa mga clearance sa business permit',
    'bag-o pa ko mag negosyo unsa akong buhaton',
  ],
  'permit.business.fees.inquire': [
    'pila bayad permit', 'pila ang bayronon sa permit sa tindahan', 'tag pila ang mayors permit', 'pila magasto sa business permit',
    'mahal ba ang business permit', 'pila bayad sa bag-ong permit sa negosyo', 'pila ang bayad kung sari-sari store lang',
  ],
  'permit.business.process.inquire': [
    'kanus-a mahuman ang business permit', 'pila ka adlaw ma release ang permit', 'dugay ba makuha ang permit sa negosyo',
    'unsa ka dugay ang business permit', 'karon dayon ba makuha ang business permit', 'pila ka adlaw processing sa permit',
  ],
  'permit.business.location.inquire': [
    'asa kuha business permit', 'asa dapit ang BPLO', 'asa ang opisina sa permit sa negosyo', 'asa ko mag apply og mayors permit',
    'asa mo-submit sa business permit', 'asa nga opisina ang business permit', 'naa ba sa munisipyo ang BPLO',
  ],
  'permit.business.renew.inquire': [
    'unsaon pag renew permit', 'mag renew ko sa permit sa tindahan', 'requirements sa pag renew sa business permit',
    'unsa dad-on sa renewal sa permit', 'renewal sa mayors permit unsaon', 'kanus-a mag renew sa permit sa negosyo',
  ],
  'permit.business.renewal-deadline.inquire': [
    'hangtod kanus-a pwede mag renew sa permit', 'kanusa deadline sa renewal sa business permit', 'naa bay penalty kung late ko mag renew',
    'pila ang multa kung ulahi mag renew', 'gi extend ba ang renewal sa permit karon', 'pwede pa ba mag renew sa pebrero',
    'unsa mahitabo kung dili ko maka renew sa enero',
  ],
  'permit.business.registration.inquire': [
    'sa DTI ba ko magparehistro', 'asa magparehistro og negosyo', 'kinahanglan pa ba og SEC', 'DTI o SEC para sa tindahan',
    'asa iparehistro ang kooperatiba', 'unsaon pagparehistro sa ngalan sa negosyo', 'DTI ba ang sari-sari store',
  ],
  'permit.business.barangay-clearance.inquire': [
    'asa kuha barangay clearance para sa negosyo', 'sa among barangay ba ko mokuha og clearance sa tindahan',
    'lahi ang barangay sa akong tindahan asa ko mokuha clearance', 'barangay business clearance asa kuhaon',
    'diin nga barangay mokuha og clearance sa negosyo', 'sa barangay sa negosyo ba o sa akong gipuy-an ang clearance',
  ],
  'permit.business.fire-safety.inquire': [
    'kinahanglan pa ba og BFP ang tindahan', 'need ba ug BFP ang sari sari store', 'apil ba ang gamay nga tindahan sa fire inspection',
    'unsaon pagkuha og fire safety clearance', 'asa kuha BFP clearance sa negosyo', 'naa bay negosyo nga exempted sa BFP',
  ],
  'permit.business.meedmo.inquire': [
    'asa mokuha og puesto sa merkado', 'unsaon pag apply og pwesto sa palengke', 'asa clearance sa water refilling',
    'mag negosyo ko og water refilling asa ko moadto', 'asa ang MEEDMO', 'unsaon pagbaligya sa merkado', 'block tienda asa ang clearance',
  ],
  'permit.business.online.inquire': [
    'online seller ko kinahanglan ba ko og permit', 'nagbaligya ko sa facebook need ba og business permit', 'kinahanglan ba og permit kung online ra',
    'online lang akong negosyo kinahanglan ba permit', 'nagbaligya ko og pagkaon online need ba permit', 'home based lang akong negosyo need ba permit',
  ],
  'permit.business.followup.fees.inquire': ['pila bayad?', 'pila man ang bayad?', 'tag pila man?', 'pila magasto?', 'mahal?', 'pila ang bayronon?'],
  'permit.business.followup.process.inquire': ['dugay?', 'pila ka adlaw man?', 'kanus-a mahuman?', 'karon dayon?', 'unsa ka dugay man?'],
  'permit.business.followup.location.inquire': ['asa man ko moadto?', 'asa kuhaon?', 'asa ang opisina?', 'asa man na dapit?'],
  'permit.business.followup.requirements.inquire': ['unsa man ang requirements?', 'unsay dad-on?', 'unsa may kinahanglan?', 'unsa pa ang kinahanglan?', 'unsa mga papeles?'],
  'permit.business.followup.renewal.inquire': ['unsaon man pag renew?', 'kung mag renew ko?', 'sa renewal unsa?', 'unsay dad-on sa renewal?', 'pag renew?'],
  'permit.business.followup.deadline.inquire': ['kanusa man ang deadline?', 'hangtod kanus-a man?', 'naa bay penalty?', 'pila ang multa?', 'kung ma ulahi ko?', 'extended ba?'],
  'permit.business.followup.registration.inquire': ['sa DTI ba?', 'asa man iparehistro?', 'kung kooperatiba man?', 'SEC ba?', 'kung corporation man?', 'DTI ra ba?'],
  'permit.business.followup.online.inquire': ['kung sa facebook ra?', 'online ra man ko', 'kung sa balay ra ko magbaligya?', 'kung online selling?', 'sa shopee ra man'],
  'permit.business.followup.fire-safety.inquire': ['apil pa ba ang BFP?', 'bisan gamay nga tindahan?', 'kinahanglan ba gyud og BFP?', 'BFP pud?', 'sari sari store pud?'],
};

const withBisaya = (name, phrases) => [...phrases, ...(BISAYA_PHRASES[name] || [])];

export const BUSINESS_INTENTS = [
  ...MAIN_INTENTS.map(({ name, answer, phrases }) => ({
    name,
    phrases: withBisaya(name, phrases),
    outputContexts: [BUSINESS_CONTEXT],
    ...ANSWERS[answer],
  })),
  // A follow-up's own reply is never shown — it is resolved to its target first — but the agent
  // still needs text for it, and the ZIP build needs one. It keeps the thread alive too.
  ...FOLLOWUP_INTENTS.map(({ name, target, phrases }) => ({
    name,
    phrases: withBisaya(name, phrases),
    inputContexts: [BUSINESS_CONTEXT],
    outputContexts: [BUSINESS_CONTEXT],
    ...ANSWERS[MAIN_INTENTS.find((m) => m.name === target).answer],
  })),
];

const FOLLOWUP_TARGET = Object.fromEntries(FOLLOWUP_INTENTS.map((f) => [f.name, f.target]));

/**
 * Turns a business-permit follow-up intent into the main intent whose answer it asks for, so the
 * reply, the chat log and the session's lastIntent all name the real topic.
 * @param {string} intent
 * @returns {string}
 */
export const resolveBusinessFollowup = (intent) => FOLLOWUP_TARGET[intent] || intent;

/** Intent → { english, bisaya }, in the shape responses.js's INTENT_RESPONSES uses. */
export const BUSINESS_RESPONSES = Object.fromEntries(
  MAIN_INTENTS.map(({ name, answer }) => [name, ANSWERS[answer]])
);
