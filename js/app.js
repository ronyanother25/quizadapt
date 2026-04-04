/* ============================================================
   app.js  —  Entry point & sample question bank
   ============================================================ */

// ── Sample Question Bank ────────────────────────────────────
// Used when teacher clicks "Load Sample". Replace or extend freely.
const SAMPLE_QUESTIONS = [
  // ── Level 1 — JEE Mains standard ─────────────────────────
  {
    question: 'A body is thrown vertically upward with velocity u. The maximum height reached is:',
    optA: 'u/g', optB: 'u²/2g', optC: '2u²/g', optD: 'u²/g',
    hint1: 'Use the kinematic equation v² = u² − 2gh, where v = 0 at max height.',
    hint2: 'At maximum height, final velocity is zero.',
    hint3: 'Rearranging: h = u²/2g.',
    answer: 'B', level: 1,
  },
  {
    question: 'The hybridisation of carbon in CO₂ is:',
    optA: 'sp³', optB: 'sp²', optC: 'sp', optD: 'sp³d',
    hint1: 'Count the number of sigma bonds and lone pairs on carbon.',
    hint2: 'CO₂ is a linear molecule.',
    hint3: 'Linear geometry corresponds to sp hybridisation.',
    answer: 'C', level: 1,
  },
  {
    question: 'If f(x) = x² − 5x + 6, the roots of f(x) = 0 are:',
    optA: '2 and 4', optB: '1 and 6', optC: '2 and 3', optD: '3 and 4',
    hint1: 'Factorise the quadratic.',
    hint2: 'Find two numbers that multiply to 6 and add to −5.',
    hint3: '(x − 2)(x − 3) = 0.',
    answer: 'C', level: 1,
  },
  {
    question: 'Which of the following has the highest electronegativity?',
    optA: 'Oxygen', optB: 'Nitrogen', optC: 'Chlorine', optD: 'Fluorine',
    hint1: 'Electronegativity increases across a period and up a group.',
    hint2: 'It is in Period 2, Group 17.',
    hint3: 'It is the most electronegative element on the Pauling scale (3.98).',
    answer: 'D', level: 1,
  },
  {
    question: 'The work done by a force F = 10 N on a body displaced by 5 m at 60° to the force is:',
    optA: '50 J', optB: '43.3 J', optC: '25 J', optD: '86.6 J',
    hint1: 'Work done W = F × d × cos θ.',
    hint2: 'cos 60° = 0.5.',
    hint3: 'W = 10 × 5 × 0.5 = 25 J.',
    answer: 'C', level: 1,
  },

  // ── Level 2 — JEE Mains/Advanced medium ──────────────────
  {
    question: 'A capacitor of capacitance C is charged to potential V. The energy stored is:',
    optA: 'CV', optB: '½CV', optC: '½CV²', optD: 'CV²',
    hint1: 'Energy stored in a capacitor involves both C and V.',
    hint2: 'The formula involves a factor of ½.',
    hint3: 'U = ½CV² — derived by integrating V dq.',
    answer: 'C', level: 2,
  },
  {
    question: 'The number of sigma (σ) bonds in benzene (C₆H₆) is:',
    optA: '6', optB: '9', optC: '12', optD: '18',
    hint1: 'Count C−H bonds and C−C bonds separately.',
    hint2: 'Each C−H bond is one σ bond (6 total); each C−C bond has one σ bond (6 total).',
    hint3: '6 (C−H) + 6 (C−C) = 12 sigma bonds.',
    answer: 'C', level: 2,
  },
  {
    question: 'If ∫₀¹ x² dx is evaluated, the result is:',
    optA: '1', optB: '1/2', optC: '1/4', optD: '1/3',
    hint1: 'Apply the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1).',
    hint2: 'Integrate to get [x³/3] and apply limits 0 to 1.',
    hint3: '(1³/3) − (0³/3) = 1/3.',
    answer: 'D', level: 2,
  },
  {
    question: 'In a common-emitter transistor amplifier, the current gain β = 100. If the base current is 40 µA, the collector current is:',
    optA: '0.4 mA', optB: '4 mA', optC: '40 mA', optD: '400 µA',
    hint1: 'Use the relation I_C = β × I_B.',
    hint2: 'β = 100, I_B = 40 µA = 40 × 10⁻⁶ A.',
    hint3: 'I_C = 100 × 40 µA = 4000 µA = 4 mA.',
    answer: 'B', level: 2,
  },
  {
    question: 'The pH of a 0.001 M HCl solution is:',
    optA: '1', optB: '2', optC: '3', optD: '4',
    hint1: 'HCl is a strong acid — fully dissociates.',
    hint2: '[H⁺] = concentration of HCl = 0.001 M = 10⁻³ M.',
    hint3: 'pH = −log[H⁺] = −log(10⁻³) = 3.',
    answer: 'C', level: 2,
  },

  // ── Level 3 — JEE Advanced standard ──────────────────────
  {
    question: 'A particle moves in a circle of radius R with constant speed v. The magnitude of its acceleration is:',
    optA: 'v²R', optB: 'v/R²', optC: 'v²/R', optD: 'vR²',
    hint1: 'This is centripetal acceleration — directed towards the centre.',
    hint2: 'It depends on the square of the speed and inversely on the radius.',
    hint3: 'a = v²/R — derived from the change in velocity vector direction.',
    answer: 'C', level: 3,
  },
  {
    question: 'For the reaction N₂ + 3H₂ ⇌ 2NH₃, if Kp = 1.6 × 10⁻⁴ atm⁻², what is the relation between Kp and Kc? (R = 0.082 L·atm/mol·K, T = 500 K)',
    optA: 'Kp = Kc(RT)²', optB: 'Kp = Kc(RT)⁻²', optC: 'Kp = Kc(RT)', optD: 'Kp = Kc',
    hint1: 'Use Kp = Kc(RT)^Δn where Δn = moles of gaseous products − reactants.',
    hint2: 'Δn = 2 − (1 + 3) = −2.',
    hint3: 'So Kp = Kc(RT)⁻².',
    answer: 'B', level: 3,
  },
  {
    question: 'The number of real solutions of the equation x² + |x| − 6 = 0 is:',
    optA: '0', optB: '1', optC: '2', optD: '4',
    hint1: 'Substitute |x| = t where t ≥ 0.',
    hint2: 't² + t − 6 = 0 → (t+3)(t−2) = 0 → t = 2 (t = −3 rejected).',
    hint3: '|x| = 2 gives x = 2 and x = −2 — two real solutions.',
    answer: 'C', level: 3,
  },
  {
    question: 'A wire of resistance R is stretched to double its length. Its new resistance is:',
    optA: 'R/2', optB: '2R', optC: 'R/4', optD: '4R',
    hint1: 'When stretched, volume remains constant so the cross-sectional area decreases.',
    hint2: 'If length doubles, area halves: A′ = A/2.',
    hint3: 'R = ρL/A → new R = ρ(2L)/(A/2) = 4ρL/A = 4R.',
    answer: 'D', level: 3,
  },
  {
    question: 'The de Broglie wavelength of an electron accelerated through a potential difference of 100 V is approximately:',
    optA: '1.23 nm', optB: '0.123 nm', optC: '12.3 nm', optD: '0.0123 nm',
    hint1: 'Use λ = h/p and kinetic energy eV = p²/2m.',
    hint2: 'λ = h/√(2meV); plug in h = 6.63×10⁻³⁴, m = 9.1×10⁻³¹, e = 1.6×10⁻¹⁹.',
    hint3: 'λ = 1.23/√V nm = 1.23/√100 = 0.123 nm.',
    answer: 'B', level: 3,
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
