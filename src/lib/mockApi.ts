//DONT FORGET TO CHANGE BACK TO api.ts BEFORE DEPLOYMENT

/**
 * API Client for EBS Dashboard
 * These functions call your backend endpoints.
 */

const BASE_URL = "";  
// If your backend is served from a different origin:
// export const BASE_URL = "http://localhost:5000";
// or
// export const BASE_URL = "/api";

async function apiGet(path: string) {
  const res = await fetch(BASE_URL + path);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}

// ----------------------------
// SUMMARY (by program)
// ----------------------------
export function fetchSummary(hours: number = 8) {
  return apiGet(`/api/summary?hours=${hours}`);
}

// ----------------------------
// TREND (hourly metrics)
// ----------------------------
export function fetchTrend(hours: number = 8) {
  return apiGet(`/api/trend?hours=${hours}`);
}

// ----------------------------
// LONG-RUNNING JOBS (>8 hours)
// ----------------------------
export function fetchLongRunning() {
  return apiGet(`/api/long-running`);
}

// ----------------------------
// RECENTLY TERMINATED JOBS
// ----------------------------
export function fetchTerminated(hours: number = 8) {
  return apiGet(`/api/terminated?hours=${hours}`);
}

// ----------------------------
// EVENT BUBBLES (optional)
// ----------------------------
export function fetchEvents(hours: number = 8) {
  return apiGet(`/api/events?hours=${hours}`);
}



/**
 * Mock API — Dummy Data for Testing
 */

function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

// ----------------------------
// Dummy summary data
// ----------------------------
export const dummySummary = [
  {
    program_name: "GL Import",
    completed_ok: 40,
    completed_warning: 5,
    completed_error: 3,
    completed_terminated: 1,
    running: 2,
    pending_standby: 3,
    scheduled: 4
  },
  {
    program_name: "Invoice Validation",
    completed_ok: 32,
    completed_warning: 4,
    completed_error: 2,
    completed_terminated: 0,
    running: 1,
    pending_standby: 2,
    scheduled: 5
  }
];
