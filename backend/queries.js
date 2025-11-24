module.exports = {

  // 1) Summary Query
  SQL_SUMMARY: `
WITH p AS (
    SELECT SYSDATE - (:hours / 24) AS win_start FROM dual
),
data AS (
    SELECT
          fcpv.user_concurrent_program_name AS program_name,
          SUM(CASE WHEN r.phase_code='C' AND r.status_code='C'
                    AND r.actual_completion_date <= SYSDATE
                    AND r.requested_start_date >= (select win_start from p)
                 THEN 1 ELSE 0 END) AS completed_ok,
          SUM(CASE WHEN r.phase_code='C' AND r.status_code IN ('W','G')
                    AND r.actual_completion_date <= SYSDATE
                    AND r.requested_start_date >= (select win_start from p)
                 THEN 1 ELSE 0 END) AS completed_warning,
          SUM(CASE WHEN r.phase_code='C' AND r.status_code='E'
                    AND r.actual_completion_date <= SYSDATE
                    AND r.requested_start_date >= (select win_start from p)
                 THEN 1 ELSE 0 END) AS completed_error,
          SUM(CASE WHEN r.phase_code='C' AND r.status_code IN ('T','X','D')
                    AND r.actual_completion_date <= SYSDATE
                    AND r.requested_start_date >= (select win_start from p)
                 THEN 1 ELSE 0 END) AS completed_terminated,
          SUM(CASE WHEN r.phase_code='C'
                    AND r.actual_completion_date <= SYSDATE
                    AND r.requested_start_date >= (select win_start from p)
                 THEN 1 ELSE 0 END) AS completed_total,
          SUM(CASE WHEN r.phase_code='R' AND r.requested_start_date > (select win_start from p)
                 THEN 1 ELSE 0 END) AS running,
          SUM(CASE WHEN r.phase_code='P' AND r.requested_start_date <= SYSDATE
                 THEN 1 ELSE 0 END) AS pending_standby,
          SUM(CASE WHEN r.requested_start_date > (select win_start from p)
                    AND r.requested_start_date <= SYSDATE
                 THEN 1 ELSE 0 END) AS scheduled,
          SUM(CASE WHEN r.actual_start_date >= (select win_start from p)
                 THEN 1 ELSE 0 END) AS started_in_window
    FROM apps.fnd_concurrent_requests r
    JOIN apps.fnd_concurrent_programs_vl fcpv
        ON fcpv.concurrent_program_id = r.concurrent_program_id
    GROUP BY fcpv.user_concurrent_program_name
)
SELECT
    program_name,
    completed_ok,
    completed_warning,
    completed_error,
    completed_terminated,
    running,
    pending_standby,
    scheduled,
    started_in_window
FROM data
WHERE completed_total > 0
   OR running > 0
   OR pending_standby > 0
   OR started_in_window > 0
ORDER BY completed_total DESC, program_name
`,

  // 2) Time Series
  SQL_TS: `
WITH hours AS (
  SELECT
    TRUNC(SYSDATE,'HH24') - NUMTODSINTERVAL(LEVEL-1,'HOUR') AS hour_start,
    TRUNC(SYSDATE,'HH24') - NUMTODSINTERVAL(LEVEL-1,'HOUR') + NUMTODSINTERVAL(1,'HOUR') AS hour_end
  FROM dual
  CONNECT BY LEVEL <= :hours
),
req AS (
  SELECT h.hour_start, h.hour_end, r.*
  FROM hours h
  JOIN apps.fnd_concurrent_requests r
    ON r.requested_start_date >= h.hour_start
   AND r.requested_start_date <  h.hour_end
),
classed AS (
  SELECT
    hour_start,
    hour_end,
    CASE
      WHEN r.phase_code = 'C' THEN
        CASE
          WHEN NVL(r.actual_completion_date, r.requested_start_date) < hour_end THEN
            CASE
              WHEN r.status_code = 'C'       THEN 'completed_ok'
              WHEN r.status_code IN ('G','W') THEN 'completed_warning'
              WHEN r.status_code IN ('T','X','D') THEN 'completed_terminated'
              WHEN r.status_code = 'E'       THEN 'completed_error'
              ELSE                                 'completed_error'
            END
          ELSE
            CASE
              WHEN r.status_code = 'C'       THEN 'completed_1hr'
              WHEN r.status_code IN ('G','W') THEN 'completed_warn_1hr'
              WHEN r.status_code IN ('T','X','D') THEN 'terminated_1hr'
              ELSE                                 'error_1hr'
            END
        END
      WHEN r.actual_completion_date IS NOT NULL
       AND r.actual_completion_date < hour_end THEN
        CASE
          WHEN r.status_code IN ('G','W') THEN 'completed_warning'
          WHEN r.status_code IN ('T','X','D') THEN 'completed_terminated'
          WHEN r.status_code = 'E'       THEN 'completed_error'
          ELSE                                 'completed_ok'
        END
       WHEN r.phase_code = 'R'
        AND r.actual_start_date >= hour_start
        AND r.actual_start_date < hour_end THEN
        'running'
      WHEN r.phase_code = 'I' OR (r.phase_code = 'P' AND r.status_code = 'I') THEN
        'inactive'
      WHEN r.phase_code = 'P' AND r.requested_start_date <= SYSDATE THEN
        'pending'
    END AS bucket
  FROM req r
),
agg_lines AS (
  SELECT
    hour_start, hour_end,
    COUNT(*) AS scheduled,
    SUM(CASE WHEN bucket='completed_ok'       THEN 1 ELSE 0 END) AS completed_ok,
    SUM(CASE WHEN bucket='completed_1hr'      THEN 1 ELSE 0 END) AS completed_1hr,
    SUM(CASE WHEN bucket='completed_warning'    THEN 1 ELSE 0 END) AS completed_warning,
    SUM(CASE WHEN bucket='completed_warn_1hr'   THEN 1 ELSE 0 END) AS completed_warn_1hr,
    SUM(CASE WHEN bucket='completed_error'      THEN 1 ELSE 0 END) AS completed_error_line,
    SUM(CASE WHEN bucket='completed_terminated' THEN 1 ELSE 0 END) AS completed_terminated_line,
    SUM(CASE WHEN bucket='error_1hr'            THEN 1 ELSE 0 END) AS error_1hr,
    SUM(CASE WHEN bucket='terminated_1hr'       THEN 1 ELSE 0 END) AS terminated_1hr,
    SUM(CASE WHEN bucket='running'              THEN 1 ELSE 0 END) AS running,
    SUM(CASE WHEN bucket='pending'              THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN bucket='inactive'             THEN 1 ELSE 0 END) AS inactive
  FROM classed
  GROUP BY hour_start, hour_end
),
comp AS (
  SELECT h.hour_start, h.hour_end,
         CASE
           WHEN r.status_code = 'E'       THEN 'completed_error'
           WHEN r.status_code IN ('T','X','D') THEN 'completed_terminated'
         END AS bucket
  FROM hours h
  JOIN apps.fnd_concurrent_requests r
    ON r.phase_code = 'C'
   AND r.actual_completion_date >= h.hour_start
   AND r.actual_completion_date <  h.hour_end
),
agg_bars AS (
  SELECT
    hour_start, hour_end,
    SUM(CASE WHEN bucket='completed_error'     THEN 1 ELSE 0 END) AS completed_error,
    SUM(CASE WHEN bucket='completed_terminated' THEN 1 ELSE 0 END) AS completed_terminated
  FROM comp
  GROUP BY hour_start, hour_end
)
SELECT
  TO_CHAR(l.hour_start,'HH24') AS hour_start,
  TO_CHAR(l.hour_end  ,'HH24') AS hour_end,
  NVL(l.scheduled,0)           AS scheduled,
  NVL(l.completed_ok,0)        AS completed_ok,
  NVL(l.completed_1hr,0)       AS completed_1hr,
  NVL(l.completed_warning,0)   AS completed_warning,
  NVL(l.completed_warn_1hr,0)  AS completed_warn_1hr,
  NVL(l.running,0)             AS running,
  NVL(l.pending,0)             AS pending,
  NVL(l.inactive,0)            AS inactive,
  NVL(l.error_1hr,0)           AS error_1hr,
  NVL(l.terminated_1hr,0)      AS terminated_1hr,
  NVL(b.completed_error,0)       AS completed_error,
  NVL(b.completed_terminated,0)  AS completed_terminated
FROM agg_lines l
LEFT JOIN agg_bars b
  ON b.hour_start = l.hour_start
 AND b.hour_end   = l.hour_end
ORDER BY l.hour_start
`,

  // 3) Long running
  SQL_LONG_RUNNING: `
SELECT
  r.request_id,
  fcpv.user_concurrent_program_name AS program_name,
  r.actual_start_date,
  (SYSDATE - r.actual_start_date)*24 AS running_hours,
  r.phase_code,
  r.status_code
FROM apps.fnd_concurrent_requests r
JOIN apps.fnd_concurrent_programs_vl fcpv
  ON fcpv.concurrent_program_id = r.concurrent_program_id
WHERE r.phase_code = 'R'
  AND r.actual_start_date <= SYSDATE - (8/24)
ORDER BY running_hours DESC
`,

  // 4) Terminated
  SQL_TERMINATED_ROWS: `
WITH p AS ( SELECT SYSDATE - (:hours/24) AS win_start FROM dual )
SELECT
  r.request_id,
  fcpv.user_concurrent_program_name AS program_name,
  r.actual_start_date,
  r.actual_completion_date,
  r.status_code
FROM apps.fnd_concurrent_requests r
JOIN apps.fnd_concurrent_programs_vl fcpv
  ON fcpv.concurrent_program_id = r.concurrent_program_id
WHERE r.phase_code='C'
  AND r.status_code IN ('T','X','D')
  AND r.actual_completion_date >= (SELECT win_start FROM p)
ORDER BY r.actual_completion_date DESC
`,

  // 5) Event Bubbles
  SQL_EVENT_BUBBLES: `
SELECT
    TO_CHAR(r.actual_completion_date, 'HH24:MI') AS event_time,
    r.status_code
FROM apps.fnd_concurrent_requests r
WHERE r.actual_completion_date >= TRUNC(SYSDATE,'HH24') - NUMTODSINTERVAL(:hours-1,'HOUR')
  AND r.phase_code = 'C'
  AND r.status_code IN ('E')
ORDER BY r.actual_completion_date
`

};
