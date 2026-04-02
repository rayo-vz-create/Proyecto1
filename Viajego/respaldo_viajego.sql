-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: viajego_db
-- ------------------------------------------------------
-- Server version	8.0.45

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

--
-- Table structure for table `hoteles`
--

DROP TABLE IF EXISTS `hoteles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoteles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estrellas` int NOT NULL,
  `precio_noche` decimal(10,2) NOT NULL,
  `servicios` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_habitacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'EstÃ¡ndar',
  `capacidad_max` int DEFAULT '4',
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `hoteles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoteles`
--

LOCK TABLES `hoteles` WRITE;
/*!40000 ALTER TABLE `hoteles` DISABLE KEYS */;
INSERT INTO `hoteles` VALUES (1,'Grand Oasis CancÃºn','CancÃºn',5,3500.00,'Alberca, Wifi, Buffet, Playa Privada','Doble',4,NULL,3),(2,'Hotel Riu Plaza','Guadalajara',4,1800.50,'Wifi, Gimnasio, Desayuno','EstÃ¡ndar',4,NULL,3),(3,'Fiesta Americana','Ciudad de MÃ©xico',5,4200.00,'Spa, Centro de Negocios, Gym','Suite',4,NULL,3),(4,'Posada Real','Puerto Vallarta',3,1200.00,'Wifi, Alberca','EstÃ¡ndar',4,NULL,3),(5,'Hotel MisiÃ³n','Monterrey',4,2100.00,'Estacionamiento, Wifi, Restaurante','Doble',4,NULL,3);
/*!40000 ALTER TABLE `hoteles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reservation_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_start` date NOT NULL,
  `date_end` date NOT NULL,
  `num_guests` int DEFAULT '1',
  `details_json` json DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Confirmado',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservation_code` (`reservation_code`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rutas_autobus`
--

DROP TABLE IF EXISTS `rutas_autobus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rutas_autobus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `origen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destino` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `linea_autobus` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_asiento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `asientos_disponibles` int DEFAULT '40',
  `fecha_salida` datetime NOT NULL,
  `fecha_llegada` datetime NOT NULL,
  `fecha_regreso_salida` datetime NOT NULL,
  `fecha_regreso_llegada` datetime NOT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `rutas_autobus_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rutas_autobus`
--

LOCK TABLES `rutas_autobus` WRITE;
/*!40000 ALTER TABLE `rutas_autobus` DISABLE KEYS */;
INSERT INTO `rutas_autobus` VALUES (1,'CDMX','Acapulco','ETN','Lujo',850.00,40,'2025-12-01 08:00:00','2025-12-01 13:00:00','2025-12-03 10:00:00','2025-12-03 15:00:00',NULL,4),(2,'Guadalajara','Puerto Vallarta','ETN','Ejecutivo',950.00,40,'2025-12-10 09:00:00','2025-12-10 14:00:00','2025-12-15 11:00:00','2025-12-15 16:00:00',NULL,4),(3,'Monterrey','MazatlÃ¡n','ETN','EstÃ¡ndar',1200.00,40,'2026-01-05 20:00:00','2026-01-06 06:00:00','2026-01-10 18:00:00','2026-01-11 04:00:00',NULL,4);
/*!40000 ALTER TABLE `rutas_autobus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'usuario',
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_comercial` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `double_auth_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@viajego.com','admin123','admin','Super Admin',NULL,NULL,'2026-02-27 19:32:45',NULL),(2,'ventas@aerovia.com','123456','agencia',NULL,NULL,'AerovÃ­a MÃ©xico','2026-02-27 19:32:45',NULL),(3,'reservas@solcaribe.com','123456','agencia',NULL,NULL,'Sol Caribe Hotels','2026-02-27 19:32:45',NULL),(4,'contacto@etn.com','123456','agencia',NULL,NULL,'ETN Turistar','2026-02-27 19:32:45',NULL),(5,'cliente@gmail.com','123456','usuario','Juan','PÃ©rez',NULL,'2026-02-27 19:32:45',NULL),(6,'brayan@gmail.com','123','usuario','brayan',NULL,NULL,'2026-02-27 19:46:57',NULL),(7,'misael-@hotmail.com','123','usuario','Misael',NULL,NULL,'2026-02-27 19:54:06',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vuelos`
--

DROP TABLE IF EXISTS `vuelos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vuelos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_vuelo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `origen_iata` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destino_iata` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aerolinea` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clase_base` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `asientos_disponibles` int NOT NULL DEFAULT '40',
  `fecha_salida` datetime NOT NULL,
  `fecha_llegada` datetime NOT NULL,
  `fecha_regreso_salida` datetime NOT NULL,
  `fecha_regreso_llegada` datetime NOT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `vuelos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vuelos`
--

LOCK TABLES `vuelos` WRITE;
/*!40000 ALTER TABLE `vuelos` DISABLE KEYS */;
INSERT INTO `vuelos` VALUES (1,'AM100','CDMX','CUN','AerovÃ­a','EconÃ³mica',2500.50,40,'2026-03-10 08:00:00','2026-03-10 11:00:00','2026-03-15 18:00:00','2026-03-15 21:00:00',NULL,2),(2,'AM202','MTY','CUN','AerovÃ­a','EconÃ³mica',2100.00,40,'2026-04-01 09:00:00','2026-04-01 12:30:00','2026-04-05 14:00:00','2026-04-05 17:30:00',NULL,2),(3,'AM505','GDL','TIJ','AerovÃ­a','Ejecutiva',3200.00,40,'2026-05-20 07:00:00','2026-05-20 09:00:00','2026-05-25 10:00:00','2026-05-25 12:00:00',NULL,2),(4,'AM800','CUN','CDMX','AerovÃ­a','Primera',4500.00,40,'2026-06-15 16:00:00','2026-06-15 19:00:00','2026-06-20 08:00:00','2026-06-20 11:00:00',NULL,2);
/*!40000 ALTER TABLE `vuelos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-27 20:08:14
