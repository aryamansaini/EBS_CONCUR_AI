import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

// Import JET chart component
import "ojs/ojchart";

type ChartProps = {
  series: any[];
  groups: any[];
};

function makeTooltipElement(seriesLabel: string, group: any, value: any) {
  const wrapper = document.createElement("div");
  wrapper.style.fontFamily = "Arial, Helvetica, sans-serif";
  wrapper.style.fontSize = "13px";
  wrapper.style.padding = "8px 10px";
  wrapper.style.maxWidth = "240px";
  wrapper.style.color = "#123645";

  const title = document.createElement("div");
  title.style.fontWeight = "700";
  title.style.marginBottom = "6px";
  title.textContent = String(seriesLabel || "");

  const groupLine = document.createElement("div");
  groupLine.style.color = "#444";
  groupLine.innerHTML = `Group: <strong>${String(group)}</strong>`;

  const valueLine = document.createElement("div");
  valueLine.style.color = "#444";
  valueLine.innerHTML = `Value: <strong>${String(value)}</strong>`;

  wrapper.appendChild(title);
  wrapper.appendChild(groupLine);
  wrapper.appendChild(valueLine);

  return wrapper;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"'`]/g, (c) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#x60;"
    }[c] as string;
  });
}

export function StatusLineChart({ series, groups }: ChartProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // clone series so we don't mutate caller's array unexpectedly
    const sClone = series.map((s) => ({ ...s }));

    // Ensure markers are displayed for each series and optionally set colors
    sClone.forEach((s, i) => {
      // show marker (dot) on each point
      s.markerDisplayed = "on";       // "on" ensures dots are visible
      s.markerShape = "circle";
      s.markerSize = 6;               // px
      s.lineWidth = 2.5;              // slightly thicker lines
      // keep color if set by caller; otherwise let OJET pick palette
      // s.color = s.color || someColorPalette[i];
    });

    const chart: any = ref.current;

    // Apply groups & series
    chart.series = sClone;
    chart.groups = groups;

    // Set global chart attributes
    chart.type = "line";
    chart.lineStyle = "curved"; // smooth curves
    chart.markerDisplayed = "auto"; // fallback (we already set per-series)
    chart.markerShape = "circle";
    chart.markerSize = 6;
    chart.yAxis = { title: "Count" };
    chart.xAxis = { title: "Time (Hour)" };

    // set animation behaviour
    chart.animationOnDisplay = "auto";
    chart.animationOnDataChange = "auto";

    // Add a tooltip renderer for nicer display on hover
    chart.tooltip = {
      renderer: function (context: any) {
        const sLabel = context.seriesLabel || (context.series && context.series.name) || "Series";
        const group = context.group;
        const val = context.value;
        return {
          // return a real DOM element (not a string) so OJET will render it
          insert: makeTooltipElement(sLabel, group, val)
        };
      }
    };

    // enable hover dim (optional)
    chart.hoverBehavior = "dim";

    // force a refresh in case oj-chart needs it
    // Some versions of oj-chart need a small async nudging to pick up complex props
    setTimeout(() => {
      try {
        chart.refresh && chart.refresh();
      } catch (e) {
        // ignore
      }
    }, 10);
  }, [series, groups]);

  return (
    <oj-chart
      ref={ref as any}
      type="line"
      title="Program Execution Trend"
      animation-on-display="auto"
      animation-on-data-change="auto"
      style={{ width: "100%", height: "380px" }}
    ></oj-chart>
  );
}

export function CompletedBarChart({ series, groups }: ChartProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const barColors = ["#57A6A2", "#D28A2C", "#E74C3C", "#51463D"];

    // clone series so we don't mutate original
    const sClone = series.map((s, i) => ({ ...s }));
    sClone.forEach((s, i) => {
      s.color = barColors[i % barColors.length];
      // hide markers on bar chart just in case
      s.markerDisplayed = "off";
    });

    if (ref.current) {
      const chart: any = ref.current;
      chart.series = sClone;
      chart.groups = groups;
      chart.type = "bar";
      chart.stack = "on";
      chart.yAxis = { title: "Count" };
      chart.xAxis = { title: "Time (Hour)" };
      chart.animationOnDisplay = "auto";
      chart.animationOnDataChange = "auto";

      // small refresh
      setTimeout(() => {
        try {
          chart.refresh && chart.refresh();
        } catch {}
      }, 10);
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
      style={{ width: "100%", height: "380px" }}
    ></oj-chart>
  );
}
