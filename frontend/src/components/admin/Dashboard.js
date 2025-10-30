import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../Dashboard.css';
import { Users, Calendar, DollarSign, Activity, LogOut, UserPlus, Settings, Trash2, Edit } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ email: '', password: '', name: '', role: 'patient' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'billing') fetchBills();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/billing');
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/api/auth/register/${userForm.role}`;
      await axios.post(`http://localhost:3001${endpoint}`, userForm);
      setShowUserModal(false);
      setUserForm({ email: '', password: '', name: '', role: 'patient' });
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name || '',
      phone: user.phone || '',
      gender: user.gender || '',
      specialization: user.specialization || '',
      address: user.address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3001/api/admin/users/${selectedUser.role}/${selectedUser.email}`,
        userForm
      );
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userEmail, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/users/${role}/${userEmail}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 HMS</h2>
          <p>Admin Portal</p>
        </div>
        <div className="sidebar-user">
          <Settings size={20} />
          <span>{user?.name}</span>
        </div>
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={20} />
            <span>Overview</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            <span>Users</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={20} />
            <span>Appointments</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <DollarSign size={20} />
            <span>Billing</span>
          </div>
        </div>
        <button className="logout-button" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          {activeTab === 'users' && (
            <button className="primary-button" onClick={() => setShowUserModal(true)}>
              <UserPlus size={20} />
              Add User
            </button>
          )}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.patients || 0}</h3>
                  <p>Total Patients</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <Activity size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.doctors || 0}</h3>
                  <p>Total Doctors</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.appointments || 0}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h3>${(stats.totalRevenue || 0).toFixed(2)}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>
            <div className="content-card">
              <h2>System Overview</h2>
              <p style={{ color: '#718096', marginTop: '10px' }}>
                Manage all aspects of the Hospital Management System from this dashboard.
                Use the sidebar to navigate between different sections.
              </p>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="content-card">
            <h2>Manage Users</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={idx}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="status-badge" style={{ 
                          backgroundColor: u.role === 'patient' ? '#667eea' : 
                                          u.role === 'doctor' ? '#f5576c' : 
                                          u.role === 'cashier' ? '#4facfe' : '#10b981'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.specialization && `Specialization: ${u.specialization}`}
                        {u.phone && `Phone: ${u.phone}`}
                        {u.gender && `Gender: ${u.gender}`}
                        {!u.specialization && !u.phone && !u.gender && '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="primary-button"
                            onClick={() => handleEditUser(u)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => handleDeleteUser(u.email, u.role)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="content-card">
            <h2>All Appointments</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>{new Date(apt.date).toLocaleDateString()}</td>
                      <td>{apt.starttime} - {apt.endtime}</td>
                      <td>{apt.patient_name || apt.patient_email || '-'}</td>
                      <td>{apt.doctor_name || '-'}</td>
                      <td>
                        <span className="status-badge" style={{ 
                          backgroundColor: apt.status === 'Done' ? '#10b981' : '#f59e0b' 
                        }}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="content-card">
            <h2>Billing Records</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.patient_name || bill.patient_email}</td>
                      <td>${parseFloat(bill.amount).toFixed(2)}</td>
                      <td>
                        <span className="status-badge" style={{ 
                          backgroundColor: bill.payment_status === 'Paid' ? '#10b981' : '#f59e0b' 
                        }}>
                          {bill.payment_status}
                        </span>
                      </td>
                      <td>{bill.payment_method || '-'}</td>
                      <td>{bill.payment_date ? new Date(bill.payment_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="form-input"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              {userForm.role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      value={userForm.specialization || ''}
                      onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={userForm.gender || ''}
                      onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={userForm.phone || ''}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </>
              )}
              {userForm.role === 'patient' && (
                <>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={userForm.address || ''}
                      onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={userForm.gender || ''}
                      onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={userForm.phone || ''}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </>
              )}
              {userForm.role === 'cashier' && (
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={userForm.phone || ''}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              {selectedUser.role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      value={userForm.specialization || ''}
                      onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={userForm.gender || ''}
                      onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={userForm.phone || ''}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </>
              )}
              {selectedUser.role === 'patient' && (
                <>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={userForm.address || ''}
                      onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={userForm.gender || ''}
                      onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={userForm.phone || ''}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </>
              )}
              {selectedUser.role === 'cashier' && (
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={userForm.phone || ''}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

