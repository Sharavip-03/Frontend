import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Librería para las alertas
import './estilos.css';
import RegistroModal from './SiginModal';
import axios from 'axios';

const LoginModal = ({ show, handleClose }) => {
  const urlAPI = 'http://127.0.0.1:5000/login';
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Error en la solicitud al servidor");
      }
  
      const data = await response.json();
      
      if (data.token_de_acceso) {
        // Decodificar el token para obtener el rol
        const tokenPayload = JSON.parse(atob(data.token_de_acceso.split('.')[1]));
        const userRole = tokenPayload.rol;
  
        localStorage.setItem("token", data.token_de_acceso);
        localStorage.setItem("id", data.usuario);
        localStorage.setItem("isLogged", true);
        localStorage.setItem("rol", userRole); // Guardar el rol
  
        Swal.fire({
          icon: "success",
          title: "Inicio de sesión exitoso",
          showConfirmButton: false,
          timer: 1500,
        });
  
        handleClose();
  
        // Redirección basada en el rol
        if (userRole === 1) { // 1 = Admin
          navigate("/admin/dashboard");
        } else if (userRole === 3) { // 3 = Empleado
          navigate("/admin/menu"); // O la ruta que corresponda para empleados
        } else { // 2 = Cliente
          navigate("/");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.mensaje || "Email o contraseña incorrectos",
        });
      }
    } catch (error) {
      console.error("Error en la solicitud al servidor", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al intentar iniciar sesión",
      });
    }
  };

  const handleRegisterClick = () => {
    setIsRegistering(true);
  };

  const handleLoginClick = () => {
    setIsRegistering(false);
  };

  const resetState = () => {
    setIsRegistering(false);
    setFormData({
      email: '',
      contrasena: '',
    });
    setError('');
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      onExited={resetState} // Restablecer el estado aquí
      centered
    >
      <div className="wrapper modal-content">
        <div className="modal-header">
          <h1 className="modal-title">{isRegistering ? 'Registro' : 'Inicio de sesión'}</h1>
          <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
        </div>
        {!isRegistering ? (
          <form id="login" className="formu" onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Ingrese su correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="password"
                className="form-control"
                id="contrasena"
                placeholder="Ingrese su contraseña"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
            </div>

            <button className='btn-link' type="submit">Entrar</button><br />

            <div className="login-link">
              <p>
                ¿No tienes cuenta aún?{' '}
                <button type="button" onClick={handleRegisterClick} className="btn-link">
                  Regístrate
                </button>
              </p>
            </div>
          </form>
        ) : (
          <RegistroModal 
            show={show} 
            handleClose={handleClose} 
            handleLoginClick={handleLoginClick}
          />
        )}
      </div>
    </Modal>
  );
};

export default LoginModal;
