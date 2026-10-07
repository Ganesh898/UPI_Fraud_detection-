const intelligenceJobModel = require('../models/intelligenceJobModel');
const { extractUrl } = require('../services/intelligencePipeline');
const apiResponse = require('../utils/apiResponse');

const MAX_SOURCE_LENGTH = 20000;

const intelligenceController = {
  submit: (req, res, next) => {
    try {
      const { source_type: sourceType, source } = req.body;
      if (!['url', 'text'].includes(sourceType)) {
        return apiResponse.badRequest(res, 'source_type must be either "url" or "text".');
      }
      if (typeof source !== 'string' || !source.trim()) {
        return apiResponse.badRequest(res, 'A non-empty source value is required.');
      }
      if (source.length > MAX_SOURCE_LENGTH) {
        return apiResponse.badRequest(res, `Source must be no longer than ${MAX_SOURCE_LENGTH} characters.`);
      }

      const sourceValue = source.trim();
      if (sourceType === 'url') extractUrl(sourceValue);

      const job = intelligenceJobModel.create({
        userId: req.user.id,
        sourceType,
        sourceValue,
      });
      return apiResponse.success(res, { job }, 'Intelligence source queued for analysis.', 202);
    } catch (error) {
      if (error.statusCode === 400) {
        return apiResponse.badRequest(res, error.message);
      }
      next(error);
    }
  },

  list: (req, res, next) => {
    try {
      return apiResponse.success(res, {
        jobs: intelligenceJobModel.listByUser(req.user.id, req.query.limit),
      });
    } catch (error) {
      next(error);
    }
  },

  get: (req, res, next) => {
    try {
      const job = intelligenceJobModel.findById(req.params.id, req.user.id);
      if (!job) return apiResponse.notFound(res, 'Intelligence job not found.');
      return apiResponse.success(res, {
        job: {
          ...job,
          relatedJobIds: job.result
            ? intelligenceJobModel.listRelatedJobs(job.id, req.user.id)
            : [],
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = intelligenceController;
