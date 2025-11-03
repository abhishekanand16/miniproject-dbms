# Database Setup and Data Storage Information

## Database Configuration

- **Database Name**: `hms_data`
- **MySQL Host**: `localhost`
- **MySQL User**: `root`
- **MySQL Password**: `root123`

## Where Your Data is Stored

### MySQL Data Storage Location

MySQL stores all database data in its data directory. The location depends on your operating system:

#### macOS (Your System)
- **Default Location**: `/usr/local/var/mysql/` or `/opt/homebrew/var/mysql/`
- **Database Files**: `/usr/local/var/mysql/hms_data/` or `/opt/homebrew/var/mysql/hms_data/`

#### Linux
- **Default Location**: `/var/lib/mysql/`
- **Database Files**: `/var/lib/mysql/hms_data/`

#### Windows
- **Default Location**: `C:\ProgramData\MySQL\MySQL Server X.X\Data\`
- **Database Files**: `C:\ProgramData\MySQL\MySQL Server X.X\Data\hms_data\`

### What Gets Stored in hms_data Database

When you enter data through your website, it gets stored in the following tables in the `hms_data` database:

1. **Admin** - Admin user accounts
2. **Patient** - Patient information and credentials
3. **Doctor** - Doctor information and credentials
4. **Cashier** - Cashier information and credentials
5. **Appointment** - All appointment records
6. **MedicalHistory** - Patient medical history records
7. **Schedule** - Doctor schedules
8. **Billing** - Payment and billing records
9. **Diagnose** - Doctor diagnoses and prescriptions
10. **PatientsAttendAppointments** - Links patients to appointments
11. **PatientsFillHistory** - Links patients to medical history
12. **DocsHaveSchedules** - Links doctors to schedules
13. **DoctorViewsHistory** - Links doctors to patient history they can view

### Data Flow

1. **Frontend (Website)** → Sends HTTP requests to backend API
2. **Backend (server.js)** → Processes requests and connects to MySQL
3. **MySQL Database (hms_data)** → Stores all data persistently
4. **Data Files** → Physically stored in MySQL data directory on your disk

### How to Find Your MySQL Data Directory

Run this command in your terminal to find your MySQL data directory:

```bash
mysql -uroot -proot123 -e "SHOW VARIABLES LIKE 'datadir';"
```

Or check MySQL configuration:

```bash
mysql --help | grep "Default options" -A 1
```

## Setup Instructions

### Step 1: Install Dependencies (if not already done)

```bash
cd /Users/abhishek/Documents/GitHub/miniproject-dbms
npm install
```

### Step 2: Ensure MySQL is Running

On macOS:
```bash
# Check if MySQL is running
mysqladmin -uroot -proot123 ping

# If not running, start it:
brew services start mysql
# OR
mysql.server start
```

### Step 3: Create the Database and Tables

Run the setup script:

```bash
cd /Users/abhishek/Documents/GitHub/miniproject-dbms
node setup_database.js
```

This will:
- Create the `hms_data` database if it doesn't exist
- Create all required tables
- Set up the database schema

**Note:** On macOS, MySQL typically uses socket connections (`/tmp/mysql.sock`) rather than TCP. The setup script handles this automatically.

### Step 4: Load Sample Data (Optional)

If you want to load sample data:

```bash
mysql -uroot -proot123 hms_data < InsertDML.sql
```

### Step 5: Configure Backend

The backend is already configured to use:
- Database: `hms_data`
- Password: `root123`

If you need to create a `.env` file in the backend directory:

```bash
cd backend
cp env.example .env
```

The `.env` file should contain:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root123
DB_NAME=hms_data
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

### Step 6: Start the Backend Server

```bash
cd backend
npm install  # If not already done
npm start    # or npm run dev for development
```

## Verification

To verify the database is set up correctly:

```bash
mysql -uroot -proot123 -e "USE hms_data; SHOW TABLES;"
```

You should see all 13 tables listed.

## Important Notes

1. **Isolation**: All data is stored ONLY in the `hms_data` database. The application will not access any other databases.

2. **Backup**: To backup your data:
   ```bash
   mysqldump -uroot -proot123 hms_data > backup.sql
   ```

3. **Restore**: To restore from backup:
   ```bash
   mysql -uroot -proot123 hms_data < backup.sql
   ```

4. **Security**: The password `root123` is configured for development. For production, use a strong password and update the `.env` file accordingly.

