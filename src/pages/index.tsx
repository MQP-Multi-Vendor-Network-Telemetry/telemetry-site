/**
 * The front page: the problem, our three products (one per main repo), how
 * they fit, where we are, and the team. The repos are private, so products
 * link to their pages here, never to GitHub (see components/Repo).
 */
import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Flow from '@site/src/components/Flow';
import {SourceChip} from '@site/src/components/Repo';

import styles from './index.module.css';

// The same counter, in each vendor's own words. These are the real names.
const NAMES = [
  {vendor: 'Cisco IOS XE', field: 'in-discards-64'},
  {vendor: 'Nokia SR Linux', field: 'statistics/in-discarded-packets'},
  {vendor: 'SONiC', field: 'SAI_PORT_STAT_IF_IN_DISCARDS'},
];

type Product = {
  slug: string;
  name: string;
  repo: string;
  summary: string;
  points: string[];
  icon: ReactNode;
};

const PRODUCTS: Product[] = [
  {
    slug: 'pipeline',
    name: 'Telemetry pipeline',
    repo: 'telemetry-pipeline',
    summary:
      'Collects telemetry from switches, translates it into OpenConfig and publishes it on a broker that any program on the network can subscribe to.',
    points: [
      'A small local LLM proposes the mapping for each new vendor schema',
      'A person approves it, and from then on translating is a lookup',
      'Records with no mapping yet wait, and are replayed after approval',
    ],
    icon: <path d="M3 6h5l4 6h9M3 12h9M3 18h5l4-6" />,
  },
  {
    slug: 'platform',
    name: 'Observability platform',
    repo: 'telemetry-platform',
    summary:
      'A dashboard for network operators, and one subscriber of the pipeline. It charts telemetry, keeps its history and manages the switches themselves.',
    points: [
      'Telemetry for every device and port, with history',
      'Config snapshots, drift detection, heal and restore',
      'Next: anomaly detection, and an LLM that explains what it finds',
    ],
    icon: <path d="M3 20h18M4 16l5-6 4 3 7-8" />,
  },
  {
    slug: 'sonic-lab',
    name: 'SONiC lab',
    repo: 'sonic-lab',
    summary:
      "Simulated SONiC switches on demand, with clients and traffic. They stand in for the rack of hardware we don't have.",
    points: [
      'One switch, two clients and steady traffic, from one click',
      'Reached over SSH at a management address, like a real switch',
      'Swap in real switches, and nothing else has to change',
    ],
    icon: (
      <>
        <rect x="3" y="4" width="18" height="6" rx="1.5" />
        <rect x="3" y="14" width="18" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01" />
      </>
    ),
  },
];

const STATUS = [
  {
    tone: 'good',
    label: 'Working',
    text: 'End to end on simulated SONiC switches: collection, translation, the broker, storage, the dashboard and device control.',
  },
  {
    tone: 'info',
    label: 'Testing',
    text: "The mapping LLM, on Cisco and Nokia records generated from the vendors' published YANG models, since we can't plug those switches in.",
    link: {to: '/devlog/multi-vendor-mapping-eval', label: 'Read the results'},
  },
  {
    tone: 'warn',
    label: 'Next',
    text: 'More vendors, anomaly detection and the analysis LLM.',
  },
];

// A member's card shows `headline` and a LinkedIn link only when they're set.
// Keep them in step with the same person's entry in blog/authors.yml.
type Member = {
  name: string;
  initials: string;
  headline?: string; // one line, like a LinkedIn headline
  linkedin?: string; // the full profile URL
};

const TEAM: Member[] = [
  {name: 'Nathan Cote', initials: 'NC', headline: 'AI Applications Engineering Intern @ Teradyne | BS/MS in CS @ WPI', linkedin: 'https://www.linkedin.com/in/nathanacote/'},
  {name: 'Shamit Soni', initials: 'SS'},
  {name: 'Thomas Gilbert', initials: 'TG'},
];

function SameCounter(): ReactNode {
  return (
    <figure className={styles.counter}>
      <figcaption className={styles.counterCaption}>One counter, three names</figcaption>
      <ul className={styles.counterList}>
        {NAMES.map((n) => (
          <li key={n.vendor} className={styles.counterRow}>
            <span className={styles.counterVendor}>{n.vendor}</span>
            <code className={styles.counterField}>{n.field}</code>
          </li>
        ))}
      </ul>
      <div className={styles.counterJoin}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 1v12M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        one approved mapping per vendor
      </div>
      <div className={`${styles.counterRow} ${styles.counterResult}`}>
        <span className={styles.counterVendor}>OpenConfig</span>
        <code className={styles.counterField}>in-discards</code>
      </div>
    </figure>
  );
}

function Hero(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <div>
          <p className={styles.eyebrow}>WPI Major Qualifying Project · 2026–27</p>
          <Heading as="h1" className={styles.title}>
            {siteConfig.title}
          </Heading>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <p className={styles.lead}>
            Every switch vendor reports telemetry its own way. We're building a pipeline that translates
            all of it into <Link href="https://openconfig.net/">OpenConfig</Link>, so a monitoring tool only
            has to understand one schema, and a small local LLM that helps it learn each new vendor.
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="#products">
              See the products
            </Link>
            <Link className="button button--outline button--primary button--lg" to="/devlog">
              Read the dev log
            </Link>
          </div>
          <p className={styles.wip}>
            <span className="tn-chip tn-chip--warn">
              <span className="tn-dot" />
              Work in progress
            </span>
            The code isn't public yet while we build it. We hope to be done by April 2027.
          </p>
        </div>
        <SameCounter />
      </div>
    </header>
  );
}

// `id` goes on the heading, not the section: Docusaurus checks anchors only
// on its Heading, and a heading's scroll margin clears the sticky navbar.
function SectionHead({id, eyebrow, title, children}: {id?: string; eyebrow: string; title: string; children?: ReactNode}): ReactNode {
  return (
    <div className={styles.sectionHead}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <Heading as="h2" id={id} className={styles.sectionTitle}>
        {title}
      </Heading>
      {children && <p className={styles.sectionLead}>{children}</p>}
    </div>
  );
}

function Products(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead id="products" eyebrow="Products" title="Three products, three repositories">
          Each one stands on its own. They meet only at the broker, one HTTP API and SSH to the
          devices, so any of them can be replaced without touching the others.
        </SectionHead>
        <div className={styles.productGrid}>
          {PRODUCTS.map((p) => (
            <article key={p.slug} className={styles.card}>
              <div className={styles.productHead}>
                <span className={styles.productIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    {p.icon}
                  </svg>
                </span>
                <div>
                  <Heading as="h3" className={styles.productName}>
                    <Link to={`/products/${p.slug}`}>{p.name}</Link>
                  </Heading>
                  <code className={styles.productRepo}>{p.repo}</code>
                </div>
              </div>
              <p className={styles.productSummary}>{p.summary}</p>
              <ul className={styles.points}>
                {p.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className={styles.productFoot}>
                <Link to={`/products/${p.slug}`} className={styles.more}>
                  How it works →
                </Link>
                <SourceChip />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItFits(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <SectionHead eyebrow="Design" title="The LLM is never on the hot path">
          A mapping is a small declarative file. The LLM proposes one the first time the pipeline sees a
          schema, and a person approves it. After that, translating a record is a plain lookup, so the
          model can't slow the pipeline down or make its output unpredictable.
        </SectionHead>
        <Flow />
        <Link to="/products" className={styles.more}>
          How the products fit together →
        </Link>
      </div>
    </section>
  );
}

function Status(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead eyebrow="Status" title="Where we are, November 2026" />
        <ul className={styles.statusGrid}>
          {STATUS.map((s) => (
            <li key={s.label} className={styles.card}>
              <span className={`tn-chip tn-chip--${s.tone}`}>
                <span className="tn-dot" />
                {s.label}
              </span>
              <p className={styles.statusText}>{s.text}</p>
              {s.link && (
                <Link to={s.link.to} className={styles.more}>
                  {s.link.label} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Team(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <SectionHead id="team" eyebrow="Team" title="Who's building it">
          We're seniors at Worcester Polytechnic Institute, and this is our Major Qualifying Project,
          WPI's year-long senior capstone.
        </SectionHead>
        <ul className={styles.teamGrid}>
          {TEAM.map((m) => (
            <li key={m.name} className={`${styles.card} ${styles.member}`}>
              <span className={styles.avatar} aria-hidden="true">
                {m.initials}
              </span>
              <div className={styles.memberText}>
                <span className={styles.memberName}>{m.name}</span>
                {m.headline && <span className={styles.memberHeadline}>{m.headline}</span>}
                {m.linkedin && (
                  <Link href={m.linkedin} className={styles.memberLink}>
                    LinkedIn
                    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M6 3h7v7M13 3 4 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className={styles.advisors}>
          Advised by Prof. Sakire at WPI, with industry mentorship from Microsoft.
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      description="A WPI MQP: a pipeline that translates switch telemetry from any vendor into OpenConfig, an observability platform, and a lab of simulated SONiC switches.">
      <Hero />
      <main>
        <Products />
        <HowItFits />
        <Status />
        <Team />
      </main>
    </Layout>
  );
}
