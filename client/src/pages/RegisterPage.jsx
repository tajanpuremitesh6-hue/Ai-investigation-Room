import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    if (password !== form.get('confirmPassword')) { setError('The passwords do not match.'); setBusy(false); return; }
    try {
      await signUp({ name: form.get('name'), email: form.get('email'), password });
      navigate('/');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page"><SiteHeader minimal /><section className="auth-card">
    <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to the casefile</Link>
    <div className="create-kicker"><span>NEW INVESTIGATOR</span><span>ACCESS / 01</span></div>
    <h1>Make room<br /><em>for a mystery.</em></h1><p className="create-lede">Create an account to save your investigations and pick up where you left off.</p>
    <form className="scenario-form auth-form" onSubmit={submit}>
      <label className="field-label" htmlFor="name">NAME</label><input id="name" name="name" autoComplete="name" minLength="2" maxLength="80" required />
      <label className="field-label" htmlFor="email">EMAIL</label><input id="email" name="email" type="email" autoComplete="email" maxLength="254" required />
      <label className="field-label" htmlFor="password">PASSWORD <span>10–72 CHARACTERS</span></label><input id="password" name="password" type="password" autoComplete="new-password" minLength="10" maxLength="72" required />
      <label className="field-label" htmlFor="confirmPassword">CONFIRM PASSWORD</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength="10" maxLength="72" required />
      {error && <div className="form-notice" role="alert">{error}</div>}
      <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Opening your file…' : 'Create account'} <ArrowRight size={16} /></button>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </section></main>;
}
