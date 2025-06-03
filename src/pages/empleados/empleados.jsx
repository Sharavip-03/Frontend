import React, { useState, useEffect } from 'react';
import './empleados.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';
import API_BASE_URL from '../../config/apiConfig';
import { SearchComponent } from '../buscador/ParaCruds/SearchComponent';
import { PaginationComponent } from '../buscador/ParaCruds/PaginationComponent';
import Swal from 'sweetalert2';

const AdminEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [tiposDoc, setTiposDoc] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isNewEmployee, setIsNewEmployee] = useState(false);
  const [editEmployee, setEditEmployee] = useState({
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

  // Funciones para SweetAlert
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  };

  const showErrorAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  };

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

  const showWarningAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTiposDoc();
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (tiposDoc.length > 0) {
      fetchEmpleados();
    }
  }, [tiposDoc]);

  useEffect(() => {
    setFilteredData(empleados);
  }, [empleados]);

  const fetchEmpleados = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/adminPrivEm`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const empleadosConTipoDoc = response.data.empleados.map(empleado => {
        const tipoDocumento = tiposDoc.find(t => t.id_TipoDocumento === parseInt(empleado.tipo_doc));
        return {
          ...empleado,
          tipo_doc_nombre: tipoDocumento ? tipoDocumento.Nombre : 'N/A',
          estado: empleado.estado || 'Activo'
        };
      });

      setEmpleados(empleadosConTipoDoc);
    } catch (error) {
      console.error("Error al obtener los empleados:", error.response?.data || error.message);
      showErrorAlert(
        "Error al cargar empleados",
        "No se pudieron cargar los empleados. Por favor intente nuevamente."
      );
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
        "No se pudieron cargar los tipos de documento. Por favor intente nuevamente."
      );
    }
  };

  // Función para verificar si un campo ya existe
  const checkFieldExists = async (field, value, currentId = '') => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return false;
      }

      // Verificar primero en los empleados ya cargados
      const existsLocally = empleados.some(
        emp => String(emp[field]).toLowerCase() === String(value).toLowerCase() && 
               emp.id_usuario !== currentId
      );

      if (existsLocally) {
        return true;
      }

      // Si no está localmente, verificar con el backend
      const response = await axios.get(`${API_BASE_URL}/adminPrivEm/check-field`, {
        params: { field, value },
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.exists;
    } catch (error) {
      console.error("Error al verificar campo:", error);
      return false;
    }
  };

  const handleAddEmployee = () => {
    setIsNewEmployee(true);
    setEditEmployee({
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

  const handleEditEmployee = (empleado) => {
    setIsNewEmployee(false);
    setEditEmployee({
      ...empleado,
      tipo_doc: empleado.tipo_doc?.toString() || '',
      contrasena: ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditEmployee({ ...editEmployee, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const employeeData = {
        ...editEmployee,
        tipo_doc: parseInt(editEmployee.tipo_doc),
        id_rol: 3
      };

      if (!isNewEmployee && !employeeData.contrasena) {
        delete employeeData.contrasena;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      // Validar email duplicado
      if (isNewEmployee || 
          (editEmployee.id_usuario && 
           empleados.find(e => e.id_usuario === editEmployee.id_usuario)?.email !== editEmployee.email)) {
        const emailExists = await checkFieldExists('email', editEmployee.email, editEmployee.id_usuario);
        if (emailExists) {
          showErrorAlert(
            "Correo ya registrado",
            "El correo electrónico ingresado ya está registrado para otro empleado."
          );
          return;
        }
      }

      // Validar documento duplicado (solo para nuevos empleados)
      if (isNewEmployee) {
        const docExists = await checkFieldExists('num_documento', editEmployee.num_documento);
        if (docExists) {
          showErrorAlert(
            "Documento ya registrado",
            "El número de documento ingresado ya está registrado en el sistema."
          );
          return;
        }
      }

      if (isNewEmployee) {
        if (!employeeData.contrasena) {
          showWarningAlert(
            "Contraseña requerida",
            "La contraseña es requerida para nuevos empleados"
          );
          return;
        }
        await axios.post(`${API_BASE_URL}/adminPrivEm`, employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccessAlert(
          "Empleado creado", 
          "El empleado ha sido creado exitosamente"
        );
      } else {
        await axios.put(`${API_BASE_URL}/adminPrivEm/${editEmployee.id_usuario}`, employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccessAlert(
          "Empleado actualizado", 
          "Los datos del empleado han sido actualizados"
        );
      }

      fetchEmpleados();
      setShowModal(false);
    } catch (error) {
      console.error("Error al procesar empleado:", error);
      showErrorAlert(
        `Error al ${isNewEmployee ? 'crear' : 'actualizar'} empleado`,
        error.response?.data?.mensaje || error.message || "Ocurrió un error inesperado"
      );
    }
  };
  
  const toggleEmpleadosEstado = async (id_usuario, estadoActual) => {
    const result = await showConfirmAlert(
      `¿Cambiar estado del empleado?`,
      `¿Estás seguro que deseas ${estadoActual === 'Activo' ? 'desactivar' : 'activar'} este empleado?`,
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
        `${API_BASE_URL}/adminPrivEm/${id_usuario}`, 
        { estado: nuevoEstado }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.status === 200) {
        setEmpleados(prevEmpleados => 
          prevEmpleados.map(empleado => 
            empleado.id_usuario === id_usuario 
              ? { ...empleado, estado: nuevoEstado }
              : empleado
          )
        );

        showSuccessAlert(
          `Empleado ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'}`,
          `El empleado ha sido ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado del empleado:", error);
      
      const errorMsg = error.response?.data?.mensaje || 
                      error.response?.data?.message || 
                      error.message || 
                      "Error desconocido";
      
      showErrorAlert(
        "Error al cambiar estado",
        errorMsg
      );
      
      await fetchEmpleados();
    }
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <h1>Empleados Registrados</h1>
        <SearchComponent 
          data={empleados}
          setFilteredData={setFilteredData}
          searchFields={['nombres', 'apellidos', 'num_documento', 'estado', 'id_usuario', 'email']}
        />
        <Button className="crud-btn crud-btn-primary mb-3" onClick={handleAddEmployee}>
          Agregar Empleado
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
                .map((empleado) => (
                  <tr key={empleado.id_usuario}>
                    <td>{empleado.id_usuario}</td>
                    <td>{empleado.nombres}</td>
                    <td>{empleado.apellidos}</td>
                    <td>{empleado.telefono}</td>
                    <td>{empleado.email}</td>
                    <td>{empleado.tipo_doc_nombre}</td>
                    <td>{empleado.num_documento}</td>
                    <td>{empleado.direccion}</td>
                    <td className={empleado.estado === 'Activo' ? 'text-success' : 'text-danger'}>
                      {empleado.estado}
                    </td>
                    <td>
                      <Button 
                        className="crud-btn crud-btn-warning me-2" 
                        onClick={() => handleEditEmployee(empleado)}
                      >
                        Editar
                      </Button>
                      <Button 
                        className={`crud-btn ${empleado.estado === 'Activo' ? 'crud-btn-danger' : 'crud-btn-success'}`}
                        onClick={() => toggleEmpleadosEstado(empleado.id_usuario, empleado.estado)}
                      >
                        {empleado.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">No hay empleados disponibles.</td>
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
            <Modal.Title>{isNewEmployee ? 'Agregar Empleado' : 'Editar Empleado'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nombres"
                  value={editEmployee.nombres}
                  onChange={handleInputChange}
                  placeholder="Ingrese su nombre"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$"
                  title="Solo letras y espacios. Mínimo 2 caracteres."
                  required
                />
                <Form.Text className="text-muted">
                  Solo letras, mínimo 2 caracteres.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control 
                  type="text" 
                  name="apellidos"
                  value={editEmployee.apellidos}
                  onChange={handleInputChange}
                  placeholder="Ingrese sus apellidos"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$"
                  title="Solo letras y espacios. Mínimo 2 caracteres."
                  required
                />
                <Form.Text className="text-muted">
                  Solo letras, mínimo 2 caracteres.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control 
                  type="tel"
                  name="telefono"
                  value={editEmployee.telefono}
                  onChange={handleInputChange}
                  placeholder="Ingrese número de celular"
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
                  name="email"
                  value={editEmployee.email}
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

              <Form.Group className="mb-3" controlId="formTipoDoc">
                <Form.Label>Tipo de Documento</Form.Label>
                <Form.Select
                  name="tipo_doc"
                  value={editEmployee.tipo_doc}
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

              {isNewEmployee && (
              <Form.Group className="mb-3" controlId="formDocumento">
                <Form.Label>Número de Documento</Form.Label>
                <Form.Control
                  type="text"
                  name="num_documento"
                  value={editEmployee.num_documento}
                  onChange={handleInputChange}
                  placeholder="Ingrese número de documento"
                  pattern="^\d{6,12}$"
                  title="Ingrese entre 6 y 12 dígitos numéricos."
                  required
                />
                <Form.Text className="text-muted">
                  Ingrese entre 6 y 12 dígitos numéricos.
                </Form.Text>
              </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formDireccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control 
                  type="text"
                  name="direccion"
                  value={editEmployee.direccion}
                  onChange={handleInputChange}
                  placeholder="Ingrese dirección"
                  pattern="^[A-Za-z0-9#\-\s,.°]{5,}$"
                  title="Ingrese una dirección válida (mínimo 5 caracteres)."
                  required
                />
                <Form.Text className="text-muted">
                  Dirección válida, mínimo 5 caracteres.
                </Form.Text>
              </Form.Group>

              {isNewEmployee && (
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contrasena"
                    value={editEmployee.contrasena}
                    onChange={handleInputChange}
                    placeholder="Ingrese contraseña"
                    pattern="^(?=.*[A-Z])(?=(?:.*[a-z]){5,})(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$"
                    title="Debe tener 1 mayúscula, al menos 5 minúsculas, 1 número, 1 símbolo, entre 8 y 10 caracteres."
                    required
                  />
                  <Form.Text className="text-muted">
                    8-10 caracteres, con mayúsculas, minúsculas, número y símbolo.
                  </Form.Text>
                </Form.Group>
              )}

              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {isNewEmployee ? 'Crear Empleado' : 'Guardar Cambios'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminEmpleados;