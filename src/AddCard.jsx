import React, { useEffect, useRef, useState } from "react";
import { localDate, plusDays } from "./planner";

export default function AddCard({
  onAdd,
  onBack,
  card = null,
  today = localDate(),
  initialDate = today,
  backLabel = "Today",
}) {
  const tomorrow = plusDays(today, 1);
  const [title, setTitle] = useState(card?.title || "");
  const startingDate = card?.scheduledDate || initialDate || today;
  const [day, setDay] = useState(
    startingDate === today
      ? "today"
      : startingDate === tomorrow
        ? "tomorrow"
        : "pick",
  );
  const [date, setDate] = useState(startingDate);
  const [showTime, setShowTime] = useState(!!card?.shortTime);
  const [time, setTime] = useState(card?.shortTime || "");
  const [showRepeat, setShowRepeat] = useState(!!card?.repeat);
  const [repeat, setRepeat] = useState(
    !card?.repeat
      ? "Never"
      : card.repeat.every === 1
        ? card.repeat.unit === "days"
          ? "Every day"
          : "Every week"
        : "Custom",
  );
  const [interval, setInterval] = useState(String(card?.repeat?.every || 2));
  const [unit, setUnit] = useState(card?.repeat?.unit || "days");
  const [note, setNote] = useState(card?.note || "");
  const [showNote, setShowNote] = useState(!!card?.note);
  const [alert, setAlert] = useState(card?.alert || "At time");
  const titleInput = useRef(null);
  useEffect(() => {
    titleInput.current.focus();
  }, []);

  function submit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    const scheduledDate =
      day === "today" ? today : day === "tomorrow" ? tomorrow : date;
    if (!scheduledDate) return;
    const shortTime = showTime && time ? time : null;
    const [hours, minutes] = shortTime ? shortTime.split(":") : [];
    onAdd({
      title: title.trim(),
      note: showNote ? note.trim() : "",
      alert: shortTime ? alert : null,
      scheduledDate,
      shortTime,
      time: shortTime
        ? `${Number(hours) % 12 || 12}:${minutes} ${Number(hours) >= 12 ? "PM" : "AM"}`
        : null,
      repeat:
        !showRepeat || repeat === "Never"
          ? null
          : repeat === "Custom"
            ? { every: Number(interval), unit }
            : { every: 1, unit: repeat === "Every day" ? "days" : "weeks" },
    });
  }

  return (
    <section className="add-card-view" aria-labelledby="add-card-heading">
      <button className="add-back" onClick={onBack}>
        ← {backLabel}
      </button>
      <form onSubmit={submit}>
        <span className="eyebrow">A LITTLE SPACE FOR ONE THING</span>
        <h1 id="add-card-heading">{card ? "Your card." : "Add a card."}</h1>
        <div className="title-paper">
          <label htmlFor="card-title">Title</label>
          <input
            ref={titleInput}
            id="card-title"
            placeholder="What do you want to remember?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div className="date-choices" role="group" aria-label="Card date">
          {[
            ["today", "Today"],
            ["tomorrow", "Tomorrow"],
            ["pick", "Pick a day"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={day === value}
              onClick={() => setDay(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {day === "pick" && (
          <label className="optional-field">
            Date
            <input
              aria-label="Pick a day"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        )}
        <div className="optional-options">
          <button
            type="button"
            aria-expanded={showTime}
            onClick={() => setShowTime(!showTime)}
          >
            {showTime ? "−" : "+"} Time
          </button>
          <button
            type="button"
            aria-expanded={showRepeat}
            onClick={() => setShowRepeat(!showRepeat)}
          >
            {showRepeat ? "−" : "+"} Repeat
          </button>
          <button
            type="button"
            aria-expanded={showNote}
            onClick={() => setShowNote(!showNote)}
          >
            {showNote ? "−" : "+"} Note
          </button>
        </div>
        {showTime && (
          <div className="time-options">
            <label className="optional-field">
              Time
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="anytime-choice"
              onClick={() => {
                setTime("");
                setShowTime(false);
              }}
            >
              Anytime
            </button>
            {time && (
              <label className="optional-field">
                Alert
                <select
                  value={alert}
                  onChange={(e) => setAlert(e.target.value)}
                >
                  {[
                    "No alert",
                    "At time",
                    "10 min before",
                    "30 min before",
                    "1 hour before",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
        {showRepeat && (
          <div className="repeat-options">
            <div className="repeat-choices" role="group" aria-label="Repeat">
              {["Never", "Every day", "Every week", "Custom"].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={repeat === value}
                  onClick={() => setRepeat(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            {repeat === "Custom" && (
              <div className="custom-repeat">
                <span>Every</span>
                <input
                  aria-label="Repeat interval"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  required
                />
                <select
                  aria-label="Repeat unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                </select>
              </div>
            )}
          </div>
        )}
        {showNote && (
          <label className="note-field">
            Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
            />
          </label>
        )}
        <button
          type="submit"
          className="primary add-submit"
          disabled={!title.trim()}
        >
          {card ? "Save" : "Add"}{" "}
          <span aria-hidden="true">{card ? "✓" : "＋"}</span>
        </button>
      </form>
    </section>
  );
}
