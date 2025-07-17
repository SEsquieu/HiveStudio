import React, { useState } from 'react';
import { getCoreEndpoint, postToCore } from '../utils/coreEndpoint';

const AgentList = ({ agents }) => {
  const [sortMode, setSortMode] = useState('all'); // 'all' | 'capability' | 'zone' | 'type'
  const [expandedAgents, setExpandedAgents] = useState(new Set());


  const toggleExpand = (agentId) => {
    setExpandedAgents(prev => {
      const updated = new Set(prev);
      if (updated.has(agentId)) {
        updated.delete(agentId);
      } else {
        updated.add(agentId);
      }
      return updated;
    });
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
            {groupAgents.map((agent) => {
              const bgClass =
                agent.status === 'working' && agent.execution_started
                  ? 'bg-green-900'
                  : agent.status === 'working' && !agent.execution_started
                  ? 'bg-yellow-900'
                  : agent.status === 'cooldown'
                  ? 'bg-amber-800'
                  : 'bg-zinc-900';

              return (
                <div
                  key={agent.agent_id}
                  className={`self-start border rounded-2xl p-4 shadow hover:shadow-xl transition-all duration-200 cursor-pointer ${bgClass} border-zinc-700`}
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
                  
                  {expandedAgents.has(agent.agent_id) && (
                    <div className="mt-3 text-sm text-gray-400">
                      <hr className="my-3 border-zinc-700" />
                      <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-400">
                        <div><strong>Exec Started:</strong> {String(agent.execution_started)}</div>
                        <div><strong>Chunk:</strong> {agent.current_chunk || 'None'}</div>
                        <div><strong>Progress:</strong> {agent.chunk_progress || 0}</div>
                        <div><strong>Req Ticks:</strong> {agent.required_ticks || 'N/A'}</div>
                        {agent.realtime_timing && (
                          <div className="col-span-2">
                            <strong>Realtime:</strong> {agent.realtime_timing.seconds || 0}s {agent.realtime_timing.ms || 0}ms
                          </div>
                        )}
                      </div>

                      {typeof agent.latest_output !== "undefined" && (
                        <div className="mt-3 bg-zinc-800 p-3 rounded-lg text-green-300 font-mono text-xs max-h-40 overflow-y-auto border border-zinc-700">
                          <div className="mb-1 text-gray-400 font-semibold">Simulated Output</div>
                          <pre className="whitespace-pre-wrap">{agent.latest_output || "(no output yet)"}</pre>

                          {agent.type === "SimTerminalAgent" &&
                          agent.status === "working" &&
                          agent.current_intent === "wait_for_input" && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const input = e.target.input.value.trim();
                                  if (!input) return;
                                  await postToCore("/agent_input", { agent_id: agent.agent_id, input });
                                  e.target.reset();
                                }}
                                className="mt-2 flex gap-2"
                              >
                                <input
                                  name="input"
                                  className="flex-1 px-2 py-1 rounded bg-black text-green-400 border border-zinc-600 font-mono text-xs"
                                  placeholder="Type response..."
                                />
                                <button
                                  type="submit"
                                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                                >
                                  Send
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      )}
{/* 
                      {agent.type === "SimDisplayAgent" || agent.type === "SimTerminalAgent" ? (
                        <div className="mt-3 bg-zinc-800 p-3 rounded-lg text-green-300 font-mono text-xs max-h-40 overflow-y-auto border border-zinc-700">
                          <div className="mb-1 text-gray-400 font-semibold">Simulated Output</div>
                          <pre className="whitespace-pre-wrap">{agent.latest_output || "(no output yet)"}</pre>
                          {agent.status === "working" && agent.current_intent === "wait_for_input" && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const input = e.target.input.value.trim();
                                  if (!input) return;
                                  await postToCore("/agent_input", { agent_id: agent.agent_id, input });
                                  e.target.reset();
                                }}
                                className="mt-2 flex gap-2"
                              >
                                <input
                                  name="input"
                                  className="flex-1 px-2 py-1 rounded bg-black text-green-400 border border-zinc-600 font-mono text-xs"
                                  placeholder="Type response..."
                                />
                                <button
                                  type="submit"
                                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                                >
                                  Send
                                </button>
                              </form>
                            </div>    
                          )}
                        </div>
                      ) : null} */}

                    </div>

                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentList;
