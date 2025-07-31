const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  
  // Address
  address: { type: String },
  
  // Emergency Contact
  emergencyContact: { type: String },
  
  // Medical Information
  medicalHistory: { type: String },
  
  // Treatment Tracking
  treatedBy: [{
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctorName: String,
    treatmentDate: { type: Date, default: Date.now },
    diagnosis: String,
    treatment: String,
    notes: String
  }],
  
  // Visit Tracking
  visitCount: { type: Number, default: 0 },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visits: [{ type: Date }],
  
  // Status
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);