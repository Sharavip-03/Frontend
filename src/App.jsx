import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavbarRoutes from './routes/NavbarRoutes'; 
import Principal from './pages/principal/principal'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/admin/*" element={<NavbarRoutes />} /> {/* Permite que NavbarRoutes maneje sus rutas */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
