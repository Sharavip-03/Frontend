import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Image, Spinner, Alert, Form, Badge, InputGroup } from "react-bootstrap";
import axios from "axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './detallesProducto.css';

const DetallesProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [cantidad, setCantidad] = useState(1);
    const [showZoomModal, setShowZoomModal] = useState(false);

    const urlAPI = 'http://127.0.0.1:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const productResponse = await axios.get(`${urlAPI}/PrivProd/${id}`);
                const productData = productResponse.data.producto;
                
                if (productData.descuento_activo) {
                    productData.precio_descuento = productData.precio * (1 - productData.descuento_activo.porcentaje_descuento / 100);
                }
                
                setProducto(productData);
                const allProductsResponse = await axios.get(`${urlAPI}/PrivProd`);
                setAllProducts(allProductsResponse.data?.productos || []);
                setError(null);
            } catch (err) {
                setError(`Error al cargar el producto: ${err.message}`);
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (producto && allProducts.length > 0) {
            findRelatedProducts();
        }
    }, [producto, allProducts]);

    const findRelatedProducts = () => {
        if (!producto) return;
        
        const related = allProducts.filter(p => 
            (p.id_categoria === producto.id_categoria || p.id_marca === producto.id_marca) && 
            p.id_producto !== producto.id_producto
        );
        
        setRelatedProducts(related.slice(0, 6));
    };

    const addToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Por favor inicia sesión para agregar productos al carrito");
                return;
            }

            await axios.post(`${urlAPI}/Carrito/agregar`, {
                id_usuario: localStorage.getItem('id'),
                id_producto: producto.id_producto,
                cantidad: cantidad
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Producto agregado al carrito");
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
            alert("Error al agregar producto al carrito");
        }
    };

    const handleQuantityChange = (newValue) => {
        const value = Math.max(1, Math.min(producto.stock, parseInt(newValue) || 1));
        setCantidad(value);
    };

    const incrementQuantity = () => {
        if (cantidad < producto.stock) {
            setCantidad(cantidad + 1);
        }
    };

    const decrementQuantity = () => {
        if (cantidad > 1) {
            setCantidad(cantidad - 1);
        }
    };

    const toggleZoomModal = () => {
        setShowZoomModal(!showZoomModal);
    };

    if (loading) return (
        <div className="text-center my-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </div>
    );

    if (error) return (
        <div className="text-center my-5">
            <Alert variant="danger">{error}</Alert>
            <Button variant="danger" onClick={() => navigate(-1)}>
                Volver
            </Button>
        </div>
    );

    if (!producto) return (
        <div className="text-center my-5">
            <Alert variant="warning">Producto no encontrado</Alert>
            <Button variant="danger" onClick={() => navigate(-1)}>
                Volver
            </Button>
        </div>
    );

    return (
        <Container className="my-5 detalles-producto-container">
            {/* Botón para volver */}
            <Button 
                variant="outline-danger" 
                onClick={() => navigate(-1)}
                className="mb-4"
            >
                <ArrowBackIcon className="me-2" />
                Volver
            </Button>

            {/* Detalles del producto */}
            <Row className="mb-5">
                <Col md={6} className="mb-4 mb-md-0">
                    <div 
                        className="product-image-container"
                        onClick={toggleZoomModal}
                    >
                        <Image
                            src={producto.imagen || "https://via.placeholder.com/500"}
                            alt={producto.nombre}
                            fluid
                            rounded
                            className="main-product-image"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/500";
                            }}
                        />
                        {producto.descuento_activo && (
                            <Badge pill bg="warning" className="discount-badge">
                                -{producto.descuento_activo.porcentaje_descuento}%
                            </Badge>
                        )}
                        <div className="zoom-hint">
                            <span>Click para zoom</span>
                        </div>
                    </div>

                    {/* Modal de zoom */}
                    {showZoomModal && (
                        <div className="zoom-modal" onClick={toggleZoomModal}>
                            <div className="zoom-modal-content">
                                <Image
                                    src={producto.imagen || "https://via.placeholder.com/500"}
                                    alt={producto.nombre}
                                    fluid
                                    className="zoomed-image"
                                />
                            </div>
                        </div>
                    )}
                </Col>
                
                <Col md={6}>
                    <Card className="h-100 product-details-card">
                        <Card.Body>
                            <Card.Title as="h2" className="mb-3">{producto.nombre}</Card.Title>
                            
                            <div className="mb-3">
                                {producto.precio_descuento ? (
                                    <>
                                        <span className="h4 text-danger me-2">
                                            ${producto.precio_descuento.toLocaleString()}
                                        </span>
                                        <span className="text-decoration-line-through text-muted">
                                            ${producto.precio.toLocaleString()}
                                        </span>
                                        <div className="text-success mt-1">
                                            Ahorras: ${(producto.precio - producto.precio_descuento).toLocaleString()} ({(producto.descuento_activo.porcentaje_descuento)}%)
                                        </div>
                                    </>
                                ) : (
                                    <span className="h4 text-dark">
                                        ${producto.precio.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            
                            <Card.Subtitle className="mb-3 text-muted">
                                {producto.marca} - {producto.categoria} - {producto.animal}
                            </Card.Subtitle>
                            
                            <Card.Text className="mb-4">
                                {producto.descripcion}
                            </Card.Text>
                            
                            <div className="mb-4">
                                <h5>Especificaciones:</h5>
                                <ul>
                                    <li>Estado: <Badge bg={producto.estado === 'Disponible' ? 'success' : 'danger'}>
                                        {producto.estado}
                                    </Badge></li>
                                    <li>Stock disponible: {producto.stock}</li>
                                </ul>
                            </div>
                            
                            <div className="d-flex align-items-center mb-4">
                                <Form.Label className="me-3">Cantidad:</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={decrementQuantity}
                                        disabled={cantidad <= 1}
                                        className="quantity-btn"
                                    >
                                        -
                                    </Button>
                                    <Badge bg="light" text="dark" className="mx-2 quantity-badge">
                                        {cantidad}
                                    </Badge>
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={incrementQuantity}
                                        disabled={cantidad >= producto.stock}
                                        className="quantity-btn"
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="ms-3">
                                    <strong>Total:</strong> ${(producto.precio_descuento ? producto.precio_descuento * cantidad : producto.precio * cantidad).toLocaleString()}
                                </div>
                            </div>
                            
                            <Button 
                                variant="warning" 
                                size="lg" 
                                className="me-3 text-white"
                                onClick={addToCart}
                                disabled={producto.estado !== 'Disponible' || producto.stock <= 0}
                            >
                                <ShoppingCartIcon className="me-2" />
                                {producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Productos relacionados */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h3 className="mb-4">Productos relacionados</h3>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {relatedProducts.map(product => (
                            <Col key={product.id_producto}>
                                <Card className="h-100">
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
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="h5 text-dark">
                                                    ${product.precio.toLocaleString()}
                                                </span>
                                                <Button 
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => navigate(`/producto/${product.id_producto}`)}
                                                >
                                                    Ver detalles
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </Container>
    );
};

export default DetallesProducto;