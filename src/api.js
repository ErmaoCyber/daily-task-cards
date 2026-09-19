function formatTime(shortTime) {
  if (!shortTime) return null;

  const [hours, minutes] = shortTime.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Keep the HTTP status message when the response has no JSON body.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function toUiCard(card) {
  const shortTime = card.scheduledTime
    ? card.scheduledTime.slice(0, 5)
    : null;

  if (card.state === "MOVED") {
    const movedFrom = card.scheduledDate;
    const next = new Date(`${movedFrom}T12:00:00`);
    next.setDate(next.getDate() + 1);
    const scheduledDate = [
      next.getFullYear(),
      String(next.getMonth() + 1).padStart(2, "0"),
      String(next.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      id: card.occurrenceId,
      cardId: card.cardId,
      title: card.title,
      note: card.note || "",
      scheduledDate,
      shortTime,
      time: formatTime(shortTime),
      timezone: card.timezone,
      status: "tomorrow",
      movedFrom,
    };
  }

  return {
    id: card.occurrenceId,
    cardId: card.cardId,
    title: card.title,
    note: card.note || "",
    scheduledDate: card.scheduledDate,
    shortTime,
    time: formatTime(shortTime),
    timezone: card.timezone,
    status:
      card.state === "OPEN"
        ? undefined
        : card.state === "DONE"
          ? "done"
          : card.state === "LET_GO"
            ? "letgo"
            : card.state.toLowerCase(),
  };
}

export async function fetchCardsForDate(date) {
  const cards = await request(
    `/api/today?date=${encodeURIComponent(date)}`,
  );
  return cards.map(toUiCard);
}

export function createCard(values) {
  return request("/api/cards", {
    method: "POST",
    body: JSON.stringify({
      title: values.title,
      note: values.note || null,
      scheduledDate: values.scheduledDate,
      scheduledTime: values.shortTime || null,
      timezone: "Pacific/Auckland",
    }),
  });
}

export function markDone(occurrenceId) {
  return request(`/api/occurrences/${occurrenceId}/done`, {
    method: "POST",
  });
}

export function letGo(occurrenceId) {
  return request(`/api/occurrences/${occurrenceId}/let-go`, {
    method: "POST",
  });
}

export function moveOccurrence(occurrenceId, targetDate) {
  return request(`/api/occurrences/${occurrenceId}/move`, {
    method: "POST",
    body: JSON.stringify({ targetDate }),
  });
}


function toCalendarCard(card) {
  const shortTime = card.scheduledTime
    ? card.scheduledTime.slice(0, 5)
    : null;

  return {
    id: card.occurrenceId,
    cardId: card.cardId,
    title: card.title,
    note: card.note || "",
    scheduledDate: card.scheduledDate,
    shortTime,
    time: formatTime(shortTime),
    timezone: card.timezone,
    occurrenceState: card.state,
    status:
      card.state === "OPEN"
        ? undefined
        : card.state === "DONE"
          ? "done"
          : card.state === "LET_GO"
            ? "letgo"
            : card.state.toLowerCase(),
  };
}

export async function fetchCalendarRange(startDate, endDate) {
  const cards = await request(
    `/api/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return cards.map(toCalendarCard);
}
