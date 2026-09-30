/**
 * Standardized API Response Utilities
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    if (typeof data === 'object' && !Array.isArray(data) && data !== null && Object.keys(data).some(k => k === 'token' || k === 'user')) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
