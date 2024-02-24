import express from 'express';
import { db } from '../server.mjs';
import { authenticateToken } from './authMiddleware.mjs';


const router = express.Router();

router.get('/categories',async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories');
    res.json(categories.rows);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint for getting sub-categories based on a categoryß
router.get('/categories/:categoryId/subcategories', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const subcategories = await db.query('SELECT * FROM sub_categories WHERE category_id = $1', [categoryId]);
    res.json(subcategories.rows);
  } catch (error) {
    console.error("Failed to fetch subcategories", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint for getting exercises based on a sub-category
router.get('/subcategories/:subCategoryId/workouts', async (req, res) => {
  const { subCategoryId } = req.params;
  const workouts = await db.query('SELECT * FROM workouts WHERE sub_category_id = $1', [subCategoryId]);
  res.json(workouts.rows);
});

// Endpoint for getting workouts based on a category
router.get('/categories/:categoryId/workouts', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const workouts = await db.query('SELECT * FROM workouts WHERE category_id = $1 AND sub_category_id IS NULL', [categoryId]);
    res.json(workouts.rows);
  } catch (error) {
    console.error("Failed to fetch workouts for category", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/logs',authenticateToken, async (req, res) => {
  // Access the logged-in user's ID
  const userId = req.user.id;
  

  // Extract log data from the request body
  const { logEntries, notes } = req.body;


  try {
    // Begin a transaction
    await db.query('BEGIN');

    const insertQuery = `
      INSERT INTO workout_logs (
        workoutdate, strengthorwod, strengthwork, solopartner, workouttype,
        rxscaled, workout_id, qty, scoremetrics, weight, weightunit,
        minutes, seconds, reps, rounds, user_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `;
    console.log(insertQuery)

    for (const entry of logEntries) {
      const values = [
        entry.workoutDate, entry.strengthOrWOD, entry.strengthWork, entry.soloPartner, entry.workoutType,
        entry.rxscaled, entry.workoutId, entry.qty, entry.scoreMetrics, entry.weight, entry.weightUnit,
        entry.minutes, entry.seconds, entry.reps, entry.rounds, userId, notes
      ];
      
      console.log(values)
      await db.query(insertQuery, values);
    }

    // Commit the transaction
    await db.query('COMMIT');
    res.status(201).json({ message: 'Logs created successfully' });
  } catch (error) {
    // If an error is caught, rollback the transaction
    await db.query('ROLLBACK');
    console.error("Failed to insert log entries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
