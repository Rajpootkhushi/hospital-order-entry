const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name specialty')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name specialty');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    // Find the current appointment
    const currentAppointment = await Appointment.findById(req.params.id);
    if (!currentAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if status is being changed to 'completed' and wasn't completed before
    const wasCompleted = currentAppointment.status === 'completed';
    const willBeCompleted = req.body.status === 'completed';

    // Update the appointment
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If marking as completed for the first time, update patient visitCount and lastVisit
    if (!wasCompleted && willBeCompleted) {
      const Patient = require('../models/Patient');
      await Patient.findByIdAndUpdate(
        appointment.patientId,
        {
          $inc: { visitCount: 1 },
          lastVisit: new Date()
        }
      );
    }

    // Populate patient and doctor for response
    await appointment.populate('patientId', 'name phone');
    await appointment.populate('doctorId', 'name specialty');

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 