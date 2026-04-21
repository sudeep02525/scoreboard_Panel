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
    const { overs = 5, date } = req.body;
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

// Delete match (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Match deleted successfully' });
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

// Ball-by-ball scoring (admin)
router.post('/:id/ball', protect, adminOnly, async (req, res) => {
  try {
    const { 
      inningsNum, 
      runs, 
      isWicket, 
      dismissalType,
      extras, 
      batsmanId, 
      bowlerId,
      strikerId,
      nonStrikerId,
      commentary 
    } = req.body;

    const match = await Match.findById(req.params.id)
      .populate('innings1.currentBatsmen.player innings1.currentBowler.player innings2.currentBatsmen.player innings2.currentBowler.player', 'name');
    
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const inningsKey = inningsNum === 1 ? 'innings1' : 'innings2';
    if (!match[inningsKey]) {
      match[inningsKey] = {
        team: inningsNum === 1 ? match.teamA : match.teamB,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: 0,
        currentBatsmen: [],
        ballByBall: [],
        partnerships: [],
        fallOfWickets: [],
        batting: [],
        bowling: [],
      };
    }

    const innings = match[inningsKey];
    
    // Initialize current batsmen if not set
    if (innings.currentBatsmen.length === 0 && strikerId && nonStrikerId) {
      innings.currentBatsmen = [
        { player: strikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true },
        { player: nonStrikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: false },
      ];
    }

    // Initialize current bowler if not set
    if (!innings.currentBowler.player && bowlerId) {
      innings.currentBowler = { player: bowlerId, overs: 0, balls: 0, runs: 0, wickets: 0 };
    }

    // Calculate current over and ball
    const currentOver = innings.overs;
    const currentBall = innings.balls + 1;

    // Add ball to ball-by-ball
    const ballData = {
      over: currentOver,
      ball: currentBall,
      batsman: batsmanId || strikerId,
      bowler: bowlerId,
      runs: runs || 0,
      isWicket: isWicket || false,
      dismissalType: dismissalType || '',
      extras: extras || '',
      commentary: commentary || '',
    };
    
    if (!innings.ballByBall) innings.ballByBall = [];
    innings.ballByBall.push(ballData);

    // Update innings totals
    const isExtra = extras && (extras === 'wd' || extras === 'nb');
    
    if (!isExtra) {
      innings.balls += 1;
      if (innings.balls === 6) {
        innings.overs += 1;
        innings.balls = 0;
      }
    }

    innings.runs += runs || 0;
    
    if (isExtra) {
      innings.extras += 1;
    }

    // Update striker stats
    const striker = innings.currentBatsmen.find(b => b.isStriker);
    if (striker && !isExtra) {
      striker.balls += 1;
      striker.runs += runs || 0;
      if (runs === 4) striker.fours += 1;
      if (runs === 6) striker.sixes += 1;
    }

    // Update bowler stats
    if (innings.currentBowler.player) {
      if (!isExtra) {
        innings.currentBowler.balls += 1;
        if (innings.currentBowler.balls === 6) {
          innings.currentBowler.overs += 1;
          innings.currentBowler.balls = 0;
        }
      }
      innings.currentBowler.runs += runs || 0;
      if (isWicket) {
        innings.currentBowler.wickets += 1;
        innings.wickets += 1;
        
        // Add to fall of wickets
        if (!innings.fallOfWickets) innings.fallOfWickets = [];
        innings.fallOfWickets.push({
          runs: innings.runs,
          wicket: innings.wickets,
          player: striker?.player,
          over: innings.overs + (innings.balls / 10),
        });
        
        // Remove striker from currentBatsmen on wicket
        innings.currentBatsmen = innings.currentBatsmen.filter(b => !b.isStriker);
      }
    }

    // Rotate strike on odd runs (1, 3, 5) or end of over - but NOT on wicket or 4/6
    if (!isWicket && !isExtra && runs !== 4 && runs !== 6) {
      if ((runs % 2 === 1) || innings.balls === 0) {
        innings.currentBatsmen.forEach(b => b.isStriker = !b.isStriker);
      }
    }

    match.status = 'live';
    match.currentInnings = inningsNum;
    
    await match.save();
    
    const updatedMatch = await Match.findById(req.params.id)
      .populate('teamA teamB')
      .populate('innings1.currentBatsmen.player innings1.currentBowler.player innings2.currentBatsmen.player innings2.currentBowler.player', 'name');
    
    res.json(updatedMatch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update current players (batsmen/bowler) (admin)
router.put('/:id/players', protect, adminOnly, async (req, res) => {
  try {
    const { inningsNum, strikerId, nonStrikerId, bowlerId } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const inningsKey = inningsNum === 1 ? 'innings1' : 'innings2';
    if (!match[inningsKey]) {
      match[inningsKey] = {
        team: inningsNum === 1 ? match.teamA : match.teamB,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        currentBatsmen: [],
        ballByBall: [],
      };
    }

    const innings = match[inningsKey];

    // Update batsmen
    if (strikerId && nonStrikerId) {
      const existingStriker = innings.currentBatsmen.find(b => b.player.toString() === strikerId);
      const existingNonStriker = innings.currentBatsmen.find(b => b.player.toString() === nonStrikerId);

      innings.currentBatsmen = [
        existingStriker || { player: strikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true },
        existingNonStriker || { player: nonStrikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: false },
      ];
      
      innings.currentBatsmen[0].isStriker = true;
      innings.currentBatsmen[1].isStriker = false;
    }

    // Update bowler
    if (bowlerId) {
      const existingBowler = innings.bowling?.find(b => b.player.toString() === bowlerId);
      innings.currentBowler = existingBowler || { player: bowlerId, overs: 0, balls: 0, runs: 0, wickets: 0 };
    }

    await match.save();
    
    const updatedMatch = await Match.findById(req.params.id)
      .populate('teamA teamB')
      .populate('innings1.currentBatsmen.player innings1.currentBowler.player innings2.currentBatsmen.player innings2.currentBowler.player', 'name');
    
    res.json(updatedMatch);
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
    const { overs = 5, date } = req.body;
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
    const { overs = 5, date } = req.body;
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
