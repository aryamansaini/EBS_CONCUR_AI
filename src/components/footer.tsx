/**
 * Professional Footer component
 * Replace your current Footer file with this
 */
import { h } from "preact";

type FooterLink = {
  name: string;
  linkId: string;
  linkTarget: string;
};

type Props = {
  links?: FooterLink[];
};

const _DEFAULT_LINKS: FooterLink[] = [
  {
    name: "About Oracle",
    linkId: "aboutOracle",
    linkTarget: "https://www.oracle.com/us/corporate/index.html#menu-about",
  },
  {
    name: "Contact Us",
    linkId: "contactUs",
    linkTarget: "https://www.oracle.com/us/corporate/contact/index.html",
  },
  {
    name: "Legal Notices",
    linkId: "legalNotices",
    linkTarget: "https://www.oracle.com/us/legal/index.html",
  },
  {
    name: "Terms Of Use",
    linkId: "termsOfUse",
    linkTarget: "https://www.oracle.com/us/legal/terms/index.html",
  },
  {
    name: "Your Privacy Rights",
    linkId: "yourPrivacyRights",
    linkTarget: "https://www.oracle.com/us/legal/privacy/index.html",
  },
];

export function Footer({ links = _DEFAULT_LINKS }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer" role="contentinfo" aria-label="Site footer">
      <div className="app-footer-inner oj-web-applayout-max-width">
        {/* Left: corporate / quick links */}
        <div className="footer-section footer-links" aria-label="Footer links">
          <div className="footer-logo-row">
            {/* optional: small oracle mark (SVG) */}
            <svg
              className="oracle-mark"
              width="82"
              height="18"
              viewBox="0 0 82 18"
              aria-hidden="true"
              focusable="false"
            >
              <rect width="82" height="18" fill="transparent" />
              {/* a subtle stylized mark — you can replace with an img tag */}
              <text x="0" y="14" fontSize="14" fontFamily="Arial,Helvetica,sans-serif" fill="#333">
                ORACLE
              </text>
            </svg>
            <div className="footer-title">EBS CONCUR AI</div>
          </div>

          <ul className="footer-link-list" role="list">
            {links.map((item) => (
              <li key={item.linkId}>
                <a
                  id={item.linkId}
                  href={item.linkTarget}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Middle: social / actions */}
        <div className="footer-section footer-social" aria-label="Follow or contact">
          <div className="connect-title">Connect with us</div>
          <div className="social-icons" role="list" aria-label="Social links">
            {/* Example icons — replace hrefs with real pages if needed */}
            <a
              className="social-icon"
              href="https://www.linkedin.com/company/oracle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Oracle on LinkedIn"
            >
              {/* LinkedIn SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M4.98 3a2 2 0 110 4 2 2 0 010-4zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-.9 1.8-1.7 3.7-1.7 4 0 4.8 2.6 4.8 6v7H19v-6.2c0-1.5 0-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V21H9z"/>
              </svg>
            </a>

            <a
              className="social-icon"
              href="https://twitter.com/Oracle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Oracle on Twitter"
            >
              {/* Twitter SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M22 5.9c-.6.3-1.2.6-1.9.7.7-.4 1.2-1 1.4-1.7-.7.4-1.5.7-2.4.9A4.2 4.2 0 0016 5c-2.3 0-4.1 2-3.6 4.2-3.3-.2-6.2-1.8-8.1-4.2-.8 1.4-.4 3.2 1 4.1-.6 0-1.2-.2-1.7-.5v.1c0 2 1.4 3.8 3.4 4.2-.5.1-1 .2-1.6.1.5 1.5 2 2.6 3.7 2.6A8.5 8.5 0 012 19.6a12 12 0 006.5 1.9c7.8 0 12-6.7 12-12.5v-.6c.8-.6 1.5-1.2 2-2z"/>
              </svg>
            </a>

            <a
              className="social-icon"
              href="https://www.oracle.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Oracle"
            >
              {/* Mail / contact SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M2 6v12h20V6l-10 6L2 6zM4 8.2l8 4.8 8-4.8V18H4V8.2z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right: legal / small print */}
        <div className="footer-section footer-legal" aria-label="Legal information">
          <div className="legal-text">
            <div>
              Copyright © 2014, {year} Oracle and/or its affiliates. All rights reserved.
            </div>
            <div className="small-note">Use of this site constitutes acceptance of our terms and privacy policy.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
