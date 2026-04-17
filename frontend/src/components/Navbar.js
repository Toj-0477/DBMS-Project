import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, isVerified, logout } = useAuth();
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
        zIndex: 5
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <Link to="/" style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none' }}>
          IN <span style={{ color: '#ffd700' }}>|</span> Rate My Professor
        </Link>

        <nav style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <NavLink to="/search" style={{ color: '#fff' }}>
            Search
          </NavLink>
          {isAuthenticated && !isVerified && (
            <NavLink to="/verify-id" style={{ color: '#ffd700' }}>
              Verify ID
            </NavLink>
          )}
          {isAuthenticated && isVerified && (
            <NavLink to="/add-professor" style={{ color: '#fff' }}>
              Add Professor
            </NavLink>
          )}
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
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
