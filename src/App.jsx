import React, { useState, useRef, useEffect } from 'react';
import GraphEditor from './components/GraphEditor';
import CoreVisibility from './components/CoreVisibility';
import RuntimeControlPanel from './components/RuntimeControlPanel'; // ← Add this import if not already

function App() {
  const [activeTab, setActiveTab] = useState('builder');
  const graphEditorRef = useRef();

  function AgentAutoWrapper() {
    return <div className="p-4 text-white">[Agent Auto-Wrapper Coming Soon]</div>;
  }

  function TelemetryDashboard() {
    return <div className="p-4 text-white">[Telemetry Dashboard Placeholder]</div>;
  }

  useEffect(() => {
    console.log("🎯 activeTab changed to:", activeTab);
  }, [activeTab]);


  const handleLoadYamlToEditor = (yaml) => {
    console.log("🟦 YAML received, switching tab...");
    setActiveTab('builder');

    

    // Wait for GraphEditor to mount
    const tryInject = () => {
      if (graphEditorRef.current?.loadFromYAMLData) {
        console.log("✅ GraphEditor mounted, injecting YAML");
        graphEditorRef.current.loadFromYAMLData(yaml);
      } else {
        console.log("⏳ Waiting for GraphEditor to mount...");
        setTimeout(tryInject, 50);
      }
    };

    setTimeout(tryInject, 50);
  };



  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#111', color: '#fff' }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', padding: '0.5rem', backgroundColor: '#222', borderBottom: '1px solid #444' }}>
        {['builder', 'autowrapper', 'telemetry', 'core'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'}`}
          >
            {tab === 'builder' ? 'Task Builder' : tab === 'autowrapper' ? 'Agent Auto-Wrapper' : tab === 'telemetry' ? 'Telemetry' : 'Core Visibility'}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        <div style={{ display: activeTab === 'builder' ? 'flex' : 'none', flex: 1 }}>
          <GraphEditor ref={graphEditorRef} onInject={() => setActiveTab('core')} />
        </div>
        <div style={{ display: activeTab === 'autowrapper' ? 'flex' : 'none', flex: 1 }}>
          <AgentAutoWrapper />
        </div>
        <div style={{ display: activeTab === 'telemetry' ? 'flex' : 'none', flex: 1 }}>
          <TelemetryDashboard />
        </div>
        <div style={{ display: activeTab === 'core' ? 'flex' : 'none', flex: 1 }}>
          <CoreVisibility />
        </div>
      </div>
    </div>
  );
}

export default App;
