const ticketService = require('../services/ticketService');

async function buyTicket(req, res) {
  try {
    const { flightNumber, date, passengerNames } = req.body;
    if (!flightNumber || !date || !passengerNames || !Array.isArray(passengerNames) || passengerNames.length === 0) {
      return res.status(400).json({ message: 'flightNumber, date, and passengerNames array are required' });
    }
    const result = await ticketService.buyTicket(req.user.id, flightNumber, date, passengerNames);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { buyTicket };
