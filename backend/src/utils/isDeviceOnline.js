export const isDeviceOnline = (lastSeen, thresholdSeconds = 60) => {
  if (!lastSeen) return false;

  const now = Date.now();
  const diff = now - new Date(lastSeen).getTime();

  return diff <= thresholdSeconds * 1000;
};