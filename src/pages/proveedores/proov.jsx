import { Table, Button, Modal, Form } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';

const AdminProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [isNewProvider, setIsNewProvider] = useState(false);
  const [editProvider, setEditProvider] = useState({
    id_proveedor: '',
    nombre: '',
    telefono: '',
    correo: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  useEffect(() => {
    setFilteredData(proveedores);
  }, [proveedores]);

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/adminProveedor`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProveedores(response.data.proveedores.map(p => ({
        ...p,
        estado: p.estado || 'activo'
      })));
    } catch (error) {
      console.error("Error al obtener los proveedores:", error.response?.data || error.message);
    }
  };

  const handleAddProvider = () => {
    setIsNewProvider(true);
    setEditProvider({
      id_proveedor: '',
      nombre: '',
      telefono: '',
      correo: '',
      estado: 'activo'
    });
    setShowModal(true);
  };

  const handleEditProvider = (proveedor) => {
    setIsNewProvider(false);
    setEditProvider({ ...proveedor });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProvider({ ...editProvider, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      if (isNewProvider) {
        await axios.post(`${API_BASE_URL}/adminProveedor`, editProvider, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Proveedor creado exitosamente');
      } else {
        await axios.put(`${API_BASE_URL}/adminProveedor/${editProvider.id_proveedor}`, editProvider, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Proveedor actualizado exitosamente');
      }

      fetchProveedores();
      setShowModal(false);
    } catch (error) {
      console.error("Error al procesar proveedor:", error);
      alert(`Error al ${isNewProvider ? 'crear' : 'actualizar'} proveedor: ${error.response?.data?.mensaje || error.message}`);
    }
  };

  const toggleProveedorEstado = async (id_proveedor, estadoActual) => {
    if (!window.confirm(`¿Estás seguro que deseas ${estadoActual === 'activo' ? 'desactivar' : 'activar'} este proveedor?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';

      const response = await axios.patch(
        `${API_BASE_URL}/adminProveedor/${id_proveedor}`, 
        { estado: nuevoEstado }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.status === 200) {
        setProveedores(prevProveedores => 
          prevProveedores.map(proveedor => 
            proveedor.id_proveedor === id_proveedor 
              ? { ...proveedor, estado: nuevoEstado }
              : proveedor
          )
        );

        alert(`Proveedor ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
      }
    } catch (error) {
      console.error("Error al cambiar estado del proveedor:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMsg = error.response?.data?.mensaje || 
                      error.response?.data?.message || 
                      error.message || 
                      "Error desconocido";
      
      alert(`Error al cambiar estado: ${errorMsg}`);
      
      await fetchProveedores();
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Proveedores Registrados</h1>
        <SearchComponent 
          data={proveedores}
          setFilteredData={setFilteredData}
          searchFields={['nombre', 'estado', 'id_proveedor', 'telefono', 'correo']}
        />
        <Button className="crud-btn crud-btn-primary mb-3" onClick={handleAddProvider}>
          Agregar Proveedor
        </Button>

        <div className="crud-table-container">
        <Table className="crud-table" responsive={false}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((proveedor) => (
                  <tr key={proveedor.id_proveedor}>
                    <td>{proveedor.id_proveedor}</td>
                    <td>{proveedor.nombre}</td>
                    <td>{proveedor.telefono}</td>
                    <td>{proveedor.correo}</td>
                    <td className={proveedor.estado === 'activo' ? 'text-success' : 'text-danger'}>
                      {proveedor.estado}
                    </td>
                    <td>
                      <Button 
                        className="crud-btn crud-btn-warning me-2" 
                        onClick={() => handleEditProvider(proveedor)}
                      >
                        Editar
                      </Button>
                      <Button 
                        className={`crud-btn ${proveedor.estado === 'activo' ? 'crud-btn-danger' : 'crud-btn-success'}`}
                        onClick={() => toggleProveedorEstado(proveedor.id_proveedor, proveedor.estado)}
                      >
                        {proveedor.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No hay proveedores disponibles.</td>
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
            <Modal.Title>{isNewProvider ? 'Agregar Proveedor' : 'Editar Proveedor'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nombre"
                  value={editProvider.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre del proveedor"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$"
                  title="Solo letras y espacios. Mínimo 2 caracteres."
                  required
                />
                <Form.Text className="text-muted">
                  Solo letras, mínimo 2 caracteres.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control 
                  type="tel"
                  name="telefono"
                  value={editProvider.telefono}
                  onChange={handleInputChange}
                  placeholder="Ingrese número de teléfono"
                  pattern="^\d{10}$"
                  title="Ingrese un número de 10 dígitos."
                  maxLength={10}
                  required
                />
                <Form.Text className="text-muted">
                  Ingrese un número de 10 dígitos.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email"
                  name="correo"
                  value={editProvider.correo}
                  onChange={handleInputChange}
                  placeholder="user@ejemplo.com"
                  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  title="Ingrese un correo válido (ej. user@dominio.com)."
                  required
                />
                <Form.Text className="text-muted">
                  Ejemplo: user@ejemplo.com
                </Form.Text>
              </Form.Group>

              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {isNewProvider ? 'Crear Proveedor' : 'Guardar Cambios'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProveedores;
