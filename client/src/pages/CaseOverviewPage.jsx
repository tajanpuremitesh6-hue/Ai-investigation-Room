import { Clock3, FileSearch2, MapPin, Users } from 'lucide-react';
import CaseWorkspaceLayout from '../components/layout/CaseWorkspaceLayout.jsx';

export default function CaseOverviewPage() {
  return <CaseWorkspaceLayout active="">{(record, progress) => {
    const date = record.incident?.occurredAt ? new Date(record.incident.occurredAt).toLocaleString() : 'Not established';
    return <>
      <p className="case-description">{record.description}</p>
      <div className="case-incident"><div className="section-label"><span>01</span> INCIDENT BRIEF</div><p>{record.incident?.summary}</p><div className="case-facts"><span><MapPin size={15} /> {record.incident?.location}</span><span><Clock3 size={15} /> {date}</span></div></div>
      <div className="case-counts"><span><Users size={17} /> {record.suspects?.length || 0} persons of interest</span><span><FileSearch2 size={17} /> {progress?.openedEvidenceIds?.length || 0} evidence reviewed</span></div>
      <div className="case-contradictions"><div className="section-label"><span>02</span> POINTS TO REVISIT</div>{record.contradictions?.length ? record.contradictions.map((item) => <article key={item.contradictionId}><b>{item.description}</b><span>See linked evidence: {item.linkedEvidenceIds.join(', ')}</span></article>) : <p>No contradictions have been added to this file.</p>}</div>
    </>;
  }}</CaseWorkspaceLayout>;
}
