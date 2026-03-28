require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const { initDB } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const flightRoutes = require('./src/routes/flightRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const checkinRoutes = require('./src/routes/checkinRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/flights', flightRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/checkin', checkinRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Airline API is running', docs: '/api-docs' });
});

// Start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
