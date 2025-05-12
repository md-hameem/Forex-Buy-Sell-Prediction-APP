import React from 'react';

function PerformanceMetrics({ performance }) {
  return (
    <div id="metrics" className="bg-white shadow-lg p-6 rounded-lg my-8">
      <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
      {performance ? (
        <div className="space-y-4">
          <p><strong>Sharpe Ratio:</strong> {performance.sharpeRatio}</p>
          <p><strong>Cumulative Returns:</strong> {performance.cumulativeReturns}%</p>
        </div>
      ) : (
        <p>No performance data available.</p>
      )}
    </div>
  );
}

export default PerformanceMetrics;
