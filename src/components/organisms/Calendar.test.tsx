import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import Calendar from './Calendar';
import days from '../../data/calendar.json';
import { getProgress } from '../../state/progress';
import { updateProgress, useCalendarState } from '../../state/store';

// Subscribe to the real store so posting a door updates the rendered calendar.
function TestCalendar() {
  const { state } = useCalendarState();
  return (
    <Calendar
      days={days}
      state={state}
      progress={getProgress(state)}
      date={state.demoDate}
      onLogin={() => {}}
    />
  );
}

beforeEach(async () => {
  localStorage.clear();
  await updateProgress({ type: 'logout' });
  await updateProgress({ type: 'reset' });
  await updateProgress({ type: 'date', date: '2026-12-06' });
});

describe('Calendar doors', () => {
  it('shows an available door with its day number', () => {
    render(<TestCalendar />);
    const door = screen.getByRole('button', { name: /^Låge 6 –/ });
    expect(door).toHaveTextContent('6');
    expect(door).toHaveAttribute('aria-disabled', 'false');
    expect(screen.queryByRole('link', { name: /Besøg dagen/ })).not.toBeInTheDocument();
  });

  it('opens a selected door through the mailbox and reveals the day link', async () => {
    const user = userEvent.setup();
    render(<TestCalendar />);

    await user.click(screen.getByRole('button', { name: /^Låge 6 –/ }));
    expect(screen.getByRole('button', { name: /^Låge 6 –/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Læg låge 6 i postkassen' }));

    expect(await screen.findByRole('link', { name: /Besøg dagen/ })).toHaveAttribute('href', '#/day/6');
    expect(screen.queryByRole('button', { name: /^Låge 6 –/ })).not.toBeInTheDocument();
  });

  it('keeps a future door locked when clicked', async () => {
    const user = userEvent.setup();
    render(<TestCalendar />);
    const door = screen.getByRole('button', { name: /^Låge 7 –/ });

    expect(door).toHaveAttribute('aria-disabled', 'true');
    await user.click(door);

    expect(screen.getByRole('status')).toHaveTextContent('Låge 7 åbner den 7. december 2026.');
    expect(door).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('link', { name: /Besøg dagen/ })).not.toBeInTheDocument();
  });
});
