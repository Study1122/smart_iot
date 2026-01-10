#include "FeatureState.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Arduino.h>

/* ================== TELEMETRY SENSOR ================== */
#include <DHT.h>
#define DHTPIN 4        // GPIO4 = D2
#define DHTTYPE DHT11   // change to DHT22 if needed
DHT dht(DHTPIN, DHTTYPE);

/* ================== CONFIG ================== */

#define PWM_MAX 1023

int levelToPwm(int level) {
  if (level <= 0) return 0;
  if (level >= 5) return PWM_MAX;
  return map(level, 1, 5, 200, PWM_MAX);
}

const char* ssid = "<wifi_ssid_name>";
const char* password = "<password>";

const char* serverUrl = "<backend_url>";
const char* deviceId = "<deviceId>"; //not device._id
const char* deviceSecret = "<deviceSecret>";

/* ================== GLOBALS ================== */

WiFiClientSecure client;

unsigned long lastHeartbeat = 0;
unsigned long lastCommandPoll = 0;
unsigned long lastTelemetrySend = 0;

const unsigned long HEARTBEAT_INTERVAL = 10000;
const unsigned long COMMAND_INTERVAL   = 1500;
const unsigned long TELEMETRY_INTERVAL = 60000; // 10 sec

FeatureState featureStates[10];
int featureCount = 0;

/* ================== GPIO SAFETY ================== */

bool isValidGpio(int gpio) {
  int allowed[] = {0, 2, 4, 5, 12, 13, 14, 15, 16};
  for (int i = 0; i < 9; i++) {
    if (allowed[i] == gpio) return true;
  }
  return false;
}

/* ================== WIFI ================== */

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
}

/* ================== HEARTBEAT ================== */

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(client, String(serverUrl) + "/devices/heartbeat");
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  http.POST("");
  http.end();
}

/* ================== TELEMETRY ================== */

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ Telemetry read failed");
    return;
  }

  HTTPClient http;
  http.begin(client, String(serverUrl) + "/telemetry");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  StaticJsonDocument<256> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["voltage"] = 3.3; // static or calculated later

  String payload;
  serializeJson(doc, payload);

  http.POST(payload);
  http.end();

  Serial.println("Telemetry sent");
}

/* ================== FEATURE CACHE ================== */

FeatureState* getFeatureState(int gpio) {
  for (int i = 0; i < featureCount; i++) {
    if (featureStates[i].gpio == gpio) {
      return &featureStates[i];
    }
  }

  if (featureCount >= 10) return nullptr;

  featureStates[featureCount] = {gpio, false, 0};
  pinMode(gpio, OUTPUT);
  analogWrite(gpio, 0);
  featureCount++;

  return &featureStates[featureCount - 1];
}

/* ================== REPORT ================== */

void reportState(const char* featureId, bool state, int level) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(client, String(serverUrl) + "/devices/report");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  StaticJsonDocument<256> doc;
  doc["featureId"] = featureId;
  doc["state"] = state;
  doc["level"] = level;

  String payload;
  serializeJson(doc, payload);

  http.POST(payload);
  http.end();
}

/* ================== FETCH COMMANDS ================== */

void fetchCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(client, String(serverUrl) + "/devices/commands");
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  if (http.GET() != 200) {
    http.end();
    return;
  }

  StaticJsonDocument<1024> doc;
  deserializeJson(doc, http.getString());
  http.end();

  for (JsonObject cmd : doc["commands"].as<JsonArray>()) {
    if (!cmd.containsKey("gpio")) continue;

    int gpio = cmd["gpio"];
    if (!isValidGpio(gpio)) continue;

    FeatureState* fs = getFeatureState(gpio);
    if (!fs) continue;

    const char* featureId = cmd["featureId"];
    const char* type = cmd["type"];
    bool desiredState = cmd["desiredState"];
    int desiredLevel = cmd["desiredLevel"] | 0;

    if (strcmp(type, "fan") == 0) {
      if (desiredLevel != fs->lastLevel) {
        analogWrite(gpio, levelToPwm(desiredLevel));
        fs->lastLevel = desiredLevel;
        fs->lastState = desiredLevel > 0;
        reportState(featureId, fs->lastState, desiredLevel);
      }
    } else {
      if (desiredState != fs->lastState) {
        digitalWrite(gpio, desiredState ? HIGH : LOW);
        fs->lastState = desiredState;
        reportState(featureId, desiredState, 0);
      }
    }
  }
}

/* ================== SETUP ================== */

void setup() {
  Serial.begin(115200);
  connectWiFi();
  client.setInsecure();
  dht.begin();
}

/* ================== LOOP ================== */

void loop() {
  connectWiFi();
  unsigned long now = millis();

  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = now;
  }

  if (now - lastCommandPoll >= COMMAND_INTERVAL) {
    fetchCommands();
    lastCommandPoll = now;
  }

  if (now - lastTelemetrySend >= TELEMETRY_INTERVAL) {
    sendTelemetry();
    lastTelemetrySend = now;
  }
}