import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProjectAnalysis from './pages/ProjectAnalysis';
import FleetProposal from './pages/FleetProposal';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis" element={<ProjectAnalysis />} />
          <Route path="/proposal" element={<FleetProposal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;