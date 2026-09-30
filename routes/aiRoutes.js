const express = require('express');
const router = express.Router();
const { getRecommendation, getInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

router.post('/recommendation', getRecommendation);
router.post('/insights', getInsights);

module.exports = router;
