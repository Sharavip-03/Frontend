import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

export const SearchComponent = ({ data, setFilteredData, searchFields }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => 
      searchFields.some(field => 
        String(item[field]).toLowerCase().includes(term)
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="mb-3">
      <InputGroup>
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Busca aquí..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </InputGroup>
    </div>
  );
};