import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

// Import JET chart component
import "ojs/ojchart";

type ChartProps = {
  series: any[];
  groups: any[];
};

/**
 * Helpers to convert various 'group' formats (hour numbers, "HH:MM" strings, ISO date strings)
 * from UTC to IST (UTC+5:30) and format as "HH:MM".
 */

/** Pads a number to two digits. */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Parse a group value into a Date interpreted in UTC.
 * - If value is a number (0..23): treat as hour on current UTC date at that hour:00:00Z.
 * - If value is "HH:MM" or "H:MM": treat as UTC time on current UTC date at that time and append 'Z'.
 * - If value looks like an ISO datetime:
 *    - If it contains timezone info (Z or +/-) Date() will parse with that timezone.
 *    - If it lacks timezone (e.g. "2025-01-02T03:00"), treat it as UTC by appending 'Z'.
 * - Otherwise fallback to attempting Date(value) and hope for the best.
 */
function parseGroupAsUTCDate(group: any): Date | null {
  if (group == null) return null;

  // If already a Date, assume it represents UTC time (caller should provide UTC).
  if (group instanceof Date) {
    return new Date(group.getTime());
  }

  // Number -> hour
  if (typeof group === "number" && Number.isFinite(group)) {
    const now = new Date();
    // Build a UTC date at that hour
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();
    const hour = Math.floor(group) % 24;
    return new Date(Date.UTC(utcYear, utcMonth, utcDate, hour, 0, 0, 0));
  }

  // String handling
  if (typeof group === "string") {
    const s = group.trim();

    // HH:MM or H:MM
    const hmMatch = s.match(/^(\d{1,2}):(\d{2})$/);
    if (hmMatch) {
      const hh = parseInt(hmMatch[1], 10) % 24;
      const mm = Math.max(0, Math.min(59, parseInt(hmMatch[2], 10)));
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, 0, 0));
    }

    // ISO datetime: check if it contains timezone info (Z or +/-)
    const isoMatch = s.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?/);
    if (isoMatch) {
      // if there's no timezone suffix (no 'Z' or + or -) then treat as UTC by appending 'Z'
      if (!/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) {
        try {
          return new Date(s + "Z");
        } catch {
          // fallthrough
        }
      }
      try {
        return new Date(s); // Date will parse with timezone info if present
      } catch {
        // fallthrough
      }
    }

    // If string is numeric (like "3"), treat like numeric hour
    if (/^\d+$/.test(s)) {
      const hour = parseInt(s, 10) % 24;
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0, 0));
    }

    // Last resort: try Date()
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

/** Convert a UTC Date to IST label "HH:MM" (24-hour). IST = UTC + 5:30 */
function utcDateToISTLabel(dUtc: Date) {
  if (!dUtc) return "";

  // Add 5.5 hours in milliseconds
  const istMs = dUtc.getTime() + (5 * 60 + 30) * 60 * 1000;
  const dIst = new Date(istMs);

  const hh = pad2(dIst.getUTCHours()); // use getUTCHours because we constructed via ms
  const mm = pad2(dIst.getUTCMinutes());
  return `${hh}:${mm}`;
}

/** Convert an array of groups to IST labels (string). Does not mutate input. */
function convertGroupsToISTLabels(groups: any[]): string[] {
  if (!Array.isArray(groups)) return [];

  return groups.map((g) => {
    try {
      const dt = parseGroupAsUTCDate(g);
      if (dt) {
        return utcDateToISTLabel(dt);
      }
      // fallback: stringify
      return String(g);
    } catch (e) {
      return String(g);
    }
  });
}

/** Build a tooltip DOM element used by both charts */
function makeTooltipElement(seriesLabel: string, time: any, count: any) {
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

  const timeLine = document.createElement("div");
  timeLine.style.color = "#444";
  timeLine.innerHTML = `Time: <strong>${String(time)}</strong>`;

  const countLine = document.createElement("div");
  countLine.style.color = "#444";
  countLine.innerHTML = `Count: <strong>${String(count)}</strong>`;

  wrapper.appendChild(title);
  wrapper.appendChild(timeLine);
  wrapper.appendChild(countLine);

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
      s.markerDisplayed = "on";
      s.markerShape = "circle";
      s.markerSize = 6;
      s.lineWidth = 2.5;
    });

    const chart: any = ref.current;

    // Convert groups to IST labels
    const convertedGroups = convertGroupsToISTLabels(groups);

    // Apply groups & series
    chart.series = sClone;
    chart.groups = convertedGroups;

    // Set global chart attributes
    chart.type = "line";
    chart.lineStyle = "curved"; // smooth curves
    chart.markerDisplayed = "auto";
    chart.markerShape = "circle";
    chart.markerSize = 6;
    chart.yAxis = { title: "Count" };
    chart.xAxis = { title: "Time (Hour) IST" };

    chart.animationOnDisplay = "auto";
    chart.animationOnDataChange = "auto";

    // Add a tooltip renderer for nicer display on hover
    chart.tooltip = {
      renderer: function (context: any) {
        // Prefer the converted group label (context.group will reflect the chart.groups value)
        const sLabel = context.series || (context.seriesData && (context.seriesData.name || context.seriesData.label)) || "Series";
        const group = context.group;
        const val = context.value;
        return {
          insert: makeTooltipElement(sLabel, group, val)
        };
      }
    };

    chart.hoverBehavior = "dim";

    // force refresh (some oj-chart builds require async nudge)
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

    // clone incoming series (do not mutate props)
    const sClone = series.map((s, i) => ({ ...s, color: barColors[i % barColors.length] }));

    let retryTimer: number | undefined;

    function applyToChart(chart: any) {
      // if items are still empty, retry shortly (data not ready yet)
      const hasItems = sClone.length > 0 && Array.isArray(sClone[0].items) && sClone[0].items.length > 0;
      if (!hasItems) {
        // try again in 60ms (small delay)
        retryTimer = window.setTimeout(() => applyToChart(chart), 60);
        return;
      }

      // Convert groups to IST labels
      const convertedGroups = convertGroupsToISTLabels(groups);

      // assign series/groups and basic props
      chart.series = sClone;
      chart.groups = convertedGroups;
      chart.type = "bar";
      chart.stack = "on";
      chart.yAxis = { title: "Count" };
      chart.xAxis = { title: "Time (Hour) IST" };
      chart.animationOnDisplay = "auto";
      chart.animationOnDataChange = "auto";

      // robust tooltip renderer (Name / Time / Count)
      chart.tooltip = {
        renderer: function (context: any) {
          // Prefer these fields based on your observed context object
          const sFromSeriesProp = context.series;
          const sFromSeriesData = context.seriesData && (context.seriesData.name || context.seriesData.label);
          const sFromSeriesLabel = context.seriesLabel;
          const sFromChart = (typeof context.seriesIndex === "number" && chart && Array.isArray(chart.series))
            ? (chart.series[context.seriesIndex] && (chart.series[context.seriesIndex].name || chart.series[context.seriesIndex].label))
            : undefined;

          const sLabel = (sFromSeriesProp || sFromSeriesData || sFromSeriesLabel || sFromChart || "(unknown)");

          // Group/time: context.group is already the converted label (chart.groups)
          const timeLabel = (context.group != null) ? String(context.group) :
                            (context.groupData && context.groupData[0]) ? String(context.groupData[0]) :
                            (typeof context.x !== "undefined") ? String(context.x) : "";

          // Value/count
          let countVal = "";
          if (typeof context.value !== "undefined") countVal = String(context.value);
          else if (typeof context.data !== "undefined") countVal = String(context.data);
          else if (typeof context.y !== "undefined") countVal = String(context.y);
          else {
            // fallback: try to find a numeric value in seriesData.items at group index
            try {
              const gIndex = (chart && Array.isArray(chart.groups)) ? chart.groups.findIndex((g:any) => String(g) === String(context.group)) : -1;
              if (gIndex >= 0 && context.seriesData && Array.isArray(context.seriesData.items)) {
                countVal = String(context.seriesData.items[gIndex]);
              }
            } catch {}
          }

          const wrapper = document.createElement("div");
          wrapper.style.fontFamily = "Arial, Helvetica, sans-serif";
          wrapper.style.fontSize = "13px";
          wrapper.style.padding = "8px 10px";
          wrapper.style.maxWidth = "260px";
          wrapper.style.color = "#123645";

          const title = document.createElement("div");
          title.style.fontWeight = "700";
          title.style.marginBottom = "6px";
          title.textContent = `${sLabel}`;

          const groupLine = document.createElement("div");
          groupLine.style.color = "#444";
          groupLine.innerHTML = `Time: <strong>${timeLabel}</strong>`;

          const valueLine = document.createElement("div");
          valueLine.style.color = "#444";
          valueLine.innerHTML = `Count: <strong>${countVal}</strong>`;

          wrapper.appendChild(title);
          wrapper.appendChild(groupLine);
          wrapper.appendChild(valueLine);

          return { insert: wrapper };
        }
      };

      // small refresh/relayout so oj-chart renders segments and tooltips correctly
      setTimeout(() => {
        try {
          chart.relayout && chart.relayout();
          chart.refresh && chart.refresh();
        } catch (e) { /* ignore */ }
      }, 20);
    }

    if (ref.current) {
      const chart: any = ref.current;
      applyToChart(chart);
    }

    return () => {
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [series, groups]);

  return (
    <oj-chart
      ref={ref as any}
      type="bar"
      stack="on"
      yAxis={{ title: "Count" }}
      xAxis={{ title: "Time (Hour) IST" }}
      animation-on-display="auto"
      animation-on-data-change="auto"
      style={{ width: "100%", height: "380px" }}
    ></oj-chart>
  );
}
