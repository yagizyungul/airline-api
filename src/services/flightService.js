const { pool } = require('../config/db');
const FlightDTO = require('../dto/flightDTO');
const PassengerDTO = require('../dto/passengerDTO');
const fs = require('fs');
const csv = require('csv-parser');

async function addFlight(flightData) {
  const { flightNumber, dateFrom, dateTo, airportFrom, airportTo, duration, capacity } = flightData;

  const result = await pool.query(
    `INSERT INTO flights (flight_number, date_from, date_to, airport_from, airport_to, duration, capacity, remaining_seats)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
    [flightNumber, dateFrom, dateTo, airportFrom, airportTo, duration, capacity]
  );

  return { success: true, message: 'Flight added' };
}

async function uploadFlights(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', async () => {
        let processed = 0;
        let failed = 0;

        for (const row of rows) {
          try {
            await pool.query(
              `INSERT INTO flights (flight_number, date_from, date_to, airport_from, airport_to, duration, capacity, remaining_seats)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
              [row.flightNumber, row.dateFrom, row.dateTo, row.airportFrom, row.airportTo, parseInt(row.duration), parseInt(row.capacity)]
            );
            processed++;
          } catch (err) {
            failed++;
          }
        }

        fs.unlinkSync(filePath);
        resolve({ success: true, processed, failed });
      })
      .on('error', (err) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
  });
}

async function checkRateLimit(ipAddress) {
  const result = await pool.query(
    'SELECT * FROM query_logs WHERE ip_address = $1 AND query_date = CURRENT_DATE',
    [ipAddress]
  );

  if (result.rows.length === 0) {
    await pool.query(
      'INSERT INTO query_logs (ip_address, query_date, query_count) VALUES ($1, CURRENT_DATE, 1)',
      [ipAddress]
    );
    return false;
  }

  const log = result.rows[0];
  if (log.query_count >= 50) {
    return true;
  }

  await pool.query(
    'UPDATE query_logs SET query_count = query_count + 1 WHERE id = $1',
    [log.id]
  );
  return false;
}

async function queryFlights(params) {
  const { dateFrom, dateTo, airportFrom, airportTo, numberOfPeople, tripType, page, pageSize: pageSizeParam } = params;
  const pageSize = Math.min(parseInt(pageSizeParam) || 10, 100);
  const currentPage = parseInt(page) || 1;
  const offset = (currentPage - 1) * pageSize;
  const peopleCount = parseInt(numberOfPeople) || 1;

  // Outbound flights
  let query = `SELECT * FROM flights WHERE remaining_seats >= $1`;
  let countQuery = `SELECT COUNT(*) FROM flights WHERE remaining_seats >= $1`;
  const queryParams = [peopleCount];
  const countParams = [peopleCount];
  let paramIndex = 2;

  if (dateFrom) {
    query += ` AND date_from >= $${paramIndex}`;
    countQuery += ` AND date_from >= $${paramIndex}`;
    queryParams.push(dateFrom);
    countParams.push(dateFrom);
    paramIndex++;
  }
  if (dateTo) {
    query += ` AND date_to <= $${paramIndex}`;
    countQuery += ` AND date_to <= $${paramIndex}`;
    queryParams.push(dateTo);
    countParams.push(dateTo);
    paramIndex++;
  }
  if (airportFrom) {
    query += ` AND airport_from = $${paramIndex}`;
    countQuery += ` AND airport_from = $${paramIndex}`;
    queryParams.push(airportFrom);
    countParams.push(airportFrom);
    paramIndex++;
  }
  if (airportTo) {
    query += ` AND airport_to = $${paramIndex}`;
    countQuery += ` AND airport_to = $${paramIndex}`;
    queryParams.push(airportTo);
    countParams.push(airportTo);
    paramIndex++;
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / pageSize);

  query += ` ORDER BY date_from ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(pageSize, offset);

  const result = await pool.query(query, queryParams);
  const outboundFlights = result.rows.map(f => new FlightDTO(f));

  if (tripType === 'roundtrip' && airportFrom && airportTo) {
    // Return flights (swap from/to)
    let returnQuery = `SELECT * FROM flights WHERE remaining_seats >= $1 AND airport_from = $2 AND airport_to = $3`;
    const returnParams = [peopleCount, airportTo, airportFrom];
    let rIdx = 4;

    if (dateFrom) {
      returnQuery += ` AND date_from >= $${rIdx}`;
      returnParams.push(dateFrom);
      rIdx++;
    }
    if (dateTo) {
      returnQuery += ` AND date_to <= $${rIdx}`;
      returnParams.push(dateTo);
      rIdx++;
    }

    returnQuery += ` ORDER BY date_from ASC LIMIT $${rIdx} OFFSET $${rIdx + 1}`;
    returnParams.push(pageSize, offset);

    const returnResult = await pool.query(returnQuery, returnParams);
    const returnFlights = returnResult.rows.map(f => new FlightDTO(f));

    return {
      data: {
        outbound: outboundFlights,
        return: returnFlights,
      },
      page: currentPage,
      totalPages,
    };
  }

  return {
    data: outboundFlights,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

async function getPassengers(flightNumber, date, page, pageSizeParam) {
  const pageSize = Math.min(parseInt(pageSizeParam) || 10, 100);
  const currentPage = parseInt(page) || 1;
  const offset = (currentPage - 1) * pageSize;

  const flightResult = await pool.query(
    'SELECT id FROM flights WHERE flight_number = $1 AND date_from = $2',
    [flightNumber, date]
  );

  if (flightResult.rows.length === 0) {
    throw { status: 404, message: 'Flight not found' };
  }

  const flightId = flightResult.rows[0].id;

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM passengers WHERE flight_id = $1',
    [flightId]
  );
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / pageSize);

  const result = await pool.query(
    'SELECT * FROM passengers WHERE flight_id = $1 ORDER BY seat_number ASC LIMIT $2 OFFSET $3',
    [flightId, pageSize, offset]
  );

  const passengers = result.rows.map(p => new PassengerDTO(p));

  return {
    data: passengers,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

module.exports = { addFlight, uploadFlights, checkRateLimit, queryFlights, getPassengers };
