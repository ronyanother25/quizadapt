/* ============================================================
   quiz-engine.js  —  Core adaptive quiz logic
   ============================================================

   Responsibilities:
   - Maintain quiz state (score, level, question history)
   - Question selection (adaptive difficulty)
   - Timer management (2-minute countdown)
   - Hint cycle (popup every 20 s)
   - Scoring rules
   - Emit events so the UI layer stays fully decoupled
   ============================================================ */

const QuizEngine = (() => {

  // ── Constants ──────────────────────────────────────────────
  const QUESTION_TIME    = 120;   // seconds per question
  const HINT_INTERVAL    = 20;    // seconds between hint prompts
  const MAX_HINTS        = 3;     // total hints available
  const MAX_QUESTIONS    = 10;    // questions per session
  const POINTS_NO_HINT   = 10;
  const POINTS_HINT_1    = 8;
  const POINTS_HINT_2    = 5;
  const POINTS_HINT_3    = 2;
  const POINTS_TIMEOUT   = 0;

  // ── State ──────────────────────────────────────────────────
  let state = null;

  // ── Event Listeners ────────────────────────────────────────
  const listeners = {};

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  }

  function off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(cb => cb(data));
  }

  // ── Helpers ────────────────────────────────────────────────

  /** Returns questions filtered by level, shuffled. */
  function getPool(level) {
    const clamped = Math.max(1, Math.min(3, level));
    return state.questions
      .filter(q => q.level === clamped)
      .filter(q => !state.usedIds.has(questionId(q)));
  }

  /** Simple deterministic ID for a question object. */
  function questionId(q) {
    return q.question.slice(0, 40);
  }

  /**
   * Pick the next question.
   * If the exact level has no unused questions, fall back up then down.
   */
  function pickQuestion(level) {
    const order = [level, level + 1, level - 1, level + 2, level - 2, 1, 2, 3];
    for (const lvl of order) {
      const pool = getPool(lvl);
      if (pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        return { q: pool[idx], actualLevel: Math.max(1, Math.min(3, lvl)) };
      }
    }
    return null;   // exhausted all questions
  }

  /** Points awarded based on hints used at time of answer. */
  function calcPoints(hintsUsed) {
    if (hintsUsed === 0) return POINTS_NO_HINT;
    if (hintsUsed === 1) return POINTS_HINT_1;
    if (hintsUsed === 2) return POINTS_HINT_2;
    return POINTS_HINT_3;
  }

  // ── Timer ──────────────────────────────────────────────────

  function startTimer() {
    clearInterval(state.timerHandle);
    state.timeLeft = QUESTION_TIME;
    state.timerHandle = setInterval(tickTimer, 1000);
    emit('timerTick', { timeLeft: state.timeLeft, total: QUESTION_TIME });
  }

  function tickTimer() {
    state.timeLeft--;
    emit('timerTick', { timeLeft: state.timeLeft, total: QUESTION_TIME });
    if (state.timeLeft <= 0) {
      clearInterval(state.timerHandle);
      clearInterval(state.hintHandle);
      handleTimeout();
    }
  }

  function stopTimer() {
    clearInterval(state.timerHandle);
    clearInterval(state.hintHandle);
  }

  // ── Hint Cycle ─────────────────────────────────────────────

  function startHintCycle() {
    clearInterval(state.hintHandle);
    state.hintCycleCount = 0;
    state.hintHandle = setInterval(tickHint, 1000);
  }

  function tickHint() {
    state.hintCycleCount++;
    if (state.hintCycleCount >= HINT_INTERVAL) {
      state.hintCycleCount = 0;
      const nextHint = state.hintsShown + 1;
      if (nextHint <= MAX_HINTS && state.questionActive) {
        emit('hintPrompt', { hintNumber: nextHint });
      }
    }
  }

  // ── Core Actions ────────────────────────────────────────────

  /** Initialise engine with a parsed question array. */
  function init(questions) {
    state = {
      questions,
      usedIds:        new Set(),
      currentQ:       null,
      currentLevel:   1,
      totalScore:     0,
      answeredCount:  0,
      correctCount:   0,
      totalHintsUsed: 0,
      hintsShown:     0,
      questionActive: false,
      timeLeft:       QUESTION_TIME,
      timerHandle:    null,
      hintHandle:     null,
      hintCycleCount: 0,
    };
  }

  /** Load and present the next question. */
  function nextQuestion() {
    if (!state) throw new Error('Engine not initialised. Call init() first.');
    if (state.answeredCount >= MAX_QUESTIONS) { endQuiz(); return; }

    const result = pickQuestion(state.currentLevel);
    if (!result) { endQuiz(); return; }   // all questions exhausted

    const { q, actualLevel } = result;
    state.currentQ      = q;
    state.currentLevel  = actualLevel;
    state.hintsShown    = 0;
    state.questionActive = true;
    state.answeredCount++;
    state.usedIds.add(questionId(q));

    emit('questionLoaded', {
      question:      q,
      level:         actualLevel,
      questionNum:   state.answeredCount,
      totalQ:        Math.min(state.questions.length, MAX_QUESTIONS),
      score:         state.totalScore,
    });

    startTimer();
    startHintCycle();
  }

  /**
   * Called by UI when the student selects an answer.
   * @param {string} chosen  'A' | 'B' | 'C' | 'D'
   */
  function submitAnswer(chosen) {
    if (!state || !state.questionActive) return;
    state.questionActive = false;
    stopTimer();

    const correct    = state.currentQ.answer;
    const isCorrect  = chosen.toUpperCase() === correct;
    const pts        = isCorrect ? calcPoints(state.hintsShown) : 0;

    state.totalScore += pts;
    if (isCorrect) {
      state.correctCount++;
      state.currentLevel = Math.min(3, state.currentLevel + 1);
    } else {
      state.currentLevel = Math.max(1, state.currentLevel - 1);
    }

    emit('answerResult', {
      chosen,
      correct,
      isCorrect,
      points:        pts,
      hintsUsed:     state.hintsShown,
      totalScore:    state.totalScore,
      nextLevel:     state.currentLevel,
    });
  }

  /**
   * Called by UI when the student accepts a hint.
   * @param {number} hintNumber  1 | 2 | 3
   */
  function acceptHint(hintNumber) {
    if (!state || !state.questionActive) return;
    if (hintNumber > MAX_HINTS) return;

    state.hintsShown    = hintNumber;
    state.totalHintsUsed++;

    // Build the list of all hints shown so far
    const hintsRevealed = [];
    for (let i = 1; i <= hintNumber; i++) {
      const text = state.currentQ[`hint${i}`];
      if (text) hintsRevealed.push({ number: i, text });
    }

    emit('hintsUpdated', { hintsRevealed });
  }

  /** Called when timer expires before student answers. */
  function handleTimeout() {
    if (!state || !state.questionActive) return;
    state.questionActive = false;
    state.currentLevel = Math.max(1, state.currentLevel - 1);

    emit('timeout', {
      correct:     state.currentQ.answer,
      totalScore:  state.totalScore,
      nextLevel:   state.currentLevel,
    });
  }

  function endQuiz() {
    stopTimer();
    const accuracy = state.answeredCount > 0
      ? Math.round((state.correctCount / state.answeredCount) * 100)
      : 0;

    emit('quizEnded', {
      totalScore:     state.totalScore,
      answeredCount:  state.answeredCount,
      correctCount:   state.correctCount,
      accuracy,
      totalHintsUsed: state.totalHintsUsed,
      finalLevel:     state.currentLevel,
      maxPossible:    state.answeredCount * POINTS_NO_HINT,
    });
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    init,
    nextQuestion,
    submitAnswer,
    acceptHint,

    // Expose quit so UI can end the quiz early and show results
    quit: endQuiz,

    // Event system
    on,
    off,

    // Expose constants for UI use
    CONSTANTS: {
      QUESTION_TIME,
      HINT_INTERVAL,
      MAX_HINTS,
      MAX_QUESTIONS,
      POINTS_NO_HINT,
      POINTS_HINT_1,
      POINTS_HINT_2,
      POINTS_HINT_3,
    },
  };
})();
