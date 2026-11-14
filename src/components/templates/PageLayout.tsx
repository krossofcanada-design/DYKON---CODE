import type { ReactNode } from 'react';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';

interface Props {
  children: ReactNode;
  loggedIn: boolean;
  total: number;
  daily: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onInfo: (kind: 'terms' | 'privacy') => void;
}
export default function PageLayout({ children, onInfo, ...header }: Props) {
  return (
    <div className="site-shell">
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Gå til indhold
      </a>
      <Header {...header} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer onInfo={onInfo} />
    </div>
  );
}
