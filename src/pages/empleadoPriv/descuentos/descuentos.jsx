import React, { useState, useEffect } from 'react';
import './descuentos.css';
import { Table, Button, Modal, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import MenuEmp from '../../../components/AdminNavbar/empleado';
import API_BASE_URL from '../../../config/apiConfig';
import { SearchComponent } from '../../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../../buscador/ParaCruds/PaginationComponent';
import Swal from 'sweetalert2';

const EmpDescuentos = () => {
  const [descuentos, setDescuentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [marca, setMarca] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isNewDescuento, setIsNewDescuento] = useState(false);
  const [editDescuento, setEditDescuento] = useState({
    id_descuento: '',
    id_producto: '',
    porcentaje_descuento: 0,
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!editDescuento.id_producto) {
      newErrors.id_producto = 'Seleccione un producto';
    } else if (isNewDescuento) {
      // Verificar si ya existe un descuento para este producto
      const descuentoExistente = descuentos.find(d => 
        d.id_producto == editDescuento.id_producto
      );
      if (descuentoExistente) {
        newErrors.id_producto = 'Ya existe un descuento para este producto';
      }
    }
    if (!editDescuento.porcentaje_descuento || editDescuento.porcentaje_descuento <= 0) {
      newErrors.porcentaje_descuento = 'El porcentaje debe ser mayor a 0';
    } else if (editDescuento.porcentaje_descuento > 100) {
      newErrors.porcentaje_descuento = 'El porcentaje no puede ser mayor a 100';
    }
    
    if (editDescuento.fecha_inicio && editDescuento.fecha_fin) {
      const fechaInicio = new Date(editDescuento.fecha_inicio);
      const fechaFin = new Date(editDescuento.fecha_fin);
      
      if (fechaFin < fechaInicio) {
        newErrors.fecha_fin = 'La fecha fin no puede ser anterior a la fecha inicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDescuento({ ...editDescuento, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProductos();
      await fetchDescuentos();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProductoDetails = async () => {
      if (editDescuento.id_producto) {
        const producto = productos.find(p => p.id_producto == editDescuento.id_producto);
        setProductoSeleccionado(producto || null);
        
        if (producto) {
          try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            if (producto.id_marca) {
              const marcaResponse = await axios.get(`${API_BASE_URL}/PrivMarca/${producto.id_marca}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setMarca(marcaResponse.data.marca);
            }
            
            if (producto.id_categoria) {
              const categoriaResponse = await axios.get(`${API_BASE_URL}/categoria/${producto.id_categoria}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setCategoria(categoriaResponse.data.categoria || categoriaResponse.data);
            }
          } catch (error) {
            console.error("Error al obtener detalles:", error);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setProductoSeleccionado(null);
        setMarca(null);
        setCategoria(null);
      }
    };

    fetchProductoDetails();
  }, [editDescuento.id_producto, productos]);

  const fetchDescuentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/descuentosProd`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const descuentosConProducto = response.data.descuentos.map(descuento => {
        if (!descuento.producto && descuento.id_producto) {
          const productoEncontrado = productos.find(p => p.id_producto === descuento.id_producto);
          return {
            ...descuento,
            producto: productoEncontrado || { 
              nombre: 'Producto no encontrado', 
              id_producto: descuento.id_producto,
              precio: 0,
              imagen: null
            }
          };
        }
        return descuento;
      });
      
      setDescuentos(descuentosConProducto);
    } catch (error) {
      console.error("Error al obtener descuentos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al cargar descuentos: ${error.response?.data?.mensaje || error.message}`
      });
    }
  };

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/PrivProd`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(response.data.productos || []);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al cargar productos: ${error.response?.data?.mensaje || error.message}`
      });
    }
  };

  const handleAddDescuento = () => {
    setIsNewDescuento(true);
    setEditDescuento({ 
      id_descuento: '', 
      id_producto: '', 
      porcentaje_descuento: 0, 
      fecha_inicio: '', 
      fecha_fin: '' 
    });
    setProductoSeleccionado(null);
    setMarca(null);
    setCategoria(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEditDescuento = (descuento) => {
    setIsNewDescuento(false);
    setEditDescuento({ 
      ...descuento,
      fecha_inicio: descuento.fecha_inicio ? descuento.fecha_inicio.split('T')[0] : '',
      fecha_fin: descuento.fecha_fin ? descuento.fecha_fin.split('T')[0] : ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem("token");
      const descuentoData = {
        id_producto: Number(editDescuento.id_producto),
        porcentaje_descuento: Number(editDescuento.porcentaje_descuento),
        fecha_inicio: editDescuento.fecha_inicio || null,
        fecha_fin: editDescuento.fecha_fin || null
      };
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
  
      if (isNewDescuento) {
        await axios.post(`${API_BASE_URL}/descuentosProd`, descuentoData, config);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Descuento creado exitosamente'
        });
      } else {
        await axios.put(`${API_BASE_URL}/descuentosProd/${editDescuento.id_descuento}`, descuentoData, config);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Descuento actualizado exitosamente'
        });
      }
      
      setShowModal(false);
      await fetchProductos();
      await fetchDescuentos();
      
    } catch (error) {
      console.error("Error al procesar descuento:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al ${isNewDescuento ? 'crear' : 'actualizar'} descuento: ${error.response?.data?.mensaje || error.message}`
      });
    }
  };

  const filterDescuentos = (term) => {
    if (!term) return descuentos || [];
    
    return (descuentos || []).filter(descuento => {
      const producto = descuento.producto || productos.find(p => p.id_producto === descuento.id_producto);
      const productoNombre = producto?.nombre?.toLowerCase() || '';
      const descuentoPorcentaje = descuento.porcentaje_descuento.toString();
      
      return (
        productoNombre.includes(term.toLowerCase()) ||
        descuentoPorcentaje.includes(term) ||
        descuento.id_descuento.toString().includes(term)
      );
    });
  };

  const filteredData = filterDescuentos(searchTerm);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id_descuento) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar este descuento?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/descuentosProd/${id_descuento}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Descuento eliminado exitosamente'
      });
      fetchDescuentos();
    } catch (error) {
      console.error("Error al eliminar el descuento:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al eliminar descuento: ${error.response?.data?.mensaje || error.message}`
      });
    }
  };

  return (
    <div className="admin-container">
      <MenuEmp />
      <div className="content-container crud-container">
        <h1>Descuentos Registrados</h1>
        
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar por producto, porcentaje o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <Button className="crud-btn crud-btn-primary mb-3" onClick={handleAddDescuento}>
          <i className="bi bi-plus-circle"></i> Agregar Descuento
        </Button>
        
        <div className="crud-table-container">
        <Table className="crud-table" responsive={false}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Porcentaje</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((descuento) => {
                  const producto = descuento.producto || productos.find(p => p.id_producto === descuento.id_producto);
                  
                  return (
                    <tr key={descuento.id_descuento}>
                      <td data-label="ID">{descuento.id_descuento}</td>
                      <td data-label="Producto">
                        <div className="d-flex align-items-center">
                          {producto?.imagen && (
                            <img 
                              src={producto.imagen} 
                              alt={producto.nombre} 
                              className="product-thumbnail"
                            />
                          )}
                          <div>
                            <div>{producto?.nombre || `Producto ID: ${descuento.id_producto}`}</div>
                            {producto?.precio && (
                              <small className="text-muted">
                                Precio: ${producto.precio}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="Porcentaje">{descuento.porcentaje_descuento}%</td>
                      <td data-label="Fecha Inicio">
                        {descuento.fecha_inicio ? new Date(descuento.fecha_inicio).toLocaleDateString() : 'No definida'}
                      </td>
                      <td data-label="Fecha Fin">
                        {descuento.fecha_fin ? new Date(descuento.fecha_fin).toLocaleDateString() : 'No definida'}
                      </td>
                      <td data-label="Acciones">
                        <div className="d-flex flex-column flex-md-row gap-2">
                          <Button 
                            className="crud-btn crud-btn-warning" 
                            onClick={() => handleEditDescuento(descuento)}
                          >
                            <i className="bi bi-pencil"></i> Editar
                          </Button>
                          <Button 
                            className="crud-btn crud-btn-danger"
                            onClick={() => handleDelete(descuento.id_descuento)}
                          >
                            <i className="bi bi-trash"></i> Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    {searchTerm ? 'No se encontraron resultados' : 'No hay descuentos disponibles'}
                  </td>
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

<Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="modal-override categoria-modal">
  <Modal.Header closeButton>
    <Modal.Title>{isNewDescuento ? 'Agregar Descuento' : 'Editar Descuento'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Row>
      <Col md={6}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formProductoDescuento">
            <Form.Label>Producto *</Form.Label>
            <Form.Select
              name="id_producto"
              className={errors.id_producto ? 'is-invalid' : ''}
              value={editDescuento.id_producto}
              onChange={handleInputChange}
              required
              title="Seleccione un producto para aplicar el descuento. Campo obligatorio."
            >
              <option value="">Seleccione un producto</option>
              {productos.map((producto) => (
                <option key={producto.id_producto} value={producto.id_producto}>
                  {producto.nombre}
                </option>
              ))}
            </Form.Select>
            {errors.id_producto && <div className="invalid-feedback">{errors.id_producto}</div>}
            <Form.Text className="text-muted">
              Seleccione el producto al que aplicará el descuento. Campo obligatorio.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPorcentajeDescuento">
            <Form.Label>Porcentaje de Descuento *</Form.Label>
            <Form.Control
              type="number"
              name="porcentaje_descuento"
              className={errors.porcentaje_descuento ? 'is-invalid' : ''}
              value={editDescuento.porcentaje_descuento}
              onChange={handleInputChange}
              min="1"
              max="100"
              required
              title="Valor entre 1 y 100%. Campo obligatorio."
            />
            {errors.porcentaje_descuento && <div className="invalid-feedback">{errors.porcentaje_descuento}</div>}
            <Form.Text className="text-muted">
              Porcentaje de descuento (entre 1 y 100%). Campo obligatorio.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formFechaInicio">
            <Form.Label>Fecha Inicio</Form.Label>
            <Form.Control
              type="date"
              name="fecha_inicio"
              value={editDescuento.fecha_inicio}
              onChange={handleInputChange}
              title="Fecha de inicio del descuento (opcional)."
            />
            <Form.Text className="text-muted">
              Fecha de inicio del descuento (opcional).
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formFechaFin">
            <Form.Label>Fecha Fin</Form.Label>
            <Form.Control
              type="date"
              name="fecha_fin"
              className={errors.fecha_fin ? 'is-invalid' : ''}
              value={editDescuento.fecha_fin}
              onChange={handleInputChange}
              title="Fecha de finalización del descuento (opcional). No puede ser anterior a la fecha de inicio."
            />
            {errors.fecha_fin && <div className="invalid-feedback">{errors.fecha_fin}</div>}
            <Form.Text className="text-muted">
              Fecha de finalización del descuento (opcional). No puede ser anterior a la fecha de inicio.
            </Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {isNewDescuento ? 'Crear Descuento' : 'Guardar Cambios'}
            </Button>
          </div>
        </Form>
      </Col>
              <Col md={6}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : productoSeleccionado ? (
                  <Card className="h-100">
                    <Card.Header>Vista Previa del Producto</Card.Header>
                    <Card.Body>
                      <div className="text-center mb-3">
                        <img 
                          src={productoSeleccionado.imagen || 'https://via.placeholder.com/200'} 
                          alt={productoSeleccionado.nombre}
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                        />
                      </div>
                      <Card.Title>{productoSeleccionado.nombre}</Card.Title>
                      <Card.Text>
                        <strong>Precio:</strong> ${productoSeleccionado.precio}<br />
                        <strong>Categoría:</strong> {categoria?.nombre || 'N/A'}<br />
                        <strong>Marca:</strong> {marca?.nombre || 'N/A'}
                      </Card.Text>
                      {editDescuento.porcentaje_descuento > 0 && (
                        <div className="mt-3 p-2 bg-light rounded">
                          <h5>Precio con descuento:</h5>
                          <p className="mb-1">
                            <del>${productoSeleccionado.precio}</del>
                          </p>
                          <h4 className="text-danger">
                            ${(productoSeleccionado.precio * (1 - editDescuento.porcentaje_descuento / 100)).toFixed(2)}
                          </h4>
                          <small className="text-muted">
                            ({editDescuento.porcentaje_descuento}% de descuento)
                          </small>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center text-muted">
                      <i className="bi bi-box-seam" style={{ fontSize: '3rem' }}></i>
                      <p>Seleccione un producto para ver la vista previa</p>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default EmpDescuentos;