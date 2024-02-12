import bcrypt from 'bcrypt';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { db } from '../server.mjs';

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
      // Here you would typically issue a token or set a cookie
      // For example, using JWT:
      // const token = jwt.sign(user, 'your_jwt_secret');
      // res.status(200).json({ user, token });
      // But for now, we'll just return success.
      return res.status(200).json({ message: 'Logged in successfully', user });
    });
  })(req, res, next);
});

export default router;

