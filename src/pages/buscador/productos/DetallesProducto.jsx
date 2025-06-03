import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowBack,
  ShoppingCart,
  ZoomIn,
  LocalOffer,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import './detallesProducto.css';
import API_BASE_URL from '../../../config/apiConfig';
import Swal from 'sweetalert2';

const DetallesProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [cantidad, setCantidad] = useState(1);
    const [showZoomModal, setShowZoomModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [productResponse, discountsResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/PrivProd/${id}`),
                    axios.get(`${API_BASE_URL}/descuentosProd`)
                ]);
                
                const productData = productResponse.data.producto;
                const allDiscounts = discountsResponse.data.descuentos || [];
                
                const today = new Date();
                const activeDiscount = allDiscounts.find(d => 
                    d.id_producto === productData.id_producto &&
                    new Date(d.fecha_inicio) <= today &&
                    new Date(d.fecha_fin) >= today
                );
                
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
                
                const allProductsResponse = await axios.get(`${API_BASE_URL}/PrivProd`);
                const allProducts = allProductsResponse.data?.productos || [];
                setRelatedProducts(
                    allProducts.filter(p => 
                        (p.id_categoria === productData.id_categoria || p.id_marca === productData.id_marca) && 
                        p.id_producto !== productData.id_producto
                    ).slice(0, 6)
                );
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

    const addToCart = async () => {
        // Verificar si el producto está disponible
        if (producto.estado !== 'Disponible') {
            Swal.fire({
                icon: 'error',
                title: 'Producto no disponible',
                text: 'Este producto no está disponible para agregar al carrito'
            });
            return;
        }

        // Verificar stock
        if (producto.stock <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Producto agotado',
                text: 'No hay stock disponible de este producto'
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Inicia sesión',
                    text: 'Por favor inicia sesión para agregar productos al carrito',
                    showCancelButton: true,
                    confirmButtonText: 'Iniciar sesión',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/login');
                    }
                });
                return;
            }

            const response = await axios.post(`${API_BASE_URL}/Carrito/agregar`, {
                id_usuario: localStorage.getItem('id'),
                id_producto: producto.id_producto,
                cantidad: cantidad
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: '¡Producto agregado!',
                text: 'El producto ha sido añadido a tu carrito',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
            
            let errorMessage = 'Error al agregar producto al carrito';
            if (error.response) {
                errorMessage = error.response.data?.mensaje || errorMessage;
                if (error.response.status === 401) {
                    errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
                    localStorage.removeItem('token');
                    localStorage.removeItem('id');
                }
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    };

    const handleQuantityChange = (e) => {
        const value = Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1));
        setCantidad(value);
    };

    const incrementQuantity = () => cantidad < producto.stock && setCantidad(cantidad + 1);
    const decrementQuantity = () => cantidad > 1 && setCantidad(cantidad - 1);
    const toggleZoomModal = () => setShowZoomModal(!showZoomModal);

    if (loading) return (
        <div className="product-loading">
            <div className="spinner"></div>
            <p>Cargando detalles del producto...</p>
        </div>
    );

    if (error) return (
        <div className="product-error">
            <div className="error-content">
                <Cancel className="error-icon" />
                <h3>{error}</h3>
                <button onClick={() => navigate('/')} className="back-button">
                    <ArrowBack className="button-icon" />
                    Volver al inicio
                </button>
            </div>
        </div>
    );

    if (!producto) return (
        <div className="product-not-found">
            <div className="not-found-content">
                <Cancel className="error-icon" />
                <h3>Producto no encontrado</h3>
                <button onClick={() => navigate('/')} className="back-button">
                    <ArrowBack className="button-icon" />
                    Volver al inicio
                </button>
            </div>
        </div>
    );

    return (
        <div className="product-detail-page">
            {/* Header */}
            <header className="product-header">
                <button onClick={() => navigate('/')} className="back-button">
                    <ArrowBack className="button-icon" />
                    Volver
                </button>
                <h1 className="page-title">
                    <LocalOffer className="title-icon" />
                    Detalles del Producto
                </h1>
            </header>

            {/* Main Content */}
            <main className="product-main">
                {/* Product Gallery */}
                <section className="product-gallery">
                    <div className="main-image" onClick={toggleZoomModal}>
                        <img
                            src={producto.imagen || "https://via.placeholder.com/600"}
                            alt={producto.nombre}
                            className="product-image"
                        />
                        {producto.descuento_activo && (
                            <span className="discount-tag">
                                -{producto.descuento_activo.porcentaje_descuento}%
                            </span>
                        )}
                        <div className="zoom-indicator">
                            <ZoomIn className="zoom-icon" />
                            Ampliar imagen
                        </div>
                    </div>
                </section>

                {/* Product Info */}
                <section className="product-info">
                    <div className="product-meta">
                        <span className="category">{producto.categoria}</span>
                        <span className="brand">{producto.marca}</span>
                        <span className="animal">{producto.animal}</span>
                    </div>

                    <h2 className="product-name">{producto.nombre}</h2>

                    <div className={`stock-status ${producto.estado.toLowerCase()}`}>
                        {producto.estado === 'Disponible' ? (
                            <CheckCircle className="status-icon" />
                        ) : (
                            <Cancel className="status-icon" />
                        )}
                        {producto.estado} {producto.stock > 0 && `(${producto.stock} disponibles)`}
                    </div>

                    <div className="price-section">
                        {producto.precio_descuento ? (
                            <>
                                <span className="current-price">${producto.precio_descuento.toFixed(2)}</span>
                                <span className="original-price">${producto.precio.toFixed(2)}</span>
                                <span className="savings">
                                    Ahorras ${(producto.precio - producto.precio_descuento).toFixed(2)} ({producto.descuento_activo.porcentaje_descuento}%)
                                </span>
                            </>
                        ) : (
                            <span className="current-price">${producto.precio.toFixed(2)}</span>
                        )}
                    </div>

                    <div className="description-section">
                        <h3>Descripción</h3>
                        <p>{producto.descripcion || "Este producto no tiene descripción disponible."}</p>
                    </div>

                    <div className="quantity-section">
                        <h3>Cantidad</h3>
                        <div className="quantity-controls">
                            <button 
                                className="quantity-btn minus"
                                onClick={decrementQuantity}
                                disabled={cantidad <= 1}
                            >
                                −
                            </button>
                            <input 
                                type="number" 
                                min="1" 
                                max={producto.stock} 
                                value={cantidad}
                                onChange={handleQuantityChange}
                                className="quantity-input"
                            />
                            <button 
                                className="quantity-btn plus"
                                onClick={incrementQuantity}
                                disabled={cantidad >= producto.stock}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="action-section">
                        <div className="total-price">
                            <span>Total:</span>
                            <span className="amount">
                                ${(producto.precio_descuento ? producto.precio_descuento * cantidad : producto.precio * cantidad).toFixed(2)}
                            </span>
                        </div>
                        <button 
                            className="add-to-cart"
                            onClick={addToCart}
                            disabled={producto.estado !== 'Disponible' || producto.stock <= 0}
                        >
                            <ShoppingCart className="cart-icon" />
                            {producto.stock <= 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
                        </button>
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="related-products">
                        <h2 className="section-title">
                            <LocalOffer className="section-icon" />
                            Productos Relacionados
                        </h2>
                        <div className="related-grid">
                            {relatedProducts.map(product => (
                                <div key={product.id_producto} className="related-card">
                                    <div className="related-image">
                                        <img
                                            src={product.imagen || "https://via.placeholder.com/300"}
                                            alt={product.nombre}
                                        />
                                    </div>
                                    <div className="related-info">
                                        <h3 className="related-name">{product.nombre}</h3>
                                        <div className="related-price">${product.precio.toFixed(2)}</div>
                                        <button 
                                            className="view-details"
                                            onClick={() => navigate(`/producto/${product.id_producto}`)}
                                        >
                                            Ver detalles
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Zoom Modal */}
                {showZoomModal && (
                    <div className="image-zoom-modal" onClick={toggleZoomModal}>
                        <div className="modal-content">
                            <img
                                src={producto.imagen || "https://via.placeholder.com/800"}
                                alt={producto.nombre}
                                className="zoomed-image"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DetallesProducto;