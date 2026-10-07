/**
 * Standardized API Response Helper for UPI Shield REST APIs
 */

const apiResponse = {
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },

  created: (res, data = null, message = 'Resource created successfully') => {
    return res.status(201).json({
      status: 'success',
      statusCode: 201,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },

  error: (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      status: 'error',
      statusCode,
      message,
      errors: errors || undefined,
      timestamp: new Date().toISOString(),
    });
  },

  badRequest: (res, message = 'Invalid request payload', errors = null) => {
    return apiResponse.error(res, message, 400, errors);
  },

  unauthorized: (res, message = 'Authentication required or invalid token') => {
    return apiResponse.error(res, message, 401);
  },

  forbidden: (res, message = 'Forbidden: Insufficient privileges') => {
    return apiResponse.error(res, message, 403);
  },

  notFound: (res, message = 'Resource not found') => {
    return apiResponse.error(res, message, 404);
  },

  paginated: (res, items, page = 1, limit = 20, total = 0, message = 'Success') => {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message,
      data: items,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: parseInt(total, 10),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = apiResponse;
