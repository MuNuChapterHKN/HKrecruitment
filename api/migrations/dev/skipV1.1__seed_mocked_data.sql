BEGIN TRANSACTION;
INSERT INTO "Person" VALUES (NULL,'Riccardo','Zaccone','m','rz@gmail.com',3334567843,'3');
INSERT INTO "Person" VALUES ('imm.png','Arianna','Ravera','f','ar@gmail.com',3334567783,'1');
INSERT INTO "Person" VALUES (NULL,'Mario','Rossi','m','mr@gmail.com',3334567890,'2');
INSERT INTO "Person" VALUES ('','Sandro','Sartoni','m','ss@gmail.com',3337284429,'4');
INSERT INTO "Person" VALUES (NULL,'Anna','Bianchi','f','ab@gmail.com',3332946429,'5');
INSERT INTO "Member" VALUES ('3','member',1,0);
INSERT INTO "Member" VALUES ('1','member',1,0);
INSERT INTO "Member" VALUES ('4','IT head',1,0);
INSERT INTO "Interview" VALUES (1,'mentee_accepted','{"member_id":"1","time":"now", "attributes":""}',NULL,'IT','',10);
INSERT INTO "Availability" VALUES ('confirmed','2021-01-01 08:00:00','2021-01-01 09:00:00',3,'2021-01-01 10:00:00','2021-01-01 11:00:00');
INSERT INTO "Availability" VALUES ('confirmed','2021-01-06 16:00:00','2021-01-06 17:00:00',3,'2021-01-06 14:00:00','2021-01-06 15:00:00');
INSERT INTO "Availability" VALUES ('free',NULL,NULL,1,'2021-03-03 18:00:00','2021-03-03 19:00:00');
INSERT INTO "Notification" VALUES (1,0,1,'','',1,2);
INSERT INTO "TimeSlot_Application" VALUES (10,'2021-01-06 14:00:00','2021-01-06 15:00:00');
INSERT INTO "TimeSlot_Application" VALUES (11,'2021-01-01 10:00:00','2021-01-01 11:00:00');
INSERT INTO "TimeSlot_Application" VALUES (11,'2021-01-06 16:00:00','2021-01-06 16:00:00');
INSERT INTO "TimeSlot" VALUES ('2021-01-01 10:00:00','2021-01-01 11:00:00');
INSERT INTO "TimeSlot" VALUES ('2021-01-06 16:00:00','2021-01-06 17:00:00');
INSERT INTO "TimeSlot" VALUES ('2021-01-06 14:00:00','2021-01-06 15:00:00');
INSERT INTO "TimeSlot" VALUES ('2021-01-20 14:00:00','2021-01-20 15:00:00');
INSERT INTO "TimeSlot" VALUES ('2021-03-03 18:00:00','2021-03-03 19:00:00');
INSERT INTO "TimeSlot" VALUES ('2021-01-20 14:00:00','2021-01-20 16:00:00');
INSERT INTO "Friends" VALUES (2,1);
INSERT INTO "Friends" VALUES (2,4);
INSERT INTO "Slot_Member" VALUES (1,1);
INSERT INTO "Applicant" VALUES ('2','24/05/1998','mario','friends');
INSERT INTO "Applicant" VALUES ('5','02/11/00','annab','facebook');
INSERT INTO "Slot" VALUES (1,'free','0','2021-01-06 14:00:00','2021-01-06 15:00:00',1);
INSERT INTO "Slot" VALUES (2,'free','0','2021-01-06 14:00:00','2021-01-06 15:00:00',NULL);
INSERT INTO "Slot" VALUES (4,'free','0','2021-03-03 14:00:00','2021-03-03 15:00:00',NULL);
INSERT INTO "Slot" VALUES (5,'free','0','2021-03-03 15:00:00','2021-03-03 16:00:00',NULL);
INSERT INTO "Recruitment_Session" VALUES ('2020-01-01 10:00:00','2020-02-01 10:00:00','REC2',1);
INSERT INTO "Application" VALUES (10,2,'NULL','{"member_id":"1","time":"now", "attributes":""}','2021-01-06 14:00:00','accepted','madrelingua','prova','','',NULL,NULL,NULL,3,'eng',30.0,80,NULL,1);
INSERT INTO "Application" VALUES (11,5,1,'now','2021-02-03 15:00:00','refused_by_applicant','madrelingua',NULL,'file.pdf','file2.pdf',NULL,NULL,NULL,NULL,'computer science',NULL,NULL,'ICT',NULL);
INSERT INTO "Courses_Allowed" VALUES ('ict','MSc');
INSERT INTO "Courses_Allowed" VALUES ('pc','BSc');
COMMIT;
