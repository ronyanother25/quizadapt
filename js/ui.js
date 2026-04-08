/* ============================================================
   ui.js  —  UI Controller
   ============================================================

   Listens to QuizEngine events and updates the DOM.
   Delegates all game logic decisions to QuizEngine.
   ============================================================ */

const UI = (() => {

  // ── DOM References ─────────────────────────────────────────
  const $ = id => document.getElementById(id);

  const screens = {
    upload:   $('screen-upload'),
    question: $('screen-question'),
    results:  $('screen-results'),
  };

  // ── Screen Management ──────────────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ── Toast / Status ─────────────────────────────────────────
  function showStatus(msg, type = 'info') {
    const el = $('csv-status');
    const colours = {
      success: 'rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#6EE7B7',
      error:   'rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#FCA5A5',
      info:    'rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);color:#93C5FD',
    };
    el.style.display = 'block';
    el.innerHTML = `<div style="padding:12px 16px;border-radius:10px;font-size:14px;font-weight:500;background:${colours[type] || colours.info}">${msg}</div>`;
  }

  // ── Modal ──────────────────────────────────────────────────
  function showModal(html) {
    const container = $('modal-container');
    container.innerHTML = `
      <div class="modal-overlay anim-pop" id="active-modal">
        <div class="modal">${html}</div>
      </div>`;
  }

  function closeModal() {
    $('modal-container').innerHTML = '';
  }

  // ── Upload Screen ──────────────────────────────────────────
  function initUploadScreen() {
    const dropZone  = $('drop-zone');
    const fileInput = $('csv-input');

    // File picker click
    dropZone.addEventListener('click', () => fileInput.click());

    // File chosen via picker
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });

    // Drag & drop
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        handleFile(file);
      } else {
        showStatus('Please drop a .csv or .xlsx file.', 'error');
      }
    });

    $('btn-load-sample').addEventListener('click', loadSample);
  }

  async function handleFile(file) {
    showStatus('Reading file…', 'info');
    try {
      const { questions, errors } = await CSVParser.parseFile(file);
      if (errors.length) {
        console.warn('CSV parse warnings:', errors);
      }
      if (questions.length === 0) {
        showStatus('No valid questions found. Check the CSV format.', 'error');
        return;
      }
      showStatus(`✓ Loaded ${questions.length} question${questions.length > 1 ? 's' : ''} successfully!`, 'success');
      setTimeout(() => App.start(questions), 900);
    } catch (err) {
      showStatus('Error reading file: ' + err.message, 'error');
    }
  }

  function loadSample() {
    App.start(SAMPLE_QUESTIONS);
  }

  // ── Question Screen ────────────────────────────────────────

  function renderQuestion(data) {
    const { question, level, questionNum, totalQ } = data;
    const q = question;

    // Animate card in
    const card = $('question-card');
    card.classList.remove('anim-slide-up');
    void card.offsetWidth;
    card.classList.add('anim-slide-up');

    // Meta
    $('q-num').textContent  = questionNum;
    $('q-total').textContent = totalQ;

    // Level badge
    const levelBadge  = $('q-level-badge');
    const badgeClasses = ['badge-blue', 'badge-purple', 'badge-gold'];
    levelBadge.className = 'badge ' + badgeClasses[level - 1];
    levelBadge.textContent = 'Level ' + level;

    // Level pips
    const pips = $('level-pips');
    pips.innerHTML = [1, 2, 3]
      .map(i => `<div class="pip ${i <= level ? 'active' : 'inactive'}"></div>`)
      .join('');

    // Progress bar
    $('q-progress').style.width = ((questionNum / totalQ) * 100) + '%';

    // Score
    $('q-score-display').textContent = data.score;

    // Question text
    $('q-text').textContent = q.question;

    // Options
    const labels = ['A', 'B', 'C', 'D'];
    const values = [q.optA, q.optB, q.optC, q.optD];
    const ol = $('options-list');
    ol.innerHTML = labels.map((lbl, i) => `
      <button class="option-btn" data-opt="${lbl}" onclick="UI.onOptionClick('${lbl}', this)">
        <div class="option-label">${lbl}</div>
        <span>${escapeHtml(values[i])}</span>
      </button>`).join('');

    // Clear hints + feedback
    $('hints-area').innerHTML  = '';
    $('feedback-area').innerHTML = '';

    // Reset timer ring
    updateTimerRing(QuizEngine.CONSTANTS.QUESTION_TIME, QuizEngine.CONSTANTS.QUESTION_TIME);
  }

  function onOptionClick(opt, btnEl) {
    // Prevent double-clicks
    if (btnEl.classList.contains('disabled')) return;
    // Disable all options immediately
    document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));
    btnEl.classList.add('selected');
    QuizEngine.submitAnswer(opt);
  }

  function markOptions(correct, chosen) {
    document.querySelectorAll('.option-btn').forEach(btn => {
      const opt = btn.dataset.opt;
      btn.classList.add('disabled');
      if (opt === correct) {
        btn.classList.add('correct');
        btn.querySelector('.option-label').style.background = 'var(--emerald)';
        btn.querySelector('.option-label').style.color = '#fff';
      } else if (opt === chosen && opt !== correct) {
        btn.classList.add('wrong');
        btn.querySelector('.option-label').style.background = 'var(--red)';
        btn.querySelector('.option-label').style.color = '#fff';
      }
    });
  }

  // ── Timer UI ───────────────────────────────────────────────
  const CIRC = 2 * Math.PI * 28;   // circumference for r=28

  function updateTimerRing(timeLeft, total) {
    const pct  = timeLeft / total;
    const arc  = $('timer-arc');
    const txt  = $('timer-label');

    arc.style.strokeDashoffset = (1 - pct) * CIRC;
    arc.style.stroke = pct > 0.5 ? 'var(--accent2)'
                     : pct > 0.25 ? 'var(--gold)'
                     : 'var(--red)';

    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    txt.textContent  = `${m}:${s < 10 ? '0' : ''}${s}`;
    txt.style.color  = timeLeft <= 10 ? 'var(--red)' : 'var(--text)';
  }

  // ── Text-to-Speech ─────────────────────────────────────────
  let _lastSpokenHintCount = 0;

  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 0.92;
    utter.pitch = 1;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  }

  function stopSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  // ── Hints UI ───────────────────────────────────────────────
  function renderHints(hintsRevealed) {
    const area = $('hints-area');
    area.innerHTML = hintsRevealed.map(h => `
      <div class="hint-box anim-pop">
        <div class="hint-number">${h.number}</div>
        <p class="hint-text">${escapeHtml(h.text)}</p>
      </div>`).join('');

    // Speak only the newest hint (avoid re-reading previous ones)
    if (hintsRevealed.length > _lastSpokenHintCount) {
      const newest = hintsRevealed[hintsRevealed.length - 1];
      speakText('Hint ' + newest.number + '. ' + newest.text);
      _lastSpokenHintCount = hintsRevealed.length;
    }
  }

  // ── Hint Prompt Modal ──────────────────────────────────────
  function showHintPrompt(hintNumber) {
    const pointsMap = { 1: 8, 2: 5, 3: 2 };
    const pts = pointsMap[hintNumber] || 2;
    showModal(`
      <div class="modal-icon">💡</div>
      <h3>Need a hint?</h3>
      <p>Hint ${hintNumber} is available.<br>Using it reduces your maximum score to <strong style="color:var(--text)">${pts} points</strong>.</p>
      <div class="modal-btns">
        <button class="btn btn-primary" onclick="UI.onAcceptHint(${hintNumber})">Yes, show hint ${hintNumber}</button>
        <button class="btn btn-secondary" onclick="UI.onDeclineHint()">No thanks</button>
      </div>`);
  }

  function onAcceptHint(hintNumber) {
    closeModal();
    QuizEngine.acceptHint(hintNumber);
  }

  function onDeclineHint() {
    closeModal();
  }

  // ── Feedback ───────────────────────────────────────────────
  function showFeedback({ isCorrect, points, hintsUsed, correct, timeout }) {
    const area = $('feedback-area');
    let html = '';

    if (timeout) {
      const correctText = getOptionText(correct);
      html = `
        <div class="feedback-box timeout-fb anim-pop">
          <span class="feedback-icon">⏰</span>
          <div>
            <p class="feedback-title" style="color:var(--gold)">Time's up! 0 points</p>
            <p class="feedback-sub">Correct answer: <strong style="color:var(--text)">${correct}. ${escapeHtml(correctText)}</strong></p>
          </div>
        </div>`;
    } else if (isCorrect) {
      const hintNote = hintsUsed === 0
        ? 'Perfect — no hints needed!'
        : `You used ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''}. No hints would earn 10 pts.`;
      html = `
        <div class="feedback-box correct-fb anim-pop">
          <span class="feedback-icon">✅</span>
          <div>
            <p class="feedback-title" style="color:var(--emerald)">Correct! +${points} points</p>
            <p class="feedback-sub">${hintNote}</p>
          </div>
        </div>`;
    } else {
      const correctText = getOptionText(correct);
      html = `
        <div class="feedback-box wrong-fb anim-pop">
          <span class="feedback-icon">❌</span>
          <div>
            <p class="feedback-title" style="color:var(--red)">Incorrect — 0 points</p>
            <p class="feedback-sub">Correct answer: <strong style="color:var(--text)">${correct}. ${escapeHtml(correctText)}</strong></p>
          </div>
        </div>`;
    }

    area.innerHTML = html;
  }

  /** Look up the text of option A/B/C/D from the current rendered DOM */
  function getOptionText(letter) {
    const btn = document.querySelector(`.option-btn[data-opt="${letter}"]`);
    return btn ? btn.querySelector('span').textContent : '';
  }

  // ── Results Screen ─────────────────────────────────────────
  function renderResults(data) {
    const { totalScore, answeredCount, correctCount, accuracy, totalHintsUsed, finalLevel, maxPossible } = data;

    $('final-score-big').textContent = totalScore;
    $('stat-questions').textContent  = answeredCount;
    $('stat-correct').textContent    = correctCount;
    $('stat-accuracy').textContent   = accuracy + '%';
    $('stat-hints').textContent      = totalHintsUsed;

    const sl = $('stat-level');
    const lvlClasses = ['badge-blue', 'badge-purple', 'badge-gold'];
    sl.className = 'badge ' + lvlClasses[Math.min(finalLevel, 3) - 1];
    sl.textContent = 'Level ' + finalLevel;

    // Animate score ring
    const arc = $('result-arc');
    const CIRC_R = 2 * Math.PI * 60;   // r=60
    const pct = maxPossible > 0 ? totalScore / maxPossible : 0;
    setTimeout(() => {
      arc.style.strokeDashoffset = (1 - pct) * CIRC_R;
    }, 200);

    // Message
    const msgs = [
      { emoji: '🔥', title: 'Outstanding!',  sub: 'You are on fire!' },
      { emoji: '⭐', title: 'Great work!',   sub: 'Keep pushing for perfection!' },
      { emoji: '👍', title: 'Good effort!',  sub: 'Practice makes perfect.' },
      { emoji: '💪', title: 'Keep going!',   sub: 'Every attempt makes you stronger!' },
    ];
    const m = pct >= 0.9 ? msgs[0] : pct >= 0.7 ? msgs[1] : pct >= 0.5 ? msgs[2] : msgs[3];
    $('result-emoji').textContent   = m.emoji;
    $('result-title').textContent   = m.title;
    $('result-sub').textContent     = m.sub;

    showScreen('results');
  }

  // ── Utility ────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Wire up QuizEngine events ──────────────────────────────
  function bindEngineEvents() {
    QuizEngine.on('questionLoaded', data => {
      stopSpeech();
      _lastSpokenHintCount = 0;
      showScreen('question');
      renderQuestion(data);
    });

    QuizEngine.on('timerTick', ({ timeLeft, total }) => {
      updateTimerRing(timeLeft, total);
    });

    QuizEngine.on('hintPrompt', ({ hintNumber }) => {
      showHintPrompt(hintNumber);
    });

    QuizEngine.on('hintsUpdated', ({ hintsRevealed }) => {
      renderHints(hintsRevealed);
    });

    QuizEngine.on('answerResult', data => {
      $('q-score-display').textContent = data.totalScore;
      markOptions(data.correct, data.chosen);
      showFeedback({
        isCorrect: data.isCorrect,
        points:    data.points,
        hintsUsed: data.hintsUsed,
        correct:   data.correct,
      });
      setTimeout(() => QuizEngine.nextQuestion(), 2600);
    });

    QuizEngine.on('timeout', data => {
      markOptions(data.correct, null);
      showFeedback({ timeout: true, correct: data.correct });
      setTimeout(() => QuizEngine.nextQuestion(), 2600);
    });

    QuizEngine.on('quizEnded', data => {
      renderResults(data);
    });
  }

  // ── Start / Restart ────────────────────────────────────────
  function startQuiz(questions) {
    QuizEngine.init(questions);
    showScreen('question');
    QuizEngine.nextQuestion();
  }

  function restartQuiz() {
    // Re-initialise with same question bank (app.js holds the reference)
    App.restart();
  }

  function goToUpload() {
    // Reset file input so same file can be re-selected
    const fi = $('csv-input');
    if (fi) fi.value = '';
    $('csv-status').style.display = 'none';
    showScreen('upload');
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    bindEngineEvents();
    initUploadScreen();
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    init,
    startQuiz,
    restartQuiz,
    goToUpload,
    // Called from inline HTML onclick
    onOptionClick,
    onAcceptHint,
    onDeclineHint,
  };
})();
