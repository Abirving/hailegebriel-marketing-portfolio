import { ArrowUpRight } from 'lucide-react';

export default function LiveWorkLink({ project, className = '' }) {
  return (
    <a
      className={`button button-live ${className}`}
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View Live Work for ${project.name} (opens in a new tab)`}
      data-live-work={project.id}
    >
      View Live Work <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
