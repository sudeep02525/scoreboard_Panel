/**
 * Cricket Scoring Engine
 * Pure functions — no DB access, no Express dependencies.
 * All scoring logic lives here and is imported by the matches route.
 */

export const BALLS_PER_OVER = 6;

// ─── Delivery classification ──────────────────────────────────────────────────

export function classifyDelivery(extras) {
  const isWide     = extras === 'wd';
  const isNoBall   = extras === 'nb' || (typeof extras === 'string' && extras.startsWith('nb-'));
  const isOverthrow = typeof extras === 'string' && extras.startsWith('ot');
  const isBye      = extras === 'b';
  const isLegBye   = extras === 'lb';
  const isLegalBall = !isWide && !isNoBall;
  return { isWide, isNoBall, isOverthrow, isBye, isLegBye, isLegalBall };
}

// ─── Run accounting ───────────────────────────────────────────────────────────

/**
 * Calculate all run components for a single delivery.
 * Returns { penaltyRun, batsmanRuns, extraRunsVal, totalRunsThisBall }
 */
export function calcDeliveryRuns(runs, extraRuns, delivery) {
  const { isWide, isNoBall, isOverthrow, isBye, isLegBye } = delivery;
  const penaltyRun   = (isWide || isNoBall) ? 1 : 0;
  const batsmanRuns  = (!isWide && !isBye && !isLegBye && !isOverthrow) ? (runs || 0) : 0;
  const extraRunsVal = isOverthrow ? (extraRuns || 0) : (isWide || isNoBall) ? (runs || 0) : 0;
  const totalRunsThisBall =
    penaltyRun + batsmanRuns + extraRunsVal + (isBye || isLegBye ? (runs || 0) : 0);
  return { penaltyRun, batsmanRuns, extraRunsVal, totalRunsThisBall };
}

// ─── Strike rotation ──────────────────────────────────────────────────────────

/**
 * Determine whether strike should swap after this delivery.
 * Called BEFORE incrementing innings.balls.
 */
export function shouldSwapStrike(delivery, batsmanRuns, runs, currentBalls, isWicket) {
  if (isWicket) return false;
  const { isWide, isNoBall, isLegalBall, isBye, isLegBye } = delivery;

  let swap = false;

  if (isLegalBall) {
    const runsForRotation = batsmanRuns + (isBye || isLegBye ? (runs || 0) : 0);
    if (runsForRotation % 2 === 1) swap = true;
  } else if (isWide || isNoBall) {
    if (batsmanRuns % 2 === 1) swap = true;
  }

  // End-of-over: if this legal ball completes the over, toggle swap
  if (isLegalBall) {
    const ballsAfter = currentBalls + 1;
    if (ballsAfter % BALLS_PER_OVER === 0 && ballsAfter > 0) swap = !swap;
  }

  return swap;
}

// ─── Innings helpers ──────────────────────────────────────────────────────────

/** Build a blank innings object */
export function blankInnings(teamId) {
  return {
    team: teamId,
    runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0,
    currentBatsmen: [],
    currentBowler: { player: null, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 },
    ballByBall: [], partnerships: [], fallOfWickets: [], batting: [], bowling: [],
  };
}

/** Persist a batsman's live stats into the permanent batting[] array */
export function syncBatsmanToArray(innings, batsmanDoc) {
  if (!batsmanDoc?.player) return;
  const pid = batsmanDoc.player?.toString();
  const idx = innings.batting.findIndex(b => b.player?.toString() === pid);
  const entry = {
    player: batsmanDoc.player,
    runs: batsmanDoc.runs,
    balls: batsmanDoc.balls,
    fours: batsmanDoc.fours,
    sixes: batsmanDoc.sixes,
    strikeRate: batsmanDoc.balls > 0
      ? parseFloat(((batsmanDoc.runs / batsmanDoc.balls) * 100).toFixed(2))
      : 0,
    status: batsmanDoc.status || 'batting',
    dismissal: batsmanDoc.dismissal || '',
  };
  if (idx >= 0) innings.batting[idx] = entry;
  else innings.batting.push(entry);
}

/** Persist a bowler's live stats into the permanent bowling[] array, computing economy */
export function syncBowlerToArray(innings, bowlerDoc) {
  if (!bowlerDoc?.player) return;
  const pid = bowlerDoc.player?.toString();
  const idx = innings.bowling.findIndex(b => b.player?.toString() === pid);
  const totalBalls = bowlerDoc.overs * 6 + bowlerDoc.balls;
  const economy = totalBalls > 0
    ? parseFloat(((bowlerDoc.runs / totalBalls) * 6).toFixed(2))
    : 0;
  const entry = {
    player: bowlerDoc.player,
    overs: bowlerDoc.overs,
    balls: bowlerDoc.balls,
    runs: bowlerDoc.runs,
    wickets: bowlerDoc.wickets,
    maidens: bowlerDoc.maidens || 0,
    economy,
  };
  if (idx >= 0) innings.bowling[idx] = entry;
  else innings.bowling.push(entry);
}

// ─── Full replay (used by undo) ───────────────────────────────────────────────

/**
 * Replay all balls in ballByBall from scratch.
 * Returns { runs, wickets, overs, balls, extras, fallOfWickets, batsmanMap, bowlerMap }
 */
export function replayInnings(ballByBall) {
  let runs = 0, wickets = 0, overs = 0, balls = 0, extras = 0;
  const fallOfWickets = [];
  const batsmanMap = {};
  const bowlerMap  = {};

  for (const ball of ballByBall) {
    const d = classifyDelivery(ball.extras);

    runs += ball.runs || 0;
    if (d.isWide || d.isNoBall) extras += ball.runs || 0;
    else if (d.isBye || d.isLegBye) extras += ball.runs || 0;

    if (ball.isWicket) {
      wickets += 1;
      fallOfWickets.push({
        runs,
        wicket: wickets,
        player: ball.batsman,
        over: parseFloat(`${overs}.${balls}`),
      });
    }

    if (d.isLegalBall) {
      balls += 1;
      if (balls === BALLS_PER_OVER) { overs += 1; balls = 0; }
    }

    // Batsman map
    const bid = ball.batsman?.toString();
    if (bid) {
      if (!batsmanMap[bid]) {
        batsmanMap[bid] = { player: ball.batsman, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'batting', dismissal: '' };
      }
      if (d.isLegalBall && !d.isBye && !d.isLegBye) {
        batsmanMap[bid].balls += 1;
        batsmanMap[bid].runs  += ball.runs || 0;
        if (ball.runs === 4) batsmanMap[bid].fours += 1;
        if (ball.runs === 6) batsmanMap[bid].sixes += 1;
      } else if (d.isLegalBall) {
        batsmanMap[bid].balls += 1;
      }
      if (ball.isWicket) {
        batsmanMap[bid].status   = 'out';
        batsmanMap[bid].dismissal = ball.dismissalType || '';
      }
    }

    // Bowler map
    const bwid = ball.bowler?.toString();
    if (bwid) {
      if (!bowlerMap[bwid]) {
        bowlerMap[bwid] = { player: ball.bowler, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0 };
      }
      bowlerMap[bwid].runs += ball.runs || 0;
      if (d.isLegalBall) {
        bowlerMap[bwid].balls += 1;
        if (bowlerMap[bwid].balls === BALLS_PER_OVER) {
          bowlerMap[bwid].overs += 1;
          bowlerMap[bwid].balls  = 0;
        }
      }
      if (ball.isWicket && ball.dismissalType !== 'run out') bowlerMap[bwid].wickets += 1;
    }
  }

  return { runs, wickets, overs, balls, extras, fallOfWickets, batsmanMap, bowlerMap };
}

// ─── Match result determination ───────────────────────────────────────────────

/**
 * Determine match result for 2nd innings.
 * Returns { status, winner, description } or null if match not yet decided.
 */
export function determineResult(innings2, innings1Runs, teamA, teamB, inningsComplete) {
  const target = innings1Runs + 1;

  if (innings2.runs >= target) {
    return {
      status: 'completed',
      winner: teamB,
      description: `Won by ${10 - innings2.wickets} wicket${10 - innings2.wickets !== 1 ? 's' : ''}`,
    };
  }

  if (inningsComplete) {
    if (innings2.runs < innings1Runs) {
      return {
        status: 'completed',
        winner: teamA,
        description: `Won by ${innings1Runs - innings2.runs} run${innings1Runs - innings2.runs !== 1 ? 's' : ''}`,
      };
    }
    return { status: 'completed', winner: null, description: 'Match Tied' };
  }

  return null;
}
