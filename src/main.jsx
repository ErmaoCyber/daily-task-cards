import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import AddCard from "./AddCard";
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
  done: { label: "Done", arrow: "→", feedback: "DONE" },
  tomorrow: { label: "Tomorrow", arrow: "←", feedback: "TOMORROW" },
  notnow: { label: "Not now", arrow: "↑", feedback: "NOT NOW" },
  letgo: { label: "Let Go", arrow: "↓", feedback: "LET GO" },
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

function TodayDeck({ cards, now, onAction, onEdit, onOverview }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState(null);
  const origin = useRef(null);
  const timer = useRef(null);
  const card = cards[0];
  useEffect(() => () => clearTimeout(timer.current), []);
  const intent = leaving || gesture(drag, 12);
  const strength = leaving
    ? 1
    : Math.min(
        1,
        Math.max(0, (Math.max(Math.abs(drag.x), Math.abs(drag.y)) - 12) / 90),
      );
  const drop =
    intent === "letgo" ? Math.min(Math.max(drag.y, 0) / 220, 1) : 0;
  const past =
    card.shortTime &&
    card.shortTime <
      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  function commit(action) {
    if (leaving) return;
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
    const offset = { x: event.clientX - start.x, y: event.clientY - start.y };
    origin.current = null;
    const action = gesture(offset);
    if (action) commit(action);
    else {
      setDrag({ x: 0, y: 0 });
      // Returning a drag to its origin must not accidentally open the editor.
      if (start.travel < 8 && Math.hypot(offset.x, offset.y) < 8) onEdit(card);
    }
  }
  const transform = leaving
    ? `translate(${leaving === "done" ? 460 : leaving === "tomorrow" ? -460 : 0}px, ${leaving === "letgo" ? 460 : leaving === "notnow" ? -460 : 0}px) rotate(${leaving === "done" ? 18 : leaving === "tomorrow" ? -18 : 0}deg) scale(${leaving === "letgo" ? 0.94 : 1})`
    : `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 24}deg) scale(${1 - drop * 0.04})`;
  return (
    <section className="focus-view deck-mode">
      <div className="deck-heading">
        <button className="deck-today-link" onClick={onOverview}>
          TODAY <span>↗</span>
        </button>
        <span className="deck-count">
          {cards.length - 1} {cards.length === 2 ? "card" : "cards"} left
        </span>
      </div>
      <div className="deck-area">
        <div className="deck-stack">
          {cards.length > 2 && <div className="deck-back second-back" />}
          {cards.length > 1 && <div className="deck-back first-back" />}
          <article
            key={card.id}
            className={`focus-card ${leaving ? "leaving" : ""} ${origin.current ? "dragging" : ""}`}
            style={{ transform, opacity: leaving ? 0 : 1 - drop * 0.25 }}
            role="button"
            tabIndex={leaving ? -1 : 0}
            aria-label={`Edit ${card.title}`}
            onKeyDown={(e) => {
              if (!leaving && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onEdit(card);
              }
            }}
            onPointerDown={(e) => {
              if (leaving || origin.current || !e.isPrimary || e.button !== 0)
                return;
              origin.current = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                travel: 0,
              };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const start = origin.current;
              if (start?.id !== e.pointerId) return;
              const offset = { x: e.clientX - start.x, y: e.clientY - start.y };
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
                <span>{intent === "done" ? "✓" : actions[intent].arrow}</span>
                <strong>{actions[intent].feedback}</strong>
              </div>
            )}
            <div className="card-content">
              <span className={`card-time ${past ? "time-past" : ""}`}>
                {card.time || "Anytime"}
              </span>
              <h2>{card.title}</h2>
              {card.repeat && (
                <span className="card-repeat">{repeatLabel(card.repeat)}</span>
              )}
            </div>
          </article>
        </div>
      </div>
      <div className="gesture-caption">One card at a time.</div>
      <div className="gesture-legend" aria-label="Swipe directions">
        <span className="hint-up">↑ Not now</span>
        <span>← Tomorrow</span>
        <span>→ Done</span>
        <span className="hint-down">↓ Let Go</span>
      </div>
      <p className="drag-note">Swipe to decide · Tap to edit</p>
    </section>
  );
}

function TodayOverview({ open, done, tomorrow, onEnter }) {
  const [pull, setPull] = useState(0);
  const [entering, setEntering] = useState(false);
  const origin = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function enter(id) {
    if (entering) return;
    setEntering(true);
    timer.current = setTimeout(() => onEnter(id), 300);
  }
  const mini = (card, active) =>
    active ? (
      <button
        className="overview-mini"
        key={card.id}
        onClick={() => enter(card.id)}
      >
        <span>{card.time || "Anytime"}</span>
        <h3>{card.title}</h3>
        {card.repeat && <small>{repeatLabel(card.repeat)}</small>}
      </button>
    ) : (
      <div className="overview-mini quiet-mini" key={card.id}>
        <span>{card.time || "Anytime"}</span>
        <h3>{card.title}</h3>
      </div>
    );
  return (
    <section
      className={`today-overview ${entering ? "entering-deck" : ""}`}
      style={{ "--pull": `${pull}px`, "--retreat": Math.min(pull / 400, 0.35) }}
    >
      <div className="overview-content">
        <h2>Today</h2>
        <p className="open-count">{open.length} still open</p>
        <div className="still-heading eyebrow">STILL TODAY</div>
        {open.length ? (
          open.map((card) => mini(card, true))
        ) : (
          <p className="nothing-open">Nothing left open today.</p>
        )}
        <div className="overview-folds">
          <details>
            <summary>
              Completed <span>{done.length}</span>
            </summary>
            {done.map((card) => mini(card, false))}
          </details>
          <details>
            <summary>
              Tomorrow <span>{tomorrow.length}</span>
            </summary>
            {tomorrow.map((card) => mini(card, false))}
          </details>
        </div>
      </div>
      {open.length > 0 && (
        <div className="deck-handle-area">
          <p>Pull up your cards</p>
          <button
            className="deck-handle"
            aria-label="Pull up to enter Today Deck"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                enter();
              }
            }}
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0 || entering) return;
              origin.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (origin.current?.id === e.pointerId)
                setPull(
                  Math.max(0, Math.min(180, origin.current.y - e.clientY)),
                );
            }}
            onPointerUp={(e) => {
              const start = origin.current;
              if (start?.id !== e.pointerId) return;
              origin.current = null;
              if (
                gesture({ x: e.clientX - start.x, y: e.clientY - start.y }) ===
                "notnow"
              )
                enter();
              else setPull(0);
            }}
            onPointerCancel={() => {
              origin.current = null;
              setPull(0);
            }}
          >
            <span>↑</span>
            <i />
          </button>
        </div>
      )}
    </section>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const day = localDate(now);
  const [cards, setCards] = useState(() =>
    initialCards.map((card) => ({ ...card, scheduledDate: localDate() })),
  );
  const [mode, setMode] = useState("deck");
  const [editor, setEditor] = useState(null);
  const [skipped, setSkipped] = useState([]);
  const [firstId, setFirstId] = useState(null);
  const [toast, setToast] = useState(null);
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
    if (previousDay.current !== day) {
      setCards((previous) => rollToDay(previous, day));
      setSkipped([]);
      setFirstId(null);
      previousDay.current = day;
    }
  }, [day]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.undo ? 5000 : 1500);
    return () => clearTimeout(timer);
  }, [toast]);
  const open = sortCards(
    cards.filter((card) => card.scheduledDate === day && !card.status),
    now,
  );
  const round = open.filter((card) => !skipped.includes(card.id));
  const focused = round.find((card) => card.id === firstId);
  const deck = focused
    ? [focused, ...round.filter((card) => card.id !== firstId)]
    : round;
  const done = cards.filter(
    (card) => card.scheduledDate === day && card.status === "done",
  );
  const tomorrow = cards.filter(
    (card) =>
      card.scheduledDate === plusDays(day, 1) && card.status === "tomorrow",
  );
  useEffect(() => {
    if (mode === "deck" && deck.length === 0 && !editor) setMode("overview");
  }, [mode, deck.length, editor]);
  function act(id, action) {
    const original = cards.find((card) => card.id === id);
    setFirstId(null);
    if (action === "notnow") setSkipped((previous) => [...previous, id]);
    else
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
    setToast({
      label:
        action === "notnow"
          ? "Set aside for this round"
          : action === "deleted"
            ? "Deleted"
            : action === "tomorrow"
              ? "Moved to tomorrow"
              : "Done",
      undo: action === "letgo" ? original : null,
    });
  }
  function enter(id) {
    setSkipped([]);
    setFirstId(id || null);
    setMode("deck");
    setToast(null);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function save(values) {
    if (editor.card) {
      const id = editor.card.id;
      setCards((previous) =>
        previous.map((card) =>
          card.id === id ? { ...card, ...values } : card,
        ),
      );
    } else {
      const card = { ...values, id: nextId.current++ };
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
  const dateLabel =
    new Intl.DateTimeFormat("en", { weekday: "long" }).format(now) +
    " · " +
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
      now,
    );
  return (
    <div className="app">
      <header className="brand">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setEditor(null);
            setMode("overview");
          }}
        >
          <span className="brand-symbol">▱</span>day by day
          <span className="brand-dot">.</span>
        </a>
        <span className="brand-caption">A little less. A little lighter.</span>
        <span className="edition">A DAILY PRACTICE</span>
      </header>
      <main>
        {editor ? (
          <AddCard
            key={editor.card?.id || "new"}
            card={editor.card}
            today={day}
            onAdd={save}
            onBack={() => setEditor(null)}
          />
        ) : (
          <>
            <div className="page-heading">
              <div>
                <span className="eyebrow">ONE DAY AT A TIME</span>
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
              />
            ) : (
              <TodayOverview
                open={open}
                done={done}
                tomorrow={tomorrow}
                onEnter={enter}
              />
            )}
          </>
        )}
      </main>
      <footer className="simple-footer">
        <p>One card at a time. One day at a time.</p>
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
                      card.id === toast.undo.id ? toast.undo : card,
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

createRoot(document.getElementById("root")).render(<App />);
