/**
 * longrunning Page
 */
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
  fetchLongRunning,
  fetchTerminated
} from "../../../lib/api";



import ArrayDataProvider = require("ojs/ojarraydataprovider");



export default function LongRunningView() {
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

      <h3>Long-running (&gt; 8 hours)</h3>
      <oj-table data={new ArrayDataProvider(longRunning, { keyAttributes: "request_id" })}
                columns={[
                  { headerText: "Req ID", field: "request_id" },
                  { headerText: "Program", field: "program_name" },
                  { headerText: "Start", field: "actual_start_date" },
                  { headerText: "Hours", field: "running_hours" },
                  { headerText: "Status", field: "status_code" }
                ]}></oj-table>

      
    </div>
  );
}
