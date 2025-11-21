/**
 * Dashboard Page
 */


import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import KpiCard from "./KpiCard";
import "ojs/ojtable";
import { StatusLineChart, CompletedBarChart } from "./ChartWrappers";
import { fetchSummary, fetchTrend, fetchLongRunning, fetchTerminated } 
  from "../../../lib/api";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import LongRunningView from "./longRunning";
import Terminated from "./terminated";




export default function Dashboard() {
  const [summary, setSummary] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [hours, setHours] = useState<number>(8);
  const [view, setView] = useState<"summary" | "long" | "terminated">("summary");


  useEffect(() => {
    load();
  }, [hours]);

  async function load() {
    setSummary(await fetchSummary(hours));
    setTrend(await fetchTrend(hours));
  }

  const totals = useMemo(() => {
    const cols = ["running","pending_standby","scheduled","completed_ok","completed_warning","completed_error","completed_terminated"];
    const totals:any = {};
    for (const c of cols) totals[c] = summary.reduce((acc, r) => acc + (Number(r[c]) || 0), 0);
    return totals;
  }, [summary]);

  const hourGroups = useMemo(() => trend.map((r:any) => r.hour_start), [trend]);

  const statusSeries = useMemo(() => {
  const keys = [
    "running",
    "pending",
    "scheduled",
    "inactive",
    "completed_ok",
    "completed_1hr",
    "completed_warn_1hr",
    "error_1hr",
    "terminated_1hr"
  ];

  const labelMap: Record<string, string> = {
    running: "Running",
    pending: "Pending",
    scheduled: "Scheduled",
    inactive: "Inactive",
    completed_ok: "Completed (OK)",
    completed_1hr: "Completed <1hr",
    completed_warn_1hr: "Warning <1hr",
    error_1hr: "Error <1hr",
    terminated_1hr: "Terminated <1hr"
  };

  return keys.map(key => ({
    name: labelMap[key],                      // 👈 legend label becomes readable
    items: trend.map((r: any) => Number(r[key] || 0))
  }));
}, [trend]);


  const completedSeries = useMemo(() => {
    const keys = [
      { k:"completed_ok", name:"Completed OK" },
      { k:"completed_warning", name:"Warning" },
      { k:"completed_error", name:"Error" },
      { k:"completed_terminated", name:"Terminated" }
    ];
    return keys.map(({k, name}) => ({
      name,
      items: trend.map((r:any) => Number(r[k] || 0))
    }));
  }, [trend]);

// Normalize data + apply unique keys for table
// Map records: ensure key + correct fields
const summaryWithKeys = summary.map((item, index) => ({
  id: index + 1,
  ...item,
  pending: item.pending_standby // 👈 normalize column field
}));

// Data provider must use keyAttributes with unique keys
const summaryProvider = new ArrayDataProvider(summaryWithKeys, {
  keyAttributes: "id"
});


  return (
    <div>
      {/* <h1>Dashboard</h1> */}

      <div class="controls-row">
  
  <div class="slider-group">
  <label>Hours:</label>
  <input
    type="range"
    min={1}
    max={24}
    value={hours}
    onInput={(e:any)=> setHours(Number(e.target.value))}
  />
  <span class="hour-value">{hours}</span>
  <button class="refresh-btn" onClick={load}>Refresh</button>
</div>


  <div class="view-buttons">
  <button class={view === "summary" ? "active" : ""} onClick={() => setView("summary")}>Summary</button>
  <button class={view === "long" ? "active" : ""} onClick={() => setView("long")}>Long Running</button>
  <button class={view === "terminated" ? "active" : ""} onClick={() => setView("terminated")}>Terminated</button>
</div>



</div>


      {view === "summary" && (
  <>
    <div class="kpi-row">
      <KpiCard label="Running" value={totals.running} color="#0d6efd" />
      <KpiCard label="Pending" value={totals.pending_standby} color="#f6b26b" />
      <KpiCard label="Scheduled" value={totals.scheduled} color="#7733ff" />
      <KpiCard label="OK" value={totals.completed_ok} color="#93c47d" />
      <KpiCard label="Warning" value={totals.completed_warning} color="#ffd966" />
      <KpiCard label="Error" value={totals.completed_error} color="#e06666" />
      <KpiCard label="Terminated" value={totals.completed_terminated} color="#8e7cc3" />
    </div>

    <div class="charts-row">
      <div class="chart-big">
        <StatusLineChart series={statusSeries} groups={hourGroups} />
      </div>
      <div class="chart-small">
        <CompletedBarChart series={completedSeries} groups={hourGroups} />
      </div>
    </div>

    <div class="table-panel">
      {/* You can keep summary table here */}
      <oj-table
        data={summaryProvider}
        columns={[
          { headerText: "Program Name", field: "program_name" },
          { headerText: "Completed OK", field: "completed_ok", className: "ok-pill" },
          { headerText: "Completed Warning", field: "completed_warning", className: "warn-pill" },
          { headerText: "Completed Error", field: "completed_error", className: "error-pill" },
          { headerText: "Completed Terminated", field: "completed_terminated", className: "term-pill" },
          { headerText: "Running", field: "running" },
          { headerText: "Pending Standby", field: "pending" },
          { headerText: "Scheduled", field: "scheduled" }
        ]}
      ></oj-table>
    </div>
  </>
)}

{view === "long" && (
  <LongRunningView />
)}

{view === "terminated" && (
  <Terminated/>
)}

    </div>
  );
}
