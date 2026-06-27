import React from "react";

const Funds = () => {
  const preferences = [
    ["Dashboard density", "Comfortable"],
    ["Default portfolio tab", "Holdings"],
    ["Insight tone", "Plain language"],
    ["Theme", "Light"],
  ];

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Workspace preferences</h1>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--two">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>Investor workspace</h2>
            </div>
          </div>
          <div className="settings-list">
            <div>
              <span>Name</span>
              <strong>Investor</strong>
            </div>
            <div>
              <span>Product focus</span>
              <strong>Portfolio analytics</strong>
            </div>
            <div>
              <span>Primary review</span>
              <strong>Health score and exposure</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Preferences</p>
              <h2>Display defaults</h2>
            </div>
          </div>
          <div className="settings-list">
            {preferences.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Account and funds</p>
            <h2>Capital summary</h2>
          </div>
        </div>
        <div className="metric-grid">
          <article className="metric-card">
            <span>Available cash</span>
            <strong>4,043.10</strong>
            <p>Ready for allocation</p>
          </article>
          <article className="metric-card">
            <span>Used margin</span>
            <strong>3,757.30</strong>
            <p>Tracked from current account data</p>
          </article>
          <article className="metric-card">
            <span>Collateral</span>
            <strong>0.00</strong>
            <p>No collateral configured</p>
          </article>
        </div>
      </section>
    </section>
  );
};

export default Funds;
