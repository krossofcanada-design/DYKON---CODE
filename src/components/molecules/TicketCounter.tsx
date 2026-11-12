export default function TicketCounter({ total, compact = false }: { total: number; compact?: boolean }) {
  return <div className={`ticket-counter ${compact ? 'compact' : ''}`} aria-label={`Dine lodder: ${total}`}>
    <span>Dine lodder</span><span className="ticket-number">{total}</span>
    {!compact && <span className="ticket-image"><img src="/assets/ticket.webp" alt="" /></span>}
  </div>;
}
