import React, { useState, useEffect } from 'react';
import './animales.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';
const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

const AdminAnimales = () => {
  const [animales, setAnimales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isNewAnimal, setIsNewAnimal] = useState(false);
  const [editAnimal, setEditAnimal] = useState({
    id_animal: '',
    nombre: '',
    imagen: '',
    estado: 'Activo',
  });

  useEffect(() => {
    fetchAnimales();
  }, []);

  const fetchAnimales = async () => {
    try {
      const response = await axios.get(`${apiUrl}/animalesProd`);
      setAnimales(response.data.animales || []);
    } catch (error) {
      console.error("Error al obtener los animales:", error);
    }
  };

  const handleAddAnimal = () => {
    setIsNewAnimal(true);
    setEditAnimal({ 
      id_animal: '', 
      nombre: '', 
      imagen: '', 
      estado: 'Activo' 
    });
    setShowModal(true);
  };

  const handleEditAnimal = (animal) => {
    setIsNewAnimal(false);
    setEditAnimal({ ...animal });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditAnimal({ ...editAnimal, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setEditAnimal((prev) => ({ ...prev, file }));
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryPreset);
  
    try {
      const response = await axios.post(cloudinaryUploadUrl, formData);
      const imageUrl = response.data.secure_url;
      setEditAnimal((prev) => ({ ...prev, imagen: imageUrl }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert("Error al subir la imagen");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', editAnimal.nombre);
      formData.append('estado', editAnimal.estado);
      if (editAnimal.file) {
        formData.append('imagen', editAnimal.file);
      }

      if (isNewAnimal) {
        await axios.post(`${apiUrl}/animalesProd`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.put(`${apiUrl}/animalesProd/${editAnimal.id_animal}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      setShowModal(false);
      fetchAnimales();
    } catch (error) {
      console.error("Error al guardar el animal:", error);
      alert("Error al guardar el animal");
    }
  };

  const handleStatusChange = async (id_animal, nuevoEstado) => {
    try {
      await axios.patch(`${apiUrl}/animalesProd/${id_animal}`, { estado: nuevoEstado });
      fetchAnimales();
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Error al cambiar el estado");
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Animales Registrados</h1>
        <Button variant="primary" className="mb-3" onClick={handleAddAnimal}>
          Agregar Animal
        </Button>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {animales.length > 0 ? (
              animales.map((animal) => (
                <tr key={animal.id_animal}>
                  <td>{animal.id_animal}</td>
                  <td>{animal.nombre}</td>
                  <td>{animal.estado || 'Activo'}</td>
                  <td>
                    <img
                      src={animal.imagen || 'https://via.placeholder.com/100'}
                      alt={animal.nombre}
                      style={{ width: "100px", height: "auto" }}
                    />
                  </td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEditAnimal(animal)}>
                      Editar
                    </Button>
                    <Button 
                      variant={animal.estado === 'Activo' ? 'danger' : 'success'}
                      onClick={() => handleStatusChange(animal.id_animal, animal.estado === 'Activo' ? 'Inactivo' : 'Activo')}
                    >
                      {animal.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No hay animales disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isNewAnimal ? 'Agregar Animal' : 'Editar Animal'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={editAnimal.nombre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={editAnimal.estado}
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
                {editAnimal.imagen && (
                  <div className="mt-2">
                    <img src={editAnimal.imagen} alt="Vista previa" style={{ width: "100px", height: "auto" }} />
                  </div>
                )}
              </Form.Group>
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {isNewAnimal ? 'Crear Animal' : 'Guardar Cambios'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminAnimales;