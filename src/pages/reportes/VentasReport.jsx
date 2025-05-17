import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from "recharts";
import { Box, Typography, Paper, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import "./reportes.css";
import API_BASE_URL from '../../config/apiConfig';

const VentasReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/reportes/ventas`, {
          params: {
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0]
          }
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Cargando datos de ventas...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom>
        Reporte Detallado de Ventas
      </Typography>
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <DatePicker
            label="Fecha Inicio"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="Fecha Fin"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            minDate={startDate}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
      </LocalizationProvider>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, "Total"]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="total" 
              fill="#1976d2" 
              name="Ventas Totales" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', p: 4 }}>
          No hay datos de ventas para el período seleccionado
        </Typography>
      )}
    </Paper>
  );
};

export default VentasReport;