import React, { useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  CssBaseline,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useUser } from './UserContext';

function BodyMetricsLogs() {
  const { user } = useUser();
  console.log(user);

  const [bodyMetrics, setBodyMetrics] = useState({
    weighInDate: '',
    muscleMass: '',
    bodyFat: '',
    weight: '',
    weightUnit: 'kg', // Default to kilograms
    userId: user.id 
  });

  const [submitStatus, setSubmitStatus] = useState('');
  const [addedBodyMetrics, setAddedBodyMetrics] = useState([]);

  const handleAddBodyMetrics = (event) => {
    event.preventDefault();
    const newBodyMetrics = { ...bodyMetrics };
    setAddedBodyMetrics([...addedBodyMetrics, newBodyMetrics]);
    // Reset form fields
    setBodyMetrics({
      weighInDate: '',
      muscleMass: '',
      bodyFat: '',
      weight: '',
      weightUnit: 'kg', // Keep the default unit
      userId: user.id 
    });
  };

  const handleDeleteBodyMetrics = (index) => {
    const updatedBodyMetrics = addedBodyMetrics.filter((_, i) => i !== index);
    setAddedBodyMetrics(updatedBodyMetrics);
  };

  const handleEditBodyMetrics = (index) => {
    const bodyMetricsToEdit = addedBodyMetrics[index];
    setBodyMetrics(bodyMetricsToEdit);
    handleDeleteBodyMetrics(index);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBodyMetrics((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Construct the array of log entries to submit
    const logEntries = addedBodyMetrics.map(bodyMetrics => ({
      weighInDate: bodyMetrics.weighInDate,
      muscleMass: bodyMetrics.muscleMass ? Number(bodyMetrics.muscleMass) : null,
      bodyFat: bodyMetrics.bodyFat ? Number(bodyMetrics.bodyFat) : null,
      weight: bodyMetrics.weight ? Number(bodyMetrics.weight) : null,
    }));

    console.log(logEntries);
  
    const token = localStorage.getItem('token'); // Retrieve the token from wherever it's stored

    // Ensure there's data to submit
    if (addedBodyMetrics.length === 0) {
      console.error('No data to submit');
      setSubmitStatus('Error: No data to submit.');
      return;
    }
    fetch('/api/log-bodymetrics', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logEntries }), // Wrap logEntries in an object
    })
    .then((res) => {
      if (!res.ok) {
        console.error('Fetch error:', res);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('Log submitted:', data);
      setSubmitStatus('Success! Your data has been submitted.');
      setAddedBodyMetrics([]); // Clear the list to indicate successful submission
    })
    .catch((error) => {
      console.error('Failed to submit log:', error);
      setSubmitStatus('Error submitting your data.');
    });
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
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }} />
        <Typography component="h1" variant="h5">
          Body Metrics
        </Typography>
        <Box component="form" onSubmit={handleAddBodyMetrics} noValidate autoComplete="off" sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Weigh In Date"
            type="date"
            name="weighInDate"
            value={bodyMetrics.weighInDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Muscle Mass (%)"
            type="number"
            name="muscleMass"
            value={bodyMetrics.muscleMass}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Body Fat (%)"
            type="number"
            name="bodyFat"
            value={bodyMetrics.bodyFat}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Weight"
            type="number"
            name="weight"
            value={bodyMetrics.weight}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Weight Unit</InputLabel>
            <Select
              name="weightUnit"
              value={bodyMetrics.weightUnit}
              label="Weight Unit"
              onChange={handleChange}
            >
              <MenuItem value="kg">Kilograms</MenuItem>
              <MenuItem value="lbs">Pounds</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={handleAddBodyMetrics} variant="contained" sx={{ mb: 2 }}>
            Add
          </Button>

          {/* Unified Table for displaying added body metrics */}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Weigh In Date</TableCell>
                  <TableCell align="right">Muscle Mass (%)</TableCell>
                  <TableCell align="right">Body Fat (%)</TableCell>
                  <TableCell align="right">Weight</TableCell>
                  <TableCell align="right">Unit</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addedBodyMetrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell>{metric.weighInDate}</TableCell>
                    <TableCell align="right">{metric.muscleMass}</TableCell>
                    <TableCell align="right">{metric.bodyFat}</TableCell>
                    <TableCell align="right">{metric.weight}</TableCell>
                    <TableCell align="right">{metric.weightUnit}</TableCell>
                    <TableCell align="right">
                      <Button onClick={() => handleEditBodyMetrics(index)} size="small" variant="outlined" color="primary" sx={{ marginRight: '8px' }}>Edit</Button>
                      <Button onClick={() => handleDeleteBodyMetrics(index)} size="small" variant="outlined" color="secondary">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

         
        </Box>
        <Button onClick={handleSubmit} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Submit
          </Button>
      </Box>
    </Container>
  );
}

export default BodyMetricsLogs;
