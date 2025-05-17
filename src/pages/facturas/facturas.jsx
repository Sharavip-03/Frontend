import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';

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
    id_cliente: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFilteredData(facturas);
  }, [facturas]);

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
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFactura({ ...editFactura, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editFactura.metodo_pago && !editFactura.referencia_pago) {
        throw new Error("Debe ingresar una referencia para el método de pago");
      }
      
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/PrivFactura/${editFactura.id_factura}`, editFactura, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setShowModal(false);
      fetchFacturas();
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleCancelarFactura = async (id_factura) => {
    if (!window.confirm('¿Estás seguro que deseas cancelar esta factura?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/PrivFactura/${id_factura}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchFacturas();
    } catch (error) {
      console.error("Error al cancelar la factura:", error);
      setError(error.response?.data?.message || "Error al cancelar la factura");
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
    return <div className="text-center mt-5">Cargando...</div>;
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
        <Table className="crud-table" striped bordered hover responsive>
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

        <PaginationComponent 
          data={filteredData}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <Modal show={showModal} onHide={() => setShowModal(false)} className="modal-override categoria-modal">
          <Modal.Header closeButton>
            <Modal.Title>Editar Factura</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Factura</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="fecha_factura"
                  value={editFactura.fecha_factura}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Total</Form.Label>
                <Form.Control
                  type="number"
                  name="total"
                  value={editFactura.total}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>IVA Total</Form.Label>
                <Form.Control
                  type="number"
                  name="iva_total"
                  value={editFactura.iva_total}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={editFactura.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Cancelada">Cancelada</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Fecha Vencimiento</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="fecha_vencimiento"
                  value={editFactura.fecha_vencimiento}
                  onChange={handleInputChange}
                />
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
                <Form.Group className="mb-3">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Control
                type="text"
                name="metodo_pago"
                value={editFactura.metodo_pago || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Referencia de Pago</Form.Label>
              <Form.Control
                type="text"
                name="referencia_pago"
                value={editFactura.referencia_pago || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
                <Form.Control
                  type="hidden"
                  name="id_cliente"
                  value={editFactura.id_cliente}
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