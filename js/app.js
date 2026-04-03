/* ============================================================
   app.js  —  Entry point & sample question bank
   ============================================================ */

// ── Sample Question Bank ────────────────────────────────────
// Used when teacher clicks "Load Sample". Replace or extend freely.
const SAMPLE_QUESTIONS = [
  // ── Level 1 ──────────────────────────────────────────────
  {
    question: 'What is the chemical symbol for water?',
    optA: 'H₂O', optB: 'CO₂', optC: 'O₂', optD: 'HCl',
    hint1: 'It contains hydrogen.',
    hint2: 'It also contains oxygen.',
    hint3: 'Two hydrogen atoms bonded to one oxygen atom.',
    answer: 'A', level: 1,
  },
  {
    question: 'Which planet is closest to the Sun?',
    optA: 'Venus', optB: 'Earth', optC: 'Mercury', optD: 'Mars',
    hint1: 'It is in the inner solar system.',
    hint2: 'It experiences extreme surface temperatures.',
    hint3: 'Its name starts with the letter M.',
    answer: 'C', level: 1,
  },
  {
    question: 'What is 12 × 12?',
    optA: '124', optB: '144', optC: '132', optD: '148',
    hint1: 'The answer is greater than 140.',
    hint2: 'The answer is less than 150.',
    hint3: 'The two digits of the answer sum to 9.',
    answer: 'B', level: 1,
  },
  {
    question: 'What is the capital of France?',
    optA: 'Berlin', optB: 'Madrid', optC: 'Rome', optD: 'Paris',
    hint1: 'It is in Western Europe.',
    hint2: 'It is known as the City of Light.',
    hint3: 'The Eiffel Tower is located here.',
    answer: 'D', level: 1,
  },
  {
    question: 'How many sides does a hexagon have?',
    optA: '5', optB: '7', optC: '6', optD: '8',
    hint1: 'More than 5 sides.',
    hint2: 'Fewer than 7 sides.',
    hint3: 'Think of the Greek prefix "hex-".',
    answer: 'C', level: 1,
  },

  // ── Level 2 ──────────────────────────────────────────────
  {
    question: 'Who wrote Romeo and Juliet?',
    optA: 'Charles Dickens', optB: 'Jane Austen', optC: 'William Shakespeare', optD: 'Mark Twain',
    hint1: 'He lived during Elizabethan England.',
    hint2: 'He also wrote Hamlet and Macbeth.',
    hint3: 'He performed plays at the Globe Theatre.',
    answer: 'C', level: 2,
  },
  {
    question: 'What is the powerhouse of the cell?',
    optA: 'Nucleus', optB: 'Ribosome', optC: 'Golgi apparatus', optD: 'Mitochondria',
    hint1: 'It produces ATP energy.',
    hint2: 'It contains its own DNA.',
    hint3: 'It is often called the cell\'s engine.',
    answer: 'D', level: 2,
  },
  {
    question: 'What is the square root of 144?',
    optA: '11', optB: '14', optC: '12', optD: '13',
    hint1: 'It is between 10 and 15.',
    hint2: 'Think: what number multiplied by itself gives 144?',
    hint3: '12 × 12 gives this answer.',
    answer: 'C', level: 2,
  },
  {
    question: 'What gas do plants absorb during photosynthesis?',
    optA: 'Oxygen', optB: 'Nitrogen', optC: 'Carbon Dioxide', optD: 'Hydrogen',
    hint1: 'Plants need it from the air.',
    hint2: 'Humans release it when they exhale.',
    hint3: 'Its chemical formula is CO₂.',
    answer: 'C', level: 2,
  },
  {
    question: 'In which year did World War II end?',
    optA: '1943', optB: '1944', optC: '1946', optD: '1945',
    hint1: 'It was in the mid-1940s.',
    hint2: 'It ended after atomic bombs were dropped.',
    hint3: 'Japan surrendered in this year.',
    answer: 'D', level: 2,
  },

  // ── Level 3 ──────────────────────────────────────────────
  {
    question: 'What is the approximate speed of light?',
    optA: '3 × 10⁶ m/s', optB: '3 × 10⁸ m/s', optC: '3 × 10¹⁰ m/s', optD: '3 × 10⁴ m/s',
    hint1: 'It is extremely fast.',
    hint2: 'Einstein used it in E = mc².',
    hint3: 'Approximately 300 million metres per second.',
    answer: 'B', level: 3,
  },
  {
    question: 'Which element has atomic number 79?',
    optA: 'Silver', optB: 'Platinum', optC: 'Gold', optD: 'Copper',
    hint1: 'It is a precious metal.',
    hint2: 'Its chemical symbol is Au.',
    hint3: 'It has been prized in jewellery for millennia.',
    answer: 'C', level: 3,
  },
  {
    question: "What is Avogadro's number approximately?",
    optA: '6.02 × 10²²', optB: '6.02 × 10²³', optC: '6.02 × 10²⁴', optD: '6.02 × 10²¹',
    hint1: 'It is used in mole calculations in chemistry.',
    hint2: 'It was named after an Italian scientist.',
    hint3: 'Approximately 6 × 10 to the power of 23.',
    answer: 'B', level: 3,
  },
  {
    question: 'What is the derivative of sin(x)?',
    optA: '−sin(x)', optB: 'cos(x)', optC: 'tan(x)', optD: '−cos(x)',
    hint1: 'Think about the unit circle.',
    hint2: 'It is a trigonometric function.',
    hint3: 'The derivative of cos(x) is −sin(x).',
    answer: 'B', level: 3,
  },
  {
    question: 'What is the SI unit of electrical resistance?',
    optA: 'Ampere', optB: 'Volt', optC: 'Watt', optD: 'Ohm',
    hint1: 'It is named after a German physicist.',
    hint2: 'It is represented by the Greek letter omega (Ω).',
    hint3: "Ohm's law: V = I × this unit.",
    answer: 'D', level: 3,
  },
];

// ── App Controller ──────────────────────────────────────────
const App = (() => {
  let currentQuestions = null;

  function init() {
    UI.init();
  }

  /** Called by UI when a CSV is loaded or sample is chosen */
  function start(questions) {
    currentQuestions = questions;
    UI.startQuiz(questions);
  }

  /** Restart with the same question bank */
  function restart() {
    if (currentQuestions) {
      UI.startQuiz(currentQuestions);
    } else {
      UI.goToUpload();
    }
  }

  return { init, start, restart };
})();

// ── Bootstrap ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
