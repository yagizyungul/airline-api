require('dotenv').config({ path: '../.env' });
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

const PORT = process.env.GATEWAY_PORT || 4000;
const AIRLINE_API = process.env.AIRLINE_API_URL || 'http://localhost:3000';
const AIRPORT_SERVICE = process.env.AIRPORT_SERVICE_URL || 'http://localhost:4001';

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const flightQueryLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50,
  message: { error: 'Too many flight queries. Please try again tomorrow.' }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'API Gateway',
    routes: {
      '/api/v1/*': AIRLINE_API,
      '/api/v1/airports/*': AIRPORT_SERVICE
    }
  });
});

// ─── AIRPORT SERVICE PROXY (second service) ───────────────────────────────────
app.use('/api/v1/airports', async (req, res) => {
  try {
    const url = `${AIRPORT_SERVICE}/airports${req.path}`;
    const response = await axios({ method: req.method, url, params: req.query, data: req.body });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json(err.response?.data || { error: 'Airport service unavailable' });
  }
});

// ─── AIRLINE API PROXY (main service) ─────────────────────────────────────────

// Rate-limited flight queries
app.get('/api/v1/flights', flightQueryLimiter, async (req, res) => {
  try {
    const response = await axios.get(`${AIRLINE_API}/api/v1/flights`, {
      params: req.query,
      headers: { authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json(err.response?.data || { error: 'Upstream service unavailable' });
  }
});

// All other airline API routes — generic proxy
app.use('/api/v1', async (req, res) => {
  try {
    const url = `${AIRLINE_API}/api/v1${req.path}`;
    const response = await axios({
      method: req.method,
      url,
      params: req.query,
      data: req.body,
      headers: { authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json(err.response?.data || { error: 'Upstream service unavailable' });
  }
});

// API docs redirect
app.get('/api-docs', (req, res) => {
  res.redirect(`${AIRLINE_API}/api-docs`);
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`   → Airline API:     ${AIRLINE_API}`);
  console.log(`   → Airport Service: ${AIRPORT_SERVICE}`);
});
