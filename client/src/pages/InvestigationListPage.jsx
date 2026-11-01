import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, FilePlus2, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { investigationService } from '../services/investigations.js';

function casePath(item) {
  if (item.status === 'generating') return `/generating/${item._id}`;
  if (item.status === 'failed') return `/generating/${item._id}`;
  if (item.status === 'completed') return `/case/${item._id}/result`;
  return `/case/${item._id}`;
}

export default function InvestigationListPage() {
  const history = useLocation().pathname === '/history';
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try { const data = await investigationService.list(); setItems(data.investigations); setError(''); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function remove(id) {
    try { await investigationService.delete(id); setItems((current) => current.filter((item) => item._id !== id)); }
    catch (failure) { setError(failure.message); }
  }

  return <main className="dashboard-page"><SiteHeader /><section className="dashboard-layout">
    <div className="create-kicker"><span>INVESTIGATOR / {user?.name?.toUpperCase() || 'MY FILES'}</span><span>{history ? 'CASE HISTORY' : 'DESK OVERVIEW'}</span></div>
    <div className="dashboard-heading"><div><span className="section-label"><span>YOUR ARCHIVE</span> PRIVATE INVESTIGATIONS</span><h1>{history ? <>The case<br /><em>history.</em></> : <>Back to<br /><em>the work.</em></>}</h1></div><Link className="button button-primary" to="/create"><FilePlus2 size={16} /> New investigation <ArrowRight size={16} /></Link></div>
    {error && <div className="form-notice" role="alert">{error} {!user && <Link to="/login">Sign in</Link>}</div>}
    {loading ? <div className="case-loading"><h2>Opening your archive…</h2></div> : items.length ? <div className="investigation-list">{items.map((item) => <article className="investigation-row" key={item._id}>
      <div className="investigation-row-main"><div className="sample-id">{item.genre} <span>·</span> {item.difficulty.toUpperCase()}</div><h2>{item.title}</h2><p><Clock3 size={13} /> {new Date(item.createdAt).toLocaleString()}</p></div>
      <span className={`investigation-status ${item.status}`}>{item.status === 'generating' ? item.generationStatus : item.status}{item.status === 'completed' && item.score !== null ? ` · ${item.score}/100` : ''}</span>
      <div className="investigation-row-actions"><Link className="text-link" to={casePath(item)}>{item.status === 'generating' ? 'View progress' : item.status === 'failed' ? 'View status' : item.status === 'completed' ? 'Open verdict' : 'Continue'} <ArrowRight size={14} /></Link><button className="icon-button danger" type="button" onClick={() => remove(item._id)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div>
    </article>)}</div> : !error && <div className="archive-empty"><span className="stage-index">NO CASES ON FILE</span><h2>Your first investigation<br />starts with a story.</h2><Link className="button button-primary" to="/create">Start an investigation <ArrowRight size={16} /></Link></div>}
  </section></main>;
}
