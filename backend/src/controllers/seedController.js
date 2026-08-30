const seedService = require('../services/seedService');

class SeedController {
  async seedData(req, res, next) {
    try {
      const result = await seedService.seedBankingData();
      res.json({
        success: true,
        message: result.message,
        stats: result.stats
      });
    } catch (error) {
      next(error);
    }
  }

  async resetData(req, res, next) {
    try {
      const result = await seedService.resetDatabase();
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SeedController();
