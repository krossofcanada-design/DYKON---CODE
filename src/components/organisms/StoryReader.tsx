import { useEffect, useRef, useState } from 'react';
import type { CalendarDay } from '../../types/calendar';
import { isAvailable } from '../../state/progress';
import Ornament from '../atoms/Ornament';

export default function StoryReader({ content, days, date }: { content: CalendarDay; days: CalendarDay[]; date: string }) {
  const [reading, setReading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [audioMessage, setAudioMessage] = useState('');
  const stopped = useRef(true);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const readingText = [`${content.day}. december. ${content.title}.`, ...content.paragraphs];

  useEffect(() => () => { stopped.current = true; if (speechAvailable) window.speechSynthesis.cancel(); }, [content.day, speechAvailable]);

  function speak(index: number) {
    if (stopped.current) return;
    if (index >= readingText.length) { setReading(false); setPaused(false); setPosition(readingText.length); return; }
    setPosition(index);
    const speech = new SpeechSynthesisUtterance(readingText[index]);
    speech.lang = 'da-DK'; speech.rate = 0.88;
    const danishVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.startsWith('da'));
    if (danishVoice) speech.voice = danishVoice;
    speech.onend = () => speak(index + 1);
    speech.onerror = event => {
      if (!stopped.current && event.error !== 'interrupted' && event.error !== 'canceled') {
        setReading(false); setAudioMessage('Oplæsningen kunne ikke starte. Prøv igen, eller læs kapitlet nedenfor.');
      }
    };
    utterance.current = speech;
    window.speechSynthesis.speak(speech);
  }

  function toggleReading() {
    if (!speechAvailable) return;
    if (reading) {
      if (paused) window.speechSynthesis.resume(); else window.speechSynthesis.pause();
      setPaused(!paused); return;
    }
    window.speechSynthesis.cancel(); stopped.current = false;
    setReading(true); setPaused(false); setAudioMessage(''); speak(0);
  }

  return <section className="story-section" aria-label="Dagens fortælling">
    <div className="section-symbol"><img src="/assets/book.webp" alt="" /><span>Et kapitel<br />af dagens historie</span></div>
    <div className="story-book">
      <nav className="chapter-tabs" aria-label="Kapitler">{days.map(day => isAvailable(day.day, date) ? <a key={day.day} href={`#/day/${day.day}`} aria-label={`Kapitel ${day.day}: ${day.title}`} aria-current={day.day === content.day ? 'page' : undefined}>{day.day}</a> : <span key={day.day} title={`Åbner ${day.day}. december`} aria-label={`Kapitel ${day.day} – låst`}>{day.day}</span>)}</nav>
      <article className="story-page">
        <header><p>{content.day} december</p><Ornament /><h2>{content.title}</h2></header>
        <div className="story-text">{content.paragraphs.map((paragraph, index) => <div key={index}>{index === Math.floor(content.paragraphs.length * 0.5) && <img className="story-illustration" src={content.day === 1 ? '/assets/feather.webp' : content.day === 6 ? '/assets/crown.webp' : content.image} alt="" />}<p className={index === 0 ? 'first-paragraph' : ''}>{paragraph}</p></div>)}</div>
        <Ornament />
      </article>
    </div>
    <div className="audio-player">
      <button className="audio-play" onClick={toggleReading} disabled={!speechAvailable} aria-label={reading && !paused ? 'Sæt oplæsningen på pause' : paused ? 'Fortsæt oplæsning' : 'Læs kapitlet højt'}>{reading && !paused ? 'Ⅱ' : '▶'}</button>
      <progress max={readingText.length} value={position} aria-label="Oplæsningens fremgang" />
      {reading && <button className="audio-stop" onClick={() => { stopped.current = true; window.speechSynthesis.cancel(); setReading(false); setPaused(false); setPosition(0); }} aria-label="Stop oplæsning">■</button>}
    </div>
    <p className="audio-caption">{speechAvailable ? 'Lyt med enhedens stemme · dansk oplæsning' : 'Din browser understøtter ikke oplæsning.'}</p>
    {audioMessage && <p role="status">{audioMessage}</p>}
  </section>;
}


/* If each day has its own illustration, name the files story-01.webp through story-24.webp in public/assets/, then use:

<img
  className="story-illustration"
  src={`/assets/story-${String(content.day).padStart(2, '0')}.webp`}
  alt=""
/>
*/