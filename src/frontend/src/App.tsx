import {
  LucideChevronFirst,
  LucideChevronLast,
  LucidePause,
  LucidePlay,
  LucideRepeat,
  LucideShuffle,
  LucideVolume2,
  LucideWaves,
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
  const pct = ((gain + 12) / 24) * 100; // 0..100, 50 = center

  const boostHeight = gain > 0 ? (gain / 12) * (FADER_H / 2) : 0;
  const cutHeight = gain < 0 ? (-gain / 12) * (FADER_H / 2) : 0;
  const thumbY = ((12 - gain) / 24) * FADER_H;

  return (
    <div className="flex flex-col items-center gap-1" style={{ minWidth: 36 }}>
      {/* dB value */}
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

      {/* Fader track + thumb */}
      <div
        className="relative fader-track"
        style={{ width: 28, height: FADER_H }}
      >
        {/* Track rail */}
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

        {/* Boost fill (teal, above center) */}
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
              boxShadow: dragging ? "0 0 8px oklch(0.78 0.18 192)" : "none",
              transition: "height 0.1s, background 0.15s",
            }}
          />
        )}

        {/* Cut fill (purple, below center) */}
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
              boxShadow: dragging ? "0 0 8px oklch(0.68 0.22 300)" : "none",
              transition: "height 0.1s, background 0.15s",
            }}
          />
        )}

        {/* Center line */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: FADER_H / 2,
            height: 1,
            background: "oklch(0.28 0.03 265 / 0.8)",
          }}
        />

        {/* Thumb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 fader-thumb"
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
            boxShadow: dragging
              ? "0 0 12px oklch(0.78 0.18 192 / 0.8), 0 0 24px oklch(0.78 0.18 192 / 0.4), inset 0 1px 0 oklch(0.55 0.05 265 / 0.5)"
              : "0 2px 4px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(0.5 0.04 265 / 0.3)",
            pointerEvents: "none",
            transition: "border 0.15s, box-shadow 0.15s, background 0.15s",
          }}
        >
          {/* Thumb grip lines */}
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

        {/* Invisible range input */}
        <input
          type="range"
          orient="vertical"
          min={-12}
          max={12}
          step={1}
          value={gain}
          onChange={(e) => onChange(index, Number(e.target.value))}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onTouchStart={() => setDragging(true)}
          onTouchEnd={() => setDragging(false)}
          className="fader-input"
          data-ocid={`eq.band.slider.${index + 1}`}
          aria-label={`${band.label} Hz gain`}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "ns-resize",
            width: "100%",
            height: "100%",
          }}
          // For vertical range input
          {...({
            style: {
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "ns-resize",
              width: "100%",
              height: "100%",
              writingMode: "vertical-lr",
              direction: "rtl",
            },
          } as any)}
        />
      </div>

      {/* Freq label */}
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

      {/* pct value used to force update */}
      <span style={{ display: "none" }}>{pct}</span>
    </div>
  );
}

// ── Music Player ──────────────────────────────────────────────────────────────
function MusicPlayer() {
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100
  const [volume, setVolume] = useState(75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = TRACKS[trackIdx];
  const elapsedSec = Math.floor((progress / 100) * track.totalSec);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (repeat) return 0;
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / track.totalSec;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, track.totalSec, repeat]);

  const handlePrev = useCallback(() => {
    setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  }, []);

  const handleNext = useCallback(() => {
    if (shuffle) {
      let next = trackIdx;
      while (next === trackIdx)
        next = Math.floor(Math.random() * TRACKS.length);
      setTrackIdx(next);
    } else {
      setTrackIdx((i) => (i + 1) % TRACKS.length);
    }
    setProgress(0);
  }, [shuffle, trackIdx]);

  return (
    <section
      className="player-card rounded-2xl p-5 flex gap-5 items-center"
      data-ocid="player.section"
    >
      {/* Album Art */}
      <AnimatePresence mode="wait">
        <motion.div
          key={trackIdx}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.3 }}
          className="album-art flex-shrink-0 relative"
          style={{ width: 120, height: 120 }}
        >
          <img
            src={track.art}
            alt={track.title}
            className="w-full h-full object-cover rounded-xl"
            style={{
              boxShadow: isPlaying
                ? "0 0 24px oklch(0.78 0.18 192 / 0.5), 0 8px 32px oklch(0 0 0 / 0.6)"
                : "0 4px 20px oklch(0 0 0 / 0.5)",
              transition: "box-shadow 0.4s",
            }}
          />
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ border: "2px solid oklch(0.78 0.18 192 / 0.6)" }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Track Info + Controls */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={trackIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p
              className="font-bold text-lg leading-tight truncate"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                color: "oklch(0.94 0.02 200)",
              }}
            >
              {track.title}
            </p>
            <p className="text-sm" style={{ color: "oklch(0.55 0.04 220)" }}>
              {track.artist}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span
            className="tabular-nums"
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.50 0.04 220)",
              minWidth: 32,
            }}
          >
            {formatTime(elapsedSec)}
          </span>
          <div
            className="flex-1 relative rounded-full overflow-hidden"
            style={{ height: 4, background: "oklch(0.18 0.025 265)" }}
            role="progressbar"
            tabIndex={0}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="absolute left-0 top-0 bottom-0 rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, oklch(0.72 0.18 192), oklch(0.84 0.18 192))",
                boxShadow: "0 0 8px oklch(0.78 0.18 192 / 0.6)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "linear" }}
            />
          </div>
          <span
            className="tabular-nums"
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.40 0.03 220)",
              minWidth: 32,
              textAlign: "right",
            }}
          >
            {track.duration}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="player.toggle"
            onClick={() => setShuffle((s) => !s)}
            className="player-ctrl-btn"
            style={{
              color: shuffle ? "oklch(0.78 0.18 192)" : "oklch(0.40 0.03 220)",
            }}
            aria-label="Shuffle"
          >
            <LucideShuffle size={16} />
          </button>

          <button
            type="button"
            data-ocid="player.secondary_button"
            onClick={handlePrev}
            className="player-ctrl-btn"
            aria-label="Previous track"
          >
            <LucideChevronFirst size={20} />
          </button>

          <motion.button
            data-ocid="player.primary_button"
            onClick={() => setIsPlaying((p) => !p)}
            className="play-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.span
                  key="pause"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <LucidePause size={20} fill="currentColor" />
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
                    size={20}
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
            onClick={handleNext}
            className="player-ctrl-btn"
            aria-label="Next track"
          >
            <LucideChevronLast size={20} />
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
            <LucideRepeat size={16} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2" style={{ maxWidth: 200 }}>
          <LucideVolume2
            size={14}
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
                width: `${volume}%`,
                background:
                  "linear-gradient(90deg, oklch(0.65 0.15 192), oklch(0.78 0.18 192))",
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="volume-slider"
              data-ocid="player.input"
              aria-label="Volume"
            />
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: "oklch(0.42 0.03 220)",
              minWidth: 26,
              textAlign: "right",
            }}
          >
            {volume}%
          </span>
        </div>
      </div>

      {/* Track List (right side, desktop only) */}
      <div className="hidden lg:flex flex-col gap-1" style={{ minWidth: 180 }}>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{
            color: "oklch(0.38 0.03 220)",
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          Queue
        </p>
        {TRACKS.map((t, i) => (
          <button
            type="button"
            key={t.title}
            data-ocid={`player.item.${i + 1}`}
            onClick={() => {
              setTrackIdx(i);
              setProgress(0);
            }}
            className="text-left px-3 py-2 rounded-lg transition-all duration-150"
            style={{
              background:
                i === trackIdx ? "oklch(0.78 0.18 192 / 0.08)" : "transparent",
              border:
                i === trackIdx
                  ? "1px solid oklch(0.78 0.18 192 / 0.25)"
                  : "1px solid transparent",
            }}
          >
            <p
              className="text-sm leading-tight truncate"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                color:
                  i === trackIdx
                    ? "oklch(0.82 0.18 192)"
                    : "oklch(0.70 0.03 220)",
                fontWeight: i === trackIdx ? 600 : 400,
              }}
            >
              {t.title}
            </p>
            <p style={{ fontSize: 10, color: "oklch(0.42 0.03 220)" }}>
              {t.artist} · {t.duration}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [gains, setGains] = useState<number[]>([...FLAT_30]);
  const [activePreset, setActivePreset] = useState<string>("Flat");

  const handleBandChange = useCallback((index: number, value: number) => {
    setGains((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setActivePreset("Custom");
  }, []);

  const applyPreset = useCallback((name: string) => {
    setGains([...PRESETS_30[name]]);
    setActivePreset(name);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "oklch(0.18 0.025 265)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.14 0.02 265)",
              border: "1px solid oklch(0.78 0.18 192 / 0.3)",
              boxShadow: "0 0 12px oklch(0.78 0.18 192 / 0.2)",
            }}
          >
            <LucideWaves size={18} style={{ color: "oklch(0.78 0.18 192)" }} />
          </div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            <span style={{ color: "oklch(0.78 0.18 192)" }}>EQ</span>
            <span style={{ color: "oklch(0.80 0.02 200)" }}> Studio</span>
          </h1>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
            style={{
              background: "oklch(0.78 0.18 192 / 0.08)",
              border: "1px solid oklch(0.78 0.18 192 / 0.2)",
              color: "oklch(0.78 0.18 192)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            30-Band GEQ
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="hidden md:block text-xs"
            style={{
              color: "oklch(0.38 0.03 220)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            v2.0
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 md:px-6 py-5 gap-5 max-w-screen-2xl mx-auto w-full">
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
          data-ocid="eq.curve.panel"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{
                color: "oklch(0.40 0.04 220)",
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              Frequency Response
            </span>
            <div className="flex items-center gap-3">
              {["+12dB", "+6dB", "0dB", "-6dB", "-12dB"].map((v) => (
                <span
                  key={v}
                  className="text-xs"
                  style={{
                    color: "oklch(0.32 0.03 220)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div style={{ height: 160 }}>
            <EQCurve gains={gains} />
          </div>
        </section>

        {/* ── 30-Band EQ ── */}
        <section
          className="rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.115 0.02 265) 0%, oklch(0.095 0.016 265) 100%)",
            border: "1px solid oklch(0.20 0.025 265)",
            boxShadow:
              "inset 0 1px 0 oklch(0.28 0.035 265 / 0.4), inset 0 -1px 0 oklch(0.06 0.01 265 / 0.8)",
          }}
          data-ocid="eq.panel"
        >
          {/* Panel Header */}
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
              Graphic Equalizer · 30 Band
            </span>
            <div className="flex items-center gap-2">
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
          </div>

          {/* EQ Faders */}
          <div className="flex">
            {/* Left dB Scale */}
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

            {/* Faders scroll area */}
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
                    gain={gains[i]}
                    onChange={handleBandChange}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Presets + Reset ── */}
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
            Presets
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
          {activePreset === "Custom" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: "oklch(0.68 0.22 300 / 0.1)",
                border: "1px solid oklch(0.68 0.22 300 / 0.4)",
                color: "oklch(0.72 0.22 300)",
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Custom
            </motion.span>
          )}

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
            Reset
          </motion.button>
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
