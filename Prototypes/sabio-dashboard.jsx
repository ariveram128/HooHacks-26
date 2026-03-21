import { useState, useEffect, useRef } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap";

// Noise texture SVG for background depth
const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(#n)' opacity='0.04'/></svg>`;
const noiseUrl = `url("data:image/svg+xml,${encodeURIComponent(noiseSvg)}")`;

// Geometric tile pattern (Talavera-inspired)
const TilePattern = ({ size = 40, color = "var(--marigold)", opacity = 0.08 }) => (
  <svg width={size * 2} height={size * 2} viewBox="0 0 80 80" style={{ position: "absolute", opacity }}>
    <pattern id="tile" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="8" fill="none" stroke={color} strokeWidth="1.5" />
      <rect x="12" y="12" width="16" height="16" fill="none" stroke={color} strokeWidth="0.75" transform="rotate(45 20 20)" />
      <circle cx="0" cy="0" r="4" fill={color} opacity="0.3" />
      <circle cx="40" cy="0" r="4" fill={color} opacity="0.3" />
      <circle cx="0" cy="40" r="4" fill={color} opacity="0.3" />
      <circle cx="40" cy="40" r="4" fill={color} opacity="0.3" />
    </pattern>
    <rect width="80" height="80" fill="url(#tile)" />
  </svg>
);

// Icons as simple SVG components
const Icons = {
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Book: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Gamepad: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="15" cy="13" r="1" /><circle cx="18" cy="11" r="1" />
      <rect x="2" y="6" width="20" height="12" rx="3" />
    </svg>
  ),
  Mic: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Notes: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Video: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Forum: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  Fire: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-3.9 0-7-3.1-7-7 0-3.2 2.9-6.3 5-8.3V2l2.5 2.5c3.2 3.2 4.5 5.5 4.5 8.5 0 3.9-3.1 7-5 7zm0-18v4.5c-1.8 1.8-4 4.3-4 6.5 0 2.8 1.8 5 4 5s4-2.2 4-5c0-2.3-.9-4-3.3-6.3L12 5z" />
    </svg>
  ),
  Flame: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--marigold)">
      <path d="M12 23c-3.9 0-7-3.1-7-7 0-3.2 2.9-6.3 5-8.3V2l2.5 2.5c3.2 3.2 4.5 5.5 4.5 8.5 0 3.9-3.1 7-5 7z" />
    </svg>
  ),
  Home: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Star: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Parrot: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2C10.5 2 8 4.5 8 8c0 1.5.5 3 1.5 4L6 16l2 2 3-3c.6.2 1.3.3 2 .3h1c3.5 0 6-2.5 6-6V8c0-3.5-2.5-6-6-6z" fill="var(--teal)" opacity="0.2" />
      <circle cx="13" cy="7" r="1.5" fill="var(--charcoal)" />
      <path d="M16 9c0 0 1 1 1 2" />
      <path d="M8 8c-2 0-4 1-4 3s2 3 4 3" />
      <path d="M10 18l-1 4" /><path d="M14 18l1 4" />
    </svg>
  ),
};

// Dillow avatar component
const DillowAvatar = ({ size = 56 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--teal), var(--teal-dark))",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 16px rgba(26,92,94,0.3)",
    border: "3px solid var(--cream)",
    flexShrink: 0,
  }}>
    <span style={{ fontSize: size * 0.5, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}>🦜</span>
  </div>
);

// Animated entry wrapper
const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
      ...style,
    }}>{children}</div>
  );
};

// Phrase of the day data
const phrases = [
  { es: "¿De dónde eres?", en: "Where are you from?", level: "Essentials" },
  { es: "Estoy de acuerdo", en: "I agree", level: "Conversational" },
  { es: "¿Qué tal tu día?", en: "How's your day?", level: "Essentials" },
  { es: "Me gustaría saber más", en: "I'd like to know more", level: "Intermediate" },
];

export default function SabioDashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [streakPulse, setStreakPulse] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showPhraseTranslation, setShowPhraseTranslation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStreakPulse(true);
      setTimeout(() => setStreakPulse(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = phrases[phraseIndex];

  return (
    <>
      <style>{`
        @import url('${FONTS_URL}');

        :root {
          --cream: #F5EDE0;
          --cream-light: #FAF6F0;
          --cream-dark: #EDE3D3;
          --terracotta: #C2553A;
          --terracotta-light: #D4725A;
          --terracotta-dark: #A33E26;
          --teal: #1A6B5E;
          --teal-light: #2A8B7A;
          --teal-dark: #134A42;
          --marigold: #E8A838;
          --marigold-dark: #CC8E1E;
          --marigold-light: #F0C060;
          --charcoal: #2A2320;
          --charcoal-light: #3D3530;
          --warm-gray: #8C7E73;
          --warm-gray-light: #B5A99E;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .sabio-app {
          font-family: 'Outfit', sans-serif;
          background: var(--cream);
          min-height: 100vh;
          max-width: 430px;
          margin: 0 auto;
          position: relative;
          overflow-x: hidden;
          color: var(--charcoal);
          background-image: ${noiseUrl};
        }

        .sabio-scroll {
          padding: 0 20px 100px 20px;
          overflow-y: auto;
        }

        /* Header */
        .sabio-header {
          padding: 20px 0 0 0;
          position: relative;
        }

        .sabio-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .sabio-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          color: var(--charcoal);
          letter-spacing: -0.5px;
          position: relative;
        }

        .sabio-logo-dot {
          color: var(--terracotta);
          font-size: 38px;
          line-height: 0;
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--charcoal);
          color: var(--marigold);
          padding: 8px 14px;
          border-radius: 24px;
          font-weight: 600;
          font-size: 14px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .streak-badge.pulse {
          transform: scale(1.08);
        }

        .greeting-section {
          margin-bottom: 28px;
        }

        .greeting-hello {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: 18px;
          color: var(--warm-gray);
          margin-bottom: 2px;
        }

        .greeting-name {
          font-family: 'Instrument Serif', serif;
          font-size: 34px;
          color: var(--charcoal);
          line-height: 1.1;
        }

        .greeting-sub {
          font-size: 14px;
          color: var(--warm-gray);
          margin-top: 6px;
          font-weight: 400;
        }

        /* Dillow Chat Card */
        .dillow-card {
          background: linear-gradient(145deg, var(--teal-dark), var(--teal));
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
          box-shadow: 0 8px 32px rgba(26,92,94,0.25);
        }

        .dillow-card:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 12px 40px rgba(26,92,94,0.35);
        }

        .dillow-card::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(232,168,56,0.15) 0%, transparent 70%);
          border-radius: 50%;
        }

        .dillow-card::after {
          content: '';
          position: absolute;
          bottom: -20px; left: -20px;
          width: 100px; height: 100px;
          background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
          border-radius: 50%;
        }

        .dillow-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .dillow-info h3 {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: var(--cream);
          font-weight: 400;
        }

        .dillow-info p {
          font-size: 13px;
          color: rgba(245,237,224,0.65);
          font-weight: 300;
        }

        .dillow-bubble {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          border-radius: 16px 16px 16px 4px;
          padding: 14px 18px;
          color: var(--cream);
          font-size: 15px;
          font-weight: 300;
          line-height: 1.5;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .dillow-bubble em {
          color: var(--marigold-light);
          font-style: normal;
          font-weight: 500;
        }

        .dillow-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          color: var(--marigold-light);
          font-weight: 500;
          font-size: 14px;
          position: relative;
          z-index: 1;
        }

        .dillow-cta-arrow {
          transition: transform 0.3s ease;
        }

        .dillow-card:hover .dillow-cta-arrow {
          transform: translateX(4px);
        }

        /* Section Headers */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: var(--charcoal);
        }

        .section-see-all {
          font-size: 13px;
          color: var(--terracotta);
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 2px;
          transition: gap 0.2s ease;
        }

        .section-see-all:hover {
          gap: 6px;
        }

        /* Phrase Card */
        .phrase-card {
          background: var(--cream-light);
          border: 2px solid var(--cream-dark);
          border-radius: 20px;
          padding: 22px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .phrase-card:hover {
          border-color: var(--marigold);
        }

        .phrase-label {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--terracotta);
          margin-bottom: 10px;
          background: rgba(194,85,58,0.08);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .phrase-spanish {
          font-family: 'Instrument Serif', serif;
          font-size: 26px;
          color: var(--charcoal);
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .phrase-english {
          font-size: 15px;
          color: var(--warm-gray);
          font-weight: 300;
          overflow: hidden;
          transition: max-height 0.4s ease, opacity 0.3s ease;
        }

        .phrase-tap {
          font-size: 12px;
          color: var(--warm-gray-light);
          margin-top: 10px;
          font-style: italic;
        }

        .phrase-nav {
          display: flex;
          gap: 6px;
          margin-top: 14px;
        }

        .phrase-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--cream-dark);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .phrase-dot.active {
          background: var(--terracotta);
          width: 24px;
          border-radius: 4px;
        }

        /* Quick Actions */
        .quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 28px;
        }

        .quick-card {
          background: var(--cream-light);
          border: 1.5px solid var(--cream-dark);
          border-radius: 18px;
          padding: 20px 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          overflow: hidden;
        }

        .quick-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(42,35,32,0.08);
          border-color: transparent;
        }

        .quick-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 18px 18px 0 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .quick-card:hover::after {
          opacity: 1;
        }

        .quick-card-lessons::after { background: var(--teal); }
        .quick-card-practice::after { background: var(--terracotta); }
        .quick-card-notes::after { background: var(--marigold); }
        .quick-card-social::after { background: var(--charcoal); }

        .quick-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          color: white;
        }

        .quick-card-title {
          font-weight: 600;
          font-size: 15px;
          color: var(--charcoal);
          margin-bottom: 3px;
        }

        .quick-card-desc {
          font-size: 12px;
          color: var(--warm-gray);
          font-weight: 300;
          line-height: 1.4;
        }

        /* Feature Rows */
        .feature-row {
          display: flex;
          gap: 14px;
          margin-bottom: 28px;
        }

        .feature-card {
          flex: 1;
          background: var(--cream-light);
          border: 1.5px solid var(--cream-dark);
          border-radius: 18px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(42,35,32,0.08);
        }

        .feature-card-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .feature-card-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--charcoal);
          margin-bottom: 2px;
        }

        .feature-card-desc {
          font-size: 11px;
          color: var(--warm-gray);
          font-weight: 300;
        }

        /* Progress Bar */
        .progress-section {
          margin-bottom: 28px;
        }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background: var(--cream-dark);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--teal), var(--teal-light));
          transition: width 1.5s cubic-bezier(0.22,1,0.36,1);
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .progress-stat {
          font-size: 12px;
          color: var(--warm-gray);
        }

        .progress-stat strong {
          color: var(--charcoal);
          font-weight: 600;
        }

        /* Bottom Nav */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          background: rgba(245,237,224,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--cream-dark);
          display: flex;
          justify-content: space-around;
          padding: 10px 0 22px;
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          cursor: pointer;
          color: var(--warm-gray-light);
          transition: color 0.2s ease;
          position: relative;
          padding: 4px 12px;
        }

        .nav-item.active {
          color: var(--terracotta);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          top: -10px;
          width: 20px;
          height: 3px;
          background: var(--terracotta);
          border-radius: 2px;
        }

        .nav-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* Decorative corner pattern */
        .deco-corner {
          position: absolute;
          pointer-events: none;
          opacity: 0.06;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .float-anim {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="sabio-app">
        <div className="sabio-scroll">
          {/* Header */}
          <FadeIn delay={100}>
            <div className="sabio-header">
              <div className="sabio-topbar">
                <div className="sabio-logo">
                  Sabio<span className="sabio-logo-dot">.</span>
                </div>
                <div className={`streak-badge ${streakPulse ? "pulse" : ""}`}>
                  <Icons.Flame /> 12 days
                </div>
              </div>
              <div className="greeting-section">
                <div className="greeting-hello">Buenas tardes,</div>
                <div className="greeting-name">Welcome back</div>
                <div className="greeting-sub">You're 34% through this week's goals</div>
              </div>
            </div>
          </FadeIn>

          {/* Weekly Progress */}
          <FadeIn delay={200}>
            <div className="progress-section">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: "34%" }} />
              </div>
              <div className="progress-stats">
                <div className="progress-stat"><strong>3</strong> lessons</div>
                <div className="progress-stat"><strong>47</strong> words learned</div>
                <div className="progress-stat"><strong>12</strong> min today</div>
              </div>
            </div>
          </FadeIn>

          {/* Dillow AI Chat Card */}
          <FadeIn delay={350}>
            <div className="dillow-card">
              <div className="dillow-top">
                <DillowAvatar />
                <div className="dillow-info">
                  <h3>Chat with Dillow</h3>
                  <p>Your AI Spanish companion</p>
                </div>
              </div>
              <div className="dillow-bubble">
                ¡Hola! <em>¿Cómo estuvo tu día?</em> Tell me about it — in Spanish or English, your choice. I'll help along the way.
              </div>
              <div className="dillow-cta">
                Start a conversation
                <span className="dillow-cta-arrow"><Icons.ChevronRight /></span>
              </div>
            </div>
          </FadeIn>

          {/* Phrase of the Day */}
          <FadeIn delay={450}>
            <div className="section-header">
              <div className="section-title">Frase del día</div>
            </div>
            <div
              className="phrase-card"
              onClick={() => setShowPhraseTranslation(!showPhraseTranslation)}
            >
              <div className="phrase-label">{currentPhrase.level}</div>
              <div className="phrase-spanish">{currentPhrase.es}</div>
              <div
                className="phrase-english"
                style={{
                  maxHeight: showPhraseTranslation ? "40px" : "0px",
                  opacity: showPhraseTranslation ? 1 : 0,
                }}
              >
                {currentPhrase.en}
              </div>
              {!showPhraseTranslation && (
                <div className="phrase-tap">Tap to reveal translation</div>
              )}
              <div className="phrase-nav">
                {phrases.map((_, i) => (
                  <div
                    key={i}
                    className={`phrase-dot ${i === phraseIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhraseIndex(i);
                      setShowPhraseTranslation(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Quick Actions Grid */}
          <FadeIn delay={550}>
            <div className="section-header">
              <div className="section-title">Your toolkit</div>
            </div>
            <div className="quick-grid">
              <div className="quick-card quick-card-lessons">
                <div className="quick-icon" style={{ background: "var(--teal)" }}>
                  <Icons.Book />
                </div>
                <div className="quick-card-title">Lessons</div>
                <div className="quick-card-desc">Conjugations, accents & rules</div>
              </div>
              <div className="quick-card quick-card-practice">
                <div className="quick-icon" style={{ background: "var(--terracotta)" }}>
                  <Icons.Mic />
                </div>
                <div className="quick-card-title">Practice</div>
                <div className="quick-card-desc">Key phrases & pronunciation</div>
              </div>
              <div className="quick-card quick-card-notes">
                <div className="quick-icon" style={{ background: "var(--marigold)" }}>
                  <Icons.Notes />
                </div>
                <div className="quick-card-title">My Notes</div>
                <div className="quick-card-desc">Saved explanations & tips</div>
              </div>
              <div className="quick-card quick-card-social">
                <div className="quick-icon" style={{ background: "var(--charcoal)" }}>
                  <Icons.Users />
                </div>
                <div className="quick-card-title">Social</div>
                <div className="quick-card-desc">Ask a native speaker</div>
              </div>
            </div>
          </FadeIn>

          {/* Forum & Video */}
          <FadeIn delay={650}>
            <div className="feature-row">
              <div className="feature-card">
                <div className="feature-card-icon" style={{ background: "rgba(26,107,94,0.1)", color: "var(--teal)" }}>
                  <Icons.Forum />
                </div>
                <div className="feature-card-title">Foro</div>
                <div className="feature-card-desc">Community discussions</div>
              </div>
              <div className="feature-card">
                <div className="feature-card-icon" style={{ background: "rgba(194,85,58,0.1)", color: "var(--terracotta)" }}>
                  <Icons.Video />
                </div>
                <div className="feature-card-title">Video</div>
                <div className="feature-card-desc">Watch & learn clips</div>
              </div>
            </div>
          </FadeIn>

        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          {[
            { id: "home", icon: <Icons.Home />, label: "Home" },
            { id: "learn", icon: <Icons.Book />, label: "Learn" },
            { id: "chat", icon: <Icons.Chat />, label: "Dillow" },
            { id: "practice", icon: <Icons.Mic />, label: "Practice" },
            { id: "social", icon: <Icons.Users />, label: "Social" },
          ].map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
