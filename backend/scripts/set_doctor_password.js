const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_db_name'; // Update your_db_name if needed

async function setDoctorPassword() {
  await mongoose.connect(MONGO_URI);
  const doctor = await Doctor.findOne({ email: 'you@gmail.com' });
  if (!doctor) {
    console.log('Doctor not found.');
    process.exit(1);
  }
  doctor.password = 'yourpassword';
  await doctor.save();
  console.log('Password updated for Dr. You (you@gmail.com)');
  process.exit(0);
}

setDoctorPassword(); 