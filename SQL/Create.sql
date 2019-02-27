Create Database FnLog;


CREATE TABLE `FnLog`.`Log` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProgramName` varchar(300) NOT NULL,
  `ProgramVersion` varchar(50) NOT NULL,
  `FnLogVersion` varchar(50) NOT NULL,
  `Title` varchar(500) NOT NULL,
  `Description` text NOT NULL,
  `LogType` int(11) NOT NULL,
  `Guid` varchar(100) NOT NULL,
  `DateOfIncident` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
);


CREATE TABLE `FnLog`.`AccessKeys` (
  `idAccessKeys` int NOT NULL AUTO_INCREMENT,
  `AccessKey` varchar(500) NOT NULL,
  `DateOfExpiry` datetime NOT NULL,
  PRIMARY KEY (`idAccessKeys`),
  UNIQUE KEY `AccessKey_UNIQUE` (`AccessKey`)
)
