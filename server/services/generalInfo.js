// server/services/generalInfo.js
//
// Tourism & events, office information, and small talk — the topics answerable from public
// sources without data from the LGU. Like officials.js, this is the single source for both the
// Dialogflow intents (scripts/build-dialogflow-intents.mjs) and the chat server's replies.
//
// Sources (checked October 2026):
//   - Wikipedia, "Magallanes, Agusan del Norte": RA 5660 (21 June 1969), fiesta on the third
//     Saturday of October, Lisagan Festival on the following Sunday, attractions, 2024 census
//     population, ZIP 8604, area code 085, Magellan Shrine at Poblacion near the Municipal Hall.
//   - PhilAtlas (Magallanes): land area 44.31 km², 8 barangays, 7.47 km from Butuan City.
//   - DENR Caraga: the ~500-year-old Bitaug tree, 290 cm in diameter.
//   - localphilippines.com: Lisagan Festival "showcasing Mamanwa dances and healing rituals".
//   - src/data/tourism.ts (the website's own sourced tourism content).
//   - Negosyo Center Magallanes (2026 post): compressed work week, Mon–Thu 7:00 AM–6:00 PM.
//   - Mayor's Office contact card supplied by the LGU (see MAYORS_OFFICE in officials.js).
//   - Public market (checked 28 Oct 2026): Mapcarta lists "Magallanes Public Market" in Barangay
//     Santo Rosario, near the Nuestra Señora del Rosario Parish; the Wikimedia Commons photo
//     "MAGALLANES PUBLIC MARKET (AUGUST 19, 2019)" says it opened in 2017. Stalls go through the
//     MEEDMO (BPLO checklist, see businessPermit.js).
//   - Places to stay (checked 28 Oct 2026): "Horizon Bay Resort & Events Place", P-4 Brgy. Sto.
//     Niño (Waze); listed as "Horizon's Bay", 0917 717 7985, in the DOT-accredited accommodation
//     list (Detourista, updated June 2023); Facebook page "Horizon BAY" (beachfront, staycation,
//     events). Hotel listings labelled "Magallanes" on Trip.com and Travelmyth turned out to be in
//     Butuan City or Buenavista; no hotel, inn or motel was found in Magallanes itself. Centennial
//     Beach Resort: across from the Bitaug tree, small pool and cottages (katrinakaren.com,
//     30 Aug 2011) and still listed on WorldPlaces — current status unconfirmed. Butuan inns and
//     hotels: names, addresses and numbers from the same 2023 DOT-accredited list.
import { MAYORS_OFFICE, SB_EMAIL } from './officials.js';

const MAYOR_EMAIL = MAYORS_OFFICE.email;

// The LGU's public information page, as linked from the website (src/data/site.ts, SOCIAL_LINKS).
const FACEBOOK_PAGE = 'facebook.com/MagallanesADNPIO';

// True once the LGU adopts the site (same switch as the website's VITE_OFFICIAL_SITE); until then
// Bitoy says plainly that this is a capstone project, not the LGU's official website.
const OFFICIAL_SITE = process.env.OFFICIAL_SITE === 'true';

// Emergency hotlines as painted on the LGU's "EMERGENCY HOTLINE No." sign, photographed by the
// capstone team (October 2026). The PNP number's first digit was hidden by a pole; Philippine
// mobile numbers are 11 digits starting 09, and the 10 visible digits start with 9.
// 911 is the national emergency hotline. Keep src/data/site.ts (EMERGENCY_HOTLINES) in step.
export const HOTLINES = { mert: '0938 759 1508', bfp: '0931 721 8881', pnp: '0947 994 4405' };
const HOTLINES_EN = `• MERT (emergency response and rescue): ${HOTLINES.mert}\n• BFP (fire): ${HOTLINES.bfp}\n• PNP (police): ${HOTLINES.pnp}\n• National emergency hotline: 911`;
const HOTLINES_CEB = `• MERT (emergency response ug rescue): ${HOTLINES.mert}\n• BFP (sunog): ${HOTLINES.bfp}\n• PNP (pulis): ${HOTLINES.pnp}\n• National emergency hotline: 911`;

// Confirm with the LGU which schedule is current, then simplify this to the one that applies.
const OFFICE_HOURS = {
  english:
    'Government offices normally open Monday to Friday, 8:00 AM to 5:00 PM. In 2026 the LGU announced a compressed work week as an energy-saving measure: Monday to Thursday, 7:00 AM to 6:00 PM, with no office on Friday. Please check the latest LGU announcement before you go.',
  bisaya:
    'Ang mga opisina sa gobyerno kasagarang abri Lunes hangtod Biyernes, 8:00 AM hangtod 5:00 PM. Niadtong 2026, nagpahibalo ang LGU og compressed work week aron makadaginot sa kuryente: Lunes hangtod Huwebes, 7:00 AM hangtod 6:00 PM, ug walay opisina sa Biyernes. Palihug susiha ang pinakabag-ong pahibalo sa LGU sa dili pa ka moadto.',
};

const CAPABILITIES = {
  english:
    'I can help with:\n• Business permits — requirements, DTI/SEC/CDA registration, fees, processing time, renewal and its deadline, BFP and MEEDMO clearances\n• Building permits\n• Barangay clearance and cedula\n• Civil registry — newborn and late birth registration, marriage license, death certificate, correcting a birth certificate, and their fees\n• Health — health cards, lab tests and the sanitary permit for businesses, PhilHealth\'s YAKAP, health certificates, prenatal check-ups, animal bites, and the senior citizens\' office\n• Real property tax, tax declarations and land title transfers\n• PSA copies and CENOMAR, police and NBI clearances, PWD and solo parent IDs, 4Ps and financial assistance\n• Farmers and fisherfolk (RSBSA, boat registration, crop insurance)\n• Municipal officials, the organizational structure, and barangay captains\n• Office hours and the Municipal Hall location\n• The public market and places to stay\n• Tourist spots, the town fiesta and the Lisagan Festival\nYou can ask in English or Bisaya.',
  bisaya:
    'Makatabang ko bahin sa:\n• Business permit — requirements, rehistro sa DTI/SEC/CDA, bayad, kadugayon, renewal ug deadline niini, clearance sa BFP ug MEEDMO\n• Building permit\n• Barangay clearance ug cedula\n• Civil registry — pagparehistro sa bag-ong natawo ug late registration, marriage license, death certificate, pag-correct sa birth certificate, ug ang mga bayad niini\n• Panglawas — health card, lab test ug sanitary permit para sa negosyo, YAKAP sa PhilHealth, health certificate, prenatal check-up, kagat sa hayop, ug opisina sa senior citizen\n• Amilyar, tax declaration ug pag-transfer sa titulo sa yuta\n• PSA ug CENOMAR, police ug NBI clearance, PWD ug solo parent ID, 4Ps ug tabang pinansyal\n• Mag-uuma ug mangingisda (RSBSA, rehistro sa baroto, crop insurance)\n• Mga opisyal sa munisipyo, ang istruktura sa gobyerno, ug mga kapitan sa barangay\n• Oras sa opisina ug asa ang Municipal Hall\n• Ang public market ug mga kapuy-an\n• Mga tourist spot, piyesta, ug Lisagan Festival\nPwede ka mangutana sa English o Bisaya.',
};

export const GENERAL_INTENTS = [
  // --- Tourism & events ---
  {
    name: 'tourism.spots.inquire',
    phrases: [
      'What are the tourist spots in Magallanes?', 'Tourist attractions in Magallanes', 'What can I visit in Magallanes?',
      'Where can I go in Magallanes?', 'Places to visit in Magallanes', 'What are the best places to see here?',
      'Is there anything to see in Magallanes?', 'Recommend a place to visit', 'What is Magallanes known for?',
      'Unsa ang mga tourist spot sa Magallanes?', 'Asa ko pwede mamasyal sa Magallanes?', 'Unsa ang nindot nga adtoan diri?',
      'Naa bay tourist spot sa Magallanes?', 'Asa ang mga nindot nga lugar sa Magallanes?', 'Unsa ang ikapasigarbo sa Magallanes?',
      'Saan magandang pumunta sa Magallanes?', 'Tourist spots', 'Pasyalan sa Magallanes',
    ],
    english:
      'Places to visit in Magallanes:\n• Magellan Shrine (Poblacion) — the 1872 marker of the 1521 Mass\n• Philippine Centennial Bitaug Tree (Caloc-an) — about 500 years old\n• Magallanes Bay Walk (Poblacion) — waterfront promenade, best at sunset\n• Agusan & Baug River Delta — boat trips through the delta channels\n• Nuestra Señora del Rosario Parish (Poblacion)\n• Poblacion town centre — Municipal Hall and public market\n• Guiasan Bridge\nAsk me about any of them, or see the Tourism page on this website.',
    bisaya:
      'Mga lugar nga pwede bisitahan sa Magallanes:\n• Magellan Shrine (Poblacion) — ang marker sa 1521 nga Misa, gitukod niadtong 1872\n• Philippine Centennial Bitaug Tree (Caloc-an) — mga 500 ka tuig na\n• Magallanes Bay Walk (Poblacion) — baybayon nga lakaw-lakawan, nindot sa pagsalop sa adlaw\n• Agusan ug Baug River Delta — sakay sa baroto agi sa mga sapa\n• Nuestra Señora del Rosario Parish (Poblacion)\n• Poblacion town centre — Municipal Hall ug merkado\n• Guiasan Bridge\nPangutana lang bahin sa bisan asa niini, o tan-awa ang Tourism page niining website.',
  },
  {
    name: 'tourism.magellan-shrine.inquire',
    phrases: [
      'Tell me about the Magellan Shrine', 'What is the Magellan Shrine?', 'Where is the Magellan Shrine?',
      'History of the Magellan Shrine', 'Magellan Shrine', 'Is the first mass in Mindanao held in Magallanes?',
      'Did Magellan land in Magallanes?', 'Why is the town named Magallanes?', 'What happened in Magallanes in 1521?',
      'Where was the first mass in Mindanao?', 'Unsa ang Magellan Shrine?', 'Asa ang Magellan Shrine?',
      'Asa dapit ang Magellan Shrine?', 'Kasaysayan sa Magellan Shrine', 'Ngano Magallanes ang ngalan sa lungsod?',
      'Diri ba ang unang misa sa Mindanao?', 'Is there an entrance fee at the Magellan Shrine?',
    ],
    english:
      "The Magellan Shrine stands in Poblacion, near the Municipal Hall, close to where the Agusan River meets Butuan Bay. The marker, erected in 1872, commemorates a Mass held on 8 April 1521 by Ferdinand Magellan's expedition — the town is named after him (Magallanes is the Spanish form of Magellan). Magallanes and Butuan have long claimed the first Catholic Mass in Mindanao, while the National Historical Commission recognises Limasawa, Southern Leyte, as the site of the first Mass in the Philippines. There is no entrance fee.",
    bisaya:
      'Ang Magellan Shrine naa sa Poblacion, duol sa Municipal Hall, diin ang Agusan River motagbo sa Butuan Bay. Ang marker, gitukod niadtong 1872, naghandom sa Misa niadtong Abril 8, 1521 sa ekspedisyon ni Ferdinand Magellan — gikan sa iyang ngalan ang Magallanes (Espanyol nga porma sa Magellan). Dugay nang giingon sa Magallanes ug Butuan nga diri ang unang Misa sa Mindanao, apan ang National Historical Commission miila sa Limasawa, Southern Leyte, isip dapit sa unang Misa sa Pilipinas. Walay entrance fee.',
  },
  {
    name: 'tourism.centennial-tree.inquire',
    phrases: [
      'Tell me about the Centennial Tree', 'Where is the Bitaug tree?', 'What is the Philippine Centennial Tree?',
      'How old is the Bitaug tree?', 'Oldest tree in the Philippines', 'Centennial Bitaug Tree',
      'Where can I see the old Bitaug tree?', 'Is the Centennial Tree in Caloc-an?', 'Bitaog tree Magallanes',
      'What happened to the Centennial Tree?', 'Asa ang Centennial Tree?', 'Asa ang Bitaug sa Magallanes?',
      'Pila na ka tuig ang Bitaug?', 'Unsa ang Philippine Centennial Tree?', 'Asa makita ang karaan nga Bitaug?',
      'Ang Bitaug sa Caloc-an', 'Tell me about the Bitaug',
    ],
    english:
      'The Philippine Centennial Tree is a Bitaug (Calophyllum inophyllum) in Barangay Caloc-an. The DENR declared it a Philippine Centennial Tree in 1998; it is estimated at around 500 years old with a trunk about 290 cm in diameter, making it one of the oldest known trees in the country. It lost large branches in June 2017. Fireflies gather in the area at dusk. It is reachable by tricycle or habal-habal from Poblacion, and there is no entrance fee.',
    bisaya:
      'Ang Philippine Centennial Tree usa ka Bitaug (Calophyllum inophyllum) sa Barangay Caloc-an. Gideklarar kini sa DENR nga Philippine Centennial Tree niadtong 1998; mga 500 ka tuig na kini ug mga 290 cm ang diyametro sa punoan, usa sa pinakakaraan nga kahoy sa nasud. Nabali ang dagkong sanga niini niadtong Hunyo 2017. Daghang aninipot sa palibot inig kagabhion. Maadto kini pinaagi sa tricycle o habal-habal gikan sa Poblacion, ug walay entrance fee.',
  },
  {
    name: 'tourism.baywalk.inquire',
    phrases: [
      'Tell me about the Bay Walk', 'Where is the Magallanes Bay Walk?', 'Is there a baywalk in Magallanes?',
      'Where can I watch the sunset?', 'Magallanes Bay Walk', 'Where do people hang out in the afternoon?',
      'Is the Bay Walk free?', 'What can I do at the Bay Walk?', 'Where is the seawall?',
      'Asa ang Bay Walk?', 'Naa bay baywalk sa Magallanes?', 'Asa nindot motan-aw sa sunset?',
      'Libre ba sa Bay Walk?', 'Asa ang seawall sa Magallanes?', 'Asa pwede mag-jogging sa Magallanes?',
      'Baywalk Magallanes',
    ],
    english:
      'The Magallanes Bay Walk runs along the Poblacion waterfront where the Agusan River opens into Butuan Bay, within walking distance of the Municipal Hall, the Magellan Shrine and the parish church. It is busiest in the early morning (joggers) and late afternoon, when families gather and the fishing boats come in — the sunset over the bay is the main draw. It is free and open to the public.',
    bisaya:
      'Ang Magallanes Bay Walk naa sa baybayon sa Poblacion diin ang Agusan River mosulod sa Butuan Bay, lakaw-lakawon ra gikan sa Municipal Hall, Magellan Shrine, ug simbahan. Daghang tawo sa sayo sa buntag (nag-jogging) ug sa hapon, inig abot sa mga mangingisda — ang pagsalop sa adlaw sa bay ang pinakanindot. Libre ug abri sa publiko.',
  },
  {
    name: 'tourism.river-delta.inquire',
    phrases: [
      'Tell me about the Agusan River', 'Can I take a boat tour in Magallanes?', 'How do I book a boat ride?',
      'Is there a river tour?', 'Agusan River delta', 'Where can I ride a boat?',
      'How much is a boat tour?', 'Can we go to the mangroves?', 'Is the Agusan River the widest in Mindanao?',
      'Naa bay boat tour sa Magallanes?', 'Unsaon pag-arkila og baroto?', 'Pila ang bayad sa baroto?',
      'Asa pwede musakay og baroto?', 'Pwede ba mi moadto sa katunggan?', 'Agusan River sa Magallanes',
      'Naa bay river tour?',
    ],
    english:
      'Magallanes sits at the mouth of the Agusan and Baug rivers — the Agusan is described as the widest navigable river in Mindanao. Boat trips along the river and through the delta and mangrove channels are arranged directly with the barangay fisherfolk associations, not through commercial operators, so the fare is negotiated with them. Ask at the Poblacion fish landing or the Municipal Hall. Life vests are required for all passengers, including children. March to June usually has the calmest water.',
    bisaya:
      'Ang Magallanes naa sa baba sa Agusan ug Baug river — ang Agusan giila nga pinakalapad nga sapa nga malawig sa Mindanao. Ang pagsakay sa baroto sa sapa ug sa mga katunggan gi-arrange direkta sa mga fisherfolk association sa barangay, dili sa commercial operator, mao nga sila ang kasabot sa bayad. Pangutana sa fish landing sa Poblacion o sa Municipal Hall. Kinahanglan og life vest ang tanang pasahero, apil ang mga bata. Kasagaran kalmado ang tubig gikan Marso hangtod Hunyo.',
  },
  {
    name: 'tourism.parish.inquire',
    phrases: [
      'Where is the church in Magallanes?', 'Tell me about the Nuestra Señora del Rosario Parish', 'Who is the patron saint of Magallanes?',
      'Who is the patroness of Magallanes?', 'Catholic church in Magallanes', 'Where is the parish church?',
      'What is the name of the church in Magallanes?', 'Nuestra Señora del Rosario Parish', 'Is there a church near the Bay Walk?',
      'Asa ang simbahan sa Magallanes?', 'Kinsa ang patron sa Magallanes?', 'Unsa ang ngalan sa simbahan sa Magallanes?',
      'Asa ang parokya?', 'Asa ang Nuestra Señora del Rosario?', 'Kinsa ang patrona sa lungsod?',
      'Simbahan sa Poblacion',
    ],
    english:
      'The parish church is the Nuestra Señora del Rosario Parish in Poblacion, a short walk from the Bay Walk and the Magellan Shrine. Our Lady of the Rosary is the patroness of Magallanes; her fiesta falls on the third Saturday of October. For Mass schedules, please ask the parish office directly.',
    bisaya:
      'Ang simbahan mao ang Nuestra Señora del Rosario Parish sa Poblacion, duol ra sa Bay Walk ug Magellan Shrine. Ang Nuestra Señora del Rosario ang patrona sa Magallanes; ang iyang piyesta kada ikatulong Sabado sa Oktubre. Para sa iskedyul sa Misa, palihug pangutana direkta sa parish office.',
  },
  {
    name: 'tourism.getting-there.inquire',
    phrases: [
      'How do I get to Magallanes?', 'How far is Magallanes from Butuan?', 'How to go to Magallanes from Butuan City?',
      'What is the nearest airport to Magallanes?', 'Is there a bus to Magallanes?', 'Directions to Magallanes',
      'How do I travel to Magallanes?', 'Can I take a boat from Butuan to Magallanes?', 'How do I get around in Magallanes?',
      'Unsaon pag-adto sa Magallanes?', 'Unsa kalayo ang Magallanes gikan sa Butuan?', 'Unsa ang sakyanan paingon sa Magallanes?',
      'Asa ang pinakaduol nga airport?', 'Unsaon pag-adto diri gikan sa Butuan?', 'Naa bay byahe sa baroto gikan Butuan?',
      'Paano pumunta sa Magallanes?',
    ],
    english:
      'Magallanes is just north of Butuan City (about 7.5 km in a straight line). You can come by road from Butuan, or by boat along the Agusan River (about 45 minutes). The nearest airport is Bancasi Airport in Butuan City; Laguindingan Airport (Cagayan de Oro) is farther. Around town, tricycles serve the Poblacion and nearby barangays, and habal-habal reaches the upland barangays.',
    bisaya:
      'Ang Magallanes naa ra sa amihanan sa Butuan City (mga 7.5 km kung diretso). Pwede ka moadto pinaagi sa dalan gikan Butuan, o sakay sa baroto agi sa Agusan River (mga 45 minutos). Ang pinakaduol nga airport mao ang Bancasi Airport sa Butuan City; mas layo ang Laguindingan Airport (Cagayan de Oro). Sa lungsod, naay tricycle sa Poblacion ug duol nga barangay, ug habal-habal paingon sa mga barangay sa bukid.',
  },
  {
    name: 'places.market.inquire',
    phrases: [
      'Where is the public market?', 'Where is the market in Magallanes?', 'Is there a public market in Magallanes?',
      'Where can I buy fish and vegetables?', 'Magallanes public market location', 'When did the public market open?',
      'What time does the public market open?', 'How do I get to the public market?', 'Tell me about the Magallanes public market',
      'Asa ang merkado?', 'Asa dapit ang public market?', 'Naa bay merkado sa Magallanes?', 'Asa makapalit og isda ug utanon?',
      'Asa ang palengke sa Magallanes?', 'Unsaon pag-adto sa merkado?', 'Kanus-a giablihan ang merkado?', 'Pila ka oras abri ang merkado?',
      'asa man ang tiangge diri', 'asa ang market diri', 'unsa nga barangay ang merkado', 'Saan ang palengke sa Magallanes?',
    ],
    english:
      'The Magallanes Public Market is in the town centre, near the Nuestra Señora del Rosario Parish — map listings place it in Barangay Santo Rosario, within walking distance of the Municipal Hall in Poblacion. It opened in 2017. Vendors who want a stall or space at the market get their clearance from the MEEDMO (Municipal Economic Enterprises Development and Management Office) before applying for a business permit. For market days, opening hours and stall rates, please ask the MEEDMO at the Municipal Hall.',
    bisaya:
      'Ang Magallanes Public Market naa sa sentro sa lungsod, duol sa Nuestra Señora del Rosario Parish — sa mga mapa, naa kini sa Barangay Santo Rosario, mabaktas ra gikan sa Municipal Hall sa Poblacion. Giablihan kini niadtong 2017. Ang mga tindera nga gusto og puesto o luna sa merkado mokuha og clearance sa MEEDMO (Municipal Economic Enterprises Development and Management Office) sa dili pa mag-apply og business permit. Para sa mga adlaw sa merkado, oras sa pag-abri, ug bayad sa puesto, palihug pangutana sa MEEDMO sa Munisipyo.',
  },
  {
    name: 'tourism.accommodation.inquire',
    phrases: [
      'Are there hotels in Magallanes?', 'Where can I stay in Magallanes?', 'Is there an inn or motel here?', 'Hotels near Magallanes',
      'Where can we stay overnight?', 'Is there a resort in Magallanes?', 'Lodging in Magallanes', 'Is there a place to sleep in town?',
      'Tell me about Horizon Bay Resort', 'Is there a beach resort in Magallanes?', 'Naa bay hotel sa Magallanes?',
      'Asa mi pwede mopuyo og usa ka gabii?', 'Naa bay inn o motel diri?', 'Asa makatulog ang mga bisita?', 'Naa bay resort sa Magallanes?',
      'Asa ang pinakaduol nga hotel?', 'Naa bay lodging house diri?', 'Asa pwede mag overnight sa Magallanes?', 'Naa bay pension house sa Magallanes?',
      'naa bay beach resort diri', 'May hotel ba sa Magallanes?', 'Saan pwedeng matulog sa Magallanes?',
    ],
    english:
      'No hotels, inns or motels are listed in Magallanes itself. Places to stay in town:\n• Horizon Bay Resort & Events Place — beachfront resort with staycation rentals, Purok 4, Barangay Santo Niño (0917 717 7985; on Facebook as "Horizon BAY"). The only Magallanes entry on the DOT-accredited accommodation list.\n• Centennial Beach Resort — across from the Centennial Bitaug Tree in Caloc-an, with cottages and a small pool for day visits (please check that it is open).\n\nThe nearest inns and hotels are in Butuan City, about 7.5 km away (DOT-accredited, 2023 list):\n• Wayfarer Pension House — T. Calo Ext., Limaha (0947 998 3604)\n• Casa Mia Lodging House — San Ignacio (0919 877 5982)\n• Panyers House Bed and Breakfast — Jose Rizal (0927 281 0874)\n• Almont Hotel — San Jose St. ((085) 342-5464)\n• Hotel Oazis — J.C. Aquino Ave. ((085) 341-9788)\n• Go Hotels Butuan — J.C. Aquino Ave. ((085) 341-1570)\nPlease call ahead to confirm rates and availability.',
    bisaya:
      'Walay hotel, inn o motel nga nakalista sa Magallanes mismo. Mga kapuy-an sa lungsod:\n• Horizon Bay Resort & Events Place — beachfront resort nga naay staycation, Purok 4, Barangay Santo Niño (0917 717 7985; sa Facebook isip "Horizon BAY"). Kini ra ang taga-Magallanes sa listahan sa DOT-accredited nga kapuy-an.\n• Centennial Beach Resort — atbang sa Centennial Bitaug Tree sa Caloc-an, naay cottage ug gamay nga pool para sa day visit (palihug susiha kung abri ba).\n\nAng pinakaduol nga inn ug hotel naa sa Butuan City, mga 7.5 km ang gilay-on (DOT-accredited, listahan sa 2023):\n• Wayfarer Pension House — T. Calo Ext., Limaha (0947 998 3604)\n• Casa Mia Lodging House — San Ignacio (0919 877 5982)\n• Panyers House Bed and Breakfast — Jose Rizal (0927 281 0874)\n• Almont Hotel — San Jose St. ((085) 342-5464)\n• Hotel Oazis — J.C. Aquino Ave. ((085) 341-9788)\n• Go Hotels Butuan — J.C. Aquino Ave. ((085) 341-1570)\nPalihug tawag daan aron makumpirma ang presyo ug kung naa pay bakante.',
  },
  {
    name: 'events.fiesta.inquire',
    phrases: [
      'When is the Magallanes town fiesta?', 'When is the fiesta?', 'What is the date of the fiesta in Magallanes?',
      'When is the feast of Nuestra Señora del Rosario?', 'Town fiesta schedule', 'Is there a fiesta in October?',
      'What happens during the fiesta?', 'When is the patronal fiesta?', 'Magallanes fiesta date',
      'Kanus-a ang piyesta sa Magallanes?', 'Kanus-a ang fiesta?', 'Unsa nga petsa ang piyesta?',
      'Kanus-a ang piyesta sa Nuestra Señora del Rosario?', 'Unsay naa sa piyesta?', 'Kanus-a ang pista sa lungsod?',
      'Kailan ang pista sa Magallanes?', 'Fiesta sa Magallanes',
    ],
    english:
      'The Magallanes town fiesta honours the patroness, Nuestra Señora del Rosario (Our Lady of the Rosary), every third Saturday of October. It features a thanksgiving Mass, parades and other events. The Lisagan Festival follows on the Sunday after the fiesta.',
    bisaya:
      'Ang piyesta sa Magallanes para sa patrona, Nuestra Señora del Rosario, kada ikatulong Sabado sa Oktubre. Naay thanksgiving Mass, parada, ug uban pang kalihokan. Ang Lisagan Festival sunod dayon sa Domingo human sa piyesta.',
  },
  {
    name: 'events.lisagan.inquire',
    phrases: [
      'What is the Lisagan Festival?', 'When is the Lisagan Festival?', 'Tell me about the Lisagan Festival',
      'Lisagan Festival', 'What festivals are there in Magallanes?', 'Is there a festival in Magallanes?',
      'Is there street dancing in Magallanes?', 'When is the fluvial procession?', 'What happens during Lisagan?',
      'Unsa ang Lisagan Festival?', 'Kanus-a ang Lisagan?', 'Kanus-a ang Lisagan Festival?',
      'Naa bay festival sa Magallanes?', 'Kanus-a ang fluvial procession?', 'Unsay himoon sa Lisagan?',
      'Anong festival sa Magallanes?', 'Lisagan',
    ],
    english:
      "The Lisagan Festival is Magallanes' religious festival, held on the Sunday after the town fiesta (the fiesta is every third Saturday of October). It features street dancing through the Poblacion — showcasing Mamanwa dances and healing rituals — followed by a fluvial procession on the Agusan and Baug rivers. The Bay Walk is a good place to watch the procession.",
    bisaya:
      'Ang Lisagan Festival mao ang relihiyosong festival sa Magallanes, himoon sa Domingo human sa piyesta (ang piyesta kada ikatulong Sabado sa Oktubre). Naay street dancing sa Poblacion — nagpakita sa mga sayaw ug healing ritual sa Mamanwa — ug fluvial procession sa Agusan ug Baug river. Nindot motan-aw sa prosesyon gikan sa Bay Walk.',
  },
  {
    name: 'about.history.inquire',
    phrases: [
      'What is the history of Magallanes?', 'When was Magallanes founded?', 'When did Magallanes become a municipality?',
      'Was Magallanes part of Butuan?', 'How old is the municipality of Magallanes?', 'Tell me about Magallanes',
      'What is the origin of the name Magallanes?', 'History of the town', 'Who founded Magallanes?',
      'Unsa ang kasaysayan sa Magallanes?', 'Kanus-a natukod ang Magallanes?', 'Kanus-a nahimong lungsod ang Magallanes?',
      'Kabahin ba sa Butuan ang Magallanes kaniadto?', 'Unsa ang gigikanan sa ngalan nga Magallanes?', 'Sugilon ko bahin sa Magallanes',
      'Kasaysayan sa lungsod',
    ],
    english:
      "Magallanes was formerly part of Butuan and became a separate municipality on 21 June 1969 under Republic Act No. 5660. It is named after Ferdinand Magellan (Magallanes is the Spanish form of his name), whose expedition is held locally to have celebrated Mass here on 8 April 1521 — the event marked by the Magellan Shrine in Poblacion.",
    bisaya:
      'Ang Magallanes kaniadto kabahin sa Butuan ug nahimong kaugalingong lungsod niadtong Hunyo 21, 1969 pinaagi sa Republic Act No. 5660. Gikan ang ngalan kang Ferdinand Magellan (Espanyol nga porma sa iyang ngalan), kansang ekspedisyon gituohan nga nagmisa diri niadtong Abril 8, 1521 — ang hitabo nga gimarkahan sa Magellan Shrine sa Poblacion.',
  },
  {
    name: 'about.facts.inquire',
    phrases: [
      'What is the population of Magallanes?', 'How many people live in Magallanes?', 'How big is Magallanes?',
      'What is the land area of Magallanes?', 'How many barangays are in Magallanes?', 'What are the barangays of Magallanes?',
      'What is the ZIP code of Magallanes?', 'What is the area code of Magallanes?', 'Where is Magallanes located?',
      'Pila ka tawo sa Magallanes?', 'Pila ang populasyon sa Magallanes?', 'Pila ka barangay sa Magallanes?',
      'Unsa ang mga barangay sa Magallanes?', 'Unsa ang ZIP code sa Magallanes?', 'Unsa kadako ang Magallanes?',
      'Asa nahimutang ang Magallanes?', 'List of barangays in Magallanes',
    ],
    english:
      'Magallanes is a municipality in Agusan del Norte, Caraga Region, at the mouth of the Agusan River just north of Butuan City.\n• Population: 22,780 (2024 Census)\n• Land area: 44.31 km²\n• Barangays (8): Buhang, Caloc-an, Guiasan, Marcos, Poblacion, Santo Niño, Santo Rosario, Taod-oy\n• ZIP code: 8604 · Telephone area code: 085',
    bisaya:
      'Ang Magallanes usa ka lungsod sa Agusan del Norte, Caraga Region, sa baba sa Agusan River, amihanan ra sa Butuan City.\n• Populasyon: 22,780 (2024 Census)\n• Gidak-on: 44.31 km²\n• Mga barangay (8): Buhang, Caloc-an, Guiasan, Marcos, Poblacion, Santo Niño, Santo Rosario, Taod-oy\n• ZIP code: 8604 · Area code sa telepono: 085',
  },

  // --- Office information ---
  {
    name: 'office.hours.inquire',
    phrases: [
      'What time does the municipal hall open?', 'What are the office hours?', 'What time does the municipal hall close?',
      'Is the municipal hall open on Saturday?', 'Are you open on Friday?', 'Office hours of the municipality',
      'Is the office open today?', 'Open ba ang munisipyo karon?', 'Is the municipal hall open during lunch break?',
      'Unsa oras moabli ang munisipyo?', 'Unsa oras magsira ang munisipyo?', 'Abri ba ang munisipyo karong Sabado?',
      'Abri ba ang opisina sa Biyernes?', 'Unsa ang oras sa opisina?', 'Kanus-a abri ang munisipyo?',
      'Anong oras bukas ang munisipyo?', 'Office schedule', 'What days is the municipal hall open?',
    ],
    english: OFFICE_HOURS.english,
    bisaya: OFFICE_HOURS.bisaya,
  },
  {
    name: 'office.location.inquire',
    phrases: [
      'Where is the municipal hall?', 'Where is the Magallanes municipal hall located?', 'How do I get to the municipal hall?',
      'Address of the municipal hall', 'Where is the town hall?', 'Location of the municipal office',
      'Where is the LGU office?', 'Directions to the municipal hall', 'What is the address of the municipality?',
      'Asa ang munisipyo?', 'Asa dapit ang munisipyo?', 'Asa nahimutang ang Municipal Hall?',
      'Unsaon pag-adto sa munisipyo?', 'Asa ang opisina sa LGU?', 'Unsa ang address sa munisipyo?',
      'Saan ang munisipyo?', 'Nasaan ang municipal hall?', 'Municipal hall location',
    ],
    english:
      'The Magallanes Municipal Hall is in Barangay Poblacion, Magallanes, Agusan del Norte 8604 — the town centre, near the Magellan Shrine and within walking distance of the Bay Walk and the public market. Any tricycle in town can take you there.',
    bisaya:
      'Ang Magallanes Municipal Hall naa sa Barangay Poblacion, Magallanes, Agusan del Norte 8604 — sa sentro sa lungsod, duol sa Magellan Shrine ug lakaw-lakawon ra gikan sa Bay Walk ug merkado. Bisan unsang tricycle sa lungsod makahatod nimo didto.',
  },
  {
    name: 'office.contact.inquire',
    phrases: [
      'What is the contact number of the municipal hall?', 'How can I contact the municipality?', 'What is the email of the LGU?',
      'Phone number of the municipal hall', 'How do I reach the LGU?', 'Contact information of Magallanes LGU',
      'Telephone number of the municipality', 'Can I call the municipal hall?',
      'Unsa ang contact number sa munisipyo?', 'Unsaon pagkontak sa munisipyo?', 'Unsa ang email sa LGU?',
      'Unsa ang numero sa munisipyo?', 'Pwede ba ko motawag sa munisipyo?', 'Contact sa LGU',
      'Ano ang number ng munisipyo?', 'Municipal hall contact details',
      "What is the mayor's office phone number?", "Mayor's office contact number", 'Who can I call at the municipal hall?',
      'Unsa ang numero sa Mayor\'s Office?', 'Kinsa akong matawagan sa munisipyo?', 'Naa bay cellphone number ang munisipyo?',
      'Does the LGU have a Facebook page?', 'What is the Facebook page of Magallanes?', 'Unsa ang Facebook page sa munisipyo?',
    ],
    english: `Mayor's Office contact person: ${MAYORS_OFFICE.contactPerson}, ${MAYORS_OFFICE.phone}\nMayor's Office email: ${MAYOR_EMAIL}\nVice Mayor & Sangguniang Bayan email: ${SB_EMAIL}\nFacebook page: ${FACEBOOK_PAGE}\n\nYou can also visit the Municipal Hall in Poblacion, or send a concern through the Report a Concern page of this website.\n\nFor emergencies:\n${HOTLINES_EN}`,
    bisaya: `Contact person sa Mayor's Office: ${MAYORS_OFFICE.contactPerson}, ${MAYORS_OFFICE.phone}\nEmail sa Mayor's Office: ${MAYOR_EMAIL}\nEmail sa Vice Mayor ug Sangguniang Bayan: ${SB_EMAIL}\nFacebook page: ${FACEBOOK_PAGE}\n\nPwede sad ka moadto sa Municipal Hall sa Poblacion, o magpadala og concern pinaagi sa Report a Concern page niining website.\n\nKung emergency:\n${HOTLINES_CEB}`,
  },
  // Reporting a problem in the barangay (src/pages/ReportConcern.tsx: concern types, reference
  // number, routed within one working day).
  {
    name: 'report.concern.inquire',
    phrases: [
      'How do I report a damaged road?', 'Where can I report a broken streetlight?', 'How do I report a clogged drainage?',
      'I want to report a problem in our barangay', 'How do I file a complaint about garbage collection?', 'Report a concern',
      'Where do I report a water supply problem?', 'How can I report a peace and order problem?', 'Can I report a concern online?',
      'There is a pothole on our road, who do I tell?', 'How do I report illegal dumping?', 'Where can I send a complaint to the municipality?',
      'Unsaon pag-report sa guba nga dalan?', 'Asa ko mo-report sa patay nga suga sa dalan?', 'Barado ang kanal sa among dalan, asa ko mo-report?',
      'Gusto ko mo-report og problema sa among lugar', 'Asa mo-reklamo bahin sa basura?', 'Unsaon pagreklamo sa munisipyo?',
      'Naay lungag sa dalan, kinsa akong sultihan?', 'Pwede ba mo-report online?', 'Asa mag-report sa problema sa tubig?',
    ],
    english: `To report a damaged road, flooding, a streetlight outage, a water supply or waste collection problem, or a peace-and-order concern, use the Report a Concern page of this website. You get a reference number right away, and the Public Assistance Desk routes your report to the responsible office within one working day. Include the exact location or a landmark.\n\nFor emergencies, don't use the form — call:\n${HOTLINES_EN}`,
    bisaya: `Para mo-report sa guba nga dalan, baha, patay nga suga sa dalan, problema sa tubig o basura, o bahin sa kalinaw ug kahusay, gamita ang Report a Concern page niining website. Makakuha dayon ka og reference number, ug ipadala sa Public Assistance Desk ang imong report sa opisina nga responsable sulod sa usa ka adlaw sa trabaho. Ilakip ang eksaktong lugar o landmark.\n\nKung emergency, ayaw gamita ang form — tawag sa:\n${HOTLINES_CEB}`,
  },
  // Freedom of Information requests (src/pages/FOI.tsx and Transparency.tsx: EO No. 2, s. 2016).
  {
    name: 'foi.request.inquire',
    phrases: [
      'How do I file an FOI request?', 'How can I request a copy of a public document?', 'Freedom of Information request',
      'How do I request government records from the LGU?', 'Who is the FOI receiving officer?', 'How long does an FOI request take?',
      'Can I ask for a copy of the municipal budget?', 'How do I get public records?', 'FOI Magallanes', 'Where do I submit an FOI request?',
      'Is there a fee for FOI requests?', 'Can I request documents online?',
      'Unsaon pag-file og FOI request?', 'Unsaon pagkuha og kopya sa dokumento sa munisipyo?', 'Asa mo-request og public records?',
      'Pila ka adlaw ang FOI request?', 'Kinsa ang FOI receiving officer?', 'Pwede ba mangayo og kopya sa budget sa munisipyo?',
      'Asa isumite ang FOI request?', 'Naa bay bayad ang FOI request?',
    ],
    english: `Any citizen may request official records of the Municipality of Magallanes under Executive Order No. 2, s. 2016:\n1. File a written request naming the records you need and your contact details, addressed to the FOI Receiving Officer (Office of the Mayor, Municipal Hall), or email ${MAYOR_EMAIL}.\n2. Your request is acknowledged within the same working day.\n3. A decision is issued within 15 working days.\n4. Approved records are released in the format you asked for where feasible, subject to reasonable reproduction fees.\nYou can also use the national eFOI portal (foi.gov.ph). The FOI page of this website has the details.`,
    bisaya: `Bisan kinsa nga lungsuranon pwede mangayo og opisyal nga rekord sa Munisipyo sa Magallanes ubos sa Executive Order No. 2, s. 2016:\n1. Pagsulat og request nga nagngalan sa mga rekord nga imong kinahanglan ug imong contact details, para sa FOI Receiving Officer (Office of the Mayor, Municipal Hall), o i-email sa ${MAYOR_EMAIL}.\n2. Kumpirmahon ang imong request sa samang adlaw sa trabaho.\n3. Mohatag og desisyon sulod sa 15 ka adlaw sa trabaho.\n4. Ihatag ang mga naaprobahang rekord sa format nga imong gipangayo kung mahimo, nga naay makatarunganon nga bayad sa pag-kopya.\nPwede sad nimo gamiton ang national eFOI portal (foi.gov.ph). Naa sa FOI page niining website ang detalye.`,
  },
  {
    name: 'emergency.hotline.inquire',
    phrases: [
      'What is the emergency hotline in Magallanes?', 'Do you have a hotline?', 'Who do I call in an emergency?', 'What is the number of the police station?',
      'What is the BFP fire station number?', 'There is a fire, who do I call?', 'What is the rescue hotline?', 'Our area is flooded, who do I call?',
      'Is there an ambulance I can call?', 'What is the MDRRMO number?', 'Emergency numbers in Magallanes', 'What is the MERT number?',
      'Unsa ang emergency hotline sa Magallanes?', 'Kinsa akong tawagan kung naay emergency?', 'Unsa ang numero sa pulis?', 'Naay sunog, kinsa akong tawagan?',
      'Unsa ang numero sa bombero?', 'Baha na diri sa among lugar, kinsa akong tawgan?', 'Naa bay ambulansya nga matawagan?', 'Unsa ang numero sa rescue?',
      'numero sa BFP', 'hotline sa PNP Magallanes', 'emergency number diri', 'Ano ang emergency hotline sa Magallanes?', 'Saan tatawag kapag may sunog?',
    ],
    english: `Emergency hotlines in Magallanes:\n${HOTLINES_EN}\n\nIf someone's life is in danger, call right away.`,
    bisaya: `Mga emergency hotline sa Magallanes:\n${HOTLINES_CEB}\n\nKung naay kinabuhi nga nameligro, tawag dayon.`,
  },

  // --- Small talk ---
  {
    name: 'smalltalk.thanks',
    phrases: [
      'Thank you', 'Thanks', 'Thank you so much', 'Thanks a lot', 'Thank you for your help', 'Thanks for the info',
      'Ty', 'Thank you very much', 'Many thanks', 'Salamat', 'Salamat kaayo', 'Daghang salamat',
      'Salamat sa tabang', 'Salamat sa info', 'Salamat po', 'Maraming salamat', 'Okay thank you',
    ],
    english: "You're welcome! Is there anything else I can help you with?",
    bisaya: 'Walay sapayan! Naa pa bay lain nga akong matabang nimo?',
  },
  {
    name: 'smalltalk.goodbye',
    phrases: [
      'Bye', 'Goodbye', 'See you', 'Bye bye', "That's all", 'That is all, thank you', 'I have no more questions',
      'Ok bye', 'Good night', 'Babay', 'Sige babay', 'Mao ra to', 'Mao ra, salamat', 'Wala na koy pangutana',
      'Sige, amping', 'Paalam', 'Until next time',
    ],
    english: 'Thank you for contacting the Magallanes Public Assistance Desk. Have a great day!',
    bisaya: 'Salamat sa pagpangutana sa Magallanes Public Assistance Desk. Amping!',
  },
  {
    name: 'smalltalk.capabilities',
    phrases: [
      'What can you do?', 'What can I ask you?', 'How can you help me?', 'What do you know?', 'Help',
      'What questions can you answer?', 'What services can you help with?', 'Menu', 'What topics do you cover?',
      'Unsa imong mahimo?', 'Unsa akong mapangutana nimo?', 'Unsaon nimo ko pagtabang?', 'Unsa imong nahibaloan?',
      'Tabang', 'Unsa ang mga pangutana nga imong matubag?', 'Ano ang kaya mong gawin?', 'What can this chatbot do?',
    ],
    english: CAPABILITIES.english,
    bisaya: CAPABILITIES.bisaya,
  },
  {
    name: 'smalltalk.identity',
    phrases: [
      'Are you a robot?', 'Are you a real person?', 'Who are you?', 'What are you?', 'Am I talking to a bot?',
      'Are you human?', 'Is this an AI?', 'What is your name?', 'Robot ka?', 'Tawo ka?',
      'Kinsa ka?', 'Unsa ka?', 'Bot ra ka?', 'Unsa imong ngalan?', 'Tao ka ba?', 'Are you a chatbot?',
      // The mascot's name (src/components/Bitoy.tsx).
      'Who is Bitoy?', 'Why are you called Bitoy?', 'What does Bitoy mean?', 'Is Bitoy a real person?', 'Where did the name Bitoy come from?',
      'Kinsa si Bitoy?', 'Ngano Bitoy imong ngalan?', 'Unsa ang Bitoy?', 'Tawo ba si Bitoy?', 'Asa gikan ang ngalan nga Bitoy?',
    ],
    // Bitoy is named after the ~500-year-old Bitaug tree of Barangay Caloc-an, a Philippine
    // Centennial Tree (see the tourism.centennial-tree.inquire sources above).
    english:
      "I'm Bitoy, the virtual assistant of the Municipality of Magallanes — named after our 500-year-old Bitaug tree in Barangay Caloc-an, a Philippine Centennial Tree. I'm an automated assistant, not a person. I answer common questions about municipal services, health services, officials, office hours and tourism, in English or Bisaya. For anything I can't answer, the staff at the Municipal Hall can help.",
    bisaya:
      'Ako si Bitoy, ang virtual assistant sa Munisipyo sa Magallanes — ginganlan sunod sa atong 500 ka tuig nga Bitaug sa Barangay Caloc-an, usa ka Philippine Centennial Tree. Automated assistant ko, dili tawo. Motubag ko sa kasagarang pangutana bahin sa mga serbisyo sa munisipyo, panglawas, mga opisyal, oras sa opisina, ug turismo, sa English o Bisaya. Kung dili nako matubag, makatabang ang mga staff sa Municipal Hall.',
  },
  {
    name: 'smalltalk.human-agent',
    phrases: [
      'Can I talk to a real person?', 'I want to talk to a human', 'Connect me to staff', 'Can I speak to an employee?',
      'I need to talk to someone', 'Talk to an agent', 'Is there a person I can talk to?', 'Can someone call me?',
      'Pwede ko makig-istorya sa tawo?', 'Gusto ko makig-istorya sa staff', 'Naa bay tawo nga pwede nakong kaistorya?',
      'Ipakonektar ko sa empleyado', 'Gusto ko makigsulti sa tinuod nga tawo', 'Pwede bang makausap ang tao?',
      'Human please', 'Real person please', 'I want to file a complaint with a person',
    ],
    english: `I'm an automated assistant, so I can't connect you to a person directly. You can call the Mayor's Office contact person, ${MAYORS_OFFICE.contactPerson}, at ${MAYORS_OFFICE.phone}, email the Mayor's Office at ${MAYOR_EMAIL}, visit the Municipal Hall in Poblacion during office hours, or send your concern through the Report a Concern page of this website.`,
    bisaya: `Automated assistant ra ko, mao nga dili ko makakonektar nimo direkta sa tawo. Pwede ka motawag sa contact person sa Mayor's Office nga si ${MAYORS_OFFICE.contactPerson} sa ${MAYORS_OFFICE.phone}, mo-email sa Mayor's Office sa ${MAYOR_EMAIL}, moadto sa Municipal Hall sa Poblacion sa oras sa opisina, o magpadala sa imong concern pinaagi sa Report a Concern page niining website.`,
  },
  {
    name: 'smalltalk.language',
    phrases: [
      'Do you understand Bisaya?', 'Can I ask in Bisaya?', 'Can you speak Cebuano?', 'What languages do you speak?',
      'Do you understand Tagalog?', 'Can I type in Filipino?', 'English only?', 'Do you speak English?',
      'Kasabot ka og Bisaya?', 'Pwede ko mangutana sa Bisaya?', 'Kahibalo ka mo-Bisaya?', 'Unsa nga pinulongan imong kasabot?',
      'Kasabot ka og Tagalog?', 'Marunong ka ba mag-Bisaya?', 'Nakakaintindi ka ba ng Tagalog?', 'Can we talk in Bisaya?',
    ],
    english: 'I understand English and Bisaya (Cebuano) — just ask in whichever you prefer and I will reply in the same language. My Tagalog is limited, so English or Bisaya works best.',
    bisaya: 'Kasabot ko og English ug Bisaya (Cebuano) — pangutana lang sa bisan unsa nga gusto nimo ug motubag ko sa samang pinulongan. Limitado ang akong Tagalog, mao nga mas maayo ang English o Bisaya.',
  },
  {
    name: 'smalltalk.how-are-you',
    phrases: [
      'How are you?', 'How are you doing?', "How's it going?", 'Are you okay?', 'How is your day?', 'Kumusta ka?',
      'Kumusta man ka?', 'Maayo ra ka?', 'Kumusta imong adlaw?', 'Okay ra ka?', 'Musta ka?', 'Kamusta ka?',
      'How have you been?', 'Are you doing well?', 'Kumusta ka karon?', 'Kumusta ang imong adlaw karon?',
    ],
    english: "I'm doing well, thank you for asking! How can I help you today?",
    bisaya: 'Maayo ra ko, salamat sa pagpangutana! Unsa may akong ikatabang nimo karon?',
  },
  {
    name: 'smalltalk.acknowledge',
    phrases: [
      'Ok', 'Okay', 'Alright', 'Got it', 'I see', 'Noted', 'Sure', 'Cool', 'Nice', 'Great', 'Sige', 'Sige sige',
      'Ah okay', 'Kasabot ko', 'Nasabtan nako', 'Ay sige', 'Ganun pala',
    ],
    english: 'Alright! Is there anything else I can help you with?',
    bisaya: 'Sige! Naa pa bay lain nga akong matabang nimo?',
  },
  // ---- About Bitoy himself: what a defense panel or a careful resident asks ----
  {
    name: 'smalltalk.bot-source',
    phrases: [
      'Where do you get your information?', 'How accurate are your answers?', 'How do you know the answers?', 'Are your answers correct?',
      'Are you connected to Google?', 'Are you connected to the internet?', 'How do you work?', 'What technology do you use?',
      'Can I trust your answers?', 'Are you using ChatGPT?', 'Is your information updated?', 'Where does your data come from?',
      'Unsaon nimo pagkahibalo sa mga tubag?', 'Asa gikan imong mga tubag?', 'Sakto ba imong mga tubag?', 'Kasaligan ba imong tubag?',
      'Konektado ka ba sa Google?', 'Unsaon nimo pagtrabaho?', 'Updated ba imong impormasyon?', 'Asa nimo nakuha ang imong impormasyon?',
    ],
    english:
      "My answers come from the LGU's own offices — their printed checklists, fee schedules and interviews with staff — and from what is posted on this website, such as announcements and the service directory. I use Google Dialogflow to understand questions in English and Bisaya, and rules that check each question's topic. When I'm not sure, I say so instead of guessing. For anything important, please confirm with the office concerned.",
    bisaya:
      'Ang akong mga tubag gikan sa mga opisina sa LGU — ilang mga checklist, listahan sa bayad, ug interview sa mga staff — ug sa mga gi-post niining website, sama sa mga anunsyo ug listahan sa serbisyo. Gigamit nako ang Google Dialogflow aron masabtan ang mga pangutana sa English ug Bisaya, ug mga lagda nga mo-check sa topic sa matag pangutana. Kung dili ko sigurado, ingnon ko nimo imbes nga motag-an. Sa importante nga butang, palihug kumpirmaha sa opisina nga nalambigit.',
  },
  {
    name: 'smalltalk.bot-privacy',
    phrases: [
      'Do you save my conversation?', 'Is my personal information safe with you?', 'Do you store my messages?', 'Who can see my chat?',
      'Is this chat private?', 'Do you collect my data?', 'What do you do with my information?', 'Is my data protected?',
      'Will you share my information?', 'Can the LGU read my messages?', 'Do I need to give my name?',
      'Gi-save ba nimo akong mga mensahe?', 'Luwas ba akong impormasyon?', 'Kinsa makakita sa akong chat?', 'Pribado ba kini nga chat?',
      'Unsa imong buhaton sa akong impormasyon?', 'Kinahanglan ba nako ihatag akong ngalan?', 'I-share ba nimo akong impormasyon?',
    ],
    english:
      "Chat messages are recorded so the LGU can answer and improve the service — I don't ask for your name. Under the website's Privacy Policy (Data Privacy Act of 2012), personal data is used only to act on your request, and is never sold or used for marketing. Please don't type ID numbers or other sensitive details here; for a concern that needs your contact details, use the Report a Concern page.",
    bisaya:
      'Gi-record ang mga mensahe sa chat aron matubag ug mapaayo sa LGU ang serbisyo — dili nako pangayoon ang imong ngalan. Ubos sa Privacy Policy sa website (Data Privacy Act of 2012), ang personal nga impormasyon gamiton lang aron matubag ang imong request, ug dili gyud ibaligya o gamiton sa marketing. Palihug ayaw isulat dinhi ang ID number o uban pang sensitibo nga detalye; kung ang imong concern nanginahanglan sa imong contact details, gamita ang Report a Concern page.',
  },
  {
    name: 'smalltalk.bot-updates',
    phrases: [
      'Can the LGU update your answers?', 'What happens if you do not know the answer?', 'Who updates your information?', 'Can you learn new things?',
      'What if your answer is wrong?', 'How are your answers updated?', 'Do you know the latest announcements?', 'Can staff add new answers?',
      'What if you cannot answer my question?', 'Do you get smarter?', 'Can you be updated?',
      'Unsa kung dili nimo kahibalo ang tubag?', 'Kinsa ang mo-update sa imong impormasyon?', 'Makakat-on ba ka og bag-o?', 'Unsa kung sayop imong tubag?',
      'Kahibalo ba ka sa bag-ong anunsyo?', 'Pwede ba ka ma-update?', 'Unsa kung dili nimo matubag akong pangutana?',
    ],
    english:
      "Staff can add or change my answers from the website's Admin portal, and new announcements and services posted on the website become answers right away. When I don't know something, I say so and point you to the office or the Municipal Hall, instead of guessing.",
    bisaya:
      'Pwede usbon o dugangan sa mga staff ang akong mga tubag gikan sa Admin portal sa website, ug ang mga bag-ong anunsyo ug serbisyo nga i-post sa website mahimong tubag dayon. Kung dili nako kahibalo, ingnon ko nimo ug itudlo ko ikaw sa opisina o sa Municipal Hall, imbes nga motag-an.',
  },
  {
    name: 'smalltalk.bot-availability',
    phrases: [
      'Are you available 24 hours?', 'Are you always online?', 'Can I chat with you at night?', 'Do you work on weekends?',
      'Are you open on holidays?', 'Are you available 24/7?', 'Can I ask you anytime?', 'Do you sleep?',
      'Online ka ba 24 oras?', 'Pwede ba ko mangutana nimo bisan gabii?', 'Naa ka ba bisan Domingo?', 'Pwede ba ko mangutana bisan kanus-a?',
      'Natulog ba ka?', 'Abri ka ba inig holiday?', 'Kanunay ka ba online?',
    ],
    english:
      "I'm available 24/7, including weekends and holidays. The Municipal Hall itself is open during office hours — ask me \"What are the office hours?\" for the schedule.",
    bisaya:
      'Anaa ko 24/7, apil ang Sabado, Domingo ug holiday. Ang Municipal Hall abri lang sa oras sa opisina — pangutana nako og "Unsa ang oras sa opisina?" para sa iskedyul.',
  },
  {
    name: 'smalltalk.bot-about',
    phrases: [
      'Who created you?', 'Who made you?', 'Who developed this chatbot?', 'Who built this website?', 'Is this the official website of Magallanes?',
      'Is this an official LGU website?', 'Who made this website?', 'Is this website legit?', 'Who owns this website?',
      'Kinsa ang nagbuhat nimo?', 'Kinsa ang naghimo ani nga website?', 'Opisyal ba kini nga website sa Magallanes?', 'Kinsa ang tag-iya ani nga website?',
      'Tinuod ba kini nga website sa munisipyo?', 'Kinsa ang nag-develop nimo?', 'Official ba ni nga website?',
    ],
    english: OFFICIAL_SITE
      ? 'This is the official website of the Municipality of Magallanes, Agusan del Norte, and I am its virtual assistant. The site and I were first developed as a capstone project and adopted by the LGU.'
      : "This website and I were developed by a student capstone team for the Municipality of Magallanes, Agusan del Norte. It is not yet the LGU's official website. For official announcements, follow the LGU's Facebook page: " + FACEBOOK_PAGE,
    bisaya: OFFICIAL_SITE
      ? 'Kini ang opisyal nga website sa Munisipyo sa Magallanes, Agusan del Norte, ug ako ang virtual assistant niini. Ang website ug ako unang gihimo isip capstone project ug gi-adopt sa LGU.'
      : 'Kini nga website ug ako gihimo sa usa ka capstone team sa mga estudyante para sa Munisipyo sa Magallanes, Agusan del Norte. Dili pa kini ang opisyal nga website sa LGU. Para sa opisyal nga anunsyo, sunda ang Facebook page sa LGU: ' + FACEBOOK_PAGE,
  },
];

/** Intent → { english, bisaya }, in the shape responses.js's INTENT_RESPONSES uses. */
export const GENERAL_RESPONSES = Object.fromEntries(
  GENERAL_INTENTS.map(({ name, english, bisaya }) => [name, { english, bisaya }])
);
