const express = require('express');
const axios = require('axios');
const router = express.Router();
const database = require('../models/database');

function getFrameAt(frames, time) {
  let chosen = frames[0];
  for (const frame of frames) {
    if (frame.timestamp > time) break;
    chosen = frame;
  }
  return chosen;
}

function center(positions) {
  const total = positions.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: total.x / positions.length, y: total.y / positions.length };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(val, min, max) {
  if (max === min) return 0;
  return ((val - min) / (max - min)) * 2 - 1;
}

router.get('/:matchId/timeline', async (req, res) => {
  const matchId = req.params.matchId;
  const apiKey = req.header('x-api-key');
  if (!apiKey) {
    return res.status(400).json({ error: 'x-api-key header required' });
  }

  try {
    const baseUrl = 'https://europe.api.riotgames.com';
    const [matchRes, timelineRes] = await Promise.all([
      axios.get(`${baseUrl}/lol/match/v5/matches/${matchId}`, {
        headers: { 'X-Riot-Token': apiKey }
      }),
      axios.get(`${baseUrl}/lol/match/v5/matches/${matchId}/timeline`, {
        headers: { 'X-Riot-Token': apiKey }
      })
    ]);

    const matchData = matchRes.data;
    const timeline = timelineRes.data;

    const puuidMap = {};
    matchData.metadata.participants.forEach((p, i) => {
      puuidMap[p] = i + 1;
    });

    const teamMap = {};
    matchData.info.participants.forEach(p => {
      teamMap[p.participantId] = p.teamId;
    });

    const frames = timeline.info.frames;
    const flashes = [];
    const raw1 = [], raw2 = [], raw4 = [], raw5 = [];

    for (const frame of frames) {
      for (const event of frame.events) {
        if (event.type === 'SUMMONER_SPELL_USED' && event.spellId === 4) {
          const pid = event.participantId || puuidMap[event.puuid];
          const time = event.timestamp;
          const beforeFrame = getFrameAt(frames, time - 1);
          const prePos = beforeFrame.participantFrames[pid].position;
          const postPos = event.position || getFrameAt(frames, time).participantFrames[pid].position;

          const allies = [], enemies = [];
          Object.entries(beforeFrame.participantFrames).forEach(([id, data]) => {
            const pos = data.position;
            if (teamMap[id] === teamMap[pid]) allies.push(pos); else enemies.push(pos);
          });

          const cme = center(enemies);
          const csa = center(allies); // unused but computed

          const distBefore = distance(prePos, cme);
          const distAfter = distance(postPos, cme);
          const c1 = distAfter - distBefore;

          const statsBefore = beforeFrame.participantFrames[pid].championStats;
          const c2 = statsBefore.currentHealth / Math.max(statsBefore.maxHealth, 1);

          const vFlash = { x: postPos.x - prePos.x, y: postPos.y - prePos.y };
          const vEnemy = { x: cme.x - prePos.x, y: cme.y - prePos.y };
          const dot = vFlash.x * vEnemy.x + vFlash.y * vEnemy.y;
          const mag1 = Math.hypot(vFlash.x, vFlash.y);
          const mag2 = Math.hypot(vEnemy.x, vEnemy.y);
          const c3 = mag1 > 0 && mag2 > 0 ? dot / (mag1 * mag2) : 0;

          const frameT = getFrameAt(frames, time);
          const frame3s = getFrameAt(frames, time - 3000);
          const dmgT = frameT.participantFrames[pid].damageStats;
          const dmg3 = frame3s.participantFrames[pid].damageStats;
          const c4 = dmgT.totalDamageTaken - dmg3.totalDamageTaken;
          const c5 = dmgT.totalDamageDoneToChampions - dmg3.totalDamageDoneToChampions;

          raw1.push(c1); raw2.push(c2); raw4.push(c4); raw5.push(c5);
          flashes.push({ pid, time, prePos, postPos, c1, c2, c3, c4, c5 });
        }
      }
    }

    const min1 = Math.min(...raw1), max1 = Math.max(...raw1);
    const min2 = Math.min(...raw2), max2 = Math.max(...raw2);
    const min4 = Math.min(...raw4), max4 = Math.max(...raw4);
    const min5 = Math.min(...raw5), max5 = Math.max(...raw5);

    const db = database.getDb();
    let count = 0;
    flashes.forEach(f => {
      const n1 = normalize(f.c1, min1, max1);
      const n2 = normalize(f.c2, min2, max2);
      const n3 = f.c3;
      const n4 = normalize(f.c4, min4, max4);
      const n5 = normalize(f.c5, min5, max5);
      const logit = n1 + n2 + n3 + n4 + n5;
      const confidence = 1 / (1 + Math.exp(-logit));
      const flashType = confidence > 0.5 ? 'flash-in' : 'flash-out';
      count++;
      db.run(
        `INSERT INTO FlashEvents (match_id, participant_id, timestamp, before_x, before_y, after_x, after_y, flash_type, confidence_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [matchId, f.pid, f.time, f.prePos.x, f.prePos.y, f.postPos.x, f.postPos.y, flashType, confidence]
      );
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
