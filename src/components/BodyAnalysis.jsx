import React, { useState, useEffect } from 'react';
import { Container, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
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

function BodyAnalysis() {
    const { user } = useUser();
    // Exclude 'Weight' from the first dropdown menu options
    const metricsOptions = ['Muscle Mass', 'Body Fat'];
    const [selectedMetrics, setSelectedMetrics] = useState([]); // Initially empty, as 'Weight' is not an option here
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        fetch(`/api/bodymetrics/chart-data/${user.id}`)
            .then(response => response.json())
            .then(data => {
                setChartData({
                    ...chartData,
                    labels: data.labels,
                    datasets: data.datasets.map(dataset => ({
                        ...dataset,
                        borderColor: dataset.label === 'Muscle Mass' ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)',
                        tension: 0.1
                    }))
                });
            })
            .catch(error => {
                console.error('Error fetching chart data:', error);
            });
    }, [user.id]);

    const handleChangeMetrics = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedMetrics(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value
        );
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                Hi, {user?.first_name ? user.first_name : 'Guest'}! Check out your Progress!
            </Typography>
          


            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="metrics-select-label">Metrics (Muscle Mass/ Body Fat) </InputLabel>
                <Select
                    labelId="metrics-select-label"
                    id="metrics-select"
                    multiple
                    value={selectedMetrics}
                    onChange={handleChangeMetrics}
                    input={<OutlinedInput label="Metrics (Muscle Mass/ Body Fat)" />}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {metricsOptions.map((metric) => (
                        <MenuItem key={metric} value={metric}>
                            <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                            <ListItemText primary={metric} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedMetrics.length > 0 && (
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    Muscle Mass / Body Fat
                </Typography>
            )}
            {selectedMetrics.length > 0 && (
                <Line data={{
                    ...chartData,
                    datasets: chartData.datasets.filter(dataset => selectedMetrics.includes(dataset.label))
                }} />
            )}

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                 Weight 
            </Typography>
            <Line data={{
                ...chartData,
                datasets: chartData.datasets.map(dataset => ({
                    ...dataset,
                    borderColor: dataset.label === 'Weight' ? 'rgb(255, 159, 64)' : dataset.borderColor // Change the color for Weight in the second graph
                })).filter(dataset => dataset.label === 'Weight')
            }} />
        </Container>
    );
}

export default BodyAnalysis;
