import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Money,
  PageIntro,
  StatusBadge,
} from '../components/UI.jsx';

export default function EarningsPage() {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    try {
      const response = await apiRequest(`/revenue/earnings?${params}`);
      setRecords(response.data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function calculateMissing() {
    setMessage('');
    try {
      const response = await apiRequest('/revenue/earnings/calculate-all', {
        method: 'POST',
      });
      setMessage(response.message);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <>
      <PageIntro
        title="Worker earnings"
        text="Review gross booking values, commission and net worker earnings."
        actions={
          <button className="primary-button compact" onClick={calculateMissing}>
            Calculate missing earnings
          </button>
        }
      />

      {message && <div className="success-message">{message}</div>}

      <div className="toolbar">
        <input
          placeholder="Search worker, service or customer"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && load()}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="settled">Settled</option>
        </select>
        <button className="secondary-button" onClick={load}>Search</button>
      </div>

      {error && <ErrorState message={error} />}
      {!records && !error && <LoadingState />}
      {records?.length === 0 && <EmptyState />}

      {records?.length > 0 && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Booking</th>
                <th>Worker</th>
                <th>Service</th>
                <th>Gross</th>
                <th>Commission</th>
                <th>Worker earning</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>#{record.booking_id}</td>
                  <td>{record.worker_name}</td>
                  <td>{record.service_name}</td>
                  <td><Money value={record.gross_amount} /></td>
                  <td>
                    <Money value={record.commission_amount} />
                    <small className="cell-note">{record.commission_rate}%</small>
                  </td>
                  <td><Money value={record.worker_earning} /></td>
                  <td><StatusBadge value={record.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
