import type { CalendarDay, CalendarState, Progress } from '../types/calendar';
import { getDay, isAvailable, totalTickets, dayTickets } from '../state/progress';
import StoryReader from '../components/organisms/StoryReader';
import Puzzle from '../components/organisms/Puzzle';
import Quiz from '../components/organisms/Quiz';
import Ornament from '../components/atoms/Ornament';

interface Props { content: CalendarDay; days: CalendarDay[]; state: CalendarState; progress: Progress; date: string; onLogin: () => void }
export default function DayPage({ content, days, state, progress, date, onLogin }: Props) {
  const day = getDay(progress, content.day);
  if (!isAvailable(content.day, date)) return <section className="gate"><Ornament /><h1>Et lille øjeblik endnu …</h1><p>Låge {content.day} åbner den {content.day}. december 2026.</p><a className="gold-button" href="#/">Til julekalenderen</a></section>;
  if (!day.opened) return <section className="gate"><img src={content.image} alt="" /><h1>Et eventyr venter</h1><p>Læg først låge {content.day} i postkassen.<br />Så åbner dagens fortælling, aktivitet og quiz sig for dig.</p><a className="gold-button" href={`#calendar-${content.day}`}>Find låge {content.day}</a></section>;
  return <div className="daily-page">
    <header className="daily-hero"><p className="eyebrow">Kapitel {content.day}</p><h1>Lille Fjer</h1><p className="italic">{content.title}</p></header>
    <StoryReader content={content} days={days} date={date} />
    {content.day === 6 ? <Puzzle key={state.activeProfile ?? 'guest'} placed={day.pieces} profile={state.activeProfile} onLogin={onLogin} /> : <section className="activity-section">
      <div className="section-symbol"><img src="/assets/scissors.webp" alt="" /><span>En kreativ<br />stund sammen</span></div>
      <h2>{content.activity.title}</h2><p className="activity-time">En lille stund på {content.activity.duration}</p>
      <div className="activity-card"><img src={content.image} alt="" /><div><h3>Det skal I bruge</h3><p>{content.activity.materials}</p><h3>Sådan gør I</h3><p>{content.activity.instructions}</p></div></div>
    </section>}
    <Quiz key={`${content.day}-${state.activeProfile ?? 'guest'}`} content={content} progress={day} profile={state.activeProfile} total={totalTickets(progress)} onLogin={onLogin} />
    <div className="day-return">{state.activeProfile && <p>Du har samlet <strong>{dayTickets(day)} {dayTickets(day) === 1 ? 'lod' : 'lodder'}</strong> den {content.day}. december.</p>}<a className="answer-link" href={`#calendar-${content.day}`}>← Tilbage til julekalenderen</a></div>
  </div>;
}


/* For the activity image, use these files:
- Image path: [DayPage.tsx](/Users/sciops/Desktop/DYKON - CODE/src/pages/DayPage.tsx). Find:

<img src={content.image} alt="" />

This currently uses the calendar lid image. For separate activity images named activity-01.webp through activity-24.webp in public/assets/, change it to:

<img
  src={`/assets/activity-${String(content.day).padStart(2, '0')}.webp`}
  alt=""
/>

- Styling and positioning: [style.scss](/Users/sciops/Desktop/DYKON - CODE/src/styles/style.scss), under ACTIVITY — Duration and activity card:
  - .activity-card: grid columns, gap, and padding.
  - .activity-card>img: image width, height, and alignment.
Also check .activity-card in the RESPONSIVE — Mobile section for mobile layout overrides.

*/