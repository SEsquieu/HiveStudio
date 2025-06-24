import React, { useState, useEffect } from 'react';
import { Snowflake, Flame } from "lucide-react";
import { getCoreEndpoint } from "../utils/coreEndpoint";


const TaskList = ({ tasks, chunks, zones, autoExpandTaskId }) => {
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());

  useEffect(() => {
    if (autoExpandTaskId) {
        setExpandedTaskIds(prev => new Set([...prev, autoExpandTaskId]));
    }
  }, [autoExpandTaskId]);

  const toggleZoneFreeze = async (zoneId, shouldFreeze) => {
    try {
      const endpoint = shouldFreeze ? "/unfreeze_zone" : "/freeze_zone";
      await fetch(`${getCoreEndpoint()}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone_id: zoneId }),
      });
    } catch (error) {
      console.error("Failed to toggle freeze state", error);
    }
  };


  const toggleExpand = (taskId) => {
    setExpandedTaskIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
        newSet.delete(taskId);
        } else {
        newSet.add(taskId);
        }
        return newSet;
    });
  };


  const getChunksForTask = (taskId) =>
    chunks.filter((chunk) => chunk.task_id === taskId);

  const frozenZoneMap = {};
  zones?.forEach((zone) => {
    if (zone.frozen) {
      frozenZoneMap[zone.zone_id] = true;
    }
  });

  return (
    <div className="flex flex-col gap-6">
      {tasks.map((task) => {
        const taskChunks = getChunksForTask(task.task_id);
        const isExpanded = expandedTaskIds.has(task.task_id);
        const isFrozen = frozenZoneMap[task.zone_id];

        return (
          <div
            key={task.task_id}
            className={`border border-zinc-700 rounded-2xl shadow hover:shadow-lg transition w-fit max-w-none ${
              task.status === 'terminated'
                ? 'bg-red-950'
                : task.status === 'completed'
                ? 'bg-green-950'
                : task.status === 'pending'
                ? 'bg-yellow-950'
                : task.status === 'running'
                ? 'bg-blue-950'
                : 'bg-zinc-900'
            } ${isFrozen ? 'opacity-60 ring-2 ring-blue-500 shadow-[0_0_12px_10px_rgba(59,130,246,0.8)]' : ''}
`}
          >

            <div
              className="p-4 cursor-pointer flex flex-col gap-1"
              onClick={() => toggleExpand(task.task_id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-white">{task.name || task.task_id}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-700'
                      : task.status === 'terminated'
                      ? 'bg-red-700'
                      : task.status === 'pending'
                      ? 'bg-yellow-600'
                      : 'bg-blue-600'
                  } text-white`}
                >
                  {task.status}
                </span>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoneFreeze(task.zone_id, isFrozen);
                  }}
                  title={isFrozen ? "Thaw Zone" : "Freeze Zone"}
                  className={`mr-1 mt-0.5 text-xs ${
                    isFrozen ? "text-orange-400 hover:text-orange-300" : "text-blue-400 hover:text-blue-300"
                  }`}
                  style={{ padding: 0, lineHeight: 1 }}
                >
                  {isFrozen ? <Flame size={14} /> : <Snowflake size={14} />}
                </button>
                <span>Zone: {task.zone_id || 'Unassigned'} | Chunks: {taskChunks.length}</span>
              </div>

            </div>

            {isExpanded && (
                <div className="w-full overflow-x-auto">
                    <div className="px-4 pb-4">
                        <div className="flex gap-3 w-max">
                            {taskChunks.map((chunk) => {
                                const status = chunk.status;
                                let bg = 'bg-zinc-800';
                                let icon = '⬜';

                                if (status === 'assigned') {
                                    bg = 'bg-yellow-800';
                                    icon = '🕒';
                                } else if (status === 'completed') {
                                    bg = 'bg-green-800';
                                    icon = '✅';
                                }

                                return (
                                    <div
                                    key={chunk.chunk_id}
                                    className={`relative min-w-[200px] p-3 rounded-md border border-zinc-700 text-sm text-gray-100 ${bg}`}
                                    >

                                    {chunk.timing !== 'ticks' && chunk.status === 'assigned' && (
                                    <div
                                        className="absolute top-1 left-2 w-2 h-2 rounded-full bg-yellow-400 animate-ping"
                                        title={`Realtime: ${chunk.timing}`}
                                    />
                                    )}

                                    <div className="absolute top-1 right-2 text-lg">{icon}</div>
                                    <div className="text-xs text-gray-400 mb-1">ID: {chunk.chunk_id}</div>
                                    <div><strong>Cap:</strong> {chunk.required_capability}</div>
                                    <div><strong>Agent:</strong> {chunk.assigned_agent || 'None'}</div>
                                    <div>
                                        <strong>TTL:</strong> {chunk.ttl} {chunk.timing}
                                    </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
