import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isNewRole, setIsNewRole] = useState(false);
  const [editRole, setEditRole] = useState({
    id_Rol: '',
    Nombre: '',
    Descripcion: ''
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const response = await axios.get(`${apiUrl}/rol`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error al obtener los roles:", error.response?.data || error.message);
    }
  };

  const handleAddRole = () => {
    setIsNewRole(true);
    setEditRole({ id_Rol: '', Nombre: '', Descripcion: '' });
    setShowModal(true);
  };

  const handleEditRole = (role) => {
    setIsNewRole(false);
    setEditRole({ ...role });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditRole({ ...editRole, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      if (isNewRole) {
        await axios.post(`${apiUrl}/rol`, editRole, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Rol creado exitosamente');
      } else {
        await axios.put(`${apiUrl}/rol/${editRole.id_Rol}`, editRole, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Rol actualizado exitosamente');
      }

      fetchRoles();
      setShowModal(false);
    } catch (error) {
      console.error("Error al procesar rol:", error);
      alert(`Error al ${isNewRole ? 'crear' : 'actualizar'} rol: ${error.response?.data?.mensaje || error.message}`);
    }
  };

  return (
    <div>
      <Menu />
      <div className="container mt-5">
        <h1>Roles Registrados</h1>

        <Button variant="primary" className="mb-3" onClick={handleAddRole}>
          Agregar Rol
        </Button>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length > 0 ? (
              roles.map((rol) => (
                <tr key={rol.id_Rol}>
                  <td>{rol.id_Rol}</td>
                  <td>{rol.Nombre}</td>
                  <td>{rol.Descripcion || 'Sin descripción'}</td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEditRole(rol)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No hay roles disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isNewRole ? 'Agregar Rol' : 'Editar Rol'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="Nombre"
                  value={editRole.Nombre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="Descripcion"
                  value={editRole.Descripcion}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {isNewRole ? 'Crear Rol' : 'Guardar Cambios'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminRoles;
