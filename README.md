# Day by day

A small React + Vite interaction prototype for a card-first daily planner. All data is currently in memory and resets on refresh.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Core interaction

Focus mode uses four gestures:

- Right → Done
- Up ↑ Not now
- Left ← Tomorrow
- Down ↓ Let Go

The permanent gesture legend is no longer shown during normal use. A lightweight coach appears once per prototype session, while drag feedback still shows the current action on the card.

## Today Deck

Overview and Focus are now two states of the same deck.

- Overview shows all Still Today cards as an overlapping stack.
- Every visible card keeps its time and title readable.
- One card has a clear selected state.
- Swipe vertically to move the selection.
- Click an unselected card to select it.
- Click the selected card to draw it into Focus.
- The Overview deck loops in both directions, so browsing has no first/last stop.
- The old separate bottom deck handle has been removed.

Completed, Tomorrow, and Let Go stay as quiet collapsible sections below the active deck.

## Live status

The upper-right Today header contains the current day context:

- last night's sleep
- today's current step count

Overview does not repeat those values.

When Today is closed, the current values are copied into the Day Card as a snapshot for History.

## Close Today

Close Today remains the only explicit end-of-day action.

If open cards remain, each one must receive a final Done, Tomorrow, or Let Go decision. Not now is unavailable during closing. The Day Card is created automatically when the final open card is resolved.

There is no daily mood score or productivity grade.

> Capture, don't judge.

## Current limitations

- No backend or database
- No authentication
- No persistence
- Mock sleep and step values
- No real notifications or external data integrations
- No weekly report yet
- No AI

## Main files

- `src/main.jsx` — Today Deck, Overview, live status, gestures, and Close Today flow
- `src/DayFlow.jsx` — Day Card and History
- `src/AddCard.jsx` — card creation/editing
- `src/planner.js` — date, sorting, rollover, and gesture helpers
- `src/style.css` — visual and interaction styling
