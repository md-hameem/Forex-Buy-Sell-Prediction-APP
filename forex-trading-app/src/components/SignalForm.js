import React, { useState } from 'react';

function SignalForm({ setSignals, setPerformance }) {
  const [symbol, setSymbol] = useState('EURUSD=X');
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2023-01-01');
  const [threshold, setThreshold] = useState(0.002);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Structure the data to match the expected format in FastAPI
    const requestData = {
      symbol,
      start_date: startDate,
      end_date: endDate,
      threshold: parseFloat(threshold),
    };

    try {
      // Send POST request to FastAPI backend
      const response = await fetch('http://localhost:8000/api/generate-signals', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Handle the response
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals);
        setPerformance(data.performance);
      } else {
        // Handle error responses (e.g., 422 or other errors)
        const errorData = await response.json();
        console.error("Error fetching signals:", errorData);
        alert("There was an error fetching the forex signals. Please try again.");
      }
    } catch (error) {
      console.error("Error in request:", error);
      alert("There was an error fetching the forex signals. Please try again.");
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
    </div>
  );
}

export default SignalForm;
