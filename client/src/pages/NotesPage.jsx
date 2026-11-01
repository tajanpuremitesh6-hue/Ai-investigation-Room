import { useEffect, useState } from 'react';
import { FilePlus2, Link2, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CaseWorkspaceLayout from '../components/layout/CaseWorkspaceLayout.jsx';
import { investigationService } from '../services/investigations.js';

const emptyDraft = { content: '', linkedSuspectId: '', linkedEvidenceId: '' };

export default function NotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [noteData, suspectData, evidenceData] = await Promise.all([investigationService.notes(id), investigationService.suspects(id), investigationService.evidence(id)]);
    setNotes(noteData.notes); setSuspects(suspectData.suspects); setEvidence(evidenceData.evidence);
  }
  useEffect(() => { refresh().catch((failure) => setError(failure.message)); }, [id]);

  function edit(note) {
    setEditingId(note._id);
    setDraft({ content: note.content, linkedSuspectId: note.linkedSuspectId || '', linkedEvidenceId: note.linkedEvidenceId || '' });
    setError('');
  }
  function reset() { setEditingId(''); setDraft(emptyDraft); setError(''); }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const payload = { content: draft.content, linkedSuspectId: draft.linkedSuspectId || null, linkedEvidenceId: draft.linkedEvidenceId || null };
    try {
      if (editingId) await investigationService.updateNote(id, editingId, payload);
      else await investigationService.createNote(id, payload);
      await refresh(); reset();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  async function remove(noteId) {
    try { await investigationService.deleteNote(id, noteId); setNotes((current) => current.filter((note) => note._id !== noteId)); if (editingId === noteId) reset(); }
    catch (failure) { setError(failure.message); }
  }

  return <CaseWorkspaceLayout active="/notes">{() => <>
    <div className="section-label"><span>DETECTIVE NOTEBOOK</span>{notes.length} NOTES</div>
    {error && <div className="form-notice" role="alert">{error}</div>}
    <div className="notes-layout"><form className="note-editor" onSubmit={submit}>
      <div className="field-label">{editingId ? 'EDIT NOTE' : 'NEW NOTE'}<span>PRIVATE TO THIS CASE</span></div>
      <textarea value={draft.content} maxLength={5000} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="What doesn't add up? Keep your observations and working theories here…" required />
      <div className="field-meta"><span>Link your note to a person or piece of evidence.</span><span>{draft.content.length} / 5,000</span></div>
      <label className="field-label" htmlFor="note-suspect">LINK A SUSPECT <span>OPTIONAL</span></label><select id="note-suspect" value={draft.linkedSuspectId} onChange={(event) => setDraft({ ...draft, linkedSuspectId: event.target.value })}><option value="">No suspect linked</option>{suspects.map((suspect) => <option value={suspect.suspectId} key={suspect.suspectId}>{suspect.fullName}</option>)}</select>
      <label className="field-label" htmlFor="note-evidence">LINK EVIDENCE <span>OPTIONAL</span></label><select id="note-evidence" value={draft.linkedEvidenceId} onChange={(event) => setDraft({ ...draft, linkedEvidenceId: event.target.value })}><option value="">No evidence linked</option>{evidence.map((item) => <option value={item.evidenceId} key={item.evidenceId}>{item.title}</option>)}</select>
      <div className="note-actions"><button className="button button-primary" type="submit" disabled={busy}><FilePlus2 size={16} /> {busy ? 'Saving…' : editingId ? 'Update note' : 'Save note'}</button>{editingId && <button className="button button-secondary" type="button" onClick={reset}>Cancel</button>}</div>
    </form>
    <div className="note-list">{notes.length ? notes.map((note) => <article className="note-card" key={note._id}><div className="note-card-top"><span>{new Date(note.updatedAt).toLocaleString()}</span><div><button type="button" className="icon-button" onClick={() => edit(note)} aria-label="Edit note">Edit</button><button type="button" className="icon-button danger" onClick={() => remove(note._id)} aria-label="Delete note"><Trash2 size={15} /></button></div></div><p>{note.content}</p>{(note.linkedSuspectId || note.linkedEvidenceId) && <div className="note-links"><Link2 size={13} />{note.linkedSuspectId && <span>{suspects.find((item) => item.suspectId === note.linkedSuspectId)?.fullName || note.linkedSuspectId}</span>}{note.linkedEvidenceId && <span>{evidence.find((item) => item.evidenceId === note.linkedEvidenceId)?.title || note.linkedEvidenceId}</span>}</div>}</article>) : <div className="empty-notes">No notes yet. Start with the detail that keeps pulling at you.</div>}</div></div>
  </>}</CaseWorkspaceLayout>;
}
