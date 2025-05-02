import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Container, Alert, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
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
        
        setCompras(response.data.compras);
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
    navigate(`/factura/${idFactura}`);
  };

  const volverAtras = () => {
    navigate(`/`); // Vuelve a la página anterior
  };

  if (loading) return (
    <div className="historial-loading">
      <div className="spinner-border text-warning" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="historial-container">
      <Alert variant="danger">{error}</Alert>
    </div>
  );

  return (
    <div className="historial-container">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="historial-title">Historial de Compras</h2>
          <Button 
            onClick={volverAtras}
            className="volver-btn"
          >
            Volver
          </Button>
        </div>
        
        {compras.length === 0 ? (
          <Alert variant="info">No tienes compras registradas</Alert>
        ) : (
          <div className="compras-list">
            {compras.map(compra => (
              <Card key={compra.id_factura} className={`compra-card ${compra.estado.toLowerCase()}`}>
                <Card.Body>
                <div className="compra-header">
                    <h4>Factura #{compra.id_factura}</h4>
                    <span className={`estado-badge estado-${compra.estado.toLowerCase()}`}>
                        {compra.estado}
                    </span>
                    </div>
                  
                  <div className="compra-info">
                    <div>
                      <span className="info-label">Fecha:</span>
                      <span>{new Date(compra.fecha).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="info-label">Total:</span>
                      <span>${compra.total.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="info-label">Método:</span>
                      <span>{compra.metodo_pago}</span>
                    </div>
                  </div>
                  
                  <div className="compra-productos">
                    <h5>Productos:</h5>
                    <ul>
                      {compra.productos.map((producto, index) => (
                        <li key={index}>
                          {producto.cantidad}x {producto.producto} - ${producto.subtotal.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="compra-acciones">
                    {compra.estado === "Pendiente" && (
                      <>
                        <Button 
                          onClick={() => reintentarPago(compra.id_factura)}
                          className="btn-naranja"
                        >
                          Completar Pago
                        </Button>
                        <Button 
                          onClick={() => handleCancelarCompra(compra.id_factura)}
                          className="btn-rojo"
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    
                    {compra.estado === "Pagada" && (
                      <>
                        <Button 
                          onClick={() => verDetalle(compra.id_factura)}
                          className="btn-azul"
                        >
                          Ver Detalle
                        </Button>
                        <Button 
                          variant="success" 
                          className="btn-verde"
                        >
                          Descargar Factura
                        </Button>
                      </>
                    )}
                    
                    {compra.estado === "Completada" && (
                      <Button 
                        onClick={() => verDetalle(compra.id_factura)}
                        className="btn-info"
                      >
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