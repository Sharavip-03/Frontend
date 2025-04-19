import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, Tab, Box, Button, Typography } from "@mui/material";
import VentasReport from "./VentasReport";
import ProductosReport from "./ProductosReport";
import UsuariosReport from "./UsuariosReport";
import Menu from "../../components/AdminNavbar/admin";
import "./reportes.css";

const ReportesDetalles = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const initialTab = parseInt(query.get("tab")) || 0;
  const [tabValue, setTabValue] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = parseInt(query.get("tab")) || 0;
    setTabValue(tabFromUrl);
  }, [location.search]);

  const handleTabChange = (event, newValue) => {
    navigate(`/admin/reportes?tab=${newValue}`);
    setTabValue(newValue);
  };

  return (
    <div className="admin-container">
      <Menu />
      <div className="content-container">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Reportes Detallados
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Ventas" />
              <Tab label="Productos" />
              <Tab label="Usuarios" />
            </Tabs>
            <Button 
              variant="contained" 
              onClick={() => navigate("/admin/dashboard")}
              sx={{ ml: 2 }}
            >
              Volver al Resumen
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && <VentasReport />}
            {tabValue === 1 && <ProductosReport />}
            {tabValue === 2 && <UsuariosReport />}
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default ReportesDetalles;