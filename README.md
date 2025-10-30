# Hospital Management System (HMS)

A complete full-stack Hospital Management System built with React, Express, and MySQL. Features role-based access control for Patients, Doctors, Cashiers, and Administrators.

## 🎨 Features

- **Modern UI**: Vibrant colors, rounded corners, and smooth animations
- **Role-Based Access**: Separate dashboards for Patient, Doctor, Cashier, and Admin
- **Secure Authentication**: JWT-based authentication with password hashing
- **Patient Features**: Schedule appointments, view medical history
- **Doctor Features**: View appointments, diagnose patients, update medical records
- **Cashier Features**: Manage billing records, process payments
- **Admin Features**: Manage all users, appointments, and billing records

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Lucide React
- **Backend**: Node.js, Express, MySQL2
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🚀 Setup Instructions

### 1. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE HMS;
```

2. Run the DDL script to create tables:
```bash
mysql -u root -p HMS < DDL.sql
```

3. Run the DML script to insert sample data:
```bash
mysql -u root -p HMS < InsertDML.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=HMS
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Default Login Credentials

### Admin
- **Email**: `admin@hospital.com`
- **Password**: `admin123`
- **Note**: Password will be automatically hashed on first login

### Patient
- **Email**: `john.doe@example.com`
- **Password**: `patient123`

### Doctor
- **Email**: `dr.williams@hospital.com`
- **Password**: `doctor123`

### Cashier
- **Email**: `cashier1@hospital.com`
- **Password**: `cashier123`

**Note**: All passwords will be automatically hashed when users log in for the first time.

## 📁 Project Structure

```
miniproject-dbms/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/     # Admin dashboard
│   │   │   ├── patient/   # Patient dashboard
│   │   │   ├── doctor/    # Doctor dashboard
│   │   │   ├── cashier/   # Cashier dashboard
│   │   │   └── auth/      # Login component
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── public/
│   └── package.json       # Frontend dependencies
├── DDL.sql                # Database schema
├── InsertDML.sql          # Sample data
└── README.md              # This file
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register/patient` - Register patient
- `POST /api/auth/register/doctor` - Register doctor (Admin only)
- `POST /api/auth/register/cashier` - Register cashier (Admin only)
- `GET /api/auth/me` - Get current user

### Patient
- `GET /api/patient/appointments` - Get patient appointments
- `GET /api/patient/history` - Get medical history
- `POST /api/patient/appointments` - Schedule appointment

### Doctor
- `GET /api/doctor/appointments` - Get doctor appointments
- `PUT /api/doctor/appointments/:id/diagnosis` - Update diagnosis
- `GET /api/doctor/patients/:email/history` - View patient history

### Cashier
- `GET /api/cashier/billing` - Get billing records
- `POST /api/cashier/billing` - Create billing record
- `PUT /api/cashier/billing/:id/payment` - Update payment status

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/billing` - Get all billing records
- `GET /api/admin/stats` - Get dashboard statistics
- `DELETE /api/admin/users/:role/:email` - Delete user
- `PUT /api/admin/users/:role/:email` - Update user

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds, rounded corners, smooth animations
- **Responsive**: Works on desktop and mobile devices
- **Colorful**: Vibrant color scheme with purple/blue gradients
- **Interactive**: Hover effects, modals, and smooth transitions
- **Role-Based**: Each role has a unique dashboard design

## 🔒 Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Role-based access control
- Parameterized SQL queries (prevents SQL injection)
- CORS configuration

## 📝 Notes

- The backend automatically hashes passwords on first login if they're stored in plain text
- All API endpoints require authentication except login and registration
- Admin can create doctors and cashiers
- Patients can register themselves
- The system uses MySQL connection pooling for better performance

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check `.env` file has correct database credentials
- Verify database `HMS` exists

### Port Already in Use
- Change `PORT` in backend `.env` file
- Update frontend API calls if you change the port

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend `.env`
- Verify token is being sent in request headers

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

To run in development mode with auto-reload:
```bash
# Backend
cd backend
npm install nodemon --save-dev
npm run dev

# Frontend (already has hot reload)
cd frontend
npm start
```

## 🎉 Enjoy!

Your Hospital Management System is ready to use! Start by logging in as admin to manage the system.
