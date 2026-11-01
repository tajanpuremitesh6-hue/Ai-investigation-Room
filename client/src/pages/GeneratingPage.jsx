import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, LoaderCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import { investigationService } from '../services/investigations.js';

const stages = [
  ['analyzing', 'Reading the scenario'],
  ['blueprint', 'Building the case logic'],
  ['validating', 'Checking the timeline'],
  ['evidence', 'Preparing the evidence'],
  ['media', 'Finishing the case file'],
  ['published', 'Investigation ready'],
];

export default function GeneratingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let timer;
    async function check() {
      try {
        const result = await investigationService.status(id);
        if (!active) return;
        setStatus(result);
        if (result.status === 'active') navigate(`/case/${id}`, { replace: true });
        else if (result.status === 'failed') setError(result.message || 'We could not build a consistent case. Please start a new investigation.');
        else timer = window.setTimeout(check, 2200);
      } catch (failure) {
        if (active) setError(failure.message);
      }
    }
    check();
    return () => { active = false; window.clearTimeout(timer); };
  }, [id, navigate]);

  const currentIndex = Math.max(0, stages.findIndex(([key]) => key === status?.generationStatus));

  return <main className="create-page"><SiteHeader minimal /><section className="generation-card">
    <Link className="back-link" to="/history"><ArrowLeft size={15} /> Back to investigations</Link>
    <div className="create-kicker"><span>CASE FILE / GENERATION</span><span>{status?.generationId?.slice(0, 8).toUpperCase() || 'QUEUED'}</span></div>
    <div className={error ? 'generation-symbol failed' : 'generation-symbol'}>{error ? <AlertCircle size={25} /> : <LoaderCircle size={25} className="spin" />}</div>
    <h1>{error ? <>A pause in<br /><em>the investigation.</em></> : <>Putting the<br /><em>pieces together.</em></>}</h1>
    <p className="create-lede">{error || 'The case is being assembled and checked for consistency. This page will update as the investigation is prepared.'}</p>
    {!error && <ol className="generation-stages">{stages.map(([key, label], index) => <li className={index < currentIndex ? 'done' : index === currentIndex ? 'current' : ''} key={key}>{index < currentIndex ? <Check size={15} /> : <span className="stage-index">0{index + 1}</span>}<span>{label}</span></li>)}</ol>}
    {error && <Link className="button button-primary" to="/create">Start a new investigation <ArrowLeft size={15} /></Link>}
  </section></main>;
}
