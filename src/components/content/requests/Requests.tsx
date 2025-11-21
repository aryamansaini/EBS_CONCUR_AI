/**
 * Requests Page
 */
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
  fetchLongRunning,
  fetchTerminated
} from "../../../lib/api";



import ArrayDataProvider = require("ojs/ojarraydataprovider");

export default function Requests() {
  const [longRunning, setLongRunning] = useState<any[]>([]);
  const [terminated, setTerminated] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLongRunning(await fetchLongRunning());
    setTerminated(await fetchTerminated());
  }

  return (
    <div data-oj-binding-provider="preact">
      <h1>Request Details</h1>

      <h2>Long-running (&gt; 8 hours)</h2>
      <oj-table data={new ArrayDataProvider(longRunning, { keyAttributes: "request_id" })}
                columns={[
                  { headerText: "Req ID", field: "request_id" },
                  { headerText: "Program", field: "program_name" },
                  { headerText: "Start", field: "actual_start_date" },
                  { headerText: "Hours", field: "running_hours" },
                  { headerText: "Status", field: "status_code" }
                ]}></oj-table>

      <h2 style="margin-top:20px">Recently Terminated</h2>
      <oj-table data={new ArrayDataProvider(terminated, { keyAttributes: "request_id" })}
                columns={[
                  { headerText: "Req ID", field: "request_id" },
                  { headerText: "Program", field: "program_name" },
                  { headerText: "Started", field: "actual_start_date" },
                  { headerText: "Completed", field: "actual_completion_date" },
                  { headerText: "Status", field: "status_code" }
                ]}></oj-table>
    </div>
  );
}
