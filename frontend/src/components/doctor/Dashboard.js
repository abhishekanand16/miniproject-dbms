import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, User, FileText, LogOut, Activity, Stethoscope, Settings } from 'lucide-react';
import SettingsPage from '../settings/Settings';
import '../Dashboard.css';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({ diagnosis: '', prescription: '', notes: '' });
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    function onOpenSettings() { setActiveTab('settings'); }
    window.addEventListener('app:open-settings', onOpenSettings);
    return () => window.removeEventListener('app:open-settings', onOpenSettings);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/doctor/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosis = (appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosisForm({ diagnosis: '', prescription: '', notes: '' });
    setShowDiagnosisModal(true);
  };

  const submitDiagnosis = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3001/api/doctor/appointments/${selectedAppointment.id}/diagnosis`,
        diagnosisForm
      );
      setShowDiagnosisModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit diagnosis');
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
          <p>Doctor Portal</p>
        </div>
        <div className="sidebar-user">
          <Stethoscope size={20} />
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
          <h1>Welcome, Dr. {user?.name}!</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="secondary-button" onClick={() => setActiveTab('settings')} title="Open Settings">
              <Settings size={18} />
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
              <p>Pending</p>
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
                    <th>Patient</th>
                    <th>Concerns</th>
                    <th>Symptoms</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>{new Date(apt.date).toLocaleDateString()}</td>
                      <td>{apt.starttime} - {apt.endtime}</td>
                      <td>{apt.patient_name}</td>
                      <td>{apt.concerns || '-'}</td>
                      <td>{apt.symptoms || '-'}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(apt.status) }}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        {apt.status === 'NotDone' && (
                          <button
                            className="primary-button"
                            onClick={() => handleDiagnosis(apt)}
                            style={{ padding: '8px 16px', fontSize: '14px' }}
                          >
                            Diagnose
                          </button>
                        )}
                        {apt.status === 'Done' && (
                          <span style={{ color: '#10b981', fontSize: '14px' }}>Completed</span>
                        )}
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

      {showDiagnosisModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDiagnosisModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Diagnosis for {selectedAppointment.patient_name}</h2>
            <form onSubmit={submitDiagnosis}>
              <div className="form-group">
                <label>Diagnosis *</label>
                <textarea
                  value={diagnosisForm.diagnosis}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosis: e.target.value })}
                  className="form-input"
                  rows="4"
                  required
                  placeholder="Enter diagnosis details"
                />
              </div>
              <div className="form-group">
                <label>Prescription</label>
                <textarea
                  value={diagnosisForm.prescription}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, prescription: e.target.value })}
                  className="form-input"
                  rows="4"
                  placeholder="Enter prescription details"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={diagnosisForm.notes}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, notes: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Additional notes"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowDiagnosisModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">Submit Diagnosis</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;

