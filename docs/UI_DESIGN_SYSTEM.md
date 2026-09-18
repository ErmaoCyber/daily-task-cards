# UI Design System v0.1

This document defines the visual and interaction rules for **day by day**.

It is not a one-off redesign note. It is a project-level source of truth. Future UI work should follow these rules unless this document is deliberately revised.

---

## 1. Product feeling

**day by day** should feel:

- calm
- personal
- quiet
- focused
- tactile
- lightweight
- intentional

It should not feel like:

- a productivity dashboard
- a project management tool
- a gamified habit tracker
- an analytics console
- a dense calendar app
- a collection of unrelated screens

The core product idea is:

> One card at a time. One day at a time.

The core product principle is:

> Capture, don't judge.

The interface should support those ideas visually.

---

## 2. Global visual principle

Every screen must look like part of the same product family.

A new screen should reuse the same:

- spacing rhythm
- typography hierarchy
- surface palette
- corner radius family
- icon style
- bottom navigation
- interaction language

Do not style each screen independently.

When choosing between a locally attractive solution and a globally consistent solution, prefer global consistency.

---

## 3. Mobile-first layout model

Mobile is the primary reference layout.

Every top-level screen follows the same three-part shell:

```
Header
Main content
Bottom navigation
```

The content area may scroll only when the user intentionally enters detail.

### 3.1 Header

The header should contain only high-value context.

Examples:

- current date
- current health status
- page title
- lightweight contextual action

Do not reserve a large brand header on mobile.

The wordmark should never consume permanent vertical space on small screens.

### 3.2 Main content

The main content should have one dominant visual focus.

Examples:

- Focus Card on Today
- selected Card in Overview
- month grid in Calendar
- Life List / Reviews entry on Me
- Day Card summary after closing

Avoid multiple equally strong focal areas on one screen.

### 3.3 Bottom navigation

Bottom navigation is persistent on top-level screens.

Primary structure:

```
Calendar      Today      Me
```

Today is the central product action and should be visually emphasized, but all three items must belong to the same icon and component family.

The navigation must never look like three unrelated controls.

---

## 3.4 Vertical rhythm and short-page composition

Mobile pages must not place all meaningful content at the top of the viewport and leave the remaining usable space visually empty.

For short screens and short content states:

- place the composition around the upper-middle or visual center of the usable area
- keep related information grouped, but do not compress it into a tight block
- use spacing to create hierarchy, not a large empty band
- modal and sheet content should be vertically balanced rather than visually attached to the top edge
- result states such as Closed Day should read as one centered composition
- detail pages that may grow should remain scrollable, but short content should still begin with deliberate top spacing

Avoid:

- top-heavy layouts with a large unused lower half
- forcing every element into the first third of the screen
- creating empty space only because the bottom navigation is fixed
- shrinking content to preserve an arbitrary one-screen layout

When content is short, the viewport itself becomes part of the composition and should be balanced intentionally.

---

## 4. Typography system

Typography must remain readable on a real phone.

Do not reduce text until the screen fits.

Prefer restructuring the layout instead.

Recommended mobile scale:

| Role | Size |
| --- | --- |
| Page title | 28–32px |
| Large card title | 28–36px |
| Section title | 18–22px |
| Normal card title | 16–20px |
| Body / secondary text | 13–15px |
| Label / eyebrow | 10–12px |
| Micro text | minimum 10px, preferably 11–12px |

### Rules

- Important information must not rely on 8–9px text.
- Eyebrow labels may be small, but must remain secondary.
- Avoid mixing many unrelated font sizes on one screen.
- Use size, weight, and spacing together to create hierarchy.
- Large type should be reserved for the primary focus.

---

## 5. Spacing system

Use a small shared spacing scale:

```
4
8
12
16
24
32
```

Additional values should be exceptional.

### Recommended usage

- 4px: very small internal alignment
- 8px: related inline elements
- 12px: compact component spacing
- 16px: normal component padding
- 24px: section separation
- 32px: major page separation

Do not solve layout problems by adding arbitrary large empty areas.

Empty space is useful only when it strengthens hierarchy.

---

## 6. Surface and color system

The interface should remain within the existing warm off-white / muted green family.

### Surface hierarchy

Use approximately three surface levels:

1. **Background**
   - warm off-white
   - page canvas

2. **Quiet surface**
   - pale green / grey-green
   - summaries, inactive cards, panels

3. **Primary surface**
   - deep green
   - current focus, selected card, primary action

Do not introduce strong unrelated colors without a product-level reason.

### Contrast rule

Deep green should communicate:

- current focus
- selected state
- primary action

It should not cover most of the screen unless the screen is intentionally a single-card Focus view.

---

## 7. Corner radius system

Use one visual family.

Suggested levels:

- small control: 10–12px
- normal card: 14–16px
- large card / panel: 18–20px
- pill / nav: fully rounded

Avoid giving every component a different radius.

---

## 8. Icon system

All navigation icons must come from one visual language.

Required qualities:

- consistent stroke weight
- consistent size
- consistent geometry
- visually balanced optical weight

Navigation meanings:

- Calendar: calendar/grid symbol
- Today: focus/current-day symbol
- Me: person/profile/self symbol

Do not mix:

- emoji
- text glyphs
- Unicode symbols with unrelated geometry
- filled and outline icons with different visual weight

Active/inactive state should primarily come from:

- surface
- color
- emphasis

Not from switching to a completely different icon style.

---

## 9. Bottom navigation specification

Structure:

```
Calendar      Today      Me
```

### Today

Today is central and visually strongest.

It may:

- rise slightly above the navigation rail
- use the primary deep-green surface
- use stronger text contrast

But it must still feel like part of the same component.

### Calendar and Me

Use quieter inactive surfaces and the same icon style.

### Sizing

The navigation should be comfortably tappable.

Recommended:

- total height: ~56–64px
- touch targets: at least 44px
- icon size: ~18–22px
- label: ~11–13px

Do not make navigation labels extremely small.

---

## 10. Today — Focus mode

Focus mode represents:

> One card at a time.

The card is the visual center.

### Layout

```
Date + live status

Deck heading

Primary Focus Card

Short focus caption

Bottom navigation
```

### Card size

The Focus Card should feel like a large physical card, not a full-screen panel.

Do not stretch it just because vertical space is available.

Preferred behaviour:

- stable aspect / visual proportion
- enough surrounding whitespace to separate it from the page
- card title remains comfortably readable

### Gesture language

Frozen interaction:

- → Done
- ↑ Not now
- ← Tomorrow
- ↓ Let Go

Gesture feedback appears on the card.

During an active drag, the current action must be immediately legible:
- feedback is anchored to the deck, not nested inside the moving Card
- the moving Card must never carry the Hint off-screen
- feedback uses stronger contrast than passive helper text
- feedback should occupy the space revealed by the gesture rather than compete with Card content
- horizontal gestures place feedback on the opposite revealed edge: swipe right reveals Done on the left, swipe left reveals Tomorrow on the right
- vertical gestures follow the same principle: swipe up reveals Not Now near the bottom, swipe down reveals Let Go near the top
- the action label and direction/icon should remain readable while the Card is moving
- feedback disappears when the gesture ends

The permanent four-direction legend should not remain on screen during normal use.

### Focus vertical balance

On mobile, the Focus composition should use the available canvas deliberately.

The card may grow within a controlled responsive range when the viewport is tall enough, so the screen does not leave a large accidental empty band below the card.

Do not solve this by making the card a full-screen panel. The desired result is:
- a large but still card-like object
- compact spacing between card and caption
- visually balanced whitespace above and below the Focus composition
- no large unused region caused only by fixed viewport geometry

---

## 10.1 Gesture Hint System

Gesture hints are lightweight confirmation during Card drag.

They are not banners, sheets, command bars, or dominant overlays.

Their purpose is only to answer one question:

> What action am I currently moving toward?

### Placement

All four gesture actions use one shared fixed anchor area.

The Hint:

- stays in the central region of the active Focus Card
- does not move to different edges based on gesture direction
- does not travel with the Card
- does not stretch into horizontal or vertical bars
- does not compete with the Card title

The position remains stable.

Only the Hint content changes.

### Content

Use short, consistent action labels:

- ✓ Done
- ← Tomorrow
- ↑ Not now
- ↓ Let go

Text casing and typography must remain consistent across all four actions.

Avoid all-caps labels such as `DONE` or `TOMORROW` unless the whole product system is deliberately changed to that style.

### Visual style

The Hint should feel like a quiet floating label.

Recommended qualities:

- compact size
- soft rounded shape
- light translucent surface
- subtle blur or shadow
- deep green text/icon
- low visual weight
- enough contrast to remain readable during motion

It should feel like a signal, not a new UI panel.

### Motion

All four actions use the same animation language.

#### Enter

When drag intent becomes clear:

- fade from transparent to visible
- optionally scale from approximately `0.96` to `1`
- no slide-in from edges
- no directional movement

#### Change

If the user changes drag direction:

- keep the same fixed Hint container
- crossfade or softly replace the content
- do not move the container

#### Exit

When the gesture ends or returns below threshold:

- fade out
- optionally scale slightly down
- keep the transition short and quiet

### Gesture strength

Drag distance may influence:

- opacity
- very subtle scale
- very subtle shadow strength

Drag distance must not influence:

- Hint position
- Hint width dramatically
- layout geometry

### Consistency rule

All four gesture Hints must share:

- one placement
- one component shape
- one typography style
- one animation language
- one visual weight

If one direction needs a completely different visual treatment, the design is probably wrong.

### Anti-patterns

Do not:

- attach the Hint to the moving Card
- place different actions on different screen edges
- create long horizontal bars
- create tall vertical pills
- cover large portions of the Card
- use strong white blocks that overpower the primary Card
- let the Hint become more visually dominant than the Card content

### Interaction principle

The Card is the moving object.

The Hint is the stable confirmation layer.

The user should feel:

> I am moving the Card, and the interface is quietly confirming the action.

Not:

> A new control is appearing every time I drag.

---

## 10.2 Today Screen & Card Style v2

The Today screen is the product's primary action surface.

Its purpose is not to display as much information as possible. Its purpose is to make one current Card feel clear, reachable, and easy to act on.

### Screen hierarchy

The Today screen uses three visual zones:

```
Lightweight top information
Card stage
Bottom navigation
```

The Card stage is the primary visual and interaction focus.

The top information zone should provide context without competing with the Card.

### Top information

The top zone may contain:

- current date
- sleep
- steps
- remaining Card count
- add Card action

Rules:

- keep the zone visually light
- do not let metadata dominate the screen
- reduce unnecessary vertical spacing
- avoid decorative symbols that do not belong to the shared icon system

### Deck label

The deck label should be quiet and text-led.

Preferred:

```
TODAY
```

Optional:

```
TODAY DECK
```

Avoid decorative emoji-like or mismatched icons next to the label.

If an icon is used in the future, it must come from the same visual system as the primary navigation icons and serve a clear purpose.

### Card stage position

The Card stage should sit around the visual center to lower-center portion of the usable content area.

The exact position should be optimized for repeated thumb interaction on a real phone.

The stage should not:

- feel suspended too high on the page
- collide visually with the bottom navigation
- leave a large unused empty band below
- force the user to repeatedly reach into an uncomfortable area

The desired feeling is:

> The Card is where the hand naturally wants to work.

### Card stage stability

The overall Card stack should have a stable resting position.

Gesture movement belongs to the active Card, not to the whole page composition.

The surrounding screen should remain visually anchored while the Card is dragged.

### Card role

A Card is a decision object.

It is not:

- a dashboard
- a form
- a project panel
- a container for many metadata fields

The Card should contain only enough information to answer:

- What is this?
- When does it belong?
- Is there one small piece of useful context?

### Card information structure

Each Focus Card should use a stable three-layer information hierarchy.

#### 1. Top meta

Lightweight timing or origin context.

Examples:

- `2:00 PM`
- `Anytime`
- `From Life List`

This layer is quiet and should never compete with the title.

#### 2. Main title

The strongest text element on the Card.

Rules:

- visually dominant
- comfortably readable
- usually one or two lines
- left aligned by default
- should remain readable during drag

#### 3. Bottom support

One optional light supporting line.

Examples:

- `From Life List`
- `Recurring weekly`
- `No strict time`
- another factual, non-judgmental context line

The support line exists to give the Card visual structure and useful context.

It must not become motivational filler.

### Card density

The Card should feel spacious, but not hollow.

Avoid:

- a very large flat surface containing only one title
- arbitrary decorative text added only to fill space
- excessive metadata
- multiple badges and buttons

Use layout structure rather than extra content to solve emptiness.

### Card proportions

The Card should feel like a physical object with a stable proportion.

Responsive sizing should preserve:

- comfortable drag area
- readable title
- visible surrounding stack
- balanced whitespace

Do not stretch the Card simply because the viewport is tall.

Do not make it so small that the gesture surface feels cramped.

### Card surface

The active Card uses the primary deep-green surface.

The Card should gain visual richness through:

- deliberate padding
- typography hierarchy
- restrained shadow
- subtle internal alignment

Not through:

- gradients
- heavy borders
- decorative textures
- multiple strong colors

### Surrounding Cards

Back Cards should communicate stack depth without competing with the active Card.

They should:

- use quiet pale-green surfaces
- remain partially visible
- have consistent radius and geometry
- support the illusion of a physical stack

They should not reveal unnecessary detail.

### Gesture Hint relationship

The unified Gesture Hint remains fixed in the Card stage.

The Card moves; the Hint remains stable.

The Hint should never visually overpower:

- Card title
- Card silhouette
- Card stack

### Visual review test

Before accepting a Today Card redesign, check:

- Does the Card dominate attention without overwhelming the page?
- Is the Card positioned where repeated thumb gestures feel natural?
- Does the Card feel spacious but not empty?
- Is the title clearly the strongest element?
- Does the top information remain secondary?
- Does the screen still look calm when no gesture is happening?
- Does the Card still feel like part of the same product family as Calendar and Me?

### Current implementation priority

The next Today redesign should proceed in this order:

1. rebalance the top information area
2. remove the mismatched icon beside the Today deck label
3. reposition the Card stage for better hand ergonomics
4. rebuild the Focus Card using the three-layer content structure
5. tune Card height and typography on real phone screenshots
6. preserve the already-frozen centered Gesture Hint behaviour

---

## 11. Today — Overview mode

Overview is the deck.

It is not a list.

### Core rule

**The selected Card must always remain in the same visual center position and always be the top visual layer.**

When the user swipes vertically:

- the selected slot does not move
- the selected Card does not drift with the finger
- the Card content / selected index changes
- surrounding cards animate around the fixed focus position

Think of it as:

> a fixed focus window with Cards moving through it

Not:

> dragging the whole deck around the page

### Selected Card

The selected Card:

- stays centered
- stays on top
- uses the deep-green primary surface
- has the strongest title contrast

### Surrounding Cards

Previous / next Cards:

- use quiet surfaces
- sit visually behind the selected Card
- remain readable enough to communicate deck structure
- must not compete with the selected Card

### Outcome summary

Done / Tomorrow / Let Go should stay secondary.

They should not visually compete with the current deck.

---

## 12. Calendar

Calendar answers:

> What does my time look like overall?

Today answers:

> What should I face now?

These two screens must remain visually distinct but use the same design system.

### Month view

The month is the primary focus.

Use the existing semantic marker language:

- ○ future / planned
- ▭ today / active
- ● past / closed
- — past / not closed

Marker count may communicate density, capped visually at three.

### Month switching

Gesture-first:

- swipe left → next month
- swipe right → previous month

Do not depend on arrow buttons as the primary month navigation.

### Selected day summary

Calendar should show a compact summary first.

Full day details should appear only after explicit intent.

Do not force the full Day Card into the month view.

---

## 13. Me

Me answers:

> What do I want long-term, and what has my life actually looked like?

Top-level sections:

- Life List
- Reviews
- My Data

### Life List

Long-term intent.

It should feel lighter than Today Cards.

Life List items:

- do not require dates
- do not use Today gesture outcomes
- may later become Cards

### Reviews

Reviews is one unified entry.

Do not put separate This Week / This Month / This Year cards on the Me home screen.

Inside Reviews:

```
Week   Month   Year

Previous ← current period → Next
```

The same review structure should support:

- current week
- previous week
- previous month
- older months
- years

Reviews describe behaviour.

They do not grade it.

### My Data

Contains factual personal data such as:

- sleep
- steps
- future integrations

It should remain calm and factual rather than dashboard-like.

---

## 13.1 Me detail navigation

Every second-level screen inside **Me** must support both explicit and gesture-based back navigation.

Required behaviours:

- keep a visible back control such as `← Me`
- support a swipe-right gesture that starts from the **left screen edge**
- the edge gesture returns to the Me home screen
- do not use a full-screen right-swipe gesture, because Reviews and future detail screens may use horizontal interaction internally
- while swiping back, the current detail screen may follow the finger slightly to provide spatial feedback
- if the gesture does not pass the return threshold, the screen settles back into place
- the gesture should never replace the visible back button; both paths must remain available

This is a shared Me navigation rule, not a Life List-specific behaviour.

---

## 14. Closed Day

Closed Day is a completion state.

It should feel resolved and quiet.

Structure:

```
Closed state
Date
Day summary
View in Calendar
```

Avoid leaving a small content block at the top followed by a huge meaningless empty area.

The content group should form one coherent visual composition.

Do not fill empty space by stretching cards or typography.

---

## 14.1 Past open day resolution

A historical day that was never closed must not become a dead read-only state.

Calendar state:

```
Past + OPEN
→ Resolve Day
→ Past + CLOSED
```

Historical resolution is intentionally different from closing Today.

Because "Tomorrow" from an old date may already be in the past, unresolved Cards use:

- **Done** — confirm it was completed on that historical day
- **Bring to Today** — keep it actionable now
- **Let go** — consciously stop carrying it

Rules:

- resolving an old day does not reopen the whole historical day
- already recorded historical outcomes are not edited
- only unresolved Cards are processed
- Not now is unavailable
- when the final unresolved Card is processed, a Day Card is created automatically
- Calendar changes the day from open to closed
- a Card brought forward becomes actionable Today, while preserving where it came from conceptually

The purpose is to repair an unfinished historical boundary without rewriting later history.

---

## 14.2 Closed Day information hierarchy

A Closed Day is a dedicated reflection/result screen, not just a success confirmation.

It should answer both:

- How did the day resolve overall?
- Which Cards ended in each outcome?

Use two layers:

1. **Summary**
   - Done / Tomorrow / Let Go counts
   - Sleep
   - Steps

2. **Activity outcome detail**
   - concrete Card titles grouped by outcome
   - show only non-empty groups
   - keep rows simple and factual

Recommended grouping:

```
DONE
✓ Card title

TOMORROW
← Card title

LET GO
↓ Card title
```

Do not hide all activity detail behind another interaction on this screen. The user has intentionally reached the end-of-day result and should be able to understand what happened without opening a second layer.

The page may scroll when there are many Cards. Preserving meaningful information is more important than forcing the result into a single viewport.

### Closed Day navigation placement

`View in Calendar` is a page-level navigation action, not the final item in the activity list.

When the Closed Day contains activity details:

- keep the Calendar action visible in the first screenful
- place it in the title/header composition as a quiet secondary action
- do not require the user to scroll through all outcome rows before discovering it
- do not duplicate the same action at both top and bottom unless the page later becomes substantially longer

The action should remain visually secondary to the closed state and date, but clearly discoverable.

### Closed Day header control language

The closed-state indicator and the Calendar action belong to the same header control system.

Required:

- keep the closed-state icon and `DAY CLOSED` label on one line
- keep the Calendar icon and `Calendar` label on one line
- use the same icon family, stroke weight, optical size, and vertical alignment
- use SVG/icon components from the product icon system rather than emoji or Unicode symbols that may render differently by platform
- place the date and supporting copy on the next visual layer

Avoid:

- a large standalone status icon on one line while another action uses icon + text inline
- emoji-style symbols such as `↗`
- mixing filled system emoji with line icons

---

## 15. Responsive behaviour

Responsive design means preserving hierarchy, not simply shrinking everything.

When a screen does not fit:

Prefer:

1. remove duplicated information
2. collapse secondary detail
3. move detail behind intentional interaction
4. reduce unnecessary spacing
5. adjust component geometry

Only then consider reducing text size.

### Never

- shrink all text until the screen fits
- stretch a card to fill unused height
- insert huge blank areas between related sections
- make 8px text carry important information
- create completely different visual rules for each screen

---

## 16. Empty space rule

Whitespace must be intentional.

Good whitespace:

- separates hierarchy
- makes the primary object feel calm
- creates breathing room around a focal card

Bad whitespace:

- appears because flexbox filled the viewport
- splits related content into distant islands
- makes the page look unfinished
- forces important content toward the bottom

If whitespace exists between two related sections, ask whether those sections should actually be closer.

---

## 17. Interaction consistency

The product already uses gesture-based interaction.

Future interactions should reuse established patterns where possible.

Examples:

- horizontal swipe → time navigation
- vertical swipe → Card/deck browsing
- tap selected Card → enter Focus
- tap secondary summary → reveal detail
- deep green → current focus / primary action

Avoid introducing new gesture meanings casually.

---

## 18. Design review checklist

Before accepting any UI change, check:

### Visual focus
- Is there one obvious primary focus?
- Is anything competing with it unnecessarily?

### Typography
- Are important labels readable on a real phone?
- Are there too many unrelated font sizes?

### Spacing
- Does spacing come from the shared scale?
- Is any large blank area accidental?

### Components
- Do cards, buttons, and panels look related?
- Are corner radii and surfaces consistent?

### Navigation
- Do all three navigation items feel like one component family?
- Is Today emphasized without looking like a different product?

### Interaction
- Does the interaction preserve visual stability?
- Does the selected item remain visually anchored?

### Product principle
- Is the UI describing rather than judging?
- Does the screen still feel calm and lightweight?

---

## 19. Change policy

This file should evolve deliberately.

When a future feature requires breaking one of these rules:

1. identify the conflict
2. decide whether the feature should adapt
3. if the rule itself is no longer correct, update this document first
4. then update the implementation

Do not silently create screen-specific exceptions.

---

## 20. Current design priorities

The next UI cleanup should prioritize:

1. unify Calendar / Today / Me navigation icons and geometry
2. anchor Overview selected Card to a fixed central position
3. remove viewport-driven artificial whitespace
4. normalize mobile typography
5. normalize vertical spacing between Today, Calendar, Closed Day, and Me
6. verify all major screens on real iPhone-sized viewports

This document is the design baseline for those changes.
