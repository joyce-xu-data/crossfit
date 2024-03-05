  import React, { useState, useEffect } from 'react';
  import { Container, Typography, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, AlertTitle } from '@mui/material';
  import { useUser } from './UserContext';

  function Milestone() {
    const {user} = useUser(); 
     console.log(user, user.first_name)
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [hasSubCategories, setHasSubCategories] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState('');
    const [maxWeights, setMaxWeights] = useState({
      max_weight_qty_1: 'N/A',
      max_weight_qty_3: 'N/A',
      max_weight_qty_5: 'N/A',
      max_weight_qty_10: 'N/A',
    });

    const [workoutDetails, setWorkoutDetails] = useState(null);

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

  useEffect(() => {
  if (selectedWorkout) {
    fetch(`/api/workouts//${selectedWorkout}/details`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
   .then(data => {
      if (data.length === 0) { // Assuming the response is an array
        // Handle the case where no data is found
        console.log(`No data found for workoutId ${selectedWorkout}`);
        setWorkoutDetails(null); // or set to a specific "no data" state
        // Optionally, set a flag or update maxWeights to indicate no data was found
      } else {
        // Proceed as normal
        setWorkoutDetails(data);
      }
    })
   
    .catch(error => {
      console.error("Failed to fetch workout details", error);
      // Optionally reset workoutDetails or handle error
      setWorkoutDetails(null);
    });
  } else {
    // Reset workoutDetails if there's no selected workout
    setWorkoutDetails(null);
  }
}, [selectedWorkout]); // Depend on selectedWorkout to re-run this effect


useEffect(() => {
  // Reset maxWeights whenever selectedWorkout changes
  setMaxWeights({
    max_weight_qty_1: null,
    max_weight_qty_3: null,
    max_weight_qty_5: null,
    max_weight_qty_10: null,
  });

  if (selectedWorkout) {
    
    fetch(`/api/workouts/${selectedWorkout}/maxweight`, {
       headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update state with the fetched max weights for each quantity
      setMaxWeights({
        max_weight_qty_1: data.max_weight_qty_1 || 'N/A', // Use 'N/A' if null
        max_weight_qty_3: data.max_weight_qty_3 || 'N/A',
        max_weight_qty_5: data.max_weight_qty_5 || 'N/A',
        max_weight_qty_10: data.max_weight_qty_10 || 'N/A',
      });
    })
    .catch(error => {
      console.error("Failed to fetch max weight", error);
      // Optionally handle error state
    });
  }
}, [selectedWorkout]); // Depend on selectedWorkout to re-run this effect


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


      const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

    // Example function to render table. Modify according to your actual data structure
const renderWorkoutTable = () => {
  const selectedWorkoutData = workouts.find(workout => workout.id === selectedWorkout);
  if (!selectedWorkout || workoutDetails === null) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        We couldn't find any recorded workouts matching your selection.
      </Alert>
    );
  }

  return (
   <TableContainer component={Paper}>
  <Table sx={{ minWidth: 700 }} aria-label="simple table">
    <TableHead>
      <TableRow>
        <TableCell>Date</TableCell>
        <TableCell>Workout</TableCell>
        <TableCell>1 Rep Max</TableCell>
        <TableCell>3 Rep Max</TableCell>
        <TableCell>5 Rep Max</TableCell>
        <TableCell>10 Rep Max</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {selectedWorkoutData && (
        <TableRow key={selectedWorkoutData.id}>
          <TableCell>{formatDate(workoutDetails.workoutdate)}</TableCell>
          <TableCell>{selectedWorkoutData.name}</TableCell>
          <TableCell>{maxWeights.max_weight_qty_1} kg</TableCell>
          <TableCell>{maxWeights.max_weight_qty_3} kg</TableCell>
          <TableCell>{maxWeights.max_weight_qty_5} kg</TableCell>
          <TableCell>{maxWeights.max_weight_qty_10} kg</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
  );
};

    return (
      <Container maxWidth="md">
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Hi, {user?.first_name ? user.first_name : 'Guest'}! Time to celebrate your milestone!
        </Typography>
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
    

        {/* Render the workout table */}
    
        {renderWorkoutTable()}
      </Container>
    );
  }

  export default Milestone;
