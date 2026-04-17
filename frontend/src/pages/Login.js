import { useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, form);
      login(response.data.token, response.data.user);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ padding: 24, maxWidth: 520, margin: '20px auto' }}>
      <h1 className="page-title">Login</h1>
      <p className="page-subtitle">Access your student account</p>

      <form className="form-grid" onSubmit={onSubmit}>
        <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input
          className="input"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
        />
        {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: 14 }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}

export default Login;
