import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Navbar, Offcanvas, Pagination } from "react-bootstrap";
import axios from "axios";
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './buscador.css';
import { SearchBar } from "./buscador.jsx";

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("query") || "";
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");
    const [animalFilter, setAnimalFilter] = useState("");
    const [priceRange, setPriceRange] = useState([0, 1000000]);

    // Estado para el offcanvas de filtros
    const [showFilters, setShowFilters] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(9); // 9 productos por página (3x3 grid)

    // Datos para filtros
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [animals, setAnimals] = useState([]);

    const urlAPI = 'http://127.0.0.1:5000';

    const [cartItems, setCartItems] = useState([]);

    const addToCart = async (product) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Por favor inicia sesión para agregar productos al carrito");
                return;
            }

            const response = await axios.post(`${urlAPI}/Carrito/agregar`, {
                id_usuario: localStorage.getItem('id'),
                id_producto: product.id_producto,
                cantidad: 1
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.id_producto === product.id_producto);
                if (existingItem) {
                    return prevItems.map(item =>
                        item.id_producto === product.id_producto 
                            ? { ...item, cantidad: item.cantidad + 1 } 
                            : item
                    );
                } else {
                    return [...prevItems, { ...product, cantidad: 1 }];
                }
            });

            alert("Producto agregado al carrito");
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
            alert("Error al agregar producto al carrito");
        }
    };

    // Función de búsqueda optimizada
    const searchProducts = (products, query) => {
        if (!query.trim()) return products;
        
        const searchTerm = query.toLowerCase().trim();
        
        return products.filter(product => {
            if (!product.nombre) return false;
            
            const productName = product.nombre.toLowerCase();
            return productName.includes(searchTerm);
        });
    };

    // Obtener datos de la API
    useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
            const category = queryParams.get("category");
            
            // 1. Verificar estado de la base de datos
            const debugRes = await axios.get(`${urlAPI}/debug/categorias`);
            console.log("Estado de la base de datos:", debugRes.data);
            
            let productsData = [];
            
            // 2. Obtener productos según el filtro
            if (category) {
              const res = await axios.get(
                `${urlAPI}/productos/categoria/${encodeURIComponent(category)}`
              );
              
              // Verificar estructura de respuesta
              if (Array.isArray(res.data)) {
                productsData = res.data;
              } else {
                console.error("La API no devolvió un array:", res.data);
                productsData = [];
              }
            } else {
              const res = await axios.get(`${urlAPI}/PrivProd`);
              productsData = res.data?.productos || [];
            }
            
            // 3. Obtener datos para filtros
            const [categoriesRes, brandsRes, animalsRes] = await Promise.all([
              axios.get(`${urlAPI}/categoria`),
              axios.get(`${urlAPI}/PrivMarcas`),
              axios.get(`${urlAPI}/animalesProd`)
            ]);
            
            setProducts(productsData);
            setCategories(categoriesRes.data?.categorias || []);
            setBrands(brandsRes.data?.marcas || []);
            setAnimals(animalsRes.data?.animales || []);
            
            // 4. Mostrar advertencia si no hay productos
            if (productsData.length === 0 && category) {
              setError(`No se encontraron productos para "${category}". Verifica los datos en la consola.`);
            } else {
              setError(null);
            }
            
          } catch (err) {
            console.error("Error completo:", err);
            setError(err.response?.data?.mensaje || 
                    "Error al cargar productos. Verifica la consola");
          } finally {
            setLoading(false);
          }
        };
        
        fetchData();
      }, [searchQuery, location.search]);
      
    // Filtrado combinado (búsqueda + filtros)
    const filteredProducts = useMemo(() => {
        let result = searchProducts(products, searchQuery);
        
        if (categoryFilter) {
            result = result.filter(p => p.id_categoria == categoryFilter);
        }
        
        if (brandFilter) {
            result = result.filter(p => p.id_marca == brandFilter);
        }
        
        if (animalFilter) {
            result = result.filter(p => p.id_animal == animalFilter);
        }
        
        result = result.filter(p => p.precio >= priceRange[0] && p.precio <= priceRange[1]);
        
        return result;
    }, [products, searchQuery, categoryFilter, brandFilter, animalFilter, priceRange]);

    // Paginación
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePriceChange = (e, index) => {
        const newPriceRange = [...priceRange];
        newPriceRange[index] = Number(e.target.value);
        setPriceRange(newPriceRange);
    };

    const clearFilters = () => {
        setCategoryFilter("");
        setBrandFilter("");
        setAnimalFilter("");
        setPriceRange([0, 1000000]);
        setCurrentPage(1); // Resetear a la primera página al limpiar filtros
    };

    if (loading) return (
        <div className="search-loading-container">
            <div className="text-center my-5">Cargando productos...</div>
        </div>
    );
    
    if (error) return (
        <div className="search-error-container">
            <div className="text-center my-5 text-danger">{error}</div>
        </div>
    );

    return (
        <div className="search-page-container">
            {/* Navbar personalizado */}
            <Navbar expand="lg" className="search-navbar sticky-top">
                <Container fluid>
                    {/* Botón para volver atrás */}
                    <Button 
                        variant="link" 
                        className="text-white navbar-icon"
                        onClick={() => navigate('/')}
                    >
                        <ArrowBackIcon fontSize="large" />
                    </Button>
                    
                    {/* Buscador centrado */}
                    <div className="search-bar-container">
                        <SearchBar />
                    </div>
                    
                    {/* Botón de filtros */}
                    <Button 
                        variant="link" 
                        className="text-white navbar-icon ms-auto"
                        onClick={() => setShowFilters(true)}
                    >
                        <FilterListIcon fontSize="large" />
                    </Button>
                </Container>
            </Navbar>

            {/* Contenido principal con margen superior */}
            <div className="search-main-content">
                {/* Offcanvas para filtros */}
                <Offcanvas 
                    show={showFilters} 
                    onHide={() => setShowFilters(false)}
                    placement="end"
                    className="search-filters-offcanvas"
                >
                    <Offcanvas.Header closeButton closeVariant="white">
                        <Offcanvas.Title>
                            <h3 className="text-white">
                                <FilterListIcon className="me-2" />
                                Filtros
                            </h3>
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <div className="d-flex flex-column gap-3">
                            <Form.Group>
                                <Form.Label className="text-white">Categoría</Form.Label>
                                <Form.Select 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat.id_categoria} value={cat.id_categoria}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group>
                                <Form.Label className="text-white">Marca</Form.Label>
                                <Form.Select 
                                    value={brandFilter}
                                    onChange={(e) => setBrandFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">Todas las marcas</option>
                                    {brands.map(brand => (
                                        <option key={brand.id_marca} value={brand.id_marca}>
                                            {brand.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group>
                                <Form.Label className="text-white">Animal</Form.Label>
                                <Form.Select 
                                    value={animalFilter}
                                    onChange={(e) => setAnimalFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">Todos los animales</option>
                                    {animals.map(animal => (
                                        <option key={animal.id_animal} value={animal.id_animal}>
                                            {animal.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group>
                                <Form.Label className="text-white">
                                    Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                                </Form.Label>
                                <Form.Range 
                                    min="0" 
                                    max="1000000" 
                                    step="10000"
                                    value={priceRange[1]} 
                                    onChange={(e) => handlePriceChange(e, 1)}
                                    className="filter-range"
                                />
                            </Form.Group>
                            
                            <div className="d-flex gap-2 mt-3">
                                <Button 
                                    variant="outline-light" 
                                    onClick={clearFilters}
                                    className="flex-grow-1"
                                >
                                    Limpiar filtros
                                </Button>
                                <Button 
                                    variant="light" 
                                    onClick={() => setShowFilters(false)}
                                    className="flex-grow-1"
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>

                {/* Resultados */}
                <Container className="search-results-container">
                    <h2 className="text-center mb-4 search-results-title">
                        {searchQuery ? `Resultados para "${searchQuery}"` : "Todos los productos"}
                        <small className="d-block text-muted">{filteredProducts.length} producto(s) encontrado(s)</small>
                    </h2>
                    
                    {filteredProducts.length === 0 ? (
                        <div className="text-center my-5 no-results-message">
                            <h4>No se encontraron productos</h4>
                            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
                            <Button 
                                className="mt-3"
                                onClick={clearFilters}
                            >
                                Mostrar todos
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Row xs={1} md={2} lg={3} className="g-4 products-grid">
                                {currentProducts.map(product => (
                                    <Col key={product.id_producto} className="product-col">
                                        <Card className="h-100 shadow-sm product-card">
                                            <Card.Img 
                                                variant="top" 
                                                src={product.imagen} 
                                                className="product-image"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/300";
                                                }}
                                            />
                                            <Card.Body className="d-flex flex-column product-card-body">
                                                <Card.Title className="product-title">{product.nombre}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted product-subtitle">
                                                    {product.marca} - {product.categoria}
                                                </Card.Subtitle>
                                                <Card.Text className="flex-grow-1 product-description">
                                                    {product.descripcion?.substring(0, 100)}...
                                                </Card.Text>
                                                <div className="d-flex justify-content-between align-items-center mt-3 product-price">
                                                    <div>
                                                    {product.precio_descuento ? (
                                                        <>
                                                        <span className="h5 text-danger me-2">
                                                            ${product.precio_descuento.toLocaleString()}
                                                        </span>
                                                        <span className="text-decoration-line-through text-muted">
                                                            ${product.precio.toLocaleString()}
                                                        </span>
                                                        </>
                                                    ) : (
                                                        <span className="h5">
                                                        ${product.precio.toLocaleString()}
                                                        </span>
                                                    )}
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between mt-3 product-actions">
                                                    <Button 
                                                        onClick={() => navigate(`/producto/${product.id_producto}`)}
                                                        className="details-button"
                                                    >
                                                        Ver detalles
                                                    </Button>
                                                    <Button 
                                                        onClick={() => addToCart(product)}
                                                        className="cart-button"
                                                    >
                                                        <ShoppingCartIcon className="me-1" />
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>
                                        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                                        
                                        {[...Array(totalPages).keys()].map(number => (
                                            <Pagination.Item 
                                                key={number + 1} 
                                                active={number + 1 === currentPage}
                                                onClick={() => paginate(number + 1)}
                                            >
                                                {number + 1}
                                            </Pagination.Item>
                                        ))}
                                        
                                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                                        <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default SearchResults;