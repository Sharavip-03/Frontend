import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import axios from "axios";
import './buscador.css';

const SearchResults = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("query") || "";
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");
    const [animalFilter, setAnimalFilter] = useState("");
    const [priceRange, setPriceRange] = useState([0, 1000000]); // Aumenté el rango máximo

    // Datos para filtros
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [animals, setAnimals] = useState([]);

    const urlAPI = 'http://127.0.0.1:5000';

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
                
                // Obtener productos
                const productsResponse = await axios.get(`${urlAPI}/PrivProd`);
                const productosData = productsResponse.data?.productos || [];
                
                if (!Array.isArray(productosData)) {
                    throw new Error("Formato de respuesta inválido");
                }
                
                // Obtener datos para filtros
                const [categoriesRes, brandsRes, animalsRes] = await Promise.all([
                    axios.get(`${urlAPI}/categoria`),
                    axios.get(`${urlAPI}/PrivMarcas`),
                    axios.get(`${urlAPI}/animalesProd`)
                ]);
                
                setCategories(categoriesRes.data?.categorias || []);
                setBrands(brandsRes.data?.marcas || []);
                setAnimals(animalsRes.data?.animales || []);

                setProducts(productosData);
                setError(null);
            } catch (err) {
                setError(`Error al cargar datos: ${err.message}`);
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [searchQuery]);

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
    };

    if (loading) return <div className="text-center my-5">Cargando productos...</div>;
    if (error) return <div className="text-center my-5 text-danger">{error}</div>;

    return (
        <>
            {/* Filtros horizontales */}
            <div className="bg-light py-3 mb-4">
                <Container>
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                        <Form.Group className="mb-0">
                            <Form.Select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-0">
                            <Form.Select 
                                value={brandFilter}
                                onChange={(e) => setBrandFilter(e.target.value)}
                            >
                                <option value="">Todas las marcas</option>
                                {brands.map(brand => (
                                    <option key={brand.id_marca} value={brand.id_marca}>
                                        {brand.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-0">
                            <Form.Select 
                                value={animalFilter}
                                onChange={(e) => setAnimalFilter(e.target.value)}
                            >
                                <option value="">Todos los animales</option>
                                {animals.map(animal => (
                                    <option key={animal.id_animal} value={animal.id_animal}>
                                        {animal.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-0 flex-grow-1" style={{ minWidth: '200px' }}>
                            <Form.Label>Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}</Form.Label>
                            <Form.Range 
                                min="0" 
                                max="1000000" 
                                step="10000"
                                value={priceRange[1]} 
                                onChange={(e) => handlePriceChange(e, 1)}
                            />
                        </Form.Group>
                        
                        <Button 
                            variant="outline-secondary" 
                            onClick={clearFilters}
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                </Container>
            </div>

            {/* Resultados */}
            <Container className="mb-5">
                <h2 className="text-center mb-4">
                    {searchQuery ? `Resultados para "${searchQuery}"` : "Todos los productos"}
                    <small className="d-block text-muted">{filteredProducts.length} producto(s) encontrado(s)</small>
                </h2>
                
                {filteredProducts.length === 0 ? (
                    <div className="text-center my-5">
                        <h4>No se encontraron productos</h4>
                        <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
                        <Button 
                            variant="primary" 
                            className="mt-3"
                            onClick={clearFilters}
                        >
                            Mostrar todos
                        </Button>
                    </div>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {filteredProducts.map(product => (
                            <Col key={product.id_producto}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Img 
                                        variant="top" 
                                        src={product.imagen} 
                                        style={{ height: "200px", objectFit: "cover" }}
                                        className="p-2"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300";
                                        }}
                                    />
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>{product.nombre}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            {product.marca} - {product.categoria}
                                        </Card.Subtitle>
                                        <Card.Text className="flex-grow-1">
                                            {product.descripcion?.substring(0, 100)}...
                                        </Card.Text>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="h5 text-primary">${product.precio.toLocaleString()}</span>
                                            <Button variant="primary">
                                                Ver detalles
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </>
    );
};

export default SearchResults;