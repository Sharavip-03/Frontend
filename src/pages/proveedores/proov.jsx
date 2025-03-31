import React, { useState, useEffect } from 'react';
import './proov.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';

const AdminProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
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

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const response = await axios.get(`${apiUrl}/adminProveedor`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProveedores(response.data.proveedores);
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
        await axios.post(`${apiUrl}/adminProveedor`, editProvider, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Proveedor creado exitosamente');
      } else {
        await axios.put(`${apiUrl}/adminProveedor/${editProvider.id_proveedor}`, editProvider, {
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
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';

      const response = await axios.patch(
        `${apiUrl}/adminProveedor/${id_proveedor}`, 
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
      console.error("Error al cambiar estado del proveedor:", error.response?.data || error.message);
      alert(`Error al cambiar estado del proveedor: ${error.response?.data?.mensaje || error.message}`);
      await fetchProveedores();
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Proveedores Registrados</h1>
        
        <Button variant="primary" className="mb-3" onClick={handleAddProvider}>
          Agregar Proveedor
        </Button>

        <Table striped bordered hover responsive>
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
            {proveedores.length > 0 ? (
              proveedores.map((proveedor) => (
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
                      variant="warning" 
                      className="me-2" 
                      onClick={() => handleEditProvider(proveedor)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant={proveedor.estado === 'activo' ? 'danger' : 'success'}
                      onClick={() => toggleProveedorEstado(proveedor.id_proveedor, proveedor.estado)}
                      disabled={proveedor.estado === undefined}
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

        <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control 
                  type="tel"
                  name="telefono"
                  value={editProvider.telefono}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email"
                  name="correo"
                  value={editProvider.correo}
                  onChange={handleInputChange}
                  required
                />
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
