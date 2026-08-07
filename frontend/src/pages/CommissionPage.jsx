import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import { ErrorState, LoadingState, PageIntro } from '../components/UI.jsx';

export default function CommissionPage() {
  const [rate, setRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiRequest('/revenue/settings/commission')
      .then((response) => setRate(response.data.commissionRate))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await apiRequest('/revenue/settings/commission', {
        method: 'PUT',
        body: JSON.stringify({ commissionRate: Number(rate) }),
      });
      setRate(response.data.commission_rate);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageIntro
        title="Commission setting"
        text="Set the percentage used for future completed booking calculations."
      />

      {error && <ErrorState message={error} />}
      {message && <div className="success-message">{message}</div>}

      <article className="commission-layout">
        <form className="content-card commission-form" onSubmit={save}>
          <label>
            Commission percentage
            <div className="percentage-input">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                required
              />
              <span>%</span>
            </div>
          </label>
          <button className="primary-button" type="submit">Save setting</button>
        </form>

        <article className="content-card example-card">
          <p className="eyebrow">Example</p>
          <h3>Booking: Rs. 5,000</h3>
          <div className="calculation-line">
            <span>Platform commission</span>
            <strong>Rs. {(5000 * Number(rate || 0) / 100).toFixed(2)}</strong>
          </div>
          <div className="calculation-line">
            <span>Worker earning</span>
            <strong>Rs. {(5000 - 5000 * Number(rate || 0) / 100).toFixed(2)}</strong>
          </div>
          <p className="muted">
            Existing earnings keep their original rate. The updated rate applies to future calculations.
          </p>
        </article>
      </article>
    </>
  );
}
