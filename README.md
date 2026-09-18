# Day by day

A small React + Vite interaction prototype for a card-first daily planner. All data lives in memory and resets on refresh.

The prototype is deliberately narrow: create a card, make one decision at a time, close the day once, then keep a quiet Day Card in History.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To check a production build, run `npm run build`.

## Core card gestures

The interaction model is currently frozen as:

- **Right → Done** — it happened today.
- **Up ↑ Not now** — skip it for this round, but keep it in Today.
- **Left ← Tomorrow** — today is finished with it; bring it back tomorrow.
- **Down ↓ Let Go** — consciously release it. This is not delete or failure.

A gesture must exceed 65px and its main axis must be more than 1.4 times the other axis. Short or diagonal drags spring back.

`Not now` is temporary. It only removes a card from the current round. When the round ends, the card remains under **Still Today**.

`Let Go` is a retained outcome, not a database-style delete. During normal daytime use, the prototype offers Undo for five seconds.

## Daily flow

1. Add cards for Today, Tomorrow, or a picked date.
2. Process Today one card at a time.
3. Open Today Overview to see what is still open, completed, moved, or let go.
4. Sleep and steps are visible directly in Today Overview.
5. Choose **Close Today** once when you are ready to end the day.
6. If cards are still open, the app immediately asks for a final decision on each one: Done, Tomorrow, or Let Go. `Not now` is no longer available because there is no later once the day is being closed.
7. As soon as the last open card is resolved, the Day Card is created automatically. There is no second confirmation screen.
8. If nothing is still open, **Close Today** creates the Day Card immediately.
9. Open **History** to look back at closed days.

There is deliberately **no daily mood score or productivity grade**. The product principle is:

> Capture, don't judge.

## Add Card

Use `+` to capture a card. Title is the essential field. Date defaults to Today. Time, repeat, note, and alert controls are prototype-only UI and still use in-memory data.

Time-specific alert choices do not schedule real notifications.

## Current prototype limitations

- No backend or database.
- No authentication.
- No persistence; refresh resets the prototype.
- Sleep is mock data and steps are manual.
- No weekly report yet.
- No AI.
- No real notifications.

## Main files

- `src/main.jsx` — App state, Today Deck, Today Overview, swipe lifecycle, and the single Close Today flow.
- `src/DayFlow.jsx` — closed Day Card and History views.
- `src/AddCard.jsx` — card creation/editing form.
- `src/planner.js` — date, sorting, rollover and gesture helpers.
- `src/style.css` — visual system and interaction styling.
