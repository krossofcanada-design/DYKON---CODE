/* Tests calendar unlocking, ticket awards, profile isolation, puzzle progress, and saved-state validation. */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState,
  reduceProgress,
  getProgress,
  getDay,
  totalTickets,
  isAvailable,
  copenhagenDate,
  parseSavedState,
  getDoorStatus,
} from '../src/state/progress.ts';

const email = 'tester@example.com';
/* Creates a fresh logged-in test profile. */
function member() {
  return reduceProgress(initialState(), { type: 'login', email });
}

test(
  'dates include year and unlock at Copenhagen midnight',
  /* Checks opening dates and the Copenhagen midnight boundary. */
  () => {
    assert.equal(isAvailable(6, '2026-12-05'), false);
    assert.equal(isAvailable(6, '2026-12-06'), true);
    assert.equal(isAvailable(6, '2026-12-24'), true);
    assert.equal(isAvailable(24, '2027-01-01'), true);
    assert.equal(isAvailable(6, '2025-12-25'), false);
    assert.equal(isAvailable(0, '2026-12-25'), false);
    assert.equal(isAvailable(25, '2026-12-25'), false);
    assert.equal(
      copenhagenDate(new Date('2026-12-05T23:00:00Z')),
      '2026-12-06'
    );
    assert.equal(
      copenhagenDate(new Date('2026-12-05T22:59:59Z')),
      '2026-12-05'
    );
  }
);

test(
  'guest can open and answer without tickets',
  /* Checks that guests can participate without earning tickets. */
  () => {
    let state = reduceProgress(initialState(), {
      type: 'open',
      day: 6,
      profile: null,
    });
    state = reduceProgress(state, {
      type: 'answer',
      day: 6,
      answer: 1,
      correctIndex: 1,
      profile: null,
    });
    assert.equal(getDay(getProgress(state), 6).opened, true);
    assert.equal(getDay(getProgress(state), 6).answer, 1);
    assert.equal(totalTickets(getProgress(state)), 0);
  }
);

test(
  'one lid plus correct quiz gives six tickets exactly once',
  /* Checks that door and correct-answer tickets are awarded only once. */
  () => {
    let state = member();
    state = reduceProgress(state, { type: 'open', day: 6, profile: email });
    state = reduceProgress(state, { type: 'open', day: 6, profile: email });
    assert.equal(totalTickets(getProgress(state)), 1);
    state = reduceProgress(state, {
      type: 'answer',
      day: 6,
      answer: 1,
      correctIndex: 1,
      profile: email,
    });
    const submitted = state;
    state = reduceProgress(state, {
      type: 'answer',
      day: 6,
      answer: 0,
      correctIndex: 1,
      profile: email,
    });
    assert.equal(state, submitted);
    assert.equal(totalTickets(getProgress(state)), 6);
    assert.equal(
      totalTickets(getProgress(parseSavedState(JSON.stringify(state)))),
      6
    );
  }
);

test(
  'wrong first answer gives one ticket and cannot be replaced',
  /* Checks that an incorrect first answer cannot be replaced. */
  () => {
    let state = reduceProgress(member(), {
      type: 'open',
      day: 6,
      profile: email,
    });
    state = reduceProgress(state, {
      type: 'answer',
      day: 6,
      answer: 0,
      correctIndex: 1,
      profile: email,
    });
    state = reduceProgress(state, {
      type: 'answer',
      day: 6,
      answer: 1,
      correctIndex: 1,
      profile: email,
    });
    assert.equal(totalTickets(getProgress(state)), 2);
    assert.equal(getDay(getProgress(state), 6).answer, 0);
  }
);

test(
  'locked and unopened days reject awards and puzzle placement',
  /* Checks that locked or unopened days reject progress awards. */
  () => {
    const state = member();
    assert.equal(
      reduceProgress(state, { type: 'open', day: 7, profile: email }),
      state
    );
    assert.equal(
      reduceProgress(state, {
        type: 'answer',
        day: 6,
        answer: 1,
        correctIndex: 1,
        profile: email,
      }),
      state
    );
    assert.equal(
      reduceProgress(state, {
        type: 'piece',
        day: 6,
        piece: 1,
        profile: email,
      }),
      state
    );
  }
);

test(
  'accounts and guest progress remain separate, stale actions are rejected',
  /* Checks profile isolation and rejection of actions from a previous profile. */
  () => {
    let state = reduceProgress(initialState(), {
      type: 'open',
      day: 1,
      profile: null,
    });
    state = reduceProgress(state, {
      type: 'login',
      email: ' TESTER@EXAMPLE.COM ',
    });
    assert.equal(state.activeProfile, email);
    assert.equal(getDay(getProgress(state), 1).opened, false);
    state = reduceProgress(state, { type: 'open', day: 6, profile: email });
    state = reduceProgress(state, {
      type: 'login',
      email: 'second@example.com',
    });
    assert.equal(totalTickets(getProgress(state)), 0);
    assert.equal(
      reduceProgress(state, { type: 'open', day: 1, profile: email }),
      state
    );
    state = reduceProgress(state, { type: 'login', email });
    assert.equal(totalTickets(getProgress(state)), 1);
    state = reduceProgress(state, { type: 'logout' });
    assert.equal(getDay(getProgress(state), 1).opened, true);
    assert.equal(totalTickets(getProgress(state)), 0);
  }
);

test(
  'all 24 puzzle pieces persist, duplicates do not count, puzzle awards no quiz tickets',
  /* Checks puzzle persistence, duplicate handling, and ticket totals. */
  () => {
    let state = reduceProgress(member(), {
      type: 'open',
      day: 6,
      profile: email,
    });
    for (let piece = 1; piece <= 24; piece++) {
      state = reduceProgress(state, {
        type: 'piece',
        day: 6,
        piece,
        profile: email,
      });
      state = reduceProgress(state, {
        type: 'piece',
        day: 6,
        piece,
        profile: email,
      });
    }
    assert.equal(
      getDay(getProgress(parseSavedState(JSON.stringify(state))), 6).pieces
        .length,
      24
    );
    assert.equal(totalTickets(getProgress(state)), 1);
  }
);

test('bulk posting opens all lids and preserves existing progress', () => {
  let state = reduceProgress(member(), { type: 'open', day: 6, profile: email });
  state = reduceProgress(state, {
    type: 'answer',
    day: 6,
    answer: 1,
    correctIndex: 1,
    profile: email,
  });
  const previousDay = getDay(getProgress(state), 6);
  const action = { type: 'open-all', profile: email } as const;
  state = reduceProgress(state, action);
  assert.equal(state.activeProfile, email);
  assert.equal(state.demoDate, '2026-12-24');
  assert.equal(Object.keys(getProgress(state).days).length, 24);
  assert.equal(totalTickets(getProgress(state)), 29);
  assert.equal(getDay(getProgress(state), 6), previousDay);
  assert.equal(reduceProgress(state, action), state);
  const earlier = reduceProgress(state, { type: 'date', date: '2026-12-05' });
  assert.equal(getDoorStatus(6, earlier.demoDate, getProgress(earlier)), 'locked');
  assert.equal(totalTickets(getProgress(earlier)), 29);

  const guest = reduceProgress(state, { type: 'logout' });
  assert.equal(reduceProgress(guest, action), guest);
  const guestPosted = reduceProgress(guest, { type: 'open-all', profile: null });
  assert.equal(Object.keys(getProgress(guestPosted).days).length, 24);
  assert.equal(totalTickets(getProgress(guestPosted)), 0);
  assert.equal(guestPosted.profiles[email], state.profiles[email]);
});

test(
  'reset clears only the active profile; corrupted data is recoverable',
  /* Checks profile reset and recovery from invalid saved data. */
  () => {
    let state = reduceProgress(member(), { type: 'open-all', profile: email });
    state = reduceProgress(state, { type: 'reset' });
    assert.equal(totalTickets(getProgress(state)), 0);
    assert.deepEqual(parseSavedState('broken'), initialState());
    assert.deepEqual(parseSavedState('{"version":2}'), initialState());
    assert.equal(
      parseSavedState(
        '{"version":1,"profiles":{"guest":{"days":{"1":{"opened":true,"doorTicket":true,"answer":0,"quizTickets":5,"pieces":[]}}}}}'
      ).profiles.guest.days[1].quizTickets,
      0
    );
  }
);
