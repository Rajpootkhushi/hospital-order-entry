import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  MedicalServices as MedicalIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import apiService from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    completedAppointments: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]); // New state for doctors

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patients, doctors, analytics, appointments] = await Promise.all([
        apiService.getPatients(),
        apiService.getDoctors(),
        apiService.getAnalytics(),
        apiService.getAppointments()
      ]);

      setStats({
        totalPatients: analytics.totalPatients || patients.length,
        totalDoctors: analytics.totalDoctors || doctors.length,
        totalAppointments: analytics.totalAppointments || appointments.length,
        completedAppointments: analytics.completedAppointments || appointments.filter(apt => apt.status === 'completed').length
      });

      setRecentPatients(patients.slice(-5).reverse());
      setRecentDoctors(doctors.slice(-5).reverse()); // Set recent doctors
      const upcoming = appointments
        .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={3} sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.main`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="primary.main">
          Welcome to the Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Overview of your clinic's activity and key metrics
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<PeopleIcon sx={{ color: '#fff', fontSize: 32 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Doctors"
            value={stats.totalDoctors}
            icon={<MedicalIcon sx={{ color: '#fff', fontSize: 32 }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed"
            value={stats.completedAppointments}
            icon={<CheckCircleIcon sx={{ color: '#fff', fontSize: 32 }} />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Patients */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                Recent Patients
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>S.No</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPatients.map((patient, index) => (
                      <TableRow key={patient._id || patient.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            #{index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: 'primary.light' }}>
                              <PersonIcon sx={{ color: 'primary.main' }} />
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {patient.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {patient.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={patient.status || 'Active'}
                            size="small"
                            color={patient.status === 'Active' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Active Doctors */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="secondary.main">
                Active Doctors
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>S.No</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Specialty</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentDoctors.map((doctor, index) => (
                      <TableRow key={doctor._id || doctor.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            #{index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: 'secondary.light' }}>
                              <MedicalIcon sx={{ color: 'secondary.main' }} />
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {doctor.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {doctor.specialty || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {doctor.phone || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doctor.status || 'Active'}
                            size="small"
                            color={doctor.status === 'Active' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 