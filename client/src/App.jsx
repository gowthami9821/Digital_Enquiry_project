import React, { useState, useEffect, useRef, useCallback } from "react";

function convertToRailwayTime(timeStr) {
  const date = new Date(`1970-01-01 ${timeStr}`);
  return date.toTimeString().slice(0, 5);
}
// ─── TRAIN DATA ──────────────────────────────────────────────────────────────
const TRAINS = [
  {
    number: "12951", name: "Mumbai Rajdhani", nameHindi: "मुंबई राजधानी", nameTelugu: "ముంబై రాజ్‌ధాని",
    from: "Mumbai Central", to: "New Delhi",
    scheduledArrival: "08:35", actualArrival: "08:52",
    scheduledDeparture: "08:45", actualDeparture: "09:02",
    platform: 3, status: "delayed", delay: 17, type: "arriving",
    coaches: ["LOCO","H1","H2","A1","A2","B1","B2","B3","B4","S1","S2","S3","S4","S5","S6","GS","GS"]
  },
  {
    number: "12002", name: "Bhopal Shatabdi", nameHindi: "भोपाल शताब्दी", nameTelugu: "భోపాల్ శతాబ్ది",
    from: "New Delhi", to: "Habibganj",
    scheduledArrival: "10:00", actualArrival: "10:00",
    scheduledDeparture: "06:00", actualDeparture: "06:00",
    platform: 1, status: "on-time", delay: 0, type: "departing",
    coaches: ["LOCO","EC","CC","CC","CC","CC","CC","CC","CC","CC","CC","CC"]
  },
  {
    number: "22691", name: "Rajdhani Express", nameHindi: "राजधानी एक्सप्रेस", nameTelugu: "రాజ్‌ధాని ఎక్స్‌ప్రెస్",
    from: "Bangalore", to: "New Delhi",
    scheduledArrival: "20:00", actualArrival: "21:30",
    scheduledDeparture: "20:10", actualDeparture: "21:40",
    platform: 5, status: "delayed", delay: 90, type: "passing",
    coaches: ["LOCO","H1","A1","A2","B1","B2","B3","B4","S1","S2","S3","S4","GS","GS"]
  },
  {
    number: "12301", name: "Howrah Rajdhani", nameHindi: "हावड़ा राजधानी", nameTelugu: "హౌరా రాజ్‌ధాని",
    from: "Howrah", to: "New Delhi",
    scheduledArrival: "09:55", actualArrival: "09:55",
    scheduledDeparture: "10:05", actualDeparture: "10:05",
    platform: 2, status: "on-time", delay: 0, type: "arriving",
    coaches: ["LOCO","H1","H2","A1","A2","B1","B2","B3","S1","S2","S3","S4","S5","GS"]
  },
  {
    number: "19027", name: "Vivek Express", nameHindi: "विवेक एक्सप्रेस", nameTelugu: "వివేక్ ఎక్స్‌ప్రెస్",
    from: "Dibrugarh", to: "Kanyakumari",
    scheduledArrival: "14:20", actualArrival: "15:05",
    scheduledDeparture: "14:30", actualDeparture: "15:15",
    platform: 6, status: "delayed", delay: 45, type: "passing",
    coaches: ["LOCO","SL","SL","SL","SL","SL","SL","GS","GS","GS"]
  },
  {
    number: "12563", name: "Bihar Sampark Kranti", nameHindi: "बिहार संपर्क क्रांति", nameTelugu: "బీహార్ సంపర్క్ క్రాంతి",
    from: "New Delhi", to: "Rajendranagar",
    scheduledArrival: "11:00", actualArrival: "11:00",
    scheduledDeparture: "11:05", actualDeparture: "11:05",
    platform: 4, status: "on-time", delay: 0, type: "departing",
    coaches: ["LOCO","A1","B1","B2","S1","S2","S3","S4","GS"]
  },
  {
    number: "17064", name: "Ajanta Express", nameHindi: "अजंता एक्सप्रेस", nameTelugu: "అజంతా ఎక్స్‌ప్రెస్",
    from: "Secunderabad", to: "Mumbai CSMT",
    scheduledArrival: "13:10", actualArrival: "13:10",
    scheduledDeparture: "13:20", actualDeparture: "13:20",
    platform: 3, status: "on-time", delay: 0, type: "departing",
    coaches: ["LOCO","S1","S2","S3","S4","S5","B1","B2","GS","GS"]
  },
  {
    number: "12723", name: "AP Express", nameHindi: "एपी एक्सप्रेस", nameTelugu: "ఏపీ ఎక్స్‌ప్రెస్",
    from: "Hyderabad", to: "Hazrat Nizamuddin",
    scheduledArrival: "07:30", actualArrival: "07:45",
    scheduledDeparture: "07:40", actualDeparture: "07:55",
    platform: 1, status: "delayed", delay: 15, type: "arriving",
    coaches: ["LOCO","A1","A2","B1","B2","B3","S1","S2","S3","S4","S5","GS"]
  },
];

// ─── PLATFORM FACILITIES ─────────────────────────────────────────────────────
const PLATFORM_FACILITIES = {
  1: {
    food:      ["Juice Corner (near gate 1A)", "Amul Parlour (mid-platform)"],
    washroom:  ["Near gate 1A (paid)", "End of platform 1"],
    cloakroom: ["Main cloakroom near gate 1 – open 24h"],
    waiting:   ["AC Waiting Hall – ground floor near gate 1"],
    escalator: ["Gate 1 escalator (up only)"],
    atm:       ["SBI ATM near ticket counter"],
    pharmacy:  [],
    wifi:      true,
    wheelchairRamp: true,
  },
  2: {
    food:      ["Café Coffee Day (platform 2 entry)", "Railway Canteen (mid)"],
    washroom:  ["Platform 2 – near footbridge"],
    cloakroom: [],
    waiting:   ["Open waiting benches"],
    escalator: ["Footbridge escalator (both sides)"],
    atm:       [],
    pharmacy:  [],
    wifi:      true,
    wheelchairRamp: false,
  },
  3: {
    food:      ["IRCTC Food Stall", "Hot Meals Counter", "Bisleri water stall"],
    washroom:  ["Platform 3 – near IRCTC stall (free)", "End of platform 3"],
    cloakroom: ["Cloak room near platform 3 ramp – ₹30/hr"],
    waiting:   ["Platform 3 waiting shed"],
    escalator: ["Main escalator (platform 3 ↔ overbridge)"],
    atm:       ["HDFC ATM near ramp"],
    pharmacy:  ["MedPlus counter near gate 3"],
    wifi:      true,
    wheelchairRamp: true,
  },
  4: {
    food:      ["Snack stall near platform 4 exit"],
    washroom:  ["Platform 4 – near exit gate"],
    cloakroom: [],
    waiting:   ["Covered waiting area"],
    escalator: [],
    atm:       [],
    pharmacy:  [],
    wifi:      false,
    wheelchairRamp: false,
  },
  5: {
    food:      ["Food Court (large – 20 items)", "Domino's Express", "Chai & Snack corner"],
    washroom:  ["Platform 5 – near food court (paid)", "Disabled-friendly washroom near ramp"],
    cloakroom: ["Cloak room – platform 5 entry – open 6am–11pm"],
    waiting:   ["AC Lounge near platform 5 (₹50 entry)", "General waiting shed"],
    escalator: ["Escalator up/down near food court"],
    atm:       ["Axis Bank ATM inside food court"],
    pharmacy:  ["Apollo Pharmacy – platform 5 end"],
    wifi:      true,
    wheelchairRamp: true,
  },
  6: {
    food:      ["Tea/Coffee vending machine", "Snack cart"],
    washroom:  ["Platform 6 – start of platform"],
    cloakroom: [],
    waiting:   ["Waiting benches near gate 6"],
    escalator: [],
    atm:       [],
    pharmacy:  [],
    wifi:      true,
    wheelchairRamp: false,
  },
};

// ─── TRAIN NAME ALIASES (for natural language name lookup) ────────────────────
const TRAIN_NAME_ALIASES = [
  { aliases:["mumbai rajdhani","12951","मुंबई राजधानी","ముంబై రాజ్‌ధాని"], number:"12951" },
  { aliases:["bhopal shatabdi","12002","भोपाल शताब्दी","భోపాల్ శతాబ్ది"], number:"12002" },
  { aliases:["rajdhani express","22691","राजधानी एक्सप्रेस","రాజ్‌ధాని ఎక్స్‌ప్రెస్","rajdhani"], number:"22691" },
  { aliases:["howrah rajdhani","12301","हावड़ा राजधानी","హౌరా రాజ్‌ధాని"], number:"12301" },
  { aliases:["vivek express","19027","विवेक एक्सप्रेस","వివేక్ ఎక్స్‌ప్రెస్","vivek"], number:"19027" },
  { aliases:["bihar sampark","12563","बिहार संपर्क क्रांति","బీహార్ సంపర్క్ క్రాంతి","sampark kranti"], number:"12563" },
  { aliases:["ajanta express","17064","अजंता एक्सप्रेस","అజంతా ఎక్స్‌ప్రెస్","ajanta"], number:"17064" },
  { aliases:["ap express","12723","एपी एक्सप्रेस","ఏపీ ఎక్స్‌ప్రెస్","andhra pradesh express"], number:"12723" },
];

function findTrainByName(text) {
  const lower = text.toLowerCase();
  // Exact 5-digit number
  const numMatch = lower.match(/\b(\d{5})\b/);
  if (numMatch) return TRAINS.find(t => t.number === numMatch[1]) || null;
  // Alias lookup
  for (const entry of TRAIN_NAME_ALIASES) {
    if (entry.aliases.some(a => lower.includes(a.toLowerCase()))) {
      return TRAINS.find(t => t.number === entry.number) || null;
    }
  }
  return null;
}

const COACH_COLORS = {
  LOCO:"#374151",H1:"#7c3aed",H2:"#7c3aed",
  A1:"#0891b2",A2:"#0891b2",
  B1:"#059669",B2:"#059669",B3:"#059669",B4:"#059669",
  S1:"#d97706",S2:"#d97706",S3:"#d97706",S4:"#d97706",S5:"#d97706",S6:"#d97706",
  EC:"#0891b2",CC:"#059669",SL:"#d97706",GS:"#6b7280",
};
const COACH_LABELS = {
  LOCO:"Engine",H1:"1st AC",H2:"1st AC",A1:"2nd AC",A2:"2nd AC",
  B1:"3rd AC",B2:"3rd AC",B3:"3rd AC",B4:"3rd AC",
  S1:"Sleeper",S2:"Sleeper",S3:"Sleeper",S4:"Sleeper",S5:"Sleeper",S6:"Sleeper",
  EC:"Exec Chair",CC:"Chair Car",SL:"Sleeper",GS:"General",
};

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code:"en",    label:"English",       speechLang:"en-IN", flag:"🇬🇧" },
  { code:"hi",    label:"हिंदी",          speechLang:"hi-IN", flag:"🇮🇳" },
  { code:"te",    label:"తెలుగు",         speechLang:"te-IN", flag:"🏳️" },
  { code:"en_hi", label:"Eng + हिंदी",   speechLang:"hi-IN", flag:"🔀" },
  { code:"en_te", label:"Eng + తెలుగు",  speechLang:"te-IN", flag:"🔀" },
];

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const TR = {
  en: {
    greeting:"Namaste! How can I assist you?",
    subGreeting:"Speak or type your query below",
    tapToSpeak:"TAP TO SPEAK",
    listening:"LISTENING...",
    typeHere:"Type here… e.g. status of train 12951",
    search:"Search",
    voiceAssistant:"Voice Assistant",
    trainBoard:"Train Board",
    allTrains:"All Trains",
    arriving:"Arriving",
    departing:"Departing",
    passThrough:"Pass Through",
    trainNo:"TRAIN #", trainName:"TRAIN NAME",
    arrival:"ARRIVAL", departure:"DEPARTURE",
    pf:"PF", delay:"DELAY", statusLabel:"STATUS",
    onTime:"ON TIME", delayed:"DELAYED", passing:"PASSING",
    noTrains:"No trains in this category",
    coaches:"Coaches", viewCoaches:"View Coaches", close:"Close",
    boardSubtitle:"Live Arrivals, Departures & Pass-Through",
    notFound:"Train not found.",
    askTrainOrPf:"Please ask about a train number or platform.",
    foodResp:"Food Court is near platforms 5-6.",
    ticketResp:"Ticket counters are near the main entrance.",
  },
  hi: {
    greeting:"नमस्ते! मैं आपकी सहायता करूँगा।",
    subGreeting:"अपना प्रश्न बोलें या टाइप करें",
    tapToSpeak:"बात करने के लिए दबाएँ",
    listening:"सुन रहा हूँ...",
    typeHere:"यहाँ टाइप करें… जैसे: ट्रेन 12951 की स्थिति",
    search:"खोजें",
    voiceAssistant:"वॉइस असिस्टेंट",
    trainBoard:"ट्रेन बोर्ड",
    allTrains:"सभी ट्रेनें",
    arriving:"आगमन",
    departing:"प्रस्थान",
    passThrough:"गुजरने वाली",
    trainNo:"ट्रेन नं", trainName:"ट्रेन नाम",
    arrival:"आगमन", departure:"प्रस्थान",
    pf:"प्लेटफॉर्म", delay:"देरी", statusLabel:"स्थिति",
    onTime:"समय पर", delayed:"देरी", passing:"गुजर रही",
    noTrains:"इस श्रेणी में कोई ट्रेन नहीं",
    coaches:"कोच", viewCoaches:"कोच देखें", close:"बंद करें",
    boardSubtitle:"लाइव आगमन, प्रस्थान और ट्रांजिट",
    notFound:"ट्रेन नहीं मिली।",
    askTrainOrPf:"कृपया ट्रेन नंबर या प्लेटफॉर्म के बारे में पूछें।",
    foodResp:"फूड कोर्ट प्लेटफॉर्म 5-6 के पास है।",
    ticketResp:"टिकट काउंटर मुख्य प्रवेश के पास है।",
  },
  te: {
    greeting:"నమస్కారం! నేను మీకు ఎలా సహాయపడగలను?",
    subGreeting:"మీ ప్రశ్నను మాట్లాడండి లేదా టైప్ చేయండి",
    tapToSpeak:"మాట్లాడటానికి నొక్కండి",
    listening:"వింటున్నాను...",
    typeHere:"ఇక్కడ టైప్ చేయండి… ఉదా: ట్రెయిన్ 12951 స్థితి",
    search:"శోధించు",
    voiceAssistant:"వాయిస్ అసిస్టెంట్",
    trainBoard:"ట్రెయిన్ బోర్డ్",
    allTrains:"అన్ని ట్రెయిన్లు",
    arriving:"వస్తున్నవి",
    departing:"వెళ్తున్నవి",
    passThrough:"దాటి వెళ్తున్నవి",
    trainNo:"ట్రెయిన్ నం", trainName:"ట్రెయిన్ పేరు",
    arrival:"రాక", departure:"నిష్క్రమణ",
    pf:"ప్లాట్‌ఫారం", delay:"జాప్యం", statusLabel:"స్థితి",
    onTime:"సమయానికి", delayed:"ఆలస్యం", passing:"దాటుతున్నది",
    noTrains:"ఈ వర్గంలో ట్రెయిన్లు లేవు",
    coaches:"కోచ్‌లు", viewCoaches:"కోచ్‌లు చూడండి", close:"మూసివేయి",
    boardSubtitle:"లైవ్ రాకలు, నిష్క్రమణలు & ట్రాన్సిట్",
    notFound:"ట్రెయిన్ కనుగొనబడలేదు.",
    askTrainOrPf:"దయచేసి ట్రెయిన్ నంబర్ లేదా ప్లాట్‌ఫారం గురించి అడగండి.",
    foodResp:"ఫుడ్ కోర్ట్ ప్లాట్‌ఫారం 5-6 దగ్గర ఉంది.",
    ticketResp:"టికెట్ కౌంటర్లు ప్రధాన ప్రవేశద్వారం దగ్గర ఉన్నాయి.",
  },
};

function getLangBase(lang) {
  if (lang === "en_hi") return "hi";
  if (lang === "en_te") return "te";
  return lang;
}

function getTr(key, lang) {
  const base = getLangBase(lang);
  const dict = TR[base] || TR.en;
  const val = dict[key] !== undefined ? dict[key] : (TR.en[key] || key);
  if ((lang === "en_hi" || lang === "en_te") && TR.en[key] && TR.en[key] !== val) {
    return TR.en[key] + " / " + val;
  }
  return val;
}

function getTrainName(train, lang) {
  if (lang === "hi" || lang === "en_hi") return train.nameHindi;
  if (lang === "te" || lang === "en_te") return train.nameTelugu;
  return train.name;
}

// ─── INTENT DETECTION ─────────────────────────────────────────────────────────
function buildTrainResponse(train, lang, focusArrival, focusDeparture) {
  const base = getLangBase(lang);
  const delayNote = train.delay > 0
    ? (base==="hi" ? ` (${train.delay} मिनट देरी)` : base==="te" ? ` (${train.delay} నిమిషాలు ఆలస్యం)` : ` (+${train.delay} min delay)`)
    : (base==="hi" ? " (समय पर)" : base==="te" ? " (సమయానికి)" : " (on time)");
  if (focusArrival) {
    if (base==="hi") return `ट्रेन ${train.number} ${train.nameHindi} का आगमन प्लेटफॉर्म ${train.platform} पर ${train.actualArrival} बजे${delayNote}। निर्धारित: ${convertToRailwayTime(train.scheduledArrival)} बजे।`;
    if (base==="te") return `ట్రెయిన్ ${train.number} ${train.nameTelugu} ప్లాట్‌ఫారం ${train.platform}కి ${train.actualArrival}కి వస్తుంది${delayNote}. షెడ్యూల్: ${convertToRailwayTime(train.scheduledArrival)}.`;
    return `Train ${train.number} ${train.name} arrives Platform ${train.platform} at ${train.actualArrival}${delayNote}. Scheduled: ${convertToRailwayTime(train.scheduledArrival)}.`;
  }
  if (focusDeparture) {
    if (base==="hi") return `ट्रेन ${train.number} ${train.nameHindi} प्लेटफॉर्म ${train.platform} से ${train.actualDeparture} बजे प्रस्थान करेगी${delayNote}। निर्धारित: ${convertToRailwayTime(train.scheduledDeparture)} बजे।`;
    if (base==="te") return `ట్రెయిన్ ${train.number} ${train.nameTelugu} ప్లాట్‌ఫారం ${train.platform} నుండి ${train.actualDeparture}కి బయలుదేరుతుంది${delayNote}. షెడ్యూల్: ${convertToRailwayTime(train.scheduledDeparture)}.`;
    return `Train ${train.number} ${train.name} departs Platform ${train.platform} at ${train.actualDeparture}${delayNote}. Scheduled: ${convertToRailwayTime(train.scheduledDeparture)}.`;
  }
  if (lang==="en_hi") {
    const d = train.delay>0 ? ` ${train.delay} min late / ${train.delay} मिनट देरी` : " On time / समय पर";
    return `Train ${train.number} – ${train.name} / ${train.nameHindi} | Platform / प्लेटफॉर्म ${train.platform} | Arr: ${train.actualArrival} | Dep: ${train.actualDeparture}${d}.`;
  }
  if (lang==="en_te") {
    const d = train.delay>0 ? ` ${train.delay} min late / ${train.delay} నిమిషాలు ఆలస్యం` : " On time / సమయానికి";
    return `Train ${train.number} – ${train.name} / ${train.nameTelugu} | Platform / ప్లాట్‌ఫారం ${train.platform} | Arr: ${train.actualArrival} | Dep: ${train.actualDeparture}${d}.`;
  }
  if (base==="hi") return `ट्रेन ${train.number} – ${train.nameHindi} | प्लेटफॉर्म ${train.platform} | आगमन: ${train.actualArrival} | प्रस्थान: ${train.actualDeparture}${delayNote}।`;
  if (base==="te") return `ట్రెయిన్ ${train.number} – ${train.nameTelugu} | ప్లాట్‌ఫారం ${train.platform} | రాక: ${train.actualArrival} | నిష్క్రమణ: ${train.actualDeparture}${delayNote}.`;
  return `Train ${train.number} – ${train.name} | Platform ${train.platform} | Arrives: ${train.actualArrival} | Departs: ${train.actualDeparture}${delayNote}.`;
}

function buildFacilityResponse(pfNum, facilityKey, lang) {
  const fac = PLATFORM_FACILITIES[pfNum];
  const base = getLangBase(lang);
  if (!fac) {
    if (base==="hi") return `प्लेटफॉर्म ${pfNum} के लिए सुविधा जानकारी उपलब्ध नहीं है।`;
    if (base==="te") return `ప్లాట్‌ఫారం ${pfNum} కోసం సౌకర్యాల సమాచారం అందుబాటులో లేదు.`;
    return `Facility info for Platform ${pfNum} not available.`;
  }
  const items = fac[facilityKey] || [];
  const labels = {
    food:      { en:"Food stalls",    hi:"खाने के स्टॉल",       te:"ఆహార స్టాల్లు" },
    washroom:  { en:"Washrooms",      hi:"शौचालय",               te:"వాష్‌రూమ్‌లు" },
    cloakroom: { en:"Cloak rooms",    hi:"क्लोक रूम",            te:"క్లోక్ రూమ్‌లు" },
    waiting:   { en:"Waiting areas",  hi:"प्रतीक्षा क्षेत्र",   te:"వేచి ఉండే ప్రాంతాలు" },
    escalator: { en:"Escalators",     hi:"एस्केलेटर",            te:"ఎస్కలేటర్లు" },
    atm:       { en:"ATMs",           hi:"एटीएम",                te:"ఏటీఎమ్‌లు" },
    pharmacy:  { en:"Pharmacy",       hi:"फार्मेसी",              te:"ఫార్మసీ" },
  };
  const label = (labels[facilityKey]||{})[base] || (labels[facilityKey]||{}).en || facilityKey;
  if (items.length === 0) {
    if (base==="hi") return `प्लेटफॉर्म ${pfNum} पर ${label} उपलब्ध नहीं है।`;
    if (base==="te") return `ప్లాట్‌ఫారం ${pfNum}లో ${label} అందుబాటులో లేదు.`;
    return `No ${label.toLowerCase()} available at Platform ${pfNum}.`;
  }
  const list = items.join(" · ");
  if (base==="hi") return `प्लेटफॉर्म ${pfNum} पर ${label}: ${list}`;
  if (base==="te") return `ప్లాట్‌ఫారం ${pfNum}లో ${label}: ${list}`;
  return `Platform ${pfNum} – ${label}: ${list}`;
}

// ───────────────── LANGUAGE HELPER ─────────────────
function getResponseByLang(base, en, hi, te) {
  if (base === "hi") return hi;
  if (base === "te") return te;
  return en;
}

// ───────────────── MAIN FUNCTION ─────────────────
function detectIntent(text, lang) {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  const base = getLangBase(lang);

  // ── Train search detection ──
  const isTrainSearch =
    /train|trains|available|ट्रेन|रेल|రైలు/.test(lower);

  let destination = null;

  // ── Destination extraction ──
  const enMatch = /to\s+([a-z\s]+)/.exec(lower);
  const hiMatch = /([^\s]+)\s+के लिए/.exec(text);
  const teMatch = /([^\s]+)\s+(కు|కి)/.exec(text);

  if (enMatch) destination = enMatch[1].trim();
  else if (hiMatch) destination = hiMatch[1].trim();
  else if (teMatch) destination = teMatch[1].trim();

  // ── City normalization ──
  const cityMap = {
    "delhi": "new delhi",
    "दिल्ली": "new delhi",
    "దిల్లీ": "new delhi",

    "mumbai": "mumbai central",
    "मुंबई": "mumbai central",
    "ముంబై": "mumbai central",

    "hyderabad": "hyderabad",
    "हैदराबाद": "hyderabad",
    "హైదరాబాద్": "hyderabad"
  };

  if (destination) {
    const key = destination.toLowerCase();
    if (cityMap[key]) destination = cityMap[key];
  }

  // ── Train search ──
  if (isTrainSearch && destination) {
    const matched = TRAINS.filter(t =>
      t.to.toLowerCase().includes(destination.toLowerCase())
    );

    if (matched.length === 0) {
      return {
        intent: "train_search",
        response: getResponseByLang(
          base,
          `No trains found to ${destination}`,
          `${destination} के लिए कोई ट्रेन नहीं मिली`,
          `${destination} కు రైళ్లు లేవు`
        )
      };
    }

    const list = matched
      .map(t => `${t.name} (${t.number})`)
      .join(", ");

    return {
      intent: "train_search",
      response: getResponseByLang(
        base,
        `Available trains to ${destination} are ${list}`,
        `${destination} के लिए उपलब्ध ट्रेनें हैं: ${list}`,
        `${destination} కు వెళ్లే రైళ్లు: ${list}`
      )
    };
  }
    // ── Extract platform number ─────────────────────
  const pfRaw = lower.match(/platform\s*(?:no\.?|number)?\s*(\d+)|(\d+)\s*(?:नंबर\s*)?(?:प्लेटफॉर्म|platform)|(?:ప్లాట్‌ఫారం)\s*(\d+)/i);
  const pfNum = pfRaw ? parseInt(pfRaw[1] || pfRaw[2] || pfRaw[3]) : null;

  // ── Facility detection ──────────────────────────
  const isFoodQ      = /food|eat|stall|restaurant|canteen|cafe|snack|खाना|భోజనం/i.test(lower);
  const isWashroomQ  = /washroom|toilet|restroom|bathroom|శౌచాలయం|వాష్‌రూమ్/i.test(lower);
  const isCloakQ     = /cloak|luggage|locker/i.test(lower);
  const isWaitingQ   = /waiting|lounge|wait/i.test(lower);
  const isEscalatorQ = /escalat|lift|elevator/i.test(lower);
  const isAnyFacility = isFoodQ || isWashroomQ || isCloakQ || isWaitingQ || isEscalatorQ;

  // ── Timing detection ────────────────────────────
  const isArrivalQ   = /arriv|reach|incoming|आगमन|రాక/i.test(lower);
  const isDepartureQ = /depart|leav|going|प्रस्थान|వెళ్తుంది/i.test(lower);
  const isTimingQ    = /time|when|schedule|कब|ఎప్పుడు/i.test(lower);

  // ── General keywords ────────────────────────────
  const isWhereQ    = /where|कहाँ|ఎక్కడ/i.test(lower);
  const isPlatformQ = /platform|प्लेटफॉर्म|ప్లాట్‌ఫారం/i.test(lower);

  // ── Find train ─────────────────────────────────
  const train = findTrainByName(lower);
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ WHERE IS TRAIN
  if (train && isWhereQ) {
    return {
      intent: "train_status",
      response: getResponseByLang(
        base,
        `Train ${train.number} is at Platform ${train.platform}.`,
        `ट्रेन ${train.number} प्लेटफॉर्म ${train.platform} पर है।`,
        `ట్రెయిన్ ${train.number} ప్లాట్‌ఫారం ${train.platform}లో ఉంది.`
      )
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ WHICH PLATFORM
  if (train && isPlatformQ && !isTimingQ) {
    return {
      intent: "platform_query",
      response: getResponseByLang(
        base,
        `${train.name} will arrive at Platform ${train.platform}.`,
        `${train.nameHindi} प्लेटफॉर्म ${train.platform} पर आएगी।`,
        `${train.nameTelugu} ప్లాట్‌ఫారం ${train.platform}కి వస్తుంది.`
      )
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ ARRIVAL TIME
  if (train && isArrivalQ && !isDepartureQ) {
    return {
      intent: "arrival_time",
      response: getResponseByLang(
        base,
        `Train ${train.number} ${train.name} will arrive at ${train.actualArrival} on Platform ${train.platform}.`,
        `ट्रेन ${train.nameHindi} ${train.actualArrival} बजे प्लेटफॉर्म ${train.platform} पर आएगी।`,
        `ట్రెయిన్ ${train.nameTelugu} ${train.actualArrival}కు ప్లాట్‌ఫారం ${train.platform}కి వస్తుంది.`
      )
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ DEPARTURE TIME
  if (train && isDepartureQ && !isArrivalQ) {
    return {
      intent: "departure_time",
      response: getResponseByLang(
        base,
        `Train ${train.number} ${train.name} will depart at ${train.actualDeparture} from Platform ${train.platform}.`,
        `ट्रेन ${train.nameHindi} ${train.actualDeparture} बजे प्लेटफॉर्म ${train.platform} से प्रस्थान करेगी।`,
        `ట్రెయిన్ ${train.nameTelugu} ${train.actualDeparture}కు ప్లాట్‌ఫారం ${train.platform} నుంచి బయలుదేరుతుంది.`
      )
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FULL TIMING
  if (train && isTimingQ) {
    return {
      intent: "timing",
      response: getResponseByLang(
        base,
        `Train ${train.number} ${train.name} arrives at ${train.actualArrival} and departs at ${train.actualDeparture} from Platform ${train.platform}.`,
        `ट्रेन ${train.nameHindi} ${train.actualArrival} बजे आएगी और ${train.actualDeparture} बजे प्लेटफॉर्म ${train.platform} से जाएगी।`,
        `ట్రెయిన్ ${train.nameTelugu} ${train.actualArrival}కు వస్తుంది మరియు ${train.actualDeparture}కు ప్లాట్‌ఫారం ${train.platform} నుంచి వెళ్తుంది.`
      )
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ DEFAULT TRAIN STATUS
  if (train) {
    return {
      intent: "train_status",
      response: getResponseByLang(
        base,
        `Train ${train.number} ${train.name} is at Platform ${train.platform}. Arrival: ${train.actualArrival}, Departure: ${train.actualDeparture}.`,
        `ट्रेन ${train.nameHindi} प्लेटफॉर्म ${train.platform} पर है। आगमन: ${train.actualArrival}, प्रस्थान: ${train.actualDeparture}।`,
        `ట్రెయిన్ ${train.nameTelugu} ప్లాట్‌ఫారం ${train.platform}లో ఉంది. రాక: ${train.actualArrival}, నిష్క్రమణ: ${train.actualDeparture}.`
      )
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ TRAINS AT PLATFORM
  if (pfNum && !isAnyFacility) {
    const pfTrains = TRAINS.filter(t => t.platform === pfNum);

    if (pfTrains.length === 0) {
      return {
        intent: "platform_trains",
        response: getResponseByLang(
          base,
          `No trains currently at Platform ${pfNum}.`,
          `प्लेटफॉर्म ${pfNum} पर कोई ट्रेन नहीं है।`,
          `ప్లాట్‌ఫారం ${pfNum}లో ట్రెయిన్లు లేవు.`
        )
      };
    }

    return {
      intent: "platform_trains",
      response: getResponseByLang(
        base,
        `Trains at Platform ${pfNum}: ${pfTrains.map(t => `${t.number} ${t.name}`).join(", ")}.`,
        `प्लेटफॉर्म ${pfNum} पर ट्रेनें: ${pfTrains.map(t => `${t.number} ${t.nameHindi}`).join(", ")}।`,
        `ప్లాట్‌ఫారం ${pfNum}లో ట్రెయిన్లు: ${pfTrains.map(t => `${t.number} ${t.nameTelugu}`).join(", ")}.`
      )
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FACILITY AT PLATFORM
  if (isAnyFacility && pfNum) {
    if (isFoodQ)
      return { intent:"facility", response:getResponseByLang(base,
        `Food stalls available at Platform ${pfNum}.`,
        `प्लेटफॉर्म ${pfNum} पर खाने के स्टॉल उपलब्ध हैं।`,
        `ప్లాట్‌ఫారం ${pfNum}లో ఆహార స్టాల్లు ఉన్నాయి.`) };

    if (isWashroomQ)
      return { intent:"facility", response:getResponseByLang(base,
        `Washrooms available at Platform ${pfNum}.`,
        `प्लेटफॉर्म ${pfNum} पर शौचालय उपलब्ध हैं।`,
        `ప్లాట్‌ఫారం ${pfNum}లో వాష్‌రూమ్‌లు ఉన్నాయి.`) };

    if (isCloakQ)
      return { intent:"facility", response:getResponseByLang(base,
        `Cloak room available at Platform ${pfNum}.`,
        `प्लेटफॉर्म ${pfNum} पर क्लोक रूम उपलब्ध है।`,
        `ప్లాట్‌ఫారం ${pfNum}లో క్లోక్ రూమ్ ఉంది.`) };

    if (isWaitingQ)
      return { intent:"facility", response:getResponseByLang(base,
        `Waiting hall available at Platform ${pfNum}.`,
        `प्लेटफॉर्म ${pfNum} पर प्रतीक्षा कक्ष उपलब्ध है।`,
        `ప్లాట్‌ఫారం ${pfNum}లో వేచిచోటు ఉంది.`) };

    if (isEscalatorQ)
      return { intent:"facility", response:getResponseByLang(base,
        `Escalator available at Platform ${pfNum}.`,
        `प्लेटफॉर्म ${pfNum} पर एस्केलेटर उपलब्ध है।`,
        `ప్లాట్‌ఫారం ${pfNum}లో ఎస్కలేటర్ ఉంది.`) };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ UNKNOWN
  return {
    intent:"unknown",
    response:getResponseByLang(
      base,
      "I didn't understand. Ask about train, platform, timing or facilities.",
      "मैं समझ नहीं पाया। कृपया ट्रेन, प्लेटफॉर्म, समय या सुविधाओं के बारे में पूछें।",
      "నేను అర్థం చేసుకోలేకపోయాను. దయచేసి ట్రెయిన్, ప్లాట్‌ఫారం లేదా సౌకర్యాల గురించి అడగండి."
    )
  };
}

// ─── SPEAK ────────────────────────────────────────────────────────────────────
// function speakText(text, lang) {
//   if (!window.speechSynthesis) return;

//   window.speechSynthesis.cancel();

//   // 🔹 Convert train numbers like 12951 → 1 2 9 5 1
//   const formattedText = text.replace(/\b\d{5}\b/g, (num) => {
//     return num.split("").join(" ");
//   });

//   const langObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

//   const utt = new SpeechSynthesisUtterance(formattedText);
//   utt.lang = langObj.speechLang;
//   utt.rate = 0.9;
//   utt.pitch = 1.0;

//   window.speechSynthesis.speak(utt);
// }

// ─── SPEAK ────────────────────────────────────────────────────────────────────
const speakText = (text, lang) => {
  if (!text) return;

  const speak = () => {
    const voices = window.speechSynthesis.getVoices();

// ✅ Format train numbers (only for Telugu)
let formattedText = text;

if (lang === "te" || lang === "en"  || lang === "hi" ) {
  formattedText = text.replace(/\b\d{5}\b/g, (num) => {
    return num.split("").join(" ");
  });
}

const utt = new SpeechSynthesisUtterance(formattedText);
    let selectedVoice;

    // ✅ Priority logic
    if (lang === "te") {
      // Try Telugu → fallback Hindi
      selectedVoice =
        voices.find(v => v.lang === "te-IN") ||
        voices.find(v => v.lang === "hi-IN");
    } else if (lang === "hi") {
      selectedVoice = voices.find(v => v.lang === "hi-IN");
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith("en"));
      selectedVoice = voices.find(v => v.lang === "te-IN")

    }

    // fallback safety
    if (!selectedVoice) {
      selectedVoice = voices[0];
    }

    // apply voice
    if (selectedVoice) {
      utt.voice = selectedVoice;
      utt.lang = selectedVoice.lang;
    }

    // 🎙️ railway announcement tuning
    utt.rate = 0.80;
    utt.pitch = 1.0;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = speak;
  } else {
    speak();
  }
};
// ─── CLOCK ────────────────────────────────────────────────────────────────────
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function RailwayKiosk() {
  const [lang, setLang]                   = useState("en");
  const [showLangMenu, setShowLangMenu]   = useState(false);
  const [tab, setTab]                     = useState("assistant");
  const [trainFilter, setTrainFilter]     = useState("all");
  const [listening, setListening]         = useState(false);
  const [inputText, setInputText]         = useState("");
  const [lastQuery, setLastQuery]         = useState("");
  const [intentResult, setIntentResult]   = useState(null);
  const [expandedTrain, setExpandedTrain] = useState(null);
  const [history, setHistory]             = useState([]);   // [{id,query,response,lang,langLabel,timestamp}]
  const [showHistory, setShowHistory]     = useState(false);

  const recogRef    = useRef(null);
  const langRef     = useRef(lang);   // mutable ref so callbacks always see fresh lang
  const langMenuRef = useRef(null);
  const time        = useClock();

  // Keep langRef current whenever lang state changes
  useEffect(() => {
  langRef.current = lang;   // ✅ ADD THIS
}, [lang]);

  useEffect(() => {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log("Voices loaded:", voices); // helps debugging
  };

  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}, []);

  // Close language menu on outside click
  useEffect(() => {
    function handler(e) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // ── Core query processor — reads langRef so it's always fresh ─────────────
  const processQuery = useCallback((rawText) => {
    const activeLang = langRef.current;
    const text = (rawText || "").trim();
    if (!text) return;
    setLastQuery(text);
    const result = detectIntent(text, activeLang);
    if (result) {
      setIntentResult(result);
      speakText(result.response, activeLang);
      // Save to history
      const langObj = LANGUAGES.find(l => l.code === activeLang) || LANGUAGES[0];
      setHistory(prev => [
        {
          id: Date.now(),
          query: text,
          response: result.response,
          lang: activeLang,
          langLabel: langObj.flag + " " + langObj.label,
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 50)); // keep last 50 entries
    }
  }, []); // intentionally no deps — uses ref

  // ── Voice ─────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported. Please use Chrome or Edge.");
      return;
    }
    try { if (recogRef.current) recogRef.current.stop(); } catch (_) {}

    const recog = new SR();
    recog.lang            = LANGUAGES.find(l => l.code === langRef.current)?.speechLang || "en-IN";
    recog.interimResults  = false;
    recog.maxAlternatives = 1;
    recog.continuous      = false;

    recog.onstart  = () => setListening(true);
    recog.onend    = () => setListening(false);
    recog.onerror  = (err) => { console.warn("Speech error:", err.error); setListening(false); };
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInputText(text);   // show spoken text in the input box
      processQuery(text);   // process and show result
    };

    recogRef.current = recog;
    recog.start();
  }, [processQuery]);

  const stopListening = useCallback(() => {
    try { if (recogRef.current) recogRef.current.stop(); } catch (_) {}
    setListening(false);
  }, []);

  // ── Text form submit ──────────────────────────────────────────────────────
  const handleTextSubmit = (e) => {
    e.preventDefault();
    processQuery(inputText);
  };

  // ── Filtered trains ───────────────────────────────────────────────────────
  const filteredTrains = TRAINS.filter(tr => {
    if (trainFilter === "all")       return true;
    if (trainFilter === "arriving")  return tr.type === "arriving";
    if (trainFilter === "departing") return tr.type === "departing";
    if (trainFilter === "passing")   return tr.type === "passing";
    return true;
  });

  const counts = {
    all:       TRAINS.length,
    arriving:  TRAINS.filter(t => t.type === "arriving").length,
    departing: TRAINS.filter(t => t.type === "departing").length,
    passing:   TRAINS.filter(t => t.type === "passing").length,
  };

  const marqueeText = TRAINS.map(t =>
    t.delay > 0 ? `🔴 ${t.number} ${t.name} – ${t.delay} MIN LATE`
                : `✅ ${t.number} ${t.name} – ON TIME`
  ).join("   ·   ");

  const quickChips = [
    { num:"trains to new delhi",    short:"Trains to Delhi" },
    { num:"12951",                  short:"Mumbai Rajdhani" },
    { num:"12723",                  short:"AP Express" },
    { num:"where is 22691",         short:"Rajdhani location" },
    { num:"arrival time of 12301",  short:"Howrah arrival" },
    { num:"food stalls platform 3", short:"PF 3 food" },
    { num:"washroom platform 5",    short:"PF 5 washroom" },
    { num:"trains at platform 2",   short:"PF 2 trains" },
    { num:"escalator",              short:"Escalators" },
  ];

  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  function handleSearch(query) {
  const result = detectIntent(query, selectedLang);

  if (result) {
    setResponse(result.response);
    speakText(result.response, selectedLang); // 🔊 important
  }
}
  const SAMPLE_QUERIES = [
  "where is 12951",
  "where is mumbai rajdhani",

  "which platform is 12951",
  "mumbai rajdhani platform number",

  "arrival time of 12951",
  "when will mumbai rajdhani arrive",

  "departure time of 12951",
  "when does vivek express leave",

  "timing of 12951",
  "schedule of mumbai rajdhani",

  "what train is in platform 3",
  "trains at platform 5",

  "food stalls in platform 3",
  "where can i eat",

  "washroom in platform 3",
  "toilet kaha hai",

  "cloak room in platform 1",
  "luggage storage kaha hai",

  "waiting hall in platform 5",
  "lounge kaha hai",

  "ticket counter kaha hai",
  "where to buy ticket"
];

  return (
    <>
    <div style={{

  width: "100%",
  minHeight: "100vh",
  background: "#030712",
      fontFamily:"'Rajdhani','Noto Sans Devanagari','Noto Sans Telugu',sans-serif",
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0f172a}
        ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:2px}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}
        @keyframes marquee{0%{transform:translateX(100vw)}100%{transform:translateX(-100%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes glow-pulse{0%,100%{box-shadow:0 0 10px #0ea5e9,0 0 20px rgba(14,165,233,0.25)}50%{box-shadow:0 0 28px #0ea5e9,0 0 56px rgba(14,165,233,0.5)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .train-row:hover{background:#0f2744!important;cursor:pointer}
        .glow-btn{animation:glow-pulse 2s ease-in-out infinite}
        .lang-opt:hover{background:#1e3a5f!important}
        .chip-btn:hover{background:#0f2744!important;border-color:#2563eb!important}
        .filter-tab:hover{background:#0f2744!important}
        input::placeholder{color:#334155}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}
        .hist-item:hover{background:#0f2744!important}
        .hist-replay:hover{opacity:1!important}
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <header style={{
        background:"linear-gradient(90deg,#060c18 0%,#0c1a30 50%,#060c18 100%)",
        borderBottom:"1px solid #1e3a5f",
        padding:"0 14px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        height:"52px", flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:"9px",flexShrink:0}}>
          <div style={{
            width:"32px",height:"32px",borderRadius:"50%",
            background:"linear-gradient(135deg,#0ea5e9,#2563eb)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px"
          }}>🚆</div>
          <div>
            <div style={{color:"#e2e8f0",fontWeight:700,fontSize:"13px",letterSpacing:"0.1em"}}>INDIAN RAILWAYS</div>
            <div style={{color:"#aabacfff",fontSize:"10px",letterSpacing:"0.15em"}}>DIGITAL ASSISTANCE KIOSK</div>
          </div>
        </div>

        <div style={{flex:1,overflow:"hidden",margin:"0 14px"}}>
          <div style={{color:"#f59e0b",fontSize:"11px",whiteSpace:"nowrap",animation:"marquee 40s linear infinite"}}>
            {marqueeText}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <div style={{color:"#e2e8f0",fontWeight:700,fontSize:"16px"}}>
              {time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
            </div>
            <div style={{color:"#aabacfff",fontSize:"10px"}}>
              {time.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short"})}
            </div>
          </div>

          {/* Language Dropdown */}
          <div ref={langMenuRef} style={{position:"relative"}}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              style={{
                background:"#0c1a30",border:"1px solid #2563eb",borderRadius:"8px",
                padding:"5px 10px",color:"#93c5fd",cursor:"pointer",
                fontFamily:"inherit",fontSize:"12px",fontWeight:600,
                display:"flex",alignItems:"center",gap:"5px",
              }}
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <span style={{color:"#475569",fontSize:"10px"}}>{showLangMenu ? "▴" : "▾"}</span>
            </button>

            {showLangMenu && (
              <div style={{
                position:"absolute",top:"calc(100% + 5px)",right:0,
                background:"#0c1825",border:"1px solid #1e3a5f",borderRadius:"10px",
                padding:"5px",minWidth:"175px",zIndex:9999,
                boxShadow:"0 10px 40px rgba(0,0,0,0.7)",
                animation:"fadeUp 0.15s ease",
              }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className="lang-opt"
                    onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                    style={{
                      display:"flex",alignItems:"center",gap:"8px",
                      width:"100%",padding:"8px 10px",
                      background:lang===l.code?"#1e3a5f":"transparent",
                      border:"none",borderRadius:"6px",
                      color:lang===l.code?"#e2e8f0":"#94a3b8",
                      cursor:"pointer",fontFamily:"inherit",
                      fontSize:"13px",fontWeight:lang===l.code?700:400,
                      textAlign:"left",transition:"background 0.15s",
                    }}
                  >
                    <span style={{fontSize:"15px"}}>{l.flag}</span>
                    <span style={{flex:1}}>{l.label}</span>
                    {lang===l.code && <span style={{color:"#0ea5e9",fontSize:"13px"}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══ NAV — 2 tabs only ═══ */}
      <nav style={{
        background:"#060c18",borderBottom:"1px solid #1e3a5f",
        display:"flex",alignItems:"stretch",flexShrink:0,padding:"0 6px",
      }}>
        {[
          { key:"assistant", icon:"🎤", label:getTr("voiceAssistant",lang) },
          { key:"trains",    icon:"🚆", label:getTr("trainBoard",lang) },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding:"11px 20px",background:"transparent",border:"none",
              borderBottom:tab===key?"3px solid #0ea5e9":"3px solid transparent",
              color:tab===key?"#e2e8f0":"#64748b",
              cursor:"pointer",fontFamily:"inherit",
              fontSize:"13px",fontWeight:700,letterSpacing:"0.05em",
              display:"flex",alignItems:"center",gap:"6px",
              transition:"all 0.2s",whiteSpace:"nowrap",
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",paddingRight:"12px",gap:"10px"}}>
          {/* History toggle button */}
          <button
            onClick={() => setShowHistory(v => !v)}
            style={{
              background:showHistory?"#1e3a5f":"transparent",
              border:`1px solid ${showHistory?"#0ea5e9":"#1e3a5f"}`,
              borderRadius:"6px",padding:"4px 10px",
              color:showHistory?"#e2e8f0":"#64748b",
              cursor:"pointer",fontFamily:"inherit",
              fontSize:"12px",fontWeight:600,
              display:"flex",alignItems:"center",gap:"5px",
              transition:"all 0.2s",
            }}
          >
            🕘 History
            {history.length > 0 && (
              <span style={{
                background:"#0ea5e9",color:"#fff",
                borderRadius:"10px",padding:"0 5px",
                fontSize:"10px",fontWeight:700,
              }}>{history.length}</span>
            )}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e"}}/>
            <span style={{color:"#334155",fontSize:"10px",fontWeight:600}}>LIVE</span>
          </div>
        </div>
      </nav>

      {/* ═══ CONTENT ═══ */}
      <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

        {/* ────── VOICE ASSISTANT TAB ────── */}
        {tab === "assistant" && (
          <div style={{
            flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"flex-start",
            gap:"18px",padding:"22px 16px 16px",overflowY:"auto",
          }}>

            {/* Greeting */}
            <div style={{textAlign:"center",animation:"fadeUp 0.4s ease"}}>
              <h2 style={{color:"#e2e8f0",fontSize:"clamp(17px,2.5vw,24px)",fontWeight:700,margin:0,lineHeight:1.35}}>
                {getTr("greeting",lang)}
              </h2>
              <p style={{color:"#64748b",fontSize:"13px",margin:"5px 0 0"}}>
                {getTr("subGreeting",lang)}
              </p>
            </div>

            {/* Voice Button */}
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {listening && (
                <>
                  <div style={{
                    position:"absolute",width:"128px",height:"128px",borderRadius:"50%",
                    border:"2px solid #0ea5e9",
                    animation:"pulse-ring 1.2s cubic-bezier(0.215,0.61,0.355,1) infinite",
                    pointerEvents:"none",
                  }}/>
                  <div style={{
                    position:"absolute",width:"128px",height:"128px",borderRadius:"50%",
                    border:"2px solid #0ea5e9",
                    animation:"pulse-ring 1.2s cubic-bezier(0.215,0.61,0.355,1) 0.4s infinite",
                    pointerEvents:"none",
                  }}/>
                </>
              )}
              <button
                className={listening ? "" : "glow-btn"}
                onClick={listening ? stopListening : startListening}
                style={{
                  width:"92px",height:"92px",borderRadius:"50%",
                  background:listening
                    ?"linear-gradient(135deg,#dc2626,#ef4444)"
                    :"linear-gradient(135deg,#0369a1,#0ea5e9)",
                  border:"none",cursor:"pointer",
                  fontSize:"36px",display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"transform 0.2s, background 0.3s",flexShrink:0,
                  position:"relative",zIndex:1,
                }}
              >
                {listening ? "⏹" : "🎤"}
              </button>
            </div>

            <div style={{
              color:listening?"#0ea5e9":"#475569",
              fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",
              animation:listening?"blink 1s ease infinite":"none",
            }}>
              {listening ? getTr("listening",lang) : getTr("tapToSpeak",lang)}
            </div>

            {/* Text Input + Search Button */}
            <form
              onSubmit={handleTextSubmit}
              style={{display:"flex",gap:"8px",width:"100%",maxWidth:"560px"}}
            >
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={getTr("typeHere",lang)}
                style={{
                  flex:1,background:"#0a1628",
                  border:"1px solid #1e3a5f",borderRadius:"10px",
                  padding:"11px 15px",color:"#e2e8f0",
                  fontFamily:"inherit",fontSize:"14px",outline:"none",
                  transition:"border-color 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor="#0ea5e9"; e.target.style.boxShadow="0 0 0 2px rgba(14,165,233,0.15)"; }}
                onBlur={e  => { e.target.style.borderColor="#1e3a5f"; e.target.style.boxShadow="none"; }}
              />
              <button
                type="submit"
                style={{
                  background:"linear-gradient(135deg,#0369a1,#0ea5e9)",
                  border:"none",borderRadius:"10px",
                  padding:"11px 20px",color:"#fff",
                  cursor:"pointer",fontFamily:"inherit",
                  fontSize:"14px",fontWeight:700,flexShrink:0,
                  transition:"opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}
              >
                {getTr("search",lang)}
              </button>
            </form>

            {/* Result Card */}
            {intentResult && (
              <div style={{
                background:"#0a1628",border:"1px solid #1e3a5f",
                borderRadius:"12px",padding:"15px 18px",
                maxWidth:"560px",width:"100%",
                animation:"fadeUp 0.25s ease",
              }}>
                {lastQuery && (
                  <div style={{color:"#334155",fontSize:"11px",marginBottom:"8px",fontStyle:"italic"}}>
                    "{lastQuery}"
                  </div>
                )}
                <div style={{color:"#e2e8f0",fontSize:"15px",lineHeight:1.6}}>
                  💬 {intentResult.response}
                </div>
                {intentResult.train && (
                  <div style={{marginTop:"12px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
                    <button
                      onClick={() => { setTab("trains"); setExpandedTrain(intentResult.train.number); }}
                      style={{
                        background:"#1e3a5f",border:"1px solid #2563eb",borderRadius:"6px",
                        padding:"6px 14px",color:"#93c5fd",cursor:"pointer",
                        fontFamily:"inherit",fontSize:"12px",fontWeight:600,
                      }}
                    >
                      🚋 {getTr("viewCoaches",lang)}
                    </button>
                    <button
                      onClick={() => setTab("trains")}
                      style={{
                        background:"#0f2744",border:"1px solid #1e3a5f",borderRadius:"6px",
                        padding:"6px 14px",color:"#64748b",cursor:"pointer",
                        fontFamily:"inherit",fontSize:"12px",fontWeight:600,
                      }}
                    >
                      📋 {getTr("trainBoard",lang)}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Chips */}
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center",maxWidth:"580px"}}>
              {quickChips.map(c => (
                <button
                  key={c.num}
                  className="chip-btn"
                  onClick={() => { setInputText(c.num); processQuery(c.num); }}
                  style={{
                    background:"#0a1628",border:"1px solid #1e3a5f",
                    borderRadius:"20px",padding:"6px 14px",
                    cursor:"pointer",fontFamily:"inherit",
                    display:"flex",alignItems:"center",gap:"6px",
                    transition:"all 0.18s",
                  }}
                >
                  <span style={{color:"#0ea5e9",fontSize:"11px"}}>▶</span>
                  <span style={{color:"#94a3b8",fontSize:"11px"}}>{c.short}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ────── TRAIN BOARD TAB ────── */}
        {tab === "trains" && (
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

            {/* Sub-header */}
            <div style={{
              background:"#060c18",borderBottom:"1px solid #1e3a5f",
              padding:"10px 14px",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              flexWrap:"wrap",gap:"8px",flexShrink:0,
            }}>
              <div>
                <div style={{color:"#e2e8f0",fontWeight:700,fontSize:"14px"}}>{getTr("trainBoard",lang)}</div>
                <div style={{color:"#334155",fontSize:"10px"}}>{getTr("boardSubtitle",lang)}</div>
              </div>
              <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                {[
                  { key:"all",       lbl:getTr("allTrains",lang)   },
                  { key:"arriving",  lbl:getTr("arriving",lang)    },
                  { key:"departing", lbl:getTr("departing",lang)   },
                  { key:"passing",   lbl:getTr("passThrough",lang) },
                ].map(({ key, lbl }) => (
                  <button
                    key={key}
                    className="filter-tab"
                    onClick={() => setTrainFilter(key)}
                    style={{
                      padding:"5px 11px",cursor:"pointer",
                      fontFamily:"inherit",fontSize:"12px",fontWeight:600,
                      border:`1px solid ${trainFilter===key?"#0ea5e9":"#1e3a5f"}`,
                      borderRadius:"6px",
                      background:trainFilter===key?"#0f2744":"transparent",
                      color:trainFilter===key?"#e2e8f0":"#64748b",
                      display:"flex",alignItems:"center",gap:"5px",
                      transition:"all 0.18s",
                    }}
                  >
                    {lbl}
                    <span style={{
                      background:trainFilter===key?"#0ea5e9":"#1e3a5f",
                      color:trainFilter===key?"#fff":"#64748b",
                      borderRadius:"10px",padding:"1px 6px",
                      fontSize:"10px",fontWeight:700,
                    }}>{counts[key]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
              {/* Column header */}
              <div style={{
                display:"grid",
                gridTemplateColumns:"80px 1fr 80px 80px 48px 64px 105px",
                gap:"6px",padding:"7px 12px",
                background:"#0a1424",borderRadius:"6px",
                color:"#334155",fontSize:"10px",letterSpacing:"0.1em",
                marginBottom:"4px",position:"sticky",top:0,zIndex:10,
              }}>
                <span>{getTr("trainNo",lang)}</span>
                <span>{getTr("trainName",lang)}</span>
                <span>{getTr("arrival",lang)}</span>
                <span>{getTr("departure",lang)}</span>
                <span>{getTr("pf",lang)}</span>
                <span>{getTr("delay",lang)}</span>
                <span>{getTr("statusLabel",lang)}</span>
              </div>

              {filteredTrains.length === 0 && (
                <div style={{textAlign:"center",color:"#475569",padding:"40px 0",fontSize:"14px"}}>
                  {getTr("noTrains",lang)}
                </div>
              )}

              <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
                {filteredTrains.map(item => (
                  <React.Fragment key={item.number}>
                    <div
                      className="train-row"
                      onClick={() => setExpandedTrain(expandedTrain===item.number ? null : item.number)}
                      style={{
                        display:"grid",
                        gridTemplateColumns:"80px 1fr 80px 80px 48px 64px 105px",
                        gap:"6px",padding:"10px 12px",
                        background:expandedTrain===item.number?"#0f2744":"#07111e",
                        borderRadius:"7px",
                        borderLeft:expandedTrain===item.number?"3px solid #0ea5e9":"3px solid transparent",
                        transition:"all 0.15s",alignItems:"center",
                      }}
                    >
                      <span style={{color:"#f59e0b",fontWeight:700,fontSize:"13px"}}>{item.number}</span>

                      <div>
                        <div style={{color:"#e2e8f0",fontSize:"13px",fontWeight:600}}>
                          {getTrainName(item,lang)}
                        </div>
                        <div style={{color:"#334155",fontSize:"10px"}}>{item.from} → {item.to}</div>
                      </div>

                      <div>
                        <div style={{color:"#93c5fd",fontSize:"13px"}}>{item.actualArrival}</div>
                        {item.scheduledArrival!==item.actualArrival && (
                          <div style={{color:"#475569",fontSize:"10px",textDecoration:"line-through"}}>{item.scheduledArrival}</div>
                        )}
                      </div>

                      <div>
                        <div style={{color:"#93c5fd",fontSize:"13px"}}>{item.actualDeparture}</div>
                        {item.scheduledDeparture!==item.actualDeparture && (
                          <div style={{color:"#475569",fontSize:"10px",textDecoration:"line-through"}}>{item.scheduledDeparture}</div>
                        )}
                      </div>

                      <span style={{color:"#f59e0b",fontWeight:700,fontSize:"16px",textAlign:"center"}}>
                        {item.platform}
                      </span>

                      <span style={{color:item.delay>0?"#ef4444":"#22c55e",fontSize:"13px",fontWeight:700}}>
                        {item.delay>0 ? `+${item.delay}m` : "—"}
                      </span>

                      {item.type==="passing" ? (
                        <span style={{color:"#a78bfa",fontSize:"11px",fontWeight:700,background:"#2e1065",padding:"3px 7px",borderRadius:"4px"}}>
                          {getTr("passing",lang)}
                        </span>
                      ) : item.status==="on-time" ? (
                        <span style={{color:"#22c55e",fontSize:"11px",fontWeight:700,background:"#052e16",padding:"3px 7px",borderRadius:"4px"}}>
                          {getTr("onTime",lang)}
                        </span>
                      ) : (
                        <span style={{color:"#ef4444",fontSize:"11px",fontWeight:700,background:"#450a0a",padding:"3px 7px",borderRadius:"4px"}}>
                          {getTr("delayed",lang)}
                        </span>
                      )}
                    </div>

                    {/* Expanded coach view */}
                    {expandedTrain===item.number && (
                      <div style={{
                        background:"#0a1628",border:"1px solid #1e3a5f",
                        borderRadius:"10px",padding:"13px 15px",
                        marginBottom:"2px",animation:"fadeUp 0.2s ease",
                      }}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                          <div style={{color:"#0ea5e9",fontWeight:700,fontSize:"12px",letterSpacing:"0.1em"}}>
                            🚋 {getTr("coaches",lang)} — {item.number} {getTrainName(item,lang)}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); setExpandedTrain(null); }}
                            style={{
                              background:"#1e3a5f",border:"none",borderRadius:"5px",
                              padding:"3px 10px",color:"#94a3b8",cursor:"pointer",
                              fontFamily:"inherit",fontSize:"11px",
                            }}
                          >{getTr("close",lang)}</button>
                        </div>

                        <div style={{display:"flex",gap:"4px",overflowX:"auto",paddingBottom:"6px"}}>
                          {item.coaches.map((coach, i) => (
                            <div key={i} style={{
                              minWidth:"48px",height:"62px",borderRadius:"6px",
                              background:COACH_COLORS[coach]||"#374151",
                              border:"1px solid rgba(255,255,255,0.1)",
                              display:"flex",flexDirection:"column",
                              alignItems:"center",justifyContent:"center",
                              padding:"3px",flexShrink:0,
                            }}>
                              <div style={{color:"#fff",fontSize:"11px",fontWeight:700}}>{coach}</div>
                              <div style={{color:"rgba(255,255,255,0.55)",fontSize:"8px",textAlign:"center",lineHeight:1.2}}>
                                {COACH_LABELS[coach]||coach}
                              </div>
                              {coach!=="LOCO" && (
                                <div style={{color:"rgba(255,255,255,0.35)",fontSize:"8px"}}>#{i}</div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginTop:"8px"}}>
                          {[["#7c3aed","1st AC"],["#0891b2","2nd AC"],["#059669","3rd AC/Chair"],["#d97706","Sleeper"],["#374151","Loco/General"]].map(([c,l])=>(
                            <div key={l} style={{display:"flex",alignItems:"center",gap:"4px"}}>
                              <div style={{width:"10px",height:"10px",borderRadius:"2px",background:c}}/>
                              <span style={{color:"#475569",fontSize:"10px"}}>{l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ HISTORY SIDE PANEL ═══ */}
      {showHistory && (
        <div style={{
          position:"fixed",top:0,right:0,width:"340px",height:"100vh",
          background:"#070d18",borderLeft:"1px solid #1e3a5f",
          display:"flex",flexDirection:"column",
          zIndex:1000,animation:"slideIn 0.25s ease",
          boxShadow:"-8px 0 40px rgba(0,0,0,0.6)",
        }}>
          {/* Panel header */}
          <div style={{
            padding:"14px 16px",borderBottom:"1px solid #1e3a5f",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            background:"#0c1825",flexShrink:0,
          }}>
            <div>
              <div style={{color:"#e2e8f0",fontWeight:700,fontSize:"14px"}}>🕘 Query History</div>
              <div style={{color:"#334155",fontSize:"10px",marginTop:"2px"}}>
                {history.length} {history.length === 1 ? "entry" : "entries"} · tap to replay
              </div>
            </div>
            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  style={{
                    background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:"5px",
                    padding:"4px 8px",color:"#ef4444",cursor:"pointer",
                    fontFamily:"inherit",fontSize:"10px",fontWeight:600,
                  }}
                >Clear</button>
              )}
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  background:"#1e3a5f",border:"none",borderRadius:"5px",
                  width:"26px",height:"26px",color:"#94a3b8",
                  cursor:"pointer",fontFamily:"inherit",fontSize:"14px",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}
              >✕</button>
            </div>
          </div>

          {/* Entries */}
          <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
            {history.length === 0 ? (
              <div style={{
                display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",height:"100%",gap:"10px",
                color:"#334155",
              }}>
                <span style={{fontSize:"36px",opacity:0.4}}>🕘</span>
                <span style={{fontSize:"13px"}}>No queries yet</span>
                <span style={{fontSize:"11px",textAlign:"center",maxWidth:"200px"}}>
                  Your search and voice queries will appear here
                </span>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                {history.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="hist-item"
                    style={{
                      background:"#0a1628",border:"1px solid #1e3a5f",
                      borderRadius:"10px",padding:"11px 13px",
                      transition:"background 0.15s",cursor:"default",
                    }}
                  >
                    {/* Top row: timestamp + lang + replay */}
                    <div style={{
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      marginBottom:"7px",
                    }}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <span style={{
                          background:"#1e3a5f",borderRadius:"4px",
                          padding:"2px 6px",color:"#93c5fd",
                          fontSize:"10px",fontWeight:600,
                        }}>{entry.langLabel}</span>
                        <span style={{color:"#334155",fontSize:"10px"}}>
                          {entry.timestamp.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                        </span>
                        {idx === 0 && (
                          <span style={{
                            background:"#052e16",color:"#22c55e",
                            borderRadius:"4px",padding:"1px 5px",
                            fontSize:"9px",fontWeight:700,
                          }}>LATEST</span>
                        )}
                      </div>
                      <button
                        className="hist-replay"
                        onClick={() => {
                          setInputText(entry.query);
                          processQuery(entry.query);
                          setShowHistory(false);
                        }}
                        style={{
                          background:"#1e3a5f",border:"none",borderRadius:"4px",
                          padding:"3px 8px",color:"#0ea5e9",
                          cursor:"pointer",fontFamily:"inherit",
                          fontSize:"10px",fontWeight:600,
                          opacity:0.7,transition:"opacity 0.15s",
                        }}
                      >▶ Replay</button>
                    </div>

                    {/* Query */}
                    <div style={{
                      color:"#f59e0b",fontSize:"13px",fontWeight:600,
                      marginBottom:"5px",
                      display:"flex",alignItems:"flex-start",gap:"5px",
                    }}>
                      <span style={{color:"#475569",flexShrink:0,marginTop:"1px"}}>❓</span>
                      <span>{entry.query}</span>
                    </div>

                    {/* Response */}
                    <div style={{
                      color:"#94a3b8",fontSize:"12px",lineHeight:1.5,
                      display:"flex",alignItems:"flex-start",gap:"5px",
                      borderTop:"1px solid #1e3a5f",paddingTop:"6px",
                    }}>
                      <span style={{color:"#0ea5e9",flexShrink:0,marginTop:"1px"}}>💬</span>
                      <span>{entry.response}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel footer */}
          <div style={{
            padding:"8px 12px",borderTop:"1px solid #1e3a5f",
            background:"#060c18",flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"space-between",
          }}>
            <span style={{color:"#1e3a5f",fontSize:"10px"}}>Session history only · resets on page reload</span>
          </div>
        </div>
      )}

      {/* Overlay to close panel by clicking outside */}
      {showHistory && (
        <div
          onClick={() => setShowHistory(false)}
          style={{
            position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",
            zIndex:999,
          }}
        />
      )}

<div style={{padding:"10px",background:"#030712",borderTop:"1px solid #1e3a5f"}}>
  <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
    {SAMPLE_QUERIES.map((q, i) => (
      <button
        key={i}
        onClick={() => handleSearch(q)}
        style={{
          background:"#0f2744",border:"1px solid #1e3a5f",
          borderRadius:"6px",padding:"6px 10px",
          color:"#94a3b8",cursor:"pointer",
          fontFamily:"inherit",fontSize:"12px",
        }}
      >{q}</button>
    ))}
  </div>
</div>  
      {/* ═══ BOTTOM BAR ═══ */}
      <footer style={{
        background:"#060c18",borderTop:"1px solid #1e3a5f",
        padding:"5px 14px",display:"flex",
        justifyContent:"space-between",alignItems:"center",flexShrink:0,
      }}>
        <span style={{color:"#1e3a5f",fontSize:"10px"}}>🇮🇳 Indian Railways — Digital Kiosk</span>
        <span style={{color:"#1e3a5f",fontSize:"10px"}}>EN · HI · TE · Mixed</span>
        <button
          onClick={() => {
            setTab("assistant");
            setIntentResult(null);
            setInputText("");
            setLastQuery("");
            setExpandedTrain(null);
          }}
          style={{
            background:"#0f2744",border:"none",borderRadius:"4px",
            padding:"4px 10px",color:"#475569",cursor:"pointer",
            fontFamily:"inherit",fontSize:"10px",
          }}
        >🏠 Reset</button>
      </footer>
    </div>

    </>
  );
}
