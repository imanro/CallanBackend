-- MySQL dump 10.16  Distrib 10.2.11-MariaDB, for osx10.12 (x86_64)
--
-- Host: localhost    Database: callan_english
-- ------------------------------------------------------
-- Server version	10.2.11-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ACL`
--

DROP TABLE IF EXISTS `ACL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ACL` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(512) DEFAULT NULL,
  `property` varchar(512) DEFAULT NULL,
  `accessType` varchar(512) DEFAULT NULL,
  `permission` varchar(512) DEFAULT NULL,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ACL`
--

LOCK TABLES `ACL` WRITE;
/*!40000 ALTER TABLE `ACL` DISABLE KEYS */;
/*!40000 ALTER TABLE `ACL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AccessToken`
--

DROP TABLE IF EXISTS `AccessToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccessToken` (
  `id` varchar(255) NOT NULL,
  `ttl` int(11) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccessToken`
--

LOCK TABLES `AccessToken` WRITE;
/*!40000 ALTER TABLE `AccessToken` DISABLE KEYS */;
INSERT INTO `AccessToken` VALUES ('1SrMCcJ2oM6fWNCdfXmLXS6PPexfBZZ9U6ZKuJcyGcefXvqfGjK60AuDAKJE9hWH',86400,NULL,'2018-10-18 15:30:01',2),('8uebWAtu80tHACc5FhLrhmsR90j8A7KenjQxV8pmCR0fQUO9XxqQhO5NHpo1xqM5',86400,NULL,'2018-10-18 15:44:48',2),('98Js3PF555R0I6XFnO4ZacEZ4O6GUOSPeWFzvE4ogCFWTuvzOqzSFgSkb9kVL17L',86400,NULL,'2018-10-18 15:14:32',2),('9OYHPdyblopRjNHNyrxqKwBXcy35Ugk8h7pgPDIyrUjRQkFDLVjWZ06UUyzLEWQL',86400,NULL,'2018-10-18 15:32:37',2),('aXpfDoHm4ImttwwMLCwZ6cl4Z9L2OcikTnTaTe8fNLs2xgSyADrMcBXHFJc8BN09',86400,NULL,'2018-11-04 23:45:23',24),('cWY3OP9JWB7pxcznNHcpLS5Nvxb3rXI7oOXVytiNQTufckJC1J8b6t51eHhzS7jz',86400,NULL,'2018-10-18 15:53:13',2),('FBpTckbnM2IfU7cgXV6SHXDwhuxzmn9ifm5zdJ1qVusJ2YfdRvohsGb4SGOPh0aY',86400,NULL,'2018-10-18 15:26:18',2),('Fi64EJXw6f85frblf7foFQ0dmIDNB1BMMCrMPDHRB49xpYoNw6EzN2325B9k1L1o',86400,NULL,'2018-10-18 15:39:57',2),('juzyEqihCol6HO1Lr4RdxPvxrGvVHszqSLTXwBiVHU8SdZV1tWEuXI9SUq3cJElq',86400,NULL,'2018-10-18 15:45:47',2),('ka4tPXBCSNNU0cCNAl4c8hSqIIGxnx3XTPzQ6gBAMEvilOj3JYeXm08mRp0ppCdy',86400,NULL,'2018-10-18 15:26:40',2),('KrnDqPKEvsUOO3iQkQfs0qrH8QZ02tYFswVSqJBGmLQp6nWSZ68RX24LZtNqJWcD',86400,NULL,'2018-11-05 00:23:50',2),('MW30AdVXC9BoUUsAcayC6KWvLcmzDBUhrnpStboHtIqpRT9uH0QqZ5hby6GGqX2B',86400,NULL,'2018-10-18 15:31:21',2),('NLyG0OIctHq8pQbb4fC0hZ2rWV6W75KoJBrH0A75LPwiOqnLKTwIsbX0jG1pCW8B',86400,NULL,'2018-10-18 15:33:09',2),('NXG5Al2hQ2R4xG2CQ5ya5DqcCPZwZNPIfNrQaEjFOtdUHfLw2fgwREfK8QREkSKs',86400,NULL,'2018-10-22 23:41:46',2),('PdmiWlCJyAHZoiS7cnwpCIcMdBwsliasFu6WHYBCdXBebXrHEAnYOJ7rNB3HUMYM',86400,NULL,'2018-11-05 15:33:33',2),('pO5rXvFKazTdM4JHIp4wBJi0roI6rNA0JSwUXlnt1AoJqSuDzZbCGjwCBuc9RiAt',86400,NULL,'2018-10-18 15:51:34',2),('QcNIfe9KuJZOrqha1KDXQDWYzn3AMF119b8LAvvpnA4W7RS5nNcz9mObTwV62wsa',86400,NULL,'2018-10-18 15:43:41',2),('QmNxQFrDdBfCwbEHscTpOTnKIKtmdB2yIwwtmNhDBfsyRdEhWvFe63RAic0tCSOs',86400,NULL,'2018-10-18 15:40:29',2),('rSQlTwgISj54eaKiJJupQZWEhfYubOUE4U8ZCLqlk8gvkfK4Glr8iLJklP5qZapF',86400,NULL,'2018-10-18 15:31:44',2),('RWRRKYUlgCwZJp7xANFf0E3jx740ZYXkGvKTuZVwWHCgSQ5n9gWb21EYZEzSxmEm',86400,NULL,'2018-11-05 00:21:03',2),('s08gWKIsG0oGEkRQNb1fFx9sXokZlwKrMcEuHkydAqIfrwKeK3wJTGPLVY1TS1Jv',86400,NULL,'2018-10-18 15:44:13',2),('ShL7rIMLL8QCAPYIqpwBhnHjB6wW02WlkVCeorJsUcbyaq5n9IoHTaCTm9W25hfv',86400,NULL,'2018-10-18 15:47:36',2),('t7oBqp4fMQDfjZP2zOPPis9S6eHDJ7p1KeHNn3C2UOeYgi18oW0w7AG78hPT9A8Q',86400,NULL,'2018-10-18 15:24:14',2),('TuezazWvjdGKtBHmmRzaRK3mr2ShYnICnwdEmr4tcwNFXqKaOjFobRJeq4FEBaXl',86400,NULL,'2018-10-18 15:46:05',2),('ufHK0q1UEiaUJLVS9rQvQ7RxvFJ4ZSomAMy3kBVzFDdALFb1AkZsKZ0t28uJw6lo',86400,NULL,'2018-11-05 00:03:39',24),('uV8z9ZK2ZlHJg4z7U1AkYppAUiDCATe05pCxGjIA2Fp35mZscnzs2QI1CgYCDiuZ',86400,NULL,'2018-11-05 00:22:15',2),('ve6UaMogz0nbNlARdCYMWVy07C0XLgsbU8xjsEaWCv9aR1k4X2ajVQs83DRzbmj4',86400,NULL,'2018-10-18 15:22:30',2),('wH5mMTsd0bFA29Bck7NcpYXsTUTCtr7w3sZyx37CX9zebINWAzKUWK6DjA850bo8',86400,NULL,'2018-11-06 11:57:28',40),('WUXuLw8fsw419k6Aj2fPoDUtvu4w3tP1huxSkA7Q4Fagkb4vlaq0H1r6fSJpW9qD',86400,NULL,'2018-11-06 11:55:35',2),('YMcHO6iAbhiYH7HYZBvj5GcpnGcDSBZ7oOPgEoyZRuUtj0qXWLGovxNlCr7uQE9y',86400,NULL,'2018-11-06 12:01:14',2),('YrtKPQN8kI2MZIpljlVci6xcCrIekYqWxpcNdwIF56FAq7rkULiLidZkFtGrGPY2',86400,NULL,'2018-11-05 00:06:12',2);
/*!40000 ALTER TABLE `AccessToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Course`
--

DROP TABLE IF EXISTS `Course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(512) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Course`
--

LOCK TABLES `Course` WRITE;
/*!40000 ALTER TABLE `Course` DISABLE KEYS */;
INSERT INTO `Course` VALUES (1,'Callan English'),(2,'Business English');
/*!40000 ALTER TABLE `Course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CourseProgress`
--

DROP TABLE IF EXISTS `CourseProgress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CourseProgress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) DEFAULT NULL,
  `courseId` int(11) DEFAULT NULL,
  `nextLessonId` int(11) DEFAULT NULL,
  `completedLessonEventsCount` int(11) NOT NULL,
  `lessonEventsBalance` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CourseProgress`
--

LOCK TABLES `CourseProgress` WRITE;
/*!40000 ALTER TABLE `CourseProgress` DISABLE KEYS */;
INSERT INTO `CourseProgress` VALUES (10,24,1,NULL,0,3),(11,24,2,NULL,0,0),(12,2,1,NULL,0,0),(13,2,2,NULL,0,0),(14,25,1,NULL,0,0),(15,28,1,NULL,0,55),(16,28,2,NULL,0,0),(17,37,1,NULL,0,0),(18,38,1,NULL,0,4),(19,40,1,NULL,0,0);
/*!40000 ALTER TABLE `CourseProgress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Customer`
--

DROP TABLE IF EXISTS `Customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(512) NOT NULL,
  `lastName` varchar(512) DEFAULT NULL,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Customer`
--

LOCK TABLES `Customer` WRITE;
/*!40000 ALTER TABLE `Customer` DISABLE KEYS */;
INSERT INTO `Customer` VALUES (1,'Tertia','Fourtie',NULL,NULL,'$2a$10$WCvYdeR/TqGvou4S/g7kiuZXQbImkZu4XWDtDRYQRXXK3/gb.WXRO','tertia@callan.com',NULL,NULL),(2,'Manro','Manro',NULL,NULL,'$2a$10$4K/z6r744SQ2sRe9s9hzY.EZvTjQlUiB1Xh6n/4HH1DF8GmFju3YS','manro@callan.com',NULL,NULL),(25,'Lewis','Karoll',NULL,NULL,'$2a$10$yMfp8q991CHtVfDNpHJdfu/ZjjEedQuS8x7Gf7SCCEP8s68ueYjCm','lewis@gmail.com',NULL,NULL),(37,'Simon','McCoy',NULL,NULL,'$2a$10$lxtGc4ygZ.3dUo1CQNCC5u0f.NFr8Wg6nL4AUc.n9PmrJJYASRmYO','cat@bbc.com',NULL,NULL),(40,'Simon','McCoy',NULL,NULL,'$2a$10$WCLi4V/Q2StZLrgXFb.xluA0wO7b21Hn6BoJdMiDB3V5Gdx1FPtUC','simon@bbc.com',NULL,NULL);
/*!40000 ALTER TABLE `Customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Lesson`
--

DROP TABLE IF EXISTS `Lesson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Lesson` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(512) NOT NULL,
  `courseId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Lesson`
--

LOCK TABLES `Lesson` WRITE;
/*!40000 ALTER TABLE `Lesson` DISABLE KEYS */;
INSERT INTO `Lesson` VALUES (1,'Default lesson',1),(2,'Default lesson',2);
/*!40000 ALTER TABLE `Lesson` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LessonEvent`
--

DROP TABLE IF EXISTS `LessonEvent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `LessonEvent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `duration` int(11) DEFAULT NULL,
  `state` int(11) NOT NULL,
  `studentId` int(11) DEFAULT NULL,
  `teacherId` int(11) DEFAULT NULL,
  `startTime` datetime NOT NULL,
  `lessonId` int(11) DEFAULT NULL,
  `courseProgressId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LessonEvent`
--

LOCK TABLES `LessonEvent` WRITE;
/*!40000 ALTER TABLE `LessonEvent` DISABLE KEYS */;
INSERT INTO `LessonEvent` VALUES (1,60,1,24,NULL,'2018-11-05 15:30:00',1,10),(2,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(3,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(4,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(5,60,2,24,1,'2018-11-05 15:30:00',NULL,10),(6,60,1,24,NULL,'2018-11-05 15:30:00',NULL,11),(7,60,1,24,NULL,'2018-11-05 15:30:00',NULL,11),(8,60,1,24,NULL,'2018-11-05 15:30:00',NULL,11),(9,60,1,2,NULL,'2018-11-05 15:30:00',NULL,12),(10,60,1,2,NULL,'2018-11-05 15:30:00',NULL,13),(11,60,2,25,1,'2018-11-05 15:30:00',NULL,14),(12,60,1,28,NULL,'2018-11-05 15:30:00',NULL,16),(13,60,1,28,NULL,'2018-11-05 15:30:00',NULL,16),(14,60,1,28,NULL,'2018-11-05 15:30:00',NULL,16),(15,60,1,28,NULL,'2018-11-05 15:30:00',NULL,15),(16,60,1,28,NULL,'2018-11-05 15:30:00',NULL,15),(17,60,1,28,NULL,'2018-11-05 15:30:00',NULL,15),(18,60,1,28,NULL,'2018-11-05 15:30:00',NULL,16),(19,60,1,28,NULL,'2018-11-05 15:30:00',NULL,16),(20,60,1,28,NULL,'2018-11-05 15:30:00',NULL,15),(21,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(22,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(23,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(24,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(25,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(26,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(27,60,1,24,NULL,'2018-11-05 15:30:00',NULL,10),(28,60,2,37,1,'2018-11-05 15:30:00',NULL,17),(29,60,1,37,NULL,'2018-11-05 15:30:00',NULL,17),(30,60,1,37,NULL,'2018-11-05 15:30:00',NULL,17),(31,60,1,38,NULL,'2018-11-07 10:00:00',NULL,18),(32,60,2,40,1,'2018-11-06 09:00:00',NULL,19),(33,60,1,40,NULL,'2018-11-08 13:00:00',NULL,19),(34,60,1,40,NULL,'2018-11-09 09:00:00',NULL,19),(35,60,1,40,NULL,'2018-11-09 16:00:00',NULL,19),(36,60,1,40,NULL,'2018-11-10 16:00:00',NULL,19);
/*!40000 ALTER TABLE `LessonEvent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Role`
--

DROP TABLE IF EXISTS `Role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

LOCK TABLES `Role` WRITE;
/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
INSERT INTO `Role` VALUES (1,'support',NULL,'2018-10-09 16:30:27','2018-10-09 16:30:27'),(2,'student',NULL,'2018-10-09 16:30:27','2018-10-09 16:30:27'),(3,'teacher',NULL,'2018-10-09 16:30:27','2018-10-09 16:30:27'),(4,'admin',NULL,'2018-10-09 16:30:27','2018-10-09 16:30:27');
/*!40000 ALTER TABLE `Role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RoleMapping`
--

DROP TABLE IF EXISTS `RoleMapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RoleMapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(255) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `principalId` (`principalId`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RoleMapping`
--

LOCK TABLES `RoleMapping` WRITE;
/*!40000 ALTER TABLE `RoleMapping` DISABLE KEYS */;
INSERT INTO `RoleMapping` VALUES (1,'USER','2',4),(2,'USER','2',4),(3,'USER','2',4),(4,'USER','2',2),(5,'USER','1',4),(6,'USER','1',3),(7,'USER','1',3),(8,'USER','15',2),(9,'USER','16',2),(10,'USER','17',2),(11,'USER','18',2),(12,'USER','18',1),(13,'USER','18',3),(14,'USER',NULL,4),(15,'USER',NULL,4),(16,'USER','19',4),(17,'USER','20',2),(18,'USER','21',3),(19,'USER','22',2),(20,'USER','23',2),(21,'USER','24',2),(22,'USER','25',2),(23,'USER','26',2),(24,'USER','27',2),(25,'USER','28',2),(26,'USER','29',2),(27,'USER','30',2),(28,'USER','31',3),(29,'USER','32',2),(30,'USER','33',2),(31,'USER','34',2),(32,'USER','35',2),(33,'USER','36',2),(34,'USER','37',2),(35,'USER','38',2),(36,'USER','39',3),(37,'USER','40',2);
/*!40000 ALTER TABLE `RoleMapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ScheduleRange`
--

DROP TABLE IF EXISTS `ScheduleRange`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ScheduleRange` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ScheduleRange`
--

LOCK TABLES `ScheduleRange` WRITE;
/*!40000 ALTER TABLE `ScheduleRange` DISABLE KEYS */;
/*!40000 ALTER TABLE `ScheduleRange` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,NULL,NULL,'$2a$10$v5zEXzlFjB7Nf5LRxLRma.Re5IfV5xm1ggLh4/Xjzl6v0n7x5fmZC','manro@callan.com',NULL,NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-11-06 20:48:55
