import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AuthModalStyles.css';
const RegistroModal = ({ show, handleClose, handleLoginClick }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipo_doc: '',
    num_documento: '',
    direccion: '',
    contrasena: '',
    confirmContrasena: '',
  });
  const [errors, setErrors] = useState({});
  const [tipoDocs, setTipoDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTipoDocs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tipo_doc`);
        setTipoDocs(response.data.tipo_docs || response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los tipos de documento',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTipoDocs();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=(?:.*[a-z]){5,})(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(formData.nombres)) {
      newErrors.nombres = 'Solo letras y espacios (2-50 caracteres)';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(formData.apellidos)) {
      newErrors.apellidos = 'Solo letras y espacios (2-50 caracteres)';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9]{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'Debe tener 10 dígitos numéricos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un correo válido';
    }

    if (!formData.tipo_doc) {
      newErrors.tipo_doc = 'Seleccione un tipo de documento';
    }

    if (!formData.num_documento.trim()) {
      newErrors.num_documento = 'El número de documento es requerido';
    } else if (!/^\d+$/.test(formData.num_documento)) {
      newErrors.num_documento = 'Solo números permitidos';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (!passwordRegex.test(formData.contrasena)) {
      newErrors.contrasena = 'Debe tener 1 mayúscula, 5 minúsculas, 1 número, 1 símbolo y 8-30 caracteres';
    }

    if (formData.contrasena !== formData.confirmContrasena) {
      newErrors.confirmContrasena = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos correctamente',
        confirmButtonColor: '#FF8357'
      });
      return;
    }

    try {
      const { confirmContrasena, ...userData } = formData;
      const response = await axios.post(`${API_BASE_URL}/signin`, userData);

      if (response.status === 200)  {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente',
          showConfirmButton: true,
          confirmButtonColor: '#FF8357',
          timer: 3000
        });
        handleClose();
      } else {
        throw new Error(response.data.mensaje || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error en registro',
        text: error.response?.data?.mensaje || error.message || 'Ocurrió un error al registrar',
        confirmButtonColor: '#FF8357'
      });
    }
  };

 return (
    <Modal 
      show={show} 
      onHide={handleClose}
      centered
      className="registro-modal"  
      dialogClassName="modal-dialog-centered"
    >
      <Modal.Header className="registro-modal-header">
        <Modal.Title className="registro-modal-title">Crear Cuenta</Modal.Title>
        <button 
          type="button" 
          className="registro-modal-close" 
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
      </Modal.Header>
      <Modal.Body className="registro-modal-body">
        <form onSubmit={handleSubmit} className="registro-form">
          <div className="registro-form-row">
            <div className="registro-form-group">
              <label htmlFor="nombres" className="registro-form-label">Nombres</label>
              <input
                type="text"
                id="nombres"
                className={`registro-form-input ${errors.nombres ? 'is-invalid' : ''}`}
                placeholder="Ej: Juan Carlos"
                value={formData.nombres}
                onChange={handleChange}
              />
              {errors.nombres && <div className="registro-form-error">{errors.nombres}</div>}
            </div>

            <div className="registro-form-group">
              <label htmlFor="apellidos" className="registro-form-label">Apellidos</label>
              <input
                type="text"
                id="apellidos"
                className={`registro-form-input ${errors.apellidos ? 'is-invalid' : ''}`}
                placeholder="Ej: Pérez López"
                value={formData.apellidos}
                onChange={handleChange}
              />
              {errors.apellidos && <div className="registro-form-error">{errors.apellidos}</div>}
            </div>
          </div>

          <div className="registro-form-group">
            <label htmlFor="email" className="registro-form-label">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className={`registro-form-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="registro-form-error">{errors.email}</div>}
          </div>

          <div className="registro-form-row">
            <div className="registro-form-group">
              <label htmlFor="tipo_doc" className="registro-form-label">Tipo de Documento</label>
              <select
                id="tipo_doc"
                className={`registro-form-input ${errors.tipo_doc ? 'is-invalid' : ''}`}
                value={formData.tipo_doc}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">{loading ? 'Cargando...' : 'Seleccione'}</option>
                {tipoDocs.map(tipo => (
                  <option key={tipo.id_tipodocumento} value={tipo.id_tipodocumento}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {errors.tipo_doc && <div className="registro-form-error">{errors.tipo_doc}</div>}
            </div>

            <div className="registro-form-group">
              <label htmlFor="num_documento" className="registro-form-label">Número de Documento</label>
              <input
                type="text"
                id="num_documento"
                className={`registro-form-input ${errors.num_documento ? 'is-invalid' : ''}`}
                placeholder="1234567890"
                value={formData.num_documento}
                onChange={handleChange}
              />
              {errors.num_documento && <div className="registro-form-error">{errors.num_documento}</div>}
            </div>
          </div>

          <div className="registro-form-group">
            <label htmlFor="telefono" className="registro-form-label">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              className={`registro-form-input ${errors.telefono ? 'is-invalid' : ''}`}
              placeholder="3001234567"
              value={formData.telefono}
              onChange={handleChange}
              maxLength="10"
            />
            {errors.telefono && <div className="registro-form-error">{errors.telefono}</div>}
          </div>

          <div className="registro-form-group">
            <label htmlFor="direccion" className="registro-form-label">Dirección</label>
            <input
              type="text"
              id="direccion"
              className={`registro-form-input ${errors.direccion ? 'is-invalid' : ''}`}
              placeholder="Calle 123 #45-67"
              value={formData.direccion}
              onChange={handleChange}
            />
            {errors.direccion && <div className="registro-form-error">{errors.direccion}</div>}
          </div>

          <div className="registro-form-row">
            <div className="registro-form-group">
              <label htmlFor="contrasena" className="registro-form-label">Contraseña</label>
              <input
                type="password"
                id="contrasena"
                className={`registro-form-input ${errors.contrasena ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={formData.contrasena}
                onChange={handleChange}
              />
              {errors.contrasena && <div className="registro-form-error">{errors.contrasena}</div>}
            </div>

            <div className="registro-form-group">
              <label htmlFor="confirmContrasena" className="registro-form-label">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmContrasena"
                className={`registro-form-input ${errors.confirmContrasena ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={formData.confirmContrasena}
                onChange={handleChange}
              />
              {errors.confirmContrasena && <div className="registro-form-error">{errors.confirmContrasena}</div>}
            </div>
          </div>

          <button type="submit" className="registro-form-submit">
            Registrarse
          </button>

          <div className="registro-form-footer">
        <p className="registro-form-text">
          ¿Ya tienes cuenta?{' '}
          <button 
            type="button" 
            className="registro-form-link"
            onClick={() => {
              handleLoginClick();
            }}
          >
            Inicia sesión
          </button>
        </p>
      </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default RegistroModal;