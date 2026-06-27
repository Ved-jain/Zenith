import React from "react";

function Signup() {
  return (
    <section className="page-hero">
      <p className="eyebrow">Start analyzing</p>
      <h1>Your Zenith workspace is almost ready.</h1>
      <p>
        This prototype focuses on the product experience. The next production
        step would connect this page to authentication and onboarding.
      </p>
      <div className="signup-panel">
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Primary goal
          <select defaultValue="portfolio-review">
            <option value="portfolio-review">Review my portfolio</option>
            <option value="watchlist">Track a watchlist</option>
            <option value="insights">Understand portfolio signals</option>
          </select>
        </label>
        <button className="button button--primary" type="button">
          Request access
        </button>
      </div>
    </section>
  );
}

export default Signup;
