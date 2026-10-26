import {
  ChartNoAxesCombined,
  Clapperboard,
  Handshake,
  Target,
} from 'lucide-react';
import { pillars } from '../data.js';

const icons = {
  strategy: Target,
  data: ChartNoAxesCombined,
  content: Clapperboard,
  client: Handshake,
};

export default function Methodology() {
  return (
    <section
      id="methodology"
      className="section-pad methodology-section site-container"
    >
      <div className="methodology-intro">
        <div className="eyebrow">
          <span className="section-index">04</span> METHODOLOGY
        </div>
        <h2>
          Intentional at every step.
          <br />
          <span className="muted-heading">Accountable at every turn.</span>
        </h2>
        <p>
          Four principles behind the work.
          <br />
          One focus: meaningful outcomes for your brand.
        </p>
      </div>
      <div className="pillars-grid">
        {pillars.map((pillar, index) => {
          const Icon = icons[pillar.id];
          return (
            <article key={pillar.id} className="pillar">
              <div className="pillar-top">
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                <span>0{index + 1}</span>
              </div>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
