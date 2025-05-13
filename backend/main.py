from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Import CORS Middleware
from pydantic import BaseModel
from datetime import datetime
import os
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import yfinance as yf

# FastAPI app initialization
app = FastAPI()

# Add CORS middleware to the app
origins = [
    "http://localhost:3000",  # Allow frontend hosted on port 3000 (for example)
    "https://yourfrontenddomain.com",  # Allow specific frontend domains
    "*",  # Allow all origins (be cautious with this in production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Pydantic Model to validate input
class ForexRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    threshold: float

# Function to fetch forex data based on symbol and date range
def fetch_forex_data(symbol, start_date, end_date):
    try:
        # Convert string dates into datetime format
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Fetch forex data using yfinance
    data = yf.download(symbol, start=start_date, end=end_date, interval="1d")
    if data.empty:
        raise HTTPException(status_code=404, detail=f"Data for {symbol} not found in the specified date range.")
    
    return data

# Function to add technical indicators to the data
def add_technical_indicators(df):
    # Simple Moving Average (SMA)
    df['SMA'] = df['Close'].rolling(window=14).mean()
    
    # Relative Strength Index (RSI)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Moving Average Convergence Divergence (MACD)
    df['MACD'] = df['Close'].ewm(span=12, adjust=False).mean() - df['Close'].ewm(span=26, adjust=False).mean()
    
    return df

# Function to preprocess the data (add technical indicators, handle missing values, and normalize)
def preprocess_data(symbol, start_date, end_date):
    df = fetch_forex_data(symbol, start_date, end_date)
    
    # Add technical indicators
    df = add_technical_indicators(df)
    
    # Handle missing values (forward fill)
    df.ffill(inplace=True)
    
    # Normalize data using MinMaxScaler
    scaler = MinMaxScaler(feature_range=(0, 1))
    df[['Close', 'SMA', 'RSI', 'MACD']] = scaler.fit_transform(df[['Close', 'SMA', 'RSI', 'MACD']])
    
    return df, scaler

# Function to prepare features and labels for model prediction
def prepare_features(df, window=60):
    features = []
    labels = []
    
    for i in range(window, len(df)):
        features.append(df.iloc[i-window:i][['Close', 'SMA', 'RSI', 'MACD']].values)
        labels.append(df.iloc[i]['Close'])
    
    return np.array(features), np.array(labels)

# Function to load the forex model based on the symbol
def load_forex_model(symbol):
    model_path = f"forex_model_{symbol}.h5"  # Assuming model files are in the same folder
    if os.path.exists(model_path):
        model = load_model(model_path)
        return model
    else:
        raise HTTPException(status_code=404, detail=f"Model for {symbol} not found.")

# Function to generate forex signal and prediction
def process_and_predict(symbol, start_date, end_date, threshold):
    # Preprocess the data
    df, scaler = preprocess_data(symbol, start_date, end_date)
    
    # Prepare features
    features, _ = prepare_features(df)
    
    # Load model
    model = load_forex_model(symbol)
    
    # Make prediction
    predicted_prices = model.predict(features)
    predicted_price = predicted_prices[-1][0]  # Last predicted price
    
    # Generate signal based on the threshold
    signal = "buy" if predicted_price > threshold else "sell" if predicted_price < threshold else "hold"
    
    # Convert predicted_price to a Python native float type
    predicted_price = float(predicted_price)
    
    return predicted_price, signal

# API endpoint to generate forex signals and predictions
@app.post("/api/generate-signals")
async def generate_signals(request: ForexRequest):
    try:
        predicted_price, signal = process_and_predict(
            request.symbol, request.start_date, request.end_date, request.threshold
        )
        return {
            "predicted_price": predicted_price,
            "signal": signal,
            "performance": {'predicted_price': predicted_price}
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Forex Trading Signals API"}
