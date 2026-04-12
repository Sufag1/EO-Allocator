const HISTORY_KEY = 'eo_deployments_history';

/**
 * Save a generated deployment to localStorage.
 * @param {Array} assignments - The array of PUs and assigned applicants
 * @param {Array} unassigned - The array of leftover applicants
 */
export function saveDeploymentToHistory(assignments, unassigned) {
  try {
    const history = getDeploymentHistory();
    const newEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      timestamp: new Date().toISOString(),
      assignments,
      unassigned,
      summary: {
        totalPUs: assignments.length,
        totalAssigned: assignments.reduce((acc, pu) => acc + (pu.postedApplicants?.length || 0), 0),
        totalUnassigned: unassigned.length
      }
    };
    
    // Save at the beginning of the list (newest first)
    history.unshift(newEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return newEntry;
  } catch (error) {
    console.error('Failed to save deployment history:', error);
    // Might happen if local storage quota is exceeded
    return null;
  }
}

/**
 * Retrieve all saved deployments.
 * @returns {Array} Array of historical deployments
 */
export function getDeploymentHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse deployment history:', error);
    return [];
  }
}

/**
 * Retrieve a specific deployment by ID.
 */
export function getDeploymentById(id) {
  const history = getDeploymentHistory();
  return history.find(entry => entry.id === id) || null;
}

/**
 * Delete a specific deployment by ID.
 */
export function deleteDeploymentHistory(id) {
  try {
    const history = getDeploymentHistory();
    const filtered = history.filter(entry => entry.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Failed to delete deployment history:', error);
    return null;
  }
}

/**
 * Clear all deployments.
 */
export function clearDeploymentHistory() {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}
