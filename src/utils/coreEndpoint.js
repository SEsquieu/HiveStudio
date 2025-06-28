// utils/coreEndpoint.js

const DEFAULT_ENDPOINT = "https://core.hiveos.net";

export function getCoreEndpoint() {
  return localStorage.getItem("coreEndpoint") || DEFAULT_ENDPOINT;
}

export const getUserId = () => {
  return localStorage.getItem('hive_user_id') || 'unknown-user';
};

// const headers = {
//   'Content-Type': 'application/json',
//   'X-User-ID': getUserId()
// };


export async function switchSession(session_id) {
  try {
    const response = await fetch(`${getCoreEndpoint()}/switch_session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": getUserId()
      },
      body: JSON.stringify({ session_id })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("activeSessionId", session_id);  // ✅ Add this
    }

    return data;
  } catch (error) {
    console.error("Error switching session:", error);
    return { error };
  }
}


export async function getSessions() {
  try {
    const res = await fetch(`${getCoreEndpoint()}/get_sessions`, {
      headers: {
        "X-User-ID": getUserId()
      }
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to get sessions", err);
    return { sessions: [], active: null };
  }
}

export async function createNamedSession(label = "") {
  try {
    const response = await fetch(`${getCoreEndpoint()}/create_session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": getUserId()
      },
      body: JSON.stringify({ label })
    });

    const data = await response.json();

    if (data.session_id) {
      localStorage.setItem("activeSessionId", data.session_id);  // ✅ Persist for future requests
    }

    return data;
  } catch (error) {
    console.error("Error creating session:", error);
    return { error };
  }
}


export async function deleteSession(session_id) {
  try {
    const res = await fetch(`${getCoreEndpoint()}/delete_session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": getUserId()
      },
      body: JSON.stringify({ session_id }),
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to delete session", err);
    return { success: false };
  }
}

export async function postToCore(endpoint, data = {}, sessionId = null, contentType = "application/json") {
  const headers = {
    "Content-Type": contentType,
    "X-User-ID": getUserId(),
    "X-Session-ID": sessionId || localStorage.getItem("activeSessionId")
  };

  const res = await fetch(`${getCoreEndpoint()}${endpoint}`, {
    method: "POST",
    headers,
    body: contentType === "application/json" ? JSON.stringify(data) : data,
  });

  if (!res.ok) {
    const errMsg = `Request to ${endpoint} failed with status ${res.status}`;
    console.error(errMsg);
    throw new Error(errMsg);
  }

  return await res.json();
}

export async function getFromCore(endpoint, sessionId = null) {
  const headers = {
    "X-User-ID": getUserId(),
    "X-Session-ID": sessionId || localStorage.getItem("activeSessionId")
  };

  const res = await fetch(`${getCoreEndpoint()}${endpoint}`, { headers });

  if (!res.ok) {
    const errMsg = `GET ${endpoint} failed with status ${res.status}`;
    console.error(errMsg);
    throw new Error(errMsg);
  }

  return await res.json();
}

