require('dotenv').config({ path: '../.env' });
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.AIRPORT_SERVICE_PORT || 4001;

// Turkish airports static data
const AIRPORTS = [
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'SAW', name: 'Sabiha Gokcen International Airport', city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'ESB', name: 'Ankara Esenboga Airport', city: 'Ankara', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'ADB', name: 'Izmir Adnan Menderes Airport', city: 'Izmir', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'TZX', name: 'Trabzon Airport', city: 'Trabzon', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'BJV', name: 'Milas-Bodrum Airport', city: 'Bodrum', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'DLM', name: 'Dalaman Airport', city: 'Dalaman', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'GZT', name: 'Gaziantep Airport', city: 'Gaziantep', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'KYA', name: 'Konya Airport', city: 'Konya', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', timezone: 'Europe/Berlin' },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { code: 'AMS', name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
];

// GET /airports — list all airports (supports ?country= and ?city= filters)
app.get('/airports', (req, res) => {
  const { country, city, page = 1, pageSize = 10 } = req.query;
  let result = AIRPORTS;

  if (country) result = result.filter(a => a.country.toLowerCase().includes(country.toLowerCase()));
  if (city) result = result.filter(a => a.city.toLowerCase().includes(city.toLowerCase()));

  const ps = Math.min(parseInt(pageSize) || 10, 50);
  const pg = parseInt(page) || 1;
  const totalItems = result.length;
  const totalPages = Math.ceil(totalItems / ps);
  const data = result.slice((pg - 1) * ps, pg * ps);

  res.json({ data, page: pg, pageSize: ps, totalPages, totalItems });
});

// GET /airports/:code — get single airport info
app.get('/airports/:code', (req, res) => {
  const airport = AIRPORTS.find(a => a.code === req.params.code.toUpperCase());
  if (!airport) return res.status(404).json({ error: 'Airport not found' });
  res.json(airport);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Airport Info Service', airportCount: AIRPORTS.length });
});

app.listen(PORT, () => {
  console.log(`✈  Airport Service running on port ${PORT}`);
  console.log(`   Airports loaded: ${AIRPORTS.length}`);
});
