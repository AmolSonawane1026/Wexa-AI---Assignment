const { checkHealth } = require('../config/db');

class HealthController {
  async getHealth(req, res, next) {
    try {
      const dbHealth = await checkHealth();
      const isHealthy = dbHealth.connected;

      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'UP' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        database: {
          engine: 'CognoDB',
          protocol: 'Bolt (5.0-5.4)',
          ...dbHealth
        },
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
