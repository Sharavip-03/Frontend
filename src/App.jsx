import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Asegúrate de importar Routes si usas rutas
import './App.css';
import NavbarRoutes from './routes/NavbarRoutes'; // Aquí podrías definir rutas si las necesitas
import Principal from './pages/principal/principal'; // Página principal
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div>
        {/* Navbar */}
        {/* Rutas */}
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/routes" element={<NavbarRoutes />} />
          {/* Agrega más rutas según sea necesario */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
