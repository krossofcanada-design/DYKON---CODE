/* Connects calendar state, hash navigation, pages, and shared dialogs. */

import { useEffect, useRef, useState } from 'react';
import calendarContent from './data/calendar.json';
import type { CalendarDay } from './types/calendar';
import { useCalendarState, updateProgress } from './state/store';
import { copenhagenDate, getProgress, totalTickets } from './state/progress';
import PageLayout from './components/templates/PageLayout';
import HomePage from './pages/HomePage';
import DayPage from './pages/DayPage';
import Modal from './components/organisms/Modal';
import LoginForm from './components/organisms/LoginForm';
import GoldButton from './components/atoms/GoldButton';
import PrototypeControls from './components/organisms/PrototypeControls';

const days: CalendarDay[] = calendarContent;
type ModalKind = 'login' | 'terms' | 'privacy' | 'reset' | null;

export default function App() {
  const { state, storageAvailable } = useCalendarState();
  const [hash, setHash] = useState(window.location.hash);
  const [today, setToday] = useState(copenhagenDate);
  const [modal, setModal] = useState<ModalKind>(null);
  const match = /^#\/day\/(\d+)$/.exec(hash);
  const requestedDay = match ? Number(match[1]) : null;
  const previousRoute = useRef({ hash, requestedDay });
  const content = requestedDay
    ? days.find(
        /* Finds the content for the day requested in the URL. */
        (day) => day.day === requestedDay
      )
    : undefined;
  const progress = getProgress(state);
  const date = state.demoDate || today;

  useEffect(
    /* Tracks hash navigation and periodically refreshes the current date. */
    () => {
      /* Updates the route when the URL hash changes. */
      const onHash = () => setHash(window.location.hash);
      window.addEventListener('hashchange', onHash);
      const timer = setInterval(
        /* Refreshes today’s date using Copenhagen time. */
        () => setToday(copenhagenDate()),
        30_000
      );
      /* Removes the navigation listener and date refresh timer. */
      return () => {
        window.removeEventListener('hashchange', onHash);
        clearInterval(timer);
      };
    },
    []
  );
  useEffect(
    /* Updates the title, scroll position, and focus after navigation. */
    () => {
      document.title = content
        ? `${content.day}. december · ${content.title} · Lille Fjer`
        : 'Lille Fjer · Et juleeventyr i 24 kapitler';
      const previous = previousRoute.current;
      previousRoute.current = { hash, requestedDay };
      if (hash.startsWith('#calendar')) {
        const targetDay = /^#calendar-(\d+)$/.exec(hash)?.[1];
        const target = document.getElementById(
          targetDay ? `door-${targetDay}` : 'calendar'
        );
        if (hash !== previous.hash) {
          target
            ?.querySelector<HTMLElement>(targetDay ? 'a, button' : 'h2')
            ?.focus({ preventScroll: true });
        }
        target?.scrollIntoView({
          behavior: 'smooth',
          block: targetDay ? 'center' : 'start',
        });
      } else if (hash !== '#main') {
        if (requestedDay !== previous.requestedDay) {
          document
            .querySelector<HTMLElement>('#main h1')
            ?.focus({ preventScroll: true });
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    [hash, content, requestedDay]
  );

  /* Activates the email profile and closes the login dialog. */
  async function login(email: string) {
    await updateProgress({ type: 'login', email });
    setModal(null);
  }

  return (
    <>
      <div className="candles" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      {!storageAvailable && (
        <p className="storage-warning" role="alert">
          Din browser tillader ikke lagring. Fremgangen bevares, mens denne side
          er åben.
        </p>
      )}
      <PageLayout
        loggedIn={Boolean(state.activeProfile)}
        total={totalTickets(progress)}
        daily={Boolean(content)}
        onLogin={/* Opens the login dialog. */ () => setModal('login')}
        onLogout={
          /* Logs out of the active profile. */
          () => void updateProgress({ type: 'logout' })
        }
        onInfo={setModal}
      >
        {requestedDay && !content ? (
          <section className="gate">
            <h1 tabIndex={-1}>Denne låge findes ikke</h1>
            <a href="#/">Til julekalenderen</a>
          </section>
        ) : content ? (
          <DayPage
            key={content.day}
            content={content}
            days={days}
            state={state}
            progress={progress}
            date={date}
            onLogin={/* Opens the login dialog. */ () => setModal('login')}
          />
        ) : (
          <HomePage
            days={days}
            state={state}
            progress={progress}
            date={date}
            onLogin={login}
            openLogin={/* Opens the login dialog. */ () => setModal('login')}
            onTerms={
              /* Opens the competition terms dialog. */
              () => setModal('terms')
            }
          />
        )}
      </PageLayout>
      <PrototypeControls
        state={state}
        date={date}
        onLogin={/* Opens the login dialog. */ () => setModal('login')}
        onReset={
          /* Opens the progress reset confirmation. */
          () => setModal('reset')
        }
      />
      {modal === 'login' && (
        <Modal
          title="Et lille eventyr hver dag"
          onClose={/* Closes the current dialog. */ () => setModal(null)}
        >
          <p>
            Log ind med en testadresse for at samle lodder. Brug den samme
            adresse næste gang for at fortsætte i denne browser.
          </p>
          <LoginForm onLogin={login} />
          <p className="small">
            Gæstens fremgang og testprofilens fremgang gemmes hver for sig.
            Lodder tæller fra de handlinger, du udfører som indlogget.
          </p>
        </Modal>
      )}
      {modal === 'terms' && (
        <Modal
          title="Om konkurrencen"
          onClose={/* Closes the current dialog. */ () => setModal(null)}
        >
          <p>
            Denne version er en studieprototype. Tilmeldinger, lodder og
            puslespilsgennemførelse bruges til at afprøve oplevelsen.
          </p>
          <ul>
            <li>En låge kan åbnes fra dens dato i december 2026.</li>
            <li>
              En indlogget deltager får 1 lod for at lægge en låge i postkassen.
            </li>
            <li>
              Det første quizsvar giver 5 lodder ved et rigtigt svar eller 1 lod
              ved et forkert svar.
            </li>
            <li>Hver låge og quiz giver kun lodder én gang pr. testprofil.</li>
            <li>Fortællinger og aktiviteter er tilgængelige for gæster.</li>
          </ul>
          <p>
            De endelige konkurrencevilkår, præmier og lodtrækninger skal
            tilføjes før en virkelig kampagne.
          </p>
        </Modal>
      )}
      {modal === 'privacy' && (
        <Modal
          title="Privatliv i prototypen"
          onClose={/* Closes the current dialog. */ () => setModal(null)}
        >
          <p>
            Testadressen, åbnede låger, quizsvar og puslespillets fremgang
            gemmes lokalt i din browser. Brug gerne en opdigtet e-mailadresse.
          </p>
          <p>
            Du kan nulstille den aktive profils fremgang via Prototype-menuen.
            Browserens funktion til at rydde webstedsdata fjerner alle lokale
            testprofiler.
          </p>
          <p>
            En færdig kampagne skal have rigtig kontologin, serverlagring og sin
            egen privatlivstekst.
          </p>
        </Modal>
      )}
      {modal === 'reset' && (
        <Modal
          title="Begynd forfra?"
          onClose={/* Closes the current dialog. */ () => setModal(null)}
        >
          <p>
            Dette sletter åbnede låger, quizsvar, lodder og puslespilsfremgang
            for den aktive testprofil eller gæst.
          </p>
          <div className="modal-actions">
            <button
              className="outline-button"
              onClick={
                /* Closes the reset confirmation without changing progress. */
                () => setModal(null)
              }
            >
              Behold fremgang
            </button>
            <GoldButton
              onClick={
                /* Resets the active profile’s progress and returns to the homepage. */
                async () => {
                  await updateProgress({ type: 'reset' });
                  setModal(null);
                  window.location.hash = '#/';
                }
              }
            >
              Nulstil fremgang
            </GoldButton>
          </div>
        </Modal>
      )}
    </>
  );
}
