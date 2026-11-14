import TicketCounter from '../molecules/TicketCounter';

interface Props {
  loggedIn: boolean;
  total: number;
  daily: boolean;
  onLogin: () => void;
  onLogout: () => void;
}
export default function Header({
  loggedIn,
  total,
  daily,
  onLogin,
  onLogout,
}: Props) {
  return (
    <header className="site-header">
      <a
        href="#/"
        className="brand"
        aria-label="Ringsted Dun og Bog & idé – til forsiden"
      >
        <span className="ringsted-wordmark">Ringsted Dun</span>
        <span className="brand-divider" />
        <span className="partner">
          <small>i samarbejde med</small>
          <strong>Bog&amp;idé</strong>
        </span>
      </a>
      <div className="header-actions">
        {loggedIn && daily && <TicketCounter total={total} compact />}
        <button
          className="outline-button"
          onClick={loggedIn ? onLogout : onLogin}
        >
          {loggedIn ? 'Log ud' : 'Log ind'}
        </button>
      </div>
      {daily && (
        <a className="back-link" href="#/">
          ← Til julekalenderen
        </a>
      )}
    </header>
  );
}
