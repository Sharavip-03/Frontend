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
import Swal from 'sweetalert2';
import HistorialCompras from './pages/principal/HistorialCompras.jsx';
import FacturaDetalle from './pages/principal/FacturaDetalle.jsx';
import EmpleadoRoutes from './routes/EmpleadoRoutes'

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401 || 
          (error.response.status === 500 && error.config.url.includes('/Priv/'))) {
        
        // Limpiar todo
        localStorage.removeItem('token');
        localStorage.removeItem('id');
        localStorage.removeItem('rol');
        localStorage.removeItem('isLogged');
        localStorage.removeItem('persistentAuth');
        sessionStorage.removeItem('token');
        
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          confirmButtonText: 'Entendido'
        }).then(() => {
          window.location.href = '/';
        });
      }
    }
    return Promise.reject(error);
  }
);

function App() {
// En tu App.jsx, modifica el useEffect para manejar el cierre de sesión
React.useEffect(() => {
  // Verificar autenticación al cargar la app
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    
    if (!token && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  checkAuth();

  // Limpieza al cerrar la pestaña/navegador
  const handleBeforeUnload = () => {
    // Solo limpiar si no es una sesión persistente
    if (!localStorage.getItem("persistentAuth")) {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('rol');
      localStorage.removeItem('isLogged');
      sessionStorage.removeItem('token');
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);

  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<NavbarRoutes />} />
        <Route path="/empleado/*" element={<EmpleadoRoutes />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/pago/:id_factura" element={<FormularioPago />} />
        <Route path="/producto/:id" element={<DetallesProducto />} />
        <Route path="/historial-compras" element={<HistorialCompras />} />
        <Route path="/factura/:idFactura" element={<FacturaDetalle />} />
        <Route path="/*" element={<Principal />} />
      </Routes>
    </Router>
  );
}

export default App;