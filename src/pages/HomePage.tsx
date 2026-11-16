/* Renders the welcome page, calendar, and competition signup. */

import type { CalendarDay, CalendarState, Progress } from '../types/calendar';
import FeatureStrip from '../components/molecules/FeatureStrip';
import Calendar from '../components/organisms/Calendar';
import LoginForm from '../components/organisms/LoginForm';
import GoldButton from '../components/atoms/GoldButton';

interface Props {
  days: CalendarDay[];
  state: CalendarState;
  progress: Progress;
  date: string;
  onLogin: (email: string) => Promise<void>;
  openLogin: () => void;
  onTerms: () => void;
}

export default function HomePage({
  days,
  state,
  progress,
  date,
  onLogin,
  openLogin,
  onTerms,
}: Props) {
  const currentDay = date.startsWith('2026-12-')
    ? Math.min(Number(date.slice(-2)), 24)
    : date > '2026-12-24'
      ? 24
      : 1;
  /* Scrolls to today’s door and focuses its interactive control. */
  function findToday() {
    const door = document.getElementById(`door-${currentDay}`);
    door?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    door
      ?.querySelector<HTMLElement>('button, a')
      ?.focus({ preventScroll: true });
  }
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            {state.activeProfile
              ? `${currentDay}. December`
              : 'Et juleeventyr i 24 kapitler'}
          </p>
          <h1>Lille Fjer</h1>
          <p className="hero-subtitle">
            {state.activeProfile
              ? days[currentDay - 1].title
              : 'Når dagen falder til ro, begynder fortællingen'}
          </p>
          <GoldButton onClick={findToday}>Åbn dagens låge</GoldButton>
        </div>
        <img
          className="hero-feather"
          src="/assets/illustrations/feather.webp"
          alt="Lille Fjer, en lille elfenbensfarvet fjer med et nysgerrigt ansigt"
          fetchPriority="high"
        />
      </section>
      <FeatureStrip />
      {!state.activeProfile && (
        <section
          className="competition-section"
          aria-labelledby="competition-heading"
        >
          <div className="competition-copy">
            <h2 id="competition-heading">Vær med i konkurrencen</h2>
            <p>
              Gør december lidt mere eventyrlig. Saml lodder undervejs i
              julekalenderen, og vær med i lodtrækningen om et hotelophold,
              dyner og puder til hele familien og fine midtvejspræmier fra
              Ringsted Dun.
            </p>
            <button className="text-button" onClick={onTerms}>
              Se konkurrencevilkår
            </button>
          </div>
          <LoginForm compact onLogin={onLogin} />
        </section>
      )}
      <Calendar
        days={days}
        state={state}
        progress={progress}
        date={date}
        onLogin={openLogin}
      />
      <section
        className="bedtime-section"
        aria-label="En godnathistorie sammen"
      >
        <blockquote>
          <p>
            “Netop da opdagede Lille Fjer en løs syning.
            <br />
            Et bitte hul, ikke større end begyndelsen
            <br />
            på en hemmelighed.”
          </p>
          <cite>Fra historien om Lille Fjer</cite>
        </blockquote>
        <img
          src="/assets/illustrations/bedtime.webp"
          alt="En far og hans søn læser Lille Fjer sammen under en hvid dyne"
          loading="lazy"
        />
      </section>
    </>
  );
}
