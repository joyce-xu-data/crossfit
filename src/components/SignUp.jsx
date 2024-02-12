import React,{useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {


  // State for submission feedback
  const [submitStatus, setSubmitStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
   // Construct the user object
    const user = {
      first_name: data.get('firstName'),
      last_name: data.get('lastName'),
      email: data.get('email'),
      password: data.get('password'),
      dob: data.get('birthday'), // Ensure you collect and format all necessary fields
    };

    console.log(user)

  
  try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        // Handle successful submission, e.g., navigate to login page or show success message
        setSubmitStatus('Successful!')
        navigate('/');
      } else {
        // Handle server errors or data issues
        const errorText = await response.text();
        setSubmitStatus(`Sign up failed: ${errorText}`);
      }
    } catch (error) {
      // Handle network errors
      setSubmitStatus(`Sign up failed: ${error.message}`);
    }
  };

  return (
   
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {submitStatus && (
             <Typography
             variant="body2"
             color="error" // or "primary" or "textPrimary", depending on how you want it to look
             align="center"
             sx={{ mt: 2 }}
            >
             {submitStatus}
            </Typography>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
               <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="birthday"
                  label="Date of Birth"
                  type="date"
                  id="birthday"
                  InputLabelProps={{
                  shrink: true, // This is necessary for the date picker to render properly
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
     
      </Container>

  );
}
