 // src/components/ui/Countdown.jsx
import { useEffect, useMemo, useState } from "react";

function parseSmart(input, mode = "end") {
  const s = String(input || "").trim();
  if (!s) return null;

  // YYYY-MM-DD only
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const t = mode === "start" ? "T00:00:00" : "T23:59:59";
    return new Date(`${s}${t}`);
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function diffParts(targetMs) {
  const diff = targetMs - Date.now();
  const done = diff <= 0;
  const abs = Math.max(0, diff);

  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((abs / (1000 * 60)) % 60);
  const seconds = Math.floor((abs / 1000) % 60);

  return { done, days, hours, minutes, seconds };
}

const pad2 = (n) => String(n).padStart(2, "0");

export function isPast(dateStr, mode = "end") {
  const d = parseSmart(dateStr, mode);
  if (!d) return false;
  return Date.now() > d.getTime();
}

export function dateOnly(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const t = Date.parse(s);
  if (!Number.isFinite(t)) return s;

  return new Date(t).toISOString().slice(0, 10);
}

export default function Countdown({
  target,
  mode = "end",
  title = "Countdown",
  doneText = "CLOSED",
  activeText = "OPEN",
  theme = "blue",
  size = "sm",      // sm | md
  compact = false,  // extra small mode
  className = "",
}) {
  const dt = useMemo(() => parseSmart(target, mode), [target, mode]);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!dt) return;
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [dt]);

  if (!dt) return null;

  const { done, days, hours, minutes, seconds } = diffParts(dt.getTime());

  // Retain the original orange/blue theme choice, with cinematic blue shades.
  const numGrad =
    theme === "orange"
      ? "text-transparent bg-clip-text bg-gradient-to-b from-orange-400 via-orange-500 to-amber-300"
      : "text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-200 to-blue-500";

  // Original size presets and four-column layout retained.
  const shellPad = compact ? "p-2" : size === "sm" ? "p-2.5" : "p-4";
  const titleSize = compact ? "text-[10px]" : size === "sm" ? "text-[11px]" : "text-sm";
  const numSize = compact ? "text-base md:text-lg" : size === "sm" ? "text-lg md:text-xl" : "text-2xl md:text-3xl";
  const boxPad = compact ? "p-1.5" : size === "sm" ? "p-2" : "p-3";
  const labelSize = compact ? "text-[8px]" : size === "sm" ? "text-[9px]" : "text-[10px]";
  const badgeSize = compact ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1";
  const gap = compact ? "gap-1.5" : "gap-2";
  const mt = compact ? "mt-2" : "mt-2.5";

  return (
    <div
      className={`rounded-2xl border border-blue-400/25 bg-[#06162e]/90 shadow-[0_10px_28px_rgba(0,0,0,0.26),0_0_24px_rgba(19,120,255,0.10)] backdrop-blur ${className}`}
    >
      <div className={shellPad}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className={`${titleSize} font-extrabold text-slate-100`}>
            {title}
            <span className="mx-2 opacity-40">•</span>
            <span className="font-semibold text-blue-200/85">{String(target || "")}</span>
          </div>

          <span
            className={`${badgeSize} rounded-full font-extrabold border ${
              done
                ? "bg-[#10213d] text-slate-300 border-slate-500/40"
                : "bg-blue-500/15 text-sky-200 border-blue-400/45 shadow-[0_0_12px_rgba(19,120,255,0.16)]"
            }`}
          >
            {done ? doneText : activeText}
          </span>
        </div>

        <div className={`${mt} grid grid-cols-4 ${gap}`}>
          <MiniBox value={pad2(days)} label="DAYS" numGrad={numGrad} numSize={numSize} boxPad={boxPad} labelSize={labelSize} />
          <MiniBox value={pad2(hours)} label="HRS" numGrad={numGrad} numSize={numSize} boxPad={boxPad} labelSize={labelSize} />
          <MiniBox value={pad2(minutes)} label="MIN" numGrad={numGrad} numSize={numSize} boxPad={boxPad} labelSize={labelSize} />
          <MiniBox value={pad2(seconds)} label="SEC" numGrad={numGrad} numSize={numSize} boxPad={boxPad} labelSize={labelSize} />
        </div>
      </div>
    </div>
  );
}

function MiniBox({ value, label, numGrad, numSize, boxPad, labelSize }) {
  return (
    <div className={`rounded-xl border border-blue-400/20 bg-[#0c2343]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${boxPad} text-center`}>
      <div className={`${numSize} font-extrabold ${numGrad} leading-none`}>{value}</div>
      <div className={`mt-1 ${labelSize} tracking-[0.18em] font-extrabold text-blue-100/80 leading-none`}>
        {label}
      </div>
    </div>
  );
}
