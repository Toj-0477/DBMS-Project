import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Register() {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    roll_no: '',
    year_no: '',
    sem_no: '',
    college_id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadColleges() {
      try {
        const response = await axios.get(`${API_BASE}/academic/colleges`);
        const rows = response.data.colleges || [];
        setColleges(rows);
        if (rows.length > 0) {
          setForm((prev) => ({ ...prev, college_id: String(rows[0].id) }));
        }
      } catch (_error) {
        setColleges([]);
      }
    }

    loadColleges();
  }, []);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        ...form,
        year_no: Number(form.year_no),
        sem_no: Number(form.sem_no),
        college_id: Number(form.college_id)
      });
      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ padding: 24, maxWidth: 620, margin: '20px auto' }}>
      <h1 className="page-title">Sign Up</h1>
      <p className="page-subtitle">Create student account for feedback</p>

      <form className="form-grid" onSubmit={onSubmit}>
        <input className="input" name="name" placeholder="Student Name" value={form.name} onChange={onChange} />
        <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input className="input" name="roll_no" placeholder="Roll No" value={form.roll_no} onChange={onChange} />
        <input className="input" name="year_no" type="number" min="1" max="5" placeholder="Year" value={form.year_no} onChange={onChange} />
        <input className="input" name="sem_no" type="number" min="1" max="10" placeholder="Semester" value={form.sem_no} onChange={onChange} />

        <select className="select" name="college_id" value={form.college_id} onChange={onChange}>
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.name}
            </option>
          ))}
        </select>

        <input
          className="input"
          name="password"
          type="password"
          placeholder="Set Password"
          value={form.password}
          onChange={onChange}
        />

        {error ? <p style={{ color: '#b00020', margin: 0 }}>{error}</p> : null}

        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: 14 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default Register;
