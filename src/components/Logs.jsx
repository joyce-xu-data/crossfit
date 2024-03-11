import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Button, FormControl, InputLabel, Select, MenuItem, Box, List, ListItem,ListItemText} from '@mui/material';
import { useUser } from './UserContext';



function Logs() {
  const { user } = useUser();
  console.log(user)
 const [workoutLog, setWorkoutLog] = useState({
  workoutDate: '', 
  strengthOrWOD: '',
  strengthWork: '',
  soloPartner: '',
  workoutType: '', 
  rxscaled: '',
  workoutId: null, // Assuming this is a numeric ID, can be null if not set
  qty: 0, // Initialize as null and set to an integer when user inputs a value
  scoreMetrics: '',
  weight: 0, // Initialize as null and set to an integer or float when user inputs a value
  weightUnit: 'kg', // Default to kilograms
  minutes: 0, // Use null or 0 if you want a numeric default
  seconds: 0, // Use null or 0 if you want a numeric default
  reps: 0, // Use null or 0 if you want a numeric default
  rounds: 0, // Use null or 0 if you want a numeric default
  notes: '',
});


  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [hasSubCategories, setHasSubCategories] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState('');
   // Additional state for the list of added workouts
  const [addedWorkouts, setAddedWorkouts] = useState([]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setWorkoutLog({
      ...workoutLog,
      [name]: value,
    });
  };

  console.log(workoutLog);


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
      .then(data => {
        setSubCategories(data);
        setHasSubCategories(data.length > 0);
        if (data.length === 0) {
          // Call the function to fetch workouts if there are no subcategories
          fetchWorkoutsForCategory(selectedCategory);
        }
      })
      .catch(error => console.error("Failed to fetch sub-categories:", error));
  } else {
    // If no category is selected, ensure sub-categories are cleared out
    setSubCategories([]);
    setHasSubCategories(false);
    // Also clear out workouts if there's no selected category
    setWorkouts([]);
  }
}, [selectedCategory]);


useEffect(() => {
  if (selectedSubCategory) {
    fetchWorkoutsForSubCategory(selectedSubCategory);
  }
}, [selectedSubCategory]);

// Helper function to fetch workouts for a category
const fetchWorkoutsForCategory = (categoryId) => {
  fetch(`/api/categories/${categoryId}/workouts`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => setWorkouts(data))
    .catch(error => console.error("Failed to fetch workouts for category:", error));
};

// Helper function to fetch workouts for a sub-category
const fetchWorkoutsForSubCategory = (subCategoryId) => {
  fetch(`/api/subcategories/${subCategoryId}/workouts`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => setWorkouts(data))
    .catch(error => console.error("Failed to fetch workouts for sub-category:", error));
};

const handleCategoryChange = (event) => {
  const newCategory = event.target.value;
  setSelectedCategory(newCategory);
  // Reset sub-categories and workouts when category changes
  setSubCategories([]);
  setSelectedSubCategory('');
  setWorkouts([]);
  setSelectedWorkout('');
  // Directly fetch workouts if this category has no sub-categories
  fetch(`/api/categories/${newCategory}/subcategories`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        fetchWorkoutsForCategory(newCategory);
      }
    })
    .catch(error => console.error("Failed to check for sub-categories:", error));
};

  const handleSubCategoryChange = (event) => {
    setSelectedSubCategory(event.target.value);
    // Reset exercises when sub-category changes
    setWorkouts([]);
    setSelectedWorkout('');
  };

  const handleWorkoutChange = (event) => {
    setSelectedWorkout(event.target.value);
  };
  console.log(selectedWorkout)


  const handleAddWorkout = (event) => {
    event.preventDefault();
    const newWorkout = {
      ...workoutLog,
      workoutId: selectedWorkout,
      workoutName: workouts.find(w => w.id === selectedWorkout)?.name || '', // Optional: Add workout name for display
    };
    setAddedWorkouts([...addedWorkouts, newWorkout]);
    // Optionally reset the workoutLog or just the quantity field if you want to keep the rest of the fields for a new entry
    setWorkoutLog({ ...workoutLog, qty: '' });
  };

  // Function to delete a workout from the added workouts list
  const handleDeleteWorkout = (index) => {
  const updatedWorkouts = addedWorkouts.filter((_, i) => i !== index);
  setAddedWorkouts(updatedWorkouts);
  };

// Function to put a workout into edit mode
  const handleEditWorkout = (index) => {
  // Set the workoutLog to the workout that needs to be edited
  const workoutToEdit = addedWorkouts[index];
  setWorkoutLog(workoutToEdit);
  // Remove this workout from the list
  handleDeleteWorkout(index);
  };

const handleFinalSubmit = () => {
  // Construct the array of log entries to submit
  const logEntries = addedWorkouts.map(workout => ({
   workoutDate: workout.workoutDate,
  strengthOrWOD: workout.strengthOrWOD,
  strengthWork: workout.strengthWork,
  soloPartner: workout.soloPartner,
  workoutType: workout.workoutType,
  rxscaled: workout.rxscaled,
  workoutId: workout.workoutId,
  qty: workout.qty ? Number(workout.qty) : null,
  scoreMetrics: workout.scoreMetrics,
  weight: workout.weight ? Number(workout.weight) : null,
  weightUnit: workout.weightUnit,
  minutes: workout.minutes ? Number(workout.minutes) : null,
  seconds: workout.seconds ? Number(workout.seconds) : null,
  reps: workout.reps ? Number(workout.reps) : null,
  rounds: workout.rounds ? Number(workout.rounds) : null,
  }));

   const logData = {
    logEntries: logEntries,
    notes: workoutLog.notes,
  };

  const token = localStorage.getItem('token'); // Retrieve the token from wherever it's stored


  fetch('/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(logData,token),
 
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
    // Optionally clear the addedWorkouts and reset the form
    setAddedWorkouts([]);
    setWorkoutLog({
      workoutDate: '', 
      strengthOrWOD: '',
      strengthWork: '',
      soloPartner: '',
      workoutType: '', 
      rxscaled: '',
      workoutId: null, // Assuming this is a numeric ID, can be null if not set
      qty: 0, // Initialize as null and set to an integer when user inputs a value
      scoreMetrics: '',
      weight: 0, // Initialize as null and set to an integer or float when user inputs a value
      weightUnit: 'kg', // Default to kilograms
      minutes: 0, // Use null or 0 if you want a numeric default
      seconds: 0, // Use null or 0 if you want a numeric default
      reps: 0, // Use null or 0 if you want a numeric default
      rounds: 0, // Use null or 0 if you want a numeric default
      notes: '',
    });
  })
  .catch(error => {
    // Handle the submission error
    console.error("Failed to submit log:", error);
  });
   
};


  return (
    <Container maxWidth="sm">
      <Typography variant="h5" sx={{  mt: 4,mb: 2 }}>
       Hi, {user?.first_name ? user.first_name : 'Guest'}! You may log your workout
    
      </Typography>
      <Box component="form" onSubmit={handleAddWorkout} noValidate autoComplete="off">
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
          <InputLabel>Strength/WOD</InputLabel>
          <Select
            name="strengthOrWOD"
            value={workoutLog.strengthOrWOD}
            label="Strength or WOD"
            onChange={handleChange}
          >
            <MenuItem value="Strength">Strength</MenuItem>
            <MenuItem value="WOD">WOD</MenuItem>
          </Select>
        </FormControl>

           {/* Conditional Rendering for Strength or WOD */}
        {workoutLog.strengthOrWOD === 'Strength' && (
          // Render Strength-specific fields
          <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Type of Strength Work</InputLabel>
          <Select
            name="strengthWork"
            value={workoutLog.strengthWork}
            label="Strength Work"
            onChange={handleChange}
          >
             <MenuItem value="repMax">1/3/5/10 Rep(s) Max</MenuItem>
             <MenuItem value="forLoad">For Load</MenuItem>
            <MenuItem value="roundsTimeCap">Rounds with Time Cap</MenuItem>
            <MenuItem value="EMOM">EMOM</MenuItem>
            <MenuItem value="AMRAP">AMRAP</MenuItem>
          </Select>
        </FormControl>
          
        )}

        {workoutLog.strengthOrWOD === 'WOD' && (
          // Render WOD-specific fields
          <>
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
        
          </>
        )}

        {/* Only show Rx/Scaled if WOD is selected or Strength is selected but not for 1 Rep Max */}
        {(workoutLog.strengthOrWOD === 'WOD' || (workoutLog.strengthOrWOD === 'Strength' && workoutLog.strengthWork !== 'repMax')) && (
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
        )}

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

      {hasSubCategories && (
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
          <InputLabel>Sub-Category</InputLabel>
          <Select value={selectedSubCategory} label="Sub-Category" onChange={handleSubCategoryChange}>
          {subCategories.length === 0 ? (
            <MenuItem disabled>No sub-categories available</MenuItem>
          ) : (
            subCategories.map((subCategory) => (
              <MenuItem key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </MenuItem>
            ))
          )}
          </Select>
         </FormControl>
        )}


        <FormControl fullWidth sx={{ mb: 2 }} disabled={(hasSubCategories && !selectedSubCategory)}>
          <InputLabel>Workout</InputLabel>
          <Select value={selectedWorkout} label="Workout" onChange={handleWorkoutChange}>
            {workouts.map((workout) => (
              <MenuItem key={workout.id} value={workout.id}>
                {workout.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Quantity"
          name="qty"
          value={workoutLog.qty}
          onChange={handleChange}
          sx={{ mb: 2 }}
        /></FormControl>

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

        {/* Conditional rendering based on the selected score metric */}
{workoutLog.scoreMetrics === 'Load' && (
  <>
    <TextField
      fullWidth
      label="Weight"
      name="weight"
      value={workoutLog.weight}
      onChange={handleChange}
      sx={{ mb: 2 }}
    />
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Weight Unit</InputLabel>
      <Select
        name="weightUnit"
        value={workoutLog.weightUnit}
        label="Weight Unit"
        onChange={handleChange}
      >
        <MenuItem value="kg">Kilograms</MenuItem>
        <MenuItem value="lbs">Pounds</MenuItem>
      </Select>
    </FormControl>
  </>
)}

{workoutLog.scoreMetrics === 'Time' && (
  <Box sx={{ display: 'flex', gap: 2 }}>
    <TextField
      label="Minutes"
      type="number"
      name="minutes"
      value={workoutLog.minutes}
      onChange={handleChange}
      sx={{ mb: 2, width: '50%' }}
    />
    <TextField
      label="Seconds"
      type="number"
      name="seconds"
      value={workoutLog.seconds}
      onChange={handleChange}
      sx={{ mb: 2, width: '50%' }}
    />
  </Box>
)}

{workoutLog.scoreMetrics === 'Reps' && (
  <TextField
    fullWidth
    label="Reps"
    type="number"
    name="reps"
    value={workoutLog.reps}
    onChange={handleChange}
    sx={{ mb: 2 }}
  />
)}

{workoutLog.scoreMetrics === 'roundsReps' && (
  <>
    <TextField
      fullWidth
      label="Rounds"
      name="rounds"
      value={workoutLog.rounds}
      onChange={handleChange}
      sx={{ mb: 2 }}
    />
      <TextField
      fullWidth
      label="Reps"
      name="reps"
      value={workoutLog.reps}
      onChange={handleChange}
      sx={{ mb: 2 }}
    />
  </>
)}
         <Button type="submit" variant="contained"    sx={{ mb: 2 }}>
          Add Workout
        </Button>

         {/* List of added workouts */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Added Workouts
      </Typography>

    <List>
  {addedWorkouts.map((workout, index) => {
    // Initialize a variable to hold the formatted score
    let formattedScore = '';

    // Determine how to format the score based on the workout's scoreMetrics
    switch (workout.scoreMetrics) {
      case 'Load':
        formattedScore = `${workout.weight} ${workout.weightUnit}`;
        break;
      case 'Time':
        // Assuming workout.minutes and workout.seconds are stored appropriately
        const minutes = workout.minutes.toString().padStart(2, '0'); // ensure two digits
        const seconds = workout.seconds.toString().padStart(2, '0'); // ensure two digits
        formattedScore = `${minutes} mins :${seconds} s`;
        break;
      case 'Reps':
        formattedScore = `${workout.reps} reps`;
        break;
      case 'roundsReps':
        formattedScore = `${workout.rounds} rounds + ${workout.reps} reps`;
        break;
      default:
        formattedScore = 'Not available'; // Handle the case where scoreMetrics doesn't match any case
        break;
    }

    return (
      <ListItem key={index} secondaryAction={
        <>
          <Button onClick={() => handleEditWorkout(index)}>Edit</Button>
          <Button onClick={() => handleDeleteWorkout(index)}>Delete</Button>
        </>
      }>
        <ListItemText primary={`${workout.workoutName} - Qty: ${workout.qty}, Score: ${formattedScore}`} />
      </ListItem>
    );
  })}
</List>

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
         <Button variant="contained" color="primary" onClick={handleFinalSubmit}>
          Submit All Workouts
        </Button>
      </Box>
    </Container>
  );
        }
export default Logs;