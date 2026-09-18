import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import AddCard from "./AddCard";
import { ClosedDay, HistoryView } from "./DayFlow";
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
  done: { arrow: "→", feedback: "DONE" },
  tomorrow: { arrow: "←", feedback: "TOMORROW" },
  notnow: { arrow: "↑", feedback: "NOT NOW" },
  letgo: { arrow: "↓", feedback: "LET GO" },
};

const initialCards = [
  { id: 1, title: "Java Study", time: null, shortTime: null },
  {
    id: 2,
    title: "Class",
    time: "2:00 PM",
    shortTime: "14:00",
    alert: "At time",
  },
  {
    id: 3,
    title: "Swimming",
    time: "7:00 PM",
    shortTime: "19:00",
    alert: "At time",
  },
  { id: 4, title: "Buy groceries", time: null, shortTime: null },
];

const initialHistory = [
  {
    id: "2026-09-17",
    date: "2026-09-17",
    done: ["Class", "Java Study"],
    tomorrow: ["Buy groceries"],
    letgo: [],
    sleep: "6h 48m",
    steps: 6321,
  },
  {
    id: "2026-09-16",
    date: "2026-09-16",
    done: ["Java Study", "Walk", "Laundry"],
    tomorrow: [],
    letgo: ["Read article"],
    sleep: "7h 21m",
    steps: 9102,
  },
];

function TodayDeck({
  cards,
  now,
  onAction,
  onEdit,
  onOverview,
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
            ← BACK TO TODAY
          </button>
        ) : (
          <button
            className="deck-today-link"
            onClick={onOverview}
          >
            TODAY <span>↗</span>
          </button>
        )}

        <span className="deck-count">
          {cards.length - 1}{" "}
          {cards.length === 2 ? "card" : "cards"} left
        </span>
      </div>

      {finalizing && (
        <div className="closing-note">
          <span>CLOSING TODAY</span>
          <p>Give each open card a final place.</p>
        </div>
      )}

      <div className="deck-area">
        <div className="deck-stack">
          {cards.length > 2 && (
            <div className="deck-back second-back" />
          )}
          {cards.length > 1 && (
            <div className="deck-back first-back" />
          )}

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
            {intent && (
              <div
                className={`swipe-feedback feedback-${intent}`}
                style={{ opacity: strength }}
                aria-hidden="true"
              >
                <span>
                  {intent === "done"
                    ? "✓"
                    : actions[intent].arrow}
                </span>
                <strong>{actions[intent].feedback}</strong>
              </div>
            )}

            <div className="card-content">
              <span
                className={`card-time ${
                  past ? "time-past" : ""
                }`}
              >
                {card.time || "Anytime"}
              </span>
              <h2>{card.title}</h2>
              {card.repeat && (
                <span className="card-repeat">
                  {repeatLabel(card.repeat)}
                </span>
              )}
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
  const [dragY, setDragY] = useState(0);
  const [enteringId, setEnteringId] = useState(null);
  const origin = useRef(null);
  const ignoreClick = useRef(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    setSelectedIndex((current) =>
      Math.min(
        Math.max(current, 0),
        Math.max(cards.length - 1, 0),
      ),
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

  function select(index) {
    setSelectedIndex(
      Math.min(
        Math.max(index, 0),
        Math.max(cards.length - 1, 0),
      ),
    );
  }

  function enter(card) {
    if (enteringId) return;
    setEnteringId(card.id);
    timer.current = setTimeout(
      () => onEnter(card.id),
      260,
    );
  }

  function release(event) {
    const start = origin.current;
    if (start?.id !== event.pointerId) return;

    const dy = event.clientY - start.y;
    const dx = event.clientX - start.x;
    origin.current = null;
    setDragY(0);

    if (
      Math.abs(dy) > 38 &&
      Math.abs(dy) > Math.abs(dx) * 1.2
    ) {
      ignoreClick.current = true;
      select(selectedIndex + (dy < 0 ? 1 : -1));
      window.setTimeout(() => {
        ignoreClick.current = false;
      }, 0);
    }
  }

  if (!cards.length) return null;

  return (
    <div
      className={`overview-deck ${
        enteringId ? "is-entering-focus" : ""
      }`}
      style={{ "--browse-drag": `${dragY}px` }}
      role="listbox"
      aria-label="Still today cards"
      aria-activedescendant={`overview-card-${cards[
        selectedIndex
      ]?.id}`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          select(selectedIndex + 1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          select(selectedIndex - 1);
        } else if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          enter(cards[selectedIndex]);
        }
      }}
      onPointerDown={(event) => {
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
        };
        event.currentTarget.setPointerCapture(
          event.pointerId,
        );
      }}
      onPointerMove={(event) => {
        if (origin.current?.id !== event.pointerId) return;
        setDragY(
          Math.max(
            -34,
            Math.min(
              34,
              event.clientY - origin.current.y,
            ),
          ),
        );
      }}
      onPointerUp={release}
      onPointerCancel={() => {
        origin.current = null;
        setDragY(0);
      }}
      onLostPointerCapture={() => {
        origin.current = null;
        setDragY(0);
      }}
    >
      <div className="overview-deck-stack">
        {cards.map((card, index) => {
          const selected = index === selectedIndex;
          const distance = Math.abs(index - selectedIndex);

          return (
            <button
              id={`overview-card-${card.id}`}
              type="button"
              role="option"
              aria-selected={selected}
              key={card.id}
              className={`overview-deck-card ${
                selected ? "is-selected" : ""
              } ${
                enteringId === card.id
                  ? "is-entering-card"
                  : ""
              }`}
              style={{
                "--card-distance": distance,
                "--card-index": index,
              }}
              onClick={() => {
                if (ignoreClick.current) return;

                if (selected) {
                  enter(card);
                } else {
                  select(index);
                }
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
          );
        })}
      </div>

      <p className="overview-deck-hint">
        Swipe to browse · tap the selected card
      </p>
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
  onCloseToday,
}) {
  const mini = (card) => (
    <div
      className="overview-mini quiet-mini"
      key={card.id}
    >
      <span>{card.time || "Anytime"}</span>
      <h3>{card.title}</h3>
    </div>
  );

  return (
    <section className="today-overview">
      <div className="overview-content">
        <h2>Today</h2>
        <p className="open-count">
          {open.length
            ? `${open.length} still open`
            : "Everything has a place for today."}
        </p>

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

        <div className="overview-folds">
          <details>
            <summary>
              Completed <span>{done.length}</span>
            </summary>
            {done.map(mini)}
          </details>

          <details>
            <summary>
              Tomorrow <span>{tomorrow.length}</span>
            </summary>
            {tomorrow.map(mini)}
          </details>

          <details>
            <summary>
              Let Go <span>{letgo.length}</span>
            </summary>
            {letgo.map(mini)}
          </details>
        </div>

        <div className="day-actions">
          {open.length > 0 && (
            <p className="close-intent-note">
              Closing today means each open card needs a
              final decision.
            </p>
          )}

          <button
            className="primary"
            onClick={onCloseToday}
          >
            Close Today <span>→</span>
          </button>
        </div>
      </div>
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
    initialCards.map((card) => ({
      ...card,
      scheduledDate: localDate(),
    })),
  );
  const [mode, setMode] = useState("deck");
  const [page, setPage] = useState("today");
  const [editor, setEditor] = useState(null);
  const [skipped, setSkipped] = useState([]);
  const [firstId, setFirstId] = useState(null);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState(initialHistory);
  const [closedRecord, setClosedRecord] = useState(null);
  const [steps, setSteps] = useState(8642);
  const [showGestureCoach, setShowGestureCoach] =
    useState(true);

  const nextId = useRef(5);
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

  const dateLabel =
    new Intl.DateTimeFormat("en", {
      weekday: "long",
    }).format(now) +
    " · " +
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(now);

  const todayContent = editor ? (
    <AddCard
      key={editor.card?.id || "new"}
      card={editor.card}
      today={day}
      onAdd={save}
      onBack={() => setEditor(null)}
    />
  ) : closedRecord ? (
    <ClosedDay
      record={closedRecord}
      onHistory={() => setPage("history")}
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

          <button
            className="add-entry"
            aria-label="Add Card"
            onClick={() => {
              setToast(null);
              setEditor({ card: null });
            }}
          >
            +
          </button>
        </div>
      </div>

      {mode === "deck" && deck.length ? (
        <TodayDeck
          cards={deck}
          now={now}
          onAction={act}
          onEdit={(card) => {
            setToast(null);
            setEditor({ card });
          }}
          onOverview={() => setMode("overview")}
          showCoach={showGestureCoach}
        />
      ) : mode === "closing" && open.length ? (
        <TodayDeck
          cards={open}
          now={now}
          finalizing
          onAction={act}
          onEdit={(card) => {
            setToast(null);
            setEditor({ card });
          }}
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
          onCloseToday={requestCloseToday}
        />
      )}
    </>
  );

  return (
    <div className="app">
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

      <main>
        {page === "today" ? (
          todayContent
        ) : (
          <HistoryView
            history={history}
            onToday={() => setPage("today")}
          />
        )}
      </main>

      <footer>
        {!editor && (
          <nav aria-label="Primary">
            <button
              className={
                page === "today" ? "active" : ""
              }
              onClick={() => setPage("today")}
            >
              <span>◌</span> Today
            </button>
            <button
              className={
                page === "history" ? "active" : ""
              }
              onClick={() => setPage("history")}
            >
              <span>▱</span> History
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
