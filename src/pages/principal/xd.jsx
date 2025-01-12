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
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';



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

  // Funciones para alternar la visibilidad de cada Dropdown
  const toggleDropdown1 = () => setIsOpen1(!isOpen1);
  const toggleDropdown2 = () => setIsOpen2(!isOpen2);
  const toggleDropdown3 = () => setIsOpen3(!isOpen3);

  return (  
    <>
     {/* Menu Desplegable */}
     <nav className="navbar navbar-custom11">
        
        <div className="container-fluid d-flex justify-content-center">
          <ul className="navbar-nav d-flex flex-row justify-content-center w-100">
            {/* Dropdown Gatos */}
            <DropdownButton 
          id="dropdown-basic-button1" 
          title="Dropdown button 1" 
          show={isOpen1}  // Controla la visibilidad del Dropdown 1
          onClick={toggleDropdown1} // Alterna el estado del menú cuando se hace click
        >
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </DropdownButton>
            {/* Dropdown Otros animales */}
            <li className="dropdown mx-3">
            <DropdownButton 
          id="dropdown-basic-button2" 
          title="Dropdown button 2" 
          show={isOpen2}  // Controla la visibilidad del Dropdown 2
          onClick={toggleDropdown2} // Alterna el estado del menú cuando se hace click
        >
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </DropdownButton>
            </li>
            
            {/* Dropdown Perros */}
            <li className="dropdown mx-3">
            <DropdownButton 
          id="dropdown-basic-button3" 
          title="Dropdown button 3" 
          show={isOpen3}  // Controla la visibilidad del Dropdown 3
          onClick={toggleDropdown3} // Alterna el estado del menú cuando se hace click
        >
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </DropdownButton>
            </li>
          </ul>
        </div>
      </nav>
      
      
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

      {/* Categorías */}
      <div className="contenedor0">
        <center><h1 id='categories' className="category-title">Categorías para tus mascotas</h1></center>
        <br />
        <div className='row d-flex justify-content-center'>
          <Card className='col-6 col-sm-6 col-md-4 col-lg-3 mb-2 d-flex justify-content-center'>
            <Card.Img className="card-img-top" variant="top" src={camaImg} />
            <Card.Body>
              <Card.Title>Camas</Card.Title>
              <Button variant="primary">Ver</Button> 
            </Card.Body>
          </Card>

          <Card className='col-6 col-sm-6 col-md-4 col-lg-3 mb-2 d-flex justify-content-center'>
            <Card.Img variant="top" src={collarImg} />
            <Card.Body>
              <Card.Title>Accesorios</Card.Title>
              <Button variant="primary">Ver</Button>
            </Card.Body>
          </Card>

          <Card className='col-6 col-sm-6 col-md-4 col-lg-3 mb-2 d-flex justify-content-center'>
            <Card.Img variant="top" src={juguetesImg} />
            <Card.Body>
              <Card.Title>Juguetes</Card.Title>
              <Button variant="primary">Ver</Button>
            </Card.Body>
          </Card>

          <Card className='col-6 col-sm-6 col-md-4 col-lg-3 mb-2 d-flex justify-content-center'>
            <Card.Img variant="top" src={huesitoImg} />
            <Card.Body>
              <Card.Title>Comidas</Card.Title>
              <Button variant="primary">Ver</Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Productos en Promoción */}
      <div className="container my-4">
        <h2 className="text-center text-custom">Productos en Promoción</h2>
        <div className="row d-flex justify-content-center">
          <Card className="col-6 col-sm-6 col-md-4 col-lg-3 mb-2 d-flex justify-content-center">
            <Card.Img variant="top" src={collarImg} />
            <Card.Body>
              <Card.Title>Collar para Perro</Card.Title>
              <Card.Text>
                ¡Descuento del 20%! Ideal para el confort de tu mascota.
              </Card.Text>
              <Button variant="primary">Comprar</Button>
            </Card.Body>
          </Card>

          <Card className="col-6 col-sm-6 col-md-4 col-lg-3 mb-2 d-flex justify-content-center">
            <Card.Img variant="top" src={camaImg} />
            <Card.Body>
              <Card.Title>Cama de Lujo</Card.Title>
              <Card.Text>
                ¡Gran descuento! Cómoda y resistente, perfecta para tu mascota.
              </Card.Text>
              <Button variant="primary">Comprar</Button>
            </Card.Body>
          </Card>

          <Card className="col-6 col-sm-6 col-md-4 col-lg-3 mb-2 d-flex justify-content-center">
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

      <br /><br />
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

      {/* Mapa interactivo */}
      <div className="container info-mapa">
  <div className="row">
    <div className="col-12 col-md-6">
      <div className="info">
        <h3>Información sobre nuestra tienda</h3>
        <p>La tienda fue fundada en 2010 por la señora Paola Sánchez, con el propósito de brindar a la comunidad un lugar donde puedan encontrar todo lo que necesitan para sus mascotas.</p>
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
