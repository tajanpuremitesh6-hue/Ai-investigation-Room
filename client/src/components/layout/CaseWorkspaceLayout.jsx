import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, NavLink, useParams } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import { investigationService } from '../../services/investigations.js';

const sections = [
  ['', 'Brief'], ['/evidence', 'Evidence'], ['/suspects', 'Suspects'], ['/timeline', 'Timeline'], ['/notes', 'Notebook'],
];

export default function CaseWorkspaceLayout({ active, children }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    investigationService.get(id).then(setData).catch((failure) => setError(failure.message));
  }, [id]);

  const investigation = data?.investigation;
  return <main className="case-page"><SiteHeader /><section className="case-layout">
    <Link className="back-link" to="/history"><ArrowLeft size={15} /> All investigations</Link>
    {error ? <div className="form-notice" role="alert">{error}</div> : !investigation ? <div className="case-loading"><span className="stage-index">CASE FILE</span><h1>Opening the investigation…</h1></div> : <>
      <div className="create-kicker"><span>CASE № {investigation._id.slice(-6).toUpperCase()}</span><span>{investigation.genre} / {investigation.difficulty.toUpperCase()}</span></div>
      <h1 className="workspace-title">{investigation.title}</h1>
      <nav className="case-tabs" aria-label="Investigation sections">{sections.map(([path, label]) => <NavLink end={path === ''} className={active === path ? 'case-tab active' : 'case-tab'} to={`/case/${id}${path}`} key={path}>{label}</NavLink>)}
        <NavLink className={active === '/accuse' ? 'case-tab active case-accuse' : 'case-tab case-accuse'} to={`/case/${id}${investigation.status === 'completed' ? '/result' : '/accuse'}`}>{investigation.status === 'completed' ? 'Verdict' : 'Make an accusation'}</NavLink>
      </nav>
      {children(investigation, data.progress)}
    </>}
  </section></main>;
}
