// server/services/officials.js
//
// LGU officials directory, as supplied by the Municipality of Magallanes ("Directory LGU
// Magallanes", 22 Oct 2026). Single source of truth for two things:
//   1. the Dialogflow intents and training phrases — scripts/build-dialogflow-intents.mjs
//      turns OFFICIALS_INTENTS into an importable agent ZIP;
//   2. the chat server's replies — responses.js merges OFFICIALS_RESPONSES, so the Bisaya
//      answer exists even though the agent is always queried in English.
// When the directory changes, edit the data below, rerun the build script, and re-import.

const MAYOR = { name: 'Cesar C. Cumba, Jr.', email: 'mayorsoffice2019.magallanesadn@gmail.com' };
const VICE_MAYOR = { name: 'Reynaldo T. Salon', email: '17sbmagallanes@gmail.com' };
export const SB_EMAIL = '17sbmagallanes@gmail.com';

// From the Mayor's Office contact card supplied by the LGU (Oct 2026). Only the contact person
// and email the card marks for public use are published; the other staff numbers and personal
// email on the card are left out on purpose.
export const MAYORS_OFFICE = {
  email: MAYOR.email,
  contactPerson: 'Cheryl S. Altura',
  phone: '0948-623-6977',
};
const MAYORS_OFFICE_CALL = `call the Mayor's Office contact person, ${MAYORS_OFFICE.contactPerson}, at ${MAYORS_OFFICE.phone}`;
const MAYORS_OFFICE_CALL_CEB = `tawag sa contact person sa Mayor's Office nga si ${MAYORS_OFFICE.contactPerson} sa ${MAYORS_OFFICE.phone}`;
const SB_MEMBERS = [
  'Keefe Blue R. Leonar',
  'James T. Cuta',
  'Martina A. Castrodes',
  'Carlito C. Cumba',
  'Amanoden A. Mulok',
  'James M. Dela Fuerta',
  'Galo T. Torralba',
  'Rolando C. Dapar',
];

// `titles` are what a person is called ("the treasurer"); `offices` are what the office is
// called ("the treasurer's office"). They take different question shapes, so they are kept apart.
const FUNCTIONARIES = [
  {
    key: 'budget-lcr',
    name: 'Marifi T. Casaña',
    role: 'Municipal Budget Officer and Local Civil Registrar (designate)',
    titles: ['Municipal Budget Officer', 'budget officer', 'Local Civil Registrar', 'civil registrar', 'LCR'],
    offices: ['Municipal Budget Office', 'budget office', 'Local Civil Registry Office', 'LCRO'],
  },
  {
    key: 'accounting',
    name: 'Aura R. Cadenas',
    role: 'Municipal Accountant (Municipal Accounting Office)',
    titles: ['Municipal Accountant', 'accountant'],
    offices: ['Municipal Accounting Office', 'accounting office'],
  },
  {
    key: 'hrmo',
    name: 'Jessie M. Rodas',
    role: 'head of the Human Resource Management Office (HRMO)',
    titles: ['HRMO', 'HR officer', 'Human Resource Management Officer'],
    offices: ['Human Resource Management Office', 'HR office'],
  },
  {
    key: 'mpdo-mdrrmo',
    name: 'EnP. Alexander Ariel A. Eleazar',
    role: 'head of the Municipal Planning and Development Office (MPDO) and the Municipal Disaster Risk Reduction and Management Office (MDRRMO)',
    titles: ['MPDC', 'planning officer', 'MDRRM officer', 'MDRRMO head'],
    offices: ['Municipal Planning and Development Office', 'MPDO', 'MDRRMO', 'disaster risk reduction office'],
  },
  {
    key: 'treasurer',
    name: 'Geymar S. Monsales',
    role: 'Municipal Treasurer',
    titles: ['Municipal Treasurer', 'treasurer', 'tesorero'],
    offices: ["Municipal Treasurer's Office", "treasurer's office", 'MTO', 'treasury', 'treasury office'],
  },
  {
    key: 'mswdo',
    name: 'Michael S. Atega',
    role: 'head of the Municipal Social Welfare and Development Office (MSWDO)',
    titles: ['MSWDO', 'MSWD officer', 'social welfare officer'],
    offices: ['Municipal Social Welfare and Development Office', 'MSWD office', 'social welfare office'],
  },
  {
    key: 'meedmo',
    name: 'Aljane B. Inguillo',
    role: 'head of the Municipal Economic Enterprises Development and Management Office (MEEDMO), designate',
    titles: ['MEEDMO head', 'economic enterprise officer'],
    offices: ['Municipal Economic Enterprises Development and Management Office', 'MEEDMO', 'economic enterprise office'],
  },
  {
    key: 'health',
    name: 'Dr. Breech Martin Pabas',
    role: 'Municipal Health Officer',
    titles: ['Municipal Health Officer', 'MHO', 'health officer', 'municipal doctor'],
    offices: ['Rural Health Unit', 'RHU', 'municipal health office'],
  },
  {
    key: 'engineering',
    name: 'Engr. Adonis C. Dispo',
    role: 'Municipal Engineer (Municipal Engineering Office)',
    titles: ['Municipal Engineer', 'engineer'],
    offices: ['Municipal Engineering Office', 'engineering office'],
  },
  {
    key: 'menro',
    name: 'Rey S. Jaudian',
    role: 'head of the Municipal Environment and Natural Resources Office (MENRO), designate',
    titles: ['MENRO', 'environment officer', 'MENR officer'],
    offices: ['Municipal Environment and Natural Resources Office', 'environment office'],
  },
  {
    key: 'agriculture',
    name: 'Roselyn R. Morondoz',
    role: 'Municipal Agriculturist (Municipal Agriculture Office)',
    titles: ['Municipal Agriculturist', 'agriculturist', 'agriculture officer'],
    offices: ['Municipal Agriculture Office', 'agriculture office', 'MAO'],
  },
  {
    key: 'assessor',
    name: 'Norma C. Sarigumba',
    role: 'Municipal Assessor',
    titles: ['Municipal Assessor', 'assessor'],
    offices: ["Municipal Assessor's Office", "assessor's office"],
  },
  {
    key: 'gso',
    name: 'Emmanuel A. Lavador',
    role: 'General Services Officer (General Services Office)',
    titles: ['General Services Officer', 'GSO head'],
    offices: ['General Services Office', 'GSO'],
  },
];

const BARANGAY_CAPTAINS = [
  { key: 'buhang', barangay: 'Buhang', aliases: ['Buhang'], name: 'Anecita R. Loja' },
  { key: 'caloc-an', barangay: 'Caloc-an', aliases: ['Caloc-an', 'Calocan'], name: 'Julius C. Perang' },
  { key: 'poblacion', barangay: 'Poblacion', aliases: ['Poblacion'], name: 'Cheryl M. Erro' },
  { key: 'marcos', barangay: 'Marcos', aliases: ['Marcos'], name: 'Victor D. Custan' },
  { key: 'sto-rosario', barangay: 'Santo Rosario', aliases: ['Santo Rosario', 'Sto. Rosario'], name: 'Cleopatra C. Roces' },
  { key: 'sto-nino', barangay: 'Santo Niño', aliases: ['Santo Niño', 'Sto. Niño', 'Santo Nino'], name: 'Allan C. Anunciado' },
  { key: 'guiasan', barangay: 'Guiasan', aliases: ['Guiasan'], name: 'Armando T. Batiancila' },
  { key: 'taod-oy', barangay: 'Taod-oy', aliases: ['Taod-oy', 'Taodoy'], name: 'Beinvinido P. Eroa' },
];

// --- Training-phrase templates (English + Bisaya, matching how the rest of the agent is trained) ---

const TITLE_TEMPLATES = [
  'Who is the {x}?',
  'Who is the {x} of Magallanes?',
  'Who is the current {x}?',
  'Name of the {x}',
  'Kinsa ang {x}?',
  'Kinsay {x} sa Magallanes?',
  'Unsa ngalan sa {x}?',
];

const OFFICE_TEMPLATES = [
  'Who is the head of the {x}?',
  'Who heads the {x}?',
  'Who is in charge of the {x}?',
  '{x} head',
  'Kinsa ang head sa {x}?',
  'Kinsay nangulo sa {x}?',
  'Kinsa ang in-charge sa {x}?',
];

const BARANGAY_TEMPLATES = [
  'Who is the barangay captain of {x}?',
  'Who is the punong barangay of {x}?',
  'Who is the barangay chairman of {x}?',
  'Who is the captain of barangay {x}?',
  'Who leads barangay {x}?',
  'Who is the barangay head of {x}?',
  '{x} barangay captain',
  'Brgy. {x} captain',
  'Barangay {x} chairman',
  'Kinsa ang kapitan sa {x}?',
  'Kinsay kapitan sa barangay {x}?',
  'Kinsa ang punong barangay sa {x}?',
  'Kinsa ang nangulo sa barangay {x}?',
  'Unsa ngalan sa kapitan sa {x}?',
  'Kapitan sa {x}',
  'Kinsa man ang kapitan sa {x} karon?',
];

/** Fills every template with every alias, dropping duplicates. */
function expand(templates, aliases) {
  const out = [];
  for (const t of templates) {
    for (const a of aliases) out.push(t.replace('{x}', a));
  }
  return [...new Set(out)];
}

const list = (names) => names.map((n, i) => `${i + 1}. ${n}`).join('\n');

// Ends a sentence on a name without doubling the period of "Jr." / "Sr.".
const sentence = (name) => (name.endsWith('.') ? name : `${name}.`);

// --- Intents ---

const BASE_INTENTS = [
  {
    name: 'officials.mayor.inquire',
    phrases: [
      'Who is the mayor of Magallanes?', 'Who is the mayor?', 'Who is the current municipal mayor?',
      'Name of the mayor', 'Who is the local chief executive?', 'Who is the LCE of Magallanes?',
      'Mayor of Magallanes', 'Who heads the municipality?', 'Who runs the municipal government?',
      'How can I contact the mayor?', "What is the email of the mayor's office?", "Mayor's office email address",
      'I want to email the mayor', 'Kinsa ang mayor sa Magallanes?', 'Kinsa ang mayor karon?',
      'Kinsay mayor sa atong lungsod?', 'Unsa ang ngalan sa mayor?', 'Unsa ang email sa opisina sa mayor?',
      'Unsaon pagkontak sa mayor?', 'Gusto ko mo-email sa mayor', 'Kinsa ang local chief executive sa Magallanes?',
      'Kinsa ang alkalde sa Magallanes?',
    ],
    english: `The Local Chief Executive (Municipal Mayor) of Magallanes is Hon. ${sentence(MAYOR.name)} You can email the Mayor's Office at ${MAYOR.email} or ${MAYORS_OFFICE_CALL}.`,
    bisaya: `Ang Local Chief Executive (Mayor) sa Magallanes kay si Hon. ${sentence(MAYOR.name)} Pwede ka mo-email sa Mayor's Office sa ${MAYOR.email} o ${MAYORS_OFFICE_CALL_CEB}.`,
  },
  {
    name: 'officials.vicemayor.inquire',
    phrases: [
      'Who is the vice mayor?', 'Who is the vice mayor of Magallanes?', 'Name of the vice mayor',
      'Who is the vice-mayor?', 'Vice mayor of Magallanes', 'Who presides over the Sangguniang Bayan?',
      'Who is the presiding officer of the SB?', 'How do I contact the vice mayor?', 'Email of the vice mayor',
      'Who is the current vice mayor?', 'Kinsa ang vice mayor?', 'Kinsa ang bise mayor sa Magallanes?',
      'Kinsay bise alkalde sa Magallanes?', 'Unsa ang ngalan sa vice mayor?', 'Unsaon pagkontak sa vice mayor?',
      'Unsa ang email sa vice mayor?', 'Kinsa ang nangulo sa Sangguniang Bayan?', 'Bise mayor sa Magallanes',
    ],
    english: `The Vice Mayor of Magallanes is Hon. ${VICE_MAYOR.name}, who presides over the Sangguniang Bayan. You can email the office at ${VICE_MAYOR.email}.`,
    bisaya: `Ang Vice Mayor sa Magallanes kay si Hon. ${VICE_MAYOR.name}, ang nangulo sa Sangguniang Bayan. Pwede ka mo-email sa ${VICE_MAYOR.email}.`,
  },
  // Former officials. The answers are built live from the officials table (rows with
  // is_current = false — see liveContent.js), so history added in Admin → Officials is picked up
  // automatically; the text below is only the fallback when the database can't be reached.
  {
    name: 'officials.former.mayors.inquire',
    phrases: [
      'Who were the former mayors of Magallanes?', 'List of former mayors', 'Who was the previous mayor?',
      'Who was the mayor before?', 'Who was the first mayor of Magallanes?', 'History of mayors of Magallanes',
      'Past mayors of Magallanes', 'Who was the mayor in 2015?', 'Who was mayor in 1990?',
      'Who were the mayors before Cumba?', 'How many mayors has Magallanes had?', 'Former municipal mayors',
      'Kinsa ang mga kanhing mayor sa Magallanes?', 'Kinsa ang mayor kaniadto?', 'Kinsa ang nahimong mayor sa Magallanes?',
      'Kinsa ang una nga mayor sa Magallanes?', 'Kinsa ang mayor niadtong 2010?', 'Lista sa mga kanhing mayor',
      'Kinsa ang mayor sa wala pa si Cumba?', 'Kinsa ang miaging mayor?', 'Sino ang dating mayor ng Magallanes?',
    ],
    english: "I can't reach the officials records right now. Please see the Officials page for the list of former mayors.",
    bisaya: 'Dili nako maabot ang records sa mga opisyal karon. Palihug tan-awa ang Officials page para sa lista sa mga kanhing mayor.',
  },
  {
    name: 'officials.former.vicemayors.inquire',
    phrases: [
      'Who were the former vice mayors of Magallanes?', 'List of former vice mayors', 'Who was the previous vice mayor?',
      'Who was the vice mayor before?', 'Who was the first vice mayor?', 'Past vice mayors of Magallanes',
      'Who was the vice mayor in 2015?', 'History of vice mayors', 'Former vice mayors',
      'Kinsa ang mga kanhing bise mayor?', 'Kinsa ang vice mayor kaniadto?', 'Kinsa ang nahimong vice mayor sa Magallanes?',
      'Kinsa ang una nga vice mayor?', 'Kinsa ang vice mayor niadtong 2010?', 'Lista sa mga kanhing vice mayor',
      'Kinsa ang miaging bise alkalde?', 'Sino ang dating vice mayor?',
    ],
    english: "I can't reach the officials records right now. Please see the Officials page.",
    bisaya: 'Dili nako maabot ang records sa mga opisyal karon. Palihug tan-awa ang Officials page.',
  },
  {
    name: 'officials.sb.inquire',
    phrases: [
      'Who are the members of the Sangguniang Bayan?', 'Who are the councilors of Magallanes?', 'List of SB members',
      'Who are the municipal councilors?', 'Sangguniang Bayan members', 'Who sits in the municipal council?',
      'Names of the councilors', 'Who are the SB members?', 'Who are the konsehal?',
      'How do I contact the Sangguniang Bayan?', 'What is the email of the SB office?', 'Who are the legislators of Magallanes?',
      'Kinsa ang mga konsehal sa Magallanes?', 'Kinsa-kinsa ang miyembro sa Sangguniang Bayan?', 'Unsa ang mga ngalan sa konsehal?',
      'Lista sa mga SB members', 'Unsaon pagkontak sa Sangguniang Bayan?', 'Unsa ang email sa SB?',
      'Kinsa ang mga konsehal karon?',
    ],
    english: `The members of the Sangguniang Bayan of Magallanes are:\n${list(SB_MEMBERS.map((n) => `Hon. ${n}`))}\n\nThe Vice Mayor, Hon. ${VICE_MAYOR.name}, presides over the Sangguniang Bayan. Email: ${SB_EMAIL}`,
    bisaya: `Ang mga miyembro sa Sangguniang Bayan sa Magallanes:\n${list(SB_MEMBERS.map((n) => `Hon. ${n}`))}\n\nAng Vice Mayor nga si Hon. ${VICE_MAYOR.name} ang nangulo sa Sangguniang Bayan. Email: ${SB_EMAIL}`,
  },
  {
    name: 'officials.directory.inquire',
    phrases: [
      'Who are the officials of Magallanes?', 'List of municipal officials', 'Who are the LGU officials?',
      'Show me the directory of officials', 'Who are the department heads?', 'List of department heads',
      'Who are the heads of offices?', 'LGU directory', 'Municipal officials directory',
      'Who are the local functionaries?', 'Kinsa ang mga opisyal sa Magallanes?', 'Lista sa mga opisyal sa munisipyo',
      'Kinsa-kinsa ang mga department head?', 'Kinsa ang mga hepe sa mga opisina?', 'Directory sa LGU',
      'Mga opisyal sa lungsod', 'Kinsa ang nagdumala sa mga opisina sa munisipyo?', 'Who works in the municipal government?',
    ],
    english: `Municipal officials of Magallanes:\nMayor: Hon. ${MAYOR.name}\nVice Mayor: Hon. ${VICE_MAYOR.name}\n\nDepartment heads:\n${FUNCTIONARIES.map((f) => `• ${f.role}: ${f.name}`).join('\n')}\n\nYou can also ask about the Sangguniang Bayan members or a barangay captain.`,
    bisaya: `Mga opisyal sa Magallanes:\nMayor: Hon. ${MAYOR.name}\nVice Mayor: Hon. ${VICE_MAYOR.name}\n\nMga department head:\n${FUNCTIONARIES.map((f) => `• ${f.role}: ${f.name}`).join('\n')}\n\nPwede sad ka mangutana bahin sa mga konsehal (Sangguniang Bayan) o sa kapitan sa usa ka barangay.`,
  },
  // The structure itself follows the Local Government Code (RA 7160): the Mayor heads the
  // executive branch and the municipal offices; the Sangguniang Bayan is presided over by the
  // Vice Mayor, with the elected members plus the Liga ng mga Barangay and SK Federation
  // presidents as ex officio members (Sec. 446). Names come from the directory above.
  {
    name: 'officials.structure.inquire',
    phrases: [
      'What is the organizational structure of the LGU?', 'Organizational chart of Magallanes', 'How is the municipal government organized?',
      'Who is under the mayor?', 'Structure of the municipal officials', 'Org chart of the municipality', 'What offices are under the mayor?',
      'Hierarchy of municipal officials', 'Who heads the executive and the legislative branch?', 'Organizational structure of Magallanes',
      'Unsa ang istruktura sa munisipyo?', 'Unsa ang organizational structure sa LGU?', 'Kinsa ang ubos sa mayor?',
      'Giunsa pag-organisar ang gobyerno sa lungsod?', 'Unsa ang mga opisina ubos sa mayor?', 'org chart sa munisipyo',
      'istruktura sa mga opisyal', 'unsa ang posisyon sa mga opisyal sa munisipyo', 'pagkahan-ay sa mga opisyal sa lungsod',
      'kinsa ang nagdumala sa executive ug legislative', 'Ano ang organizational structure ng munisipyo?',
    ],
    english: `How the Magallanes municipal government is organized:\n\nExecutive — the Municipal Mayor, Hon. ${MAYOR.name}, heads the executive branch and the municipal offices:\n${FUNCTIONARIES.map((f) => `• ${f.role}: ${f.name}`).join('\n')}\n\nLegislative — the Sangguniang Bayan, presided over by the Vice Mayor, Hon. ${VICE_MAYOR.name}, with ${SB_MEMBERS.length} elected members (${SB_MEMBERS.join(', ')}), plus the Liga ng mga Barangay president and the SK Federation president as ex officio members.\n\nBarangays — each of the 8 barangays is led by a Punong Barangay.\n\nThe Officials page of this website shows the structure as a chart.`,
    bisaya: `Ingon niini ang pagka-organisar sa gobyerno sa Magallanes:\n\nExecutive — ang Municipal Mayor, Hon. ${MAYOR.name}, ang nangulo sa executive branch ug sa mga opisina sa munisipyo:\n${FUNCTIONARIES.map((f) => `• ${f.role}: ${f.name}`).join('\n')}\n\nLegislative — ang Sangguniang Bayan, nga gipangulohan sa Vice Mayor, Hon. ${VICE_MAYOR.name}, uban ang ${SB_MEMBERS.length} ka napiling miyembro (${SB_MEMBERS.join(', ')}), ug ang presidente sa Liga ng mga Barangay ug presidente sa SK Federation isip ex officio nga miyembro.\n\nBarangay — ang matag usa sa 8 ka barangay gipangulohan sa usa ka Punong Barangay.\n\nMakita ang istruktura isip chart sa Officials page niining website.`,
  },
  ...FUNCTIONARIES.map((f) => ({
    name: `officials.head.${f.key}.inquire`,
    phrases: [...expand(TITLE_TEMPLATES, f.titles), ...expand(OFFICE_TEMPLATES, f.offices)],
    english: `The ${f.role} of Magallanes is ${sentence(f.name)}`,
    bisaya: `Ang ${f.role} sa Magallanes kay si ${sentence(f.name)}`,
  })),
  {
    name: 'barangay.captain.list.inquire',
    phrases: [
      'Who are the barangay captains?', 'List of barangay captains', 'Who are the punong barangay of Magallanes?',
      'Barangay captains of Magallanes', 'Who are the barangay chairmen?', 'Names of the barangay captains',
      'Who leads each barangay?', 'List of punong barangays', 'Who are the barangay officials?',
      'Barangay captains in all barangays', 'Kinsa ang mga kapitan sa Magallanes?', 'Lista sa mga kapitan sa barangay',
      'Kinsa-kinsa ang mga punong barangay?', 'Mga kapitan sa tanang barangay', 'Kinsa ang mga barangay captain karon?',
      'Unsa ang mga ngalan sa mga kapitan?', 'Kinsa ang mga opisyal sa barangay?',
    ],
    english: `Punong Barangay (barangay captains) of Magallanes:\n${BARANGAY_CAPTAINS.map((b) => `• ${b.barangay}: ${b.name}`).join('\n')}`,
    bisaya: `Mga Punong Barangay (kapitan) sa Magallanes:\n${BARANGAY_CAPTAINS.map((b) => `• ${b.barangay}: ${b.name}`).join('\n')}`,
  },
  ...BARANGAY_CAPTAINS.map((b) => ({
    name: `barangay.captain.${b.key}.inquire`,
    phrases: expand(BARANGAY_TEMPLATES, b.aliases),
    english: `The Punong Barangay (barangay captain) of ${b.barangay} is ${sentence(b.name)}`,
    bisaya: `Ang Punong Barangay (kapitan) sa ${b.barangay} kay si ${sentence(b.name)}`,
  })),
];

// --- Multi-turn follow-ups ---
//
// Every officials answer opens a Dialogflow context that stays alive for FOLLOWUP_LIFESPAN
// turns. While it is alive, short follow-ups match the three intents below instead of the
// fallback: "How about the assessor?", "Sa Guiasan?", "Unsa iyang email?". The agent extracts
// *which* office or barangay through the two entities; resolveOfficialsFollowup() then turns
// that into the concrete answer, using the session's previous intent for the contact question.

export const FOLLOWUP_LIFESPAN = 3;
const OFFICIALS_CONTEXT = 'officials-followup';
const BARANGAY_CONTEXT = 'barangay-captain-followup';

// Entity value → the intent whose answer it stands for.
const OFFICE_INTENT_BY_VALUE = {
  mayor: 'officials.mayor.inquire',
  'vice-mayor': 'officials.vicemayor.inquire',
  sb: 'officials.sb.inquire',
  ...Object.fromEntries(FUNCTIONARIES.map((f) => [f.key, `officials.head.${f.key}.inquire`])),
};

// `param` is the parameter name the follow-up intents store the value under.
export const OFFICIALS_ENTITIES = [
  {
    name: 'lgu-office',
    param: 'office',
    entries: [
      { value: 'mayor', synonyms: ['mayor', 'Municipal Mayor', 'local chief executive', 'alkalde'] },
      { value: 'vice-mayor', synonyms: ['vice mayor', 'vice-mayor', 'bise mayor', 'bise alkalde'] },
      { value: 'sb', synonyms: ['Sangguniang Bayan', 'SB', 'councilors', 'konsehal', 'SB members'] },
      ...FUNCTIONARIES.map((f) => ({ value: f.key, synonyms: [...f.titles, ...f.offices] })),
    ],
  },
  {
    name: 'barangay',
    param: 'barangay',
    entries: BARANGAY_CAPTAINS.map((b) => ({ value: b.key, synonyms: [...new Set([b.barangay, ...b.aliases])] })),
  },
];

// `{@entity:text}` marks the part of a phrase Dialogflow should extract as that entity.
const OFFICE_FOLLOWUP_TEMPLATES = [
  'How about the {x}?', 'What about the {x}?', 'And the {x}?', 'How about the {x} head?',
  'Then the {x}?', 'And who is the {x}?', 'How about {x}?', 'What about the {x} then?',
  'Ang {x}?', 'Kana sa {x}?', 'Unsa man sa {x}?', 'Sa {x}?',
  'Ug ang {x}?', 'Unya ang {x}?', 'Kinsa man sa {x}?', 'Kinsa pud ang {x}?',
];
const OFFICE_FOLLOWUP_SAMPLES = [
  'treasurer', 'assessor', 'MSWDO', 'Municipal Engineer', 'MDRRMO', 'accountant', 'HRMO', 'agriculturist',
  'GSO', 'civil registrar', 'MENRO', 'health officer', 'vice mayor', 'budget officer', 'MEEDMO', 'mayor',
];

const BARANGAY_FOLLOWUP_TEMPLATES = [
  'How about {x}?', 'What about {x}?', 'And {x}?', 'How about barangay {x}?',
  'And in {x}?', 'What about Brgy. {x}?', 'How about in {x}?', 'And the captain of {x}?',
  'Sa {x}?', 'Kana sa {x}?', 'Unsa man sa {x}?', 'Ug sa {x}?',
  'Unya sa {x}?', 'Kinsa man sa {x}?', 'Kinsa pud sa {x}?', 'Sa barangay {x} pud?',
];
const BARANGAY_FOLLOWUP_SAMPLES = BARANGAY_CAPTAINS.flatMap((b) => b.aliases);

/** Fills each template twice, walking through the samples so every phrase names a different value. */
function followupPhrases(templates, samples, entity) {
  return templates.flatMap((t, i) =>
    [0, 1].map((k) => t.replace('{x}', `{@${entity}:${samples[(i * 2 + k) % samples.length]}}`))
  );
}

const FOLLOWUP_INTENTS = [
  {
    name: 'officials.followup.office.inquire',
    inputContexts: [OFFICIALS_CONTEXT],
    phrases: followupPhrases(OFFICE_FOLLOWUP_TEMPLATES, OFFICE_FOLLOWUP_SAMPLES, 'lgu-office'),
    english: 'Which office do you mean? For example: the Treasurer, the Assessor, the MSWDO, or the Municipal Engineer.',
    bisaya: 'Unsa nga opisina imong pasabot? Pananglitan: Treasurer, Assessor, MSWDO, o Municipal Engineer.',
  },
  {
    name: 'officials.followup.barangay.inquire',
    inputContexts: [BARANGAY_CONTEXT],
    phrases: followupPhrases(BARANGAY_FOLLOWUP_TEMPLATES, BARANGAY_FOLLOWUP_SAMPLES, 'barangay'),
    english: `Which barangay do you mean? ${BARANGAY_CAPTAINS.map((b) => b.barangay).join(', ')}.`,
    bisaya: `Unsa nga barangay imong pasabot? ${BARANGAY_CAPTAINS.map((b) => b.barangay).join(', ')}.`,
  },
  {
    name: 'officials.followup.contact.inquire',
    inputContexts: [OFFICIALS_CONTEXT],
    phrases: [
      'What is his email?', "What's her email?", 'How do I contact him?', 'How can I reach her?',
      'Do you have their email?', 'Contact details please', 'Email address?', 'How can I get in touch with them?',
      'Can I email them?', 'What is the contact of that office?', 'Unsa iyang email?', 'Unsaon pagkontak niya?',
      'Naa ba siyay email?', 'Asa nako siya makontak?', 'Unsa ang contact niya?', 'Pwede nako siya ma-email?',
      'Email niya?', 'Unsaon nako pagkontak ana nga opisina?',
    ],
    english: `The directory lists email addresses for the Mayor's Office (${MAYOR.email}) and the Sangguniang Bayan (${SB_EMAIL}).`,
    bisaya: `Ang directory naay email para sa Mayor's Office (${MAYOR.email}) ug sa Sangguniang Bayan (${SB_EMAIL}).`,
  },
];

// Every officials answer (follow-ups included, so the thread can keep going) opens the
// officials context; barangay answers also open the barangay one.
export const OFFICIALS_INTENTS = [...BASE_INTENTS, ...FOLLOWUP_INTENTS].map((intent) => ({
  ...intent,
  outputContexts: intent.name.includes('barangay') ? [OFFICIALS_CONTEXT, BARANGAY_CONTEXT] : [OFFICIALS_CONTEXT],
}));

// Contact answers chosen by the server from the previous turn — never matched by the agent
// directly, so they are not exported as intents.
const CONTACT_RESPONSES = {
  'officials.contact.mayor': {
    english: `You can email the Mayor's Office at ${MAYOR.email} or ${MAYORS_OFFICE_CALL}.`,
    bisaya: `Pwede ka mo-email sa Mayor's Office sa ${MAYOR.email} o ${MAYORS_OFFICE_CALL_CEB}.`,
  },
  'officials.contact.sb': {
    english: `You can email the Office of the Vice Mayor and the Sangguniang Bayan at ${SB_EMAIL}.`,
    bisaya: `Pwede ka mo-email sa opisina sa Vice Mayor ug sa Sangguniang Bayan sa ${SB_EMAIL}.`,
  },
  'officials.contact.office': {
    english: `The LGU has not published a separate contact for that office. You can reach the Mayor's Office — email ${MAYOR.email} or ${MAYORS_OFFICE_CALL} — or the Sangguniang Bayan at ${SB_EMAIL}, or visit the office at the Municipal Hall during office hours.`,
    bisaya: `Walay lahi nga contact nga gipahibalo sa LGU para sa maong opisina. Pwede nimo kontakon ang Mayor's Office — email ${MAYOR.email} o ${MAYORS_OFFICE_CALL_CEB} — o ang Sangguniang Bayan sa ${SB_EMAIL}, o bisitaha ang opisina sa Municipal Hall sa oras sa trabaho.`,
  },
  'officials.contact.barangay': {
    english: 'The LGU directory does not list contact details for barangay officials. Please visit the Barangay Hall of that barangay.',
    bisaya: 'Walay contact details sa mga opisyal sa barangay sa directory sa LGU. Palihug bisitaha ang Barangay Hall sa maong barangay.',
  },
};

function contactIntentFor(lastIntent = '') {
  if (lastIntent.startsWith('officials.contact.')) return lastIntent;
  if (lastIntent === 'officials.mayor.inquire') return 'officials.contact.mayor';
  if (lastIntent === 'officials.vicemayor.inquire' || lastIntent === 'officials.sb.inquire') return 'officials.contact.sb';
  if (lastIntent.startsWith('barangay.captain.')) return 'officials.contact.barangay';
  return 'officials.contact.office';
}

/**
 * Turns a follow-up intent into the intent whose answer it is asking for.
 * @param {string} intent - final intent for this turn
 * @param {Record<string, unknown>} [parameters] - Dialogflow's extracted parameters
 * @param {string} [lastIntent] - the session's previous final intent
 * @returns {string} the concrete intent, or `intent` unchanged when it isn't a follow-up or the
 *   agent didn't extract a value (its own "which office?" answer then applies)
 */
export function resolveOfficialsFollowup(intent, parameters = {}, lastIntent = '') {
  if (intent === 'officials.followup.office.inquire') {
    return OFFICE_INTENT_BY_VALUE[parameters?.office] || intent;
  }
  if (intent === 'officials.followup.barangay.inquire') {
    const key = parameters?.barangay;
    return BARANGAY_CAPTAINS.some((b) => b.key === key) ? `barangay.captain.${key}.inquire` : intent;
  }
  if (intent === 'officials.followup.contact.inquire') {
    return contactIntentFor(lastIntent);
  }
  return intent;
}

/** Intent → { english, bisaya }, in the shape responses.js's INTENT_RESPONSES uses. */
export const OFFICIALS_RESPONSES = {
  ...Object.fromEntries(OFFICIALS_INTENTS.map(({ name, english, bisaya }) => [name, { english, bisaya }])),
  ...CONTACT_RESPONSES,
};

/** "sto-nino" → "Santo Niño": the barangay a `barangay.captain.<key>.inquire` intent is about. */
export const barangayNameForKey = (key) => BARANGAY_CAPTAINS.find((b) => b.key === key)?.barangay;

/** True for intents that answer "who is…" questions about people in this directory. */
export const isOfficialsIntent = (intent = '') =>
  intent.startsWith('officials.') || intent.startsWith('barangay.captain.');
