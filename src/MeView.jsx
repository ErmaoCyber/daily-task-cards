import React, { useState } from "react";

const lifeItems = [
  "Build and ship my own product",
  "Get a software job in New Zealand",
  "Run a half marathon",
  "Learn to surf",
];

const reviewStats = {
  Week: {
    period: "SEP 14 — SEP 20",
    done: 18,
    tomorrow: 4,
    letgo: 2,
    sleep: "7h 08m",
    steps: "8,421",
    moved: "Java Study · 3 times",
  },
  Month: {
    period: "SEPTEMBER 2026",
    done: 67,
    tomorrow: 14,
    letgo: 8,
    sleep: "7h 02m",
    steps: "8,106",
    moved: "Java Study · 7 times",
  },
  Year: {
    period: "2026",
    done: 412,
    tomorrow: 86,
    letgo: 41,
    sleep: "7h 05m",
    steps: "7,934",
    moved: "Java Study · 18 times",
  },
};

function MeHome({ onOpen }) {
  return (
    <>
      <header className="me-heading">
        <span className="eyebrow">YOUR SPACE</span>
        <h1>Me.</h1>
        <p>
          The things you want, the way your days have been,
          and the data that belongs to you.
        </p>
      </header>

      <div className="me-sections">
        <button
          type="button"
          className="me-feature me-life-feature"
          onClick={() => onOpen("life")}
        >
          <div>
            <span className="eyebrow">INTENT</span>
            <h2>Life List</h2>
            <p>{lifeItems.length} things I want to make real.</p>
          </div>
          <span className="me-arrow">→</span>
        </button>

        <button
          type="button"
          className="me-feature"
          onClick={() => onOpen("reviews")}
        >
          <div>
            <span className="eyebrow">LOOK BACK</span>
            <h2>Reviews</h2>
            <p>Week · Month · Year</p>
          </div>
          <div className="me-review-preview" aria-hidden="true">
            <strong>18</strong>
            <span>Done this week</span>
          </div>
          <span className="me-arrow">→</span>
        </button>

        <button
          type="button"
          className="me-feature me-data-feature"
          onClick={() => onOpen("data")}
        >
          <div>
            <span className="eyebrow">MY DATA</span>
            <h2>Health & Data</h2>
            <p>Sleep · Steps · future integrations</p>
          </div>
          <span className="me-arrow">→</span>
        </button>
      </div>
    </>
  );
}

function LifeList({ onBack }) {
  return (
    <section className="me-detail">
      <button type="button" className="me-back" onClick={onBack}>
        ← Me
      </button>

      <div className="me-detail-heading">
        <div>
          <span className="eyebrow">INTENT</span>
          <h1>Life List</h1>
        </div>
        <button type="button" className="deck-add" aria-label="Add life item">
          +
        </button>
      </div>

      <p className="me-detail-copy">
        No deadline by default. These are directions, not today's tasks.
      </p>

      <div className="life-list">
        {lifeItems.map((item, index) => (
          <button type="button" className="life-item" key={item}>
            <span className="life-circle" aria-hidden="true" />
            <strong>{item}</strong>
            <small>{index === 1 ? "In progress" : "Someday"}</small>
          </button>
        ))}
      </div>

      <p className="me-quiet-note">
        Later, a Life List item can become one or more daily Cards.
      </p>
    </section>
  );
}

function Reviews({ onBack }) {
  const [range, setRange] = useState("Week");
  const stats = reviewStats[range];

  return (
    <section className="me-detail reviews-view">
      <button type="button" className="me-back" onClick={onBack}>
        ← Me
      </button>

      <div className="me-detail-heading">
        <div>
          <span className="eyebrow">LOOK BACK</span>
          <h1>Reviews</h1>
        </div>
      </div>

      <div className="review-tabs" role="tablist" aria-label="Review range">
        {Object.keys(reviewStats).map((label) => (
          <button
            type="button"
            role="tab"
            aria-selected={range === label}
            key={label}
            onClick={() => setRange(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="review-period">
        <button type="button" aria-label="Previous period">‹</button>
        <strong>{stats.period}</strong>
        <button type="button" aria-label="Next period">›</button>
      </div>

      <article className="review-card">
        <div className="review-outcomes">
          <div><strong>{stats.done}</strong><span>Done</span></div>
          <div><strong>{stats.tomorrow}</strong><span>Tomorrow</span></div>
          <div><strong>{stats.letgo}</strong><span>Let Go</span></div>
        </div>

        <div className="review-health">
          <div><span>AVG SLEEP</span><strong>{stats.sleep}</strong></div>
          <div><span>AVG STEPS</span><strong>{stats.steps}</strong></div>
        </div>

        <div className="review-observation">
          <span>MOST MOVED</span>
          <strong>{stats.moved}</strong>
        </div>
      </article>

      <p className="me-quiet-note">
        A review describes what happened. It does not score the week.
      </p>
    </section>
  );
}

function MyData({ onBack }) {
  return (
    <section className="me-detail">
      <button type="button" className="me-back" onClick={onBack}>
        ← Me
      </button>

      <div className="me-detail-heading">
        <div>
          <span className="eyebrow">MY DATA</span>
          <h1>Health & Data</h1>
        </div>
      </div>

      <div className="data-cards">
        <article>
          <span>LAST 7 DAYS · SLEEP</span>
          <strong>7h 08m</strong>
          <small>average</small>
        </article>
        <article>
          <span>LAST 7 DAYS · STEPS</span>
          <strong>8,421</strong>
          <small>average per day</small>
        </article>
      </div>

      <button type="button" className="integration-row">
        <div>
          <strong>Health integrations</strong>
          <span>Apple Health and other sources later</span>
        </div>
        <span>→</span>
      </button>

      <p className="me-quiet-note">
        Prototype data only. Nothing is connected yet.
      </p>
    </section>
  );
}

export default function MeView() {
  const [view, setView] = useState("home");

  return (
    <section className="me-view">
      {view === "home" && <MeHome onOpen={setView} />}
      {view === "life" && <LifeList onBack={() => setView("home")} />}
      {view === "reviews" && <Reviews onBack={() => setView("home")} />}
      {view === "data" && <MyData onBack={() => setView("home")} />}
    </section>
  );
}
