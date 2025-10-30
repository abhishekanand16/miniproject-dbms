
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'HMS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const checkRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const safeCount = async (table, whereClause = '', params = []) => {
  try {
    const rows = await query(`SELECT COUNT(*) as count FROM ${table} ${whereClause}`, params);
    return rows?.[0]?.count ?? 0;
  } catch (e) {
    console.warn(`[stats] count failed for table ${table}:`, e.code || e.message);
    return 0;
  }
};

const safeSum = async (table, column, whereClause = '', params = []) => {
  try {
    const rows = await query(`SELECT SUM(${column}) as total FROM ${table} ${whereClause}`, params);
    return rows?.[0]?.total ?? 0;
  } catch (e) {
    console.warn(`[stats] sum failed for ${table}.${column}:`, e.code || e.message);
    return 0;
  }
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register/patient', async (req, res) => {
  try {
    const { email, password, name, address, gender, phone, dateOfBirth } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    const existing = await query('SELECT email FROM Patient WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Patient already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await query('INSERT INTO Patient (email, password, name, address, gender, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, address || null, gender || null, phone || null, dateOfBirth || null]);

    const [historyResult] = await query('INSERT INTO MedicalHistory (date, conditions, surgeries, medication, allergies) VALUES (?, ?, ?, ?, ?)',
      [new Date(), null, null, null, null]);
    await query('INSERT INTO PatientsFillHistory (patient, history) VALUES (?, ?)', [email, historyResult.insertId]);

    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/register/doctor', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { email, password, name, gender, specialization, phone } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    const existing = await query('SELECT email FROM Doctor WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Doctor already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await query('INSERT INTO Doctor (email, password, name, gender, specialization, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, gender || null, specialization || null, phone || null]);

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ error: 'Doctor registration failed' });
  }
});

app.post('/api/auth/register/cashier', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    const existing = await query('SELECT email FROM Cashier WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Cashier already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await query('INSERT INTO Cashier (email, password, name, phone) VALUES (?, ?, ?, ?)', [email, hashedPassword, name, phone || null]);

    res.status(201).json({ message: 'Cashier registered successfully' });
  } catch (error) {
    console.error('Cashier registration error:', error);
    res.status(500).json({ error: 'Cashier registration failed' });
  }
});

app.post('/api/auth/register/admin', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    const existing = await query('SELECT email FROM Admin WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await query('INSERT INTO Admin (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Admin registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    if (email === 'admin' && password === 'admin') {
      const token = jwt.sign({ email: 'admin', role: 'admin', name: 'Administrator' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { email: 'admin', name: 'Administrator', role: 'admin' } });
    }

    let table = null, roleValue = null;
    if (role) {
      const map = { patient: 'Patient', doctor: 'Doctor', cashier: 'Cashier', admin: 'Admin' };
      table = map[role];
      roleValue = role;
      if (!table) return res.status(400).json({ error: 'Invalid role' });
    } else {
      const candidates = [{ table: 'Admin', role: 'admin' }, { table: 'Doctor', role: 'doctor' }, { table: 'Cashier', role: 'cashier' }, { table: 'Patient', role: 'patient' }];
      for (const c of candidates) {
        const [rows] = await pool.execute(`SELECT email FROM ${c.table} WHERE email = ? LIMIT 1`, [email]);
        if (rows.length > 0) { table = c.table; roleValue = c.role; break; }
      }
      if (!table) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const [users] = await pool.execute(`SELECT email, password, name FROM ${table} WHERE email = ?`, [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    let passwordMatch = false;
    const isHashed = typeof user.password === 'string' && user.password.startsWith('$2b$');
    if (isHashed) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      if (user.password === password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashedPassword, email]);
        passwordMatch = true;
      }
    }

    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ email: user.email, role: roleValue, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { email: user.email, name: user.name, role: roleValue } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => res.json({ user: req.user }));

// ==================== PATIENT ROUTES ====================
app.get('/api/patient/appointments', authenticateToken, checkRole('patient'), async (req, res) => {
  try {
    const appointments = await query(`SELECT a.id, a.date, a.starttime, a.endtime, a.status, paa.concerns, paa.symptoms, d.name as doctor_name, d.email as doctor_email, d.specialization FROM Appointment a INNER JOIN PatientsAttendAppointments paa ON a.id = paa.appt LEFT JOIN Diagnose diag ON a.id = diag.appt LEFT JOIN Doctor d ON diag.doctor = d.email WHERE paa.patient = ? ORDER BY a.date DESC, a.starttime DESC`, [req.user.email]);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.get('/api/patient/history', authenticateToken, checkRole('patient'), async (req, res) => {
  try {
    const [history] = await query(`SELECT mh.* FROM MedicalHistory mh INNER JOIN PatientsFillHistory pfh ON mh.id = pfh.history WHERE pfh.patient = ?`, [req.user.email]);
    const [diagnoses] = await query(`SELECT d.*, a.date as appointment_date, a.starttime, doc.name as doctor_name, doc.specialization FROM Diagnose d INNER JOIN Appointment a ON d.appt = a.id INNER JOIN PatientsAttendAppointments paa ON a.id = paa.appt INNER JOIN Doctor doc ON d.doctor = doc.email WHERE paa.patient = ? ORDER BY a.date DESC, a.starttime DESC`, [req.user.email]);
    res.json({ history: history[0] || null, diagnoses });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch medical history' });
  }
});

app.post('/api/patient/appointments', authenticateToken, checkRole('patient'), async (req, res) => {
  try {
    const { doctorEmail, date, startTime, endTime, concerns, symptoms } = req.body;
    if (!doctorEmail || !date || !startTime || !endTime) return res.status(400).json({ error: 'Missing required fields' });

    const [conflicts] = await query(`SELECT id FROM Appointment WHERE date = ? AND ((starttime <= ? AND endtime > ?) OR (starttime < ? AND endtime >= ?) OR (starttime >= ? AND endtime <= ?))`, [date, startTime, startTime, endTime, endTime, startTime, endTime]);
    if (conflicts.length > 0) return res.status(400).json({ error: 'Time slot already booked' });

    const [apptResult] = await query(`INSERT INTO Appointment (date, starttime, endtime, status) VALUES (?, ?, ?, 'NotDone')`, [date, startTime, endTime]);
    const appointmentId = apptResult.insertId;

    await query(`INSERT INTO PatientsAttendAppointments (patient, appt, concerns, symptoms) VALUES (?, ?, ?, ?)`, [req.user.email, appointmentId, concerns || '', symptoms || '']);
    await query(`INSERT INTO Diagnose (appt, doctor, diagnosis, prescription) VALUES (?, ?, '', '')`, [appointmentId, doctorEmail]);

    res.status(201).json({ message: 'Appointment scheduled successfully', appointmentId });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

// ==================== DOCTOR ROUTES ====================

app.get('/api/doctor/appointments', authenticateToken, checkRole('doctor'), async (req, res) => {
  try {
    const appointments = await query(`SELECT a.id, a.date, a.starttime, a.endtime, a.status, paa.concerns, paa.symptoms, p.name as patient_name, p.email as patient_email FROM Appointment a INNER JOIN Diagnose d ON a.id = d.appt INNER JOIN PatientsAttendAppointments paa ON a.id = paa.appt INNER JOIN Patient p ON paa.patient = p.email WHERE d.doctor = ? ORDER BY a.date ASC, a.starttime ASC`, [req.user.email]);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.put('/api/doctor/appointments/:id/diagnosis', authenticateToken, checkRole('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescription, notes } = req.body;
    await query(`UPDATE Diagnose SET diagnosis = ?, prescription = ?, notes = ? WHERE appt = ? AND doctor = ?`, [diagnosis, prescription, notes || null, id, req.user.email]);
    await query(`UPDATE Appointment SET status = 'Done' WHERE id = ?`, [id]);
    res.json({ message: 'Diagnosis updated successfully' });
  } catch (error) {
    console.error('Error updating diagnosis:', error);
    res.status(500).json({ error: 'Failed to update diagnosis' });
  }
});

app.get('/api/doctor/patients/:email/history', authenticateToken, checkRole('doctor'), async (req, res) => {
  try {
    const { email } = req.params;
    const [history] = await query(`SELECT mh.* FROM MedicalHistory mh INNER JOIN PatientsFillHistory pfh ON mh.id = pfh.history WHERE pfh.patient = ?`, [email]);
    const [diagnoses] = await query(`SELECT d.*, a.date as appointment_date, a.starttime FROM Diagnose d INNER JOIN Appointment a ON d.appt = a.id INNER JOIN PatientsAttendAppointments paa ON a.id = paa.appt WHERE paa.patient = ? ORDER BY a.date DESC`, [email]);
    res.json({ history: history[0] || null, diagnoses });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ error: 'Failed to fetch patient history' });
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await query(`SELECT email, name, specialization, gender, phone FROM Doctor`);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// ==================== CASHIER ROUTES ====================

app.get('/api/cashier/billing', authenticateToken, checkRole('cashier'), async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT b.id, b.amount, b.payment_status, b.payment_method, b.payment_date, b.created_at, p.name as patient_name, p.email as patient_email, a.date as appointment_date, a.starttime FROM Billing b LEFT JOIN Patient p ON b.patient_email = p.email LEFT JOIN Appointment a ON b.appointment_id = a.id`;
    const params = [];
    if (status) { sql += ' WHERE b.payment_status = ?'; params.push(status); }
    sql += ' ORDER BY b.created_at DESC';
    const bills = await query(sql, params);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ error: 'Failed to fetch billing records' });
  }
});

app.post('/api/cashier/billing', authenticateToken, checkRole('cashier'), async (req, res) => {
  try {
    const { appointmentId, patientEmail, amount } = req.body;
    if (!patientEmail || !amount) return res.status(400).json({ error: 'Patient email and amount are required' });
    const [result] = await query(`INSERT INTO Billing (appointment_id, patient_email, amount, payment_status) VALUES (?, ?, ?, 'Pending')`, [appointmentId || null, patientEmail, amount]);
    res.status(201).json({ message: 'Billing record created', id: result.insertId });
  } catch (error) {
    console.error('Error creating billing:', error);
    res.status(500).json({ error: 'Failed to create billing record' });
  }
});

app.put('/api/cashier/billing/:id/payment', authenticateToken, checkRole('cashier'), async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;
    await query(`UPDATE Billing SET payment_status = ?, payment_method = ?, payment_date = ? WHERE id = ?`, [paymentStatus, paymentMethod || null, paymentStatus === 'Paid' ? new Date() : null, id]);
    res.json({ message: 'Payment status updated' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/users', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    let users = [];
    if (!role || role === 'admin') users.push(...(await query('SELECT email, name, created_at FROM Admin')).map(a => ({ ...a, role: 'admin' })));
    if (!role || role === 'patient') users.push(...(await query('SELECT email, name, gender, phone, created_at FROM Patient')).map(p => ({ ...p, role: 'patient' })));
    if (!role || role === 'doctor') users.push(...(await query('SELECT email, name, gender, specialization, phone, created_at FROM Doctor')).map(d => ({ ...d, role: 'doctor' })));
    if (!role || role === 'cashier') users.push(...(await query('SELECT email, name, phone, created_at FROM Cashier')).map(c => ({ ...c, role: 'cashier' })));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/appointments', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const appointments = await query(`SELECT a.id, a.date, a.starttime, a.endtime, a.status, paa.concerns, paa.symptoms, p.name as patient_name, p.email as patient_email, d.name as doctor_name, d.email as doctor_email FROM Appointment a LEFT JOIN PatientsAttendAppointments paa ON a.id = paa.appt LEFT JOIN Patient p ON paa.patient = p.email LEFT JOIN Diagnose diag ON a.id = diag.appt LEFT JOIN Doctor d ON diag.doctor = d.email ORDER BY a.date DESC, a.starttime DESC`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.get('/api/admin/billing', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const bills = await query(`SELECT b.*, p.name as patient_name, a.date as appointment_date FROM Billing b LEFT JOIN Patient p ON b.patient_email = p.email LEFT JOIN Appointment a ON b.appointment_id = a.id ORDER BY b.created_at DESC`);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ error: 'Failed to fetch billing records' });
  }
});

app.get('/api/admin/stats', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const [patients, doctors, appointments, pendingBills, totalRevenue] = await Promise.all([
      safeCount('Patient'), safeCount('Doctor'), safeCount('Appointment'), 
      safeCount('Billing', "WHERE payment_status = 'Pending'"), safeSum('Billing', 'amount', "WHERE payment_status = 'Paid'")
    ]);
    res.json({ patients, doctors, appointments, pendingBills, totalRevenue });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.delete('/api/admin/users/:role/:email', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { role, email } = req.params;
    const tableMap = { admin: 'Admin', patient: 'Patient', doctor: 'Doctor', cashier: 'Cashier' };
    const table = tableMap[role];
    if (!table) return res.status(400).json({ error: 'Invalid role' });
    await query(`DELETE FROM ${table} WHERE email = ?`, [email]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.put('/api/admin/users/:role/:email', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { role, email } = req.params;
    const updates = req.body;
    const fields = [], params = [];
    
    const fieldMap = {
      admin: ['name'],
      patient: ['name', 'address', 'gender', 'phone'],
      doctor: ['name', 'specialization', 'gender', 'phone'],
      cashier: ['name', 'phone']
    };

    (fieldMap[role] || []).forEach(field => {
      if (updates[field] !== undefined) { fields.push(`${field} = ?`); params.push(updates[field]); }
    });

    const tableMap = { admin: 'Admin', patient: 'Patient', doctor: 'Doctor', cashier: 'Cashier' };
    params.push(email);
    await query(`UPDATE ${tableMap[role]} SET ${fields.join(', ')} WHERE email = ?`, params);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'HMS API running' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

