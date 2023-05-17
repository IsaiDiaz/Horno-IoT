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

#define ADC_VREF_mV    3300.0 // 3.3v en millivoltios
#define ADC_RESOLUTION 4096.0
#define PIN_LM35       36 // ESP32 pin GIOP36 (ADC0) conectado al LM35
#define factor 0.0805860805860
int datoVal;
float milliVolt, tempC, tempF;

// Asignando los piones GPIO
const int AZUL = 19;
const int ROJO = 22;
const int VERDE = 21;

AsyncWebServer server(80);
String Zona = "Dormitorio";
String horno_id = "1";
String modo = "manual";

String horno_state = "OFF";
String ventilador_state = "OFF";
int rele_horno = 16;
int rele_ventilador1 = 17;
int rele_ventilador2 = 5;

String pwmValue;
int temperatura = -1000;

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
  return String(ip);
}

// leemos el Status y la mostramos

String getStatus()
{
  float estado = WiFi.status();
  return String(estado);
}
// leemos el SSID y la mostramos

String getSSID()
{
  String SSIDs = (WiFi.SSID());
  return String(SSIDs);
}

// leemos el PSK y la mostramos

String getPSK()
{
  String psks = WiFi.psk();
  return String(psks);
}

// leemos el BSSID y la mostramos

String getBSSI()
{
  String bssi = WiFi.BSSIDstr();
  return String(bssi);
}

// leemos la temperatura y la mostramos
String getTemperature()
{
  float adc = analogRead(36);
  return String(adc);
}
// leemos la presion y la mostramos
String getPressure()
{
  float rssi = WiFi.RSSI();
  return String(rssi);
}

// Remplazamos el marcador con el estado del  LED
String processor(const String &var)
{
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

void calentar() {
  horno_state = "ON";
  digitalWrite(rele_horno, LOW);
  ventilador_state = "OFF";
  digitalWrite(rele_ventilador1, HIGH);
  digitalWrite(rele_ventilador2, HIGH);
}

void enfriar() {
  horno_state = "OFF";
  digitalWrite(rele_horno, HIGH);
  ventilador_state = "ON";
  digitalWrite(rele_ventilador1, LOW);
  digitalWrite(rele_ventilador2, LOW);
}

void encender_horno(){
  horno_state = "ON";
  digitalWrite(rele_horno, LOW);
}

void apagar_horno(){
  horno_state = "OFF";
  digitalWrite(rele_horno, HIGH);
}

void encender_ventilador(){
  ventilador_state = "ON";
  digitalWrite(rele_ventilador1, LOW);
  digitalWrite(rele_ventilador2, LOW);
}

void apagar_ventilador(){
  ventilador_state = "OFF";
  digitalWrite(rele_ventilador1, HIGH);
  digitalWrite(rele_ventilador2, HIGH);
}


void setup()
{
  Serial.begin(115200);
  initWiFi();
  initSpiffs();

  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    request->send(SPIFFS, "/index.html", "text/html", false, processor);
  });

  server.on("/switch_calentar_horno", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    if(horno_state == "ON"){
      apagar_horno();
    }else{
      encender_horno();
    }
    request->redirect("/");
  });

  server.on("/switch_enfriar_horno", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    if(ventilador_state == "ON"){
     apagar_ventilador();
    }else{
      encender_ventilador();
    }
    request->redirect("/");
  });

  server.on("/set_point", HTTP_POST, [](AsyncWebServerRequest * request)
  {
    pwmValue = request->arg("value");
    temperatura = pwmValue.toInt();
    request->redirect("/");
  });

  server.on("/test", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    calentar();
    delay(2000);
    enfriar();
    delay(2000);
    calentar();
    delay(2000);
    enfriar();
    digitalWrite(rele_horno, HIGH);
    digitalWrite(rele_ventilador1, HIGH);
    digitalWrite(rele_ventilador2, HIGH);

    request->redirect("/");
  });

  server.on("/modoManual", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    modo = "manual";
    request->redirect("/");
  });

  server.on("/modoAutomaticoIntensidad", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    modo = "automaticoIntensidad";
    request->redirect("/");
  });


  server.serveStatic("/", SPIFFS, "/");
  server.begin();

  // Initialize the output variables as outputs
  pinMode(AZUL, OUTPUT);
  pinMode(VERDE, OUTPUT);
  pinMode(ROJO, OUTPUT);
  // Set outputs to LOW
  digitalWrite(AZUL, LOW);
  digitalWrite(VERDE, LOW);
  digitalWrite(ROJO, LOW);

  pinMode(rele_horno, OUTPUT);
  pinMode(rele_ventilador1, OUTPUT);
  pinMode(rele_ventilador2, OUTPUT);
  digitalWrite(rele_horno, HIGH);
  digitalWrite(rele_ventilador1, HIGH);
  digitalWrite(rele_ventilador2, HIGH);
  ventilador_state = "OFF";
  horno_state = "OFF";
}
void loop()
{
  datoVal = analogRead(PIN_LM35);
  // Convirtiendo los datos del ADC a milivoltios
  milliVolt = datoVal * (ADC_VREF_mV / ADC_RESOLUTION);
  // Convirtiendo el voltaje al temperatura en °C
  tempC = datoVal * factor ;
  // convirtiendo °C a °F
  tempF = tempC * 9 / 5 + 32;
  if (temperatura != -1000) {
    if (tempC > temperatura) {
      enfriar();
    }else{
      calentar();
    }
  }

  // Imprimiendo valores en el monitor serial:
  Serial.print("Lectura del ADC: ");
  Serial.print(datoVal);   // Valor leido por el ADC
  Serial.print("  Temperatura: ");
  Serial.print(tempC);   // Imprimiendo la temperatura en °C
  Serial.print("°C");
  Serial.print("  ~  "); //
  Serial.print(tempF);   // Imprimiendo la temperatura en °F
  Serial.println("°F");
  delay(500);
}
