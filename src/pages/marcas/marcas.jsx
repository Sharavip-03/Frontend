import React, { useState, useEffect } from 'react';
import './marcas.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';

const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dvzzqjlbj/image/upload';
const cloudinaryPreset = 'proyecto';

const AdminMarcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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

  useEffect(() => {
    setFilteredData(marcas);
  }, [marcas]);

  const fetchMarcas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PrivMarcas`);
      setMarcas(response.data.marcas.map(m => ({
        ...m,
        estado: m.estado || 'Activo'
      })) || []);
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
    }
  };

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("No se encontró token en localStorage");
        return;
      }
  
      const response = await axios.get(`${API_BASE_URL}/adminProveedor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setProveedores(response.data.proveedores || []);
    } catch (error) {
      console.error("Error al obtener los proveedores:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      } else {
        alert("Error al cargar proveedores. Por favor intenta nuevamente.");
      }
      
      setProveedores([]);
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
        await axios.post(`${API_BASE_URL}/PrivMarcas`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.put(`${API_BASE_URL}/PrivMarca/${editMarca.id_marca}`, formData, {
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

  const handleStatusChange = async (id_marca, estadoActual) => {
    if (!window.confirm(`¿Estás seguro que deseas ${estadoActual === 'Activo' ? 'desactivar' : 'activar'} esta marca?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
      await axios.patch(`${API_BASE_URL}/PrivMarca/${id_marca}`, { estado: nuevoEstado }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMarcas(prevMarcas => 
        prevMarcas.map(marca => 
          marca.id_marca === id_marca 
            ? { ...marca, estado: nuevoEstado }
            : marca
        )
      );
      
      alert(`Marca ${nuevoEstado === 'Activo' ? 'activada' : 'desactivada'} exitosamente`);
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Error al cambiar el estado");
      fetchMarcas();
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Marcas Registradas</h1>
        <SearchComponent 
          data={marcas}
          setFilteredData={setFilteredData}
          searchFields={['nombre', 'estado', 'id_marca', 'proveedor']}
        />
        <Button className="crud-btn crud-btn-primary mb-3" onClick={handleAddMarca}>
          Agregar Marca
        </Button>
        <Table className="crud-table" striped bordered hover responsive>
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
            {filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((marca) => (
                  <tr key={marca.id_marca}>
                    <td>{marca.id_marca}</td>
                    <td>{marca.nombre}</td>
                    <td>
                      {proveedores.find(p => p.id_proveedor === marca.id_proveedor)?.nombre || 'Desconocido'}
                    </td>
                    <td className={marca.estado === 'Activo' ? 'text-success' : 'text-danger'}>
                      {marca.estado}
                    </td>
                    <td>
                      <img
                        src={marca.imagen || 'https://via.placeholder.com/100'}
                        alt={marca.nombre}
                        style={{ width: "100px", height: "auto" }}
                      />
                    </td>
                    <td>
                      <Button 
                        className="crud-btn crud-btn-warning me-2" 
                        onClick={() => handleEditMarca(marca)}
                      >
                        Editar
                      </Button>
                      <Button 
                        className={`crud-btn ${marca.estado === 'Activo' ? 'crud-btn-danger' : 'crud-btn-success'}`}
                        onClick={() => handleStatusChange(marca.id_marca, marca.estado)}
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

        <PaginationComponent 
          data={filteredData}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <Modal show={showModal} onHide={() => setShowModal(false)} className="modal-override categoria-modal">
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