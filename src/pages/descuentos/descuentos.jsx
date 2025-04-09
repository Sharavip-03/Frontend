import React, { useState, useEffect } from 'react';
import './descuentos.css';
import { Table, Button, Modal, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';

const AdminDescuentos = () => {
  const [descuentos, setDescuentos] = useState([]);
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

  // Definición de handleInputChange al inicio del componente
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDescuento({ ...editDescuento, [name]: value });
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
            // Obtener detalles de la marca
            if (producto.id_marca) {
              const marcaResponse = await axios.get(`${apiUrl}/PrivMarca/${producto.id_marca}`);
              setMarca(marcaResponse.data.marca);
            }
            
            // Obtener detalles de la categoría
            if (producto.id_categoria) {
              const categoriaResponse = await axios.get(`${apiUrl}/categoria/${producto.id_categoria}`);              setCategoria(categoriaResponse.data.categoria || categoriaResponse.data);
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
      const response = await axios.get(`${apiUrl}/descuentosProd`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Verificar que los productos vengan en la respuesta
      const descuentosConProducto = response.data.descuentos.map(descuento => {
        // Si el producto no viene completo, buscarlo en el estado de productos
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
      alert("Error al cargar descuentos. Intente recargar la página.");
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/PrivProd`);
      setProductos(response.data.productos || []);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
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
    setShowModal(true);
  };

  const handleEditDescuento = (descuento) => {
    setIsNewDescuento(false);
    setEditDescuento({ 
      ...descuento,
      fecha_inicio: descuento.fecha_inicio ? descuento.fecha_inicio.split('T')[0] : '',
      fecha_fin: descuento.fecha_fin ? descuento.fecha_fin.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validaciones
      if (!editDescuento.id_producto || !editDescuento.porcentaje_descuento) {
        alert("Producto y porcentaje son obligatorios");
        return;
      }
  
      const descuentoData = {
        id_producto: Number(editDescuento.id_producto),
        porcentaje_descuento: Number(editDescuento.porcentaje_descuento),
        fecha_inicio: editDescuento.fecha_inicio || null,
        fecha_fin: editDescuento.fecha_fin || null
      };
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 10000 // 10 segundos de timeout
      };
  
      const url = isNewDescuento 
        ? `${apiUrl}/descuentosProd`
        : `${apiUrl}/descuentosProd/${editDescuento.id_descuento}`;
  
      const response = await axios({
        method: isNewDescuento ? 'post' : 'put',
        url,
        data: descuentoData,
        config
      });
  
      console.log("Respuesta completa del servidor:", response);
      setShowModal(false);
      // Recargar ambos datos
      await fetchProductos();
      await fetchDescuentos();
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        alert("La solicitud tardó demasiado. Verifique su conexión a internet.");
      } else if (error.response) {
        console.error("Error del servidor:", error.response.data);
        alert(`Error del servidor: ${error.response.data.mensaje || 'Error desconocido'}`);
      } else if (error.request) {
        console.error("No se recibió respuesta:", error.request);
        alert("No se pudo conectar al servidor. Verifique su conexión a internet.");
      } else {
        console.error("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };
  const handleDelete = async (id_descuento) => {
    if (window.confirm("¿Estás seguro de eliminar este descuento?")) {
      try {
        await axios.delete(`${apiUrl}/descuentosProd/${id_descuento}`);
        fetchDescuentos();
      } catch (error) {
        console.error("Error al eliminar el descuento:", error);
        alert("Error al eliminar el descuento");
      }
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Descuentos Registrados</h1>
        <Button variant="primary" className="mb-3" onClick={handleAddDescuento}>
          Agregar Descuento
        </Button>
        <Table striped bordered hover responsive>
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
              {descuentos.length > 0 ? (
                descuentos.map((descuento) => {
                  // Buscar el producto correspondiente si no viene en la respuesta
                  const producto = descuento.producto || productos.find(p => p.id_producto === descuento.id_producto);
                  
                  return (
                    <tr key={descuento.id_descuento}>
                      <td>{descuento.id_descuento}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {producto?.imagen && (
                            <img 
                              src={producto.imagen} 
                              alt={producto.nombre} 
                              style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                            />
                          )}
                          <div>
                            <div>{producto?.nombre || `Producto ID: ${descuento.id_producto}`}</div>
                            {producto?.precio && <small className="text-muted">Precio: ${producto.precio}</small>}
                          </div>
                        </div>
                      </td>
                      <td>{descuento.porcentaje_descuento}%</td>
                      <td>{descuento.fecha_inicio ? new Date(descuento.fecha_inicio).toLocaleDateString() : 'No definida'}</td>
                      <td>{descuento.fecha_fin ? new Date(descuento.fecha_fin).toLocaleDateString() : 'No definida'}</td>
                      <td>
                        <Button variant="warning" className="me-2" onClick={() => handleEditDescuento(descuento)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(descuento.id_descuento)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No hay descuentos disponibles.</td>
                </tr>
              )}
            </tbody>
          </Table>
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isNewDescuento ? 'Agregar Descuento' : 'Editar Descuento'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Producto</Form.Label>
                    <Form.Select
                      name="id_producto"
                      value={editDescuento.id_producto}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione un producto</option>
                      {productos.map((producto) => (
                        <option key={producto.id_producto} value={producto.id_producto}>
                          {producto.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Porcentaje de Descuento</Form.Label>
                    <Form.Control
                      type="number"
                      name="porcentaje_descuento"
                      value={editDescuento.porcentaje_descuento}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha Inicio</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_inicio"
                      value={editDescuento.fecha_inicio}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha Fin</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_fin"
                      value={editDescuento.fecha_fin}
                      onChange={handleInputChange}
                      required
                    />
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

export default AdminDescuentos;