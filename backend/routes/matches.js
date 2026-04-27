import express from 'express';
import Match from '../models/Match.js';
import Team from '../models/Team.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

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
      .populate('teamA teamB', 'name')
      .populate('innings1.currentBatsmen.player innings2.currentBatsmen.player', 'name')
      .populate('innings1.currentBowler.player innings2.currentBowler.player', 'name');
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
      .populate('innings1.batting.player innings1.bowling.player innings2.batting.player innings2.bowling.player', 'name')
      .populate('innings1.currentBatsmen.player innings2.currentBatsmen.player', 'name')
      .populate('innings1.currentBowler.player innings2.currentBowler.player', 'name');
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

    // Round robin for each group
    const generateRoundRobin = (teams, group, groundName, startDate) => {
      const pairs = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          pairs.push({ teamA: teams[i]._id, teamB: teams[j]._id });
        }
      }
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
    
    // Initialize innings if not exists
    if (!match[inningsKey]) {
      match[inningsKey] = {
        team: inningsNum === 1 ? match.teamA : match.teamB,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: 0,
        currentBatsmen: [],
        currentBowler: { player: null, overs: 0, balls: 0, runs: 0, wickets: 0 },
        ballByBall: [],
        partnerships: [],
        fallOfWickets: [],
        batting: [],
        bowling: [],
      };
    }

    if (runs !== undefined) match[inningsKey].runs = runs;
    if (wickets !== undefined) match[inningsKey].wickets = wickets;
    if (overs !== undefined) match[inningsKey].overs = overs;
    if (balls !== undefined) match[inningsKey].balls = balls;
    if (extras !== undefined) match[inningsKey].extras = extras;
    if (batting) match[inningsKey].batting = batting;
    if (bowling) match[inningsKey].bowling = bowling;

    match.status = 'live';
    match.currentInnings = inningsNum;
    await match.save();
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ball-by-ball scoring (admin) - COMPLETE CRICKET SCORING ENGINE
router.post('/:id/ball', protect, adminOnly, async (req, res) => {
  try {
    const { 
      inningsNum, 
      runs, 
      isWicket, 
      dismissalType,
      extras, // 'wd', 'nb', 'b', 'lb'
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
    const TOTAL_OVERS = match.overs || 5;
    const BALLS_PER_OVER = 6;
    const MAX_LEGAL_BALLS = TOTAL_OVERS * BALLS_PER_OVER;
    
    // Calculate current legal balls used
    const currentLegalBalls = (innings.overs * BALLS_PER_OVER) + innings.balls;
    
    // Check if innings is already complete
    if (currentLegalBalls >= MAX_LEGAL_BALLS) {
      return res.status(400).json({ message: 'Innings complete - no more balls allowed' });
    }
    
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

    // Determine if this is a legal ball or extra
    const isLegalBall = !extras || (extras !== 'wd' && extras !== 'nb');
    const isBye = extras === 'b';
    const isLegBye = extras === 'lb';
    const isWide = extras === 'wd';
    const isNoBall = extras === 'nb';
    
    // Calculate runs to add
    let runsToAdd = runs || 0;
    
    // Add ball to ball-by-ball history
    const ballData = {
      over: innings.overs,
      ball: innings.balls + (isLegalBall ? 1 : 0),
      batsman: batsmanId || strikerId,
      bowler: bowlerId,
      runs: runsToAdd,
      isWicket: isWicket || false,
      dismissalType: dismissalType || '',
      extras: extras || '',
      commentary: commentary || '',
      timestamp: new Date(),
    };
    
    if (!innings.ballByBall) innings.ballByBall = [];
    innings.ballByBall.push(ballData);

    // Update innings totals
    innings.runs += runsToAdd;
    
    // Handle extras
    if (isWide || isNoBall) {
      innings.extras += runsToAdd;
    }
    
    // Update legal ball count only if it's a legal delivery
    if (isLegalBall) {
      innings.balls += 1;
      
      // Check if over is complete (6 legal balls)
      if (innings.balls === BALLS_PER_OVER) {
        innings.overs += 1;
        innings.balls = 0;
        
        // Save current bowler stats to bowling array
        if (innings.currentBowler.player) {
          const existingBowlerIndex = innings.bowling.findIndex(
            b => b.player?.toString() === innings.currentBowler.player?.toString()
          );
          if (existingBowlerIndex >= 0) {
            innings.bowling[existingBowlerIndex] = { ...innings.currentBowler };
          } else {
            innings.bowling.push({ ...innings.currentBowler });
          }
          
          // Clear current bowler to force selection of new bowler
          innings.currentBowler = { player: null, overs: 0, balls: 0, runs: 0, wickets: 0 };
        }
      }
    }

    // Update striker stats (only for legal balls, not byes/leg byes)
    const striker = innings.currentBatsmen.find(b => b.isStriker);
    if (striker && isLegalBall && !isBye && !isLegBye) {
      striker.balls += 1;
      striker.runs += runsToAdd;
      if (runsToAdd === 4) striker.fours += 1;
      if (runsToAdd === 6) striker.sixes += 1;
    } else if (striker && isLegalBall && (isBye || isLegBye)) {
      // Bye/Leg Bye: ball faced but no runs to batsman
      striker.balls += 1;
    }

    // Update bowler stats
    if (innings.currentBowler.player) {
      innings.currentBowler.runs += runsToAdd;
      
      if (isLegalBall) {
        innings.currentBowler.balls += 1;
        
        // Update bowler overs
        if (innings.currentBowler.balls === BALLS_PER_OVER) {
          innings.currentBowler.overs += 1;
          innings.currentBowler.balls = 0;
        }
      }
      
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
        
        // Save striker stats to batting array before removing
        if (striker) {
          const existingBatsmanIndex = innings.batting.findIndex(
            b => b.player?.toString() === striker.player?.toString()
          );
          if (existingBatsmanIndex >= 0) {
            innings.batting[existingBatsmanIndex] = { ...striker };
          } else {
            innings.batting.push({ ...striker });
          }
        }
        
        // Remove striker from currentBatsmen on wicket
        innings.currentBatsmen = innings.currentBatsmen.filter(b => !b.isStriker);
      }
    }

    // Strike rotation logic
    let shouldSwapStrike = false;
    
    if (!isWicket && isLegalBall) {
      // Swap strike on odd runs (1, 3, 5)
      if (runsToAdd % 2 === 1) {
        shouldSwapStrike = true;
      }
      
      // Swap strike at end of over (after 6 legal balls)
      if (innings.balls === 0 && innings.overs > 0) {
        shouldSwapStrike = !shouldSwapStrike; // Toggle
      }
    }
    
    if (shouldSwapStrike && innings.currentBatsmen.length === 2) {
      innings.currentBatsmen.forEach(b => b.isStriker = !b.isStriker);
    }

    // Check if innings should end
    const totalLegalBalls = (innings.overs * BALLS_PER_OVER) + innings.balls;
    const inningsComplete = totalLegalBalls >= MAX_LEGAL_BALLS || innings.wickets >= 10;
    
    if (inningsComplete) {
      // Save all current batsmen to batting array
      innings.currentBatsmen.forEach(batsman => {
        const existingIndex = innings.batting.findIndex(
          b => b.player?.toString() === batsman.player?.toString()
        );
        if (existingIndex >= 0) {
          innings.batting[existingIndex] = { ...batsman };
        } else {
          innings.batting.push({ ...batsman });
        }
      });
      
      // Save current bowler to bowling array
      if (innings.currentBowler.player) {
        const existingBowlerIndex = innings.bowling.findIndex(
          b => b.player?.toString() === innings.currentBowler.player?.toString()
        );
        if (existingBowlerIndex >= 0) {
          innings.bowling[existingBowlerIndex] = { ...innings.currentBowler };
        } else {
          innings.bowling.push({ ...innings.currentBowler });
        }
      }
      
      // Normalize overs display
      if (innings.balls === 0 && innings.overs === TOTAL_OVERS) {
        innings.overs = TOTAL_OVERS;
        innings.balls = 0;
      }
      
      // If first innings complete, prepare for second innings
      if (inningsNum === 1) {
        match.currentInnings = 2;
      }
    }

    // Check if match is won (second innings)
    if (inningsNum === 2 && match.innings1) {
      const target = match.innings1.runs + 1;
      if (innings.runs >= target) {
        // Match won by batting team
        match.status = 'completed';
        const battingTeam = inningsNum === 1 ? match.teamA : match.teamB;
        match.result = {
          winner: battingTeam,
          description: `Won by ${10 - innings.wickets} wickets`,
        };
      } else if (inningsComplete) {
        // Innings complete, check result
        if (innings.runs < match.innings1.runs) {
          // Match won by bowling team
          match.status = 'completed';
          const bowlingTeam = inningsNum === 1 ? match.teamB : match.teamA;
          match.result = {
            winner: bowlingTeam,
            description: `Won by ${match.innings1.runs - innings.runs} runs`,
          };
        } else if (innings.runs === match.innings1.runs) {
          // Match tied
          match.status = 'completed';
          match.result = {
            winner: null,
            description: 'Match Tied',
          };
        }
      }
    }

    match.status = match.status === 'completed' ? 'completed' : 'live';
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
      const existingStriker = innings.currentBatsmen.find(b => b.player?.toString() === strikerId);
      const existingNonStriker = innings.currentBatsmen.find(b => b.player?.toString() === nonStrikerId);

      innings.currentBatsmen = [
        existingStriker || { player: strikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true },
        existingNonStriker || { player: nonStrikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: false },
      ];
      
      innings.currentBatsmen[0].isStriker = true;
      innings.currentBatsmen[1].isStriker = false;
    }

    // Update bowler
    if (bowlerId) {
      const existingBowler = innings.bowling?.find(b => b.player?.toString() === bowlerId);
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

    if (winnerId?.toString() === teamA._id?.toString()) {
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

export default router;
