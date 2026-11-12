import { useSyncExternalStore } from 'react';
import { initialState, parseSavedState, reduceProgress } from './progress';
import type { ProgressAction } from './progress';

const STORAGE_KEY = 'lille-fjer-calendar-v1';
const listeners = new Set<() => void>();
let storageAvailable = true;
let snapshot = initialState();
try { snapshot = parseSavedState(localStorage.getItem(STORAGE_KEY)); }
catch { storageAvailable = false; }

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function notify() { listeners.forEach(listener => listener()); }

window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY || event.key === null) {
    snapshot = parseSavedState(event.newValue);
    notify();
  }
});

export async function updateProgress(action: ProgressAction) {
  const commit = () => {
    if (storageAvailable) {
      try { snapshot = parseSavedState(localStorage.getItem(STORAGE_KEY)); }
      catch { storageAvailable = false; }
    }
    snapshot = reduceProgress(snapshot, action);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); }
    catch { storageAvailable = false; }
    notify();
  };
  // Serializes changes from multiple tabs where Web Locks is supported.
  if (navigator.locks) await navigator.locks.request(STORAGE_KEY, commit);
  else commit();
}

export function useCalendarState() {
  const state = useSyncExternalStore(subscribe, () => snapshot);
  return { state, storageAvailable };
}
