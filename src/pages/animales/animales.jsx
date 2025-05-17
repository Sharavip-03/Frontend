import React, { useState, useEffect } from 'react';
import './animales.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';

const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

const AdminAnimales = () => {
  const [animales, setAnimales] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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

  useEffect(() => {
    setFilteredData(animales);
  }, [animales]);

  const fetchAnimales = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/animalesProd`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimales(response.data.animales || []);
    } catch (error) {
      console.error("Error al obtener los animales:", error);
      alert("Error al cargar animales. Por favor intente nuevamente.");
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
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('nombre', editAnimal.nombre);
      formData.append('estado', editAnimal.estado);
      if (editAnimal.file) {
        formData.append('imagen', editAnimal.file);
      }

      if (isNewAnimal) {
        await axios.post(`${API_BASE_URL}/animalesProd`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        alert('Animal creado exitosamente');
      } else {
        await axios.put(`${API_BASE_URL}/animalesProd/${editAnimal.id_animal}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        alert('Animal actualizado exitosamente');
      }
      setShowModal(false);
      fetchAnimales();
    } catch (error) {
      console.error("Error al guardar el animal:", error);
      alert(`Error al ${isNewAnimal ? 'crear' : 'actualizar'} animal: ${error.response?.data?.mensaje || error.message}`);
    }
  };

  const handleStatusChange = async (id_animal, estadoActual) => {
    if (!window.confirm(`¿Estás seguro que deseas ${estadoActual === 'Activo' ? 'desactivar' : 'activar'} este animal?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

      await axios.patch(
        `${API_BASE_URL}/animalesProd/${id_animal}`, 
        { estado: nuevoEstado }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setAnimales(prevAnimales => 
        prevAnimales.map(animal => 
          animal.id_animal === id_animal 
            ? { ...animal, estado: nuevoEstado }
            : animal
        )
      );

      alert(`Animal ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert(`Error al cambiar estado: ${error.response?.data?.mensaje || error.message}`);
      fetchAnimales();
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Animales Registrados</h1>
        <SearchComponent 
          data={animales}
          setFilteredData={setFilteredData}
          searchFields={['nombre', 'estado', 'id_animal']}
        />
        <Button className="crud-btn crud-btn-primary mb-3" onClick={handleAddAnimal}>
          <i className="bi bi-plus-circle"></i> Agregar Animal
        </Button>
        <Table className="crud-table" striped bordered hover responsive>
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
            {filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((animal) => (
                  <tr key={animal.id_animal}>
                    <td>{animal.id_animal}</td>
                    <td>{animal.nombre}</td>
                    <td className={animal.estado === 'Activo' ? 'text-success' : 'text-danger'}>
                      {animal.estado}
                    </td>
                    <td>
                      <img
                        src={animal.imagen || 'https://via.placeholder.com/100'}
                        alt={animal.nombre}
                        style={{ width: "100px", height: "auto" }}
                      />
                    </td>
                    <td>
                      <Button 
                        className="crud-btn crud-btn-warning me-2" 
                        onClick={() => handleEditAnimal(animal)}
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </Button>
                      <Button 
                        className={`crud-btn ${animal.estado === 'Activo' ? 'crud-btn-danger' : 'crud-btn-success'}`}
                        onClick={() => handleStatusChange(animal.id_animal, animal.estado)}
                      >
                        <i className="bi bi-power"></i> {animal.estado === 'Activo' ? 'Desactivar' : 'Activar'}
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

        <PaginationComponent 
          data={filteredData}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <Modal show={showModal} onHide={() => setShowModal(false)} className="modal-override categoria-modal">
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
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {isNewAnimal ? 'Crear Animal' : 'Guardar Cambios'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminAnimales;