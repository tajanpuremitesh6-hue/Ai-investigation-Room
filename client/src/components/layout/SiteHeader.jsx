import { useState } from 'react';
import { ArrowUpRight, Menu, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SiteHeader({ minimal = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  return <header className="site-header">
    <Link className="brand" to="/" aria-label="AI Mystery Room home">
      <span className="brand-mark"><Search size={17} strokeWidth={2.2} /></span>
      <span>AI <b>MYSTERY ROOM</b></span>
    </Link>
    {!minimal && <nav className="desktop-nav" aria-label="Main navigation">
      <a href="/#how-it-works">How it works</a><a href="/#features">The experience</a>
      <span className="nav-divider" />{user ? <><Link className="nav-login" to="/dashboard">My cases</Link><button className="nav-login nav-signout" type="button" onClick={signOut}>Sign out</button></> : <Link className="nav-login" to="/login">Sign in</Link>}
      <Link className="nav-login nav-join" to="/create">Enter the room <ArrowUpRight size={14} /></Link>
    </nav>}
    <button className="mobile-menu" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Menu size={21} /></button>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{!minimal && <><a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="/#features" onClick={() => setMenuOpen(false)}>The experience</a></>}{user ? <><Link to="/dashboard" onClick={() => setMenuOpen(false)}>My cases</Link><button onClick={() => { signOut(); setMenuOpen(false); }}>Sign out</button></> : <><Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link><Link to="/register" onClick={() => setMenuOpen(false)}>Create account</Link></>}<Link to="/create" onClick={() => setMenuOpen(false)}>Start an investigation <ArrowUpRight size={14} /></Link></nav>}
  </header>;
}
