import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Components from './pages/Components';
import Build from './pages/Build';
import Types from './pages/Types';
import Advanced from './pages/Advanced';
import Simulator from './pages/Simulator';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/components" element={<Components />} />
          <Route path="/build" element={<Build />} />
          <Route path="/types" element={<Types />} />
          <Route path="/advanced" element={<Advanced />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </Layout>
    </Router>
  );
}
