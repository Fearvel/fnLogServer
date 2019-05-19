--Copyright (c) 2018, Andreas Schreiner
--For FnLogServer 2.0.4.0
--This program is made for a Case sensitive MySql Server

create database FnLog;
use FnLog;

--Creates the internal logging Table ServerLog
CREATE TABLE `ServerLog` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SocketId` varchar(100) DEFAULT NULL,
  `Message` text NOT NULL,
  `DateOfIncident` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the table for incoming logs
CREATE TABLE `Log` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProgramName` varchar(300) NOT NULL,
  `ProgramVersion` varchar(50) NOT NULL,
  `FnLogClientVersion` varchar(50) NOT NULL,
  `Title` varchar(500) NOT NULL,
  `Description` text NOT NULL,
  `LogType` int(11) NOT NULL,
  `UUID` varchar(100) NOT NULL,
  `DateOfIncident` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the table for administrative access(future option)
CREATE TABLE `AccessToken` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Token` varchar(200) NOT NULL,
  `DateOfCreation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DateOfExpiry` datetime DEFAULT NULL,
  `Notes` text,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

select 'DB created' AS '';
