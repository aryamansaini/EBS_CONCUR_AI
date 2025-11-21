/**
 * @license
 */
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import Dashboard from "./dashboard/Dashboard";
import Requests from "./requests/Requests";
import Analysis from "./analysis/Analysis";

export function Content() {
  const [route, setRoute] = useState<string>(getRouteFromHash());

  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div class="oj-web-applayout-max-width oj-web-applayout-content" data-oj-binding-provider="preact" style="padding:20px">
      {route === "dashboard" && <Dashboard />}
      {route === "requests" && <Requests />}
      {route === "analysis" && <Analysis />}
    </div>
  );
}

function getRouteFromHash() {
  const h = (location.hash || "#/dashboard").replace("#/", "");
  if (["dashboard", "requests", "analysis"].includes(h)) {
    return h;
  }
  return "dashboard";
}
