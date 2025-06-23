import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import AgentList from './AgentList';
import TaskList from './TaskList';
import OverviewStatus from './OverviewStatus';
import RuntimeControlPanel from './RuntimeControlPanel';
import { getCoreEndpoint } from '../utils/coreEndpoint';

export default function CoreVisibility() {
  const [status, setStatus] = useState(null);
  const [view, setView] = useState("agents");
  const prevTaskIdsRef = useRef(new Set());
  //const [prevTaskIds, setPrevTaskIds] = useState(new Set());
  const [autoExpandTaskId, setAutoExpandTaskId] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${getCoreEndpoint()}/status`);
        //const res = await fetch("https://core.hiveos.net/status");
        const data = await res.json();
        setStatus(data);
        const currentTaskIds = new Set((data.tasks || []).map(t => t.task_id));
        const newTasks = [...currentTaskIds].filter(id => !prevTaskIdsRef.current.has(id));

        if (newTasks.length > 0) {
          console.log("Auto-expanding new task:", newTasks[0]);
          setAutoExpandTaskId(newTasks[0]);
        }

        prevTaskIdsRef.current = currentTaskIds;

      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  
  const renderOverview = () => {
    return (
      <>
        <OverviewStatus coreStatus={status} />
        <RuntimeControlPanel
          agents={status?.agents || []}
          tasks={status?.tasks || []}
          zones={status?.zones?.map(z => z.zone_id) || []}
        />
      </>
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
    return (
      <TaskList
        tasks={status?.tasks || []}
        chunks={status?.chunks || []}
        autoExpandTaskId={autoExpandTaskId}
      />
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
      <div className="flex-1 p-6 overflow-auto text-white w-[calc(100vw-12rem)] max-w-full">
        <h2 className="text-xl font-bold mb-4">Live Core Status: {view.charAt(0).toUpperCase() + view.slice(1)}</h2>
        {renderContent()}
      </div>
    </div>
  );
}
