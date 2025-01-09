from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)
CORS(app)  

cred = credentials.Certificate('wolffia-iot-project-firebase.json')  # ใส่ไฟล์ credentials 
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://wolffia-iot-project-default-rtdb.asia-southeast1.firebasedatabase.app'  
})

model = load_model('rnn_model.h5')  

scaler = np.load('scaler.npy', allow_pickle=True).item()  

@app.route('/update', methods=['POST'])
def update_data():
    data = request.json 
    print(data)
    temperature = data.get('temperature')  
    humidity = data.get('humidity')  
    mq135 = data.get('mq135')  

    ref = db.reference('/sensor_data')  
    ref.push({
        'temperature': temperature,  
        'humidity': humidity, 
        'mq135': mq135  
    })

    return jsonify({"status": "success"}), 200   

@app.route('/predict', methods=['GET'])
def predict():
    ref = db.reference('/sensor_data')  
    sensor_data = ref.get()  

    if not sensor_data:
        return jsonify({"error": "No data available"}), 400  

    df = pd.DataFrame(sensor_data).T  
    df['temperature'] = pd.to_numeric(df['temperature'], errors='coerce')  
    df['humidity'] = pd.to_numeric(df['humidity'], errors='coerce')  
    df['mq135'] = pd.to_numeric(df['mq135'], errors='coerce')  

    df = df.dropna()

    sequence_length = 10

    if len(df) < sequence_length:
        return jsonify({"error": "Not enough data to make a prediction"}), 400  # 

    scaled_data = scaler.transform(df[['temperature', 'humidity', 'mq135']])  # ใช้ scaler 

    X_test = []
    X_test.append(scaled_data[-sequence_length:])  
    X_test = np.array(X_test)
    X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 3))  # 

    num_predictions = 5
    predictions = []

    for _ in range(num_predictions):
        predicted_values = model.predict(X_test)

        predictions.append(predicted_values[0])  
        new_input = np.append(X_test[0][1:], [predicted_values[0]], axis=0)  
        X_test = np.array([new_input]) 

    predicted_values_inverse = scaler.inverse_transform(predictions)  

    predicted_values_list = predicted_values_inverse.tolist()

    return jsonify({
        "predictions": [
            {"temperature": pred[0], "humidity": pred[1], "mq135": pred[2]} for pred in predicted_values_list
        ]
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  
