import {
  LucideActivity,
  LucideChevronFirst,
  LucideChevronLast,
  LucideLink,
  LucideMusic,
  LucidePause,
  LucidePlay,
  LucidePower,
  LucideRadio,
  LucideRepeat,
  LucideShuffle,
  LucideUploadCloud,
  LucideVolume2,
  LucideZap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ── Tracks ────────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    title: "Midnight Drive",
    artist: "Neon Collective",
    duration: "4:32",
    totalSec: 272,
    art: "/assets/generated/album-midnight-drive.dim_200x200.jpg",
  },
  {
    title: "Ocean Deep",
    artist: "Aqua Waves",
    duration: "3:58",
    totalSec: 238,
    art: "/assets/generated/album-ocean-deep.dim_200x200.jpg",
  },
  {
    title: "Pulse Wave",
    artist: "The Frequency",
    duration: "5:14",
    totalSec: 314,
    art: "/assets/generated/album-pulse-wave.dim_200x200.jpg",
  },
  {
    title: "Neon Lights",
    artist: "Synthwave Project",
    duration: "4:07",
    totalSec: 247,
    art: "/assets/generated/album-neon-lights.dim_200x200.jpg",
  },
];

// ── 30-Band Frequencies ───────────────────────────────────────────────────────
const BANDS_30 = [
  { freq: "25", label: "25" },
  { freq: "31", label: "31" },
  { freq: "40", label: "40" },
  { freq: "50", label: "50" },
  { freq: "63", label: "63" },
  { freq: "80", label: "80" },
  { freq: "100", label: "100" },
  { freq: "125", label: "125" },
  { freq: "160", label: "160" },
  { freq: "200", label: "200" },
  { freq: "250", label: "250" },
  { freq: "315", label: "315" },
  { freq: "400", label: "400" },
  { freq: "500", label: "500" },
  { freq: "630", label: "630" },
  { freq: "800", label: "800" },
  { freq: "1k", label: "1k" },
  { freq: "1.25k", label: "1.25k" },
  { freq: "1.6k", label: "1.6k" },
  { freq: "2k", label: "2k" },
  { freq: "2.5k", label: "2.5k" },
  { freq: "3.15k", label: "3.15k" },
  { freq: "4k", label: "4k" },
  { freq: "5k", label: "5k" },
  { freq: "6.3k", label: "6.3k" },
  { freq: "8k", label: "8k" },
  { freq: "10k", label: "10k" },
  { freq: "12.5k", label: "12.5k" },
  { freq: "16k", label: "16k" },
  { freq: "20k", label: "20k" },
];

const FLAT_30 = Array(30).fill(0);

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS_30: Record<string, number[]> = {
  Flat: FLAT_30,
  Rock: [
    5, 5, 4, 3, 2, 1, 0, -1, -2, -2, -2, -1, 0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 4,
    5, 6, 5, 4, 3, 3,
  ],
  Pop: [
    -1, -1, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 0, -1, -1, -1, 0, 0, 0, -1, -1, -1,
    -2, -2, -2, -1, 0, 0, 0,
  ],
  Classical: [
    4, 4, 3, 3, 2, 2, 1, 1, 0, 0, -1, -1, -1, -2, -2, -2, -1, -1, 0, 0, 0, 0, 1,
    1, 2, 2, 3, 3, 4, 4,
  ],
  Jazz: [
    3, 3, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 1, 0, -1, -1, -1, 0, 1, 1, 2, 2, 2, 1,
    1, 2, 2, 3, 3, 3,
  ],
  Electronic: [
    6, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -3, -2, -1, 0, 1, 2, 2, 1, 0, 0, 1, 2,
    3, 4, 5, 6, 6, 5, 5,
  ],
  "Bass Boost": [
    8, 8, 7, 7, 6, 6, 5, 4, 3, 2, 1, 0, 0, -1, -1, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -1, -1, -1,
  ],
  Vocal: [
    -2, -2, -2, -1, -1, 0, 0, 1, 2, 2, 3, 3, 4, 5, 6, 6, 5, 5, 4, 4, 3, 3, 2, 1,
    0, -1, -1, -2, -2, -2,
  ],
};

const PRESET_NAMES = Object.keys(PRESETS_30);

// DJ effect offsets per switch (which bands they affect and by how much)
const DJ_EFFECTS: Record<string, number[]> = {
  REVERB: [
    0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, 0, 0,
    0, 0, 0, 0, 0, 0,
  ],
  DELAY: [
    0, 0, 0, 1, 1, 1, 0, 0, 0, 0, -1, -1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, -1,
    -1, 0, 0, 0, 0, 0,
  ],
  CHORUS: [
    0, 0, 1, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1,
    0, 0, 1, 1, 0, 0,
  ],
  FLARE: [
    2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    2, 2, 2, 1, 1,
  ],
  GATE: [
    0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ],
  COMPRESS: [
    1, 1, 1, 0, 0, 0, -1, -1, 0, 0, 0, -1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, -1, -1,
    0, 0, 1, 1, 0, 0,
  ],
  SATURATE: [
    1, 1, 2, 2, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1, -1, 0, 0, 0, 1, 1, 2,
    1, 0, -1, 0, 0, 0,
  ],
  SPREAD: [
    0, 0, 0, -1, -1, 0, 0, 0, 0, 1, 1, 0, 0, 0, -1, -1, 0, 0, 0, 0, 1, 1, 0, 0,
    0, -1, -1, 0, 0, 0,
  ],
};

const DJ_SWITCH_NAMES = [
  "REVERB",
  "DELAY",
  "CHORUS",
  "FLARE",
  "GATE",
  "COMPRESS",
  "SATURATE",
  "SPREAD",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getEQCurvePath(
  gains: number[],
  width: number,
  height: number,
): string {
  const padX = 24;
  const padY = 16;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;
  const midY = padY + usableH / 2;
  const points = gains.map((g, i) => ({
    x: padX + (i / (gains.length - 1)) * usableW,
    y: midY - (g / 12) * (usableH / 2),
  }));
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function getAreaPath(curvePath: string, width: number, height: number): string {
  if (!curvePath) return "";
  const padX = 24;
  const padY = 16;
  const usableH = height - padY * 2;
  const midY = padY + usableH / 2;
  return `${curvePath} L ${width - padX},${midY} L ${padX},${midY} Z`;
}

const SVG_W = 900;
const SVG_H = 160;

// ── EQ Curve Component ────────────────────────────────────────────────────────
function EQCurve({ gains }: { gains: number[] }) {
  const curvePath = useMemo(() => getEQCurvePath(gains, SVG_W, SVG_H), [gains]);
  const areaPath = useMemo(
    () => getAreaPath(curvePath, SVG_W, SVG_H),
    [curvePath],
  );
  const gridLines = [-12, -6, 0, 6, 12];
  const padY = 16;
  const usableH = SVG_H - padY * 2;
  const midY = padY + usableH / 2;
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full h-full"
      data-ocid="eq.curve.canvas_target"
      preserveAspectRatio="none"
      role="img"
      aria-label="EQ frequency response curve"
    >
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="oklch(0.78 0.18 192)"
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.78 0.18 192)"
            stopOpacity="0.02"
          />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glowStrong">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {gridLines.map((db) => {
        const y = midY - (db / 12) * (usableH / 2);
        return (
          <g key={db}>
            <line
              x1={24}
              y1={y}
              x2={SVG_W - 24}
              y2={y}
              stroke={
                db === 0
                  ? "oklch(0.55 0.04 220 / 0.6)"
                  : "oklch(0.22 0.02 265 / 0.6)"
              }
              strokeWidth={db === 0 ? 1.5 : 0.7}
              strokeDasharray={db === 0 ? "none" : "3 5"}
            />
            <text
              x={12}
              y={y + 4}
              fill="oklch(0.42 0.04 220)"
              fontSize="9"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
            >
              {db > 0 ? `+${db}` : db}
            </text>
          </g>
        );
      })}
      <motion.path
        d={areaPath}
        fill="url(#curveGrad)"
        animate={{ d: areaPath }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      />
      <motion.path
        d={curvePath}
        fill="none"
        stroke="oklch(0.78 0.18 192 / 0.3)"
        strokeWidth={10}
        filter="url(#glowStrong)"
        animate={{ d: curvePath }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      />
      <motion.path
        className="eq-curve-path"
        d={curvePath}
        fill="none"
        stroke="oklch(0.84 0.18 192)"
        strokeWidth={2.5}
        strokeLinecap="round"
        filter="url(#glow)"
        animate={{ d: curvePath }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      />
    </svg>
  );
}

// ── 30-Band EQ Fader ──────────────────────────────────────────────────────────
const FADER_H = 160;

function EQFader({
  index,
  band,
  gain,
  onChange,
}: {
  index: number;
  band: { freq: string; label: string };
  gain: number;
  onChange: (i: number, v: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const boostHeight = gain > 0 ? (gain / 12) * (FADER_H / 2) : 0;
  const cutHeight = gain < 0 ? (-gain / 12) * (FADER_H / 2) : 0;
  const thumbY = ((12 - gain) / 24) * FADER_H;
  return (
    <div className="flex flex-col items-center gap-1" style={{ minWidth: 36 }}>
      <span
        className="tabular-nums text-center leading-none"
        style={{
          fontSize: 9,
          fontFamily: "'JetBrains Mono', monospace",
          color:
            gain > 0
              ? "oklch(0.78 0.18 192)"
              : gain < 0
                ? "oklch(0.72 0.22 300)"
                : "oklch(0.45 0.04 220)",
          minWidth: 28,
        }}
      >
        {gain >= 0 ? `+${gain}` : `${gain}`}
      </span>
      <div
        className="relative fader-track"
        style={{ width: 28, height: FADER_H }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 4,
            top: 0,
            bottom: 0,
            background: "oklch(0.16 0.02 265)",
            border: "1px solid oklch(0.22 0.025 265)",
          }}
        />
        {gain > 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              width: 4,
              height: boostHeight,
              bottom: FADER_H / 2,
              background: dragging
                ? "oklch(0.88 0.2 192)"
                : "oklch(0.72 0.2 192 / 0.9)",
              transition: "height 0.1s",
            }}
          />
        )}
        {gain < 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              width: 4,
              height: cutHeight,
              top: FADER_H / 2,
              background: dragging
                ? "oklch(0.78 0.22 300)"
                : "oklch(0.62 0.22 300 / 0.85)",
              transition: "height 0.1s",
            }}
          />
        )}
        <div
          className="absolute left-0 right-0"
          style={{
            top: FADER_H / 2,
            height: 1,
            background: "oklch(0.28 0.03 265 / 0.8)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: thumbY - 9,
            width: 22,
            height: 18,
            borderRadius: 3,
            background: dragging
              ? "linear-gradient(180deg, oklch(0.55 0.06 265), oklch(0.32 0.04 265))"
              : "linear-gradient(180deg, oklch(0.42 0.04 265), oklch(0.24 0.03 265))",
            border: dragging
              ? "1px solid oklch(0.78 0.18 192 / 0.9)"
              : "1px solid oklch(0.35 0.04 265)",
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map((l) => (
            <div
              key={l}
              style={{
                position: "absolute",
                left: 4,
                right: 4,
                top: 4 + l * 4,
                height: 1,
                background: "oklch(0.45 0.03 265 / 0.7)",
                borderRadius: 1,
              }}
            />
          ))}
        </div>
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={gain}
          onChange={(e) => onChange(index, Number(e.target.value))}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onTouchStart={() => setDragging(true)}
          onTouchEnd={() => setDragging(false)}
          data-ocid={`eq.band.slider.${index + 1}`}
          aria-label={`${band.label} Hz gain`}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "ns-resize",
            width: "100%",
            height: "100%",
            writingMode: "vertical-lr" as any,
            direction: "rtl",
          }}
        />
      </div>
      <span
        className="text-center leading-none"
        style={{
          fontSize: 8,
          fontFamily: "'Satoshi', sans-serif",
          color: "oklch(0.40 0.03 220)",
          minWidth: 28,
          whiteSpace: "nowrap",
        }}
      >
        {band.label}
      </span>
    </div>
  );
}

// ── Music Player ──────────────────────────────────────────────────────────────
function MusicPlayer() {
  // ── User tracks (real files) ──────────────────────────────────────
  const [userTracks, setUserTracks] = useState<
    { name: string; url: string; size: string }[]
  >([]);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [freqBars, setFreqBars] = useState<number[]>(Array(32).fill(0));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const isUsingRealTracks = userTracks.length > 0;
  const currentTrack = isUsingRealTracks ? userTracks[trackIdx] : null;

  // ── Clean up object URLs on unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      for (const u of objectUrlsRef.current) URL.revokeObjectURL(u);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Create/wire audio element once ───────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () =>
      setCurrentTime(audio.currentTime),
    );
    audio.addEventListener("durationchange", () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0),
    );
    audio.addEventListener("ended", () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setTrackIdx((prev) => {
          const next = (prev + 1) % Math.max(1, userTracks.length);
          return next;
        });
        setIsPlaying(false);
      }
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Volume sync ───────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ── Repeat sync ───────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = repeat;
  }, [repeat]);

  // ── Load track when index or userTracks changes ───────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: isPlaying intentionally excluded
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isUsingRealTracks) return;
    const track = userTracks[trackIdx];
    if (!track) return;
    audio.pause();
    audio.src = track.url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx, userTracks]);

  // ── Play / pause ─────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isUsingRealTracks) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
      startVisualizer(audio);
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isUsingRealTracks]);

  // ── Visualizer ───────────────────────────────────────────────────
  function startVisualizer(audio: HTMLAudioElement) {
    if (!analyserRef.current) {
      try {
        const ctx = audioCtxRef.current ?? new AudioContext();
        audioCtxRef.current = ctx;
        if (!sourceRef.current) {
          sourceRef.current = ctx.createMediaElementSource(audio);
        }
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        sourceRef.current.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
      } catch {
        // Web Audio unavailable — visuals degraded
      }
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const draw = () => {
      if (!analyserRef.current) return;
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      const bars = Array.from({ length: 32 }, (_, i) => {
        const idx = Math.floor((i / 32) * data.length);
        return data[idx] / 255;
      });
      setFreqBars(bars);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
  }

  function stopVisualizer() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFreqBars(Array(32).fill(0));
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!isPlaying) stopVisualizer();
  }, [isPlaying]);

  // ── File loading ──────────────────────────────────────────────────
  function loadFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("audio/"));
    if (!arr.length) return;
    const newTracks = arr.map((f) => {
      const url = URL.createObjectURL(f);
      objectUrlsRef.current.push(url);
      const kb = f.size / 1024;
      const size =
        kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
      return { name: f.name.replace(/\.[^.]+$/, ""), url, size };
    });
    setUserTracks((prev) => {
      const combined = [...prev, ...newTracks];
      return combined;
    });
    setTrackIdx(userTracks.length); // jump to first new track
    setIsPlaying(false);
  }

  // ── Controls ──────────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (!isUsingRealTracks) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setTrackIdx((i) => (i - 1 + userTracks.length) % userTracks.length);
    setIsPlaying(false);
  }, [isUsingRealTracks, userTracks.length]);

  const handleNext = useCallback(() => {
    if (!isUsingRealTracks) return;
    if (shuffle) {
      let next = trackIdx;
      while (next === trackIdx && userTracks.length > 1)
        next = Math.floor(Math.random() * userTracks.length);
      setTrackIdx(next);
    } else {
      setTrackIdx((i) => (i + 1) % userTracks.length);
    }
    setIsPlaying(false);
  }, [isUsingRealTracks, shuffle, trackIdx, userTracks.length]);

  const handleSeek = useCallback(
    (pct: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = (pct / 100) * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Demo track state (fake progress when no real tracks) ──────────
  const [demoIdx, setDemoIdx] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoTrack = TRACKS[demoIdx];

  useEffect(() => {
    if (demoPlaying && !isUsingRealTracks) {
      demoIntervalRef.current = setInterval(() => {
        setDemoProgress((prev) => {
          if (prev >= 100) {
            setDemoPlaying(false);
            return 0;
          }
          return prev + 100 / demoTrack.totalSec;
        });
      }, 1000);
    } else {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    }
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [demoPlaying, demoTrack.totalSec, isUsingRealTracks]);

  // Fake visualizer for demo mode
  const demoFakeVizRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (demoPlaying && !isUsingRealTracks) {
      demoFakeVizRef.current = setInterval(() => {
        setFreqBars(
          Array.from({ length: 32 }, (_, i) => {
            const bass = i < 6 ? 0.5 + Math.random() * 0.5 : 0;
            const mid = i >= 6 && i < 20 ? 0.2 + Math.random() * 0.6 : 0;
            const hi = i >= 20 ? Math.random() * 0.4 : 0;
            return bass + mid + hi;
          }),
        );
      }, 80);
    } else if (!isPlaying) {
      if (demoFakeVizRef.current) clearInterval(demoFakeVizRef.current);
      setFreqBars(Array(32).fill(0));
    }
    return () => {
      if (demoFakeVizRef.current) clearInterval(demoFakeVizRef.current);
    };
  }, [demoPlaying, isUsingRealTracks, isPlaying]);

  const displayTrackName = isUsingRealTracks
    ? (currentTrack?.name ?? "Unknown")
    : demoTrack.title;
  const displayArtist = isUsingRealTracks ? "Local File" : demoTrack.artist;
  const displayProgress = isUsingRealTracks ? progress : demoProgress;
  const displayElapsed = isUsingRealTracks
    ? currentTime
    : Math.floor((demoProgress / 100) * demoTrack.totalSec);
  const displayDuration = isUsingRealTracks
    ? duration > 0
      ? duration
      : null
    : demoTrack.totalSec;
  const displayPlaying = isUsingRealTracks ? isPlaying : demoPlaying;

  return (
    <section
      className="eng-panel rounded-2xl p-5 flex flex-col gap-5"
      data-ocid="player.section"
    >
      {/* Drop zone */}
      <div
        data-ocid="player.dropzone"
        className="relative rounded-xl flex flex-col items-center justify-center py-6 px-4 transition-all duration-200 cursor-pointer"
        style={{
          border: `2px dashed ${isDragOver ? "oklch(0.78 0.18 192)" : "oklch(0.28 0.04 220)"}`,
          background: isDragOver
            ? "oklch(0.78 0.18 192 / 0.07)"
            : "oklch(0.10 0.016 265)",
          boxShadow: isDragOver
            ? "0 0 20px oklch(0.78 0.18 192 / 0.2)"
            : "none",
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          loadFiles(e.dataTransfer.files);
        }}
        aria-label="Drop audio files or click to browse"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="sr-only"
          data-ocid="player.upload_button"
          aria-label="Load audio files"
          onChange={(e) => {
            if (e.target.files) loadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <motion.div
            animate={{ y: isDragOver ? -4 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <LucideUploadCloud
              size={32}
              style={{
                color: isDragOver
                  ? "oklch(0.78 0.18 192)"
                  : "oklch(0.40 0.04 220)",
              }}
            />
          </motion.div>
          <p
            className="text-sm font-bold tracking-wider text-center"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: isDragOver
                ? "oklch(0.84 0.18 192)"
                : "oklch(0.50 0.04 220)",
            }}
          >
            DROP YOUR TRACKS HERE
          </p>
          <p
            className="text-xs text-center"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.35 0.04 220)",
            }}
          >
            or click to browse · MP3, WAV, FLAC, AAC supported
          </p>
          {isUsingRealTracks && (
            <p
              className="text-xs font-bold"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.72 0.22 145)",
              }}
            >
              {userTracks.length} TRACK{userTracks.length !== 1 ? "S" : ""}{" "}
              LOADED · ADD MORE
            </p>
          )}
        </div>
      </div>

      {/* Main player */}
      <div className="flex gap-5 items-start">
        {/* Album art / waveform display */}
        <div className="flex-shrink-0 flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={isUsingRealTracks ? trackIdx : demoIdx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-xl overflow-hidden flex-shrink-0"
              style={{ width: 100, height: 100 }}
            >
              {isUsingRealTracks ? (
                <div
                  className="w-full h-full flex items-center justify-center rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.14 0.04 265), oklch(0.10 0.02 265))",
                    border: "1px solid oklch(0.22 0.028 265)",
                    boxShadow: displayPlaying
                      ? "0 0 20px oklch(0.78 0.18 192 / 0.4)"
                      : "none",
                    transition: "box-shadow 0.4s",
                  }}
                >
                  <LucideMusic
                    size={32}
                    style={{ color: "oklch(0.78 0.18 192)" }}
                  />
                </div>
              ) : (
                <img
                  src={demoTrack.art}
                  alt={demoTrack.title}
                  className="w-full h-full object-cover rounded-xl"
                  style={{
                    boxShadow: displayPlaying
                      ? "0 0 20px oklch(0.78 0.18 192 / 0.4)"
                      : "none",
                    transition: "box-shadow 0.4s",
                  }}
                />
              )}
              {displayPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: "2px solid oklch(0.78 0.18 192 / 0.6)" }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Track info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${isUsingRealTracks}-${isUsingRealTracks ? trackIdx : demoIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p
                className="font-bold text-base leading-tight truncate"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  color: "oklch(0.94 0.02 200)",
                }}
              >
                {displayTrackName}
              </p>
              <p
                className="text-xs"
                style={{
                  color: isUsingRealTracks
                    ? "oklch(0.55 0.12 192)"
                    : "oklch(0.55 0.04 220)",
                }}
              >
                {displayArtist}
                {!isUsingRealTracks && (
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: "oklch(0.85 0.22 70 / 0.12)",
                      color: "oklch(0.85 0.22 70)",
                      border: "1px solid oklch(0.85 0.22 70 / 0.3)",
                      fontSize: 9,
                    }}
                  >
                    DEMO
                  </span>
                )}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Seek bar */}
          <div className="flex items-center gap-2">
            <span
              className="tabular-nums"
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.50 0.04 220)",
                minWidth: 30,
              }}
            >
              {formatTime(Math.floor(displayElapsed))}
            </span>
            <div
              className="flex-1 relative rounded-full overflow-hidden cursor-pointer"
              style={{ height: 5, background: "oklch(0.18 0.025 265)" }}
              role="slider"
              tabIndex={0}
              aria-valuenow={displayProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Seek"
              data-ocid="player.input"
              onClick={(e) => {
                if (!isUsingRealTracks) return;
                const rect = e.currentTarget.getBoundingClientRect();
                handleSeek(((e.clientX - rect.left) / rect.width) * 100);
              }}
              onKeyDown={(e) => {
                if (!isUsingRealTracks) return;
                if (e.key === "ArrowRight")
                  handleSeek(Math.min(100, displayProgress + 2));
                if (e.key === "ArrowLeft")
                  handleSeek(Math.max(0, displayProgress - 2));
              }}
            >
              <motion.div
                className="absolute left-0 top-0 bottom-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.72 0.18 192), oklch(0.84 0.18 192))",
                  boxShadow: "0 0 8px oklch(0.78 0.18 192 / 0.6)",
                }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
            </div>
            <span
              className="tabular-nums"
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.40 0.03 220)",
                minWidth: 30,
                textAlign: "right",
              }}
            >
              {displayDuration
                ? formatTime(Math.floor(displayDuration))
                : "--:--"}
            </span>
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="player.toggle"
              onClick={() => setShuffle((s) => !s)}
              className="player-ctrl-btn"
              style={{
                color: shuffle
                  ? "oklch(0.78 0.18 192)"
                  : "oklch(0.40 0.03 220)",
              }}
              aria-label="Shuffle"
            >
              <LucideShuffle size={15} />
            </button>
            <button
              type="button"
              data-ocid="player.secondary_button"
              onClick={() => {
                if (isUsingRealTracks) handlePrev();
                else setDemoIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length);
              }}
              className="player-ctrl-btn"
              aria-label="Previous track"
            >
              <LucideChevronFirst size={18} />
            </button>
            <motion.button
              data-ocid="player.primary_button"
              onClick={() => {
                if (isUsingRealTracks) {
                  setIsPlaying((p) => !p);
                } else {
                  setDemoPlaying((p) => !p);
                }
              }}
              className="play-btn"
              style={{ width: 44, height: 44 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label={displayPlaying ? "Pause" : "Play"}
            >
              <AnimatePresence mode="wait">
                {displayPlaying ? (
                  <motion.span
                    key="pause"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LucidePause size={18} fill="currentColor" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="play"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LucidePlay
                      size={18}
                      fill="currentColor"
                      style={{ marginLeft: 2 }}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <button
              type="button"
              data-ocid="player.button"
              onClick={() => {
                if (isUsingRealTracks) handleNext();
                else setDemoIdx((i) => (i + 1) % TRACKS.length);
              }}
              className="player-ctrl-btn"
              aria-label="Next track"
            >
              <LucideChevronLast size={18} />
            </button>
            <button
              type="button"
              data-ocid="player.toggle"
              onClick={() => setRepeat((r) => !r)}
              className="player-ctrl-btn"
              style={{
                color: repeat ? "oklch(0.78 0.18 192)" : "oklch(0.40 0.03 220)",
              }}
              aria-label="Repeat"
            >
              <LucideRepeat size={15} />
            </button>
            {/* Volume */}
            <div
              className="flex items-center gap-1.5 ml-auto"
              style={{ maxWidth: 140 }}
            >
              <LucideVolume2
                size={13}
                style={{ color: "oklch(0.45 0.04 220)", flexShrink: 0 }}
              />
              <div className="flex-1 relative" style={{ height: 4 }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "oklch(0.18 0.025 265)" }}
                />
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{
                    width: `${volume * 100}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.65 0.15 192), oklch(0.78 0.18 192))",
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="volume-slider"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waveform visualizer */}
      <div
        className="flex items-end justify-center gap-0.5 rounded-xl px-3 py-3"
        style={{
          height: 72,
          background: "oklch(0.09 0.015 265)",
          border: "1px solid oklch(0.16 0.022 265)",
        }}
      >
        {freqBars.map((v, i) => (
          <motion.div
            key={String(i)}
            className="flex-1 rounded-sm"
            style={{
              minWidth: 4,
              background:
                v > 0.7
                  ? "oklch(0.85 0.22 70)"
                  : v > 0.4
                    ? "oklch(0.78 0.18 192)"
                    : "oklch(0.55 0.14 192 / 0.8)",
              boxShadow:
                v > 0.5
                  ? `0 0 ${Math.round(v * 8)}px oklch(0.78 0.18 192 / 0.6)`
                  : "none",
            }}
            animate={{ height: `${Math.max(4, v * 100)}%` }}
            transition={{ duration: 0.08, ease: "linear" }}
          />
        ))}
      </div>

      {/* Track queue */}
      {isUsingRealTracks && (
        <div
          className="flex flex-col gap-1"
          style={{ maxHeight: 200, overflowY: "auto" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{
              color: "oklch(0.38 0.03 220)",
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            QUEUE — {userTracks.length} TRACKS
          </p>
          {userTracks.map((t, i) => (
            <button
              type="button"
              key={`${t.name}-${i}`}
              data-ocid={`player.item.${i + 1}`}
              onClick={() => {
                setTrackIdx(i);
                setIsPlaying(false);
              }}
              className="flex items-center gap-3 text-left px-3 py-2 rounded-lg transition-all duration-150"
              style={{
                background:
                  i === trackIdx
                    ? "oklch(0.78 0.18 192 / 0.10)"
                    : "transparent",
                border:
                  i === trackIdx
                    ? "1px solid oklch(0.78 0.18 192 / 0.3)"
                    : "1px solid transparent",
              }}
            >
              <span
                className="tabular-nums text-xs flex-shrink-0"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color:
                    i === trackIdx
                      ? "oklch(0.78 0.18 192)"
                      : "oklch(0.35 0.03 220)",
                  minWidth: 20,
                }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm leading-tight truncate"
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    color:
                      i === trackIdx
                        ? "oklch(0.84 0.18 192)"
                        : "oklch(0.70 0.03 220)",
                    fontWeight: i === trackIdx ? 600 : 400,
                  }}
                >
                  {t.name}
                </p>
              </div>
              <span
                className="text-xs flex-shrink-0"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "oklch(0.38 0.04 220)",
                }}
              >
                {t.size}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Demo tracks when no real files */}
      {!isUsingRealTracks && (
        <div className="flex flex-col gap-1">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{
              color: "oklch(0.38 0.03 220)",
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            DEMO QUEUE · LOAD YOUR OWN MUSIC ABOVE
          </p>
          {TRACKS.map((t, i) => (
            <button
              type="button"
              key={t.title}
              data-ocid={`player.item.${i + 1}`}
              onClick={() => {
                setDemoIdx(i);
                setDemoProgress(0);
                setDemoPlaying(false);
              }}
              className="flex items-center gap-3 text-left px-3 py-2 rounded-lg transition-all duration-150"
              style={{
                background:
                  i === demoIdx ? "oklch(0.78 0.18 192 / 0.08)" : "transparent",
                border:
                  i === demoIdx
                    ? "1px solid oklch(0.78 0.18 192 / 0.2)"
                    : "1px solid transparent",
              }}
            >
              <span
                className="tabular-nums text-xs flex-shrink-0"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color:
                    i === demoIdx
                      ? "oklch(0.78 0.18 192)"
                      : "oklch(0.35 0.03 220)",
                  minWidth: 20,
                }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm leading-tight truncate"
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    color:
                      i === demoIdx
                        ? "oklch(0.82 0.18 192)"
                        : "oklch(0.70 0.03 220)",
                    fontWeight: i === demoIdx ? 600 : 400,
                  }}
                >
                  {t.title}
                </p>
                <p style={{ fontSize: 10, color: "oklch(0.42 0.03 220)" }}>
                  {t.artist} · {t.duration}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="eng-label">{children}</span>
      <div
        className="flex-1 h-px"
        style={{ background: "oklch(0.22 0.025 265)" }}
      />
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // Book intro
  const [bookOpen, setBookOpen] = useState(true);

  // SRS-22
  const [srsVols, setSrsVols] = useState([750, 750, 750]);
  const srsActive = srsVols.every((v) => v > 500);

  // Engines
  const [engineOn, setEngineOn] = useState([true, true, true, true]);
  const [engineAmp, setEngineAmp] = useState([100, 100, 100, 100]);
  const allEnginesOn = engineOn.every(Boolean);

  // Computed master output (0..1)
  const masterOutput = useMemo(() => {
    const activeAmps = engineAmp.map((a, i) => (engineOn[i] ? a : 0));
    const avgAmp = activeAmps.reduce((s, v) => s + v, 0) / 4;
    const srsAvg = srsVols.reduce((s, v) => s + v, 0) / 3;
    return (avgAmp / 120) * (srsAvg / 1500);
  }, [engineAmp, engineOn, srsVols]);

  // EQ gains
  const [baseGains, setBaseGains] = useState<number[]>([...FLAT_30]);
  const [activePreset, setActivePreset] = useState<string>("Flat");
  // DJ switches
  const [djActive, setDjActive] = useState<boolean[]>(Array(8).fill(false));

  // Effective gains = base + DJ effects
  const effectiveGains = useMemo(() => {
    const result = [...baseGains];
    DJ_SWITCH_NAMES.forEach((name, si) => {
      if (djActive[si]) {
        const fx = DJ_EFFECTS[name];
        for (let b = 0; b < 30; b++) {
          result[b] = Math.max(-12, Math.min(12, result[b] + fx[b]));
        }
      }
    });
    return result;
  }, [baseGains, djActive]);

  const handleBandChange = useCallback((index: number, value: number) => {
    setBaseGains((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setActivePreset("Custom");
  }, []);

  const applyPreset = useCallback((name: string) => {
    setBaseGains([...PRESETS_30[name]]);
    setActivePreset(name);
  }, []);

  // Stabilizer
  const [stabilizerPos, setStabilizerPos] = useState(0); // -100 to +100
  const stabilierDragRef = useRef(false);
  const stabilierStartX = useRef(0);
  const stabilierStartVal = useRef(0);

  // Subtly react to master output
  useEffect(() => {
    const offset = (masterOutput - 0.5) * 40;
    setStabilizerPos((prev) => {
      const target = Math.max(-100, Math.min(100, prev * 0.9 + offset * 0.1));
      return Math.round(target * 10) / 10;
    });
  }, [masterOutput]);

  const harmonicPct = Math.round(100 - Math.abs(stabilizerPos) * 0.3);
  const zeroCentered = Math.abs(stabilizerPos) <= 5;

  // Monitor
  const [harmonicCorrection, setHarmonicCorrection] = useState(85);
  const [vuInput, setVuInput] = useState(60);
  const [vuOutput, setVuOutput] = useState(55);

  useEffect(() => {
    const id = setInterval(() => {
      const base = masterOutput * 80;
      setVuInput(Math.min(100, base + (Math.random() - 0.5) * 20));
      setVuOutput(
        Math.min(
          100,
          base * (harmonicCorrection / 100) * (1 + masterOutput * 0.2) +
            (Math.random() - 0.5) * 15,
        ),
      );
    }, 200);
    return () => clearInterval(id);
  }, [masterOutput, harmonicCorrection]);

  // Room Magnet
  const [roomSize, setRoomSize] = useState(25);
  const magnetStrength = Math.round((roomSize / 50) * 80000);

  // Blockchain
  const [blockHash, setBlockHash] = useState("0x4a7f2c8d9e1b3a5c");
  useEffect(() => {
    const id = setInterval(() => {
      setBlockHash(`0x${Math.random().toString(16).slice(2, 18)}`);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const moduleStates = {
    "SRS-22": srsActive,
    "Engine 1": engineOn[0],
    "Engine 2": engineOn[1],
    "Engine 3": engineOn[2],
    "Engine 4": engineOn[3],
    EQ: activePreset !== "Custom",
    Stabilizer: zeroCentered,
    Monitor: harmonicCorrection > 80,
    Room: roomSize > 10,
  };
  const moduleNames = Object.keys(moduleStates);

  const currentYear = new Date().getFullYear();

  // Stabilizer drag handlers
  const handleStabDragStart = (clientX: number) => {
    stabilierDragRef.current = true;
    stabilierStartX.current = clientX;
    stabilierStartVal.current = stabilizerPos;
  };
  const handleStabDragMove = useCallback((clientX: number) => {
    if (!stabilierDragRef.current) return;
    const delta = clientX - stabilierStartX.current;
    const newVal = Math.max(
      -100,
      Math.min(100, stabilierStartVal.current + delta * 0.8),
    );
    setStabilizerPos(Math.round(newVal * 10) / 10);
  }, []);
  const handleStabDragEnd = useCallback(() => {
    stabilierDragRef.current = false;
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => handleStabDragMove(e.clientX);
    const onTouch = (e: TouchEvent) => handleStabDragMove(e.touches[0].clientX);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", handleStabDragEnd);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("touchend", handleStabDragEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", handleStabDragEnd);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", handleStabDragEnd);
    };
  }, [handleStabDragMove, handleStabDragEnd]);

  // Stabilizer SVG arc math
  const stabAngle = (stabilizerPos / 100) * 135; // ±135°
  const cx = 120;
  const cy = 120;
  const r = 90;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcStart = -135; // degrees from 12 o'clock
  const arcEnd = 135;
  const pointerAngle = 90 + stabAngle; // SVG coords: 0° = right
  const px =
    cx + r * Math.cos(toRad(arcStart + ((stabAngle + 135) / 270) * 270));
  const py =
    cy + r * Math.sin(toRad(arcStart + ((stabAngle + 135) / 270) * 270));
  const arcX1 = cx + r * Math.cos(toRad(arcStart));
  const arcY1 = cy + r * Math.sin(toRad(arcStart));
  const arcX2 = cx + r * Math.cos(toRad(arcEnd));
  const arcY2 = cy + r * Math.sin(toRad(arcEnd));
  // Needle tip
  const needleX = cx + 80 * Math.cos(toRad(pointerAngle - 90));
  const needleY = cy + 80 * Math.sin(toRad(pointerAngle - 90));

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ background: "oklch(0.07 0.015 265)" }}
    >
      {/* ── Book Intro ── */}
      <AnimatePresence>
        {bookOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            data-ocid="book.intro.panel"
            style={{ perspective: "1200px" }}
          >
            {/* Left page */}
            <motion.div
              className="absolute inset-y-0 left-0 right-1/2 flex items-center justify-end pr-8"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.08 0.02 265), oklch(0.12 0.025 265))",
                transformOrigin: "right center",
                zIndex: 2,
                borderRight: "2px solid oklch(0.85 0.22 70 / 0.4)",
              }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -100 }}
              transition={{ delay: 0.3, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="text-right select-none"
                style={{ userSelect: "none" }}
              >
                <div
                  className="text-8xl font-black tracking-tighter"
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    color: "oklch(0.85 0.22 70)",
                    textShadow: "0 0 40px oklch(0.85 0.22 70 / 0.5)",
                  }}
                >
                  GERROD
                </div>
                <div
                  className="text-2xl tracking-widest mt-2"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.65 0.05 220)",
                  }}
                >
                  ENGINEER | PRODUCT 2
                </div>
                <div
                  className="text-5xl font-black mt-4"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.85 0.22 70)",
                    textShadow: "0 0 30px oklch(0.85 0.22 70 / 0.6)",
                  }}
                >
                  80,000W
                </div>
              </div>
            </motion.div>
            {/* Right page */}
            <motion.div
              className="absolute inset-y-0 left-1/2 right-0"
              style={{
                background:
                  "linear-gradient(225deg, oklch(0.08 0.02 265), oklch(0.12 0.025 265))",
                transformOrigin: "left center",
                zIndex: 2,
                borderLeft: "2px solid oklch(0.85 0.22 70 / 0.4)",
              }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 100 }}
              transition={{ delay: 0.3, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />
            {/* Skip button */}
            <motion.button
              type="button"
              data-ocid="book.intro.button"
              className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-sm z-10"
              style={{
                background: "oklch(0.78 0.18 192 / 0.15)",
                border: "1px solid oklch(0.78 0.18 192 / 0.4)",
                color: "oklch(0.78 0.18 192)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setBookOpen(false)}
            >
              SKIP INTRO
            </motion.button>
            {/* Auto-dismiss */}
            {setTimeout(() => setBookOpen(false), 2800) && null}
          </div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b gap-2"
        style={{
          borderColor: "oklch(0.18 0.025 265)",
          background: "oklch(0.08 0.016 265)",
        }}
      >
        <div>
          <h1
            className="text-2xl font-black tracking-widest uppercase"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              color: "oklch(0.92 0.03 200)",
            }}
          >
            <span style={{ color: "oklch(0.85 0.22 70)" }}>GERROD</span>
            <span style={{ color: "oklch(0.35 0.04 220)" }}> | </span>
            <span>ENGINEER</span>
            <span style={{ color: "oklch(0.35 0.04 220)" }}> | </span>
            <span style={{ color: "oklch(0.78 0.18 192)" }}>PRODUCT 2</span>
          </h1>
          <p
            className="text-xs tracking-widest mt-0.5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.45 0.04 220)",
            }}
          >
            80,000 WATTS · 4 SOUND ENGINES · SRS-22 SMART CHIP
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: "oklch(0.12 0.02 160 / 0.8)",
            border: "1px solid oklch(0.6 0.18 160 / 0.4)",
          }}
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "oklch(0.72 0.22 145)" }}
            animate={{
              opacity: [1, 0.3, 1],
              boxShadow: [
                "0 0 6px oklch(0.72 0.22 145)",
                "0 0 12px oklch(0.82 0.22 145)",
                "0 0 6px oklch(0.72 0.22 145)",
              ],
            }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.4 }}
          />
          <span
            className="text-xs font-bold tracking-widest"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.78 0.18 145)",
            }}
          >
            CHAIN VERIFIED
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 md:px-6 py-5 gap-6 max-w-screen-2xl mx-auto w-full">
        {/* ── SRS-22 SMART CHIP ── */}
        <section className="eng-panel rounded-2xl p-5" data-ocid="srs22.panel">
          <SectionLabel>
            SRS-22 SMART CHIP · 3-CHANNEL VOLUME · BOOSTER UP TO 1500W
          </SectionLabel>
          {srsActive && (
            <motion.div
              className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg w-fit"
              style={{
                background: "oklch(0.78 0.18 192 / 0.12)",
                border: "1px solid oklch(0.78 0.18 192 / 0.4)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: "oklch(0.78 0.18 192)" }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
              />
              <span
                className="text-xs font-bold tracking-widest"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "oklch(0.78 0.18 192)",
                }}
              >
                SRS-22 ACTIVE
              </span>
            </motion.div>
          )}
          <div className="flex gap-6 flex-wrap">
            {["VOL 1", "VOL 2", "VOL 3"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <span
                  className="text-xs font-bold tracking-widest"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.85 0.22 70)",
                  }}
                >
                  {label}
                </span>
                <div className="relative" style={{ width: 40, height: 180 }}>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      width: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "oklch(0.14 0.02 265)",
                      border: "1px solid oklch(0.22 0.025 265)",
                    }}
                  />
                  <div
                    className="absolute rounded-sm"
                    style={{
                      width: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      bottom: 0,
                      height: `${(srsVols[i] / 1500) * 100}%`,
                      background:
                        srsVols[i] > 1000
                          ? "oklch(0.85 0.22 70)"
                          : "oklch(0.72 0.18 192)",
                      boxShadow: `0 0 8px ${srsVols[i] > 1000 ? "oklch(0.85 0.22 70 / 0.6)" : "oklch(0.72 0.18 192 / 0.4)"}`,
                      transition: "height 0.1s, background 0.2s",
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1500}
                    step={10}
                    value={srsVols[i]}
                    onChange={(e) =>
                      setSrsVols((prev) => {
                        const n = [...prev];
                        n[i] = Number(e.target.value);
                        return n;
                      })
                    }
                    data-ocid="srs22.input"
                    aria-label={`${label} watts`}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "ns-resize",
                      width: "100%",
                      height: "100%",
                      writingMode: "vertical-lr" as any,
                      direction: "rtl",
                    }}
                  />
                </div>
                <span
                  className="tabular-nums text-xs font-bold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.85 0.22 70)",
                  }}
                >
                  {srsVols[i]}W
                </span>
                <button
                  type="button"
                  data-ocid="srs22.button"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all"
                  style={{
                    background: "oklch(0.85 0.22 70 / 0.12)",
                    border: "1px solid oklch(0.85 0.22 70 / 0.4)",
                    color: "oklch(0.85 0.22 70)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onClick={() =>
                    setSrsVols((prev) => {
                      const n = [...prev];
                      n[i] = Math.min(1500, n[i] + 300);
                      return n;
                    })
                  }
                >
                  +300W BOOST
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4 SOUND ENGINES ── */}
        <section className="eng-panel rounded-2xl p-5" data-ocid="engine.panel">
          <SectionLabel>
            4 SOUND ENGINES · 120W AMP EACH · GENERATOR CONNECTED
          </SectionLabel>
          {allEnginesOn && (
            <motion.div
              className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg w-fit"
              style={{
                background: "oklch(0.72 0.22 145 / 0.12)",
                border: "1px solid oklch(0.72 0.22 145 / 0.4)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <LucideZap size={12} style={{ color: "oklch(0.78 0.18 145)" }} />
              <span
                className="text-xs font-bold tracking-widest"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "oklch(0.78 0.18 145)",
                }}
              >
                GENERATOR CONNECTED · ALL ENGINES ONLINE
              </span>
            </motion.div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="rounded-xl p-4 flex flex-col gap-3"
                animate={{ opacity: engineOn[i] ? 1 : 0.4 }}
                style={{
                  background: engineOn[i]
                    ? "oklch(0.12 0.02 265)"
                    : "oklch(0.09 0.01 265)",
                  border: `1px solid ${engineOn[i] ? "oklch(0.78 0.18 192 / 0.35)" : "oklch(0.18 0.02 265)"}`,
                  boxShadow: engineOn[i]
                    ? "0 0 20px oklch(0.78 0.18 192 / 0.1)"
                    : "none",
                  transition: "all 0.3s",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-black tracking-widest"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      color: engineOn[i]
                        ? "oklch(0.90 0.03 200)"
                        : "oklch(0.40 0.02 220)",
                    }}
                  >
                    ENGINE {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: engineOn[i]
                          ? "oklch(0.72 0.22 145)"
                          : "oklch(0.55 0.22 25)",
                      }}
                      animate={{
                        boxShadow: engineOn[i]
                          ? [
                              "0 0 4px oklch(0.72 0.22 145)",
                              "0 0 10px oklch(0.82 0.22 145)",
                              "0 0 4px oklch(0.72 0.22 145)",
                            ]
                          : ["none"],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.2,
                      }}
                    />
                    <button
                      type="button"
                      data-ocid={`engine.toggle.${i + 1}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: engineOn[i]
                          ? "oklch(0.72 0.22 145 / 0.15)"
                          : "oklch(0.55 0.22 25 / 0.15)",
                        border: `1px solid ${engineOn[i] ? "oklch(0.72 0.22 145 / 0.5)" : "oklch(0.55 0.22 25 / 0.5)"}`,
                        color: engineOn[i]
                          ? "oklch(0.78 0.18 145)"
                          : "oklch(0.65 0.22 25)",
                      }}
                      onClick={() =>
                        setEngineOn((prev) => {
                          const n = [...prev];
                          n[i] = !n[i];
                          return n;
                        })
                      }
                      aria-label={`Toggle Engine ${i + 1}`}
                    >
                      <LucidePower size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "oklch(0.45 0.04 220)",
                      }}
                    >
                      AMP
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: engineOn[i]
                          ? "oklch(0.85 0.22 70)"
                          : "oklch(0.40 0.03 220)",
                      }}
                    >
                      {engineAmp[i]}W
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    step={1}
                    value={engineAmp[i]}
                    onChange={(e) =>
                      setEngineAmp((prev) => {
                        const n = [...prev];
                        n[i] = Number(e.target.value);
                        return n;
                      })
                    }
                    disabled={!engineOn[i]}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-30"
                    style={{ accentColor: "oklch(0.78 0.18 192)" }}
                    aria-label={`Engine ${i + 1} AMP level`}
                  />
                </div>
                <div
                  className="text-xs text-center py-1 rounded"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: engineOn[i]
                      ? "oklch(0.78 0.18 192 / 0.08)"
                      : "transparent",
                    color: engineOn[i]
                      ? "oklch(0.78 0.18 192)"
                      : "oklch(0.35 0.03 220)",
                    border: "1px solid transparent",
                  }}
                >
                  {engineOn[i] ? "ONLINE" : "OFF"}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="text-xs"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.45 0.04 220)",
              }}
            >
              MASTER OUTPUT
            </span>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: "oklch(0.14 0.02 265)", maxWidth: 300 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.72 0.18 192), oklch(0.85 0.22 70))",
                }}
                animate={{ width: `${masterOutput * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <span
              className="text-xs font-bold"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.85 0.22 70)",
              }}
            >
              {Math.round(masterOutput * 100)}%
            </span>
          </div>
        </section>

        {/* ── Music Player ── */}
        <MusicPlayer />

        {/* ── EQ Curve ── */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.10 0.018 265)",
            border: "1px solid oklch(0.18 0.025 265)",
            boxShadow: "inset 0 1px 0 oklch(0.25 0.03 265 / 0.3)",
          }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{
                color: "oklch(0.40 0.04 220)",
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              FREQUENCY RESPONSE · ZERO DISTORTION EQ
            </span>
          </div>
          <div style={{ height: 160 }}>
            <EQCurve gains={effectiveGains} />
          </div>
        </section>

        {/* ── 30-Band EQ ── */}
        <section
          className="rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.115 0.02 265) 0%, oklch(0.095 0.016 265) 100%)",
            border: "1px solid oklch(0.20 0.025 265)",
            boxShadow: "inset 0 1px 0 oklch(0.28 0.035 265 / 0.4)",
          }}
          data-ocid="eq.panel"
        >
          <div
            className="flex items-center justify-between px-5 pt-4 pb-3"
            style={{ borderBottom: "1px solid oklch(0.18 0.025 265)" }}
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{
                color: "oklch(0.42 0.04 220)",
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              GRAPHIC EQUALIZER · 30 BAND · EQ STABILIZER
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={activePreset}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-xs font-medium"
                style={{
                  color: "oklch(0.78 0.18 192)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {activePreset}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex">
            <div
              className="flex-shrink-0 flex flex-col justify-between py-6 px-2"
              style={{ paddingTop: 28, paddingBottom: 28 }}
            >
              {["+12", "+6", "0", "-6", "-12"].map((v) => (
                <span
                  key={v}
                  style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    color:
                      v === "0"
                        ? "oklch(0.45 0.04 220)"
                        : "oklch(0.32 0.03 220)",
                    lineHeight: 1,
                    textAlign: "right",
                    minWidth: 22,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
            <div
              className="flex-1 overflow-x-auto pb-4 pt-2 px-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "oklch(0.22 0.025 265) transparent",
              }}
            >
              <div className="flex gap-0.5" style={{ minWidth: "max-content" }}>
                {BANDS_30.map((band, i) => (
                  <EQFader
                    key={band.freq}
                    index={i}
                    band={band}
                    gain={effectiveGains[i]}
                    onChange={handleBandChange}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Presets */}
        <section
          className="flex flex-wrap items-center gap-2"
          data-ocid="eq.preset.panel"
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase mr-1"
            style={{
              color: "oklch(0.38 0.03 220)",
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            PRESETS
          </span>
          {PRESET_NAMES.map((name, i) => (
            <motion.button
              key={name}
              data-ocid={`eq.preset.button.${i + 1}`}
              onClick={() => applyPreset(name)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background:
                  activePreset === name
                    ? "oklch(0.78 0.18 192 / 0.12)"
                    : "oklch(0.13 0.02 265)",
                border:
                  activePreset === name
                    ? "1px solid oklch(0.78 0.18 192 / 0.5)"
                    : "1px solid oklch(0.20 0.025 265)",
                color:
                  activePreset === name
                    ? "oklch(0.84 0.18 192)"
                    : "oklch(0.55 0.04 220)",
                boxShadow:
                  activePreset === name
                    ? "0 0 14px oklch(0.78 0.18 192 / 0.3)"
                    : "none",
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              {name}
            </motion.button>
          ))}
          <div className="flex-1" />
          <motion.button
            data-ocid="eq.button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => applyPreset("Flat")}
            className="px-5 py-1.5 rounded-full text-sm transition-all duration-200"
            style={{
              background: "oklch(0.13 0.02 265)",
              border: "1px solid oklch(0.22 0.025 265)",
              color: "oklch(0.50 0.04 220)",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            RESET
          </motion.button>
        </section>

        {/* ── Stabilizer & Epicenter ── */}
        <section
          className="eng-panel rounded-2xl p-5"
          data-ocid="stabilizer.panel"
        >
          <SectionLabel>
            80,000W STABILIZER · ZERO-CENTER EPICENTER GAUGE
          </SectionLabel>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* SVG Gauge */}
            <div
              className="relative flex-shrink-0"
              style={{ width: 240, height: 220 }}
            >
              <svg
                viewBox="0 0 240 220"
                width={240}
                height={220}
                data-ocid="stabilizer.canvas_target"
                role="img"
                aria-label="Stabilizer epicenter gauge"
                style={{ cursor: "ew-resize", userSelect: "none" }}
                onMouseDown={(e) => handleStabDragStart(e.clientX)}
                onTouchStart={(e) => handleStabDragStart(e.touches[0].clientX)}
              >
                <defs>
                  <filter id="stabGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Background arc */}
                <path
                  d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 1 1 ${arcX2} ${arcY2}`}
                  fill="none"
                  stroke="oklch(0.18 0.025 265)"
                  strokeWidth={14}
                  strokeLinecap="round"
                />
                {/* Active arc */}
                <motion.path
                  d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${Math.abs(stabAngle) > 90 ? 1 : 0} ${stabAngle >= 0 ? 1 : 0} ${px} ${py}`}
                  fill="none"
                  stroke={
                    Math.abs(stabilizerPos) <= 5
                      ? "oklch(0.72 0.22 145)"
                      : "oklch(0.78 0.18 192)"
                  }
                  strokeWidth={8}
                  strokeLinecap="round"
                  filter="url(#stabGlow)"
                  animate={{
                    stroke:
                      Math.abs(stabilizerPos) <= 5
                        ? "oklch(0.72 0.22 145)"
                        : "oklch(0.78 0.18 192)",
                  }}
                />
                {/* Tick marks */}
                {[-100, -75, -50, -25, 0, 25, 50, 75, 100].map((v) => {
                  const a = ((v + 100) / 200) * 270 - 135;
                  const ir = r - 12;
                  const or = r + 4;
                  const x1 = cx + ir * Math.cos(toRad(a));
                  const y1 = cy + ir * Math.sin(toRad(a));
                  const x2 = cx + or * Math.cos(toRad(a));
                  const y2 = cy + or * Math.sin(toRad(a));
                  return (
                    <line
                      key={v}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={
                        v === 0
                          ? "oklch(0.72 0.22 145)"
                          : "oklch(0.28 0.03 265)"
                      }
                      strokeWidth={v === 0 ? 2 : 1}
                    />
                  );
                })}
                {/* Needle */}
                <motion.line
                  x1={cx}
                  y1={cy}
                  x2={needleX}
                  y2={needleY}
                  stroke="oklch(0.85 0.22 70)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  filter="url(#stabGlow)"
                  animate={{ x2: needleX, y2: needleY }}
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                />
                <circle cx={cx} cy={cy} r={6} fill="oklch(0.85 0.22 70)" />
                {/* Labels */}
                <text
                  x={35}
                  y={195}
                  fill="oklch(0.35 0.03 220)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  -100
                </text>
                <text
                  x={205}
                  y={195}
                  fill="oklch(0.35 0.03 220)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  +100
                </text>
                <text
                  x={cx}
                  y={210}
                  fill="oklch(0.85 0.22 70)"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  0
                </text>
              </svg>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div
                  className="text-xs mb-1"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.45 0.04 220)",
                  }}
                >
                  POSITION
                </div>
                <div
                  className="text-3xl font-black tabular-nums"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color:
                      stabilizerPos >= 0
                        ? "oklch(0.85 0.22 70)"
                        : "oklch(0.78 0.18 192)",
                  }}
                >
                  {stabilizerPos >= 0 ? "+" : ""}
                  {stabilizerPos.toFixed(1)}
                </div>
              </div>
              <div>
                <div
                  className="text-xs mb-1"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.45 0.04 220)",
                  }}
                >
                  HARMONIC SIGNAL
                </div>
                <div
                  className="text-2xl font-black"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.78 0.18 192)",
                  }}
                >
                  {harmonicPct}%
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: zeroCentered
                      ? "oklch(0.72 0.22 145)"
                      : "oklch(0.55 0.22 25)",
                  }}
                  animate={{
                    boxShadow: zeroCentered
                      ? [
                          "0 0 4px oklch(0.72 0.22 145)",
                          "0 0 12px oklch(0.82 0.22 145)",
                          "0 0 4px oklch(0.72 0.22 145)",
                        ]
                      : ["none"],
                  }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                />
                <span
                  className="text-xs font-bold tracking-wider"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: zeroCentered
                      ? "oklch(0.72 0.22 145)"
                      : "oklch(0.55 0.04 220)",
                  }}
                >
                  {zeroCentered ? "ZERO CENTER ✓" : "OFF CENTER"}
                </span>
              </div>
              <p
                className="text-xs"
                style={{
                  color: "oklch(0.38 0.03 220)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                ← DRAG GAUGE TO ADJUST →
              </p>
            </div>
          </div>
        </section>

        {/* ── Monitor / Compressor ── */}
        <section
          className="eng-panel rounded-2xl p-5"
          data-ocid="monitor.panel"
        >
          <SectionLabel>
            MONITOR COMMANDER · 100% HARMONIC SIGNAL CORRECTION · NOISE FLOOR
            ZERO
          </SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              {/* Input VU */}
              <div>
                <div className="flex justify-between mb-1">
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.45 0.04 220)",
                    }}
                  >
                    INPUT LEVEL
                  </span>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.78 0.18 192)",
                    }}
                  >
                    {Math.round(vuInput)}%
                  </span>
                </div>
                <div
                  className="relative h-5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.14 0.02 265)" }}
                >
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.72 0.18 192), oklch(0.85 0.18 145) 70%, oklch(0.65 0.22 25) 90%)",
                    }}
                    animate={{ width: `${Math.min(100, vuInput)}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
              {/* Output VU */}
              <div>
                <div className="flex justify-between mb-1">
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.45 0.04 220)",
                    }}
                  >
                    OUTPUT LEVEL
                  </span>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.85 0.22 70)",
                    }}
                  >
                    {Math.round(vuOutput)}%
                  </span>
                </div>
                <div
                  className="relative h-5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.14 0.02 265)" }}
                >
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.72 0.22 145), oklch(0.85 0.22 70) 70%, oklch(0.65 0.22 25) 90%)",
                    }}
                    animate={{ width: `${Math.min(100, vuOutput)}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {/* Harmonic Correction Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.45 0.04 220)",
                    }}
                  >
                    HARMONIC CORRECTION
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.78 0.18 192)",
                    }}
                  >
                    {harmonicCorrection}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={harmonicCorrection}
                  onChange={(e) =>
                    setHarmonicCorrection(Number(e.target.value))
                  }
                  data-ocid="monitor.input"
                  aria-label="Harmonic correction"
                  className="w-full"
                  style={{ accentColor: "oklch(0.78 0.18 192)" }}
                />
              </div>
              {/* Noise floor */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background:
                    harmonicCorrection > 80
                      ? "oklch(0.72 0.22 145 / 0.1)"
                      : "oklch(0.14 0.02 265)",
                  border: `1px solid ${harmonicCorrection > 80 ? "oklch(0.72 0.22 145 / 0.4)" : "oklch(0.20 0.025 265)"}`,
                  transition: "all 0.3s",
                }}
              >
                <LucideActivity
                  size={16}
                  style={{
                    color:
                      harmonicCorrection > 80
                        ? "oklch(0.72 0.22 145)"
                        : "oklch(0.40 0.04 220)",
                  }}
                />
                <div>
                  <div
                    className="text-xs"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.45 0.04 220)",
                    }}
                  >
                    NOISE FLOOR
                  </div>
                  <div
                    className="text-lg font-black"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color:
                        harmonicCorrection > 80
                          ? "oklch(0.72 0.22 145)"
                          : "oklch(0.55 0.04 220)",
                    }}
                  >
                    {harmonicCorrection > 80
                      ? "ZERO"
                      : `${Math.round((100 - harmonicCorrection) * 0.5)}dB`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Room Magnet ── */}
        <section className="eng-panel rounded-2xl p-5" data-ocid="room.panel">
          <SectionLabel>
            VIRTUAL SOUND FIELD · ROOM MAGNET · CENTERED RADIUS
          </SectionLabel>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Concentric circles */}
            <div
              className="relative flex-shrink-0"
              style={{ width: 200, height: 200 }}
            >
              <svg
                viewBox="0 0 200 200"
                width={200}
                height={200}
                role="img"
                aria-label="Room sound field visualization"
              >
                {[1, 2, 3, 4, 5].map((ring) => {
                  const maxR = 85;
                  const ringR = (ring / 5) * maxR * (roomSize / 50);
                  const active = ring <= Math.ceil((roomSize / 50) * 5);
                  return (
                    <motion.circle
                      key={ring}
                      cx={100}
                      cy={100}
                      r={ringR}
                      fill="none"
                      stroke={
                        active
                          ? "oklch(0.78 0.18 192)"
                          : "oklch(0.18 0.025 265)"
                      }
                      strokeWidth={active ? 1.5 : 0.5}
                      animate={{
                        r: ringR,
                        stroke: active
                          ? "oklch(0.78 0.18 192)"
                          : "oklch(0.18 0.025 265)",
                        opacity: active ? 1 - ring * 0.12 : 0.2,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      }}
                    />
                  );
                })}
                <circle
                  cx={100}
                  cy={100}
                  r={6}
                  fill="oklch(0.78 0.18 192)"
                  style={{
                    filter: "drop-shadow(0 0 6px oklch(0.78 0.18 192))",
                  }}
                />
                <text
                  x={100}
                  y={190}
                  fill="oklch(0.45 0.04 220)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                >
                  CENTERED · {roomSize}FT
                </text>
              </svg>
            </div>
            <div
              className="flex-1 flex flex-col gap-4"
              style={{ maxWidth: 320 }}
            >
              <div>
                <div className="flex justify-between mb-2">
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.45 0.04 220)",
                    }}
                  >
                    ROOM SIZE
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.78 0.18 192)",
                    }}
                  >
                    {roomSize} FT
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={roomSize}
                  onChange={(e) => setRoomSize(Number(e.target.value))}
                  data-ocid="room.input"
                  aria-label="Room size in feet"
                  className="w-full"
                  style={{ accentColor: "oklch(0.78 0.18 192)" }}
                />
                <div className="flex justify-between mt-1">
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.32 0.03 220)",
                    }}
                  >
                    0 FT
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "oklch(0.32 0.03 220)",
                    }}
                  >
                    50 FT
                  </span>
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "oklch(0.12 0.02 265)",
                  border: "1px solid oklch(0.20 0.025 265)",
                }}
              >
                <div
                  className="text-xs mb-1"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.45 0.04 220)",
                  }}
                >
                  MAGNET STRENGTH
                </div>
                <div
                  className="text-2xl font-black"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.85 0.22 70)",
                  }}
                >
                  {magnetStrength.toLocaleString()}W
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Blockchain Panel ── */}
        <section
          className="eng-panel rounded-2xl p-5"
          data-ocid="blockchain.panel"
        >
          <SectionLabel>CHAIN BLOCK · ALL CONNECTED · VERIFIED</SectionLabel>
          <div className="flex flex-wrap gap-3 mb-4">
            {moduleNames.map((name, i) => {
              const active = moduleStates[name as keyof typeof moduleStates];
              return (
                <div key={name} className="flex items-center gap-1.5">
                  <motion.div
                    className="flex items-center gap-1 px-3 py-2 rounded-lg"
                    style={{
                      background: active
                        ? "oklch(0.78 0.18 192 / 0.1)"
                        : "oklch(0.12 0.015 265)",
                      border: `1px solid ${active ? "oklch(0.78 0.18 192 / 0.4)" : "oklch(0.18 0.02 265)"}`,
                      transition: "all 0.3s",
                    }}
                    animate={{
                      boxShadow: active
                        ? [
                            "0 0 6px oklch(0.78 0.18 192 / 0.3)",
                            "0 0 12px oklch(0.78 0.18 192 / 0.5)",
                            "0 0 6px oklch(0.78 0.18 192 / 0.3)",
                          ]
                        : ["none"],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      delay: i * 0.15,
                    }}
                  >
                    <LucideLink
                      size={10}
                      style={{
                        color: active
                          ? "oklch(0.78 0.18 192)"
                          : "oklch(0.30 0.03 220)",
                      }}
                    />
                    <span
                      className="text-xs font-bold"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: active
                          ? "oklch(0.78 0.18 192)"
                          : "oklch(0.35 0.03 220)",
                      }}
                    >
                      {name.toUpperCase()}
                    </span>
                  </motion.div>
                  {i < moduleNames.length - 1 && (
                    <span
                      style={{
                        color: active
                          ? "oklch(0.78 0.18 192 / 0.5)"
                          : "oklch(0.22 0.02 265)",
                      }}
                    >
                      ⛓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: "oklch(0.12 0.02 265)",
              border: "1px solid oklch(0.20 0.025 265)",
            }}
          >
            <LucideRadio size={14} style={{ color: "oklch(0.72 0.22 145)" }} />
            <div>
              <div
                className="text-xs"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "oklch(0.42 0.04 220)",
                }}
              >
                BLOCK HASH
              </div>
              <motion.div
                className="text-sm font-black"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "oklch(0.72 0.22 145)",
                }}
                key={blockHash}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
              >
                {blockHash}
              </motion.div>
            </div>
            <div
              className="ml-auto text-xs"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(0.38 0.04 220)",
              }}
            >
              UPDATES EVERY 5s
            </div>
          </div>
        </section>

        {/* ── DJ Studio ── */}
        <section
          className="eng-panel rounded-2xl p-5"
          data-ocid="djstudio.panel"
        >
          <SectionLabel>
            DJ STUDIO · CONTROL PANEL · 8 EFFECT SWITCHES
          </SectionLabel>
          <div className="grid grid-cols-4 gap-3">
            {DJ_SWITCH_NAMES.map((name, i) => (
              <motion.button
                key={name}
                type="button"
                data-ocid={`djstudio.toggle.${i + 1}`}
                className="py-4 px-3 rounded-xl font-black text-sm tracking-widest transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: djActive[i]
                    ? "oklch(0.78 0.18 192 / 0.15)"
                    : "oklch(0.12 0.018 265)",
                  border: `1px solid ${djActive[i] ? "oklch(0.78 0.18 192 / 0.6)" : "oklch(0.20 0.025 265)"}`,
                  color: djActive[i]
                    ? "oklch(0.84 0.18 192)"
                    : "oklch(0.42 0.04 220)",
                  boxShadow: djActive[i]
                    ? "0 0 16px oklch(0.78 0.18 192 / 0.4), inset 0 1px 0 oklch(0.78 0.18 192 / 0.2)"
                    : "inset 0 1px 0 oklch(0.25 0.03 265 / 0.3)",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setDjActive((prev) => {
                    const n = [...prev];
                    n[i] = !n[i];
                    return n;
                  })
                }
                aria-pressed={djActive[i]}
                aria-label={`${name} effect`}
              >
                {name}
              </motion.button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {DJ_SWITCH_NAMES.filter((_, i) => djActive[i]).map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: "oklch(0.78 0.18 192 / 0.1)",
                  border: "1px solid oklch(0.78 0.18 192 / 0.3)",
                  color: "oklch(0.78 0.18 192)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {name} ON
              </span>
            ))}
            {!djActive.some(Boolean) && (
              <span
                className="text-xs"
                style={{
                  color: "oklch(0.35 0.03 220)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                NO EFFECTS ACTIVE
              </span>
            )}
          </div>
        </section>
      </main>

      <footer
        className="py-4 px-6 text-center border-t"
        style={{ borderColor: "oklch(0.15 0.02 265)" }}
      >
        <p className="text-xs" style={{ color: "oklch(0.35 0.03 220)" }}>
          © {currentYear}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "oklch(0.55 0.1 192)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
