import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavbarRoutes from './routes/NavbarRoutes';
import Principal from './pages/principal/principal';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<NavbarRoutes />} />
        <Route path="/*" element={<Principal />} />
      </Routes>
    </Router>
  );
}

export default App;