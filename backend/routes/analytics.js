const express = require('express');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Visit = require('../models/Visit');
const Appointment = require('../models/Appointment');
const router = express.Router();

// Get overall hospital statistics
router.get('/overview', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const activePatients = await Patient.countDocuments({ status: 'Active' });
    const totalDoctors = await Doctor.countDocuments({ status: 'Active' });
    const totalVisits = await Visit.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysVisits = await Visit.countDocuments({
      visitDate: { $gte: today, $lt: tomorrow }
    });
    
    const todaysAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });
    
    // Financial statistics
    const visits = await Visit.find();
    const totalRevenue = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
    const pendingPayments = visits.filter(v => v.paymentStatus === 'Pending').length;
    
    res.json({
      totalPatients,
      activePatients,
      totalDoctors,
      totalVisits,
      totalAppointments,
      todaysVisits,
      todaysAppointments,
      totalRevenue,
      pendingPayments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient visit frequency analysis
router.get('/patient-frequency', async (req, res) => {
  try {
    const patients = await Patient.find();
    
    const frequencyData = patients.map(patient => ({
      patientId: patient._id,
      name: patient.name,
      visitCount: patient.visitCount,
      firstVisit: patient.firstVisit,
      lastVisit: patient.lastVisit,
      daysSinceLastVisit: patient.lastVisit ? 
        Math.floor((new Date() - patient.lastVisit) / (1000 * 60 * 60 * 24)) : 0
    }));
    
    // Sort by visit frequency
    frequencyData.sort((a, b) => b.visitCount - a.visitCount);
    
    // Get top 10 most frequent patients
    const topPatients = frequencyData.slice(0, 10);
    
    // Get patients who haven't visited in 30+ days
    const inactivePatients = frequencyData.filter(p => p.daysSinceLastVisit > 30);
    
    res.json({
      topPatients,
      inactivePatients,
      totalPatients: patients.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor performance statistics
router.get('/doctor-performance', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'Active' });
    
    const performanceData = await Promise.all(doctors.map(async (doctor) => {
      const visits = await Visit.find({ doctorId: doctor._id });
      const appointments = await Appointment.find({ doctorId: doctor._id });
      
      const completedVisits = visits.filter(v => v.status === 'Completed').length;
      const totalRevenue = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
      
      return {
        doctorId: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.department,
        totalVisits: visits.length,
        completedVisits,
        totalAppointments: appointments.length,
        totalRevenue,
        completionRate: visits.length > 0 ? (completedVisits / visits.length) * 100 : 0
      };
    }));
    
    // Sort by total visits
    performanceData.sort((a, b) => b.totalVisits - a.totalVisits);
    
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly trends
router.get('/monthly-trends', async (req, res) => {
  try {
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthlyVisits = await Visit.countDocuments({
        visitDate: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const monthlyAppointments = await Appointment.countDocuments({
        appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const monthlyRevenue = await Visit.aggregate([
        {
          $match: {
            visitDate: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        visits: monthlyVisits,
        appointments: monthlyAppointments,
        revenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
      });
    }
    
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department statistics
router.get('/department-stats', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'Active' });
    const departments = [...new Set(doctors.map(d => d.department))];
    
    const departmentStats = await Promise.all(departments.map(async (dept) => {
      const deptDoctors = doctors.filter(d => d.department === dept);
      const doctorIds = deptDoctors.map(d => d._id);
      
      const visits = await Visit.find({ doctorId: { $in: doctorIds } });
      const appointments = await Appointment.find({ doctorId: { $in: doctorIds } });
      
      const totalRevenue = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
      
      return {
        department: dept,
        doctorCount: deptDoctors.length,
        totalVisits: visits.length,
        totalAppointments: appointments.length,
        totalRevenue,
        averageRevenuePerVisit: visits.length > 0 ? totalRevenue / visits.length : 0
      };
    }));
    
    res.json(departmentStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get financial report
router.get('/financial-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        visitDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const visits = await Visit.find(dateFilter);
    
    const totalRevenue = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
    const consultationFees = visits.reduce((sum, visit) => sum + visit.consultationFee, 0);
    const testFees = visits.reduce((sum, visit) => sum + visit.testFees, 0);
    
    const paymentStatusBreakdown = {
      paid: visits.filter(v => v.paymentStatus === 'Paid').length,
      pending: visits.filter(v => v.paymentStatus === 'Pending').length,
      partial: visits.filter(v => v.paymentStatus === 'Partial').length
    };
    
    const pendingAmount = visits
      .filter(v => v.paymentStatus === 'Pending')
      .reduce((sum, visit) => sum + visit.totalAmount, 0);
    
    res.json({
      totalRevenue,
      consultationFees,
      testFees,
      paymentStatusBreakdown,
      pendingAmount,
      totalVisits: visits.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unified analytics endpoint
router.get('/', async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const now = new Date();
    let start, end;

    // Calculate start and end dates for the selected time range
    switch (timeRange) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start);
        end.setDate(end.getDate() + 1);
        break;
      case 'yesterday':
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        start = new Date(end);
        start.setDate(start.getDate() - 1);
        break;
      case 'tomorrow':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
        break;
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 1);
        break;
      }
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Patients
    const totalPatients = await Patient.countDocuments();
    const patientGrowth = totalPatients; // For now, just show count
    const patientDemographics = {
      male: await Patient.countDocuments({ gender: 'male' }),
      female: await Patient.countDocuments({ gender: 'female' }),
      other: await Patient.countDocuments({ gender: 'other' })
    };

    // Doctors
    const activeDoctors = await Doctor.countDocuments({ status: 'active' });

    // Appointments - Get ALL appointments (not filtered by date for total counts)
    const allAppointments = await Appointment.find();
    const totalAppointments = allAppointments.length;
    
    // Appointment status breakdown
    const appointmentStats = {
      scheduled: allAppointments.filter(a => a.status === 'scheduled').length,
      confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
      completed: allAppointments.filter(a => a.status === 'completed').length,
      cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
      noShow: allAppointments.filter(a => a.status === 'no_show').length
    };

    // Appointments for the selected time range
    const appointmentsInRange = await Appointment.find({ date: { $gte: start, $lt: end } });
    const appointmentsToday = appointmentsInRange.length;
    const completedAppointments = appointmentStats.completed;
    const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
    const completionRateGrowth = completionRate; // For now, just show current rate

    res.json({
      totalPatients,
      patientGrowth,
      patientDemographics,
      activeDoctors,
      totalAppointments,
      appointmentsToday,
      completedAppointments,
      appointmentStats,
      completionRate,
      completionRateGrowth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 