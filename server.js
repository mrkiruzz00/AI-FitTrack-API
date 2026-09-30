const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { sendSuccess, sendError } = require('./utils/response');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Root & Health check route
app.get('/', (req, res) => {
  return sendSuccess(res, 200, 'FitSense AI / FitTrack AI Backend API is running smoothly.');
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  return sendError(res, 404, `Route not found - ${req.originalUrl}`);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
