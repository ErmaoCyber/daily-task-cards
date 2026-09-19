# Database Design

This document is the backend data-model source of truth for **day by day.**

The goal is to support the current product while preserving a clean path for recurrence, historical correction, reviews, reminders, health integrations, AI insights, and richer scheduling later.

The design deliberately avoids premature microservices or full event sourcing. It uses a relational PostgreSQL core, explicit temporal history, and small extension points.

---

## 1. Design principles

1. **Separate identity from occurrence.**
   - A `Card` describes what something is.
   - A `CardOccurrence` describes when that Card appears in the user's timeline.

2. **Do not overwrite history.**
   - Moving, completing, or letting go of an occurrence must not erase what happened on previous dates.

3. **Use domain concepts, not UI wording, as persistence states.**
   - UI action `Tomorrow` maps to domain state `MOVED`.
   - Historical UI action `Bring to Today` also maps to `MOVED`.

4. **Separate live values from historical snapshots.**
   - Daily metrics may later change after sync.
   - A closed Day Record preserves the values captured when the day was closed.

5. **Preserve effective time and recorded time where history matters.**
   - A result may belong to Sep 14 but be recorded on Sep 18.

6. **Normalize core entities, denormalize only deliberate snapshots/projections.**

7. **Use database constraints to protect invariants.**
   - Foreign keys, uniqueness, checks, and indexes belong in PostgreSQL, not only in Java code.

8. **Keep the MVP implementable.**
   - The model may anticipate future features, but the first Spring Boot iteration should remain a modular monolith.

---

## 2. Domain overview

```text
User
 │
 ├── UserSettings
 │
 ├── Card
 │    ├── RecurrenceRule
 │    ├── CardOccurrence
 │    │    ├── CardOutcome
 │    │    ├── Reminder
 │    │    └── OccurrenceLink ──► CardOccurrence
 │    └── LifeItemCardLink
 │
 ├── LifeItem
 │
 ├── DayRecord
 │    └── DayMetricSnapshot
 │
 ├── DailyMetric
 │    └── MetricSource
 │
 └── DomainEvent
```

The most important relationship is:

```text
Card
  1
  │
  └── many CardOccurrence
```

This allows one task identity to participate in many dates without losing history.

---

## 3. users

Represents the owner of all personal data.

```text
users
--------------------------------
id                uuid / bigint PK
email             varchar unique
display_name      varchar
timezone          varchar
locale            varchar
created_at        timestamptz
updated_at        timestamptz
```

### Notes

- `timezone` should store an IANA zone such as `Pacific/Auckland`.
- Date-based product concepts such as Today, Tomorrow, and Close Day are interpreted in the user's timezone.
- Timestamp columns should use PostgreSQL `timestamptz`.

---

## 4. user_settings

Stores preferences that are not part of user identity.

```text
user_settings
--------------------------------
user_id           FK -> users.id, PK
week_starts_on    smallint
default_locale    varchar
created_at        timestamptz
updated_at        timestamptz
```

Future examples may include notification defaults, first-day-of-week, or display preferences.

---

## 5. cards

Represents the stable identity/content of a Card.

```text
cards
--------------------------------
id                PK
user_id           FK -> users.id

title             varchar
note              text

source_type       varchar nullable
source_id         varchar nullable

status            enum/varchar
created_at        timestamptz
updated_at        timestamptz
archived_at       timestamptz nullable
```

### Card status

```text
ACTIVE
ARCHIVED
```

Do **not** store `DONE`, `MOVED`, `LET_GO`, or `TOMORROW` here.

Those belong to an occurrence.

### Source fields

`source_type/source_id` provide a future extension point for Cards created from another feature, import, or integration.

Examples:

```text
LIFE_ITEM
IMPORT
AI
EXTERNAL
```

They are optional and should not drive MVP behavior.

---

## 6. card_occurrences

The core timeline table.

A CardOccurrence means:

> this Card participates in this date/time slot.

```text
card_occurrences
--------------------------------
id                PK
user_id           FK -> users.id
card_id           FK -> cards.id

scheduled_date    date
scheduled_time    time nullable
timezone          varchar nullable

state             enum/varchar

created_at        timestamptz
updated_at        timestamptz
resolved_at       timestamptz nullable
```

### Occurrence state

```text
OPEN
DONE
MOVED
LET_GO
CANCELLED
```

### Why MOVED instead of TOMORROW

`Tomorrow` is UI wording.

The underlying domain behavior is rescheduling.

This future-proofs:

```text
Tomorrow
Bring to Today
Move to Friday
Next week
Pick another date
```

All can be represented as `MOVED`.

### Not Now

`NOT_NOW` is intentionally **not persisted**.

It is an in-session browsing state and should disappear when the browsing round ends.

---

## 7. occurrence_links

Stores lineage between occurrences.

```text
occurrence_links
--------------------------------
id                    PK
from_occurrence_id    FK -> card_occurrences.id
to_occurrence_id      FK -> card_occurrences.id
link_type             enum/varchar
created_at            timestamptz
```

Initial link type:

```text
MOVED_TO
```

Example:

```text
Sep 18 Java Study [MOVED]
       │
       └── MOVED_TO
             ↓
Sep 19 Java Study [MOVED]
       │
       └── MOVED_TO
             ↓
Sep 20 Java Study [DONE]
```

This allows reliable answers to:

- where did this occurrence come from?
- how many times was this Card moved?
- what is the movement chain?
- which Cards are "most moved" in Reviews?

### Constraint direction

A first implementation should enforce that both occurrences belong to the same Card and same user at service level. A database-level enforcement strategy can be added when migrations are designed.

---

## 8. card_outcomes

Stores historical outcome facts.

```text
card_outcomes
--------------------------------
id                PK
occurrence_id     FK -> card_occurrences.id

outcome_type      enum/varchar

effective_date    date
recorded_at       timestamptz

source            enum/varchar
created_at        timestamptz
```

### Outcome type

Initial values:

```text
DONE
MOVED
LET_GO
CANCELLED
```

### Source

Possible values:

```text
TODAY
CLOSE_DAY
HISTORICAL_RESOLUTION
SYSTEM
```

### Effective time vs recorded time

Example:

```text
scheduled_date = 2026-09-14
outcome_type   = DONE
effective_date = 2026-09-14
recorded_at    = 2026-09-18T22:13:00+12
source         = HISTORICAL_RESOLUTION
```

This means:

- the fact belongs to Sep 14
- the user only recorded/confirmed it on Sep 18

### Why keep both state and outcome history?

`card_occurrences.state` is the fast current projection.

`card_outcomes` preserves the historical fact trail.

This is intentionally **not** full event sourcing.

---

## 9. recurrence_rules

Stores recurring behavior separately from a Card occurrence.

```text
recurrence_rules
--------------------------------
id                PK
card_id           FK -> cards.id

dtstart           timestamptz/date
rrule             text
timezone          varchar

active            boolean
created_at        timestamptz
updated_at        timestamptz
```

Example rule:

```text
FREQ=WEEKLY;BYDAY=MO,WE,FR
```

### Recurrence strategy

Do not generate infinite future occurrences.

Use:

```text
Recurrence definition
        ↓
materialize a bounded future window
        ↓
extend the window when needed
```

A later implementation may materialize approximately 30–90 days ahead.

The MVP UI may still offer only simple choices such as Daily / Weekly / Monthly while the persistence format remains extensible.

---

## 10. day_records

Represents the explicit Close Day boundary.

```text
day_records
--------------------------------
id                PK
user_id           FK -> users.id
date              date

status            enum/varchar
closed_at         timestamptz nullable

done_count        integer
moved_count       integer
let_go_count      integer

created_at        timestamptz
updated_at        timestamptz
```

### Day status

```text
OPEN
CLOSED
```

### Unique rule

One DayRecord per user per date:

```text
UNIQUE(user_id, date)
```

### Why keep counts?

They can be recomputed from occurrences, but a closed Day Card is explicitly a historical snapshot.

Therefore the counts are deliberate snapshot fields, not accidental duplication.

---

## 11. day_metric_snapshots

Preserves metric values captured at Close Day.

```text
day_metric_snapshots
--------------------------------
id                PK
day_record_id     FK -> day_records.id

metric_type       varchar
value_numeric     numeric
unit              varchar

source_metric_id  FK -> daily_metrics.id nullable
captured_at       timestamptz
```

Example:

```text
Sleep = 428 MINUTES
Steps = 8421 COUNT
```

If a later Health sync changes Sep 18 steps to 8,600:

- My Data may show 8,600 as the latest factual metric.
- The Day Card may continue to show 8,421 because that was the value captured when the day was closed.

This matches the product rule:

```text
Today = live data
Day Card = snapshot
```

---

## 12. daily_metrics

Stores factual personal metrics.

```text
daily_metrics
--------------------------------
id                PK
user_id           FK -> users.id
date              date

metric_type       varchar
value_numeric     numeric
unit              varchar

source_id         FK -> metric_sources.id nullable

measured_at       timestamptz nullable
recorded_at       timestamptz

metadata_json     jsonb nullable
```

Initial metric types:

```text
SLEEP_DURATION
STEPS
```

Future examples may include:

```text
EXERCISE_MINUTES
HEART_RATE
WEIGHT
SCREEN_TIME
```

The generic type/value/unit structure avoids repeatedly adding one database column per future metric.

---

## 13. metric_sources

Represents where metrics came from.

```text
metric_sources
--------------------------------
id                PK
user_id           FK -> users.id

type              varchar
provider          varchar
external_id       varchar nullable

status            varchar
connected_at      timestamptz nullable
last_sync_at      timestamptz nullable

created_at        timestamptz
updated_at        timestamptz
```

Examples:

```text
MANUAL
APPLE_HEALTH
GARMIN
FITBIT
WECHAT
```

This table can be deferred until a real integration exists.

---

## 14. life_items

Represents long-term intent.

```text
life_items
--------------------------------
id                PK
user_id           FK -> users.id

title             varchar
note              text nullable

status            enum/varchar

created_at        timestamptz
updated_at        timestamptz
completed_at      timestamptz nullable
archived_at       timestamptz nullable
```

### LifeItem status

```text
ACTIVE
DONE
ARCHIVED
```

LifeItem deliberately has no Today gesture outcomes.

It is not a daily Card.

---

## 15. life_item_card_links

Connects long-term intent with concrete Cards.

```text
life_item_card_links
--------------------------------
life_item_id      FK -> life_items.id
card_id           FK -> cards.id
created_at        timestamptz

PK / UNIQUE(life_item_id, card_id)
```

Example:

```text
Get a software job in New Zealand
        │
        ├── Update CV
        ├── Practice Java interview
        └── Apply to Xero
```

A join table is preferred over `cards.life_item_id` because it keeps future many-to-many use possible at very low cost.

---

## 16. reminders

Future notification model.

```text
reminders
--------------------------------
id                PK
user_id           FK -> users.id
occurrence_id     FK -> card_occurrences.id

remind_at         timestamptz
channel           varchar
status            varchar

sent_at           timestamptz nullable
created_at        timestamptz
```

Possible channels:

```text
PUSH
EMAIL
```

Do not model reminders as a boolean on Card.

One occurrence may eventually have multiple reminders.

---

## 17. domain_events

Optional lightweight audit/integration stream.

```text
domain_events
--------------------------------
id                PK
user_id           FK -> users.id

aggregate_type    varchar
aggregate_id      varchar

event_type        varchar
event_version     integer

occurred_at       timestamptz
recorded_at       timestamptz

payload_json      jsonb
```

Possible events:

```text
CARD_CREATED
CARD_MOVED
CARD_DONE
CARD_LET_GO
DAY_CLOSED
PAST_DAY_RESOLVED
LIFE_ITEM_CREATED
```

### Important

This table does **not** make the application event-sourced.

The relational tables remain the source used for normal reads and writes.

Domain events may later support:

- debugging
- analytics
- AI insights
- Kafka
- webhooks
- integration jobs

This table is not required for the first backend slice.

---

## 18. State transitions

### CardOccurrence

```text
              ┌──── DONE
              │
OPEN ─────────┼──── LET_GO
              │
              ├──── CANCELLED
              │
              └──── MOVED ──► new OPEN occurrence
```

A resolved occurrence does not return to OPEN in the normal product flow.

Historical correction should be treated as an explicit domain operation rather than a casual row edit.

### DayRecord

```text
OPEN
 │
 └── Close Day
        ↓
      CLOSED
```

A closed day should normally be immutable from standard Today flows.

---

## 19. Important invariants

The database/migration layer should eventually enforce as many of these as practical:

1. A Card belongs to exactly one user.
2. An occurrence belongs to the same user as its Card.
3. A user has at most one DayRecord for a date.
4. A CLOSED DayRecord must have `closed_at`.
5. An OPEN occurrence normally has no `resolved_at`.
6. A DONE / MOVED / LET_GO / CANCELLED occurrence should have `resolved_at`.
7. An occurrence movement link cannot point to itself.
8. LifeItem/Card links cannot be duplicated.
9. Snapshot metrics belong to exactly one DayRecord.
10. NOT_NOW never appears in persisted occurrence state.

Some cross-table invariants may initially be enforced in Spring services if expressing them safely in SQL is disproportionately complex.

---

## 20. Index strategy

Initial likely indexes:

```text
cards(user_id, status)

card_occurrences(user_id, scheduled_date)
card_occurrences(card_id, scheduled_date)
card_occurrences(user_id, state, scheduled_date)

card_outcomes(occurrence_id)
card_outcomes(effective_date)

day_records(user_id, date) UNIQUE

daily_metrics(user_id, date, metric_type)

life_items(user_id, status)

occurrence_links(from_occurrence_id)
occurrence_links(to_occurrence_id)

reminders(user_id, remind_at, status)
```

Do not add speculative indexes until query patterns exist.

The list above is an architectural starting point, not a mandate to create every index immediately.

---

## 21. Reviews are queries, not report tables

Do not create:

```text
weekly_reports
monthly_reports
yearly_reports
```

for the first implementation.

Reviews should be computed from:

```text
card_occurrences
card_outcomes
day_records
daily_metrics
occurrence_links
```

Examples:

- Done this week
- Moved this week
- Let Go this week
- average sleep
- average steps
- most moved Card

A later AI-generated narrative may be stored separately if persistence becomes useful.

---

## 22. MVP implementation scope

The complete model defines architectural boundaries. It does **not** mean all tables must be implemented at once.

### Backend V1

Implement first:

```text
users
cards
card_occurrences
occurrence_links
card_outcomes
day_records
daily_metrics
day_metric_snapshots
life_items
life_item_card_links
recurrence_rules
```

### Defer until needed

```text
user_settings
metric_sources
reminders
domain_events
```

Even inside Backend V1, implementation should proceed vertically by feature rather than creating every entity before any API works.

---

## 23. Recommended backend delivery order

```text
1. PostgreSQL + migrations
2. User boundary / development user
3. Card + CardOccurrence
4. Today queries
5. Done / Move / Let Go commands
6. Close Day + DayRecord
7. Calendar queries
8. Historical open-day resolution
9. Life List
10. Reviews
11. Daily metrics
12. Recurrence
13. Notifications/integrations later
```

This gives the application useful end-to-end slices early.

---

## 24. Architecture boundary

For the initial Spring Boot backend, use a **modular monolith**.

Suggested modules/packages:

```text
user
card
day
life
metric
review
```

Do not introduce:

- microservices
- Kafka
- Redis
- CQRS infrastructure
- separate analytics databases

until the application actually produces a requirement for them.

The domain model should make those future additions possible without requiring them now.

---

## 25. Frozen implementation decisions

The first migration follows these decisions.

### Primary keys

Use PostgreSQL `uuid` for domain entity identifiers.

For initial compatibility, database-generated IDs use:

```sql
DEFAULT gen_random_uuid()
```

The schema does not depend on PostgreSQL 18 `uuidv7()`.

A later application layer may generate UUIDv7 values if the selected Java/PostgreSQL runtime makes that worthwhile. The database type remains unchanged.

### Domain states

Java will use enums.

PostgreSQL stores state values as:

```text
varchar + CHECK constraint
```

rather than PostgreSQL enum types.

This gives database-level validation while keeping state migrations straightforward.

### Historical corrections

Historical outcomes are append-only facts.

A correction creates a new `card_outcomes` row instead of rewriting or deleting the previous fact.

`card_outcomes.supersedes_outcome_id` points to the outcome being corrected.

Normal Calendar/Review reads use the current effective outcome; audit/debug flows may inspect the entire correction chain.

### Recurrence

Recurring definitions use an RRULE-compatible representation.

The product initially supports only a small UI subset, while persistence remains capable of richer recurrence later.

Recurring definitions are materialized into bounded future occurrence windows rather than generating an infinite series.

### Time types

Use:

```text
date        = business calendar date
time        = optional local scheduled clock time
timestamptz = actual recorded instant
timezone    = IANA timezone where local interpretation matters
```

Do not replace a business date with a timestamp simply because a timestamp contains a date component.

### Remaining open decisions

The following may remain open until their feature is implemented:

- exact recurrence Java library
- immutable-vs-correctable policy for already CLOSED DayRecord snapshots
- user deletion / retention policy
- exact reminder ownership and notification delivery model

---

## 26. Current frozen product semantics

The database design must preserve these product decisions:

```text
Done      = persistent
Tomorrow  = UI wording for MOVED
Let Go    = persistent
Not Now   = transient, not persisted

Today     = live working state
Day Card  = historical snapshot

Past + OPEN
→ explicit historical resolution
→ Past + CLOSED

LifeItem != Card

Reviews describe behavior; they do not score it.
```

---

## 27. Next step

Before implementing Spring Boot entities:

1. review this model
2. freeze the key state machines
3. choose PostgreSQL-specific types and constraints
4. create the first migration
5. implement the first vertical backend slice: **Card + CardOccurrence + Today**

The first backend code should be small and end-to-end rather than generating every repository/service/controller at once.
