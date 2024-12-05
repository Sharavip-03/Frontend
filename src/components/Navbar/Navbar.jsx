import { useState, useEffect } from "react";
import { Nav, Form, Button, Container, Navbar } from 'react-bootstrap';
import { Link } from "react-router-dom";
import logo from '../../assets/images/logo.png'; // Asegúrate de tener esta imagen en la ruta correcta

export const NavBar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onUpdateActiveLink = (value) => setActiveLink(value);

  return (
    <>
      <Navbar expand="lg" className="coloritos">
        <Container>
          <Navbar.Brand href="#home">
            <img src={logo} alt="Logo" style={{ width: '100px' }} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/" className="navbar-link">Inicio</Nav.Link>
              <Nav.Link href="#conocenos" className="navbar-link">Conócenos</Nav.Link>
              <Nav.Link href="#productos" className="navbar-link">Productos</Nav.Link>
              <Nav.Link href="#marcas" className="navbar-link">Marcas</Nav.Link>
            </Nav>
            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Buscar"
                className="me-2"
                aria-label="Buscar"
              />
              <Button variant="outline-success">Buscar</Button>
            </Form>
            <div className="navbar-links">
              <Link to="/Inicio" className="btn btn-primary">Iniciar sesión</Link>
              <Link to="/Registro" className="btn btn-secondary ms-2">Registrarse</Link>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Línea separadora */}
      <div className="navbar-separator"></div>
    </>

  );
};