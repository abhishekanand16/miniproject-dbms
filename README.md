# 🏥 Hospital Management System

A modern, full-stack Hospital Management System with role-based dashboards for Patients, Doctors, Cashiers, and Administrators.

## ✨ Features

- 🎨 **Modern UI** with smooth animations and dark mode support
- 👥 **Role-Based Access** with separate dashboards for each user type
- 🔐 **Secure Authentication** using JWT and bcrypt
- 📅 **Appointment Management** for patients and doctors
- 💰 **Billing System** for cashiers
- 📊 **Admin Dashboard** with full system control

## 🛠️ Tech Stack

**Frontend:** React 18 • React Router • Axios • Lucide Icons  
**Backend:** Node.js • Express • MySQL2  
**Security:** JWT • bcrypt • CORS

## 🚀 Quick Start

### 1. Database Setup
```bash
mysql -u root -p
CREATE DATABASE HMS;
exit

mysql -u root -p HMS < DDL.sql
mysql -u root -p HMS < InsertDML.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
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

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hospital.com | admin123 |
| **Doctor** | dr.williams@hospital.com | doctor123 |
| **Cashier** | cashier1@hospital.com | cashier123 |
| **Patient** | john.doe@example.com | patient123 |

## 📂 Project Structure

```
miniproject-dbms/
├── backend/           # Express API server
├── frontend/          # React application
├── DDL.sql           # Database schema
└── InsertDML.sql     # Sample data
```

## 🎯 Key Endpoints

- **Auth:** `/api/auth/login`, `/api/auth/register/*`
- **Patient:** `/api/patient/appointments`, `/api/patient/history`
- **Doctor:** `/api/doctor/appointments`, `/api/doctor/patients/:email/history`
- **Cashier:** `/api/cashier/billing`
- **Admin:** `/api/admin/users`, `/api/admin/stats`

## 🔒 Security

✅ Password hashing with bcrypt  
✅ JWT token authentication  
✅ Role-based access control  
✅ SQL injection prevention  
✅ CORS protection

## 📝 Development

```bash
# Backend with auto-reload
cd backend
npm run dev

# Frontend (already has hot reload)
cd frontend
npm start
```

## 📄 License

MIT License - Educational purposes

---

Made with ❤️ for healthcare management
