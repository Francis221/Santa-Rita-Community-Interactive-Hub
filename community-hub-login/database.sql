-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: login_system
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `login_system`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `login_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `login_system`;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'Official Notice',
  `date_info` varchar(100) DEFAULT NULL,
  `time_info` varchar(100) DEFAULT '9:00 AM',
  `location` varchar(255) DEFAULT 'Barangay Hall',
  `author` varchar(150) DEFAULT 'Barangay Admin',
  `content` text NOT NULL,
  `badge` varchar(50) DEFAULT 'Notice',
  `image` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doc_requests`
--

DROP TABLE IF EXISTS `doc_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doc_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_code` varchar(50) NOT NULL,
  `applicant_name` varchar(150) NOT NULL,
  `doc_type` varchar(100) NOT NULL,
  `document_name` varchar(100) NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `purpose` varchar(255) DEFAULT 'General Purpose',
  `address` varchar(255) DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT 'Single',
  `age` int(11) DEFAULT 25,
  `ctc_no` varchar(50) DEFAULT NULL,
  `or_no` varchar(50) DEFAULT NULL,
  `date_requested` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doc_requests`
--

LOCK TABLES `doc_requests` WRITE;
/*!40000 ALTER TABLE `doc_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `doc_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incident_reports`
--

DROP TABLE IF EXISTS `incident_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `incident_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_code` varchar(50) NOT NULL,
  `case_type` varchar(100) NOT NULL,
  `complainant` varchar(150) NOT NULL,
  `respondent` varchar(150) DEFAULT 'N/A',
  `purok` varchar(100) DEFAULT 'Purok 1',
  `status` varchar(50) DEFAULT 'Pending',
  `description` text DEFAULT NULL,
  `settlement_date` varchar(50) DEFAULT NULL,
  `settle_by` varchar(100) DEFAULT NULL,
  `resolution_summary` text DEFAULT NULL,
  `date_filed` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident_reports`
--

LOCK TABLES `incident_reports` WRITE;
/*!40000 ALTER TABLE `incident_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `incident_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_logs`
--

DROP TABLE IF EXISTS `login_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `role` varchar(50) DEFAULT 'Resident',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `login_time` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `login_time` (`login_time`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_logs`
--

LOCK TABLES `login_logs` WRITE;
/*!40000 ALTER TABLE `login_logs` DISABLE KEYS */;
INSERT INTO `login_logs` VALUES (1,5,'kyla','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:29:03'),(2,2,'justinryan','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:32:22'),(3,2,'justinryan','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:39:26'),(4,5,'kyla','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:41:25'),(5,2,'justinryan','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:41:37'),(6,3,'admin','Admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:47:29'),(7,3,'admin','Admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:49:28'),(8,2,'justinryan','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:49:32'),(9,5,'kyla','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:49:37'),(10,3,'admin','Admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-10 03:51:55'),(11,2,'justinryan','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-11 00:28:54'),(12,2,'justinryan','Resident','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36','2026-10-11 00:40:57');
/*!40000 ALTER TABLE `login_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `conversation_id` varchar(100) DEFAULT NULL,
  `text` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `conversation_id` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'Resident',
  `reset_code` varchar(6) DEFAULT NULL,
  `reset_code_expires` datetime DEFAULT NULL,
  `reset_verified` tinyint(1) DEFAULT 0,
  `reset_attempts` int(11) DEFAULT 0,
  `avatar` longtext DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `last_active` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'francis','francis@example.com','$2y$10$IVd67NdmqDPVhr4LIeJhEeqit3hnnjshJsvyUx2i59dx0j6HYEJeW','Admin',NULL,NULL,0,0,NULL,0,'2026-10-10 03:18:02'),(2,'justinryan','deguzmanfrancis50@gmail.com','$2y$10$tkKNurD8fL4QSxm/36qmhOETunDr89bAwd1NdVfYb0X1b8ZKRNhtG','Resident',NULL,NULL,0,0,NULL,1,'2026-10-11 00:41:06'),(3,'admin','admin@barangay.gov.ph','$2y$10$74mYsJz4owke47HoK7nEVefNIQtBfCFJJTLA7rb3TvZG/uR1C3ife','Admin',NULL,NULL,0,0,NULL,0,'2026-10-11 00:31:29'),(4,'testresident','testresident@example.com','$2y$10$AT7LYq55/0UaMeO4JTSeMeGaRlTArGH26JoQb7lBKljf8cZ3kZeJq','Resident',NULL,NULL,0,0,NULL,0,'2026-10-10 03:18:02'),(5,'kyla','kylamovido5@gmail.com','$2y$10$1AqiqzrBt4OYnVIqLVGQr.Amlq7gzCq6TaFWqeTLWOqEmDYp5i8wy','Resident','930640','2026-10-05 01:04:25',0,0,'data:image/jpeg;base64,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',0,'2026-10-10 03:59:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-11  0:45:27
