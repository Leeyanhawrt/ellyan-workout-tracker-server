DROP TABLE IF EXISTS workout_programs CASCADE;

CREATE TABLE workout_programs(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS microcycles CASCADE;

CREATE TABLE microcycles(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  microcycle_number SMALLINT NOT NULL,
  workout_program_id INT REFERENCES workout_programs(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS daily_workouts CASCADE;

CREATE TABLE daily_workouts(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  day_number SMALLINT NOT NULL,
  microcycle_id INT REFERENCES microcycles(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS exercises CASCADE;

CREATE TABLE exercises(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  number_sets SMALLINT NOT NULL,
  number_reps SMALLINT NOT NULL,
  rpe SMALLINT,
  percentage SMALLINT,
  type VARCHAR(15) NOT NULL
);

DROP TABLE IF EXISTS daily_workout_exercises CASCADE;

CREATE TABLE daily_workout_exercises(
  id SERIAL PRIMARY KEY,
  daily_workout_id INTEGER REFERENCES daily_workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE
)