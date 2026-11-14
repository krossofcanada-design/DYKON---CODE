import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { CalendarDay } from '../../types/calendar';
import { isAvailable } from '../../state/progress';
import Ornament from '../atoms/Ornament';

interface IllustrationLayout {
  paragraph: number;
  side: 'left' | 'right';
  width: number;
}

// The first seven placements follow the supplied book pages; later chapters
// continue their alternating illustrations and flowing text.
const illustrationLayouts: Record<number, IllustrationLayout> = {
  1: { paragraph: 0, side: 'right', width: 70 },
  2: { paragraph: 1, side: 'right', width: 52 },
  3: { paragraph: 12, side: 'left', width: 48 },
  4: { paragraph: 15, side: 'left', width: 38 },
  5: { paragraph: 1, side: 'right', width: 54 },
  6: { paragraph: 14, side: 'left', width: 48 },
  7: { paragraph: 2, side: 'right', width: 54 },
  8: { paragraph: 3, side: 'left', width: 58 },
  9: { paragraph: 2, side: 'right', width: 46 },
  10: { paragraph: 5, side: 'left', width: 54 },
  11: { paragraph: 2, side: 'right', width: 50 },
  12: { paragraph: 5, side: 'left', width: 50 },
  13: { paragraph: 2, side: 'right', width: 46 },
  14: { paragraph: 4, side: 'left', width: 56 },
  15: { paragraph: 2, side: 'right', width: 46 },
  16: { paragraph: 5, side: 'left', width: 50 },
  17: { paragraph: 2, side: 'right', width: 50 },
  18: { paragraph: 4, side: 'left', width: 50 },
  19: { paragraph: 2, side: 'right', width: 56 },
  20: { paragraph: 5, side: 'left', width: 44 },
  21: { paragraph: 2, side: 'right', width: 50 },
  22: { paragraph: 4, side: 'left', width: 44 },
  23: { paragraph: 2, side: 'right', width: 100 },
  24: { paragraph: 5, side: 'left', width: 60 },
};

/* Displays chapter text, chapter navigation, and speech playback controls. */
export default function StoryReader({
  content,
  days,
  date,
}: {
  content: CalendarDay;
  days: CalendarDay[];
  date: string;
}) {
  const illustration = illustrationLayouts[content.day];
  const illustrationPath = `/assets/storybook/storybook-${String(content.day).padStart(2, '0')}.webp`;
  const [reading, setReading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [audioMessage, setAudioMessage] = useState('');
  const stopped = useRef(true);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speechAvailable =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const readingText = [
    `${content.day}. december. ${content.title}.`,
    ...content.paragraphs,
  ];

  useEffect(
    /* Registers speech cleanup when the chapter changes or the reader unmounts. */
    () =>
      /* Stops speech playback and prevents further paragraphs from starting. */
      () => {
        stopped.current = true;
        if (speechAvailable) window.speechSynthesis.cancel();
      },
    [content.day, speechAvailable]
  );

  /* Reads one paragraph aloud and advances through the chapter. */
  function speak(index: number) {
    if (stopped.current) return;
    if (index >= readingText.length) {
      setReading(false);
      setPaused(false);
      setPosition(readingText.length);
      return;
    }
    setPosition(index);
    const speech = new SpeechSynthesisUtterance(readingText[index]);
    speech.lang = 'da-DK';
    speech.rate = 0.88;
    const danishVoice = window.speechSynthesis.getVoices().find(
      /* Finds a Danish voice for the chapter narration. */
      (voice) => voice.lang.startsWith('da')
    );
    if (danishVoice) speech.voice = danishVoice;
    speech.onend =
      /* Continues narration with the next paragraph. */
      () => speak(index + 1);
    speech.onerror =
      /* Stops playback and explains unexpected speech errors. */
      (event) => {
        if (
          !stopped.current &&
          event.error !== 'interrupted' &&
          event.error !== 'canceled'
        ) {
          setReading(false);
          setAudioMessage(
            'Oplæsningen kunne ikke starte. Prøv igen, eller læs kapitlet nedenfor.'
          );
        }
      };
    utterance.current = speech;
    window.speechSynthesis.speak(speech);
  }

  /* Starts, pauses, or resumes the chapter narration. */
  function toggleReading() {
    if (!speechAvailable) return;
    if (reading) {
      if (paused) window.speechSynthesis.resume();
      else window.speechSynthesis.pause();
      setPaused(!paused);
      return;
    }
    window.speechSynthesis.cancel();
    stopped.current = false;
    setReading(true);
    setPaused(false);
    setAudioMessage('');
    speak(0);
  }

  return (
    <section className="story-section" aria-label="Dagens fortælling">
      <div className="section-symbol">
        <img src="/assets/icons/book.webp" alt="" />
        <span>
          Et kapitel
          <br />
          af dagens historie
        </span>
      </div>
      <div className="story-book">
        <nav className="chapter-tabs" aria-label="Kapitler">
          {days.map(
            /* Renders a chapter link or a locked chapter label. */
            (day) =>
              isAvailable(day.day, date) ? (
                <a
                  key={day.day}
                  href={`#/day/${day.day}`}
                  aria-label={`Kapitel ${day.day}: ${day.title}`}
                  aria-current={day.day === content.day ? 'page' : undefined}
                >
                  {day.day}
                </a>
              ) : (
                <span
                  key={day.day}
                  title={`Åbner ${day.day}. december`}
                  aria-label={`Kapitel ${day.day} – låst`}
                >
                  {day.day}
                </span>
              )
          )}
        </nav>
        <article className="story-page">
          <header>
            <p>{content.day} december</p>
            <Ornament />
            <h2>{content.title}</h2>
          </header>
          <div
            className={`story-text story-text--${illustration.side} story-text--chapter-${content.day}`}
            style={
              {
                '--story-illustration': `url("${illustrationPath}")`,
                '--story-illustration-width': `${illustration.width}%`,
              } as CSSProperties
            }
          >
            {content.paragraphs.map(
              /* Places the chapter illustration at its chosen paragraph so text wraps around it. */
              (paragraph, index) => (
                <Fragment key={index}>
                  {index === illustration.paragraph && (
                    <img
                      className="story-illustration"
                      src={illustrationPath}
                      alt=""
                    />
                  )}
                  <p className={index === 0 ? 'first-paragraph' : ''}>
                    {paragraph}
                  </p>
                </Fragment>
              )
            )}
          </div>
          <Ornament />
        </article>
      </div>
      <div className="audio-player">
        <button
          className="audio-play"
          onClick={toggleReading}
          disabled={!speechAvailable}
          aria-label={
            reading && !paused
              ? 'Sæt oplæsningen på pause'
              : paused
                ? 'Fortsæt oplæsning'
                : 'Læs kapitlet højt'
          }
        >
          {reading && !paused ? 'Ⅱ' : '▶'}
        </button>
        <progress
          max={readingText.length}
          value={position}
          aria-label="Oplæsningens fremgang"
        />
        {reading && (
          <button
            className="audio-stop"
            onClick={
              /* Stops narration and resets the playback position. */
              () => {
                stopped.current = true;
                window.speechSynthesis.cancel();
                setReading(false);
                setPaused(false);
                setPosition(0);
              }
            }
            aria-label="Stop oplæsning"
          >
            ■
          </button>
        )}
      </div>
      <p className="audio-caption">
        {speechAvailable
          ? 'Lyt med enhedens stemme · dansk oplæsning'
          : 'Din browser understøtter ikke oplæsning.'}
      </p>
      {audioMessage && <p role="status">{audioMessage}</p>}
    </section>
  );
}
