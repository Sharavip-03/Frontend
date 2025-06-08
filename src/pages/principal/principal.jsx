import React, { useState } from 'react';
import './principal.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useNavigate } from 'react-router-dom';
import banner1 from '../../assets/images/banner-1.png';
import banner2 from '../../assets/images/banner-2.png';
import banner3 from '../../assets/images/banner-3.png';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import { NavBar } from '../../components/Navbar/Navbar';
import Marcas from './marcas';
import SplitText from "./text";
import { useEffect } from 'react';
import axios from 'axios';
import Accordion from 'react-bootstrap/Accordion';
import perro from "../../assets/images/perro.png";
import API_BASE_URL from '../../config/apiConfig';

const Principal = () => {
  const [promoProducts, setPromoProducts] = useState([]);
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

    const handleDownloadApp = () => {
    // Mostrar alerta de agradecimiento
    Swal.fire({
      title: '¡Gracias por descargar nuestra app!',
      text: 'La descarga comenzará automáticamente.',
      icon: 'success',
      confirmButtonText: 'Entendido',
      timer: 3000,
      timerProgressBar: true
    }).then(() => {
      // Simular descarga del APK
      const apkUrl = '/ruta/a/tu/archivo.apk'; // Reemplaza con la ruta correcta a tu APK
      const link = document.createElement('a');
      link.href = apkUrl;
      link.download = 'EsconditeAnimal.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Función para manejar la redirección a categorías
  const handleCategoryClick = (categoryId, categoryName) => {
    axios.get(`${API_BASE_URL}/PrivProd`)
      .then(response => {
        const products = response.data?.productos || [];
        const filteredProducts = products.filter(p => p.id_categoria == categoryId);
        navigate('/search', { 
          state: { 
            filteredProducts,
            searchTitle: `Categoría: ${categoryName}` 
          } 
        });
      })
      .catch(error => {
        console.error("Error al obtener productos:", error);
        navigate('/search', { state: { error: "Error al cargar productos" } });
      });
  };

  // Función para manejar la redirección a marcas
  const handleBrandClick = (brandId, brandName) => {
    axios.get(`${API_BASE_URL}/PrivProd`)
      .then(response => {
        const products = response.data?.productos || [];
        const filteredProducts = products.filter(p => p.id_marca == brandId);
        navigate('/search', { 
          state: { 
            filteredProducts,
            searchTitle: `Marca: ${brandName}` 
          } 
        });
      })
      .catch(error => {
        console.error("Error al obtener productos:", error);
        navigate('/search', { state: { error: "Error al cargar productos" } });
      });
  };

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/PrivProd`);
        const allProducts = response.data?.productos || [];
        setAllProducts(allProducts);
        
        const productsWithDiscount = allProducts.filter(product => 
          product.precio_descuento && product.precio_descuento < product.precio
        );
        setPromoProducts(productsWithDiscount);
      } catch (error) {
        console.error("Error al cargar productos en promoción:", error);
      } finally {
        setLoadingPromo(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categoria`);
        setCategories(response.data?.categorias || []);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/PrivMarcas`);
        setBrands(response.data?.marcas || []);
      } catch (error) {
        console.error("Error al cargar marcas:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchPromoProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/producto/${productId}`);
  };

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <>
      <NavBar />
      <div className="hero-image"></div>
      <div className="hero-text">
        <h1>¡Bienvenido al escondite animal!</h1>
      </div>
      <div className="hero-texto">
        <h1>Más que una tienda, un hogar para los amantes de los animales</h1>
      </div>
      <nav className="navbar navbar-custom11"></nav>
      <hr />
      <br />

      <center>
        <Carousel controls={true} indicators={true} fade={true} pause={false} interval={3000}>
          <Carousel.Item><img src={banner1} alt="First slide" /></Carousel.Item>
          <Carousel.Item><img src={banner2} alt="Second slide" /></Carousel.Item>
          <Carousel.Item><img src={banner3} alt="Third slide" /></Carousel.Item>
        </Carousel>
      </center>

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
        
        {loadingCategories ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando categorías...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-muted">
            <p>No hay categorías disponibles</p>
          </div>
        ) : (
          <div className="categories-container">
            <Carousel indicators={false} interval={null}>
              {[...Array(Math.ceil(categories.length / 4))].map((_, index) => (
                <Carousel.Item key={index}>
                  <div className="row d-flex justify-content-center mx-0">
                    {categories.slice(index * 4, (index + 1) * 4).map(category => (
                      <div className="col-6 col-sm-6 col-md-3 col-lg-2 mb-4 px-2" key={category.id_categoria}>
                        <Card className="h-100 category-card" onClick={() => handleCategoryClick(category.id_categoria, category.nombre)}>
                          <div className="category-img-container">
                            <Card.Img 
                              className="card-img-top" 
                              variant="top" 
                              src={category.imagen || 'https://via.placeholder.com/300'} 
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300';
                              }}
                            />
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <Card.Title className="text-center">{category.nombre}</Card.Title>
                            <Button variant="primary" className="mt-auto">Ver</Button>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        )}
      </div>

      <br />
      <hr />
      <br />

      {/* Marcas */}
<div className="contenedor-marcas" id="marcas">
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
  
  {loadingBrands ? (
    <div className="text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p>Cargando marcas...</p>
    </div>
  ) : brands.length === 0 ? (
    <div className="text-center text-muted">
      <p>No hay marcas disponibles</p>
    </div>
  ) : (
    <div className="marcas-grid">
      {brands.map(brand => (
        <div 
          className="marca-item" 
          key={brand.id_marca}
          onClick={() => handleBrandClick(brand.id_marca, brand.nombre)}
        >
          <div className="marca-content">
            <div className="marca-img-container">
              <img 
                src={brand.imagen || 'https://via.placeholder.com/300'} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300';
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      <br />
      <hr />

      {/* Productos en promoción */}
      <div className="container my-4" id="promociones">
        <center>
          <SplitText
            text="Productos en promoción"
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
        
        {loadingPromo ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando promociones...</p>
          </div>
        ) : promoProducts.length === 0 ? (
          <div className="text-center text-muted">
            <p>Actualmente no hay productos en promoción</p>
          </div>
        ) : (
          <div className="promo-products-container">
            <Carousel indicators={false} interval={null}>
              {[...Array(Math.ceil(promoProducts.length / 3))].map((_, index) => (
                <Carousel.Item key={index}>
                  <div className="row mx-0">
                    {promoProducts.slice(index * 3, (index + 1) * 3).map(product => (
                      <div className="col-md-4 mb-4 px-2" key={product.id_producto}>
                        <Card className="h-100 promo-card" onClick={() => handleProductClick(product.id_producto)}>
                          <div className="discount-badge">
                            {Math.round(100 - (product.precio_descuento * 100 / product.precio))}% OFF
                          </div>
                          <div className="promo-img-container">
                            <Card.Img 
                              variant="top" 
                              src={product.imagen || 'https://via.placeholder.com/300'} 
                              className="promo-product-img"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300';
                              }}
                            />
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <Card.Title>{product.nombre}</Card.Title>
                            <Card.Text>
                              <span className="original-price">${product.precio.toLocaleString()}</span>
                              <span className="discount-price"> ${product.precio_descuento.toLocaleString()}</span>
                            </Card.Text>
                            <Button variant="primary" className="mt-auto">Ver producto</Button>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        )}
      </div>


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

      {/* Pie de página */}
      <footer>
        <div className="contact-text">
          <p>Contáctanos:</p>
        </div>
        <div className="social">
          <a href="https://www.facebook.com/profile.php?id=61560500792452" target="_blank" rel="noopener noreferrer">
            <div className="icon-container">
              <FacebookOutlinedIcon style={{ width: "50px", height: "50px", color: "#FF8357" }}/>
            </div>
          </a>
          <a href="https://www.instagram.com/elesconditeanimal/" target="_blank" rel="noopener noreferrer">
            <div className="icon-container">
              <InstagramIcon style={{ width: "50px", height: "50px", color: "#FF8357" }}/>
            </div>
          </a>
          <a href="https://x.com/esconditeanimal?t=PMS2grt4TlW9i0subpZY8w&s=09" target="_blank" rel="noopener noreferrer">
            <div className="icon-container">
              <XIcon style={{ width: "50px", height: "50px", color: "#FF8357" }}/>
            </div>
          </a>
        </div>
                {/* Botón de descarga de la app */}
        <div className="download-app-container">
          <button 
            onClick={handleDownloadApp}
            className="download-app-btn"
          >
            Clic aquí para descargar la app
          </button>
        </div>
        <div className="copyright">
          <p>© 2023 El Escondite Animal</p>
        </div>
      </footer>
    </>
  );
};

export default Principal;