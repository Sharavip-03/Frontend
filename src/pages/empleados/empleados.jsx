import React, { useState, useEffect } from 'react';
import './empleados.css';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';

const AdminEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      await fetchTiposDoc(); // Primero obtenemos los tipos de documento
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (tiposDoc.length > 0) {
      fetchEmpleados(); // Solo se ejecuta cuando `tiposDoc` ya tiene datos
    }
  }, [tiposDoc]); // Se ejecuta cada vez que `tiposDoc` cambia
  

  const fetchEmpleados = async () => {
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const response = await axios.get(`${apiUrl}/adminPrivEm`, {
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
        id_rol: 3 // Asegurar que el rol de empleado se mantenga
      };

      if (!isNewEmployee && !employeeData.contrasena) {
        delete employeeData.contrasena;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      if (isNewEmployee) {
        if (!employeeData.contrasena) {
          alert('La contraseña es requerida para nuevos empleados');
          return;
        }
        await axios.post(`${apiUrl}/adminPrivEm`, employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Empleado creado exitosamente');
      } else {
        await axios.put(`${apiUrl}/adminPrivEm/${editEmployee.id_usuario}`, employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Empleado actualizado exitosamente');
      }

      fetchEmpleados();
      setShowModal(false);
    } catch (error) {
      console.error("Error al procesar empleado:", error);
      alert(`Error al ${isNewEmployee ? 'crear' : 'actualizar'} empleado: ${error.response?.data?.mensaje || error.message}`);
    }
  };
  
  const toggleEmpleadosEstado = async (id_usuario, estadoActual) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

      const response = await axios.patch(
        `${apiUrl}/adminPrivEm/${id_usuario}`, 
        { estado: nuevoEstado }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.status === 200) {
        setEmpleados(prevEmpleados => 
          prevEmpleados.map(usuario => 
            usuario.id_usuario === id_usuario 
              ? { ...usuario, estado: nuevoEstado }
              : usuario
          )
        );

        alert(`Empleado ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
      }
    } catch (error) {
      console.error("Error al cambiar estado del Empleado:", error.response?.data || error.message);
      alert(`Error al cambiar estado del Empleado: ${error.response?.data?.mensaje || error.message}`);
      // Refrescamos los datos en caso de error para asegurar consistencia
      await fetchEmpleados();
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

  return (
    <div>
      <Menu />
      <div className="container mt-5">
        <h1>Empleados Registrados</h1>
        
        <Button variant="primary" className="mb-3" onClick={handleAddEmployee}>
          Agregar Empleado
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
            {empleados.length > 0 ? (
              empleados.map((empleado) => (
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
                      variant="warning" 
                      className="me-2" 
                      onClick={() => handleEditEmployee(empleado)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant={empleado.estado === 'Activo' ? 'danger' : 'success'}
                      onClick={() => toggleEmpleadosEstado(empleado.id_usuario, empleado.estado)}
                      disabled={empleado.estado === undefined}
                    >
                      {empleado.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                    
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">No hay empleados disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control 
                  type="text" 
                  name="apellidos"
                  value={editEmployee.apellidos}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control 
                  type="tel"
                  name="telefono"
                  value={editEmployee.telefono}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email"
                  name="email"
                  value={editEmployee.email}
                  onChange={handleInputChange}
                  required
                />
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
                  required
                />
              </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formDireccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control 
                  type="text"
                  name="direccion"
                  value={editEmployee.direccion}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              {isNewEmployee && (
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contrasena"
                    value={editEmployee.contrasena}
                    onChange={handleInputChange}
                    required
                  />
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
