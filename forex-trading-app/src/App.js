import React, { useState } from 'react';
import Header from './components/Header';
import SignalForm from './components/SignalForm';
import Chart from './components/Chart';
import PerformanceMetrics from './components/Matrics';


function App() {
  const [signals, setSignals] = useState([]);
  const [performance, setPerformance] = useState(null);

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Header />
      <div className="container mx-auto p-4">
        <SignalForm setSignals={setSignals} setPerformance={setPerformance} />
        <Chart signals={signals} />
        <PerformanceMetrics performance={performance} />
      </div>
    </div>
  );
}

export default App;
