<?php
if(isset($_GET["Horno_id"]) && isset($_GET["Zona"]) && isset($_GET["Calefactor"]) && isset($_GET["Enfriador"]) && isset($_GET["Set_Point"]) && isset($_GET["TempProceso"]) && isset($_GET["SensorLM35"])) {

   date_default_timezone_set('America/La_Paz');

   $Horno_id = $_GET["Horno_id"];
   $Zona = $_GET["Zona"];
   $Calefactor = $_GET["Calefactor"];
   $Enfriador = $_GET["Enfriador"];
   $Set_Point = $_GET["Set_Point"];
   $TempProceso = $_GET["TempProceso"];
   $SensorLM35 = $_GET["SensorLM35"];
   // Obtener la fecha en formato "yyyy-mm-dd"
   $Fecha = date('Y-m-d');

   // Obtener la hora en formato "hh:mm:ss"
   $Hora = date('H:i:s');

   $servername = "localhost";
   $username = "root";
   $password = "";
   $database_name = "practica8db";

   // Crea coneccion MySQL desde PHP al servidor MySQL 
   $connection = new mysqli($servername, $username, $password, $database_name);
   // Verificando coneccion 
   if ($connection->connect_error) {
      die("MySQL connection failed: " . $connection->connect_error);
   }

   $sql = "INSERT INTO `TablaHorno` (
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
      '$Horno_id',
      '$Zona',
      '$Fecha',
      '$Hora',
      '$Calefactor',
      '$Enfriador',
      '$Set_Point',
      '$TempProceso',
      '$SensorLM35'
  )";

   if ($connection->query($sql) === TRUE) {
      echo "New record created successfully";
   } else {
      echo "Error: " . $sql . " => " . $connection->error;
   }

   $connection->close();
} else {
   echo "There are errors on the data sent";
}
?>