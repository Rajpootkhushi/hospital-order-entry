import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import apiService from '../services/api';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.request(`/patients/${id}`)
      .then(setPatient)
      .catch(() => setPatient(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box p={3}><CircularProgress /></Box>;
  if (!patient) return <Box p={3}><Typography>Patient not found.</Typography></Box>;

  // Prepare visit dates for calendar
  const visitDates = (patient.visits || []).map(date => new Date(date));
  const lastVisit = patient.lastVisit ? new Date(patient.lastVisit) : null;

  return (
    <>
      <style>{`
        .visit-day {
          background-color: #a2d2ff !important;
          border-radius: 50%;
        }
      `}</style>
      <Box p={3}>
        <Button variant="outlined" onClick={() => navigate('/patients')}>Back to Patients</Button>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h4">{patient.name}</Typography>
          <Typography>Email: {patient.email}</Typography>
          <Typography>Phone: {patient.phone}</Typography>
          <Typography>Gender: {patient.gender}</Typography>
          <Typography>Date of Birth: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</Typography>
          <Typography>Status: {patient.status}</Typography>
          <Typography>Address: {patient.address}</Typography>
          <Typography>Medical History: {patient.medicalHistory}</Typography>
          {/* Add more fields as needed */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>Visit Calendar</Typography>
            {visitDates.length > 0 ? (
              <Calendar
                value={lastVisit}
                tileClassName={({ date }) =>
                  visitDates.some(vd =>
                    vd.getFullYear() === date.getFullYear() &&
                    vd.getMonth() === date.getMonth() &&
                    vd.getDate() === date.getDate()
                  ) ? 'visit-day' : null
                }
              />
            ) : (
              <Typography color="textSecondary">No visits recorded yet.</Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default PatientDetails; 