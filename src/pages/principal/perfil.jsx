import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Alert, Modal, Form, Spinner } from "react-bootstrap";
import EditIcon from '@mui/icons-material/Edit';
import "./Perfil.css";
import API_BASE_URL from "../../config/apiConfig";
import Swal from 'sweetalert2';

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
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    if (!editUser.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(editUser.nombres)) {
      newErrors.nombres = 'Solo letras y espacios (2-50 caracteres)';
    }
    
    if (!editUser.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(editUser.apellidos)) {
      newErrors.apellidos = 'Solo letras y espacios (2-50 caracteres)';
    }
    
    if (!editUser.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!emailRegex.test(editUser.email)) {
      newErrors.email = 'Ingrese un correo válido';
    }
    
    if (!editUser.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!phoneRegex.test(editUser.telefono)) {
      newErrors.telefono = 'Debe tener 10 dígitos numéricos';
    }
    
    if (!editUser.tipo_doc) {
      newErrors.tipo_doc = 'Seleccione un tipo de documento';
    }
    
    if (!editUser.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }
    
    if (editUser.contrasena && editUser.contrasena.length < 8) {
      newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    fetchTiposDoc();
  }, []);

  useEffect(() => {
    const usuarioId = localStorage.getItem("id");
    if (!usuarioId) {
      setError("No hay usuario autenticado");
      setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();

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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const usuarioId = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      
      const userData = {
        ...editUser,
        tipo_doc: parseInt(editUser.tipo_doc)
      };
      
      if (!userData.contrasena) {
        delete userData.contrasena;
      }

      const response = await axios.put(`${API_BASE_URL}/Priv/${usuarioId}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualiza el estado del usuario
      setUser({
        nombres: editUser.nombres,
        apellidos: editUser.apellidos,
        email: editUser.email,
        telefono: editUser.telefono,
        direccion: editUser.direccion,
        tipo_doc: editUser.tipo_doc,
        num_documento: editUser.num_documento
      });
      
      // Muestra la alerta de SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus cambios se han guardado correctamente.',
        confirmButtonText: 'Aceptar'
      });
      
      // Cierra el modal después de que el usuario haga clic en Aceptar
      setShowEditModal(false);
      
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al actualizar el perfil");
    }
  };

  const cerrarSesion = () => {
    // Limpiar todo
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('rol');
    localStorage.removeItem('isLogged');
    localStorage.removeItem('persistentAuth');
    sessionStorage.removeItem('token');
    
    if (onClose) onClose();
    window.location.href = '/'; 
  };
  const getTipoDocNombre = (tipoDocId) => {
    if (!tipoDocId) return "No especificado";
    const tipo = tiposDoc.find(t => t.id_tipodocumento === parseInt(tipoDocId));
    return tipo ? tipo.nombre : "Desconocido";
  };

  if (loading) {
    return (
      <div className="perfil-wrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

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
              <span className="dato-label">Tipo de documento: </span>
              <span>{getTipoDocNombre(user.tipo_doc)}</span>
            </div>
            
            <div className="perfil-dato">
              <span className="dato-label">Número de documento: </span>
              <span>{user.num_documento || "No registrado"}</span>
            </div>
            
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3" controlId="formNombres">
              <Form.Label>Nombres *</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                className={errors.nombres ? 'is-invalid' : ''}
                value={editUser.nombres}
                onChange={handleEditChange}
                required
                pattern="^[a-zA-ZÀ-ÿ\s]{2,50}$"
                title="Solo letras y espacios (2-50 caracteres)"
              />
              {errors.nombres && <div className="invalid-feedback">{errors.nombres}</div>}
              <Form.Text className="text-muted">
                Ingrese sus nombres (solo letras y espacios, 2-50 caracteres)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formApellidos">
              <Form.Label>Apellidos *</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                className={errors.apellidos ? 'is-invalid' : ''}
                value={editUser.apellidos}
                onChange={handleEditChange}
                required
                pattern="^[a-zA-ZÀ-ÿ\s]{2,50}$"
                title="Solo letras y espacios (2-50 caracteres)"
              />
              {errors.apellidos && <div className="invalid-feedback">{errors.apellidos}</div>}
              <Form.Text className="text-muted">
                Ingrese sus apellidos (solo letras y espacios, 2-50 caracteres)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                className={errors.email ? 'is-invalid' : ''}
                value={editUser.email}
                onChange={handleEditChange}
                required
                title="Ingrese un correo electrónico válido"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              <Form.Text className="text-muted">
                Ejemplo: usuario@ejemplo.com
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTipoDoc">
              <Form.Label>Tipo de documento *</Form.Label>
              <Form.Select
                name="tipo_doc"
                className={errors.tipo_doc ? 'is-invalid' : ''}
                value={editUser.tipo_doc}
                onChange={handleEditChange}
                required
                title="Seleccione su tipo de documento"
              >
                <option value="">Seleccione un tipo de documento</option>
                {tiposDoc.map((tipo) => (
                  <option key={tipo.id_tipodocumento} value={tipo.id_tipodocumento}>
                    {tipo.nombre} - {tipo.descripcion}
                  </option>
                ))}
              </Form.Select>
              {errors.tipo_doc && <div className="invalid-feedback">{errors.tipo_doc}</div>}
              <Form.Text className="text-muted">
                Seleccione su tipo de documento de identidad
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNumDocumento">
              <Form.Label>Número de documento</Form.Label>
              <Form.Control
                type="text"
                name="num_documento"
                value={editUser.num_documento}
                onChange={handleEditChange}
                required
                disabled
                title="Número de documento (no editable)"
              />
              <Form.Text className="text-muted">
                Este campo no se puede modificar
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formTelefono">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                className={errors.telefono ? 'is-invalid' : ''}
                value={editUser.telefono}
                onChange={handleEditChange}
                required
                maxLength="10"
                pattern="[0-9]{10}"
                title="10 dígitos numéricos"
              />
              {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
              <Form.Text className="text-muted">
                Ingrese su número de teléfono (10 dígitos)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formDireccion">
              <Form.Label>Dirección *</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                className={errors.direccion ? 'is-invalid' : ''}
                value={editUser.direccion}
                onChange={handleEditChange}
                required
                title="Ingrese su dirección completa"
              />
              {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
              <Form.Text className="text-muted">
                Ingrese su dirección completa (calle, número, ciudad)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formContrasena">
              <Form.Label>Nueva Contraseña (opcional)</Form.Label>
              <Form.Control
                type="password"
                name="contrasena"
                className={errors.contrasena ? 'is-invalid' : ''}
                value={editUser.contrasena}
                onChange={handleEditChange}
                placeholder="Dejar en blanco para no cambiar"
                minLength="8"
                title="Mínimo 8 caracteres"
              />
              {errors.contrasena && <div className="invalid-feedback">{errors.contrasena}</div>}
              <Form.Text className="text-muted">
                Mínimo 8 caracteres (dejar en blanco para no cambiar)
              </Form.Text>
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