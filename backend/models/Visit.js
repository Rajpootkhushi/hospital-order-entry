const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  // Patient and Doctor Reference
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  
  // Visit Information
  visitDate: { type: Date, default: Date.now },
  visitType: { type: String, enum: ['First Visit', 'Follow-up', 'Emergency', 'Routine Checkup'], default: 'First Visit' },
  appointmentTime: String,
  
  // Vital Signs
  vitals: {
    bloodPressure: String,
    temperature: String,
    heartRate: String,
    weight: String,
    height: String
  },
  
  // Symptoms and Diagnosis
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  prescriptions: [{
    medicineName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  
  // Tests and Procedures
  testsOrdered: [{
    testName: String,
    testDate: Date,
    results: String,
    status: { type: String, enum: ['Ordered', 'In Progress', 'Completed', 'Cancelled'], default: 'Ordered' }
  }],
  
  // Follow-up
  followUpDate: Date,
  followUpNotes: String,
  
  // Financial Information
  consultationFee: { type: Number, default: 0 },
  testFees: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Partial'], default: 'Pending' },
  
  // Notes
  doctorNotes: String,
  receptionNotes: String,
  
  // Status
  status: { type: String, enum: ['In Progress', 'Completed', 'Cancelled'], default: 'In Progress' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
VisitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total amount
VisitSchema.pre('save', function(next) {
  this.totalAmount = this.consultationFee + this.testFees;
  next();
});

module.exports = mongoose.model('Visit', VisitSchema); 