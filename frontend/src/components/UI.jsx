export function Money({ value }) {
  const number = Number(value || 0);
  return <>Rs. {number.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</>;
}

export function StatusBadge({ value }) {
  return <span className={`status-badge status-${value}`}>{value}</span>;
}

export function LoadingState() {
  return <div className="state-card">Loading data...</div>;
}

export function ErrorState({ message }) {
  return <div className="state-card error-state">{message}</div>;
}

export function EmptyState({ message = 'No records found.' }) {
  return <div className="state-card">{message}</div>;
}

export function PageIntro({ title, text, actions }) {
  return (
    <div className="page-intro">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
