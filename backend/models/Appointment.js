const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  // Patient and Doctor Reference
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  
  // Appointment Details
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'surgery'], default: 'consultation' },
  
  // Reason for Visit
  reason: String,
  symptoms: [String],
  
  // Status
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
  
  // Reminders
  reminderSent: { type: Boolean, default: false },
  reminderDate: Date,
  
  // Notes
  notes: { type: String },
  patientNotes: String,
  receptionNotes: String,
  
  // Financial
  consultationFee: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema); 