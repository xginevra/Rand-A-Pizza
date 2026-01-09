export function getBackendUrl() {
  const current = window.location.hostname;
  return `http://${current.replace("-3001", "-8000")}`;
}