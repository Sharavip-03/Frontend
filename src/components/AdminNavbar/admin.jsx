import React from "react";
import { Link } from "react-router-dom"; // Asegúrate de usar Link para navegación interna
import './admin.css';

// Importa las imágenes
import logo from '../../assets/images/logo.png';
import productos from '../../assets/images/productos.png';
import clientes from '../../assets/images/clientes.png';
import empleo from '../../assets/images/empleo.png';
import factura from '../../assets/images/factura.png';
import salir from '../../assets/images/salir.png';

const Menu = () => {
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
              <Link className="nav-link" to="#">
                <img className="imginv" src={productos} alt="Productos" />Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/client">
                <img className="imginv" src={clientes} alt="Clientes" />Clientes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">
                <img className="imginv" src={empleo} alt="Empleados" />Empleados
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">
                <img className="imginv" src={factura} alt="Facturas" />Facturas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">
                <img className="imginv" src={salir} alt="Salir" />Salir
              </Link>
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
