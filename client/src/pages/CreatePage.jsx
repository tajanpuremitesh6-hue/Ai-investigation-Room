import { useState } from 'react';
import { ArrowLeft, ArrowRight, FilePlus2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { investigationService } from '../services/investigations.js';

const genres = ['General Mystery', 'Murder Mystery', 'Theft', 'Disappearance', 'Corporate Espionage', 'Blackmail'];

export default function CreatePage() {
  const [scenario, setScenario] = useState('');
  const [genre, setGenre] = useState('General Mystery');
  const [difficulty, setDifficulty] = useState('Medium');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) {
      setNotice('Sign in or create an investigator account to save your case.');
      return;
    }
    setBusy(true); setNotice('');
    try {
      const result = await investigationService.create({ scenario, genre, difficulty });
      navigate(`/generating/${result.investigationId}`);
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  return <main className="create-page">
    <SiteHeader minimal />
    <div className="create-layout">
      <div className="create-kicker"><span>NEW INVESTIGATION</span><span>STEP 01 / 01</span></div>
      <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to the casefile</Link>
      <h1>Start with<br /><em>a story.</em></h1>
      <p className="create-lede">A detail you can’t explain. A person who doesn’t add up. Tell us what happened — we’ll help you find what’s missing.</p>
      <form className="scenario-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="scenario">YOUR SCENARIO <span>REQUIRED</span></label>
        <textarea id="scenario" value={scenario} onChange={(event) => { setScenario(event.target.value.slice(0, 2000)); setNotice(''); }} maxLength={2000} placeholder="The night the old clock stopped, every guest at the manor swore they were somewhere else..." required />
        <div className="field-meta"><span>Set the scene. Leave room for questions.</span><span>{scenario.length.toLocaleString()} / 2,000</span></div>
        <div className="form-row">
          <div className="select-field"><label className="field-label" htmlFor="genre">CASE TYPE <span>OPTIONAL</span></label><select id="genre" value={genre} onChange={(event) => setGenre(event.target.value)}>{genres.map((item) => <option key={item}>{item}</option>)}</select></div>
          <fieldset className="difficulty-field"><legend className="field-label">DIFFICULTY <span>REQUIRED</span></legend><div className="difficulty-options">{['Easy', 'Medium', 'Hard'].map((level) => <button className={difficulty === level ? 'difficulty-option selected' : 'difficulty-option'} type="button" onClick={() => setDifficulty(level)} key={level}>{level}</button>)}</div></fieldset>
        </div>
        <p className="difficulty-hint">{difficulty === 'Easy' ? 'A focused case with clear connections and a few suspects.' : difficulty === 'Hard' ? 'A dense case with more suspects, layered clues, and competing timelines.' : 'A balanced investigation with several leads to connect.'}</p>
        {notice && <div className="form-notice" role="status">{notice}</div>}
        <button className="button button-primary submit-case transition-colors" type="submit" disabled={busy}><FilePlus2 size={17} /> {busy ? 'Preparing the case…' : 'Prepare the case'} <ArrowRight size={17} /></button>
        {!user && <div className="auth-prompt">Already have a file? <Link to="/login">Sign in</Link> · <Link to="/register">Create an account</Link></div>}
        <div className="fiction-note">All cases and evidence are fictional, generated for your investigation.</div>
      </form>
      <div className="create-foot"><span>THE CASEFILE / INVESTIGATION DESK</span><span>YOUR STORY STAYS YOURS</span></div>
    </div>
  </main>;
}
