import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardPreview from "./DashboardPreview";
import ReportesDetalles from "./ReportesDetalles";

const Reportes = () => {
  const location = useLocation();
  const [showDetails, setShowDetails] = useState(
    new URLSearchParams(location.search).has("tab")
  );

  return (
    <div>
      {showDetails ? (
        <ReportesDetalles />
      ) : (
        <DashboardPreview />
      )}
    </div>
  );
};

export default Reportes;