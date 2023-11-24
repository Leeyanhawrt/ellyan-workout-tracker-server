DROP TABLE IF EXISTS personal_records CASCADE;

CREATE TABLE personal_records(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  squat_record SMALLINT,
  bench_record SMALLINT,
  deadlift_record SMALLINT,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);