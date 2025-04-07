import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminClientes from '../pages/client/client.jsx';
import Perfil from '../pages/principal/perfil';
import AdminEmpleados from '../pages/empleados/empleados.jsx';
import AdminRoles from '../pages/roles/rol.jsx';
import AdminCategorias from '../pages/categorias/cate.jsx';
import AdminProveedores from '../pages/proveedores/proov.jsx';
import PreaccesoProductos from '../pages/productos/preprod.jsx';
import AdminProductos from '../pages/productos/2/prod.jsx';
import Menu from '../components/AdminNavbar/admin';
import SearchResults from "../pages/buscador/resultados.jsx";

const NavbarRoutes = () => {
  return (
    <div className="admin-layout">
      <div className="admin-content">
        <Routes>
          <Route index element={<Navigate to="/" replace />} />
          <Route path="menu" element={<Menu />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="inventario" element={<PreaccesoProductos />} />
          <Route path="client" element={<AdminClientes />} />
          <Route path="empleado" element={<AdminEmpleados />} />
          <Route path="rol" element={<AdminRoles />} />
          <Route path="categoria" element={<AdminCategorias />} />
          <Route path="proveedores" element={<AdminProveedores />} />
          <Route path="productos/:id_animal" element={<AdminProductos />} />
          <Route path="Perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="inventario" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default NavbarRoutes;