CREATE DATABASE PRACTICA8db;

CREATE TABLE `TablaHorno` (
  `NumReg` int(11) NOT NULL AUTO_INCREMENT,
  `Horno_Id` int(11) NOT NULL,
  `Zona` varchar(200) NOT NULL,
  `Fecha` date NOT NULL,
  `HoraActual` time NOT NULL,
  `Calefactor` tinyint(1) NOT NULL,
  `Enfriador` tinyint(1) NOT NULL,
  `Set_Point` float(11) NOT NULL,
  `TempProceso` float(11) NOT NULL,
  `SensorLM35` float(11) NOT NULL,

   PRIMARY KEY (`NumReg`),
   UNIQUE KEY `NumReg` (`NumReg`)
); 


/* Ejemplo de insercion de datos */

INSERT INTO `TablaHorno` (
    `NumReg`,
    `Horno_Id`,
    `Zona`,
    `Fecha`,
    `HoraActual`,
    `Calefactor`,
    `Enfriador`,
    `Set_Point`,
    `TempProceso`,
    `SensorLM35`
) VALUES (
    NULL,
    '1',
    'Cocina',
    '2023-11-20',
    '12:00:00',
    '1',
    '0',
    '100',
    '50',
    '30'
);

INSERT INTO `TablaHorno` (
    `NumReg`,
    `Horno_Id`,
    `Zona`,
    `Fecha`,
    `HoraActual`,
    `Calefactor`,
    `Enfriador`,
    `Set_Point`,
    `TempProceso`,
    `SensorLM35`
) VALUES (
    NULL,
    '1',
    'Cocina',
    '2023-11-20',
    '16:00:01',
    '0',
    '0',
    '100',
    '50',
    '30'
);

INSERT INTO `TablaHorno` (
    `NumReg`,
    `Horno_Id`,
    `Zona`,
    `Fecha`,
    `HoraActual`,
    `Calefactor`,
    `Enfriador`,
    `Set_Point`,
    `TempProceso`,
    `SensorLM35`
) VALUES (
    NULL,
    '1',
    'Cocina',
    '2023-11-20',
    '17:00:02',
    '1',
    '0',
    '100',
    '50',
    '30'
);

INSERT INTO `TablaHorno` (
    `NumReg`,
    `Horno_Id`,
    `Zona`,
    `Fecha`,
    `HoraActual`,
    `Calefactor`,
    `Enfriador`,
    `Set_Point`,
    `TempProceso`,
    `SensorLM35`
) VALUES (
    NULL,
    '1',
    'Cocina',
    '2023-11-20',
    '20:00:03',
    '0',
    '0',
    '100',
    '50',
    '30'
);