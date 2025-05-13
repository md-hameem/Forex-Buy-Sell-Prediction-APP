import React, { useState } from 'react';
import Header from './components/Header';
import SignalForm from './components/SignalForm';
import Chart from './components/Chart';
import PerformanceMetrics from './components/Matrics';

function App() {
  const [signals, setSignals] = useState(null);  // Use null to start with no signal
  const [performance, setPerformance] = useState(null);  // Use null to start with no performance

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Header />
      <div className="container mx-auto p-4">
        <SignalForm 
          signal={signals} 
          performance={performance} 
          setSignals={setSignals} 
          setPerformance={setPerformance} 
        />
        
        {/* Display Chart and Performance Metrics only if signals and performance are available */}
        {signals && performance && (
          <>
            <Chart signals={signals} />
            <PerformanceMetrics performance={performance} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
