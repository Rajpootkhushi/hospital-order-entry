const express = require('express');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const router = express.Router();

// Get all visits with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId = '', doctorId = '', status = '', date = '' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.visitDate = { $gte: startDate, $lte: endDate };
    }
    
    const visits = await Visit.find(query)
      .populate('patientId', 'name age gender phone')
      .populate('doctorId', 'name specialization')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Visit.countDocuments(query);
    
    res.json({
      visits,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get visit by ID
router.get('/:id', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('patientId', 'name age gender phone email address')
      .populate('doctorId', 'name specialization department');
    
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new visit
router.post('/', async (req, res) => {
  try {
    const visit = new Visit(req.body);
    await visit.save();
    
    // Update patient visit count and last visit
    const patient = await Patient.findById(req.body.patientId);
    if (patient) {
      patient.visitCount += 1;
      patient.lastVisit = new Date();
      await patient.save();
    }
    
    // Update doctor total visits
    const doctor = await Doctor.findById(req.body.doctorId);
    if (doctor) {
      doctor.totalVisits += 1;
      await doctor.save();
    }
    
    const populatedVisit = await Visit.findById(visit._id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization');
    
    res.status(201).json(populatedVisit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update visit
router.put('/:id', async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'name age gender')
     .populate('doctorId', 'name specialization');
    
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    res.json(visit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update visit status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patientId', 'name age gender')
     .populate('doctorId', 'name specialization');
    
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    res.json(visit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add prescription to visit
router.post('/:id/prescription', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    visit.prescriptions.push(req.body);
    await visit.save();
    
    const populatedVisit = await Visit.findById(visit._id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization');
    
    res.json(populatedVisit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add test to visit
router.post('/:id/test', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    visit.testsOrdered.push(req.body);
    await visit.save();
    
    const populatedVisit = await Visit.findById(visit._id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization');
    
    res.json(populatedVisit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get today's visits
router.get('/today/visits', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const visits = await Visit.find({
      visitDate: { $gte: today, $lt: tomorrow }
    })
    .populate('patientId', 'name age gender phone')
    .populate('doctorId', 'name specialization')
    .sort({ appointmentTime: 1 });
    
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get visit statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    const completedVisits = await Visit.countDocuments({ status: 'Completed' });
    const inProgressVisits = await Visit.countDocuments({ status: 'In Progress' });
    const cancelledVisits = await Visit.countDocuments({ status: 'Cancelled' });
    
    // Today's visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaysVisits = await Visit.countDocuments({
      visitDate: { $gte: today, $lt: tomorrow }
    });
    
    // Monthly visits for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthlyVisits = await Visit.countDocuments({
        visitDate: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      monthlyStats.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        visits: monthlyVisits
      });
    }
    
    res.json({
      totalVisits,
      completedVisits,
      inProgressVisits,
      cancelledVisits,
      todaysVisits,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 