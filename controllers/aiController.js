const geminiService = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Generate personalized AI workout recommendation
 * @route   POST /api/ai/recommendation
 * @access  Private
 */
const getRecommendation = async (req, res, next) => {
  try {
    const { age, fitnessGoal, experienceLevel } = req.body;

    if (!age || !fitnessGoal || !experienceLevel) {
      return sendError(res, 400, 'Please provide age, fitnessGoal, and experienceLevel');
    }

    if (Number(age) <= 0 || isNaN(Number(age))) {
      return sendError(res, 400, 'Age must be a valid positive number');
    }

    const recommendation = await geminiService.generateRecommendation({
      age: Number(age),
      fitnessGoal,
      experienceLevel,
    });

    return sendSuccess(res, 200, 'AI workout recommendation generated successfully', recommendation);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI fitness insights based on workout statistics
 * @route   POST /api/ai/insights
 * @access  Private
 */
const getInsights = async (req, res, next) => {
  try {
    const { totalWorkouts, averageWorkoutDuration, caloriesBurned } = req.body;

    if (totalWorkouts === undefined || averageWorkoutDuration === undefined || caloriesBurned === undefined) {
      return sendError(res, 400, 'Please provide totalWorkouts, averageWorkoutDuration, and caloriesBurned');
    }

    if (Number(totalWorkouts) < 0 || Number(averageWorkoutDuration) < 0 || Number(caloriesBurned) < 0) {
      return sendError(res, 400, 'Workout statistics must be non-negative numbers');
    }

    const insights = await geminiService.generateInsights({
      totalWorkouts: Number(totalWorkouts),
      averageWorkoutDuration: Number(averageWorkoutDuration),
      caloriesBurned: Number(caloriesBurned),
    });

    return sendSuccess(res, 200, 'AI fitness insights generated successfully', insights);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendation,
  getInsights,
};
