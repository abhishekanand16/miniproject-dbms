import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, User, FileText, Plus, LogOut, Activity, Settings } from 'lucide-react';
import SettingsPage from '../settings/Settings';
import '../Dashboard.css';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [scheduleForm, setScheduleForm] = useState({
    doctorEmail: '',
    date: '',
    startTime: '',
    endTime: '',
    concerns: '',
    symptoms: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    function onOpenSettings() { setActiveTab('settings'); }
    window.addEventListener('app:open-settings', onOpenSettings);
    return () => window.removeEventListener('app:open-settings', onOpenSettings);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/patient/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/patient/appointments', scheduleForm);
      setShowScheduleModal(false);
      setScheduleForm({
        doctorEmail: '',
        date: '',
        startTime: '',
        endTime: '',
        concerns: '',
        symptoms: ''
      });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to schedule appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return '#10b981';
      case 'NotDone': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 HMS</h2>
          <p>Patient Portal</p>
        </div>
        <div className="sidebar-user">
          <User size={20} />
          <span>{user?.name}</span>
        </div>
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={20} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </div>
        <button className="logout-button" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div className="dashboard-content">
        <div className="content-wrapper">
        {activeTab === 'dashboard' && (
        <>
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="secondary-button" onClick={() => setActiveTab('settings')} title="Open Settings">
              <Settings size={18} />
            </button>
            <button className="primary-button" onClick={() => setShowScheduleModal(true)}>
              <Plus size={20} />
              Schedule Appointment
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>{appointments.length}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'NotDone').length}</h3>
              <p>Upcoming</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'Done').length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>My Appointments</h2>
          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">No appointments scheduled</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Concerns</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>{new Date(apt.date).toLocaleDateString()}</td>
                      <td>{apt.starttime} - {apt.endtime}</td>
                      <td>{apt.doctor_name || 'TBD'}</td>
                      <td>{apt.specialization || '-'}</td>
                      <td>{apt.concerns || '-'}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(apt.status) }}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}
        {activeTab === 'settings' && (<SettingsPage />)}
        </div>
      </div>

      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Schedule New Appointment</h2>
            <form onSubmit={handleScheduleAppointment}>
              <div className="form-group">
                <label>Doctor</label>
                <select
                  value={scheduleForm.doctorEmail}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, doctorEmail: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.email} value={doc.email}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="form-input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Concerns</label>
                <textarea
                  value={scheduleForm.concerns}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, concerns: e.target.value })}
                  className="form-input"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Symptoms</label>
                <textarea
                  value={scheduleForm.symptoms}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, symptoms: e.target.value })}
                  className="form-input"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

