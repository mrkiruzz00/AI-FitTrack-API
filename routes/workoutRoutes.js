const express = require('express');
const router = express.Router();
const {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  searchWorkouts,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

// All workout routes require authentication
router.use(protect);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/search', searchWorkouts);
router.get('/:id', getWorkoutById);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
