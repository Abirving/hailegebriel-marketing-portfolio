import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Crosshair,
  Globe2,
  Mail,
  Menu,
  Phone,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import { profile } from './data.js';
import WireframeGlobe from './components/WireframeGlobe.jsx';
import ProjectModal from './components/ProjectModal.jsx';
import ContactForm from './components/ContactForm.jsx';
import CaseStudies from './components/CaseStudies.jsx';
import Capabilities from './components/Capabilities.jsx';
import Methodology from './components/Methodology.jsx';

const navigation = [
  { id: 'work', label: 'Selected work' },
  { id: 'about', label: 'About' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'methodology', label: 'Methodology' },
];

function Mark({ compact = false }) {
  return (
    <span
      className={`brand-mark ${compact ? 'compact' : ''}`}
      aria-hidden="true"
    >
      hs<span>.</span>
    </span>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const sections = [...document.querySelectorAll('main section[id]')];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    const media = window.matchMedia('(min-width: 960px)');
    const closeAtDesktop = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener('change', closeAtDesktop);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', closeAtDesktop);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        document.getElementById('mobile-menu-toggle')?.focus();
      }
      if (event.type === 'pointerdown' && !event.target.closest('.site-header'))
        setOpen(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', close);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('pointerdown', close);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-container nav-inner">
        <a
          className="brand"
          href="#home"
          aria-label="Hailegebriel Samuel, back to top"
          onClick={() => setOpen(false)}
        >
          <Mark />
          <span className="brand-name">
            Hailegebriel Samuel
            <span>Digital Marketer & Content Strategist</span>
          </span>
        </a>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={active === item.id ? 'active' : ''}
              aria-current={active === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="nav-contact">
          Let’s talk <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        <button
          id="mobile-menu-toggle"
          className="icon-button mobile-toggle"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mobile-nav site-container"
        >
          {[...navigation, { id: 'contact', label: 'Let’s talk' }].map(
            (item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
                <ArrowUpRight size={17} />
              </a>
            ),
          )}
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="hero site-container">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow">
          <span className="status-dot" /> STRATEGY. STORYTELLING. SCALE.
        </div>
        <h1>
          Good content.
          <br />
          Real{' '}
          <span className="accent-word">
            growth<span className="heading-dot">.</span>
          </span>
        </h1>
        <p className="hero-intro">
          I’m <strong>Hailegebriel Samuel.</strong>
          <br />I turn brand goals into digital momentum.
        </p>
        <p className="hero-description">
          A results-driven digital marketer & content strategist.
          <br className="hidden sm:block" /> Creative at heart. Analytical by
          approach.
        </p>
        <div className="hero-actions">
          <a href="#work" className="button button-primary">
            Explore my work <ArrowDownRight size={18} aria-hidden="true" />
          </a>
          <a href="#contact" className="button button-text">
            Let’s connect <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="hero-footnote">
          <span className="footnote-line" /> Organic strategies. Measurable
          impact.
        </div>
      </div>
      <div className="hero-art">
        <div className="art-coordinate top-coordinate" aria-hidden="true">
          01 / CONNECTING THE DOTS
        </div>
        <WireframeGlobe />
        <div className="globe-label label-top">
          <span className="tiny-icon">
            <TrendingUp size={16} aria-hidden="true" />
          </span>
          <div>
            <strong>84.9M</strong>
            <span>video views · WALTA GPS</span>
          </div>
          <ArrowUpRight
            size={15}
            className="text-emerald-300"
            aria-hidden="true"
          />
        </div>
        <div className="globe-label label-bottom">
          <span className="live-indicator" />
          <span>Creativity, connected to results.</span>
        </div>
        <span className="art-cross cross-one" aria-hidden="true">
          +
        </span>
        <span className="art-cross cross-two" aria-hidden="true">
          +
        </span>
        <div className="art-coordinate bottom-coordinate" aria-hidden="true">
          CONTENT → CONNECTION → GROWTH
        </div>
      </div>
      <a href="#work" className="hero-scroll">
        <ArrowDown size={15} aria-hidden="true" /> SCROLL TO EXPLORE
      </a>
    </section>
  );
}

function CredibilityStrip() {
  return (
    <div className="credibility-strip site-container reveal">
      <div className="experience-stat">
        <strong>
          1.5<span>years</span>
        </strong>
        <span>
          of hands-on digital
          <br /> marketing experience
        </span>
      </div>
      <div className="collaborations">
        <span className="eyebrow">EXPERIENCE ACROSS BRANDS</span>
        <div className="client-logos">
          <span>
            <Crosshair size={21} aria-hidden="true" />
            WALTA<span className="logo-suffix">GPS</span>
          </span>
          <span>
            <Truck size={23} aria-hidden="true" />
            CHENET<span className="logo-suffix">P.L.C</span>
          </span>
          <span>
            <Code2 size={23} aria-hidden="true" />
            HABESHA<span className="logo-suffix">BYTES</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="about-section section-pad site-container">
      <div className="about-intro reveal">
        <div className="eyebrow">
          <span className="section-index">02</span> THE PERSON BEHIND THE
          STRATEGY
        </div>
        <h2>
          A storyteller’s instinct.
          <br />
          <span className="muted-heading">A strategist’s mindset.</span>
        </h2>
        <div className="about-signature">
          <Mark compact />
          <span>
            Hailegebriel Samuel
            <small>Digital Marketer & Content Strategist</small>
          </span>
          <ArrowDownRight size={26} aria-hidden="true" />
        </div>
      </div>
      <div className="about-copy reveal" style={{ '--reveal-delay': '90ms' }}>
        <p className="about-lead">
          I connect what a brand wants to say with what its audience wants to
          hear.
        </p>
        <p>{profile.bio}</p>
        <p>
          With 1.5 years of hands-on experience across logistics, tech, fashion,
          and media, I bring a practical perspective to organic campaigns: make
          it relevant, measure the response, and keep improving.
        </p>
        <div className="industries">
          <span>SECTORS I’VE WORKED ACROSS</span>
          <div>
            {['Logistics', 'Technology', 'Fashion', 'Media'].map((industry) => (
              <span key={industry}>{industry}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Brand glyphs. Lucide dropped brand logos, so these two are inlined. */
function TelegramMark({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function LinkedInMark({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="contact-section section-pad site-container"
    >
      <div className="contact-copy reveal">
        <div className="eyebrow">
          <span className="section-index">05</span> THE NEXT GOOD IDEA STARTS
          HERE
        </div>
        <h2>
          Let’s make
          <br />
          an <span className="accent-word">impact.</span>
        </h2>
        <p>
          Have a brand to grow or a story to tell?
          <br />
          I’d love to hear what you have in mind.
        </p>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`}>
            <Mail size={18} aria-hidden="true" />
            <span>{profile.email}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a href={`tel:${profile.phone}`}>
            <Phone size={18} aria-hidden="true" />
            <span>{profile.displayPhone}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a
            href={profile.telegram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TelegramMark />
            <span>Telegram</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInMark />
            <span>LinkedIn</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
         
        </div>
      </div>
      <ContactForm />
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer site-container reveal">
      <a href="#home" className="footer-brand" aria-label="Back to top">
        <Mark compact />
        <span>Thoughtful strategy. Meaningful growth.</span>
      </a>
      <p>© {new Date().getFullYear()} Hailegebriel Samuel</p>
      <a href="#home" className="back-top">
        Back to top <ArrowUpRight size={15} aria-hidden="true" />
      </a>
    </footer>
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  // Reveals each .reveal element once, when it first enters the viewport.
  useEffect(() => {
    const targets = [...document.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-revealed'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <CredibilityStrip />
        <CaseStudies onOpen={setSelectedProject} />
        <About />
        <Capabilities />
        <Methodology />
        <Contact />
      </main>
      <Footer />
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
