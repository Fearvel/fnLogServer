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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

CREATE TABLE `AccessToken` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Token` varchar(200) NOT NULL,
  `DateOfCreation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DateOfExpiry` datetime DEFAULT NULL,
  `Notes` text,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

CREATE TABLE `ServerLog` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SocketId` varchar(100) DEFAULT NULL,
  `Message` text NOT NULL,
  `DateOfIncident` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=latin1;
