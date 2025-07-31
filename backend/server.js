const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const corsOptions = require('./config/cors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import routes
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data for development when MongoDB is not available
const mockData = {
  patients: [
    { id: 1, name: 'John Doe', age: 35, gender: 'Male', phone: '555-0101', email: 'john@example.com', address: '123 Main St', visitCount: 3 },
    { id: 2, name: 'Jane Smith', age: 28, gender: 'Female', phone: '555-0102', email: 'jane@example.com', address: '456 Oak Ave', visitCount: 1 },
    { id: 3, name: 'Bob Johnson', age: 45, gender: 'Male', phone: '555-0103', email: 'bob@example.com', address: '789 Pine Rd', visitCount: 5 }
  ],
  doctors: [
    { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Cardiology', phone: '555-0201', email: 'sarah@hospital.com', experience: 8 },
    { id: 2, name: 'Dr. Michael Brown', specialization: 'Neurology', phone: '555-0202', email: 'michael@hospital.com', experience: 12 },
    { id: 3, name: 'Dr. Emily Davis', specialization: 'Pediatrics', phone: '555-0203', email: 'emily@hospital.com', experience: 6 }
  ],
  appointments: [
    { 
      id: 1, 
      patientId: { id: 1, name: 'John Doe' }, 
      doctorId: { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Cardiology' }, 
      date: '2024-01-15', 
      time: '09:00',
      type: 'consultation',
      status: 'completed',
      notes: 'Regular checkup'
    },
    { 
      id: 2, 
      patientId: { id: 2, name: 'Jane Smith' }, 
      doctorId: { id: 2, name: 'Dr. Michael Brown', specialization: 'Neurology' }, 
      date: '2024-01-16', 
      time: '14:30',
      type: 'follow_up',
      status: 'completed',
      notes: 'Follow-up appointment'
    },
    { 
      id: 3, 
      patientId: { id: 3, name: 'Bob Johnson' }, 
      doctorId: { id: 3, name: 'Dr. Emily Davis', specialization: 'Pediatrics' }, 
      date: '2024-01-17', 
      time: '11:00',
      type: 'consultation',
      status: 'completed',
      notes: 'Initial consultation'
    },
    { 
      id: 4, 
      patientId: { id: 1, name: 'John Doe' }, 
      doctorId: { id: 2, name: 'Dr. Michael Brown', specialization: 'Neurology' }, 
      date: '2024-01-18', 
      time: '10:00',
      type: 'consultation',
      status: 'confirmed',
      notes: 'Follow-up consultation'
    },
    { 
      id: 5, 
      patientId: { id: 2, name: 'Jane Smith' }, 
      doctorId: { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Cardiology' }, 
      date: '2024-01-19', 
      time: '15:00',
      type: 'consultation',
      status: 'cancelled',
      notes: 'Patient cancelled due to emergency'
    }
  ]
};

// Mock endpoints for development
app.get('/api/mock/patients', (req, res) => {
  res.json(mockData.patients);
});

app.get('/api/mock/doctors', (req, res) => {
  res.json(mockData.doctors);
});

app.get('/api/mock/analytics', (req, res) => {
  // Calculate appointment statistics from mock data
  const appointmentStats = {
    scheduled: mockData.appointments.filter(a => a.status === 'scheduled').length,
    confirmed: mockData.appointments.filter(a => a.status === 'confirmed').length,
    completed: mockData.appointments.filter(a => a.status === 'completed').length,
    cancelled: mockData.appointments.filter(a => a.status === 'cancelled').length,
    noShow: mockData.appointments.filter(a => a.status === 'no_show').length
  };

  res.json({
    totalPatients: mockData.patients.length,
    totalDoctors: mockData.doctors.length,
    totalAppointments: mockData.appointments.length,
    completedAppointments: appointmentStats.completed,
    appointmentStats: appointmentStats,
    totalVisits: mockData.patients.reduce((sum, p) => sum + p.visitCount, 0),
    recentVisits: mockData.patients.slice(0, 5)
  });
});

app.get('/api/mock/appointments', (req, res) => {
  res.json(mockData.appointments);
});

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState === 1) {
      // Test creating a simple document
      const Patient = require('./models/Patient');
      const testPatient = new Patient({
        name: 'Test Patient',
        email: 'test@example.com',
        phone: '123-456-7890'
      });
      
      // Don't actually save, just validate
      const validationError = testPatient.validateSync();
      if (validationError) {
        return res.json({ 
          status: 'ERROR', 
          message: 'Model validation failed', 
          error: validationError.message 
        });
      }
      
      res.json({ 
        status: 'OK', 
        message: 'Database connection and model validation successful',
        dbState: mongoose.connection.readyState,
        dbName: mongoose.connection.name
      });
    } else {
      res.json({ 
        status: 'ERROR', 
        message: 'Database not connected',
        dbState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.json({ 
      status: 'ERROR', 
      message: 'Database test failed', 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});