import React, { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm";

// ─── MOCK DATA (mirrors backend) ───────────────────────────────────────────
const TRAINS = [
  { number: "12951", name: "Mumbai Rajdhani", nameHindi: "मुंबई राजधानी", from: "Mumbai Central", to: "New Delhi", scheduledArrival: "08:35", actualArrival: "08:52", scheduledDeparture: "08:45", actualDeparture: "09:02", platform: 3, status: "delayed", delay: 17, coaches: ["LOCO", "H1", "H2", "A1", "A2", "B1", "B2", "B3", "B4", "S1", "S2", "S3", "S4", "S5", "S6", "GS", "GS"] },
  { number: "12002", name: "Bhopal Shatabdi", nameHindi: "भोपाल शताब्दी", from: "New Delhi", to: "Habibganj", scheduledArrival: "10:00", actualArrival: "10:00", scheduledDeparture: "06:00", actualDeparture: "06:00", platform: 1, status: "on-time", delay: 0, coaches: ["LOCO", "EC", "CC", "CC", "CC", "CC", "CC", "CC", "CC", "CC", "CC", "CC"] },
  { number: "22691", name: "Rajdhani Express", nameHindi: "राजधानी एक्सप्रेस", from: "Bangalore", to: "New Delhi", scheduledArrival: "20:00", actualArrival: "21:30", scheduledDeparture: "20:10", actualDeparture: "21:40", platform: 5, status: "delayed", delay: 90, coaches: ["LOCO", "H1", "A1", "A2", "B1", "B2", "B3", "B4", "S1", "S2", "S3", "S4", "GS", "GS"] },
  { number: "12301", name: "Howrah Rajdhani", nameHindi: "हावड़ा राजधानी", from: "Howrah", to: "New Delhi", scheduledArrival: "09:55", actualArrival: "09:55", scheduledDeparture: "10:05", actualDeparture: "10:05", platform: 2, status: "on-time", delay: 0, coaches: ["LOCO", "H1", "H2", "A1", "A2", "B1", "B2", "B3", "S1", "S2", "S3", "S4", "S5", "GS"] },
  { number: "19027", name: "Vivek Express", nameHindi: "विवेक एक्सप्रेस", from: "Dibrugarh", to: "Kanyakumari", scheduledArrival: "14:20", actualArrival: "15:05", scheduledDeparture: "14:30", actualDeparture: "15:15", platform: 6, status: "delayed", delay: 45, coaches: ["LOCO", "SL", "SL", "SL", "SL", "SL", "SL", "GS", "GS", "GS"] },
  { number: "12563", name: "Bihar Sampark Kranti", nameHindi: "बिहार संपर्क क्रांति", from: "New Delhi", to: "Rajendranagar", scheduledArrival: "11:00", actualArrival: "11:00", scheduledDeparture: "11:05", actualDeparture: "11:05", platform: 4, status: "on-time", delay: 0, coaches: ["LOCO", "A1", "B1", "B2", "S1", "S2", "S3", "S4", "GS"] },
];

const PLATFORMS = [
  { id: 1, crowdLevel: 45, trains: ["12002"], amenities: ["Waiting Room", "Water Cooler"] },
  { id: 2, crowdLevel: 30, trains: ["12301"], amenities: ["Waiting Room", "Bookstall"] },
  { id: 3, crowdLevel: 78, trains: ["12951"], amenities: ["Food Stall", "ATM", "Water Cooler"] },
  { id: 4, crowdLevel: 20, trains: ["12563"], amenities: ["Waiting Room"] },
  { id: 5, crowdLevel: 65, trains: ["22691"], amenities: ["Food Stall", "Pharmacy", "Water Cooler"] },
  { id: 6, crowdLevel: 55, trains: ["19027"], amenities: ["Waiting Room", "Bookstall"] },
];
const MAP_FACILITIES = [
  { id: "pf1", label: "PF 1", x: 12, y: 34, w: 28, h: 7, type: "platform", pid: 1 },
  { id: "pf2", label: "PF 2", x: 12, y: 43, w: 28, h: 7, type: "platform", pid: 2 },
  { id: "pf3", label: "PF 3", x: 12, y: 52, w: 28, h: 7, type: "platform", pid: 3 },
  { id: "pf4", label: "PF 4", x: 60, y: 34, w: 28, h: 7, type: "platform", pid: 4 },
  { id: "pf5", label: "PF 5", x: 60, y: 43, w: 28, h: 7, type: "platform", pid: 5 },
  { id: "pf6", label: "PF 6", x: 60, y: 52, w: 28, h: 7, type: "platform", pid: 6 },
  { id: "tc1", label: "🎫 Tickets", x: 5, y: 8, w: 20, h: 8, type: "ticket" },
  { id: "tc2", label: "🎫 UTS", x: 28, y: 8, w: 16, h: 8, type: "ticket" },
  { id: "wr1", label: "🛋 Waiting", x: 47, y: 8, w: 20, h: 8, type: "waiting" },
  { id: "fo1", label: "🍱 Food Court", x: 70, y: 8, w: 24, h: 8, type: "food" },
  { id: "ex1", label: "🚪 Main Exit", x: 30, y: 78, w: 20, h: 8, type: "exit" },
  { id: "ex2", label: "🚪 South Exit", x: 68, y: 78, w: 20, h: 8, type: "exit" },
  { id: "atm1", label: "🏧 ATM", x: 5, y: 70, w: 14, h: 8, type: "atm" },
  { id: "ph1", label: "💊 Pharmacy", x: 55, y: 70, w: 20, h: 8, type: "medical" },
  { id: "kiosk", label: "📍 YOU", x: 40, y: 70, w: 12, h: 8, type: "kiosk" },
];

const COACH_COLORS = {
  LOCO: "#374151", H1: "#7c3aed", H2: "#7c3aed",
  A1: "#0891b2", A2: "#0891b2",
  B1: "#059669", B2: "#059669", B3: "#059669", B4: "#059669",
  S1: "#d97706", S2: "#d97706", S3: "#d97706", S4: "#d97706", S5: "#d97706", S6: "#d97706",
  EC: "#0891b2", CC: "#059669", SL: "#d97706", GS: "#6b7280",
};

const COACH_LABELS = {
  LOCO: "Engine", H1: "1st AC", H2: "1st AC", A1: "2nd AC", A2: "2nd AC",
  B1: "3rd AC", B2: "3rd AC", B3: "3rd AC", B4: "3rd AC",
  S1: "Sleeper", S2: "Sleeper", S3: "Sleeper", S4: "Sleeper", S5: "Sleeper", S6: "Sleeper",
  EC: "Exec Chair", CC: "Chair Car", SL: "Sleeper", GS: "General",
};

// ─── INTENT DETECTION (frontend fallback) ──────────────────────────────────
function formatTimeForSpeech(time) {
  if (!time) return "";

  const [hourMin, period] = time.split(" ");
  const [hour, minute] = hourMin.split(":");

  if (minute === "00") {
    return `${hour} o'clock ${period === "AM" ? "in the morning" : "in the evening"}`;
  } else {
    return `${hour} ${minute} ${period}`;
  }
}

function detectIntent(text, lang) {
  const lower = text.toLowerCase();

  // 🔹 Query type detection
  const isPlatformQuery = /platform|प्लेटफॉर्म/.test(lower);
  const isDelayQuery = /delay|late|देरी/.test(lower);
  const isDepartureQuery = /departure|leave|time|timing|कब/.test(lower);

  // 🔹 1. Train number detection
  const numMatch = lower.match(/\b(1[0-9]{4})\b/);
  if (numMatch) {
    const train = TRAINS.find(t => t.number === numMatch[1]);

    if (train) {
      let response = "";

      if (isPlatformQuery) {
        response = lang === "hi"
          ? `कृपया ध्यान दीजिए...गाड़ी संख्या ${train.number}, ${train.nameHindi}, प्लेटफॉर्म संख्या ${train.platform} पर खड़ी है।`
          : `Attention please. Train number ${train.number}, ${train.name}, is standing on platform number ${train.platform}.`;
      }

      else if (isDelayQuery) {
        response = lang === "hi"
          ? `कृपया ध्यान दीजिए...गाड़ी संख्या ${train.number}, ${train.nameHindi}, लगभग ${train.delay} मिनट की देरी से चल रही है।`
          : `Attention please. Train number ${train.number}, ${train.name}, is running late by approximately ${train.delay} minutes.`;
      }

      else if (isDepartureQuery) {
        response = lang === "hi"
          ? `कृपया ध्यान दीजिए...गाड़ी संख्या ${train.number}, ${train.nameHindi}, प्लेटफॉर्म संख्या ${train.platform} से ${train.actualDeparture} बजे प्रस्थान करेगी।`
          : `Attention please. Train number ${train.number}, ${train.name}, will depart from platform number ${train.platform} at ${train.actualDeparture}.`;
      }

      else {
        response = lang === "hi"
          ? `कृपया ध्यान दीजिए...गाड़ी संख्या ${train.number}, ${train.nameHindi}, प्लेटफॉर्म संख्या ${train.platform} पर आएगी। यह गाड़ी ${train.actualDeparture} बजे प्रस्थान करेगी।`
          : `Attention please. Train number ${train.number}, ${train.name}, will arrive on platform number ${train.platform}. It is scheduled to depart at ${train.actualDeparture}.`;
      }

      return {
        intent: "train_status",
        train,
        highlight: "train_status",
        response
      };
    }

    return {
      intent: "not_found",
      response: lang === "hi"
        ? `क्षमा करें...गाड़ी संख्या ${numMatch[1]} उपलब्ध नहीं है।`
        : `Sorry. Train number ${numMatch[1]} is not available.`,
      highlight: null
    };
  }

  // 🔹 2. Train name detection
  const trainByName = TRAINS.find(t =>
    lower.includes(t.name.toLowerCase()) ||
    lower.includes("rajdhani")
  );

  if (trainByName) {
    let response = "";

    if (isPlatformQuery) {
      response = lang === "hi"
        ? `कृपया ध्यान दीजिए...${trainByName.nameHindi} प्लेटफॉर्म संख्या ${trainByName.platform} पर खड़ी है।`
        : `Attention please. ${trainByName.name} is standing on platform number ${trainByName.platform}.`;
    }

    else if (isDelayQuery) {
      response = lang === "hi"
        ? `कृपया ध्यान दीजिए...${trainByName.nameHindi} लगभग ${trainByName.delay} मिनट देरी से चल रही है।`
        : `Attention please. ${trainByName.name} is running late by approximately ${trainByName.delay} minutes.`;
    }

    else if (isDepartureQuery) {
      response = lang === "hi"
        ? `कृपया ध्यान दीजिए...${trainByName.nameHindi} ${trainByName.actualDeparture} बजे प्रस्थान करेगी।`
        : `Attention please. ${trainByName.name} will depart at ${trainByName.actualDeparture}.`;
    }

    else {
      response = lang === "hi"
        ? `कृपया ध्यान दीजिए...${trainByName.nameHindi}, प्लेटफॉर्म संख्या ${trainByName.platform} से ${trainByName.actualDeparture} बजे प्रस्थान करेगी।`
        : `Attention please. ${trainByName.name} will depart from platform number ${trainByName.platform} at ${trainByName.actualDeparture}.`;
    }

    return {
      intent: "train_status",
      train: trainByName,
      highlight: "train_status",
      response
    };
  }

  // 🔹 3. Platform info
  const pfMatch = lower.match(/platform\s*(\d+)|प्लेटफॉर्म\s*(\d+)/);
  if (pfMatch) {
    const n = parseInt(pfMatch[1] || pfMatch[2]);
    const pf = PLATFORMS.find(p => p.id === n);

    if (pf) {
      const pfTrains = TRAINS
        .filter(t => t.platform === n)
        .map(t => t.name)
        .join(", ");

      return {
        intent: "platform",
        platform: pf,
        response: lang === "hi"
          ? `कृपया ध्यान दीजिए...प्लेटफॉर्म ${n} पर आने वाली गाड़ियाँ हैं: ${pfTrains || "कोई ट्रेन नहीं"}।`
          : `Attention please. Trains on platform ${n} are: ${pfTrains || "none at the moment"}.`,
        highlight: "map"
      };
    }
  }

  // 🔹 4. Crowd
  if (/crowd|congestion|भीड़/.test(lower)) {
    const sorted = [...PLATFORMS].sort((a, b) => b.crowdLevel - a.crowdLevel);

    return {
      intent: "crowd",
      response: lang === "hi"
        ? `कृपया ध्यान दीजिए...प्लेटफॉर्म ${sorted[0].id} पर सबसे अधिक भीड़ है।`
        : `Attention please. Platform ${sorted[0].id} is currently the most crowded.`,
      highlight: "crowd"
    };
  }

  // 🔹 5. Facilities
  if (/food|eat|खाना|restaurant/.test(lower)) {
    return {
      intent: "facility",
      response: lang === "hi"
        ? "कृपया ध्यान दीजिए...फूड कोर्ट प्लेटफॉर्म 5 और 6 के पास स्थित है।"
        : "Attention please. Food court is located near platforms 5 and 6.",
      highlight: "map"
    };
  }

  if (/ticket|टिकट/.test(lower)) {
    return {
      intent: "facility",
      response: lang === "hi"
        ? "कृपया ध्यान दीजिए...टिकट काउंटर मुख्य प्रवेश द्वार के पास है।"
        : "Attention please. Ticket counters are near the main entrance.",
      highlight: "map"
    };
  }

  if (/wait|rest|प्रतीक्षा/.test(lower)) {
    return {
      intent: "facility",
      response: lang === "hi"
        ? "कृपया ध्यान दीजिए...प्रतीक्षा कक्ष प्लेटफॉर्म 1, 2 और 4 के पास है।"
        : "Attention please. Waiting rooms are located near platforms 1, 2 and 4.",
      highlight: "map"
    };
  }

  // 🔹 6. Fallback
  return {
    intent: "unknown",
    response: lang === "hi"
      ? "क्षमा करें...मैं आपकी बात समझ नहीं पाया। कृपया ट्रेन संख्या या सुविधा के बारे में पूछें।"
      : "Sorry, I did not understand. Please ask about a train number or facility.",
    highlight: null
  };
}// ─── SPEAK (TTS) ────────────────────────────────────────────────────────────

function speak(text, lang = "en-IN") {

  if (!window.speechSynthesis) return;

  // Convert numbers like 12951 → 1 2 9 5 1
  const formattedText = text.replace(/\d+/g, function (num) {
    return num.split('').join(' ');
  });

  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(formattedText);

  utt.lang = lang === "hi" ? "hi-IN" : "en-IN";
  utt.rate = 0.79;   // slower like railway announcement
  utt.pitch = 1.0;

  window.speechSynthesis.speak(utt);
}

// ─── QR GENERATOR ───────────────────────────────────────────────────────────
async function generateQR(text) {
  try {
    return await QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: "#0f172a", light: "#f8fafc" } });
  } catch { return null; }
}

// ─── CLOCK ──────────────────────────────────────────────────────────────────
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return time;
}

// ─── CROWD COLOR ─────────────────────────────────────────────────────────────
function crowdColor(level) {
  if (level < 40) return "#22c55e";
  if (level < 70) return "#f59e0b";
  return "#ef4444";
}
function crowdLabel(level) {
  if (level < 40) return "Low";
  if (level < 70) return "Moderate";
  return "High";
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function RailwayKiosk() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("home");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [intentResult, setIntentResult] = useState(null);
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [coachTrain, setCoachTrain] = useState(null);
  const [coachInput, setCoachInput] = useState("");
  const [qrData, setQrData] = useState(null);
  const [qrImg, setQrImg] = useState(null);
  const [highlightPf, setHighlightPf] = useState(null);
  const [mapHighlight, setMapHighlight] = useState(null);
  const recogRef = useRef(null);
  const time = useClock();

  // Simulate crowd fluctuation
  useEffect(() => {
    const id = setInterval(() => {
      setPlatforms(prev => prev.map(p => ({
        ...p,
        crowdLevel: Math.max(10, Math.min(99, p.crowdLevel + Math.floor((Math.random() - 0.5) * 8)))
      })));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Voice listening
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Please use Chrome browser.");
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      processQuery(text);
    };
    recogRef.current = recog;
    recog.start();
  }, [lang]);

  const stopListening = () => {
    recogRef.current?.stop();
    setListening(false);
  };

  const processQuery = async (text) => {
    const result = detectIntent(text, lang);
    setIntentResult(result);
    speak(result.response, lang);
    if (result.highlight === "train_status" && result.train) {
      setSelectedTrain(result.train);
      setTab("status");
    } else if (result.highlight === "map" || result.highlight === "crowd") {
      setTab(result.highlight === "crowd" ? "crowd" : "map");
      if (result.platform) setHighlightPf(result.platform.id);
    }
    if (result.intent === "train_status" && result.train) {
      const url = `Train ${result.train.number} – ${result.train.name}\nPlatform: ${result.train.platform}\nStatus: ${result.train.status}\nDeparture: ${result.train.actualDeparture}`;
      const img = await generateQR(url);
      setQrImg(img);
      setQrData(url);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) processQuery(transcript);
  };

  // ── Coach finder ──────────────────────────────────────────────────────────
  const handleCoachSearch = (e) => {
    e?.preventDefault();
    const t = TRAINS.find(tr => tr.number === coachInput.trim());
    setCoachTrain(t || null);
  };

  // ── QR for selected info ──────────────────────────────────────────────────
  const generateInfoQR = async (info) => {
    const img = await generateQR(info);
    setQrImg(img);
    setQrData(info);
    setTab("qr");
  };

  const T = {
    home: lang === "hi" ? "होम" : "Home",
    status: lang === "hi" ? "ट्रेन स्थिति" : "Train Status",
    map: lang === "hi" ? "स्टेशन मानचित्र" : "Station Map",
    coach: lang === "hi" ? "कोच स्थिति" : "Coach Finder",
    crowd: lang === "hi" ? "भीड़ घनत्व" : "Crowd Density",
    qr: lang === "hi" ? "QR कोड" : "QR Code",
  };

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#030712",
      fontFamily: "'Rajdhani', 'Noto Sans Devanagari', sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
      userSelect: "none"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#0f172a; } ::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:2px; }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
        @keyframes marquee { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanline { 0%{top:-5%} 100%{top:105%} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px #0ea5e9} 50%{box-shadow:0 0 24px #0ea5e9,0 0 48px #0ea5e9} }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: #1e3a5f !important; }
        .train-row:hover { background: #0f2744 !important; cursor:pointer; }
        .voice-btn { animation: glow 2s infinite; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background: "linear-gradient(90deg,#0c1825 0%,#0f2744 50%,#0c1825 100%)", borderBottom: "1px solid #1e3a5f", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🚆</div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "15px", letterSpacing: "0.1em" }}>INDIAN RAILWAYS</div>
            <div style={{ color: "#64748b", fontSize: "10px", letterSpacing: "0.15em" }}>DIGITAL ASSISTANCE KIOSK</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", margin: "0 20px" }}>
          <div style={{ color: "#f59e0b", fontSize: "12px", whiteSpace: "nowrap", animation: "marquee 25s linear infinite" }}>
            🔴 TRAIN 22691 RAJDHANI EXP – 90 MIN LATE | ⚠️ TRAIN 12951 MUMBAI RAJDHANI – 17 MIN LATE | ✅ TRAIN 12002 BHOPAL SHATABDI – ON TIME | 🔴 TRAIN 19027 VIVEK EXP – 45 MIN LATE
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "18px" }}>{time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
            <div style={{ color: "#64748b", fontSize: "10px" }}>{time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</div>
          </div>
          <button onClick={() => setLang(l => l === "en" ? "hi" : "en")} style={{ background: "#1e3a5f", border: "1px solid #2563eb", borderRadius: "6px", padding: "6px 12px", color: "#93c5fd", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 600 }}>
            {lang === "en" ? "हिंदी" : "English"}
          </button>
        </div>
      </div>

      {/* ── NAV TABS ── */}
      <div style={{ background: "#0a1628", borderBottom: "1px solid #1e3a5f", display: "flex", overflowX: "auto" }}>
        {Object.entries(T).map(([key, label]) => (
          <button key={key} className="tab-btn" onClick={() => setTab(key)} style={{
            padding: "12px 20px", background: tab === key ? "#0f2744" : "transparent",
            border: "none", borderBottom: tab === key ? "2px solid #0ea5e9" : "2px solid transparent",
            color: tab === key ? "#e2e8f0" : "#64748b", cursor: "pointer", fontFamily: "inherit",
            fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.05em"
          }}>{label}</button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* ══ HOME TAB ══ */}
        {tab === "home" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", padding: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: 700, letterSpacing: "0.05em" }}>
                {lang === "hi" ? "नमस्ते! मैं आपकी सहायता करूँगा।" : "Namaste! How can I assist you?"}
              </div>
              <div style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                {lang === "hi" ? "अपना प्रश्न बोलें या टाइप करें" : "Speak or type your query below"}
              </div>
            </div>

            {/* Voice button */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {listening && <>
                <div style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: "2px solid #0ea5e9", animation: "pulse-ring 1.2s cubic-bezier(0.215,0.61,0.355,1) infinite" }} />
                <div style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: "2px solid #0ea5e9", animation: "pulse-ring 1.2s cubic-bezier(0.215,0.61,0.355,1) 0.4s infinite" }} />
              </>}
              <button className={listening ? "" : "voice-btn"} onClick={listening ? stopListening : startListening} style={{
                width: "100px", height: "100px", borderRadius: "50%",
                background: listening ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#0369a1,#0ea5e9)",
                border: "none", cursor: "pointer", fontSize: "40px", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s"
              }}>
                {listening ? "⏹" : "🎤"}
              </button>
            </div>
            <div style={{ color: listening ? "#0ea5e9" : "#475569", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", animation: listening ? "blink 1s infinite" : "none" }}>
              {listening ? (lang === "hi" ? "सुन रहा हूँ..." : "LISTENING...") : (lang === "hi" ? "बात करने के लिए दबाएँ" : "TAP TO SPEAK")}
            </div>

            {/* Text input */}
            <form onSubmit={handleTextSubmit} style={{ display: "flex", gap: "8px", width: "100%", maxWidth: "600px" }}>
              <input value={transcript} onChange={e => setTranscript(e.target.value)}
                placeholder={lang === "hi" ? "यहाँ टाइप करें... जैसे: ट्रेन 12951 की स्थिति" : "Type here... e.g. What is status of train 12951?"}
                style={{ flex: 1, background: "#0f2744", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "12px 16px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
              />
              <button type="submit" style={{ background: "#0369a1", border: "none", borderRadius: "8px", padding: "12px 20px", color: "white", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 700 }}>
                {lang === "hi" ? "खोजें" : "Search"}
              </button>
            </form>

            {/* Intent result */}
            {intentResult && (
              <div style={{ background: "#0f2744", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "16px 20px", maxWidth: "600px", width: "100%" }}>
                <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "6px", letterSpacing: "0.1em" }}>
                  {transcript && `"${transcript}"`}
                </div>
                <div style={{ color: "#e2e8f0", fontSize: "16px", lineHeight: "1.5" }}>💬 {intentResult.response}</div>
                {intentResult.train && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    <button onClick={() => { setSelectedTrain(intentResult.train); setTab("status") }} style={{ background: "#1e3a5f", border: "none", borderRadius: "6px", padding: "6px 12px", color: "#93c5fd", cursor: "pointer", fontFamily: "inherit", fontSize: "12px" }}>
                      📋 {lang === "hi" ? "विवरण देखें" : "View Details"}
                    </button>
                    {qrImg && <button onClick={() => setTab("qr")} style={{ background: "#1e3a5f", border: "none", borderRadius: "6px", padding: "6px 12px", color: "#93c5fd", cursor: "pointer", fontFamily: "inherit", fontSize: "12px" }}>
                      📱 {lang === "hi" ? "QR कोड" : "QR Code"}
                    </button>}
                  </div>
                )}
              </div>
            )}

            {/* Quick buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", width: "100%", maxWidth: "600px" }}>
              {[
                { icon: "🚆", label: lang === "hi" ? "ट्रेन स्थिति" : "Train Status", action: () => setTab("status") },
                { icon: "🗺", label: lang === "hi" ? "स्टेशन मानचित्र" : "Station Map", action: () => setTab("map") },
                { icon: "💺", label: lang === "hi" ? "कोच खोजें" : "Coach Finder", action: () => setTab("coach") },
                { icon: "👥", label: lang === "hi" ? "भीड़ स्तर" : "Crowd Level", action: () => setTab("crowd") },
                { icon: "📱", label: lang === "hi" ? "QR कोड" : "QR Code", action: () => setTab("qr") },
                { icon: "ℹ️", label: lang === "hi" ? "सहायता" : "Help", action: () => speak(lang === "hi" ? "मैं ट्रेन की जानकारी, प्लेटफॉर्म, और स्टेशन सुविधाओं के बारे में बता सकता हूँ।" : "I can help with train info, platforms, and station facilities.", lang) },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} style={{
                  background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: "10px", padding: "14px 8px",
                  cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                  transition: "all 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0f2744"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0a1628"}>
                  <span style={{ fontSize: "22px" }}>{btn.icon}</span>
                  <span style={{ color: "#93c5fd", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ TRAIN STATUS TAB ══ */}
        {tab === "status" && (
          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            <div style={{ color: "#64748b", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "12px" }}>
              {lang === "hi" ? "ट्रेन सूची — आज के आगमन/प्रस्थान" : "TRAIN BOARD — TODAY'S ARRIVALS & DEPARTURES"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 70px 70px 70px 70px 80px 80px", gap: "8px", padding: "8px 12px", background: "#0a1628", borderRadius: "6px", color: "#64748b", fontSize: "11px", letterSpacing: "0.08em" }}>
                <span>#</span><span>TRAIN</span><span>ARR.</span><span>DEP.</span><span>PF</span><span>DELAY</span><span>STATUS</span><span>QR</span>
              </div>
              {TRAINS.map(t => (
                <div key={t.number} className="train-row" onClick={() => setSelectedTrain(selectedTrain?.number === t.number ? null : t)} style={{
                  display: "grid", gridTemplateColumns: "90px 1fr 70px 70px 70px 70px 80px 80px", gap: "8px",
                  padding: "10px 12px", background: selectedTrain?.number === t.number ? "#0f2744" : "#0a1628",
                  borderRadius: "6px", borderLeft: selectedTrain?.number === t.number ? "3px solid #0ea5e9" : "3px solid transparent",
                  transition: "all 0.15s"
                }}>
                  <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "13px" }}>{t.number}</span>
                  <div>
                    <div style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{lang === "hi" ? t.nameHindi : t.name}</div>
                    <div style={{ color: "#64748b", fontSize: "11px" }}>{t.from} → {t.to}</div>
                  </div>
                  <span style={{ color: "#93c5fd", fontSize: "13px" }}>{t.actualArrival}</span>
                  <span style={{ color: "#93c5fd", fontSize: "13px" }}>{t.actualDeparture}</span>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "15px", textAlign: "center" }}>{t.platform}</span>
                  <span style={{ color: t.delay > 0 ? "#ef4444" : "#22c55e", fontSize: "13px", fontWeight: 600 }}>
                    {t.delay > 0 ? `+${t.delay}m` : "—"}
                  </span>
                  <span style={{
                    color: t.status === "on-time" ? "#22c55e" : "#ef4444", fontSize: "11px", fontWeight: 700,
                    background: t.status === "on-time" ? "#052e16" : "#450a0a", padding: "2px 6px", borderRadius: "4px",
                    display: "flex", alignItems: "center"
                  }}>
                    {t.status === "on-time" ? (lang === "hi" ? "समय पर" : "ON TIME") : (lang === "hi" ? "देरी" : "DELAYED")}
                  </span>
                  <button onClick={async (e) => { e.stopPropagation(); const url = `Train:${t.number}\n${t.name}\nPF:${t.platform}\nDep:${t.actualDeparture}`; const img = await generateQR(url); setQrImg(img); setQrData(url); setTab("qr"); }} style={{
                    background: "#1e3a5f", border: "none", borderRadius: "4px", padding: "4px 8px", color: "#93c5fd",
                    cursor: "pointer", fontFamily: "inherit", fontSize: "11px"
                  }}>📱 QR</button>
                </div>
              ))}
            </div>

            {/* Selected train detail */}
            {selectedTrain && (
              <div style={{ marginTop: "16px", background: "#0f2744", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ color: "#f59e0b", fontSize: "22px", fontWeight: 700 }}>{selectedTrain.number}</div>
                    <div style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: 600 }}>{lang === "hi" ? selectedTrain.nameHindi : selectedTrain.name}</div>
                    <div style={{ color: "#64748b", fontSize: "13px" }}>{selectedTrain.from} → {selectedTrain.to}</div>
                  </div>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    {[
                      { label: lang === "hi" ? "आगमन" : "Arrival", val: selectedTrain.actualArrival, sub: selectedTrain.scheduledArrival !== selectedTrain.actualArrival ? `Sch: ${selectedTrain.scheduledArrival}` : null },
                      { label: lang === "hi" ? "प्रस्थान" : "Departure", val: selectedTrain.actualDeparture },
                      { label: lang === "hi" ? "प्लेटफॉर्म" : "Platform", val: selectedTrain.platform, big: true },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ color: "#64748b", fontSize: "10px", letterSpacing: "0.1em" }}>{item.label}</div>
                        <div style={{ color: item.big ? "#f59e0b" : "#e2e8f0", fontSize: item.big ? "28px" : "18px", fontWeight: 700 }}>{item.val}</div>
                        {item.sub && <div style={{ color: "#64748b", fontSize: "10px" }}>{item.sub}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setCoachInput(selectedTrain.number); setCoachTrain(selectedTrain); setTab("coach") }} style={{ marginTop: "12px", background: "#0369a1", border: "none", borderRadius: "6px", padding: "8px 16px", color: "white", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 600 }}>
                  💺 {lang === "hi" ? "कोच स्थिति देखें" : "View Coach Layout"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ MAP TAB ══ */}
        {tab === "map" && (
          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            <div style={{ color: "#64748b", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "12px" }}>
              {lang === "hi" ? "स्टेशन मानचित्र" : "STATION LAYOUT MAP"}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
              {[{ type: "platform", color: "#0ea5e9", label: lang === "hi" ? "प्लेटफॉर्म" : "Platform" }, { type: "ticket", color: "#f59e0b", label: lang === "hi" ? "टिकट" : "Ticket" }, { type: "waiting", color: "#8b5cf6", label: lang === "hi" ? "प्रतीक्षा" : "Waiting" }, { type: "food", color: "#f97316", label: lang === "hi" ? "खाना" : "Food" }, { type: "exit", color: "#ef4444", label: lang === "hi" ? "निकास" : "Exit" }, { type: "atm", color: "#22c55e", label: "ATM" }, { type: "medical", color: "#ec4899", label: lang === "hi" ? "चिकित्सा" : "Medical" }].map(item => (
                <div key={item.type} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: item.color }} />
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>{item.label}</span>
                </div>
              ))}
            </div>
            {/* Map */}
            <div style={{ position: "relative", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: "12px", paddingBottom: "60%", overflow: "hidden" }}>
              {/* Track lines */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                {[37, 46, 55].map(y => (
                  <React.Fragment key={y}>
                    <line x1="0" y1={y} x2="100" y2={y} stroke="#1e3a5f" strokeWidth="0.3" />
                    <line x1="0" y1={y + 3.5} x2="100" y2={y + 3.5} stroke="#1e3a5f" strokeWidth="0.3" />
                  </React.Fragment>
                ))}
                {/* Roof lines */}
                <line x1="40" y1="0" x2="40" y2="100" stroke="#0f2744" strokeWidth="0.5" />
                <line x1="60" y1="0" x2="60" y2="100" stroke="#0f2744" strokeWidth="0.5" />
              </svg>
              {/* Facilities */}
              {MAP_FACILITIES.map(f => {
                const colorMap = { platform: "#0369a1", ticket: "#92400e", waiting: "#4c1d95", food: "#92400e", exit: "#991b1b", atm: "#14532d", medical: "#831843", kiosk: "#065f46" };
                const borderMap = { platform: "#0ea5e9", ticket: "#f59e0b", waiting: "#8b5cf6", food: "#f97316", exit: "#ef4444", atm: "#22c55e", medical: "#ec4899", kiosk: "#10b981" };
                const isHighlighted = f.type === "platform" && f.pid === highlightPf;
                const pfData = f.type === "platform" ? platforms.find(p => p.id === f.pid) : null;
                return (
                  <div key={f.id} onClick={() => { if (f.type === "platform" && f.pid) { setHighlightPf(f.pid === highlightPf ? null : f.pid) } }} style={{
                    position: "absolute", left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%`,
                    background: colorMap[f.type] || "#1e3a5f",
                    border: `1px solid ${borderMap[f.type] || "#334155"}`,
                    borderRadius: "4px", cursor: f.type === "platform" ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                    boxShadow: isHighlighted ? `0 0 12px ${borderMap[f.type]}` : "none",
                    transition: "all 0.2s",
                    outline: isHighlighted ? `2px solid ${borderMap[f.type]}` : "none"
                  }}>
                    <span style={{ color: "white", fontSize: "clamp(8px,1.2vw,12px)", fontWeight: 700, textAlign: "center", padding: "0 4px" }}>{f.label}</span>
                    {pfData && (
                      <div style={{ width: "80%", height: "3px", background: "#1e293b", borderRadius: "2px", marginTop: "2px" }}>
                        <div style={{ width: `${pfData.crowdLevel}%`, height: "100%", background: crowdColor(pfData.crowdLevel), borderRadius: "2px", transition: "width 0.5s" }} />
                      </div>
                    )}
                    {f.type === "kiosk" && <div style={{ color: "#6ee7b7", fontSize: "8px", fontWeight: 700 }}>📍</div>}
                  </div>
                );
              })}
            </div>
            {/* Selected platform detail */}
            {highlightPf && (() => {
              const pf = platforms.find(p => p.id === highlightPf);
              const pfTrains = TRAINS.filter(t => t.platform === highlightPf);
              return (
                <div style={{ marginTop: "12px", background: "#0f2744", border: "1px solid #0ea5e9", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ color: "#0ea5e9", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>Platform {highlightPf}</div>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>CROWD</div>
                      <div style={{ color: crowdColor(pf.crowdLevel), fontSize: "20px", fontWeight: 700 }}>{pf.crowdLevel}% – {crowdLabel(pf.crowdLevel)}</div>
                    </div>
                    <div>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>TRAINS</div>
                      {pfTrains.length > 0 ? pfTrains.map(t => <div key={t.number} style={{ color: "#e2e8f0", fontSize: "13px" }}>{t.number} – {t.name}</div>) : <div style={{ color: "#64748b", fontSize: "13px" }}>None scheduled</div>}
                    </div>
                    <div>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>AMENITIES</div>
                      {pf.amenities.map(a => <div key={a} style={{ color: "#93c5fd", fontSize: "13px" }}>{a}</div>)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ COACH FINDER TAB ══ */}
        {tab === "coach" && (
          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            <div style={{ color: "#64748b", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "12px" }}>
              {lang === "hi" ? "कोच स्थिति खोजें" : "COACH POSITION FINDER"}
            </div>
            <form onSubmit={handleCoachSearch} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input value={coachInput} onChange={e => setCoachInput(e.target.value)}
                placeholder={lang === "hi" ? "ट्रेन नंबर दर्ज करें (जैसे 12951)" : "Enter train number (e.g. 12951)"}
                style={{ flex: 1, background: "#0f2744", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "12px 16px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
              />
              <button type="submit" style={{ background: "#0369a1", border: "none", borderRadius: "8px", padding: "12px 20px", color: "white", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 700 }}>
                {lang === "hi" ? "खोजें" : "Find"}
              </button>
            </form>
            {/* Quick select */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {TRAINS.map(t => (
                <button key={t.number} onClick={() => { setCoachInput(t.number); setCoachTrain(t) }} style={{
                  background: coachTrain?.number === t.number ? "#1e3a5f" : "#0a1628",
                  border: `1px solid ${coachTrain?.number === t.number ? "#0ea5e9" : "#1e3a5f"}`,
                  borderRadius: "6px", padding: "6px 12px", color: "#93c5fd", cursor: "pointer", fontFamily: "inherit", fontSize: "12px"
                }}>{t.number}</button>
              ))}
            </div>
            {coachTrain && (
              <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "16px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "18px" }}>{coachTrain.number}</span>
                  <span style={{ color: "#e2e8f0", fontSize: "16px", marginLeft: "10px" }}>{lang === "hi" ? coachTrain.nameHindi : coachTrain.name}</span>
                  <span style={{ color: "#64748b", fontSize: "12px", marginLeft: "10px" }}>Platform {coachTrain.platform} | Engine → {lang === "hi" ? "दिल्ली" : "Delhi"} side</span>
                </div>
                {/* Coach layout */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap", overflowX: "auto", paddingBottom: "8px" }}>
                  {coachTrain.coaches.map((coach, i) => (
                    <div key={i} style={{
                      minWidth: "52px", height: "70px", borderRadius: "6px",
                      background: COACH_COLORS[coach] || "#374151",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: "4px"
                    }}>
                      <div style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>{coach}</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "8px", textAlign: "center", lineHeight: "1.2" }}>{COACH_LABELS[coach] || coach}</div>
                      {coach !== "LOCO" && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", marginTop: "2px" }}>#{i}</div>}
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                  {[["#7c3aed", "1st AC"], ["#0891b2", "2nd AC"], ["#059669", "3rd AC / Chair"], ["#d97706", "Sleeper"], ["#374151", "Loco/General"]].map(([c, l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: c }} />
                      <span style={{ color: "#94a3b8", fontSize: "11px" }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "12px", color: "#64748b", fontSize: "12px" }}>
                  📍 {lang === "hi" ? "इंजन प्लेटफॉर्म की शुरुआत में है। अपनी कोच संख्या के अनुसार खड़े हों।" : "Engine is at the start of the platform. Stand accordingly based on your coach number."}
                </div>
              </div>
            )}
            {coachInput && !coachTrain && (
              <div style={{ color: "#ef4444", padding: "16px", background: "#450a0a", borderRadius: "8px" }}>
                {lang === "hi" ? "ट्रेन नहीं मिली। कृपया सही नंबर दर्ज करें।" : "Train not found. Please enter a valid train number."}
              </div>
            )}
          </div>
        )}

        {/* ══ CROWD DENSITY TAB ══ */}
        {tab === "crowd" && (
          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            <div style={{ color: "#64748b", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "4px" }}>
              {lang === "hi" ? "लाइव भीड़ घनत्व — हर 4 सेकंड में अपडेट" : "LIVE CROWD DENSITY — Updated every 4s"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px", marginTop: "12px" }}>
              {platforms.map(pf => {
                const pfTrains = TRAINS.filter(t => t.platform === pf.id);
                const angle = (pf.crowdLevel / 100) * 180;
                return (
                  <div key={pf.id} style={{ background: "#0a1628", border: `1px solid ${crowdColor(pf.crowdLevel)}40`, borderRadius: "12px", padding: "16px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#0f2744" }}>
                      <div style={{ height: "100%", width: `${pf.crowdLevel}%`, background: crowdColor(pf.crowdLevel), transition: "width 0.5s", borderRadius: "2px" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px" }}>Platform {pf.id}</div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
                          {pfTrains.length > 0 ? pfTrains.map(t => t.number).join(", ") : "No train"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: crowdColor(pf.crowdLevel), fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{pf.crowdLevel}%</div>
                        <div style={{ color: crowdColor(pf.crowdLevel), fontSize: "11px", fontWeight: 700 }}>{crowdLabel(pf.crowdLevel)}</div>
                      </div>
                    </div>
                    {/* Gauge */}
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
                      <svg viewBox="0 0 120 70" width="120" height="70">
                        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={crowdColor(pf.crowdLevel)} strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={`${(pf.crowdLevel / 100) * 157} 157`} style={{ transition: "stroke-dasharray 0.5s" }} />
                        <text x="60" y="58" textAnchor="middle" fill="#64748b" fontSize="9">{lang === "hi" ? "भीड़" : "Crowd"}</text>
                      </svg>
                    </div>
                    <div style={{ marginTop: "6px" }}>
                      {pf.amenities.map(a => (
                        <span key={a} style={{ display: "inline-block", background: "#0f2744", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", color: "#94a3b8", marginRight: "4px", marginBottom: "4px" }}>{a}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[["#22c55e", lang === "hi" ? "कम (<40%)" : "Low (<40%)"], [" #f59e0b", lang === "hi" ? "मध्यम (40-70%)" : "Moderate (40-70%)"], ["#ef4444", lang === "hi" ? "अधिक (>70%)" : "High (>70%)"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: c.trim() }} />
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ QR TAB ══ */}
        {tab === "qr" && (
          <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ color: "#64748b", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "16px" }}>
              {lang === "hi" ? "QR कोड — अपने फोन पर जानकारी प्राप्त करें" : "QR CODE — Scan to get info on your phone"}
            </div>
            {qrImg ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "white", borderRadius: "12px", padding: "16px", display: "inline-block", boxShadow: "0 0 32px rgba(14,165,233,0.3)" }}>
                  <img src={qrImg} alt="QR Code" style={{ display: "block", width: "200px", height: "200px" }} />
                </div>
                <div style={{ marginTop: "12px", color: "#93c5fd", fontSize: "13px" }}>
                  📱 {lang === "hi" ? "अपने फोन के कैमरे से स्कैन करें" : "Scan with your phone camera"}
                </div>
                {qrData && <div style={{ marginTop: "8px", background: "#0a1628", borderRadius: "8px", padding: "10px 16px", color: "#64748b", fontSize: "12px", maxWidth: "300px", textAlign: "left", whiteSpace: "pre-line" }}>{qrData}</div>}
              </div>
            ) : (
              <div style={{ color: "#64748b", fontSize: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "8px" }}>📱</div>
                <div>{lang === "hi" ? "ट्रेन चुनें या वॉइस से पूछें, फिर QR जनरेट होगा।" : "Select a train or use voice query to generate a QR."}</div>
              </div>
            )}
            {/* Quick generate for each train */}
            <div style={{ marginTop: "24px", width: "100%", maxWidth: "500px" }}>
              <div style={{ color: "#64748b", fontSize: "11px", letterSpacing: "0.1em", marginBottom: "8px" }}>QUICK GENERATE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {TRAINS.map(t => (
                  <button key={t.number} onClick={async () => {
                    const info = `Train: ${t.number}\n${t.name}\nFrom: ${t.from}\nTo: ${t.to}\nPlatform: ${t.platform}\nDeparture: ${t.actualDeparture}\nStatus: ${t.status}${t.delay > 0 ? ` (+${t.delay} min)` : ""}`;
                    const img = await generateQR(info);
                    setQrImg(img); setQrData(info);
                  }} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: "8px",
                    padding: "10px 14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#0f2744"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0a1628"}>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "13px" }}>{t.number}</span>
                      <span style={{ color: "#e2e8f0", fontSize: "13px", marginLeft: "8px" }}>{t.name}</span>
                    </div>
                    <span style={{ color: "#0ea5e9", fontSize: "11px" }}>Generate →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ background: "#0a1628", borderTop: "1px solid #1e3a5f", padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#475569", fontSize: "11px" }}>🇮🇳 Indian Railways — Digital Enquiry Kiosk Demo</span>
        <span style={{ color: "#475569", fontSize: "11px" }}>Powered by Web Speech API · Mock Data</span>
        <button onClick={() => { setTab("home"); setIntentResult(null); setTranscript(""); setSelectedTrain(null); setCoachTrain(null); setQrImg(null); }} style={{ background: "#1e3a5f", border: "none", borderRadius: "4px", padding: "4px 10px", color: "#64748b", cursor: "pointer", fontFamily: "inherit", fontSize: "11px" }}>
          🏠 {lang === "hi" ? "होम" : "Home"}
        </button>
      </div>
    </div>
  );
}
