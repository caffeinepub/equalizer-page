import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  name: string;
  url: string;
  duration?: number;
}

interface EngineState {
  on: boolean;
  gain: number;
}

interface BlockchainEntry {
  hash: string;
  timestamp: number;
  action: string;
  value: string;
}

// ─── EQ Band Frequencies ────────────────────────────────────────────────────
const EQ_BANDS = [
  { freq: 60, label: "60Hz" },
  { freq: 170, label: "170Hz" },
  { freq: 310, label: "310Hz" },
  { freq: 600, label: "600Hz" },
  { freq: 1000, label: "1kHz" },
  { freq: 3000, label: "3kHz" },
  { freq: 6000, label: "6kHz" },
  { freq: 12000, label: "12kHz" },
  { freq: 14000, label: "14kHz" },
  { freq: 16000, label: "16kHz" },
];

// ─── EQ Presets ─────────────────────────────────────────────────────────────
const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "Bass Boost": [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
  Rock: [5, 4, 2, 0, -1, 1, 3, 4, 4, 3],
  Pop: [-1, 2, 4, 4, 2, 0, -1, -1, -1, -1],
  Jazz: [3, 2, 0, 2, -2, -2, 0, 1, 2, 3],
  Classical: [4, 3, 2, 0, -2, -2, 0, 2, 3, 4],
  Electronic: [6, 5, 1, 0, -2, 2, 1, 3, 4, 5],
  Vocal: [-2, -1, 0, 3, 5, 5, 3, 1, 0, -1],
};

// ─── Utility: generate fake blockchain hash ─────────────────────────────────
function makeHash(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

// ─── BookIntro ───────────────────────────────────────────────────────────────
function BookIntro({ onClose }: { onClose: () => void }) {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpening(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#04080f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1200px",
      }}
    >
      {/* Left page */}
      <div
        className={opening ? "book-page-left" : ""}
        style={{
          width: "40vw",
          maxWidth: 420,
          height: "60vh",
          maxHeight: 520,
          background: "linear-gradient(160deg, #0d1f3c 0%, #071122 100%)",
          border: "2px solid rgba(255,215,0,0.4)",
          borderRight: "1px solid rgba(255,215,0,0.2)",
          borderRadius: "4px 0 0 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformOrigin: "right center",
          boxShadow:
            "inset -8px 0 24px rgba(0,0,0,0.5), 0 0 40px rgba(255,215,0,0.1)",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", padding: 32 }}>
          <div
            style={{
              color: "rgba(255,215,0,0.3)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              marginBottom: 12,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            PRODUCT SERIES II
          </div>
          <div
            style={{
              width: 60,
              height: 1,
              background: "rgba(255,215,0,0.3)",
              margin: "0 auto 20px",
            }}
          />
          <div
            style={{
              color: "rgba(255,215,0,0.15)",
              fontSize: "3rem",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            G
          </div>
        </div>
        {/* spine shadow */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: "rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Center content (revealed) */}
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          zIndex: -1,
          opacity: opening ? 1 : 0,
          transition: "opacity 0.8s ease 0.8s",
        }}
      >
        <div
          style={{
            color: "rgba(255,215,0,0.5)",
            fontSize: "0.55rem",
            letterSpacing: "0.3em",
            marginBottom: 16,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          EST. MMXXVI
        </div>
        <h1
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            color: "#FFD700",
            textShadow:
              "0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3)",
            letterSpacing: "0.05em",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          GERROD
        </h1>
        <div
          style={{
            color: "rgba(255,215,0,0.6)",
            fontSize: "1rem",
            letterSpacing: "0.4em",
            margin: "8px 0",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          ENGINEER
        </div>
        <div
          style={{
            color: "rgba(255,215,0,0.4)",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          PRODUCT 2
        </div>
        <div
          style={{
            width: 80,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #FFD700, transparent)",
            margin: "20px auto",
          }}
        />
        <div
          style={{
            color: "rgba(255,215,0,0.5)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          80,000W · 4 SOUND ENGINES · BLOCKCHAIN VERIFIED
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 32,
            padding: "10px 32px",
            background: "transparent",
            border: "1px solid rgba(255,215,0,0.5)",
            borderRadius: 4,
            color: "#FFD700",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background =
              "rgba(255,215,0,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "transparent";
          }}
        >
          INITIALIZE SYSTEM
        </button>
      </div>

      {/* Right page */}
      <div
        className={opening ? "book-page-right" : ""}
        style={{
          width: "40vw",
          maxWidth: 420,
          height: "60vh",
          maxHeight: 520,
          background: "linear-gradient(160deg, #071122 0%, #0d1f3c 100%)",
          border: "2px solid rgba(255,215,0,0.4)",
          borderLeft: "1px solid rgba(255,215,0,0.2)",
          borderRadius: "0 4px 4px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformOrigin: "left center",
          boxShadow:
            "inset 8px 0 24px rgba(0,0,0,0.5), 0 0 40px rgba(255,215,0,0.1)",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", padding: 32 }}>
          <div
            style={{
              color: "rgba(255,215,0,0.15)",
              fontSize: "3rem",
              fontWeight: 800,
            }}
          >
            2
          </div>
          <div
            style={{
              width: 60,
              height: 1,
              background: "rgba(255,215,0,0.3)",
              margin: "20px auto 12px",
            }}
          />
          <div
            style={{
              color: "rgba(255,215,0,0.3)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            SOUND SYSTEM
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: "rgba(0,0,0,0.4)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Battery Display ─────────────────────────────────────────────────────────
function BatteryDisplay({ charge, label }: { charge: number; label: string }) {
  const mah = Math.round((charge / 100) * 800000);
  const isFull = charge >= 100;

  // Gradient: dark blue at bottom → gold at top
  const fillColor =
    charge < 30
      ? "linear-gradient(to top, #0a1f4a, #1a3a7a)"
      : charge < 70
        ? "linear-gradient(to top, #0a1f4a, #2255aa, #886600)"
        : "linear-gradient(to top, #0a2260, #1a4499, #cc8800, #FFD700)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div className="gold-label" style={{ marginBottom: 4 }}>
        {label}
      </div>

      {/* Battery shape */}
      <div
        className={isFull ? "battery-full" : ""}
        style={{
          position: "relative",
          width: 80,
          height: 160,
          background: "rgba(10,20,40,0.9)",
          border: "2px solid rgba(255,215,0,0.4)",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: isFull
            ? "0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,215,0,0.3)"
            : "0 0 10px rgba(255,215,0,0.1)",
        }}
      >
        {/* Battery nub top */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 24,
            height: 10,
            background: "rgba(255,215,0,0.4)",
            borderRadius: "3px 3px 0 0",
            border: "2px solid rgba(255,215,0,0.5)",
            borderBottom: "none",
            zIndex: 2,
          }}
        />

        {/* Fill */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${charge}%`,
            background: fillColor,
            transition: "height 0.3s ease",
          }}
        />

        {/* Segment lines */}
        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            style={{
              position: "absolute",
              bottom: `${pct}%`,
              left: 0,
              right: 0,
              height: 1,
              background: "rgba(255,215,0,0.15)",
              zIndex: 1,
            }}
          />
        ))}

        {/* Percent text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 700,
            fontSize: "1rem",
            color: charge > 50 ? "#FFD700" : "rgba(255,255,255,0.7)",
            textShadow: "0 0 8px rgba(0,0,0,0.8)",
          }}
        >
          {Math.round(charge)}%
        </div>
      </div>

      {/* mAh reading */}
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.6rem",
          color: "rgba(255,215,0,0.7)",
          textAlign: "center",
        }}
      >
        {mah.toLocaleString()} / 800,000 mAh
      </div>

      {isFull && (
        <div
          className="charging-text"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.55rem",
            color: "#FFD700",
            letterSpacing: "0.15em",
            textShadow: "0 0 8px rgba(255,215,0,0.8)",
          }}
        >
          ✓ FULLY CHARGED
        </div>
      )}
    </div>
  );
}

// ─── Rotary Knob ─────────────────────────────────────────────────────────────
function RotaryKnob({
  value,
  onChange,
  min = 0,
  max = 100,
  size = 48,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: number;
}) {
  const knobRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);

  const pct = (value - min) / (max - min);
  const angle = -135 + pct * 270;

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startY: e.clientY, startVal: value };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      const range = max - min;
      const newVal = Math.max(
        min,
        Math.min(max, dragRef.current.startVal + (delta / 100) * range),
      );
      onChange(Math.round(newVal));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.preventDefault();
  };

  return (
    <div
      ref={knobRef}
      onMouseDown={onMouseDown}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(from ${angle - 135}deg, rgba(255,215,0,0.6) 0deg, rgba(255,215,0,0.6) ${pct * 270}deg, rgba(255,255,255,0.05) ${pct * 270}deg)`,
        border: "2px solid rgba(255,215,0,0.3)",
        cursor: "ns-resize",
        position: "relative",
        boxShadow:
          "0 0 10px rgba(255,215,0,0.2), inset 0 0 8px rgba(0,0,0,0.5)",
        userSelect: "none",
      }}
    >
      {/* Indicator dot */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 4,
          height: size / 2 - 6,
          background: "#FFD700",
          borderRadius: 2,
          transform: `translateX(-50%) rotate(${angle}deg)`,
          transformOrigin: "50% 100%",
          boxShadow: "0 0 4px rgba(255,215,0,0.8)",
        }}
      />
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // ── Intro
  const [showIntro, setShowIntro] = useState(true);

  // ── Battery / Charger
  const [charge1, setCharge1] = useState(0);
  const [charge2, setCharge2] = useState(0);
  const [charging, setCharging] = useState(false);
  const chargeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batteriesFullyCharged = charge1 >= 100 && charge2 >= 100;

  // ── Tracks / Player
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [masterPower, setMasterPower] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // ── EQ
  const [eqGains, setEqGains] = useState<number[]>(
    Array(EQ_BANDS.length).fill(0),
  );
  const [eqPreset, setEqPreset] = useState("Flat");

  // ── Engines
  const [engines, setEngines] = useState<EngineState[]>(
    Array.from({ length: 4 }, () => ({ on: true, gain: 75 })),
  );

  // ── Blockchain
  const [blockchainLog, setBlockchainLog] = useState<BlockchainEntry[]>([]);

  // ── Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const engineGainNodesRef = useRef<GainNode[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // ── Add blockchain log entry
  const logBlockchain = useCallback((action: string, value: string) => {
    setBlockchainLog((prev) => [
      { hash: makeHash(), timestamp: Date.now(), action, value },
      ...prev.slice(0, 19),
    ]);
  }, []);

  // ── Init Audio Context (lazy)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const audio = audioRef.current;
    if (!audio) return null;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);
    sourceNodeRef.current = source;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume / 100;
    masterGainRef.current = masterGain;

    // Engine gains (4 of them, summed)
    const engineGains = Array.from({ length: 4 }, () => ctx.createGain());
    engineGainNodesRef.current = engineGains;

    // EQ filters
    const filters = EQ_BANDS.map((band) => {
      const f = ctx.createBiquadFilter();
      f.type = "peaking";
      f.frequency.value = band.freq;
      f.Q.value = 1.0;
      f.gain.value = 0;
      return f;
    });
    filterNodesRef.current = filters;

    // Analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Chain: source -> filters (serial) -> masterGain -> analyser -> destination
    let node: AudioNode = source;
    for (const f of filters) {
      node.connect(f);
      node = f;
    }
    node.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    return ctx;
  }, [volume]);

  // ── Waveform draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx2d.clearRect(0, 0, W, H);
      ctx2d.fillStyle = "rgba(5, 12, 30, 0.85)";
      ctx2d.fillRect(0, 0, W, H);

      if (!analyser || !isPlaying) {
        // idle shimmer
        const numBars = 64;
        const barW = W / numBars - 1;
        for (let i = 0; i < numBars; i++) {
          const h = 2 + Math.random() * 4;
          ctx2d.fillStyle = "rgba(255,215,0,0.08)";
          ctx2d.fillRect(i * (barW + 1), H - h, barW, h);
        }
        return;
      }

      const bufferLen = analyser.frequencyBinCount;
      const data = new Uint8Array(bufferLen);
      analyser.getByteFrequencyData(data);

      const barWidth = (W / bufferLen) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLen; i++) {
        const v = data[i] / 255;
        const barH = v * H;
        const gradient = ctx2d.createLinearGradient(0, H - barH, 0, H);
        if (v > 0.75) {
          gradient.addColorStop(0, "#FFD700");
          gradient.addColorStop(0.5, "#FFA500");
          gradient.addColorStop(1, "#cc6600");
        } else if (v > 0.4) {
          gradient.addColorStop(0, "#88aaff");
          gradient.addColorStop(1, "#1144aa");
        } else {
          gradient.addColorStop(0, "rgba(40,80,180,0.8)");
          gradient.addColorStop(1, "rgba(10,30,80,0.4)");
        }
        ctx2d.fillStyle = gradient;
        ctx2d.fillRect(x, H - barH, barWidth - 1, barH);
        x += barWidth;
      }
    };
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  // ── Charging logic
  const startCharging = useCallback(() => {
    if (charging || batteriesFullyCharged) return;
    setCharging(true);
    logBlockchain("CHARGE_START", "0%");

    chargeIntervalRef.current = setInterval(() => {
      setCharge1((prev) => {
        const next = Math.min(100, prev + 100 / (6000 / 60));
        return next;
      });
      setCharge2((prev) => {
        const next = Math.min(100, prev + 100 / (6000 / 60));
        if (next >= 100) {
          if (chargeIntervalRef.current)
            clearInterval(chargeIntervalRef.current);
          setCharging(false);
          logBlockchain("CHARGE_COMPLETE", "100%");
        }
        return next;
      });
    }, 60);
  }, [charging, batteriesFullyCharged, logBlockchain]);

  // ── Volume change
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterPower ? volume / 100 : 0;
    }
    if (audioRef.current) {
      audioRef.current.volume = masterPower ? volume / 100 : 0;
    }
  }, [volume, masterPower]);

  // ── EQ gain change
  const setEqBand = useCallback(
    (idx: number, val: number) => {
      setEqGains((prev) => {
        const next = [...prev];
        next[idx] = val;
        return next;
      });
      if (filterNodesRef.current[idx]) {
        filterNodesRef.current[idx].gain.value = val;
      }
      logBlockchain(
        "EQ_ADJUST",
        `${EQ_BANDS[idx].label} = ${val > 0 ? "+" : ""}${val}dB`,
      );
    },
    [logBlockchain],
  );

  // ── Apply EQ preset
  const applyPreset = useCallback(
    (name: string) => {
      const gains = EQ_PRESETS[name];
      if (!gains) return;
      setEqPreset(name);
      setEqGains(gains);
      gains.forEach((g, i) => {
        if (filterNodesRef.current[i]) filterNodesRef.current[i].gain.value = g;
      });
      logBlockchain("EQ_PRESET", name);
    },
    [logBlockchain],
  );

  // ── Engine toggle
  const toggleEngine = useCallback(
    (idx: number) => {
      setEngines((prev) => {
        const next = prev.map((e, i) => (i === idx ? { ...e, on: !e.on } : e));
        if (engineGainNodesRef.current[idx]) {
          engineGainNodesRef.current[idx].gain.value = next[idx].on
            ? next[idx].gain / 100
            : 0;
        }
        logBlockchain(
          "ENGINE_TOGGLE",
          `Engine ${idx + 1} ${next[idx].on ? "ON" : "OFF"}`,
        );
        return next;
      });
    },
    [logBlockchain],
  );

  const setEngineGain = useCallback(
    (idx: number, val: number) => {
      setEngines((prev) => {
        const next = prev.map((e, i) => (i === idx ? { ...e, gain: val } : e));
        if (engineGainNodesRef.current[idx] && next[idx].on) {
          engineGainNodesRef.current[idx].gain.value = val / 100;
        }
        return next;
      });
      logBlockchain("ENGINE_GAIN", `Engine ${idx + 1} = ${val}%`);
    },
    [logBlockchain],
  );

  // ── File handling
  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newTracks: Track[] = [];
      for (const file of Array.from(files)) {
        if (
          !file.type.startsWith("audio/") &&
          !file.name.match(/\.(mp3|wav|flac|ogg|m4a)$/i)
        )
          continue;
        const url = URL.createObjectURL(file);
        newTracks.push({
          id: `${Date.now()}-${file.name}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          url,
        });
      }
      setTracks((prev) => [...prev, ...newTracks]);
      logBlockchain("FILES_LOADED", `${newTracks.length} track(s)`);
    },
    [logBlockchain],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  // ── Playback
  const playTrack = useCallback(
    (idx: number) => {
      if (!batteriesFullyCharged) return;
      const audio = audioRef.current;
      if (!audio || !tracks[idx]) return;

      const ctx = initAudio();
      if (ctx?.state === "suspended") ctx.resume();

      if (audio.src !== tracks[idx].url) {
        audio.src = tracks[idx].url;
      }
      setCurrentTrackIdx(idx);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
      logBlockchain("PLAY", tracks[idx].name);
    },
    [batteriesFullyCharged, tracks, initAudio, logBlockchain],
  );

  const togglePlay = useCallback(() => {
    if (!batteriesFullyCharged) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (!tracks.length) return;

    if (audio.paused) {
      const ctx = initAudio();
      if (ctx?.state === "suspended") ctx.resume();
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
      logBlockchain("PLAY", tracks[currentTrackIdx]?.name ?? "");
    } else {
      audio.pause();
      setIsPlaying(false);
      logBlockchain("PAUSE", "");
    }
  }, [
    batteriesFullyCharged,
    tracks,
    currentTrackIdx,
    initAudio,
    logBlockchain,
  ]);

  const nextTrack = useCallback(() => {
    if (!tracks.length) return;
    const idx = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (currentTrackIdx + 1) % tracks.length;
    playTrack(idx);
  }, [tracks, currentTrackIdx, shuffle, playTrack]);

  const prevTrack = useCallback(() => {
    if (!tracks.length) return;
    const idx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
    playTrack(idx);
  }, [tracks, currentTrackIdx, playTrack]);

  // ── Audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else nextTrack();
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [nextTrack, repeat]);

  // ── Cleanup
  useEffect(() => {
    return () => {
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const overallCharge = (charge1 + charge2) / 2;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #04080f 0%, #0a1628 30%, #071020 100%)",
        color: "#e8e0cc",
        fontFamily: "JetBrains Mono, monospace",
        paddingBottom: 80,
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef}>
        <track kind="captions" />
      </audio>

      {/* Book Intro */}
      {showIntro && <BookIntro onClose={() => setShowIntro(false)} />}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,215,0,0.2)",
          background: "rgba(4,8,15,0.95)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                color: "#FFD700",
                textShadow: "0 0 20px rgba(255,215,0,0.5)",
                letterSpacing: "0.05em",
                lineHeight: 1,
              }}
            >
              GERROD
            </div>
            <div
              style={{
                color: "rgba(255,215,0,0.5)",
                fontSize: "0.55rem",
                letterSpacing: "0.3em",
              }}
            >
              ENGINEER · PRODUCT 2
            </div>
          </div>
          <div
            style={{
              padding: "4px 12px",
              background: "rgba(255,215,0,0.1)",
              border: "1px solid rgba(255,215,0,0.3)",
              borderRadius: 4,
              fontSize: "0.6rem",
              color: "#FFD700",
              letterSpacing: "0.1em",
            }}
          >
            80,000W
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Battery indicator */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ fontSize: "0.55rem", color: "rgba(255,215,0,0.5)" }}>
              BAT
            </div>
            <div
              style={{
                width: 40,
                height: 14,
                border: "1px solid rgba(255,215,0,0.4)",
                borderRadius: 2,
                overflow: "hidden",
                background: "rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${overallCharge}%`,
                  background:
                    overallCharge < 30
                      ? "#1a3a7a"
                      : overallCharge < 70
                        ? "#886600"
                        : "#FFD700",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ fontSize: "0.55rem", color: "rgba(255,215,0,0.7)" }}>
              {Math.round(overallCharge)}%
            </div>
          </div>

          {/* Master power */}
          <button
            type="button"
            data-ocid="master.toggle"
            onClick={() => {
              setMasterPower((p) => !p);
              logBlockchain("MASTER_POWER", masterPower ? "OFF" : "ON");
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `2px solid ${masterPower ? "#FFD700" : "rgba(255,215,0,0.2)"}`,
              background: masterPower
                ? "rgba(255,215,0,0.15)"
                : "rgba(10,20,40,0.5)",
              color: masterPower ? "#FFD700" : "rgba(255,215,0,0.3)",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: masterPower ? "0 0 16px rgba(255,215,0,0.4)" : "none",
              transition: "all 0.2s",
            }}
          >
            ⏻
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {/* ── ROW 1: Battery Charger + 2 Batteries ──────────────────────── */}
        <section
          className="glass-panel-bright"
          data-ocid="battery.panel"
          style={{ padding: 24, marginBottom: 24 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: charging ? "#FFD700" : "rgba(255,215,0,0.2)",
                boxShadow: charging ? "0 0 8px #FFD700" : "none",
              }}
            />
            <span
              className="gold-text"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.2em",
                fontWeight: 700,
              }}
            >
              BATTERY SYSTEM — 1,600,000 mAh TOTAL
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Batteries */}
            <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
              <BatteryDisplay charge={charge1} label="BATTERY A" />
              <BatteryDisplay charge={charge2} label="BATTERY B" />
            </div>

            {/* Charger panel */}
            <div
              style={{
                flex: 1,
                minWidth: 280,
                background: "rgba(10,20,45,0.7)",
                border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div className="gold-label" style={{ marginBottom: 16 }}>
                BATTERY CHARGER — 200,000W OUTPUT
              </div>

              {/* Overall progress */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: "0.6rem", color: "rgba(255,215,0,0.6)" }}
                  >
                    CHARGE LEVEL
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "#FFD700" }}>
                    {Math.round(overallCharge)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid rgba(255,215,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${overallCharge}%`,
                      background:
                        overallCharge < 50
                          ? "linear-gradient(90deg, #0a2260, #1a4499)"
                          : "linear-gradient(90deg, #1a4499, #cc8800, #FFD700)",
                      borderRadius: 4,
                      transition: "width 0.3s",
                      boxShadow:
                        overallCharge > 50
                          ? "0 0 8px rgba(255,215,0,0.5)"
                          : "none",
                    }}
                  />
                </div>
              </div>

              {/* Status */}
              <div
                style={{
                  fontSize: "0.65rem",
                  color: batteriesFullyCharged
                    ? "#FFD700"
                    : "rgba(255,215,0,0.5)",
                  marginBottom: 16,
                  textShadow: batteriesFullyCharged
                    ? "0 0 8px rgba(255,215,0,0.6)"
                    : "none",
                }}
                className={charging ? "charging-text" : ""}
              >
                {batteriesFullyCharged
                  ? "✓ BATTERIES CHARGED — SYSTEM READY"
                  : charging
                    ? "⚡ CHARGING IN PROGRESS..."
                    : "⚠ SYSTEM LOCKED — Charge batteries to begin"}
              </div>

              {/* Charge button */}
              <button
                type="button"
                data-ocid="battery.charge_button"
                onClick={startCharging}
                disabled={charging || batteriesFullyCharged}
                className={
                  batteriesFullyCharged ? "" : !charging ? "gold-pulse" : ""
                }
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: batteriesFullyCharged
                    ? "rgba(255,215,0,0.1)"
                    : charging
                      ? "rgba(255,165,0,0.15)"
                      : "rgba(255,215,0,0.2)",
                  border: `2px solid ${batteriesFullyCharged ? "rgba(255,215,0,0.2)" : "#FFD700"}`,
                  borderRadius: 6,
                  color: batteriesFullyCharged
                    ? "rgba(255,215,0,0.4)"
                    : "#FFD700",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  cursor:
                    charging || batteriesFullyCharged
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s",
                  textShadow: batteriesFullyCharged
                    ? "none"
                    : "0 0 8px rgba(255,215,0,0.6)",
                }}
              >
                {batteriesFullyCharged
                  ? "✓ FULLY CHARGED"
                  : charging
                    ? "⚡ CHARGING..."
                    : "⚡ CHARGE BATTERIES"}
              </button>

              {/* Voltage display */}
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {[
                  "VOLTAGE: 48V DC",
                  "AMPS: 4,167A",
                  "EFFICIENCY: 99.1%",
                  "TEMP: 23°C",
                ].map((stat) => (
                  <div
                    key={stat}
                    style={{
                      fontSize: "0.55rem",
                      color: "rgba(255,215,0,0.4)",
                      borderTop: "1px solid rgba(255,215,0,0.1)",
                      paddingTop: 6,
                    }}
                  >
                    {stat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ROW 2: File Picker ─────────────────────────────────────────── */}
        <section
          className="glass-panel"
          style={{ padding: 20, marginBottom: 24 }}
        >
          <div className="gold-label" style={{ marginBottom: 12 }}>
            FILE LOADER — DROP AUDIO FILES
          </div>

          {/* Drop zone */}
          <div
            data-ocid="player.dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter") fileInputRef.current?.click();
            }}
            style={{
              border: `2px dashed ${isDraggingOver ? "#FFD700" : "rgba(255,215,0,0.35)"}`,
              borderRadius: 8,
              padding: "28px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: isDraggingOver
                ? "rgba(255,215,0,0.05)"
                : "transparent",
              transition: "all 0.2s",
              boxShadow: isDraggingOver
                ? "0 0 20px rgba(255,215,0,0.2)"
                : "none",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎵</div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "rgba(255,215,0,0.7)",
                letterSpacing: "0.1em",
              }}
            >
              DROP AUDIO FILES HERE or CLICK TO BROWSE
            </div>
            <div
              style={{
                fontSize: "0.55rem",
                color: "rgba(255,215,0,0.35)",
                marginTop: 6,
              }}
            >
              MP3 · WAV · FLAC · OGG · M4A
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a"
            multiple
            style={{ display: "none" }}
            onChange={(e) => addFiles(e.target.files)}
            data-ocid="player.upload_button"
          />

          {/* Track queue */}
          {tracks.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="gold-label" style={{ marginBottom: 8 }}>
                TRACK QUEUE — {tracks.length} LOADED
              </div>
              <div
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {tracks.map((t, i) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => playTrack(i)}
                    style={{
                      padding: "6px 12px",
                      background:
                        currentTrackIdx === i
                          ? "rgba(255,215,0,0.12)"
                          : "transparent",
                      border: `1px solid ${currentTrackIdx === i ? "rgba(255,215,0,0.4)" : "rgba(255,215,0,0.08)"}`,
                      borderRadius: 4,
                      color:
                        currentTrackIdx === i
                          ? "#FFD700"
                          : "rgba(255,255,255,0.6)",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.65rem",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{ color: "rgba(255,215,0,0.3)", minWidth: 24 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {currentTrackIdx === i && isPlaying && <span>▶</span>}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── ROW 3: Player Controls ────────────────────────────────────── */}
        <section
          className="glass-panel-bright"
          style={{
            padding: 20,
            marginBottom: 24,
            position: "relative",
            boxShadow: batteriesFullyCharged
              ? "0 0 30px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,215,0,0.12)"
              : "none",
          }}
        >
          {/* Lock overlay */}
          {!batteriesFullyCharged && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                background: "rgba(4,8,15,0.7)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
                backdropFilter: "blur(4px)",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🔒</div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "rgba(255,215,0,0.6)",
                  letterSpacing: "0.2em",
                }}
              >
                CHARGE BATTERIES TO UNLOCK
              </div>
            </div>
          )}

          <div className="gold-label" style={{ marginBottom: 16 }}>
            PLAYER CONTROLS
          </div>

          {/* Track info */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.9)",
                fontWeight: 700,
              }}
            >
              {tracks[currentTrackIdx]?.name ?? "NO TRACK LOADED"}
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                color: "rgba(255,215,0,0.5)",
                marginTop: 2,
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Progress */}
          <div
            onKeyDown={() => {}}
            onClick={(e) => {
              if (!batteriesFullyCharged || !duration || !audioRef.current)
                return;
              const rect = (
                e.currentTarget as HTMLDivElement
              ).getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pct * duration;
            }}
            style={{
              height: 6,
              background: "rgba(255,215,0,0.1)",
              borderRadius: 3,
              marginBottom: 16,
              cursor: "pointer",
              border: "1px solid rgba(255,215,0,0.15)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                background: "linear-gradient(90deg, #1a4499, #FFD700)",
                borderRadius: 3,
                transition: "width 0.5s linear",
                boxShadow: "0 0 8px rgba(255,215,0,0.4)",
              }}
            />
          </div>

          {/* Controls row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Shuffle */}
            <button
              type="button"
              onClick={() => setShuffle((p) => !p)}
              style={{
                background: shuffle ? "rgba(255,215,0,0.15)" : "transparent",
                border: `1px solid ${shuffle ? "rgba(255,215,0,0.5)" : "rgba(255,215,0,0.2)"}`,
                borderRadius: 4,
                padding: "4px 8px",
                color: shuffle ? "#FFD700" : "rgba(255,215,0,0.3)",
                cursor: "pointer",
                fontSize: "0.6rem",
              }}
            >
              SHUF
            </button>

            {/* Prev */}
            <button
              type="button"
              data-ocid="player.secondary_button"
              onClick={prevTrack}
              disabled={!batteriesFullyCharged}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "rgba(255,215,0,0.08)",
                border: "1px solid rgba(255,215,0,0.2)",
                color: "rgba(255,215,0,0.7)",
                cursor: batteriesFullyCharged ? "pointer" : "not-allowed",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ⏮
            </button>

            {/* Play/Pause */}
            <button
              type="button"
              data-ocid="player.primary_button"
              onClick={togglePlay}
              disabled={!batteriesFullyCharged || !tracks.length}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: isPlaying
                  ? "radial-gradient(circle, #FFD700, #cc8800)"
                  : "radial-gradient(circle, rgba(255,215,0,0.3), rgba(200,150,0,0.2))",
                border: `2px solid ${isPlaying ? "#FFD700" : "rgba(255,215,0,0.4)"}`,
                color: isPlaying ? "#0a1628" : "#FFD700",
                cursor:
                  batteriesFullyCharged && tracks.length
                    ? "pointer"
                    : "not-allowed",
                fontSize: "1.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isPlaying
                  ? "0 0 24px rgba(255,215,0,0.6), 0 0 48px rgba(255,215,0,0.3)"
                  : "none",
                transition: "all 0.2s",
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            {/* Next */}
            <button
              type="button"
              data-ocid="player.secondary_button"
              onClick={nextTrack}
              disabled={!batteriesFullyCharged}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "rgba(255,215,0,0.08)",
                border: "1px solid rgba(255,215,0,0.2)",
                color: "rgba(255,215,0,0.7)",
                cursor: batteriesFullyCharged ? "pointer" : "not-allowed",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ⏭
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={() => setRepeat((p) => !p)}
              style={{
                background: repeat ? "rgba(255,215,0,0.15)" : "transparent",
                border: `1px solid ${repeat ? "rgba(255,215,0,0.5)" : "rgba(255,215,0,0.2)"}`,
                borderRadius: 4,
                padding: "4px 8px",
                color: repeat ? "#FFD700" : "rgba(255,215,0,0.3)",
                cursor: "pointer",
                fontSize: "0.6rem",
              }}
            >
              RPT
            </button>
          </div>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: "0.6rem",
                color: "rgba(255,215,0,0.5)",
                minWidth: 40,
              }}
            >
              VOL
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="vol-slider"
              style={{ flex: 1 }}
            />
            <span
              style={{ fontSize: "0.6rem", color: "#FFD700", minWidth: 30 }}
            >
              {volume}%
            </span>
          </div>
        </section>

        {/* ── ROW 4: Waveform Visualizer ─────────────────────────────────── */}
        <section
          className="glass-panel"
          style={{ padding: 16, marginBottom: 24, overflow: "hidden" }}
        >
          <div className="gold-label" style={{ marginBottom: 8 }}>
            FREQUENCY ANALYZER — REAL-TIME SPECTRUM
          </div>
          <canvas
            ref={canvasRef}
            width={1160}
            height={120}
            style={{
              width: "100%",
              height: 120,
              borderRadius: 6,
              display: "block",
            }}
          />
        </section>

        {/* ── ROW 5: 10-Band EQ ──────────────────────────────────────────── */}
        <section
          className="glass-panel-bright"
          data-ocid="eq.panel"
          style={{ padding: 20, marginBottom: 24 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              className="gold-text"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.2em",
                fontWeight: 700,
              }}
            >
              10-BAND GRAPHIC EQUALIZER — REAL AUDIO PROCESSING
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Object.keys(EQ_PRESETS).map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => applyPreset(name)}
                  style={{
                    padding: "3px 8px",
                    background:
                      eqPreset === name ? "rgba(255,215,0,0.2)" : "transparent",
                    border: `1px solid ${eqPreset === name ? "rgba(255,215,0,0.6)" : "rgba(255,215,0,0.15)"}`,
                    borderRadius: 3,
                    color:
                      eqPreset === name ? "#FFD700" : "rgba(255,215,0,0.4)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.55rem",
                    cursor: "pointer",
                    letterSpacing: "0.1em",
                    transition: "all 0.15s",
                  }}
                >
                  {name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {/* dB scale */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 180,
                paddingBottom: 20,
              }}
            >
              {["+12", "+6", "0", "-6", "-12"].map((db) => (
                <div
                  key={db}
                  style={{
                    fontSize: "0.5rem",
                    color: "rgba(255,215,0,0.4)",
                    textAlign: "right",
                    lineHeight: 1,
                  }}
                >
                  {db}
                </div>
              ))}
            </div>

            {/* Bands */}
            <div
              style={{
                flex: 1,
                display: "flex",
                gap: 4,
                justifyContent: "space-around",
                alignItems: "flex-end",
              }}
            >
              {EQ_BANDS.map((band, i) => {
                const g = eqGains[i];
                const isBoost = g > 0;
                const isCut = g < 0;
                return (
                  <div
                    key={band.freq}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      flex: 1,
                    }}
                  >
                    {/* dB value */}
                    <div
                      style={{
                        fontSize: "0.5rem",
                        color: isBoost
                          ? "#FFD700"
                          : isCut
                            ? "#4488ff"
                            : "rgba(255,255,255,0.3)",
                        fontWeight: 700,
                        textShadow: isBoost
                          ? "0 0 6px rgba(255,215,0,0.8)"
                          : isCut
                            ? "0 0 6px rgba(68,136,255,0.8)"
                            : "none",
                      }}
                    >
                      {g > 0 ? `+${g}` : g}
                    </div>

                    {/* Slider track + indicator */}
                    <div
                      style={{
                        position: "relative",
                        height: 140,
                        width: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Visual track */}
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 4,
                          height: "100%",
                          background: "rgba(255,215,0,0.08)",
                          borderRadius: 2,
                        }}
                      >
                        {/* Center line */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: -6,
                            right: -6,
                            height: 1,
                            background: "rgba(255,215,0,0.2)",
                          }}
                        />
                        {/* Fill above/below center */}
                        {g !== 0 && (
                          <div
                            style={{
                              position: "absolute",
                              width: "100%",
                              background: isBoost
                                ? "linear-gradient(to top, rgba(255,215,0,0.4), rgba(255,215,0,0.8))"
                                : "linear-gradient(to bottom, rgba(68,136,255,0.4), rgba(68,136,255,0.8))",
                              top: isBoost ? `${50 - (g / 12) * 50}%` : "50%",
                              height: `${(Math.abs(g) / 12) * 50}%`,
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </div>

                      {/* Actual range input */}
                      <input
                        type="range"
                        data-ocid={`eq.slider.${i + 1}`}
                        min={-12}
                        max={12}
                        step={0.5}
                        value={g}
                        onChange={(e) => setEqBand(i, Number(e.target.value))}
                        className="eq-slider-input"
                        style={{ position: "absolute", zIndex: 5 }}
                      />
                    </div>

                    {/* Freq label */}
                    <div
                      style={{
                        fontSize: "0.48rem",
                        color: "rgba(255,215,0,0.5)",
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {band.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── ROW 6: 4 Sound Engines ──────────────────────────────────────── */}
        <section style={{ marginBottom: 24 }}>
          <div className="gold-label" style={{ marginBottom: 12 }}>
            4 SOUND ENGINES — INDEPENDENT CONTROL
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {engines.map((engine, idx) => (
              <div
                key={
                  ["engine-smart", "engine-freq", "engine-app", "engine-stab"][
                    idx
                  ]
                }
                data-ocid={`engine.panel.${idx + 1}`}
                className="glass-panel"
                style={{
                  padding: 16,
                  opacity: engine.on ? 1 : 0.5,
                  transition: "opacity 0.3s",
                  borderColor: engine.on
                    ? "rgba(255,215,0,0.4)"
                    : "rgba(255,215,0,0.1)",
                  boxShadow: engine.on
                    ? "0 0 16px rgba(255,215,0,0.1)"
                    : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#FFD700",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                    >
                      ENGINE {idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: "0.5rem",
                        color: "rgba(255,215,0,0.4)",
                      }}
                    >
                      {
                        [
                          "SMART PROCESSOR",
                          "FREQUENCY SIGNAL",
                          "APP GENERATOR",
                          "STABILIZER",
                        ][idx]
                      }
                    </div>
                  </div>

                  {/* Status LED */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: engine.on ? "#00ff88" : "#ff3333",
                        boxShadow: engine.on
                          ? "0 0 8px #00ff88"
                          : "0 0 8px #ff3333",
                        animation:
                          engine.on && isPlaying
                            ? "led-blink 0.5s ease-in-out infinite"
                            : "none",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.45rem",
                        color: engine.on ? "#00ff88" : "#ff3333",
                      }}
                    >
                      {engine.on ? "ON" : "OFF"}
                    </div>
                  </div>
                </div>

                {/* Gain knob */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <RotaryKnob
                    value={engine.gain}
                    onChange={(val) => setEngineGain(idx, val)}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "0.55rem",
                        color: "rgba(255,215,0,0.5)",
                      }}
                    >
                      GAIN
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#FFD700",
                        fontWeight: 700,
                      }}
                    >
                      {engine.gain}%
                    </div>
                  </div>
                </div>

                {/* Power toggle */}
                <button
                  type="button"
                  data-ocid={`engine.toggle.${idx + 1}`}
                  onClick={() => toggleEngine(idx)}
                  style={{
                    width: "100%",
                    padding: "8px 0",
                    background: engine.on
                      ? "rgba(255,215,0,0.12)"
                      : "rgba(255,50,50,0.08)",
                    border: `1px solid ${engine.on ? "rgba(255,215,0,0.4)" : "rgba(255,50,50,0.3)"}`,
                    borderRadius: 4,
                    color: engine.on ? "#FFD700" : "#ff6666",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {engine.on ? "⏻ POWERED ON" : "⏻ POWERED OFF"}
                </button>

                {/* Engine stats */}
                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 4,
                  }}
                >
                  {[
                    ["WATT", `${Math.round(engine.gain * 200)}W`],
                    ["FREQ", engine.on ? "ACTIVE" : "IDLE"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        fontSize: "0.5rem",
                        color: "rgba(255,215,0,0.35)",
                        borderTop: "1px solid rgba(255,215,0,0.06)",
                        paddingTop: 4,
                      }}
                    >
                      {k}:{" "}
                      <span style={{ color: "rgba(255,215,0,0.6)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ROW 7: Blockchain Panel ─────────────────────────────────────── */}
        <section
          className="glass-panel"
          data-ocid="blockchain.panel"
          style={{ padding: 20, marginBottom: 24 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 8px #00ff88",
                animation: "led-blink 2s ease-in-out infinite",
              }}
            />
            <span
              className="gold-text"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.2em",
                fontWeight: 700,
              }}
            >
              BLOCKCHAIN STATE LEDGER — SOUND VERIFICATION
            </span>
          </div>

          {blockchainLog.length === 0 ? (
            <div
              style={{
                fontSize: "0.6rem",
                color: "rgba(255,215,0,0.3)",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              NO STATE CHANGES RECORDED
            </div>
          ) : (
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {blockchainLog.map((entry) => (
                <div
                  key={`block-${entry.hash}`}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(255,215,0,0.06)",
                    fontSize: "0.55rem",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(0,255,136,0.6)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    #{entry.hash}
                  </span>
                  <span style={{ color: "rgba(255,215,0,0.5)" }}>
                    {entry.action}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>
                    {entry.value}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,215,0,0.25)",
                      marginLeft: "auto",
                    }}
                  >
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Chain stats */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            {[
              ["CHAIN", "MAINNET-1"],
              ["BLOCKS", blockchainLog.length.toString()],
              ["STATUS", "VERIFIED"],
              ["NODE", "GERROD-P2"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{ fontSize: "0.55rem", color: "rgba(255,215,0,0.4)" }}
              >
                {k}: <span style={{ color: "rgba(255,215,0,0.7)" }}>{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer
          style={{
            textAlign: "center",
            paddingTop: 24,
            borderTop: "1px solid rgba(255,215,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "0.55rem",
              color: "rgba(255,215,0,0.3)",
              letterSpacing: "0.15em",
            }}
          >
            © {new Date().getFullYear()} GERROD | ENGINEER | PRODUCT 2 — 80,000W
            · 4 SOUND ENGINES · BLOCKCHAIN VERIFIED
          </div>
          <div
            style={{
              fontSize: "0.5rem",
              color: "rgba(255,215,0,0.15)",
              marginTop: 6,
            }}
          >
            Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,215,0,0.3)", textDecoration: "none" }}
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
