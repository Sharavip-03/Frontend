import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavbarRoutes from './routes/NavbarRoutes';
import Principal from './pages/principal/principal';
import SearchResults from "./pages/buscador/resultados.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import FormularioPago from './components/PasarelaPago/formulario.jsx';
import axios from 'axios';
import DetallesProducto from './pages/buscador/productos/DetallesProducto.jsx';
// En tu archivo principal (App.jsx o similar)
import Swal from 'sweetalert2';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401 || 
          error.response.status === 500 && 
          error.config.url.includes('/Priv/')) { // Manejar errores 500 en rutas privadas
        // Token expirado o no válido
        localStorage.removeItem('token');
        localStorage.removeItem('id');
        localStorage.removeItem('rol');
        localStorage.removeItem('isLogged');
        
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          confirmButtonText: 'Entendido'
        }).then(() => {
          window.location.href = '/';
        });
        return Promise.reject(error);
      } else if (error.response.status === 403) {
        // Acceso prohibido
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permisos para realizar esta acción',
          confirmButtonText: 'Entendido'
        });
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<NavbarRoutes />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/pago/:id_factura" element={<FormularioPago />} />
        <Route path="/producto/:id" element={<DetallesProducto />} />
        <Route path="/*" element={<Principal />} />
      </Routes>
    </Router>
  );
}

export default App;