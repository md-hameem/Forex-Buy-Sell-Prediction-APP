import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Chart({ signals }) {
  const data = [
    { name: '2022-01-01', uv: 1.01, pv: 1.02, signal: 'buy' },
    { name: '2022-01-02', uv: 1.02, pv: 1.03, signal: 'sell' },
    { name: '2022-01-03', uv: 1.03, pv: 1.05, signal: 'buy' },
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
