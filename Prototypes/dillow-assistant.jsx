import { useState, useEffect, useRef, useCallback } from "react";

const ROTATING_WORDS = ["cultura", "comida", "deportes", "familia", "viajes", "música", "trabajo", "historia"];

const MOCK_TRANSLATIONS = {
  "sobre": "about", "qué": "what", "te": "you", "gustaría": "would like",
  "hablar": "to talk", "hola": "hello", "cómo": "how", "estás": "are you",
  "bien": "good/well", "gracias": "thank you", "por": "for", "favor": "please",
  "sí": "yes", "no": "no", "yo": "I", "tú": "you", "él": "he", "ella": "she",
  "nosotros": "we", "quiero": "I want", "puedo": "I can", "tengo": "I have",
  "es": "is", "son": "are", "muy": "very", "más": "more", "menos": "less",
  "bueno": "good", "malo": "bad", "grande": "big", "pequeño": "small",
  "nuevo": "new", "viejo": "old", "todo": "all", "nada": "nothing",
  "aquí": "here", "allí": "there", "ahora": "now", "después": "after",
  "antes": "before", "siempre": "always", "nunca": "never", "también": "also",
  "pero": "but", "porque": "because", "cuando": "when", "donde": "where",
  "como": "like/as", "para": "for", "con": "with", "sin": "without",
  "entre": "between", "hasta": "until", "desde": "since", "cada": "each",
  "otro": "other", "mismo": "same", "poco": "little", "mucho": "much",
  "algo": "something", "alguien": "someone", "nadie": "nobody",
  "cual": "which", "este": "this", "ese": "that", "uno": "one", "dos": "two",
  "tres": "three", "día": "day", "noche": "night", "tiempo": "time",
  "vida": "life", "mundo": "world", "casa": "house", "agua": "water",
  "hombre": "man", "mujer": "woman", "niño": "child", "amigo": "friend",
  "sobre qué": "about what", "te gustaría": "would you like",
  "gustaría hablar": "would like to talk", "sobre qué te": "about what would you",
  "qué te gustaría": "what would you like", "te gustaría hablar": "would you like to talk",
  "sobre qué te gustaría": "about what would you like",
  "qué te gustaría hablar": "what would you like to talk about",
  "sobre qué te gustaría hablar": "what would you like to talk about",
  "quiero hablar": "I want to talk", "quiero hablar sobre": "I want to talk about",
  "tú escoje": "you choose", "un lección": "a lesson", "un lección sobre": "a lesson about",
  "encuentrame un": "find me a", "encuentrame un lección": "find me a lesson",
};

function getTranslation(phrase) {
  const lower = phrase.toLowerCase().replace(/[¿?¡!.,]/g, "").trim();
  if (MOCK_TRANSLATIONS[lower]) return MOCK_TRANSLATIONS[lower];
  const words = lower.split(" ");
  return words.map(w => MOCK_TRANSLATIONS[w] || w).join(" ");
}

// --- Waveform Canvas ---
function WaveformCanvas({ isActive, height = 120 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    function draw() {
      timeRef.current += 0.018;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);
      const midY = H / 2;
      const colors = [
        { r: 0, g: 255, b: 200, a: 0.5 },
        { r: 0, g: 180, b: 255, a: 0.55 },
        { r: 100, g: 100, b: 255, a: 0.5 },
        { r: 180, g: 50, b: 255, a: 0.45 },
        { r: 255, g: 50, b: 150, a: 0.4 },
      ];
      const amp = isActive ? 1 : 0.35;
      colors.forEach((c, i) => {
        ctx.beginPath();
        const freq = 0.008 + i * 0.003;
        const amplitude = (18 + i * 7) * amp;
        const phase = t * (1.2 + i * 0.4) + i * 0.8;
        for (let x = 0; x <= W; x += 2) {
          const y = midY + Math.sin(x * freq + phase) * amplitude
            + Math.sin(x * freq * 2.1 + phase * 0.7) * amplitude * 0.3;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${c.a})`;
        ctx.lineWidth = 2.5 - i * 0.2;
        ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},0.6)`;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height, display: "block" }}
    />
  );
}

// --- Orb Button ---
function OrbButton({ isListening, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 80, height: 80, borderRadius: "50%", border: "none",
      background: isListening
        ? "radial-gradient(circle at 40% 38%, #7df9ff 0%, #3a7bff 40%, #a855f7 75%, #ff3cac 100%)"
        : "radial-gradient(circle at 40% 38%, rgba(125,249,255,0.5) 0%, rgba(58,123,255,0.4) 40%, rgba(168,85,247,0.35) 75%, rgba(255,60,172,0.3) 100%)",
      cursor: "pointer", position: "relative",
      boxShadow: isListening
        ? "0 0 40px rgba(100,180,255,0.5), 0 0 80px rgba(168,85,247,0.3)"
        : "0 0 20px rgba(100,180,255,0.2)",
      transition: "all 0.5s ease",
      animation: isListening ? "orbPulse 2s ease-in-out infinite" : "none",
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <path d="M12 1a3.5 3.5 0 0 0-3.5 3.5v7a3.5 3.5 0 0 0 7 0v-7A3.5 3.5 0 0 0 12 1z" fill="white" opacity={isListening ? 1 : 0.8} />
        <path d="M19 10v1.5a7 7 0 0 1-14 0V10" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity={isListening ? 1 : 0.7} />
        <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity={isListening ? 1 : 0.7} />
        <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity={isListening ? 1 : 0.7} />
      </svg>
    </button>
  );
}

// --- Translatable Transcript ---
function TranslatableTranscript({ text, isSpanish, onSaveTranslation }) {
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [translationBox, setTranslationBox] = useState(null);
  const [savedPhrases, setSavedPhrases] = useState(new Set());
  const [savedMsg, setSavedMsg] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const isDragging = useRef(false);

  const words = text.split(/\s+/);

  const handleWordInteraction = useCallback((idx, isStart = false) => {
    if (!isSpanish) return;
    if (isStart) {
      isDragging.current = true;
      setSelectedIndices(new Set([idx]));
    } else if (isDragging.current) {
      setSelectedIndices(prev => {
        const arr = [...prev];
        const min = Math.min(...arr, idx);
        const max = Math.max(...arr, idx);
        const newSet = new Set();
        for (let i = min; i <= max; i++) newSet.add(i);
        return newSet;
      });
    }
  }, [isSpanish]);

  const finalizeSelection = useCallback(() => {
    isDragging.current = false;
    if (selectedIndices.size === 0) return;
    const sorted = [...selectedIndices].sort((a, b) => a - b);
    const phrase = sorted.map(i => words[i]).join(" ");
    const translation = getTranslation(phrase);
    const firstEl = wordRefs.current[sorted[0]];
    const lastEl = wordRefs.current[sorted[sorted.length - 1]];
    if (firstEl && lastEl && containerRef.current) {
      const cRect = containerRef.current.getBoundingClientRect();
      const fRect = firstEl.getBoundingClientRect();
      const lRect = lastEl.getBoundingClientRect();
      const left = fRect.left - cRect.left;
      const right = lRect.right - cRect.left;
      setTranslationBox({
        phrase, translation,
        x: (left + right) / 2,
        y: fRect.top - cRect.top - 8,
        indices: sorted,
      });
    }
  }, [selectedIndices, words]);

  useEffect(() => {
    const up = () => finalizeSelection();
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mouseup", up); window.removeEventListener("touchend", up); };
  }, [finalizeSelection]);

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target.closest("[data-translation-box]")) return;
    if (!e.target.closest("[data-word]")) {
      setSelectedIndices(new Set());
      setTranslationBox(null);
    }
  };

  const handleSaveTranslation = () => {
    if (!translationBox) return;
    const key = translationBox.phrase + "|" + translationBox.translation;
    if (savedPhrases.has(key)) {
      setSavedPhrases(prev => { const n = new Set(prev); n.delete(key); return n; });
      setSavedMsg("removed from notes");
      onSaveTranslation && onSaveTranslation({ phrase: translationBox.phrase, translation: translationBox.translation, action: "remove" });
    } else {
      setSavedPhrases(prev => new Set(prev).add(key));
      setSavedMsg("translation saved to notes");
      onSaveTranslation && onSaveTranslation({ phrase: translationBox.phrase, translation: translationBox.translation, action: "save" });
    }
    setTimeout(() => setSavedMsg(null), 1500);
  };

  const handleSaveExplanation = () => {
    const key = "explanation|" + text;
    if (savedPhrases.has(key)) {
      setSavedPhrases(prev => { const n = new Set(prev); n.delete(key); return n; });
      setSavedMsg("removed from notes");
      onSaveTranslation && onSaveTranslation({ explanation: text, action: "remove" });
    } else {
      setSavedPhrases(prev => new Set(prev).add(key));
      setSavedMsg("explanation saved to notes");
      onSaveTranslation && onSaveTranslation({ explanation: text, action: "save" });
    }
    setTimeout(() => setSavedMsg(null), 1500);
  };

  if (!isSpanish) {
    return (
      <div style={{ position: "relative" }}>
        <div
          onClick={handleSaveExplanation}
          style={{
            cursor: "pointer", padding: "14px 18px", borderRadius: 16,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
        >
          <span style={{ color: "rgba(125,249,255,0.7)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block" }}>Explanation:</span>
          <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 15.5, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{text}</span>
        </div>
        {savedMsg && (
          <div style={{
            position: "absolute", bottom: -32, left: "50%", transform: "translateX(-50%)",
            background: "rgba(125,249,255,0.15)", border: "1px solid rgba(125,249,255,0.3)",
            borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#7df9ff",
            whiteSpace: "nowrap", animation: "fadeInUp 0.25s ease",
          }}>{savedMsg}</div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} onClick={handleContainerClick} style={{ position: "relative", userSelect: "none", padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px", lineHeight: 2.2 }}>
        {words.map((word, i) => (
          <span
            key={i}
            ref={el => wordRefs.current[i] = el}
            data-word
            onMouseDown={(e) => { e.preventDefault(); handleWordInteraction(i, true); }}
            onMouseEnter={() => handleWordInteraction(i)}
            onTouchStart={(e) => { e.preventDefault(); handleWordInteraction(i, true); }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const el = document.elementFromPoint(touch.clientX, touch.clientY);
              if (el?.dataset?.word !== undefined) {
                const idx = wordRefs.current.indexOf(el);
                if (idx >= 0) handleWordInteraction(idx);
              }
            }}
            style={{
              color: selectedIndices.has(i) ? "#7df9ff" : "rgba(255,255,255,0.88)",
              fontSize: 15.5, fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer", padding: "2px 4px", borderRadius: 6,
              background: selectedIndices.has(i) ? "rgba(125,249,255,0.12)" : "transparent",
              transition: "all 0.15s ease",
            }}
          >{word}</span>
        ))}
      </div>

      {translationBox && (
        <div data-translation-box onClick={handleSaveTranslation} style={{
          position: "absolute", left: translationBox.x, top: translationBox.y,
          transform: "translate(-50%, -100%)", zIndex: 10,
          background: "rgba(20,20,40,0.95)", border: "1px solid rgba(125,249,255,0.35)",
          borderRadius: 10, padding: "8px 14px", cursor: "pointer",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(125,249,255,0.1)",
          animation: "fadeInUp 0.2s ease", whiteSpace: "nowrap",
        }}>
          <div style={{ fontSize: 11, color: "rgba(125,249,255,0.5)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>{translationBox.phrase}</div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{translationBox.translation}</div>
        </div>
      )}

      {savedMsg && (
        <div style={{
          position: "absolute", bottom: -32, left: "50%", transform: "translateX(-50%)",
          background: "rgba(125,249,255,0.15)", border: "1px solid rgba(125,249,255,0.3)",
          borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#7df9ff",
          whiteSpace: "nowrap", animation: "fadeInUp 0.25s ease",
        }}>{savedMsg}</div>
      )}
    </div>
  );
}

// --- Rotating Word ---
function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % ROTATING_WORDS.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      display: "inline-block", minWidth: 80, color: "#7df9ff",
      opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(6px)",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
    }}>{ROTATING_WORDS[index]}</span>
  );
}

// --- Notes Panel ---
function NotesPanel({ isOpen, onClose, notes, onDeleteNote, onAddNote }) {
  const [newNote, setNewNote] = useState("");

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0,
      width: isOpen ? 320 : 0, overflow: "hidden",
      background: "linear-gradient(180deg, #0a0a1a 0%, #0d0f24 100%)",
      borderLeft: isOpen ? "1px solid rgba(125,249,255,0.12)" : "none",
      transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
      zIndex: 100, display: "flex", flexDirection: "column",
      boxShadow: isOpen ? "-20px 0 60px rgba(0,0,0,0.5)" : "none",
    }}>
      <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>My Notes</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "8px 0 0", lineHeight: 1.5 }}>
          Save translations or explanations from Dillow by tapping them. You can also write your own notes below.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📝</div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.6 }}>
              No notes yet. Save translations or explanations from Dillow by tapping them during conversation.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notes.map((note, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)",
                animation: "fadeInUp 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    {note.type === "translation" && (
                      <>
                        <div style={{ color: "#7df9ff", fontSize: 13, fontWeight: 600 }}>{note.phrase}</div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>{note.translation}</div>
                      </>
                    )}
                    {note.type === "explanation" && (
                      <>
                        <div style={{ color: "rgba(168,85,247,0.8)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Explanation</div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{note.text.slice(0, 80)}...</div>
                      </>
                    )}
                    {note.type === "custom" && (
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{note.text}</div>
                    )}
                  </div>
                  <button onClick={() => onDeleteNote(i)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, padding: "0 0 0 8px", flexShrink: 0 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newNote.trim()) { onAddNote(newNote.trim()); setNewNote(""); } }}
            placeholder="Write a note..."
            style={{
              flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            onClick={() => { if (newNote.trim()) { onAddNote(newNote.trim()); setNewNote(""); } }}
            style={{
              background: "rgba(125,249,255,0.15)", border: "1px solid rgba(125,249,255,0.25)",
              borderRadius: 10, color: "#7df9ff", padding: "0 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            }}
          >Add</button>
        </div>
      </div>
    </div>
  );
}

// --- Conversation State Simulation ---
const CONVERSATION_FLOW = [
  { speaker: "dillow", text: "¿Sobre qué te gustaría hablar?", lang: "es" },
];

// --- Main App ---
export default function DillowAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [conversation, setConversation] = useState(CONVERSATION_FLOW);
  const [demoStep, setDemoStep] = useState(0);
  const chatEndRef = useRef(null);

  const demoConversation = [
    { speaker: "user", text: "Quiero hablar sobre cultura", lang: "es" },
    { speaker: "dillow", text: "¡Buena elección! La cultura es un tema muy interesante. ¿Hay algo en particular sobre la cultura que te gustaría explorar? Por ejemplo, podemos hablar sobre la música, el arte, las tradiciones, o la comida de diferentes países.", lang: "es" },
    { speaker: "user", text: "Tell me about Mexican traditions", lang: "en" },
    { speaker: "dillow", text: "Mexico has incredibly rich traditions! One of the most famous is Día de los Muertos, celebrated on November 1st and 2nd, where families honor deceased loved ones with colorful altars, marigold flowers, and special foods. Another beloved tradition is Las Posadas, a nine-day celebration before Christmas. Would you like me to explain more about any of these?", lang: "en" },
    { speaker: "user", text: "Explica más sobre el Día de los Muertos", lang: "es" },
    { speaker: "dillow", text: "El Día de los Muertos es una celebración muy especial en México. Las familias construyen altares con fotos, velas, flores de cempasúchil, y la comida favorita de sus seres queridos. No es un día triste, sino una celebración de la vida y los recuerdos. Las calles se llenan de calaveras coloridas y música tradicional. ¿Te gustaría aprender algunas palabras clave sobre esta tradición?", lang: "es" },
  ];

  const advanceDemo = () => {
    if (demoStep < demoConversation.length) {
      const next = demoConversation[demoStep];
      if (next.speaker === "user") {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          setConversation(prev => [...prev, next]);
          setDemoStep(prev => prev + 1);
          // Auto-advance to dillow response
          setTimeout(() => {
            if (demoStep + 1 < demoConversation.length) {
              setConversation(prev => [...prev, demoConversation[demoStep + 1]]);
              setDemoStep(prev => prev + 1);
            }
          }, 1200);
        }, 1800);
      } else {
        setConversation(prev => [...prev, next]);
        setDemoStep(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSaveTranslation = (data) => {
    if (data.action === "save") {
      if (data.explanation) {
        setNotes(prev => [...prev, { type: "explanation", text: data.explanation }]);
      } else {
        setNotes(prev => [...prev, { type: "translation", phrase: data.phrase, translation: data.translation }]);
      }
    } else {
      setNotes(prev => {
        if (data.explanation) return prev.filter(n => !(n.type === "explanation" && n.text === data.explanation));
        return prev.filter(n => !(n.type === "translation" && n.phrase === data.phrase));
      });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(125,249,255,0.15); border-radius: 4px; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 430, margin: "0 auto", height: "100vh",
        background: "linear-gradient(170deg, #06061a 0%, #0a0d24 30%, #0e0a20 60%, #080618 100%)",
        display: "flex", flexDirection: "column", position: "relative",
        fontFamily: "'Outfit', sans-serif", overflow: "hidden",
      }}>
        {/* Ambient bg glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translate(-50%,-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(58,123,255,0.06) 0%, rgba(168,85,247,0.03) 50%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px 12px", flexShrink: 0, position: "relative", zIndex: 10,
        }}>
          <button style={{
            width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>Dillow</div>
            <div style={{ fontSize: 11, color: isListening ? "#7df9ff" : "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: 0.5, transition: "color 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              {isListening && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7df9ff", animation: "gentlePulse 1.2s ease-in-out infinite" }} />}
              {isListening ? "Listening..." : "AI Language Partner"}
            </div>
          </div>
          <button onClick={() => setNotesOpen(true)} style={{
            width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {notes.length > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4, width: 18, height: 18,
                borderRadius: "50%", background: "#7df9ff", color: "#0a0a1a",
                fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              }}>{notes.length}</span>
            )}
          </button>
        </div>

        {/* Conversation Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Greeting */}
          <div style={{ textAlign: "center", padding: "12px 0 8px", animation: "slideUp 0.6s ease" }}>
            <div style={{ color: "rgba(125,249,255,0.5)", fontSize: 13, fontWeight: 400, marginBottom: 6 }}>AI Language Partner</div>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1.3, letterSpacing: -0.5 }}>
              Hola! I'm Dillow <span style={{ fontSize: 28 }}>👋</span>
            </h1>
          </div>

          {/* Messages */}
          {conversation.map((msg, i) => (
            <div key={i} style={{
              animation: "slideUp 0.4s ease",
              display: "flex", flexDirection: "column",
              alignItems: msg.speaker === "user" ? "flex-end" : "flex-start",
            }}>
              {msg.speaker === "dillow" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 8,
                    background: "linear-gradient(135deg, #7df9ff 0%, #a855f7 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#0a0a1a",
                  }}>D</div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Dillow</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>
                    {msg.lang === "es" ? "ES" : "EN"}
                  </span>
                </div>
              )}
              {msg.speaker === "user" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>
                    {msg.lang === "es" ? "ES" : "EN"}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>You</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M12 14c2.206 0 4-1.794 4-4V6c0-2.206-1.794-4-4-4S8 3.794 8 6v4c0 2.206 1.794 4 4 4z"/><path d="M18 10h-1v1c0 2.757-2.243 5-5 5s-5-2.243-5-5v-1H6v1c0 3.52 2.613 6.432 6 6.92V21H8v2h8v-2h-4v-3.08c3.387-.488 6-3.4 6-6.92v-1z"/></svg>
                </div>
              )}
              {showTranscript && (
                msg.speaker === "dillow" ? (
                  <TranslatableTranscript text={msg.text} isSpanish={msg.lang === "es"} onSaveTranslation={handleSaveTranslation} />
                ) : (
                  <div style={{
                    background: "rgba(125,249,255,0.08)", border: "1px solid rgba(125,249,255,0.15)",
                    borderRadius: 16, borderBottomRightRadius: 4, padding: "12px 16px",
                    color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 1.6,
                    fontFamily: "'DM Sans', sans-serif", maxWidth: "85%",
                  }}>{msg.text}</div>
                )
              )}
            </div>
          ))}

          {isListening && (
            <div style={{ animation: "fadeInUp 0.3s ease", display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                background: "rgba(125,249,255,0.06)", border: "1px dashed rgba(125,249,255,0.2)",
                borderRadius: 16, padding: "10px 18px",
                color: "rgba(125,249,255,0.6)", fontSize: 14, fontStyle: "italic",
              }}>
                <span style={{ animation: "gentlePulse 1s ease infinite" }}>Listening...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Response Suggestions */}
        <div style={{
          padding: "0 20px 8px", flexShrink: 0,
          display: conversation.length <= 1 ? "flex" : "none",
          flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 }}>Try saying:</div>
          {[
            <span key="1">"Tú escoje"</span>,
            <span key="2">"Quiero hablar sobre <RotatingWord />"</span>,
            <span key="3">"Encuéntrame un lección sobre <RotatingWord />"</span>,
          ].map((content, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "10px 16px",
              color: "rgba(255,255,255,0.55)", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(125,249,255,0.4)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3.5 3.5 0 0 0-3.5 3.5v7a3.5 3.5 0 0 0 7 0v-7A3.5 3.5 0 0 0 12 1z" />
              </svg>
              {content}
            </div>
          ))}
        </div>

        {/* Waveform */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 40,
            background: "linear-gradient(to bottom, #06061a, transparent)",
            pointerEvents: "none", zIndex: 1,
          }} />
          <WaveformCanvas isActive={isListening} height={100} />
        </div>

        {/* Bottom Controls */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "4px 20px 28px", gap: 20, flexShrink: 0,
          background: "linear-gradient(to top, rgba(6,6,26,0.95), transparent)",
        }}>
          {/* Toggle Transcript */}
          <button onClick={() => setShowTranscript(!showTranscript)} style={{
            width: 44, height: 44, borderRadius: "50%",
            background: showTranscript ? "rgba(125,249,255,0.12)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showTranscript ? "rgba(125,249,255,0.25)" : "rgba(255,255,255,0.08)"}`,
            color: showTranscript ? "#7df9ff" : "rgba(255,255,255,0.4)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </button>

          {/* Mic Orb */}
          <OrbButton isListening={isListening} onClick={advanceDemo} />

          {/* Keyboard */}
          <button style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="8" x2="6" y2="8.01" />
              <line x1="10" y1="8" x2="10" y2="8.01" />
              <line x1="14" y1="8" x2="14" y2="8.01" />
              <line x1="18" y1="8" x2="18" y2="8.01" />
              <line x1="8" y1="12" x2="8" y2="12.01" />
              <line x1="12" y1="12" x2="12" y2="12.01" />
              <line x1="16" y1="12" x2="16" y2="12.01" />
              <line x1="7" y1="16" x2="17" y2="16" />
            </svg>
          </button>
        </div>

        {/* Notes overlay */}
        {notesOpen && (
          <div onClick={() => setNotesOpen(false)} style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 99,
          }} />
        )}
        <NotesPanel
          isOpen={notesOpen}
          onClose={() => setNotesOpen(false)}
          notes={notes}
          onDeleteNote={(i) => setNotes(prev => prev.filter((_, idx) => idx !== i))}
          onAddNote={(text) => setNotes(prev => [...prev, { type: "custom", text }])}
        />
      </div>
    </>
  );
}
