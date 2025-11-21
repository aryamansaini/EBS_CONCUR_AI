
// /* --------------------------------------------------
//    REAL BACKEND API
// -------------------------------------------------- */

// const API_BASE = "http://localhost:8000/api"; // 🔥 Update after deployment

// async function get(url: string) {
//   const res = await fetch(url);
//   if (!res.ok) {
//     console.error("API error:", res.status, res.statusText);
//     throw new Error("API Request failed");
//   }
//   return res.json();
// }

// export async function fetchSummary(hours: number = 8) {
//   return get(`${API_BASE}/summary?hours=${hours}`);
// }

// export async function fetchTrend(hours: number = 8) {
//   return get(`${API_BASE}/trend?hours=${hours}`);
// }

// export async function fetchLongRunning() {
//   return get(`${API_BASE}/long-running`);
// }

// export async function fetchTerminated(hours: number = 8) {
//   return get(`${API_BASE}/terminated?hours=${hours}`);
// }

// export async function fetchEvents(hours: number = 8) {
//   // Not implemented in backend → stub or remove in UI
//   return [];
// }



/**
 * Mock API — Dummy data for development and testing.
 * 
 * Function names & signatures are identical to api.ts
 * so you can swap imports easily.
 */

function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

/* --------------------------------------------------
   DUMMY SUMMARY DATA
-------------------------------------------------- */
/* --------------------------------------------------
   DUMMY SUMMARY DATA — Enhanced (10 Programs)
-------------------------------------------------- */
const dummySummary = [
  {
    program_name: "AR Auto Invoice Import",
    completed_ok: 96,
    completed_warning: 4,
    completed_error: 1,
    completed_terminated: 0,
    running: 2,
    pending_standby: 1,
    scheduled: 3
  },
  {
    program_name: "GL Journal Import",
    completed_ok: 88,
    completed_warning: 2,
    completed_error: 3,
    completed_terminated: 1,
    running: 1,
    pending_standby: 2,
    scheduled: 5
  },
  {
    program_name: "PO Output for Communication",
    completed_ok: 75,
    completed_warning: 6,
    completed_error: 3,
    completed_terminated: 1,
    running: 0,
    pending_standby: 3,
    scheduled: 2
  },
  {
    program_name: "Cost Manager",
    completed_ok: 64,
    completed_warning: 8,
    completed_error: 5,
    completed_terminated: 0,
    running: 3,
    pending_standby: 1,
    scheduled: 4
  },
  {
    program_name: "Check Event Alert",
    completed_ok: 37,
    completed_warning: 5,
    completed_error: 2,
    completed_terminated: 0,
    running: 1,
    pending_standby: 0,
    scheduled: 6
  },
  {
    program_name: "Workflow Background Process",
    completed_ok: 52,
    completed_warning: 1,
    completed_error: 4,
    completed_terminated: 3,
    running: 2,
    pending_standby: 4,
    scheduled: 5
  },
  {
    program_name: "DQM Serial Sync",
    completed_ok: 12,
    completed_warning: 0,
    completed_error: 1,
    completed_terminated: 0,
    running: 1,
    pending_standby: 0,
    scheduled: 1
  },
  {
    program_name: "Item Classification Update",
    completed_ok: 8,
    completed_warning: 0,
    completed_error: 0,
    completed_terminated: 0,
    running: 0,
    pending_standby: 0,
    scheduled: 2
  },
  {
    program_name: "Create Accounting",
    completed_ok: 120,
    completed_warning: 10,
    completed_error: 8,
    completed_terminated: 2,
    running: 3,
    pending_standby: 4,
    scheduled: 7
  },
  {
    program_name: "OM Order Import",
    completed_ok: 99,
    completed_warning: 3,
    completed_error: 1,
    completed_terminated: 0,
    running: 2,
    pending_standby: 3,
    scheduled: 6
  }
];


/* --------------------------------------------------
   DUMMY TREND DATA
-------------------------------------------------- */
function generateTrend(hours: number) {
  const arr = [];
  for (let i = 0; i < hours; i++) {
    arr.push({
      hour_start: `${i}:00`,
      running: Math.floor(Math.random() * 5),
      pending: Math.floor(Math.random() * 4),
      scheduled: Math.floor(Math.random() * 6),
      inactive: Math.floor(Math.random() * 2),

      completed_ok: Math.floor(Math.random() * 20),
      completed_1hr: Math.floor(Math.random() * 8),
      completed_warn_1hr: Math.floor(Math.random() * 4),
      error_1hr: Math.floor(Math.random() * 2),
      terminated_1hr: Math.floor(Math.random() * 1),

      completed_warning: Math.floor(Math.random() * 5),
      completed_error: Math.floor(Math.random() * 3),
      completed_terminated: Math.floor(Math.random() * 2)
    });
  }
  return arr;
}

/* --------------------------------------------------
   DUMMY LONG-RUNNING REQUEST DATA
-------------------------------------------------- */
const dummyLongRunning = [
  {
    request_id: 10101,
    program_name: "GL Posting",
    actual_start_date: "2025-11-19 02:30",
    running_hours: 11,
    status_code: "Running"
  },
  {
    request_id: 10102,
    program_name: "Cost Manager",
    actual_start_date: "2025-11-19 01:00",
    running_hours: 15,
    status_code: "Running"
  }
];

/* --------------------------------------------------
   DUMMY TERMINATED REQUEST DATA
-------------------------------------------------- */
const dummyTerminated = [
  {
    request_id: 20011,
    program_name: "AR Auto Invoice",
    actual_start_date: "2025-11-19 09:20",
    status_code: "Terminated"
  },
  {
    request_id: 20012,
    program_name: "PO Approval Workflow",
    actual_start_date: "2025-11-19 10:45",
    status_code: "Error"
  }
];

/* --------------------------------------------------
   MOCKED FUNCTIONS – SAME NAMES AS REAL API
-------------------------------------------------- */

export async function fetchSummary(hours: number = 8) {
  await wait(200);
  return dummySummary;
}

export async function fetchTrend(hours: number = 8) {
  await wait(200);
  return generateTrend(hours);
}

export async function fetchLongRunning() {
  await wait(200);
  return dummyLongRunning;
}

export async function fetchTerminated(hours: number = 8) {
  await wait(200);
  return dummyTerminated;
}

export async function fetchEvents(hours: number = 8) {
  await wait(200);
  return [
    { time: "10:00", message: "Concurrent program started" },
    { time: "11:00", message: "Warning issued" }
  ];
}
