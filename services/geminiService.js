const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Helper to safely extract JSON from Gemini text response.
 */
const parseJSONFromResponse = (text) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const rawJson = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(rawJson.trim());
  } catch (error) {
    return {
      rawOutput: text,
      parseNote: 'Returned raw response as JSON parsing encountered formatting variations.'
    };
  }
};

/**
 * Sleep helper for retries
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to get generative model with fallbacks and retry logic for high demand / 503 / 404 errors.
 */
const getGenerativeModelWithFallback = async (genAI, prompt) => {
  const candidateModels = [
    ...new Set([
      process.env.GEMINI_MODEL,
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest'
    ])
  ].filter(Boolean);

  let lastError;

  for (const modelName of candidateModels) {
    // Try up to 2 attempts per model if temporary capacity issues occur
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result;
      } catch (err) {
        lastError = err;
        const msg = err.message || '';

        // If authentication or permission error, throw immediately rather than cycling models
        if (
          err.status === 401 ||
          err.status === 403 ||
          msg.includes('API key not valid') ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('PERMISSION_DENIED')
        ) {
          throw err;
        }

        // If 503 Service Unavailable or 429 Rate Limit, wait briefly and retry or try next model
        if (
          msg.includes('503') ||
          msg.includes('Service Unavailable') ||
          msg.includes('429') ||
          msg.includes('high demand')
        ) {
          if (attempt < 2) {
            await sleep(1000); // wait 1s before retry
            continue;
          }
        }

        // If 404 / model not found or retired, switch immediately to next candidate model
        if (msg.includes('404') || msg.includes('not found') || msg.includes('no longer available')) {
          break;
        }

        // For other unrecoverable errors, break to next model
        break;
      }
    }
  }

  throw lastError;
};

/**
 * Generate personalized workout recommendations using Gemini.
 * @param {object} params { age, fitnessGoal, experienceLevel }
 * @returns {Promise<object>} Structured recommendation object
 */
const generateRecommendation = async ({ age, fitnessGoal, experienceLevel }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_google_gemini_api_key') {
    const error = new Error('Gemini API key is not configured in environment variables.');
    error.statusCode = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
You are an expert AI fitness coach and personal trainer. 
Create a personalized workout recommendation plan based on the following user profile:
- Age: ${age}
- Fitness Goal: ${fitnessGoal}
- Experience Level: ${experienceLevel}

Return your response strictly as a JSON object with the following fields:
{
  "workoutPlan": "Summary of overall personalized workout plan",
  "weeklySchedule": ["Day 1 exercise routine", "Day 2 exercise routine"],
  "suggestedExercises": [
    { "name": "Exercise Name", "sets": "Number of sets", "repsOrDuration": "Reps/Duration", "description": "Brief description" }
  ],
  "trainingTips": ["Tip 1", "Tip 2"],
  "safetyRecommendations": ["Safety tip 1", "Safety tip 2"],
  "motivationalGuidance": "Inspiring words of encouragement",
  "disclaimer": "This recommendation is general fitness guidance and not a substitute for professional medical advice. Consult a healthcare provider before beginning any new exercise program."
}
Do not include any intro or outro text outside the JSON object.
`;

  const result = await getGenerativeModelWithFallback(genAI, prompt);
  const responseText = result.response.text();
  return parseJSONFromResponse(responseText);
};

/**
 * Generate AI fitness insights based on workout statistics.
 * @param {object} stats { totalWorkouts, averageWorkoutDuration, caloriesBurned }
 * @returns {Promise<object>} Structured insights object
 */
const generateInsights = async ({ totalWorkouts, averageWorkoutDuration, caloriesBurned }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_google_gemini_api_key') {
    const error = new Error('Gemini API key is not configured in environment variables.');
    error.statusCode = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
You are an expert AI fitness analyst.
Analyze the following workout statistics for a user:
- Total Workouts Completed: ${totalWorkouts}
- Average Workout Duration: ${averageWorkoutDuration} minutes
- Total Calories Burned: ${caloriesBurned} kcal

Return your response strictly as a JSON object with the following fields:
{
  "performanceAnalysis": "Detailed evaluation of consistency, volume, and effort",
  "improvementSuggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "motivationalAdvice": "Encouragement tailored to their performance level",
  "fitnessProgressSummary": "High-level summary of progress and potential next milestones"
}
Do not include any intro or outro text outside the JSON object.
`;

  const result = await getGenerativeModelWithFallback(genAI, prompt);
  const responseText = result.response.text();
  return parseJSONFromResponse(responseText);
};

module.exports = {
  generateRecommendation,
  generateInsights,
};
