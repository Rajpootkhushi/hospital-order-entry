# Patient Reception Management System

A comprehensive healthcare management system for patient reception, doctor management, appointment scheduling, and analytics.

## Features

### 🏥 Patient Management
- Complete patient registration and profile management
- Medical history tracking
- Contact information and demographics
- Search and filter capabilities

### 👨‍⚕️ Doctor Management
- Doctor profiles with specialties
- License and experience tracking
- Status management (active, inactive, on leave)
- Specialty-based filtering

### 📅 Appointment Scheduling
- Comprehensive appointment booking system
- Multiple appointment types (consultation, follow-up, emergency, etc.)
- Status tracking (scheduled, confirmed, completed, cancelled, no-show)
- Calendar view with filtering

### 📊 Analytics Dashboard
- Real-time statistics and metrics
- Patient demographics analysis
- Appointment completion rates
- Revenue tracking
- Monthly trends and insights

### 🎨 Modern UI/UX
- Material-UI based responsive design
- Intuitive navigation with sidebar
- Real-time data visualization
- Mobile-friendly interface

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd patient-requisition-full-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Update MONGODB_URI and other settings as needed
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `patient-reception`

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### 5. Environment Configuration

Edit the `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/image.png
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/patient-reception

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_here
```

## Running the Application

### 1. Start Backend Server

```bash
# In backend directory
npm run dev
# OR for production
npm start
```

The backend server will start on `http://localhost:5000`

### 2. Start Frontend Application

```bash
# In frontend directory
npm start
```

The frontend application will start on `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Create new doctor
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics?timeRange=week|month|quarter|year` - Get filtered analytics

## Project Structure

```
patient-requisition-full-app/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── cors.js
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Visit.js
│   │   └── User.js
│   ├── routes/
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   ├── visits.js
│   │   └── analytics.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Patients.js
│   │   │   ├── Doctors.js
│   │   │   ├── Appointments.js
│   │   │   └── Analytics.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Usage Guide

### Adding a New Patient
1. Navigate to "Patients" in the sidebar
2. Click "Add Patient" button
3. Fill in patient details (name, contact, demographics)
4. Click "Add Patient" to save

### Scheduling an Appointment
1. Navigate to "Appointments" in the sidebar
2. Click "Schedule Appointment" button
3. Select patient and doctor
4. Choose date, time, and appointment type
5. Add notes if needed
6. Click "Schedule Appointment" to save

### Managing Doctors
1. Navigate to "Doctors" in the sidebar
2. Use search and filters to find specific doctors
3. Click edit/delete icons for management actions
4. Add new doctors using "Add Doctor" button

### Viewing Analytics
1. Navigate to "Analytics" in the sidebar
2. Use time range selector to filter data
3. View various statistics and charts
4. Monitor trends and performance metrics

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Verify network connectivity for Atlas

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on the port

3. **CORS Errors**
   - Verify FRONTEND_URL in backend `.env`
   - Check CORS configuration

4. **Module Not Found Errors**
   - Run `npm install` in both frontend and backend
   - Clear node_modules and reinstall if needed

### Development Tips

1. **Hot Reload**: Backend uses nodemon for automatic restart
2. **Frontend Proxy**: Configured to proxy API calls to backend
3. **Environment Variables**: Use `.env` files for configuration
4. **Database**: Use MongoDB Compass for database management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Payment integration
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Integration with EHR systems
- [ ] Telemedicine features
- [ ] Inventory management
- [ ] Staff scheduling 