import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

const BANDS = [
  { freq: "32", label: "32Hz" },
  { freq: "64", label: "64Hz" },
  { freq: "125", label: "125Hz" },
  { freq: "250", label: "250Hz" },
  { freq: "500", label: "500Hz" },
  { freq: "1K", label: "1KHz" },
  { freq: "2K", label: "2KHz" },
  { freq: "4K", label: "4KHz" },
  { freq: "8K", label: "8KHz" },
  { freq: "16K", label: "16KHz" },
];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Rock: [5, 4, 3, 1, -1, -1, 1, 3, 4, 5],
  Pop: [-1, 0, 2, 4, 5, 3, 1, 0, -1, -1],
  Classical: [4, 3, 2, 1, 0, 0, -1, -2, -3, -3],
  Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  Electronic: [6, 5, 1, -1, -3, 0, 2, 3, 5, 6],
};

const PRESET_NAMES = Object.keys(PRESETS);

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
  const lastX = width - padX;
  const firstX = padX;
  return `${curvePath} L ${lastX},${midY} L ${firstX},${midY} Z`;
}

const SVG_W = 900;
const SVG_H = 200;

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
            stopOpacity="0.35"
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
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
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
                  : "oklch(0.25 0.02 265 / 0.6)"
              }
              strokeWidth={db === 0 ? 1.5 : 0.8}
              strokeDasharray={db === 0 ? "none" : "4 4"}
            />
            <text
              x={10}
              y={y + 4}
              fill="oklch(0.45 0.04 220)"
              fontSize="10"
              textAnchor="middle"
              fontFamily="Satoshi, sans-serif"
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
        transition={{ type: "spring", stiffness: 180, damping: 28 }}
      />

      <motion.path
        d={curvePath}
        fill="none"
        stroke="oklch(0.78 0.18 192 / 0.35)"
        strokeWidth={8}
        filter="url(#glowStrong)"
        animate={{ d: curvePath }}
        transition={{ type: "spring", stiffness: 180, damping: 28 }}
      />

      <motion.path
        className="eq-curve-path"
        d={curvePath}
        fill="none"
        stroke="oklch(0.82 0.18 192)"
        strokeWidth={2.5}
        strokeLinecap="round"
        filter="url(#glow)"
        animate={{ d: curvePath }}
        transition={{ type: "spring", stiffness: 180, damping: 28 }}
      />

      {gains.map((g, i) => {
        const padX = 24;
        const usableW = SVG_W - padX * 2;
        const x = padX + (i / (gains.length - 1)) * usableW;
        const y = midY - (g / 12) * (usableH / 2);
        const band = BANDS[i];
        return (
          <motion.circle
            key={band.freq}
            cx={x}
            animate={{ cy: y }}
            transition={{ type: "spring", stiffness: 180, damping: 28 }}
            r={4}
            fill="oklch(0.92 0.18 192)"
            filter="url(#glow)"
          />
        );
      })}
    </svg>
  );
}

export default function App() {
  const [gains, setGains] = useState<number[]>(PRESETS.Flat);
  const [activePreset, setActivePreset] = useState<string>("Flat");

  const handleSliderChange = useCallback((index: number, value: number) => {
    setGains((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setActivePreset("Custom");
  }, []);

  const applyPreset = useCallback((name: string) => {
    setGains([...PRESETS[name]]);
    setActivePreset(name);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              role="img"
              aria-label="EQ Studio logo"
            >
              <path
                d="M2 8 Q4 4 6 8 Q8 12 10 8 Q12 4 14 8"
                stroke="oklch(0.78 0.18 192)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            <span className="text-primary">EQ</span>
            <span className="text-foreground/80"> Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
            Live
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 md:px-8 py-6 gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Presets
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={activePreset}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="text-xs font-medium tracking-wide text-primary"
              >
                {activePreset}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_NAMES.map((name, i) => (
              <motion.button
                key={name}
                data-ocid={`eq.preset.button.${i + 1}`}
                onClick={() => applyPreset(name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={[
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border",
                  activePreset === name
                    ? "bg-primary/15 border-primary text-primary preset-active"
                    : "bg-secondary/60 border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                ].join(" ")}
              >
                {name}
              </motion.button>
            ))}
            {activePreset === "Custom" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-accent/50 text-accent bg-accent/10"
              >
                Custom
              </motion.span>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="h-48 px-2 py-2">
            <EQCurve gains={gains} />
          </div>
          <div className="flex px-6 pb-3">
            {BANDS.map((b) => (
              <div key={b.freq} className="flex-1 text-center">
                <span className="text-[9px] text-muted-foreground/60 tracking-wide">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 md:p-6">
          <span
            className="block mb-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Frequency Bands
          </span>
          <div className="flex items-stretch justify-between gap-1 md:gap-2">
            {BANDS.map((band, i) => (
              <div
                key={band.freq}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <motion.span
                  className="text-[10px] md:text-xs font-semibold text-primary tabular-nums w-8 text-center"
                  animate={{ opacity: [0.7, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  {gains[i] >= 0 ? `+${gains[i]}` : gains[i]}
                </motion.span>

                <div
                  className="relative flex justify-center"
                  style={{ height: 180 }}
                >
                  <div className="absolute inset-0 flex justify-center">
                    <div className="w-[3px] h-full rounded-full bg-border/40" />
                  </div>
                  <div
                    className="absolute w-[3px] rounded-full transition-all duration-150"
                    style={{
                      background: "oklch(0.78 0.18 192 / 0.7)",
                      bottom: "50%",
                      top:
                        gains[i] > 0
                          ? `${((12 - gains[i]) / 24) * 100}%`
                          : "50%",
                      display: gains[i] >= 0 ? "block" : "none",
                    }}
                  />
                  <div
                    className="absolute w-[3px] rounded-full transition-all duration-150"
                    style={{
                      background: "oklch(0.68 0.22 300 / 0.7)",
                      top: "50%",
                      bottom:
                        gains[i] < 0
                          ? `${((12 + gains[i]) / 24) * 100}%`
                          : "50%",
                      display: gains[i] < 0 ? "block" : "none",
                    }}
                  />
                  <input
                    type="range"
                    // @ts-expect-error orient is a Firefox-specific attribute
                    orient="vertical"
                    min={-12}
                    max={12}
                    step={1}
                    value={gains[i]}
                    onChange={(e) =>
                      handleSliderChange(i, Number(e.target.value))
                    }
                    className="slider-vertical relative z-10"
                    data-ocid={`eq.band.slider.${i + 1}`}
                    aria-label={`${band.label} gain`}
                  />
                </div>

                <span className="text-[9px] md:text-[10px] text-muted-foreground/70 tracking-wide text-center leading-tight">
                  {band.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-border/30">
            {["+12", "+6", "0", "-6", "-12"].map((v) => (
              <span key={v} className="text-[10px] text-muted-foreground/50">
                {v} dB
              </span>
            ))}
          </div>
        </section>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => applyPreset("Flat")}
            className="px-6 py-2 rounded-full text-sm text-muted-foreground border border-border/60 hover:border-primary/40 hover:text-primary transition-all duration-200"
          >
            Reset to Flat
          </motion.button>
        </div>
      </main>

      <footer className="py-4 text-center border-t border-border/30">
        <p className="text-xs text-muted-foreground/50">
          © {currentYear}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
