import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

function Logs() {
  const [workoutLog, setWorkoutLog] = useState({
    workoutDate: '',
    soloPartner:'',
    workoutType:'',
    rxscaled: '',
    workoutId: '',
    quantity:'',
    scoreMetrics: '',
    score: '',
    notes: '',
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkouts] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setWorkoutLog({
      ...workoutLog,
      [name]: value,
    });
  };

useEffect(() => {
  fetch('/api/categories')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => setCategories(data))
    .catch(error => console.error("Failed to fetch categories:", error));
}, []);

useEffect(() => {
  if (selectedCategory) {
    fetch(`/api/categories/${selectedCategory}/subcategories`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setSubCategories(data))
      .catch(error => console.error("Failed to fetch sub-categories:", error));
  }
}, [selectedCategory]);

useEffect(() => {
  if (selectedSubCategory) {
    fetch(`/api/subcategories/${selectedSubCategory}/workouts`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setWorkouts(data))
      .catch(error => console.error("Failed to fetch exercises:", error));
  }
}, [selectedSubCategory]);


  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    // Reset sub-categories and exercises when category changes
    setSubCategories([]);
    setSelectedSubCategory('');
    setWorkouts([]);
    setSelectedWorkouts('');
  };

  const handleSubCategoryChange = (event) => {
    setSelectedSubCategory(event.target.value);
    // Reset exercises when sub-category changes
    setWorkouts([]);
    setSelectedWorkouts('');
  };

  const handleWorkoutChange = (event) => {
    setSelectedWorkouts(event.target.value);
  };

 const handleSubmit = (event) => {
  event.preventDefault();
  // Construct the log object with necessary data
  const logData = { ...workoutLog, workoutId: selectedWorkout };

  fetch('/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    // Handle the successful submission
    console.log('Log submitted:', data);
  })
  .catch(error => {
    // Handle the submission error
    console.error("Failed to submit log:", error);
  });
};

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{  mt: 4,mb: 2 }}>
        Log Your Workout
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Workout Date"
          type="date"
          name="workoutDate"
          value={workoutLog.workoutDate}
          onChange={handleChange}
          sx={{ mb: 2 }}
          InputLabelProps={{
            shrink: true,
          }}
        />

          <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>WOD - Solo/Partner</InputLabel>
          <Select
            name="soloPartner"
            value={workoutLog.soloPartner}
            label="Solo/Partner"
            onChange={handleChange}
          >
            <MenuItem value="Solo">Solo</MenuItem>
            <MenuItem value="Partner">Partner</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>WOD Type</InputLabel>
          <Select
            name="workoutType"
            value={workoutLog.workoutType}
            label="Score Metrics"
            onChange={handleChange}
          >
            <MenuItem value="forTime">For Time</MenuItem>
            <MenuItem value="AMRAP">AMRAP</MenuItem>
            <MenuItem value="EMOM">EMOM</MenuItem>
            <MenuItem value="Chipper">Chipper</MenuItem>
          </Select>
        </FormControl>
        
         <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Score Metrics</InputLabel>
          <Select
            name="scoreMetrics"
            value={workoutLog.scoreMetrics}
            label="Score Metrics"
            onChange={handleChange}
          >
            <MenuItem value="Load">Load</MenuItem>
            <MenuItem value="Time">Time</MenuItem>
            <MenuItem value="Reps">Reps</MenuItem>
            <MenuItem value="roundsReps">Rounds + Reps</MenuItem>

          </Select>
        </FormControl>

         <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Rx/Scaled</InputLabel>
          <Select
            name="rxscaled"
            value={workoutLog.rxscaled}
            label="Rx/Scaled"
            onChange={handleChange}
          >
            <MenuItem value="Rx">Rx</MenuItem>
            <MenuItem value="Scaled">Scaled</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select value={selectedCategory} label="Category" onChange={handleCategoryChange}>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
          <InputLabel>Sub-Category</InputLabel>
          <Select value={selectedSubCategory} label="Sub-Category" onChange={handleSubCategoryChange}>
            {subCategories.map((subCategory) => (
              <MenuItem key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
       

        <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedSubCategory}>
          <InputLabel>Workout</InputLabel>
          <Select value={selectedWorkout} label="Workout" onChange={handleWorkoutChange}>
            {workouts.map((workout) => (
              <MenuItem key={workout.id} value={workout.id}>
                {workout.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Quantity"
          name="qty"
          value={workoutLog.qty}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
       
        <TextField
          fullWidth
          label="Score"
          name="score"
          value={workoutLog.score}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Notes"
          name="notes"
          value={workoutLog.notes}
          multiline
          rows={4}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Box>
    </Container>
  );
}

export default Logs;

