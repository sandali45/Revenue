import { useState } from 'react';
import { apiRequest, saveToken } from '../api.js';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@itx.local');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveToken(response.data.token);
      onLogin();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <img src="/itx-logo.png" alt="ITX Digital Services" />
          <span>Revenue Management</span>
        </div>

        <div className="login-copy">
          <p className="eyebrow">Developer 4 Module</p>
          <h1>Revenue dashboard</h1>
          <p>
            Manage commission, worker earnings, settlements and revenue reports.
          </p>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
      <section className="login-visual" aria-hidden="true">
        <div className="visual-ring ring-one" />
        <div className="visual-ring ring-two" />
        <div className="visual-card">
          <span>Platform revenue</span>
          <strong>Commission → Earnings → Settlement</strong>
        </div>
      </section>
    </main>
  );
}
