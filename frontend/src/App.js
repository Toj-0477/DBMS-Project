import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyID from './pages/VerifyID';
import SearchResults from './pages/SearchResults';
import ProfessorProfile from './pages/ProfessorProfile';
import AddProfessor from './pages/AddProfessor';
import RateProfessor from './pages/RateProfessor';

function App() {
  return (
    <>
      <Navbar />
      <main className="main-wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/verify-id"
            element={
              <ProtectedRoute>
                <VerifyID />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/professors/:id" element={<ProfessorProfile />} />
          <Route
            path="/add-professor"
            element={
              <ProtectedRoute requireVerified>
                <AddProfessor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professors/:id/rate"
            element={
              <ProtectedRoute requireVerified>
                <RateProfessor />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
