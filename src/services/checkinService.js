const { pool } = require('../config/db');

async function checkIn(flightNumber, date, passengerName) {
  const flightResult = await pool.query(
    'SELECT id FROM flights WHERE flight_number = $1 AND date_from = $2',
    [flightNumber, date]
  );

  if (flightResult.rows.length === 0) {
    throw { status: 404, message: 'Flight not found' };
  }

  const flightId = flightResult.rows[0].id;

  const passengerResult = await pool.query(
    'SELECT * FROM passengers WHERE flight_id = $1 AND passenger_name = $2 AND checked_in = FALSE',
    [flightId, passengerName]
  );

  if (passengerResult.rows.length === 0) {
    throw { status: 404, message: 'Passenger not found or already checked in' };
  }

  const passenger = passengerResult.rows[0];

  // Count checked-in passengers on this flight to determine seat number
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM passengers WHERE flight_id = $1 AND checked_in = TRUE',
    [flightId]
  );
  const seatNumber = parseInt(countResult.rows[0].count) + 1;

  await pool.query(
    'UPDATE passengers SET seat_number = $1, checked_in = TRUE, check_in_date = NOW() WHERE id = $2',
    [seatNumber, passenger.id]
  );

  return { success: true, seatNumber };
}

module.exports = { checkIn };
