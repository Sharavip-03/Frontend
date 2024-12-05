import React from 'react';
import './registro.css';

const Registro = () => {
  return (
    <div className="registro">
      <div className="wrapper">
        <form id="signUp" className="formu">
          <div className="header-container">
            <h1 className="modal-title">Registro</h1>
          </div>

          <div className="input-box">
            <input
              type="text"
              id="signUpNombres"
              placeholder="Ingrese los nombres"
              required
            />
            <div className="ayuda">Por favor, ingrese los nombres.</div>
          </div>

          <div className="input-box">
            <input
              type="text"
              id="signUpApellidos"
              placeholder="Ingrese los apellidos"
              required
            />
            <div className="ayuda">Por favor, ingrese los apellidos.</div>
          </div>

          <div className="input-box">
            <input
              type="text"
              id="signUpTipoDoc"
              placeholder="Ingrese el tipo de documento"
              required
            />
            <div className="ayuda">Por favor, ingrese el tipo de documento.</div>
          </div>

          <div className="input-box">
            <input
              type="tel"
              id="signUpTelefono"
              placeholder="Ingrese el teléfono"
              maxLength="10"
              pattern="[0-9]*"
              title="Ingresar solo números"
              required
            />
            <div className="ayuda">Por favor, ingrese el teléfono.</div>
          </div>

          <div className="input-box">
            <input
              type="number"
              id="signUpNumDoc"
              placeholder="Ingrese el número de documento"
              maxLength="10"
              pattern="[0-9]*"
              title="Ingresar solo números"
              required
            />
            <div className="ayuda">Por favor, ingrese el número de documento.</div>
          </div>

          <div className="input-box">
            <input
              type="text"
              id="signUpDireccion"
              placeholder="Ingrese la dirección"
              required
            />
            <div className="ayuda">Por favor, ingrese la dirección.</div>
          </div>

          <div className="input-box">
            <input
              type="email"
              id="signUpEmail"
              placeholder="Ingrese el email"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              required
            />
            <div className="ayuda">Por favor, ingrese un email válido.</div>
          </div>

          <div className="input-box">
            <input
              type="password"
              id="signUpContrasena"
              placeholder="Ingrese la contraseña"
              pattern="(?=.*\d)(?=.*[a-z]{2})(?=.*[A-Z]).{5,16}"
              title="La contraseña debe tener mínimo 5 caracteres, máximo 16 caracteres, incluir una mayúscula, 2 minúsculas y números."
              required
            />
            <div className="ayuda">Por favor, ingrese la contraseña.</div>
          </div>

          <div className="input-box">
            <input
              type="password"
              id="signUpConfirmContrasena"
              placeholder="Confirmar la contraseña"
              required
            />
            <div className="ayuda">Por favor, confirme la contraseña.</div>
          </div>

          <div className="button-container">
            <button type="submit">Registrarse</button>
          </div>

          <div className="login-link">
            <p>
              ¿Ya tienes una cuenta? <a href="/Inicio">Inicia sesión</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
