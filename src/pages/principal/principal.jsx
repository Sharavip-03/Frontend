import React, { useState } from 'react';
import './principal.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useNavigate } from 'react-router-dom'; // Para la navegación
import banner1 from '../../assets/images/banner-1.png';
import banner2 from '../../assets/images/banner-2.png';
import banner3 from '../../assets/images/banner-3.png'
import dog from '../../assets/images/dog.png';
import gato from '../../assets/images/kitty.png';
import animales from '../../assets/images/livestock.png'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import { NavBar } from '../..//components/Navbar/Navbar'; // Componente personalizado
import Marcas from './marcas';
import SplitText from "./text";
import Accordion from 'react-bootstrap/Accordion';
import perro from "../../assets/images/perro.png";



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


  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <>
    <NavBar />
      {/* Menu Desplegable */}
      <nav className="navbar navbar-custom11">
        <div className="container-fluid">
          <ul className="navbar-nav flex-row w-100">
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
              >
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
              >
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
              >
              
              </DropdownButton>
            </li>
          </ul>
        </div>
      </nav>
      
      <br />
      <hr />
      <br />
      
      <center><Carousel>
      <Carousel.Item>
        <img src={banner1} alt="First slide" />
        <Carousel.Caption>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src={banner2} alt="First slide" />
        <Carousel.Caption>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img src={banner3} alt="First slide" />
        <Carousel.Caption>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel></center>



      <hr />

      {/* Categorías */}
      <div className="contenedor0" id="categorias">
      
  <center>
    <SplitText
      text="Categorias"
      className="text-6xl font-semibold text-center"
      delay={150}
      animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
      animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
      easing="easeOutCubic"
      threshold={0.2}
      rootMargin="-50px"
      onLetterAnimationComplete={handleAnimationComplete}
    />
  </center>
  <br />
  <div className='row d-flex justify-content-center'>
    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
    <Card.Img className="card-img-top p-2" variant="top" src="https://images.unsplash.com/photo-1512341350577-a09358311cb1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    <Card.Body className="p-2">
        <Card.Title>Camas</Card.Title>
        <Button variant="primary">Ver</Button> 
      </Card.Body>
    </Card>

    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
      <Card.Img className="card-img-top p-2" variant="top" src="https://images.unsplash.com/photo-1573739738911-d73a09ab3033?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      <Card.Body className="p-2">
        <Card.Title>Accesorios</Card.Title>
        <Button variant="primary">Ver</Button>
      </Card.Body>
    </Card>

    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
      <Card.Img className="card-img-top p-2" variant="top" src="https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGp1Z3VldGVzJTIwZGUlMjBtYXNjb3Rhc3xlbnwwfDB8MHx8fDI%3D" />
      <Card.Body className="p-2">
        <Card.Title>Juguetes</Card.Title>
        <Button variant="primary">Ver</Button>
      </Card.Body>
    </Card>

    <Card className='col-6 col-sm-6 col-md-3 col-lg-2 mb-2 d-flex justify-content-center'>
      <Card.Img className="card-img-top p-2" variant="top" src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29taWRhJTIwZGUlMjBtYXNjb3Rhc3xlbnwwfDB8MHx8fDI%3D" />
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
   <div className="container my-4" id="marcas">
      <center>
        <SplitText
          text="Marcas"
          className="text-6xl font-semibold text-center"
          delay={150}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
          onLetterAnimationComplete={handleAnimationComplete}
        />
      </center>
      <br />
      <Marcas />
    </div>



      

      <br />
      <hr />
      <br />


      {/* Mapa interactivo */}
      <div className="container info-mapa" id="nosostros">
  <div className="row">
    <div className="col-12 col-md-6">
      <div className="info">
      <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header><h3>Información sobre nuestra tienda</h3></Accordion.Header>
        <Accordion.Body>
        El Escondite Animal es una tienda fundada en 2010 por la señora Paola Sánchez, 
        quien, con una gran pasión por los animales, decidió crear un espacio dedicado a 
        satisfacer todas las necesidades de las mascotas y sus dueños. Desde su inicio, 
        la misión de la tienda ha sido ofrecer productos de alta calidad, asesoría experta y un 
        servicio amable que genere confianza y bienestar. Con una amplia variedad de alimentos, 
        accesorios, juguetes y servicios especializados, El Escondite Animal se ha consolidado como un 
        lugar clave para los amantes de los animales, proporcionando soluciones completas y 
        personalizadas para el cuidado de sus fieles compañeros.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Estamos aqui para tus mascotas</Accordion.Header>
        <Accordion.Body>
        <img 
      src={perro} 
      alt="Tienda de Mascotas" 
      style={{ width: "100%", height: "auto", borderRadius: "8px" }} 
    />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
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
  <div className="contact-text">
    <p>Contáctanos:</p>
  </div>
  <div className="social">
    <a href="https://www.facebook.com/profile.php?id=61560500792452" target="_blank" rel="noopener noreferrer">
      <div className="icon-container">
      <FacebookOutlinedIcon
      style={{ width: "50px", height: "50px", color: "#FF8357" }}/>
      </div>
    </a>
    <a href="https://www.instagram.com/elesconditeanimal/" target="_blank" rel="noopener noreferrer">
      <div className="icon-container">
      <InstagramIcon
      style={{ width: "50px", height: "50px", color: "#FF8357" }}/>
      </div>
    </a>
    <a href="https://x.com/esconditeanimal?t=PMS2grt4TlW9i0subpZY8w&s=09" target="_blank" rel="noopener noreferrer">
      <div className="icon-container">
      <XIcon
      style={{ width: "50px", height: "50px", color: "#FF8357" }}/>
      </div>
    </a>
  </div>
  <div className="contact-text">
    <p>Email: contacto@esconditeanimal.com</p>
  </div>
</footer>
    </>
  );
};

export default Principal;