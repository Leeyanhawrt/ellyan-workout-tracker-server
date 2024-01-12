CREATE TABLE user_workouts(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reps SMALLINT,
  sets SMALLINT,
  rpe DECIMAL,
  weight INT,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  workout_exercise_id INT REFERENCES workout_exercises(id) ON DELETE CASCADE
);
