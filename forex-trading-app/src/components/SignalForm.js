import React, { useState } from 'react';

function SignalForm({ signal, performance, setSignals, setPerformance }) {
  const [symbol, setSymbol] = useState('EURUSD=X');
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2023-01-01');
  const [threshold, setThreshold] = useState(0.002);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);  // Reset previous errors

    const requestData = {
      symbol,
      start_date: startDate,
      end_date: endDate,
      threshold: parseFloat(threshold),
    };

    try {
      const response = await fetch('http://localhost:8000/api/generate-signals', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Response Data:", data);  // Log response to verify the structure

        // Set signals and performance
        setSignals(data.signal);  // Set the signal (buy/sell/hold)
        setPerformance(data.predicted_price);  // Set the predicted price
      } else {
        const errorData = await response.json();
        console.error("Error fetching signals:", errorData);
        setError("There was an error fetching the forex signals. Please try again.");
      }
    } catch (error) {
      console.error("Error in request:", error);
      setError("There was an error fetching the forex signals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="form" className="bg-white shadow-lg p-6 rounded-lg my-8">
      <h2 className="text-2xl font-bold mb-4">Enter Forex Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium">Forex Symbol</label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="e.g., EURUSD=X"
          />
        </div>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
        </div>
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium">Threshold</label>
          <input
            type="number"
            id="threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            step="0.0001"
          />
        </div>
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Generate Signals
          </button>
        )}
      </form>

      {/* Error message display */}
      {error && <div className="text-red-600 mt-4">{error}</div>}

      {/* Display the result after signal generation */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Prediction Results</h3>
        {signal && performance ? (
          <div>
            <p><strong>Signal:</strong> {signal}</p>
            <p><strong>Predicted Price:</strong> {performance}</p>
          </div>
        ) : (
          <p>No results available yet.</p>
        )}
      </div>
    </div>
  );
}

export default SignalForm;
