import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Badge } from 'react-bootstrap';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';
import Swal from 'sweetalert2';

const AdminFacturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [editFactura, setEditFactura] = useState({
    id_factura: '',
    fecha_factura: '',
    total: '',
    iva_total: '',
    estado: 'Pendiente',
    fecha_vencimiento: '',
    id_cliente: '',
    metodo_pago: '',
    referencia_pago: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFilteredData(facturas);
  }, [facturas]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!editFactura.fecha_factura) {
      newErrors.fecha_factura = 'La fecha de factura es requerida';
    }
    
    if (!editFactura.total || editFactura.total <= 0) {
      newErrors.total = 'El total debe ser mayor a 0';
    }
    
    if (editFactura.iva_total && editFactura.iva_total < 0) {
      newErrors.iva_total = 'El IVA no puede ser negativo';
    }
    
    if (!editFactura.estado) {
      newErrors.estado = 'El estado es requerido';
    }
    
    if (editFactura.estado === 'Pagada' && !editFactura.metodo_pago) {
      newErrors.metodo_pago = 'El método de pago es requerido para facturas pagadas';
    }
    
    if (editFactura.fecha_vencimiento && editFactura.fecha_factura) {
      const fechaFactura = new Date(editFactura.fecha_factura);
      const fechaVencimiento = new Date(editFactura.fecha_vencimiento);
      
      if (fechaVencimiento < fechaFactura) {
        newErrors.fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a la fecha de factura';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFactura({ ...editFactura, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const facturasResponse = await axios.get(`${API_BASE_URL}/PrivFactura?expand=cliente,pago`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const facturasConPago = facturasResponse.data.facturas.map(f => ({
          ...f,
          metodo_pago: f.metodo_pago || f.formulario_pago?.tipo_pago || (f.estado === 'Pagada' ? 'Efectivo' : 'N/A'),
          referencia_pago: f.referencia_pago || f.formulario_pago?.referencia_pago || 
                          (f.estado === 'Pagada' ? 'Sin referencia' : 'N/A')
        }));
        
        setFacturas(facturasConPago || []);
        
        const clientesResponse = await axios.get(`${API_BASE_URL}/Priv`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setClientes(clientesResponse.data.usuarios || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Error al cargar los datos");
        setFacturas([]);
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const fetchFacturas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/PrivFactura?expand=cliente,pago`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setFacturas(response.data.facturas.map(f => ({
        ...f,
        metodo_pago: f.metodo_pago || f.formulario_pago?.tipo_pago || 'Efectivo',
        referencia_pago: f.referencia_pago || f.formulario_pago?.referencia_pago
      })));
    } catch (error) {
      console.error("Error al obtener las facturas:", error);
      setError(error.response?.data?.message || "Error al cargar facturas");
    }
  };

  const handleEditFactura = (factura) => {
    setEditFactura({ 
      ...factura,
      fecha_factura: factura.fecha_factura ? factura.fecha_factura.slice(0, 16) : '',
      fecha_vencimiento: factura.fecha_vencimiento ? factura.fecha_vencimiento.slice(0, 16) : '',
      cliente: factura.cliente || clientes.find(c => c.id_usuario === factura.id_cliente),
      metodo_pago: factura.metodo_pago || factura.formulario_pago?.tipo_pago || 'Efectivo',
      referencia_pago: factura.referencia_pago || factura.formulario_pago?.referencia_pago
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/PrivFactura/${editFactura.id_factura}`, editFactura, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setShowModal(false);
      fetchFacturas();
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Factura actualizada correctamente'
      });
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message
      });
    }
  };

  const handleCancelarFactura = async (id_factura) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cancelar esta factura?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/PrivFactura/${id_factura}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchFacturas();
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Factura cancelada correctamente'
      });
    } catch (error) {
      console.error("Error al cancelar la factura:", error);
      setError(error.response?.data?.message || "Error al cancelar la factura");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || "Error al cancelar la factura"
      });
    }
  };
  
  const getClienteNombre = (id_cliente, factura) => {
    if (factura.cliente) {
      return `${factura.cliente.nombres} ${factura.cliente.apellidos}`;
    }
    
    const cliente = clientes.find(c => c.id_usuario == id_cliente);
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : `Cliente ID: ${id_cliente}`;
  };
  
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Pagada':
        return <Badge bg="success">{estado}</Badge>;
      case 'Cancelada':
        return <Badge bg="danger">{estado}</Badge>;
      case 'Pendiente':
        return <Badge bg="warning" text="dark">{estado}</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Menu />
        <div className="content-container text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p>Cargando facturas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <Menu />
        <div className="content-container">
          <Alert variant="danger">
            <Alert.Heading>Error al cargar las facturas</Alert.Heading>
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Facturas Registradas</h1>
        <SearchComponent 
          data={facturas}
          setFilteredData={setFilteredData}
          searchFields={['fecha', 'id_factura', 'Cliente', 'total', 'iva_total', 'estado', 'metodo_pago', 'referencia_pago', 'vencimiento']}
        />
        <div className="crud-table-container">
        <Table className="crud-table" responsive={false}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>IVA</th>
              <th>Estado</th>
              <th>Método Pago</th>
              <th>Referencia</th>
              <th>Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((factura) => (
                  <tr key={factura.id_factura}>
                    <td>{factura.id_factura}</td>
                    <td>{factura.fecha_factura ? new Date(factura.fecha_factura).toLocaleString() : 'N/A'}</td>
                    <td>{getClienteNombre(factura.id_cliente, factura)}</td>
                    <td>${factura.total?.toLocaleString() || '0'}</td>
                    <td>${factura.iva_total?.toLocaleString() || '0'}</td>
                    <td>{getEstadoBadge(factura.estado)}</td>
                    <td>{factura.metodo_pago || 'N/A'}</td>
                    <td>{factura.referencia_pago ? <small><code>{factura.referencia_pago}</code></small> : 'N/A'}</td>
                    <td>{factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Button 
                        className="crud-btn crud-btn-warning me-2" 
                        onClick={() => handleEditFactura(factura)}
                      >
                        Editar
                      </Button>
                      {factura.estado === 'Pendiente' && (
                        <Button 
                          className="crud-btn crud-btn-danger"
                          onClick={() => handleCancelarFactura(factura.id_factura)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">No hay facturas disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>
        </div>
        

        <PaginationComponent 
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

<Modal show={showModal} onHide={() => setShowModal(false)} className="modal-override categoria-modal">
  <Modal.Header closeButton>
    <Modal.Title>Editar Factura</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formFechaFactura">
        <Form.Label>Fecha Factura *</Form.Label>
        <Form.Control
          type="datetime-local"
          name="fecha_factura"
          className={errors.fecha_factura ? 'is-invalid' : ''}
          value={editFactura.fecha_factura}
          onChange={handleInputChange}
          required
          title="Fecha y hora de la factura. Campo obligatorio."
        />
        {errors.fecha_factura && <div className="invalid-feedback">{errors.fecha_factura}</div>}
        <Form.Text className="text-muted">
          Fecha y hora de emisión de la factura. Campo obligatorio.
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formTotalFactura">
        <Form.Label>Total *</Form.Label>
        <Form.Control
          type="number"
          name="total"
          className={errors.total ? 'is-invalid' : ''}
          value={editFactura.total}
          onChange={handleInputChange}
          required
          step="0.01"
          min="0"
          title="Valor total de la factura. Debe ser mayor a 0. Campo obligatorio."
        />
        {errors.total && <div className="invalid-feedback">{errors.total}</div>}
        <Form.Text className="text-muted">
          Valor total de la factura (mayor a 0). Campo obligatorio.
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formIvaFactura">
        <Form.Label>IVA Total</Form.Label>
        <Form.Control
          type="number"
          name="iva_total"
          className={errors.iva_total ? 'is-invalid' : ''}
          value={editFactura.iva_total}
          onChange={handleInputChange}
          step="0.01"
          min="0"
          title="Valor del IVA. No puede ser negativo."
        />
        {errors.iva_total && <div className="invalid-feedback">{errors.iva_total}</div>}
        <Form.Text className="text-muted">
          Valor total del IVA calculado (no negativo).
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formEstadoFactura">
        <Form.Label>Estado *</Form.Label>
        <Form.Select
          name="estado"
          className={errors.estado ? 'is-invalid' : ''}
          value={editFactura.estado}
          onChange={handleInputChange}
          required
          title="Estado de la factura. Campo obligatorio."
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Pagada">Pagada</option>
          <option value="Cancelada">Cancelada</option>
        </Form.Select>
        {errors.estado && <div className="invalid-feedback">{errors.estado}</div>}
        <Form.Text className="text-muted">
          Estado actual de la factura. Campo obligatorio.
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formFechaVencimiento">
        <Form.Label>Fecha Vencimiento</Form.Label>
        <Form.Control
          type="datetime-local"
          name="fecha_vencimiento"
          className={errors.fecha_vencimiento ? 'is-invalid' : ''}
          value={editFactura.fecha_vencimiento}
          onChange={handleInputChange}
          title="Fecha de vencimiento del pago (opcional). No puede ser anterior a la fecha de factura."
        />
        {errors.fecha_vencimiento && <div className="invalid-feedback">{errors.fecha_vencimiento}</div>}
        <Form.Text className="text-muted">
          Fecha límite de pago (opcional). No puede ser anterior a la fecha de factura.
        </Form.Text>
      </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Cliente</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    editFactura.cliente 
                      ? `${editFactura.cliente.nombres} ${editFactura.cliente.apellidos}`
                      : `Cliente ID: ${editFactura.id_cliente}`
                  }
                  readOnly
                />
                <Form.Control
                  type="hidden"
                  name="id_cliente"
                  value={editFactura.id_cliente}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Método de Pago {editFactura.estado === 'Pagada' && '*'}</Form.Label>
                <Form.Control
                  type="text"
                  name="metodo_pago"
                  className={errors.metodo_pago ? 'is-invalid' : ''}
                  value={editFactura.metodo_pago || ''}
                  onChange={handleInputChange}
                  required
                  readOnly
                />
                {errors.metodo_pago && <div className="invalid-feedback">{errors.metodo_pago}</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Referencia de Pago</Form.Label>
                <Form.Control
                  type="text"
                  name="referencia_pago"
                  value={editFactura.referencia_pago || ''}
                  onChange={handleInputChange}
                  readOnly
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminFacturas;