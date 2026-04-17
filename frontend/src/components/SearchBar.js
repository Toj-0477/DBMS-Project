import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar({ initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const onSubmit = (event) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={onSubmit} style={{ width: '100%' }}>
      <div
        className="card"
        style={{
          padding: 8,
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}
      >
        <input
          className="input"
          type="search"
          placeholder="Search professor, department, course, college"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ border: 'none', fontSize: '1rem' }}
        />
        <button className="btn btn-dark" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
