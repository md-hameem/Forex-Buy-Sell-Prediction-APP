from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import os
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

# FastAPI app initialization
app = FastAPI()

# Pydantic Model to validate input
class ForexRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    threshold: float

# Function to load forex data based on symbol and date range
def load_forex_data(symbol, start_date, end_date):
    # Convert string dates into datetime format
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Construct file path based on symbol and date range (replace with your actual data storage path)
    data_path = f"data/{symbol}_{start_date.date()}_{end_date.date()}.csv"
    
    if not os.path.exists(data_path):
        raise HTTPException(status_code=404, detail=f"Data for {symbol} not found in the specified date range.")
    
    # Load CSV data
    df = pd.read_csv(data_path, parse_dates=True, index_col="Date")
    return df

# Function to load the model based on forex symbol
def load_forex_model(symbol):
    model_path = f"forex_model_{symbol}.h5"  # Assuming model files are in the 'backend' folder
    if os.path.exists(model_path):
        model = load_model(model_path)
        return model
    else:
        raise HTTPException(status_code=404, detail=f"Model for {symbol} not found.")

# Function to preprocess the data and make predictions using the model
def process_and_predict(symbol, start_date, end_date, threshold):
    # Load forex data
    df = load_forex_data(symbol, start_date, end_date)

    # Add technical indicators (e.g., SMA, RSI, MACD, etc.)
    df['SMA'] = df['Close'].rolling(window=14).mean()
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    df['MACD'] = df['Close'].ewm(span=12, adjust=False).mean() - df['Close'].ewm(span=26, adjust=False).mean()
    df['EMA'] = df['Close'].ewm(span=14, adjust=False).mean()
    df['BB_upper'] = df['SMA'] + (df['Close'].rolling(window=14).std() * 2)
    df['BB_lower'] = df['SMA'] - (df['Close'].rolling(window=14).std() * 2)

    # Normalize the data using MinMaxScaler
    scaler = MinMaxScaler(feature_range=(0, 1))
    df[['Close', 'SMA', 'RSI', 'MACD', 'EMA', 'BB_upper', 'BB_lower']] = scaler.fit_transform(df[['Close', 'SMA', 'RSI', 'MACD', 'EMA', 'BB_upper', 'BB_lower']])

    # Prepare features for prediction (last 60 data points)
    features = []
    window = 60  # Window size for LSTM
    for i in range(window, len(df)):
        features.append(df.iloc[i-window:i][['Close', 'SMA', 'RSI', 'MACD', 'EMA', 'BB_upper', 'BB_lower']].values)
    
    features = np.array(features)

    # Load the model for the selected forex symbol
    model = load_forex_model(symbol)

    # Make prediction
    predicted_prices = model.predict(features)
    predicted_price = predicted_prices[-1][0]  # Take the last predicted price

    # Generate signal based on the threshold
    signal = "buy" if predicted_price > threshold else "sell" if predicted_price < threshold else "hold"

    return predicted_price, signal

# Endpoint to generate forex signal and predictions
@app.post("/api/generate-signals")
async def generate_signals(request: ForexRequest):
    try:
        # Generate prediction and signal for the given forex symbol and date range
        predicted_price, signal = process_and_predict(
            request.symbol, request.start_date, request.end_date, request.threshold)

        # Return prediction and signal
        return {
            "predicted_price": predicted_price,
            "signal": signal,
            "performance": {'predicted_price': predicted_price}
        }
    except HTTPException as e:
        raise e  # Re-raise HTTPException to return to the client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Forex Trading Signals API"}
