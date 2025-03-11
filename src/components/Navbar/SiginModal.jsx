import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2'; // Librería para las alertas
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
    confirmContrasena: '',
  });
  const [error, setError] = useState('');
  const [tipoDocs, setTipoDocs] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/tipo_doc')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setTipoDocs(data.tipo_docs);
      })
      .catch((error) => {
        console.error('Error al obtener los tipos de documento:', error);
        setError('No se pudieron cargar los tipos de documento');
      })
      .finally(() => setLoadingTipos(false));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (formData.contrasena !== formData.confirmContrasena) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.token_de_acceso) {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          showConfirmButton: false,
          timer: 1500,
        });
        handleClose();
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: data.mensaje || 'Error en el registro',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al intentar registrar al usuario',
      });
    }
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
            <input type="text" className="form-control" id="nombres" placeholder="Ingrese los nombres" value={formData.nombres} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <input type="text" className="form-control" id="apellidos" placeholder="Ingrese los apellidos" value={formData.apellidos} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <input type="tel" className="form-control" id="telefono" placeholder="Ingrese el teléfono" value={formData.telefono} onChange={handleChange} maxLength="10" pattern="[0-9]*" required />
          </div>
          <div className="input-box">
            <input type="email" className="form-control" id="email" placeholder="Ingrese el email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="select custom-select">
            <select id="tipo_doc" className="form-control" value={formData.tipo_doc} onChange={handleChange} required disabled={loadingTipos}>
              <option className='option' value="">{loadingTipos ? 'Cargando tipos de documento...' : 'Seleccione el tipo de documento'}</option>
              {tipoDocs.map((tipo) => (
                <option className='option' key={tipo.id_TipoDocumento} value={tipo.id_TipoDocumento}>{tipo.Nombre} - {tipo.Descripcion}</option>
              ))}
            </select>
          </div>
          <div className="input-box">
            <input type="number" className="form-control" id="num_documento" placeholder="Ingrese el número de documento" value={formData.num_documento} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <input type="text" className="form-control" id="direccion" placeholder="Ingrese la dirección" value={formData.direccion} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <input type="password" className="form-control" id="contrasena" placeholder="Ingrese la contraseña" value={formData.contrasena} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <input type="password" className="form-control" id="confirmContrasena" placeholder="Confirmar la contraseña" value={formData.confirmContrasena} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-link">Registrarse</button><br />
          <div className="login-link">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button type="button" onClick={handleLoginClick} className="btn-link">Inicia sesión</button>
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RegistroModal;
