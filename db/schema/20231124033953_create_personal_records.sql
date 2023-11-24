DROP TABLE IF EXISTS personal_records CASCADE;

CREATE TABLE personal_records(
  id SERIAL PRIMARY KEY,
  squat_max SMALLINT,
  bench_max SMALLINT,
  deadlift_max SMALLINT,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);