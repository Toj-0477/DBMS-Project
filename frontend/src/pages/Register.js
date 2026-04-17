import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const colleges = [
  'NMIMS',
  'MPSTME',
  'Mithibai College',
  'Narsee Monjee College',
  'DJSCE',
  'SVKM School of Law',
  'SVKM School of Pharmacy',
  'SVKM School of Science'
];

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: colleges[0]
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await axios.post(`${API_BASE}/auth/register`, form);
      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ padding: 24, maxWidth: 620, margin: '20px auto' }}>
      <h1 className="page-title">Create account</h1>
      <p className="page-subtitle">Join with your SVKM student credentials</p>

      <form className="form-grid" onSubmit={onSubmit}>
        <input className="input" name="name" placeholder="Full name" value={form.name} onChange={onChange} />
        <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input
          className="input"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
        />
        <select className="select" name="college" value={form.college} onChange={onChange}>
          {colleges.map((college) => (
            <option key={college} value={college}>
              {college}
            </option>
          ))}
        </select>
        {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: 14 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default Register;
