-- MySQL dump 10.13  Distrib 9.5.0, for macos26.0 (arm64)
--
-- Host: localhost    Database: hms_data
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '172fb6ee-b599-11f0-8376-f70e5ead4862:1-106';

--
-- Table structure for table `Admin`
--

DROP TABLE IF EXISTS `Admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin` (
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `Admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Appointment`
--

DROP TABLE IF EXISTS `Appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Appointment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `starttime` time NOT NULL,
  `endtime` time NOT NULL,
  `status` varchar(20) DEFAULT 'NotDone',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_date_time` (`date`,`starttime`,`endtime`),
  KEY `idx_appointment_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Appointment`
--

LOCK TABLES `Appointment` WRITE;
/*!40000 ALTER TABLE `Appointment` DISABLE KEYS */;
INSERT INTO `Appointment` VALUES (1,'2025-11-15','10:00:00','11:00:00','Done','2025-11-03 18:20:18'),(2,'2025-11-16','14:00:00','15:00:00','NotDone','2025-11-03 18:20:18'),(3,'2025-11-17','09:00:00','10:00:00','NotDone','2025-11-03 18:20:18'),(4,'2025-11-15','11:00:00','12:00:00','Done','2025-11-03 18:20:18');
/*!40000 ALTER TABLE `Appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Billing`
--

DROP TABLE IF EXISTS `Billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Billing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `patient_email` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_status` varchar(20) DEFAULT 'Pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `idx_billing_patient` (`patient_email`),
  KEY `idx_billing_status` (`payment_status`),
  CONSTRAINT `billing_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `Appointment` (`id`) ON DELETE SET NULL,
  CONSTRAINT `billing_ibfk_2` FOREIGN KEY (`patient_email`) REFERENCES `Patient` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Billing`
--

LOCK TABLES `Billing` WRITE;
/*!40000 ALTER TABLE `Billing` DISABLE KEYS */;
/*!40000 ALTER TABLE `Billing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Cashier`
--

DROP TABLE IF EXISTS `Cashier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cashier` (
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cashier`
--

LOCK TABLES `Cashier` WRITE;
/*!40000 ALTER TABLE `Cashier` DISABLE KEYS */;
/*!40000 ALTER TABLE `Cashier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Diagnose`
--

DROP TABLE IF EXISTS `Diagnose`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Diagnose` (
  `appt` int NOT NULL,
  `doctor` varchar(100) NOT NULL,
  `diagnosis` text NOT NULL,
  `prescription` text,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`appt`,`doctor`),
  KEY `doctor` (`doctor`),
  CONSTRAINT `diagnose_ibfk_1` FOREIGN KEY (`appt`) REFERENCES `Appointment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `diagnose_ibfk_2` FOREIGN KEY (`doctor`) REFERENCES `Doctor` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Diagnose`
--

LOCK TABLES `Diagnose` WRITE;
/*!40000 ALTER TABLE `Diagnose` DISABLE KEYS */;
/*!40000 ALTER TABLE `Diagnose` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DocsHaveSchedules`
--

DROP TABLE IF EXISTS `DocsHaveSchedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DocsHaveSchedules` (
  `sched` int NOT NULL,
  `doctor` varchar(100) NOT NULL,
  PRIMARY KEY (`sched`,`doctor`),
  KEY `doctor` (`doctor`),
  CONSTRAINT `docshaveschedules_ibfk_1` FOREIGN KEY (`sched`) REFERENCES `Schedule` (`id`) ON DELETE CASCADE,
  CONSTRAINT `docshaveschedules_ibfk_2` FOREIGN KEY (`doctor`) REFERENCES `Doctor` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DocsHaveSchedules`
--

LOCK TABLES `DocsHaveSchedules` WRITE;
/*!40000 ALTER TABLE `DocsHaveSchedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `DocsHaveSchedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Doctor`
--

DROP TABLE IF EXISTS `Doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Doctor` (
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`),
  KEY `idx_doctor_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Doctor`
--

LOCK TABLES `Doctor` WRITE;
/*!40000 ALTER TABLE `Doctor` DISABLE KEYS */;
/*!40000 ALTER TABLE `Doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoctorViewsHistory`
--

DROP TABLE IF EXISTS `DoctorViewsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoctorViewsHistory` (
  `history` int NOT NULL,
  `doctor` varchar(100) NOT NULL,
  PRIMARY KEY (`history`,`doctor`),
  KEY `doctor` (`doctor`),
  CONSTRAINT `doctorviewshistory_ibfk_1` FOREIGN KEY (`history`) REFERENCES `MedicalHistory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doctorviewshistory_ibfk_2` FOREIGN KEY (`doctor`) REFERENCES `Doctor` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoctorViewsHistory`
--

LOCK TABLES `DoctorViewsHistory` WRITE;
/*!40000 ALTER TABLE `DoctorViewsHistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `DoctorViewsHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MedicalHistory`
--

DROP TABLE IF EXISTS `MedicalHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MedicalHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `conditions` text,
  `surgeries` text,
  `medication` text,
  `allergies` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MedicalHistory`
--

LOCK TABLES `MedicalHistory` WRITE;
/*!40000 ALTER TABLE `MedicalHistory` DISABLE KEYS */;
INSERT INTO `MedicalHistory` VALUES (1,'2020-01-15','Hypertension','None','Lisinopril 10mg daily','None','2025-11-03 18:20:18'),(2,'2019-05-20','Type 2 Diabetes','Appendix removal (2010)','Metformin 500mg twice daily','Penicillin','2025-11-03 18:20:18'),(3,'2021-03-10','Asthma','None','Albuterol inhaler as needed','Dust mites','2025-11-03 18:20:18');
/*!40000 ALTER TABLE `MedicalHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Patient`
--

DROP TABLE IF EXISTS `Patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patient` (
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text,
  `gender` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`),
  KEY `idx_patient_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Patient`
--

LOCK TABLES `Patient` WRITE;
/*!40000 ALTER TABLE `Patient` DISABLE KEYS */;
/*!40000 ALTER TABLE `Patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PatientsAttendAppointments`
--

DROP TABLE IF EXISTS `PatientsAttendAppointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PatientsAttendAppointments` (
  `patient` varchar(100) NOT NULL,
  `appt` int NOT NULL,
  `concerns` text,
  `symptoms` text,
  PRIMARY KEY (`patient`,`appt`),
  KEY `appt` (`appt`),
  CONSTRAINT `patientsattendappointments_ibfk_1` FOREIGN KEY (`patient`) REFERENCES `Patient` (`email`) ON DELETE CASCADE,
  CONSTRAINT `patientsattendappointments_ibfk_2` FOREIGN KEY (`appt`) REFERENCES `Appointment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PatientsAttendAppointments`
--

LOCK TABLES `PatientsAttendAppointments` WRITE;
/*!40000 ALTER TABLE `PatientsAttendAppointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `PatientsAttendAppointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PatientsFillHistory`
--

DROP TABLE IF EXISTS `PatientsFillHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PatientsFillHistory` (
  `patient` varchar(100) DEFAULT NULL,
  `history` int NOT NULL,
  PRIMARY KEY (`history`),
  KEY `patient` (`patient`),
  CONSTRAINT `patientsfillhistory_ibfk_1` FOREIGN KEY (`patient`) REFERENCES `Patient` (`email`) ON DELETE CASCADE,
  CONSTRAINT `patientsfillhistory_ibfk_2` FOREIGN KEY (`history`) REFERENCES `MedicalHistory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PatientsFillHistory`
--

LOCK TABLES `PatientsFillHistory` WRITE;
/*!40000 ALTER TABLE `PatientsFillHistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `PatientsFillHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Schedule`
--

DROP TABLE IF EXISTS `Schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `starttime` time NOT NULL,
  `endtime` time NOT NULL,
  `breaktime` time DEFAULT NULL,
  `day` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Schedule`
--

LOCK TABLES `Schedule` WRITE;
/*!40000 ALTER TABLE `Schedule` DISABLE KEYS */;
INSERT INTO `Schedule` VALUES (1,'09:00:00','17:00:00','12:00:00','Monday'),(2,'09:00:00','17:00:00','12:00:00','Tuesday'),(3,'09:00:00','17:00:00','12:00:00','Wednesday'),(4,'09:00:00','17:00:00','12:00:00','Thursday'),(5,'09:00:00','17:00:00','12:00:00','Friday'),(6,'10:00:00','14:00:00','12:00:00','Saturday');
/*!40000 ALTER TABLE `Schedule` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-04  9:55:52
