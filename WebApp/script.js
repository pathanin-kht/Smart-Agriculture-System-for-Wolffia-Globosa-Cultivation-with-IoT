import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWqiSxF6D_ErtEHKKN9MrlH7U_d_K_bHI",
  authDomain: "wolffia-iot-project.firebaseapp.com",
  databaseURL: "https://wolffia-iot-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wolffia-iot-project",
  storageBucket: "wolffia-iot-project.firebasestorage.app",
  messagingSenderId: "1001535330204",
  appId: "1:1001535330204:web:3a7be921a0f4da161b5a59"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app); 

const sensorDataRef = ref(database, 'sensor_data');

const tableBody = document.getElementById('sensorTable').getElementsByTagName('tbody')[0];

onValue(sensorDataRef, (snapshot) => {
  tableBody.innerHTML = '';
  const data = snapshot.val();
  if (data && typeof data === 'object') {
    let latestSensor = null; 

    Object.values(data).forEach((sensor) => {
      const row = tableBody.insertRow();  

      const temperatureCell = row.insertCell(0);
      temperatureCell.textContent = sensor.temperature;

      const humidityCell = row.insertCell(1);
      humidityCell.textContent = sensor.humidity;

      const mq135Cell = row.insertCell(2);
      mq135Cell.textContent = sensor.mq135;

      latestSensor = sensor; 
    });

    if (latestSensor) {
        document.getElementById('latestTemperature').textContent = latestSensor.temperature + ' °C';
        document.getElementById('latestHumidity').textContent = latestSensor.humidity + ' %';
        document.getElementById('latestMQ135').textContent = latestSensor.mq135;
    }
  } else {
    console.error("Data is not an object or is empty");
  }
});

async function fetchPrediction() {
  try {
    const response = await fetch('http://localhost:5000/predict');
    const data = await response.json();  
    console.log("Prediction data:", data);

    if (data.error) {
      document.getElementById('prediction').textContent = `Error: ${data.error}`;
    } else {
      const predictionBody = document.getElementById('predictionBody');
      predictionBody.innerHTML = ''; 

      data.predictions.forEach((prediction, index) => {
        const row = predictionBody.insertRow(); 
        row.insertCell(0).textContent = index + 1; 
        row.insertCell(1).textContent = prediction.temperature.toFixed(2); 
        row.insertCell(2).textContent = prediction.humidity.toFixed(2); 
        row.insertCell(3).textContent = prediction.mq135.toFixed(2); 
      });
    }
  } catch (error) {
    document.getElementById('prediction').textContent = `Error: ${error.message}`;
  }
}

fetchPrediction();

setInterval(fetchPrediction, 30000);

document.getElementById('showAllDataBtn').addEventListener('click', () => {
  const sensorDataSection = document.getElementById('sensorDataSection');
  if (sensorDataSection.style.display === 'none') {
    sensorDataSection.style.display = 'block';
    document.getElementById('showAllDataBtn').textContent = 'Hide All Data'; 
  } else {
    sensorDataSection.style.display = 'none'; 
    document.getElementById('showAllDataBtn').textContent = 'Show All Data'; 
  }
});

document.getElementById('showPredictionBtn').addEventListener('click', () => {
  const predictionSection = document.getElementById('predictionSection');
  if (predictionSection.style.display === 'none') {
    predictionSection.style.display = 'block'; 
    fetchPrediction(); 
    document.getElementById('showPredictionBtn').textContent = 'Hide Predicted Values'; 
  } else {
    predictionSection.style.display = 'none'; 
    document.getElementById('showPredictionBtn').textContent = 'Show Predicted Values'; 
  }
});
