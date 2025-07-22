import React, { useState } from 'react';
import { postToCore, getUserId } from '../utils/coreEndpoint';

export default function AgentAutoWrapper() {
  const [wrapperCode, setWrapperCode] = useState(`# Write your custom agent wrapper class here\n`);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState("code"); // "code" or "wizard"

  const REQUIRED_METHODS = [
    "get_status",
    "report_capabilities",
    "execute_chunk",
    "report_completion",
    "health_check",
    "enter_cooldown",
    "is_available",
    "get_summary",
  ];

  const initialStubCollapsed = {};
  REQUIRED_METHODS.forEach((method) => {
    initialStubCollapsed[method] = true;
  });

  const [stubCollapsed, setStubCollapsed] = useState(initialStubCollapsed);


  const [wizardState, setWizardState] = useState({
    name: "MyAgent",
    capabilities: [],
    methods: REQUIRED_METHODS,
    methodOverrides: {},  // { method_name: custom_code_string }
    intents: [],
    intentHandlers: {}, // { intent_name: handler_function }
  });

  const stubMap = {
        get_status: `    def get_status(self):\n        # TODO: Return current status string\n        return self.status\n`,
        report_capabilities: `    def report_capabilities(self):\n        # TODO: Return list of supported capabilities\n        return self.capabilities\n`,
        on_injection: `    def on_injection(self):\n        # Optional: Hook when the agent is injected\n        pass\n`,
        
        execute_chunk:  `    def execute_chunk(self, chunk, payload=None):\n` +
                        `        super().execute_chunk(chunk, payload)\n` +
                        `        if isinstance(payload, dict):\n` +
                        `            intent = payload.get("intent")\n` +
                        `            params = payload.get("parameters", {})\n` +
                        (Object.entries(wizardState.intentHandlers || {}).length
                            ? Object.entries(wizardState.intentHandlers)
                                .map(([intent, code], i) => {
                                const prefix = i === 0 ? "if" : "elif";
                                return `            ${prefix} intent == "${intent}":\n${code
                                    .split("\n")
                                    .map((line) => "                " + line)
                                    .join("\n")}`;
                                })
                                .join("\n") +
                            `\n            else:\n                self.latest_output = f"{intent}: {params}"`
                            : `            self.latest_output = f"{intent}: {params}"`) +
                        `\n        else:\n            self.latest_output = str(payload)\n`,

        
        report_completion: `    def report_completion(self, chunk):\n        # Optional: Completion logic\n        super().report_completion(chunk)\n`,
        health_check: `    def health_check(self):\n        # TODO: Perform health diagnostics\n        pass\n`,
        enter_cooldown: `    def enter_cooldown(self, reason=""):\n        # TODO: Handle cooldown entry\n        self.status = 'cooldown'\n        self.publish("cooldown_reason", reason)\n`,
        is_available: `    def is_available(self):\n        # TODO: Return True if agent is ready for task\n        return self._available and self.status == 'idle'\n`,
        get_summary: `    def get_summary(self) -> dict:\n        # TODO: Return status summary as dict\n        return super().get_summary() | {\n           "latest_output": self.latest_output,\n        }\n`,
  };


  const toggleStubVisibility = (method) => {
    setStubCollapsed((prev) => ({
        ...prev,
        [method]: !prev[method],
    }));
  };


  const handleInject = async () => {
    const sessionId = localStorage.getItem("activeSessionId") || "N/A";

    const payload = {
        wrapper_py: wrapperCode
    };

    try {
        console.log("🚀 Posting wrapper to /inject_agent:", payload);
        const data = await postToCore("/inject_agent", payload, sessionId);

        if (data.error) {
        setErrorMessage(data.error);
        setResultMessage('');
        } else {
        setResultMessage(data.message || "Agent injected successfully.");
        setErrorMessage('');
        }
    } catch (err) {
        console.error("❌ Error posting to core:", err);
        setErrorMessage("Unexpected error");
        setResultMessage('');
    }
  };

  function generateWrapperCode() {
    const { name, capabilities, methods: selectedMethods } = wizardState;

    

    const methodStubs = REQUIRED_METHODS
        .map((method) => wizardState.methodOverrides[method] || stubMap[method])
        .join("\n\n");

    const initStub = `    def __init__(self, agent_id=None, capability="${capabilities}"):\n` +
                //  `        super().__init__()\n` +
                 `        self.agent_id = agent_id or f"${name}-{str(uuid.uuid4())[:8]}"\n` +
                 `        self.name = "${name}"\n` +
                 `        self.capabilities = [capability]\n` +
                 `        self.current_chunk = None\n` +
                 `        self.latest_output = ""\n`

    const py = `class ${name}(AgentInterface):\n` +
            initStub + `\n` +
            methodStubs;


    setWrapperCode(py);
    setViewMode("code");
  }






  return (
    <div className="flex w-full h-full bg-zinc-900 text-white">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-800 border-r border-zinc-700 p-4">
            <h2 className="text-lg font-bold mb-4">Wrapper Tools</h2>
            
            <button className="w-full mb-2 p-2 bg-green-700 rounded hover:bg-green-600" onClick={handleInject}>
            Inject Wrapper
            </button>
            
            <p className="text-sm mt-6 text-gray-400">Live injection of agent wrappers using Python class definitions.</p>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Agent Wrapper Editor</h2>
            <div className="flex gap-2">
            <button
                onClick={() => setViewMode("code")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === "code"
                    ? "bg-blue-700 text-white"
                    : "bg-zinc-700 hover:bg-zinc-600 text-gray-300"
                }`}
            >
                Code
            </button>
            <button
                onClick={() => setViewMode("wizard")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === "wizard"
                    ? "bg-green-700 text-white"
                    : "bg-zinc-700 hover:bg-zinc-600 text-gray-300"
                }`}
            >
                Wizard
            </button>
            </div>
        </div>

        {/* Main content depending on mode */}
        {viewMode === "code" && (
            <>
            <textarea
                className="w-full h-[calc(100vh-10rem)] p-4 bg-zinc-800 text-white font-mono rounded resize-none"
                value={wrapperCode}
                onChange={(e) => setWrapperCode(e.target.value)}
            />
            {resultMessage && <div className="mt-4 text-green-400">{resultMessage}</div>}
            {errorMessage && <div className="mt-4 text-red-400">{errorMessage}</div>}
            </>
        )}

        {viewMode === "wizard" && (
            <div className="space-y-4 text-zinc-300">
                {/* Class Name */}
                <div>
                    <label className="block text-sm font-semibold mb-1">Wrapper Name</label>
                    <input
                        type="text"
                        className="w-full p-2 rounded bg-zinc-800 text-white"
                        value={wizardState.name}
                        onChange={(e) =>
                        setWizardState({ ...wizardState, name: e.target.value })
                        }
                    />
                </div>

                {/* Capabilities */}
                <div>
                    <label className="block text-sm font-semibold mb-1">Capabilities</label>
                    <input
                        type="text"
                        placeholder="e.g. display, sensor"
                        className="w-full p-2 rounded bg-zinc-800 text-white"
                        value={wizardState.capabilities.join(", ")}
                        onChange={(e) =>
                        setWizardState({
                            ...wizardState,
                            capabilities: e.target.value.split(",").map((s) => s.trim()),
                        })
                        }
                    />
                </div>

                {/* Intent Handlers */}
                <div className="mt-6">
                <label className="block text-sm font-semibold mb-2">Intent Handlers</label>
                {wizardState.intents.map((intent, index) => (
                    <details key={intent} className="mb-2 bg-zinc-800 rounded p-3 border border-zinc-700">
                    <summary className="cursor-pointer text-sm font-semibold">{intent}</summary>
                    <textarea
                        className="mt-2 w-full h-24 bg-zinc-900 text-white font-mono p-2 rounded"
                        value={wizardState.intentHandlers[intent] || ""}
                        onChange={(e) => {
                        const newHandlers = { ...wizardState.intentHandlers, [intent]: e.target.value };
                        setWizardState({ ...wizardState, intentHandlers: newHandlers });
                        }}
                    />
                    <button
                        className="mt-2 text-xs text-red-400 hover:underline"
                        onClick={() => {
                        const updatedIntents = wizardState.intents.filter((_, i) => i !== index);
                        const updatedHandlers = { ...wizardState.intentHandlers };
                        delete updatedHandlers[intent];
                        setWizardState({ ...wizardState, intents: updatedIntents, intentHandlers: updatedHandlers });
                        }}
                    >
                        Remove Intent
                    </button>
                    </details>
                ))}
                <div className="flex items-center gap-2 mt-2">
                    <input
                    type="text"
                    placeholder="New intent name"
                    className="w-48 p-1 rounded bg-zinc-900 text-white text-sm"
                    value={wizardState.newIntent || ""}
                    onChange={(e) => setWizardState({ ...wizardState, newIntent: e.target.value })}
                    />
                    <button
                    className="text-sm px-2 py-1 bg-green-700 rounded hover:bg-green-600"
                    onClick={() => {
                        const newIntent = (wizardState.newIntent || "").trim();
                        if (newIntent && !wizardState.intents.includes(newIntent)) {
                        setWizardState({
                            ...wizardState,
                            intents: [...wizardState.intents, newIntent],
                            newIntent: "",
                        });
                        }
                    }}
                    >
                    Add Intent
                    </button>
                </div>
                </div>


                <h3 className="text-md font-semibold mt-6 mb-2">Override Method Bodies (Optional)</h3>
                <div className="space-y-2">
                    {REQUIRED_METHODS.map((method) => (
                        <div key={method} className="mb-4 border-b border-zinc-700 pb-2">
                            <div
                                className="cursor-pointer font-semibold text-sm text-blue-400 hover:text-blue-300"
                                onClick={() => toggleStubVisibility(method)}
                            >
                                {stubCollapsed[method] ? "▶" : "▼"} {method}
                            </div>
                            {!stubCollapsed[method] && (
                                <textarea
                                    className="mt-2 w-full bg-zinc-800 p-2 rounded font-mono text-white text-sm resize-none"
                                    rows={5}
                                    value={wizardState.methodOverrides[method] || stubMap[method]}
                                    onChange={(e) =>
                                    setWizardState((prev) => ({
                                        ...prev,
                                        methodOverrides: {
                                        ...prev.methodOverrides,
                                        [method]: e.target.value,
                                        },
                                    }))
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Generate Code */}
                <button
                className="mt-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                onClick={generateWrapperCode}
                >
                Generate Wrapper Code
                </button>
            </div>
            )}
        </div>
    </div>
  );
}