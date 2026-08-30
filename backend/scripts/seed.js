require('dotenv').config();
const { seedBankData } = require('../src/services/seedService');
const { closeDriver } = require('../src/config/db');

async function run() {
  console.log('Seeding banking data into CognoDB...');
  try {
    const res = await seedBankData();
    console.log('Done.');
    console.log(JSON.stringify(res.stats, null, 2));
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await closeDriver();
  }
}

run();
