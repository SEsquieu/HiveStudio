import React, { useState, useEffect } from 'react';

export default function CoreVisibility() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('https://hivecore.fly.dev/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    fetchStatus(); // initial load
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval); // cleanup
  }, []);

  if (!status) {
    return <div className="p-4 text-white">Loading core status...</div>;
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-2">Live Core Status</h2>
      <pre className="bg-black text-green-400 p-4 rounded overflow-auto">
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  );
}
