// utils/coreEndpoint.js

const DEFAULT_ENDPOINT = "https://core.hiveos.net";

export function getCoreEndpoint() {
  return localStorage.getItem("coreEndpoint") || DEFAULT_ENDPOINT;
}