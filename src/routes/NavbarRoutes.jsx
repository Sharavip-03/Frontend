import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Menu from '../components/AdminNavbar/admin';
import AdminClientes from '../pages/client/client.jsx';
import Perfil from '../pages/principal/perfil';
import AdminEmpleados from '../pages/empleados/empleados.jsx';
import AdminRoles from '../pages/roles/rol.jsx';
import AdminCategorias from '../pages/categorias/cate.jsx';
import AdminProveedores from '../pages/proveedores/proov.jsx';
import PreaccesoProductos from '../pages/productos/preprod.jsx';
import ProductosCrud from '../pages/productos/2/prod.jsx';



const NavbarRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Menu />} /> {/* Para /admin */}
      <Route path="client" element={<AdminClientes />} /> {/* Para /admin/client */}
      <Route path = "empleado" element={<AdminEmpleados />} />
      <Route path = "rol" element={<AdminRoles />} />
      <Route path = "categoria" element={<AdminCategorias />} />
      <Route path = "proveedores" element={<AdminProveedores />} />
      <Route path="preproduct" element={<PreaccesoProductos />} />
      <Route path="productos/:id_animal" element={<ProductosCrud />} />
      <Route path="/Perfil" element={<Perfil />} /> 
    </Routes>
  );
};

export default NavbarRoutes;
