DROP TABLE IF EXISTS personal_records CASCADE;

CREATE TABLE personal_records(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  squat_record SMALLINT NOT NULL,
  bench_record SMALLINT NOT NULL,
  deadlift_record SMALLINT NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);