import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProfessorCard from '../components/ProfessorCard';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function useQueryString() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function SearchResults() {
  const queryParams = useQueryString();
  const q = queryParams.get('q') || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchProfessors() {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/professors`, {
          params: { q }
        });
        setItems(response.data.professors || []);
      } catch (_error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    searchProfessors();
  }, [q]);

  return (
    <section>
      <h1 className="page-title">Search Professors</h1>
      <p className="page-subtitle">Find professors by name, course, department, or college</p>
      <div style={{ marginBottom: 18 }}>
        <SearchBar initialValue={q} />
      </div>

      {loading ? (
        <p>Searching...</p>
      ) : items.length === 0 ? (
        <p>No matching professors found.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((professor) => (
            <ProfessorCard key={professor.id} professor={professor} />
          ))}
        </div>
      )}
    </section>
  );
}

export default SearchResults;
