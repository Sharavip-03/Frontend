import React, { useState, useEffect } from 'react';
import './client.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';
import Swal from 'sweetalert2';

const AdminClientes = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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

  // Función para mostrar alertas de éxito
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  };

  // Función para mostrar alertas de error
  const showErrorAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  };

  // Función para mostrar alertas de confirmación
  const showConfirmAlert = (title, text, confirmButtonText) => {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || 'Confirmar',
      cancelButtonText: 'Cancelar'
    });
  };

  // Función para mostrar alertas de advertencia
  const showWarningAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
  };

  // Cargar tipos de documento y luego usuarios
  useEffect(() => {
    const fetchData = async () => {
      await fetchTiposDoc();
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(usuarios);
  }, [usuarios]);

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

      const response = await axios.get(`${API_BASE_URL}/Priv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const usuariosConTipoDoc = response.data.clientes.map(usuario => {
        const tipoDocumento = tiposDoc.find(t => t.id_tipodocumento === parseInt(usuario.tipo_doc));
        return {
          ...usuario,
          tipo_doc_nombre: tipoDocumento ? tipoDocumento.nombre : 'N/A',
          estado: usuario.estado || 'Activo' // Asegurar que siempre tenga estado
        };
      });

      setUsuarios(usuariosConTipoDoc);
    } catch (error) {
      console.error("Error al obtener los usuarios:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        showErrorAlert(
          "Sesión expirada", 
          "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
        );
      } else {
        showErrorAlert(
          "Error al cargar usuarios", 
          "Error al cargar usuarios. Por favor intenta nuevamente."
        );
      }
    }
  };

  const fetchTiposDoc = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tipo_doc`);
      setTiposDoc(response.data.tipo_docs || response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de documento:", error);
      showErrorAlert(
        "Error al cargar tipos de documento", 
        "No se pudieron cargar los tipos de documento. Por favor intenta nuevamente."
      );
    }
  };

  const handleAddUser = () => {
    setIsNewUser(true);
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
      contrasena: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (usuario) => {
    setIsNewUser(false);
    setEditUser({
      ...usuario,
      tipo_doc: usuario.tipo_doc?.toString() || '',
      contrasena: ''
    });
    setShowModal(true);
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

    if (!isNewUser && !userData.contrasena) {
      delete userData.contrasena;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token disponible");
      return;
    }

    // Validar si el email ya existe (solo para nuevos usuarios)
    if (isNewUser) {
      const emailExists = await checkIfExists('email', userData.email);
      if (emailExists) {
        showErrorAlert(
          "Email ya registrado",
          "El correo electrónico ingresado ya está registrado en el sistema. Por favor use otro email."
        );
        return;
      }
    }

    // Validar si el número de documento ya existe (solo para nuevos usuarios)
    if (isNewUser) {
      const docExists = await checkIfExists('num_documento', userData.num_documento);
      if (docExists) {
        showErrorAlert(
          "Documento ya registrado",
          "El número de documento ingresado ya está registrado en el sistema."
        );
        return;
      }
    }

    if (isNewUser) {
      if (!userData.contrasena) {
        showWarningAlert(
          "Contraseña requerida",
          "La contraseña es requerida para nuevos usuarios"
        );
        return;
      }
      await axios.post(`${API_BASE_URL}/Priv`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccessAlert(
        "Usuario creado", 
        "Usuario creado exitosamente"
      );
    } else {
      await axios.put(`${API_BASE_URL}/Priv/${editUser.id_usuario}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccessAlert(
        "Usuario actualizado", 
        "Usuario actualizado exitosamente"
      );
    }

    fetchUsuarios();
    setShowModal(false);
  } catch (error) {
    console.error("Error al procesar usuario:", error);
    showErrorAlert(
      `Error al ${isNewUser ? 'crear' : 'actualizar'} usuario`, 
      error.response?.data?.mensaje || error.message
    );
  }
};

// Función para verificar si un campo ya existe en la base de datos
const checkIfExists = async (field, value) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token disponible");
      return false;
    }

    // Verificar si el valor ya existe en los usuarios actuales
    const existsInCurrentUsers = usuarios.some(user => 
      String(user[field]).toLowerCase() === String(value).toLowerCase()
    );

    if (existsInCurrentUsers) {
      return true;
    }

    // Si no está en los usuarios cargados, verificar con el backend
    const response = await axios.get(`${API_BASE_URL}/Priv/check-exists`, {
      params: { field, value },
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.exists;
  } catch (error) {
    console.error("Error al verificar existencia:", error);
    return false;
  }
};

  const toggleUsuarioEstado = async (id_usuario, estadoActual) => {
    const result = await showConfirmAlert(
      `¿Cambiar estado del usuario?`, 
      `¿Estás seguro que deseas ${estadoActual === 'Activo' ? 'desactivar' : 'activar'} este usuario?`,
      estadoActual === 'Activo' ? 'Desactivar' : 'Activar'
    );
    
    if (!result.isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

      const response = await axios.patch(
        `${API_BASE_URL}/Priv/${id_usuario}`, 
        { estado: nuevoEstado }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.status === 200) {
        // Actualización optimista del estado
        setUsuarios(prevUsuarios => 
          prevUsuarios.map(usuario => 
            usuario.id_usuario === id_usuario 
              ? { ...usuario, estado: nuevoEstado }
              : usuario
          )
        );

        showSuccessAlert(
          `Usuario ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'}`,
          `El usuario ha sido ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMsg = error.response?.data?.mensaje || 
                      error.response?.data?.message || 
                      error.message || 
                      "Error desconocido";
      
      showErrorAlert(
        "Error al cambiar estado", 
        errorMsg
      );
      
      // Recargar datos para mantener consistencia
      await fetchUsuarios();
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Usuarios Registrados</h1>
        <SearchComponent 
          data={usuarios}
          setFilteredData={setFilteredData}
          searchFields={['nombres', 'apellidos', 'num_documento', 'estado', 'id_usuario', 'email']}
        />
        <Button className="crud-btn crud-btn-primary mb-3" onClick={handleAddUser}>
          Agregar Usuario
        </Button>

        <div className="crud-table-container">
        <Table className="crud-table" responsive={false}>
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
            {filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((usuario) => (
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
                        className="crud-btn crud-btn-warning me-2" 
                        onClick={() => handleEditUser(usuario)}
                      >
                        Editar
                      </Button>
                      <Button 
                        className={`crud-btn ${usuario.estado === 'Activo' ? 'crud-btn-danger' : 'crud-btn-success'}`}
                        onClick={() => toggleUsuarioEstado(usuario.id_usuario, usuario.estado)}
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
        </div>

        <PaginationComponent 
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <Modal show={showModal} onHide={() => setShowModal(false)}  className="modal-override categoria-modal">
          <Modal.Header closeButton>
            <Modal.Title>{isNewUser ? 'Agregar Usuario' : 'Editar Usuario'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit} className="modal-form">
              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nombres"
                  value={editUser.nombres}
                  onChange={handleInputChange}
                  placeholder="Ingrese su nombre"
                  pattern="^[a-zA-ZÀ-ÿ\s]{2,50}$"
                  title="Solo letras y espacios (mínimo 2 caracteres)."
                  autoComplete="off"
                  required
                />
                <Form.Text className="text-muted">
                  Ingrese solo letras y espacios. Mínimo 2 caracteres.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formApellido">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control 
                  type="text" 
                  name="apellidos"
                  value={editUser.apellidos}
                  onChange={handleInputChange}
                  placeholder="Ingrese sus apellidos"
                  pattern="^[a-zA-ZÀ-ÿ\s]{2,50}$"
                  title="Solo letras y espacios (mínimo 2 caracteres)."
                  autoComplete="off"
                  required
                />
                <Form.Text className="text-muted">
                  Ingrese solo letras y espacios. Mínimo 2 caracteres.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  name="telefono"
                  value={editUser.telefono}
                  placeholder="Ingrese número de celular"
                  maxLength="10"
                  autoComplete="off"
                  pattern="[0-9]{10}"
                  title="Ingresar solo números"
                  onChange={handleInputChange}
                  required
                />
                <Form.Text className="text-muted">
                  Introduce tu número de celular.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleInputChange}
                  placeholder="Ingrese su correo electrónico"
                  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  title="Ingrese un correo válido. Ejemplo: usuario@ejemplo.com"
                  autoComplete="off"
                  required
                />
                <Form.Text className="text-muted">
                  Formato válido: usuario@ejemplo.com
                </Form.Text>
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
                    <option key={tipo.id_tipodocumento} value={tipo.id_tipodocumento}>
                      {tipo.nombre} - {tipo.descripcion}
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
                  placeholder="Ingrese solo números"
                  pattern="^\d+$"
                  title="Ingrese solo números sin espacios ni letras"
                  autoComplete="off"
                  required
                />
                <Form.Text className="text-muted">
                  Solo números permitidos.
                </Form.Text>
              </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formDireccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control 
                  type="text"
                  name="direccion"
                  value={editUser.direccion}
                  onChange={handleInputChange}
                  placeholder="Ej: Calle 123 #45-67, Bogotá"
                  pattern="^[A-Za-z0-9\s#\-.,°]+$"
                  title="Ingrese una dirección válida (letras, números, espacios y símbolos como # - . , °)"
                  autoComplete="off"
                  required
                />
                <Form.Text className="text-muted">
                  Puede incluir letras, números y símbolos como # - . , °
                </Form.Text>
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
                    placeholder="Ingrese su contraseña"
                    pattern="^(?=.*[A-Z])(?=(?:.*[a-z]){5,})(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$"
                    title="Debe tener 1 mayúscula, al menos 5 minúsculas, 1 número, 1 símbolo (@$!%*?&) y entre 8 y 30 caracteres."
                    autoComplete="off"
                    required
                  />
                  <Form.Text className="text-muted">
                    8-30 caracteres, con mayúsculas, minúsculas, número y símbolo.
                  </Form.Text>
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