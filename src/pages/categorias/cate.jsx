import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';
const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isNewCategoria, setIsNewCategoria] = useState(false);
  const [editCategoria, setEditCategoria] = useState({
    id_categoria: '',
    nombre: '',
    descripcion: '',
    imagen: '',
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${apiUrl}/categoria`);
      setCategorias(response.data.categorias || []);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const handleAddCategoria = () => {
    setIsNewCategoria(true);
    setEditCategoria({ id_categoria: '', nombre: '', descripcion: '', imagen: '' });
    setShowModal(true);
  };

  const handleEditCategoria = (categoria) => {
    setIsNewCategoria(false);
    setEditCategoria({ ...categoria });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditCategoria({ ...editCategoria, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setEditCategoria((prev) => ({ ...prev, file })); 
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryPreset);
  
    try {
      const response = await axios.post(cloudinaryUploadUrl, formData);
      const imageUrl = response.data.secure_url; 
      setEditCategoria((prev) => ({ ...prev, imagen: imageUrl }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert("Error al subir la imagen");
    }
  };
  
  

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }
  
      const formData = new FormData();
      formData.append("nombre", editCategoria.nombre);
      formData.append("descripcion", editCategoria.descripcion);
  
      if (editCategoria.imagen && editCategoria.imagen.startsWith("http")) {
        formData.append("imagen_url", editCategoria.imagen);
      } else if (editCategoria.file) {
        formData.append("imagen", editCategoria.file);
      }
  
      if (isNewCategoria) {
        await axios.post(`${apiUrl}/categoria`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Categoría creada exitosamente");
      } else {
        await axios.put(`${apiUrl}/categoria/${editCategoria.id_categoria}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Categoría actualizada exitosamente");
      }
  
      fetchCategorias();
      setShowModal(false);
    } catch (error) {
      console.error("Error al procesar categoría:", error);
      alert(`Error al ${isNewCategoria ? "crear" : "actualizar"} categoría: ${error.response?.data?.mensaje || error.message}`);
    }
  };
  
  return (
    <div>
      <Menu />
      <div className="container mt-5">
        <h1>Categorías Registradas</h1>
        <Button variant="primary" className="mb-3" onClick={handleAddCategoria}>
          Agregar Categoría
        </Button>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length > 0 ? (
              categorias.map((categoria) => (
                <tr key={categoria.id_categoria}>
                  <td>{categoria.id_categoria}</td>
                  <td>{categoria.nombre}</td>
                  <td>{categoria.descripcion || 'Sin descripción'}</td>
                  <td>
                    <img
                      src={categoria.imagen || 'https://via.placeholder.com/100'} 
                      alt={categoria.nombre}
                      style={{ width: "100px", height: "auto" }}
                    />
                  </td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEditCategoria(categoria)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No hay categorías disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isNewCategoria ? 'Agregar Categoría' : 'Editar Categoría'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={editCategoria.nombre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={editCategoria.descripcion}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                {editCategoria.imagen && (
                  <div className="mt-2">
                    <img src={editCategoria.imagen} alt="Vista previa" style={{ width: "100px", height: "auto" }} />
                  </div>
                )}
              </Form.Group>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {isNewCategoria ? 'Crear Categoría' : 'Guardar Cambios'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminCategorias;
