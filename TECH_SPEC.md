## Project Technical Specification: HMS (Hospital Management System)

### Overview
HMS is a simple full‑stack web app for patients and doctors to manage appointments, diagnoses, and basic medical histories.

- Frontend: React (react-scripts), Grommet UI, React Router v5.
- Backend: Node.js, Express, MySQL driver.
- Database: MySQL with normalized schema for users, schedules, appointments, diagnoses, and patient medical history.
- Data flow: Frontend calls REST-like endpoints on the Express server; server queries MySQL and returns JSON.

### Repository Layout
- `backend/`: Express app exposing REST endpoints and using MySQL.
- `frontend/`: React app providing patient and doctor UIs.
- `DDL.sql`: MySQL schema creation script.
- `InsertDML.sql`: Sample/seed data for the schema.
- `Schemas&ER/*`: ER diagrams and schema visuals.

### Tech Stack
- Runtime: Node.js 12+ recommended
- Backend deps: express, mysql, cors, http-errors, jade (views), debug, morgan (dev)
- Frontend deps: react 16, react-router-dom 5, grommet 2, grommet-icons, styled-components, react-scripts 3
- DB: MySQL 5.7/8.0

### How to Run (Local)
1) Database
   - Create DB and schema:
     - Run `DDL.sql` then `InsertDML.sql` in a MySQL client.
   - Default connection used by backend (in `backend/app.js`):
     - host: `localhost`
     - user: `hathalye7`
     - password: `hrishikesh`
     - database: `HMS`
     - Update these for your environment.

2) Backend
   - From `backend/` run: `npm install` then `npm start`
   - Server default: `bin/www` sets port 2999, while `app.js` also starts on 3001. In practice, the code uses `app.listen(3001)` in `app.js` and the frontend calls `http://localhost:3001/...` endpoints.
   - Recommendation: Use only one listener; keep 3001 and do not run `bin/www` server, or remove `app.listen` and rely on `bin/www`.

3) Frontend
   - From `frontend/` run: `npm install` then `npm start`
   - App served on `http://localhost:3000` and talks to backend at `http://localhost:3001`.

### High-Level Architecture
- React SPA with routes for Patients and Doctors.
- Express API with endpoints grouped by feature: auth/session, account creation, appointments, diagnoses, history, schedules.
- MySQL schema with referential integrity and junction tables for many-to-many relations.

### Database Schema
Entities and relationships per `DDL.sql`:

- `Patient(email PK, password, name, address, gender)`
- `MedicalHistory(id PK, date, conditions, surgeries, medication)`
- `Doctor(email PK, gender, password, name)`
- `Appointment(id PK, date, starttime, endtime, status)`
- `PatientsAttendAppointments(patient FK→Patient.email, appt FK→Appointment.id, concerns, symptoms, PK(patient, appt))`
- `Schedule(id, starttime, endtime, breaktime, day, PK(id, starttime, endtime, breaktime, day))`
- `PatientsFillHistory(patient FK→Patient.email, history FK→MedicalHistory.id, PK(history))`
- `Diagnose(appt FK→Appointment.id, doctor FK→Doctor.email, diagnosis, prescription, PK(appt, doctor))`
- `DocsHaveSchedules(sched FK→Schedule.id, doctor FK→Doctor.email, PK(sched, doctor))`
- `DoctorViewsHistory(history FK→MedicalHistory.id, doctor FK→Doctor.email, PK(history, doctor))`

Seed data in `InsertDML.sql` creates sample patients, doctors, appointments, schedules, and diagnoses.

### Backend API (Express)
Base URL: `http://localhost:3001`

- Session/state (stored in-memory in `app.js`):
  - `GET /userInSession` → `{ email, who }` where `who ∈ {"pat","doc",""}`
  - `GET /endSession` → clears in-memory user state

- Account and auth
  - `GET /checkIfPatientExists?email` → rows from `Patient`
  - `GET /makeAccount?name&lastname&email&password&address&gender&conditions&medications&surgeries`
    - Inserts into `Patient`, creates `MedicalHistory`, and links via `PatientsFillHistory`
  - `GET /checkIfDocExists?email` → rows from `Doctor`
  - `GET /makeDocAccount?name&lastname&email&password&gender&schedule`
    - Inserts `Doctor` and `DocsHaveSchedules`
  - `GET /checklogin?email&password` → patient login; sets in-memory `{email_in_use,password_in_use,who="pat"}`
  - `GET /checkDoclogin?email&password` → doctor login; sets `{...,who="doc"}`
  - `POST /resetPasswordPatient?email&oldPassword&newPassword` → updates `Patient.password`
  - `POST /resetPasswordDoctor?email&oldPassword&newPassword` → updates `Doctor.password`

- Doctors and schedules
  - `GET /docInfo` → all doctors

- Medical history
  - `GET /OneHistory?patientEmail='email'` → joins to fetch one patient’s demographics and history
  - `GET /MedHistView?name&variable` → lists patients whose history is viewable by the logged-in doctor (via appointments)
  - `GET /allDiagnoses?patientEmail='email'` → list of a patient’s diagnosed appointments (join across `Appointment`, `PatientsAttendAppointments`, `Diagnose`)

- Appointments
  - `GET /genApptUID` → next appointment id (last id + 1)
  - `GET /checkIfApptExists?email&startTime&date&docEmail` → checks for conflicts:
    - existing patient appointment at same date/time
    - doctor overlap with existing `Diagnose`/`Appointment`
    - schedule compliance via `DocsHaveSchedules`/`Schedule` and `breaktime`
  - `GET /schedule?time&endTime&date&id&concerns&symptoms&doc` → creates `Appointment` and `Diagnose` placeholder
  - `GET /addToPatientSeeAppt?email&id&concerns&symptoms` → creates `PatientsAttendAppointments` link
  - `GET /getDateTimeOfAppt?id` → `{ start, end, theDate }` for an appointment
  - `GET /patientViewAppt?email` → a patient’s appointment list with status
  - `GET /doctorViewAppt` → appointments for the logged-in doctor
  - `GET /deleteAppt?uid` → conditional delete:
    - if `Appointment.status == "NotDone"`: delete `Appointment`
    - else if logged-in is patient: delete only their `PatientsAttendAppointments` link

- Diagnoses
  - `GET /diagnose?id&diagnosis&prescription` → updates `Diagnose`, marks `Appointment.status = "Done"`
  - `GET /showDiagnoses?id` → `Diagnose` row(s) for an appointment

Notes:
- Many endpoints accept query strings even for writes; no input validation; vulnerable to SQL injection.
- In-memory session variables (`email_in_use`, `who`) are global and per-process, not per-user; not safe for multi-user.

### Frontend Application (React)
Entry point: `frontend/src/index.js` → `App.js`.

Routing (`App.js`):
- Default route checks `GET /userInSession` then renders one of: `LogIn`, `Home` (patient), or `DocHome` (doctor).
- Routes:
  - `/` → conditional component from session check
  - `/Home` → patient dashboard with sidebar
  - `/PatientsViewAppt` → patient’s appointments table
  - `/scheduleAppt` → appointment scheduling flow
  - `/Settings` → patient password change
  - `/ViewOneHistory/:email` → patient profile + diagnoses timeline
  - `/NoMedHistFound` → fallback screen
  - `/createAcc` → patient account creation
  - `/MakeDoc` → doctor account creation
  - `/DocHome` → doctor dashboard with sidebar
  - `/ApptList` → doctor appointment list
  - `/Diagnose/:id` → doctor diagnosis form
  - `/DocSettings` → doctor password change
  - `/showDiagnoses/:id` → patient diagnosis view for appointment

Key screens and flows:
- LogIn (`logIn.js`):
  - If “I’m a doctor” checked, calls `/checkDoclogin`; else `/checklogin`. Redirects accordingly.
- CreateAccount (`CreateAccount.js`):
  - Checks `/checkIfPatientExists`; if none, calls `/makeAccount` and redirects to `/Home`.
- MakeDoc (`MakeDoc.js`):
  - Checks `/checkIfDocExists`; if none, calls `/makeDocAccount` then `/DocHome`.
- Home (patient) and DocHome (doctor):
  - Sidebar links for navigation; Sign Out calls `/endSession`.
- SchedulingAppt (`schedulingAppt.js`):
  - Picks doctor, date/time (1-hour slot inferred), enters concerns/symptoms.
  - Conflict check via `/checkIfApptExists`, then `/genApptUID`, then `/schedule`, then `/addToPatientSeeAppt`.
- PatientsViewAppt:
  - Lists appointments with date/time/concerns/symptoms/status.
  - “See Diagnosis” links to `/showDiagnoses/:id`.
  - Cancel/Delete triggers `/deleteAppt?uid=...`.
- DocViewAppt:
  - Lists doctor’s appointments; can “Diagnose” or cancel undiagnosed ones.
- Diagnose:
  - Submits diagnosis and prescription via `/diagnose`.
- ViewMedHist:
  - Lists patients whose histories are visible to the logged-in doctor (based on past/shared appointments).
- ViewOneHistory:
  - Shows patient demographic and medical history plus timeline of diagnoses from `/allDiagnoses`.
- Settings / DocSettings:
  - Password change via respective reset endpoints.

### Data Models (Frontend-facing shapes)
- Patient (from various endpoints): `{ email, name, address, gender }`
- Doctor: `{ email, name, gender }`
- Appointment (patient view `/patientViewAppt`): `{ ID, user, theConcerns, theSymptoms, theDate, theStart, theEnd, status }`
- Appointment (doctor view `/doctorViewAppt`): `{ id, date, starttime, status, name, concerns, symptoms }`
- Diagnose: `{ appt, doctor, diagnosis, prescription }`

### Security and Reliability Considerations
- SQL injection risk: string concatenation for SQL; no escaping or parameterized queries.
- Auth/session: in-memory globals, no cookies/tokens; not multi-user safe; no access control per endpoint.
- Passwords stored in plaintext; no hashing.
- Mixed server starts (`bin/www` vs `app.listen`) can cause port conflicts.
- Many write actions via GET; should be POST/PUT/DELETE.

### Recommendations for a New Implementation
- Use environment variables for DB connection; remove hardcoded credentials.
- Adopt parameterized queries or an ORM (e.g., Knex/Prisma/Sequelize).
- Implement proper auth (JWT or session cookies) and per-user sessions.
- Hash passwords (bcrypt/argon2) and enforce stronger validation.
- Use REST semantics and input validation (e.g., zod/yup/express-validator).
- Centralize error handling and return structured errors.
- Split router modules by feature; remove Jade if not used by SPA.
- Fix `/bin/www` vs `app.listen` duplication; choose one bootstrapping method.
- Add CORS config per environment; avoid wildcard in production.
- Add migrations and seed scripts.

### Re-creation Checklist for Similar Project
1) Stand up MySQL; create schema analogous to `DDL.sql`.
2) Scaffold Express API; implement endpoints documented above, but with parameterized queries and auth.
3) Scaffold React app with React Router; reproduce routes and screens described.
4) Implement appointment scheduling flow, conflict checks, and diagnosis submission.
5) Implement patient/doctor dashboards and history viewing.
6) Add password reset flows with hashed passwords.
7) Seed demo data similar to `InsertDML.sql`.
8) Add `.env` files and configs for local/dev/prod.

### Key Files to Reference
Backend code reference highlights:

```41:68:/Users/abhishek/Documents/GitHub/Mini-project-pull-req/backend/app.js
// Signup, login, and patient existence check
app.get('/checkIfPatientExists', (req, res) => { /* ... */ });
app.get('/makeAccount', (req, res) => { /* ... */ });
app.get('/checklogin', (req, res) => { /* ... */ });
```

```280:338:/Users/abhishek/Documents/GitHub/Mini-project-pull-req/backend/app.js
// Appointment clash check
app.get('/checkIfApptExists', (req, res) => { /* ... */ });
```

```532:565:/Users/abhishek/Documents/GitHub/Mini-project-pull-req/backend/app.js
// Diagnose and showDiagnoses
app.get('/diagnose', (req, res) => { /* ... */ });
app.get('/showDiagnoses', (req, res) => { /* ... */ });
```

Frontend route map:

```46:93:/Users/abhishek/Documents/GitHub/Mini-project-pull-req/frontend/src/App.js
// React Router routes
```

### Environment and Config
- Backend DB connection is hardcoded in `backend/app.js`; externalize to `.env`:
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT=3001`
- Frontend expects backend at `http://localhost:3001`; make this configurable via `.env` and `REACT_APP_API_BASE`.

### Known UX/Code Issues to Address When Rebuilding
- Duplicate `/showDiagnoses` endpoint defined twice in backend; remove duplicate.
- `bin/www` sets port 2999; `app.js` listens on 3001; unify server startup.
- Use POST for mutating operations.
- Add loading/error states in UI for fetch calls; avoid `window.location` navigations in favor of Router navigation.
- A few constructors misspell `constructor`.

### License/Attribution
No license provided; add one if open-sourcing.


