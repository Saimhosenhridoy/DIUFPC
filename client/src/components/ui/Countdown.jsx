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
  compact = false,  // ✅ NEW: extra small mode
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

  const numGrad =
    theme === "orange"
      ? "text-transparent bg-clip-text bg-gradient-to-b from-orange-600 via-orange-500 to-amber-400"
      : "text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-sky-600";

  // ✅ size presets
  const shellPad = compact ? "p-2" : size === "sm" ? "p-2.5" : "p-4";
  const titleSize = compact ? "text-[10px]" : size === "sm" ? "text-[11px]" : "text-sm";
  const numSize = compact ? "text-base md:text-lg" : size === "sm" ? "text-lg md:text-xl" : "text-2xl md:text-3xl";
  const boxPad = compact ? "p-1.5" : size === "sm" ? "p-2" : "p-3";
  const labelSize = compact ? "text-[8px]" : size === "sm" ? "text-[9px]" : "text-[10px]";
  const badgeSize = compact ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1";
  const gap = compact ? "gap-1.5" : "gap-2";
  const mt = compact ? "mt-2" : "mt-2.5";

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/55 ${className}`}>
      <div className={shellPad}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className={`${titleSize} font-extrabold text-slate-800`}>
            {title}
            <span className="mx-2 opacity-40">•</span>
            <span className="font-semibold text-slate-700">{String(target || "")}</span>
          </div>

          <span
            className={`${badgeSize} rounded-full font-extrabold border ${
              done
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white/70 text-slate-900 border-slate-200"
            }`}
          >
            {done ? doneText : activeText}
          </span>
        </div>

        <div className={`${mt} grid grid-cols-4 ${gap}`}>
          <MiniBox
            value={pad2(days)}
            label="DAYS"
            numGrad={numGrad}
            numSize={numSize}
            boxPad={boxPad}
            labelSize={labelSize}
          />
          <MiniBox
            value={pad2(hours)}
            label="HRS"
            numGrad={numGrad}
            numSize={numSize}
            boxPad={boxPad}
            labelSize={labelSize}
          />
          <MiniBox
            value={pad2(minutes)}
            label="MIN"
            numGrad={numGrad}
            numSize={numSize}
            boxPad={boxPad}
            labelSize={labelSize}
          />
          <MiniBox
            value={pad2(seconds)}
            label="SEC"
            numGrad={numGrad}
            numSize={numSize}
            boxPad={boxPad}
            labelSize={labelSize}
          />
        </div>
      </div>
    </div>
  );
}

function MiniBox({ value, label, numGrad, numSize, boxPad, labelSize }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white/65 ${boxPad} text-center`}>
      <div className={`${numSize} font-extrabold ${numGrad} leading-none`}>{value}</div>
      <div className={`mt-1 ${labelSize} tracking-[0.18em] font-extrabold text-slate-700 leading-none`}>
        {label}
      </div>
    </div>
  );
}
