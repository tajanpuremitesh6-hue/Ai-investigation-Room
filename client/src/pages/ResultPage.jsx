import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleX, Clock3, Fingerprint } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import CaseWorkspaceLayout from '../components/layout/CaseWorkspaceLayout.jsx';
import { investigationService } from '../services/investigations.js';

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { investigationService.result(id).then(setResult).catch((failure) => setError(failure.message)); }, [id]);

  return <CaseWorkspaceLayout active="/accuse">{(record) => <>
    {error && <div className="form-notice" role="alert">{error}</div>}
    {result ? <div className="verdict-wrap">
      <div className={result.correct ? 'verdict-banner correct' : 'verdict-banner incorrect'}>{result.correct ? <CheckCircle2 size={22} /> : <CircleX size={22} />}<span>{result.correct ? 'YOUR ACCUSATION WAS CORRECT' : 'THE EVIDENCE POINTED ELSEWHERE'}</span><b>SCORE {result.score}/100</b></div>
      <div className="verdict-intro"><span className="section-label"><span>CASE CLOSED</span> FINAL REPORT</span><h2>The truth behind<br /><em>{record.title}</em></h2><p>Actual culprit</p><h3>{result.actualCulprit?.fullName}</h3><span className="culprit-role">{result.actualCulprit?.occupation} · {result.actualCulprit?.relationship}</span></div>
      <div className="solution-grid"><article><span className="field-label">MOTIVE</span><p>{result.motive}</p></article><article><span className="field-label">METHOD</span><p>{result.method}</p></article></div>
      <section className="solution-section"><div className="section-label"><span>01</span> WHAT HAPPENED</div><p>{result.explanation}</p></section>
      <section className="solution-section"><div className="section-label"><span>02</span> THE EVIDENCE THAT MATTERED</div>{result.importantEvidence.map((clue) => <article className="result-evidence" key={clue.evidenceId}><Fingerprint size={17} /><div><b>{clue.evidence?.title || clue.evidenceId}</b><p>{clue.inference}</p><span>{clue.evidence?.description}</span></div></article>)}</section>
      <section className="solution-section"><div className="section-label"><span>03</span> RECONSTRUCTED TIMELINE</div><ol className="result-timeline">{result.timelineReconstruction.map((event) => <li key={event.eventId}><time><Clock3 size={13} />{new Date(event.timestamp).toLocaleString()}</time><p>{event.description}</p></li>)}</ol></section>
      {result.contradictions.length > 0 && <section className="solution-section"><div className="section-label"><span>04</span> CONTRADICTIONS EXPLAINED</div>{result.contradictions.map((item) => <article className="explanation-row" key={item.contradictionId}><b>{item.description}</b><p>{item.explanation}</p></article>)}</section>}
      {result.redHerringExplanations.length > 0 && <section className="solution-section"><div className="section-label"><span>05</span> RED HERRINGS</div>{result.redHerringExplanations.map((item) => <article className="explanation-row" key={item.evidenceId}><b>{item.title || item.evidenceId}</b><p>{item.explanation}</p></article>)}</section>}
      <section className="solution-section"><div className="section-label"><span>06</span> THE OTHER SUSPECTS</div>{result.otherSuspects.map(({ suspect, explanation }) => <article className="explanation-row" key={suspect.suspectId}><b>{suspect.fullName}</b><p>{explanation}</p></article>)}</section>
      <Link className="button button-primary" to={`/case/${id}/evidence`}>Review the evidence file <ArrowRight size={16} /></Link>
    </div> : !error && <div className="case-loading"><span className="stage-index">FINAL REPORT</span><h2>Preparing the verdict…</h2></div>}
  </>}</CaseWorkspaceLayout>;
}
