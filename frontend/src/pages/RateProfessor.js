import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const tags = [
  { id: 1, name: 'Gives good feedback' },
  { id: 2, name: 'Inspirational' },
  { id: 3, name: 'Lots of homework' },
  { id: 4, name: 'Accessible outside class' },
  { id: 5, name: 'Test heavy' },
  { id: 6, name: 'Tough grader' },
  { id: 7, name: 'Clear grading criteria' },
  { id: 8, name: 'Would take again' },
  { id: 9, name: 'Participation matters' },
  { id: 10, name: 'Group projects' },
  { id: 11, name: 'Lecture heavy' },
  { id: 12, name: 'Practical examples' },
  { id: 13, name: 'Chill class' },
  { id: 14, name: 'Skip if possible' },
  { id: 15, name: 'Respects students' }
];

function RateProfessor() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    quality: 3,
    difficulty: 3,
    helpfulness: 3,
    comment: '',
    tagIds: []
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const toggleTag = (tagId) => {
    setForm((prev) => {
      const hasTag = prev.tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: hasTag ? prev.tagIds.filter((idValue) => idValue !== tagId) : [...prev.tagIds, tagId]
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await axios.post(
        `${API_BASE}/ratings`,
        {
          professorId: Number(id),
          quality: form.quality,
          difficulty: form.difficulty,
          helpfulness: form.helpfulness,
          comment: form.comment,
          tagIds: form.tagIds
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/professors/${id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to submit rating');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ padding: 24, maxWidth: 760, margin: '20px auto' }}>
      <h1 className="page-title">Rate Professor</h1>
      <p className="page-subtitle">Your review is anonymous and visible to students only.</p>

      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Quality: {form.quality}
          <input className="input" type="range" min="1" max="5" name="quality" value={form.quality} onChange={onChange} />
        </label>

        <label>
          Difficulty: {form.difficulty}
          <input
            className="input"
            type="range"
            min="1"
            max="5"
            name="difficulty"
            value={form.difficulty}
            onChange={onChange}
          />
        </label>

        <label>
          Helpfulness: {form.helpfulness}
          <input
            className="input"
            type="range"
            min="1"
            max="5"
            name="helpfulness"
            value={form.helpfulness}
            onChange={onChange}
          />
        </label>

        <textarea
          className="textarea"
          rows="5"
          placeholder="Write your anonymous feedback"
          value={form.comment}
          onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
        />

        <div>
          <p style={{ marginTop: 0, marginBottom: 8, fontWeight: 600 }}>Select tags</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tags.map((tag) => {
              const selected = form.tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="btn"
                  style={{
                    background: selected ? '#111' : '#f6f6f6',
                    color: selected ? '#fff' : '#111',
                    border: selected ? '1px solid #111' : '1px solid #ddd'
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Submitting...' : 'Submit Anonymous Rating'}
        </button>
      </form>
    </section>
  );
}

export default RateProfessor;
