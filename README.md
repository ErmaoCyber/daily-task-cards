# Day by day

A small React + Vite interaction prototype. All data lives in memory and resets on refresh.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To check a production build, run `npm run build`.

## Try it

- Use + to capture a card with just a title. Date defaults to Today, Time to Anytime, and Repeat to none.
- Swipe right for Done, left for Tomorrow, up for Not now, or down for Delete. Tap a card to edit it.
- On release, a gesture must exceed 65px and its main axis must be more than 1.4 times the other axis. Short or diagonal drags spring back.
- Not now excludes a card only from the current round. When the round ends, Today Overview opens automatically.
- Tap Today to see Still Today, with Completed and Tomorrow collapsed below. Pull up the bottom card handle to enter a fresh round, or tap an open card to begin with it. The handle also supports keyboard Enter/Space.
- Delete offers Undo for five seconds. Dragging less than the threshold does not open editing.
- Time ordering refreshes every 30 seconds. Past times remain neutral. While the page stays open, daily rollover advances repeating cards without accumulating old instances and carries ordinary open cards forward.
- Time-specific alert choices are mock configuration only; the prototype does not schedule or send notifications. All data resets on refresh.

`src/main.jsx` contains App, TodayDeck and TodayOverview. `src/AddCard.jsx` provides the shared creation/editing form. `src/planner.js` holds small date, sorting and gesture helpers. Styling is in `src/style.css`.
