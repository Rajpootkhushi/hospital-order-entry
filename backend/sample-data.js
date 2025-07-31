const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');

// Sample data
const samplePatients = [
  {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '555-0101',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    address: '123 Main Street, City, State 12345',
    emergencyContact: 'Jane Doe - 555-0102',
    medicalHistory: 'No known allergies',
    status: 'active',
    visitCount: 3,
    firstVisit: new Date('2024-01-15'),
    lastVisit: new Date('2024-06-20')
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '555-0103',
    dateOfBirth: '1985-08-22',
    gender: 'female',
    address: '456 Oak Avenue, City, State 12345',
    emergencyContact: 'Mike Johnson - 555-0104',
    medicalHistory: 'Asthma, controlled with medication',
    status: 'active',
    visitCount: 1,
    firstVisit: new Date('2024-06-10'),
    lastVisit: new Date('2024-06-10')
  },
  {
    name: 'Robert Chen',
    email: 'robert.chen@email.com',
    phone: '555-0105',
    dateOfBirth: '1978-12-03',
    gender: 'male',
    address: '789 Pine Road, City, State 12345',
    emergencyContact: 'Lisa Chen - 555-0106',
    medicalHistory: 'Hypertension, diabetes type 2',
    status: 'active',
    visitCount: 5,
    firstVisit: new Date('2023-11-20'),
    lastVisit: new Date('2024-06-15')
  }
];

const sampleDoctors = [
  {
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@hospital.com',
    phone: '555-0201',
    specialty: 'Cardiology',
    license: 'MD123456',
    experience: 8,
    department: 'Cardiology',
    designation: 'Senior Consultant',
    status: 'active',
    totalPatients: 45,
    totalVisits: 120
  },
  {
    name: 'Dr. Michael Brown',
    email: 'michael.brown@hospital.com',
    phone: '555-0202',
    specialty: 'Neurology',
    license: 'MD789012',
    experience: 12,
    department: 'Neurology',
    designation: 'Consultant',
    status: 'active',
    totalPatients: 38,
    totalVisits: 95
  },
  {
    name: 'Dr. Emily Davis',
    email: 'emily.davis@hospital.com',
    phone: '555-0203',
    specialty: 'Pediatrics',
    license: 'MD345678',
    experience: 6,
    department: 'Pediatrics',
    designation: 'Resident',
    status: 'active',
    totalPatients: 52,
    totalVisits: 140
  }
];

// Connect to MongoDB
async function insertSampleData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/patient-reception';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    console.log('Existing data cleared.');

    // Insert sample patients
    console.log('Inserting sample patients...');
    const insertedPatients = await Patient.insertMany(samplePatients);
    console.log(`Inserted ${insertedPatients.length} patients.`);

    // Insert sample doctors
    console.log('Inserting sample doctors...');
    const insertedDoctors = await Doctor.insertMany(sampleDoctors);
    console.log(`Inserted ${insertedDoctors.length} doctors.`);

    console.log('Sample data inserted successfully!');
    console.log('\nSample data summary:');
    console.log(`- Patients: ${insertedPatients.length}`);
    console.log(`- Doctors: ${insertedDoctors.length}`);

  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
if (require.main === module) {
  insertSampleData();
}

module.exports = { insertSampleData }; 