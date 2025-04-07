import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import QRPage from './pages/QRPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}