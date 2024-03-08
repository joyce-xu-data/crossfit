import React,{useState, useEffect} from 'react';
import {Avatar, Button, CssBaseline, TextField, Grid, Box, Typography, Container} from '@mui/material';
import { useUser } from './UserContext';


export default function Profile() {

  // State for submission feedback
  const { user } = useUser();
  console.log(user)

   // State for form data
   const [formData, setFormData] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    dob:user.dob ? user.dob.split('T')[0] : '', // Splits at 'T' and takes the first part (date),
    password: '', 
    confirmPassword: '',
  });

  // State for submission feedback
  const [submitStatus, setSubmitStatus] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        dob: user.dob ? user.dob.split('T')[0] : '',
      });
    }
  }, [user]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
 
     // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
    setSubmitStatus('Passwords do not match');
    return; // Stop the form submission
  }

  // Construct an object with only the data you need to send
  const updateData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    dob: formData.dob,
    password: formData.password, // Assuming you want to update the password
    // Do not include confirmPassword here as it's not needed for the backend
  };

  try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSubmitStatus('Profile updated successfully!');
      } else {
        const errorText = await response.text();
        setSubmitStatus(`Profile update failed: ${errorText}`);
      }
    } catch (error) {
      setSubmitStatus(`Profile update failed: ${error.message}`);
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
          
          </Avatar>
          <Typography component="h1" variant="h5">
            Profile
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
                  fullWidth
                  id="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  autoFocus 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    onChange={handleChange}
                />
                </Grid>
               <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="dob"
                  label="Date of Birth"
                  type="date"
                  id="birthday"
                  value={formData.dob}
                  onChange={handleChange}
                  InputLabelProps={{
                  shrink: true, // This is necessary for the date picker to render properly
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Update 
            </Button>
           
          </Box>
        </Box>
     
      </Container>

  );
}
