/**
 * Request Input Validator Middleware
 */

function validateCypherQuery(req, res, next) {
  const { query, params } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'A non-empty "query" string parameter is required.',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  if (params && typeof params !== 'object') {
    return res.status(400).json({
      success: false,
      error: {
        message: '"params" must be an object of key-value pairs if provided.',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  next();
}

function validateTransfer(req, res, next) {
  const { fromAccount, toAccount, amount, currency } = req.body;

  if (!fromAccount || !toAccount) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Both "fromAccount" and "toAccount" account numbers are required.',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Source and destination accounts cannot be identical.',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: '"amount" must be a positive numeric value.',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  req.validatedTransfer = {
    fromAccount: String(fromAccount).trim(),
    toAccount: String(toAccount).trim(),
    amount: parsedAmount,
    currency: currency || 'USD'
  };

  next();
}

module.exports = {
  validateCypherQuery,
  validateTransfer
};
