DROP TABLE IF EXISTS testimonials CASCADE;

CREATE TABLE testimonials(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  review_description TEXT NOT NULL,
  profile_image_path VARCHAR(255) NOT NULL
);