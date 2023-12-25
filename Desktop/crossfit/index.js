import express from "express";
import methodOverride from 'method-override'
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "crossfit",
  password: "99Llamas!",
  port: 5432,
});

db.connect();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Make sure that static files are linked to and the CSS shows up.
app.use(express.static("public"));

// Use body-parser middleware for method override
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.get("/", async (req, res) => {
  try {
    // Fetch a quote from the API
    const apiOptions = {
      method: 'GET',
      url: 'https://quotes-inspirational-quotes-motivational-quotes.p.rapidapi.com/quote',
  params: {
    token: 'ipworld.info'
  },
  headers: {
    'X-RapidAPI-Key': '28f3d12947msh43fccfe75934819p13876ejsn71876f948c37',
    'X-RapidAPI-Host': 'quotes-inspirational-quotes-motivational-quotes.p.rapidapi.com'
  }
    };

    const apiResponse = await axios.request(apiOptions);
    const apiQuote = apiResponse?.data?.text;


    // Render the homepage and pass the quote from the API as a variable
    res.render("index.ejs", { apiQuote });

  } catch (apiError) {
    console.error(apiError);
  } 
    
});


// Route to render the exercise log page
app.get('/log', async (req, res) => {
  try {
    // Fetch user data from the database
    const usersResult = await db.query("SELECT * FROM users");
    const users = usersResult.rows;

    // Fetch exercise data from the database
    const exercisesResult = await db.query("SELECT * FROM exercises");
    const exercises = exercisesResult.rows;

    // Render the log page and pass data to the template
    res.render('log.ejs', { users, exercises });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to handle the form submission for adding exercise log
app.post('/log/add-log', async (req, res) => {
  try {
    const logId = req.body.logId;
    const userId = req.body.userId;
    const exerciseDate = req.body.exerciseDate;
    const exerciseId = req.body.exerciseId;
    const exerciseWeight = req.body.exerciseWeight;

    // Add the data in the database

   const insertQuery = `
      INSERT INTO exercise_logs (user_id, exercise_date, exercise_id,exercise_weight)
      VALUES ($1, $2, $3, $4)
    `;

   
    await db.query(insertQuery, [userId,exerciseDate, exerciseId, exerciseWeight]);
   
  } catch (error) {
    // console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/delete-log/:logId', async (req, res) => {
  try {
    const logId = req.params.logId;

    // Add logic to delete the log with the given logId from the database
    const deleteQuery = 'DELETE FROM exercise_logs WHERE log_id = $1';
    await db.query(deleteQuery, [logId]);

    // Send a JSON response indicating successful deletion
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    // Send a JSON response indicating an error occurred during deletion
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Route to render the manage users page
app.get('/manage-users', async (req, res) => {
  try {
    // Fetch user data from the database
    const usersResult = await db.query("SELECT * FROM users");
    const users = usersResult.rows;

    // Render the manage users page and pass data to the template
    res.render('manage-users.ejs', { users });
  } catch (error) {
    // console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Add a route for updating users
app.post('/update-user/:userId', async (req, res) => {

  try{
  const userId = req.params.userId;
  const updatedName = req.body.updatedName;
  const updatedAge = req.body.updatedAge;
  const updatedWeight = req.body.updatedWeight;

  const updateQuery = `
      UPDATE users
      SET name = COALESCE($1, name), age = COALESCE($2, age), weight = COALESCE($3, weight)
      WHERE id = $4
    `;

    await db.query(updateQuery, [updatedName,updatedAge, updatedWeight,userId]); 
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Route to render the manage exercises page
app.get('/manage-exercises', async (req, res) => {
  try {
    // Fetch user data from the database
    const exercisesResult = await db.query("SELECT * FROM exercises");
    const exercises = exercisesResult.rows;

    // Render the manage users page and pass data to the template
    res.render('manage-exercises.ejs', { exercises });
  } catch (error) {
    // console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle the form submission for adding exercise
app.post('/add-exercise', async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const exerciseName = req.body.addExerciseName;
    console.log('Exercise Name:', exerciseName);

    if (!exerciseName) {
      // Handle the case where exerciseName is not provided
      return res.status(400).json({ error: 'Bad Request', details: 'Exercise Name is required' });
    }

    // Add the data to the database
    const insertQuery = `
      INSERT INTO exercises (exercise_name)
      VALUES ($1)
      RETURNING id, exercise_name;`;

    const result = await db.query(insertQuery, [exerciseName]);

    // Fetch all exercises from the database again
    const exercisesResult = await db.query("SELECT * FROM exercises");
    const exercises = exercisesResult.rows;

    // Render the 'manage-exercises.ejs' template with the updated list of exercises
    res.render('manage-exercises.ejs', { exercises });
  } catch (error) {
    console.error(error);

    // Render an error page or handle the error as needed
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



// Add a route for updating exercises
app.post('/update-exercise/:exerciseId', async (req, res) => {
  console.log('Received POST request to update exercise:', req.params.exerciseId);
  try {
    const exerciseId = req.params.exerciseId;
    const updatedName = req.body.updatedName; // Update the field name to match your form field

    const updateQuery = `
      UPDATE exercises
      SET exercise_name = COALESCE($1, exercise_name)
      WHERE id = $2
    `;

    await db.query(updateQuery, [updatedName, exerciseId]);

    // Redirect to the manage-exercises page
    res.redirect('/manage-exercises');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Add a route for deleting exercises
app.delete('/delete-exercise/:exerciseId', async (req, res) => {
  try {
    const exerciseId = req.params.exerciseId;

    // Add logic to delete the exercise with the given exerciseId from the database
    const deleteQuery = 'DELETE FROM exercises WHERE id = $1';
    await db.query(deleteQuery, [exerciseId]);

    // Redirect to the manage-exercises page after successful deletion
    res.redirect('/manage-exercises');
  } catch (error) {
    console.error(error);
    // Handle the error and send an appropriate response
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Route to render progress overview of all the exercise logs
app.get('/progress-overview', async (req, res) => {
  try {
    const filterByName = req.query.filterByName;
    const filterByExercise = req.query.filterByExercise;

    // Use an array to store conditions
    const conditions = [];
    const parameters = [];

    if (filterByName) {
      conditions.push(`users.name ILIKE $${parameters.length + 1}`);
      parameters.push(`%${filterByName}%`);
    }

    if (filterByExercise) {
      conditions.push(`exercises.exercise_name ILIKE $${parameters.length + 1}`);
      parameters.push(`%${filterByExercise}%`);
    }

    // Join conditions with 'AND' if there are multiple conditions
    const conditionsString = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

    // Query to get distinct user names for the dropdown
    const userNamesQuery = 'SELECT DISTINCT name FROM users';
    const userNamesResult = await db.query(userNamesQuery);
    const userList = userNamesResult.rows.map(row => row.name);
    // console.log("User List:", userList);

    // Query to get distinct exercise names for the dropdown
    const exerciseNamesQuery = 'SELECT DISTINCT exercise_name FROM exercises';
    const exerciseNamesResult = await db.query(exerciseNamesQuery);
    const exerciseList = exerciseNamesResult.rows.map(row => row.exercise_name);
    // console.log("Exercise List:", exerciseList);


    const query = `
      SELECT
        exercise_logs.log_id,
        users.name AS user_name,
        exercise_logs.exercise_date,
        exercises.exercise_name,
        exercise_logs.exercise_weight
      FROM exercise_logs
      JOIN users ON exercise_logs.user_id = users.id
      JOIN exercises ON exercise_logs.exercise_id = exercises.id
      ${conditionsString}
    `;

    const progressOverview = await db.query(query, parameters);
     progressOverview.rows.forEach((log) => {
      log.exercise_date = log.exercise_date.toDateString(); // Convert to a string format
    });

    // Render the Progress Overview page and pass data to the template
    res.render('progress-overview.ejs', { progressOverview:progressOverview.rows , exerciseList, userList});
    // console.log(progressOverview)
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs")
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

