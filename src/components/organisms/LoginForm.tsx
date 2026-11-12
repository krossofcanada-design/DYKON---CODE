import { useState } from 'react';
import GoldButton from '../atoms/GoldButton';

export default function LoginForm({ onLogin, compact = false }: { onLogin: (email: string) => Promise<void>; compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  return <form className={`login-form ${compact ? 'parchment' : ''}`} onSubmit={async event => {
    event.preventDefault(); setBusy(true);
    try { await onLogin(email); } finally { setBusy(false); }
  }}>
    {compact && <><h3>Tilmeld dig og login for at samle lodder</h3><p className="small italic">Alle aktiviteter er også tilgængelige uden tilmelding</p><img className="form-sleigh" src="/assets/sleigh.webp" alt="" /><p className="form-rules">Få <strong>1 lod</strong> for hver dag, du åbner en låge.<br />Få yderligere <strong>5 lod</strong> for et rigtigt svar i dagens quiz.<br />Et forkert svar giver <strong>1 lod</strong> som tak for deltagelse.</p></>}
    <label className="sr-only" htmlFor={compact ? 'signup-email' : 'login-email'}>E-mailadresse</label>
    <div className="form-row"><input id={compact ? 'signup-email' : 'login-email'} type="email" required autoComplete="email" placeholder="navn@email.com" value={email} onChange={event => setEmail(event.target.value)} /><GoldButton disabled={busy}>{busy ? 'Et øjeblik …' : compact ? 'Tilmeld' : 'Log ind'}</GoldButton></div>
    <p className="prototype-note">Testlogin · brug gerne en opdigtet e-mail. Din fremgang gemmes i denne browser.</p>
  </form>;
}
