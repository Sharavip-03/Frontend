import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavbarRoutes from './routes/NavbarRoutes';
import Principal from './pages/principal/principal';
import SearchResults from "./pages/buscador/resultados.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import FormularioPago from './components/PasarelaPago/formulario.jsx';
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      window.location.href = '/'; //
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
        <Route path="/*" element={<Principal />} />
      </Routes>
    </Router>
  );
}

export default App;