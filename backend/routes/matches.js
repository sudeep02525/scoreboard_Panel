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
      runs,         // runs scored by bat (0-6)
      isWicket, 
      dismissalType,
      extras,       // 'wd','nb','nb-ff','nb-2b','nb-wh','b','lb','ot1','ot2','ot3','ot4'
      extraRuns,    // extra penalty runs (overthrow etc.)
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
        runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0,
        currentBatsmen: [], ballByBall: [], partnerships: [],
        fallOfWickets: [], batting: [], bowling: [],
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

    // Determine delivery type
    // Wide: wd
    // No Ball variants: nb, nb-ff (front foot), nb-2b (2 bounce), nb-wh (waist high full toss)
    // Bye: b  |  Leg Bye: lb
    // Overthrow: ot1, ot2, ot3, ot4
    const isWide = extras === 'wd';
    const isNoBall = extras === 'nb' || extras === 'nb-ff' || extras === 'nb-2b' || extras === 'nb-wh';
    const isBye = extras === 'b';
    const isLegBye = extras === 'lb';
    const isOverthrow = extras && extras.startsWith('ot');
    const overthrowRuns = isOverthrow ? parseInt(extras.replace('ot', '')) || 0 : 0;

    // Legal ball = counts in over (not wide, not no-ball)
    const isLegal = !isWide && !isNoBall;

    const currentOver = innings.overs;
    const currentBall = innings.balls + 1;

    // Total runs to add to innings
    // Wide/NB: +1 penalty + any runs scored off the bat
    // Bye/LegBye: runs go to team but NOT to batsman
    // Overthrow: extra runs added on top
    let totalRunsToAdd = 0;
    let batsmanRuns = 0;
    let extraRunsToAdd = 0;

    if (isWide) {
      // Wide: +1 penalty, any additional runs (e.g. 4 wides) go as extras
      extraRunsToAdd = 1 + (runs || 0);
      totalRunsToAdd = extraRunsToAdd;
      batsmanRuns = 0;
    } else if (isNoBall) {
      // No Ball: +1 penalty, batsman can score off it
      extraRunsToAdd = 1;
      batsmanRuns = runs || 0;
      totalRunsToAdd = 1 + batsmanRuns;
    } else if (isBye || isLegBye) {
      // Bye/Leg Bye: runs go to team as extras, not to batsman
      extraRunsToAdd = runs || 0;
      batsmanRuns = 0;
      totalRunsToAdd = extraRunsToAdd;
    } else if (isOverthrow) {
      // Overthrow: bat runs + overthrow extras
      batsmanRuns = runs || 0;
      extraRunsToAdd = overthrowRuns;
      totalRunsToAdd = batsmanRuns + overthrowRuns;
    } else {
      // Normal delivery
      batsmanRuns = runs || 0;
      totalRunsToAdd = batsmanRuns;
    }

    // Add ball to ball-by-ball
    const ballData = {
      over: currentOver,
      ball: currentBall,
      batsman: batsmanId || strikerId,
      bowler: bowlerId,
      runs: totalRunsToAdd,
      isWicket: isWicket || false,
      dismissalType: dismissalType || '',
      extras: extras || '',
      extraRuns: extraRunsToAdd,
      isLegal,
      commentary: commentary || '',
    };
    
    if (!innings.ballByBall) innings.ballByBall = [];
    innings.ballByBall.push(ballData);

    // Update innings totals
    innings.runs += totalRunsToAdd;
    if (extraRunsToAdd > 0) innings.extras += extraRunsToAdd;

    // Count legal balls in over
    if (isLegal) {
      innings.balls += 1;
      if (innings.balls === 6) {
        innings.overs += 1;
        innings.balls = 0;
      }
    }

    // Update striker stats (only bat runs, not extras from bye/legbye/wide)
    const striker = innings.currentBatsmen.find(b => b.isStriker);
    if (striker && !isWide && !isBye && !isLegBye) {
      if (isLegal || isNoBall) {
        // Ball faced: legal deliveries + no balls (not wides)
        if (!isNoBall) striker.balls += 1; // no ball doesn't count as ball faced in some formats; here we count it
        else striker.balls += 1; // count no-ball as ball faced
        striker.runs += batsmanRuns;
        if (batsmanRuns === 4) striker.fours += 1;
        if (batsmanRuns === 6) striker.sixes += 1;
      }
    }

    // Update bowler stats
    if (innings.currentBowler.player) {
      // Bowler concedes: bat runs + no-ball penalty (not bye/legbye extras)
      let bowlerRuns = 0;
      if (isWide) bowlerRuns = totalRunsToAdd;
      else if (isNoBall) bowlerRuns = totalRunsToAdd; // nb penalty + bat runs
      else if (isBye || isLegBye) bowlerRuns = 0; // bye/legbye not charged to bowler
      else bowlerRuns = batsmanRuns + overthrowRuns;

      innings.currentBowler.runs += bowlerRuns;

      if (isLegal) {
        innings.currentBowler.balls += 1;
        if (innings.currentBowler.balls === 6) {
          innings.currentBowler.overs += 1;
          innings.currentBowler.balls = 0;
          
          // Save bowler stats to bowling array
          const existingBowlerIndex = innings.bowling.findIndex(
            b => b.player && b.player.toString() === innings.currentBowler.player.toString()
          );
          const bowlerSnapshot = {
            player: innings.currentBowler.player,
            overs: innings.currentBowler.overs,
            balls: innings.currentBowler.balls,
            runs: innings.currentBowler.runs,
            wickets: innings.currentBowler.wickets,
          };
          if (existingBowlerIndex >= 0) {
            innings.bowling[existingBowlerIndex] = bowlerSnapshot;
          } else {
            innings.bowling.push(bowlerSnapshot);
          }
          
          // Clear current bowler to force selection of new bowler
          innings.currentBowler = { player: null, overs: 0, balls: 0, runs: 0, wickets: 0 };
        }
      }

      if (isWicket) {
        // Wicket: only count if bowler's wicket (not run out)
        const runOutTypes = ['run out'];
        if (!runOutTypes.includes(dismissalType)) {
          innings.currentBowler.wickets += 1;
        }
        innings.wickets += 1;
        
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

    // Strike rotation:
    // Odd bat runs → rotate (1,3,5)
    // End of over (balls just became 0 after incrementing) → rotate
    // Wide → no rotation (batsman stays)
    // Wicket → no rotation (new batsman comes in as striker)
    if (!isWicket && !isWide) {
      const overJustEnded = isLegal && innings.balls === 0 && innings.overs > 0;
      const oddRuns = batsmanRuns % 2 === 1;
      if (oddRuns || overJustEnded) {
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

// Undo last ball (admin)
router.post('/:id/undo', protect, adminOnly, async (req, res) => {
  try {
    const { inningsNum } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const inningsKey = inningsNum === 1 ? 'innings1' : 'innings2';
    const innings = match[inningsKey];
    if (!innings || !innings.ballByBall || innings.ballByBall.length === 0) {
      return res.status(400).json({ message: 'No balls to undo' });
    }

    const lastBall = innings.ballByBall[innings.ballByBall.length - 1];
    innings.ballByBall.pop();

    // Reverse runs
    innings.runs = Math.max(0, innings.runs - (lastBall.runs || 0));
    innings.extras = Math.max(0, innings.extras - (lastBall.extraRuns || 0));

    // Reverse ball count
    if (lastBall.isLegal) {
      if (innings.balls === 0 && innings.overs > 0) {
        innings.overs -= 1;
        innings.balls = 5;
      } else {
        innings.balls = Math.max(0, innings.balls - 1);
      }
    }

    // Reverse wicket
    if (lastBall.isWicket) {
      innings.wickets = Math.max(0, innings.wickets - 1);
      if (innings.fallOfWickets && innings.fallOfWickets.length > 0) {
        innings.fallOfWickets.pop();
      }
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
