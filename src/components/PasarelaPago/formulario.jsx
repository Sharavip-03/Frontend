import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaLock, FaCreditCard, FaMoneyBillWave, FaExchangeAlt, FaTimes } from 'react-icons/fa';
import './FormularioPago.css';
import API_BASE_URL from '../../config/apiConfig';

const FormularioPago = () => {
    const { id_factura: idFacturaParam } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [factura, setFactura] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pagoInfo, setPagoInfo] = useState(null);
    const [guardarDatos, setGuardarDatos] = useState(false);
    
    const [formData, setFormData] = useState({
        id_factura: idFacturaParam || location.state?.id_factura || '',
        tipo_pago: 'tarjeta',
        titular: '',
        numero_tarjeta: '',
        fecha_expiracion: '',
        codigo_seguridad: '',
    });

    useEffect(() => {
        const cargarFactura = async () => {
            try {
                const id_factura = idFacturaParam || location.state?.id_factura;
                const token = localStorage.getItem('token');
                
                if (!id_factura) {
                    setError("No se ha especificado una factura");
                    setLoading(false);
                    return;
                }
        
                const facturaResponse = await axios.get(`${API_BASE_URL}/PrivFactura/${id_factura}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!facturaResponse.data?.factura) {
                    setError(facturaResponse.data?.mensaje || "La factura no existe o ya fue pagada");
                    setLoading(false);
                    return;
                }
                
                setFactura(facturaResponse.data.factura);
                setFormData(prev => ({ ...prev, id_factura: id_factura }));
                setLoading(false);
                
            } catch (error) {
                let errorMessage = "Error al cargar la factura";
                
                if (error.response?.status === 401) {
                    errorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    errorMessage = error.response?.data?.mensaje || errorMessage;
                }
                
                setError(errorMessage);
                setLoading(false);
            }
        };
        
        cargarFactura();
    }, [idFacturaParam, location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'numero_tarjeta') {
            const cleanedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < cleanedValue.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += cleanedValue[i];
            }
            
            setFormData({
                ...formData,
                [name]: formattedValue
            });
            return;
        }
        
        if (name === 'fecha_expiracion') {
            const cleanedValue = value.replace(/[^0-9]/g, '');
            let formattedValue = cleanedValue;
            
            if (cleanedValue.length > 2) {
                formattedValue = `${cleanedValue.substring(0, 2)}/${cleanedValue.substring(2, 4)}`;
            }
            
            setFormData({
                ...formData,
                [name]: formattedValue
            });
            return;
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (!formData.tipo_pago) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Debe seleccionar un método de pago'
                });
                return;
            }
    
            const datosPago = {
                id_factura: formData.id_factura,
                tipo_pago: formData.tipo_pago,
                titular: formData.tipo_pago === 'tarjeta' ? formData.titular : null,
                numero_tarjeta: formData.tipo_pago === 'tarjeta' ? formData.numero_tarjeta.replace(/\s+/g, '') : null,
                fecha_expiracion: formData.tipo_pago === 'tarjeta' ? formData.fecha_expiracion : null,
                codigo_seguridad: formData.tipo_pago === 'tarjeta' ? formData.codigo_seguridad : null
            };
    
            Swal.fire({
                title: 'Procesando pago',
                html: 'Por favor espera...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
    
            const response = await axios.post(`${API_BASE_URL}/api/pagos/procesar`, datosPago, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.data?.pago) {
    throw new Error('La respuesta del servidor no contiene datos de pago');
}
    
            Swal.close();
            setPagoInfo({
                referencia_pago: response.data.pago.referencia_pago || 'N/A',
                estado_pago: response.data.pago.estado_pago || 'Desconocido'
            });      
            setShowModal(true);
                        
            if (response.data.carrito_vaciado) {
                // Limpiar carrito en el estado global si es necesario
            }
            
        } catch (err) {
            Swal.close();
            
            let errorMessage = "Error al procesar el pago";
            
            if (err.response?.status === 401) {
                errorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                errorMessage = err.response?.data?.mensaje || 
                              err.response?.data?.error || 
                              `Error del servidor (${err.response?.status})`;
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    };

    const cancelarPago = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/pagos/cancelar/${formData.id_factura}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al cancelar el pago");
        }
    };

    if (loading) return (
        <div className="payment-loading">
            <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="payment-container">
            <Alert variant="danger" className="payment-error">{error}</Alert>
        </div>
    );
    
    if (!factura) return (
        <div className="payment-container">
            <Alert variant="warning">No se encontró la factura</Alert>
        </div>
    );

    return (
        <div className="payment-container">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <Card className="payment-card">
                            <Card.Header className="payment-header">
                                <Card.Title className="payment-title">
                                    {formData.tipo_pago === 'tarjeta' ? <FaCreditCard className="me-2" /> : 
                                     formData.tipo_pago === 'efectivo' ? <FaMoneyBillWave className="me-2" /> : 
                                     <FaExchangeAlt className="me-2" />}
                                    Formulario de Pago
                                </Card.Title>
                                <Button 
                                    variant="link" 
                                    className="payment-cancel-btn"
                                    onClick={cancelarPago}
                                >
                                    <FaTimes /> Cancelar
                                </Button>
                            </Card.Header>
                            
                            <Card.Body className="payment-body">
                                <div className="invoice-details">
                                    <h5 className="invoice-details-title">Detalles de la Factura</h5>
                                    <div className="invoice-detail">
                                        <span className="invoice-detail-label">Número:</span>
                                        <span className="invoice-detail-value">#{factura.id_factura}</span>
                                    </div>
                                    <div className="invoice-detail">
                                        <span className="invoice-detail-label">Subtotal:</span>
                                        <span className="invoice-detail-value">${factura.total.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-detail">
                                        <span className="invoice-detail-label">IVA:</span>
                                        <span className="invoice-detail-value">${factura.iva_total.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-detail invoice-total">
                                        <span className="invoice-detail-label">Total:</span>
                                        <span className="invoice-detail-value">${(factura.total + factura.iva_total).toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <Form onSubmit={handleSubmit} className="payment-form">
                                    <Form.Group className="mb-4">
                                        <Form.Label>Método de pago</Form.Label>
                                        <Form.Select 
                                            name="tipo_pago"
                                            value={formData.tipo_pago}
                                            onChange={handleInputChange}
                                            className="payment-method-select"
                                        >
                                            <option value="tarjeta">Tarjeta de crédito/débito</option>
                                            <option value="efectivo">Pago en efectivo</option>
                                            <option value="transferencia">Transferencia bancaria</option>
                                        </Form.Select>
                                    </Form.Group>
                                    
                                    {formData.tipo_pago === 'tarjeta' && (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Titular de la tarjeta</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="titular"
                                                    value={formData.titular}
                                                    onChange={handleInputChange}
                                                    placeholder="Nombre como aparece en la tarjeta"
                                                    required
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label>Número de tarjeta</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="numero_tarjeta"
                                                    value={formData.numero_tarjeta}
                                                    onChange={handleInputChange}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                    required
                                                />
                                            </Form.Group>
                                            
                                            <Row className="mb-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Fecha de expiración (MM/AA)</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="fecha_expiracion"
                                                            value={formData.fecha_expiracion}
                                                            onChange={handleInputChange}
                                                            placeholder="MM/AA"
                                                            maxLength="5"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Código de seguridad</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="codigo_seguridad"
                                                            value={formData.codigo_seguridad}
                                                            onChange={handleInputChange}
                                                            placeholder="CVC/CVV"
                                                            maxLength="4"
                                                            required
                                                        />
                                                        <div className="security-info">
                                                            <FaLock />
                                                            <span>Los 3 dígitos en el reverso de tu tarjeta</span>
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            
                                            <Form.Group className="mb-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Guardar información de tarjeta para futuras compras"
                                                    checked={guardarDatos}
                                                    onChange={(e) => setGuardarDatos(e.target.checked)}
                                                    id="save-card-info"
                                                />
                                            </Form.Group>
                                        </>
                                    )}
                                    
                                    {formData.tipo_pago === 'efectivo' && (
                                        <Alert variant="info" className="payment-alert">
                                            <FaMoneyBillWave className="me-2" size={24} />
                                            <div>
                                                <strong>Pago en efectivo</strong><br />
                                                Al seleccionar esta opción, deberás acercarte a nuestra tienda para completar el pago.<br />
                                                <strong>Dirección: Carrera 123</strong><br />

                                            </div>
                                        </Alert>
                                    )}
                                    
                                    {formData.tipo_pago === 'transferencia' && (
                                        <Alert variant="info" className="payment-alert">
                                            <FaExchangeAlt className="me-2" size={24} />
                                            <div>
                                                <strong>Transferencia bancaria</strong><br />
                                                Por favor realiza la transferencia a la siguiente cuenta:<br />
                                                Banco: Banco123<br />
                                                Cuenta: 123456789<br />
                                                CLAVE: 012345678912345678<br />
                                                A nombre de: El Escondite Animal<br />
                                                <strong>Importante:</strong> Incluye el número de factura como referencia.
                                            </div>
                                        </Alert>
                                    )}
                                    
                                    <div className="payment-actions">
                                        <Button variant="primary" type="submit" className="payment-submit-btn">
                                            {formData.tipo_pago === 'tarjeta' ? 'Pagar ahora' : 'Confirmar método de pago'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                
                <Modal show={showModal} onHide={() => {
                    setShowModal(false);
                    navigate('/');
                }} className="payment-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>Pago procesado</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {pagoInfo ? (
                            <>
                                <div className="payment-result">
                                    <div className="result-item">
                                        <span className="result-label">Referencia:</span>
                                        <span className="result-value">{pagoInfo.referencia_pago || 'No disponible'}</span>
                                    </div>
                                    <div className="result-item">
                                        <span className="result-label">Estado:</span>
                                        <span className={`result-value estado-${pagoInfo.estado_pago?.toLowerCase() || 'desconocido'}`}>
                                            {pagoInfo.estado_pago || 'Desconocido'}
                                        </span>
                                    </div>
                                </div>

                                {pagoInfo.estado_pago === 'Pagada' && (
                                    <Alert variant="success" className="payment-alert">
                                        Tu pago ha sido aprobado.
                                    </Alert>
                                )}
                                {pagoInfo.estado_pago === 'Pendiente' && (
                                    <Alert variant="warning" className="payment-alert">
                                        Tu pago está pendiente. Por favor completa el proceso según el método seleccionado.
                                    </Alert>
                                )}
                            </>
                        ) : (
                            <Alert variant="danger">No se recibió información del pago</Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="Colores-secu">
                            <Button 
                                onClick={() => navigate('/historial-compras')}
                                className="btn-naranja"
                            >
                                Ir al historial de compras
                            </Button>
                            <Button className="cerrar" onClick={() => {
                                setShowModal(false);
                                navigate('/');
                            }}>
                                Cerrar
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default FormularioPago;