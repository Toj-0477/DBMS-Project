import { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import ProfessorCard from '../components/ProfessorCard';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Home() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const response = await axios.get(`${API_BASE}/professors`);
        setProfessors(response.data.professors.slice(0, 6));
      } catch (_error) {
        setProfessors([]);
      } finally {
        setLoading(false);
      }
    }

    loadFeatured();
  }, []);

  return (
    <section>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h1 className="page-title">Find the right professor across SVKM colleges</h1>
        <p className="page-subtitle">
          Anonymous, student-driven ratings. Sign up, verify your ID, and help others choose wisely.
        </p>
        <SearchBar />
      </div>

      <h2 style={{ marginBottom: 12 }}>Top Rated Professors</h2>
      {loading ? (
        <p>Loading...</p>
      ) : professors.length === 0 ? (
        <p>No professors yet. Be the first to add one.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {professors.map((professor) => (
            <ProfessorCard key={professor.id} professor={professor} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Home;
