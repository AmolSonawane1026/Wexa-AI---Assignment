const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes/apiRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.includes(',') ? config.corsOrigin.split(',') : config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'NexusBank Graph Database API',
    health: '/api/health'
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
