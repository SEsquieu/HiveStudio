import React, { useState } from 'react';
import GraphEditor from './components/GraphEditor';

function AgentAutoWrapper() {
  return <div className="p-4 text-white">[Agent Auto-Wrapper Coming Soon]</div>;
}

function TelemetryDashboard() {
  return <div className="p-4 text-white">[Telemetry Dashboard Placeholder]</div>;
}

function CoreVisibility() {
  return <div className="p-4 text-white">[Core Visibility Panel Placeholder]</div>;
}

function App() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-900 text-white">
      <div className="flex space-x-4 p-4 border-b border-zinc-700 bg-zinc-800">
        {['builder', 'autowrapper', 'telemetry', 'core'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
          >
            {tab === 'builder' ? 'Task Builder' :
             tab === 'autowrapper' ? 'Agent Auto-Wrapper' :
             tab === 'telemetry' ? 'Telemetry' : 'Core Visibility'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'builder' && <GraphEditor />}
        {activeTab === 'autowrapper' && <AgentAutoWrapper />}
        {activeTab === 'telemetry' && <TelemetryDashboard />}
        {activeTab === 'core' && <CoreVisibility />}
      </div>
    </div>
  );
}

export default App;
