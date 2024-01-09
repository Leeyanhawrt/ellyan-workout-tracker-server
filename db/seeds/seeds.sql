-- WORKOUT PROGRAMS --

INSERT INTO workout_programs (name)
VALUES 
('Dummy Program');

-- TESTIMONIALS --
INSERT INTO testimonials (first_name, last_name, title, review_description, profile_image_path)
VALUES
('Leeyan', 'Haw', 'Accelerating Progress Through Tracked Workouts', 'Tracking my workouts has been a game-changer for my fitness journey. It provided a clear roadmap of my progress, allowing me to identify areas of improvement and adjust my training accordingly. The ability to see tangible results accelerated my motivation, turning each workout into a meaningful step towards achieving my fitness goals.', '/photos/testimonials/leeyan-haw.jpeg'),
('Ellissa', 'Huang', 'The Ultimate Fitness App', 'This has truly become my go-to fitness app. Its user-friendly interface, custom workouts, and detailed tracking features have revolutionized the way I approach fitness. From personalized exercise plans to insightful progress reports, this app has firmly secured its place as an essential companion on my journey to a healthier lifestyle.', '/photos/testimonials/ellissa-huang.jpeg'),
('Wenjin', 'Haw', 'Setbacks to Strength', 'With the help of a Ellyan, I turned setbacks into strength, overcoming challenges and feeling better. Tailored workouts and progress tracking played a key role, breaking the cycle of injuries and transforming my approach into a powerful tool for recovery.', '/photos/testimonials/wenjin-haw.jpeg');

-- PERSONAL RECORDS --

INSERT INTO personal_records (squat, benchpress, deadlift, user_id)
VALUES 
(445, 355, 585, 1);

-- MICROCYCLES --

INSERT INTO microcycles (microcycle_number, workout_program_id, phase)
VALUES
(1, 1, 'Building 1'), (2, 1, 'Building 2'), (3, 1, 'Building 3'), (4, 1, 'Building 4'), (5, 1, 'Mid Cycle Deload'), (6, 1, 'Peak 1'), (7, 1, 'Peak 2'), (8, 1, 'Peak 3'), (9, 1, 'Test');

-- VARIATION EXERCISES --
INSERT INTO exercises(name, type, variant)
VALUES
('Close Grip Bench', 'main variation', 'benchpress'), ('Larsen Press', 'main variation', 'benchpress'), ('Stiff Leg Deadlift', 'main variation', 'deadlift'),
('Pause Squat', 'main variation', 'squat'), ('Halting Deadlift', 'main variation', 'deadlift'), ('Spotto Press', 'main variation', 'benchpress'), ('Deficit Deadlift', 'main variation', 'deadlift'),
('Rack Pull Deadlift', 'main variation', 'deadlift'), ('Wide Grip Bench', 'main variation', 'benchpress'), ('Safety Bar Squats', 'main variation', 'squat'), ('Trap Bar Deadlift', 'main variation', 'deadlift'),
('Deadlift To Knee', 'main variation', 'deadlift'), ('Deadlift From Boxes', 'main variation', 'deadlift'), ('Incline Bench Press', 'main variation', 'benchpress'), ('Decline Bench Press', 'main variation', 'benchpress'),
('Snatch Grip Rack Pull', 'main variation', 'deadlift'), ('Snatch Grip Rack Pull (Slow Eccentric)', 'main variation', 'deadlift'), ('Snatch Grip Deadlift', 'main variation', 'deadlift'), ('Paused Deadlift', 'main variation', 'deadlift'),
('Safety Bar Squats (Lowbar)', 'main variation', 'deadlift'), ('Squat', 'main', 'squat'), ('Bench Press', 'main', 'benchpress'), ('Deadlift', 'main', 'deadlift');  

-- DAILY WORKOUTS --
DO $$ 
DECLARE
    day_number INT;
    microcycle_id INT;
    exercise_id INT;
BEGIN
    FOR microcycle_id IN 1..9 LOOP
        FOR day_number IN 1..4 LOOP
            INSERT INTO daily_workouts (day_number, microcycle_id) VALUES (day_number, microcycle_id);
        END LOOP;
    END LOOP;
END $$;

-- DAILY WORKOUT EXERCISES --
INSERT INTO workout_exercises (daily_workout_id, exercise_id, sets, reps, percentage)
SELECT
  dw.id AS daily_workout_id,
  1 + FLOOR(RANDOM() * 20) AS exercise_id,
  99 AS sets,
  99 AS reps,
  1 + FLOOR(RANDOM() * 100) AS percentage
FROM
  daily_workouts dw
CROSS JOIN LATERAL (
  SELECT generate_series(1, 6)
) x
WHERE
  dw.day_number BETWEEN 1 AND 36;