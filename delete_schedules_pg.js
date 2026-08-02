require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function main() {
  try {
    await pool.query('DELETE FROM "Schedule"');
    console.log('All schedules deleted successfully.');
  } catch (err) {
    console.error('Error deleting schedules:', err);
  } finally {
    await pool.end();
  }
}

main();
