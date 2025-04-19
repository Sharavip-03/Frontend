import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip 
} from "@mui/material";
import axios from "axios";
import "./reportes.css";

const apiUrl = "http://localhost:5000";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ProductosReport = () => {
  const [data, setData] = useState({
    top_productos: [],
    stock_bajo: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/reportes/productos`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching products data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando datos de productos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Gráfico de productos más vendidos */}
      <Paper sx={{ p: 3, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom>
          Productos Más Vendidos
        </Typography>
        
        {data.top_productos.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data.top_productos}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nombre" type="category" width={150} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`]}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="#4caf50" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 4 }}>
            No hay datos de productos vendidos
          </Typography>
        )}
      </Paper>

      {/* Tabla de stock bajo */}
      <Paper sx={{ p: 3, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Productos con Stock Bajo
        </Typography>
        
        {data.stock_bajo.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.stock_bajo.map((producto) => (
                  <TableRow key={producto.id_producto}>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell align="right">{producto.stock}</TableCell>
                    <TableCell align="right">${producto.precio.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={producto.stock < 5 ? "Crítico" : "Bajo"} 
                        color={producto.stock < 5 ? "error" : "warning"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 4 }}>
            No hay productos con stock bajo
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ProductosReport;