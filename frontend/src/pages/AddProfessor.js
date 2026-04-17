import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AddProfessor() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    department: '',
    course: '',
    college: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/professors`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/professors/${response.data.professorId}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to add professor');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ padding: 24, maxWidth: 760, margin: '20px auto' }}>
      <h1 className="page-title">Add Professor</h1>
      <p className="page-subtitle">Only verified users can publish new professor records.</p>

      <form className="form-grid" onSubmit={onSubmit}>
        <input className="input" name="name" placeholder="Professor name" value={form.name} onChange={onChange} />
        <input
          className="input"
          name="department"
          placeholder="Department"
          value={form.department}
          onChange={onChange}
        />
        <input className="input" name="course" placeholder="Course" value={form.course} onChange={onChange} />
        <input className="input" name="college" placeholder="College" value={form.college} onChange={onChange} />
        {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Add Professor'}
        </button>
      </form>
    </section>
  );
}

export default AddProfessor;
