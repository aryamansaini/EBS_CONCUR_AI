import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

// Import JET chart component
import "ojs/ojchart";

type ChartProps = {
  series: any[];
  groups: any[];
};

export function StatusLineChart({ series, groups }: ChartProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      (ref.current as any).series = series;
      (ref.current as any).groups = groups;
    }
  }, [series, groups]);

  return (
    <oj-chart
      ref={ref as any}
      type="line"
      title="Program Execution Trend"
      // titlealign="center"
      // titleStyle={{ fontSize: '18px', fontWeight: 'bold' }}
       yAxis={{ title: "Count" }}
       xAxis={{ title: "Time (Hour)" }}
      animation-on-display="auto"
      animation-on-data-change="auto"
    ></oj-chart>
  );
}

export function CompletedBarChart({ series, groups }: ChartProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {

  const barColors = ["#57A6A2", "#D28A2C", "#E74C3C", "#51463D"];

  series.forEach((s, i) => {
    s.color = barColors[i];
  });

    if (ref.current) {
      (ref.current as any).series = series;
      (ref.current as any).groups = groups;
    }
  }, [series, groups]);

  return (
    <oj-chart
      ref={ref as any}
      type="bar"
      stack="on"
      yAxis={{ title: "Count" }}
      xAxis={{ title: "Time (Hour)" }}
      animation-on-display="auto"
      animation-on-data-change="auto"
    ></oj-chart>
  );
}
