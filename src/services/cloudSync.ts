import { RegistrationRequest } from '../types';

/**
 * Fetch latest requests from the application's backend database
 */
export async function fetchServerRequests(): Promise<RegistrationRequest[] | null> {
  try {
    const res = await fetch('/api/registration-requests');
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.success && Array.isArray(json?.requests)) {
      return json.requests;
    }
  } catch (err) {
    console.log('Server requests fetch error:', err);
  }
  return null;
}

/**
 * Save / Batch Sync requests to Backend server
 */
export async function saveServerRequests(requests: RegistrationRequest[]): Promise<boolean> {
  try {
    const res = await fetch('/api/registration-requests/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });
    return res.ok;
  } catch (err) {
    console.log('Server requests sync error:', err);
    return false;
  }
}

/**
 * Merge local requests with backend requests and update both
 */
export async function syncRequestsWithCloud(
  localRequests: RegistrationRequest[]
): Promise<RegistrationRequest[]> {
  const serverList = await fetchServerRequests();

  const map = new Map<string, RegistrationRequest>();

  // 1. Add server items
  if (serverList && serverList.length > 0) {
    serverList.forEach(r => {
      if (r && r.username) {
        map.set(r.username.toLowerCase(), r);
      }
    });
  }

  // 2. Merge local items
  localRequests.forEach(loc => {
    if (!loc || !loc.username) return;
    const key = loc.username.toLowerCase();
    if (!map.has(key)) {
      map.set(key, loc);
    } else {
      const serverItem = map.get(key)!;
      // If local has approved while server is pending, keep approved
      if (loc.status === 'approved' && serverItem.status !== 'approved') {
        map.set(key, { ...serverItem, ...loc });
      } else if (loc.status === 'rejected' && serverItem.status === 'pending') {
        map.set(key, { ...serverItem, ...loc });
      } else if (serverItem.status === 'approved') {
        map.set(key, serverItem);
      }
    }
  });

  const merged = Array.from(map.values());

  // Push back merged to server in background
  if (merged.length > 0) {
    saveServerRequests(merged).catch(() => {});
  }

  return merged;
}

/**
 * Subscribe to request updates via regular server polling
 */
export function subscribeCloudRequests(
  callback: (requests: RegistrationRequest[]) => void,
  intervalMs = 4000
): () => void {
  let isMounted = true;

  const poll = async () => {
    if (!isMounted) return;
    const latest = await fetchServerRequests();
    if (isMounted && latest && latest.length > 0) {
      callback(latest);
    }
  };

  const timer = setInterval(poll, intervalMs);

  return () => {
    isMounted = false;
    clearInterval(timer);
  };
}

// Re-export aliases for backwards compatibility
export const fetchCloudRequests = fetchServerRequests;
export const saveCloudRequests = saveServerRequests;

