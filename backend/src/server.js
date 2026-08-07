import 'dotenv/config';
import app from './app.js';
import pool from './config/db.js';

const port = Number(process.env.PORT || 3001);

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');

    app.listen(port, () => {
      console.log(`Revenue API running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start the Revenue API:', error.message);
    process.exit(1);
  }
}

start();
