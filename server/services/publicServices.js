// server/services/publicServices.js
//
// National procedures residents ask the municipal assistant about — property tax, PSA copies,
// clearances, IDs, social assistance, farmers and fisherfolk — plus a few town facts found online
// (October 2026). Each answer names the office that handles it and, where offices set their own
// checklists, says to confirm there. Like businessPermit.js and health.js, this file is the single
// source for both the Dialogflow intents and the server's replies; publicTopic() routes questions
// to them by keyword, so they work before the ZIP is re-imported.
//
// Sources:
//   - Real property tax: Local Government Code (RA 7160) Secs. 233, 235, 247, 250, 251, 255;
//     transfer tax, Sec. 135.
//   - PSA copies and CENOMAR: PSA public advisory and PSA Serbilis (psaserbilis.com.ph) fees.
//   - Death registration: Act 3753 (30 days), Sanitation Code PD 856 Sec. 91 (burial permit).
//   - Change of first name: RA 9048 (₱3,000 filing fee, publication; LGU citizen's charters).
//   - Father's surname: RA 9255 (AUSF). Mayor solemnizing marriages: LGC Sec. 444(b)(1)(xviii);
//     two witnesses: Family Code Art. 3.
//   - PWD ID: NCDA (free first issuance, AO 001-2021). Solo parent ID: RA 11861 (C/MSWDO).
//     4Ps: DSWD (no application; Listahanan assessment). AICS: DSWD citizen's charter.
//     Senior citizen ID: RA 9994 (free, OSCA).
//   - Police clearance: National Police Clearance System. NBI clearance: clearance.nbi.gov.ph
//     (₱130 + ₱25 e-payment). First-time jobseekers: RA 11261.
//   - RSBSA and free PCIC insurance: DA/PCIC. FishR/BoatR: Fisheries Code Sec. 19, BFAR.
//   - Open burning: RA 9003 Secs. 48–49. Tree cutting: DENR (CENRO, barangay certificate of no
//     objection).
//   - SPES (ages 15–30) and TUPAD: DOLE, through the PESO.
//   - Town facts: Wikipedia (languages, climate type II with most rain November–January,
//     ANECO); BP 432 (Magallanes National High School); Agusan Catholic Education Association
//     (Father Urios Academy of Magallanes); Butuan hospitals (DOH-run Butuan Medical Center,
//     Agusan del Norte Provincial Hospital, RA 7520).

import { HOTLINES } from './generalInfo.js';

const ENTRIES = [
  // ---- Real property tax (amilyar) ----
  {
    name: 'property.tax.inquire',
    phrases: [
      'How do I pay my real property tax?', 'Where do I pay amilyar?', 'How much is my real property tax?', 'When is the deadline for real property tax?',
      'Can I pay real property tax in installments?', 'Is there a discount for early payment of real property tax?', 'What is the penalty for late amilyar?',
      'How is real property tax computed?', 'Real property tax payment', 'Land tax payment in Magallanes',
      'Unsaon pagbayad sa amilyar?', 'Asa magbayad og amilyar?', 'Pila ang amilyar sa akong yuta?', 'Kanus-a ang deadline sa amilyar?',
      'Pwede ba hulugan ang amilyar?', 'Naa bay diskwento kung sayo magbayad og amilyar?', 'Pila ang multa kung ulahi og bayad sa amilyar?',
      'Unsaon pagkwenta sa amilyar?', 'Magbayad ko sa amilyar sa akong balay ug yuta',
    ],
    english:
      "Real property tax (amilyar) is paid at the Municipal Treasurer's Office at the Municipal Hall. Bring your tax declaration or last official receipt.\n• When: in full on or before March 31, or in four quarterly installments due March 31, June 30, September 30 and December 31 (Local Government Code, Sec. 250).\n• How much: a percentage of your property's assessed value — the basic tax (up to 1%) plus 1% for the Special Education Fund. The Treasurer's Office computes it from your tax declaration.\n• Discount: the LGU may grant up to 20% for advance or prompt payment by ordinance (Sec. 251) — ask what applies this year.\n• Late payment: interest of 2% a month on the unpaid tax, up to 36 months (Sec. 255).",
    bisaya:
      'Ang amilyar (real property tax) bayran sa Municipal Treasurer\'s Office sa Munisipyo. Dad-a ang imong tax declaration o ang katapusang resibo.\n• Kanus-a: bug-os sa dili pa o sa Marso 31, o upat ka hulog matag tulo ka bulan: Marso 31, Hunyo 30, Septyembre 30 ug Disyembre 31 (Local Government Code, Sec. 250).\n• Pila: porsyento sa assessed value sa imong propiedad — ang basic tax (hangtod 1%) ug 1% para sa Special Education Fund. Ang Treasurer\'s Office mokwenta gikan sa imong tax declaration.\n• Diskwento: pwede mohatag ang LGU hangtod 20% kung sayo o sakto sa oras ang bayad, pinaagi sa ordinansa (Sec. 251) — pangutana kung unsa ang karong tuig.\n• Ulahi nga bayad: 2% interes matag bulan sa wala mabayri, hangtod 36 ka bulan (Sec. 255).',
  },
  {
    name: 'property.declaration.inquire',
    phrases: [
      'How do I get a copy of my tax declaration?', 'Where can I get a certified true copy of my tax declaration?', 'Tax declaration copy',
      'How do I get my property assessed?', 'Where is the Assessor\'s Office?', 'How do I declare my new house for tax?', 'Certificate of no improvement',
      'How do I update the tax declaration after buying land?', 'Who issues tax declarations?', 'Assessment of my land',
      'Unsaon pagkuha og kopya sa tax declaration?', 'Asa makuha ang tax declaration sa akong yuta?', 'Asa ang Assessor\'s Office?',
      'Unsaon pag-declare sa akong bag-ong balay?', 'Kinsa ang naghatag og tax declaration?', 'Pag-update sa tax declaration human mapalit ang yuta',
    ],
    english:
      "Tax declarations and property assessments are handled by the Municipal Assessor's Office at the Municipal Hall. For a certified copy, bring a valid ID and the property's details (owner's name, location, or tax declaration number); ask the office about the fee. To declare a new building or transfer a tax declaration after a sale, bring the deed or title documents and the BIR Certificate Authorizing Registration.",
    bisaya:
      'Ang tax declaration ug assessment sa propiedad gihuptan sa Municipal Assessor\'s Office sa Munisipyo. Para sa certified copy, pagdala og valid ID ug detalye sa propiedad (ngalan sa tag-iya, lugar, o numero sa tax declaration); pangutana sa opisina kung pila ang bayad. Para mo-declare og bag-ong building o ibalhin ang tax declaration human sa baligya, dad-a ang deed o mga dokumento sa titulo ug ang Certificate Authorizing Registration gikan sa BIR.',
  },
  {
    name: 'property.transfer.inquire',
    phrases: [
      'How do I transfer a land title?', 'How do I transfer the title of the land I bought?', 'Steps in transferring a land title', 'Transfer of title after a sale',
      'How do I transfer inherited land to my name?', 'Where do I pay the transfer tax?', 'Requirements for transfer of title',
      'Who processes land title transfers?', 'How long does a title transfer take?', 'Transfer of land ownership',
      'Unsaon pag-transfer sa titulo sa yuta?', 'Unsaon pagbalhin sa titulo sa akong ngalan?', 'Asa magbayad sa transfer tax?',
      'Unsa ang requirements sa pag-transfer sa titulo?', 'Napalit nako ang yuta, unsaon pag-ilis sa titulo?', 'Pagbalhin sa yuta nga napanunod',
    ],
    english:
      "A land title transfer goes through national and provincial offices, in this order:\n1. BIR — pay the capital gains tax (or estate or donor's tax) and documentary stamp tax, and get the Certificate Authorizing Registration (CAR).\n2. Transfer tax — paid at the Provincial Treasurer's Office (Local Government Code, Sec. 135).\n3. Registry of Deeds — submit the deed, CAR and tax receipts for the new title in your name.\n4. Municipal Assessor's Office — have the tax declaration transferred to your name.\nThe real property tax must be paid up first; the Municipal Treasurer's Office issues the tax clearance.",
    bisaya:
      'Ang pag-transfer sa titulo sa yuta moagi sa mga opisina sa nasud ug probinsya, sa kini nga han-ay:\n1. BIR — bayri ang capital gains tax (o estate o donor\'s tax) ug documentary stamp tax, ug kuhaa ang Certificate Authorizing Registration (CAR).\n2. Transfer tax — bayran sa Provincial Treasurer\'s Office (Local Government Code, Sec. 135).\n3. Registry of Deeds — isumite ang deed, CAR ug mga resibo sa buhis para sa bag-ong titulo sa imong ngalan.\n4. Municipal Assessor\'s Office — ipa-transfer ang tax declaration sa imong ngalan.\nKinahanglan bayad na ang amilyar; ang Municipal Treasurer\'s Office ang mohatag sa tax clearance.',
  },
  {
    name: 'property.clearance.inquire',
    phrases: [
      'How do I get a tax clearance?', 'Where do I get a real property tax clearance?', 'Tax clearance for my land', 'Real property tax clearance requirements',
      'I need a tax clearance for a land sale', 'Certificate that my amilyar is paid', 'Who issues the tax clearance?', 'Real property tax clearance',
      'Unsaon pagkuha og tax clearance?', 'Asa makuha ang tax clearance sa yuta?', 'Kinahanglan ko og tax clearance sa akong yuta', 'Kinsa ang naghatag og tax clearance?',
      'Pamatuod nga bayad na ang amilyar', 'Tax clearance para ibaligya ang yuta', 'Requirements sa tax clearance',
    ],
    english:
      "A real property tax clearance — proof that a property's taxes are paid — is issued by the Municipal Treasurer's Office at the Municipal Hall. Bring the tax declaration and your latest official receipt; any unpaid amilyar must be settled first. Ask the office about the certification fee.",
    bisaya:
      'Ang real property tax clearance — pamatuod nga bayad na ang buhis sa propiedad — gihatag sa Municipal Treasurer\'s Office sa Munisipyo. Dad-a ang tax declaration ug ang katapusang resibo; kinahanglan bayran una ang bisan unsang wala mabayri nga amilyar. Pangutana sa opisina kung pila ang bayad sa certification.',
  },
  // ---- Civil registry beyond the LCRO checklists ----
  {
    name: 'psa.certificate.inquire',
    phrases: [
      'How do I get a PSA copy of my birth certificate?', 'Where can I get a CENOMAR?', 'How much is a PSA birth certificate?', 'How do I order a PSA birth certificate online?',
      'Where do I get a PSA marriage certificate?', 'How much is CENOMAR?', 'PSA death certificate copy', 'NSO birth certificate',
      'Where is the PSA outlet?', 'Can I get a PSA birth certificate at the municipal hall?', 'Certificate of no marriage',
      'Asa makuha ang PSA birth certificate?', 'Asa makuha ang CENOMAR?', 'Pila ang PSA birth certificate?', 'Unsaon pag-order og PSA online?',
      'Pila ang CENOMAR?', 'Asa makuha ang PSA marriage certificate?', 'Makuha ba ang PSA sa munisipyo?',
    ],
    english:
      "PSA-certified copies (birth, marriage and death certificates, and the CENOMAR) come from the Philippine Statistics Authority, not the municipal office:\n• Online at psaserbilis.com.ph, delivered: about ₱330 per birth, marriage or death certificate and ₱430 for a CENOMAR.\n• At a PSA Civil Registry System outlet: ₱155 per certificate and ₱210 for a CENOMAR.\nUse only the official PSA channels. For a record registered in Magallanes, the Local Civil Registry Office at the Municipal Hall can issue a local certified copy.",
    bisaya:
      'Ang mga kopya nga PSA-certified (birth, marriage ug death certificate, ug CENOMAR) gikan sa Philippine Statistics Authority, dili sa munisipyo:\n• Online sa psaserbilis.com.ph, ihatod: mga ₱330 matag birth, marriage o death certificate ug ₱430 sa CENOMAR.\n• Sa PSA Civil Registry System outlet: ₱155 matag certificate ug ₱210 sa CENOMAR.\nGamita lang ang opisyal nga PSA. Kung ang rekord narehistro sa Magallanes, ang Local Civil Registry Office sa Munisipyo makahatag og local certified copy.',
  },
  {
    name: 'civil.registry.death.registration.inquire',
    phrases: [
      'What are the requirements to register a death?', 'How do I register a death?', 'How do I get a burial permit?', 'Where do I get a burial permit?',
      'My father died, what do I need to do?', 'How many days to register a death?', 'Do I need a permit to bury?', 'Transfer permit for burial in another town',
      'Who signs the death certificate?', 'Death registration requirements', 'What do I need to bury my mother?',
      'Unsa ang requirements sa pagparehistro sa namatay?', 'Unsaon pagparehistro sa namatay?', 'Asa makuha ang burial permit?', 'Namatay akong amahan, unsa akong buhaton?',
      'Pila ka adlaw para iparehistro ang namatay?', 'Kinahanglan ba og permit sa paglubong?', 'Kinsa ang mopirma sa death certificate?',
    ],
    english:
      "To register a death, go to the Local Civil Registry Office (LCRO) at the Municipal Hall within 30 days. Bring the Certificate of Death (Municipal Form 103), filled out and signed by the attending physician — or, if no doctor attended, examined and signed by the Municipal Health Officer — and a valid ID of the informant. Once the death is registered, the burial permit is issued (Sanitation Code, PD 856); a transfer permit is needed if the burial is in another town. Ask me \"how much is a death certificate?\" for the fee.",
    bisaya:
      'Para iparehistro ang namatay, adto sa Local Civil Registry Office (LCRO) sa Munisipyo sulod sa 30 ka adlaw. Dad-a ang Certificate of Death (Municipal Form 103), nga napuno ug napirmahan sa doktor nga nag-atiman — o kung walay doktor, gisusi ug gipirmahan sa Municipal Health Officer — ug valid ID sa nag-report. Kung narehistro na, ihatag ang burial permit (Sanitation Code, PD 856); kinahanglan og transfer permit kung sa laing lungsod ilubong. Pangutana nako og "pila ang death certificate?" para sa bayad.',
  },
  {
    name: 'civil.registry.first-name.inquire',
    phrases: [
      'How do I change my first name?', 'Can I change my first name in my birth certificate?', 'Change of first name requirements', 'How much is the change of first name?',
      'I want to use my nickname as my legal first name', 'Petition for change of first name', 'RA 9048 change of first name',
      'Unsaon pag-usab sa akong first name?', 'Pwede ba ilisan ang akong first name sa birth certificate?', 'Pila ang bayad sa pag-ilis sa first name?',
      'Requirements sa change of first name', 'Gusto ko ilisan akong ngalan sa birth certificate', 'Unsaon pag-ilis sa akong ngalan?',
      'Ilisan ang first name sa akong anak', 'Usbon ang akong ngalan sa birth certificate',
    ],
    english:
      "A change of first name is a petition filed at the Local Civil Registry Office under RA 9048. The filing fee is ₱3,000 (waived for indigent petitioners certified by the social welfare office), and the petition must be posted and published in a newspaper for two consecutive weeks. Bring a certified copy of the birth certificate and documents showing the name you use (IDs, school or employment records). Confirm the full checklist with the LCRO. A misspelled name is a cheaper clerical correction — ask me about that.",
    bisaya:
      'Ang pag-ilis sa first name usa ka petisyon nga i-file sa Local Civil Registry Office ubos sa RA 9048. Ang filing fee ₱3,000 (libre sa mga kabus nga gi-certify sa social welfare office), ug kinahanglan i-post ug imantala sa pamantalaan sulod sa duha ka magkasunod nga semana. Dad-a ang certified copy sa birth certificate ug mga dokumento nga nagpakita sa ngalan nga imong gigamit (ID, rekord sa eskwelahan o trabaho). Kumpirmaha ang kompleto nga listahan sa LCRO. Ang sayop nga spelling sa ngalan mas barato nga clerical correction — pangutana nako bahin ana.',
  },
  {
    name: 'civil.registry.father-surname.inquire',
    phrases: [
      "How can my child use the father's surname?", "Can an illegitimate child use the father's last name?", 'What is AUSF?', 'Affidavit to use the surname of the father',
      "My child's birth certificate has my surname, how do I change it to the father's?", 'Acknowledgment of paternity requirements', 'Legitimation of a child',
      'Unsaon pag-apil sa apelyido sa amahan sa birth certificate sa akong anak?', 'Pwede ba gamiton sa akong anak ang apelyido sa iyang papa?', 'Unsa ang AUSF?',
      'Unsaon pag-ilis sa apelyido sa akong anak ngadto sa apelyido sa amahan?', 'Requirements sa pag-acknowledge sa amahan', 'Apelyido sa amahan para sa anak nga dili kasal',
      'Wala kasal ang ginikanan, unsaon pag-gamit sa apelyido sa amahan?', 'Affidavit sa apelyido sa amahan',
    ],
    english:
      "Under RA 9255, a child born to unmarried parents may use the father's surname if the father acknowledges the child — by signing the birth certificate, or through an Affidavit of Admission of Paternity — and an Affidavit to Use the Surname of the Father (AUSF) is filed at the Local Civil Registry Office. If the parents later marry, the child can be legitimated, also through the LCRO. Ask the LCRO for its checklist and fees.",
    bisaya:
      'Ubos sa RA 9255, ang anak sa ginikanan nga dili kasal pwede mogamit sa apelyido sa amahan kung ang amahan moila sa bata — pinaagi sa pagpirma sa birth certificate, o pinaagi sa Affidavit of Admission of Paternity — ug i-file ang Affidavit to Use the Surname of the Father (AUSF) sa Local Civil Registry Office. Kung magpakasal ang ginikanan sa ulahi, ma-legitimate ang bata, pinaagi usab sa LCRO. Pangutana sa LCRO para sa ilang listahan ug bayad.',
  },
  {
    name: 'civil.registry.wedding.inquire',
    phrases: [
      'Can the mayor solemnize our wedding?', 'What are the requirements for a civil wedding?', 'How do we get married by the mayor?', 'Civil wedding at the municipal hall',
      'Who can officiate a civil wedding in Magallanes?', 'How do I schedule a civil wedding?', 'Do we need witnesses for a civil wedding?', 'Kasal sa mayor',
      'Pwede ba mokasal ang mayor?', 'Unsa ang requirements sa civil wedding?', 'Unsaon pagpakasal sa mayor?', 'Civil wedding sa munisipyo unsaon?',
      'Kinsa ang pwede mokasal sa civil wedding?', 'Unsaon pag-schedule sa civil wedding?', 'Kinahanglan ba og saksi sa kasal?',
    ],
    english:
      "The Municipal Mayor may solemnize marriages (Local Government Code, Sec. 444). For a civil wedding:\n1. Get a marriage license from the Local Civil Registry Office — ask me for its requirements and fee.\n2. Set the date with the Mayor's Office (email mayorsoffice2019.magallanesadn@gmail.com).\n3. Bring at least two witnesses of legal age to the ceremony (Family Code, Art. 3).",
    bisaya:
      'Ang Municipal Mayor pwede mokasal (Local Government Code, Sec. 444). Para sa civil wedding:\n1. Kuha og marriage license sa Local Civil Registry Office — pangutana nako sa requirements ug bayad niini.\n2. Ipa-schedule ang adlaw sa Mayor\'s Office (email: mayorsoffice2019.magallanesadn@gmail.com).\n3. Pagdala og labing menos duha ka saksi nga hamtong na sa seremonya (Family Code, Art. 3).',
  },
  // ---- Social services ----
  {
    name: 'social.pwd-id.inquire',
    phrases: [
      'How do I get a PWD ID?', 'What are the requirements for a PWD ID?', 'Where do I apply for a PWD ID?', 'Is the PWD ID free?',
      'My child has a disability, how do I get a PWD ID?', 'PWD ID application', 'How long is the PWD ID valid?', 'Person with disability ID',
      'Unsaon pagkuha og PWD ID?', 'Unsa ang requirements sa PWD ID?', 'Asa mag-apply og PWD ID?', 'Libre ba ang PWD ID?',
      'Naay kapansanan akong anak, unsaon pagkuha og PWD ID?', 'PWD ID sa akong lola', 'Asa makuha ang ID sa may kapansanan?',
    ],
    english:
      "PWD IDs are issued free by the municipality — apply at the Municipal Social Welfare and Development Office (MSWDO). Bring:\n• The PWD application form\n• A medical certificate from a licensed doctor stating the disability\n• Recent 1x1 ID photos\n• A valid ID, or a birth certificate for a minor\nThe office may also ask for a barangay certificate of residency. Confirm the checklist with the MSWDO.",
    bisaya:
      'Ang PWD ID libre nga gihatag sa munisipyo — mag-apply sa Municipal Social Welfare and Development Office (MSWDO). Dad-a:\n• Ang PWD application form\n• Medical certificate gikan sa lisensyado nga doktor nga nag-ingon sa kapansanan\n• Bag-ong 1x1 nga ID picture\n• Valid ID, o birth certificate kung bata pa\nPwede usab mangayo ang opisina og barangay certificate of residency. Kumpirmaha ang listahan sa MSWDO.',
  },
  {
    name: 'social.solo-parent.inquire',
    phrases: [
      'How do I apply for a solo parent ID?', 'What are the requirements for a solo parent ID?', 'Who qualifies as a solo parent?', 'Where do I get a solo parent ID?',
      'Solo parent benefits', 'How long is the solo parent ID valid?', 'Renewal of solo parent ID', 'Solo parent ID application',
      'Unsaon pag-apply og solo parent ID?', 'Unsa ang requirements sa solo parent ID?', 'Kinsa ang pwede sa solo parent?', 'Asa makuha ang solo parent ID?',
      'Unsa ang benepisyo sa solo parent?', 'Pag-renew sa solo parent ID', 'Ako ra nag-atiman sa akong anak, pwede ba ko og solo parent ID?',
    ],
    english:
      "Under the Expanded Solo Parents Welfare Act (RA 11861), apply for a Solo Parent ID at the Municipal Social Welfare and Development Office (MSWDO). Usual requirements:\n• The application form\n• A barangay certificate showing you have lived in the barangay for at least six months\n• Proof of your solo parent situation (for example, the spouse's death certificate or a court order)\n• Your children's birth certificates\n• A valid ID\nThe ID is renewed every year. Confirm the checklist with the MSWDO.",
    bisaya:
      'Ubos sa Expanded Solo Parents Welfare Act (RA 11861), mag-apply og Solo Parent ID sa Municipal Social Welfare and Development Office (MSWDO). Kasagarang requirements:\n• Application form\n• Barangay certificate nga nagpakita nga labing menos unom ka bulan ka na nagpuyo sa barangay\n• Pamatuod sa imong kahimtang isip solo parent (pananglitan, death certificate sa asawa o bana, o mando sa korte)\n• Birth certificate sa imong mga anak\n• Valid ID\nI-renew ang ID kada tuig. Kumpirmaha ang listahan sa MSWDO.',
  },
  {
    name: 'social.4ps.inquire',
    phrases: [
      'How do I apply for 4Ps?', 'How can my family join 4Ps?', 'Who qualifies for 4Ps?', 'Where do I register for Pantawid Pamilya?',
      'Is there an application for 4Ps?', 'How do I become a 4Ps member?', '4Ps requirements', 'Pantawid Pamilyang Pilipino Program',
      'Unsaon pag-apply sa 4Ps?', 'Unsaon pag-apil sa 4Ps?', 'Kinsa ang pwede sa 4Ps?', 'Asa magparehistro sa 4Ps?',
      'Naa bay application sa 4Ps?', 'Requirements sa 4Ps', 'Gusto mi moapil sa 4Ps',
    ],
    english:
      "There is no walk-in application for 4Ps (Pantawid Pamilyang Pilipino Program). DSWD identifies households through its Listahanan household assessment; poor households with children aged 0–18 or a pregnant member may be included when slots open. Ask the Municipal Social Welfare and Development Office (MSWDO) whether your household has been assessed. Beware of anyone asking for money to enroll you.",
    bisaya:
      'Walay walk-in nga application sa 4Ps (Pantawid Pamilyang Pilipino Program). Ang DSWD ang mopili sa mga panimalay pinaagi sa Listahanan household assessment; ang kabus nga panimalay nga naay anak nga 0–18 anyos o naay mabdos pwede maapil kung naay bakante. Pangutana sa Municipal Social Welfare and Development Office (MSWDO) kung na-assess na ang inyong panimalay. Pagbantay sa bisan kinsa nga mangayo og kwarta para maapil ka.',
  },
  {
    name: 'social.assistance.inquire',
    phrases: [
      'How do I ask for medical or financial assistance?', 'Is there burial assistance?', 'Naa bay burial assistance ang munisipyo?', 'How do I get help with hospital bills?',
      'Financial assistance for medicine', 'What is AICS?', 'Educational assistance for students', 'Is there educational assistance for students?',
      'Requirements for burial assistance', 'Medical assistance requirements', 'Guarantee letter for hospital',
      'Unsaon pagpangayo og tabang pinansyal?', 'Naa bay tabang para sa lubong?', 'Tabang sa bayronon sa ospital', 'Tabang para sa tambal',
      'Requirements sa burial assistance', 'Naa bay educational assistance sa mga estudyante?', 'Unsa ang AICS?',
    ],
    english:
      "Help with burial, medical and hospital costs, and educational needs is available through DSWD's Assistance to Individuals in Crisis Situation (AICS) and the MSWDO. Usual requirements:\n• Burial: the death certificate, funeral contract, barangay certificate of indigency, and the applicant's valid ID\n• Medical: a medical certificate or clinical abstract, the hospital bill or prescription, barangay certificate of indigency, and a valid ID\nApply at the Municipal Social Welfare and Development Office (MSWDO) or the DSWD field office.",
    bisaya:
      'Ang tabang sa gasto sa lubong, tambal ug ospital, ug edukasyon anaa pinaagi sa Assistance to Individuals in Crisis Situation (AICS) sa DSWD ug sa MSWDO. Kasagarang requirements:\n• Lubong: death certificate, funeral contract, barangay certificate of indigency, ug valid ID sa nag-apply\n• Medikal: medical certificate o clinical abstract, bill sa ospital o reseta, barangay certificate of indigency, ug valid ID\nMag-apply sa Municipal Social Welfare and Development Office (MSWDO) o sa DSWD field office.',
  },
  // ---- National clearances ----
  {
    name: 'clearance.police.inquire',
    phrases: [
      'How do I get a police clearance?', 'Where can I get a police clearance?', 'Police clearance requirements', 'Can I apply for police clearance online?',
      'How much is the police clearance?', 'National police clearance', 'Police clearance for employment', 'Is police clearance free for first-time jobseekers?',
      'Unsaon pagkuha og police clearance?', 'Asa makuha ang police clearance?', 'Requirements sa police clearance', 'Pila ang police clearance?',
      'Online ba ang police clearance?', 'Police clearance para sa trabaho', 'Clearance sa pulis',
    ],
    english:
      "Police clearances are issued by the PNP through the National Police Clearance System: register and book an appointment online at pnpclearance.ph, pay online or over the counter, then appear at the chosen police station for your photo and fingerprints. Bring two valid IDs. First-time jobseekers can get it free with a barangay certificate (RA 11261). Check the current fee on the site.",
    bisaya:
      'Ang police clearance gihatag sa PNP pinaagi sa National Police Clearance System: magparehistro ug mag-book og appointment online sa pnpclearance.ph, magbayad online o sa counter, unya moadto sa gipiling police station para sa picture ug fingerprint. Pagdala og duha ka valid ID. Ang first-time jobseeker libre basta naay barangay certificate (RA 11261). Tan-awa sa site ang bayad karon.',
  },
  {
    name: 'clearance.nbi.inquire',
    phrases: [
      'How do I get an NBI clearance?', 'Where can I get an NBI clearance?', 'NBI clearance requirements', 'How much is the NBI clearance?',
      'Can I walk in for an NBI clearance?', 'NBI clearance renewal', 'NBI clearance online', 'NBI clearance for first-time jobseekers',
      'Asa makuha ang NBI clearance?', 'Unsaon pagkuha og NBI clearance?', 'Pila ang NBI clearance?', 'Requirements sa NBI clearance',
      'Pwede ba walk-in sa NBI?', 'Pag-renew sa NBI clearance', 'NBI clearance para sa trabaho',
    ],
    english:
      "NBI clearances are issued by the National Bureau of Investigation, not the LGU. Apply online at clearance.nbi.gov.ph, choose a branch and schedule, pay (about ₱155, including the ₱25 e-payment fee), then go to the branch for your photo and fingerprints. Bring two valid IDs; walk-ins are not accepted. First-time jobseekers can get it free with a barangay certificate (RA 11261).",
    bisaya:
      'Ang NBI clearance gihatag sa National Bureau of Investigation, dili sa LGU. Mag-apply online sa clearance.nbi.gov.ph, pili og branch ug schedule, magbayad (mga ₱155, apil ang ₱25 nga e-payment fee), unya adto sa branch para sa picture ug fingerprint. Pagdala og duha ka valid ID; walay walk-in. Ang first-time jobseeker libre basta naay barangay certificate (RA 11261).',
  },
  // ---- Farmers and fisherfolk ----
  {
    name: 'agri.rsbsa.inquire',
    phrases: [
      'How do I register in RSBSA?', 'What is RSBSA?', 'RSBSA registration requirements', 'Where do farmers register?',
      'Is there free seeds or fertilizer for farmers?', 'How do I get fertilizer assistance?', 'How do farmers get help from the Department of Agriculture?',
      'Unsaon pagparehistro sa RSBSA?', 'Unsa ang RSBSA?', 'Asa magparehistro ang mag-uuma?', 'Naa bay libre nga binhi o abono para sa mag-uuma?',
      'Unsaon pagkuha og abono?', 'Tabang para sa mag-uuma', 'Requirements sa RSBSA', 'Libre nga binhi sa mag-uuma',
    ],
    english:
      "Farmers and fisherfolk register in the RSBSA (Registry System for Basic Sectors in Agriculture) at the Municipal Agriculture Office. Fill out the RSBSA enrollment form, bring a valid ID and a 1x1 photo, and have the form verified by your barangay captain. Registration is free. Being in the RSBSA is needed for Department of Agriculture assistance such as seeds and fertilizer, and for free PCIC crop insurance.",
    bisaya:
      'Ang mga mag-uuma ug mangingisda magparehistro sa RSBSA (Registry System for Basic Sectors in Agriculture) sa Municipal Agriculture Office. Pun-a ang RSBSA enrollment form, pagdala og valid ID ug 1x1 nga picture, ug ipa-verify ang form sa imong kapitan sa barangay. Libre ang pagparehistro. Kinahanglan ka sa RSBSA para sa tabang sa Department of Agriculture sama sa binhi ug abono, ug para sa libre nga crop insurance sa PCIC.',
  },
  {
    name: 'agri.fisherfolk.inquire',
    phrases: [
      'How do I register my fishing boat?', 'How do I get a fisherfolk ID?', 'What is FishR?', 'What is BoatR?',
      'Boat registration for fishermen', 'Where do fishermen register?', 'Do I need to register my banca?', 'Fisherfolk registration',
      'Unsaon pagparehistro sa akong baroto?', 'Unsaon pagkuha og ID sa mangingisda?', 'Asa magparehistro ang mangingisda?', 'Kinahanglan ba iparehistro ang akong bangka?',
      'Pagparehistro sa baroto', 'Fisherfolk ID asa makuha?', 'Rehistro sa mangingisda',
    ],
    english:
      "Fisherfolk (FishR) and municipal fishing boats of 3 gross tons or less (BoatR) are registered with the LGU through the Municipal Agriculture Office, under the Fisheries Code (Sec. 19). Registration gives you a fisherfolk record and ID and is needed for BFAR and Department of Agriculture programs. Bring a valid ID and your boat's details, and ask the office for the forms.",
    bisaya:
      'Ang mga mangingisda (FishR) ug ang munisipal nga baroto nga 3 gross tons o ubos (BoatR) iparehistro sa LGU pinaagi sa Municipal Agriculture Office, ubos sa Fisheries Code (Sec. 19). Ang pagparehistro mohatag nimo og rekord ug ID isip mangingisda ug kinahanglan para sa mga programa sa BFAR ug Department of Agriculture. Pagdala og valid ID ug detalye sa imong baroto, ug pangayo og form sa opisina.',
  },
  {
    name: 'agri.insurance.inquire',
    phrases: [
      'Is there crop insurance for farmers?', 'How do I get free crop insurance?', 'What is PCIC?', 'How do I insure my rice farm?',
      'Free insurance for fisherfolk', 'Crop insurance requirements', 'How do I claim crop insurance after a typhoon?', 'Livestock insurance',
      'Naa bay insurance sa tanom?', 'Unsaon pagkuha og libre nga crop insurance?', 'Unsa ang PCIC?', 'Unsaon pag-insure sa akong humayan?',
      'Libre ba ang insurance sa mag-uuma?', 'Insurance sa baboy o hayop', 'Unsaon pag-claim sa insurance human sa bagyo?',
    ],
    english:
      "Crop, livestock and fisheries insurance from the Philippine Crop Insurance Corporation (PCIC) is free for subsistence farmers and fisherfolk listed in the RSBSA. It is not automatic: apply through the Municipal Agriculture Office or PCIC with the PCIC application form — for rice and corn, soon after planting. Register in the RSBSA first if you have not.",
    bisaya:
      'Ang insurance sa tanom, hayop ug pangisda gikan sa Philippine Crop Insurance Corporation (PCIC) libre sa mga gamay nga mag-uuma ug mangingisda nga naa sa RSBSA. Dili kini awtomatik: mag-apply pinaagi sa Municipal Agriculture Office o PCIC gamit ang PCIC application form — sa humay ug mais, dayon human sa pagtanom. Magparehistro una sa RSBSA kung wala pa.',
  },
  // ---- Environment ----
  {
    name: 'env.burning.inquire',
    phrases: [
      'Can I burn my garbage?', 'Pwede ba magsunog og basura?', 'Is burning leaves allowed?', 'Is open burning of trash illegal?',
      'What is the fine for burning garbage?', 'My neighbor burns trash, is that allowed?', 'Can I burn dried leaves in my yard?',
      'Bawal ba ang pagsunog og basura?', 'Pila ang multa sa pagsunog og basura?', 'Pwede ba sunogon ang uga nga dahon?', 'Gasunog og basura ang silingan',
      'Pwede ba magsunog og plastik?', 'Ilegal ba ang pagsunog sa basura?', 'Pagsunog sa basura sa nataran', 'Is it okay to burn plastic?',
    ],
    english:
      "No. Open burning of garbage, including dried leaves and household waste, is prohibited under the Ecological Solid Waste Management Act (RA 9003, Sec. 48). Violators face a fine of ₱300 to ₱1,000, or 1 to 15 days in jail, or both (Sec. 49). Segregate your waste and compost leaves and food scraps instead. To report someone burning garbage, use the Report a Concern page.",
    bisaya:
      'Dili. Bawal ang pagsunog og basura sa gawas, apil ang uga nga dahon ug basura sa balay, ubos sa Ecological Solid Waste Management Act (RA 9003, Sec. 48). Ang molapas multahan og ₱300 hangtod ₱1,000, o 1 hangtod 15 ka adlaw nga pagkapriso, o duha (Sec. 49). Ilain-ilaina ang basura ug i-compost ang dahon ug salin sa pagkaon. Para mo-report sa nagsunog og basura, gamita ang Report a Concern page.',
  },
  {
    name: 'env.tree-cutting.inquire',
    phrases: [
      'Do I need a permit to cut a tree?', 'How do I get a tree cutting permit?', 'Can I cut the tree in my yard?', 'Where do I get a permit to cut a coconut tree?',
      'Tree cutting permit requirements', 'Who issues tree cutting permits?', 'Can I cut down a big tree on my land?',
      'Kinahanglan ba og permit sa pagputol og kahoy?', 'Unsaon pagkuha og permit sa pagputol og kahoy?', 'Pwede ba putlon ang kahoy sa among nataran?',
      'Asa makuha ang permit sa pagputol sa lubi?', 'Kinsa ang naghatag og tree cutting permit?', 'Pwede ba mamutol og dakong kahoy sa akong yuta?', 'Permit sa pagputol sa kahoy', 'Can I cut a coconut tree on my lot?',
    ],
    english:
      "Cutting trees generally needs a permit from the Department of Environment and Natural Resources (DENR), applied for through the CENRO (Community Environment and Natural Resources Office) that covers Magallanes. You will need a certification of no objection from your barangay, plus proof of land ownership; cut trees must be replaced by planting new ones. Ask the CENRO before cutting — small-scale cutting on a residential lot may only need prior notice.",
    bisaya:
      'Ang pagputol og kahoy kasagaran nanginahanglan og permit gikan sa Department of Environment and Natural Resources (DENR), pinaagi sa CENRO (Community Environment and Natural Resources Office) nga nagsakop sa Magallanes. Kinahanglan nimo ang certification of no objection gikan sa imong barangay, ug pamatuod sa pagpanag-iya sa yuta; ang naputol nga kahoy kinahanglan ilisan og bag-ong tanom. Pangutana sa CENRO sa dili pa mamutol — ang gamay nga pagputol sa residential lot basin pahibalo lang ang kinahanglan.',
  },
  // ---- Jobs ----
  {
    name: 'jobs.spes-tupad.inquire',
    phrases: [
      'How do I apply for SPES?', 'How do I apply for TUPAD?', 'How do I apply for SPES or TUPAD?', 'What is SPES?', 'What is TUPAD?',
      'Summer job for students', 'Where is the PESO office?', 'Who qualifies for SPES?', 'Emergency employment program',
      'Unsaon pag-apply sa SPES?', 'Unsaon pag-apply sa TUPAD?', 'Unsa ang SPES?', 'Unsa ang TUPAD?', 'Trabaho para sa estudyante inig bakasyon',
      'Asa ang PESO?', 'Kinsa ang pwede sa SPES?',
    ],
    english:
      "Both are Department of Labor and Employment (DOLE) programs, applied for through the LGU's Public Employment Service Office (PESO) — ask at the Municipal Hall:\n• SPES (Special Program for Employment of Students): students and out-of-school youth aged 15 to 30 from low-income families. Bring the application form, a birth certificate, and your parents' income tax return or a certificate of low income or indigency. Apply early in the year.\n• TUPAD: short-term emergency work for unemployed, underemployed or displaced workers, once a year.",
    bisaya:
      'Parehong programa sa Department of Labor and Employment (DOLE), i-apply pinaagi sa Public Employment Service Office (PESO) sa LGU — pangutana sa Munisipyo:\n• SPES (Special Program for Employment of Students): mga estudyante ug out-of-school youth nga 15 hangtod 30 anyos gikan sa pamilya nga gamay og kita. Dad-a ang application form, birth certificate, ug income tax return sa ginikanan o certificate of low income o indigency. Sayo nga mag-apply sa sinugdanan sa tuig.\n• TUPAD: mubo nga emergency nga trabaho para sa walay trabaho, kulang og trabaho o nawad-an og panginabuhian, kausa matag tuig.',
  },
  // ---- Town facts ----
  {
    name: 'places.hospital.inquire',
    phrases: [
      'Where is the nearest hospital?', 'Is there a hospital in Magallanes?', 'What hospitals are near Magallanes?', 'Government hospital near Magallanes',
      'Where can I bring a patient for surgery?', 'Hospital in Butuan', 'Nearest hospital with PhilHealth',
      'Asa ang pinakaduol nga ospital?', 'Naa bay ospital sa Magallanes?', 'Unsa ang mga ospital duol sa Magallanes?', 'Asa dad-on ang pasyente?',
      'Ospital sa gobyerno duol diri', 'Ospital sa Butuan', 'Asa ang ospital?', 'Which hospital accepts PhilHealth near Magallanes?',
    ],
    english:
      `The nearest hospitals are in Butuan City:\n• Butuan Medical Center (government, Km. 5, Baan)\n• Agusan del Norte Provincial Hospital (government)\n• Manuel J. Santos Hospital and ACE Medical Center Butuan (private)\nFor check-ups and basic care in town, go to the Rural Health Unit. For an emergency, call MERT at ${HOTLINES.mert} or 911.`,
    bisaya:
      `Ang pinakaduol nga ospital naa sa Butuan City:\n• Butuan Medical Center (gobyerno, Km. 5, Baan)\n• Agusan del Norte Provincial Hospital (gobyerno)\n• Manuel J. Santos Hospital ug ACE Medical Center Butuan (pribado)\nPara sa check-up ug batakang pag-atiman diri, adto sa Rural Health Unit. Kung emergency, tawag sa MERT sa ${HOTLINES.mert} o 911.`,
  },
  {
    name: 'about.language.inquire',
    phrases: [
      'What language do people speak in Magallanes?', 'What dialect is spoken in Magallanes?', 'Do people in Magallanes speak Tagalog?', 'What is the local language?',
      'Do people understand English in Magallanes?', 'What language do the residents use?', 'Is Butuanon spoken in Magallanes?',
      'Unsa ang pinulongan sa Magallanes?', 'Unsa ang sinultihan sa mga taga-Magallanes?', 'Kasabot ba og Tagalog ang mga tawo diri?', 'Unsa ang lengguwahe diri?',
      'Bisaya ba ang sinultihan sa Magallanes?', 'Unsa nga pinulongan ang gigamit sa mga tawo diri?', 'Kasabot ba og English ang mga tawo sa Magallanes?', 'What is the main language in Magallanes?',
    ],
    english:
      "Most people in Magallanes speak Cebuano (Bisaya). Butuanon, Agusan and Higaonon are also spoken, and Tagalog and English are widely understood. You can ask me in English or Bisaya.",
    bisaya:
      'Kadaghanan sa mga tawo sa Magallanes nagsulti og Cebuano (Bisaya). Gisulti usab ang Butuanon, Agusan ug Higaonon, ug kasabot ang kadaghanan og Tagalog ug English. Pwede ka mangutana nako sa English o Bisaya.',
  },
  {
    name: 'tourism.best-time.inquire',
    phrases: [
      'What is the best time to visit Magallanes?', 'When is the rainy season in Magallanes?', 'Is there a dry season in Magallanes?', 'What month should I visit?',
      'What is the weather like in Magallanes?', 'What is the climate of Magallanes?', 'Is it rainy in December?',
      'Kanus-a ang maayong panahon sa pagbisita sa Magallanes?', 'Kanus-a ang ting-ulan sa Magallanes?', 'Naa bay ting-init sa Magallanes?', 'Unsa nga bulan maayo mobisita?',
      'Unsa ang klima sa Magallanes?', 'Ulanon ba inig Disyembre?', 'Kanus-a maayo moadto sa Magallanes?', 'When is the dry season in Magallanes?',
    ],
    english:
      "Magallanes has no distinct dry season; rain is heaviest from November to January. For drier weather, visit between February and October — or come in October for the town fiesta (third Saturday) and the Lisagan Festival the day after.",
    bisaya:
      'Walay klaro nga ting-init sa Magallanes; pinakakusog ang ulan gikan Nobyembre hangtod Enero. Para sa mas uga nga panahon, bisita tali sa Pebrero ug Oktubre — o anhi sa Oktubre para sa piyesta (ikatulong Sabado) ug sa Lisagan Festival sa sunod nga adlaw.',
  },
  {
    name: 'utilities.electricity.inquire',
    phrases: [
      'Who supplies electricity in Magallanes?', 'Where do I report a brownout?', 'Brownout karon, asa ko mo-report?', 'Who do I call about a power outage?',
      'How do I apply for an electric connection?', 'Where do I pay my electric bill?', 'What is ANECO?',
      'Kinsa ang naghatag og kuryente sa Magallanes?', 'Asa mo-report sa brownout?', 'Walay kuryente, kinsa akong tawagan?', 'Unsaon pag-apply og kuryente?',
      'Asa magbayad sa bill sa kuryente?', 'Unsa ang ANECO?', 'Power interruption sa among lugar', 'Who do I contact about electricity problems?',
    ],
    english:
      "Electricity in Magallanes is supplied by ANECO (Agusan del Norte Electric Cooperative). Report brownouts and line problems, apply for a new connection, or pay your bill through ANECO's offices, hotline or official Facebook page. A fallen live wire is an emergency — keep away and call MERT at " + HOTLINES.mert + ' or 911.',
    bisaya:
      'Ang kuryente sa Magallanes gikan sa ANECO (Agusan del Norte Electric Cooperative). Mo-report sa brownout ug problema sa linya, mag-apply og bag-ong koneksyon, o magbayad sa bill pinaagi sa opisina, hotline o opisyal nga Facebook page sa ANECO. Ang natumba nga live wire usa ka emergency — layo-i ug tawag sa MERT sa ' + HOTLINES.mert + ' o 911.',
  },
  {
    name: 'education.schools.inquire',
    phrases: [
      'What schools are in Magallanes?', 'Is there a high school in Magallanes?', 'List of schools in Magallanes', 'Is there a private school in Magallanes?',
      'Where can my child study high school?', 'What is the public high school in Magallanes?', 'Are there Catholic schools in Magallanes?',
      'Unsa ang mga eskwelahan sa Magallanes?', 'Naa bay high school sa Magallanes?', 'Asa makaeskwela og high school akong anak?', 'Naa bay pribado nga eskwelahan diri?',
      'Lista sa mga eskwelahan sa Magallanes', 'Unsa ang public high school sa Magallanes?', 'Naa bay Katoliko nga eskwelahan diri?', 'Where can I enroll my child in Magallanes schools?',
    ],
    english:
      "Schools in Magallanes include Magallanes National High School (public) and Father Urios Academy of Magallanes (a private Catholic school). For the complete list of public elementary and high schools, and for enrollment, ask the DepEd Division of Agusan del Norte or the school directly.",
    bisaya:
      'Ang mga eskwelahan sa Magallanes naglakip sa Magallanes National High School (publiko) ug Father Urios Academy of Magallanes (pribado nga Katoliko nga eskwelahan). Para sa kompleto nga lista sa publiko nga elementarya ug high school, ug sa enrollment, pangutana sa DepEd Division of Agusan del Norte o direkta sa eskwelahan.',
  },
  {
    name: 'disaster.weather.inquire',
    phrases: [
      'What is the weather today?', 'Is there a typhoon coming?', 'Naay bagyo karon? Unsa ang update?', 'Where can I get typhoon updates?',
      'Is there a storm signal in Agusan del Norte?', 'Will there be classes suspended because of the storm?', 'Weather forecast for Magallanes',
      'Unsa ang panahon karon?', 'Naay bagyo moabot?', 'Asa makakuha og update sa bagyo?', 'Naa bay signal sa bagyo sa Agusan del Norte?',
      'Naay suspension sa klase tungod sa bagyo?', 'Forecast sa panahon sa Magallanes', 'Weather update for Agusan del Norte', 'Unsa ang update sa bagyo?',
    ],
    english:
      `I don't have live weather data. For forecasts and storm signals, check PAGASA (pagasa.dost.gov.ph); for local advisories, evacuations and class suspensions, follow the LGU's Facebook page (facebook.com/MagallanesADNPIO) and the News page of this website. In an emergency, call MERT at ${HOTLINES.mert} or 911.`,
    bisaya:
      `Wala koy live nga datos sa panahon. Para sa forecast ug signal sa bagyo, tan-awa ang PAGASA (pagasa.dost.gov.ph); para sa lokal nga abiso, pagbakwit ug suspension sa klase, sunda ang Facebook page sa LGU (facebook.com/MagallanesADNPIO) ug ang News page niining website. Kung emergency, tawag sa MERT sa ${HOTLINES.mert} o 911.`,
  },
];

// Keyword routing. Each test is specific to its topic so it can run before the agent's answer
// is trusted; the order puts the narrower topics first.
const FEE = /\b(how\s*much|magkano|tag\s*pila|tagpila|pila|bayad|fees?|cost)\b/i;
// "pila ka adlaw" counts days, it does not ask a price.
const asksFee = (q) => FEE.test(q) && !/\bpila\s*(na\s*)?ka\b/i.test(q);
// A question about the person who holds an office ("Who is the assessor?") belongs to officials.js.
const asksPerson = (q) =>
  /\b(name|ngalan|head|hepe|nangulo)\b/i.test(q) || (/\b(who|kinsa|kinsay)\b/i.test(q) && !/\b(issues?|naghatag|signs?|mopirma|pirma|qualif\w*|pwede)\b/i.test(q));
const FARM = /\b(farm\w*|mag-?uuma|crops?|tanom|humay\w*|rice|corn|mais|fisherfolk|mangingisda|baboy|hayop|livestock)\b/i;
const ROUTES = [
  ['property.clearance.inquire', (q) => (/\btax\s*clearance\b/i.test(q) || (/\b(certificate|certification|pamatuod)\b/i.test(q) && /\bamilyar\b/i.test(q) && /\b(paid|bayad\s*na)\b/i.test(q))) && !/\b(business|negosyo)\b/i.test(q)],
  // "how about the assessor?" in an officials thread asks for the person; the office alone does not.
  ['property.declaration.inquire', (q) =>
    (/\b(tax\s*dec\w*|declaration|declare|pag-?declare|assessment|assessed|no\s*improvement)\b/i.test(q) || (/\bassessor'?s?\b/i.test(q) && /\b(office|opisina)\b/i.test(q))) &&
    !asksPerson(q) && !/\b(business|negosyo|permit)\b/i.test(q)],
  ['property.transfer.inquire', (q) => /\btransfer\s*tax\b/i.test(q) || (/\b(transfer\w*|pag-?transfer|ibalhin|pagbalhin|ilisan|pag-?ilis)\b/i.test(q) && /\b(title|titulo|land|yuta|lot)\b/i.test(q))],
  ['property.tax.inquire', (q) => /\b(real\s*property\s*tax|amilyar|amilyaro|land\s*tax|property\s*tax)\b/i.test(q)],
  ['psa.certificate.inquire', (q) => /\b(psa|nso|cenomar|cenodeath|certificate\s*of\s*no\s*marriage)\b/i.test(q) && !/\bnegative\b/i.test(q)],
  ['civil.registry.death.registration.inquire', (q) =>
    (/\bburial\s*permit\b|\btransfer\s*permit\b|\bpermit\s*(sa|para\s*sa)\s*(paglubong|lubong)\b|\bpermit\s*to\s*bury\b/i.test(q) ||
      (/\b(sign\w*|mopirma|pirma)\b/i.test(q) && /\bdeath\s*cert\w*\b/i.test(q)) ||
      (/\b(regist\w*|\w*rehistro|requirements?|died|namatay|bury|ilubong)\b/i.test(q) && /\b(death|namatay|died|mother|father|amahan|inahan)\b/i.test(q) && /\b(regist\w*|\w*rehistro|bury|ilubong|buhaton|do\s*i\s*need|need\s*to\s*do)\b/i.test(q))) &&
    !asksFee(q)],
  ['civil.registry.first-name.inquire', (q) => (/\bfirst\s*name\b/i.test(q) && /\b(change|usab|usbon|ilis\w*|palit|nickname|legal)\b/i.test(q)) || (/\b(usbon|ilisan|pag-?usab|pag-?ilis)\b.*\bngalan\b/i.test(q) && !/\b(sayop|mali|spelling)\b/i.test(q))],
  ['civil.registry.father-surname.inquire', (q) => /\bausf\b/i.test(q) || (/\b(apelyido|surname|last\s*name|acknowledge\w*|pag-?acknowledge)\b/i.test(q) && /\b(father|amahan|papa|tatay)\b/i.test(q)) || /\b(paternity|legitimat\w*)\b/i.test(q)],
  ['civil.registry.wedding.inquire', (q) =>
    /\b(solemni\w*|civil\s*wedding|kasal\s*sa\s*mayor|officiate)\b/i.test(q) ||
    (/\bmayor\b/i.test(q) && /\b(wedding|kasal|marry|married|magkasal|ikasal|mokasal|pagpakasal|magpakasal)\b/i.test(q)) ||
    (/\b(saksi|witness\w*)\b/i.test(q) && /\b(kasal|wedding|marriage)\b/i.test(q))],
  ['social.pwd-id.inquire', (q) => /\b(pwd|persons?\s*with\s*disabilit\w*|kapansanan)\b/i.test(q)],
  ['social.solo-parent.inquire', (q) => /\bsolo\s*parent\b/i.test(q)],
  ['social.4ps.inquire', (q) => /\b(4\s*ps|4p'?s|pantawid)\b/i.test(q)],
  ['social.assistance.inquire', (q) =>
    /\b(burial|medical|financial|educational|hospital)\s*(assistance|help|aid)\b|\baics\b|\bguarantee\s*letter\b|\btabang\s*(sa|para\s*sa)\s*(lubong|ospital|tambal|bayronon)\b|\btabang\s*pinansyal\b|\bhelp\s*with\s*(hospital|medical)\s*bills?\b/i.test(q)],
  ['clearance.police.inquire', (q) => /\bpolice\s*clearance\b|\bclearance\s*sa\s*pulis\b/i.test(q)],
  ['clearance.nbi.inquire', (q) => /\bnbi\b/i.test(q)],
  ['agri.insurance.inquire', (q) => /\b(crop\s*insurance|pcic|livestock\s*insurance)\b/i.test(q) || (/\b(insur\w*|pag-?insure)\b/i.test(q) && (FARM.test(q) || /\b(claim|bagyo|typhoon)\b/i.test(q)))],
  ['agri.rsbsa.inquire', (q) =>
    /\b(rsbsa|binhi|abono|fertili[sz]ers?)\b/i.test(q) || (/\bseeds?\b/i.test(q) && /\b(farm\w*|free|libre)\b/i.test(q)) ||
    (/\b(farmers?|mag-?uuma)\b/i.test(q) && /\b(regist\w*|\w*parehistro|help|tabang|assistance|department\s*of\s*agriculture)\b/i.test(q))],
  ['agri.fisherfolk.inquire', (q) => /\b(fishr|boatr|fisherfolk)\b/i.test(q) || (/\b(baroto|bangka|banca|fishing\s*boat|boat|mangingisda|fishermen)\b/i.test(q) && /\b(regist\w*|\w*rehistro|id|license)\b/i.test(q))],
  ['env.burning.inquire', (q) => /\b(\w*sunog\w*|burn\w*)\b/i.test(q) && /\b(basura|garbage|trash|waste|dahon|leaves|plastik|plastic)\b/i.test(q)],
  ['env.tree-cutting.inquire', (q) => /\btree\s*cutting\b/i.test(q) || (/\b(cut|cutting|putol|pagputol|putlon|mamutol)\b/i.test(q) && /\b(trees?|kahoy|lubi|coconut)\b/i.test(q))],
  ['jobs.spes-tupad.inquire', (q) =>
    /\b(spes|tupad)\b|\bpeso\s*(office|opisina)\b|\basa\s*ang\s*peso\b|\bwhere\s*is\s*the\s*peso\b|\bpublic\s*employment\s*service\b|\b(summer|student)\s*jobs?\b|\btrabaho\s*(para\s*)?sa\s*(mga\s*)?estudyante\b|\bemergency\s*employment\b/i.test(q)],
  ['utilities.electricity.inquire', (q) => /\b(brownout|power\s*(outage|interruption)|electricity|electric\s*(bill|connection)|kuryente|aneco)\b/i.test(q)],
  ['places.hospital.inquire', (q) => /\b(hospitals?|ospital|patients?|pasyente)\b/i.test(q) && !/\b(assistance|bills?|bayronon|tabang)\b/i.test(q)],
  ['about.language.inquire', (q) =>
    (/\b(language|dialect|lengguwahe|pinulongan|sinultihan)\b/i.test(q) && /\b(people|residents|tawo|taga|magallanes|local|spoken|diri|here|main)\b/i.test(q)) ||
    (/\b(speak|spoken|understand|kasabot|gisulti)\b/i.test(q) && /\b(tagalog|english|butuanon|cebuano|bisaya|higaonon)\b/i.test(q) && /\b(people|tawo|residents|magallanes)\b/i.test(q))],
  ['tourism.best-time.inquire', (q) => /\b(best\s*(time|month|season)|weather\s*like|rainy\s*season|dry\s*season|ting-?ulan|ting-?init|climate|klima|maayong\s*panahon|maayo\s*mobisita|maayo\s*moadto|ulanon|rainy|what\s*month|unsa\s*nga\s*bulan)\b/i.test(q)],
  ['education.schools.inquire', (q) => /\b(schools?|eskwelahan|tunghaan|high\s*school)\b/i.test(q) && !/\b(certificate|cert|scholar\w*)\b/i.test(q)],
  ['disaster.weather.inquire', (q) => /\b(weather|typhoons?|bagyo|storm|pagasa|forecast)\b/i.test(q) || /\bpanahon\s*karon\b/i.test(q)],
];

/** The public-service intent a question is plainly about, or '' when it names none. */
export function publicTopic(q) {
  const hit = ROUTES.find(([, test]) => test(q));
  return hit ? hit[0] : '';
}

const ROUTE_OF = Object.fromEntries(ROUTES);
/** True for the intents in this file. */
export const isPublicIntent = (intent = '') => Boolean(ROUTE_OF[intent]);
/** An agent match on one of these intents stands only when the question names its topic. */
export const publicGuardPasses = (intent, q) => !ROUTE_OF[intent] || ROUTE_OF[intent](q);

export const PUBLIC_INTENTS = ENTRIES.map(({ name, phrases, english, bisaya }) => ({ name, phrases, english, bisaya }));

/** Intent → { english, bisaya }, in the shape responses.js's INTENT_RESPONSES uses. */
export const PUBLIC_RESPONSES = Object.fromEntries(ENTRIES.map(({ name, english, bisaya }) => [name, { english, bisaya }]));
