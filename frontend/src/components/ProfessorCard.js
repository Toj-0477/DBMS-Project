import { Link } from 'react-router-dom';

function ProfessorCard({ professor }) {
  return (
    <article className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>{professor.name}</h3>
          <p style={{ margin: '0 0 6px', color: '#666' }}>
            {professor.department} - {professor.course}
          </p>
          <p style={{ margin: 0, color: '#666' }}>{professor.college}</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Number(professor.avg_overall).toFixed(2)}</div>
          <div style={{ color: '#666' }}>{professor.rating_count} ratings</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Link to={`/professors/${professor.id}`}>View profile</Link>
      </div>
    </article>
  );
}

export default ProfessorCard;
