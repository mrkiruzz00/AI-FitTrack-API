# AI FitTrack API Backend

A secure, scalable RESTful backend API for fitness tracking and AI-driven personalized workout recommendations and insights built with **Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt.js, and Google Gemini AI**.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Starting MongoDB](#starting-mongodb)
- [Running the Server](#running-the-server)
- [API Endpoint Documentation](#api-endpoint-documentation)
  - [Authentication Routes](#authentication-routes)
  - [Workout Management Routes](#workout-management-routes)
  - [AI Features Routes](#ai-features-routes)
- [Postman & API Testing Guide](#postman--api-testing-guide)
- [Google Gemini Integration](#google-gemini-integration)
- [Security Features](#security-features)
- [Future Enhancements](#future-enhancements)

---

## Problem Statement

Modern fitness applications require more than static record-keeping. Users need personalized guidance, intelligent feedback, and secure data isolation. **AI FitTrack API Backend** solves these challenges by combining robust JWT-authenticated workout tracking with Google Gemini AI capabilities to provide actionable exercise plans and progress feedback.

---

## Key Features

- **User Authentication**: Secure registration and login using bcrypt password hashing and JWT authorization.
- **Protected Profiles**: Authenticated user profile retrieval.
- **Workout Management (CRUD)**: Create, read all, read by ID, update, and delete workout records.
- **Multi-criteria Search**: Filter user workouts by name, category, and date.
- **Strict User Isolation**: Multi-tenant authorization checks ensuring users can only manage their own workouts.
- **AI Workout Recommendations**: Google Gemini powered custom routine generation based on user goals, age, and experience level.
- **AI Fitness Insights**: Intelligent statistical analysis of performance, duration, and calories burned with actionable tips.
- **Centralized Error Handling**: Unified standard JSON error response handler covering validation errors, invalid ObjectIds, duplicate records, and authentication failures.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **AI Integration**: `@google/generative-ai` (Google Gemini 1.5 / 2.0 Flash)
- **Utilities**: `dotenv`, `cors`, `nodemon`

---

## Architecture & Folder Structure

Follows a strict **Model-View-Controller (MVC)** architecture with separate layers for services, middleware, utilities, and configuration.

```text
AI-FitTrack-API/
├── server/
│   ├── config/
│   │   └── db.js                 # Database connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── workoutController.js  # Workout CRUD & search logic
│   │   └── aiController.js       # Gemini AI recommendations & insights
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token authentication check
│   │   └── errorMiddleware.js    # Global centralized error handler
│   ├── models/
│   │   ├── User.js               # Mongoose User model & password sanitization
│   │   └── Workout.js            # Mongoose Workout model with user ref
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── workoutRoutes.js      # /api/workouts routes
│   │   └── aiRoutes.js           # /api/ai routes
│   ├── services/
│   │   ├── geminiService.js      # Google Gemini API integration
│   │   ├── jwtService.js         # JWT signing & verification helpers
│   │   └── passwordService.js    # bcrypt hashing & comparison
│   ├── utils/
│   │   └── response.js           # Standardized API response formatters
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment variables template
│   ├── .gitignore                # Git ignore configuration
│   ├── package.json              # Project dependencies & scripts
│   └── server.js                 # Express application entrypoint
└── README.md                     # Documentation & setup guide
```

---

## Prerequisites

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Google Gemini API Key** (Obtainable from [Google AI Studio](https://aistudio.google.com/))

---

## Installation & Setup

1. **Clone or open the repository**:
   ```bash
   cd AI-FitTrack-API
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your secrets and API keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/AI FitTrack API
   JWT_SECRET=your_secure_jwt_secret_key
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

---

## Starting MongoDB

If using a local MongoDB installation:
- **Windows**:
  ```powershell
  net start MongoDB
  ```
  Or launch `mongod` directly.
- **macOS / Linux**:
  ```bash
  sudo systemctl start mongod
  ```
  Or via Homebrew:
  ```bash
  services start mongodb-community
  ```

---

## Running the Server

- **Development Mode (with auto-reload)**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

Server will start at `http://localhost:5000`.

---

## API Endpoint Documentation

### Authentication Routes

#### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": "670c1a9f...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-09-26T15:00:00.000Z"
    }
  }
  ```

#### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "670c1a9f...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

#### 3. Get User Profile
- **Endpoint**: `GET /api/auth/profile`
- **Access**: Protected (`Authorization: Bearer <JWT_TOKEN>`)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "user": {
      "id": "670c1a9f...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-09-26T15:00:00.000Z"
    }
  }
  ```

---

### Workout Management Routes

All workout endpoints require `Authorization: Bearer <JWT_TOKEN>`.

#### 4. Create Workout
- **Endpoint**: `POST /api/workouts`
- **Request Body**:
  ```json
  {
    "workoutName": "Morning Running",
    "category": "Cardio",
    "duration": 45,
    "caloriesBurned": 350,
    "workoutDate": "2026-09-26"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Workout created successfully",
    "data": {
      "id": "670c2b1a...",
      "user": "670c1a9f...",
      "workoutName": "Morning Running",
      "category": "Cardio",
      "duration": 45,
      "caloriesBurned": 350,
      "workoutDate": "2026-09-26T00:00:00.000Z"
    }
  }
  ```

#### 5. Get All Workouts
- **Endpoint**: `GET /api/workouts`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Workouts retrieved successfully",
    "data": [...]
  }
  ```

#### 6. Search Workouts
- **Endpoint**: `GET /api/workouts/search?name=running&category=Cardio&date=2026-09-26`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Workouts search completed",
    "data": [...]
  }
  ```

#### 7. Get Workout by ID
- **Endpoint**: `GET /api/workouts/:id`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Workout retrieved successfully",
    "data": { ... }
  }
  ```

#### 8. Update Workout
- **Endpoint**: `PUT /api/workouts/:id`
- **Request Body**:
  ```json
  {
    "duration": 50,
    "caloriesBurned": 400
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Workout updated successfully",
    "data": { ... }
  }
  ```

#### 9. Delete Workout
- **Endpoint**: `DELETE /api/workouts/:id`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Workout deleted successfully",
    "data": { "id": "670c2b1a..." }
  }
  ```

---

### AI Features Routes

All AI endpoints require `Authorization: Bearer <JWT_TOKEN>`.

#### 10. AI Workout Recommendation
- **Endpoint**: `POST /api/ai/recommendation`
- **Request Body**:
  ```json
  {
    "age": 25,
    "fitnessGoal": "Weight loss",
    "experienceLevel": "Beginner"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "AI workout recommendation generated successfully",
    "data": {
      "workoutPlan": "Personalized 4-week fat loss and endurance routine...",
      "weeklySchedule": [
        "Day 1: 30 min brisk walk + bodyweight squats",
        "Day 2: Rest & light stretching"
      ],
      "suggestedExercises": [
        { "name": "Bodyweight Squats", "sets": "3", "repsOrDuration": "12 reps", "description": "Lower body strength exercise" }
      ],
      "trainingTips": ["Stay hydrated", "Maintain consistent sleep"],
      "safetyRecommendations": ["Warm up 5 mins before exercising"],
      "motivationalGuidance": "Every step forward counts towards your goal!",
      "disclaimer": "This recommendation is general fitness guidance and not a substitute for professional medical advice."
    }
  }
  ```

#### 11. AI Fitness Insights
- **Endpoint**: `POST /api/ai/insights`
- **Request Body**:
  ```json
  {
    "totalWorkouts": 15,
    "averageWorkoutDuration": 42,
    "caloriesBurned": 5250
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "AI fitness insights generated successfully",
    "data": {
      "performanceAnalysis": "Excellent consistency averaging over 40 mins per session...",
      "improvementSuggestions": ["Incorporate high-intensity interval training (HIIT)", "Track macro intake"],
      "motivationalAdvice": "You are building remarkable endurance habits!",
      "fitnessProgressSummary": "15 workouts completed with over 5000 kcal burned."
    }
  }
  ```

---

## Postman & API Testing Guide

### Execution Order:
1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` -> Copy the returned `token`.
3. **Set Authorization Header**: In Postman, add header `Authorization: Bearer <token>` for all protected requests.
4. **Get Profile**: `GET /api/auth/profile`
5. **Create Workout**: `POST /api/workouts`
6. **Get All Workouts**: `GET /api/workouts`
7. **Search Workouts**: `GET /api/workouts/search?name=running`
8. **Get Workout by ID**: `GET /api/workouts/<workoutId>`
9. **Update Workout**: `PUT /api/workouts/<workoutId>`
10. **Delete Workout**: `DELETE /api/workouts/<workoutId>`
11. **Get AI Recommendation**: `POST /api/ai/recommendation`
12. **Get AI Insights**: `POST /api/ai/insights`

### Failure Case Testing:
- Send request without `Authorization` header -> 401 Unauthorized (`Access denied. No token provided.`)
- Register duplicate email -> 409 Conflict (`User already exists with this email address`)
- Get non-existent workout ID -> 404 Not Found (`Workout not found`)
- Send invalid Mongo ID string -> 400 Bad Request (`Invalid format for field: _id`)
- Access another user's workout ID -> 403 Forbidden (`Forbidden: You do not have permission...`)

---

## Google Gemini Integration

The project integrates with `@google/generative-ai` SDK via `services/geminiService.js`.
- Prompts are dynamically compiled and enforce structured JSON output.
- Medical safety disclaimers are automatically attached to exercise suggestions.

---

## Security Features

- **Password Hashing**: Salted bcrypt password hashing (10 rounds). Passwords are excluded from JSON output (`toJSON` transform).
- **JWT Authorization**: Stateless JWT verification middleware.
- **Resource Ownership Enforcement**: Every workout query enforces `user: req.user._id`.
- **Sanitized Errors**: Database internal stack traces are hidden from client responses.

---

## Future Enhancements

- Refresh token strategy.
- Password reset via email OTP.
- Pagination for workout history.
- Dynamic data aggregation for AI insights directly from user database logs.
