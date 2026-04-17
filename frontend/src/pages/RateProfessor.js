import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function RateProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [professor, setProfessor] = useState(null);
  const [teaches, setTeaches] = useState([]);
  const [selection, setSelection] = useState('');
  const [term, setTerm] = useState('2026-SEM2');
  const [stars, setStars] = useState(4);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfessor() {
      try {
        const response = await axios.get(`${API_BASE}/professors/${id}`);
        setProfessor(response.data.professor);
        setTeaches(response.data.teaches || []);

        if ((response.data.teaches || []).length > 0) {
          const first = response.data.teaches[0];
          setSelection(String(first.course_id));
        }
      } catch (_error) {
        setError('Could not load professor details');
      }
    }

    loadProfessor();
  }, [id]);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }

    if (!selection || !term.trim()) {
      setError('Please select a course and enter a term');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await axios.post(
        `${API_BASE}/ratings`,
        {
          professor_id: Number(id),
          course_id: Number(selection),
          term: term.trim(),
          stars: Number(stars),
          comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="card" style={{ padding: 24, maxWidth: 650, margin: '20px auto' }}>
        <h1 className="page-title">Give Feedback</h1>
        <p>You need to login before submitting feedback.</p>
        <Link to="/login" className="btn btn-dark" style={{ color: '#fff' }}>
          Go to Login
        </Link>
      </section>
    );
  }

  return (
    <section className="card" style={{ padding: 24, maxWidth: 760, margin: '20px auto' }}>
      <h1 className="page-title">Give Feedback</h1>
      <p className="page-subtitle">{professor ? `Professor: ${professor.name}` : 'Loading...'}</p>

      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Course
          <select className="select" value={selection} onChange={(event) => setSelection(event.target.value)}>
            {teaches.map((item) => (
              <option key={item.course_id} value={item.course_id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Term
          <input className="input" type="text" value={term} onChange={(e) => setTerm(e.target.value)} required />
        </label>

        <label>
          Stars: {stars}
          <input
            className="input"
            type="range"
            min="1"
            max="5"
            value={stars}
            onChange={(event) => setStars(event.target.value)}
          />
        </label>

        <textarea
          className="textarea"
          rows="4"
          placeholder="Write a short review"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />

        {error ? <p style={{ color: '#b00020', margin: 0 }}>{error}</p> : null}

        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </section>
  );
}

export default RateProfessor;
