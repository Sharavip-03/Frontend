import React from "react";
import { useNavigate } from "react-router-dom"; // Usamos useNavigate para redirigir
import './admin.css';

// Importa las imágenes
import logo from '../../assets/images/logo.png';
import productos from '../../assets/images/productos.png';
import clientes from '../../assets/images/clientes.png';
import empleo from '../../assets/images/empleo.png';
import factura from '../../assets/images/factura.png';
import salir from '../../assets/images/salir.png';

const Menu = () => {
  const navigate = useNavigate(); // Hook para redirigir

  // Función para manejar el clic en "Salir"
  const handleLogout = () => {
    localStorage.removeItem("token") 
    localStorage.removeItem("id");
    localStorage.removeItem("isLogged");
    navigate('/');
    navigate('/');
  }

  return (
    <div className="container-fluid d-flex">
      <nav className="navbar navbar-expand-lg navbar-light inventariomenu">
        <a className="navbar-brand mx-auto" href="/admin">
          <img src={logo} className="imgmenu" alt="Logo" style={{ maxWidth: '100px' }} />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav flex-column">
            <li className="nav-item">
              <a className="nav-link" href="/admin/rol">
                <img className="imginv" src={productos} alt="Productos" />Roles
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/client">
                <img className="imginv" src={clientes} alt="Clientes" />Clientes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/empleado">
                <img className="imginv" src={empleo} alt="Empleados" />Empleados
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/categoria">
                <img className="imginv" src={factura} alt="Facturas" />Categorias
              </a>
            </li>
            <li className="nav-item">
              {/* Usamos un div o button para manejar el evento de salir */}
              <div className="nav-link" onClick={handleLogout}>
                <img className="imginv" src={salir} alt="Salir" />Salir
              </div>
            </li>
          </ul>
        </div>
      </nav>
      <div className="inventario flex-grow-1">
        <h1>Bienvenido al Inventario</h1>
      </div>
    </div>
  );
};

export default Menu;
