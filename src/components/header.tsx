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
  appName: string,
  userLogin: string
}>;

export function Header({ appName, userLogin }: Props) {
  const mediaQueryRef = useRef<MediaQueryList>(
    window.matchMedia(ResponsiveUtils.getFrameworkQuery("sm-only")!)
  );

  const [isSmallWidth, setIsSmallWidth] = useState(mediaQueryRef.current.matches);

  useEffect(() => {
    mediaQueryRef.current.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQueryRef.current.removeEventListener("change", handleMediaQueryChange);
  }, []);

  function handleMediaQueryChange(e: MediaQueryListEvent) {
    setIsSmallWidth(e.matches);
  }

  function getDisplayType() {
    return isSmallWidth ? "icons" : "all";
  }

  function getEndIconClass() {
    return isSmallWidth
      ? "oj-icon demo-appheader-avatar"
      : "oj-component-icon oj-button-menu-dropdown-icon";
  }

  const currentRoute = location.hash.replace("#/", "") || "dashboard";

  return (
    <header role="banner" class="oj-web-applayout-header">
      <div class="oj-web-applayout-max-width oj-flex-bar oj-sm-align-items-center">

        {/* LEFT SECTION */}
        <div class="oj-flex-bar-middle oj-sm-align-items-baseline" style="gap:12px;">
          <img
            class="oj-icon demo-oracle-icon"
            title="Oracle Logo"
            alt="Oracle Logo"
          />
          <h1 class="oj-sm-only-hide oj-web-applayout-header-title">
            {appName}
          </h1>

          {/* ★★★ Navigation Links ★★★ */}
          <nav class="header-nav oj-sm-only-hide">
            <a
              href="#/dashboard"
              class={currentRoute === "dashboard" ? "nav-active" : ""}
            >
              Dashboard
            </a>
            <a
              href="#/requests"
              class={currentRoute === "requests" ? "nav-active" : ""}
            >
              Requests
            </a>
            <a
              href="#/analysis"
              class={currentRoute === "analysis" ? "nav-active" : ""}
            >
              Analysis
            </a>
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div class="oj-flex-bar-end">
          <oj-toolbar>
            <oj-menu-button
              id="userMenu"
              display={getDisplayType()}
              chroming="borderless"
            >
              <span>{userLogin}</span>
              <span slot="endIcon" class={getEndIconClass()}></span>
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
