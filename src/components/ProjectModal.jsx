import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  TrendingUp,
  X,
} from 'lucide-react';
import { profile } from '../data.js';
import LiveWorkLink from './LiveWorkLink.jsx';
import {
  AudienceBreakdown,
  MetricsTable,
  TopPosts,
  TrafficSources,
} from './ProjectAnalytics.jsx';

export default function ProjectModal({ project, onClose }) {
  const dialog = useRef(null);
  const [tab, setTab] = useState('impact');
  const headingId = useId();
  const descriptionId = useId();
  const tabId = useId();

  useEffect(() => {
    const element = dialog.current;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement)
        previouslyFocused.focus({ preventScroll: true });
    };
  }, []);

  function handleTabKey(event) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 'impact'
        : event.key === 'End'
          ? 'approach'
          : tab === 'impact'
            ? 'approach'
            : 'impact';
    setTab(next);
    document.getElementById(`${tabId}-${next}`)?.focus();
  }

  return (
    <dialog
      ref={dialog}
      className="project-dialog"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <div className="dialog-shell">
        <header className="dialog-header">
          <div className="eyebrow">
            <span className="status-dot" /> CASE STUDY / {project.number}
          </div>
          <button
            className="icon-button dialog-close"
            onClick={onClose}
            aria-label="Close analytics breakdown"
            autoFocus
          >
            <X size={20} />
          </button>
        </header>
        <div className="dialog-intro">
          <span className="dialog-category">
            {project.category} <span>·</span> {project.period}
          </span>
          <h2 id={headingId}>{project.name}</h2>
          <p id={descriptionId}>{project.headline}</p>
          <div className="project-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <LiveWorkLink project={project} className="dialog-live-work" />
        <div className="dialog-hero-stat">
          <div>
            <span>{project.mainLabel}</span>
            <strong>{project.mainMetric}</strong>
          </div>
          <div>
            <span className="growth-badge">
              <TrendingUp size={14} />
              {project.growth}
            </span>
            <small>{project.growthLabel}</small>
          </div>
        </div>
        <div
          className="dialog-tabs"
          role="tablist"
          aria-label="Case study details"
          onKeyDown={handleTabKey}
        >
          {['impact', 'approach'].map((item) => (
            <button
              id={`${tabId}-${item}`}
              key={item}
              role="tab"
              aria-selected={tab === item}
              aria-controls={`${tabId}-panel-${item}`}
              tabIndex={tab === item ? 0 : -1}
              onClick={() => setTab(item)}
            >
              {item === 'impact' ? 'The impact' : 'Strategy & context'}
              {item === 'impact' && (
                <ChartNoAxesCombined size={15} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
        <div
          className="dialog-panel"
          id={`${tabId}-panel-impact`}
          role="tabpanel"
          aria-labelledby={`${tabId}-impact`}
          hidden={tab !== 'impact'}
          tabIndex={0}
        >
          <p className="dialog-summary">{project.summary}</p>
          <MetricsTable project={project} />
          <TopPosts project={project} />
          <TrafficSources project={project} />
          <AudienceBreakdown project={project} />
          <p className="metric-note">{project.note}</p>
        </div>
        <div
          className="dialog-panel"
          id={`${tabId}-panel-approach`}
          role="tabpanel"
          aria-labelledby={`${tabId}-approach`}
          hidden={tab !== 'approach'}
          tabIndex={0}
        >
          <p className="dialog-summary">{project.summary}</p>
          <div className="approach-list">
            {project.approach.map((step, index) => (
              <div key={step.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="takeaway">
            <Check size={17} aria-hidden="true" />
            <p>{project.takeaway}</p>
          </div>
        </div>
        <footer className="dialog-footer">
          <p>
            Source: client-supplied TikTok Studio figures.
            <br />
            Portfolio reference {project.sourceReference}. Approximate values
            are marked ≈.
          </p>
          <a
            href={`mailto:${profile.email}?subject=${encodeURIComponent(`Let’s discuss a project like ${project.name}`)}`}
            className="button button-primary"
          >
            Discuss a project <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </dialog>
  );
}
