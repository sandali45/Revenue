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

export default function SettlementsPage() {
  const [workers, setWorkers] = useState([]);
  const [settlements, setSettlements] = useState(null);
  const [workerId, setWorkerId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setError('');
    try {
      const [workerResponse, settlementResponse] = await Promise.all([
        apiRequest('/revenue/workers'),
        apiRequest('/revenue/settlements'),
      ]);
      setWorkers(workerResponse.data);
      setSettlements(settlementResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createSettlement() {
    setMessage('');
    setError('');
    try {
      const response = await apiRequest('/revenue/settlements', {
        method: 'POST',
        body: JSON.stringify({ workerId: Number(workerId) }),
      });
      setMessage(response.message);
      setWorkerId('');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function completeSettlement(id) {
    const referenceNo = window.prompt('Enter payment/reference number:');
    if (!referenceNo) return;

    setError('');
    try {
      const response = await apiRequest(`/revenue/settlements/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ referenceNo }),
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
        title="Settlements"
        text="Group pending worker earnings and record completed settlements."
      />

      <article className="content-card settlement-create">
        <div>
          <h3>Create settlement</h3>
          <p>Select a worker with pending earnings.</p>
        </div>
        <select value={workerId} onChange={(event) => setWorkerId(event.target.value)}>
          <option value="">Select worker</option>
          {workers
            .filter((worker) => Number(worker.pending_earnings) > 0)
            .map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.full_name} — Rs. {Number(worker.pending_earnings).toFixed(2)}
              </option>
            ))}
        </select>
        <button
          className="primary-button compact"
          disabled={!workerId}
          onClick={createSettlement}
        >
          Create
        </button>
      </article>

      {message && <div className="success-message">{message}</div>}
      {error && <ErrorState message={error} />}
      {!settlements && !error && <LoadingState />}
      {settlements?.length === 0 && <EmptyState />}

      {settlements?.length > 0 && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Worker</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((settlement) => (
                <tr key={settlement.id}>
                  <td>#{settlement.id}</td>
                  <td>{settlement.worker_name}</td>
                  <td>{settlement.earning_count}</td>
                  <td><Money value={settlement.total_amount} /></td>
                  <td><StatusBadge value={settlement.status} /></td>
                  <td>{settlement.reference_no || '—'}</td>
                  <td>
                    {settlement.status === 'pending' ? (
                      <button
                        className="table-action"
                        onClick={() => completeSettlement(settlement.id)}
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="muted">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
