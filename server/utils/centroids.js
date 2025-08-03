/**
 * Compute the enemy threat centroid (CME).
 * @param {Array} players - Array of player objects.
 * @param {number} currentParticipantId - Participant ID of the current player.
 * @returns {{x:number, y:number}} Weighted centroid of enemy positions.
 */
function calculateCME(players, currentParticipantId) {
  const epsilon = 1;
  const currentPlayer = players.find(p => p.participantId === currentParticipantId);
  if (!currentPlayer || !currentPlayer.position) {
    return { x: 0, y: 0 };
  }

  const currentTeamId = currentPlayer.teamId;
  const currentPos = currentPlayer.position;

  const enemies = players.filter(p => p.teamId !== currentTeamId && p.position);
  if (enemies.length === 0) {
    return { x: 0, y: 0 };
  }

  const maxDamage = Math.max(
    ...players.map(p => p.damageStats?.totalDamageDoneToChampions || 0),
    0
  );

  // Pre-compute distance weights to normalize later
  const distanceWeights = enemies.map(enemy => {
    const dx = enemy.position.x - currentPos.x;
    const dy = enemy.position.y - currentPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return 1 / (distance + epsilon);
  });
  const maxDistanceWeight = Math.max(...distanceWeights, 0);

  let weightedX = 0;
  let weightedY = 0;
  let totalWeight = 0;

  enemies.forEach((enemy, idx) => {
    const wDistance = distanceWeights[idx];
    const normalizedDistance = maxDistanceWeight > 0 ? wDistance / maxDistanceWeight : 0;

    const damage = enemy.damageStats?.totalDamageDoneToChampions || 0;
    const normalizedDamage = maxDamage > 0 ? damage / maxDamage : 0;

    const hpRatio = enemy.maxHealth > 0 ? enemy.currentHealth / enemy.maxHealth : 0;

    const weight =
      0.5 * normalizedDistance +
      0.3 * normalizedDamage +
      0.2 * (1 - hpRatio);

    weightedX += weight * enemy.position.x;
    weightedY += weight * enemy.position.y;
    totalWeight += weight;
  });

  if (totalWeight === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight
  };
}

/**
 * Compute the ally safety centroid (CSA).
 * @param {Array} players - Array of player objects.
 * @param {number} currentParticipantId - Participant ID of the current player.
 * @returns {{x:number, y:number}} Weighted centroid of ally positions.
 */
function calculateCSA(players, currentParticipantId) {
  const epsilon = 1;
  const currentPlayer = players.find(p => p.participantId === currentParticipantId);
  if (!currentPlayer || !currentPlayer.position) {
    return { x: 0, y: 0 };
  }

  const currentTeamId = currentPlayer.teamId;
  const currentPos = currentPlayer.position;

  const allies = players.filter(
    p => p.teamId === currentTeamId && p.participantId !== currentParticipantId && p.position
  );
  if (allies.length === 0) {
    return { x: 0, y: 0 };
  }

  let weightedX = 0;
  let weightedY = 0;
  let totalWeight = 0;

  allies.forEach(ally => {
    const dx = ally.position.x - currentPos.x;
    const dy = ally.position.y - currentPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const weight = 1 / (distance + epsilon);

    weightedX += weight * ally.position.x;
    weightedY += weight * ally.position.y;
    totalWeight += weight;
  });

  if (totalWeight === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight
  };
}

module.exports = { calculateCME, calculateCSA };

