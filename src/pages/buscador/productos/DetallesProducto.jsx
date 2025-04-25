import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Image, Spinner, Alert, Badge } from "react-bootstrap";
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
                
                // Obtener producto y descuentos
                const [productResponse, discountsResponse] = await Promise.all([
                    axios.get(`${urlAPI}/PrivProd/${id}`),
                    axios.get(`${urlAPI}/descuentosProd`)
                ]);
                
                const productData = productResponse.data.producto;
                const allDiscounts = discountsResponse.data.descuentos || [];
                
                // Buscar si hay un descuento activo para este producto
                const today = new Date();
                const activeDiscount = allDiscounts.find(d => 
                    d.id_producto === productData.id_producto &&
                    (!d.fecha_inicio || new Date(d.fecha_inicio) <= today) &&
                    (!d.fecha_fin || new Date(d.fecha_fin) >= today)
                );
                
                // Agregar el descuento activo al producto si existe
                if (activeDiscount) {
                    productData.descuento_activo = {
                        porcentaje_descuento: activeDiscount.porcentaje_descuento,
                        fecha_inicio: activeDiscount.fecha_inicio,
                        fecha_fin: activeDiscount.fecha_fin
                    };
                    productData.precio_descuento = productData.precio * (1 - activeDiscount.porcentaje_descuento / 100);
                }
                
                productData.estado = productData.stock > 0 ? 'Disponible' : 'Agotado';
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
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" role="status" style={{ color: '#FF8357' }}>
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </div>
    );

    if (error) return (
        <div className="text-center my-5">
            <Alert variant="danger" className="mx-3">{error}</Alert>
            <Button 
                variant="danger" 
                onClick={() => navigate(-1)}
                className="mt-3"
            >
                Volver
            </Button>
        </div>
    );

    if (!producto) return (
        <div className="text-center my-5">
            <Alert variant="warning" className="mx-3">Producto no encontrado</Alert>
            <Button 
                variant="danger" 
                onClick={() => navigate(-1)}
                className="mt-3"
            >
                Volver
            </Button>
        </div>
    );

    return (
        <Container className="detalles-producto-container py-4">
            {/* Botón para volver */}
            <Button 
                className="back-button"
                onClick={() => navigate(-1)}
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
                            className="main-product-image"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/500";
                            }}
                        />
                                {producto.descuento_activo && (
                                    <Badge pill className="discount-badge">
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
                    <Card className="product-details-card">
                        <Card.Body>
                            <Card.Title className="product-title">{producto.nombre}</Card.Title>
                            
                            <Card.Subtitle className="product-subtitle mb-3">
                                <span>{producto.marca}</span>
                                <span>{producto.categoria}</span>
                                <span>{producto.animal}</span>
                            </Card.Subtitle>
                            
                            {/* Estado de stock */}
                            <div className={`stock-status ${producto.estado === 'Disponible' ? 'available' : 'out-of-stock'}`}>
                                {producto.estado} {producto.estado === 'Disponible' ? `(${producto.stock} en stock)` : ''}
                            </div>
                            
                            {/* Precios */}
                            <div className="price-container">
                                {producto.precio_descuento ? (
                                    <>
                                        <span className="current-price">
                                            ${producto.precio_descuento.toLocaleString()}
                                        </span>
                                        <span className="original-price">
                                            ${producto.precio.toLocaleString()}
                                        </span>
                                        <div className="savings-text">
                                            Ahorras: ${(producto.precio - producto.precio_descuento).toLocaleString()} ({producto.descuento_activo.porcentaje_descuento}%)
                                        </div>
                                    </>
                                ) : (
                                    <span className="current-price">
                                        ${producto.precio.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            
                            <Card.Text className="product-description">
                                {producto.descripcion}
                            </Card.Text>
                            
                            {/* Controles de cantidad */}
                            <div className="quantity-controls">
                                <span className="quantity-label">Cantidad:</span>
                                <div className="quantity-selector">
                                    <Button 
                                        variant="outline"
                                        className="quantity-btn"
                                        onClick={decrementQuantity}
                                        disabled={cantidad <= 1}
                                    >
                                        -
                                    </Button>
                                    <Badge className="quantity-badge">
                                        {cantidad}
                                    </Badge>
                                    <Button 
                                        variant="outline"
                                        className="quantity-btn"
                                        onClick={incrementQuantity}
                                        disabled={cantidad >= producto.stock}
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="total-price">
                                    Total: ${(producto.precio_descuento ? producto.precio_descuento * cantidad : producto.precio * cantidad).toLocaleString()}
                                </div>
                            </div>
                            
                            {/* Botón de añadir al carrito */}
                            <Button 
                                className="add-to-cart-btn"
                                onClick={addToCart}
                                disabled={producto.estado !== 'Disponible' || producto.stock <= 0}
                            >
                                <ShoppingCartIcon className="me-2" />
                                {producto.stock <= 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Productos relacionados */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h3 className="related-products-title">Productos relacionados</h3>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {relatedProducts.map(product => (
                            <Col key={product.id_producto}>
                                <Card className="related-product-card">
                                    <Card.Img 
                                        variant="top" 
                                        src={product.imagen} 
                                        className="related-product-image"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300";
                                        }}
                                    />
                                    <Card.Body className="related-product-body">
                                        <Card.Title className="related-product-title">
                                            {product.nombre}
                                        </Card.Title>
                                        <Card.Subtitle className="related-product-subtitle">
                                            {product.marca} • {product.categoria}
                                        </Card.Subtitle>
                                        <div className="related-product-price">
                                            ${product.precio.toLocaleString()}
                                        </div>
                                        <Button 
                                            className="view-details-btn"
                                            onClick={() => navigate(`/producto/${product.id_producto}`)}
                                        >
                                            Ver detalles
                                        </Button>
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