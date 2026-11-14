import { useState } from 'react';
import type { CalendarDay, DayProgress } from '../../types/calendar';
import { updateProgress } from '../../state/store';
import GoldButton from '../atoms/GoldButton';
import TicketCounter from '../molecules/TicketCounter';

interface Props {
  content: CalendarDay;
  progress: DayProgress;
  profile: string | null;
  total: number;
  onLogin: () => void;
}
export default function Quiz({
  content,
  progress,
  profile,
  total,
  onLogin,
}: Props) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const submitted = progress.answer !== null;
  const correct = progress.answer === content.quiz.correctIndex;
  return (
    <section className="quiz-section" aria-labelledby="quiz-heading">
      <div className="quiz-heading">
        <h2 id="quiz-heading" tabIndex={-1}>
          Dagens quiz
        </h2>
        <img src="/assets/quiz.webp" alt="" />
      </div>
      <p>
        Et rigtigt svar i dagens quiz giver 5 lodder.
        <br />
        Et forkert svar giver 1 lod som tak for deltagelse.
      </p>
      {profile && content.quiz.sourceUrl && (
        <a
          className="answer-link"
          href={content.quiz.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Find informationen her <span aria-hidden="true">→</span>
          <span className="sr-only"> (åbner en ny fane)</span>
        </a>
      )}
      {profile ? (
        <TicketCounter total={total} />
      ) : (
        <p className="guest-quiz-note">
          Du kan svare som gæst.{' '}
          <button className="text-button" onClick={onLogin}>
            Log ind før dit svar for at samle lodder.
          </button>
        </p>
      )}
      <form
        className="quiz-card"
        onSubmit={async (event) => {
          event.preventDefault();
          if (answer === null || submitted || busy) return;
          setBusy(true);
          try {
            await updateProgress({
              type: 'answer',
              day: content.day,
              answer,
              correctIndex: content.quiz.correctIndex,
              profile,
            });
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={submitted || busy}>
          <legend>{content.quiz.question}</legend>
          <div className="quiz-options">
            {content.quiz.options.map((option, index) => (
              <label
                key={option}
                className={`quiz-option ${profile && submitted && index === content.quiz.correctIndex ? 'correct' : ''} ${profile && submitted && index === progress.answer && !correct ? 'incorrect' : ''}`}
              >
                <input
                  type="radio"
                  name={`quiz-${content.day}`}
                  value={index}
                  checked={(submitted ? progress.answer : answer) === index}
                  onChange={() => setAnswer(index)}
                  required
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {!submitted ? (
          <>
            <GoldButton disabled={answer === null || busy}>
              {busy ? 'Gemmer …' : 'Afgiv svar'}
            </GoldButton>
            <p className="small italic">Du har 1 forsøg</p>
          </>
        ) : (
          <div className="quiz-result" role="status">
            <h3>
              {profile && correct
                ? 'Det er helt rigtigt!'
                : 'Tak for dit svar!'}
            </h3>
            {profile && <p>{content.quiz.explanation}</p>}
            <p className="result-tickets">
              {profile
                ? `Du har fået ${progress.quizTickets} ${progress.quizTickets === 1 ? 'lod' : 'lodder'}.`
                : 'Du har svaret som gæst.'}
            </p>
            <p className="small">Dit første svar er gemt.</p>
          </div>
        )}
      </form>
    </section>
  );
}
