import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <Form className="d-flex align-items-center ms-auto" onSubmit={handleSearch}>
      <Form.Control
        type="search"
        placeholder="Buscar productos..."
        className="search-bar me-2"
        aria-label="Buscar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button variant="outline-secondary" className="search-button" type="submit">
        Buscar
      </Button>
    </Form>
  );
};