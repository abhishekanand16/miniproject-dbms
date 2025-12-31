# Hospital Management System - ER Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    Admin ||--o{ Appointment : manages
    Admin {
        VARCHAR email PK
        VARCHAR password
        VARCHAR name
        TIMESTAMP created_at
    }
    
    Patient ||--o{ PatientsAttendAppointments : attends
    Patient ||--o{ PatientsFillHistory : fills
    Patient ||--o{ Billing : "has bills"
    Patient {
        VARCHAR email PK
        VARCHAR password
        VARCHAR name
        TEXT address
        VARCHAR gender
        VARCHAR phone
        DATE date_of_birth
        TIMESTAMP created_at
    }
    
    Doctor ||--o{ DocsHaveSchedules : has
    Doctor ||--o{ Diagnose : diagnoses
    Doctor ||--o{ DoctorViewsHistory : views
    Doctor {
        VARCHAR email PK
        VARCHAR password
        VARCHAR name
        VARCHAR gender
        VARCHAR specialization
        VARCHAR phone
        TIMESTAMP created_at
    }
    
    Cashier ||--o{ Billing : processes
    Cashier {
        VARCHAR email PK
        VARCHAR password
        VARCHAR name
        VARCHAR phone
        TIMESTAMP created_at
    }
    
    Schedule ||--o{ DocsHaveSchedules : "assigned to"
    Schedule {
        INT id PK
        TIME starttime
        TIME endtime
        TIME breaktime
        VARCHAR day
    }
    
    MedicalHistory ||--o{ PatientsFillHistory : "filled by"
    MedicalHistory ||--o{ DoctorViewsHistory : "viewed by"
    MedicalHistory {
        INT id PK
        DATE date
        TEXT conditions
        TEXT surgeries
        TEXT medication
        TEXT allergies
        TIMESTAMP created_at
    }
    
    Appointment ||--o{ PatientsAttendAppointments : "attended by"
    Appointment ||--o{ Diagnose : "diagnosed in"
    Appointment ||--o{ Billing : "generates"
    Appointment {
        INT id PK
        DATE date
        TIME starttime
        TIME endtime
        VARCHAR status
        TIMESTAMP created_at
    }
    
    Billing {
        INT id PK
        INT appointment_id FK
        VARCHAR patient_email FK
        DECIMAL amount
        VARCHAR payment_status
        VARCHAR payment_method
        TIMESTAMP payment_date
        TIMESTAMP created_at
    }
    
    PatientsAttendAppointments {
        VARCHAR patient PK,FK
        INT appt PK,FK
        TEXT concerns
        TEXT symptoms
    }
    
    PatientsFillHistory {
        VARCHAR patient PK,FK
        INT history PK,FK
    }
    
    DocsHaveSchedules {
        INT sched PK,FK
        VARCHAR doctor PK,FK
    }
    
    Diagnose {
        INT appt PK,FK
        VARCHAR doctor PK,FK
        TEXT diagnosis
        TEXT prescription
        TEXT notes
        TIMESTAMP created_at
    }
    
    DoctorViewsHistory {
        INT history PK,FK
        VARCHAR doctor PK,FK
    }
```

## Entity Descriptions

### Core User Entities
- **Admin**: System administrators who manage users, appointments, and billing
- **Patient**: Patients who book appointments and maintain medical history
- **Doctor**: Medical professionals who diagnose patients and view medical history
- **Cashier**: Staff who process billing and payments

### Core Business Entities
- **Appointment**: Scheduled appointments between patients and doctors
- **Schedule**: Doctor availability schedules (time slots and days)
- **MedicalHistory**: Patient medical records including conditions, surgeries, medications, and allergies
- **Billing**: Payment records linked to appointments

### Relationship Entities (Junction Tables)
- **PatientsAttendAppointments**: Links patients to appointments with concerns and symptoms
- **PatientsFillHistory**: Links patients to their medical history records
- **DocsHaveSchedules**: Links doctors to their schedules
- **Diagnose**: Links doctors to appointments with diagnosis, prescription, and notes
- **DoctorViewsHistory**: Links doctors to medical history records they can view

## Relationship Cardinalities

1. **Patient ↔ Appointment**: Many-to-Many (via PatientsAttendAppointments)
   - One patient can have many appointments
   - One appointment can have one patient

2. **Patient ↔ MedicalHistory**: One-to-Many (via PatientsFillHistory)
   - One patient can have many medical history records
   - One medical history record belongs to one patient

3. **Doctor ↔ Schedule**: Many-to-Many (via DocsHaveSchedules)
   - One doctor can have many schedules
   - One schedule can belong to many doctors

4. **Doctor ↔ Appointment**: Many-to-Many (via Diagnose)
   - One doctor can diagnose many appointments
   - One appointment can be diagnosed by one doctor

5. **Doctor ↔ MedicalHistory**: Many-to-Many (via DoctorViewsHistory)
   - One doctor can view many medical history records
   - One medical history record can be viewed by many doctors

6. **Appointment ↔ Billing**: One-to-Many
   - One appointment can generate many bills
   - One bill belongs to one appointment

7. **Patient ↔ Billing**: One-to-Many
   - One patient can have many bills
   - One bill belongs to one patient

