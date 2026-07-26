require('dotenv').config();
const db = require('./config/db');
const { ensureConfiguredAdmin } = require('./adminBootstrap');

async function seed() {
  try {
    await ensureConfiguredAdmin({ required: true });
  } catch (error) {
    console.error(`Failed to seed admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seed();
