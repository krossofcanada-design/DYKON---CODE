/* Stores calendar progress in localStorage and synchronizes changes with React and other browser tabs. */

import { useSyncExternalStore } from 'react';
import { initialState, parseSavedState, reduceProgress } from './progress';
import type { ProgressAction } from './progress';

const STORAGE_KEY = 'lille-fjer-calendar-v1';
const listeners = new Set<() => void>();
let storageAvailable = true;
let snapshot = initialState();
try {
  snapshot = parseSavedState(localStorage.getItem(STORAGE_KEY));
} catch {
  storageAvailable = false;
}

/* Registers a state listener and returns its unsubscribe function. */
function subscribe(listener: () => void) {
  listeners.add(listener);
  /* Removes the listener when its subscriber disconnects. */
  return () => {
    listeners.delete(listener);
  };
}
/* Notifies all subscribers that calendar state has changed. */
function notify() {
  listeners.forEach(
    /* Calls one registered state listener. */
    (listener) => listener()
  );
}

window.addEventListener(
  'storage',
  /* Refreshes local state when another tab changes saved progress. */
  (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      snapshot = parseSavedState(event.newValue);
      notify();
    }
  }
);

/* Applies and persists a progress action, using a cross-tab lock when available. */
export async function updateProgress(action: ProgressAction) {
  /* Reloads saved state, applies the action, and notifies subscribers. */
  const commit = () => {
    if (storageAvailable) {
      try {
        snapshot = parseSavedState(localStorage.getItem(STORAGE_KEY));
      } catch {
        storageAvailable = false;
      }
    }
    snapshot = reduceProgress(snapshot, action);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      storageAvailable = false;
    }
    notify();
  };
  // Serializes changes from multiple tabs where Web Locks is supported.
  if (navigator.locks) await navigator.locks.request(STORAGE_KEY, commit);
  else commit();
}

/* Subscribes React components to calendar state and storage availability. */
export function useCalendarState() {
  const state = useSyncExternalStore(
    subscribe,
    /* Returns the current state snapshot for React. */
    () => snapshot
  );
  return { state, storageAvailable };
}
