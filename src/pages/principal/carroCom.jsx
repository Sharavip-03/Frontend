import { useState } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';

function Carro({ show, setShow }) {
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Tu Carrito</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {/* Aquí puedes colocar el contenido del carrito */}
        <p>Contenido del carrito...</p>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Carro;
