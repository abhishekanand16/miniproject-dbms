  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => res.json({ user: req.user }));

// ==================== PROFILE UPDATE ROUTES ====================
// Allow users to update their own profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, address, gender, phone, specialization } = req.body;
    const { email, role } = req.user;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const tableMap = { admin: 'Admin', patient: 'Patient', doctor: 'Doctor', cashier: 'Cashier' };
    const table = tableMap[role];
    if (!table) return res.status(400).json({ error: 'Invalid role' });

    const fields = ['name = ?'];
    const params = [name.trim()];

    // Add optional fields based on role
    if (role === 'patient') {
      if (address !== undefined) {
        fields.push('address = ?');
        params.push(address || null);
      }
      if (gender !== undefined) {
        fields.push('gender = ?');
        params.push(gender || null);
      }
      if (phone !== undefined) {
        fields.push('phone = ?');
        params.push(phone || null);
      }
    } else if (role === 'doctor') {
      if (specialization !== undefined) {
        fields.push('specialization = ?');
        params.push(specialization || null);
      }
      if (gender !== undefined) {
        fields.push('gender = ?');
        params.push(gender || null);
      }
      if (phone !== undefined) {
        fields.push('phone = ?');
        params.push(phone || null);
      }
    } else if (role === 'cashier') {
      if (phone !== undefined) {
        fields.push('phone = ?');
        params.push(phone || null);
      }
    }

    params.push(email);
    await query(`UPDATE ${table} SET ${fields.join(', ')} WHERE email = ?`, params);
    
    // Fetch updated user data
    let selectFields = 'email, name';
    if (role === 'patient') selectFields += ', address, gender, phone';
    else if (role === 'doctor') selectFields += ', gender, specialization, phone';
    else if (role === 'cashier') selectFields += ', phone';
    
    const updated = await query(`SELECT ${selectFields} FROM ${table} WHERE email = ?`, [email]);
    const userData = updated[0];
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: { ...userData, role } 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

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

    const conflicts = await query(`SELECT id FROM Appointment WHERE date = ? AND ((starttime <= ? AND endtime > ?) OR (starttime < ? AND endtime >= ?) OR (starttime >= ? AND endtime <= ?))`, [date, startTime, startTime, endTime, endTime, startTime, endTime]);
    if (conflicts.length > 0) return res.status(400).json({ error: 'Time slot already booked' });

    const apptResult = await query(`INSERT INTO Appointment (date, starttime, endtime, status) VALUES (?, ?, ?, 'NotDone')`, [date, startTime, endTime]);
    const appointmentId = getInsertId(apptResult);
    if (!appointmentId) {
      throw new Error('Failed to get appointment ID from insert');
    }

    await query(`INSERT INTO PatientsAttendAppointments (patient, appt, concerns, symptoms) VALUES (?, ?, ?, ?)`, [req.user.email, appointmentId, concerns || '', symptoms || '']);
    await query(`INSERT INTO Diagnose (appt, doctor, diagnosis, prescription) VALUES (?, ?, '', '')`, [appointmentId, doctorEmail]);

    res.status(201).json({ message: 'Appointment scheduled successfully', appointmentId });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

app.put('/api/patient/appointments/:id', authenticateToken, checkRole('patient'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, doctorEmail, concerns, symptoms } = req.body;
    
    // Verify the appointment belongs to this patient
    const patientAppointments = await query(
      'SELECT appt FROM PatientsAttendAppointments WHERE appt = ? AND patient = ?',
      [id, req.user.email]
    );
    if (patientAppointments.length === 0) {
      return res.status(403).json({ error: 'You can only modify your own appointments' });
    }

    // Check if appointment is already done
    const appointment = await query('SELECT status FROM Appointment WHERE id = ?', [id]);
    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment[0].status === 'Done') {
      return res.status(400).json({ error: 'Cannot modify completed appointments' });
    }

    // Update appointment date/time if provided
    if (date || startTime || endTime) {
      const updates = [];
      const params = [];
      
      if (date) {
        updates.push('date = ?');
        params.push(date);
      }
      if (startTime) {
        updates.push('starttime = ?');
        params.push(startTime);
      }
      if (endTime) {
        updates.push('endtime = ?');
        params.push(endTime);
      }
      
      if (updates.length > 0) {
        // Check for time conflicts
        const currentAppt = await query('SELECT date, starttime, endtime FROM Appointment WHERE id = ?', [id]);
        const checkDate = date || currentAppt[0].date;
        const checkStartTime = startTime || currentAppt[0].starttime;
        const checkEndTime = endTime || currentAppt[0].endtime;
        
        const conflicts = await query(
          `SELECT id FROM Appointment WHERE id != ? AND date = ? AND ((starttime <= ? AND endtime > ?) OR (starttime < ? AND endtime >= ?) OR (starttime >= ? AND endtime <= ?))`,
          [id, checkDate, checkStartTime, checkStartTime, checkEndTime, checkEndTime, checkStartTime, checkEndTime]
        );
        if (conflicts.length > 0) {
          return res.status(400).json({ error: 'Time slot already booked' });
        }
        
        params.push(id);
        await query(`UPDATE Appointment SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    }

    // Update doctor if provided
    if (doctorEmail) {
      const existing = await query('SELECT doctor FROM Diagnose WHERE appt = ?', [id]);
      if (existing.length > 0) {
        await query('UPDATE Diagnose SET doctor = ? WHERE appt = ?', [doctorEmail, id]);
      } else {
        await query('INSERT INTO Diagnose (appt, doctor, diagnosis, prescription) VALUES (?, ?, ?, ?)', [id, doctorEmail, '', '']);
      }
    }

    // Update concerns/symptoms if provided
    if (concerns !== undefined || symptoms !== undefined) {
      const updates = [];
      const params = [];
      if (concerns !== undefined) {
        updates.push('concerns = ?');
        params.push(concerns);
      }
      if (symptoms !== undefined) {
        updates.push('symptoms = ?');
        params.push(symptoms);
      }
      if (updates.length > 0) {
        params.push(id);
        await query(`UPDATE PatientsAttendAppointments SET ${updates.join(', ')} WHERE appt = ?`, params);
      }
    }

    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

app.delete('/api/patient/appointments/:id', authenticateToken, checkRole('patient'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the appointment belongs to this patient
    const patientAppointments = await query(
      'SELECT appt FROM PatientsAttendAppointments WHERE appt = ? AND patient = ?',
      [id, req.user.email]
    );
    if (patientAppointments.length === 0) {
      return res.status(403).json({ error: 'You can only delete your own appointments' });
    }

    // Check if appointment is already done
    const appointment = await query('SELECT status FROM Appointment WHERE id = ?', [id]);
    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment[0].status === 'Done') {
      return res.status(400).json({ error: 'Cannot delete completed appointments' });
    }

    // Delete appointment (cascade will handle related records)
    await query('DELETE FROM Appointment WHERE id = ?', [id]);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
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
    const result = await query(`INSERT INTO Billing (appointment_id, patient_email, amount, payment_status) VALUES (?, ?, ?, 'Pending')`, [appointmentId || null, patientEmail, amount]);
    const billingId = getInsertId(result);
    res.status(201).json({ message: 'Billing record created', id: billingId });
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

app.put('/api/admin/appointments/:id', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, status, doctorEmail, concerns, symptoms } = req.body;
    
    // Check if appointment exists
    const appointments = await query('SELECT id FROM Appointment WHERE id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment if date/time provided
    if (date || startTime || endTime || status) {
      const updates = [];
      const params = [];
      
      if (date) {
        updates.push('date = ?');
        params.push(date);
      }
      if (startTime) {
        updates.push('starttime = ?');
        params.push(startTime);
      }
      if (endTime) {
        updates.push('endtime = ?');
        params.push(endTime);
      }
      if (status) {
        updates.push('status = ?');
        params.push(status);
      }
      
      if (updates.length > 0) {
        // Check for time conflicts if date/time is being changed
        if (date || startTime || endTime) {
          const appointmentData = await query('SELECT date, starttime, endtime FROM Appointment WHERE id = ?', [id]);
          const checkDate = date || appointmentData[0].date;
          const checkStartTime = startTime || appointmentData[0].starttime;
          const checkEndTime = endTime || appointmentData[0].endtime;
          
          const conflicts = await query(
            `SELECT id FROM Appointment WHERE id != ? AND date = ? AND ((starttime <= ? AND endtime > ?) OR (starttime < ? AND endtime >= ?) OR (starttime >= ? AND endtime <= ?))`,
            [id, checkDate, checkStartTime, checkStartTime, checkEndTime, checkEndTime, checkStartTime, checkEndTime]
          );
          if (conflicts.length > 0) {
            return res.status(400).json({ error: 'Time slot already booked' });
          }
        }
        
        params.push(id);
        await query(`UPDATE Appointment SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    }

    // Update doctor assignment if provided
    if (doctorEmail !== undefined) {
      const existing = await query('SELECT doctor FROM Diagnose WHERE appt = ?', [id]);
      if (existing.length > 0) {
        await query('UPDATE Diagnose SET doctor = ? WHERE appt = ?', [doctorEmail, id]);
      } else {
        await query('INSERT INTO Diagnose (appt, doctor, diagnosis, prescription) VALUES (?, ?, ?, ?)', [id, doctorEmail, '', '']);
      }
    }

    // Update patient concerns/symptoms if provided
    if (concerns !== undefined || symptoms !== undefined) {
      const existing = await query('SELECT patient FROM PatientsAttendAppointments WHERE appt = ?', [id]);
      if (existing.length > 0) {
        const updates = [];
        const params = [];
        if (concerns !== undefined) {
          updates.push('concerns = ?');
          params.push(concerns);
        }
        if (symptoms !== undefined) {
          updates.push('symptoms = ?');
          params.push(symptoms);
        }
        if (updates.length > 0) {
          params.push(id);
          await query(`UPDATE PatientsAttendAppointments SET ${updates.join(', ')} WHERE appt = ?`, params);
        }
      }
    }

    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

app.delete('/api/admin/appointments/:id', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if appointment exists
    const appointments = await query('SELECT id FROM Appointment WHERE id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Delete appointment (cascade will handle related records)
    await query('DELETE FROM Appointment WHERE id = ?', [id]);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
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

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.execute('SELECT 1');
    res.json({ status: 'OK', message: 'HMS API running', database: 'connected' });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'HMS API running but database connection failed',
      error: error.code || error.message 
    });
  }
});

// Test database connection on startup
async function testConnection() {
  try {
    await pool.execute('SELECT 1');
    console.log('✓ Database connection successful');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOENT') {
      console.error('\n⚠️  Possible solutions:');
      console.error('   1. Make sure MySQL server is running');
      console.error('   2. Check socket path (trying:', process.env.DB_SOCKET_PATH || '/tmp/mysql.sock', ')');
      console.error('   3. Try starting MySQL: brew services start mysql');
    }
  }
}

// Test connection and start server
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

