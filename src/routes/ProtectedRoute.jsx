import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const isLogged = localStorage.getItem('isLogged');
  const role = parseInt(localStorage.getItem('rol')) || 2; // Default a cliente si no existe
  
  if (!isLogged) {
    Swal.fire({
      icon: 'warning',
      title: 'Acceso no autorizado',
      text: 'Debes iniciar sesión para acceder a esta página',
    });
    return <Navigate to="/" replace />;
  }
  
  if (adminOnly && role !== 1) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'Solo los administradores pueden acceder a esta sección',
    });
    return <Navigate to="/" replace />;
  }
  
  if (staffOnly && ![1, 3].includes(role)) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'No tienes permisos para acceder a esta sección',
    });
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;