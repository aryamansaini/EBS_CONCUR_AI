/**
 * @license
 */
import { h } from "preact";
import { useRef, useState, useEffect } from "preact/hooks";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import "ojs/ojtoolbar";
import "ojs/ojmenu";
import "ojs/ojbutton";

type Props = Readonly<{
  appName: string;
  userLogin: string;
}>;

export function Header({ appName, userLogin }: Props) {
  // media query
  const mediaQueryRef = useRef<MediaQueryList>(
    window.matchMedia(ResponsiveUtils.getFrameworkQuery("sm-only")!)
  );

  const [isSmallWidth, setIsSmallWidth] = useState(mediaQueryRef.current.matches);

  useEffect(() => {
    const mq = mediaQueryRef.current;
    // cross-browser: addEventListener may not exist on older MQLs
    const handle = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsSmallWidth("matches" in e ? e.matches : (e as MediaQueryList).matches);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handle as EventListener);
      return () => mq.removeEventListener("change", handle as EventListener);
    } else {
      // fallback for older browsers
      // @ts-ignore - old API
      mq.addListener(handle);
      return () => {
        // @ts-ignore - old API
        mq.removeListener(handle);
      };
    }
  }, []);

  function getDisplayType() {
    return isSmallWidth ? "icons" : "all";
  }

  function getEndIconClass() {
    return isSmallWidth
      ? "oj-icon demo-appheader-avatar"
      : "oj-component-icon oj-button-menu-dropdown-icon";
  }

  // Route stored in state so component re-renders when hash changes
  const initialRoute = (location.hash.replace("#/", "") || "dashboard").toLowerCase();
  const [route, setRoute] = useState<string>(initialRoute);

  useEffect(() => {
    const onHashChange = () => {
      const r = (location.hash.replace("#/", "") || "dashboard").toLowerCase();
      setRoute(r);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <header role="banner" className="oj-web-applayout-header">
      <div className="oj-web-applayout-max-width oj-flex-bar oj-sm-align-items-center">
        {/* LEFT SECTION */}
        <div className="oj-flex-bar-middle oj-sm-align-items-baseline" style={{ gap: "12px" }}>
          <img className="oj-icon demo-oracle-icon" title="Oracle Logo" alt="Oracle Logo" />
          <h1 className="oj-sm-only-hide oj-web-applayout-header-title">{appName}</h1>

          {/* Navigation Links */}
          <nav className="header-nav oj-sm-only-hide">
            <a href="#/dashboard" className={route === "dashboard" ? "nav-active" : ""}>
              Dashboard
            </a>
            <a href="#/requests" className={route === "requests" ? "nav-active" : ""}>
              Requests
            </a>
            <a href="#/analysis" className={route === "analysis" ? "nav-active" : ""}>
              Analysis
            </a>
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div className="oj-flex-bar-end">
          <oj-toolbar>
            <oj-menu-button id="userMenu" display={getDisplayType()} chroming="borderless">
              <span>{userLogin}</span>
              <span slot="endIcon" className={getEndIconClass()}></span>
              <oj-menu id="menu1" slot="menu">
                <oj-option value="pref">Preferences</oj-option>
                <oj-option value="help">Help</oj-option>
                <oj-option value="about">About</oj-option>
                <oj-option value="out">Sign Out</oj-option>
              </oj-menu>
            </oj-menu-button>
          </oj-toolbar>
        </div>
      </div>
    </header>
  );
}
