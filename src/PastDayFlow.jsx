import React from "react";

function labelDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

export default function PastDayFlow({
  day,
  resolution,
  onAction,
  onBack,
}) {
  const card = resolution.remaining[0];

  return (
    <section className="past-day-flow">
      <button type="button" className="me-back" onClick={onBack}>
        ← Calendar
      </button>

      <div className="past-day-flow-heading">
        <span className="eyebrow">UNFINISHED DAY</span>
        <h1>{labelDate(day.date)}</h1>
        <p>
          Finish only what was left unresolved. This does not reopen the whole day.
        </p>
      </div>

      <div className="past-day-progress">
        <span>{resolution.remaining.length} left</span>
        <span>
          {resolution.done.length +
            resolution.broughtForward.length +
            resolution.letgo.length}{" "}
          resolved
        </span>
      </div>

      {card && (
        <article className="past-day-card">
          <span>{card.time || "Anytime"}</span>
          <h2>{card.title}</h2>
        </article>
      )}

      <div className="past-day-actions" aria-label="Resolve this card">
        <button type="button" onClick={() => onAction("done")}>
          <span>✓</span>
          <strong>Done</strong>
          <small>I did this that day</small>
        </button>

        <button type="button" onClick={() => onAction("today")}>
          <span>→</span>
          <strong>Bring to Today</strong>
          <small>I still want to do this</small>
        </button>

        <button type="button" onClick={() => onAction("letgo")}>
          <span>↓</span>
          <strong>Let go</strong>
          <small>I am done carrying this</small>
        </button>
      </div>

      <p className="past-day-note">
        Past days describe what happened. They are never scored.
      </p>
    </section>
  );
}
