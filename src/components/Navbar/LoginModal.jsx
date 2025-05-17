import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AuthModalStyles.css';
import RegistroModal from './SiginModal';

const LoginModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
  });
  const [showRegister, setShowRegister] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    
    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 8) {
      newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleRegisterClick = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, formData);
      const { token_de_acceso, usuario } = response.data;
      
      if (token_de_acceso) {
        const tokenPayload = JSON.parse(atob(token_de_acceso.split('.')[1]));
        const userRole = tokenPayload.rol;

        localStorage.setItem("token", token_de_acceso);
        localStorage.setItem("id", usuario);
        localStorage.setItem("isLogged", true);
        localStorage.setItem("rol", userRole);

        Swal.fire({
          icon: "success",
          title: "Inicio de sesión exitoso",
          showConfirmButton: false,
          timer: 1500,
        });

        handleClose();

        if (userRole === 1) navigate("/admin/dashboard");
        else if (userRole === 3) navigate("/admin/menu");
        else navigate("/");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || "Error al iniciar sesión";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    }
  };

  return (
    <>
      <Modal 
        show={show && !showRegister} 
        onHide={() => {
          setShowRegister(false);
          handleClose();
        }}
        centered
        className="registro-modal"
        dialogClassName="modal-dialog-centered"

      >
        <Modal.Header className="registro-modal-header">
          <Modal.Title className="registro-modal-title">Iniciar Sesión</Modal.Title>
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

            <button type="submit" className="registro-form-submit">
              Ingresar
            </button>

            <div className="registro-form-footer">
              <p className="registro-form-text">
                ¿No tienes cuenta?{' '}
                <button 
                  type="button" 
                  className="registro-form-link"
                  onClick={handleRegisterClick}
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <RegistroModal 
        show={show && showRegister}
        handleClose={() => setShowRegister(false)}
        handleLoginClick={handleBackToLogin}
      />
    </>
  );
};

export default LoginModal;