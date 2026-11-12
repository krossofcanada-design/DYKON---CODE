export default function Footer({ onInfo }: { onInfo: (kind: 'terms' | 'privacy') => void }) {
  return <footer className="site-footer">
    <div className="footer-top">
      <a href="#/" className="footer-brand"><img src="/assets/footer-brand.webp" alt="Ringsted Dun i samarbejde med Bog&idé" /></a>
      <nav aria-label="Sidefod"><a href="#/">Til forsiden</a><a href="#calendar">Dagens låge</a><button onClick={() => onInfo('terms')}>Konkurrencevilkår</button><button onClick={() => onInfo('privacy')}>Privatliv</button></nav>
    </div>
    <small className="copyright">© 2026 Ringsted Dun · Studieprototype</small>
  </footer>;
}
