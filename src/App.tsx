import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import { Dashboard } from './pages/Dashboard';
import { AddShift } from './pages/AddShift';
<<<<<<< Updated upstream
import { ShiftsList } from './pages/ShiftsList';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AddJob } from './pages/AddJob';
import { ManageJob } from './pages/ManageJob';
import { LiveShift } from './pages/LiveShift';
import { EditProfile } from './pages/EditProfile';
import { AppProvider } from './context/AppContext';
import { DataProvider, useAuth } from './context/DataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
=======
>>>>>>> Stashed changes
import './App.css';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f9f9ff] dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f9f9ff] dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
<<<<<<< Updated upstream
    <AppProvider>
      <DataProvider>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
              <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
              
              <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/add-shift" element={<AuthGuard><AddShift /></AuthGuard>} />
              <Route path="/shifts" element={<AuthGuard><ShiftsList /></AuthGuard>} />
              <Route path="/reports" element={<AuthGuard><Reports /></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
              <Route path="/add-job" element={<AuthGuard><AddJob /></AuthGuard>} />
              <Route path="/manage-job" element={<AuthGuard><ManageJob /></AuthGuard>} />
              <Route path="/now" element={<AuthGuard><LiveShift /></AuthGuard>} />
              <Route path="/edit-profile" element={<AuthGuard><EditProfile /></AuthGuard>} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </DataProvider>
    </AppProvider>
=======
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-shift" element={<AddShift />} />
      </Routes>
    </Router>
>>>>>>> Stashed changes
  );
}

export default App;
