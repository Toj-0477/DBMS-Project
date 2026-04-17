import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function VerifyID() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please choose an ID image first');
      return;
    }

    setError('');
    setResult(null);
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append('idCard', file);

      const response = await axios.post(`${API_BASE}/verification/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Verification failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ padding: 24, maxWidth: 700, margin: '20px auto' }}>
      <h1 className="page-title">Verify Student ID</h1>
      <p className="page-subtitle">
        Upload a clear image of your student ID. OCR will detect SVKM institute keywords.
      </p>

      <form className="form-grid" onSubmit={onSubmit}>
        <input
          className="input"
          type="file"
          accept="image/png,image/jpg,image/jpeg,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />

        {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Processing OCR...' : 'Upload and Verify'}
        </button>
      </form>

      {result && (
        <div className="card" style={{ marginTop: 16, padding: 14 }}>
          <p style={{ margin: '0 0 6px' }}>
            <strong>Status:</strong> {result.status}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Matched college:</strong> {result.matchedCollege || 'None'}
          </p>
        </div>
      )}
    </section>
  );
}

export default VerifyID;
