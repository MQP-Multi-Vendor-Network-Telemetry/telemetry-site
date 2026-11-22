/**
 * The two paths through the system. Every message takes the first, and there
 * is no LLM on it. Only a schema the pipeline hasn't seen takes the second, and
 * only once. Drawn in HTML rather than as an image so it reflows on a phone.
 */
import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type Step = {title: string; detail: string; accent?: boolean};

const EVERY_MESSAGE: Step[] = [
  {title: 'Switches', detail: 'any vendor'},
  {title: 'Pipeline', detail: 'collects and translates to OpenConfig', accent: true},
  {title: 'Broker', detail: 'one shared schema'},
  {title: 'Subscribers', detail: 'the platform, or any other program'},
];

const ONCE_PER_SCHEMA: Step[] = [
  {title: 'New schema', detail: 'records no mapping covers wait'},
  {title: 'Mapping LLM', detail: 'proposes a mapping', accent: true},
  {title: 'A person', detail: 'reviews and approves it'},
  {title: 'Lookup', detail: 'waiting records replay, and the LLM is done'},
];

function Row({label, note, steps, dashed}: {label: string; note: string; steps: Step[]; dashed?: boolean}): ReactNode {
  return (
    <div className={styles.row}>
      <div className={styles.label}>
        <span className={styles.labelTitle}>{label}</span>
        <span className={styles.labelNote}>{note}</span>
      </div>
      <ol className={styles.steps}>
        {steps.map((step) => (
          <li
            key={step.title}
            className={clsx(styles.step, step.accent && styles.accent, dashed && styles.dashed)}>
            <span className={styles.stepTitle}>{step.title}</span>
            <span className={styles.stepDetail}>{step.detail}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Flow(): ReactNode {
  return (
    <figure className={styles.flow}>
      <Row label="Every message" note="no LLM on this path" steps={EVERY_MESSAGE} />
      <Row label="Once per new schema" note="off the hot path" steps={ONCE_PER_SCHEMA} dashed />
    </figure>
  );
}
