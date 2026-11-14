import type { CalendarState } from '../../types/calendar';
import { updateProgress } from '../../state/store';

/* Renders controls for testing dates, profiles, and example progress. */
export default function PrototypeControls({
  state,
  date,
  onLogin,
  onReset,
}: {
  state: CalendarState;
  date: string;
  onLogin: () => void;
  onReset: () => void;
}) {
  return (
    <details className="prototype-controls">
      <summary>
        <span className="prototype-dot" />
        Prototype{' '}
        <span className="prototype-current">
          · {date.slice(8)} / {date.slice(5, 7)}
        </span>
        <span className="control-chevron">⌃</span>
      </summary>
      <div className="prototype-panel">
        <h2>Prøv kalenderen</h2>
        <p>
          Testlogin og lodder gemmes kun i denne browser. Dette er en
          studieprototype.
        </p>
        <label htmlFor="preview-date">Visningsdato</label>
        <input
          id="preview-date"
          type="date"
          min="2026-11-01"
          max="2027-01-31"
          value={state.demoDate || date}
          onInput={
            /* Sets the demo date from the date picker. */
            (event) => {
              if (event.currentTarget.value)
                void updateProgress({
                  type: 'date',
                  date: event.currentTarget.value,
                });
            }
          }
        />
        <button
          onClick={
            /* Switches from the demo date to the actual date. */
            () => void updateProgress({ type: 'date', date: '' })
          }
        >
          Brug den rigtige dato i Danmark
        </button>
        <p className="current-profile">
          {state.activeProfile
            ? `Testprofil: ${state.activeProfile}`
            : 'Du besøger kalenderen som gæst.'}
        </p>
        <button
          onClick={
            state.activeProfile
              ? /* Switches back to the guest profile. */
                () => void updateProgress({ type: 'logout' })
              : onLogin
          }
        >
          {state.activeProfile ? 'Prøv som gæst' : 'Prøv som deltager'}
        </button>
        <button
          onClick={
            /* Loads the example profile and returns to the calendar homepage. */
            async () => {
              await updateProgress({ type: 'example' });
              window.location.hash = '#/';
            }
          }
        >
          Vis 6. december med 22 lodder
        </button>
        <button onClick={onReset}>Nulstil denne profils fremgang</button>
        <small>
          Tilbageflytning af datoen låser fremtidige låger. Optjente lodder
          bevares.
        </small>
      </div>
    </details>
  );
}
