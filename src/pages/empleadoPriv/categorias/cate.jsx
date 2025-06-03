import React, { useState, useEffect } from 'react';
import './cate.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import MenuEmp from '../../../components/AdminNavbar/empleado';
import API_BASE_URL from '../../../config/apiConfig';
import { SearchComponent } from '../../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../../buscador/ParaCruds/PaginationComponent';
import Swal from 'sweetalert2';

const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';


const EmpCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [isNewCategoria, setIsNewCategoria] = useState(false);
  const [editCategoria, setEditCategoria] = useState({
    id_categoria: '',
    nombre: '',
    descripcion: '',
    imagen: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    setFilteredData(categorias);
  }, [categorias]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!editCategoria.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(editCategoria.nombre)) {
      newErrors.nombre = 'Solo letras y espacios (2-50 caracteres)';
    }
    
    if (editCategoria.descripcion && editCategoria.descripcion.length > 255) {
      newErrors.descripcion = 'La descripción no puede exceder 255 caracteres';
    }

    if (isNewCategoria && !editCategoria.imagenFile && !editCategoria.imagen) {
      newErrors.imagen = 'La imagen es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleAddCategoria = () => {
    setIsNewCategoria(true);
    setEditCategoria({ id_categoria: '', nombre: '', descripcion: '', imagen: '' });
    setErrors({});
    setShowModal(true);
  };

  const handleEditCategoria = (categoria) => {
    setIsNewCategoria(false);
    setEditCategoria({ ...categoria });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteCategoria = async (id_categoria) => {
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
      await axios.delete(`${API_BASE_URL}/categoria/${id_categoria}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      Swal.fire(
        '¡Eliminado!',
        'La categoría ha sido eliminada.',
        'success'
      );

      fetchCategorias();
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al eliminar la categoría'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditCategoria({ ...editCategoria, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      formData.append('nombre', editCategoria.nombre);
      formData.append('descripcion', editCategoria.descripcion || '');
      if (editCategoria.file) {
        formData.append('imagen', editCategoria.file);
      }

      if (isNewCategoria) {
        await axios.post(`${API_BASE_URL}/categoria`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Categoría creada exitosamente'
        });
      } else {
        await axios.put(`${API_BASE_URL}/categoria/${editCategoria.id_categoria}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Categoría actualizada exitosamente'
        });
      }
      setShowModal(false);
      fetchCategorias();
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar la categoría'
      });
    }
  };

  return (
    <div className="admin-container">
      <MenuEmp />
      <div className="content-container">
        <h1>Categorías Registradas</h1>
        <SearchComponent 
          data={categorias}
          setFilteredData={setFilteredData}
          searchFields={['nombre', 'estado', 'id_categoria', 'descripcion']}
        />
        <Button className="mb-3" onClick={handleAddCategoria}>
          Agregar Categoría
        </Button>
        <div className="crud-table-container">
        <Table className="crud-table" responsive={false}>
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
          {filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((categoria) => (
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
                    <Button className="crud-btn crud-btn-warning me-2" onClick={() => handleEditCategoria(categoria)}>
                      Editar
                    </Button>
                    <Button className="crud-btn crud-btn-danger" onClick={() => handleDeleteCategoria(categoria.id_categoria)}>
                      Eliminar
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
        </div>

        <PaginationComponent 
          data={filteredData}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

<Modal show={showModal} onHide={() => setShowModal(false)} className="modal-override categoria-modal"> 
  <Modal.Header closeButton>
    <Modal.Title>{isNewCategoria ? 'Agregar Categoría' : 'Editar Categoría'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formNombreCategoria">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          className={errors.nombre ? 'is-invalid' : ''}
          value={editCategoria.nombre}
          onChange={handleInputChange}
          required
          pattern="^[a-zA-ZÀ-ÿ\s]{2,50}$"
          title="Solo letras y espacios (2-50 caracteres). Campo obligatorio."
        />
        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        <Form.Text className="text-muted">
          Nombre de la categoría (solo letras y espacios, 2-50 caracteres). Campo obligatorio.
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="formDescripcionCategoria">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          as="textarea"
          name="descripcion"
          className={errors.descripcion ? 'is-invalid' : ''}
          value={editCategoria.descripcion}
          onChange={handleInputChange}
          maxLength="255"
          title="Máximo 255 caracteres."
        />
        {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
        <Form.Text className="text-muted">
          Descripción de la categoría (máximo 255 caracteres).
        </Form.Text>
      </Form.Group>
    <Form.Group className="mb-3" controlId="formImagen">
      <Form.Label>Imagen {isNewCategoria && '*'}</Form.Label>
      <Form.Control 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className={errors.imagen ? 'is-invalid' : ''}
        required={isNewCategoria}
        title="Suba una imagen de la Categoria. Formatos aceptados: JPG, PNG, etc."
      />
      {errors.imagen && <div className="invalid-feedback">{errors.imagen}</div>}
      {editCategoria.imagen && (
        <div className="mt-2">
          <img 
            src={editCategoria.imagen} 
            alt="Vista previa" 
            style={{ width: "100px", height: "auto" }} 
            className="img-thumbnail"
          />
        </div>
      )}
      <Form.Text className="text-muted">
        Imagen representativa del Categoria (formatos: JPG, PNG, etc.). 
        {isNewCategoria && " Campo obligatorio para nuevas Categorias."}
      </Form.Text>
    </Form.Group>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancelar
      </Button>
      <Button type="submit">
        {isNewCategoria ? 'Crear Categoría' : 'Guardar Cambios'}
      </Button>
    </Form>
  </Modal.Body>
</Modal>
      </div>
    </div>
  );
};

export default EmpCategorias;