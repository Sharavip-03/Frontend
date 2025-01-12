import React from "react";
import "./principal.css"; // Asegúrate de que los archivos CSS estén en la carpeta correcta.
import "./img.css"; // Asegúrate de que el archivo img.css esté en la carpeta correcta.

import logo from "../assets/images/logo.png";
import productos from "../assets/images/productos.png";
import clientes from "../assets/images/clientes.png";
import empleados from "../assets/images/empleo.png";
import factura from "../assets/images/factura.png";
import salir from "../assets/images/salir.png";
import user from "../assets/images/user.png";

const Inventario = () => {
  return (
    <div className="container-fluid d-flex">
      <nav className="navbar navbar-expand-lg navbar-light inventariomenu">
        <a className="navbar-brand mx-auto" href="../principal/inventario.html">
          <img src={logo} className="imgmenu" alt="Logo" style={{ maxWidth: "100px" }} />
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
              <a className="nav-link" href="../inventary/productos.html">
                <img className="imginv" src={productos} alt="Productos" />
                Productos
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="../inventary/clientes.html">
                <img className="imginv" src={clientes} alt="Clientes" />
                Clientes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="../inventary/empleados.html">
                <img className="imginv" src={empleados} alt="Empleados" />
                Empleados
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="../inventary/facturas.html">
                <img className="imginv" src={factura} alt="Facturas" />
                Facturas
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <img className="imginv" src={salir} alt="Salir" />
                Salir
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <div className="inventario flex-grow-1">
        <h1>Empleados</h1>
        <img className="../../assets/images/empleao.png" src={empleados} alt="Empleados" />
        <img className="../../assets/images/empleao.png" src={user} alt="Usuario" />
      </div>
    </div>
  );
};

export default Inventario;
