import { BarChart3, Compass, Mail, Search } from 'lucide-react';
import { capabilities } from '../data.js';
import '../styles/capabilities.css';

const icons = {
  content: Compass,
  discovery: Search,
  retention: Mail,
  analytics: BarChart3,
};

export default function Capabilities() {
  return (
    <section id="capabilities" className="section-pad capabilities-section">
      <div className="site-container">
        <div className="section-heading reveal">
          <div>
            <div className="eyebrow">
              <span className="section-index">03</span> CAPABILITIES
            </div>
            <h2>
              The right ideas.
              <br />
              <span className="muted-heading">The skills to move them.</span>
            </h2>
          </div>
          <p>
            Creative craft and analytical discipline,
            <br /> working toward the same goal.
          </p>
        </div>
        <div className="capability-bento">
          {capabilities.map((capability, index) => {
            const Icon = icons[capability.id];
            return (
              <article
                className={`capability-tile capability-${capability.id} reveal`}
                key={capability.id}
                style={{ '--reveal-delay': `${index * 80}ms` }}
              >
                <div className="capability-top">
                  <span className="capability-icon">
                    <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span>0{index + 1} / CAPABILITY</span>
                </div>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
                <div className="capability-bottom">
                  <div>
                    {capability.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <Icon
                  className="capability-watermark"
                  strokeWidth={0.5}
                  aria-hidden="true"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
