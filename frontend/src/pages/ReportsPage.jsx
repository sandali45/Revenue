import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api.js';
import { ErrorState, LoadingState, Money, PageIntro } from '../components/UI.jsx';

export default function ReportsPage() {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/revenue/reports/monthly')
      .then((response) => setRecords(response.data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const maximum = useMemo(() => {
    return Math.max(...(records || []).map((record) => Number(record.platform_revenue)), 1);
  }, [records]);

  if (error) return <ErrorState message={error} />;
  if (!records) return <LoadingState />;

  return (
    <>
      <PageIntro
        title="Monthly report"
        text="Revenue results for the latest six months."
      />

      <article className="content-card chart-card">
        <h3>Platform commission trend</h3>
        <div className="bar-chart">
          {records.map((record) => (
            <div className="bar-column" key={record.month}>
              <span className="bar-value">Rs. {Number(record.platform_revenue).toLocaleString()}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${Math.max(4, Number(record.platform_revenue) / maximum * 100)}%`,
                  }}
                />
              </div>
              <span className="bar-label">{record.month}</span>
            </div>
          ))}
        </div>
      </article>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Completed jobs</th>
              <th>Booking value</th>
              <th>Platform revenue</th>
              <th>Worker earnings</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.month}>
                <td>{record.month}</td>
                <td>{record.completed_jobs}</td>
                <td><Money value={record.booking_value} /></td>
                <td><Money value={record.platform_revenue} /></td>
                <td><Money value={record.worker_earnings} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
