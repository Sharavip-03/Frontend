import React, { useState } from 'react';
import './principal.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useNavigate } from 'react-router-dom'; // Para la navegación
import collarImg from '../../assets/images/collar.png';
import camaImg from '../../assets/images/camas.jpg';  
import juguetesImg from '../../assets/images/juguetes.jpg';
import huesitoImg from '../../assets/images/huesito.jpg';
import banner1 from '../../assets/images/banner-1.png';
import banner2 from '../../assets/images/banner-2.png';
import banner3 from '../../assets/images/banner-3.png'
import dog from '../../assets/images/dog.png';
import gato from '../../assets/images/kitty.png';
import animales from '../../assets/images/livestock.png'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import { NavBar } from '../..//components/Navbar/Navbar'; // Componente personalizado


const Principal = () => {
  const navigate = useNavigate();

  // Función para manejar la redirección
  const handleCategoryClick = (category) => {
    navigate(`/categorias/categorias.php?category=${encodeURIComponent(category)}`);
  };

  // Estado para controlar cada dropdown
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);

  // Funciones para manejar la apertura y cierre con el cursor
  const handleMouseEnter1 = () => setIsOpen1(true);
  const handleMouseEnter2 = () => setIsOpen2(true);
  const handleMouseEnter3 = () => setIsOpen3(true);

  const handleMouseLeave1 = () => setIsOpen1(false);
  const handleMouseLeave2 = () => setIsOpen2(false);
  const handleMouseLeave3 = () => setIsOpen3(false);

  return (
    <>
    <NavBar />
      {/* Menu Desplegable */}
      <nav className="navbar navbar-custom11">
        <div className="container-fluid d-flex justify-content-center">
          <ul className="navbar-nav d-flex flex-row justify-content-center w-100">
            {/* Dropdown Gatos */}
            <li
              className="dropdown mx-3"
              onMouseEnter={handleMouseEnter1}
              onMouseLeave={handleMouseLeave1}
            >
              <DropdownButton
                id="dropdown-basic-button1"
                title={
                  <>
                    <img src={gato} alt="Cat" />
                    Gatos
                  </>
                }
                show={isOpen1}
              >
                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              </DropdownButton>
            </li>
            {/* Dropdown Otros animales */}
            <li
              className="dropdown mx-3"
              onMouseEnter={handleMouseEnter2}
              onMouseLeave={handleMouseLeave2}
            >
              <DropdownButton
                id="dropdown-basic-button2"
                title={
                  <>
                    <img src={animales} alt="Other animals" />
                    Otros animales
                  </>
                }
                show={isOpen2}
              >
                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              </DropdownButton>
            </li>
            {/* Dropdown Perros */}
            <li
              className="dropdown mx-3"
              onMouseEnter={handleMouseEnter3}
              onMouseLeave={handleMouseLeave3}
            >
              <DropdownButton
                id="dropdown-basic-button3"
                title={
                  <>
                    <img src={dog} alt="Dog" />
                    Perros
                  </>
                }
                show={isOpen3}
              >
                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              </DropdownButton>
            </li>
          </ul>
        </div>
      </nav>
      
      <br />
      <hr />
      <br />
      
      {/* Carrousel */}
      <div className='carrocel' id="#home">
        <Carousel data-bs-theme="dark">
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={banner1}
              alt="First slide"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={banner2}
              alt="Second slide"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={banner3}
              alt="Third slide"
            />
          </Carousel.Item>
        </Carousel>
      </div>

      <br />
      <hr />
      <br />

      {/* Categorías */}
<div className="contenedor0">
  <center><h1 id='categories' className="category-title">Categorías para tus mascotas</h1></center>
  <br />
  <div className='row d-flex justify-content-center'>
    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
      <Card.Img className="card-img-top p-2" variant="top" src={camaImg} />
      <Card.Body className="p-2">
        <Card.Title>Camas</Card.Title>
        <Button variant="primary">Ver</Button> 
      </Card.Body>
    </Card>

    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
      <Card.Img className="card-img-top p-2" variant="top" src={collarImg} />
      <Card.Body className="p-2">
        <Card.Title>Accesorios</Card.Title>
        <Button variant="primary">Ver</Button>
      </Card.Body>
    </Card>

    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
      <Card.Img className="card-img-top p-2" variant="top" src={juguetesImg} />
      <Card.Body className="p-2">
        <Card.Title>Juguetes</Card.Title>
        <Button variant="primary">Ver</Button>
      </Card.Body>
    </Card>

    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
      <Card.Img className="card-img-top p-2" variant="top" src={huesitoImg} />
      <Card.Body className="p-2">
        <Card.Title>Comidas</Card.Title>
        <Button variant="primary">Ver</Button>
      </Card.Body>
    </Card>
  </div>
</div>

      <br />
      <hr />
      <br />


      {/* Marcas */}
      <div className="container my-4">
        <h2 className="text-center text-custom">Marcas</h2>
        <div id="carouselMarcas" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <div className="d-flex justify-content-between">
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 1" /></a>
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 2" /></a>
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 3" /></a>
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 4" /></a>
              </div>
            </div>
            <div className="carousel-item">
              <div className="d-flex justify-content-between">
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 5" /></a>
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 6" /></a>
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 7" /></a>
                <a href="#"><img src="https://via.placeholder.com/150" className="d-block w-100" alt="Marca 8" /></a>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselMarcas" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselMarcas" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      

      <br />
      <hr />
      <br />
{/* Productos en Promoción */}
      <div className="container my-4">
        <h2 className="text-center text-custom">Productos en Promoción</h2>
        <div className="row d-flex justify-content-center">
          <Card className="col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center">
            <Card.Img variant="top" src={collarImg} />
            <Card.Body>
              <Card.Title>Collar para Perro</Card.Title>
              <Card.Text>
                ¡Descuento del 20%! Ideal para el confort de tu mascota.
              </Card.Text>
              <Button variant="primary">Comprar</Button>
            </Card.Body>
          </Card>

          <Card className="col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center">
            <Card.Img variant="top" src={camaImg} />
            <Card.Body>
              <Card.Title>Cama de Lujo</Card.Title>
              <Card.Text>
                ¡Gran descuento! Cómoda y resistente, perfecta para tu mascota.
              </Card.Text>
              <Button variant="primary">Comprar</Button>
            </Card.Body>
          </Card>

          <Card className="col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center">
            <Card.Img variant="top" src={juguetesImg} />
            <Card.Body>
              <Card.Title>Juguete Interactivo</Card.Title>
              <Card.Text>
                ¡Oferta especial! Fomenta el ejercicio y diversión de tu mascota.
              </Card.Text>
              <Button variant="primary">Comprar</Button>
            </Card.Body>
          </Card>
        </div>
      </div>



      

      <br />
      <hr />
      <br />


      {/* Mapa interactivo */}
      <div className="container info-mapa">
  <div className="row">
    <div className="col-12 col-md-6">
      <div className="info">
        <h3>Información sobre nuestra tienda</h3>
        <p>El Escondite Animal es una tienda fundada en 2010 por la señora Paola Sánchez, quien, con una gran pasión por los animales, decidió crear un espacio dedicado a satisfacer todas las necesidades de las mascotas y sus dueños. Desde su inicio, la misión de la tienda ha sido ofrecer productos de alta calidad, asesoría experta y un servicio amable que genere confianza y bienestar. Con una amplia variedad de alimentos, accesorios, juguetes y servicios especializados, El Escondite Animal se ha consolidado como un lugar clave para los amantes de los animales, proporcionando soluciones completas y personalizadas para el cuidado de sus fieles compañeros.</p>
      </div>
    </div>
    <div className="col-12 col-md-6">
      <div className="mapa">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345092874!2d144.95565161560154!3d-37.817313979751735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6435f7b9e9e5b%3A0x87e705c12dd23655!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1633510640105!5m2!1sen!2sau"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-100"
          style={{ height: '400px', border: '0' }}
        />
      </div>
    </div>
  </div>
</div>
{/*pie de pagina */}
<footer>
  <div class="contact-text">
    <p>Contáctanos:</p><br />
  </div><br />
  <div class="social">
    <a href="https://www.facebook.com/profile.php?id=61560500792452" target="_blank" rel="noopener noreferrer">
      <div class="icon-container">
        <img src="../media/facebook.png" alt="Facebook" />
      </div>
    </a>
    <a href="https://www.instagram.com/elesconditeanimal/" target="_blank" rel="noopener noreferrer">
      <div class="icon-container">
        <img src="../media/instagram_2111463.png" alt="Instagram" />
      </div>
    </a>
    <a href="https://x.com/esconditeanimal?t=PMS2grt4TlW9i0subpZY8w&s=09" target="_blank" rel="noopener noreferrer">
      <div class="icon-container">
        <img src="../media/twitter.png" alt="Twitter" />
      </div>
    </a>
  </div><br />
  <div class="contact-text">
    <p>Email: contacto@esconditeanimal.com</p>
  </div>
</footer>





    </>
  );
};

export default Principal;
