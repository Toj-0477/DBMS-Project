import TagPills from './TagPills';

function RatingCard({ rating }) {
  const created = new Date(rating.created_at);

  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div className="badge-score badge-quality">
          <div>Q</div>
          <div>{Number(rating.quality).toFixed(1)}</div>
        </div>
        <div className="badge-score badge-difficulty">
          <div>D</div>
          <div>{Number(rating.difficulty).toFixed(1)}</div>
        </div>
        <div className="badge-score badge-helpfulness">
          <div>H</div>
          <div>{Number(rating.helpfulness).toFixed(1)}</div>
        </div>
      </div>

      <p style={{ margin: '0 0 10px' }}>{rating.comment || 'No comment provided.'}</p>
      <TagPills tags={rating.tags} />
      <p style={{ margin: '10px 0 0', color: '#666', fontSize: '0.9rem' }}>
        Anonymous review - {Number(rating.overall).toFixed(2)} overall - {created.toLocaleDateString()}
      </p>
    </article>
  );
}

export default RatingCard;
