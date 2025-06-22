import React, { useState } from 'react';

const AgentList = ({ agents }) => {
  const [sortMode, setSortMode] = useState('all'); // 'all' | 'capability' | 'zone' | 'type'
  const [expandedAgentId, setExpandedAgentId] = useState(null);

  const toggleExpand = (agentId) => {
    setExpandedAgentId(expandedAgentId === agentId ? null : agentId);
  };

  const groupAgents = (agents) => {
    if (sortMode === 'capability') {
      return groupBy(agents, 'capabilities');
    } else if (sortMode === 'zone') {
      return groupBy(agents, 'zone');
    } else if (sortMode === 'type') {
      return groupBy(agents, 'type');
    }
    return { All: agents };
  };

  const groupBy = (arr, key) => {
    const grouped = {};
    arr.forEach((agent) => {
      const groupKey = Array.isArray(agent[key]) ? agent[key].join(', ') : agent[key] || 'Unassigned';
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(agent);
    });
    return grouped;
  };

  const groupedAgents = groupAgents(agents);

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <label>Sort by:</label>
        <select
          className="border px-2 py-1 rounded bg-zinc-800 text-white"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="all">All</option>
          <option value="capability">Capability</option>
          <option value="zone">Zone</option>
          <option value="type">Type (sim/hw)</option>
        </select>
      </div>

      {Object.entries(groupedAgents).map(([group, groupAgents]) => (
        <div key={group} className="mb-6">
          {sortMode !== 'all' && <h3 className="text-lg font-bold mb-2">{group}</h3>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupAgents.map((agent) => (
              <div
                key={agent.agent_id}
                className={`border rounded-2xl p-4 shadow hover:shadow-xl transition-all duration-200 cursor-pointer bg-zinc-900 border-zinc-700`}
                onClick={() => toggleExpand(agent.agent_id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-lg text-white">{agent.name || agent.agent_id}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      agent.status === 'working' ? 'bg-blue-600' :
                      agent.status === 'idle' ? 'bg-green-600' :
                      agent.status === 'cooldown' ? 'bg-yellow-600' : 'bg-gray-600'
                    } text-white`}
                  >
                    {agent.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400">ID: {agent.agent_id}</div>
                <hr className="my-2 border-zinc-700" />
                <div className="text-sm text-gray-300">Zone: {agent.zone || 'None'}</div>
                <div className="text-sm text-gray-300">Capabilities: {(Array.isArray(agent.capabilities) ? agent.capabilities : [agent.capabilities || "unknown"]).join(", ")}</div>
                
                {expandedAgentId === agent.agent_id && (
                  <div className="mt-3 text-sm text-gray-400 space-y-1">
                    <div>Execution Started: {String(agent.execution_started)}</div>
                    <div>Current Chunk: {agent.current_chunk || 'None'}</div>
                    <div>Chunk Progress: {agent.chunk_progress || 0}</div>
                    <div>Required Ticks: {agent.required_ticks || 'N/A'}</div>
                    {agent.realtime_timing && (
                      <div>Realtime Delay: {agent.realtime_timing.seconds || 0}s {agent.realtime_timing.ms || 0}ms</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentList;
