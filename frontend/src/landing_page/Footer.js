import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer" style={{ padding: "24px 0", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
      <div className="site-footer__inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link className="brand-mark" to="/">
          <span className="brand-mark__glyph">Z</span>
          <span>Zenith</span>
        </Link>

        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "'JetBrains Mono', monospace" }}>
          v1.0.0 // Engineering Build
        </p>
      </div>
    </footer>
  );
}

export default Footer;
