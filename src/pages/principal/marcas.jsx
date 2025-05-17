// marcas.jsx
import React, { useEffect, useState } from 'react';
import './marcas.css';
import API_BASE_URL from '../../config/apiConfig';

const Marcas = () => {
  const [marcas, setMarcas] = useState([]);

  useEffect(() => {


    fetch(`${API_BASE_URL}/PrivMarcas`)
      .then(response => response.json())
      .then(data => {
        if (data.marcas) {
          setMarcas(data.marcas);
        }
      })
      .catch(error => {
        console.error('Error al cargar marcas:', error);
      });
  }, []);

  return (
    <div className="marcas-carousel-container">
      <div className="marcas-carousel">
        {marcas.map((marca) => (
          <div key={marca.id_marca} className="marca-item">
            <img
              src={marca.imagen}
              alt={marca.nombre}
              className="marca-imagen"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marcas;
