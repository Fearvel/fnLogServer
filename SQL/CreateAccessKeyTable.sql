CREATE TABLE `AccessKeys` (
  `idAccessKeys` int NOT NULL AUTO_INCREMENT,
  `AccessKey` varchar(500) NOT NULL,
  `DateOfExpiry` datetime NOT NULL,
  PRIMARY KEY (`idAccessKeys`),
  UNIQUE KEY `AccessKey_UNIQUE` (`AccessKey`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
