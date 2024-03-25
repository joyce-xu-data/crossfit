import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useUser } from './UserContext';
import AlertDialog from './AlertDialog';
import FormDialog from './FormDialog';

function ViewAllBodyMetrics() {
    const { user } = useUser();
    const [tableData, setTableData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null); // State to hold the selected item's ID
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [bodyMetrics, setBodyMetrics] = useState({
              weighInDate: '',
              muscleMass: '',
              bodyFat: '',
              weight: '',
              
            });

    const handleDeleteClick = (id) => {
      setSelectedId(id);// Set the selected item ID
      console.log('deleteid', id)
      setOpenDialog(true);// Open the dialog
    };

    const handleClose = () => { 
      setOpenDialog(false);
    };
  
    const handleConfirmDelete = () => {
      fetch(`/api/bodymetrics/delete/${selectedId}`, { method: 'DELETE' })
        .then(() => {
          setTableData(currentData => currentData.filter(item => item.id !== selectedId));
          console.log(selectedId)
          setOpenDialog(false); // Close the dialog upon successful deletion
        })
        .catch(error => {
          console.error('Error deleting data:', error);
        });
    };

     // A function to convert date format from "MM/DD/YYYY" to "YYYY-MM-DD"
     const formatDateToYYYYMMDD = (dateStr) => {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Ensures month and day are 2 digits
    };


    const handleEditClick = (id) => {
      console.log(id); // Log the received ID
      const item = tableData.find(row => row.id === id); // Find the item by ID
    
      if (item) {
        setSelectedId(id); // Set the selected item's ID
        // Pre-populate the form with the item's current data
        setBodyMetrics({
          weighInDate: formatDateToYYYYMMDD(item.date),
          muscleMass: item.muscleMass,
          bodyFat: item.bodyFat,
          weight: item.weight,
        });
        setEditDialogOpen(true); // Open the edit dialog
      } else {
        console.error('Item not found for ID:', id);
        // Handle the case where the item is not found, if necessary
      }
    };
    
    const token = localStorage.getItem('token'); // remember to have this to persist the sessions 

    const handleEdit = (event) => {
      event.preventDefault(); // Ensure the form's default submission is prevented.
      const updatePayload = { ...bodyMetrics }; // Assuming this includes all needed data.

      console.log(updatePayload)
    
      fetch(`/api/bodymetrics/update/${selectedId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
  
      .then(data => {
        setTableData(data);
        setEditDialogOpen(false); // Close the dialog upon successful update.
      })
      .catch(error => {
        console.error('Error updating data:', error);
      });
    };
    

    const handleChange = (event) => {
      const { name, value } = event.target;
      
      // Check if the changed field is the weighInDate and log the value
      if (name === 'weighInDate') {
        console.log('Weigh-In Date Changed:', value);
      }
    
      setBodyMetrics(prevMetrics => ({
        ...prevMetrics,
        [name]: value
      }));
    };
    
    useEffect(() => {
      fetch(`/api/bodymetrics/log-data/${user.id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
              console.log('Fetched data:', data);
              // Only update tableData if data is indeed an array
              if (Array.isArray(data)) {
                setTableData(data);
              } else {
                console.error('Fetched data is not an array:', data);
                setTableData([]); // Optionally reset tableData or handle this case differently
              }
          })
          .catch(error => {
              console.error('Error fetching data:', error);
              setTableData([]); // Ensure tableData is always an array
          });
    }, [user.id]);
    
  
 
    return (
      <Container maxWidth="md">
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              Hi, {user?.first_name ? user.first_name : 'Guest'}! Check out your Progress!
          </Typography>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Muscle Mass / Body Fat Data
          </Typography>
          <TableContainer component={Paper}>
              <Table>
                  <TableHead>
                      <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Muscle Mass</TableCell>
                          <TableCell align="right">Body Fat</TableCell>
                          <TableCell align="right">Weight</TableCell>
                          <TableCell align="right">Actions</TableCell> 
                      </TableRow>
                  </TableHead>
                  <TableBody>
                          {tableData.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell component="th" scope="row">{row.date}</TableCell>
                              <TableCell align="right">{row.muscleMass ?? 'N/A'}</TableCell>
                              <TableCell align="right">{row.bodyFat ?? 'N/A'}</TableCell>
                              <TableCell align="right">{row.weight ?? 'N/A'}</TableCell>
                              <TableCell align="right">
                                <button onClick={() => handleDeleteClick(row.id)}>Delete</button>
                                <button onClick={() => handleEditClick(row.id)}>Edit</button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
              </Table>
          </TableContainer>
          <AlertDialog open={openDialog} handleClose={handleClose} handleConfirm={handleConfirmDelete} />
          <FormDialog
              open={editDialogOpen}
              handleClose={() => setEditDialogOpen(false)}
              handleEdit={handleEdit}
              bodyMetrics={bodyMetrics}
              handleChange={handleChange}
            />
      </Container>
  );
}

export default ViewAllBodyMetrics;
