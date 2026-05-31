// @ts-nocheck
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import './App.css';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Switch } from './components/ui/Switch';
import { Avatar } from './components/ui/Avatar';
import { Header } from './components/ui/Header';
import { BottomNav } from './components/ui/BottomNav';
import { Icon } from './components/ui/Icon';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
