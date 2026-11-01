import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, Fingerprint, ScanSearch, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import SectionLabel from '../components/common/SectionLabel.jsx';

const steps = [
  { number: '01', title: 'Bring the story', copy: 'Start with a hunch, a half-remembered scene, or a story that has been waiting to be told.' },
  { number: '02', title: 'Follow the evidence', copy: 'Interrogate the details. Read between the lines. Every clue has a place in the bigger picture.' },
  { number: '03', title: 'Name your suspect', copy: 'Build your case, make your accusation, and uncover what really happened.' },
];
const features = [
  { icon: Fingerprint, title: 'A case made for you', copy: 'No two investigations are alike. Your story sets every case in motion.' },
  { icon: ScanSearch, title: 'Details worth chasing', copy: 'Messages, records, timelines, and the small inconsistencies that change everything.' },
  { icon: Bookmark, title: 'Your own caseboard', copy: 'Keep track of the people, pieces, and questions that matter to your investigation.' },
];

export default function LandingPage() {
  return <main className="landing-page">
    <div className="hero-shell">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> YOUR NEXT CASE STARTS HERE</div>
          <h1>Every Story<br />Has a <em>Secret.</em><br /><span>Find It.</span></h1>
          <p className="hero-description">Bring us a story. We’ll give you a mystery worth losing yourself in. Every detail is a clue. Every suspect has something to hide.</p>
          <div className="hero-actions"><Link className="button button-primary" to="/create">Start an investigation <ArrowRight size={17} /></Link><a className="text-link" href="#how-it-works">See how it works <ArrowDown size={14} /></a></div>
          <div className="hero-note"><Sparkles size={14} /><span>Built from your imagination. Solved by your instincts.</span></div>
        </div>
        <div className="hero-art" role="img" aria-label="A detective's desk with a pinned case file">
          <div className="art-grid" /><div className="desk-glow" />
          <div className="case-paper paper-back"><span>PERSON OF INTEREST</span><i /></div>
          <div className="case-paper paper-main"><div className="paper-top"><span>CASE FILE <b>№ 0471</b></span><span className="stamp">UNSOLVED</span></div><div className="paper-line short" /><div className="paper-line" /><div className="paper-photo"><div className="photo-silhouette" /><span>SCENE / 11:42 PM</span></div><div className="paper-line" /><div className="paper-line mid" /><div className="paper-foot"><span>3 SUSPECTS</span><span>6 EVIDENCE ITEMS</span></div></div>
          <div className="red-string string-one" /><div className="red-string string-two" /><div className="pin pin-one" /><div className="pin pin-two" />
          <div className="photo-card"><div className="photo-face" /><span>WITNESS 02</span></div>
          <div className="evidence-tag"><span className="tag-dot" /> EVIDENCE LOG <b>03 / 08</b></div>
          <span className="art-caption">FIG. 01 — THE ROOM BEFORE THE REVEAL</span>
        </div>
        <div className="hero-index"><span>01</span><i /> A NEW KIND OF MYSTERY</div>
      </section>
      <div className="hero-bottom"><span>FICTIONAL CASES. REAL DEDUCTIVE WORK.</span><span>SCROLL TO INVESTIGATE ↓</span></div>
    </div>

    <section className="intro section-wrap" id="how-it-works">
      <SectionLabel number="01">THE INVESTIGATION</SectionLabel>
      <div className="intro-heading"><h2>Your story is<br />the <em>starting point.</em></h2><p>A quiet town. A missing heirloom. A message sent at the wrong hour. Give us the beginning — then follow the trail wherever it leads.</p></div>
      <div className="steps-grid">{steps.map((step) => <article className="step-card" key={step.number}><span className="step-number">{step.number}</span><div className="step-rule" /><h3>{step.title}</h3><p>{step.copy}</p><ArrowUpRight className="step-arrow" size={17} /></article>)}</div>
    </section>

    <section className="experience section-wrap" id="features">
      <div className="experience-heading"><div><SectionLabel number="02">INSIDE THE CASE</SectionLabel><h2>Nothing is<br />just <em>decoration.</em></h2></div><p>Every person, document, and timestamp belongs to a larger story. Pay attention to what is there — and what isn’t.</p></div>
      <div className="feature-grid">{features.map(({ icon: Icon, title, copy }, index) => <article className="feature-card" key={title}><div className="feature-top"><span>FIELD NOTE / 0{index + 1}</span><Icon size={19} /></div><h3>{title}</h3><p>{copy}</p><div className="feature-ghost">0{index + 1}</div></article>)}</div>
    </section>

    <section className="sample section-wrap">
      <SectionLabel number="03">A GLIMPSE AT THE FILE</SectionLabel>
      <div className="sample-card"><div className="sample-top"><span>ACTIVE INVESTIGATION</span><span className="status-pill"><i /> OPEN CASE</span></div><div className="sample-main"><div><div className="sample-id">CASE № 0471 <span>·</span> GENERAL MYSTERY</div><h2>The Last<br /><em>Light at Bellweather</em></h2><p>At 11:42 PM, every light in Bellweather House went dark. When they came back, the one thing everyone came to see was gone.</p></div><div className="sample-stats"><div><b>04</b><span>PERSONS OF INTEREST</span></div><div><b>08</b><span>PIECES OF EVIDENCE</span></div><div><b>01</b><span>TRUTH TO UNCOVER</span></div></div></div><div className="sample-bottom"><span>FICTIONAL PREVIEW — YOUR CASE WILL BE YOUR OWN</span><Link to="/create">Open a new case <ArrowRight size={15} /></Link></div></div>
    </section>

    <section className="closing section-wrap"><span className="closing-mark"><ScanSearch size={18} /></span><p>Somewhere in the details, it’s already there.</p><h2>Ready to look<br /><em>closer?</em></h2><Link className="button button-primary" to="/create">Start an investigation <ArrowRight size={17} /></Link></section>
    <footer className="site-footer"><Link className="brand" to="/"><span className="brand-mark"><ScanSearch size={17} /></span><span>AI <b>MYSTERY ROOM</b></span></Link><span>FICTIONAL MYSTERIES. YOUR DEDUCTION.</span><span>© 2026 AI MYSTERY ROOM</span></footer>
  </main>;
}
