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
    'I can help with:\n• Business permits — requirements, DTI/SEC/CDA registration, fees, processing time, renewal and its deadline, BFP and MEEDMO clearances\n• Building permits\n• Barangay clearance and cedula\n• Civil registry — newborn and late birth registration, marriage license, death certificate, correcting a birth certificate, and their fees\n• Health — health cards, lab tests and the sanitary permit for businesses, PhilHealth\'s YAKAP, health certificates, prenatal check-ups, animal bites, and the senior citizens\' office\n• Municipal officials, the organizational structure, and barangay captains\n• Office hours and the Municipal Hall location\n• The public market and places to stay\n• Tourist spots, the town fiesta and the Lisagan Festival\nYou can ask in English or Bisaya.',
  bisaya:
    'Makatabang ko bahin sa:\n• Business permit — requirements, rehistro sa DTI/SEC/CDA, bayad, kadugayon, renewal ug deadline niini, clearance sa BFP ug MEEDMO\n• Building permit\n• Barangay clearance ug cedula\n• Civil registry — pagparehistro sa bag-ong natawo ug late registration, marriage license, death certificate, pag-correct sa birth certificate, ug ang mga bayad niini\n• Panglawas — health card, lab test ug sanitary permit para sa negosyo, YAKAP sa PhilHealth, health certificate, prenatal check-up, kagat sa hayop, ug opisina sa senior citizen\n• Mga opisyal sa munisipyo, ang istruktura sa gobyerno, ug mga kapitan sa barangay\n• Oras sa opisina ug asa ang Municipal Hall\n• Ang public market ug mga kapuy-an\n• Mga tourist spot, piyesta, ug Lisagan Festival\nPwede ka mangutana sa English o Bisaya.',
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
    ],
    english: `Mayor's Office contact person: ${MAYORS_OFFICE.contactPerson}, ${MAYORS_OFFICE.phone}\nMayor's Office email: ${MAYOR_EMAIL}\nVice Mayor & Sangguniang Bayan email: ${SB_EMAIL}\n\nYou can also visit the Municipal Hall in Poblacion, or send a concern through the Report a Concern page of this website.\n\nFor emergencies:\n${HOTLINES_EN}`,
    bisaya: `Contact person sa Mayor's Office: ${MAYORS_OFFICE.contactPerson}, ${MAYORS_OFFICE.phone}\nEmail sa Mayor's Office: ${MAYOR_EMAIL}\nEmail sa Vice Mayor ug Sangguniang Bayan: ${SB_EMAIL}\n\nPwede sad ka moadto sa Municipal Hall sa Poblacion, o magpadala og concern pinaagi sa Report a Concern page niining website.\n\nKung emergency:\n${HOTLINES_CEB}`,
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
      'Are you human?', 'Is this an AI?', 'What is your name?', 'Who made you?', 'Robot ka?', 'Tawo ka?',
      'Kinsa ka?', 'Unsa ka?', 'Bot ra ka?', 'Unsa imong ngalan?', 'Tao ka ba?', 'Are you a chatbot?',
    ],
    english:
      "I'm the Magallanes Public Assistance chatbot — an automated assistant, not a person. I answer common questions about municipal services, officials, office hours and tourism, in English or Bisaya. For anything I can't answer, the staff at the Municipal Hall can help.",
    bisaya:
      'Ako ang chatbot sa Magallanes Public Assistance — usa ka automated assistant, dili tawo. Motubag ko sa kasagarang pangutana bahin sa mga serbisyo sa munisipyo, mga opisyal, oras sa opisina, ug turismo, sa English o Bisaya. Kung dili nako matubag, makatabang ang mga staff sa Municipal Hall.',
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
];

/** Intent → { english, bisaya }, in the shape responses.js's INTENT_RESPONSES uses. */
export const GENERAL_RESPONSES = Object.fromEntries(
  GENERAL_INTENTS.map(({ name, english, bisaya }) => [name, { english, bisaya }])
);
