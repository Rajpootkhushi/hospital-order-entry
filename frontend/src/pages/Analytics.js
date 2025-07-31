import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  People as PeopleIcon,
  MedicalServices as MedicalIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend === 'up' ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                >
                  {trendValue}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="tomorrow">Tomorrow</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={analytics.totalPatients || 0}
            icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
            color="primary"
            trend="up"
            trendValue={analytics.patientGrowth || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Doctors"
            value={analytics.activeDoctors || 0}
            icon={<MedicalIcon sx={{ color: 'secondary.main' }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={`Appointments (${timeRange === 'today' ? 'Today' : timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`}
            value={analytics.appointmentsToday || 0}
            icon={<ScheduleIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate (All Time)"
            value={`${analytics.completionRate || 0}%`}
            icon={<CheckCircleIcon sx={{ color: 'success.main' }} />}
            color="success"
            trend="up"
            trendValue={analytics.completionRateGrowth || 0}
          />
        </Grid>
      </Grid>

      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Patient Demographics */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Patient Demographics">
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="primary">
                      {analytics.patientDemographics?.male || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Male Patients
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="secondary">
                      {analytics.patientDemographics?.female || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Female Patients
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Age Distribution
                </Typography>
                <Grid container spacing={1}>
                  {analytics.ageDistribution?.map((ageGroup, index) => (
                    <Grid item xs={3} key={index}>
                      <Box textAlign="center">
                        <Typography variant="h6">
                          {ageGroup.count}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {ageGroup.range}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </ChartCard>
        </Grid>

        {/* All-Time Appointment Statistics */}
        <Grid item xs={12} md={6}>
          <ChartCard title="All-Time Appointment Statistics">
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="success.main">
                      {analytics.appointmentStats?.completed || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="error.main">
                      {analytics.appointmentStats?.cancelled || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Cancelled
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="warning.main">
                      {analytics.appointmentStats?.noShow || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      No Show
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="info.main">
                      {analytics.appointmentStats?.confirmed || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Confirmed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box textAlign="center" p={2} borderTop={1} borderColor="divider">
                    <Typography variant="h4" color="primary.main">
                      {analytics.appointmentStats?.scheduled || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Scheduled
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 