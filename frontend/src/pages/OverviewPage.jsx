import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import { ErrorState, LoadingState, Money, PageIntro } from '../components/UI.jsx';

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/revenue/overview')
      .then((response) => setData(response.data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  const cards = [
    ['Platform revenue', <Money value={data.total_platform_revenue} />, 'Commission earned'],
    ['Worker earnings', <Money value={data.total_worker_earnings} />, 'Net worker amount'],
    ['Pending earnings', <Money value={data.pending_worker_earnings} />, 'Not added to settlement'],
    ['Settled amount', <Money value={data.settled_amount} />, 'Completed settlements'],
  ];

  return (
    <>
      <PageIntro
        title="Revenue overview"
        text="A summary of completed bookings, commission and worker payments."
      />

      <div className="metric-grid">
        {cards.map(([label, value, helper]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{helper}</small>
          </article>
        ))}
      </div>

      <div className="overview-grid">
        <article className="content-card highlight-card">
          <p className="eyebrow">Current setting</p>
          <h3>{Number(data.commission_rate || 0).toFixed(2)}%</h3>
          <p>Commission applied when a completed booking becomes an earning record.</p>
        </article>

        <article className="content-card">
          <h3>Processing summary</h3>
          <div className="mini-stats">
            <div>
              <span>Completed bookings</span>
              <strong>{data.completed_bookings}</strong>
            </div>
            <div>
              <span>Earning records</span>
              <strong>{data.earning_records}</strong>
            </div>
            <div>
              <span>Pending settlements</span>
              <strong><Money value={data.pending_settlements} /></strong>
            </div>
          </div>
        </article>
      </div>

      <article className="content-card flow-card">
        <h3>Revenue flow</h3>
        <div className="flow-line">
          <span>Completed booking</span>
          <b>→</b>
          <span>Commission</span>
          <b>→</b>
          <span>Worker earning</span>
          <b>→</b>
          <span>Settlement</span>
        </div>
      </article>
    </>
  );
}
