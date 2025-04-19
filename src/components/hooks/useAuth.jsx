import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = (requiredRole = null) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isLogged = localStorage.getItem('isLogged');
    const role = parseInt(localStorage.getItem('rol')) || 2;
    
    if (!isLogged) {
      navigate('/');
      return;
    }
    
    if (requiredRole === 'admin' && role !== 1) {
      navigate('/');
    }
    
    if (requiredRole === 'staff' && ![1, 3].includes(role)) {
      navigate('/');
    }
  }, [navigate, requiredRole]);
  
  return {
    isLogged: localStorage.getItem('isLogged'),
    role: parseInt(localStorage.getItem('rol')) || 2,
    userId: localStorage.getItem('id')
  };
};

export default useAuth;