import React, { useEffect, useMemo, useRef, useState } from "react";

const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function parseDay(day) {
  return new Date(`${day}T12:00:00`);
}

function dayKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function monthStart(day) {
  const value = parseDay(day);
  return new Date(value.getFullYear(), value.getMonth(), 1, 12);
}

function shiftMonth(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
}

function dateLabel(day) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parseDay(day)).toUpperCase();
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSteps(value) {
  return Number(value || 0).toLocaleString("en-NZ");
}

function Marker({ kind, count }) {
  if (kind === "past-open") {
    return (
      <span className="calendar-markers" aria-hidden="true">
        <i className="calendar-marker marker-open-day" />
      </span>
    );
  }

  const visible = Math.min(Math.max(count, 0), 3);
  if (!visible) return null;

  return (
    <span className="calendar-markers" aria-hidden="true">
      {Array.from({ length: visible }, (_, index) => (
        <i
          key={index}
          className={`calendar-marker marker-${kind}`}
        />
      ))}
    </span>
  );
}

function PastPanel({ record }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [record.date]);

  const section = (title, mark, items) =>
    items.length ? (
      <div className="calendar-day-detail-section">
        <span className="eyebrow">{title}</span>
        {items.map((item) => (
          <div className="calendar-day-detail-row" key={`${title}-${item}`}>
            <span>{mark}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    ) : null;

  return (
    <>
      <div className="calendar-outcomes">
        <span><strong>{record.done.length}</strong> Done</span>
        <span><strong>{record.tomorrow.length}</strong> Tomorrow</span>
        <span><strong>{record.letgo.length}</strong> Let Go</span>
      </div>

      <div className="calendar-metrics">
        <div>
          <span>Sleep</span>
          <strong>{record.sleep}</strong>
        </div>
        <div>
          <span>Steps</span>
          <strong>{formatSteps(record.steps)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="calendar-text-action"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Hide day" : "View day"} <span>{expanded ? "↑" : "↓"}</span>
      </button>

      {expanded && (
        <div className="calendar-day-detail">
          {section("DONE", "✓", record.done)}
          {section("TOMORROW", "←", record.tomorrow)}
          {section("LET GO", "↓", record.letgo)}
        </div>
      )}
    </>
  );
}

export default function CalendarView({
  today,
  cards,
  history,
  openPastDays = [],
  onOpenToday,
  onAddCard,
  onEditCard,
}) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthCursor, setMonthCursor] = useState(() => monthStart(today));
  const [monthDrag, setMonthDrag] = useState(0);
  const [monthDragging, setMonthDragging] = useState(false);
  const [monthAnimating, setMonthAnimating] = useState(false);
  const monthOrigin = useRef(null);
  const ignoreDayClick = useRef(false);
  const monthTimer = useRef(null);

  useEffect(
    () => () => clearTimeout(monthTimer.current),
    [],
  );

  const historyByDate = useMemo(
    () => new Map(history.map((record) => [record.date, record])),
    [history],
  );

  const openPastByDate = useMemo(
    () => new Map(openPastDays.map((item) => [item.date, item])),
    [openPastDays],
  );

  const cells = useMemo(() => {
    const first = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      1,
      12,
    );
    const mondayOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [monthCursor]);

  const cardsForDate = (date) =>
    cards.filter((card) => card.scheduledDate === date);

  function participatingCount(date) {
    const record = historyByDate.get(date);
    if (record) {
      return (
        record.done.length +
        record.tomorrow.length +
        record.letgo.length
      );
    }

    if (date === today) {
      return new Set(
        cards
          .filter(
            (card) =>
              card.scheduledDate === date ||
              card.movedFrom === date,
          )
          .map((card) => card.id),
      ).size;
    }

    const openPast = openPastByDate.get(date);
    if (openPast) return openPast.cardCount;

    return cardsForDate(date).length;
  }

  function stateFor(date) {
    if (date === today) return "today";
    if (date < today) {
      if (historyByDate.has(date)) return "past-closed";
      if (openPastByDate.has(date)) return "past-open";
      return "past-empty";
    }
    return "future";
  }

  function selectDay(date) {
    setSelectedDate(date);
    const value = parseDay(date);

    if (
      value.getFullYear() !== monthCursor.getFullYear() ||
      value.getMonth() !== monthCursor.getMonth()
    ) {
      setMonthCursor(
        new Date(value.getFullYear(), value.getMonth(), 1, 12),
      );
    }
  }

  function moveMonth(amount) {
    const next = shiftMonth(monthCursor, amount);
    setMonthCursor(next);
    setSelectedDate(dayKey(next));
  }

  function beginMonthSwipe(event) {
    if (
      monthAnimating ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    monthOrigin.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setMonthDragging(true);
    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function moveMonthSwipe(event) {
    const start = monthOrigin.current;
    if (start?.id !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (Math.abs(dx) < Math.abs(dy)) return;

    setMonthDrag(
      Math.max(-120, Math.min(120, dx)),
    );
  }

  function finishMonthSwipe(event) {
    const start = monthOrigin.current;
    if (start?.id !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    monthOrigin.current = null;
    setMonthDragging(false);

    const horizontal =
      Math.abs(dx) > Math.abs(dy) * 1.2;
    const shouldMove =
      horizontal && Math.abs(dx) > 48;

    if (!shouldMove) {
      setMonthAnimating(true);
      setMonthDrag(0);
      monthTimer.current = setTimeout(
        () => setMonthAnimating(false),
        220,
      );
      return;
    }

    const direction = dx < 0 ? 1 : -1;
    ignoreDayClick.current = true;
    setMonthAnimating(true);
    setMonthDrag(dx < 0 ? -150 : 150);

    monthTimer.current = setTimeout(() => {
      const next = shiftMonth(
        monthCursor,
        direction,
      );
      setMonthCursor(next);
      setSelectedDate(dayKey(next));

      setMonthDrag(direction > 0 ? 55 : -55);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMonthDrag(0);
        });
      });

      monthTimer.current = setTimeout(() => {
        setMonthAnimating(false);
        ignoreDayClick.current = false;
      }, 240);
    }, 135);
  }

  function cancelMonthSwipe() {
    monthOrigin.current = null;
    setMonthDragging(false);
    setMonthAnimating(true);
    setMonthDrag(0);

    monthTimer.current = setTimeout(
      () => setMonthAnimating(false),
      220,
    );
  }

  function returnToToday() {
    setMonthCursor(monthStart(today));
    setSelectedDate(today);
  }

  const selectedState = stateFor(selectedDate);
  const selectedRecord = historyByDate.get(selectedDate);
  const selectedOpenPast = openPastByDate.get(selectedDate);
  const selectedCards = cardsForDate(selectedDate);

  const todayOpen = cards.filter(
    (card) =>
      card.scheduledDate === today && !card.status,
  );
  const todayDone = cards.filter(
    (card) =>
      card.scheduledDate === today &&
      card.status === "done",
  );
  const todayTomorrow = cards.filter(
    (card) =>
      card.movedFrom === today &&
      card.status === "tomorrow",
  );

  return (
    <section className="calendar-view">
      <div className="calendar-heading">
        <div>
          <span className="eyebrow">YOUR DAYS</span>
          <h1>Calendar.</h1>
        </div>
        <button
          type="button"
          className="calendar-today-button"
          onClick={returnToToday}
        >
          Today
        </button>
      </div>

      <div
        className={`calendar-month ${
          monthDragging ? "is-month-dragging" : ""
        } ${monthAnimating ? "is-month-animating" : ""}`}
        onPointerDown={beginMonthSwipe}
        onPointerMove={moveMonthSwipe}
        onPointerUp={finishMonthSwipe}
        onPointerCancel={cancelMonthSwipe}
        onLostPointerCapture={cancelMonthSwipe}
      >
        <div
          className="calendar-month-sheet"
          style={{ "--month-drag": `${monthDrag}px` }}
        >
          <div className="calendar-month-bar">
            <strong>{monthLabel(monthCursor)}</strong>
          </div>

          <div className="calendar-weekdays" aria-hidden="true">
            {weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {cells.map((value) => {
              const date = dayKey(value);
              const state = stateFor(date);
              const count = participatingCount(date);
              const inMonth =
                value.getMonth() === monthCursor.getMonth();
              const selected = date === selectedDate;

              const markerKind =
                state === "future"
                  ? "future"
                  : state === "today"
                    ? "today"
                    : state === "past-closed"
                      ? "past"
                      : state;

              return (
                <button
                  type="button"
                  key={date}
                  className={`calendar-day ${
                    inMonth ? "" : "outside-month"
                  } ${selected ? "selected-day" : ""}`}
                  aria-label={`${dateLabel(date)}, ${count} cards`}
                  aria-pressed={selected}
                  onClick={() => {
                    if (ignoreDayClick.current) return;
                    selectDay(date);
                  }}
                >
                  <span className="calendar-day-number">
                    {value.getDate()}
                  </span>
                  <Marker kind={markerKind} count={count} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="calendar-day-panel" key={selectedDate}>
        <div className="calendar-day-panel-heading">
          <div>
            <span className="eyebrow">{dateLabel(selectedDate)}</span>
            <h2>
              {selectedState === "future"
                ? "Planned"
                : selectedState === "today"
                  ? "Today"
                  : selectedState === "past-closed"
                    ? "Day Card"
                    : selectedState === "past-open"
                      ? "Still open"
                      : "No record"}
            </h2>
          </div>

          {selectedState === "future" && (
            <button
              type="button"
              className="deck-add calendar-add"
              aria-label={`Add card on ${selectedDate}`}
              onClick={() => onAddCard(selectedDate)}
            >
              +
            </button>
          )}
        </div>

        {selectedState === "past-closed" && selectedRecord && (
          <PastPanel record={selectedRecord} />
        )}

        {selectedState === "today" && (
          <>
            <div className="calendar-outcomes today-calendar-outcomes">
              <span><strong>{todayOpen.length}</strong> Still Today</span>
              <span><strong>{todayDone.length}</strong> Done</span>
              <span><strong>{todayTomorrow.length}</strong> Tomorrow</span>
            </div>
            <button
              type="button"
              className="primary calendar-primary"
              onClick={onOpenToday}
            >
              Open Today <span>→</span>
            </button>
          </>
        )}

        {selectedState === "future" && (
          <>
            {selectedCards.length ? (
              <div className="calendar-planned-list">
                {selectedCards.map((card) => (
                  <button
                    type="button"
                    className="calendar-planned-card"
                    key={card.id}
                    onClick={() => onEditCard(card)}
                  >
                    <span>{card.time || "Anytime"}</span>
                    <strong>{card.title}</strong>
                  </button>
                ))}
              </div>
            ) : (
              <p className="calendar-empty-copy">
                Nothing planned yet.
              </p>
            )}

            <button
              type="button"
              className="calendar-text-action calendar-add-text"
              onClick={() => onAddCard(selectedDate)}
            >
              + Add Card
            </button>
          </>
        )}

        {selectedState === "past-open" && selectedOpenPast && (
          <div className="calendar-open-past">
            <p>{selectedOpenPast.note}</p>
            <span>
              {selectedOpenPast.cardCount} cards participated in this day.
            </span>
          </div>
        )}

        {selectedState === "past-empty" && (
          <p className="calendar-empty-copy">
            No Day Card was recorded for this date.
          </p>
        )}
      </section>
    </section>
  );
}
