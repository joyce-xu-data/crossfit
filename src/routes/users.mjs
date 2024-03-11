import bcrypt from 'bcrypt';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { db } from '../server.mjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './authMiddleware.mjs';

const router = express.Router ();

// Passport Local Strategy for signup
passport.use('local-signup', new LocalStrategy({
  usernameField: 'email', // by default, local strategy uses username, we will override with email
  passwordField: 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback
}, 
async (req, email, password, done) => {
  try {
    // Check if email already exists
    const user = await db.query('SELECT * FROM userdb WHERE email = $1', [email]);
    if (user.rows.length) {
      return done(null, false, { message: 'Email already registered.' });
    }

    // If not, hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const newUser = await db.query(
      'INSERT INTO userdb(first_name, last_name, email, password, dob) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.body.first_name, req.body.last_name, email, hashedPassword, req.body.dob]
    );

    return done(null, newUser.rows[0]);
  } catch (error) {
    return done(error);
  }
}));

// Passport Local Strategy for login
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, 
async (req, email, password, done) => {
  try {
    const user = await db.query('SELECT * FROM userdb WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return done(null, false, { message: 'No user found with that email.' });
    }

    const match = await bcrypt.compare(password, user.rows[0].password);
    if (!match) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user.rows[0]);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user to the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.query('SELECT * FROM userdb WHERE id = $1', [id]);
    done(null, user.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// POST route to register a user
router.post('/', (req, res, next) => {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
    if (!user) {
      return res.status(400).json({ error: 'Bad Request', details: info.message });
    }
    res.status(201).send('User created successfully');
  })(req, res, next);
});


// POST route  for user login
router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
    if (!user) {
      return res.status(400).json({ error: 'Bad Request', details: info.message });
    }
    req.login(user, { session: false }, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: 'Error logging in', details: loginErr.message });
      }
      // Issue a JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
      return res.status(200).json({ message: 'Logged in successfully', user, token });
    });
  })(req, res, next);
});

router.put('/update-profile', authenticateToken, async (req, res) => {
  try {

    const { firstName, lastName, password, dob } = req.body;
    // Extract the user ID from the request parameters.
    const userId = req.user.id;

     //  hash the new password before storing it.
     const saltRounds = 10;
     const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the first database (for example, a user profile database).
    const updateUserResult = await db.query(
      'UPDATE userdb SET first_name = $2, last_name = $3, password = $4, dob = $5 WHERE id = $1 RETURNING *',
      [userId, firstName, lastName, hashedPassword, dob]
    );

    // Check if the first update was successful before proceeding.
    if (updateUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If everything went well, send a success response.
    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating user data.' });
  }
});

 

export default router;

