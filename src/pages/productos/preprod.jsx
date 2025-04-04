import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Menu from '../../components/AdminNavbar/admin';

const apiUrl = 'http://localhost:5000';

const PreaccesoProductos = () => {
  const [animales, setAnimales] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimales();
  }, []);

  const fetchAnimales = async () => {
    try {
      const response = await axios.get(`${apiUrl}/animalesProd`);
      setAnimales(response.data.animales || []);
    } catch (error) {
      console.error("Error al obtener los animales:", error);
    }
  };

  const handleVerProductos = (id_animal) => {
    navigate(`/admin/productos/${id_animal}`, { state: { idAnimalSeleccionado: id_animal } });
  };

  return (
    <div className="admin-container">
      <Menu />
      <Container>
        <h2 className="text-center my-4">Selecciona un Animal</h2>
        <Row className="justify-content-center">
          {animales.length > 0 ? (
            animales.map((animal) => (
              <Col key={animal.id_animal} md={4} lg={3} className="mb-4">
                <Card className="text-center">
                  <Card.Img
                    variant="top"
                    src={animal.imagen || 'https://via.placeholder.com/150'}
                    alt={animal.nombre}
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{animal.nombre}</Card.Title>
                    <Button variant="primary" onClick={() => handleVerProductos(animal.id_animal)}>
                      Ver Productos
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center">No hay animales registrados.</p>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default PreaccesoProductos;