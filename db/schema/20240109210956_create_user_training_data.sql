DROP TABLE IF EXISTS user_workouts CASCADE;

CREATE TABLE user_workouts(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rpe DECIMAL[],
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  workout_exercise_id INT REFERENCES workout_exercises(id) ON DELETE CASCADE
);
