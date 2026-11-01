import { useEffect, useState } from 'react';
import { Fingerprint, UserRound } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CaseWorkspaceLayout from '../components/layout/CaseWorkspaceLayout.jsx';
import { investigationService } from '../services/investigations.js';

export default function SuspectsPage() {
  const { id } = useParams();
  const [suspects, setSuspects] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { investigationService.suspects(id).then((data) => setSuspects(data.suspects)).catch((failure) => setError(failure.message)); }, [id]);

  return <CaseWorkspaceLayout active="/suspects">{() => <>
    {error && <div className="form-notice" role="alert">{error}</div>}
    <div className="section-label"><span>PERSONS OF INTEREST</span>{suspects.length} PROFILES</div>
    <div className="suspect-grid">{suspects.map((suspect, index) => <article className="suspect-card" key={suspect.suspectId}>
      <div className="suspect-photo">{suspect.portraitUrl ? <img src={suspect.portraitUrl} alt={`Fictional portrait of ${suspect.fullName}`} /> : <><UserRound size={34} /><span>PERSON OF INTEREST / {String(index + 1).padStart(2, '0')}</span></>}</div>
      <div className="suspect-identity"><span>{suspect.occupation}</span><h2>{suspect.fullName}</h2><small>AGE {suspect.age}</small></div>
      <p>{suspect.characterDescription}</p>
      <div className="suspect-detail"><b>CONNECTION</b><span>{suspect.relationship}</span></div>
      <div className="suspect-detail"><b>POSSIBLE MOTIVE</b><span>{suspect.possibleMotive}</span></div>
      <div className="suspect-detail"><b>CLAIMED ALIBI</b><span>{suspect.claimedAlibi}</span></div>
      <div className="suspect-detail"><b>BACKGROUND</b><span>{suspect.background}</span></div>
      <div className="suspect-filemark"><Fingerprint size={16} /> PROFILE / {suspect.suspectId}</div>
    </article>)}</div>
    {!suspects.length && !error && <div className="case-loading"><h2>Suspect profiles are not ready yet.</h2></div>}
  </>}</CaseWorkspaceLayout>;
}
