const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'passenger',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,
        flight_number VARCHAR(20) UNIQUE NOT NULL,
        date_from DATE NOT NULL,
        date_to DATE NOT NULL,
        airport_from VARCHAR(10) NOT NULL,
        airport_to VARCHAR(10) NOT NULL,
        duration INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        remaining_seats INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        flight_id INTEGER REFERENCES flights(id),
        user_id INTEGER REFERENCES users(id),
        purchase_date TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS passengers (
        id SERIAL PRIMARY KEY,
        passenger_name VARCHAR(200) NOT NULL,
        ticket_id INTEGER REFERENCES tickets(id),
        flight_id INTEGER REFERENCES flights(id),
        seat_number INTEGER,
        checked_in BOOLEAN DEFAULT FALSE,
        check_in_date TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS query_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        ip_address VARCHAR(50),
        query_date DATE DEFAULT CURRENT_DATE,
        query_count INTEGER DEFAULT 1
      );
    `);

    console.log('Database tables initialized successfully');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
