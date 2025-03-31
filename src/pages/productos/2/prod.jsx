import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';
const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

const AdminProductos = ({ idAnimalSeleccionado }) => {
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
    id_animal: idAnimalSeleccionado
  });

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchMarcas();
  }, [idAnimalSeleccionado]);

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/PrivProd`);
      const productosFiltrados = response.data.productos.filter(p => p.id_animal === idAnimalSeleccionado);
      setProductos(productosFiltrados);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
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
    setEditProducto({ id_producto: '', nombre: '', descripcion: '', precio: '', stock: '', imagen: '', estado: 'Disponible', id_categoria: '', id_marca: '', id_animal: idAnimalSeleccionado });
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEditProducto((prev) => ({ ...prev, file }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryPreset);

    try {
      const response = await axios.post(cloudinaryUploadUrl, formData);
      const imageUrl = response.data.secure_url;
      setEditProducto((prev) => ({ ...prev, imagen: imageUrl }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert("Error al subir la imagen");
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Productos Registrados</h1>
        <Button variant="primary" className="mb-3" onClick={handleAddProducto}>
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
                  <td>{producto.precio}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.estado}</td>
                  <td>
                    <img
                      src={producto.imagen || 'https://via.placeholder.com/100'}
                      alt={producto.nombre}
                      style={{ width: "100px", height: "auto" }}
                    />
                  </td>
                  <td>{producto.categoria}</td>
                  <td>{producto.marca}</td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEditProducto(producto)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">No hay productos disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isNewProducto ? 'Agregar Producto' : 'Editar Producto'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" name="nombre" value={editProducto.nombre} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control type="text" name="descripcion" value={editProducto.descripcion} onChange={handleInputChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control type="number" name="precio" value={editProducto.precio} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" name="stock" value={editProducto.stock} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select name="id_categoria" value={editProducto.id_categoria} onChange={handleInputChange}>
                  <option value="">Seleccionar Categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Marca</Form.Label>
                <Form.Select name="id_marca" value={editProducto.id_marca} onChange={handleInputChange}>
                  <option value="">Seleccionar Marca</option>
                  {marcas.map(marca => (
                    <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                {editProducto.imagen && <img src={editProducto.imagen} alt="Vista previa" style={{ width: "100px", height: "auto" }} />}
              </Form.Group>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProductos;
