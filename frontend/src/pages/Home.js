import { useEffect, useState } from 'react';
import axios from 'axios';
import ProfessorCard from '../components/ProfessorCard';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Home() {
  const { isAuthenticated } = useAuth();
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfessors() {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE}/professors`);
        setProfessors(response.data.professors || []);
      } catch (_error) {
        setError('Could not load professors');
        setProfessors([]);
      } finally {
        setLoading(false);
      }
    }

    loadProfessors();
  }, []);

  return (
    <section>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h1 className="page-title">Professor List</h1>
        <p className="page-subtitle">
          View professors with college, department and current average rating. Use GiveFeedback after login.
        </p>
      </div>

      {loading ? <p>Loading professors...</p> : null}
      {!loading && error ? <p style={{ color: '#b00020' }}>{error}</p> : null}
      {!loading && !error && professors.length === 0 ? <p>No professors found.</p> : null}

      <div style={{ display: 'grid', gap: 12 }}>
        {professors.map((professor) => (
          <ProfessorCard key={professor.id} professor={professor} isAuthenticated={isAuthenticated} />
        ))}
      </div>
    </section>
  );
}

export default Home;
