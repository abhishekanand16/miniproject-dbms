# Quick Start Guide - HMS Database Setup

## Setup Steps

### 1. Install MySQL (if not already installed)
Make sure MySQL is installed and running on your system.

### 2. Run the Database Setup Script
```bash
cd /Users/abhishek/Documents/GitHub/miniproject-dbms
node setup_database.js
```

This will create the `hms_data` database and all tables.

### 3. (Optional) Load Sample Data
```bash
mysql -uroot -proot123 hms_data < InsertDML.sql
```

### 4. Configure Backend Environment
```bash
cd backend
cp env.example .env
```

The `.env` file is already configured with:
- DB_NAME=hms_data
- DB_PASSWORD=root123

### 5. Start the Backend
```bash
cd backend
npm install  # If needed
npm start
```

## Verify Setup

Check that the database exists:
```bash
mysql -uroot -proot123 -e "SHOW DATABASES LIKE 'hms_data';"
```

Check that tables are created:
```bash
mysql -uroot -proot123 -e "USE hms_data; SHOW TABLES;"
```

