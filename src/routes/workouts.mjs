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

router.get('/workouts/:workoutId/details', authenticateToken, async (req, res) => {
   const { workoutId } = req.params; // Correct way to access route params

  try {
    const result = await db.query(`
     SELECT * FROM workout_logs WHERE workout_id = $1 
    `, [workoutId]);


    if (result.rows.length > 0) {
      // Optionally log the max weight found
      console.log(`Data found for workoutId ${workoutId}`);
      
      res.json(result.rows[0]);
    } else {
      console.log(`No data found for workoutId ${workoutId}`);
      res.status(404).json({ error: "No data found for the specified workout_id" });
    }
  } catch (error) {
    console.error("Failed to fetch data for workout", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/workouts/:workoutId/maxweight', authenticateToken, async (req, res) => {
  const { workoutId } = req.params;
  
  console.log(`Fetching max weight for workoutId: ${workoutId}`);
  
  try {
    // Adjust the query to fetch max weights for specific quantities
    const result = await db.query(`
      SELECT
        workout_id,
        MAX(CASE WHEN qty = 1 THEN weight ELSE NULL END) as max_weight_qty_1,
        MAX(CASE WHEN qty = 3 THEN weight ELSE NULL END) as max_weight_qty_3,
        MAX(CASE WHEN qty = 5 THEN weight ELSE NULL END) as max_weight_qty_5,
        MAX(CASE WHEN qty = 10 THEN weight ELSE NULL END) as max_weight_qty_10
      FROM workout_logs
      WHERE workout_id = $1
      GROUP BY workout_id
    `, [workoutId]);

    console.log(`Database query result for workoutId ${workoutId}:`, result.rows);

    if (result.rows.length > 0) {
    const maxWeights = result.rows[0];
    console.log(`Max weights found for workoutId ${workoutId}:`);
    console.log(`Qty 1: ${maxWeights.max_weight_qty_1 || 'N/A'} kg`);
    console.log(`Qty 3: ${maxWeights.max_weight_qty_3 || 'N/A'} kg`);
    console.log(`Qty 5: ${maxWeights.max_weight_qty_5 || 'N/A'} kg`);
    console.log(`Qty 10: ${maxWeights.max_weight_qty_10 || 'N/A'} kg`);
      res.json(result.rows[0]);
    } else {
      console.log(`No data found for workoutId ${workoutId}`);
      res.status(404).json({ error: "No data found for the specified workout_id" });
    }
  } catch (error) {
    console.error("Failed to fetch maximum weight for workout", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/workouts/:workoutId/chart-data', async (req, res) => {
  const { workoutId } = req.params; 

  try {
    const result = await db.query(`
      SELECT workoutDate, weight 
      FROM workout_logs 
      WHERE workout_id = $1 
      ORDER BY weight ASC, workoutDate ASC
    `, [workoutId]);

    if (result.rows.length > 0) {
      // Convert the fetched data into chart format
      const labels = result.rows.map(row => new Date(row.workoutdate).toLocaleDateString()); // Format dates for labels
      const weights = result.rows.map(row => row.weight);

      const chartData = {
        labels: labels,
        datasets: [{
          label: 'Weight Progression',
          data: weights,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };

      console.log(`Chart data prepared for workoutId ${workoutId}`, chartData);
      res.json(chartData); // Return the chart data
    } else {
      console.log(`Weights API: No data found for workoutId ${workoutId}`);
      res.status(404).json({ error: "No data found for the specified workout_id" });
    }
  } catch (error) {
    console.error("Failed to fetch or process data for workout", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;

