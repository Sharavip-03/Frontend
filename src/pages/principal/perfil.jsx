import React, { useState, useEffect } from "react";
import "./perfil.css";
import axios from "axios";

const Perfil = () => {
  const images = [
    "https://images.unsplash.com/photo-1591946614720-90a587da4a36?q=80&w=1887&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516374348294-ce51573b0fb5?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506903536293-8419385acdce?q=80&w=2034&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1677126907612-df3f0cb050a5?q=80&w=1974&auto=format&fit=crop"
  ];
  const [cerrarClose, setCerrarClose] = useState(false); // este es para cerrar sesión 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const isLogged = localStorage.getItem("isLogged") === "true";
  const [user, setUser] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: ""
  });
  const [userTest, setUserTest] = useState([]);
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [editando, setEditando] = useState(false);
  const accessToken = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      "Cache-Control": "no-cache",
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setTimeout(() => setFade(false), 500);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const usuarioId = localStorage.getItem("id"); // Obtener ID desde localStorage
    if (!usuarioId) {
      console.error("No hay usuario autenticado");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/Priv/${usuarioId}`, config);
        const clienteData = response.data.cliente;

        // Actualizando el estado de los usuarios
        setUser({
          nombres: clienteData.nombres,
          apellidos: clienteData.apellidos,
          email: clienteData.email,
          telefono: clienteData.telefono,
          direccion: clienteData.direccion,
        });

        setUserTest(clienteData);

        console.log("Informacion del usuario test:", clienteData);
        console.log("Informacion del response:", clienteData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);
  const actualizarContraseña = () => {
    const usuarioId = localStorage.getItem("id");
    if (!usuarioId) {
      console.error("No hay usuario autenticado");
      return;
    }

    fetch(`http://127.0.0.1:5000/Priv/${usuarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nueva_contrasena: nuevaContraseña }) // Se envía como `nueva_contrasena`
    })
      .then((response) => response.json())
      .then(() => {
        setNuevaContraseña("");
        setEditando(false);
      })
      .catch((error) => console.error("Error al actualizar contraseña:", error));
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("isLogged");
    setCerrarClose(true);
    window.location.href = "/";

  }


  return (
    <div className="perfil-wrapper">
      <div className="perfil-lateral-container">
      {!cerrarClose && (
        <img
          className={`perfil-lateral-imagen ${fade ? "fade-out" : "fade-in"}`}
          src={images[currentIndex]}
          alt="Imagen lateral"
        />
      )}

      </div>
      <div className="perfil-container">
        <div className="perfil-info-container">
          <h2 className="perfil-nombre">{user.nombres} {user.apellidos}</h2>
          <p className="perfil-dato">Correo: {user.email}</p>
          <p className="perfil-dato">Teléfono: {user.telefono}</p>
          <p className="perfil-dato">Dirección: {user.direccion}</p>

          <div className="perfil-contraseña-container">
            {editando ? (
              <div className="perfil-contraseña-edit">
                <input
                  type="password"
                  value={nuevaContraseña}
                  onChange={(e) => setNuevaContraseña(e.target.value)}
                  placeholder="Nueva contraseña"
                />
                <button onClick={actualizarContraseña}>Guardar</button>
                <button onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            ) : (
              <button className="perfil-boton" onClick={() => setEditando(true)}>
                Cambiar contraseña
              </button>

              
            )}

          <button type="button" className="perfil-boton" onClick={cerrarSesion} aria-label="Close">
            Cerrar sesión
            </button>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
