import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import AddCard from "./AddCard";
import { ClosedDay } from "./DayFlow";
import CalendarView from "./CalendarView";
import MeView from "./MeView";
import PastDayFlow from "./PastDayFlow";
import {
  createMockCards,
  createMockHistory,
  createMockOpenPastDays,
} from "./mockData";
import {
  gesture,
  localDate,
  plusDays,
  repeatLabel,
  rollToDay,
  sortCards,
} from "./planner";
import "./style.css";

const actions = {
  done: { arrow: "→", feedback: "Done" },
  tomorrow: { arrow: "←", feedback: "Tomorrow" },
  notnow: { arrow: "↑", feedback: "Not now" },
  letgo: { arrow: "↓", feedback: "Let go" },
};

function NavIcon({ type }) {
  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5.5" width="16" height="14" rx="3" />
        <path d="M8 3.5v4M16 3.5v4M4 9.5h16" />
        <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01M16 16.5h.01" />
      </svg>
    );
  }

  if (type === "me") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.75 19c.75-3.25 3-5 6.25-5s5.5 1.75 6.25 5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" />
      <circle className="nav-icon-core" cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function TodayDeck({
  cards,
  now,
  onAction,
  onEdit,
  onOverview,
  onAdd,
  finalizing = false,
  onExitFinalizing,
  showCoach = false,
}) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState(null);
  const origin = useRef(null);
  const timer = useRef(null);
  const card = cards[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  const rawIntent = leaving || gesture(drag, 12);
  const intent =
    finalizing && rawIntent === "notnow" ? null : rawIntent;

  const strength = leaving
    ? 1
    : Math.min(
        1,
        Math.max(
          0,
          (Math.max(Math.abs(drag.x), Math.abs(drag.y)) - 12) /
            90,
        ),
      );

  const drop =
    intent === "letgo"
      ? Math.min(Math.max(drag.y, 0) / 220, 1)
      : 0;

  const past =
    card.shortTime &&
    card.shortTime <
      `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;

  function commit(action) {
    if (leaving || (finalizing && action === "notnow")) return;

    setLeaving(action);
    timer.current = setTimeout(() => {
      onAction(card.id, action);
      setDrag({ x: 0, y: 0 });
      setLeaving(null);
    }, 230);
  }

  function cancel(event) {
    if (origin.current?.id !== event.pointerId) return;
    origin.current = null;
    setDrag({ x: 0, y: 0 });
  }

  function release(event) {
    if (origin.current?.id !== event.pointerId) return;

    const start = origin.current;
    const offset = {
      x: event.clientX - start.x,
      y: event.clientY - start.y,
    };

    origin.current = null;
    const action = gesture(offset);

    if (action && !(finalizing && action === "notnow")) {
      commit(action);
    } else {
      setDrag({ x: 0, y: 0 });
      if (
        start.travel < 8 &&
        Math.hypot(offset.x, offset.y) < 8
      ) {
        onEdit(card);
      }
    }
  }

  const transform = leaving
    ? `translate(${
        leaving === "done"
          ? 460
          : leaving === "tomorrow"
            ? -460
            : 0
      }px, ${
        leaving === "letgo"
          ? 460
          : leaving === "notnow"
            ? -460
            : 0
      }px) rotate(${
        leaving === "done"
          ? 18
          : leaving === "tomorrow"
            ? -18
            : 0
      }deg) scale(${leaving === "letgo" ? 0.94 : 1})`
    : `translate(${drag.x}px, ${drag.y}px) rotate(${
        drag.x / 24
      }deg) scale(${1 - drop * 0.04})`;

  return (
    <section
      className={`focus-view deck-mode ${
        finalizing ? "closing-mode" : ""
      }`}
    >
      <div className="deck-heading">
        {finalizing ? (
          <button
            className="deck-today-link"
            onClick={onExitFinalizing}
          >
            ← TODAY
          </button>
        ) : (
          <button
            className="deck-today-link deck-overview-link"
            onClick={onOverview}
            aria-label="Open Today overview"
          >
            <span className="deck-overview-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="5" y="6" width="13" height="12" rx="2.5" />
                <path d="M8 3.5h11a2 2 0 0 1 2 2v10.5" />
              </svg>
            </span>
            <span>Today</span>
            <small>Overview</small>
          </button>
        )}

        <div className="deck-heading-actions">
          <span className="deck-count">
            {finalizing
              ? `CLOSING · ${cards.length} LEFT`
              : `${cards.length - 1} ${
                  cards.length === 2 ? "card" : "cards"
                } left`}
          </span>
          {!finalizing && (
            <button
              className="deck-add"
              type="button"
              aria-label="Add Card"
              onClick={onAdd}
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="deck-area">
        <div className="deck-stack">
          {cards.length > 2 && (
            <div className="deck-back second-back" />
          )}
          {cards.length > 1 && (
            <div className="deck-back first-back" />
          )}

          <div
            className={`deck-gesture-feedback ${
              intent ? "is-visible" : ""
            }`}
            style={{ "--gesture-strength": intent ? strength : 0 }}
            aria-hidden="true"
          >
            {intent && (
              <span
                className="deck-feedback-content"
                key={intent}
              >
                <span className="deck-feedback-icon">
                  {intent === "done"
                    ? "✓"
                    : actions[intent].arrow}
                </span>
                <strong>{actions[intent].feedback}</strong>
              </span>
            )}
          </div>

          <article
            key={card.id}
            className={`focus-card ${
              leaving ? "leaving" : ""
            } ${origin.current ? "dragging" : ""}`}
            style={{
              transform,
              opacity: leaving ? 0 : 1 - drop * 0.25,
            }}
            role="button"
            tabIndex={leaving ? -1 : 0}
            aria-label={`Edit ${card.title}`}
            onKeyDown={(event) => {
              if (
                !leaving &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                onEdit(card);
              }
            }}
            onPointerDown={(event) => {
              if (
                leaving ||
                origin.current ||
                !event.isPrimary ||
                event.button !== 0
              ) {
                return;
              }

              origin.current = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                travel: 0,
              };
              event.currentTarget.setPointerCapture(
                event.pointerId,
              );
            }}
            onPointerMove={(event) => {
              const start = origin.current;
              if (start?.id !== event.pointerId) return;

              const offset = {
                x: event.clientX - start.x,
                y: event.clientY - start.y,
              };

              start.travel = Math.max(
                start.travel,
                Math.hypot(offset.x, offset.y),
              );
              setDrag(offset);
            }}
            onPointerUp={release}
            onPointerCancel={cancel}
            onLostPointerCapture={cancel}
          >
            <div className="card-content card-content-v2">
              <div className="card-meta-row">
                <span
                  className={`card-time ${
                    past ? "time-past" : ""
                  }`}
                >
                  {card.time || "Anytime"}
                </span>
                <span className="card-position">
                  1 / {cards.length}
                </span>
              </div>

              <div className="card-main">
                <h2>{card.title}</h2>
                {card.note && (
                  <p className="card-note">{card.note}</p>
                )}
              </div>

              <div className="card-context-row">
                {card.alert && (
                  <span className="card-context-chip">
                    <span aria-hidden="true">◷</span>
                    {card.alert === "At time"
                      ? "Reminder at time"
                      : card.alert}
                  </span>
                )}

                {card.repeat && (
                  <span className="card-context-chip">
                    <span aria-hidden="true">↻</span>
                    {repeatLabel(card.repeat)}
                  </span>
                )}

                {!card.alert && !card.repeat && (
                  <span className="card-context-chip card-context-quiet">
                    {card.time ? "Scheduled" : "Flexible time"}
                  </span>
                )}
              </div>
            </div>

            {showCoach && !finalizing && (
              <div
                className="gesture-coach"
                aria-label="Card gesture guide"
              >
                <span className="coach-up">↑ Not now</span>
                <span className="coach-left">← Tomorrow</span>
                <span className="coach-right">Done →</span>
                <span className="coach-down">↓ Let Go</span>
              </div>
            )}
          </article>
        </div>
      </div>

      <div className="focus-caption">
        {finalizing
          ? "One final decision for each card."
          : "One card at a time."}
      </div>
    </section>
  );
}

function OverviewDeck({
  cards,
  selectedId,
  onEnter,
}) {
  const initialIndex = Math.max(
    0,
    cards.findIndex((card) => card.id === selectedId),
  );

  const [selectedIndex, setSelectedIndex] =
    useState(initialIndex);
  const [dragging, setDragging] = useState(false);
  const [enteringId, setEnteringId] = useState(null);
  const origin = useRef(null);
  const ignoreClick = useRef(false);
  const timer = useRef(null);
  const wheelAt = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!cards.length) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex((current) =>
      ((current % cards.length) + cards.length) %
      cards.length,
    );
  }, [cards.length]);

  useEffect(() => {
    const nextIndex = cards.findIndex(
      (card) => card.id === selectedId,
    );
    if (nextIndex >= 0) {
      setSelectedIndex(nextIndex);
    }
  }, [selectedId, cards.length]);

  function wrapIndex(index) {
    if (!cards.length) return 0;
    return ((index % cards.length) + cards.length) %
      cards.length;
  }

  function moveSelection(step) {
    if (cards.length <= 1) return;
    setSelectedIndex((current) =>
      wrapIndex(current + step),
    );
  }

  function enter(card) {
    if (!card || enteringId) return;

    setEnteringId(card.id);
    timer.current = setTimeout(
      () => onEnter(card.id),
      250,
    );
  }

  function begin(event) {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      enteringId
    ) {
      return;
    }

    origin.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function release(event) {
    const start = origin.current;
    if (start?.id !== event.pointerId) return;

    const dy = event.clientY - start.y;
    const dx = event.clientX - start.x;
    const elapsed = Math.max(
      1,
      performance.now() - start.time,
    );
    const velocity = dy / elapsed;

    origin.current = null;
    setDragging(false);

    const vertical =
      Math.abs(dy) > Math.abs(dx) * 1.15;
    const shouldMove =
      vertical &&
      (Math.abs(dy) > 32 ||
        Math.abs(velocity) > 0.3);

    if (shouldMove) {
      ignoreClick.current = true;
      moveSelection(dy < 0 ? 1 : -1);

      window.setTimeout(() => {
        ignoreClick.current = false;
      }, 110);
    }
  }

  function cancel(event) {
    if (
      event?.pointerId != null &&
      origin.current?.id !== event.pointerId
    ) {
      return;
    }

    origin.current = null;
    setDragging(false);
  }

  if (!cards.length) return null;

  const selectedCard = cards[selectedIndex];
  const slotOffsets = [-2, -1, 1, 2];
  const seen = new Set([selectedCard.id]);

  const surrounding = slotOffsets
    .map((offset) => {
      const index = wrapIndex(selectedIndex + offset);
      return {
        card: cards[index],
        index,
        offset,
      };
    })
    .filter(({ card }) => {
      if (!card || seen.has(card.id)) return false;
      seen.add(card.id);
      return true;
    });

  return (
    <div
      className={`overview-deck overview-fixed-focus ${
        dragging ? "is-dragging" : ""
      } ${enteringId ? "is-entering-focus" : ""}`}
      role="listbox"
      aria-label="Still today cards"
      aria-activedescendant="overview-selected-card"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          moveSelection(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          moveSelection(-1);
        } else if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          enter(selectedCard);
        }
      }}
      onWheel={(event) => {
        if (
          enteringId ||
          Math.abs(event.deltaY) < 14
        ) {
          return;
        }

        event.preventDefault();

        const now = performance.now();
        if (now - wheelAt.current < 170) return;

        wheelAt.current = now;
        moveSelection(event.deltaY > 0 ? 1 : -1);
      }}
      onPointerDown={begin}
      onPointerUp={release}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
    >
      <div className="overview-deck-stack">
        {surrounding.map(({ card, index, offset }) => (
          <button
            type="button"
            role="option"
            aria-selected="false"
            key={card.id}
            className="overview-side-card"
            style={{
              "--slot": offset,
              "--slot-abs": Math.abs(offset),
            }}
            onClick={() => {
              if (ignoreClick.current) return;
              setSelectedIndex(index);
            }}
          >
            <span className="overview-card-time">
              {card.time || "Anytime"}
            </span>
            <strong>{card.title}</strong>
            {card.repeat && (
              <small>{repeatLabel(card.repeat)}</small>
            )}
          </button>
        ))}

        <button
          id="overview-selected-card"
          type="button"
          role="option"
          aria-selected="true"
          className={`overview-center-card ${
            enteringId === selectedCard.id
              ? "is-entering-card"
              : ""
          }`}
          onClick={() => {
            if (ignoreClick.current) return;
            enter(selectedCard);
          }}
        >
          <span
            className="overview-center-content"
            key={selectedCard.id}
          >
            <span className="overview-card-time">
              {selectedCard.time || "Anytime"}
            </span>
            <strong>{selectedCard.title}</strong>
            {selectedCard.repeat && (
              <small>{repeatLabel(selectedCard.repeat)}</small>
            )}
          </span>
        </button>
      </div>

      <p className="overview-deck-hint">
        Swipe to browse · tap to focus
      </p>
    </div>
  );
}

function OutcomeSheet({
  title,
  mark,
  cards,
  onClose,
}) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="outcome-sheet-overlay"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="outcome-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outcome-sheet-title"
      >
        <div className="outcome-sheet-handle" aria-hidden="true" />

        <div className="outcome-sheet-heading">
          <div>
            <span className="eyebrow">TODAY</span>
            <h2 id="outcome-sheet-title">
              {title} · {cards.length}
            </h2>
          </div>

          <button
            type="button"
            className="outcome-sheet-close"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="outcome-sheet-list">
          {cards.length ? (
            cards.map((card) => (
              <div className="outcome-sheet-row" key={card.id}>
                <span>{mark}</span>
                <div>
                  <strong>{card.title}</strong>
                  <small>{card.time || "Anytime"}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="outcome-sheet-empty">
              Nothing here today.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function TodayOverview({
  open,
  done,
  tomorrow,
  letgo,
  selectedId,
  onEnter,
  onAdd,
  onCloseToday,
}) {
  const [outcomeSheet, setOutcomeSheet] = useState(null);

  const outcomes = [
    {
      key: "done",
      label: "Done",
      mark: "✓",
      cards: done,
    },
    {
      key: "tomorrow",
      label: "Tomorrow",
      mark: "←",
      cards: tomorrow,
    },
    {
      key: "letgo",
      label: "Let Go",
      mark: "↓",
      cards: letgo,
    },
  ];

  return (
    <section className="today-overview">
      <div className="overview-content">
        <div className="overview-title-row">
          <div>
            <h2>Today</h2>
            <p className="open-count">
              {open.length
                ? `${open.length} still open`
                : "Everything has a place for today."}
            </p>
          </div>

          <button
            className="deck-add overview-add"
            type="button"
            aria-label="Add Card"
            onClick={onAdd}
          >
            +
          </button>
        </div>

        <div className="still-heading eyebrow">
          STILL TODAY
        </div>

        {open.length ? (
          <OverviewDeck
            cards={open}
            selectedId={selectedId}
            onEnter={onEnter}
          />
        ) : (
          <p className="nothing-open">Today is clear.</p>
        )}

        <div
          className="overview-outcome-summary"
          aria-label="Today's outcomes"
        >
          {outcomes.map((outcome) => (
            <button
              key={outcome.key}
              type="button"
              onClick={() => setOutcomeSheet(outcome)}
            >
              <span>{outcome.mark}</span>
              <strong>{outcome.cards.length}</strong>
              <small>{outcome.label}</small>
            </button>
          ))}
        </div>

        <div className="day-actions">
          <button
            className="primary"
            onClick={onCloseToday}
          >
            Close Today <span>→</span>
          </button>
        </div>
      </div>

      {outcomeSheet && (
        <OutcomeSheet
          title={outcomeSheet.label}
          mark={outcomeSheet.mark}
          cards={outcomeSheet.cards}
          onClose={() => setOutcomeSheet(null)}
        />
      )}
    </section>
  );
}

function LiveStatus({ sleep, steps }) {
  const stepValue = Number(steps || 0).toLocaleString("en-NZ");

  return (
    <div
      className="live-status"
      aria-label={`Last night ${sleep} sleep. Today ${stepValue} steps.`}
    >
      <div className="live-status-item sleep-status">
        <span className="moon">☾</span>
        <div>
          <span>LAST NIGHT</span>
          <strong>{sleep}</strong>
        </div>
      </div>

      <div className="live-status-divider" />

      <div className="live-status-item steps-status">
        <div>
          <span>TODAY</span>
          <strong>{stepValue} steps</strong>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const day = localDate(now);
  const sleepValue = "7h 12m";

  const [cards, setCards] = useState(() =>
    createMockCards(day),
  );
  const [mode, setMode] = useState("deck");
  const [page, setPage] = useState("today");
  const [editor, setEditor] = useState(null);
  const [skipped, setSkipped] = useState([]);
  const [firstId, setFirstId] = useState(null);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState(() =>
    createMockHistory(day),
  );
  const [openPastDays, setOpenPastDays] = useState(() =>
    createMockOpenPastDays(day),
  );
  const [pastResolution, setPastResolution] = useState(null);
  const [closedRecord, setClosedRecord] = useState(null);
  const [steps, setSteps] = useState(8642);
  const [showGestureCoach, setShowGestureCoach] =
    useState(true);

  const nextId = useRef(1000);
  const previousDay = useRef(day);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, 30000);
    window.addEventListener("focus", tick);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, []);

  useEffect(() => {
    if (
      !showGestureCoach ||
      mode !== "deck" ||
      page !== "today" ||
      editor ||
      closedRecord
    ) {
      return;
    }

    const timer = setTimeout(
      () => setShowGestureCoach(false),
      3200,
    );

    return () => clearTimeout(timer);
  }, [
    showGestureCoach,
    mode,
    page,
    editor,
    closedRecord,
  ]);

  useEffect(() => {
    if (previousDay.current !== day) {
      setCards((previous) => rollToDay(previous, day));
      setSkipped([]);
      setFirstId(null);
      setClosedRecord(null);
      setSteps(0);
      setMode("deck");
      setPage("today");
      previousDay.current = day;
    }
  }, [day]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(null),
      toast.undo ? 5000 : 1500,
    );

    return () => clearTimeout(timer);
  }, [toast]);

  const open = sortCards(
    cards.filter(
      (card) =>
        card.scheduledDate === day && !card.status,
    ),
    now,
  );

  const round = open.filter(
    (card) => !skipped.includes(card.id),
  );

  const focused = round.find(
    (card) => card.id === firstId,
  );

  const deck = focused
    ? [
        focused,
        ...round.filter(
          (card) => card.id !== firstId,
        ),
      ]
    : round;

  const done = cards.filter(
    (card) =>
      card.scheduledDate === day &&
      card.status === "done",
  );

  const tomorrow = cards.filter(
    (card) =>
      card.scheduledDate === plusDays(day, 1) &&
      card.status === "tomorrow",
  );

  const letgo = cards.filter(
    (card) =>
      card.scheduledDate === day &&
      card.status === "letgo",
  );

  const movedTomorrow = tomorrow.filter(
    (card) => card.movedFrom === day,
  );

  useEffect(() => {
    if (page !== "today" || editor || closedRecord) {
      return;
    }

    if (mode === "deck" && deck.length === 0) {
      setMode("overview");
    }

    if (mode === "closing" && open.length === 0) {
      closeToday();
    }
  }, [
    page,
    mode,
    deck.length,
    open.length,
    editor,
    closedRecord,
    done.length,
    movedTomorrow.length,
    letgo.length,
  ]);

  function act(id, action) {
    const original = cards.find(
      (card) => card.id === id,
    );
    setFirstId(null);

    if (action === "notnow") {
      setSkipped((previous) =>
        previous.includes(id)
          ? previous
          : [...previous, id],
      );
    } else {
      setCards((previous) =>
        previous.map((card) =>
          card.id !== id
            ? card
            : action === "tomorrow"
              ? {
                  ...card,
                  scheduledDate: plusDays(day, 1),
                  movedFrom: day,
                  status: "tomorrow",
                }
              : { ...card, status: action },
        ),
      );
    }

    setToast({
      label:
        action === "notnow"
          ? "Not now · still today"
          : action === "letgo"
            ? "Let go"
            : action === "tomorrow"
              ? "Moved to tomorrow"
              : "Done",
      undo:
        action === "letgo" && mode !== "closing"
          ? original
          : null,
    });
  }

  function enter(id) {
    setSkipped([]);
    setFirstId(id || null);
    setMode("deck");
    setToast(null);

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
        ? "instant"
        : "smooth",
    });
  }

  function save(values) {
    if (editor.card) {
      const id = editor.card.id;
      setCards((previous) =>
        previous.map((card) =>
          card.id === id
            ? { ...card, ...values }
            : card,
        ),
      );
    } else {
      const card = {
        ...values,
        id: nextId.current++,
      };
      setCards((previous) => [...previous, card]);
    }

    setEditor(null);
    setToast({
      label: editor.card
        ? "Saved"
        : values.scheduledDate === day
          ? "Added to today"
          : `Added · ${values.scheduledDate}`,
    });
  }

  function closeToday() {
    if (closedRecord) return;

    const stepValue = Number(steps);
    const record = {
      id: day,
      date: day,
      done: done.map((card) => card.title),
      tomorrow: movedTomorrow.map(
        (card) => card.title,
      ),
      letgo: letgo.map((card) => card.title),
      sleep: sleepValue,
      steps:
        Number.isFinite(stepValue) &&
        stepValue >= 0
          ? Math.round(stepValue)
          : 0,
    };

    setHistory((previous) => [
      record,
      ...previous.filter(
        (item) => item.id !== record.id,
      ),
    ]);
    setClosedRecord(record);
    setMode("closed");
    setToast({ label: "Day closed" });
  }

  function requestCloseToday() {
    setToast(null);

    if (open.length === 0) {
      closeToday();
      return;
    }

    setSkipped([]);
    setFirstId(null);
    setMode("closing");
  }

  function openAddCard(initialDate = day) {
    setToast(null);
    setEditor({
      card: null,
      initialDate,
      returnPage: page,
    });
  }

  function openEditCard(card) {
    setToast(null);
    setEditor({
      card,
      initialDate: card.scheduledDate,
      returnPage: page,
    });
  }

  function startPastResolution(openDay) {
    setToast(null);
    setPastResolution({
      date: openDay.date,
      source: openDay,
      remaining: [...(openDay.cards || [])],
      done: [],
      broughtForward: [],
      letgo: [],
    });
  }

  function resolvePastCard(action) {
    if (!pastResolution?.remaining.length) return;

    const [card, ...rest] = pastResolution.remaining;
    const next = {
      ...pastResolution,
      remaining: rest,
      done:
        action === "done"
          ? [...pastResolution.done, card.title]
          : pastResolution.done,
      broughtForward:
        action === "today"
          ? [...pastResolution.broughtForward, card.title]
          : pastResolution.broughtForward,
      letgo:
        action === "letgo"
          ? [...pastResolution.letgo, card.title]
          : pastResolution.letgo,
    };

    if (action === "today") {
      setCards((previous) => [
        ...previous,
        {
          ...card,
          id: nextId.current++,
          scheduledDate: day,
          status: undefined,
          movedFrom: undefined,
          broughtFrom: pastResolution.date,
        },
      ]);
    }

    if (rest.length) {
      setPastResolution(next);
      return;
    }

    const source = pastResolution.source;
    const record = {
      id: source.date,
      date: source.date,
      done: next.done,
      tomorrow: [],
      broughtForward: next.broughtForward,
      letgo: next.letgo,
      sleep: source.sleep || "—",
      steps: source.steps || 0,
    };

    setHistory((previous) => [
      record,
      ...previous.filter((item) => item.id !== record.id),
    ]);
    setOpenPastDays((previous) =>
      previous.filter((item) => item.date !== source.date),
    );
    setPastResolution(null);
    setToast({ label: "Past day resolved" });
  }

  const dateLabel =
    new Intl.DateTimeFormat("en", {
      weekday: "long",
    }).format(now) +
    " · " +
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(now);

  const todayContent = closedRecord ? (
    <ClosedDay
      record={closedRecord}
      onCalendar={() => setPage("calendar")}
    />
  ) : (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ONE DAY AT A TIME
          </span>
          <h1>
            <button
              className="today-heading"
              onClick={() => setMode("overview")}
              aria-label="Today Overview"
            >
              {dateLabel}
            </button>
          </h1>
        </div>

        <div className="heading-tools">
          <LiveStatus
            sleep={sleepValue}
            steps={steps}
          />

        </div>
      </div>

      {mode === "deck" && deck.length ? (
        <TodayDeck
          cards={deck}
          now={now}
          onAction={act}
          onEdit={openEditCard}
          onOverview={() => setMode("overview")}
          onAdd={() => openAddCard(day)}
          showCoach={showGestureCoach}
        />
      ) : mode === "closing" && open.length ? (
        <TodayDeck
          cards={open}
          now={now}
          finalizing
          onAction={act}
          onEdit={openEditCard}
          onOverview={() => setMode("overview")}
          onExitFinalizing={() =>
            setMode("overview")
          }
        />
      ) : (
        <TodayOverview
          open={open}
          done={done}
          tomorrow={movedTomorrow}
          letgo={letgo}
          selectedId={firstId}
          onEnter={enter}
          onAdd={() => openAddCard(day)}
          onCloseToday={requestCloseToday}
        />
      )}
    </>
  );

  return (
    <div
      className={`app ${
        editor ? "app-scroll" : "app-fixed"
      } page-${page} mode-${mode} ${
        closedRecord ? "day-is-closed" : ""
      }`}
    >
      <header className="brand">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setEditor(null);
            setPage("today");

            if (!closedRecord) {
              setMode("overview");
            }
          }}
        >
          <span className="brand-symbol">▱</span>
          day by day
          <span className="brand-dot">.</span>
        </a>

        <span className="brand-caption">
          A little less. A little lighter.
        </span>
        <span className="edition">
          A DAILY PRACTICE
        </span>
      </header>

      <main
        className={editor ? "screen-scroll" : "screen-fixed"}
      >
        {editor ? (
          <AddCard
            key={editor.card?.id || `new-${editor.initialDate || day}`}
            card={editor.card}
            today={day}
            initialDate={editor.initialDate || day}
            backLabel={
              editor.returnPage === "calendar"
                ? "Calendar"
                : "Today"
            }
            onAdd={save}
            onBack={() => setEditor(null)}
          />
        ) : pastResolution ? (
          <PastDayFlow
            day={pastResolution.source}
            resolution={pastResolution}
            onAction={resolvePastCard}
            onBack={() => setPastResolution(null)}
          />
        ) : page === "today" ? (
          todayContent
        ) : page === "calendar" ? (
          <CalendarView
            today={day}
            cards={cards}
            history={history}
            openPastDays={openPastDays}
            onOpenToday={() => {
              setPage("today");
              if (!closedRecord) {
                setMode("overview");
              }
            }}
            onAddCard={(date) => openAddCard(date)}
            onEditCard={openEditCard}
            onResolvePastDay={startPastResolution}
          />
        ) : (
          <MeView />
        )}
      </main>

      <footer>
        {!editor && !pastResolution && (
          <nav className="primary-nav" aria-label="Primary">
            <button
              className={
                page === "calendar" ? "active" : ""
              }
              onClick={() => setPage("calendar")}
            >
              <span className="nav-icon"><NavIcon type="calendar" /></span>
              <span className="nav-label">Calendar</span>
            </button>

            <button
              className={`nav-today ${
                page === "today" ? "active" : ""
              }`}
              onClick={() => setPage("today")}
            >
              <span className="nav-icon"><NavIcon type="today" /></span>
              <span className="nav-label">Today</span>
            </button>

            <button
              className={
                page === "me" ? "active" : ""
              }
              onClick={() => setPage("me")}
            >
              <span className="nav-icon"><NavIcon type="me" /></span>
              <span className="nav-label">Me</span>
            </button>
          </nav>
        )}
        <p>
          One card at a time. One day at a time.
        </p>
      </footer>

      {toast && !editor && (
        <div className="toast" role="status">
          <span>{toast.label}</span>

          {toast.undo && (
            <>
              <span>·</span>
              <button
                onClick={() => {
                  setCards((previous) =>
                    previous.map((card) =>
                      card.id === toast.undo.id
                        ? toast.undo
                        : card,
                    ),
                  );
                  setToast(null);
                }}
              >
                Undo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <App />,
);
