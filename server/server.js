import 'dotenv/config';
import app from './src/app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    app.listen(PORT, () => {
      console.log(`🚀 HRMS API running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Accepting requests from: ${process.env.CLIENT_ORIGIN}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
}

main();
