/**
 * FitSense AI Live Demo Script
 * Run this script to execute a full end-to-end demonstration of the API in the terminal.
 * Usage: node demo.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runDemo() {
  console.log('====================================================');
  console.log('      FITSENSE AI / FITTRACK AI BACKEND DEMO        ');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('--- 1. Health Check ---');
    const health = await request('GET', '/');
    console.log(`Status: ${health.status}`, health.body);

    // 2. Register
    const email = `demo_${Date.now()}@example.com`;
    console.log(`\n--- 2. Registering User (${email}) ---`);
    const reg = await request('POST', '/api/auth/register', {
      name: 'FitSense Demo User',
      email,
      password: 'password123',
    });
    console.log(`Status: ${reg.status}`, reg.body);

    // 3. Login
    console.log('\n--- 3. Logging In ---');
    const login = await request('POST', '/api/auth/login', {
      email,
      password: 'password123',
    });
    console.log(`Status: ${login.status}`, login.body);
    const token = login.body.token;

    if (!token) {
      console.error('Login failed, missing token.');
      return;
    }

    // 4. Get Profile
    console.log('\n--- 4. Get User Profile (Protected) ---');
    const profile = await request('GET', '/api/auth/profile', null, token);
    console.log(`Status: ${profile.status}`, profile.body);

    // 5. Create Workout
    console.log('\n--- 5. Creating Workout Record ---');
    const workout1 = await request(
      'POST',
      '/api/workouts',
      {
        workoutName: 'Morning Running Session',
        category: 'Cardio',
        duration: 45,
        caloriesBurned: 420,
        workoutDate: '2026-09-26',
      },
      token
    );
    console.log(`Status: ${workout1.status}`, workout1.body);
    const workoutId = workout1.body.data ? workout1.body.data.id : null;

    // 6. Create Second Workout
    console.log('\n--- 6. Creating Second Workout Record ---');
    await request(
      'POST',
      '/api/workouts',
      {
        workoutName: 'Evening Weightlifting',
        category: 'Strength',
        duration: 60,
        caloriesBurned: 500,
        workoutDate: '2026-09-25',
      },
      token
    );

    // 7. Get All Workouts
    console.log('\n--- 7. Get All User Workouts ---');
    const allWorkouts = await request('GET', '/api/workouts', null, token);
    console.log(`Status: ${allWorkouts.status}`, allWorkouts.body);

    // 8. Search Workouts
    console.log('\n--- 8. Search Workouts (category=Cardio) ---');
    const search = await request('GET', '/api/workouts/search?category=Cardio', null, token);
    console.log(`Status: ${search.status}`, search.body);

    // 9. Update Workout
    if (workoutId) {
      console.log(`\n--- 9. Updating Workout (${workoutId}) ---`);
      const update = await request(
        'PUT',
        `/api/workouts/${workoutId}`,
        {
          duration: 50,
          caloriesBurned: 460,
        },
        token
      );
      console.log(`Status: ${update.status}`, update.body);
    }

    // 10. AI Workout Recommendation
    console.log('\n--- 10. Requesting AI Workout Recommendation ---');
    const aiRec = await request(
      'POST',
      '/api/ai/recommendation',
      {
        age: 24,
        fitnessGoal: 'Muscle Gain & Strength',
        experienceLevel: 'Intermediate',
      },
      token
    );
    console.log(`Status: ${aiRec.status}`, JSON.stringify(aiRec.body, null, 2));

    // 11. AI Fitness Insights
    console.log('\n--- 11. Requesting AI Fitness Insights ---');
    const aiInsights = await request(
      'POST',
      '/api/ai/insights',
      {
        totalWorkouts: 12,
        averageWorkoutDuration: 52,
        caloriesBurned: 5500,
      },
      token
    );
    console.log(`Status: ${aiInsights.status}`, JSON.stringify(aiInsights.body, null, 2));

    // 12. Unauthenticated Test
    console.log('\n--- 12. Security Check (Access without token) ---');
    const securityCheck = await request('GET', '/api/workouts');
    console.log(`Status: ${securityCheck.status}`, securityCheck.body);

    console.log('\n====================================================');
    console.log('       DEMO COMPLETED SUCCESSFULLY!                ');
    console.log('====================================================\n');
  } catch (error) {
    console.error('Demo error:', error.message);
  }
}

runDemo();
