import { useEffect, useRef, useState } from 'react';
import puzzlePieces from '../../data/puzzle.json';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import type { Point } from '../../hooks/usePointerDrag';
import { updateProgress } from '../../state/store';

interface Props { placed: number[]; profile: string | null; onLogin: () => void }
interface PieceProps { id: number; selected: boolean; onSelect: (keyboard: boolean) => void; onMove: (point: Point) => void; onDrop: (point: Point) => void; onCancel: () => void }

function Piece({ id, selected, onSelect, onMove, onDrop, onCancel }: PieceProps) {
  const handlers = usePointerDrag(onMove, onDrop, onCancel);
  return <button {...handlers} className={`puzzle-piece ${selected ? 'selected' : ''}`} onClick={event => onSelect(event.detail === 0)} data-piece={id} aria-describedby="puzzle-keyboard-help" aria-label={`Brik ${id}`} aria-pressed={selected}>
    <img src={puzzlePieces[id - 1].image} alt="" draggable="false" />
  </button>;
}

export default function Puzzle({ placed, profile, onLogin }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<(Point & { id: number }) | null>(null);
  const [message, setMessage] = useState('');
  const board = useRef<HTMLDivElement>(null);
  const tray = useRef<HTMLDivElement>(null);
  const targets = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(false);
  const busy = useRef(false);
  const success = useRef<HTMLDivElement>(null);
  const complete = placed.length === 24;
  const order = [8, 19, 3, 16, 6, 22, 11, 1, 17, 13, 5, 24, 9, 21, 4, 15, 7, 20, 12, 2, 23, 10, 18, 14];

  useEffect(() => {
    if (returnFocus.current) {
      returnFocus.current = false;
      if (placed.length === 24) success.current?.focus();
      else tray.current?.querySelector<HTMLButtonElement>('.puzzle-piece')?.focus();
    }
  }, [placed]);

  function focusSlot(index: number) {
    targets.current?.querySelector<HTMLButtonElement>(`[data-slot="${index}"]`)?.focus();
  }

  async function place(piece: number, slot: number) {
    if (busy.current) return;
    setDrag(null);
    if (piece !== slot) { setMessage('Prøv et andet sted. Se efter kanter og detaljer i billedet.'); return; }
    busy.current = true;
    returnFocus.current = Boolean(targets.current?.contains(document.activeElement));
    try {
      await updateProgress({ type: 'piece', day: 6, piece, profile });
    } finally { busy.current = false; }
    setSelected(null);
    setMessage(placed.length === 23 ? 'Du har samlet hele Snedronningens eventyr!' : 'Brikken passer!');
  }

  function drop(id: number, point: Point) {
    const rect = board.current?.getBoundingClientRect();
    if (!rect || point.x < rect.left || point.x >= rect.right || point.y < rect.top || point.y >= rect.bottom) { setDrag(null); return; }
    const column = Math.floor((point.x - rect.left) / rect.width * 6);
    const row = Math.floor((point.y - rect.top) / rect.height * 4);
    void place(id, row * 6 + column + 1);
  }

  function skipPuzzle() {
    setSelected(null);
    setDrag(null);
    document.getElementById('quiz-heading')?.focus();
  }

  return <section className="puzzle-section" aria-labelledby="puzzle-title" onKeyDown={event => {
    if (event.key === 'Escape' && event.shiftKey) {
      event.preventDefault();
      skipPuzzle();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (selected !== null) tray.current?.querySelector<HTMLButtonElement>(`[data-piece="${selected}"]`)?.focus();
      setSelected(null); setDrag(null); setMessage('Valg annulleret. Vælg en brik.');
    }
  }}>
    <h2 id="puzzle-title">Ekstra gaver på spil!</h2><p className="gold italic">Saml dagens puslespil, og træd ind i Snedronningens eventyr.</p>
    <div className="section-symbol"><img src="/assets/scissors.webp" alt="" /><span>En kreativ<br />stund sammen</span></div>
    <p className="puzzle-instructions">Træk en brik til dens plads. Du kan også vælge en brik og trykke på en plads.</p>
    <p className="keyboard-help" id="puzzle-keyboard-help">Tastatur: Tab til en brik, og vælg med Enter eller mellemrum. Brug piletasterne på brættet, og tryk Enter eller mellemrum for at placere brikken. Escape vender tilbage til brikken. Du kan når som helst trykke Shift + Escape for at forlade puslespillet og gå til dagens quiz. Din fremgang gemmes, så du kan fortsætte senere.</p>
    <button type="button" className="outline-button" onClick={skipPuzzle}>Spring puslespillet over – gå til dagens quiz</button>
    <div className={`puzzle-board ${complete ? 'complete' : ''}`} ref={board}>
      <img className="puzzle-outline" src="/assets/puzzle-outline.webp" alt="" />
      {puzzlePieces.filter(piece => placed.includes(piece.id)).map(piece => <img key={piece.id} className="placed-piece" src={piece.image} alt="" style={{ left: `${piece.x / 1536 * 100}%`, top: `${piece.y / 1024 * 100}%`, width: `${piece.width / 1536 * 100}%`, height: `${piece.height / 1024 * 100}%` }} />)}
      <div className="puzzle-targets" ref={targets}>{puzzlePieces.map(piece => <button
        key={piece.id}
        data-slot={piece.id}
        className={placed.includes(piece.id) ? 'filled' : ''}
        tabIndex={selected !== null && !placed.includes(piece.id) ? 0 : -1}
        aria-label={`Række ${Math.floor((piece.id - 1) / 6) + 1}, kolonne ${(piece.id - 1) % 6 + 1}${placed.includes(piece.id) ? ' – udfyldt' : ''}`}
        aria-disabled={placed.includes(piece.id)}
        aria-describedby="puzzle-keyboard-help"
        onKeyDown={event => {
          const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -6, ArrowDown: 6 };
          if (event.key in offsets) {
            event.preventDefault();
            focusSlot(((piece.id - 1 + offsets[event.key] + 24) % 24) + 1);
          }
        }}
        onClick={() => {
          if (placed.includes(piece.id)) { setMessage('Denne plads er allerede udfyldt. Vælg en anden plads med piletasterne.'); return; }
          if (selected !== null) void place(selected, piece.id);
          else setMessage('Vælg først en brik nedenfor.');
        }}
      />)}</div>
    </div>
    <div className="puzzle-progress"><span>{placed.length} af 24 brikker</span><progress max="24" value={placed.length} aria-label="Puslespillets fremgang" /></div>
    {!complete && <div className="piece-carousel"><button className="carousel-arrow" aria-label="Forrige brikker" onClick={() => tray.current?.scrollBy({ left: -250, behavior: 'smooth' })}>‹</button><div className="piece-tray" ref={tray}>
      {order.filter(id => !placed.includes(id)).map(id => <Piece key={id} id={id} selected={selected === id} onSelect={keyboard => { setSelected(id); setMessage(`Brik ${id} valgt. Brug piletasterne til at vælge en plads, og tryk Enter eller mellemrum. Escape annullerer.`); if (keyboard) focusSlot(puzzlePieces.find(piece => !placed.includes(piece.id))?.id ?? 1); }} onMove={point => { setSelected(id); setDrag({ ...point, id }); }} onDrop={point => drop(id, point)} onCancel={() => setDrag(null)} />)}
    </div><button className="carousel-arrow" aria-label="Næste brikker" onClick={() => tray.current?.scrollBy({ left: 250, behavior: 'smooth' })}>›</button></div>}
    <p className="puzzle-message" role="status" aria-live="polite">{message}</p>
    {complete && <div className="puzzle-success" ref={success} tabIndex={-1}><span aria-hidden="true">✧</span><h3>Et helt eventyr, brik for brik</h3><p>{profile ? 'Dit færdige puslespil er gemt sammen med din fremgang.' : 'Du har samlet alle 24 brikker. Log ind for at prøve kalenderen med en deltagerprofil.'}</p>{!profile && <button className="text-button" onClick={onLogin}>Prøv som deltager →</button>}</div>}
    <p className="small italic gold">I den færdige kampagne giver det samlede puslespil adgang til den særlige lodtrækning om 500 puder fra Ringsted Dun’s H. C. Andersen serie “Snedronningen”. Prototypen registrerer din gennemførelse.</p>
    {drag && <img className="drag-piece" src={puzzlePieces[drag.id - 1].image} alt="" aria-hidden="true" style={{ left: drag.x, top: drag.y }} />}
  </section>;
}
