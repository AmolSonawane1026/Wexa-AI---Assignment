/**
 * Global Error Handler Middleware
 * Handles database connectivity errors, Cypher syntax/runtime errors, and bad requests
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  // Distinguish CognoDB / Neo4j driver connection errors
  const isDbConnectionError = 
    err.code === 'ServiceUnavailable' || 
    err.code === 'SessionExpired' ||
    err.message?.includes('Failed to connect') ||
    err.message?.includes('ECONNREFUSED') ||
    err.message?.includes('getaddrinfo ENOTFOUND');

  const isCypherSyntaxError = 
    err.code?.includes('SyntaxError') || 
    err.message?.includes('Invalid input') ||
    err.message?.includes('Cypher');

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    code: err.code || 'UNKNOWN',
    status: statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || (isDbConnectionError ? 'DATABASE_UNAVAILABLE' : 'INTERNAL_ERROR'),
      isDbConnectionError,
      isCypherSyntaxError,
      timestamp: new Date().toISOString()
    }
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND'
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
