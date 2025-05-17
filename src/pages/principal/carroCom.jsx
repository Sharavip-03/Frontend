import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Button, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import LoginModal from "../../components/Navbar/LoginModal.jsx";
import API_BASE_URL from '../../config/apiConfig';

function Carro({ show, setShow }) {
  const [cartItems, setCartItems] = useState([]);
  const [carritoId, setCarritoId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Cargar items del carrito al abrir
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = localStorage.getItem('id');
        const token = localStorage.getItem('token');
        
        if (!userId || !token) {
          setError("Por favor inicia sesión para ver tu carrito");
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/Carrito/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          // Verifica si hay productos en el carrito
          if (response.data.productos && Array.isArray(response.data.productos)) {
            setCartItems(response.data.productos.map(item => ({
              id_producto: item.id_producto,
              nombre: item.nombre,
              cantidad: item.cantidad,
              precio: item.precio,
              precio_descuento: item.precio_descuento,
              subtotal: item.subtotal,
              imagen: item.imagen
            })));
          } else {
            setCartItems([]);
          }
          
          // Establece el id_carrito si existe en la respuesta
          if (response.data.id_carrito) {
            setCarritoId(response.data.id_carrito);
          } else {
            setCarritoId(null);
          }
        } else {
          setCartItems([]);
          setCarritoId(null);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error detallado:", err.response?.data || err.message);
        setError("Error al cargar el carrito. Por favor intenta nuevamente.");
        setCarritoId(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (show) {
      fetchCartItems();
    }
  }, [show]);

  const handleClose = () => setShow(false);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const userId = localStorage.getItem('id');
      const token = localStorage.getItem('token');
      
      if (!carritoId) {
        throw new Error("No se pudo identificar el carrito");
      }
      
      await axios.put(
        `${API_BASE_URL}/Carrito/producto/${carritoId}/${productId}`,
        { cantidad: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCartItems(prev => 
        prev.map(item => 
          item.id_producto === productId 
            ? { ...item, cantidad: newQuantity } 
            : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      alert("Error al actualizar la cantidad. Por favor intenta nuevamente.");
    }
  };
  
  const removeItem = async (productId) => {
    try {
      const userId = localStorage.getItem('id');
      const token = localStorage.getItem('token');
      
      if (!carritoId) {
        throw new Error("No se pudo identificar el carrito");
      }
      
      await axios.delete(`${API_BASE_URL}/Carrito/producto/${carritoId}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCartItems(prev => prev.filter(item => item.id_producto !== productId));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto. Por favor intenta nuevamente.");
    }
  };

  const verificarStock = async () => {
    try {
        const userId = localStorage.getItem('id');
        const token = localStorage.getItem('token');
        
        // 1. Obtener carrito
        const carritoResponse = await axios.get(`${API_BASE_URL}/Carrito/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!carritoResponse.data?.productos) {
            return { 
                error: true, 
                message: "No se pudieron obtener los productos del carrito" 
            };
        }

        // 2. Verificar cada producto
        for (const item of carritoResponse.data.productos) {
            try {
                // 2.1 Obtener detalles del producto (CORREGIDO: usa /PrivProd/)
                const productoResponse = await axios.get(
                    `${API_BASE_URL}/PrivProd/${item.id_producto}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // 2.2 Validar estructura de la respuesta (CORREGIDO: verifica .producto.stock)
                if (typeof productoResponse.data?.producto?.stock !== 'number') {
                    return {
                        error: true,
                        message: `El producto no tiene información válida de stock`,
                        producto: item.nombre,
                        id_producto: item.id_producto,
                        debug: {
                            received: productoResponse.data,
                            expected: "Debe contener { producto: { stock: number } }"
                        }
                    };
                }

                const stockDisponible = productoResponse.data.producto.stock;
                
                // 2.3 Verificar stock suficiente
                if (stockDisponible < item.cantidad) {
                    return {
                        error: true,
                        producto: item.nombre,
                        stock: stockDisponible,
                        solicitado: item.cantidad,
                        message: `No hay suficiente stock para ${item.nombre}. Disponible: ${stockDisponible}, Solicitado: ${item.cantidad}`
                    };
                }

            } catch (error) {
                console.error(`Error al verificar producto ${item.id_producto}:`, error);
                return {
                    error: true,
                    message: error.response?.data?.mensaje || `No se pudo verificar el producto ${item.nombre || item.id_producto}`,
                    producto: item.nombre,
                    id_producto: item.id_producto,
                    debug: {
                        error: error.message,
                        response: error.response?.data
                    }
                };
            }
        }
        
        // 3. Todo está OK
        return { error: false };
        
    } catch (error) {
        console.error("Error general al verificar stock:", error);
        return { 
            error: true, 
            message: error.response?.data?.mensaje || "Error de conexión al verificar disponibilidad",
            debug: error.message
        };
    }
};
const handleProceedToCheckout = async () => {
  try {
      const token = localStorage.getItem('token');
      if (!token) {
          alert("Por favor inicia sesión primero");
          return;
      }

      if (cartItems.length === 0) {
          alert("Tu carrito está vacío");
          return;
      }

      const stockCheck = await verificarStock();
      if (stockCheck.error) {
          // Construye mensaje completo
          const errorLines = [
              stockCheck.message,
              stockCheck.producto && `Producto: ${stockCheck.producto}`,
              stockCheck.id_producto && `ID: ${stockCheck.id_producto}`,
              stockCheck.stock !== undefined && `Stock disponible: ${stockCheck.stock}`,
              stockCheck.solicitado !== undefined && `Solicitado: ${stockCheck.solicitado}`,
              process.env.NODE_ENV === 'development' && stockCheck.debug && `Debug: ${stockCheck.debug}`
          ].filter(Boolean).join('\n');
          
          alert(errorLines);
          return;
      }

      const userId = localStorage.getItem('id');
      const response = await axios.post(
          `${API_BASE_URL}/Carrito/procesar/${userId}`,
          {},
          {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          }
      );

      navigate(`/pago/${response.data.id_factura}`);
      handleClose();
  } catch (error) {
      console.error("Error al procesar compra:", error);
      
      // Manejo mejorado de errores
      let errorMessage = "Error al procesar tu compra. Por favor intenta nuevamente.";
      
      if (error.response?.data) {
          const backendError = error.response.data;
          errorMessage = [
              backendError.mensaje || errorMessage,
              backendError.producto && `Producto: ${backendError.producto}`,
              backendError.stock_disponible !== undefined && `Stock disponible: ${backendError.stock_disponible}`,
              backendError.solicitado !== undefined && `Cantidad solicitada: ${backendError.solicitado}`
          ].filter(Boolean).join('\n');
      }
      
      alert(errorMessage);
      
      // Recargar el carrito
      try {
          const userId = localStorage.getItem('id');
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/Carrito/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setCartItems(res.data?.productos || []);
      } catch (fetchError) {
          console.error("Error al recargar el carrito:", fetchError);
      }
  }
};
  // Calcular totales
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.cantidad * (item.precio_descuento || item.precio)), 
    0
  );
  const iva = subtotal * 0.16; // 16% de IVA
  const total = subtotal + iva;

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" scroll backdrop>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Tu Carrito</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading ? (
          <div className="text-center">Cargando carrito...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-4">
            <p>Tu carrito está vacío</p>
            <Button variant="primary" onClick={handleClose}>
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            <ListGroup variant="flush">
              {cartItems.map(item => (
                <ListGroup.Item key={item.id_producto}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="me-3">
                           {/* Mostrar imagen del producto */}
                        {item.imagen && (
                          <img 
                            src={item.imagen} 
                            alt={item.nombre} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                          />
                        )}
                      <h6>{item.nombre}</h6>
                      {item.precio_descuento ? (
                        <div>
                          <span className="text-danger me-2">
                            ${(item.precio_descuento * item.cantidad).toFixed(2)}
                          </span>
                          <small className="text-decoration-line-through text-muted">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </small>
                        </div>
                      ) : (
                        <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.id_producto, Math.max(1, item.cantidad - 1))}
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </Button>
                      <Badge bg="light" text="dark" className="mx-2">
                        {item.cantidad}
                      </Badge>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.id_producto, item.cantidad + 1)}
                      >
                        +
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="ms-2"
                        onClick={() => removeItem(item.id_producto)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="cart-total border-top pt-3 mt-3">
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>IVA (16%):</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              variant="primary" 
              className="w-100 mt-3 py-2"
              onClick={handleProceedToCheckout}
            >
              Proceder al Pago
            </Button>
            
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Carro;