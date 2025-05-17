import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Alert, Modal, Form } from "react-bootstrap";
import EditIcon from '@mui/icons-material/Edit';
import "./Perfil.css";
import API_BASE_URL from "../../config/apiConfig";

const Perfil = ({ onClose }) => {
  const [tiposDoc, setTiposDoc] = useState([]);
  const images = [
    "https://images.unsplash.com/photo-1591946614720-90a587da4a36?q=80&w=1887&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516374348294-ce51573b0fb5?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506903536293-8419385acdce?q=80&w=2034&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1677126907612-df3f0cb050a5?q=80&w=1974&auto=format&fit=crop"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [user, setUser] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    tipo_doc: "",
    num_documento: ""
  });
  const [editUser, setEditUser] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipo_doc: '',
    num_documento: '',
    direccion: '',
    contrasena: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const fetchTiposDoc = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tipo_doc`);
      setTiposDoc(response.data.tipo_docs || response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de documento:", error);
      setError("Error al cargar tipos de documento");
    }
  };

  useEffect(() => {
    fetchTiposDoc(); // Cargar tipos de documento al montar el componente
  }, []);

  useEffect(() => {
    const usuarioId = localStorage.getItem("id");
    if (!usuarioId) {
      setError("No hay usuario autenticado");
      return;
    }

    const cargarPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/Priv/${usuarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const clienteData = response.data.cliente;
        setUser({
          nombres: clienteData.nombres,
          apellidos: clienteData.apellidos,
          email: clienteData.email,
          telefono: clienteData.telefono,
          direccion: clienteData.direccion,
          tipo_doc: clienteData.tipo_doc,
          num_documento: clienteData.num_documento
        });
        
        // Inicializar los datos de edición con los mismos valores
        setEditUser({
          nombres: clienteData.nombres,
          apellidos: clienteData.apellidos,
          email: clienteData.email,
          telefono: clienteData.telefono,
          direccion: clienteData.direccion,
          tipo_doc: clienteData.tipo_doc?.toString() || '',
          num_documento: clienteData.num_documento,
          contrasena: ''
        });
      } catch (err) {
        setError(err.response?.data?.mensaje || "Error al cargar el perfil");
      }
    };

    cargarPerfil();

    // Cambiar imagen cada 5 segundos
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const usuarioId = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      
      // Preparar datos para enviar, convirtiendo tipo_doc a número
      const userData = {
        ...editUser,
        tipo_doc: parseInt(editUser.tipo_doc)
      };
      
      // Si no se ha ingresado nueva contraseña, eliminarla del objeto
      if (!userData.contrasena) {
        delete userData.contrasena;
      }

      const response = await axios.put(`${API_BASE_URL}/Priv/${usuarioId}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess("Perfil actualizado correctamente");
      setUser({
        nombres: editUser.nombres,
        apellidos: editUser.apellidos,
        email: editUser.email,
        telefono: editUser.telefono,
        direccion: editUser.direccion,
        tipo_doc: editUser.tipo_doc,
        num_documento: editUser.num_documento
      });
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al actualizar el perfil");
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("isLogged");
    if (onClose) onClose();
    navigate("/");
  };

  // Función para obtener el nombre del tipo de documento
  const getTipoDocNombre = (tipoDocId) => {
    if (!tipoDocId) return "No especificado";
    const tipo = tiposDoc.find(t => t.id_TipoDocumento === parseInt(tipoDocId));
    return tipo ? tipo.Nombre : "Desconocido";
  };

  return (
    <div className="perfil-wrapper">
      <div className="perfil-lateral-container">
        <img
          className={`perfil-lateral-imagen ${fade ? "fade-out" : "fade-in"}`}
          src={images[currentIndex]}
          alt="Imagen lateral"
        />
      </div>
      
      <div className="perfil-container">
        <div className="perfil-info-container">
          <h2 className="perfil-nombre">{user.nombres} {user.apellidos}</h2>
          
          <div className="perfil-datos">

            <div className="perfil-dato">
              <span className="dato-label">Correo: </span>
              <span>{user.email}</span>
            </div>
            
            <div className="perfil-dato">
              <span className="dato-label">Teléfono: </span>
              <span>{user.telefono || "No registrado"}</span>
            </div>
            
            <div className="perfil-dato">
              <span className="dato-label">Dirección: </span>
              <span>{user.direccion || "No registrada"}</span>
            </div>
          </div>
          
          <div className="perfil-botones">
            <Button 
              className="perfil-boton3"
              onClick={() => setShowEditModal(true)}
            >
              <EditIcon />
              Editar perfil
            </Button>

            <Button 
              className="perfil-boton1"
              onClick={() => navigate('/historial-compras')}
            >
              Ver Historial de Compras
            </Button>
            
            <Button 
              className="perfil-boton2"
              onClick={cerrarSesion}
            >
              Cerrar Sesión
            </Button>
          </div>
          
          {error && <Alert variant="danger" className="perfil-error">{error}</Alert>}
        </div>
      </div>

      {/* Modal de edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={editUser.nombres}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={editUser.apellidos}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editUser.email}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de documento</Form.Label>
              <Form.Select
                name="tipo_doc"
                value={editUser.tipo_doc}
                onChange={handleEditChange}
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

            <Form.Group className="mb-3">
              <Form.Label>Número de documento</Form.Label>
              <Form.Control
                type="text"
                name="num_documento"
                value={editUser.num_documento}
                onChange={handleEditChange}
                required
                disabled // Deshabilitado porque no debería cambiarse
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={editUser.telefono}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={editUser.direccion}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña (opcional)</Form.Label>
              <Form.Control
                type="password"
                name="contrasena"
                value={editUser.contrasena}
                onChange={handleEditChange}
                placeholder="Dejar en blanco para no cambiar"
              />
            </Form.Group>
            
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Perfil;