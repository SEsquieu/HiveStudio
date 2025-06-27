import React, { useState, useRef, useEffect } from 'react';
import GraphEditor from './components/GraphEditor';
import CoreVisibility from './components/CoreVisibility';
import { getSessions, switchSession, deleteSession, createNamedSession } from './utils/coreEndpoint'; // Adjust path if needed
import RuntimeControlPanel from './components/RuntimeControlPanel'; // ← Add this import if not already

function App() {
  const [activeTab, setActiveTab] = useState('builder');
  const [isGraphEditorMounted, setIsGraphEditorMounted] = useState(false);
  const graphEditorRef = useRef(null);
  const [activeSession, setActiveSession] = useState('N/A');
  const [allSessions, setAllSessions] = useState([]);
  const activeLabel = allSessions.find((s) => s.id === activeSession)?.label || activeSession;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  
  function AgentAutoWrapper() {
    return <div className="p-4 text-white">[Agent Auto-Wrapper Coming Soon]</div>;
  }

  function TelemetryDashboard() {
    return <div className="p-4 text-white">[Telemetry Dashboard Placeholder]</div>;
  }

  useEffect(() => {
    console.log("🎯 activeTab changed to:", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { sessions, active } = await getSessions();
      setAllSessions(sessions || []);
      setActiveSession(active || 'N/A');
    };

    fetchSessions();
  }, []);

  const handleSessionChange = async (e) => {
    const selected = e.target.value;
    const result = await switchSession(selected);
    if (result?.status === 'ok') {
      setActiveSession(selected);
    }
  };


  const handleLoadYamlToEditor = (yaml) => {
    const tryInject = () => {
      if (
        graphEditorRef.current &&
        graphEditorRef.current.loadFromYAMLData
      ) {
        console.log("✅ Injecting YAML into GraphEditor");
        graphEditorRef.current.loadFromYAMLData(yaml);
        return true;
      }
      return false;
    };

    if (!tryInject()) {
      console.warn("⏳ Waiting for GraphEditor to mount...");
      const interval = setInterval(() => {
        if (isGraphEditorMounted && tryInject()) {
          clearInterval(interval);
        }
      }, 100);
    }
  };




  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#111', color: '#fff' }}>
      {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: '#222', borderBottom: '1px solid #444' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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

          {/* Session Badge */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-zinc-700 text-white px-3 py-1 rounded hover:bg-zinc-600"
              >
                Session: {activeLabel} ⌄
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-zinc-800 border border-zinc-600 rounded shadow-lg z-50">
                  {allSessions.map((session) => (
                    
                    <div
                      key={session.id}
                      className="flex justify-between items-center px-3 py-2 text-white hover:bg-zinc-700 cursor-pointer"
                      onClick={async () => {
                        if (session.id !== activeSession) {
                          await switchSession(session.id);
                          const { sessions, active } = await getSessions();
                          setAllSessions(sessions);
                          setActiveSession(active);
                          setDropdownOpen(false);
                        }
                      }}                 
                    >
                      <span className="truncate">{session.label}</span>
                      {session.id !== activeSession && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation(); // prevent triggering session switch
                            const res = await deleteSession(session.id);
                            if (res.success) {
                              const { sessions, active } = await getSessions();
                              setAllSessions(sessions);
                              setActiveSession(active);
                            }
                          }}
                          className="text-red-400 text-xs hover:text-red-300"
                          style={{ padding: 4, lineHeight: 1 }}
                          title="Delete session"
                        >
                          ✕
                        </button>
                      )}
                    </div>                                                           
                  ))}
                  <div className="px-3 py-2 border-t border-zinc-600 mt-1">
                    <input
                      type="text"
                      placeholder="New session name"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      className="w-full px-2 py-1 mb-1 bg-zinc-700 text-white rounded"
                    />
                    <button
                      onClick={async () => {
                        //if (!newSessionName.trim()) return;
                        const res = await createNamedSession(newSessionName);
                        const { sessions, active } = await getSessions();
                        setAllSessions(sessions);
                        setActiveSession(active);
                        setNewSessionName('');
                        setDropdownOpen(false);
                      }}
                      className="w-full h-6 text-xs bg-green-600 hover:bg-green-500 text-white rounded flex items-center justify-center"
                    >
                      + Create Session
                    </button>
                  </div>
                </div>              
              )}
            </div>
          </div>
        </div>


      {/* Main Content */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        <div style={{ display: activeTab === 'builder' ? 'flex' : 'none', flex: 1 }}>
          <GraphEditor
            ref={graphEditorRef}
            onInject={() => setActiveTab('core')}
            onMount={() => setIsGraphEditorMounted(true)}
          />
        </div>
        <div style={{ display: activeTab === 'autowrapper' ? 'flex' : 'none', flex: 1 }}>
          <AgentAutoWrapper />
        </div>
        <div style={{ display: activeTab === 'telemetry' ? 'flex' : 'none', flex: 1 }}>
          <TelemetryDashboard />
        </div>
        <div style={{ display: activeTab === 'core' ? 'flex' : 'none', flex: 1 }}>
          <CoreVisibility
            onLoadYamlToEditor={handleLoadYamlToEditor}
            onEditTask={() => setActiveTab('builder')}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
