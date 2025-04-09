import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const apiUrl = 'http://localhost:5000';

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
        
                if (!token) {
                    setError("No estás autenticado. Por favor inicia sesión.");
                    setLoading(false);
                    navigate('/login');
                    return;
                }
        
                console.log("Intentando cargar factura con ID:", id_factura);
                const facturaResponse = await axios.get(`${apiUrl}/PrivFactura/${id_factura}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                console.log("Respuesta del servidor:", facturaResponse.data);
                
                if (!facturaResponse.data?.factura) {
                    setError(facturaResponse.data?.mensaje || "La factura no existe o ya fue pagada");
                    setLoading(false);
                    return;
                }
                
                setFactura(facturaResponse.data.factura);
                setFormData(prev => ({ ...prev, id_factura: id_factura }));
                setLoading(false);
                
            } catch (error) {
                console.error("Error al cargar factura:", error);
                
                let errorMessage = "Error al cargar la factura";
                
                if (error.response) {
                    // Si el backend devuelve un mensaje de error, usarlo
                    errorMessage = error.response.data?.mensaje || error.response.data?.error || errorMessage;
                    
                    if (error.response.status === 401) {
                        errorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
                        localStorage.removeItem('token');
                        navigate('/login');
                    }
                }
                
                setError(errorMessage);
                setLoading(false);
            }
        };
        
        cargarFactura();
    }, [idFacturaParam, location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Formatear número de tarjeta para mostrar espacios cada 4 dígitos
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
        
        // Formatear fecha de expiración (MM/YY)
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
            // Validar que tipo_pago no sea null o vacío
            if (!formData.tipo_pago) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Debe seleccionar un método de pago'
                });
                return;
            }
    
            // Preparar datos para enviar - estructura explícita
            const datosPago = {
                id_factura: formData.id_factura,
                tipo_pago: formData.tipo_pago, // Asegurar que este campo tenga valor
                titular: formData.tipo_pago === 'tarjeta' ? formData.titular : null,
                numero_tarjeta: formData.tipo_pago === 'tarjeta' ? formData.numero_tarjeta.replace(/\s+/g, '') : null,
                fecha_expiracion: formData.tipo_pago === 'tarjeta' ? formData.fecha_expiracion : null,
                codigo_seguridad: formData.tipo_pago === 'tarjeta' ? formData.codigo_seguridad : null
            };
    
            // Mostrar loading
            Swal.fire({
                title: 'Procesando pago',
                html: 'Por favor espera...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
    
            // Enviar datos al backend
            const response = await axios.post(`${apiUrl}/api/pagos/procesar`, datosPago, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            // Procesar respuesta exitosa
            Swal.fire({
                icon: 'success',
                title: 'Pago exitoso',
                text: 'Tu transacción ha sido procesada correctamente'
            });
    
        } catch (err) {
            console.error("Error en el proceso de pago:", err);
            Swal.close(); // Cerrar loading si hay error
            
            let errorMessage = "Error al procesar el pago";
            
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
                    localStorage.removeItem('token');
                    localStorage.removeItem('id');
                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Sesión expirada',
                        text: errorMessage,
                        willClose: () => {
                            navigate('/login');
                        }
                    });
                    return;
                } else {
                    errorMessage = err.response.data?.mensaje || 
                                  err.response.data?.error || 
                                  `Error del servidor (${err.response.status})`;
                }
            } else if (err.code === "ERR_NETWORK") {
                errorMessage = "Error de conexión. Por favor verifica tu conexión a internet.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!factura) return <Alert variant="warning">No se encontró la factura</Alert>;

    return (
        <div className="admin-container">
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header as="h5">Formulario de Pago</Card.Header>
                            <Card.Body>
                                <Card.Title>Factura #{factura.id_factura}</Card.Title>
                                <Card.Text>
                                    <strong>Total a pagar:</strong> ${factura.total.toFixed(2)}<br />
                                    <strong>IVA:</strong> ${factura.iva_total.toFixed(2)}<br />
                                    <strong>Total con IVA:</strong> ${(factura.total + factura.iva_total).toFixed(2)}
                                </Card.Text>
                                
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Método de pago</Form.Label>
                                        <Form.Select 
                                            name="tipo_pago"
                                            value={formData.tipo_pago}
                                            onChange={handleInputChange}
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
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Guardar información de tarjeta para futuras compras"
                                                    checked={guardarDatos}
                                                    onChange={(e) => setGuardarDatos(e.target.checked)}
                                                />
                                            </Form.Group>
                                        </>
                                    )}
                                    
                                    {formData.tipo_pago === 'efectivo' && (
                                        <Alert variant="info">
                                            Al seleccionar pago en efectivo, deberás acercarte a una de nuestras sucursales para completar el pago.
                                        </Alert>
                                    )}
                                    
                                    {formData.tipo_pago === 'transferencia' && (
                                        <Alert variant="info">
                                            Por favor realiza la transferencia a la siguiente cuenta:<br />
                                            Banco: TuBanco<br />
                                            Cuenta: 123456789<br />
                                            CLABE: 012345678912345678<br />
                                            A nombre de: TuEmpresa SA de CV<br />
                                            <strong>Importante:</strong> Incluye el número de factura como referencia.
                                        </Alert>
                                    )}
                                    
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    
                                    <div className="d-grid gap-2">
                                        <Button variant="primary" type="submit" size="lg">
                                            {formData.tipo_pago === 'tarjeta' ? 'Pagar ahora' : 'Confirmar método de pago'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                
                {/* Modal de confirmación */}
                <Modal show={showModal} onHide={() => {
                    setShowModal(false);
                    navigate('/'); // Redirigir al inicio después de cerrar
                }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Pago procesado</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {pagoInfo && (
                            <>
                                <p><strong>Referencia:</strong> {pagoInfo.referencia_pago}</p>
                                <p><strong>Estado:</strong> {pagoInfo.estado_pago}</p>
                                {pagoInfo.estado_pago === 'Aprobado' && (
                                    <Alert variant="success">
                                        Tu pago ha sido aprobado. Hemos enviado un correo con los detalles de tu compra.
                                    </Alert>
                                )}
                                {pagoInfo.estado_pago === 'Pendiente' && (
                                    <Alert variant="warning">
                                        Tu pago está pendiente. Por favor completa el proceso según el método seleccionado.
                                    </Alert>
                                )}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setShowModal(false);
                            navigate('/');
                        }}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default FormularioPago;