import React from 'react';
import { Pagination } from 'react-bootstrap';

export const PaginationComponent = ({ 
  totalItems = 0, 
  itemsPerPage = 5, 
  currentPage = 1, 
  onPageChange = () => {} 
}) => {
  // Validación para evitar errores
  if (totalItems <= 0 || itemsPerPage <= 0) {
    return null;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination>
        <Pagination.Prev 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        />
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        
        <Pagination.Next 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </div>
  );
};