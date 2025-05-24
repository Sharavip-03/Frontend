import React, { useState, useEffect } from "react";
import { Nav, Container, Navbar, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import LoginModal from "./LoginModal";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import ShoppingCartTwoToneIcon from '@mui/icons-material/ShoppingCartTwoTone';
import Perfil from "../../pages/principal/perfil";
import Carro from "../../pages/principal/carroCom";
import { SearchBar } from "../../pages/buscador/buscador.jsx";
import './nav.css'; // Asegúrate de importar el CSS

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [showShopping, setshowShopping] = useState(false);
  const isLogged = localStorage.getItem("isLogged") === "true";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); // Detecta el scroll
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShowLoginModal = () => setShowLoginModal(true);
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleClosePerfil = () => setMostrarPerfil(false);

  return (
    <>
      <Navbar
        expand="lg"
        className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""}`} // Cambia el fondo y box-shadow con scroll
        fixed="top"
      >
        <Container className="d-flex flex-column h-100">
          <div className="d-flex align-items-center w-100">
            <Navbar.Brand href="/" className="mr-4">
              <img src={logo} alt="Logo" style={{ width: "100px" }} />
            </Navbar.Brand>
            <Nav className="d-flex justify-content-start">
              <Nav.Link
                as={Link}
                to="/"
                className={`navbar-link ${scrolled ? "scrolled" : "default"}`} // Aplica la clase correcta dependiendo del scroll
              >
                Inicio
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="#categories"
                className={`navbar-link ${scrolled ? "scrolled" : "default"}`}
              >
                Categorías
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="#brands"
                className={`navbar-link ${scrolled ? "scrolled" : "default"}`}
              >
                Marcas
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="#about"
                className={`navbar-link ${scrolled ? "scrolled" : "default"}`}
              >
                Sobre Nosotros
              </Nav.Link>
            </Nav>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <div className="d-flex align-items-center ms-auto justify-content-end" style={{ width: "auto" }}>
                <div style={{ marginLeft: "20px" }}>
                  <SearchBar />
                </div>
                <div className="auth-links" style={{ marginLeft: "20px" }}>
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
                    <AccountCircleSharpIcon
                      style={{
                        width: "50px",
                        height: "50px",
                        color: scrolled ? "#FF8357" : "#fac172",
                      }}
                    />
                  </button>
                  <button onClick={() => setshowShopping(true)} className="border-0 bg-transparent">
                    <ShoppingCartTwoToneIcon
                      style={{
                        width: "50px",
                        height: "50px",
                        color: scrolled ? "#FF8357" : "#fac172",
                      }}
                    />
                  </button>
                </div>
              </div>
            </Navbar.Collapse>
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
