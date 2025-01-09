// นำเข้า Firebase SDK functions ที่ใช้
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// การตั้งค่า Firebase configuration
const firebaseConfig = {
  apiKey: "ใส่ apiKey ของ Firebase ที่นี่",
  authDomain: "wolffia-iot-project.firebaseapp.com",
  databaseURL: "https://wolffia-iot-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wolffia-iot-project",
  storageBucket: "wolffia-iot-project.appspot.com",
  messagingSenderId: "1001535330204",
  appId: "1:1001535330204:web:3a7be921a0f4da161b5a59"
};

// เริ่มต้น Firebase ด้วยการตั้งค่าข้างต้น
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);  // เชื่อมต่อกับ Firebase Realtime Database

// อ้างอิงไปยังตำแหน่ง sensor_data ใน Firebase
const sensorDataRef = ref(database, 'sensor_data');

// ดึงเอา body ของตารางเพื่อเตรียมแทรกข้อมูลเซ็นเซอร์
const tableBody = document.getElementById('sensorTable').getElementsByTagName('tbody')[0];

// ฟังค์ชั่นนี้จะทำงานเมื่อข้อมูลใน Firebase มีการเปลี่ยนแปลง
onValue(sensorDataRef, (snapshot) => {
  // ล้างข้อมูลในตารางก่อนจะเพิ่มข้อมูลใหม่
  tableBody.innerHTML = '';

  // ดึงข้อมูลจาก snapshot และแปลงข้อมูลเป็น array หากข้อมูลเป็น object
  const data = snapshot.val();

  // ตรวจสอบว่า data เป็น object และมีข้อมูลหรือไม่
  if (data && typeof data === 'object') {
    let latestSensor = null; // ตัวแปรเพื่อเก็บข้อมูลล่าสุด

    // ใช้ Object.values() เพื่อดึงค่าต่างๆ ใน data ออกมา
    Object.values(data).forEach((sensor) => {
      const row = tableBody.insertRow();  // สร้างแถวใหม่ในตาราง

      // เพิ่มค่าอุณหภูมิ
      const temperatureCell = row.insertCell(0);
      temperatureCell.textContent = sensor.temperature;

      // เพิ่มค่าความชื้น
      const humidityCell = row.insertCell(1);
      humidityCell.textContent = sensor.humidity;

      // เพิ่มค่า MQ135
      const mq135Cell = row.insertCell(2);
      mq135Cell.textContent = sensor.mq135;

      latestSensor = sensor; // เก็บค่าข้อมูลล่าสุด
    });

    // อัปเดตข้อมูลล่าสุดในแดชบอร์ด
    if (latestSensor) {
        document.getElementById('latestTemperature').textContent = latestSensor.temperature + ' °C';
        document.getElementById('latestHumidity').textContent = latestSensor.humidity + ' %';
        document.getElementById('latestMQ135').textContent = latestSensor.mq135;
    }
  } else {
    console.error("Data is not an object or is empty");
  }
});

// ฟังค์ชั่นดึงค่าที่ทำนายจาก API
async function fetchPrediction() {
  try {
    // ส่งคำขอไปที่ API เพื่อดึงค่าที่ทำนาย
    const response = await fetch('http://localhost:5000/predict');
    const data = await response.json();  // แปลงคำตอบเป็น JSON

    // ตรวจสอบโครงสร้างของ data ก่อน
    console.log("Prediction data:", data);

    // ถ้ามี error จะแสดงข้อความ error
    if (data.error) {
      document.getElementById('prediction').textContent = `Error: ${data.error}`;
    } else {
      // ถ้าการทำนายสำเร็จ แสดงค่าที่ทำนายในรูปแบบรายการ
      const predictionBody = document.getElementById('predictionBody');
      predictionBody.innerHTML = ''; // เคลียร์ค่าเดิม

      data.predictions.forEach((prediction, index) => {
        const row = predictionBody.insertRow(); // สร้างแถวใหม่ในตาราง
        // เพิ่มค่าทำนาย
        row.insertCell(0).textContent = index + 1; // หมายเลขการทำนาย
        row.insertCell(1).textContent = prediction.temperature.toFixed(2); // อุณหภูมิ
        row.insertCell(2).textContent = prediction.humidity.toFixed(2); // ความชื้น
        row.insertCell(3).textContent = prediction.mq135.toFixed(2); // ค่า MQ135
      });
    }
  } catch (error) {
    // แสดงข้อผิดพลาดถ้า API ไม่ทำงานหรือเกิดปัญหา
    document.getElementById('prediction').textContent = `Error: ${error.message}`;
  }
}

// ดึงค่าที่ทำนายเมื่อโหลดหน้าเว็บ
fetchPrediction();

// ดึงค่าที่ทำนายทุกๆ 30 วินาที (ตัวเลือกเสริม)
setInterval(fetchPrediction, 30000);

// ฟังค์ชั่นเพื่อแสดงข้อมูลทั้งหมดในตารางเมื่อคลิกปุ่ม
document.getElementById('showAllDataBtn').addEventListener('click', () => {
  const sensorDataSection = document.getElementById('sensorDataSection');
  if (sensorDataSection.style.display === 'none') {
    sensorDataSection.style.display = 'block'; // แสดงข้อมูล
    document.getElementById('showAllDataBtn').textContent = 'Hide All Data'; // เปลี่ยนข้อความปุ่ม
  } else {
    sensorDataSection.style.display = 'none'; // ซ่อนข้อมูล
    document.getElementById('showAllDataBtn').textContent = 'Show All Data'; // เปลี่ยนข้อความปุ่ม
  }
});

// ฟังค์ชั่นเพื่อแสดงผลการทำนายเมื่อคลิกปุ่ม
document.getElementById('showPredictionBtn').addEventListener('click', () => {
  const predictionSection = document.getElementById('predictionSection');
  if (predictionSection.style.display === 'none') {
    predictionSection.style.display = 'block'; // แสดงข้อมูลทำนาย
    fetchPrediction(); // ดึงข้อมูลทำนายใหม่เมื่อแสดง
    document.getElementById('showPredictionBtn').textContent = 'Hide Predicted Values'; // เปลี่ยนข้อความปุ่ม
  } else {
    predictionSection.style.display = 'none'; // ซ่อนข้อมูลทำนาย
    document.getElementById('showPredictionBtn').textContent = 'Show Predicted Values'; // เปลี่ยนข้อความปุ่ม
  }
});
