import { useState } from 'react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      await signIn({ email: form.get('email'), password: form.get('password') });
      navigate('/');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page"><SiteHeader minimal /><section className="auth-card">
    <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to the casefile</Link>
    <div className="auth-icon"><Search size={20} /></div><div className="create-kicker"><span>RETURNING INVESTIGATOR</span><span>ACCESS / 01</span></div>
    <h1>Back on<br /><em>the case.</em></h1><p className="create-lede">Sign in to return to your saved investigations and notes.</p>
    <form className="scenario-form auth-form" onSubmit={submit}>
      <label className="field-label" htmlFor="email">EMAIL</label><input id="email" name="email" type="email" autoComplete="email" maxLength="254" required />
      <label className="field-label" htmlFor="password">PASSWORD</label><input id="password" name="password" type="password" autoComplete="current-password" maxLength="72" required />
      {error && <div className="form-notice" role="alert">{error}</div>}
      <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Checking credentials…' : 'Sign in'} <ArrowRight size={16} /></button>
    </form>
    <p className="auth-switch">New to the room? <Link to="/register">Create an investigator account</Link></p>
  </section></main>;
}
