create table fnlog.log(
Id int auto_increment primary key,
ProgramName varchar(300) not null,
Guid varchar(100) not null,
Title varchar(500) not null,
Description text not null,
LogType int not null,
DateOfIncident DateTime not null default Now()
);