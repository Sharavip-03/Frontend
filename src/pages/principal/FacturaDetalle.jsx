import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button, Alert, Row, Col, Image } from 'react-bootstrap';
import { 
  ArrowBack, 
  Receipt, 
  LocalPrintshop,
  Person,
  Email,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  Pending,
  Payment,
  ShoppingBasket
} from '@mui/icons-material';
import './FacturaDetalle.css';

const FacturaDetalle = () => {
  const { idFactura } = useParams();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const idNumerico = Number(idFactura);
    if (!idFactura || isNaN(idNumerico)) {
      setError("ID de factura no válido");
      setLoading(false);
      return;
    }
    
    const cargarFactura = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/factura/${idFactura}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Procesar fechas
        const facturaProcesada = {
          ...response.data,
          fecha: response.data.fecha ? new Date(response.data.fecha) : new Date(),
          fecha_pago: response.data.pago?.fecha_pago ? new Date(response.data.pago.fecha_pago) : null
        };
        
        setFactura(facturaProcesada);
        setLoading(false);
        
      } catch (err) {
        setError(err.response?.data?.mensaje || "Error al cargar la factura");
        setLoading(false);
        
        if (err.response?.status === 403) {
          navigate('/historial-compras');
        }
      }
    };
  
    cargarFactura();
  }, [idFactura, navigate]);

  const volverAtras = () => {
    navigate('/historial-compras');
  };

  const getEstadoIcon = (estado) => {
    switch(estado.toLowerCase()) {
      case 'pagada':
        return <CheckCircle className="estado-icon" />;
      case 'pendiente':
        return <Pending className="estado-icon" />;
      case 'completada':
        return <CheckCircle className="estado-icon" />;
      default:
        return <Receipt className="estado-icon" />;
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha || !(fecha instanceof Date) || isNaN(fecha)) return 'No disponible';
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="factura-loading">
      <div className="loading-content">
        <Receipt className="loading-icon spin" />
        <p>Cargando factura...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="factura-container">
      <Alert variant="danger" className="error-alert">
        <Pending className="alert-icon" />
        {error}
      </Alert>
      <Button onClick={volverAtras} className="btn-volver">
        <ArrowBack className="btn-icon" />
        Volver al historial
      </Button>
    </div>
  );

  if (!factura) return (
    <div className="factura-container">
      <Alert variant="info" className="empty-alert">
        <Receipt className="alert-icon" />
        No se encontró la factura
      </Alert>
      <Button onClick={volverAtras} className="btn-volver">
        <ArrowBack className="btn-icon" />
        Volver al historial
      </Button>
    </div>
  );

  return (
    <div className="factura-container">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="factura-title">
            <Receipt className="title-icon" />
            Factura #{factura.id_factura}
          </h2>
          <Button onClick={volverAtras} className="btn-volver">
            <ArrowBack className="btn-icon" />
            Volver
          </Button>
        </div>

        <Card className="factura-card mb-4">
          <Card.Body>
            <Row>
              <Col md={6} className="factura-info-section">
                <h5 className="section-title">
                  <Receipt className="section-icon" />
                  Información de Factura
                </h5>
                <div className="info-grid">
                  <div className="info-item">
                    <CalendarToday className="info-icon" />
                    <span className="info-label">Fecha:</span>
                    <span className="info-value">{formatFecha(factura.fecha)}</span>
                  </div>
                  <div className="info-item">
                    {getEstadoIcon(factura.estado)}
                    <span className="info-label">Estado:</span>
                    <span className={`info-value estado-badge estado-${factura.estado.toLowerCase()}`}>
                      {factura.estado}
                    </span>
                  </div>
                  <div className="info-item">
                    <AttachMoney className="info-icon" />
                    <span className="info-label">Total:</span>
                    <span className="info-value">${factura.total.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <AttachMoney className="info-icon" />
                    <span className="info-label">IVA:</span>
                    <span className="info-value">${factura.iva_total.toFixed(2)}</span>
                  </div>
                </div>
              </Col>
              
              <Col md={6} className="cliente-info-section">
                <h5 className="section-title">
                  <Person className="section-icon" />
                  Información del Cliente
                </h5>
                <div className="info-grid">
                  <div className="info-item">
                    <Person className="info-icon" />
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{factura.cliente.nombres} {factura.cliente.apellidos}</span>
                  </div>
                  <div className="info-item">
                    <Email className="info-icon" />
                    <span className="info-label">Email:</span>
                    <span className="info-value">{factura.cliente.email}</span>
                  </div>
                </div>
              </Col>
            </Row>

            {factura.pago && (
              <Row className="mt-4 payment-info-section">
                <Col>
                  <h5 className="section-title">
                    <Payment className="section-icon" />
                    Información de Pago
                  </h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <Payment className="info-icon" />
                      <span className="info-label">Método:</span>
                      <span className="info-value">{factura.pago.tipo_pago}</span>
                    </div>
                    <div className="info-item">
                      {getEstadoIcon(factura.pago.estado_pago)}
                      <span className="info-label">Estado:</span>
                      <span className={`info-value estado-badge estado-${factura.pago.estado_pago.toLowerCase()}`}>
                        {factura.pago.estado_pago}
                      </span>
                    </div>
                    <div className="info-item">
                      <Receipt className="info-icon" />
                      <span className="info-label">Referencia:</span>
                      <span className="info-value reference-value">
                        {factura.pago.referencia}
                      </span>
                    </div>
                    {factura.fecha_pago && (
                      <div className="info-item">
                        <CalendarToday className="info-icon" />
                        <span className="info-label">Fecha Pago:</span>
                        <span className="info-value">{formatFecha(factura.fecha_pago)}</span>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        <Card className="productos-card">
            <Card.Body>
                <h5 className="section-title">
                <ShoppingBasket className="section-icon" />
                Productos
                </h5>
                <div className="productos-list">
                {factura.productos.map((producto, index) => (
                    <div key={index} className="producto-item">
                    <Row className="align-items-center">
                        <Col xs={3} md={2} className="producto-imagen">
                        <Image 
                            src={producto.imagen || 'https://via.placeholder.com/150?text=Producto'} 
                            thumbnail 
                            fluid 
                            className="producto-img"
                        />
                        </Col>
                        <Col xs={9} md={10} className="producto-info">
                        <h6 className="producto-nombre">{producto.nombre}</h6>
                        <div className="producto-detalles">
                            <span className="producto-cantidad">{producto.cantidad}x</span>
                            <span className="producto-precio">${producto.precio_unitario.toFixed(2)} c/u</span>
                            <span className="producto-subtotal">${producto.subtotal.toFixed(2)}</span>
                        </div>
                        </Col>
                    </Row>
                    </div>
                ))}
                </div>
                <div className="productos-total">
                <div className="total-line">
                    <span className="total-label">Subtotal:</span>
                    <span className="total-value">${(factura.total - factura.iva_total).toFixed(2)}</span>
                </div>
                <div className="total-line">
                    <span className="total-label">
                    IVA ({factura.iva_total && factura.total ? 
                        Math.round((factura.iva_total / (factura.total - factura.iva_total)) * 100) : 
                        0}%):
                    </span>
                    <span className="total-value">${factura.iva_total.toFixed(2)}</span>
                </div>
                <div className="total-line grand-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">${factura.total.toFixed(2)}</span>
                </div>
                </div>
            </Card.Body>
            </Card>
                    <div className="d-flex justify-content-end mt-4">
          <Button variant="primary" className="btn-imprimir" onClick={() => window.print()}>
            <LocalPrintshop className="btn-icon" />
            Imprimir Factura
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default FacturaDetalle;