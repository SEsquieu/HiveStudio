import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import yaml from 'js-yaml';

import Sidebar from './Sidebar';

const capabilityColors = {
  display: '#4a90e2',
  terminal: '#7ed321',
  sensor: '#f5a623',
  default: '#888'
};

const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: {
      chunk_id: 'intro_terminal',
      required_capability: 'terminal',
      payload: {
        intent: 'wait_for_input',
        parameters: { prompt: 'Enter a number!' }
      },
    },
  }
];

const initialEdges = [];

function GraphEditorInner() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [taskConfig, setTaskConfig] = useState({
        task_name: 'my_task',
        execution_mode: 'sequential',
        capability_required: ['display', 'terminal']
    });

    const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;

    const onNodeClick = useCallback((_, node) => {
        setSelectedNodeId(node.id);
    }, []);

    const exportToYAML = () => {
        const task = {
            task_name: taskConfig.task_name,
            execution_mode: taskConfig.execution_mode,
            capability_required: taskConfig.capability_required,
            chunks: nodes.map((node) => {
            const {
                chunk_id,
                required_capability,
                payload,
                depends_on,
                ttl,
                timing,
                conditional
            } = node.data;

            const chunk = {
                chunk_id,
                required_capability,
                payload
            };

            if (depends_on) chunk.depends_on = depends_on;
            if (ttl !== undefined) chunk.ttl = ttl;
            if (timing) chunk.timing = timing;
            if (conditional && conditional.type && conditional.key && conditional.value !== undefined) {
                chunk.conditional = conditional;
            }

            return chunk;
            })
        };

        const yamlStr = yaml.dump(task);
        const blob = new Blob([yamlStr], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${task.task_name || 'task'}.yaml`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const loadFromYAML = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
            const data = yaml.load(event.target.result);

            // 1. Load task-level config
            setTaskConfig({
                task_name: data.task_name || '',
                execution_mode: data.execution_mode || 'concurrent',
                capability_required: data.capability_required || []
            });

            // 2. Create node layout + payloads
            const newNodes = data.chunks.map((chunk, index) => {
                const x = (index % 4) * 250;
                const y = Math.floor(index / 4) * 150;

                return {
                id: chunk.chunk_id,
                position: { x, y },
                type: 'default',
                data: {
                    chunk_id: chunk.chunk_id,
                    required_capability: chunk.required_capability,
                    payload: {
                    intent: chunk.payload?.intent || '',
                    parameters: chunk.payload?.parameters || {}
                    },
                    depends_on: chunk.depends_on || '',
                    ttl: chunk.ttl,
                    timing: chunk.timing || '',
                    conditional: (chunk.conditional && typeof chunk.conditional === 'object')
                        ? { ...chunk.conditional }
                        : undefined

                }
                };
            });

            // 3. Create edges from depends_on
            const newEdges = data.chunks
                .filter(chunk => chunk.depends_on)
                .map(chunk => ({
                id: `e${chunk.depends_on}-${chunk.chunk_id}`,
                source: chunk.depends_on,
                target: chunk.chunk_id,
                animated: true,
                style: { stroke: '#888' }
                }));

            // 4. Update graph
            setNodes(newNodes);
            setEdges(newEdges);
            } catch (err) {
            alert('Failed to load YAML file: ' + err.message);
            }
        };

        reader.readAsText(file);
    };

    const isValidChunk = (data) => {
        const { chunk_id, required_capability, payload } = data;
        if (!chunk_id || typeof chunk_id !== 'string') return false;
        if (!required_capability || typeof required_capability !== 'string') return false;
        if (!payload || typeof payload !== 'object') return false;
        if (!payload.intent || typeof payload.intent !== 'string') return false;
        if (typeof payload.parameters !== 'object') return false;
        if (data.conditional) {
        const { type, key, value } = data.conditional;
        if (!type || !key || value === undefined) return false;
        }
        if (data.timing && !['ticks', 'seconds', 'ms'].includes(data.timing)) return false;
        if (data.ttl && typeof data.ttl !== 'number') return false;
        return true;
    };

  const styledNodes = nodes.map((node) => {
    const valid = isValidChunk(node.data);
    const capColor = capabilityColors[node.data.required_capability] || capabilityColors.default;

    return {
      ...node,
      data: {
        ...node.data,
        label: (
          <div style={{ fontFamily: 'monospace', color: '#f8f8f8' }}>
            <strong>{node.data.chunk_id}</strong><br />
            <small>{node.data.payload?.intent || ''}</small>
          </div>
        )
      },
      style: {
        background: valid ? '#2c2c2c' : '#402020',
        border: valid ? `2px solid ${capColor}` : '2px solid red',
        color: '#f8f8f8',
        fontSize: '14px',
        fontFamily: 'monospace',
        borderRadius: '6px',
        padding: '8px',
      }
    };
  });

  const handleAddChunk = () => {
    const newId = (nodes.length + 1).toString();
    const newNode = {
      id: newId,
      type: 'default',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100
      },
      data: {
        chunk_id: `new_chunk_${newId}`,
        required_capability: '',
        payload: {
          intent: '',
          parameters: {}
        }
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

    const onConnect = useCallback(
        (params) => {
            setEdges((eds) => addEdge({ ...params, type: 'default', animated: true }, eds));

            const sourceNode = nodes.find((n) => n.id === params.source);
            const sourceChunkId = sourceNode?.data?.chunk_id || params.source;

            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id !== params.target) return node;

                    const shouldInherit = !node.data.conditional && sourceNode?.data?.conditional;

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            depends_on: sourceChunkId,
                            conditional: shouldInherit ? { ...sourceNode.data.conditional } : node.data.conditional,
                        },
                    };
                })
            );
        },
        [nodes, setEdges, setNodes]
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (
            (e.key === 'Delete') &&
            selectedNode
            ) {
            e.preventDefault(); // prevent browser nav
            handleDeleteChunk();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        }, 
        [selectedNode]
    );

    const handleDeleteChunk = () => {
        if (!selectedNode) return;

        const chunkId = selectedNode.id;

        setNodes((nds) => nds.filter((node) => node.id !== chunkId));
        setEdges((eds) => eds.filter((edge) => edge.source !== chunkId && edge.target !== chunkId));
        setSelectedNode(null);
    };

    const handleDuplicateChunk = () => {
      if (!selectedNode) return;

      const original = selectedNode;
      const newId = `${original.id}_copy_${Math.floor(Math.random() * 1000)}`;

      const offset = 40; // shift position slightly to avoid overlap
      const duplicate = {
        id: newId,
        type: original.type,
        position: {
          x: original.position.x + offset,
          y: original.position.y + offset
        },
        data: {
          ...JSON.parse(JSON.stringify(original.data)),
          chunk_id: `${original.data.chunk_id}_copy`,
          depends_on: ''  // Clear dependency
        }
      };


      setNodes((nds) => [...nds, duplicate]);
      setSelectedNodeId(newId);
    };




  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <button
            onClick={handleAddChunk}
            style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            padding: '8px 16px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #888',
            borderRadius: '4px',
            cursor: 'pointer'
            }}
        >
            + Add Chunk
        </button>

        <button
            onClick={exportToYAML}
            style={{
                position: 'absolute',
                top: '50px',
                left: '10px',
                zIndex: 1000,
                padding: '8px 16px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #888',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            📦 Export YAML
        </button>


        <input
            type="file"
            accept=".yaml,.yml"
            onChange={(e) => {
                const file = e.target.files[0];
                if (file) loadFromYAML(file);
            }}
            style={{
                display: 'none'
            }}
            id="yaml-upload"
            />

            <label
                htmlFor="yaml-upload"
                style={{
                    position: 'absolute',
                    top: '90px',
                    left: '10px',
                    zIndex: 1000,
                    padding: '8px 16px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #888',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-block'
                }}
            >
                🔁 Import YAML
            </label>



      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <Sidebar
        selectedNode={selectedNode}
        setNodes={setNodes}
        taskConfig={taskConfig}
        setTaskConfig={setTaskConfig}
        handleDeleteChunk={handleDeleteChunk}
        handleDuplicateChunk={handleDuplicateChunk}
      />
    </div>
  );
}

export default function GraphEditor() {
  return (
    <ReactFlowProvider>
      <GraphEditorInner />
    </ReactFlowProvider>
  );
}
