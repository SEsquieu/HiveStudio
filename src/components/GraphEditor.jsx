import React, { useState, useCallback, useEffect } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
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
import { getCoreEndpoint } from '../utils/coreEndpoint';

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
      chunk_id: 'chunk_1',
      required_capability: 'display',
      payload: {
        intent: 'render_text',
        parameters: { text: 'Step 1' }
      },
      ttl: 2,
      timing: 'seconds'
    },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 350, y: 100 },
    data: {
      chunk_id: 'chunk_2',
      required_capability: 'display',
      payload: {
        intent: 'render_text',
        parameters: { text: 'Step 2' }
      },
      depends_on: 'chunk_1',
      ttl: 3,
      timing: 'seconds'
    },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 600, y: 100 },
    data: {
      chunk_id: 'chunk_3',
      required_capability: 'display',
      payload: {
        intent: 'render_text',
        parameters: { text: 'Step 3' }
      },
      depends_on: 'chunk_2',
      ttl: 5,
      timing: 'seconds'
    },
  },
  {
    id: '4',
    type: 'default',
    position: { x: 850, y: 100 },
    data: {
      chunk_id: 'chunk_4',
      required_capability: 'display',
      payload: {
        intent: 'render_text',
        parameters: { text: 'Step 4' }
      },
      depends_on: 'chunk_3',
      ttl: 7,
      timing: 'seconds'
    },
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#888' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#888' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#888' } },
];

function GraphEditorInner({ onInject }, ref) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [taskConfig, setTaskConfig] = useState({
    task_name: 'my_task',
    execution_mode: 'concurrent',
    capability_required: ['display', 'terminal']
  });

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  useImperativeHandle(ref, () => ({
    loadFromYAMLData(data) {
      setTaskConfig({
        task_name: data.task_name || '',
        execution_mode: data.execution_mode || 'concurrent',
        capability_required: data.capability_required || []
      });

      const newNodes = data.chunks.map((chunk, index) => ({
        id: chunk.chunk_id,
        position: { x: (index % 4) * 250, y: Math.floor(index / 4) * 150 },
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
          conditional: typeof chunk.conditional === 'object' ? { ...chunk.conditional } : undefined
        }
      }));

      const newEdges = data.chunks
        .filter(chunk => chunk.depends_on)
        .map(chunk => ({
          id: `e${chunk.depends_on}-${chunk.chunk_id}`,
          source: chunk.depends_on,
          target: chunk.chunk_id,
          animated: true,
          style: { stroke: '#888' }
        }));

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }));

  const buildTaskYAML = () => {
    return {
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

        const chunk = { chunk_id, required_capability, payload };
        if (depends_on) chunk.depends_on = depends_on;
        if (ttl !== undefined) chunk.ttl = ttl;
        if (timing) chunk.timing = timing;
        if (
          conditional &&
          conditional.type &&
          conditional.key &&
          conditional.value !== undefined
        ) {
          chunk.conditional = conditional;
        }

        return chunk;
      }),
    };
  };


  const exportToYAML = () => {
    const task = buildTaskYAML()
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
        setTaskConfig({
          task_name: data.task_name || '',
          execution_mode: data.execution_mode || 'concurrent',
          capability_required: data.capability_required || []
        });

        const newNodes = data.chunks.map((chunk, index) => ({
          id: chunk.chunk_id,
          position: { x: (index % 4) * 250, y: Math.floor(index / 4) * 150 },
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
            conditional: chunk.conditional && typeof chunk.conditional === 'object'
              ? { ...chunk.conditional }
              : undefined
          }
        }));

        const newEdges = data.chunks
          .filter(chunk => chunk.depends_on)
          .map(chunk => ({
            id: `e${chunk.depends_on}-${chunk.chunk_id}`,
            source: chunk.depends_on,
            target: chunk.chunk_id,
            animated: true,
            style: { stroke: '#888' }
          }));

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
        payload: { intent: '', parameters: {} }
      }
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleInject = async () => {
    const task = buildTaskYAML();
    const yamlOutput = yaml.dump(task); // or however your export function works
    try {
      const res = await fetch(`${getCoreEndpoint()}/inject_yaml`, {
      //const res = await fetch("https://core.hiveos.net/inject_yaml", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-yaml",
        },
        body: yamlOutput,
      });
      const result = await res.json(); // Expect JSON from backend
      if (result.success) {
        console.log(`✅ Task injected: ${result.success}`);
        if (onInject) onInject();
      } else {
        console.warn("Task injected but response was unclear:", result);
      }
    } catch (err) {
      console.error(`❌ Failed to inject: ${err.message}`);
    }
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: 'default', animated: true }, eds));
    const sourceNode = nodes.find((n) => n.id === params.source);
    const sourceChunkId = sourceNode?.data?.chunk_id || params.source;

    setNodes((nds) =>
      nds.map((node) =>
        node.id !== params.target
          ? node
          : {
              ...node,
              data: {
                ...node.data,
                depends_on: sourceChunkId,
                conditional: !node.data.conditional && sourceNode?.data?.conditional
                  ? { ...sourceNode.data.conditional }
                  : node.data.conditional
              }
            }
      )
    );
  }, [nodes, setEdges, setNodes]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedNode) {
        e.preventDefault();
        handleDeleteChunk();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

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
    const offset = 40;
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
        depends_on: ''
      }
    };

    setNodes((nds) => [...nds, duplicate]);
    setSelectedNodeId(newId);
  };

  useEffect(() => {
    const root = document.getElementById('root');
    console.log('root height:', root?.offsetHeight);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Floating Buttons */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5 }}>
        <button onClick={handleAddChunk} style={buttonStyle}>+ Add Chunk</button><br />
        <button onClick={exportToYAML} style={buttonStyle}>📦 Export YAML</button><br />
        <label htmlFor="yaml-upload" style={{ ...buttonStyle, display: 'inline-block' }}>🔁 Import YAML</label>
        <input id="yaml-upload" type="file" accept=".yaml,.yml" style={{ display: 'none' }} onChange={(e) => loadFromYAML(e.target.files[0])} /><br />
        <button onClick={handleInject} style={buttonStyle}>🚀 Inject to Core</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, minWidth: 0 }}>
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

      <div style={{
        flexBasis: '300px',
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // or 'stretch'
        padding: '1rem',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderLeft: '1px solid #444',
        boxSizing: 'border-box'
      }}>
        <Sidebar
          selectedNode={selectedNode}
          setNodes={setNodes}
          taskConfig={taskConfig}
          setTaskConfig={setTaskConfig}
          handleDeleteChunk={handleDeleteChunk}
          handleDuplicateChunk={handleDuplicateChunk}
        />
      </div>
    </div>
  );
}

const buttonStyle = {
  marginBottom: '6px',
  padding: '8px 16px',
  backgroundColor: '#333',
  color: '#fff',
  border: '1px solid #888',
  borderRadius: '4px',
  cursor: 'pointer'
};

const GraphEditor = forwardRef((props, ref) => (
  <ReactFlowProvider>
    <GraphEditorInner {...props} ref={ref} />
  </ReactFlowProvider>
));

export default GraphEditor;

