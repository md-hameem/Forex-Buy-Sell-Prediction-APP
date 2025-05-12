import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Chart({ signals }) {
  // You would replace this with real data
  const data = [
    { name: '01 Jan', uv: 1.01, pv: 1.02, signal: 'buy' },
    { name: '02 Jan', uv: 1.02, pv: 1.03, signal: 'sell' },
    // Add more data points
  ];

  return (
    <div id="chart" className="my-8">
      <h2 className="text-2xl font-bold mb-4">Predicted Prices and Signals</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="uv" stroke="#8884d8" />
          <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Chart;
