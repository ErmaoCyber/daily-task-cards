import React from "react";

function dateParts(date) {
  const value = new Date(`${date}T12:00:00`);

  return {
    label: new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(value),
  };
}

function formatSteps(value) {
  return Number(value || 0).toLocaleString("en-NZ");
}

function OutcomeCounts({ done, tomorrow, letgo }) {
  return (
    <div className="outcome-counts">
      <span>
        <strong>{done}</strong> Done
      </span>
      <span>
        <strong>{tomorrow}</strong> Tomorrow
      </span>
      <span>
        <strong>{letgo}</strong> Let Go
      </span>
    </div>
  );
}

function OutcomeSection({ title, mark, items }) {
  if (!items?.length) return null;

  return (
    <section className="closed-outcome-section">
      <span className="eyebrow">{title}</span>
      <div className="closed-outcome-list">
        {items.map((item) => (
          <div className="closed-outcome-row" key={`${title}-${item}`}>
            <span aria-hidden="true">{mark}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClosedDay({ record, onCalendar }) {
  const parts = dateParts(record.date);

  return (
    <section className="closed">
      <div className="closed-heading-row">
        <div className="closed-heading-copy">
          <div className="clear-icon">✓</div>
          <span className="eyebrow">DAY CLOSED</span>
          <h2>{parts.label}</h2>
          <p>This day is now part of your calendar.</p>
        </div>

        <button
          type="button"
          className="closed-calendar-link"
          onClick={onCalendar}
        >
          <span>Calendar</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>

      <article className="day-card-large">
        <OutcomeCounts
          done={record.done.length}
          tomorrow={record.tomorrow.length}
          letgo={record.letgo.length}
        />

        <div className="metrics">
          <div>
            <span>Sleep</span>
            <strong>{record.sleep}</strong>
          </div>
          <div>
            <span>Steps</span>
            <strong>{formatSteps(record.steps)}</strong>
          </div>
        </div>
      </article>

      <div className="closed-outcome-details">
        <OutcomeSection title="DONE" mark="✓" items={record.done} />
        <OutcomeSection
          title="TOMORROW"
          mark="←"
          items={record.tomorrow}
        />
        <OutcomeSection
          title="LET GO"
          mark="↓"
          items={record.letgo}
        />
      </div>

    </section>
  );
}
