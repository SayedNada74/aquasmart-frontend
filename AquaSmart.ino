#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "AquaSmart"
#define WIFI_PASSWORD "12345678"

#define API_KEY "AIzaSyBb3U2kWjlQaWfk-AwJ0gJds5pCCUQ3M9U"
#define DATABASE_URL "aquasmart-system-default-rtdb.firebaseio.com" 

FirebaseData fbDO;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;        
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("Firebase Connected OK");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)){
    sendDataPrevMillis = millis();

 
    float temp = random(150, 400) / 10.0; 

    float ph = random(50, 100) / 10.0;     
    
    float ammonia = random(0, 100) / 100.0; 
    
    float doVal = random(30, 500) / 10.0;   


    if (Firebase.RTDB.setFloat(&fbDO, "/Sensors/Temperature", temp)) {
      Serial.print("Temp sent: "); Serial.println(temp);
    }

    if (Firebase.RTDB.setFloat(&fbDO, "/Sensors/PH", ph)) {
      Serial.print("PH sent: "); Serial.println(ph);
    }

    if (Firebase.RTDB.setFloat(&fbDO, "/Sensors/Ammonia", ammonia)) {
      Serial.print("Ammonia sent: "); Serial.println(ammonia);
    }

    if (Firebase.RTDB.setFloat(&fbDO, "/Sensors/DO", doVal)) {
      Serial.print("DO sent: "); Serial.println(doVal);
    }
    
    Serial.println("--------------------------------");
  }
}