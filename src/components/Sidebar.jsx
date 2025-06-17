// Sidebar.jsx
import React, { useState, useEffect } from 'react';

export default function Sidebar({ selectedNode, setNodes, taskConfig, setTaskConfig, handleDeleteChunk, handleDuplicateChunk }) {
  const [newParamKey, setNewParamKey] = useState('');
  const [showConditional, setShowConditional] = useState(true);

  useEffect(() => {
    setNewParamKey('');
  }, [selectedNode]);

  const updateField = (field, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id
          ? {
              ...node,
              data: {
                ...node.data,
                [field]: value,
                label: `chunk_id: ${node.data.chunk_id || node.id}`,
              },
            }
          : node
      )
    );
  };

  const updatePayloadField = (key, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id
          ? {
              ...node,
              data: {
                ...node.data,
                payload: {
                  ...node.data.payload,
                  [key]: value,
                },
              },
            }
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
    <div style={{ width: '300px', padding: '1rem', backgroundColor: '#1e1e1e', color: '#f8f8f8', overflowY: 'auto' }}>
      <h3>Task Settings</h3>

      <label>Task Name</label>
      <input
        style={{ width: '100%' }}
        value={taskConfig.task_name}
        onChange={(e) => setTaskConfig({ ...taskConfig, task_name: e.target.value })}
      />

      <label>Execution Mode</label>
      <select
        style={{ width: '100%' }}
        value={taskConfig.execution_mode}
        onChange={(e) => setTaskConfig({ ...taskConfig, execution_mode: e.target.value })}
      >
        <option value="sequential">sequential</option>
        <option value="concurrent">concurrent</option>
      </select>

      <label>Capabilities Required (comma-separated)</label>
      <input
        style={{ width: '100%' }}
        value={taskConfig.capability_required.join(', ')}
        onChange={(e) =>
          setTaskConfig({
            ...taskConfig,
            capability_required: e.target.value.split(',').map((cap) => cap.trim())
          })
        }
      />

      <hr />
      {!selectedNode ? (
        <>
            <h3>Edit Chunk</h3>
            <p>Select a chunk node to edit.</p>
        </>
        ) : (
        <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Edit Chunk</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={handleDuplicateChunk}
                  style={{
                    backgroundColor: '#3366cc',
                    border: 'none',
                    color: '#fff',
                    fontSize: '20px',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                  title="Duplicate Chunk"
                >
                  📄
                </button>
                <button
                  onClick={handleDeleteChunk}
                  style={{
                      backgroundColor: '#aa3333',
                      border: 'none',
                      color: '#000',
                      fontSize: '20px',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer'
                  }}
                  title="Delete Chunk"
                >
                  🗑
                </button>
              </div>
            </div>


            <label>chunk_id</label>
            <input
                style={{width: '100%'}}
                value={selectedNode.data.chunk_id || ''}
                onChange={(e) => updateField('chunk_id', e.target.value)}
            />

            <label>required_capability</label>
            <select
                style={{width: '100%'}}
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
                style={{width: '100%'}}
                value={selectedNode.data.payload?.intent || ''}
                onChange={(e) => updatePayloadField('intent', e.target.value)}
            />

            <label>parameters</label>
            {Object.entries(selectedNode.data.payload?.parameters || {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                <input
                    value={key}
                    onChange={(e) => updateParamField(key, e.target.value, val)}
                    style={{ width: '35%' }}
                />
                <input
                    value={val}
                    onChange={(e) => updateParamField(key, key, e.target.value)}
                    style={{ width: '45%' }}
                />
                <button onClick={() => removeParamField(key)} style={{ width: '20%' }}>-</button>
                </div>
            ))}
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <input
                placeholder="new param key"
                value={newParamKey}
                onChange={(e) => setNewParamKey(e.target.value)}
                style={{ width: '60%' }}
                />
                <button onClick={addNewParam} style={{ width: '40%' }}>+ Add</button>
            </div>

            <label>depends_on</label>
            <input
                style={{width: '100%'}}
                value={selectedNode.data.depends_on || ''}
                onChange={(e) => updateField('depends_on', e.target.value)}
            />

            <label>ttl</label>
            <input
                style={{width: '100%'}}
                type="number"
                step="0.1"
                value={selectedNode.data.ttl || ''}
                onChange={(e) => updateField('ttl', parseFloat(e.target.value))}
            />

            <label>timing</label>
            <select
                style={{width: '100%'}}
                value={selectedNode.data.timing || ''}
                onChange={(e) => updateField('timing', e.target.value)}
            >
                <option value="">(default: ticks)</option>
                <option value="ticks">ticks</option>
                <option value="seconds">seconds</option>
                <option value="ms">ms</option>
            </select>

          <hr />
            <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#292929', borderRadius: '6px' }}>
            <div
                onClick={() => setShowConditional(!showConditional)}
                style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ccc'
                }}
            >
                <span>Conditional (optional)</span>
                <span>{showConditional ? '▾' : '▸'}</span>
            </div>

            {showConditional && (
                <>
                <label>type</label>
                <input
                    style={{ width: '100%' }}
                    value={selectedNode.data.conditional?.type || ''}
                    onChange={(e) => updateConditionalField('type', e.target.value)}
                />

                <label>key</label>
                <input
                    style={{ width: '100%' }}
                    value={selectedNode.data.conditional?.key || ''}
                    onChange={(e) => updateConditionalField('key', e.target.value)}
                />

                <label>value</label>
                <input
                    style={{ width: '100%' }}
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
