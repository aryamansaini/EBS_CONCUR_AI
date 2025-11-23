import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

type Props = {
  label: string;
  value: number | string;
  color?: string;      // accent color for the number
  icon?: string;       // optional small icon class or SVG path
  compact?: boolean;   // smaller compact version for tight spaces
};

export default function KpiCard({ label, value, color = "#0d6efd", icon, compact = false }: Props) {
  // animate numeric value when it changes (only for numeric values)
  const [display, setDisplay] = useState<number>(typeof value === "number" ? value : NaN);
  const prevRef = useRef<number>(typeof value === "number" ? value : NaN);

  useEffect(() => {
    if (typeof value !== "number") {
      setDisplay(NaN);
      return;
    }
    const start = prevRef.current || 0;
    const end = value;
    prevRef.current = end;

    const duration = 600; // ms
    const startTs = performance.now();
    let raf = 0;

    const step = (t: number) => {
      const pct = Math.min(1, (t - startTs) / duration);
      const val = Math.round(start + (end - start) * easeOutCubic(pct));
      setDisplay(val);
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  const isNumber = typeof value === "number";

  return (
    <div className={`kpi-card ${compact ? "kpi-card-compact" : ""}`} role="group" aria-label={`${label} KPI`}>
      <div className="kpi-top">
        {icon ? (
          <span className="kpi-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
        ) : (
          <span className="kpi-dot" style={{ background: color }} aria-hidden="true" />
        )}
        <div className="kpi-label">{label}</div>
      </div>

      <div className="kpi-value" style={{ color }}>
        {isNumber ? (Number.isNaN(display) ? value : display) : value}
      </div>

      <div className="kpi-note"> {/* optional small note area */} </div>
    </div>
  );
}