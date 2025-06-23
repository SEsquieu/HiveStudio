import React, { useState, useEffect } from "react";
import { getCoreEndpoint } from "../utils/coreEndpoint";

function RuntimeControlPanel({ agents = [], tasks = [], zones = [] }) {
  const [agentSource, setAgentSource] = useState("sim");  // 'sim' or 'hardware'
  const [agentCapability, setAgentCapability] = useState("display");
  const [agentIdToRemove, setAgentIdToRemove] = useState("");
  const [taskIdToNuke, setTaskIdToNuke] = useState("");
  const [zoneIdToControl, setZoneIdToControl] = useState("");
  const [section, setSection] = useState("agent");

  useEffect(() => {
    if (agents.length && !agents.some((a) => a.agent_id === agentIdToRemove)) {
      setAgentIdToRemove(agents[0].agent_id);
    }
    if (tasks.length && !tasks.some((t) => t.task_id === taskIdToNuke)) {
      setTaskIdToNuke(tasks[0].task_id);
    }
    if (zones.length && !zones.includes(zoneIdToControl)) {
      setZoneIdToControl(zones[0]);
    }
  }, [agents, tasks, zones]);

  const makePost = async (endpoint, payload = {}) => {
    const res = await fetch(`${getCoreEndpoint()}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log(`${endpoint}:`, data);
  };

  return (
    <div className="mt-8 border-t border-zinc-700 pt-6">
      <h2 className="text-2xl font-bold mb-4">Runtime Controls</h2>

      {/* AGENT CONTROL */}
      <div className="mb-4">
        <button
          onClick={() => setSection(section === "agent" ? "" : "agent")}
          className="text-left w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          🧑‍🔧 Agent Control
        </button>
        {section === "agent" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            {/* Inject */}
            <div className="p-4 border border-zinc-600 rounded-lg bg-zinc-800">
                <h3 className="font-semibold text-lg mb-2">Inject Agent</h3>

                {/* Agent Type Selector */}
                <div className="flex gap-3 mb-3">
                    <button
                        onClick={() => setAgentSource("sim")}
                        className={`px-4 py-1 rounded font-semibold border ${
                        agentSource === "sim"
                            ? "bg-green-700 border-green-500 text-white"
                            : "bg-zinc-700 border-zinc-500 text-gray-300"
                        }`}
                    >
                        Sim Agent
                    </button>
                    <button
                        onClick={() => setAgentSource("hardware")}
                        className={`px-4 py-1 rounded font-semibold border ${
                        agentSource === "hardware"
                            ? "bg-blue-700 border-blue-500 text-white"
                            : "bg-zinc-700 border-zinc-500 text-gray-300"
                        }`}
                    >
                        Hardware Agent
                    </button>
                    </div>


                {/* Capability Selector */}
                <label className="block text-sm font-medium mb-1">Capability</label>
                <select
                    className="w-full px-2 py-1 rounded bg-zinc-700 text-white"
                    value={agentCapability}
                    onChange={(e) => setAgentCapability(e.target.value)}
                >
                    <option value="display">display</option>
                    <option value="generic">generic</option>
                    <option value="sensor">sensor</option>
                    <option value="motor">motor</option>
                    <option value="terminal">terminal</option>
                    {/* Add more as needed */}
                </select>

                <button
                    onClick={() =>
                        makePost("inject_agent", {
                            agent_source: agentSource,
                            capabilities: [agentCapability],
                        })
                    }
                    className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold"
                >
                    Inject Agent
                </button>
                </div>


            {/* Remove */}
            <div className="p-4 border border-zinc-600 rounded-lg bg-zinc-800">
              <h3 className="font-semibold text-lg mb-2">Remove Agent</h3>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {agents.map((agent) => (
                  <div
                    key={agent.agent_id}
                    onClick={() => setAgentIdToRemove(agent.agent_id)}
                    className={`px-2 py-1 rounded cursor-pointer text-sm text-white text-ellipsis overflow-hidden whitespace-nowrap border 
                      ${agentIdToRemove === agent.agent_id ? "bg-red-700 border-red-500" : "bg-zinc-700 border-zinc-500"}`}
                  >
                    {agent.agent_id}
                  </div>
                ))}
              </div>
              <button
                onClick={() => makePost("remove_agent", { agent_id: agentIdToRemove })}
                className="mt-3 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold"
              >
                Remove Agent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TASK CONTROL */}
      <div className="mb-4">
        <button
          onClick={() => setSection(section === "task" ? "" : "task")}
          className="text-left w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          📦 Task Control
        </button>
        {section === "task" && (
          <div className="mt-3 p-4 border border-zinc-600 rounded-lg bg-zinc-800">
            <h3 className="font-semibold text-lg mb-2">Nuke Task</h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.task_id}
                  onClick={() => setTaskIdToNuke(task.task_id)}
                  className={`px-2 py-1 rounded cursor-pointer text-sm text-white text-ellipsis overflow-hidden whitespace-nowrap border 
                    ${taskIdToNuke === task.task_id ? "bg-red-700 border-red-500" : "bg-zinc-700 border-zinc-500"}`}
                >
                  {task.task_id}
                </div>
              ))}
            </div>
            <button
              onClick={() => makePost("nuke_task", { task_id: taskIdToNuke })}
              className="mt-3 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold"
            >
              Nuke Task
            </button>
          </div>
        )}
      </div>

      {/* ZONE CONTROL */}
      <div className="mb-4">
        <button
          onClick={() => setSection(section === "zone" ? "" : "zone")}
          className="text-left w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          🧠 Zone Control
        </button>
        {section === "zone" && (
          <div className="mt-3 p-4 border border-zinc-600 rounded-lg bg-zinc-800">
            <h3 className="font-semibold text-lg mb-2">Select Zone</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {zones.map((z) => (
                <div
                  key={z}
                  onClick={() => setZoneIdToControl(z)}
                  className={`px-2 py-1 rounded cursor-pointer text-sm text-white text-center border 
                    ${zoneIdToControl === z ? "bg-blue-700 border-blue-500" : "bg-zinc-700 border-zinc-500"}`}
                >
                  {z}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={() => makePost("freeze_zone", { zone_id: zoneIdToControl })} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold">Freeze</button>
              <button onClick={() => makePost("unfreeze_zone", { zone_id: zoneIdToControl })} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white font-semibold">Unfreeze</button>
              <button onClick={() => makePost("reset_zone", { zone_id: zoneIdToControl })} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold">Reset</button>
            </div>
          </div>
        )}
      </div>

      {/* CORE CONTROL */}
      <div className="mb-4">
        <button
          onClick={() => setSection(section === "core" ? "" : "core")}
          className="text-left w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          ⏱ Global Control
        </button>
        {section === "core" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 p-4 border border-zinc-600 rounded-lg bg-zinc-800">
            <button onClick={() => makePost("pause_core")} className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white font-semibold">Pause Core</button>
            <button onClick={() => makePost("resume_core")} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold">Resume Core</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RuntimeControlPanel;
