import { BarChart3, Play, Users } from 'lucide-react';

const formatPercent = (value) => `${Number(value.toFixed(1))}%`;

/** Values retain their original scale. The remainder is not redistributed. */
function Distribution({ items, label, compact = false, showRemainder = true }) {
  const remainder = Math.max(
    0,
    Number((100 - items.reduce((sum, item) => sum + item.value, 0)).toFixed(1)),
  );
  const allItems =
    remainder > 0
      ? [...items, { label: 'Unlisted / rounding', value: remainder }]
      : items;
  return (
    <div className={`distribution ${compact ? 'is-compact' : ''}`}>
      <div
        className="distribution-track"
        role="img"
        aria-label={`${label}: ${allItems.map((item) => `${item.label} ${formatPercent(item.value)}`).join(', ')}`}
      >
        {allItems.map((item, index) => (
          <span
            key={item.label}
            className={`distribution-tone-${index}`}
            style={{ width: `${item.value}%` }}
          />
        ))}
      </div>
      <dl className="distribution-legend">
        {items.map((item, index) => (
          <div key={item.label}>
            <dt>
              <i className={`distribution-tone-${index}`} aria-hidden="true" />
              {item.label}
            </dt>
            <dd>{formatPercent(item.value)}</dd>
          </div>
        ))}
      </dl>
      {showRemainder && remainder > 0 && (
        <p className="distribution-note">
          Unlisted / rounding: {formatPercent(remainder)}
        </p>
      )}
    </div>
  );
}

export function TrafficSources({ project, compact = false }) {
  if (!project.trafficSources) return null;
  return (
    <section
      className={`analytics-block traffic-sources ${compact ? 'is-compact' : ''}`}
      aria-label={`${project.name} traffic sources`}
    >
      <h4>
        <BarChart3 size={14} aria-hidden="true" />
        Traffic sources
      </h4>
      <Distribution
        items={project.trafficSources}
        label="Traffic sources"
        compact={compact}
      />
    </section>
  );
}

export function MetricSummary({ project }) {
  if (!project.cardMetrics.length) return null;
  return (
    <dl
      className="card-metric-grid"
      aria-label={`${project.name} TikTok Studio metrics`}
    >
      {project.cardMetrics.map((metric) => (
        <div key={metric.label}>
          <dt>{metric.label}</dt>
          <dd>
            {metric.value}
            <span>{metric.detail}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MetricsTable({ project }) {
  return (
    <div
      className="metrics-table-wrapper"
      tabIndex={0}
      role="region"
      aria-label={`${project.name} performance table; scroll horizontally if needed`}
    >
      <table className="metrics-table">
        <caption>TikTok Studio performance breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">Baseline</th>
            <th scope="col">Result</th>
            <th scope="col">Context</th>
          </tr>
        </thead>
        <tbody>
          {project.metrics.map((metric) => (
            <tr key={metric.label}>
              <th scope="row">{metric.label}</th>
              <td>{metric.before}</td>
              <td className="result-cell">{metric.after}</td>
              <td>{metric.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TopPosts({ project, compact = false }) {
  if (!project.posts) return null;
  return (
    <section
      className={`analytics-block top-posts ${compact ? 'is-compact' : ''}`}
      aria-label="Top performing posts"
    >
      <h4>
        <Play size={14} aria-hidden="true" />
        Top-performing posts
      </h4>
      <ol className="post-list">
        {project.posts.map((post, index) => (
          <li key={post.title}>
            <span className="post-index">0{index + 1}</span>
            <div>
              <h5>{post.title}</h5>
              <p>
                <span>
                  <strong>{post.views}</strong> views
                </span>
                <span className="post-acquisition">
                  <strong>{post.followers}</strong> net new followers
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AudienceBreakdown({ project, compact = false }) {
  if (!project.audience) return null;
  return (
    <section
      className={`analytics-block audience-breakdown ${compact ? 'is-compact' : ''}`}
      aria-label="Audience demographics"
    >
      <h4>
        <Users size={14} aria-hidden="true" />
        Audience demographics
      </h4>
      <div className="audience-group">
        <span className="distribution-label">AGE</span>
        <Distribution
          items={project.audience.age}
          label="Audience age"
          compact={compact}
        />
      </div>
      <div className="audience-group">
        <span className="distribution-label">GENDER</span>
        <Distribution
          items={project.audience.gender}
          label="Audience gender"
          compact={compact}
        />
      </div>
    </section>
  );
}
