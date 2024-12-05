import React from 'react';
import './inicio.css';


const Inicio = () => {
    return (
        <div className="inicio">
            <div className="wrapper modal-content">
                <div className="modal-header">
                    <h1 className="modal-title">Inicio de sesión</h1>
                </div>
                <form id="login" className="formu">
                    <div className="input-box">
                        <input
                            type="email"
                            className="form-control"
                            id="loginEmail"
                            placeholder="Ingrese su correo electrónico"
                            required
                        />
                        <div id="loginEmailError" className="ayuda">Por favor, ingrese su correo electrónico.</div>
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            className="form-control"
                            id="loginPassword"
                            placeholder="Ingrese su contraseña"
                            pattern="(?=.*\d)(?=.*[a-z]{2})(?=.*[A-Z]).{5,16}"
                            title="La contraseña debe tener mínimo 5 caracteres, máximo 16 caracteres, debe incluir mínimo una mayúscula, mínimo 2 minúsculas, números y caracteres especiales"
                            required
                        />
                        <div id="loginPasswordError" className="ayuda">Por favor, ingrese su contraseña.</div>
                    </div>
                    <div className="button-container">
                        <button type="submit" className="button-value">Enviar</button>
                        <button type="reset" className="button-value">Limpiar</button>
                    </div>
                    <div className="login-link">
                        <p>¿No tienes cuenta? <a href="/Registro" className="mensaje">Regístrate</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Inicio;
