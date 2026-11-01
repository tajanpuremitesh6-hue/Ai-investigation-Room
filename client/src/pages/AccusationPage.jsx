import { useEffect, useState } from 'react';
import { ArrowRight, Gavel } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import CaseWorkspaceLayout from '../components/layout/CaseWorkspaceLayout.jsx';
import { investigationService } from '../services/investigations.js';

export default function AccusationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suspects, setSuspects] = useState([]);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { investigationService.suspects(id).then((data) => setSuspects(data.suspects)).catch((failure) => setError(failure.message)); }, [id]);

  async function submit(event) {
    event.preventDefault();
    if (!selectedSuspectId) { setError('Select a suspect before submitting your accusation.'); return; }
    setBusy(true); setError('');
    try { await investigationService.accuse(id, { selectedSuspectId, reasoning }); navigate(`/case/${id}/result`); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return <CaseWorkspaceLayout active="/accuse">{() => <section className="accusation-panel">
    <div className="section-label"><span>FINAL DECISION</span> ONE SUSPECT / ONE ACCUSATION</div>
    <h2>Who had the means,<br />the motive, and <em>the moment?</em></h2>
    <p>Review your evidence, make your case, then commit to one person of interest. Your choice will close the investigation and reveal the full solution.</p>
    {error && <div className="form-notice" role="alert">{error}</div>}
    <form onSubmit={submit}>
      <fieldset className="accusation-suspects"><legend className="field-label">SELECT YOUR SUSPECT <span>REQUIRED</span></legend>{suspects.map((suspect) => <label className={selectedSuspectId === suspect.suspectId ? 'accusation-choice selected' : 'accusation-choice'} key={suspect.suspectId}><input type="radio" name="culprit" value={suspect.suspectId} checked={selectedSuspectId === suspect.suspectId} onChange={() => setSelectedSuspectId(suspect.suspectId)} /><span><b>{suspect.fullName}</b><small>{suspect.occupation} · {suspect.relationship}</small></span><i /></label>)}</fieldset>
      <label className="field-label" htmlFor="reasoning">YOUR REASONING <span>OPTIONAL</span></label><textarea className="accusation-reasoning" id="reasoning" value={reasoning} maxLength={4000} onChange={(event) => setReasoning(event.target.value)} placeholder="Connect the evidence. Explain what changed your mind…" />
      <button className="button button-primary accusation-submit" type="submit" disabled={busy || !selectedSuspectId}><Gavel size={16} /> {busy ? 'Recording your accusation…' : 'Submit final accusation'} <ArrowRight size={16} /></button>
      <p className="fiction-note">Your accusation can only be submitted once. The complete solution appears after it is recorded.</p>
    </form>
  </section>}</CaseWorkspaceLayout>;
}
