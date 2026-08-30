const bankingService = require('../services/bankingService');

class BankingController {
  async getDashboard(req, res, next) {
    try {
      const summary = await bankingService.getDashboardSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async getAllAccounts(req, res, next) {
    try {
      const limit = req.query.limit || 50;
      const accounts = await bankingService.getAllAccounts(limit);
      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async getAllCustomers(req, res, next) {
    try {
      const limit = req.query.limit || 50;
      const customers = await bankingService.getAllCustomers(limit);
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getBranches(req, res, next) {
    try {
      const branches = await bankingService.getBranches();
      res.json({ success: true, data: branches });
    } catch (error) {
      next(error);
    }
  }

  async getCustomer360(req, res, next) {
    try {
      const { customerId } = req.params;
      const profile = await bankingService.getCustomer360(customerId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { message: `Customer with ID ${customerId} not found.`, code: 'NOT_FOUND' }
        });
      }
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async createTransfer(req, res, next) {
    try {
      const result = await bankingService.createTransfer(req.validatedTransfer);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BankingController();
