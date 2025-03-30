import React, { useState, useEffect } from 'react';
import './client.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';

const AdminClientes = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [editUser, setEditUser] = useState({
    id_usuario: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipo_doc: '',
    num_documento: '',
    direccion: '',
    estado: 'Activo',
    contrasena: ''
  });


  // Primero cargar tipos de documento y luego usuarios
  useEffect(() => {
    const fetchData = async () => {
      await fetchTiposDoc(); // Primero obtenemos los tipos de documento
    };
    fetchData();
  }, []);
  

  useEffect(() => {
    if (tiposDoc.length > 0) {
      fetchUsuarios();
    }
  }, [tiposDoc]);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const response = await axios.get(`${apiUrl}/Priv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const usuariosConTipoDoc = response.data.clientes.map(usuario => {
        const tipoDocumento = tiposDoc.find(t => t.id_TipoDocumento === parseInt(usuario.tipo_doc));
        return {
          ...usuario,
          tipo_doc_nombre: tipoDocumento ? tipoDocumento.Nombre : 'N/A',
          estado: usuario.estado || 'Activo'
        };
      });

      setUsuarios(usuariosConTipoDoc);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const fetchTiposDoc = async () => {
    try {
      const response = await axios.get(`${apiUrl}/tipo_doc`);
      setTiposDoc(response.data.tipo_docs || response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de documento:", error);
    }
  };

  const handleAddUser = () => {
    setIsNewUser(true);  // Indicamos que es un nuevo usuario
    setEditUser({
      id_usuario: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      email: '',
      tipo_doc: '',
      num_documento: '',
      direccion: '',
      estado: 'Activo',
      contrasena: ''  // Agregar el campo de contraseña
    });
    setShowModal(true); // Mostrar el modal
  };

  const handleEditUser = (usuario) => {
    setIsNewUser(false);  // Indicamos que estamos editando un usuario
    setEditUser({
      ...usuario,
      tipo_doc: usuario.tipo_doc?.toString() || '',
      contrasena: ''  // Limpiar la contraseña, no debe ser editable
    });
    setShowModal(true);  // Mostrar el modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userData = {
        ...editUser,
        tipo_doc: parseInt(editUser.tipo_doc)
      };

      // Si es edición y no se ha ingresado nueva contraseña, eliminarla del objeto
      if (!isNewUser && !userData.contrasena) {
        delete userData.contrasena;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      if (isNewUser) {
        if (!userData.contrasena) {
          alert('La contraseña es requerida para nuevos usuarios');
          return;
        }
        await axios.post(`${apiUrl}/Priv`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Usuario creado exitosamente');
      } else {
        await axios.put(`${apiUrl}/Priv/${editUser.id_usuario}`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Usuario actualizado exitosamente');
      }

      fetchUsuarios();
      setShowModal(false);
    } catch (error) {
      console.error("Error al procesar usuario:", error);
      alert(`Error al ${isNewUser ? 'crear' : 'actualizar'} usuario: ${error.response?.data?.mensaje || error.message}`);
    }
  };

  const toggleUsuarioEstado = async (id_usuario, estadoActual) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

      const response = await axios.patch(
        `${apiUrl}/Priv/${id_usuario}`, 
        { estado: nuevoEstado }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.status === 200) {
        setUsuarios(prevUsuarios => 
          prevUsuarios.map(usuario => 
            usuario.id_usuario === id_usuario 
              ? { ...usuario, estado: nuevoEstado }
              : usuario
          )
        );

        alert(`Usuario ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
      }
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error.response?.data || error.message);
      alert(`Error al cambiar estado del usuario: ${error.response?.data?.mensaje || error.message}`);
      // Refrescamos los datos en caso de error para asegurar consistencia
      await fetchUsuarios();
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Usuarios Registrados</h1>

        <Button variant="primary" className="mb-3"  onClick={handleAddUser}>
          Agregar Usuario
        </Button>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Tipo Documento</th>
              <th>Número Documento</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.id_usuario}</td>
                  <td>{usuario.nombres}</td>
                  <td>{usuario.apellidos}</td>
                  <td>{usuario.telefono}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.tipo_doc_nombre}</td>
                  <td>{usuario.num_documento}</td>
                  <td>{usuario.direccion}</td>
                  <td className={usuario.estado === 'Activo' ? 'text-success' : 'text-danger'}>
                    {usuario.estado}
                  </td>
                  <td>
                    <Button 
                      variant="warning" 
                      className="me-2" 
                      onClick={() => handleEditUser(usuario)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant={usuario.estado === 'Activo' ? 'danger' : 'success'}
                      onClick={() => toggleUsuarioEstado(usuario.id_usuario, usuario.estado)}
                      disabled={usuario.estado === undefined}
                    >
                      {usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">No hay usuarios disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isNewUser ? 'Agregar Usuario' : 'Editar Usuario'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nombres"
                  value={editUser.nombres}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formApellido">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control 
                  type="text" 
                  name="apellidos"
                  value={editUser.apellidos}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control 
                  type="tel"
                  name="telefono"
                  value={editUser.telefono}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formTipoDoc">
                <Form.Label>Tipo de Documento</Form.Label>
                <Form.Select
                  name="tipo_doc"
                  value={editUser.tipo_doc}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione un tipo de documento</option>
                  {tiposDoc.map((tipo) => (
                    <option key={tipo.id_TipoDocumento} value={tipo.id_TipoDocumento}>
                      {tipo.Nombre} - {tipo.Descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {isNewUser && (
              <Form.Group className="mb-3" controlId="formDocumento">
                <Form.Label>Número de Documento</Form.Label>
                <Form.Control
                  type="text"
                  name="num_documento"
                  value={editUser.num_documento}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formDireccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control 
                  type="text"
                  name="direccion"
                  value={editUser.direccion}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              {/* Campo de contraseña solo visible al crear nuevo usuario */}
              {isNewUser && (
                <Form.Group className="mb-3" controlId="formContrasena">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contrasena"
                    value={editUser.contrasena}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              )}

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {isNewUser ? 'Crear Usuario' : 'Guardar Cambios'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminClientes;
