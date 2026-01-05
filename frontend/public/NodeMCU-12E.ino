#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#define BULB_PIN D4   // GPIO2 (inverted)
#define FAN_PIN  D2   // GPIO4

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

const char* serverUrl = "<your_backend_ip>:5000"; //backend IP address
const char* deviceId = "<deviceId>";  //esp32-002
const char* deviceSecret = "YOUR_DEVICE_SECRET";

WiFiClient client;

// timers
unsigned long lastHeartbeat = 0;
unsigned long lastCommandPoll = 0;
bool lastBulbState;
bool lastFanState;
bool stateInitialized = false;

const unsigned long HEARTBEAT_INTERVAL = 20000; // 20 sec
const unsigned long COMMAND_INTERVAL   = 5000;  // 5 sec

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

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverUrl) + "/devices/heartbeat";

  http.begin(client, url);
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  int httpCode = http.POST("");
  Serial.println("Heartbeat status: " + String(httpCode));

  http.end();
}

void reportState(const char* featureId, bool state) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverUrl) + "/devices/report";

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  StaticJsonDocument<200> doc;
  doc["featureId"] = featureId;
  doc["state"] = state;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  Serial.println("Report status: " + String(httpCode));

  http.end();
}

void fetchCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverUrl) + "/devices/commands";

  http.begin(client, url);
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  int httpCode = http.GET();
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Commands: " + response);

    StaticJsonDocument<512> doc;
    if (deserializeJson(doc, response)) {
      http.end();
      return;
    }

    JsonArray commands = doc["commands"];

    for (JsonObject cmd : commands) {
      const char* featureId = cmd["featureId"];
      bool desired = cmd["desiredState"];
      bool reported = cmd["reportedState"];
    
      // 🔑 first-time sync
      if (!stateInitialized) {
        lastBulbState = reported;
        lastFanState = reported;
        stateInitialized = true;
      }
    
      if (strcmp(featureId, "bulb1") == 0) {
        if (desired != lastBulbState) {
          digitalWrite(BULB_PIN, desired ? LOW : HIGH); // inverted
          reportState("bulb1", desired);
          lastBulbState = desired;
        }
      }
    
      if (strcmp(featureId, "fan1") == 0) {
        if (desired != lastFanState) {
          digitalWrite(FAN_PIN, desired ? HIGH : LOW);
          reportState("fan1", desired);
          lastFanState = desired;
        }
      }
    }
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  pinMode(BULB_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);

  digitalWrite(BULB_PIN, HIGH); // OFF
  digitalWrite(FAN_PIN, LOW);   // OFF

  connectWiFi();
}

void loop() {
  connectWiFi();

  unsigned long now = millis();

  // 🔔 heartbeat
  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = now;
  }

  // 🔄 fetch commands
  if (now - lastCommandPoll >= COMMAND_INTERVAL) {
    fetchCommands();
    lastCommandPoll = now;
  }
}