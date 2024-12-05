import React from 'react';
import { Route, Routes } from 'react-router-dom';

import InicioSesion from '../pages/Inicio/inicio';
import Registro from '../pages/registro/registro';

const NavbarRoutes = () => {
  return (
    <Routes>
      <Route path="/inicio" element={<InicioSesion />} />
      <Route path="/registro" element={<Registro />} />
    </Routes>
  );
};

export default NavbarRoutes;
