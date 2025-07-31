const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  phone: { type: String, required: true },
  
  // Professional Information
  specialty: { type: String, required: true },
  qualifications: [String],
  license: { type: String, required: true, unique: true },
  experience: { type: Number }, // Years of experience
  
  // Department and Role
  department: { type: String, required: false, default: function() {
    // Map specialty to department if department is not provided
    const specialtyToDepartment = {
      'Cardiology': 'Cardiology',
      'Neurology': 'Neurology', 
      'Pediatrics': 'Pediatrics',
      'Endocrinology': 'Endocrinology',
      'Orthopedics': 'Orthopedics',
      'Dermatology': 'Dermatology',
      'Psychiatry': 'Psychiatry',
      'Oncology': 'Oncology',
      'General Medicine': 'General Medicine',
      'Emergency Medicine': 'Emergency Medicine'
    };
    return specialtyToDepartment[this.specialty] || 'General Medicine';
  }},
  designation: { type: String, enum: ['Consultant', 'Senior Consultant', 'Resident', 'Fellow'], default: 'Consultant' },
  
  // Availability
  availability: {
    monday: { start: String, end: String, available: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
    thursday: { start: String, end: String, available: { type: Boolean, default: true } },
    friday: { start: String, end: String, available: { type: Boolean, default: true } },
    saturday: { start: String, end: String, available: { type: Boolean, default: false } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  },
  
  // Statistics
  totalPatients: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
  
  // Status
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
DoctorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Doctor', DoctorSchema); 