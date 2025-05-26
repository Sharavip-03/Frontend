import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminCategorias from '../pages/empleadoPriv/categorias/cate.jsx';
import PreaccesoProductos from '../pages/empleadoPriv/productos/preprod.jsx';
import AdminProductos from '../pages/empleadoPriv/productos/2/prod.jsx';
import MenuEmp from '../components/AdminNavbar/empleado';
import SearchResults from "../pages/buscador/resultados.jsx";
import AdminMarcas from '../pages/empleadoPriv/marcas/marcas.jsx';
import AdminAnimales from '../pages/empleadoPriv/animales/animales.jsx';
import AdminDescuentos from '../pages/empleadoPriv/descuentos/descuentos.jsx';
import ProtectedRoute from './ProtectedRoute';
import DashboardPreview from '../pages/empleadoPriv/reportes/DashboardPreview.jsx';
import ReportesDetalles from '../pages/empleadoPriv/reportes/Reportes.jsx';

const EmpleadoRoutes = () => {
  return (
    <div className="admin-layout">
      <div className="admin-content">
        <Routes>
          <Route index element={<Navigate to="/" replace />} />
          <Route path="menu" element={
            <ProtectedRoute staffOnly>
              <MenuEmp />
            </ProtectedRoute>
          } />
          <Route path="/search" element={<SearchResults />} />
          <Route path="inventario" element={
            <ProtectedRoute staffOnly>
              <PreaccesoProductos />
            </ProtectedRoute>
          } />
          <Route path="categoria" element={
            <ProtectedRoute staffOnly>
              <AdminCategorias />
            </ProtectedRoute>
          } />
          <Route path="productos" element={
            <ProtectedRoute staffOnly>
              <AdminProductos />
            </ProtectedRoute>
          } />
          <Route path="productos/:id_animal" element={
            <ProtectedRoute staffOnly>
              <AdminProductos />
            </ProtectedRoute>
          } />
          <Route path="marcas" element={
            <ProtectedRoute staffOnly>
              <AdminMarcas />
            </ProtectedRoute>
          } />
          <Route path="animales" element={
            <ProtectedRoute staffOnly>
              <AdminAnimales />
            </ProtectedRoute>
          } />
          <Route path="descuentos" element={
            <ProtectedRoute staffOnly>
              <AdminDescuentos />
            </ProtectedRoute>
                } />
          <Route path="dashboard" element={
            <ProtectedRoute staffOnly>
              <DashboardPreview />
            </ProtectedRoute>
                } />
        <Route path="reportes" element={
            <ProtectedRoute staffOnly>
              <ReportesDetalles />
            </ProtectedRoute>
                } />

        </Routes>
      </div>
    </div>
  );
};

export default EmpleadoRoutes;