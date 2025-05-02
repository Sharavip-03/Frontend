import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Alert } from "react-bootstrap";
import "./Perfil.css";

const Perfil = () => {
  const images = [
    "https://images.unsplash.com/photo-1591946614720-90a587da4a36?q=80&w=1887&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516374348294-ce51573b0fb5?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506903536293-8419385acdce?q=80&w=2034&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1677126907612-df3f0cb050a5?q=80&w=1974&auto=format&fit=crop"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [user, setUser] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: ""
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioId = localStorage.getItem("id");
    if (!usuarioId) {
      setError("No hay usuario autenticado");
      return;
    }

    const cargarPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/Priv/${usuarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser({
          nombres: response.data.cliente.nombres,
          apellidos: response.data.cliente.apellidos,
          email: response.data.cliente.email,
          telefono: response.data.cliente.telefono,
          direccion: response.data.cliente.direccion,
        });
      } catch (err) {
        setError(err.response?.data?.mensaje || "Error al cargar el perfil");
      }
    };

    cargarPerfil();

    // Cambiar imagen cada 5 segundos
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("isLogged");
    navigate("/");
  };

  return (
    <div className="perfil-wrapper">
      <div className="perfil-lateral-container">
        <img
          className={`perfil-lateral-imagen ${fade ? "fade-out" : "fade-in"}`}
          src={images[currentIndex]}
          alt="Imagen lateral"
        />
      </div>
      
      <div className="perfil-container">
        <div className="perfil-info-container">
          <h2 className="perfil-nombre">{user.nombres} {user.apellidos}</h2>
          
          <div className="perfil-datos">
            <div className="perfil-dato">
              <span className="dato-label">Correo:</span>
              <span>{user.email}</span>
            </div>
            
            <div className="perfil-dato">
              <span className="dato-label">Teléfono:</span>
              <span>{user.telefono || "No registrado"}</span>
            </div>
            
            <div className="perfil-dato">
              <span className="dato-label">Dirección:</span>
              <span>{user.direccion || "No registrada"}</span>
            </div>
          </div>
          
          <div className="perfil-botones">
            <Button 
              className="perfil-boton1"
              onClick={() => navigate('/historial-compras')}
            >
              Ver Historial de Compras
            </Button>
            
            <Button 
              className="perfil-boton2"
              onClick={cerrarSesion}
            >
              Cerrar Sesión
            </Button>
          </div>
          
          {error && <Alert variant="danger" className="perfil-error">{error}</Alert>}
        </div>
      </div>
    </div>
  );
};

export default Perfil;