import React from 'react';
import { useNavigate } from 'react-router-dom';

const FormularioCompra = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="mb-4">Finalizar Compra</h2>
          
          <form className="card p-4">
            <div className="mb-3">
              <label className="form-label">Nombre completo</label>
              <input type="text" className="form-control" placeholder="Juan Pérez" required />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-control" placeholder="juan@example.com" required />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input type="text" className="form-control" placeholder="Calle Principal 123" required />
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Ciudad</label>
                <input type="text" className="form-control" placeholder="Ciudad" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Código Postal</label>
                <input type="text" className="form-control" placeholder="12345" required />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Método de Pago</label>
              <select className="form-select" required>
                <option value="">Seleccione un método</option>
                <option>Tarjeta de Crédito/Débito</option>
                <option>PayPal</option>
                <option>Transferencia Bancaria</option>
              </select>
            </div>
            
            <div className="d-flex justify-content-between">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)} // Regresa a la página anterior
              >
                Volver
              </button>
              <button type="submit" className="btn btn-primary">
                Confirmar Compra
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioCompra;