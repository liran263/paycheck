import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <div className="flex min-h-screen items-center justify-center bg-gray-100 text-3xl font-bold">
            Welcome to PayCheck Dashboard
            {/* Temporary verification view */}
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
