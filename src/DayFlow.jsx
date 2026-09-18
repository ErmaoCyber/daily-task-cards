import React, { useMemo, useState } from "react";

function dateParts(date) {
  const value = new Date(`${date}T12:00:00`);
  return {
    label: new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(value),
    weekday: new Intl.DateTimeFormat("en", {
      weekday: "short",
    })
      .format(value)
      .toUpperCase(),
    day: new Intl.DateTimeFormat("en", {
      day: "numeric",
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

export function ClosedDay({ record, onHistory }) {
  const parts = dateParts(record.date);

  return (
    <section className="closed">
      <div className="clear-icon">✓</div>
      <span className="eyebrow">DAY CLOSED</span>
      <h2>{parts.label}</h2>
      <p>This day is now part of your history.</p>

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

      <button className="text-button" onClick={onHistory}>
        Look back in History <span>→</span>
      </button>
    </section>
  );
}

function DayDetail({ record, onBack }) {
  const parts = dateParts(record.date);

  const section = (title, mark, items) =>
    items.length ? (
      <section className="detail-section">
        <span className="eyebrow">{title}</span>
        {items.map((item) => (
          <div
            className="detail-row"
            key={`${title}-${item}`}
          >
            <span>{mark}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </section>
    ) : null;

  return (
    <section className="history-detail">
      <button className="add-back" onClick={onBack}>
        ← History
      </button>

      <span className="eyebrow">DAY CARD</span>
      <h1>{parts.label}</h1>

      <div className="detail-metrics">
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
      </div>

      {section("DONE", "✓", record.done)}
      {section("TOMORROW", "←", record.tomorrow)}
      {section("LET GO", "↓", record.letgo)}
    </section>
  );
}

export function HistoryView({ history, onToday }) {
  const [selected, setSelected] = useState(null);

  const ordered = useMemo(
    () =>
      [...history].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    [history],
  );

  if (selected) {
    return (
      <DayDetail
        record={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <section className="history">
      <div className="history-heading">
        <div>
          <span className="eyebrow">LOOK BACK</span>
          <h1>Your days.</h1>
        </div>
        <button
          className="text-button history-today"
          onClick={onToday}
        >
          Today →
        </button>
      </div>

      <p className="history-intro">
        No grades. Just a quiet record of what actually happened.
      </p>

      <div className="history-list">
        {ordered.map((record) => {
          const parts = dateParts(record.date);

          return (
            <button
              className="history-card"
              key={record.id}
              onClick={() => setSelected(record)}
            >
              <span className="history-date">
                <span>{parts.weekday}</span>
                <strong>{parts.day}</strong>
              </span>

              <span className="history-info">
                <h3>{record.done.length} done</h3>
                <p>
                  {formatSteps(record.steps)} steps
                  <span>·</span>
                  {record.sleep} sleep
                </p>
              </span>

              <span className="history-outcomes">
                {record.tomorrow.length > 0 && (
                  <small>← {record.tomorrow.length}</small>
                )}
                {record.letgo.length > 0 && (
                  <small>↓ {record.letgo.length}</small>
                )}
              </span>

              <span className="history-chevron">›</span>
            </button>
          );
        })}
      </div>

      <p className="history-end">One day at a time.</p>
    </section>
  );
}
