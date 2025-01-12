import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import './estilos.css';
import RegistroModal from './SiginModal'; // Asegúrate de importar el modal de registro.

const LoginModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
  });
  const [isRegistering, setIsRegistering] = useState(false); // Nuevo estado para alternar entre login y registro
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { email, contrasena } = formData;

    setEmailError('');
    setPasswordError('');
    if (!email || !contrasena) {
      if (!email) setEmailError('Por favor, ingrese su correo electrónico.');
      if (!contrasena) setPasswordError('Por favor, ingrese su contraseña.');
      return;
    }

    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token_de_acceso) {
          alert('Inicio de sesión exitoso');
        } else {
          setError(data.mensaje || 'Error en el inicio de sesión');
        }
      })
      .catch((error) => {
        console.error('Error en el inicio de sesión:', error);
        setError('Hubo un error al intentar iniciar sesión.');
      });
  };

  const handleRegisterClick = () => {
    setIsRegistering(true); // Cambiar el estado a registro
  };

  const handleLoginClick = () => {
    setIsRegistering(false); // Volver al formulario de inicio de sesión
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <div className="wrapper modal-content">
        <div className="modal-header">
          <h1 className="modal-title">{isRegistering ? 'Registro' : 'Inicio de sesión'}</h1>
          <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
        </div>
        {!isRegistering ? (
          // Formulario de inicio de sesión
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
              {error && <div id="loginEmailError" className="text-danger">{error}</div>}
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
              {error && <div id="loginPasswordError" className="text-danger">{error}</div>}
            </div>

            <button type="submit">Entrar</button>

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
          // Aquí renderizamos el formulario de registro
          <RegistroModal 
            show={show} 
            handleClose={handleClose} 
            handleLoginClick={handleLoginClick} // Función para volver al login
          />
        )}
      </div>
    </Modal>
  );
};

export default LoginModal;
