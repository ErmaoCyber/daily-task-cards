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

Overview and Focus are two states of the same deck.

- Overview shows all Still Today cards as an overlapping stack.
- Every visible card keeps its time and title readable.
- One card has a clear selected state.
- Swipe vertically to move the selection.
- Click an unselected card to select it.
- Click the selected card to draw it into Focus.
- The Overview deck loops in both directions.
- Completed, Tomorrow, and Let Go remain quiet collapsible outcome sections.

## Live status

The upper-right Today header contains:

- last night's sleep
- today's current step count

These are mock live values for now. Closing Today copies them into the Day Card as a historical snapshot.

## Layout

Branding no longer reserves a full-width header band. On larger screens a small wordmark floats in the upper-left; on smaller screens it disappears so the working area starts near the top.

## Calendar

Calendar replaces the old top-level History screen. It keeps past records, Today, and future plans on one time axis.

The month view uses a small marker language:

- **○ hollow circles** — future planned cards
- **▭ rounded mini rectangles** — cards participating Today
- **● soft solid circles** — cards recorded in a closed past day
- **— short line** — a past day that was left open

Marker quantity represents all cards that participated in that day, capped at three markers to show density without turning the month into a dashboard.

Month navigation is gesture-first: swipe left for the next month and right for the previous month. The old arrow buttons are intentionally removed.

On mobile, Calendar uses stable viewport geometry: the header, month grid, and selected-day summary each occupy fixed layout regions, so choosing a different date does not resize the Calendar. Full historical Day Card detail opens in a separate bottom sheet instead of expanding the Calendar itself. The primary navigation stays fixed to the viewport.

Selecting a date keeps the month visible and updates the panel below it:

- **Past closed day** — Day Card summary, sleep, steps, and optional full outcome detail.
- **Today** — current outcome counts and an Open Today action.
- **Future** — planned cards with direct edit and Add Card.
- **Past open day** — a lightweight unresolved-day state.

## Mock data

The prototype now includes roughly six weeks of varied mock data so Calendar density and empty/full states can be judged more realistically:

- closed and empty past dates
- one intentionally unclosed past date
- different Done / Tomorrow / Let Go combinations
- varied sleep and step snapshots
- sparse and busy future dates
- future class, swimming, study, appointment, and project cards

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
- Calendar data is prototype fixture data
- No real notifications or external health integrations
- No weekly report yet
- No AI

## Design source of truth

All future UI work should follow [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md). It defines the shared mobile typography, spacing, surfaces, navigation, card geometry, responsive rules, and interaction principles.

## Main files

- `src/main.jsx` — Today Deck, Overview, live status, routing, gestures, and Close Today
- `src/CalendarView.jsx` — month Calendar and selected-day panel
- `src/mockData.js` — six-week prototype fixture data
- `src/DayFlow.jsx` — closed Day Card result
- `src/AddCard.jsx` — card creation/editing, including Calendar-selected dates
- `src/planner.js` — date, sorting, rollover, and gesture helpers
- `src/style.css` — visual and interaction styling


## Mobile app shell

Mobile screens now follow one shared layout rule instead of being individually compressed:

- **Fixed task screens:** Focus, Today Overview, Closing Today, Closed Day, and Calendar keep the primary task inside the viewport with fixed bottom navigation.
- **Scrollable detail screens:** Add Card and detail sheets may scroll when the user intentionally opens more information.
- Focus cards use the remaining viewport height instead of a fixed pixel height.
- Today Overview keeps the active deck visible, condenses Done / Tomorrow / Let Go into a summary row, and opens each outcome in a bottom sheet.
- Closing Today reuses the Focus geometry and moves its status into the deck header.
- Closed Day is a compact one-screen result.
- Add Card keeps the common Title + Date path near the top while optional fields may extend the page; the Add button stays sticky and reachable.
- Full historical details stay inside bottom sheets rather than stretching the underlying screen.

The mobile principle is: **the current primary task fits in one screen; intentional detail may scroll.**


## Me workspace

The prototype now has a three-part primary navigation:

- **Calendar** — past, today, and future on one time axis
- **Today** — the central action space and visually emphasized middle tab
- **Me** — long-term personal context

Me is currently front-end mock only and contains three prototype areas:

- **Life List** — long-term things the user wants to make real
- **Reviews** — one unified entry with Week / Month / Year ranges
- **Health & Data** — mock sleep, steps, and a future integrations entry

The Reviews screen uses one shared structure instead of separate weekly/monthly/yearly pages. Historical periods will later be browsed inside the same review experience.

No backend model is implied by this prototype yet; the current goal is to validate the product structure and mobile UI first.
