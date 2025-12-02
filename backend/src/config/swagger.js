const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Leo Club Management System API",
      version: "1.0.0",
      description: "API documentation for the Leo Club Management System",
    },
    servers: [{ url: "http://localhost:5001/api" }],
    components: {
      securitySchemes: { 
        bearerAuth: { 
          type: "http", 
          scheme: "bearer", 
          bearerFormat: "JWT" 
        } 
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, '../routes/*.js')] // ← fixed path
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
