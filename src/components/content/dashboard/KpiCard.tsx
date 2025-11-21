import { h } from "preact";

type Props = {
  label: string;
  value: number | string;
  color?: string;
};

export default function KpiCard({ label, value, color = "#1E293B" }: Props) {
  return (
    <div class="kpi-card">
      <div class="kpi-number" style={{ color }}>{value}</div>
      <div class="kpi-label">{label}</div>
    </div>
  );
}
