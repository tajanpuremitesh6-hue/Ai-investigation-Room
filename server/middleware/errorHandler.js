export function errorHandler(error, _request, response, _next) {
  const status = Number(error.status) || 500;
  if (status >= 500) console.error(error);
  response.status(status).json({
    success: false,
    message: status >= 500 ? 'An unexpected server error occurred.' : error.message,
    code: error.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
  });
}
