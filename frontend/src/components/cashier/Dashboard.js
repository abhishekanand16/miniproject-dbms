import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { DollarSign, Clock, CheckCircle, XCircle, LogOut, Activity, Receipt, Settings } from 'lucide-react';
import SettingsPage from '../settings/Settings';
import '../Dashboard.css';

const CashierDashboard = () => {
  const { user, logout } = useAuth();
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [billForm, setBillForm] = useState({
    appointmentId: '',
    patientEmail: '',
    amount: ''
  });

  useEffect(() => {
    fetchBills();
  }, [filter]);

  useEffect(() => {
    function onOpenSettings() { setActiveTab('settings'); }
    window.addEventListener('app:open-settings', onOpenSettings);
    return () => window.removeEventListener('app:open-settings', onOpenSettings);
  }, []);

  const fetchBills = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('http://localhost:3001/api/cashier/billing', { params });
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/cashier/billing', billForm);
      setShowCreateModal(false);
      setBillForm({ appointmentId: '', patientEmail: '', amount: '' });
      fetchBills();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create billing record');
    }
  };

  const handlePaymentUpdate = async (billId, status, method) => {
    try {
      await axios.put(`http://localhost:3001/api/cashier/billing/${billId}/payment`, {
        paymentStatus: status,
        paymentMethod: method
      });
      fetchBills();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#10b981';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const pendingBills = bills.filter(b => b.payment_status === 'Pending').length;
  const paidBills = bills.filter(b => b.payment_status === 'Paid').length;
  const totalRevenue = bills.filter(b => b.payment_status === 'Paid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 HMS</h2>
          <p>Cashier Portal</p>
        </div>
        <div className="sidebar-user">
          <Receipt size={20} />
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
            <button className="primary-button" onClick={() => setShowCreateModal(true)}>
              <DollarSign size={20} />
              Create Bill
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <h3>${totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{pendingBills}</h3>
              <p>Pending Payments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{paidBills}</h3>
              <p>Paid Bills</p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Billing Records</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          {loading ? (
            <div className="loading">Loading bills...</div>
          ) : bills.length === 0 ? (
            <div className="empty-state">No billing records found</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Appointment Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.patient_name || bill.patient_email}</td>
                      <td>{bill.appointment_date ? new Date(bill.appointment_date).toLocaleDateString() : '-'}</td>
                      <td>${parseFloat(bill.amount).toFixed(2)}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(bill.payment_status) }}>
                          {bill.payment_status}
                        </span>
                      </td>
                      <td>{bill.payment_method || '-'}</td>
                      <td>{bill.payment_date ? new Date(bill.payment_date).toLocaleDateString() : '-'}</td>
                      <td>
                        {bill.payment_status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="primary-button"
                              onClick={() => handlePaymentUpdate(bill.id, 'Paid', 'Cash')}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Mark Paid
                            </button>
                          </div>
                        )}
                        {bill.payment_status === 'Paid' && (
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

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Bill</h2>
            <form onSubmit={handleCreateBill}>
              <div className="form-group">
                <label>Patient Email *</label>
                <input
                  type="email"
                  value={billForm.patientEmail}
                  onChange={(e) => setBillForm({ ...billForm, patientEmail: e.target.value })}
                  className="form-input"
                  required
                  placeholder="patient@example.com"
                />
              </div>
              <div className="form-group">
                <label>Appointment ID (Optional)</label>
                <input
                  type="number"
                  value={billForm.appointmentId}
                  onChange={(e) => setBillForm({ ...billForm, appointmentId: e.target.value })}
                  className="form-input"
                  placeholder="Leave empty if not applicable"
                />
              </div>
              <div className="form-group">
                <label>Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                  className="form-input"
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">Create Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;

