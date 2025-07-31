const express = require('express');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    // For each doctor, calculate totalPatients and totalVisits
    const Appointment = require('../models/Appointment');
    const doctorStats = await Promise.all(doctors.map(async (doctor) => {
      const appointments = await Appointment.find({ doctorId: doctor._id });
      const totalVisits = appointments.length;
      const uniquePatientIds = new Set(appointments.map(a => String(a.patientId)));
      const totalPatients = uniquePatientIds.size;
      return {
        ...doctor.toObject(),
        totalPatients,
        totalVisits
      };
    }));
    res.json(doctorStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    // Calculate totalPatients and totalVisits for this doctor
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({ doctorId: doctor._id });
    const totalVisits = appointments.length;
    const uniquePatientIds = new Set(appointments.map(a => String(a.patientId)));
    const totalPatients = uniquePatientIds.size;
    // Get patients treated by this doctor
    const patients = await Patient.find({
      'treatedBy.doctorId': req.params.id
    }).populate('treatedBy.doctorId', 'name specialty');
    res.json({ doctor: { ...doctor.toObject(), totalPatients, totalVisits }, patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new doctor
router.post('/', async (req, res) => {
  try {
    console.log('Creating new doctor with data:', req.body);
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    console.log('Doctor created successfully:', savedDoctor);
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update doctor
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating doctor with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, treating as mock data update');
      // For mock data, return the updated data without saving to DB
      return res.json({
        id: req.params.id,
        ...req.body,
        updatedAt: new Date().toISOString()
      });
    }
    
    // Try to find and update the doctor in MongoDB
    let doctor;
    
    // First try to find by ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    // If not found by ObjectId, try to find by a custom field or create new
    if (!doctor) {
      console.log('Doctor not found by ObjectId, checking if it exists by other criteria');
      
      // Try to find by name and email combination
      const existingDoctor = await Doctor.findOne({
        name: req.body.name,
        email: req.body.email
      });
      
      if (existingDoctor) {
        // Update the existing doctor
        doctor = await Doctor.findByIdAndUpdate(
          existingDoctor._id,
          req.body,
          { new: true, runValidators: true }
        );
        console.log('Updated existing doctor found by name/email:', doctor);
      } else {
        // Create a new doctor in the database
        console.log('Creating new doctor in database from update request');
        const newDoctor = new Doctor(req.body);
        doctor = await newDoctor.save();
        console.log('New doctor created from update:', doctor);
      }
    }
    
    if (!doctor) {
      console.log('Failed to update or create doctor');
      return res.status(404).json({ message: 'Doctor not found and could not be created' });
    }
    
    console.log('Doctor updated/created successfully:', doctor);
    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, treating as mock data delete');
      // For mock data, return success without deleting from DB
      return res.json({ message: 'Doctor deleted successfully' });
    }
    
    // Try to find and delete the doctor in MongoDB
    let doctor;
    
    // First try to find by ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      doctor = await Doctor.findByIdAndDelete(req.params.id);
    }
    
    // If not found by ObjectId, try to find by name and email
    if (!doctor) {
      console.log('Doctor not found by ObjectId, checking if it exists by other criteria');
      
      // Try to find by name and email combination
      const existingDoctor = await Doctor.findOne({
        name: req.body?.name || 'Unknown',
        email: req.body?.email || 'unknown@example.com'
      });
      
      if (existingDoctor) {
        doctor = await Doctor.findByIdAndDelete(existingDoctor._id);
        console.log('Deleted existing doctor found by name/email');
      }
    }
    
    if (!doctor) {
      console.log('Doctor not found for deletion');
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    console.log('Doctor deleted successfully');
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get doctor statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get patients treated by this doctor
    const patients = await Patient.find({
      'treatedBy.doctorId': req.params.id
    });
    
    const totalPatients = patients.length;
    const totalTreatments = patients.reduce((sum, patient) => {
      return sum + patient.treatedBy.filter(treatment => 
        treatment.doctorId.toString() === req.params.id
      ).length;
    }, 0);
    
    // Monthly statistics for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthlyTreatments = patients.reduce((sum, patient) => {
        return sum + patient.treatedBy.filter(treatment => {
          const treatmentDate = new Date(treatment.treatmentDate);
          return treatment.doctorId.toString() === req.params.id &&
                 treatmentDate >= startOfMonth && treatmentDate <= endOfMonth;
        }).length;
      }, 0);
      
      monthlyStats.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        treatments: monthlyTreatments
      });
    }
    
    res.json({
      totalPatients,
      totalTreatments,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 