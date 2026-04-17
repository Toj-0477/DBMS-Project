import { Link } from 'react-router-dom';

function ProfessorCard({ professor, isAuthenticated }) {
  return (
    <article className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 6px' }}>{professor.name}</h3>
          <p style={{ margin: '0 0 6px', color: '#666' }}>Dept: {professor.dept || 'NA'}</p>
          <p style={{ margin: '0 0 6px', color: '#666' }}>College: {professor.college}</p>
          <p style={{ margin: 0, color: '#666' }}>Courses: {professor.courses || 'NA'}</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{Number(professor.avg_stars).toFixed(2)}</div>
          <div style={{ color: '#666' }}>Current Avg Rating</div>
          <div style={{ color: '#666' }}>{professor.rating_count} reviews</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {isAuthenticated ? (
          <Link to={`/feedback/${professor.id}`} className="btn btn-dark" style={{ color: '#fff' }}>
            GiveFeedback
          </Link>
        ) : (
          <button type="button" className="btn" disabled title="Login required" style={{ opacity: 0.6 }}>
            GiveFeedback (Login required)
          </button>
        )}
      </div>
    </article>
  );
}

export default ProfessorCard;
