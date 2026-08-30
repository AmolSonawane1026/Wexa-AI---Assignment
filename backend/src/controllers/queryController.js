const queryService = require('../services/queryService');

class QueryController {
  getPresets(req, res) {
    const presets = queryService.getPresetQueries();
    res.json({ success: true, data: presets });
  }

  async runCustomQuery(req, res, next) {
    try {
      const { query, params } = req.body;
      const result = await queryService.executeCustomQuery(query, params || {});
      res.json({
        success: true,
        data: result.records,
        graph: result.graph,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QueryController();
