import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Analytics() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get(`${API_BASE}/analytics/teachers-ranking`);
        setRanking(response.data.ranking || []);
      } catch (_error) {
        setError('Could not load analytics');
        setRanking([]);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <section>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h1 className="page-title">Teacher Analytics</h1>
        <p className="page-subtitle">All teachers ranked by average rating, with detailed anonymous reviews.</p>
      </div>

      {loading ? <p>Loading analytics...</p> : null}
      {!loading && error ? <p style={{ color: '#b00020' }}>{error}</p> : null}
      {!loading && !error && ranking.length === 0 ? <p>No teachers found.</p> : null}

      <div style={{ display: 'grid', gap: 12 }}>
        {ranking.map((teacher) => (
          <article key={teacher.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 6px' }}>
                  #{teacher.rank} {teacher.name}
                </h3>
                <p style={{ margin: '0 0 6px', color: '#666' }}>Dept: {teacher.dept || 'NA'}</p>
                <p style={{ margin: 0, color: '#666' }}>College: {teacher.college}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{Number(teacher.avg_stars).toFixed(2)}</div>
                <div style={{ color: '#666' }}>Average Rating</div>
                <div style={{ color: '#666' }}>{teacher.rating_count} reviews</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <h4 style={{ margin: '0 0 8px' }}>Reviews</h4>

              {teacher.reviews.length === 0 ? (
                <p style={{ margin: 0, color: '#666' }}>No reviews yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {teacher.reviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        border: '1px solid #e5e5e5',
                        borderRadius: 10,
                        padding: 10,
                        background: '#fafafa'
                      }}
                    >
                      <p style={{ margin: '0 0 5px', fontWeight: 700 }}>
                        Anonymous Student • {review.stars}/5
                      </p>
                      <p style={{ margin: '0 0 5px', color: '#666' }}>
                        {review.course_code} - {review.course_name} ({review.term})
                      </p>
                      <p style={{ margin: 0 }}>{review.comment || 'No comment'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Analytics;
