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

      try {
        const result = await db.query(`
          SELECT date, muscle_mass, body_fat, weight 
          FROM user_bodymetrics
          WHERE user_id = $1
        `, [id]);

    
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

    router.get('/bodymetrics/log-data/:id', async (req, res) => {
      const { id } = req.params;

      try {
          const result = await db.query(`
              SELECT id, date, muscle_mass, body_fat, weight 
              FROM user_bodymetrics
              WHERE user_id = $1
          `, [id]);


          if (result.rows.length > 0) {
              // Directly send the rows for table display
              const tableData = result.rows.map(row => ({
                  id: row.id,
                  date: new Date(row.date).toLocaleDateString(), // Convert date to readable format
                  muscleMass: row.muscle_mass, 
                  bodyFat: row.body_fat,
                  weight: row.weight  
              }));

              res.json(tableData);
          
          } else {
              res.status(404).json({ error: "No data found" });
          }
      } catch (error) {
          console.error("Failed to fetch or process data for body metrics", error);
          res.status(500).json({ error: "Internal server error" });
      }
  });

  router.delete('/bodymetrics/delete/:id', async (req, res) => {
    const { id } = req.params; // Extracting the ID from the route parameter
    console.log(id)
    try {
      // Perform the deletion query
      const deleteQuery = 'DELETE FROM user_bodymetrics WHERE id = $1';
      const result = await db.query(deleteQuery, [id]);
  
      if (result.rowCount > 0) {
        // If the deletion was successful (i.e., an actual row was deleted)
        console.log(`Deleted body metric with ID: ${id}`);
        res.status(204).send(); // Send a 204 No Content response
      } else {
        // If no row was found (and thus deleted) with the given ID
        res.status(404).json({ message: 'Body metric not found' });
      }
    } catch (error) {
      console.error('Failed to delete body metric', error);
      res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  });

 
  
  router.put('/bodymetrics/update/:id',  authenticateToken,async (req, res) => {
    // Access the logged-in user's ID
    const userId = req.user.id;
    const { id } = req.params; // This is the ID of the specific body metric entry to update
    const { weighInDate, muscleMass, bodyFat, weight } = req.body; // this should be whatever that is named in the main jsx, the input request body
    console.log('input request body',req.body)
    console.log('UserId:',userId,'Received date:', weighInDate, 'Muscle Mass', muscleMass, 'Body Fat', bodyFat, 'Weight',weight);

    try {


        // Update the specific entry
        const updateQuery = `
            UPDATE user_bodymetrics
            SET date = $1, muscle_mass = $2, body_fat = $3, weight = $4
            WHERE id = $5
            RETURNING *;
        `;

        await db.query(updateQuery, [weighInDate, muscleMass, bodyFat, weight, id]);

        console.log('Updating entry for ID:', id);
        console.log('Fetching updated entries for User ID:', userId);
        
        
        // After updating, fetch and return the updated list of all entries for this user
        const fetchUpdated = `
        SELECT id, date, muscle_mass, body_fat, weight 
        FROM user_bodymetrics
        WHERE user_id = $1`
 

        const result = await db.query(fetchUpdated, [userId]);

        if (result.rows.length > 0) {
            const tableData = result.rows.map(row => ({
                id: row.id,
                date: new Date(row.date).toLocaleDateString(), // Convert date to readable format
                muscleMass: row.muscle_mass,
                bodyFat: row.body_fat,
                weight: row.weight  
            }));
            res.json(tableData);
        } else {
            res.status(404).json({ error: "No data found after update" });
        }
    } catch (error) {
        console.error("Failed to update or process data for body metrics", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


    export default router;
