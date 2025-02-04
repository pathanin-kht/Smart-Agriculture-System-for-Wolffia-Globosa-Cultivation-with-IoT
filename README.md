# Smart Agriculture System for Wolffia Globosa Cultivation with IoT

## Overview
This project develops a smart agriculture system for cultivating *Wolffia globosa* using IoT technology. The goal is to help farmers in the Northeastern region of Thailand manage and monitor the environmental conditions of their *Wolffia globosa* cultivation efficiently. The system utilizes IoT technology to monitor temperature, humidity, gas levels, water turbidity, and the quality of *Wolffia globosa* via ESP32 cameras and OpenCV.

## Features
- **Temperature and Humidity Control**: Uses sensors to monitor temperature and humidity for optimal growth of *Wolffia globosa*.
- **Water Quality Monitoring**: Monitors the turbidity of water to prevent water spoilage.
- **Gas Sensor**: Uses an MQ135 to monitor harmful gases such as ammonia that could harm the growth of *Wolffia globosa*.
- **Wolffia globosa Quality Monitoring**: Uses ESP32 Camera and OpenCV to analyze and count the number of *Wolffia globosa* to assess their health.
- **Real-time Notifications**: The system sends notifications through a website if any abnormalities are detected in the environment.
- **Prediction System**: Implements RNN-LSTM model to forecast environmental changes like temperature and humidity.

## Technologies Used
- **Hardware**: ESP32, DHT11, MQ135, Water Turbidity Sensor, ESP32 Camera
- **Software**: Python, Flask API, Firebase, OpenCV, RNN-LSTM

## Example
> **Note:** The code is currently under development.
>

### 1. Test Case for OpenCV to analyze and count the number of Wolffia globosa.
![TestCase](https://github.com/pathanin-kht/Smart-Agriculture-System-for-Wolffia-Globosa-Cultivation-with-IoT/blob/07aff3e1f6f5d0994f0c72ec86c6c15b4f9c11b0/TestCase/OpenCV_TestCase.png)

### 2. Test Case for Web Application to show real time data and also prediction value.
![TestCase2](https://github.com/pathanin-kht/Smart-Agriculture-System-for-Wolffia-Globosa-Cultivation-with-IoT/blob/736d87d541431174d72bce8ea8e12a9dbc63e760/TestCase/Web_TestCase.png)

### 3. The RNN-LSTM Model
![TestCase3](https://github.com/pathanin-kht/Smart-Agriculture-System-for-Wolffia-Globosa-Cultivation-with-IoT/blob/155b9aae17021310ce60195edbe0322ee1f3fc3d/TestCase/Model_TestCase.png)
> The model performs well with an MSE of 0.0621 and MAE of 0.2071, suggesting that it is capable of making relatively accurate predictions. 
>

## Installation (Under development)
This system is currently under development and is not yet operational. Updates will be provided as progress is made.

## License
This project has not yet disclosed the licensing terms and will be updated in the future.

## Contact
For inquiries or feedback, please reach out via [pathanin.kht@gmail.com](pathanin.kht@gmail.com)
