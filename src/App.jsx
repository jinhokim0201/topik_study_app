import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';

// Pages
import Home from './pages/Home';
import DiagnosticTest from './pages/DiagnosticTest';
import Listening from './pages/Listening';
import Reading from './pages/Reading';
import MockTest from './pages/MockTest';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/diagnostic" element={<DiagnosticTest />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/mocktest" element={<MockTest />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
