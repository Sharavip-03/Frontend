import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import './estilos.css';

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
    confirmContrasena: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { nombres, apellidos, telefono, email, tipo_doc, num_documento, direccion, contrasena, confirmContrasena } = formData;

    if (!nombres || !apellidos || !telefono || !email || !tipo_doc || !num_documento || !direccion || !contrasena || contrasena !== confirmContrasena) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
    }

    fetch('http://localhost:5000/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token_de_acceso) {
          alert('Usuario registrado exitosamente');
        } else {
          setError(data.mensaje || 'Error en el registro');
        }
      })
      .catch((error) => {
        console.error('Error en el registro:', error);
        setError('Hubo un error al intentar registrar al usuario.');
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <div className="wrapper modal-content">
        <div className="modal-header">
          <h1 className="modal-title">Registro</h1>
          <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
        </div>
        <form id="signin" className="formu" onSubmit={handleSubmit}>
        <div className="input-box">
              <input
                type="text"
                className="form-control"
                id="nombres"
                placeholder="Ingrese los nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="text"
                className="form-control"
                id="apellidos"
                placeholder="Ingrese los apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="tel"
                className="form-control"
                id="telefono"
                placeholder="Ingrese el teléfono"
                value={formData.telefono}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]*"
                required
              />
            </div>

            <div className="input-box">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Ingrese el email"
                value={formData.email}
                onChange={handleChange}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                required
              />
            </div>

            <div className="input-box">
              <input
                type="text"
                className="form-control"
                id="tipo_doc"
                placeholder="Ingrese el tipo de documento"
                value={formData.tipo_doc}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="number"
                className="form-control"
                id="num_documento"
                placeholder="Ingrese el número de documento"
                value={formData.num_documento}
                onChange={handleChange}
                maxLength="10"
                required
              />
            </div>

            <div className="input-box">
              <input
                type="text"
                className="form-control"
                id="direccion"
                placeholder="Ingrese la dirección"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="password"
                className="form-control"
                id="contrasena"
                placeholder="Ingrese la contraseña"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="password"
                className="form-control"
                id="confirmContrasena"
                placeholder="Confirmar la contraseña"
                value={formData.confirmContrasena}
                onChange={handleChange}
                required
              />
            </div>
          <button type="submit">Registrarse</button>

          <div className="login-link">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button type="button" onClick={handleLoginClick} className="btn-link">
                Inicia sesión
              </button>
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RegistroModal;
