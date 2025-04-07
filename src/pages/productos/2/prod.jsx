import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Menu from '../../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';
const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

axios.interceptors.request.use(config => {
  if (config.url.startsWith(apiUrl)) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("isLogged");
    window.location.href = "/";
  }
  return Promise.reject(error);
});

const AdminProductos = () => {
  const { idAnimal } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isNewProducto, setIsNewProducto] = useState(false);
  const [editProducto, setEditProducto] = useState({
    id_producto: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: '',
    estado: 'Disponible',
    id_categoria: '',
    id_marca: '',
    id_animal: idAnimal || location.state?.idAnimalSeleccionado || ''
  });

  useEffect(() => {
    if (idAnimal || location.state?.idAnimalSeleccionado) {
      fetchAnimal(); 
      fetchProductos();
      fetchCategorias();
      fetchMarcas();
    }
  }, [idAnimal, location.state?.idAnimalSeleccionado]);

  const fetchAnimal = async () => {
    try {
      const animalId = idAnimal || location.state?.idAnimalSeleccionado;
      const response = await axios.get(`${apiUrl}/animalesProd/${animalId}`);
      console.log("Respuesta del animal:", response.data); // Agrega esto
      setAnimal(response.data);
    } catch (error) {
      console.error("Error al obtener el animal:", error);
    }
  };
  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/PrivProd`);
      const animalId = idAnimal || location.state?.idAnimalSeleccionado;
      
      // Filtrado seguro con conversión a número
      const productosFiltrados = response.data.productos.filter(p => 
        parseInt(p.id_animal) === parseInt(animalId)
      );
      
      setProductos(productosFiltrados);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los productos"
      });
    }
  };


  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${apiUrl}/categoria`);
      setCategorias(response.data.categorias || []);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const fetchMarcas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/PrivMarcas`);
      setMarcas(response.data.marcas || []);
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
    }
  };

  const handleAddProducto = () => {
    setIsNewProducto(true);
    setEditProducto({ 
      id_producto: '', 
      nombre: '', 
      descripcion: '', 
      precio: '', 
      stock: '', 
      imagen: '', 
      estado: 'Disponible', 
      id_categoria: '', 
      id_marca: '', 
      id_animal: idAnimal || location.state?.idAnimalSeleccionado 
    });
    setShowModal(true);
  };

  const handleEditProducto = (producto) => {
    setIsNewProducto(false);
    setEditProducto({ ...producto });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProducto({ ...editProducto, [name]: value });
  };


  const handleSubmit = async () => {
    if (!editProducto.nombre || !editProducto.precio || !editProducto.stock || 
        !editProducto.id_categoria || !editProducto.id_marca || !editProducto.id_animal) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor complete todos los campos requeridos",
      });
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Agregar todos los campos al FormData
      formData.append('nombre', editProducto.nombre);
      formData.append('descripcion', editProducto.descripcion);
      formData.append('precio', editProducto.precio);
      formData.append('stock', editProducto.stock);
      formData.append('estado', editProducto.estado);
      formData.append('id_categoria', editProducto.id_categoria);
      formData.append('id_marca', editProducto.id_marca);
      formData.append('id_animal', editProducto.id_animal);
      
      // Si hay una imagen nueva (para edición)
      if (editProducto.imagenFile) {
        formData.append('imagen', editProducto.imagenFile);
      }
  
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
  
      if (isNewProducto) {
        await axios.post(`${apiUrl}/PrivProd`, formData, config);
      } else {
        await axios.put(`${apiUrl}/PrivProd/${editProducto.id_producto}`, formData, config);
      }
      
      setShowModal(false);
      fetchProductos();
      
      Swal.fire({
        icon: "success",
        title: "Operación exitosa",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al guardar el producto",
      });
    }
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryPreset);
  
    try {
      // Crear una nueva instancia de axios sin interceptores para esta solicitud
      const cloudinaryAxios = axios.create();
      const response = await cloudinaryAxios.post(cloudinaryUploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const imageUrl = response.data.secure_url;
      setEditProducto(prev => ({ 
        ...prev, 
        imagen: imageUrl,
        imagenFile: file
      }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al subir la imagen. Por favor intenta con otra imagen.",
      });
    }
  };
  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
      <h1>
        Productos Registrados {animal?.nombre && `- ${animal.nombre}`}
      </h1>
        <Button 
          variant="primary" 
          className="mb-3" 
          onClick={handleAddProducto}
          disabled={!idAnimal && !location.state?.idAnimalSeleccionado}
        >
          Agregar Producto
        </Button>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length > 0 ? (
              productos.map((producto) => (
                <tr key={producto.id_producto}>
                  <td>{producto.id_producto}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion || 'Sin descripción'}</td>
                  <td>${producto.precio}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.estado}</td>
                  <td>
                    <img
                      src={producto.imagen || 'https://via.placeholder.com/100'}
                      alt={producto.nombre}
                      style={{ width: "100px", height: "auto" }}
                    />
                  </td>
                  <td>
                    {categorias.find(c => c.id_categoria === producto.id_categoria)?.nombre || 'N/A'}
                  </td>
                  <td>
                    {marcas.find(m => m.id_marca === producto.id_marca)?.nombre || 'N/A'}
                  </td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEditProducto(producto)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  No hay productos disponibles. {idAnimal || location.state?.idAnimalSeleccionado ? 
                  "Puedes agregar uno nuevo usando el botón 'Agregar Producto'" : 
                  "Selecciona un animal para ver sus productos"}
                </td>
              </tr>
            )}
          </tbody>
        </Table>



        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isNewProducto ? 'Agregar Producto' : 'Editar Producto'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Campos del formulario */}
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nombre" 
                  value={editProducto.nombre} 
                  onChange={handleInputChange} 
                  required 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  name="descripcion" 
                  value={editProducto.descripcion} 
                  onChange={handleInputChange} 
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio *</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="precio" 
                      value={editProducto.precio} 
                      onChange={handleInputChange} 
                      required 
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock *</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="stock" 
                      value={editProducto.stock} 
                      onChange={handleInputChange} 
                      required 
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoría *</Form.Label>
                    <Form.Select 
                      name="id_categoria" 
                      value={editProducto.id_categoria} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar Categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Marca *</Form.Label>
                    <Form.Select 
                      name="id_marca" 
                      value={editProducto.id_marca} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar Marca</option>
                      {marcas.map(marca => (
                        <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                {editProducto.imagen && (
                  <div className="mt-2">
                    <img 
                      src={editProducto.imagen} 
                      alt="Vista previa" 
                      style={{ width: "100px", height: "auto" }} 
                      className="img-thumbnail"
                    />
                  </div>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {isNewProducto ? 'Agregar' : 'Guardar Cambios'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProductos;