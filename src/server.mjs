import dotenv from "dotenv";
import express from 'express';
import methodOverride from 'method-override';
import session from 'express-session';
import pg from "pg";
import usersRoutes from './routes/users.mjs';
import workoutsRoutes from './routes/workouts.mjs'; 
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
dotenv.config();


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});


db.connect();
export {db};

app.use(cors()); // CORS should come first to ensure CORS headers are applied
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use('/api/users', usersRoutes);
app.use('/api/login', usersRoutes);
app.use('/api', workoutsRoutes);


app.get('*', (req, res) => {
  // Adjust the path to where your React app's development index.html is located
  // Since your server.mjs is within the src, you might need to go up two levels
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


