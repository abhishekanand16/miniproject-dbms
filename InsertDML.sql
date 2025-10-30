-- Hospital Management System Seed Data
-- Insert sample data for testing

-- Admin Account (Default credentials: admin@hospital.com / admin123)
-- Note: Password will be automatically hashed on first login
INSERT INTO Admin (email, password, name) VALUES
('admin@hospital.com', 'admin123', 'System Administrator');

-- Sample Patients
-- Note: Passwords will be automatically hashed on first login
-- Default password: patient123
INSERT INTO Patient (email, password, name, address, gender, phone, date_of_birth) VALUES
('john.doe@example.com', 'patient123', 'John Doe', '123 Main St, City', 'Male', '123-456-7890', '1990-05-15'),
('jane.smith@example.com', 'patient123', 'Jane Smith', '456 Oak Ave, City', 'Female', '123-456-7891', '1985-08-20'),
('mike.johnson@example.com', 'patient123', 'Mike Johnson', '789 Pine Rd, City', 'Male', '123-456-7892', '1992-11-10');

-- Sample Doctors
-- Note: Passwords will be automatically hashed on first login
-- Default password: doctor123
INSERT INTO Doctor (email, password, name, gender, specialization, phone) VALUES
('dr.williams@hospital.com', 'doctor123', 'Dr. Sarah Williams', 'Female', 'Cardiology', '555-0101'),
('dr.brown@hospital.com', 'doctor123', 'Dr. Michael Brown', 'Male', 'Pediatrics', '555-0102'),
('dr.davis@hospital.com', 'doctor123', 'Dr. Emily Davis', 'Female', 'Dermatology', '555-0103');

-- Sample Cashiers
-- Note: Passwords will be automatically hashed on first login
-- Default password: cashier123
INSERT INTO Cashier (email, password, name, phone) VALUES
('cashier1@hospital.com', 'cashier123', 'Lisa Anderson', '555-0201'),
('cashier2@hospital.com', 'cashier123', 'Robert Taylor', '555-0202');

-- Sample Schedules
INSERT INTO Schedule (starttime, endtime, breaktime, day) VALUES
('09:00:00', '17:00:00', '12:00:00', 'Monday'),
('09:00:00', '17:00:00', '12:00:00', 'Tuesday'),
('09:00:00', '17:00:00', '12:00:00', 'Wednesday'),
('09:00:00', '17:00:00', '12:00:00', 'Thursday'),
('09:00:00', '17:00:00', '12:00:00', 'Friday'),
('10:00:00', '14:00:00', '12:00:00', 'Saturday');

-- Link Doctors to Schedules
INSERT INTO DocsHaveSchedules (sched, doctor) VALUES
(1, 'dr.williams@hospital.com'),
(2, 'dr.williams@hospital.com'),
(3, 'dr.williams@hospital.com'),
(4, 'dr.brown@hospital.com'),
(5, 'dr.brown@hospital.com'),
(6, 'dr.davis@hospital.com');

-- Sample Medical History
INSERT INTO MedicalHistory (date, conditions, surgeries, medication, allergies) VALUES
('2020-01-15', 'Hypertension', 'None', 'Lisinopril 10mg daily', 'None'),
('2019-05-20', 'Type 2 Diabetes', 'Appendix removal (2010)', 'Metformin 500mg twice daily', 'Penicillin'),
('2021-03-10', 'Asthma', 'None', 'Albuterol inhaler as needed', 'Dust mites');

-- Link Patients to Medical History
INSERT INTO PatientsFillHistory (patient, history) VALUES
('john.doe@example.com', 1),
('jane.smith@example.com', 2),
('mike.johnson@example.com', 3);

-- Sample Appointments
INSERT INTO Appointment (date, starttime, endtime, status) VALUES
('2025-11-15', '10:00:00', '11:00:00', 'Done'),
('2025-11-16', '14:00:00', '15:00:00', 'NotDone'),
('2025-11-17', '09:00:00', '10:00:00', 'NotDone'),
('2025-11-15', '11:00:00', '12:00:00', 'Done');

-- Link Patients to Appointments
INSERT INTO PatientsAttendAppointments (patient, appt, concerns, symptoms) VALUES
('john.doe@example.com', 1, 'Chest pain', 'Shortness of breath, chest discomfort'),
('jane.smith@example.com', 2, 'Regular checkup', 'None'),
('mike.johnson@example.com', 3, 'Skin rash', 'Itchy red patches on arms'),
('john.doe@example.com', 4, 'Follow-up', 'Feeling better');

-- Sample Diagnoses
INSERT INTO Diagnose (appt, doctor, diagnosis, prescription, notes) VALUES
(1, 'dr.williams@hospital.com', 'Chest pain likely due to stress. ECG normal.', 'Rest, stress management exercises', 'Patient advised to follow up if symptoms persist'),
(4, 'dr.williams@hospital.com', 'Patient showing improvement', 'Continue current medication', 'Schedule follow-up in 3 months');

-- Sample Billing Records
INSERT INTO Billing (appointment_id, patient_email, amount, payment_status, payment_method, payment_date) VALUES
(1, 'john.doe@example.com', 150.00, 'Paid', 'Credit Card', '2025-11-15 10:30:00'),
(2, 'jane.smith@example.com', 200.00, 'Pending', NULL, NULL),
(4, 'john.doe@example.com', 100.00, 'Paid', 'Cash', '2025-11-15 11:15:00');

-- Link Doctors to Medical History (for viewing)
INSERT INTO DoctorViewsHistory (history, doctor) VALUES
(1, 'dr.williams@hospital.com'),
(2, 'dr.brown@hospital.com'),
(3, 'dr.davis@hospital.com');

