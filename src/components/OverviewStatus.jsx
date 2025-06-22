import React from "react";

const OverviewStatus = ({ coreStatus }) => {
  if (!coreStatus) return <div className="text-zinc-400">No status data available.</div>;

  const agents = coreStatus.agents || [];
  const tasks = coreStatus.tasks || [];
  const zones = coreStatus.zones || [];

  const capabilities = Array.from(
    new Set(
      agents.flatMap(agent => agent.capabilities || [])
    )
  );

    const allChunks = coreStatus.chunks || [];

    const taskChunkCounts = tasks.map(task =>
    allChunks.filter(chunk => chunk.task_id === task.task_id).length
    );

    const totalChunks = allChunks.length;


  return (
    <div className="p-4 text-zinc-100">
      <h2 className="text-xl font-semibold mb-4">Live Core Status Overview</h2>
      <ul className="space-y-2">
        <li><span className="font-medium text-zinc-300">Agents:</span> {agents.length}</li>
        <li><span className="font-medium text-zinc-300">Capabilities:</span> {capabilities.join(", ") || "None"}</li>
        <li><span className="font-medium text-zinc-300">Zones:</span> {zones.length}</li>
        <li>
          <span className="font-medium text-zinc-300">Tasks:</span> {tasks.length}
          {tasks.length > 0 && (
            <span className="text-zinc-400 ml-2">
              (Chunks per Task: {taskChunkCounts.join(", ")})
            </span>
          )}
        </li>
        <li><span className="font-medium text-zinc-300">Total Chunks:</span> {totalChunks}</li>
      </ul>
    </div>
  );
};

export default OverviewStatus;
