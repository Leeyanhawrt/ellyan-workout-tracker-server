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

INSERT INTO microcycles (microcycle_number, workout_program_id)
VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1);

-- MAIN EXERCISES --

INSERT INTO exercises(name, number_sets, number_reps, percentage, type, variant)
VALUES
('Squat', 99, 99, 99, 'main', 'squat'), ('Bench Press', 99, 99, 99, 'main', 'benchpress'), ('Deadlift', 99, 99, 99, 'main', 'deadlift');

-- VARIATION EXERCISES --
INSERT INTO exercises(name, number_sets, number_reps, percentage, type, variant)
VALUES
('Close Grip Bench', 99, 99, 99, 'main variation', 'benchpress'), ('Larsen Press', 99, 99, 99, 'main variation', 'benchpress'), ('Stiff Leg Deadlift', 99, 99, 99, 'main variation', 'deadlift'),
('Pause Squat', 99, 99, 99, 'main variation', 'squat'), ('Halting Deadlift', 99, 99, 99, 'main variation', 'deadlift'), ('Spotto Press', 99, 99, 99, 'main variation', 'benchpress'), ('Deficit Deadlift', 99, 99, 99, 'main variation', 'deadlift'),
('Rack Pull Deadlift', 99, 99, 99, 'main variation', 'deadlift'), ('Wide Grip Bench', 99, 99, 99, 'main variation', 'benchpress'), ('Safety Bar Squats', 99, 99, 99, 'main variation', 'squat'), ('Trap Bar Deadlift', 99, 99, 99, 'main variation', 'deadlift'),
('Deadlift To Knee', 99, 99, 99, 'main variation', 'deadlift'), ('Deadlift From Boxes', 99, 99, 99, 'main variation', 'deadlift'), ('Incline Bench Press', 99, 99, 99, 'main variation', 'benchpress'), ('Decline Bench Press', 99, 99, 99, 'main variation', 'benchpress'),
('Snatch Grip Rack Pull', 99, 99, 99, 'main variation', 'deadlift'), ('Snatch Grip Rack Pull (Slow Eccentric)', 99, 99, 99, 'main variation', 'deadlift'), ('Snatch Grip Deadlift', 99, 99, 99, 'main variation', 'deadlift'), ('Paused Deadlift', 99, 99, 99, 'main variation', 'deadlift'),
('Safety Bar Squats (Lowbar)', 99, 99, 99, 'main variation', 'deadlift');  

-- ACCESSORY EXERCISES --
INSERT INTO exercises(name, number_sets, number_reps, rpe, type)
VALUES
('Bulgarian Split Squat', 99, 99, 99, 'accessory'), ('Bicep Curl', 99, 99, 99, 'accessory'), ('Tricep Rope Extension', 99, 99, 99, 'accessory'),
('Dumbbell Press', 99, 99, 99, 'accessory'), ('Incline Dumbbell Press', 99, 99, 99, 'accessory'),
('Shoulder Press', 99, 99, 99,'accessory');

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
INSERT INTO daily_workout_exercises (daily_workout_id, exercise_id)
SELECT
  dw.id AS daily_workout_id,
  1 + FLOOR(RANDOM() * 20) AS exercise_id
FROM
  daily_workouts dw
CROSS JOIN LATERAL (
  SELECT generate_series(1, 6)
) x
WHERE
  dw.day_number BETWEEN 1 AND 36;