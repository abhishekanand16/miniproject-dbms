-- Hospital Management System Database Schema
-- This script creates the hms_data database and all required tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hms_data;

-- Use the hms_data database
USE hms_data;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS Diagnose;
DROP TABLE IF EXISTS PatientsAttendAppointments;
DROP TABLE IF EXISTS DoctorViewsHistory;
DROP TABLE IF EXISTS PatientsFillHistory;
DROP TABLE IF EXISTS DocsHaveSchedules;
DROP TABLE IF EXISTS Appointment;
DROP TABLE IF EXISTS MedicalHistory;
DROP TABLE IF EXISTS Schedule;
DROP TABLE IF EXISTS Cashier;
DROP TABLE IF EXISTS Doctor;
DROP TABLE IF EXISTS Patient;
DROP TABLE IF EXISTS Admin;

-- Admin Table
CREATE TABLE Admin (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient Table
CREATE TABLE Patient (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    gender VARCHAR(10),
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Table
CREATE TABLE Doctor (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    specialization VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cashier Table
CREATE TABLE Cashier (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule Table
CREATE TABLE Schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    starttime TIME NOT NULL,
    endtime TIME NOT NULL,
    breaktime TIME,
    day VARCHAR(20) NOT NULL
);

-- Medical History Table
CREATE TABLE MedicalHistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    conditions TEXT,
    surgeries TEXT,
    medication TEXT,
    allergies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointment Table
CREATE TABLE Appointment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    starttime TIME NOT NULL,
    endtime TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'NotDone',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date_time (date, starttime, endtime)
);

-- Billing Table (for Cashier)
CREATE TABLE Billing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT,
    patient_email VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    payment_method VARCHAR(50),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_email) REFERENCES Patient(email) ON DELETE CASCADE
);

-- PatientsAttendAppointments Junction Table
CREATE TABLE PatientsAttendAppointments (
    patient VARCHAR(100),
    appt INT,
    concerns TEXT,
    symptoms TEXT,
    PRIMARY KEY (patient, appt),
    FOREIGN KEY (patient) REFERENCES Patient(email) ON DELETE CASCADE,
    FOREIGN KEY (appt) REFERENCES Appointment(id) ON DELETE CASCADE
);

-- PatientsFillHistory Junction Table
CREATE TABLE PatientsFillHistory (
    patient VARCHAR(100),
    history INT,
    PRIMARY KEY (history),
    FOREIGN KEY (patient) REFERENCES Patient(email) ON DELETE CASCADE,
    FOREIGN KEY (history) REFERENCES MedicalHistory(id) ON DELETE CASCADE
);

-- DocsHaveSchedules Junction Table
CREATE TABLE DocsHaveSchedules (
    sched INT,
    doctor VARCHAR(100),
    PRIMARY KEY (sched, doctor),
    FOREIGN KEY (sched) REFERENCES Schedule(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor) REFERENCES Doctor(email) ON DELETE CASCADE
);

-- Diagnose Table
CREATE TABLE Diagnose (
    appt INT,
    doctor VARCHAR(100),
    diagnosis TEXT NOT NULL,
    prescription TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (appt, doctor),
    FOREIGN KEY (appt) REFERENCES Appointment(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor) REFERENCES Doctor(email) ON DELETE CASCADE
);

-- DoctorViewsHistory Junction Table
CREATE TABLE DoctorViewsHistory (
    history INT,
    doctor VARCHAR(100),
    PRIMARY KEY (history, doctor),
    FOREIGN KEY (history) REFERENCES MedicalHistory(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor) REFERENCES Doctor(email) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_appointment_status ON Appointment(status);
CREATE INDEX idx_billing_patient ON Billing(patient_email);
CREATE INDEX idx_billing_status ON Billing(payment_status);
CREATE INDEX idx_doctor_email ON Doctor(email);
CREATE INDEX idx_patient_email ON Patient(email);

