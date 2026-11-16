/* Wraps page content with the shared header, footer, and skip link. */

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
        onClick={
          /* Moves keyboard focus directly to the main page content. */
          (event) => {
            event.preventDefault();
            document.getElementById('main')?.focus();
          }
        }
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
