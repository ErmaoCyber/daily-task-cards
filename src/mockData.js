import { plusDays } from "./planner";

function timedCard(id, title, scheduledDate, shortTime = null, extra = {}) {
  let time = null;

  if (shortTime) {
    const [hours, minutes] = shortTime.split(":").map(Number);
    time = `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
  }

  return {
    id,
    title,
    scheduledDate,
    shortTime,
    time,
    ...extra,
  };
}

export function createMockCards(today) {
  return [
    timedCard(1, "Java Study", today),
    timedCard(2, "Class", today, "14:00", { alert: "At time" }),
    timedCard(3, "Swimming", today, "19:00", { alert: "At time" }),
    timedCard(4, "Buy groceries", today),

    timedCard(20, "Morning walk", plusDays(today, 1), "08:00"),
    timedCard(21, "Java Study", plusDays(today, 1)),
    timedCard(22, "Call parents", plusDays(today, 2), "20:00"),
    timedCard(23, "Swimming", plusDays(today, 3), "19:00"),
    timedCard(24, "Project notes", plusDays(today, 3)),
    timedCard(25, "Class", plusDays(today, 5), "14:00"),
    timedCard(26, "Laundry", plusDays(today, 6)),
    timedCard(27, "Java Study", plusDays(today, 7), null, {
      repeat: { every: 1, unit: "weeks" },
    }),
    timedCard(28, "Swimming", plusDays(today, 8), "19:00", {
      repeat: { every: 1, unit: "weeks" },
    }),
    timedCard(29, "Dentist", plusDays(today, 10), "15:00"),
    timedCard(30, "Portfolio review", plusDays(today, 10)),
    timedCard(31, "Class", plusDays(today, 12), "14:00"),
    timedCard(32, "Weekend groceries", plusDays(today, 14)),
    timedCard(33, "Java Study", plusDays(today, 15)),
    timedCard(34, "Swimming", plusDays(today, 17), "19:00"),
    timedCard(35, "VPS maintenance", plusDays(today, 18), "10:30"),
    timedCard(36, "Read Spring docs", plusDays(today, 20)),
  ];
}

function historyDay(today, offset, {
  done,
  tomorrow = [],
  letgo = [],
  sleep,
  steps,
}) {
  const date = plusDays(today, offset);

  return {
    id: date,
    date,
    done,
    tomorrow,
    letgo,
    sleep,
    steps,
  };
}

export function createMockHistory(today) {
  return [
    historyDay(today, -1, {
      done: ["Class", "Java Study", "Evening walk"],
      tomorrow: ["Buy groceries"],
      sleep: "6h 48m",
      steps: 6321,
    }),
    historyDay(today, -2, {
      done: ["Java Study", "Laundry", "Cook dinner"],
      letgo: ["Read article"],
      sleep: "7h 21m",
      steps: 9102,
    }),
    historyDay(today, -3, {
      done: ["Swimming", "Reply to emails"],
      tomorrow: ["Portfolio review"],
      sleep: "7h 05m",
      steps: 11240,
    }),
    historyDay(today, -5, {
      done: ["Class", "Java Study", "Groceries", "Walk"],
      sleep: "6h 32m",
      steps: 7844,
    }),
    historyDay(today, -6, {
      done: ["Morning walk"],
      letgo: ["Laundry", "Read Spring docs"],
      sleep: "8h 02m",
      steps: 5237,
    }),
    historyDay(today, -8, {
      done: ["Java Study", "Swimming", "Meal prep"],
      tomorrow: ["VPS notes"],
      sleep: "7h 36m",
      steps: 10458,
    }),
    historyDay(today, -10, {
      done: ["Class", "Call parents"],
      sleep: "6h 57m",
      steps: 6891,
    }),
    historyDay(today, -12, {
      done: ["Java Study", "Walk", "Groceries"],
      letgo: ["Watch tutorial"],
      sleep: "7h 43m",
      steps: 9460,
    }),
    historyDay(today, -14, {
      done: ["Swimming", "Project notes", "Laundry", "Cook dinner"],
      sleep: "7h 09m",
      steps: 12031,
    }),
    historyDay(today, -17, {
      done: ["Java Study", "Class"],
      tomorrow: ["Buy groceries", "Read article"],
      sleep: "6h 41m",
      steps: 7124,
    }),
    historyDay(today, -20, {
      done: ["Morning walk", "Java Study", "Swimming"],
      letgo: ["Clean desk"],
      sleep: "7h 28m",
      steps: 10182,
    }),
  ];
}

export function createMockOpenPastDays(today) {
  const date = plusDays(today, -4);

  return [
    {
      date,
      cardCount: 3,
      note: "This day was left open in the prototype.",
      sleep: "7h 14m",
      steps: 7428,
      cards: [
        timedCard(901, "Java Study", date),
        timedCard(902, "Buy groceries", date, "18:00"),
        timedCard(903, "Reply to emails", date),
      ],
    },
  ];
}
