// const express = require('express');
// const Patient = require('../models/Patient');
// const Doctor = require('../models/Doctor');
// const router = express.Router();

// // Get all patients
// router.get('/', async (req, res) => {
//   try {
//     const patients = await Patient.find().populate('treatedBy.doctorId', 'name specialty');
//     res.json(patients);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get patient by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.params.id).populate('treatedBy.doctorId', 'name specialty');
//     if (!patient) {
//       return res.status(404).json({ message: 'Patient not found' });
//     }
//     res.json(patient);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Create new patient
// router.post('/', async (req, res) => {
//   try {
//     console.log('Creating new patient with data:', req.body);
//     const patient = new Patient(req.body);
//     const savedPatient = await patient.save();
//     console.log('Patient created successfully:', savedPatient);
//     res.status(201).json(savedPatient);
//   } catch (error) {
//     console.error('Error creating patient:', error);
//     res.status(400).json({ message: error.message });
//   }
// });

// // Update patient
// router.put('/:id', async (req, res) => {
//   try {
//     console.log('Updating patient with ID:', req.params.id);
//     console.log('Update data:', req.body);
    
//     // Check if MongoDB is connected
//     const mongoose = require('mongoose');
//     if (mongoose.connection.readyState !== 1) {
//       console.log('MongoDB not connected, treating as mock data update');
//       // For mock data, return the updated data without saving to DB
//       return res.json({
//         id: req.params.id,
//         ...req.body,
//         updatedAt: new Date().toISOString()
//       });
//     }
    
//     // Try to find and update the patient in MongoDB
//     let patient;
    
//     // First try to find by ObjectId
//     if (mongoose.Types.ObjectId.isValid(req.params.id)) {
//       patient = await Patient.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//     }
    
//     // If not found by ObjectId, try to find by a custom field or create new
//     if (!patient) {
//       console.log('Patient not found by ObjectId, checking if it exists by other criteria');
      
//       // Try to find by name and email combination
//       const existingPatient = await Patient.findOne({
//         name: req.body.name,
//         email: req.body.email
//       });
      
//       if (existingPatient) {
//         // Update the existing patient
//         patient = await Patient.findByIdAndUpdate(
//           existingPatient._id,
//           req.body,
//           { new: true, runValidators: true }
//         );
//         console.log('Updated existing patient found by name/email:', patient);
//       } else {
//         // Create a new patient in the database
//         console.log('Creating new patient in database from update request');
//         const newPatient = new Patient(req.body);
//         patient = await newPatient.save();
//         console.log('New patient created from update:', patient);
//       }
//     }
    
//     if (!patient) {
//       console.log('Failed to update or create patient');
//       return res.status(404).json({ message: 'Patient not found and could not be created' });
//     }
    
//     console.log('Patient updated/created successfully:', patient);
//     res.json(patient);
//   } catch (error) {
//     console.error('Error updating patient:', error);
//     res.status(400).json({ message: error.message });
//   }
// });

// // Delete patient
// router.delete('/:id', async (req, res) => {
//   try {
//     // Check if MongoDB is connected
//     const mongoose = require('mongoose');
//     if (mongoose.connection.readyState !== 1) {
//       console.log('MongoDB not connected, treating as mock data delete');
//       // For mock data, return success without deleting from DB
//       return res.json({ message: 'Patient deleted successfully' });
//     }
    
//     // Try to find and delete the patient in MongoDB
//     let patient;
    
//     // First try to find by ObjectId
//     if (mongoose.Types.ObjectId.isValid(req.params.id)) {
//       patient = await Patient.findByIdAndDelete(req.params.id);
//     }
    
//     // If not found by ObjectId, try to find by name and email
//     if (!patient) {
//       console.log('Patient not found by ObjectId, checking if it exists by other criteria');
      
//       // Try to find by name and email combination
//       const existingPatient = await Patient.findOne({
//         name: req.body?.name || 'Unknown',
//         email: req.body?.email || 'unknown@example.com'
//       });
      
//       if (existingPatient) {
//         patient = await Patient.findByIdAndDelete(existingPatient._id);
//         console.log('Deleted existing patient found by name/email');
//       }
//     }
    
//     if (!patient) {
//       console.log('Patient not found for deletion');
//       return res.status(404).json({ message: 'Patient not found' });
//     }
    
//     console.log('Patient deleted successfully');
//     res.json({ message: 'Patient deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting patient:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // Add treatment record for a patient
// router.post('/:id/treatments', async (req, res) => {
//   try {
//     const { doctorId, diagnosis, treatment, notes } = req.body;
    
//     // Verify doctor exists
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: 'Doctor not found' });
//     }
    
//     const patient = await Patient.findById(req.params.id);
//     if (!patient) {
//       return res.status(404).json({ message: 'Patient not found' });
//     }
    
//     // Add treatment record
//     patient.treatedBy.push({
//       doctorId: doctorId,
//       doctorName: doctor.name,
//       treatmentDate: new Date(),
//       diagnosis,
//       treatment,
//       notes
//     });
    
//     // Update visit count and last visit
//     patient.visitCount += 1;
//     patient.lastVisit = new Date();
    
//     await patient.save();
    
//     res.json(patient);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Get patient treatment history
// router.get('/:id/treatments', async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.params.id)
//       .populate('treatedBy.doctorId', 'name specialty')
//       .select('treatedBy');
    
//     if (!patient) {
//       return res.status(404).json({ message: 'Patient not found' });
//     }
    
//     res.json(patient.treatedBy);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get patients treated by specific doctor
// router.get('/doctor/:doctorId', async (req, res) => {
//   try {
//     const patients = await Patient.find({
//       'treatedBy.doctorId': req.params.doctorId
//     }).populate('treatedBy.doctorId', 'name specialty');
    
//     res.json(patients);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const router = express.Router();
const { jwtAuth } = require('./auth');
const mongoose = require('mongoose');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().populate('treatedBy.doctorId', 'name specialty');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment visit count for a patient (without treatment record)
router.post('/:id/visit', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    const visitDate = req.body.date ? new Date(req.body.date) : new Date();
    patient.visitCount += 1;
    patient.lastVisit = visitDate;
    patient.visits = patient.visits || [];
    patient.visits.push(visitDate);
    await patient.save();
    res.json({ visitCount: patient.visitCount, lastVisit: patient.lastVisit, visits: patient.visits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('treatedBy.doctorId', 'name specialty');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    console.log('Creating new patient with data:', req.body);
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    console.log('Patient created successfully:', savedPatient);
    res.status(201).json(savedPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating patient with ID:', req.params.id);
    console.log('Update data:', req.body);
    // Only update in MongoDB
    let patient;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      patient = await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    if (!patient) {
      // Try to find by name and email combination
      const existingPatient = await Patient.findOne({
        name: req.body.name,
        email: req.body.email
      });
      if (existingPatient) {
        patient = await Patient.findByIdAndUpdate(
          existingPatient._id,
          req.body,
          { new: true, runValidators: true }
        );
      } else {
        // Create a new patient in the database
        const newPatient = new Patient(req.body);
        patient = await newPatient.save();
      }
    }
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found and could not be created' });
    }
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    let patient;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      patient = await Patient.findByIdAndDelete(req.params.id);
    }
    if (!patient) {
      // Try to find by name and email combination
      const existingPatient = await Patient.findOne({
        name: req.body?.name || 'Unknown',
        email: req.body?.email || 'unknown@example.com'
      });
      if (existingPatient) {
        patient = await Patient.findByIdAndDelete(existingPatient._id);
      }
    }
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add treatment record for a patient (doctorId optional)
router.post('/:id/treatments', async (req, res) => {
  try {
    const { doctorId, diagnosis, treatment, notes } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    const now = new Date();
    if (doctorId) {
      // Verify doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      // Add treatment record
      patient.treatedBy.push({
        doctorId: doctorId,
        doctorName: doctor.name,
        treatmentDate: now,
        diagnosis,
        treatment,
        notes
      });
    }
    // Update visit count, last visit, and visits array
    patient.visitCount += 1;
    patient.lastVisit = now;
    if (!patient.visits) patient.visits = [];
    patient.visits.push(now);
    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get patient treatment history
router.get('/:id/treatments', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('treatedBy.doctorId', 'name specialty')
      .select('treatedBy');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient.treatedBy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patients treated by specific doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const patients = await Patient.find({
      'treatedBy.doctorId': req.params.doctorId
    }).populate('treatedBy.doctorId', 'name specialty');
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;