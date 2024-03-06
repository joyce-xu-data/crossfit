import React, { useState, useEffect } from 'react';
import { Container, Typography, FormControl, InputLabel, Select,MenuItem } from '@mui/material';
import { useUser } from './UserContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Progress() {
    const {user} = useUser(); 
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [hasSubCategories, setHasSubCategories] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState('');
    const [workoutDetails, setWorkoutDetails] = useState(null);

   const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Weight',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  });

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

useEffect(() => {
  if (selectedWorkout) {
    fetch(`/api/workouts/${selectedWorkout}/chart-data`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => response.json())
    .then(setChartData) // Directly use the fetched chart data
    .catch(error => console.error("Failed to fetch chart data", error));
  }
}, [selectedWorkout]); // Re-fetch chart data when selectedWorkout changes


   return (
      <Container maxWidth="md">
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Hi, {user?.first_name ? user.first_name : 'Guest'}! Check out your Progress!
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

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Weight Progress Chart
      </Typography>
      <Line data={chartData} />

      </Container>
    );
  }


export default Progress;

