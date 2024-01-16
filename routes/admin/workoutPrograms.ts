import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const authorization = require("../../middleware/authorization");

module.exports = (pool: Pool) => {
  router.get("/", authorization, async (req: Request, res: Response) => {
    try {
      const workoutPrograms = await pool.query(
        `SELECT id, name FROM workout_programs;`
      );

      res.json(workoutPrograms.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Workout Programs");
    }
  });

  router.post("/", authorization, async (req: Request, res: Response) => {
    const { programName } = req.body;

    try {
      const response = await pool.query(
        `INSERT INTO workout_programs (name) VALUES ($1) RETURNING id, name`,
        [programName]
      );

      res.status(201).json({
        message: "Successfully Created New Workout Program",
        workoutProgram: response.rows[0],
      });
    } catch (err) {
      console.log(err);
      const error = err as Error & { code?: string };

      if (error?.code === "23505") {
        res.status(500).json({ error: "Workout Program Name Already Exists" });
      } else {
        res
          .status(500)
          .json({ error: "Server Error Creating New Workout Program" });
      }
    }
  });

  router.delete("/:id", authorization, async (req: Request, res: Response) => {
    try {
      const workoutProgram = await pool.query(
        `DELETE FROM workout_programs WHERE id = $1`,
        [req.params.id]
      );

      res.status(200).json({
        message: "Successfully Deleted Workout Program",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error Deleting Workout Program" });
    }
  });

  router.put(
    "/microcycle/:id",
    authorization,
    async (req: Request, res: Response) => {
      const { phaseInput } = req.body;

      try {
        const microcycle = await pool.query(
          `UPDATE microcycles SET phase = $1 WHERE id = $2 RETURNING phase, id, microcycle_number AS "microcycleNumber"`,
          [phaseInput, req.params.id]
        );

        res.status(200).json({
          message: "Successfully Updated Microcycle Phase",
          microcycle: microcycle.rows[0],
        });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Server Error Updating Microcycle Phase" });
      }
    }
  );

  router.post(
    "/microcycle",
    authorization,
    async (req: Request, res: Response) => {
      const { microcycleNumber, workoutProgramId } = req.body;

      try {
        const response = await pool.query(
          `INSERT INTO microcycles (microcycle_number, workout_program_id) VALUES ($1, $2) RETURNING id, microcycle_number AS "microcycleNumber"`,
          [microcycleNumber + 1, workoutProgramId]
        );

        res.json({
          message: "Successfully Created New Microcycle",
          microcycle: response.rows[0],
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error Creating New Microcycle" });
      }
    }
  );

  router.get(
    "/microcycle/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const microcycles = await pool.query(
          `SELECT microcycle_number AS "microcycleNumber", id FROM microcycles WHERE workout_program_id = $1`,
          [req.params.id]
        );

        res.json(microcycles.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Fetching Admin Microcycles");
      }
    }
  );

  router.post(
    "/daily_workout",
    authorization,
    async (req: Request, res: Response) => {
      const { dayNumber, microcycleId } = req.body;

      try {
        const response = await pool.query(
          `INSERT INTO daily_workouts (day_number, microcycle_id) VALUES ($1, $2) RETURNING id, day_number AS "dayNumber"`,
          [dayNumber + 1, microcycleId]
        );

        res.status(201).json({
          message: "Successfully Created New Daily Workout",
          dailyWorkout: response.rows[0],
        });
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "Server Error Creating New Daily Workout" });
      }
    }
  );

  router.put(
    "/exercise",
    authorization,
    async (req: Request, res: Response) => {
      const { id, exerciseName, sets, reps, rpe, percentage, dailyWorkoutId } =
        req.body;

      const sanitizedParams = {
        rpe: rpe || null,
        percentage: percentage || null,
        exerciseName: exerciseName.trimEnd(),
      };

      // Check for existing exercise and variant and assign the same type, if not default to accessory exercise
      let type = "accessory";
      let variant;

      const exerciseType = await pool.query(
        "SELECT type, variant FROM exercises WHERE name = $1 AND type IS NOT NULL LIMIT 1",
        [sanitizedParams.exerciseName]
      );

      if (exerciseType.rows.length > 0) {
        type = exerciseType.rows[0].type;
        variant = exerciseType.rows[0].variant;
      }

      try {
        await pool.query("BEGIN");

        let exercise;

        const existingExercise = await pool.query(
          `SELECT id FROM exercises 
          WHERE name = $1`,
          [sanitizedParams.exerciseName]
        );

        if (existingExercise.rows.length > 0) {
          exercise = existingExercise;
        } else {
          exercise = await pool.query(
            `INSERT INTO exercises (name, type, variant) VALUES ($1, $2, $3) RETURNING id, name, type, variant`,
            [sanitizedParams.exerciseName, type, variant]
          );
        }

        const exerciseId = exercise.rows[0].id;

        let action;
        let workoutExercise;

        if (id) {
          workoutExercise = await pool.query(
            `UPDATE workout_exercises 
            SET exercise_id = $1, sets = $2, reps = $3, rpe = $4, percentage = $5 
            FROM exercises 
            WHERE workout_exercises.exercise_id = exercises.id 
              AND workout_exercises.id = $6 
            RETURNING workout_exercises.id, exercises.name, workout_exercises.percentage, workout_exercises.rpe, workout_exercises.reps, workout_exercises.sets, exercises.type, exercises.variant;`,
            [
              exerciseId,
              sets,
              reps,
              sanitizedParams.rpe,
              sanitizedParams.percentage,
              id,
            ]
          );
          action = "update";
        } else {
          workoutExercise = await pool.query(
            `INSERT INTO workout_exercises (daily_workout_id, exercise_id, sets, reps, rpe, percentage) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING 
              id, sets, reps, rpe, percentage,
              (SELECT name FROM exercises WHERE id = $2) AS name,
              (SELECT type FROM exercises WHERE id = $2) AS type,
              (SELECT variant FROM exercises WHERE id = $2) AS variant;`,
            [
              dailyWorkoutId,
              exerciseId,
              sets,
              reps,
              sanitizedParams.rpe,
              sanitizedParams.percentage,
            ]
          );
          action = "create";
        }

        await pool.query("COMMIT");

        type ExerciseResponse = {
          code: number;
          message: string;
          dailyWorkoutId: number | undefined;
        };

        let response: ExerciseResponse = {
          code: 0,
          message: "",
          dailyWorkoutId: undefined,
        };

        if (action === "create") {
          response.code = 201;
          response.message = "Successfully Created New Exercise";
        } else if (action === "update") {
          response.code = 200;
          response.message = "Successfully Updated Exercise";
          response.dailyWorkoutId = workoutExercise.rows[0].id;
        }

        res.status(response.code).json({
          message: response.message,
          exercise: workoutExercise.rows[0],
          dailyWorkoutId: response.dailyWorkoutId,
        });
      } catch (err) {
        await pool.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Server Error Creating New Exercise" });
      }
    }
  );

  router.delete(
    "/exercise/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const exercise = await pool.query(
          `DELETE FROM workout_exercises WHERE id = $1`,
          [req.params.id]
        );

        res.status(200).json({
          message: "Successfully Deleted Exercise",
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error Deleting Exercise" });
      }
    }
  );

  router.post("/copy_previous_week", async (req: Request, res: Response) => {
    try {
      const { previousMicrocycleId, newMicrocycleId } = req.body;

      if (!previousMicrocycleId) {
        console.error("Can't Copy Previous Microcycle When One Doesn't Exist");
        return res.status(500).json({
          error: "Can't Copy Previous Microcycle When One Doesn't Exist",
        });
      }

      const workoutProgram = await pool.query(
        `SELECT id FROM daily_workouts WHERE microcycle_id = $1`,
        [newMicrocycleId]
      );

      if (workoutProgram.rows.length > 1) {
        console.error("Microcycle Must Be Empty to Copy Previous Instance");
        return res.status(500).json({
          error: "Microcycle Must Be Empty to Copy Previous Instance",
        });
      }

      await pool.query("BEGIN");

      // Fetch all daily workouts that match the previous microcycle id that is passed in
      const copiedDailyWorkouts = await pool.query(
        `SELECT id FROM daily_workouts WHERE microcycle_id = $1`,
        [previousMicrocycleId]
      );

      const response = [];

      // Create a new daily workout for each fetched daily workout with the new microcycle id as the foreign key
      for (let i = 0; i < copiedDailyWorkouts.rows.length; i++) {
        const dailyWorkout = await pool.query(
          `INSERT INTO daily_workouts (day_number, microcycle_id) VALUES ($1, $2) RETURNING id, day_number AS "dayNumber", microcycle_id AS "microcycleId"`,
          [i + 1, newMicrocycleId]
        );

        response.push(dailyWorkout.rows[0]);

        // Fetch all workout exercises for each existing microcycle that is being copied
        const workoutExercises = await pool.query(
          `SELECT exercises.id, name, sets, reps, rpe, percentage, type, variant
            FROM exercises
            JOIN workout_exercises ON exercises.id = workout_exercises.exercise_id
            WHERE daily_workout_id = $1
            ORDER BY workout_exercises.id;`,
          [copiedDailyWorkouts.rows[i].id]
        );

        // Insert the copied exercises into each new daily workout
        for (let j = 0; j < workoutExercises.rows.length; j++) {
          const { id, sets, reps, rpe, percentage } = workoutExercises.rows[j];
          await pool.query(
            `INSERT INTO workout_exercises (daily_workout_id, exercise_id, sets, reps, rpe, percentage) VALUES ($1, $2, $3, $4, $5, $6)`,
            [dailyWorkout.rows[0].id, id, sets, reps, rpe, percentage]
          );
        }
      }

      res.status(201).json({
        dailyWorkouts: response,
        message: "Successfully Copied Previous Microcycle",
      });

      await pool.query("COMMIT");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error Copying Microcycle" });
    }
  });

  return router;
};
