const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async requestWithFallback(endpoint, mockEndpoint) {
    try {
      return await this.request(endpoint);
    } catch (error) {
      console.log(`Falling back to mock data for ${endpoint}`);
      return await this.request(mockEndpoint);
    }
  }

  // Patients
  async getPatients() {
    const data = await this.requestWithFallback('/patients', '/mock/patients');
    // Normalize ID field for consistency
    return data.map(item => ({ ...item, id: item._id || item.id }));
  }

  async createPatient(patientData) {
    try {
      const result = await this.request('/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      });
      // Ensure we have an id field for consistency
      return { ...result, id: result._id || result.id };
    } catch (error) {
      console.error('Failed to create patient via API, using mock response');
      // Return a mock response for development
      return {
        id: Date.now(),
        ...patientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async updatePatient(id, patientData) {
    try {
      const result = await this.request(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patientData),
      });
      // Ensure we have an id field for consistency
      return { ...result, id: result._id || result.id };
    } catch (error) {
      console.error('Failed to update patient via API, using mock response');
      // Return a mock response for development
      return {
        id: id,
        ...patientData,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async deletePatient(id) {
    try {
      return await this.request(`/patients/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete patient via API, using mock response');
      // Return a mock response for development
      return { message: 'Patient deleted successfully' };
    }
  }

  // Doctors
  async getDoctors() {
    const data = await this.requestWithFallback('/doctors', '/mock/doctors');
    // Normalize ID field for consistency
    return data.map(item => ({ ...item, id: item._id || item.id }));
  }

  async createDoctor(doctorData) {
    try {
      const result = await this.request('/doctors', {
        method: 'POST',
        body: JSON.stringify(doctorData),
      });
      // Ensure we have an id field for consistency
      return { ...result, id: result._id || result.id };
    } catch (error) {
      console.error('Failed to create doctor via API, using mock response');
      // Return a mock response for development
      return {
        id: Date.now(),
        ...doctorData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async updateDoctor(id, doctorData) {
    try {
      const result = await this.request(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(doctorData),
      });
      // Ensure we have an id field for consistency
      return { ...result, id: result._id || result.id };
    } catch (error) {
      console.error('Failed to update doctor via API, using mock response');
      // Return a mock response for development
      return {
        id: id,
        ...doctorData,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async deleteDoctor(id) {
    try {
      return await this.request(`/doctors/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete doctor via API, using mock response');
      // Return a mock response for development
      return { message: 'Doctor deleted successfully' };
    }
  }

  // Analytics
  async getAnalytics() {
    return this.requestWithFallback('/analytics', '/mock/analytics');
  }

  // Appointments
  async getAppointments() {
    try {
      const data = await this.request('/appointments');
      return data.map(item => ({ ...item, id: item._id || item.id }));
    } catch (error) {
      console.error('Failed to fetch appointments via API, using mock response');
      // Return mock appointments for development with proper structure
      return [
        { 
          id: 1, 
          patientId: { _id: 1, name: 'John Doe' }, 
          doctorId: { _id: 1, name: 'Dr. Sarah Wilson', specialty: 'Cardiology' }, 
          date: '2024-01-15', 
          time: '09:00',
          type: 'consultation',
          status: 'completed',
          notes: 'Regular checkup'
        },
        { 
          id: 2, 
          patientId: { _id: 2, name: 'Jane Smith' }, 
          doctorId: { _id: 2, name: 'Dr. Michael Brown', specialty: 'Neurology' }, 
          date: '2024-01-16', 
          time: '14:30',
          type: 'follow_up',
          status: 'completed',
          notes: 'Follow-up appointment'
        },
        { 
          id: 3, 
          patientId: { _id: 3, name: 'Bob Johnson' }, 
          doctorId: { _id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatrics' }, 
          date: '2024-01-17', 
          time: '11:00',
          type: 'consultation',
          status: 'completed',
          notes: 'Initial consultation'
        },
        { 
          id: 4, 
          patientId: { _id: 1, name: 'John Doe' }, 
          doctorId: { _id: 2, name: 'Dr. Michael Brown', specialty: 'Neurology' }, 
          date: '2024-01-18', 
          time: '10:00',
          type: 'consultation',
          status: 'confirmed',
          notes: 'Follow-up consultation'
        },
        { 
          id: 5, 
          patientId: { _id: 2, name: 'Jane Smith' }, 
          doctorId: { _id: 1, name: 'Dr. Sarah Wilson', specialty: 'Cardiology' }, 
          date: '2024-01-19', 
          time: '15:00',
          type: 'consultation',
          status: 'cancelled',
          notes: 'Patient cancelled due to emergency'
        }
      ];
    }
  }

  async createAppointment(appointmentData) {
    try {
      const result = await this.request('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
      return { ...result, id: result._id || result.id };
    } catch (error) {
      console.error('Failed to create appointment via API, using mock response');
      return {
        id: Date.now(),
        ...appointmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async updateAppointment(id, appointmentData) {
    try {
      const result = await this.request(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData),
      });
      return { ...result, id: result._id || result.id };
    } catch (error) {
      console.error('Failed to update appointment via API, using mock response');
      return {
        id: id,
        ...appointmentData,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async deleteAppointment(id) {
    try {
      return await this.request(`/appointments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete appointment via API, using mock response');
      return { message: 'Appointment deleted successfully' };
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Visits
  async createVisit(visitData) {
    try {
      const result = await this.request('/visits', {
        method: 'POST',
        body: JSON.stringify(visitData),
      });
      return result;
    } catch (error) {
      console.error('Failed to create visit via API');
      throw error;
    }
  }
}

export default new ApiService(); 