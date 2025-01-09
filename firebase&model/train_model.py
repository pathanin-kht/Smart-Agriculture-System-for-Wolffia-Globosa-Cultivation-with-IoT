import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split  
from sklearn.metrics import mean_squared_error, mean_absolute_error
import os

def initialize_firebase():
    try:
        cred = credentials.Certificate('wolffia-iot-project-firebase.json')
        
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://wolffia-iot-project-default-rtdb.asia-southeast1.firebasedatabase.app'
        })
        print("Firebase initialized successfully.")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        raise

def get_sensor_data():
    try:
        ref = db.reference('/sensor_data')
        sensor_data = ref.get()  

        if not sensor_data:
            raise ValueError("No data available in the Firebase database.")

        df = pd.DataFrame(sensor_data).T  
        
        df = df.sort_index()

        df['temperature'] = pd.to_numeric(df['temperature'], errors='coerce')
        df['humidity'] = pd.to_numeric(df['humidity'], errors='coerce')
        df['mq135'] = pd.to_numeric(df['mq135'], errors='coerce')

        df = df.dropna()

        if df.empty:
            raise ValueError("No valid data available after cleaning.")

        print("Data retrieved from Firebase:")
        print(df.head())
        print(f"Total data points: {len(df)}")

        return df
    except Exception as e:
        print(f"Error fetching sensor data: {e}")
        raise

def prepare_data(df, sequence_length):
    try:
        scaler = MinMaxScaler()
        scaled_data = scaler.fit_transform(df[['temperature', 'humidity', 'mq135']])

        X = []
        y = []

        for i in range(sequence_length, len(scaled_data)):
            X.append(scaled_data[i-sequence_length:i])  
            y.append(scaled_data[i])  

        X, y = np.array(X), np.array(y)

        print(f"Prepared data shapes: X_train: {X.shape}, y_train: {y.shape}")
        if len(X) > 0:
            print(f"Sample of X_train: {X[0]}")
            print(f"Sample of y_train: {y[0]}")
        else:
            raise ValueError("No data prepared. The dataset might be too small.")

        return X, y, scaler
    except Exception as e:
        print(f"Error preparing data: {e}")
        raise

def build_model(sequence_length):
    try:
        model = Sequential()

        model.add(LSTM(units=50, return_sequences=True, input_shape=(sequence_length, 3)))
        model.add(LSTM(units=50))

        model.add(Dense(units=3))  

        model.compile(optimizer='adam', loss='mean_squared_error')

        print("Model built successfully.")
        return model
    except Exception as e:
        print(f"Error building model: {e}")
        raise

def train_model():
    try:
        sequence_length = 10 

        initialize_firebase()

        df = get_sensor_data()

        if len(df) < sequence_length:
            raise ValueError(f"Not enough data to train the model. Minimum required: {sequence_length}, but got: {len(df)}.")

        X, y, scaler = prepare_data(df, sequence_length)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        print(f"X_train shape: {X_train.shape}")  
        print(f"y_train shape: {y_train.shape}")  

        if X_train.shape[0] == 0:
            raise ValueError("No training data prepared.")

        model = build_model(sequence_length)

        model.fit(X_train, y_train, epochs=50, batch_size=32)

        loss = model.evaluate(X_test, y_test)
        print(f"Model evaluation loss: {loss}")
        y_pred = model.predict(X_test)

        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        print(f"Mean Squared Error: {mse}")
        print(f"Mean Absolute Error: {mae}")

        model.save('rnn_model.h5')
        print("Model trained and saved as rnn_model.h5.")

        np.save('scaler.npy', scaler)
        print("Scaler saved as scaler.npy.")

    except Exception as e:
        print(f"Error in train_model: {e}")
        raise

if __name__ == "__main__":
    train_model()
