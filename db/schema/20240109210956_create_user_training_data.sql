DROP TABLE IF EXISTS workout_exercises CASCADE;

CREATE TABLE workout_exercises(
  id SERIAL PRIMARY KEY,
  daily_workout_id INTEGER REFERENCES daily_workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  sets SMALLINT NOT NULL,
  reps SMALLINT NOT NULL,
  rpe DECIMAL,
  percentage SMALLINT
);

DROP TABLE IF EXISTS user_workouts CASCADE;

CREATE TABLE user_workouts(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rpe DECIMAL[],
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  workout_exercise_id INT REFERENCES workout_exercises(id) ON DELETE CASCADE
);