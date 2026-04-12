/**
 * Shuffles an array in place.
 */
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * Assigns exactly 3 applicants to each Polling Unit, ensuring no duplicates.
 * 
 * @param {Array} applicants - Array of applicant objects {Name, Sex, Phone, Email}
 * @param {Array} pollingUnits - Array of PU objects {Polling Unit, Registration Area, LGA}
 * @returns {Object} { assignments: Array, unassigned: Array }
 */
export function generateDeployment(applicants, pollingUnits) {
  if (!applicants || !pollingUnits) return { assignments: [], unassigned: [] };

  // Randomize applicants for fair distribution
  let availableApplicants = shuffleArray(applicants);
  const assignments = []; // Array of { ...pu, postedApplicants: [app1, app2, app3] }

  // Assign up to 3 applicants to each PU
  for (const pu of pollingUnits) {
    const postedApplicants = [];
    
    // Attempt to grab 3 applicants
    for (let i = 0; i < 3; i++) {
      if (availableApplicants.length > 0) {
        postedApplicants.push(availableApplicants.pop());
      }
    }

    assignments.push({
      ...pu,
      postedApplicants: postedApplicants
    });
  }

  // The remaining applicants in availableApplicants are unassigned
  return {
    assignments,
    unassigned: availableApplicants
  };
}
