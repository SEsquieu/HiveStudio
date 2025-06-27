// utils/coreEndpoint.js

const DEFAULT_ENDPOINT = "https://core.hiveos.net";

export function getCoreEndpoint() {
  return localStorage.getItem("coreEndpoint") || DEFAULT_ENDPOINT;
}

export async function switchSession(session_id) {
  try {
    const response = await fetch(`${getCoreEndpoint()}/switch_session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ session_id })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error switching session:", error);
    return { error };
  }
}

export async function getSessions() {
  try {
    const res = await fetch(`${getCoreEndpoint()}/get_sessions`);
    return await res.json();
  } catch (err) {
    console.error("Failed to get sessions", err);
    return { sessions: [], active: null };
  }
}

// export async function createSession() {
//   try {
//     const res = await fetch(`${getCoreEndpoint()}/create_session`, {
//       method: "POST",
//     });
//     return await res.json();
//   } catch (err) {
//     console.error("Failed to create session", err);
//     return { session_id: null };
//   }
// }

export async function createNamedSession(label = "") {
  try {
    const response = await fetch(`${getCoreEndpoint()}/create_session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label })
    });

    return await response.json();
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
      },
      body: JSON.stringify({ session_id }),
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to delete session", err);
    return { success: false };
  }
}

