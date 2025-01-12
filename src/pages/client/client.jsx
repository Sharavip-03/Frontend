import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Importa el componente Menu (Navbar)
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';

const AdminClientes = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]); // Estado para los tipos de documento
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipo_doc: '',
    num_documento: '',
    direccion: '',
    contrasena: '',
    confirmContrasena: ''
  });

  useEffect(() => {
    fetchUsuarios();
    fetchTiposDoc(); // Cargar los tipos de documento disponibles
  }, []);

  const fetchUsuarios = () => {
    axios.get(`${apiUrl}/Priv`)
      .then((response) => {
        console.log("Usuarios recibidos:", response.data);
        setUsuarios(response.data);
      })
      .catch((error) => console.error("Error al obtener los usuarios:", error));
  };

  const fetchTiposDoc = () => {
    axios.get(`${apiUrl}/tipos-doc`)  // Asegúrate de que esta ruta exista en tu API
      .then((response) => {
        console.log("Tipos de documento:", response.data);
        setTiposDoc(response.data);  // Guarda los tipos de documento en el estado
      })
      .catch((error) => console.error("Error al obtener los tipos de documento:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { nombres, apellidos, telefono, email, tipo_doc, num_documento, direccion, contrasena, confirmContrasena } = newUser;

    if (!nombres || !apellidos || !telefono || !email || !tipo_doc || !num_documento || !direccion || !contrasena || contrasena !== confirmContrasena) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
    }

    axios.post(`${apiUrl}/usuarios`, newUser)  // Ruta para agregar el usuario
      .then(response => {
        console.log("Nuevo usuario agregado:", response.data);
        if (response.data.token_de_acceso) {
          alert('Usuario registrado exitosamente');
        }
        fetchUsuarios();  // Actualiza la lista de usuarios
        setShowModal(false);  // Cierra el modal
      })
      .catch(error => console.error("Error al agregar usuario:", error));
  };

  return (
    <div>
      {/* Navbar */}
      <Menu />

      {/* Contenido principal */}
      <div className="container mt-5">
        <h1>Usuarios Registrados</h1>
        
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Agregar Usuario
        </Button>

        {/* Tabla de usuarios */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Identificación</th>
              <th>Tipo Documento</th>
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
                  <td>{usuario.num_documento}</td>
                  <td>{usuario.tipo_documento ? usuario.tipo_documento.Nombre : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No hay usuarios disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Modal para agregar usuario */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingrese el nombre"
                  name="nombres"
                  value={newUser.nombres}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formApellido">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingrese los apellidos"
                  name="apellidos"
                  value={newUser.apellidos}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingrese el teléfono"
                  name="telefono"
                  value={newUser.telefono}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Ingrese el correo electrónico"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formTipoDoc">
                <Form.Label>Tipo de Documento</Form.Label>
                <Form.Control 
                  as="select"
                  name="tipo_doc"
                  value={newUser.tipo_doc}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona el tipo de documento</option>
                  {tiposDoc.map((tipo) => (
                    <option key={tipo.id_TipoDocumento} value={tipo.id_TipoDocumento}>
                      {tipo.Nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formDocumento">
                <Form.Label>Identificación</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingrese el número de documento"
                  name="num_documento"
                  value={newUser.num_documento}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formDireccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingrese la dirección"
                  name="direccion"
                  value={newUser.direccion}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formContrasena">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Ingrese la contraseña"
                  name="contrasena"
                  value={newUser.contrasena}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formConfirmContrasena">
                <Form.Label>Confirmar Contraseña</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Confirmar la contraseña"
                  name="confirmContrasena"
                  value={newUser.confirmContrasena}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Guardar Usuario
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AdminClientes;
