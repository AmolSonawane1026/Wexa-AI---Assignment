const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  cognodb: {
    uri: process.env.COGNODB_URI || 'bolt://localhost:7687',
    user: process.env.COGNODB_USER || 'cognodb',
    password: process.env.COGNODB_PASSWORD || '',
  }
};

module.exports = config;
