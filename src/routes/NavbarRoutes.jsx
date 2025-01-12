import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Menu from '../components/AdminNavbar/admin';
import AdminClientes from '../pages/client/client.jsx';

const NavbarRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/client" element={<AdminClientes />} />
      <Route path="/admin" element={<Menu />} />
    </Routes>
  );
};

export default NavbarRoutes;
