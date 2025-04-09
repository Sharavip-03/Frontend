import React, { useState, useEffect } from 'react';
import './marcas.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';
const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

const AdminMarcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isNewMarca, setIsNewMarca] = useState(false);
  const [editMarca, setEditMarca] = useState({
    id_marca: '',
    nombre: '',
    estado: 'Activo',
    id_proveedor: '',
    imagen: '',
  });

  useEffect(() => {
    fetchMarcas();
    fetchProveedores();
  }, []);

  const fetchMarcas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/PrivMarcas`);
      setMarcas(response.data.marcas || []);
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await axios.get(`${apiUrl}/adminProveedor`);
      setProveedores(response.data.proveedores || []);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
    }
  };

  const handleAddMarca = () => {
    setIsNewMarca(true);
    setEditMarca({ 
      id_marca: '', 
      nombre: '', 
      estado: 'Activo', 
      id_proveedor: '', 
      imagen: '' 
    });
    setShowModal(true);
  };

  const handleEditMarca = (marca) => {
    setIsNewMarca(false);
    setEditMarca({ ...marca });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditMarca({ ...editMarca, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setEditMarca((prev) => ({ ...prev, file }));
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryPreset);
  
    try {
      const response = await axios.post(cloudinaryUploadUrl, formData);
      const imageUrl = response.data.secure_url;
      setEditMarca((prev) => ({ ...prev, imagen: imageUrl }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert("Error al subir la imagen");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', editMarca.nombre);
      formData.append('estado', editMarca.estado);
      formData.append('id_proveedor', editMarca.id_proveedor);
      if (editMarca.file) {
        formData.append('imagen', editMarca.file);
      }

      if (isNewMarca) {
        await axios.post(`${apiUrl}/PrivMarcas`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.put(`${apiUrl}/PrivMarca/${editMarca.id_marca}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      setShowModal(false);
      fetchMarcas();
    } catch (error) {
      console.error("Error al guardar la marca:", error);
      alert("Error al guardar la marca");
    }
  };

  const handleStatusChange = async (id_marca, nuevoEstado) => {
    try {
      await axios.patch(`${apiUrl}/PrivMarca/${id_marca}`, { estado: nuevoEstado });
      fetchMarcas();
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Error al cambiar el estado");
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Marcas Registradas</h1>
        <Button variant="primary" className="mb-3" onClick={handleAddMarca}>
          Agregar Marca
        </Button>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcas.length > 0 ? (
              marcas.map((marca) => (
                <tr key={marca.id_marca}>
                  <td>{marca.id_marca}</td>
                  <td>{marca.nombre}</td>
                  <td>
                    {proveedores.find(p => p.id_proveedor === marca.id_proveedor)?.nombre || 'Desconocido'}
                  </td>
                  <td>{marca.estado}</td>
                  <td>
                    <img
                      src={marca.imagen || 'https://via.placeholder.com/100'}
                      alt={marca.nombre}
                      style={{ width: "100px", height: "auto" }}
                    />
                  </td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEditMarca(marca)}>
                      Editar
                    </Button>
                    <Button 
                      variant={marca.estado === 'Activo' ? 'danger' : 'success'}
                      onClick={() => handleStatusChange(marca.id_marca, marca.estado === 'Activo' ? 'Inactivo' : 'Activo')}
                    >
                      {marca.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No hay marcas disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isNewMarca ? 'Agregar Marca' : 'Editar Marca'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={editMarca.nombre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Proveedor</Form.Label>
                <Form.Select
                  name="id_proveedor"
                  value={editMarca.id_proveedor}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={editMarca.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                {editMarca.imagen && (
                  <div className="mt-2">
                    <img src={editMarca.imagen} alt="Vista previa" style={{ width: "100px", height: "auto" }} />
                  </div>
                )}
              </Form.Group>
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {isNewMarca ? 'Crear Marca' : 'Guardar Cambios'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminMarcas;