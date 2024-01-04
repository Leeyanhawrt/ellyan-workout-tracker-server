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
          `SELECT id, name, number_sets AS "numberSets", number_reps AS "numberReps", rpe, percentage, type, variant
          FROM exercises 
          WHERE name = $1 AND number_sets = $2 AND number_reps = $3 AND variant = $4 
            AND (rpe = $5 OR ($5 IS NULL AND rpe IS NULL))
            AND (percentage = $6 OR ($6 IS NULL AND percentage IS NULL))
          LIMIT 1`,
          [
            sanitizedParams.exerciseName,
            sets,
            reps,
            variant,
            sanitizedParams.rpe,
            sanitizedParams.percentage,
          ]
        );

        if (existingExercise.rows.length > 0) {
          exercise = existingExercise;
        } else {
          exercise = await pool.query(
            `INSERT INTO exercises (name, number_sets, number_reps, rpe, percentage, type, variant) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, number_sets AS "numberSets", number_reps AS "numberReps", rpe, percentage, type, variant`,
            [
              sanitizedParams.exerciseName,
              sets,
              reps,
              sanitizedParams.rpe,
              sanitizedParams.percentage,
              type,
              variant,
            ]
          );
        }

        const exerciseId = exercise.rows[0].id;

        let action;
        let dailyWorkout;

        if (id) {
          dailyWorkout = await pool.query(
            `UPDATE daily_workout_exercises SET exercise_id = $1 WHERE id = $2  RETURNING id`,
            [exerciseId, id]
          );
          action = "update";
        } else {
          await pool.query(
            `INSERT INTO daily_workout_exercises (daily_workout_id, exercise_id) VALUES ($1, $2)`,
            [dailyWorkoutId, exerciseId]
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
          response.dailyWorkoutId = dailyWorkout!.rows[0].id;
        }

        res.status(response.code).json({
          message: response.message,
          exercise: exercise.rows[0],
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
          `DELETE FROM daily_workout_exercises WHERE id = $1`,
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

  router.post(
    "/copy_previous_week",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const { previousMicrocycleId, newMicrocycleId } = req.body;

        await pool.query("BEGIN");

        // Fetch all daily workouts that match the previous microcycle id that is given
        const copiedDailyWorkouts = await pool.query(
          `SELECT id FROM daily_workouts WHERE microcycle_id = $1`,
          [previousMicrocycleId]
        );

        const insertedDailyWorkouts = copiedDailyWorkouts.rows.map(
          async (dailyWorkout, index) => {
            await pool.query(
              `INSERT INTO daily_workouts (day_number, microcycle_id) VALUES ($1, $2)`
            ),
              [index + 1, newMicrocycleId];
          }
        );

        await Promise.all(insertedDailyWorkouts);

        // Create as many daily workouts with the new microcycle id as there were from step 1
        // Return all daily_workout_exercises that match step 1 with the same daily workout id
        // One at a time take each new daily workout id that was created and add into daily workout exercises the exercises_id
        await pool.query("COMMIT");
      } catch (err) {}
    }
  );

  return router;
};
