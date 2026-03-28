const checkinService = require('../services/checkinService');

async function checkIn(req, res) {
  try {
    const { flightNumber, date, passengerName } = req.body;
    if (!flightNumber || !date || !passengerName) {
      return res.status(400).json({ message: 'flightNumber, date, and passengerName are required' });
    }
    const result = await checkinService.checkIn(flightNumber, date, passengerName);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { checkIn };
