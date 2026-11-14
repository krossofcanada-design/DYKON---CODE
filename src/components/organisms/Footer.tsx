/* Renders the footer with competition and privacy links. */
export default function Footer({
  onInfo,
}: {
  onInfo: (kind: 'terms' | 'privacy') => void;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <a href="#/" className="footer-brand">
          <img
            src="/assets/branding/footer-brand.webp"
            alt="Ringsted Dun i samarbejde med Bog&idé"
          />
        </a>
        <nav aria-label="Sidefod">
          <a href="#/">Til forsiden</a>
          <a href="#calendar">Dagens låge</a>
          <button
            onClick={/* Opens the competition terms. */ () => onInfo('terms')}
          >
            Konkurrencevilkår
          </button>
          <button
            onClick={
              /* Opens the privacy information. */
              () => onInfo('privacy')
            }
          >
            Privatliv
          </button>
        </nav>
      </div>
      <small className="copyright">© 2026 Ringsted Dun · Studieprototype</small>
    </footer>
  );
}
