import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Navbar, Offcanvas, Pagination } from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from '../../config/apiConfig';
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

    const [products, setProducts] = useState(location.state?.filteredProducts || []);
    const [loading, setLoading] = useState(!location.state?.filteredProducts);
    const [error, setError] = useState(location.state?.error || null);
    const [searchTitle, setSearchTitle] = useState(location.state?.searchTitle || "");
    
    
    // Filtros
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");
    const [animalFilter, setAnimalFilter] = useState("");
    const [priceRange, setPriceRange] = useState([0, 1000000]);

    // Estado para el offcanvas de filtros
    const [showFilters, setShowFilters] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(9);

    // Datos para filtros
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [animals, setAnimals] = useState([]);

    const [cartItems, setCartItems] = useState([]);

    const addToCart = async (product) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Por favor inicia sesión para agregar productos al carrito");
                return;
            }

            const response = await axios.post(`${API_BASE_URL}/Carrito/agregar`, {
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

    const searchProducts = (products, query) => {
        if (!query.trim()) return products;
        const searchTerm = query.toLowerCase().trim();
        return products.filter(product => {
            if (!product.nombre) return false;
            const productName = product.nombre.toLowerCase();
            return productName.includes(searchTerm);
        });
    };

    useEffect(() => {
        // Si ya tenemos productos filtrados (venimos de Principal), no hacemos fetch
        if (location.state?.filteredProducts) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
          try {
            setLoading(true);
            const category = queryParams.get("category");
            
            let productsData = [];
            
            if (category) {
              const res = await axios.get(
                `${API_BASE_URL}/productos/categoria/${encodeURIComponent(category)}`
              );
              
              if (Array.isArray(res.data)) {
                productsData = res.data;
              } else {
                console.error("La API no devolvió un array:", res.data);
                productsData = [];
              }
            } else {
              const res = await axios.get(`${API_BASE_URL}/PrivProd`);
              productsData = res.data?.productos || [];
            }
            
            const [categoriesRes, brandsRes, animalsRes] = await Promise.all([
              axios.get(`${API_BASE_URL}/categoria`),
              axios.get(`${API_BASE_URL}/PrivMarcas`),
              axios.get(`${API_BASE_URL}/animalesProd`)
            ]);
            
            setProducts(productsData);
            setCategories(categoriesRes.data?.categorias || []);
            setBrands(brandsRes.data?.marcas || []);
            setAnimals(animalsRes.data?.animales || []);
            
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
    }, [searchQuery, location.search, location.state]);
      
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
        setCurrentPage(1);
    };

    if (loading) return (
        <div className="search-loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando productos...</p>
        </div>
    );
    
    if (error) return (
        <div className="search-error-container">
            <div className="error-message">{error}</div>
            <Button className="retry-button" onClick={() => window.location.reload()}>
                Reintentar
            </Button>
        </div>
    );

    return (
        <div className="search-app-container">
            {/* Barra de navegación superior */}
            <nav className="search-top-nav">
                <div className="nav-content">
                    <button 
                        className="nav-back-button"
                        onClick={() => navigate('/')}
                    >
                        <ArrowBackIcon fontSize="large" />
                    </button>
                    
                    <div className="search-bar-wrapper">
                        <SearchBar />
                    </div>
                    
                    <button 
                        className="nav-filter-button"
                        onClick={() => setShowFilters(true)}
                    >
                        <FilterListIcon fontSize="large" />
                    </button>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="search-main-content">
                {/* Panel de filtros deslizable */}
                <div className={`filter-panel ${showFilters ? 'open' : ''}`}>
                    <div className="filter-header">
                        <h3>
                            <FilterListIcon className="filter-icon" />
                            Filtros
                        </h3>
                        <button 
                            className="close-filters"
                            onClick={() => setShowFilters(false)}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="filter-body">
                        <div className="filter-group">
                            <label>Categoría</label>
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Marca</label>
                            <select 
                                value={brandFilter}
                                onChange={(e) => setBrandFilter(e.target.value)}
                            >
                                <option value="">Todas las marcas</option>
                                {brands.map(brand => (
                                    <option key={brand.id_marca} value={brand.id_marca}>
                                        {brand.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Animal</label>
                            <select 
                                value={animalFilter}
                                onChange={(e) => setAnimalFilter(e.target.value)}
                            >
                                <option value="">Todos los animales</option>
                                {animals.map(animal => (
                                    <option key={animal.id_animal} value={animal.id_animal}>
                                        {animal.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>
                                Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                            </label>
                            <input 
                                type="range" 
                                min="0" 
                                max="1000000" 
                                step="10000"
                                value={priceRange[1]} 
                                onChange={(e) => handlePriceChange(e, 1)}
                            />
                        </div>
                        
                        <div className="filter-actions">
                            <button 
                                className="clear-filters"
                                onClick={clearFilters}
                            >
                                Limpiar filtros
                            </button>
                            <button 
                                className="apply-filters"
                                onClick={() => setShowFilters(false)}
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resultados de búsqueda */}
                <div className="search-results-area">
                    <h2 className="results-title">
                        {searchTitle || (searchQuery ? `Resultados para "${searchQuery}"` : "Todos los productos")}
                        <span>{filteredProducts.length} producto(s) encontrado(s)</span>
                    </h2>
                    
                    {filteredProducts.length === 0 ? (
                        <div className="no-results-message">
                            <h3>No se encontraron productos</h3>
                            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
                            <button 
                                className="show-all-button"
                                onClick={clearFilters}
                            >
                                Mostrar todos
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {currentProducts.map(product => (
                                    <div key={product.id_producto} className="product-card">
                                        {product.precio_descuento && (
                                            <div className="discount-badge">
                                                {Math.round(100 - (product.precio_descuento * 100 / product.precio))}% OFF
                                            </div>
                                        )}
                                        {product.stock <= 0 && (
                                            <div className="sold-out-badge">AGOTADO</div>
                                        )}
                                        <div className="product-image-container">
                                            <img 
                                                src={product.imagen} 
                                                alt={product.nombre}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/300";
                                                }}
                                            />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-title">{product.nombre}</h3>
                                            <p className="product-category">{product.marca} - {product.categoria}</p>
                                            <p className="product-description">
                                                {product.descripcion?.substring(0, 100)}...
                                            </p>
                                            <div className="product-price-section">
                                                {product.precio_descuento ? (
                                                    <>
                                                        <span className="current-price">
                                                            ${product.precio_descuento.toLocaleString()}
                                                        </span>
                                                        <span className="original-price">
                                                            ${product.precio.toLocaleString()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="current-price">
                                                        ${product.precio.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="product-actions">
                                                <button 
                                                    onClick={() => navigate(`/producto/${product.id_producto}`)}
                                                    className="details-button"
                                                >
                                                    Ver detalles
                                                </button>
                                                <button 
                                                    onClick={() => addToCart(product)}
                                                    className="cart-button"
                                                    disabled={product.stock <= 0}
                                                >
                                                    <ShoppingCartIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="pagination-container">
                                    <ul className="pagination">
                                        <li 
                                            className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                                            onClick={() => paginate(1)}
                                        >
                                            <span className="page-link">«</span>
                                        </li>
                                        <li 
                                            className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                                            onClick={() => paginate(currentPage - 1)}
                                        >
                                            <span className="page-link">‹</span>
                                        </li>
                                        
                                        {[...Array(totalPages).keys()].map(number => (
                                            <li 
                                                key={number + 1} 
                                                className={`page-item ${number + 1 === currentPage ? 'active' : ''}`}
                                                onClick={() => paginate(number + 1)}
                                            >
                                                <span className="page-link">{number + 1}</span>
                                            </li>
                                        ))}
                                        
                                        <li 
                                            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                                            onClick={() => paginate(currentPage + 1)}
                                        >
                                            <span className="page-link">›</span>
                                        </li>
                                        <li 
                                            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                                            onClick={() => paginate(totalPages)}
                                        >
                                            <span className="page-link">»</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SearchResults;