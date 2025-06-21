import React, { useState } from 'react';
import { useEffect } from 'react';
import AgentList from './AgentList';

export default function CoreVisibility() {
  const [status, setStatus] = useState(null);
  const [view, setView] = useState("agents");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("https://core.hiveos.net/status");
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

  
  const renderOverview = () => {
    if (!status) return <p className="text-white">Loading...</p>;
    return (
      <div className="text-white">
        <p>Core Version: {status.core_version}</p>
        <p>Core ID: {status.core_id}</p>
        <p>Core Status: {status.core_status}</p>
        <p>Core Start Time: {new Date(status.core_start_time * 1000).toLocaleString()}</p>
        <p>Core Uptime: {status.core_uptime} seconds</p>
        <p>Active Zones: {status.zones?.length || 0}</p>
        <p>Active Agents: {status.agents?.length || 0}</p>
        <p>Active Tasks: {status.zones?.reduce((acc, zone) => acc + (zone.task_id ? 1 : 0), 0) || 0}</p>
        <p>Last Updated: {new Date(status.last_updated * 1000).toLocaleString()}</p>
        <p>Core Mode: {status.core_mode}</p>
        <p>Core Type: {status.core_type}</p>
        <p>Core Version: {status.core_version}</p>  
        <p>Core Build: {status.core_build}</p>
        <p>Core Commit: {status.core_commit}</p>
        <p>Core Branch: {status.core_branch}</p>
        <p>Core Config: {status.core_config}</p>
        <p>Core Config Hash: {status.core_config_hash}</p>
        <p>Core Config Version: {status.core_config_version}</p>  
      </div>
    );
  };
  
  const renderAgents = () => {
    return <AgentList agents={status?.agents || []} />;
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
    if (view === "overview") return renderOverview();
    if (view === "agents") return renderAgents();
    if (view === "zones") return renderZones();
    if (view === "tasks") return renderTasks();
  };

  return (
    <div className="flex h-full">
      <div className="w-48 bg-zinc-800 p-4 border-r border-zinc-700">
        <button onClick={() => setView("overview")} className="block w-full mb-2 p-2 rounded bg-zinc-700 hover:bg-zinc-600">
          Overview
        </button>
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
