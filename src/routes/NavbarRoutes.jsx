import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminClientes from '../pages/client/client.jsx';
import Perfil from '../pages/principal/perfil';
import AdminEmpleados from '../pages/empleados/empleados.jsx';
import AdminCategorias from '../pages/categorias/cate.jsx';
import AdminProveedores from '../pages/proveedores/proov.jsx';
import PreaccesoProductos from '../pages/productos/preprod.jsx';
import AdminProductos from '../pages/productos/2/prod.jsx';
import Menu from '../components/AdminNavbar/admin';
import SearchResults from "../pages/buscador/resultados.jsx";
import AdminMarcas from '../pages/marcas/marcas.jsx';
import AdminAnimales from '../pages/animales/animales.jsx';
import AdminDescuentos from '../pages/descuentos/descuentos.jsx';
import AdminFacturas from '../pages/facturas/facturas.jsx';
import ProtectedRoute from './ProtectedRoute';
import DashboardPreview from '../pages/reportes/DashboardPreview.jsx';
import ReportesDetalles from '../pages/reportes/Reportes.jsx';

const NavbarRoutes = () => {
  return (
    <div className="admin-layout">
      <div className="admin-content">
        <Routes>
          <Route index element={<Navigate to="/" replace />} />
          <Route path="menu" element={
            <ProtectedRoute staffOnly>
              <Menu />
            </ProtectedRoute>
          } />
          <Route path="/search" element={<SearchResults />} />
          <Route path="inventario" element={
            <ProtectedRoute staffOnly>
              <PreaccesoProductos />
            </ProtectedRoute>
          } />
          <Route path="client" element={
            <ProtectedRoute staffOnly>
              <AdminClientes />
            </ProtectedRoute>
          } />
          <Route path="empleado" element={
            <ProtectedRoute adminOnly>
              <AdminEmpleados />
            </ProtectedRoute>
          } />
          <Route path="facturas" element={
            <ProtectedRoute staffOnly>
              <AdminFacturas />
            </ProtectedRoute>
          } />
          <Route path="categoria" element={
            <ProtectedRoute adminOnly>
              <AdminCategorias />
            </ProtectedRoute>
          } />
          <Route path="proveedores" element={
            <ProtectedRoute adminOnly>
              <AdminProveedores />
            </ProtectedRoute>
          } />
          <Route path="productos" element={
            <ProtectedRoute adminOnly>
              <AdminProductos />
            </ProtectedRoute>
          } />
          <Route path="productos/:id_animal" element={
            <ProtectedRoute adminOnly>
              <AdminProductos />
            </ProtectedRoute>
          } />
          <Route path="marcas" element={
            <ProtectedRoute adminOnly>
              <AdminMarcas />
            </ProtectedRoute>
          } />
          <Route path="animales" element={
            <ProtectedRoute adminOnly>
              <AdminAnimales />
            </ProtectedRoute>
          } />
          <Route path="descuentos" element={
            <ProtectedRoute adminOnly>
              <AdminDescuentos />
            </ProtectedRoute>
                } />
          <Route path="dashboard" element={
            <ProtectedRoute adminOnly>
              <DashboardPreview />
            </ProtectedRoute>
                } />
        <Route path="reportes" element={
            <ProtectedRoute adminOnly>
              <ReportesDetalles />
            </ProtectedRoute>
                } />

      
          <Route path="Perfil" element={<Perfil />} />
        </Routes>
      </div>
    </div>
  );
};

export default NavbarRoutes;