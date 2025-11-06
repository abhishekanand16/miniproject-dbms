# 🏥 Hospital Management System

A full-stack Hospital Management System with role-based dashboards for Patients, Doctors, Cashiers, and Administrators.

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE HMS;
exit

# Load schema and sample data
mysql -u root -p HMS < DDL.sql
mysql -u root -p HMS < InsertDML.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=HMS
PORT=3001
JWT_SECRET=your-secret-key
```

Start server:
```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` 🎉

## 🔌 Database Connection

The backend uses **MySQL2** with connection pooling. Connection is configured via environment variables:

- **Host**: `DB_HOST` (default: `localhost`)
- **User**: `DB_USER` (default: `root`)
- **Password**: `DB_PASSWORD`
- **Database**: `DB_NAME` (default: `HMS`)

Connection is established using `mysql2.createPool()` and queries are executed using parameterized statements to prevent SQL injection.

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication
- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- **GET** `/api/auth/me` - Get current user (requires auth token)
  - Headers: `Authorization: Bearer <token>`

### Profile
- **PUT** `/api/profile` - Update own profile (requires auth token)
  - Body: `{ name, address?, gender?, phone?, specialization? }`

### Patient Routes
- **GET** `/api/patient/appointments` - Get patient appointments
- **GET** `/api/patient/history` - Get medical history
- **POST** `/api/patient/appointments` - Create appointment
  - Body: `{ doctorEmail, date, startTime, endTime, concerns?, symptoms? }`
- **PUT** `/api/patient/appointments/:id` - Update appointment
- **DELETE** `/api/patient/appointments/:id` - Delete appointment

### Doctor Routes
- **GET** `/api/doctor/appointments` - Get doctor's appointments
- **PUT** `/api/doctor/appointments/:id/diagnosis` - Update diagnosis
  - Body: `{ diagnosis, prescription, notes? }`
- **GET** `/api/doctor/patients/:email/history` - Get patient history
- **GET** `/api/doctors` - Get all doctors (public)

### Cashier Routes
- **GET** `/api/cashier/billing?status=` - Get billing records
- **POST** `/api/cashier/billing` - Create billing record
  - Body: `{ appointmentId?, patientEmail, amount }`
- **PUT** `/api/cashier/billing/:id/payment` - Update payment status
  - Body: `{ paymentStatus, paymentMethod? }`

### Admin Routes
- **GET** `/api/admin/users?role=` - Get all users
- **GET** `/api/admin/appointments` - Get all appointments
- **PUT** `/api/admin/appointments/:id` - Update appointment
- **DELETE** `/api/admin/appointments/:id` - Delete appointment
- **GET** `/api/admin/billing` - Get all billing records
- **GET** `/api/admin/stats` - Get system statistics
- **DELETE** `/api/admin/users/:role/:email` - Delete user
- **PUT** `/api/admin/users/:role/:email` - Update user

### Health Check
- **GET** `/api/health` - Check API and database connection status

## 🔍 Database Queries

All queries use **parameterized statements** to prevent SQL injection. Examples:

### Patient Appointments Query
```sql
SELECT a.id, a.date, a.starttime, a.endtime, a.status, 
       paa.concerns, paa.symptoms, 
       d.name as doctor_name, d.email as doctor_email, d.specialization 
FROM Appointment a 
INNER JOIN PatientsAttendAppointments paa ON a.id = paa.appt 
LEFT JOIN Diagnose diag ON a.id = diag.appt 
LEFT JOIN Doctor d ON diag.doctor = d.email 
WHERE paa.patient = ? 
ORDER BY a.date DESC, a.starttime DESC
```

### Medical History Query
```sql
SELECT mh.* 
FROM MedicalHistory mh 
INNER JOIN PatientsFillHistory pfh ON mh.id = pfh.history 
WHERE pfh.patient = ?
```

### Appointment Conflict Check
```sql
SELECT id FROM Appointment 
WHERE date = ? 
AND ((starttime <= ? AND endtime > ?) 
  OR (starttime < ? AND endtime >= ?) 
  OR (starttime >= ? AND endtime <= ?))
```

### Billing Query
```sql
SELECT b.id, b.amount, b.payment_status, b.payment_method, 
       b.payment_date, b.created_at, 
       p.name as patient_name, p.email as patient_email, 
       a.date as appointment_date, a.starttime 
FROM Billing b 
LEFT JOIN Patient p ON b.patient_email = p.email 
LEFT JOIN Appointment a ON b.appointment_id = a.id 
WHERE b.payment_status = ? 
ORDER BY b.created_at DESC
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hospital.com | admin123 |
| **Doctor** | dr.williams@hospital.com | doctor123 |
| **Cashier** | cashier1@hospital.com | cashier123 |
| **Patient** | john.doe@example.com | patient123 |

## 🛠️ Tech Stack

**Frontend:** React 18 • React Router • Axios • Lucide Icons  
**Backend:** Node.js • Express • MySQL2  
**Security:** JWT • bcrypt • CORS

## 🔒 Security Features

✅ Password hashing with bcrypt  
✅ JWT token authentication  
✅ Role-based access control  
✅ SQL injection prevention (parameterized queries)  
✅ CORS protection

## 📂 Project Structure

```
miniproject-dbms/
├── backend/           # Express API server
│   ├── server.js      # Main server file
│   └── .env          # Environment variables
├── frontend/          # React application
├── DDL.sql           # Database schema
└── InsertDML.sql     # Sample data
```

## 📝 Development

```bash
# Backend with auto-reload
cd backend
npm run dev

# Frontend (hot reload enabled)
cd frontend
npm start
```

---

Made with ❤️ for healthcare management
