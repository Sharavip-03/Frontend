import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Container, Alert, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { 
  Receipt, 
  Paid, 
  Pending, 
  CheckCircle, 
  Cancel, 
  ArrowBack, 
  ShoppingBag,
  Payment,
  CalendarToday,
  AttachMoney,
  CreditCard,
  LocalAtm
} from '@mui/icons-material';
import './HistorialCompras.css';

const HistorialCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/compras/historial', {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Procesar datos para asegurar que tenemos la referencia
        const comprasProcesadas = response.data.compras.map(compra => {
            // Usar la misma estructura que en el detalle
            const referencia = compra.pago?.referencia || 
                             compra.referencia_pago || 
                             'Sin referencia';
            
            // Convertir la fecha ISO a objeto Date
            const fechaFactura = compra.fecha ? new Date(compra.fecha) : new Date();
            
            return {
              ...compra,
              referencia_pago: referencia,
              metodo_pago: compra.metodo_pago || compra.pago?.tipo_pago || 'No especificado',
              fecha_factura: fechaFactura
            };
          });

        setCompras(comprasProcesadas);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.mensaje || "Error al cargar el historial");
        setLoading(false);
      }
    };

    cargarHistorial();
  }, []);

  const handleCancelarCompra = async (idFactura) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción cancelará la compra y no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF8C00',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/pagos/cancelar/${idFactura}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCompras(compras.filter(compra => compra.id_factura !== idFactura));
        
        Swal.fire(
          'Cancelada',
          'La compra ha sido cancelada correctamente',
          'success'
        );
      } catch (err) {
        Swal.fire(
          'Error',
          err.response?.data?.mensaje || "Error al cancelar la compra",
          'error'
        );
      }
    }
  };

  const reintentarPago = (idFactura) => {
    navigate(`/pago/${idFactura}`);
  };

  const verDetalle = (idFactura) => {
    if (!idFactura || isNaN(Number(idFactura))) {
      Swal.fire('Error', 'ID de factura no válido', 'error');
      return;
    }
    navigate(`/factura/${idFactura}`);
  };

  const volverAtras = () => {
    navigate(`/`);
  };

  const getEstadoIcon = (estado) => {
    switch(estado.toLowerCase()) {
      case 'pagada':
        return <Paid className="estado-icon" />;
      case 'pendiente':
        return <Pending className="estado-icon" />;
      case 'completada':
        return <CheckCircle className="estado-icon" />;
      default:
        return <Receipt className="estado-icon" />;
    }
  };

  const getMetodoPagoIcon = (metodo) => {
    if (metodo.toLowerCase().includes('tarjeta')) {
      return <CreditCard className="info-icon" />;
    } else if (metodo.toLowerCase().includes('efectivo')) {
      return <LocalAtm className="info-icon" />;
    } else {
      return <Payment className="info-icon" />;
    }
  };

  if (loading) return (
    <div className="historial-loading">
      <div className="loading-content">
        <ShoppingBag className="loading-icon spin" />
        <p>Cargando tu historial...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="historial-container">
      <Alert variant="danger" className="error-alert">
        <Cancel className="alert-icon" />
        {error}
      </Alert>
    </div>
  );

  return (
    <div className="historial-container">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="historial-title">
            <Receipt className="title-icon" />
            Historial de Compras
          </h2>
          <Button 
            onClick={volverAtras}
            className="volver-btn"
          >
            <ArrowBack className="btn-icon" />
            Volver
          </Button>
        </div>

        {compras.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag className="empty-icon" />
            <Alert variant="info" className="empty-alert">
              No tienes compras registradas
            </Alert>
          </div>
        ) : (
          <div className="compras-list">
            {compras.map(compra => (
              <Card key={compra.id_factura} className={`compra-card ${compra.estado.toLowerCase()}`}>
                <Card.Body>
                  <div className="compra-header">
                    <div className="factura-info">
                      {getEstadoIcon(compra.estado)}
                      <h4>Factura #{compra.id_factura}</h4>
                    </div>
                    <span className={`estado-badge estado-${compra.estado.toLowerCase()}`}>
                      {compra.estado}
                    </span>
                  </div>
                  
                  <div className="compra-info">
                  <div className="info-item">
                    <CalendarToday className="info-icon" />
                    <span className="info-label">Fecha:</span>
                    <span>
                      {compra.fecha_factura instanceof Date && !isNaN(compra.fecha_factura) 
                        ? compra.fecha_factura.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Fecha no disponible'}
                    </span>
                  </div>
                    <div className="info-item">
                      <AttachMoney className="info-icon" />
                      <span className="info-label">Total:</span>
                      <span>${compra.total.toFixed(2)}</span>
                    </div>
                    <div className="info-item">
                      {getMetodoPagoIcon(compra.metodo_pago)}
                      <span className="info-label">Método:</span>
                      <span>{compra.metodo_pago}</span>
                    </div>
                    <div className="info-item">
                      <Receipt className="info-icon" />
                      <span className="info-label">Referencia:</span>
                      <span className="reference-value">
                        {compra.referencia_pago}
                      </span>
                    </div>
                  </div>
                                    
                  <div className="compra-productos">
                    <h5>
                      <ShoppingBag className="productos-icon" />
                      Productos:
                    </h5>
                    <ul>
                      {compra.productos.map((producto, index) => (
                        <li key={index}>
                          <span className="producto-cantidad">{producto.cantidad}x</span>
                          <span className="producto-nombre">{producto.producto}</span>
                          <span className="producto-subtotal">${producto.subtotal.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                                
                  <div className="compra-acciones">
                  {compra.estado === "Pendiente" && (
                      <>
                      {compra.metodo_pago === "Efectivo" ? (
                          <>
                          <Button 
                              onClick={() => verDetalle(compra.id_factura)}
                              className="btn-azul"
                          >
                              <Receipt className="btn-icon" />
                              Ver Detalle
                          </Button>
                          <Button 
                              onClick={() => handleCancelarCompra(compra.id_factura)}
                              className="btn-rojo"
                          >
                              <Cancel className="btn-icon" />
                              Cancelar
                          </Button>
                          </>
                      ) : (
                          <>
                          <Button 
                              onClick={() => reintentarPago(compra.id_factura)}
                              className="btn-naranja"
                          >
                              <Payment className="btn-icon" />
                              Completar Pago
                          </Button>
                          <Button 
                              onClick={() => handleCancelarCompra(compra.id_factura)}
                              className="btn-rojo"
                          >
                              <Cancel className="btn-icon" />
                              Cancelar
                          </Button>
                          </>
                      )}
                      </>
                  )}
                  
                  {(compra.estado === "Pagada" || compra.estado === "Completada") && (
                      <Button 
                      onClick={() => verDetalle(compra.id_factura)}
                      className="btn-azul"
                      >
                      <Receipt className="btn-icon" />
                      Ver Detalle
                      </Button>
                  )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default HistorialCompras;