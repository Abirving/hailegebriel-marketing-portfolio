import { useState } from 'react';
import {
  ArrowRight,
  ChartNoAxesCombined,
  Code2,
  Crosshair,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { projects } from '../data.js';
import LiveWorkLink from './LiveWorkLink.jsx';
import {
  AudienceBreakdown,
  MetricSummary,
  TopPosts,
  TrafficSources,
} from './ProjectAnalytics.jsx';
import '../styles/case-studies.css';

function ComparisonVisual({ project }) {
  if (project.id === 'habesha')
    return (
      <div
        className="case-visual community-visual"
        role="img"
        aria-label="Approximately 4.4 thousand followers in a targeted tech community."
      >
        <div className="visual-header">
          <span>A TECH COMMUNITY, BUILT ORGANICALLY</span>
          <Users size={14} />
        </div>
        <div className="community-total">
          <strong>≈4.4K</strong>
          <span>
            followers
            <br />
            in a targeted tech community
          </span>
        </div>
        <div className="visual-bottom">
          <span className="mini-dot" /> Product storytelling × local tech
          utility
        </div>
      </div>
    );
  const walta = project.id === 'walta';
  return (
    <div
      className="case-visual"
      role="img"
      aria-label={
        walta
          ? 'Views: 203 thousand baseline to 84.9 million after 12 months. Shared linear scale.'
          : 'Views per spike: below 100 thousand in August 2025, approximately 900 thousand in February 2026. Baseline bar shows the 100 thousand upper bound.'
      }
    >
      <div className="visual-header">
        <span>
          {walta
            ? '12 MONTHS. ORGANICALLY.'
            : 'VIEWS PER SPIKE / AUG 2025 → FEB 2026'}
        </span>
        <ChartNoAxesCombined size={14} />
      </div>
      <div className="comparison-row">
        <span>{walta ? 'Baseline' : 'Aug ’25'}</span>
        <div className="comparison-track">
          <i
            className={`comparison-bar before ${walta ? '' : 'estimated-bar'}`}
            style={{ width: walta ? '0.2391%' : '11.111%' }}
          />
        </div>
        <strong>{walta ? '203K' : '<100K'}</strong>
      </div>
      <div className="comparison-row">
        <span>{walta ? 'Result' : 'Feb ’26'}</span>
        <div className="comparison-track">
          <i className="comparison-bar after" />
        </div>
        <strong>{walta ? '84.9M' : '≈900K'}</strong>
      </div>
      <div className="visual-bottom">
        <span className="mini-dot" />
        {walta
          ? 'Powered by hooks and short-form storytelling'
          : 'Sustained engagement through mid-2026'}
      </div>
    </div>
  );
}

export function ProjectCard({ project, onOpen }) {
  const Icon =
    project.id === 'walta'
      ? Crosshair
      : project.id === 'chenet'
        ? Truck
        : Code2;
  return (
    <article className="case-card" aria-labelledby={`case-${project.id}`}>
      <div className="project-card-top">
        <div className="project-brand">
          <span className="project-symbol">
            <Icon size={21} aria-hidden="true" />
          </span>
          <div>
            <h3 id={`case-${project.id}`}>{project.name}</h3>
            <span>{project.category}</span>
          </div>
        </div>
        <span className="project-number">/{project.number}</span>
      </div>
      <div className="case-headline-metric">
        <div>
          <strong>{project.mainMetric}</strong>
          <span>{project.mainLabel}</span>
        </div>
        <div className="case-growth">
          <span className="growth-badge">
            <TrendingUp size={13} aria-hidden="true" />
            {project.growth}
          </span>
          <small>{project.growthLabel}</small>
        </div>
      </div>
      <ComparisonVisual project={project} />
      <div className="case-card-body">
        <h4 className="case-headline">{project.headline}</h4>
        <p className="case-summary">{project.summary}</p>
        <div className="snapshot-label">
          <span className="mini-dot" />
          TIKTOK STUDIO SNAPSHOT
        </div>
        <MetricSummary project={project} />
        <TopPosts project={project} compact />
        <TrafficSources project={project} compact />
        <AudienceBreakdown project={project} compact />
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="case-actions">
        <LiveWorkLink project={project} />
        <button
          type="button"
          className="button button-case"
          onClick={() => onOpen(project)}
          aria-label={`Explore Case Study: ${project.name}`}
        >
          Explore Case Study <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default function CaseStudies({ onOpen }) {
  const [filter, setFilter] = useState('All work');
  const filters = [
    'All work',
    'Organic growth',
    'Brand awareness',
    'Audience conversion',
  ];
  const visibleProjects =
    filter === 'All work'
      ? projects
      : projects.filter((project) => project.discipline === filter);
  return (
    <section id="work" className="section-pad site-container">
      <div className="section-heading reveal">
        <div>
          <div className="eyebrow">
            <span className="section-index">01</span> SELECTED WORK
          </div>
          <h2>
            Creative thinking.
            <br />
            <span className="muted-heading">Concrete results.</span>
          </h2>
        </div>
        <p>
          Behind every metric is a strategy.
          <br /> Explore the results, then see the work.
        </p>
      </div>
      <div className="work-toolbar">
        <div
          className="filter-group"
          role="group"
          aria-label="Filter case studies"
        >
          {filters.map((item) => (
            <button
              key={item}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={filter === item ? 'selected' : ''}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="work-count" aria-live="polite">
          {String(visibleProjects.length).padStart(2, '0')} CASE{' '}
          {visibleProjects.length === 1 ? 'STUDY' : 'STUDIES'}
        </span>
      </div>
      <div className="case-grid">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={onOpen} />
        ))}
      </div>
      <p className="work-note">
        <span className="mini-dot" />
        TikTok Studio figures supplied for this portfolio. Rounded and
        approximate values retain their reported precision.
      </p>
    </section>
  );
}
