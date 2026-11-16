/* Displays calendar doors and handles selecting, dragging, and posting them into the mailbox. */

import { useEffect, useRef, useState } from 'react';
import type {
  CalendarDay,
  CalendarState,
  Progress,
} from '../../types/calendar';
import {
  dayTickets,
  getDay,
  getDoorStatus,
  totalTickets,
} from '../../state/progress';
import { updateProgress } from '../../state/store';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import type { Point } from '../../hooks/usePointerDrag';
import TicketCounter from '../molecules/TicketCounter';

interface Props {
  days: CalendarDay[];
  state: CalendarState;
  progress: Progress;
  date: string;
  onLogin: () => void;
}
interface Drag extends Point {
  day: number;
  posting: boolean;
}
interface DoorProps {
  content: CalendarDay;
  status: 'locked' | 'openable' | 'opened';
  progress: Progress;
  loggedIn: boolean;
  today: boolean;
  selected: boolean;
  dragging: boolean;
  onSelect: (keyboard: boolean) => void;
  onMove: (point: Point) => void;
  onDrop: (point: Point) => void;
  onCancel: () => void;
}

/* Renders one calendar door with its availability and earned tickets. */
function Door({
  content,
  status,
  progress,
  loggedIn,
  today,
  selected,
  dragging,
  onSelect,
  onMove,
  onDrop,
  onCancel,
}: DoorProps) {
  const handlers = usePointerDrag(onMove, onDrop, onCancel);
  const earned = getDay(progress, content.day);
  return (
    <div
      className={`door-slot ${status} ${today ? 'today' : ''}`}
      id={`door-${content.day}`}
    >
      {status === 'opened' ? (
        <div className="opened-door">
          <span className="opened-date">{content.day}. december</span>
          {loggedIn ? (
            <>
              <p>Du fik</p>
              <span className="daily-earned">
                {dayTickets(earned)}{' '}
                <small>{dayTickets(earned) === 1 ? 'lod' : 'lodder'}</small>
              </span>
              <span className="earned-details">
                {Number(earned.doorTicket)} for at åbne
                <br />
                {earned.answer === null
                  ? 'Quiz venter på dig'
                  : `${earned.quizTickets} i dagens quiz`}
              </span>
            </>
          ) : (
            <>
              <span className="opened-star" aria-hidden="true">
                ✧
              </span>
              <p>
                Et eventyr
                <br />
                venter på dig
              </p>
            </>
          )}
          <a href={`#/day/${content.day}`}>
            {earned.answer === null ? 'Besøg dagen' : 'Besøg igen'}{' '}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      ) : (
        <button
          {...(status === 'openable' ? handlers : {})}
          onPointerDown={
            status === 'openable'
              ? /* Allows mouse dragging immediately and touch dragging after selection. */
                (event) => {
                  // Touch and pen gestures scroll until a completed tap selects the door.
                  if (event.pointerType !== 'mouse' && !selected) return;
                  handlers.onPointerDown(event);
                }
              : undefined
          }
          className={`calendar-door ${selected ? 'selected' : ''} ${dragging ? 'being-dragged' : ''}`}
          aria-disabled={status === 'locked'}
          aria-label={`Låge ${content.day}${status === 'locked' ? ` – åbner ${content.day}. december` : ' – tryk Enter eller mellemrum for at lægge i postkassen'}`}
          aria-describedby="calendar-keyboard-help"
          aria-pressed={selected}
          onClick={
            /* Selects the door and identifies keyboard activation. */
            (event) => onSelect(event.detail === 0)
          }
          data-day={content.day}
        >
          <span className="door-star" aria-hidden="true">
            ✶
          </span>
          <img
            className="door-art"
            src={content.image}
            alt=""
            draggable="false"
            loading="lazy"
          />
          <span className="door-number">{content.day}</span>
          <span className="door-notch" aria-hidden="true" />
          {today && (
            <span className="today-spark" aria-hidden="true">
              ✧
            </span>
          )}
        </button>
      )}
      {status !== 'opened' && (
        <span className="door-hover-label" aria-hidden="true">
          {status === 'locked'
            ? 'Lukket'
            : selected
              ? 'Træk lågen til postkassen'
              : 'Tryk for at vælge lågen'}
        </span>
      )}
    </div>
  );
}

/* Renders the calendar and manages posting doors into the mailbox. */
export default function Calendar({
  days,
  state,
  progress,
  date,
  onLogin,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [message, setMessage] = useState('');
  const [overMailbox, setOverMailbox] = useState(false);
  const mailbox = useRef<HTMLButtonElement>(null);
  const posting = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggedIn = Boolean(state.activeProfile);

  useEffect(
    /* Registers the Escape key handler for cancelling door selection. */
    () => {
      /* Cancels selection and dragging unless a door is being posted. */
      const cancel = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !posting.current) {
          setSelected(null);
          setDrag(null);
          setOverMailbox(false);
        }
      };
      window.addEventListener('keydown', cancel);
      /* Removes the Escape key listener when the calendar unmounts. */
      return () => window.removeEventListener('keydown', cancel);
    },
    []
  );
  useEffect(
    /* Clears transient interaction state when the profile or date changes. */
    () => {
      setSelected(null);
      setDrag(null);
      setMessage('');
      setOverMailbox(false);
    },
    [state.activeProfile, date]
  );
  useEffect(
    /* Registers cleanup for the posting animation timer. */
    () =>
      /* Clears any pending posting timer when the calendar unmounts. */
      () => {
        if (timer.current) clearTimeout(timer.current);
      },
    []
  );

  /* Checks whether a pointer position is inside the mailbox. */
  function insideMailbox(point: Point) {
    const rect = mailbox.current?.getBoundingClientRect();
    return Boolean(
      rect &&
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  }

  /* Animates an available door into the mailbox and saves its opening. */
  async function post(day: number) {
    if (posting.current || getDoorStatus(day, date, progress) !== 'openable')
      return;
    posting.current = true;
    const rect = mailbox.current?.getBoundingClientRect();
    const target = {
      x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2,
      y: (rect?.top ?? 0) + (rect?.height ?? 0) * 0.46,
    };
    const startRect = document
      .getElementById(`door-${day}`)
      ?.getBoundingClientRect();
    setDrag(
      /* Keeps the current drag or starts one at the door’s position. */
      (previous) =>
        previous ?? {
          day,
          x: (startRect?.left ?? 0) + (startRect?.width ?? 0) / 2,
          y: (startRect?.top ?? 0) + (startRect?.height ?? 0) / 2,
          posting: false,
        }
    );
    requestAnimationFrame(
      /* Waits a frame before scheduling movement toward the mailbox. */
      () =>
        requestAnimationFrame(
          /* Moves the animated door to the mailbox. */
          () => setDrag({ day, ...target, posting: true })
        )
    );
    // Commit once when the drop succeeds, independently of the visual animation.
    await updateProgress({ type: 'open', day, profile: state.activeProfile });
    timer.current = setTimeout(
      /* Finishes the posting animation, announces the result, and restores focus. */
      () => {
        posting.current = false;
        setDrag(null);
        setSelected(null);
        setOverMailbox(false);
        setMessage(
          loggedIn
            ? `Låge ${day} er lagt i postkassen. Du har fået 1 lod.`
            : `Låge ${day} er åben. Dagens fortælling og aktivitet venter på dig.`
        );
        document
          .querySelector<HTMLAnchorElement>(`#door-${day} a`)
          ?.focus({ preventScroll: true });
      },
      650
    );
  }

  return (
    <section
      className="calendar-section"
      id="calendar"
      aria-labelledby="calendar-title"
    >
      <div
        className={`mailbox-bar ${selected !== null || drag ? 'active' : ''}`}
      >
        <div className="mailbox-copy">
          {loggedIn ? (
            <TicketCounter total={totalTickets(progress)} />
          ) : (
            <button className="text-button" onClick={onLogin}>
              Log ind for at samle lodder <span aria-hidden="true">→</span>
            </button>
          )}
          <p>
            {selected !== null
              ? `Låge ${selected} er valgt. Tryk på postkassen eller træk lågen hertil.`
              : 'Tryk på en låge for at vælge den, og træk den derefter til postkassen.'}
          </p>
        </div>
        <button
          ref={mailbox}
          className={`mailbox ${overMailbox ? 'drop-ready' : ''} ${drag?.posting ? 'receiving' : ''}`}
          aria-label={
            selected !== null
              ? `Læg låge ${selected} i postkassen`
              : 'Postkasse – vælg først en låge'
          }
          onClick={
            /* Posts the selected door or asks the visitor to select one. */
            () =>
              selected !== null
                ? void post(selected)
                : setMessage(
                    'Vælg en tilgængelig låge, og tryk derefter på postkassen.'
                  )
          }
        >
          <img
            src="/assets/illustrations/mailbox.webp"
            alt="Rød postkasse"
            draggable="false"
          />
          <span className="mailbox-plus" aria-hidden="true">
            {loggedIn ? '+1' : '✧'}
          </span>
        </button>
      </div>
      <div className="calendar-intro">
        <h2 id="calendar-title">24 små øjeblikke frem mod Jul</h2>
        <p>
          Bag hver låge venter et nyt kapitel i Lille Fjers eventyr. Det er også
          her, du finder dagens aktivitet og muligheden for at samle flere
          lodder i dagens quiz.
        </p>
      </div>
      <p className="keyboard-help" id="calendar-keyboard-help">
        Tastatur: Brug Tab til at vælge en låge. Tryk Enter eller mellemrum for
        at lægge den direkte i postkassen.
      </p>
      <p className="calendar-message" aria-live="polite" role="status">
        {message ||
          'Åbn en låge på dagen eller en hvilken som helst dag derefter.'}
      </p>
      <div className="calendar-grid">
        {days.map(
          /* Renders each door with its current status and interaction handlers. */
          (content) => {
            const status = getDoorStatus(content.day, date, progress);
            return (
              <Door
                key={content.day}
                content={content}
                status={status}
                progress={progress}
                loggedIn={loggedIn}
                today={
                  date === `2026-12-${String(content.day).padStart(2, '0')}`
                }
                selected={selected === content.day}
                dragging={drag?.day === content.day}
                onSelect={
                  /* Selects an available door or posts it immediately for keyboard users. */
                  (keyboard) => {
                    if (posting.current) return;
                    if (status === 'locked') {
                      setMessage(
                        `Låge ${content.day} åbner den ${content.day}. december 2026.`
                      );
                      return;
                    }
                    if (keyboard) {
                      void post(content.day);
                      return;
                    }
                    setSelected(content.day);
                    setMessage(`Låge ${content.day} er klar til postkassen.`);
                  }
                }
                onMove={
                  /* Moves the dragged door and updates the mailbox highlight. */
                  (point) => {
                    if (posting.current) return;
                    setSelected(content.day);
                    setDrag({ day: content.day, ...point, posting: false });
                    setOverMailbox(insideMailbox(point));
                  }
                }
                onDrop={
                  /* Posts a door dropped inside the mailbox or explains how to try again. */
                  (point) => {
                    if (insideMailbox(point)) void post(content.day);
                    else {
                      setDrag(null);
                      setOverMailbox(false);
                      setMessage(
                        'Læg lågen i postkassen for at åbne den. Du kan også trykke på postkassen.'
                      );
                    }
                  }
                }
                onCancel={
                  /* Clears the drag preview and mailbox highlight. */
                  () => {
                    setDrag(null);
                    setOverMailbox(false);
                  }
                }
              />
            );
          }
        )}
      </div>
      {drag && (
        <div
          className={`drag-lid ${drag.posting ? 'posting' : ''}`}
          data-day={drag.day}
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          <img src={days[drag.day - 1].image} alt="" />
          <span>{drag.day}</span>
        </div>
      )}
    </section>
  );
}
