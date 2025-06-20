import React, { useState } from 'react';
import { useEffect } from 'react';

export default function CoreVisibility() {
  const [status, setStatus] = useState(null);
  const [view, setView] = useState("agents");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8080/status");
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderAgents = () => {
    if (!status?.agents?.length) return <p>No agents found.</p>;
    return (
        <ul>
        {status.agents.map((agent) => (
            <li key={agent.agent_id} className="mb-2 p-2 border border-zinc-700 rounded">
            <strong>{agent.agent_id}</strong> ({agent.capabilities})<br />
            Status: {agent.status}<br />
            Chunk: {agent.current_chunk || "—"}<br />
            Zone: {agent.zone_id || "—"}<br />
            Started: {agent.execution_started ? "yes" : "no"}
            </li>
        ))}
        </ul>
    );
    };


  const renderZones = () => {
    if (!status?.zones?.length) return <p>No active zones.</p>;
    return (
      <ul>
        {status.zones.map((zone) => (
          <li key={zone.zone_id} className="mb-2 p-2 border border-blue-700 rounded">
            <strong>Zone: {zone.zone_id}</strong> <br />
            Task ID: {zone.task_id} <br />
            Agents: {zone.agents.join(", ")}
          </li>
        ))}
      </ul>
    );
  };

  const renderTasks = () => {
    if (!status?.zones?.length) return <p>No tasks found.</p>;
    return (
      <ul>
        {status.zones.map((zone) => (
          <li key={zone.task_id} className="mb-2 p-2 border border-green-700 rounded">
            <strong>Task: {zone.task_id}</strong> <br />
            Zone ID: {zone.zone_id} <br />
            Chunk Count: {zone.chunk_count || 'unknown'}
          </li>
        ))}
      </ul>
    );
  };

  const renderContent = () => {
    if (!status) return <p className="text-white">Loading...</p>;
    if (view === "agents") return renderAgents();
    if (view === "zones") return renderZones();
    if (view === "tasks") return renderTasks();
  };

  return (
    <div className="flex h-full">
      <div className="w-48 bg-zinc-800 p-4 border-r border-zinc-700">
        <button onClick={() => setView("agents")} className="block w-full mb-2 p-2 rounded bg-zinc-700 hover:bg-zinc-600">
          Agents
        </button>
        <button onClick={() => setView("zones")} className="block w-full mb-2 p-2 rounded bg-zinc-700 hover:bg-zinc-600">
          Zones
        </button>
        <button onClick={() => setView("tasks")} className="block w-full mb-2 p-2 rounded bg-zinc-700 hover:bg-zinc-600">
          Tasks
        </button>
      </div>
      <div className="flex-1 p-6 overflow-auto text-white">
        <h2 className="text-xl font-bold mb-4">Live Core Status: {view.charAt(0).toUpperCase() + view.slice(1)}</h2>
        {renderContent()}
      </div>
    </div>
  );
}
