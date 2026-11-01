import { useEffect, useState } from 'react';
import { Bookmark, Check, FileText, Image as ImageIcon, MessageSquareText, Shield, Video } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CaseWorkspaceLayout from '../components/layout/CaseWorkspaceLayout.jsx';
import { authService } from '../services/auth.js';
import { investigationService } from '../services/investigations.js';

const icons = { chat: MessageSquareText, image: ImageIcon, cctv: Video, document: FileText };

function EvidenceContent({ evidence }) {
  const [imageUrl, setImageUrl] = useState('');
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    let objectUrl;
    if (!evidence.mediaUrl) return undefined;
    fetch(evidence.mediaUrl, { headers: { Authorization: `Bearer ${authService.getToken()}` } })
      .then((response) => { if (!response.ok) throw new Error('Media unavailable'); return response.blob(); })
      .then((blob) => { objectUrl = URL.createObjectURL(blob); setImageUrl(objectUrl); })
      .catch(() => setImageUrl(''));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [evidence.mediaUrl]);

  if (evidence.type === 'chat' && evidence.content.messages.length) return <div className="chat-transcript">{evidence.content.messages.map((message, index) => <article className="chat-message" key={`${message.timestamp}-${index}`}><div><b>{message.sender}</b><span>{new Date(message.timestamp).toLocaleString()}</span></div><p>{message.deleted ? <i>Message deleted</i> : message.content}</p><small>To: {message.receiver}</small></article>)}</div>;
  if (evidence.type === 'image' || evidence.type === 'cctv') return <div className={`evidence-visual ${evidence.type}${zoomed ? ' zoomed' : ''}`}>
    {imageUrl ? <button className="image-zoom-toggle" type="button" aria-label={zoomed ? 'Close enlarged image' : 'Enlarge evidence image'} aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}><img src={imageUrl} alt={`Fictional ${evidence.type} evidence: ${evidence.title}`} />{zoomed && <span>Click image to close</span>}</button> : <div className="visual-placeholder"><span>{evidence.type === 'cctv' ? 'FICTIONAL SURVEILLANCE STILL' : 'FICTIONAL EVIDENCE IMAGE'}</span><ImageIcon size={34} /><p>{evidence.description}</p></div>}
    {evidence.type === 'cctv' && <span className="cctv-overlay">CAMERA FEED / {new Date(evidence.timestamp).toLocaleString()}</span>}
  </div>;
  return <div className="document-content"><span className="field-label">FICTIONAL DOCUMENT</span><p>{evidence.content.text || evidence.content.summary}</p>{evidence.content.metadata.map((entry) => <div className="document-meta" key={entry.key}><b>{entry.key}</b><span>{entry.value}</span></div>)}</div>;
}

export default function EvidencePage() {
  const { id } = useParams();
  const [evidence, setEvidence] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const selected = evidence.find((item) => item.evidenceId === selectedId);

  useEffect(() => {
    investigationService.evidence(id).then((data) => { setEvidence(data.evidence); setSelectedId(data.evidence[0]?.evidenceId || ''); }).catch((failure) => setError(failure.message));
  }, [id]);

  async function selectEvidence(item) {
    setSelectedId(item.evidenceId);
    if (!item.opened) {
      try { await investigationService.openEvidence(id, item.evidenceId); setEvidence((items) => items.map((entry) => entry.evidenceId === item.evidenceId ? { ...entry, opened: true } : entry)); }
      catch (failure) { setError(failure.message); }
    }
  }

  async function toggleBookmark(item) {
    const bookmarked = !item.bookmarked;
    try { await investigationService.bookmarkEvidence(id, item.evidenceId, bookmarked); setEvidence((items) => items.map((entry) => entry.evidenceId === item.evidenceId ? { ...entry, bookmarked } : entry)); }
    catch (failure) { setError(failure.message); }
  }

  return <CaseWorkspaceLayout active="/evidence">{() => <>
    {error && <div className="form-notice" role="alert">{error}</div>}
    <div className="evidence-room"><aside className="evidence-list"><div className="field-label">CASE EVIDENCE <span>{evidence.length} ITEMS</span></div>
      {evidence.map((item, index) => { const Icon = icons[item.type] || FileText; return <button className={item.evidenceId === selectedId ? 'evidence-list-item active' : 'evidence-list-item'} onClick={() => selectEvidence(item)} key={item.evidenceId}><span className="evidence-index">{String(index + 1).padStart(2, '0')}</span><Icon size={16} /><span className="evidence-item-copy"><b>{item.title}</b><small>{item.type.toUpperCase()} · {new Date(item.timestamp).toLocaleDateString()}</small></span>{item.opened && <Check size={14} className="evidence-open-check" />}</button>; })}
    </aside>
    <section className="evidence-detail">{selected ? <>
      <div className="evidence-detail-top"><span className="section-label"><span>FICTIONAL {selected.type.toUpperCase()} EVIDENCE</span></span><button className={selected.bookmarked ? 'icon-button bookmarked' : 'icon-button'} onClick={() => toggleBookmark(selected)} aria-label={selected.bookmarked ? 'Remove bookmark' : 'Bookmark evidence'}><Bookmark size={17} fill={selected.bookmarked ? 'currentColor' : 'none'} /></button></div>
      <h2>{selected.title}</h2><p className="evidence-description">{selected.description}</p><div className="evidence-timestamp"><Shield size={14} /> Fictional evidence · {new Date(selected.timestamp).toLocaleString()}</div>
      <EvidenceContent evidence={selected} />
      <p className="evidence-summary">{selected.content.summary}</p>
    </> : <div className="case-loading"><span className="stage-index">EVIDENCE ROOM</span><h2>{error ? 'Evidence could not be loaded.' : 'No evidence is available yet.'}</h2></div>}</section></div>
  </>}</CaseWorkspaceLayout>;
}
