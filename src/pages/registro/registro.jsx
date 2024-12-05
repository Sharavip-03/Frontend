import React, { useState } from 'react';
import './registro.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipo_doc: '',
    num_documento: '',
    direccion: '',
    contrasena: '',
    confirmContrasena: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validación del formulario
    const { nombre, apellidos, telefono, email, tipo_doc, num_documento, direccion, contrasena, confirmContrasena } = formData;

    if (!nombre || !apellidos || !telefono || !email || !tipo_doc || !num_documento || !direccion || !contrasena || contrasena !== confirmContrasena) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
    }

    // Realizar la solicitud al backend
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
          alert('Usuario creado exitosamente');
        } else {
          alert(data.mensaje || 'Error en el registro');
        }
      })
      .catch((error) => {
        console.error('Error en el registro:', error);
        alert('Hubo un error al intentar registrar al usuario.');
      });
  };

  return (
    <div className="registro">
      <div className="e">
        <div className="wrapper">
          <form id="signin" onSubmit={handleSubmit}>
            <h1>Registro</h1>

            <div className="input-box">
              <input
                type="text"
                className="form-control"
                id="nombre"
                placeholder="Ingrese los nombres"
                value={formData.nombre}
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
                ¿Ya tienes una cuenta? <a href="/Inicio">Inicia sesión</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registro;
