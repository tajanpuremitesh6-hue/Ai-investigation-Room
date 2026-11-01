import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CaseWorkspaceLayout from '../components/layout/CaseWorkspaceLayout.jsx';
import { investigationService } from '../services/investigations.js';

export default function TimelinePage() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { investigationService.timeline(id).then((data) => setEvents(data.timeline)).catch((failure) => setError(failure.message)); }, [id]);
  return <CaseWorkspaceLayout active="/timeline">{() => <>
    {error && <div className="form-notice" role="alert">{error}</div>}
    <div className="section-label"><span>CHRONOLOGY</span>{events.length} RECORDED EVENTS</div>
    <ol className="case-timeline">{events.map((event, index) => <li key={event.eventId}><div className="timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div><article><time><Clock3 size={14} /> {new Date(event.timestamp).toLocaleString()}</time><p>{event.description}</p>{event.involvedSuspectIds?.length > 0 && <div className="timeline-suspects">INVOLVES {event.involvedSuspectIds.join(' · ')}</div>}</article></li>)}</ol>
    {!events.length && !error && <div className="case-loading"><h2>Timeline events are not ready yet.</h2></div>}
  </>}</CaseWorkspaceLayout>;
}
