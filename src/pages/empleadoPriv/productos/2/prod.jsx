import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Row, Col, Spinner, Badge } from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MenuEmp from '../../../../components/AdminNavbar/empleado';
import API_BASE_URL from '../../../../config/apiConfig';
import { SearchComponent } from '../../../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../../../buscador/ParaCruds/PaginationComponent';
import Swal from 'sweetalert2';

const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

const EmpProductos = () => {
  const { idAnimal } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [productos, setProductos] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (idAnimal || location.state?.idAnimalSeleccionado) {
      fetchAnimal(); 
      fetchProductos();
      fetchCategorias();
      fetchMarcas();
    }
  }, [idAnimal, location.state?.idAnimalSeleccionado]);

  useEffect(() => {
    setFilteredData(productos);
  }, [productos]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!editProducto.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (editProducto.nombre.length < 2 || editProducto.nombre.length > 100) {
      newErrors.nombre = 'El nombre debe tener entre 2 y 100 caracteres';
    }
    
    if (!editProducto.precio || editProducto.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }
    
    if (!editProducto.stock || editProducto.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    if (!editProducto.id_categoria) {
      newErrors.id_categoria = 'Seleccione una categoría';
    }
    
    if (!editProducto.id_marca) {
      newErrors.id_marca = 'Seleccione una marca';
    }
    
    if (!editProducto.id_animal) {
      newErrors.id_animal = 'Seleccione un animal';
    }
    
    if (editProducto.descripcion && editProducto.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAnimal = async () => {
    try {
      const animalId = idAnimal || location.state?.idAnimalSeleccionado;
      const response = await axios.get(`${API_BASE_URL}/animalesProd/${animalId}`);
      setAnimal(response.data);
    } catch (error) {
      console.error("Error al obtener el animal:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar el animal'
      });
    }
  };

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/PrivProd`);
      const animalId = idAnimal || location.state?.idAnimalSeleccionado;
      
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categoria`);
      setCategorias(response.data.categorias || []);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar las categorías'
      });
    }
  };

  const fetchMarcas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PrivMarcas`);
      setMarcas(response.data.marcas || []);
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar las marcas'
      });
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
    setErrors({});
    setShowModal(true);
  };

  const handleEditProducto = (producto) => {
    setIsNewProducto(false);
    setEditProducto({ ...producto });
    setErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProducto({ ...editProducto, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append('nombre', editProducto.nombre);
      formData.append('descripcion', editProducto.descripcion || '');
      formData.append('precio', editProducto.precio);
      formData.append('stock', editProducto.stock);
      formData.append('estado', editProducto.estado);
      formData.append('id_categoria', editProducto.id_categoria);
      formData.append('id_marca', editProducto.id_marca);
      formData.append('id_animal', editProducto.id_animal);
      
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
        await axios.post(`${API_BASE_URL}/PrivProd`, formData, config);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Producto creado exitosamente'
        });
      } else {
        await axios.put(`${API_BASE_URL}/PrivProd/${editProducto.id_producto}`, formData, config);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Producto actualizado exitosamente'
        });
      }
      
      setShowModal(false);
      fetchProductos();
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
      setLoading(true);
      const response = await axios.post(cloudinaryUploadUrl, formData, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <MenuEmp />
      <div className="content-container">
      <h1>
        Productos Registrados {animal?.nombre && `- ${animal.nombre}`}
      </h1>
              <SearchComponent 
                data={productos}
                setFilteredData={setFilteredData}
                searchFields={['nombre', 'estado', 'id_producto', 'descripcion', 'stock', 'precio', 'marca', 'categoria']}
              />
        <Button 
          variant="primary" 
          className="mb-3" 
          onClick={handleAddProducto}
          disabled={!idAnimal && !location.state?.idAnimalSeleccionado || loading}
        >
          {loading ? <Spinner size="sm" /> : 'Agregar Producto'}
        </Button>
        <div className="crud-table-container">
        <Table className="crud-table" responsive={false}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Descuento</th>
              <th>Descripción</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="text-center">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((producto) => (
                <tr key={producto.id_producto}>
                  <td>{producto.id_producto}</td>
                  <td>{producto.nombre}</td>
                  <td>
                    {producto.tiene_descuento ? (
                      <>
                        <span className="text-danger">
                          ${producto.precio_descuento.toFixed(2)}
                        </span>
                        <small className="text-muted ms-2 text-decoration-line-through">
                          ${producto.precio.toFixed(2)}
                        </small>
                      </>
                    ) : (
                      <span>${producto.precio.toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    {producto.tiene_descuento ? (
                      <Badge bg="success">
                        {Math.round(
                          ((producto.precio - producto.precio_descuento) / producto.precio) * 100
                        )}% OFF
                      </Badge>
                    ) : (
                      <Badge bg="secondary">Sin descuento</Badge>
                    )}
                  </td>
                  <td>{producto.descripcion || 'Sin descripción'}</td>
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
                <td colSpan="11" className="text-center">
                  No hay productos disponibles. {idAnimal || location.state?.idAnimalSeleccionado ? 
                  "Puedes agregar uno nuevo usando el botón 'Agregar Producto'" : 
                  "Selecciona un animal para ver sus productos"}
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
    <Modal.Title>{isNewProducto ? 'Agregar Producto' : 'Editar Producto'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formNombreProducto">
        <Form.Label>Nombre *</Form.Label>
        <Form.Control 
          type="text" 
          name="nombre" 
          className={errors.nombre ? 'is-invalid' : ''}
          value={editProducto.nombre} 
          onChange={handleInputChange} 
          required
          title="Entre 2 y 100 caracteres. Campo obligatorio."
        />
        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        <Form.Text className="text-muted">
          Nombre del producto (entre 2 y 100 caracteres). Campo obligatorio.
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formDescripcion">
        <Form.Label>Descripción</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3}
          name="descripcion" 
          className={errors.descripcion ? 'is-invalid' : ''}
          value={editProducto.descripcion} 
          onChange={handleInputChange} 
          maxLength="500"
          title="Máximo 500 caracteres."
        />
        {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
        <Form.Text className="text-muted">
          Descripción detallada del producto (máximo 500 caracteres).
        </Form.Text>
      </Form.Group>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPrecio">
            <Form.Label>Precio *</Form.Label>
            <Form.Control 
              type="number" 
              name="precio" 
              className={errors.precio ? 'is-invalid' : ''}
              value={editProducto.precio} 
              onChange={handleInputChange} 
              required 
              min="0"
              step="0.01"
              title="Debe ser mayor a 0. Campo obligatorio."
            />
            {errors.precio && <div className="invalid-feedback">{errors.precio}</div>}
            <Form.Text className="text-muted">
              Precio del producto (mayor a 0). Campo obligatorio.
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formStock">
            <Form.Label>Stock *</Form.Label>
            <Form.Control 
              type="number" 
              name="stock" 
              className={errors.stock ? 'is-invalid' : ''}
              value={editProducto.stock} 
              onChange={handleInputChange} 
              required 
              min="0"
              title="No puede ser negativo. Campo obligatorio."
            />
            {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
            <Form.Text className="text-muted">
              Cantidad disponible en inventario (no negativo). Campo obligatorio.
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formCategoria">
            <Form.Label>Categoría *</Form.Label>
            <Form.Select 
              name="id_categoria" 
              className={errors.id_categoria ? 'is-invalid' : ''}
              value={editProducto.id_categoria} 
              onChange={handleInputChange}
              required
              title="Seleccione una categoría. Campo obligatorio."
            >
              <option value="">Seleccionar Categoría</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </Form.Select>
            {errors.id_categoria && <div className="invalid-feedback">{errors.id_categoria}</div>}
            <Form.Text className="text-muted">
              Seleccione la categoría a la que pertenece el producto. Campo obligatorio.
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formMarca">
            <Form.Label>Marca *</Form.Label>
            <Form.Select 
              name="id_marca" 
              className={errors.id_marca ? 'is-invalid' : ''}
              value={editProducto.id_marca} 
              onChange={handleInputChange}
              required
              title="Seleccione una marca. Campo obligatorio."
            >
              <option value="">Seleccionar Marca</option>
              {marcas.map(marca => (
                <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>
              ))}
            </Form.Select>
            {errors.id_marca && <div className="invalid-feedback">{errors.id_marca}</div>}
            <Form.Text className="text-muted">
              Seleccione la marca del producto. Campo obligatorio.
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3" controlId="formEstado">
        <Form.Label>Estado</Form.Label>
        <Form.Select
          name="estado"
          value={editProducto.estado}
          onChange={handleInputChange}
          title="Seleccione el estado del producto."
        >
          <option value="Disponible">Disponible</option>
          <option value="Agotado">Agotado</option>
          <option value="Descontinuado">Descontinuado</option>
        </Form.Select>
        <Form.Text className="text-muted">
          Estado actual del producto en el inventario.
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formImagen">
        <Form.Label>Imagen</Form.Label>
        <Form.Control 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          disabled={loading}
          title="Suba una imagen del producto (opcional). Formatos aceptados: JPG, PNG, etc."
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
        <Form.Text className="text-muted">
          Imagen representativa del producto (formatos: JPG, PNG, etc.).
        </Form.Text>
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : isNewProducto ? (
        'Agregar'
      ) : (
        'Guardar Cambios'
      )}
    </Button>
  </Modal.Footer>
</Modal>
      </div>
    </div>
  );
};

export default EmpProductos;