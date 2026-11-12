import { useEffect, useState } from 'react';
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
  const content = requestedDay ? days.find(day => day.day === requestedDay) : undefined;
  const progress = getProgress(state);
  const date = state.demoDate || today;

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    const timer = setInterval(() => setToday(copenhagenDate()), 30_000);
    return () => { window.removeEventListener('hashchange', onHash); clearInterval(timer); };
  }, []);
  useEffect(() => {
    document.title = content ? `${content.day}. december · ${content.title} · Lille Fjer` : 'Lille Fjer · Et juleeventyr i 24 kapitler';
    if (hash.startsWith('#calendar')) {
      const targetDay = /^#calendar-(\d+)$/.exec(hash)?.[1];
      requestAnimationFrame(() => document.getElementById(targetDay ? `door-${targetDay}` : 'calendar')?.scrollIntoView({ behavior: 'smooth', block: targetDay ? 'center' : 'start' }));
    } else if (hash !== '#main') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [hash, content]);

  async function login(email: string) { await updateProgress({ type: 'login', email }); setModal(null); }

  return <>
    <div className="candles" aria-hidden="true"><i /><i /><i /><i /><i /></div>
    {!storageAvailable && <p className="storage-warning" role="alert">Din browser tillader ikke lagring. Fremgangen bevares, mens denne side er åben.</p>}
    <PageLayout loggedIn={Boolean(state.activeProfile)} total={totalTickets(progress)} daily={Boolean(content)} onLogin={() => setModal('login')} onLogout={() => void updateProgress({ type: 'logout' })} onInfo={setModal}>
      {requestedDay && !content ? <section className="gate"><h1>Denne låge findes ikke</h1><a href="#/">Til julekalenderen</a></section> : content ? <DayPage key={content.day} content={content} days={days} state={state} progress={progress} date={date} onLogin={() => setModal('login')} /> : <HomePage days={days} state={state} progress={progress} date={date} onLogin={login} openLogin={() => setModal('login')} onTerms={() => setModal('terms')} />}
    </PageLayout>
    <PrototypeControls state={state} date={date} onLogin={() => setModal('login')} onReset={() => setModal('reset')} />
    {modal === 'login' && <Modal title="Et lille eventyr hver dag" onClose={() => setModal(null)}><p>Log ind med en testadresse for at samle lodder. Brug den samme adresse næste gang for at fortsætte i denne browser.</p><LoginForm onLogin={login} /><p className="small">Gæstens fremgang og testprofilens fremgang gemmes hver for sig. Lodder tæller fra de handlinger, du udfører som indlogget.</p></Modal>}
    {modal === 'terms' && <Modal title="Om konkurrencen" onClose={() => setModal(null)}><p>Denne version er en studieprototype. Tilmeldinger, lodder og puslespilsgennemførelse bruges til at afprøve oplevelsen.</p><ul><li>En låge kan åbnes fra dens dato i december 2026.</li><li>En indlogget deltager får 1 lod for at lægge en låge i postkassen.</li><li>Det første quizsvar giver 5 lodder ved et rigtigt svar eller 1 lod ved et forkert svar.</li><li>Hver låge og quiz giver kun lodder én gang pr. testprofil.</li><li>Fortællinger og aktiviteter er tilgængelige for gæster.</li></ul><p>De endelige konkurrencevilkår, præmier og lodtrækninger skal tilføjes før en virkelig kampagne.</p></Modal>}
    {modal === 'privacy' && <Modal title="Privatliv i prototypen" onClose={() => setModal(null)}><p>Testadressen, åbnede låger, quizsvar og puslespillets fremgang gemmes lokalt i din browser. Brug gerne en opdigtet e-mailadresse.</p><p>Du kan nulstille den aktive profils fremgang via Prototype-menuen. Browserens funktion til at rydde webstedsdata fjerner alle lokale testprofiler.</p><p>En færdig kampagne skal have rigtig kontologin, serverlagring og sin egen privatlivstekst.</p></Modal>}
    {modal === 'reset' && <Modal title="Begynd forfra?" onClose={() => setModal(null)}><p>Dette sletter åbnede låger, quizsvar, lodder og puslespilsfremgang for den aktive testprofil eller gæst.</p><div className="modal-actions"><button className="outline-button" onClick={() => setModal(null)}>Behold fremgang</button><GoldButton onClick={async () => { await updateProgress({ type: 'reset' }); setModal(null); window.location.hash = '#/'; }}>Nulstil fremgang</GoldButton></div></Modal>}
  </>;
}
