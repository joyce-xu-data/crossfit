import express from 'express';
import { db } from '../server.mjs';
import { authenticateToken } from './authMiddleware.mjs';

const router = express.Router();

router.post('/log-bodymetrics', authenticateToken, async (req, res) => {
  // Access the logged-in user's ID
  const userId = req.user.id;
  // Extract log data from the request body
  const { logEntries } = req.body;

  try {
      // Begin a transaction
      await db.query('BEGIN');

      const insertQuery = `
          INSERT INTO user_bodymetrics (
              muscle_mass, body_fat, weight, date, user_id
          ) VALUES ($1, $2, $3, $4, $5)
      `;
      console.log(insertQuery);

      for (const entry of logEntries) {
        const values = [
          entry.muscleMass,
          entry.bodyFat,
          entry.weight,
          entry.weighInDate,
          userId
        ];
        await db.query(insertQuery, values);
      }
      console.log (logEntries)
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

router.get('/bodymetrics/chart-data/:id', async (req, res) => {
    const { id } = req.params;

    console.log(id)
  
    try {
      const result = await db.query(`
        SELECT date, muscle_mass, body_fat, weight 
        FROM user_bodymetrics
        WHERE user_id = $1
      `, [id]);

      console.log(result)
  
      if (result.rows.length > 0) {
        const labels = result.rows.map(row => new Date(row.date).toLocaleDateString());
        const chartData = {
          labels,
          datasets: [
            {
              label: 'Weight',
              data: result.rows.map(row => row.weight),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            },
            {
              label: 'Muscle Mass',
              data: result.rows.map(row => row.muscle_mass), // Ensure this matches your DB column name exactly
              borderColor: 'rgb(53, 162, 235)',
              tension: 0.1
            },
            {
              label: 'Body Fat',
              data: result.rows.map(row => row.body_fat), // Ensure this matches your DB column name exactly
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            }
          ]
        };
  
        res.json(chartData);
      } else {
        res.status(404).json({ error: "No data found" });
      }
    } catch (error) {
      console.error("Failed to fetch or process data for body metrics", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  

  export default router;
