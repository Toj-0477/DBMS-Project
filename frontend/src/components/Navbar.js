import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      style={{
        background: '#000',
        color: '#fff',
        padding: '14px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
          SVKM Professor Feedback
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {isAuthenticated && user ? <span style={{ color: '#ddd' }}>Hi, {user.name}</span> : null}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn" style={{ background: '#232323', color: '#fff' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Sign Up
              </Link>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
