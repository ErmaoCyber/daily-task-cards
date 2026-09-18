export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function plusDays(day, count) {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + count);
  return localDate(date);
}
export function repeatLabel(repeat) {
  return !repeat
    ? ""
    : repeat.every === 1
      ? repeat.unit === "days"
        ? "Daily"
        : "Weekly"
      : `Every ${repeat.every} ${repeat.unit}`;
}
export function gesture({ x, y }, threshold = 65) {
  if (Math.abs(x) > threshold && Math.abs(x) > Math.abs(y) * 1.4)
    return x > 0 ? "done" : "tomorrow";
  if (Math.abs(y) > threshold && Math.abs(y) > Math.abs(x) * 1.4)
    return y > 0 ? "letgo" : "notnow";
  return null;
}
export function sortCards(cards, now) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const rank = (card) => {
    if (!card.shortTime) return 20000;
    const [h, m] = card.shortTime.split(":").map(Number);
    const delta = h * 60 + m - minutes;
    // Past times stay calm and available; the next two hours come before Anytime.
    return delta <= 0
      ? 1000 + Math.abs(delta)
      : delta <= 120
        ? 10000 + delta
        : 30000 + delta;
  };
  return [...cards].sort((a, b) => rank(a) - rank(b) || a.id - b.id);
}
// Roll forward in memory. A repeating card advances to its next occurrence,
// rather than carrying yesterday's unfinished instance alongside a new one.
export function rollToDay(cards, day) {
  return cards
    .map((card) => {
      if (card.scheduledDate >= day || card.status === "letgo") return card;
      if (card.repeat) {
        const interval =
          card.repeat.every * (card.repeat.unit === "weeks" ? 7 : 1);
        let next = plusDays(card.scheduledDate, interval);
        while (next < day) next = plusDays(next, interval);
        return {
          ...card,
          scheduledDate: next,
          status: undefined,
          movedFrom: undefined,
        };
      }
      return card.status === "done"
        ? card
        : {
            ...card,
            scheduledDate: day,
            status: undefined,
            movedFrom: undefined,
          };
    })
    .map((card) =>
      card.status === "tomorrow" && card.scheduledDate <= day
        ? { ...card, status: undefined, movedFrom: undefined }
        : card,
    );
}
