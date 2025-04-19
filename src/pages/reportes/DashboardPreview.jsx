import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Menu from "../../components/AdminNavbar/admin";
import "./reportes.css";

const apiUrl = "http://localhost:5000";

const DashboardPreview = () => {
  const [data, setData] = useState({
    ventas: 0,
    productosTop: [],
    usuarios: { activos: 0, nuevos: 0 }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ventasRes, productosRes, usuariosRes] = await Promise.all([
          axios.get(`${apiUrl}/api/reportes/ventas?limit=7`),
          axios.get(`${apiUrl}/api/reportes/productos?limit=3`),
          axios.get(`${apiUrl}/api/reportes/usuarios`)
        ]);

        setData({
          ventas: ventasRes.data.total || 0,
          productosTop: productosRes.data.top_productos || [],
          usuarios: {
            activos: usuariosRes.data.usuarios_activos || 0,
            nuevos: usuariosRes.data.nuevos_clientes || 0
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-container">
        <Menu />
        <div className="content-container">
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Cargando datos...</Typography>
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Resumen General
          </Typography>

          <Grid container spacing={3}>
            {/* Tarjeta de Ventas */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6">Ventas (7 días)</Typography>
                  <Typography variant="h3" sx={{ my: 2, color: 'primary.main' }}>
                    ${data.ventas.toLocaleString()}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate("/admin/reportes?tab=0")}
                    fullWidth
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Tarjeta de Usuarios */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6">Usuarios Activos</Typography>
                  <Typography variant="h3" sx={{ my: 2, color: 'secondary.main' }}>
                    {data.usuarios.activos}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Nuevos: {data.usuarios.nuevos} (30 días)
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate("/admin/reportes?tab=2")}
                    fullWidth
                    color="secondary"
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Tarjeta de Productos */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6">Productos Destacados</Typography>
                  <Box sx={{ my: 2 }}>
                    {data.productosTop.map((p, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1">{p.nombre}</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ${p.ingresos.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate("/admin/reportes?tab=1")}
                    fullWidth
                    color="info"
                  >
                    Ver Stock Completo
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
};

export default DashboardPreview;