import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Importar BrowserRouter
import { NavBar } from './components/Navbar/Navbar';
import './App.css'; // Estilos globales
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarRoutes from './routes/NavbarRoutes';

function App() {
  return (
    <Router> {/* Aquí envolvemos toda la app con Router */}
      <NavBar />
      <div className="content">
        <NavbarRoutes /> {/* Aquí es donde se renderizan las rutas */}
      </div>
    </Router>
  );
}

export default App;
