import * as React from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,  Box } from '@mui/material';

function FormDialog({ open, handleClose, handleEdit, bodyMetrics, handleChange }) {
  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Body Metrics</DialogTitle>
        <Box component="form" onSubmit={handleEdit} noValidate autoComplete="off" sx={{ mt: 3, px: 3, pb: 3 }}>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              name="weighInDate"
              label="Weigh In Date"
              type="date"
              fullWidth
              value={bodyMetrics.weighInDate || ''}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              margin="dense"
              name="muscleMass"
              label="Muscle Mass (%)"
              type="number"
              value={bodyMetrics.muscleMass || ''}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              margin="dense"
              name="bodyFat"
              label="Body Fat (%)"
              type="number"
              value={bodyMetrics.bodyFat || ''}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              margin="dense"
              name="weight"
              label="Weight"
              type="number"
              value={bodyMetrics.weight || ''}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save Changes</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}

export default FormDialog;
