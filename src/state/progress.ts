import type {
  CalendarState,
  DayProgress,
  Progress,
  DoorStatus,
} from '../types/calendar.ts';

export const EMPTY_DAY: DayProgress = {
  opened: false,
  doorTicket: false,
  answer: null,
  quizTickets: 0,
  pieces: [],
};

/* Creates the default calendar state with an empty guest profile. */
export function initialState(): CalendarState {
  return {
    version: 1,
    activeProfile: null,
    demoDate: '2026-12-06',
    profiles: { guest: { days: {} } },
  };
}

/* Formats a date as a calendar date in Copenhagen time. */
export function copenhagenDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Copenhagen',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  /* Reads one formatted date part, falling back to an empty string. */
  const part = (type: string) =>
    parts.find(
      /* Matches the requested year, month, or day part. */
      (item) => item.type === type
    )?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/* Checks whether a valid calendar door has reached its opening date. */
export function isAvailable(day: number, date: string): boolean {
  return (
    Number.isInteger(day) &&
    day >= 1 &&
    day <= 24 &&
    date >= `2026-12-${String(day).padStart(2, '0')}`
  );
}

/* Returns progress for the active profile or guest. */
export function getProgress(state: CalendarState): Progress {
  return state.profiles[state.activeProfile ?? 'guest'] ?? { days: {} };
}

/* Returns a day’s saved progress or the empty default. */
export function getDay(progress: Progress, day: number): DayProgress {
  return progress.days[day] ?? EMPTY_DAY;
}

/* Determines whether a door is locked, openable, or already opened. */
export function getDoorStatus(
  day: number,
  date: string,
  progress: Progress
): DoorStatus {
  if (!isAvailable(day, date)) return 'locked';
  return getDay(progress, day).opened ? 'opened' : 'openable';
}

/* Counts the tickets earned from opening a day and answering its quiz. */
export function dayTickets(day: DayProgress): number {
  return Number(day.doorTicket) + day.quizTickets;
}

/* Adds up tickets earned across all days. */
export function totalTickets(progress: Progress): number {
  return Object.values(progress.days).reduce(
    /* Adds one day’s tickets to the running total. */
    (sum, day) => sum + dayTickets(day),
    0
  );
}

export type ProgressAction =
  | { type: 'login'; email: string }
  | { type: 'logout' }
  | { type: 'date'; date: string }
  | { type: 'open'; day: number; profile: string | null }
  | {
      type: 'answer';
      day: number;
      answer: number;
      correctIndex: number;
      profile: string | null;
    }
  | { type: 'piece'; day: number; piece: number; profile: string | null }
  | { type: 'reset' }
  | { type: 'example' };

/* Applies a validated profile, date, or progress action without mutating state. */
export function reduceProgress(
  state: CalendarState,
  action: ProgressAction,
  today = copenhagenDate()
): CalendarState {
  if (action.type === 'login') {
    const email = action.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return state;
    return {
      ...state,
      activeProfile: email,
      profiles: {
        ...state.profiles,
        [email]: state.profiles[email] ?? { days: {} },
      },
    };
  }
  if (action.type === 'logout') return { ...state, activeProfile: null };
  if (action.type === 'date') {
    if (action.date !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(action.date))
      return state;
    return { ...state, demoDate: action.date };
  }
  if (action.type === 'example') {
    const days: Record<number, DayProgress> = {};
    // Matches the supplied December 6 mockup: 6 + 2 + 6 + 6 + 2 = 22 tickets.
    [5, 1, 5, 5, 1].forEach(
      /* Populates one day of the example profile’s progress. */
      (tickets, index) => {
        days[index + 1] = {
          ...EMPTY_DAY,
          opened: true,
          doorTicket: true,
          answer: [1, 0, 0, 2, 1][index],
          quizTickets: tickets,
          pieces: [],
        };
      }
    );
    return {
      ...state,
      activeProfile: 'eksempel@lillefjer.dk',
      demoDate: '2026-12-06',
      profiles: { ...state.profiles, 'eksempel@lillefjer.dk': { days } },
    };
  }
  const key = state.activeProfile ?? 'guest';
  const progress = getProgress(state);
  if (action.type === 'reset') {
    return { ...state, profiles: { ...state.profiles, [key]: { days: {} } } };
  }
  // An action started before switching accounts must never affect the new account.
  if (
    action.profile !== state.activeProfile ||
    !isAvailable(action.day, state.demoDate || today)
  )
    return state;
  const current = getDay(progress, action.day);
  let next: DayProgress;
  if (action.type === 'open') {
    if (current.opened) return state;
    next = {
      ...current,
      opened: true,
      doorTicket: Boolean(state.activeProfile),
    };
  } else if (action.type === 'answer') {
    if (
      !current.opened ||
      current.answer !== null ||
      !Number.isInteger(action.answer) ||
      action.answer < 0 ||
      action.answer > 2
    )
      return state;
    next = {
      ...current,
      answer: action.answer,
      quizTickets: state.activeProfile
        ? action.answer === action.correctIndex
          ? 5
          : 1
        : 0,
    };
  } else {
    if (
      action.day !== 6 ||
      !current.opened ||
      !Number.isInteger(action.piece) ||
      action.piece < 1 ||
      action.piece > 24 ||
      current.pieces.includes(action.piece)
    )
      return state;
    next = { ...current, pieces: [...current.pieces, action.piece] };
  }
  return {
    ...state,
    profiles: {
      ...state.profiles,
      [key]: { days: { ...progress.days, [action.day]: next } },
    },
  };
}

// Saved browser data is input too. Invalid or older unknown formats start safely.
/* Validates saved browser data and restores safe calendar state. */
export function parseSavedState(raw: string | null): CalendarState {
  if (!raw) return initialState();
  try {
    const value = JSON.parse(raw);
    if (
      value.version !== 1 ||
      !value.profiles ||
      typeof value.profiles !== 'object' ||
      Array.isArray(value.profiles)
    )
      return initialState();
    const profiles: Record<string, Progress> = {};
    for (const [key, entry] of Object.entries(value.profiles)) {
      if (key !== 'guest' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) continue;
      const savedDays = (entry as Progress)?.days;
      if (!savedDays || typeof savedDays !== 'object') continue;
      const days: Record<number, DayProgress> = {};
      for (let day = 1; day <= 24; day++) {
        const item = savedDays[day];
        if (!item || item.opened !== true) continue;
        const answer =
          Number.isInteger(item.answer) &&
          item.answer !== null &&
          item.answer >= 0 &&
          item.answer <= 2
            ? item.answer
            : null;
        days[day] = {
          opened: true,
          doorTicket: key !== 'guest' && item.doorTicket === true,
          answer,
          quizTickets:
            key !== 'guest' &&
            answer !== null &&
            [1, 5].includes(item.quizTickets)
              ? item.quizTickets
              : 0,
          pieces:
            day === 6 && Array.isArray(item.pieces)
              ? [
                  ...new Set(
                    item.pieces.filter(
                      /* Keeps only valid puzzle piece numbers. */
                      (n) => Number.isInteger(n) && n >= 1 && n <= 24
                    )
                  ),
                ]
              : [],
        };
      }
      profiles[key] = { days };
    }
    profiles.guest ??= { days: {} };
    return {
      version: 1,
      activeProfile:
        typeof value.activeProfile === 'string' &&
        profiles[value.activeProfile] &&
        value.activeProfile !== 'guest'
          ? value.activeProfile
          : null,
      demoDate:
        typeof value.demoDate === 'string' &&
        (value.demoDate === '' || /^\d{4}-\d{2}-\d{2}$/.test(value.demoDate))
          ? value.demoDate
          : '2026-12-06',
      profiles,
    };
  } catch {
    return initialState();
  }
}
