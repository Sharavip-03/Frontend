import React, { useState } from 'react';
import './inicio.css';

const Inicio = () => {
    const [formData, setFormData] = useState({
        email: '',
        contrasena: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const { email, contrasena } = formData;

        // Validación básica
        if (!email || !contrasena) {
            setError('Por favor, complete todos los campos.');
            return;
        }

        // Enviar la solicitud al backend
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
                    // Guardar el token o redirigir al usuario a su página principal
                } else {
                    setError(data.mensaje || 'Error en el inicio de sesión');
                }
            })
            .catch((error) => {
                console.error('Error en el inicio de sesión:', error);
                setError('Hubo un error al intentar iniciar sesión.');
            });
    };

    return (
        <div className="inicio">
            <div className="e">
                <div className="wrapper">
                    <form id="login" onSubmit={handleSubmit}>
                        <h1>Inicio de sesión</h1>

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
                                ¿No tienes cuenta aún? <a href="/Registro">Regístrate</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Inicio;
