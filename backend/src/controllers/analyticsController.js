const graphAnalyticsService = require('../services/graphAnalyticsService');

class AnalyticsController {
  async getPaymentFlows(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const { minHops, maxHops } = req.query;
      const result = await graphAnalyticsService.findPaymentFlows(accountNumber, minHops, maxHops);
      res.json({ success: true, data: result.records, summary: result.summary });
    } catch (error) {
      next(error);
    }
  }

  async getHouseholdNetworks(req, res, next) {
    try {
      const result = await graphAnalyticsService.getHouseholdNetworks();
      res.json({ success: true, data: result.records, summary: result.summary });
    } catch (error) {
      next(error);
    }
  }

  async getReferralChains(req, res, next) {
    try {
      const result = await graphAnalyticsService.getReferralChains();
      res.json({ success: true, data: result.records, summary: result.summary });
    } catch (error) {
      next(error);
    }
  }

  async getInterBranchSettlements(req, res, next) {
    try {
      const result = await graphAnalyticsService.getInterBranchSettlements();
      res.json({ success: true, data: result.records, summary: result.summary });
    } catch (error) {
      next(error);
    }
  }

  async getGraphTopology(req, res, next) {
    try {
      const { limit, label } = req.query;
      const topology = await graphAnalyticsService.getGraphTopology(limit || 120, label);
      res.json({ success: true, data: topology });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
