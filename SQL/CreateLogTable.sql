CREATE TABLE `Log` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProgramName` varchar(300) NOT NULL,
  `Guid` varchar(100) NOT NULL,
  `Title` varchar(500) NOT NULL,
  `Description` text NOT NULL,
  `LogType` int(11) NOT NULL,
  `DateOfIncident` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
