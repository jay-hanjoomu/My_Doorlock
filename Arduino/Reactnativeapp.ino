#include <MFRC522.h>
#include <SPI.h>

#define SS_PIN 10
#define RST_PIN 9
#define LED_G 5 
#define LED_R 4 
#define RELAY 3 
#define BUZZER 2 
#define ACCESS_DELAY 1000
#define DENIED_DELAY 500

MFRC522 mfrc522(SS_PIN, RST_PIN);

bool doorLocked = true;

void setup() 
{
  Serial.begin(9600);   
  SPI.begin();          
  mfrc522.PCD_Init();   
  pinMode(LED_G, OUTPUT);
  pinMode(LED_R, OUTPUT);
  pinMode(RELAY, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  noTone(BUZZER);
  digitalWrite(RELAY, HIGH);  // Start with the lock in the locked state
  Serial.println("Ready to receive commands...");
}

void loop() 
{
  // Check if there is any data available on the serial port
  if (Serial.available() > 0) {
    char command = Serial.read(); 
    Serial.print("Command received: ");
    Serial.println(command);

    // Handle the unlock and lock commands
    if (command == 'U') {
      unlockDoor();
    } else if (command == 'L') {
      lockDoor();
    } else {
      Serial.print("Unknown command: ");
      Serial.println(command);
    }
  }

  // Check for RFID card presence and read data if available
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String content = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
      content.concat(String(mfrc522.uid.uidByte[i], HEX));
    }
    content.toUpperCase();
    Serial.print("RFID Card detected: ");
    Serial.println(content);

    // Check if the RFID card matches the allowed cards
    if (content.substring(1) == "6F A1 84 1F" || content.substring(1) == "DE C2 E1 00") {
      unlockDoor();
    } else {
      denyAccess();
    }
  }
}

void unlockDoor() {
  if (doorLocked) {
    Serial.println("Unlocking...");
    digitalWrite(RELAY, LOW);  // Activate the relay to unlock
    Serial.println("Relay state: LOW");
    digitalWrite(LED_G, HIGH);  // Green LED on to indicate unlocked
    tone(BUZZER, 5500);  // First tone
    delay(550);         // Duration of the first tone
    noTone(BUZZER);
    delay(100);         // Brief pause between tones
    tone(BUZZER, 2000);  // Second tone
    delay(600);         // Duration of the second tone
    noTone(BUZZER);
    doorLocked = false;
    Serial.println("Door is now unlocked");
  } else {
    Serial.println("Door is already unlocked");
  }
}

void lockDoor() {
  if (!doorLocked) {
    Serial.println("Locking...");
    digitalWrite(RELAY, HIGH);  // Deactivate the relay to lock
    Serial.println("Relay state: HIGH");
    digitalWrite(LED_G, LOW);   // Green LED off
    digitalWrite(LED_R, HIGH);  // Red LED on to indicate locked
    doorLocked = true;
    Serial.println("Door is now locked");
  } else {
    Serial.println("Door is already locked");
  }
}

void denyAccess() {
  Serial.println("Access denied");
  digitalWrite(RELAY, HIGH);
  digitalWrite(LED_R, HIGH);  // Red LED on to indicate access denied
  tone(BUZZER, 300);
  delay(DENIED_DELAY);
  tone(BUZZER, 100);
  digitalWrite(LED_R, LOW);
  noTone(BUZZER);
}
