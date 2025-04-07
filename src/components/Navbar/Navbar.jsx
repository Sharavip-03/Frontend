import React, { useState, useEffect } from "react";
import { Nav, Form, Button, Container, Navbar, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import LoginModal from "./LoginModal";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import ShoppingCartTwoToneIcon from '@mui/icons-material/ShoppingCartTwoTone';
import Perfil from "../../pages/principal/perfil"; // Importamos el componente
import Carro from "../../pages/principal/carroCom" // Importa el componente Carro
import { SearchBar } from "../../pages/buscador/buscador.jsx"; // Importa el componente de búsqueda

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [showShopping, setshowShopping] = useState(false);  // Aquí está el estado para el carrito
  const isLogged = localStorage.getItem("isLogged") === "true";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShowLoginModal = () => setShowLoginModal(true);
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleClosePerfil = () => setMostrarPerfil(false);

  return (
    <>
      {/* Navbar principal */}
      <Navbar expand="lg" className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""}`} fixed="top">
        <Container className="d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center">
            <Navbar.Brand href="/">
              <img src={logo} alt="Logo" style={{ width: "100px" }} />
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <div className="d-flex align-items-center ms-auto">
                  <SearchBar />
                </div>
                <div className="auth-links">
                <button
                  onClick={() => {
                    if (isLogged) {
                      setMostrarPerfil(true);
                    } else {
                      handleShowLoginModal();
                    }
                  }}
                  className="border-0 bg-transparent"
                >
                  <AccountCircleSharpIcon style={{ width: "50px", height: "50px", color: "#FF8357" }} />
                </button>
                <button onClick={() => setshowShopping(true)} className="border-0 bg-transparent">
                  <ShoppingCartTwoToneIcon style={{ width: "50px", height: "50px", color: "#FF8357" }} />
                </button>
              </div>
            </Navbar.Collapse>
          </div>

          {/* Navbar secundario */}
          <div className="navbar-links-container">
            <Nav className="d-flex justify-content-center w-100">
              <Nav.Link as={Link} to="/" className="navbar-link">Inicio</Nav.Link>
              <Nav.Link as={Link} to="#categories" className="navbar-link">Categorías</Nav.Link>
              <Nav.Link as={Link} to="#brands" className="navbar-link">Marcas</Nav.Link>
              <Nav.Link as={Link} to="#about" className="navbar-link">Sobre Nosotros</Nav.Link>
            </Nav>
          </div>
        </Container>
      </Navbar>

      {/* Modal del Perfil */}
      <Modal show={mostrarPerfil} onHide={handleClosePerfil} centered>
        <Modal.Header closeButton>
          <Modal.Title>Perfil de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Perfil />
        </Modal.Body>
      </Modal>

      {/* Modal de Login */}
      <LoginModal show={showLoginModal} handleClose={handleCloseLoginModal} />

      {/* Carro (Offcanvas) */}
      <Carro show={showShopping} setShow={setshowShopping} />
    </>
  );
};
