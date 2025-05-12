from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import random  # For generating dummy signals (will be replaced with model logic)

app = FastAPI()

# CORS middleware to allow requests from frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow React's localhost URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load the trained model
model = tf.keras.models.load_model("forex_signal_model_refined.h5")

# Request body schema for Forex signal generation
class ForexRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    threshold: float

@app.post("/api/generate-signals")
async def generate_signals(request: ForexRequest):
    # Example of input data that you might pass to the model for prediction
    # You would preprocess this data based on your model's expected format
    # Here, we will just generate random signals (replace with real model inference)
    
    # Simulate generating some features from the forex data (you'll need to preprocess actual data)
    input_data = np.random.rand(1, 60, 3)  # Example shape for LSTM (1 sample, 60 timesteps, 3 features)
    
    # Make a prediction using the model
    predicted_price = model.predict(input_data)
    
    # Example of generating random buy/sell/hold signals based on predictions
    signals = ['buy', 'hold', 'sell', 'hold', 'buy']  # Placeholder signals
    performance = {
        'sharpeRatio': random.uniform(0.5, 2.5),  # Random Sharpe ratio for example
        'cumulativeReturns': random.uniform(5, 20)  # Random cumulative returns in percentage
    }
    
    return {"signals": signals, "performance": performance}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Forex Trading Signals API"}
