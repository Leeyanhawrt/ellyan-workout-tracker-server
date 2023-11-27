-- TESTIMONIALS --
INSERT INTO testimonials (first_name, last_name, title, review_description, profile_image_path)
VALUES
('Leeyan', 'Haw', 'Tracking My Workouts Accelerated My Progress', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mauris commodo quis imperdiet massa tincidunt. Augue mauris augue neque gravida in. Netus et malesuada fames ac turpis egestas.', '/photos/testimonials/leeyan-haw.jpeg'),
('Ellissa', 'Huang', 'This Is My Favorite Fitness App', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Viverra justo nec ultrices dui sapien eget mi proin sed. Non consectetur a erat nam at lectus urna duis.', '/photos/testimonials/ellissa-huang.jpeg'),
('Wenjin', 'Haw', 'I Used to Get Injured All the Time', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sagittis id consectetur purus ut faucibus. At lectus urna duis convallis convallis tellus. Velit aliquet sagittis id consectetur.', '/photos/testimonials/wenjin-haw.jpeg');

-- PERSONAL RECORDS --

INSERT INTO personal_records (squat_record, bench_record, deadlift_record, user_id)
VALUES 
(445, 355, 585, 1);

-- WORKOUT PROGRAMS --

INSERT INTO workout_programs (name)
VALUES 
('INTERMEDIATE 9 WEEK');

-- MICROCYCLES --

INSERT INTO microcycles (microcycle_number, workout_program_id)
VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1);

-- DAILY WOKROUTS --

DO $$ 
DECLARE
    day_number INT;
    microcycle_id INT;
BEGIN
    FOR microcycle_id IN 1..9 LOOP
        FOR day_number IN 1..4 LOOP
            INSERT INTO daily_workouts (day_number, microcycle_id) VALUES (day_number, microcycle_id);
        END LOOP;
    END LOOP;
END $$;

INSERT INTO exercises(name, number_sets, number_reps, daily_workout_id)
VALUES
('Squat', 3, 8, 1);