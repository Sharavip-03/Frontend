import React, { useState, useEffect } from 'react';
import './animales.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';
import Swal from 'sweetalert2';

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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAnimales();
  }, []);

  useEffect(() => {
    setFilteredData(animales);
  }, [animales]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!editAnimal.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(editAnimal.nombre)) {
      newErrors.nombre = 'Solo letras y espacios (2-50 caracteres)';
    }
    
    if (!editAnimal.estado) {
      newErrors.estado = 'El estado es requerido';
    }

    if (isNewAnimal && !editAnimal.imagenFile && !editAnimal.imagen) {
      newErrors.imagen = 'La imagen es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAnimales = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/animalesProd`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimales(response.data.animales || []);
    } catch (error) {
      console.error("Error al obtener los animales:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar animales. Por favor intente nuevamente.'
      });
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
    setErrors({});
    setShowModal(true);
  };

  const handleEditAnimal = (animal) => {
    setIsNewAnimal(false);
    setEditAnimal({ ...animal });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteAnimal = async (id_animal) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
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
      await axios.delete(`${API_BASE_URL}/animalesProd/${id_animal}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      Swal.fire(
        '¡Eliminado!',
        'El animal ha sido eliminado.',
        'success'
      );

      fetchAnimales();
    } catch (error) {
      console.error("Error al eliminar el animal:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al eliminar el animal'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditAnimal({ ...editAnimal, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al subir la imagen'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
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
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Animal creado exitosamente'
        });
      } else {
        await axios.put(`${API_BASE_URL}/animalesProd/${editAnimal.id_animal}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Animal actualizado exitosamente'
        });
      }
      setShowModal(false);
      fetchAnimales();
    } catch (error) {
      console.error("Error al guardar el animal:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al ${isNewAnimal ? 'crear' : 'actualizar'} animal: ${error.response?.data?.mensaje || error.message}`
      });
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
        <div className="crud-table-container">
        <Table className="crud-table" responsive={false}>
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
                        className="crud-btn crud-btn-danger"
                        onClick={() => handleDeleteAnimal(animal.id_animal)}
                      >
                        <i className="bi bi-trash"></i> Eliminar
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
        </div>

        <PaginationComponent 
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

<Modal show={showModal} onHide={() => setShowModal(false)} className="modal-override categoria-modal">
  <Modal.Header closeButton>
    <Modal.Title>{isNewAnimal ? 'Agregar Animal' : 'Editar Animal'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formNombreAnimal">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          className={errors.nombre ? 'is-invalid' : ''}
          value={editAnimal.nombre}
          onChange={handleInputChange}
          required
          pattern="^[a-zA-ZÀ-ÿ\s]{2,50}$"
          title="Solo letras y espacios (2-50 caracteres). Campo obligatorio."
        />
        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        <Form.Text className="text-muted">
          Nombre del animal (solo letras y espacios, 2-50 caracteres). Campo obligatorio.
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="formEstadoAnimal">
        <Form.Label>Estado</Form.Label>
        <Form.Select
          name="estado"
          className={errors.estado ? 'is-invalid' : ''}
          value={editAnimal.estado}
          onChange={handleInputChange}
          required
          title="Seleccione el estado del animal. Campo obligatorio."
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </Form.Select>
        {errors.estado && <div className="invalid-feedback">{errors.estado}</div>}
        <Form.Text className="text-muted">
          Estado actual del animal en el sistema. Campo obligatorio.
        </Form.Text>
      </Form.Group>
    <Form.Group className="mb-3" controlId="formImagen">
      <Form.Label>Imagen {isNewAnimal && '*'}</Form.Label>
      <Form.Control 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className={errors.imagen ? 'is-invalid' : ''}
        required={isNewAnimal}
        title="Suba una imagen del Animal. Formatos aceptados: JPG, PNG, etc."
      />
      {errors.imagen && <div className="invalid-feedback">{errors.imagen}</div>}
      {editAnimal.imagen && (
        <div className="mt-2">
          <img 
            src={editAnimal.imagen} 
            alt="Vista previa" 
            style={{ width: "100px", height: "auto" }} 
            className="img-thumbnail"
          />
        </div>
      )}
      <Form.Text className="text-muted">
        Imagen representativa del Animal (formatos: JPG, PNG, etc.). 
        {isNewAnimal && " Campo obligatorio para nuevos animal."}
      </Form.Text>
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