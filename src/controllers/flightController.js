const flightService = require('../services/flightService');

async function addFlight(req, res) {
  try {
    const { flightNumber, dateFrom, dateTo, airportFrom, airportTo, duration, capacity } = req.body;
    if (!flightNumber || !dateFrom || !dateTo || !airportFrom || !airportTo || !duration || !capacity) {
      return res.status(400).json({ message: 'All flight fields are required' });
    }
    const result = await flightService.addFlight(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

async function uploadFlights(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }
    const result = await flightService.uploadFlights(req.file.path);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

async function queryFlights(req, res) {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const rateLimited = await flightService.checkRateLimit(ip);
    if (rateLimited) {
      return res.status(429).json({ message: 'Daily query limit (3) exceeded. Try again tomorrow.' });
    }
    const result = await flightService.queryFlights(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

async function getPassengers(req, res) {
  try {
    const { flightNumber } = req.params;
    const { date, page } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }
    const result = await flightService.getPassengers(flightNumber, date, page);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { addFlight, uploadFlights, queryFlights, getPassengers };
