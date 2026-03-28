const { pool } = require('../config/db');

async function buyTicket(userId, flightNumber, date, passengerNames) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const flightResult = await client.query(
      'SELECT * FROM flights WHERE flight_number = $1 AND date_from = $2',
      [flightNumber, date]
    );

    if (flightResult.rows.length === 0) {
      throw { status: 404, message: 'Flight not found' };
    }

    const flight = flightResult.rows[0];
    const seatsNeeded = passengerNames.length;

    if (flight.remaining_seats < seatsNeeded) {
      throw { status: 400, message: 'Sold out' };
    }

    // Generate ticket number: TKT-YYYYMMDD-XXXX
    const dateStr = date.replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${dateStr}-${random}`;

    const ticketResult = await client.query(
      'INSERT INTO tickets (ticket_number, flight_id, user_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [ticketNumber, flight.id, userId, 'active']
    );

    const ticketId = ticketResult.rows[0].id;

    // Add each passenger
    for (const name of passengerNames) {
      await client.query(
        'INSERT INTO passengers (passenger_name, ticket_id, flight_id, seat_number, checked_in) VALUES ($1, $2, $3, NULL, FALSE)',
        [name, ticketId, flight.id]
      );
    }

    // Decrease remaining seats
    await client.query(
      'UPDATE flights SET remaining_seats = remaining_seats - $1 WHERE id = $2',
      [seatsNeeded, flight.id]
    );

    await client.query('COMMIT');

    return { success: true, ticketNumber };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { buyTicket };
