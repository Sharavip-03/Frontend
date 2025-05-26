import React, { useState, useEffect } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { 
  Box, Typography, Paper, Card, CardContent, Grid 
} from "@mui/material";
import axios from "axios";
import "./reportes.css";
import API_BASE_URL from '../../../config/apiConfig';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const UsuariosReport = () => {
  const [data, setData] = useState({
    usuarios_activos: 0,
    nuevos_clientes: 0,
    usuarios_por_rol: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/reportes/usuarios`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData({
          usuarios_activos: response.data.usuarios_activos,
          nuevos_clientes: response.data.nuevos_clientes,
          usuarios_por_rol: [
            { name: 'Administradores', value: 10 }, // Estos datos deberían venir de la API
            { name: 'Empleados', value: 15 },
            { name: 'Clientes', value: 75 }
          ]
        });
      } catch (error) {
        console.error("Error fetching users data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando datos de usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Resumen de usuarios */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usuarios Activos
              </Typography>
              <Typography variant="h3" sx={{ color: 'primary.main' }}>
                {data.usuarios_activos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nuevos Clientes (30 días)
              </Typography>
              <Typography variant="h3" sx={{ color: 'secondary.main' }}>
                {data.nuevos_clientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribución por Rol
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.usuarios_por_rol}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.usuarios_por_rol.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actividad de Usuarios
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Ene', activos: 120 },
                  { name: 'Feb', activos: 150 },
                  { name: 'Mar', activos: 180 },
                  { name: 'Abr', activos: 200 },
                  { name: 'May', activos: 220 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activos" fill="#8884d8" name="Usuarios Activos" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsuariosReport;