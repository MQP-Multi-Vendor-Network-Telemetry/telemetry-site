/**
 * A product's repository, named but not linked. The repos are private while we
 * build them, so a link would only reach GitHub's 404. When a repo goes public,
 * pass its URL as `href` and the chip becomes a link.
 */
import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

function LockIcon(): ReactNode {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.25" />
    </svg>
  );
}

export function SourceChip({href}: {href?: string}): ReactNode {
  if (href) {
    return (
      <Link className="tn-chip tn-chip--accent" href={href}>
        View source
      </Link>
    );
  }
  return (
    <span className="tn-chip" title="The repository is private while we build it.">
      <LockIcon />
      Source coming soon
    </span>
  );
}

/** The line under a product page's title. */
export default function Repo({name, href}: {name: string; href?: string}): ReactNode {
  return (
    <div className="tn-repo">
      <span>
        Repository <code>{name}</code>
      </span>
      <SourceChip href={href} />
    </div>
  );
}
