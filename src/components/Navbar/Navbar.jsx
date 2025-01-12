import React, { useState, useEffect } from "react";
import { Nav, Form, Button, Container, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import userIcon from "../../assets/images/user.png";
import LoginModal from "./LoginModal";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';

export const NavBar = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onUpdateActiveLink = (value) => setActiveLink(value);

  const handleShowLoginModal = () => setShowLoginModal(true);
  const handleCloseLoginModal = () => setShowLoginModal(false);

  return (
    <>
      <Navbar
      expand="lg"
      className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""}`}
      fixed="top"
    >
      <Container className="d-flex align-items-center">
        <Navbar.Brand href="/">
          <img src={logo} alt="Logo" style={{ width: "120px" }} />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto d-flex align-items-center">
            <Nav.Link href="/" className="navbar-link">Inicio</Nav.Link>
            <Nav.Link href="#categories" className="navbar-link">Categorías</Nav.Link>
            <Nav.Link href="#promotions" className="navbar-link">Promociones</Nav.Link>
            <Nav.Link href="#brands" className="navbar-link">Marcas</Nav.Link>
            <Nav.Link href="#about" className="navbar-link">Sobre Nosotros</Nav.Link>

               {/* Icono de usuario */}
               <div className="auth-links">
  <button onClick={handleShowLoginModal} className="border-0 bg-transparent">
    <AccountCircleSharpIcon
      style={{ width: "50px", height: "50px", color: "#FF8C00" }}
    />
  </button>
</div>



          </Nav>
          
          {/* Barra de búsqueda dentro de Form */}
          <Form className="d-flex align-items-center">
            <Form.Control
              type="search"
              placeholder="Buscar"
              className="search-bar me-2"
              aria-label="Buscar"
            />
            <Button variant="outline-light" className="btn-search">Buscar</Button>
          </Form>
          
          
        </Navbar.Collapse>
      </Container>
    </Navbar>

      <LoginModal show={showLoginModal} handleClose={handleCloseLoginModal} />
    </>
  );
};
