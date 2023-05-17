// Librerias
#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include "SPIFFS.h"
#include "config.h"
#include <RBDdimmer.h>
#include <HTTPClient.h>
// MELODIAS
#include <melody_player.h>
#include <melody_factory.h>

int buzzerPin = 23;
MelodyPlayer player(buzzerPin, HIGH);
const int nNotes = 3;
String notesInicio[nNotes] = {"C7", "C7", "C7"};
String notesOn[nNotes] = {"C7", "G7", "G7"};
String notesOff[nNotes] = {"G7", "C7", "C7"};
const int timeUnit = 175;
String HOST_NAME = "http://192.168.25.188"; // IP del servidor Xampp
String PATH_NAME = "/insert_lampara_data.php";
String queryString;

void sonido(String notes[])
{
  Melody melody = MelodyFactory.load("Nice Melody", timeUnit, notes, nNotes);
  player.play(melody);
  digitalWrite(buzzerPin, LOW);
}

int intensidad = 0;
int pirPin = 22;

// Parametros
//  ldr
#define ADC_VREF_mV 3300.0 // 3.3v en millivoltios
#define ADC_RESOLUTION 4096.0
#define LIGHT_SENSOR_PIN 21 // ESP32 pin GIOP36 (ADC0) conectado al LDR
#define PWM_Ch 0
#define PWM_Res 8
#define PWM_Freq 1000

// Variables auxiliares del estado de las salidas
String AZULState = "off";
String ROJOState = "off";
String VERDEState = "off";

// Asignando los piones GPIO
const int AZUL = 4;
const int ROJO = 5;
const int VERDE = 0;

int estado = LOW;

int pwmE;
int pwmA;

String modo = "conjunto";
String presencia = "no";
int datoADC;
float Porcentaje = 0.0, Voltaje = 0.0;
float PorcentajeFactor = 100.0 / ADC_RESOLUTION;
float VoltajeFactor = 3.3 / ADC_RESOLUTION;
AsyncWebServer server(80);
// Variables
String pwm;
String pwmValueE;
String pwmValueA;
String Zona = "Dormitorio";
String Foco_id = "1";

String light_state = "ON";
int rele = 18;
int led = 19;

// objetos

// funciones
void initSpiffs()
{
  if (!SPIFFS.begin())
  {
    Serial.println("ha ocurrido un error al montar SPIFFS");
    return;
  }
}

void initWiFi()
{
  // conectamos al Wi-Fi
  WiFi.begin(ssid, password);
  // Mientras no se conecte, mantenemos un bucle con reintentos sucesivos
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    // Esperamos un segundo
    Serial.println("Conectando a la red WiFi..");
  }
  Serial.println();
  Serial.println(WiFi.SSID());
  Serial.print("Direccion IP:\t");
  // Imprimimos la ip que le ha dado nuestro router
  Serial.println(WiFi.localIP());
}

// leemos la IP y la mostramos

String getIP()
{
  String ip = (WiFi.localIP().toString());
  Serial.println(ip);
  return String(ip);
}

// leemos el Status y la mostramos

String getStatus()
{
  float estado = WiFi.status();
  Serial.println(estado);
  return String(estado);
}
// leemos el SSID y la mostramos

String getSSID()
{
  String SSIDs = (WiFi.SSID());
  Serial.println(SSIDs);
  return String(SSIDs);
}

// leemos el PSK y la mostramos

String getPSK()
{
  String psks = WiFi.psk();
  Serial.println(psks);
  return String(psks);
}

// leemos el BSSID y la mostramos

String getBSSI()
{
  String bssi = WiFi.BSSIDstr();
  Serial.println(bssi);
  return String(bssi);
}

// leemos la temperatura y la mostramos
String getTemperature()
{
  float adc = analogRead(36);
  Serial.println(adc);
  return String(adc);
}
// leemos la presion y la mostramos
String getPressure()
{
  float rssi = WiFi.RSSI();
  Serial.println(rssi);
  return String(rssi);
}

// Remplazamos el marcador con el estado del  LED
String processor(const String &var)
{
  Serial.print(var + " : ");
  // esta función primero verifica si el marcador de posición es el ESTADO que hemos creado en el archivo HTML.
  if (var == "ADC")
  {
    return getTemperature();
  }
  else if (var == "rssi")
  {
    return getPressure();
  }
  else if (var == "IPlocal")
  {
    return getIP();
  }
  else if (var == "status")
  {
    return getStatus();
  }
  else if (var == "ssid")
  {
    return getSSID();
  }
  else if (var == "hostname")
  {
    return WiFi.SSID().c_str();
  }
  else if (var == "psk")
  {
    return getPSK();
  }
  else if (var == "bssid")
  {
    return getBSSI();
  }
  else if (var == "rssicon")
  {
    if (WiFi.RSSI() > -40)
    {
      return "<img src=\"https://imgs.search.brave.com/dIod6-5osO4TZrJtzW6jnrKZsgYOIGj4MwEH7676HfY/rs:fit:512:512:1/g:ce/aHR0cHM6Ly93d3cu/aWNvbnNkYi5jb20v/aWNvbnMvZG93bmxv/YWQvcHVycGxlL3dp/ZmktNTEyLnBuZw\" alt=\"logowifi\" width=\"90\">";
    }
    else if (WiFi.RSSI() > -53 && WiFi.RSSI() <= -40)
    {
      return "<img src=\"https://imgs.search.brave.com/G6f3-B9rLWFwoY7-X2Yt1qOtlKUgn8g74Ka-K1f66BU/rs:fit:512:512:1/g:ce/aHR0cHM6Ly93d3cu/aWNvbnNkYi5jb20v/aWNvbnMvZG93bmxv/YWQvcHVycGxlL3dp/ZmktMy1iYXJzLTUx/Mi5wbmc\" alt=\"logowifi\" width=\"90\">";
    }
    else if (WiFi.RSSI() <= -53)
    {
      return "<img src=\"https://imgs.search.brave.com/Vf85v4p4SpyevfsxdiHf2NmPiclgAfeY2ZPY8OYePlw/rs:fit:256:256:1/g:ce/aHR0cHM6Ly93d3cu/aWNvbnNkYi5jb20v/aWNvbnMvcHJldmll/dy9wdXJwbGUvd2lm/aS0yLWJhcnMteHhs/LnBuZw\" alt=\"logowifi\" width=\"90\">";
    }
  }
  return String();
}

void setup()
{
  Serial.begin(115200);

  pinMode(pirPin, INPUT);

  // Initialize the output variables as outputs
  pinMode(AZUL, OUTPUT);
  pinMode(VERDE, OUTPUT);
  pinMode(ROJO, OUTPUT);
  // Set outputs to LOW
  digitalWrite(AZUL, LOW);
  digitalWrite(VERDE, LOW);
  digitalWrite(ROJO, LOW);

  digitalWrite(buzzerPin, LOW);
  pinMode(rele, OUTPUT);
  digitalWrite(rele, LOW);
  pinMode(LIGHT_SENSOR_PIN, INPUT);

  ledcAttachPin(led, PWM_Ch);
  ledcSetup(PWM_Ch, PWM_Freq, PWM_Res);

  initWiFi();
  initSpiffs();

  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    request->send(SPIFFS, "/index.html", "text/html", false, processor);
  });

  server.on("/switch_light", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    if (light_state == "OFF") {
      digitalWrite(rele, HIGH);
      Serial.println("Estado actual de la lampara: "+light_state);
      light_state = "ON";
      Serial.println("Estado actualizado de la lampara: "+light_state);
      sonido(notesOn);
    } else {
      if (light_state == "ON") {
        Serial.println("Estado actual de la lampara: "+light_state);
        digitalWrite(rele, LOW);
        light_state = "OFF";
        Serial.println("Estado actualizado de la lampara: "+light_state);
        sonido(notesOff);
      }
    }
    queryString = "?Foco_id=" + Foco_id + "&Zona=" + Zona + "&Estado=" + (light_state == "OFF" ? "0" : "1") + "&Presencia=" + (presencia == "si" ? "1" : "0") + "&LDR=" + datoADC;
    Serial.print("Cadena Resultante = "); Serial.println(queryString);
    // Escribiendo datos
    HTTPClient http;
    http.begin(HOST_NAME + PATH_NAME + queryString); //HTTP
    int httpCode = http.GET();

    // httpCode will be negative on error
    if (httpCode > 0) {
      // file found at server
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println(payload);
      } else {
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTP] GET... code: %d\n", httpCode);
      }
    } else {
      Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
    Serial.println("Estado de la lampara: " + light_state);
    request->redirect("/");
  });

  server.on("/pwm", HTTP_POST, [](AsyncWebServerRequest * request)
  {
    pwm = request->arg("value");
    ledcWrite(PWM_Ch, pwm.toInt());
    request->redirect("/");
  });

  server.on("/pwmValidado", HTTP_POST, [](AsyncWebServerRequest * request)
  {
    pwmValueE = request->arg("valueE");
    pwmValueA = request->arg("valueA");

    pwmE = pwmValueE.toInt();
    pwmA = pwmValueA.toInt();
    intensidad = 1;
    request->redirect("/");
  });

  server.on("/modoManual", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    modo = "manual";
    request->redirect("/");
  });

  server.on("/modoConjunto", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    modo = "conjunto";
    request->redirect("/");
  });

  server.on("/modoAutomaticoHorario", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    modo = "automaticoHorario";
    request->redirect("/");
  });

  server.on("/modoAutomaticoIntensidad", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    modo = "automaticoIntensidad";
    request->redirect("/");
  });

  server.on("/modoApagado", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    modo = "apagado";
    sonido(notesOff);
    request->redirect("/");
  });

  server.on("/modoEncendido", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    sonido(notesInicio);
    request->redirect("/");
  });

  server.on("/modo", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    request->send(200, "text/plain", modo);
  });

  server.serveStatic("/", SPIFFS, "/");

  server.begin();
}
void loop()
{
  // testDimmer();
  datoADC = analogRead(39);
  Porcentaje = PorcentajeFactor * datoADC;
  bool seDetecta = digitalRead(pirPin);

  if (seDetecta)
  {
    presencia = "si";
  } else {
    presencia = "no";
  }

  if (presencia == "si")
  {
    if (modo == "manual")
    {
      digitalWrite(ROJO, LOW);
      digitalWrite(VERDE, HIGH);
      digitalWrite(AZUL, LOW);
    }
    if (modo == "automaticoHorario" || modo == "conjunto")
    {
      ledcWrite(PWM_Ch, Porcentaje);

      if (modo == "conjunto")
      {
        digitalWrite(ROJO, HIGH);
        digitalWrite(VERDE, LOW);
        digitalWrite(AZUL, LOW);
      }
      else
      {
        digitalWrite(ROJO, LOW);
        digitalWrite(VERDE, LOW);
        digitalWrite(AZUL, HIGH);
      }
    }
    if (modo == "automaticoIntensidad" || modo == "conjunto")
    {
      ledcWrite(PWM_Ch, Porcentaje);

      if (modo == "conjunto")
      {
        digitalWrite(ROJO, HIGH);
        digitalWrite(VERDE, LOW);
        digitalWrite(AZUL, LOW);
      }
      if (modo == "automaticoIntensidad")
      {
        digitalWrite(ROJO, HIGH);
        digitalWrite(VERDE, LOW);
        digitalWrite(AZUL, HIGH);
      }
    }
  }
  else
  {
    modo = "apagado";
  }

  if (modo == "apagado")
  {
    digitalWrite(rele, LOW);
    //light_state = "OFF";
    digitalWrite(ROJO, LOW);
    digitalWrite(VERDE, LOW);
    digitalWrite(AZUL, LOW);
  }

  if (intensidad == 1)
  {
    if (datoADC <= pwmE)
    {
      digitalWrite(rele, HIGH);
      //light_state = "ON";
    }

    if (datoADC >= pwmA)
    {
      digitalWrite(rele, LOW);
      //light_state = "OFF";
    }
  }

  delay(100);
}
