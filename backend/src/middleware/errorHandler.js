const apiResponse = require('../utils/apiResponse');

const errorHandler = {
  notFoundHandler: (req, res, next) => {
    return apiResponse.notFound(
      res,
      `API endpoint ${req.method} ${req.originalUrl} does not exist on UPI Shield Gateway`
    );
  },

  globalErrorHandler: (err, req, res, next) => {
    console.error('Unhandled API Error:', err);

    // Multer upload errors
    if (err.name === 'MulterError') {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return apiResponse.badRequest(res, 'Uploaded image exceeds maximum size limit');
      }
      return apiResponse.badRequest(res, `Upload error: ${err.message}`);
    }

    const message = err.message || 'An unexpected internal error occurred';
    const statusCode = err.statusCode || 500;

    return apiResponse.error(res, message, statusCode);
  },
};

module.exports = errorHandler;
