import React from "react";
//import { switchSession, createSession, deleteSession } from "../utils/coreEndpoint";


const OverviewStatus = ({ coreStatus, sessionId, allSessions = [] }) => {
  if (!coreStatus) return <div className="text-zinc-400">No status data available.</div>;

  const agents = coreStatus.agents || [];
  const tasks = coreStatus.tasks || [];
  const zones = coreStatus.zones || [];
  const chunks = coreStatus.chunks || [];

  const capabilities = Array.from(
    new Set(agents.flatMap(agent => agent.capabilities || []))
  );

  const totalChunks = chunks.length;
  const taskChunkCounts = tasks.map(task =>
    chunks.filter(chunk => chunk.task_id === task.task_id).length
  );

  return (
    <div className="p-4 text-zinc-100">
      <h2 className="text-xl font-semibold mb-4">Live Core Status</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-400">Agents</div>
          <div className="text-xl font-bold">{agents.length}</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-400">Capabilities</div>
          <div className="text-sm">{capabilities.join(", ") || "None"}</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-400">Zones</div>
          <div className="text-xl font-bold">{zones.length}</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-400">Tasks</div>
          <div className="text-xl font-bold">{tasks.length}</div>
          {tasks.length > 0 && (
            <div className="text-xs text-zinc-500 mt-1">Chunks/Task: {taskChunkCounts.join(", ")}</div>
          )}
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-400">Chunks</div>
          <div className="text-xl font-bold">{totalChunks}</div>
        </div>
      </div>
    </div>
  );
};

export default OverviewStatus;
