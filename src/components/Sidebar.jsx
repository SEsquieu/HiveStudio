import React, { useState, useEffect } from 'react';

export default function Sidebar({ selectedNode, setNodes, taskConfig, setTaskConfig, handleDeleteChunk, handleDuplicateChunk }) {
  const [newParamKey, setNewParamKey] = useState('');
  const [showConditional, setShowConditional] = useState(true);

  useEffect(() => setNewParamKey(''), [selectedNode]);

  const updateField = (field, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id
          ? { ...node, data: { ...node.data, [field]: value, label: `chunk_id: ${node.data.chunk_id || node.id}` } }
          : node
      )
    );
  };

  const updatePayloadField = (key, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id
          ? { ...node, data: { ...node.data, payload: { ...node.data.payload, [key]: value } } }
          : node
      )
    );
  };

  const updateParamField = (oldKey, newKey, value) => {
    const params = { ...selectedNode?.data.payload.parameters };
    delete params[oldKey];
    params[newKey] = value;
    updatePayloadField('parameters', params);
  };

  const removeParamField = (key) => {
    const params = { ...selectedNode?.data.payload.parameters };
    delete params[key];
    updatePayloadField('parameters', params);
  };

  const addNewParam = () => {
    if (!newParamKey.trim()) return;
    updatePayloadField('parameters', {
      ...selectedNode?.data.payload.parameters,
      [newParamKey]: ''
    });
    setNewParamKey('');
  };

  const updateConditionalField = (key, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id
          ? {
              ...node,
              data: {
                ...node.data,
                conditional: {
                  ...node.data.conditional,
                  [key]: value,
                },
              },
            }
          : node
      )
    );
  };

  return (
    <div className="w-[300px] p-4 bg-zinc-900 text-zinc-100 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Task Settings</h3>

      <label className="text-sm">Task Name</label>
      <input
        className="w-full mb-2 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
        value={taskConfig.task_name}
        onChange={(e) => setTaskConfig({ ...taskConfig, task_name: e.target.value })}
      />

      <label className="text-sm">Execution Mode</label>
      <select
        className="w-full mb-2 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
        value={taskConfig.execution_mode}
        onChange={(e) => setTaskConfig({ ...taskConfig, execution_mode: e.target.value })}
      >
        <option value="concurrent">concurrent</option>
        <option value="sequential">sequential</option>
      </select>

      <label className="text-sm">Capabilities Required (comma-separated)</label>
      <input
        className="w-full mb-4 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
        value={taskConfig.capability_required.join(', ')}
        onChange={(e) =>
          setTaskConfig({
            ...taskConfig,
            capability_required: e.target.value.split(',').map((cap) => cap.trim())
          })
        }
      />

      <hr className="my-4 border-zinc-600" />

      {!selectedNode ? (
        <>
          <h3 className="text-lg font-semibold">Edit Chunk</h3>
          <p>Select a chunk node to edit.</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Edit Chunk</h3>
            <div className="flex gap-2">
              <button
                className="bg-blue-700 text-white text-lg rounded px-2 py-1"
                onClick={handleDuplicateChunk}
                title="Duplicate Chunk"
              >
                📄
              </button>
              <button
                className="bg-red-700 text-black text-lg rounded px-2 py-1"
                onClick={handleDeleteChunk}
                title="Delete Chunk"
              >
                🗑
              </button>
            </div>
          </div>

          <label>chunk_id</label>
          <input
            className="w-full mb-2 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
            value={selectedNode.data.chunk_id || ''}
            onChange={(e) => updateField('chunk_id', e.target.value)}
          />

          <label>required_capability</label>
          <select
            className="w-full mb-2 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
            value={selectedNode.data.required_capability || ''}
            onChange={(e) => updateField('required_capability', e.target.value)}
          >
            <option value="">(select capability)</option>
            {taskConfig.capability_required.map((cap) => (
              <option key={cap} value={cap}>{cap}</option>
            ))}
          </select>

          <label>intent</label>
          <input
            className="w-full mb-2 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
            value={selectedNode.data.payload?.intent || ''}
            onChange={(e) => updatePayloadField('intent', e.target.value)}
          />

          <label>parameters</label>
          {Object.entries(selectedNode.data.payload?.parameters || {}).map(([key, val]) => (
            <div key={key} className="flex gap-2 mb-2">
              <input
                className="w-[35%] px-1 py-1 rounded bg-zinc-800 border border-zinc-700"
                value={key}
                onChange={(e) => updateParamField(key, e.target.value, val)}
              />
              <input
                className="w-[45%] px-1 py-1 rounded bg-zinc-800 border border-zinc-700"
                value={val}
                onChange={(e) => updateParamField(key, key, e.target.value)}
              />
              <button
                className="w-[20%] bg-red-700 text-white rounded"
                onClick={() => removeParamField(key)}
              >−</button>
            </div>
          ))}

          <div className="flex gap-2 mb-4">
            <input
              placeholder="new param key"
              className="w-[60%] px-1 py-1 rounded bg-zinc-800 border border-zinc-700"
              value={newParamKey}
              onChange={(e) => setNewParamKey(e.target.value)}
            />
            <button className="w-[40%] bg-green-700 text-white rounded" onClick={addNewParam}>+ Add</button>
          </div>

          <label>depends_on</label>
          <input
            className="w-full mb-2 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
            value={selectedNode.data.depends_on || ''}
            onChange={(e) => updateField('depends_on', e.target.value)}
          />

          <label>ttl</label>
          <input
            type="number"
            step="0.1"
            className="w-full mb-2 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
            value={selectedNode.data.ttl || ''}
            onChange={(e) => updateField('ttl', parseFloat(e.target.value))}
          />

          <label>timing</label>
          <select
            className="w-full mb-4 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
            value={selectedNode.data.timing || ''}
            onChange={(e) => updateField('timing', e.target.value)}
          >
            <option value="">(default: ticks)</option>
            <option value="ticks">ticks</option>
            <option value="seconds">seconds</option>
            <option value="ms">ms</option>
          </select>

          <div className="bg-zinc-800 p-3 rounded">
            <div
              className="flex justify-between items-center cursor-pointer font-semibold text-zinc-300"
              onClick={() => setShowConditional(!showConditional)}
            >
              <span>Conditional (optional)</span>
              <span>{showConditional ? '▾' : '▸'}</span>
            </div>

            {showConditional && (
              <>
                <label>type</label>
                <input
                  className="w-full mb-2 px-2 py-1 rounded bg-zinc-900 border border-zinc-700"
                  value={selectedNode.data.conditional?.type || ''}
                  onChange={(e) => updateConditionalField('type', e.target.value)}
                />

                <label>key</label>
                <input
                  className="w-full mb-2 px-2 py-1 rounded bg-zinc-900 border border-zinc-700"
                  value={selectedNode.data.conditional?.key || ''}
                  onChange={(e) => updateConditionalField('key', e.target.value)}
                />

                <label>value</label>
                <input
                  className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700"
                  value={selectedNode.data.conditional?.value || ''}
                  onChange={(e) => updateConditionalField('value', e.target.value)}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
