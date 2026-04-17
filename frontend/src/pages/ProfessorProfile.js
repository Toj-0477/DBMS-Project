import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RatingCard from '../components/RatingCard';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ProfessorProfile() {
  const { id } = useParams();
  const { isVerified } = useAuth();

  const [professor, setProfessor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfessor() {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get(`${API_BASE}/professors/${id}`);
        setProfessor(response.data.professor);
        setRatings(response.data.ratings || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfessor();
  }, [id]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p style={{ color: '#b00020' }}>{error}</p>;
  }

  if (!professor) {
    return <p>Professor not found.</p>;
  }

  return (
    <section>
      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>
          {professor.name}
        </h1>
        <p style={{ margin: '0 0 8px', color: '#666' }}>
          {professor.department} - {professor.course}
        </p>
        <p style={{ margin: '0 0 14px', color: '#666' }}>{professor.college}</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="badge-score badge-quality">
            <div>Overall</div>
            <div>{Number(professor.avg_overall).toFixed(2)}</div>
          </div>
          <div className="badge-score badge-helpfulness">
            <div>Ratings</div>
            <div>{professor.rating_count}</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {isVerified ? (
            <Link to={`/professors/${professor.id}/rate`} className="btn btn-dark" style={{ color: '#fff' }}>
              Rate this professor
            </Link>
          ) : (
            <p style={{ margin: 0, color: '#666' }}>Verify your ID to submit a rating.</p>
          )}
        </div>
      </div>

      <h2 style={{ marginBottom: 10 }}>Anonymous Reviews</h2>
      {ratings.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {ratings.map((rating) => (
            <RatingCard key={rating.id} rating={rating} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProfessorProfile;
