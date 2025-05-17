const environments = {
    development: {
      API_BASE_URL: 'http://localhost:5000'
    },
    production: {
      API_BASE_URL: 'https://tu-api-en-kinsta.com'
    }
  };
  
  const env = process.env.NODE_ENV || 'development';
  const API_BASE_URL = environments[env].API_BASE_URL;
  
  export default API_BASE_URL;