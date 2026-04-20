const router = require('express').Router();
const Match = require('../models/Match');
const Team = require('../models/Team');
const { protect, adminOnly } = require('../middleware/auth');

// Get all matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('teamA teamB tossWinner result.winner', 'name group')
      .sort({ date: 1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get live matches
router.get('/live', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'live' })
      .populate('teamA teamB innings1.batting.player innings1.bowling.player innings2.batting.player innings2.bowling.player', 'name');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get matches by stage
router.get('/stage/:stage', async (req, res) => {
  try {
    const matches = await Match.find({ stage: req.params.stage })
      .populate('teamA teamB result.winner', 'name group');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single match
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA teamB tossWinner result.winner', 'name group')
      .populate('innings1.batting.player innings1.bowling.player innings2.batting.player innings2.bowling.player', 'name');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate group stage schedule (admin)
router.post('/generate-schedule', protect, adminOnly, async (req, res) => {
  try {
    const { overs = 6, date } = req.body;
    const groupA = await Team.find({ group: 'A' });
    const groupB = await Team.find({ group: 'B' });

    if (groupA.length !== 4 || groupB.length !== 4)
      return res.status(400).json({ message: 'Need exactly 4 teams in each group' });

    await Match.deleteMany({ stage: 'group' });

    const scheduleMatches = [];
    const baseDate = date ? new Date(date) : new Date();

    // Round robin for each group (each team plays 3 matches)
    const generateRoundRobin = (teams, group, groundName, startDate) => {
      const pairs = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          pairs.push({ teamA: teams[i]._id, teamB: teams[j]._id });
        }
      }
      // 4 teams = 6 pairs but each team plays 3 → use round-robin 3 rounds
      // Standard round-robin: 3 rounds, 2 matches per round
      const rounds = [
        [pairs[0], pairs[5]],
        [pairs[1], pairs[4]],
        [pairs[2], pairs[3]],
      ];
      rounds.forEach((round, rIdx) => {
        round.forEach((pair) => {
          const matchDate = new Date(startDate);
          matchDate.setDate(matchDate.getDate() + rIdx);
          scheduleMatches.push({
            ...pair,
            group,
            stage: 'group',
            round: rIdx + 1,
            ground: groundName,
            overs,
            date: matchDate,
            status: 'scheduled',
          });
        });
      });
    };

    generateRoundRobin(groupA, 'A', 'Ground 1', baseDate);
    generateRoundRobin(groupB, 'B', 'Ground 2', baseDate);

    const created = await Match.insertMany(scheduleMatches);
    res.status(201).json({ message: 'Schedule generated', matches: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create match manually (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update match status / toss (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teamA teamB', 'name');
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update score - live scoring (admin)
router.put('/:id/score', protect, adminOnly, async (req, res) => {
  try {
    const { inningsNum, runs, wickets, overs, balls, batting, bowling, extras } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const inningsKey = inningsNum === 1 ? 'innings1' : 'innings2';
    if (!match[inningsKey]) match[inningsKey] = {};

    if (runs !== undefined) match[inningsKey].runs = runs;
    if (wickets !== undefined) match[inningsKey].wickets = wickets;
    if (overs !== undefined) match[inningsKey].overs = overs;
    if (balls !== undefined) match[inningsKey].balls = balls;
    if (extras !== undefined) match[inningsKey].extras = extras;
    if (batting) match[inningsKey].batting = batting;
    if (bowling) match[inningsKey].bowling = bowling;

    match.status = 'live';
    await match.save();
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete match & update standings (admin)
router.put('/:id/complete', protect, adminOnly, async (req, res) => {
  try {
    const { winnerId, description } = req.body;
    const match = await Match.findById(req.params.id).populate('teamA teamB');
    if (!match) return res.status(404).json({ message: 'Match not found' });

    match.status = 'completed';
    match.result = { winner: winnerId, description };

    // Update team stats
    const teamA = await Team.findById(match.teamA._id);
    const teamB = await Team.findById(match.teamB._id);

    teamA.stats.played += 1;
    teamB.stats.played += 1;

    if (winnerId.toString() === teamA._id.toString()) {
      teamA.stats.won += 1;
      teamA.stats.points += 2;
      teamB.stats.lost += 1;
    } else {
      teamB.stats.won += 1;
      teamB.stats.points += 2;
      teamA.stats.lost += 1;
    }

    await teamA.save();
    await teamB.save();
    await match.save();

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate semi finals (admin)
router.post('/generate-semis', protect, adminOnly, async (req, res) => {
  try {
    const { overs = 6, date } = req.body;
    // Top 2 from each group by points
    const groupA = await Team.find({ group: 'A' }).sort({ 'stats.points': -1, 'stats.nrr': -1 }).limit(2);
    const groupB = await Team.find({ group: 'B' }).sort({ 'stats.points': -1, 'stats.nrr': -1 }).limit(2);

    await Match.deleteMany({ stage: 'semi' });

    const semiDate = date ? new Date(date) : new Date();
    const semis = await Match.insertMany([
      { teamA: groupA[0]._id, teamB: groupB[1]._id, stage: 'semi', group: 'Semi Final 1', ground: 'Ground 1', overs, date: semiDate, status: 'scheduled' },
      { teamA: groupB[0]._id, teamB: groupA[1]._id, stage: 'semi', group: 'Semi Final 2', ground: 'Ground 2', overs, date: semiDate, status: 'scheduled' },
    ]);

    res.status(201).json({ message: 'Semi finals generated', matches: semis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate final (admin)
router.post('/generate-final', protect, adminOnly, async (req, res) => {
  try {
    const { overs = 6, date } = req.body;
    const semis = await Match.find({ stage: 'semi', status: 'completed' }).populate('result.winner');
    if (semis.length < 2) return res.status(400).json({ message: 'Both semi finals must be completed' });

    await Match.deleteMany({ stage: 'final' });

    const finalDate = date ? new Date(date) : new Date();
    const final = await Match.create({
      teamA: semis[0].result.winner._id,
      teamB: semis[1].result.winner._id,
      stage: 'final',
      group: 'Final',
      ground: 'Ground 1',
      overs,
      date: finalDate,
      status: 'scheduled',
    });

    res.status(201).json({ message: 'Final generated', match: final });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
