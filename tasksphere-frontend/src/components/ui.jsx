import './ui.css';

/** Signature element: circular "orbit ring" used for project completion %. */
export function OrbitRing({ percent = 0, size = 56, label }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="orbit-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-sunken)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="orbit-ring__label">
        <span className="orbit-ring__value">{Math.round(clamped)}%</span>
        {label && <span className="orbit-ring__caption">{label}</span>}
      </div>
    </div>
  );
}

/** Signature element: priority shown as an ascending arc of filled dots, not a flat badge. */
const PRIORITY_LEVELS = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
const PRIORITY_COLORS = {
  LOW: 'var(--color-ink-faint)',
  MEDIUM: 'var(--color-primary)',
  HIGH: 'var(--color-amber)',
  URGENT: 'var(--color-danger)',
};

export function PriorityArc({ priority = 'MEDIUM', showLabel = true }) {
  const level = PRIORITY_LEVELS[priority] ?? 2;
  const color = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.MEDIUM;

  return (
    <span className="priority-arc" title={priority}>
      <span className="priority-arc__dots">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="priority-arc__dot"
            style={{
              background: i <= level ? color : 'var(--color-surface-sunken)',
              transform: `translateY(${(4 - i) * 2}px)`,
            }}
          />
        ))}
      </span>
      {showLabel && <span className="priority-arc__label" style={{ color }}>{priority}</span>}
    </span>
  );
}

const STATUS_STYLES = {
  TODO: { bg: 'var(--color-surface-sunken)', fg: 'var(--color-ink-muted)' },
  IN_PROGRESS: { bg: 'var(--color-primary-tint)', fg: 'var(--color-primary-dark)' },
  IN_REVIEW: { bg: 'var(--color-amber-tint)', fg: '#8A5A0F' },
  DONE: { bg: 'var(--color-success-tint)', fg: 'var(--color-success)' },
  PLANNED: { bg: 'var(--color-surface-sunken)', fg: 'var(--color-ink-muted)' },
  IN_PROGRESS_PROJECT: { bg: 'var(--color-primary-tint)', fg: 'var(--color-primary-dark)' },
  ON_HOLD: { bg: 'var(--color-amber-tint)', fg: '#8A5A0F' },
  COMPLETED: { bg: 'var(--color-success-tint)', fg: 'var(--color-success)' },
};

export function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.TODO;
  return (
    <span
      className="status-pill"
      style={{ background: style.bg, color: style.fg }}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`ui-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...rest }) {
  return (
    <button className={`ui-button ui-button--${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}
