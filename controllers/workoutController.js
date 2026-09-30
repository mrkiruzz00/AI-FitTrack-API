const Workout = require('../models/Workout');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Create a new workout
 * @route   POST /api/workouts
 * @access  Private
 */
const createWorkout = async (req, res, next) => {
  try {
    const { workoutName, category, duration, caloriesBurned, workoutDate } = req.body;

    if (!workoutName || !category || duration === undefined || caloriesBurned === undefined || !workoutDate) {
      return sendError(res, 400, 'Please provide workoutName, category, duration, caloriesBurned, and workoutDate');
    }

    if (Number(duration) <= 0) {
      return sendError(res, 400, 'Duration must be greater than zero');
    }

    if (Number(caloriesBurned) < 0) {
      return sendError(res, 400, 'Calories burned must be greater than or equal to zero');
    }

    const workout = await Workout.create({
      user: req.user._id,
      workoutName,
      category,
      duration: Number(duration),
      caloriesBurned: Number(caloriesBurned),
      workoutDate: new Date(workoutDate),
    });

    return sendSuccess(res, 201, 'Workout created successfully', workout);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all workouts for authenticated user
 * @route   GET /api/workouts
 * @access  Private
 */
const getWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ workoutDate: -1 });
    return sendSuccess(res, 200, 'Workouts retrieved successfully', workouts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single workout by ID
 * @route   GET /api/workouts/:id
 * @access  Private
 */
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return sendError(res, 404, 'Workout not found');
    }

    // Authorization check: User must own the workout
    if (workout.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Forbidden: You do not have permission to access this workout');
    }

    return sendSuccess(res, 200, 'Workout retrieved successfully', workout);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update workout by ID
 * @route   PUT /api/workouts/:id
 * @access  Private
 */
const updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return sendError(res, 404, 'Workout not found');
    }

    // Authorization check
    if (workout.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Forbidden: You do not have permission to update this workout');
    }

    const { workoutName, category, duration, caloriesBurned, workoutDate } = req.body;

    if (duration !== undefined && Number(duration) <= 0) {
      return sendError(res, 400, 'Duration must be greater than zero');
    }

    if (caloriesBurned !== undefined && Number(caloriesBurned) < 0) {
      return sendError(res, 400, 'Calories burned must be greater than or equal to zero');
    }

    if (workoutName) workout.workoutName = workoutName;
    if (category) workout.category = category;
    if (duration !== undefined) workout.duration = Number(duration);
    if (caloriesBurned !== undefined) workout.caloriesBurned = Number(caloriesBurned);
    if (workoutDate) workout.workoutDate = new Date(workoutDate);

    const updatedWorkout = await workout.save();

    return sendSuccess(res, 200, 'Workout updated successfully', updatedWorkout);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete workout by ID
 * @route   DELETE /api/workouts/:id
 * @access  Private
 */
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return sendError(res, 404, 'Workout not found');
    }

    // Authorization check
    if (workout.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Forbidden: You do not have permission to delete this workout');
    }

    await workout.deleteOne();

    return sendSuccess(res, 200, 'Workout deleted successfully', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search workouts by name, category, or date
 * @route   GET /api/workouts/search
 * @access  Private
 */
const searchWorkouts = async (req, res, next) => {
  try {
    const { name, category, date } = req.query;

    const filter = { user: req.user._id };

    if (name) {
      filter.workoutName = { $regex: name, $options: 'i' };
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
        filter.workoutDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const workouts = await Workout.find(filter).sort({ workoutDate: -1 });

    return sendSuccess(res, 200, 'Workouts search completed', workouts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  searchWorkouts,
};
