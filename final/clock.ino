#include <Wire.h>
#include "DS1307.h"
#include <IRSendRev.h>
#include <SeeedOLED.h>
#include <Bridge.h>
DS1307 clock;

/* pins */
int pinButton = 4;
int pinRecv = 5;
int pinBuzzer = 8;

/* RTC time variables */
String hour = "";
String minute = "";
String second = "";
String year = "";
String month = "";
String day = "";
String alarm_hour = "07";
String alarm_minute = "00";
bool alarmSet = false;
int alarmSettingState = 0;
int blinkInterval = 500;
unsigned long blinkPreviousMillis = 0;

/* buzzer variables */
bool buzzing = false;
int buzzState = 0;
int buzzInterval = 130;
unsigned long buzzPreviousMillis = 0;

/* IR variables */
int BIT_DATA = 8;
unsigned char dta[20];
#define CH      98
#define EQ      144
#define PLUS    168
#define MINUS   224

char remoteOn[2];

String setFormat(String str) {
  str = "0" + str;
  return str.substring(str.length()-2, str.length());
}

void setAlarm(int delta) { 
  if(alarmSettingState == 1) {
    int h = alarm_hour.toInt() + delta;
    if(h<0) h = 23;
    else h = h % 24;
    alarm_hour = setFormat(String(h));
  }
  else if(alarmSettingState == 2) {
    int m = alarm_minute.toInt() + delta;
    if(m<0) m = 59;
    else m = m % 60;
    alarm_minute = setFormat(String(m));
  }
}

void printTime() {
  clock.getTime();
  year = String(clock.year+2000, DEC);
  month = setFormat(String(clock.month, DEC));
  day = setFormat(String(clock.dayOfMonth, DEC));
  hour = setFormat(String(clock.hour, DEC));
  minute = setFormat(String(clock.minute, DEC));
  second = setFormat(String(clock.second, DEC));  
  String dateStr = year + "/" + month + "/" + day;
  String timeStr = hour + ":" + minute + ":" + second;
  String alarmTimeStr = alarm_hour + ":" + alarm_minute;
 
  SeeedOled.setTextXY(1,0);
  SeeedOled.putString(dateStr.c_str());
  SeeedOled.setTextXY(2,0); 
  SeeedOled.putString(timeStr.c_str());   
  
  SeeedOled.setTextXY(4,0); 
  SeeedOled.putString("Alarm clock: ");  
  if(alarmSet) SeeedOled.putString("On ");
  else SeeedOled.putString("Off");    
  SeeedOled.setTextXY(5,0); 
  SeeedOled.putString(alarmTimeStr.c_str());
}

void listenOnButton() {
  int buttonState = digitalRead(pinButton);    
  if(buttonState == 1) {
    alarmSet = false; 
    buzzing = false;
  }
}

void listenOnIR() {
  if(IR.IsDta()) {
    IR.Recv(dta);
    Serial.println(dta[BIT_DATA], DEC);
    switch (dta[BIT_DATA]) {
      case CH:
        alarmSet = !alarmSet;
        if(!alarmSet) buzzing = false;
        break;
      case EQ:
        alarmSettingState = (alarmSettingState + 1) % 3;
        break;
      case PLUS:
        setAlarm(1);
        break;
      case MINUS:
        setAlarm(-1);
        break;
      default: break;
    }
  }
}

void checkAlarm() {
  if(hour == alarm_hour && minute == alarm_minute)
    buzzing = true;
}

void getRemoteControl() {
  Bridge.get("control", remoteOn, 2);
  Serial.println(remoteOn);
  if(remoteOn[0] == '1') {
    alarmSet = true; 
    buzzing = true;
  }
}

void alarmBlink() {
  unsigned long currentMillis = millis();
  if(currentMillis - blinkPreviousMillis >= blinkInterval) {
    blinkPreviousMillis = currentMillis;
    if(alarmSettingState == 1) {
      SeeedOled.setTextXY(5,0); 
      SeeedOled.putString("  ");
    }
    else if(alarmSettingState == 2) {
      SeeedOled.setTextXY(5,3); 
      SeeedOled.putString("  ");    
    }
  } 
}

void buzz() {
  if(buzzing) {
    unsigned long currentMillis = millis();
    if(currentMillis - buzzPreviousMillis >= buzzInterval) {
      buzzPreviousMillis = currentMillis;
      if(buzzState < 4) {
        tone(pinBuzzer, 1000, 50);
      }
      buzzState = (buzzState + 1) % 6;
    }
  }
}


void setup(){
  Serial.begin(9600);
  Bridge.begin();
  pinMode(pinButton, INPUT);
  /*
  clock.begin();
  clock.fillByYMD(2017,6,11);
  clock.fillByHMS(20,28,30);   
  clock.setTime();
  */
  IR.Init(pinRecv);
  SeeedOled.init();
  SeeedOled.clearDisplay(); 
  SeeedOled.setNormalDisplay();
  SeeedOled.setPageMode();  
}
 
void loop(){  
  printTime();
  listenOnButton();
  listenOnIR();  
  if(alarmSet) {
    checkAlarm();
    buzz();
  }  
  alarmBlink();
  getRemoteControl();
}
