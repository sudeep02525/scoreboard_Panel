import express from 'express';
import Match from '../models/Match.js';
import Team from '../models/Team.js';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  blankInnings,
  syncBatsmanToArray,
  syncBowlerToArray,
  classifyDelivery,
  calcDeliveryRuns,
  shouldSwapStrike,
  replayInnings,
  determineResult,
  BALLS_PER_OVER,
} from '../src/engine/scoringEngine.js';

const router = express.Router();

/** Shared populate chain for a full match response */
const populateMatch = (query) =>
  query
    .populate('teamA teamB tossWinner result.winner', 'name group')
    .populate('innings1.batting.player innings1.bowling.player innings2.batting.player innings2.bowling.player', 'name')
    .populate('innings1.currentBatsmen.player innings1.currentBowler.player innings2.currentBatsmen.player innings2.currentBowler.player', 'name');

// ─── GET /matches ─────────────────────────────────────────────────────────────

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

router.get('/stage/:stage', async (req, res) => {
  try {
    const matches = await Match.find({ stage: req.params.stage })
      .populate('teamA teamB result.winner', 'name group');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const match = await populateMatch(Match.findById(req.params.id));
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Schedule generation ──────────────────────────────────────────────────────

router.post('/generate-schedule', protect, adminOnly, async (req, res) => {
  try {
    const { overs = 5, date } = req.body;
    const [groupA, groupB] = await Promise.all([
      Team.find({ group: 'A' }),
      Team.find({ group: 'B' }),
    ]);

    if (groupA.length !== 4 || groupB.length !== 4)
      return res.status(400).json({ message: 'Need exactly 4 teams in each group' });

    await Match.deleteMany({ stage: 'group' });

    const scheduleMatches = [];
    const baseDate = date ? new Date(date) : new Date();

    const generateRoundRobin = (teams, group, groundName, startDate) => {
      const pairs = [];
      for (let i = 0; i < teams.length; i++)
        for (let j = i + 1; j < teams.length; j++)
          pairs.push({ teamA: teams[i]._id, teamB: teams[j]._id });

      const rounds = [[pairs[0], pairs[5]], [pairs[1], pairs[4]], [pairs[2], pairs[3]]];
      rounds.forEach((round, rIdx) => {
        round.forEach((pair) => {
          const matchDate = new Date(startDate);
          matchDate.setDate(matchDate.getDate() + rIdx);
          scheduleMatches.push({ ...pair, group, stage: 'group', round: rIdx + 1, ground: groundName, overs, date: matchDate, status: 'scheduled' });
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

router.post('/generate-semis', protect, adminOnly, async (req, res) => {
  try {
    const { overs = 5, date } = req.body;
    const [groupA, groupB] = await Promise.all([
      Team.find({ group: 'A' }).sort({ 'stats.points': -1, 'stats.nrr': -1 }).limit(2),
      Team.find({ group: 'B' }).sort({ 'stats.points': -1, 'stats.nrr': -1 }).limit(2),
    ]);

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
      stage: 'final', group: 'Final', ground: 'Ground 1', overs, date: finalDate, status: 'scheduled',
    });
    res.status(201).json({ message: 'Final generated', match: final });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teamA teamB', 'name');
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Bulk score update (admin override) ──────────────────────────────────────

router.put('/:id/score', protect, adminOnly, async (req, res) => {
  try {
    const { inningsNum, runs, wickets, overs, balls, batting, bowling, extras } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const key = inningsNum === 1 ? 'innings1' : 'innings2';
    if (!match[key]) match[key] = blankInnings(inningsNum === 1 ? match.teamA : match.teamB);

    if (runs     !== undefined) match[key].runs    = runs;
    if (wickets  !== undefined) match[key].wickets = wickets;
    if (overs    !== undefined) match[key].overs   = overs;
    if (balls    !== undefined) match[key].balls   = balls;
    if (extras   !== undefined) match[key].extras  = extras;
    if (batting)  match[key].batting  = batting;
    if (bowling)  match[key].bowling  = bowling;

    match.status = 'live';
    match.currentInnings = inningsNum;
    await match.save();
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Ball-by-ball scoring ─────────────────────────────────────────────────────

router.post('/:id/ball', protect, adminOnly, async (req, res) => {
  try {
    const {
      inningsNum, runs, isWicket, dismissalType,
      extras, extraRuns,
      batsmanId, bowlerId, strikerId, nonStrikerId, commentary,
    } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const key = inningsNum === 1 ? 'innings1' : 'innings2';
    if (!match[key]) match[key] = blankInnings(inningsNum === 1 ? match.teamA : match.teamB);

    const innings = match[key];
    const TOTAL_OVERS = match.overs || 6;
    const MAX_LEGAL_BALLS = TOTAL_OVERS * BALLS_PER_OVER;

    if ((innings.overs * BALLS_PER_OVER + innings.balls) >= MAX_LEGAL_BALLS)
      return res.status(400).json({ message: 'Innings complete - no more balls allowed' });

    const delivery = classifyDelivery(extras);
    const { isWide, isNoBall, isLegalBall, isBye, isLegBye } = delivery;
    const { penaltyRun, batsmanRuns, extraRunsVal, totalRunsThisBall } =
      calcDeliveryRuns(runs, extraRuns, delivery);

    // Init batsmen / bowler on first ball
    if (innings.currentBatsmen.length === 0 && strikerId && nonStrikerId) {
      innings.currentBatsmen = [
        { player: strikerId,    runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true  },
        { player: nonStrikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: false },
      ];
    }
    if (!innings.currentBowler?.player && bowlerId) {
      const prev = innings.bowling.find(b => b.player?.toString() === bowlerId);
      innings.currentBowler = prev
        ? { player: bowlerId, overs: prev.overs, balls: prev.balls, runs: prev.runs, wickets: prev.wickets, maidens: prev.maidens || 0 }
        : { player: bowlerId, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
    }

    // Record ball
    if (!innings.ballByBall) innings.ballByBall = [];
    innings.ballByBall.push({
      over: innings.overs,
      ball: innings.balls + (isLegalBall ? 1 : 0),
      batsman: batsmanId || strikerId,
      bowler: bowlerId,
      runs: totalRunsThisBall,
      isWicket: isWicket || false,
      dismissalType: dismissalType || '',
      extras: extras || '',
      extraRuns: extraRunsVal,
      isLegal: isLegalBall,
      commentary: commentary || '',
      timestamp: new Date(),
    });

    // Update totals
    innings.runs += totalRunsThisBall;
    if (isWide || isNoBall) innings.extras += penaltyRun + extraRunsVal;
    else if (isBye || isLegBye) innings.extras += (runs || 0);

    // Update striker stats
    const striker = innings.currentBatsmen.find(b => b.isStriker);
    if (striker && isLegalBall) {
      if (!isBye && !isLegBye && !delivery.isOverthrow) {
        striker.balls += 1;
        striker.runs  += batsmanRuns;
        if (batsmanRuns === 4) striker.fours += 1;
        if (batsmanRuns === 6) striker.sixes += 1;
      } else {
        striker.balls += 1;
      }
    }

    // Update bowler stats
    if (innings.currentBowler?.player) {
      const bowlerRuns = (isBye || isLegBye) ? penaltyRun : totalRunsThisBall;
      innings.currentBowler.runs += bowlerRuns;
      if (isLegalBall) {
        innings.currentBowler.balls += 1;
        if (innings.currentBowler.balls === BALLS_PER_OVER) {
          innings.currentBowler.overs += 1;
          innings.currentBowler.balls  = 0;
        }
      }
      if (isWicket && dismissalType !== 'run out') innings.currentBowler.wickets += 1;
    }

    // Handle wicket
    if (isWicket) {
      innings.wickets += 1;
      if (!innings.fallOfWickets) innings.fallOfWickets = [];
      innings.fallOfWickets.push({
        runs: innings.runs, wicket: innings.wickets,
        player: striker?.player,
        over: parseFloat(`${innings.overs}.${innings.balls}`),
      });
      if (striker) {
        const dismissedEntry = {
          player: striker.player, runs: striker.runs, balls: striker.balls,
          fours: striker.fours, sixes: striker.sixes,
          strikeRate: striker.balls > 0 ? parseFloat(((striker.runs / striker.balls) * 100).toFixed(2)) : 0,
          status: 'out', dismissal: dismissalType || '',
        };
        const idx = innings.batting.findIndex(b => b.player?.toString() === striker.player?.toString());
        if (idx >= 0) innings.batting[idx] = dismissedEntry;
        else innings.batting.push(dismissedEntry);
      }
      innings.currentBatsmen = innings.currentBatsmen.filter(b => !b.isStriker);
    }

    // Strike rotation
    if (!isWicket && innings.currentBatsmen.length === 2) {
      if (shouldSwapStrike(delivery, batsmanRuns, runs, innings.balls, isWicket)) {
        innings.currentBatsmen.forEach(b => { b.isStriker = !b.isStriker; });
      }
    }

    // Advance ball/over counter
    if (isLegalBall) {
      innings.balls += 1;
      if (innings.balls === BALLS_PER_OVER) {
        innings.overs += 1;
        innings.balls  = 0;
        if (innings.currentBowler?.player) {
          syncBowlerToArray(innings, innings.currentBowler);
          innings.currentBowler = { player: null, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
        }
      } else {
        if (innings.currentBowler?.player) syncBowlerToArray(innings, innings.currentBowler);
      }
    } else {
      if (innings.currentBowler?.player) syncBowlerToArray(innings, innings.currentBowler);
    }

    innings.currentBatsmen.forEach(b => syncBatsmanToArray(innings, { ...b, status: 'batting' }));

    // Check innings completion
    const totalLegalBalls = innings.overs * BALLS_PER_OVER + innings.balls;
    const inningsComplete = totalLegalBalls >= MAX_LEGAL_BALLS || innings.wickets >= 10;

    if (inningsComplete) {
      innings.currentBatsmen.forEach(b => syncBatsmanToArray(innings, { ...b, status: 'not out' }));
      if (innings.currentBowler?.player) syncBowlerToArray(innings, innings.currentBowler);
      if (inningsNum === 1) match.currentInnings = 2;
    }

    // Determine result (2nd innings)
    if (inningsNum === 2 && match.innings1) {
      const result = determineResult(innings, match.innings1.runs, match.teamA, match.teamB, inningsComplete);
      if (result) {
        match.status = result.status;
        match.result = { winner: result.winner, description: result.description };
      }
    }

    if (match.status !== 'completed') match.status = 'live';
    match.currentInnings = inningsNum;
    await match.save();

    res.json(await populateMatch(Match.findById(req.params.id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Set current players ──────────────────────────────────────────────────────

router.put('/:id/players', protect, adminOnly, async (req, res) => {
  try {
    const { inningsNum, strikerId, nonStrikerId, bowlerId } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const key = inningsNum === 1 ? 'innings1' : 'innings2';
    if (!match[key]) match[key] = blankInnings(inningsNum === 1 ? match.teamA : match.teamB);

    const innings = match[key];

    if (strikerId && nonStrikerId) {
      const findOrCreate = (pid, isStriker) => {
        const fromActive  = innings.currentBatsmen.find(b => b.player?.toString() === pid);
        if (fromActive) return { ...(fromActive.toObject ? fromActive.toObject() : fromActive), isStriker };
        const fromBatting = innings.batting.find(b => b.player?.toString() === pid);
        if (fromBatting) return { player: pid, runs: fromBatting.runs, balls: fromBatting.balls, fours: fromBatting.fours, sixes: fromBatting.sixes, isStriker };
        return { player: pid, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker };
      };
      innings.currentBatsmen = [findOrCreate(strikerId, true), findOrCreate(nonStrikerId, false)];
    }

    if (bowlerId) {
      const prev = innings.bowling?.find(b => b.player?.toString() === bowlerId);
      innings.currentBowler = prev
        ? { player: bowlerId, overs: prev.overs, balls: prev.balls, runs: prev.runs, wickets: prev.wickets, maidens: prev.maidens || 0 }
        : { player: bowlerId, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
    }

    await match.save();
    res.json(await populateMatch(Match.findById(req.params.id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Undo last ball ───────────────────────────────────────────────────────────

router.post('/:id/undo', protect, adminOnly, async (req, res) => {
  try {
    const { inningsNum } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const key = inningsNum === 1 ? 'innings1' : 'innings2';
    const innings = match[key];
    if (!innings?.ballByBall?.length) return res.status(400).json({ message: 'Nothing to undo' });

    innings.ballByBall.pop();

    // Full replay from remaining balls
    const { runs, wickets, overs, balls, extras, fallOfWickets, batsmanMap, bowlerMap } =
      replayInnings(innings.ballByBall);

    innings.runs = runs; innings.wickets = wickets;
    innings.overs = overs; innings.balls = balls; innings.extras = extras;
    innings.fallOfWickets = fallOfWickets;

    innings.batting = Object.values(batsmanMap).map(b => ({
      ...b,
      strikeRate: b.balls > 0 ? parseFloat(((b.runs / b.balls) * 100).toFixed(2)) : 0,
    }));
    innings.bowling = Object.values(bowlerMap).map(b => {
      const tb = b.overs * 6 + b.balls;
      return { ...b, economy: tb > 0 ? parseFloat(((b.runs / tb) * 6).toFixed(2)) : 0 };
    });

    // Restore active batsmen stats
    innings.currentBatsmen.forEach(cb => {
      const pid = cb.player?.toString();
      if (batsmanMap[pid]) {
        cb.runs = batsmanMap[pid].runs; cb.balls = batsmanMap[pid].balls;
        cb.fours = batsmanMap[pid].fours; cb.sixes = batsmanMap[pid].sixes;
      }
    });

    // Restore current bowler stats
    if (innings.currentBowler?.player) {
      const pid = innings.currentBowler.player?.toString();
      if (bowlerMap[pid]) {
        innings.currentBowler.runs = bowlerMap[pid].runs;
        innings.currentBowler.balls = bowlerMap[pid].balls;
        innings.currentBowler.overs = bowlerMap[pid].overs;
        innings.currentBowler.wickets = bowlerMap[pid].wickets;
      }
    }

    if (match.status === 'completed') match.status = 'live';
    await match.save();

    res.json(await populateMatch(Match.findById(req.params.id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Complete match & update standings ───────────────────────────────────────

router.put('/:id/complete', protect, adminOnly, async (req, res) => {
  try {
    const { winnerId, description } = req.body;
    const match = await Match.findById(req.params.id).populate('teamA teamB');
    if (!match) return res.status(404).json({ message: 'Match not found' });

    match.status = 'completed';
    match.result = { winner: winnerId, description };

    const [teamA, teamB] = await Promise.all([
      Team.findById(match.teamA._id),
      Team.findById(match.teamB._id),
    ]);

    teamA.stats.played += 1;
    teamB.stats.played += 1;

    if (winnerId?.toString() === teamA._id?.toString()) {
      teamA.stats.won += 1; teamA.stats.points += 2; teamB.stats.lost += 1;
    } else if (winnerId?.toString() === teamB._id?.toString()) {
      teamB.stats.won += 1; teamB.stats.points += 2; teamA.stats.lost += 1;
    }

    await Promise.all([teamA.save(), teamB.save(), match.save()]);
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
