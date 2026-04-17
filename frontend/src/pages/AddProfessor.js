import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AddProfessor() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    dept: '',
    college_id: ''
  });
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadColleges() {
      try {
        const response = await axios.get(`${API_BASE}/academic/colleges`);
        const collegeList = response.data.colleges || [];
        setColleges(collegeList);
        if (collegeList.length > 0) {
          setForm((prev) => ({ ...prev, college_id: collegeList[0].id }));
        }
      } catch (err) {
        console.error('Failed to load colleges', err);
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
      const response = await axios.post(`${API_BASE}/professors`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/feedback/${response.data.id}`);
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
        <input className="input" name="name" placeholder="Professor name" value={form.name} onChange={onChange} required />
        <input
          className="input"
          name="dept"
          placeholder="Department"
          value={form.dept}
          onChange={onChange}
        />
        <select className="select" name="college_id" value={form.college_id} onChange={onChange} required>
          {colleges.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name} ({col.parent_group})
            </option>
          ))}
        </select>
        {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Add Professor'}
        </button>
      </form>
    </section>
  );
}

export default AddProfessor;

