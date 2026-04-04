/* ============================================================
   app.js  —  Entry point & sample question bank
   ============================================================ */

// ── Sample Question Bank ────────────────────────────────────
// Used when teacher clicks "Load Sample". Replace or extend freely.
const SAMPLE_QUESTIONS = [
  // ── Level 1 — Hard JEE Mains ──────────────────────────────
  {
    question: '[Physics] A solid cylinder of mass M and radius R rolls without slipping down an inclined plane of inclination θ. Its acceleration is:',
    optA: 'g sinθ', optB: '(2/3) g sinθ', optC: '(1/2) g sinθ', optD: '(3/4) g sinθ',
    hint1: 'Apply Newton\'s second law for translation AND rotation simultaneously.',
    hint2: 'For rolling without slipping: a = g sinθ / (1 + I/MR²). For solid cylinder, I = MR²/2.',
    hint3: 'a = g sinθ / (1 + 1/2) = (2/3) g sinθ.',
    answer: 'B', level: 1,
  },
  {
    question: '[Chemistry] For a reaction at 300 K, ΔH = −57.32 kJ/mol and ΔS = −0.1 kJ/(mol·K). The reaction is spontaneous:',
    optA: 'At all temperatures', optB: 'At no temperature', optC: 'Only below 573.2 K', optD: 'Only above 573.2 K',
    hint1: 'Spontaneity requires ΔG = ΔH − TΔS < 0.',
    hint2: 'Both ΔH and ΔS are negative. At high T, the −TΔS term (positive) dominates.',
    hint3: 'ΔG = 0 at T = ΔH/ΔS = 57320/100 = 573.2 K. Spontaneous only below this.',
    answer: 'C', level: 1,
  },
  {
    question: '[Maths] If z = (√3 + i)/2, then z⁶⁹ equals:',
    optA: 'i', optB: '−i', optC: '1', optD: '−1',
    hint1: 'Write z in polar form: z = cos(30°) + i sin(30°) = e^(iπ/6).',
    hint2: 'z⁶⁹ = e^(i×69π/6) = e^(i×23π/2). Find 23π/2 mod 2π.',
    hint3: '23π/2 = 5×2π + 3π/2, so z⁶⁹ = e^(i×3π/2) = cos(270°) + i sin(270°) = −i.',
    answer: 'B', level: 1,
  },
  {
    question: '[Chemistry] The correct order of first ionisation energy is:',
    optA: 'Na < Mg < Al < Si', optB: 'Na < Al < Mg < Si', optC: 'Mg < Na < Al < Si', optD: 'Al < Na < Mg < Si',
    hint1: 'General trend: IE increases left to right across a period.',
    hint2: 'Exception: Al (3s²3p¹) has lower IE than Mg (3s²) because the 3p electron is easier to remove.',
    hint3: 'Na < Al < Mg < Si accounts for the Mg–Al anomaly.',
    answer: 'B', level: 1,
  },
  {
    question: '[Physics] A charged particle (charge q) is placed at the centre of a hollow spherical conductor of inner radius r₁ and outer radius r₂. The electric field for r₁ < r < r₂ is:',
    optA: 'kq/r²', optB: 'kq/r₁²', optC: '0', optD: 'kq/r₂²',
    hint1: 'The region r₁ < r < r₂ is inside the conducting material itself.',
    hint2: 'Inside a conductor in electrostatic equilibrium, E = 0 everywhere.',
    hint3: 'Free charges redistribute on surfaces to cancel the internal field — E = 0.',
    answer: 'C', level: 1,
  },

  // ── Level 2 — JEE Advanced medium ────────────────────────
  {
    question: '[Maths] If A = [[1,2],[3,4]], the value of det(A² − 5A) is:',
    optA: '0', optB: '4', optC: '−4', optD: '2',
    hint1: 'Compute A² first, then subtract 5A.',
    hint2: 'A² = [[7,10],[15,22]]; 5A = [[5,10],[15,20]]; A²−5A = [[2,0],[0,2]] = 2I.',
    hint3: 'det(2I) = 2² = 4.',
    answer: 'B', level: 2,
  },
  {
    question: '[Chemistry] The complex [Co(en)₂Cl₂]⁺ exhibits:',
    optA: 'Only optical isomerism', optB: 'Only geometric isomerism', optC: 'Both geometric and optical isomerism', optD: 'Neither',
    hint1: 'en (ethylenediamine) is a bidentate chelating ligand.',
    hint2: 'The cis and trans arrangements of Cl⁻ give geometric isomers.',
    hint3: 'The cis isomer is non-superimposable on its mirror image (chiral) → also shows optical isomerism.',
    answer: 'C', level: 2,
  },
  {
    question: '[Physics] A particle in SHM has amplitude A and angular frequency ω. The ratio of KE to PE when displacement = A/2 is:',
    optA: '1/3', optB: '3', optC: '1', optD: '1/4',
    hint1: 'KE = ½mω²(A² − x²) and PE = ½mω²x².',
    hint2: 'At x = A/2: KE = ½mω²(3A²/4), PE = ½mω²(A²/4).',
    hint3: 'KE/PE = (3A²/4)/(A²/4) = 3.',
    answer: 'B', level: 2,
  },
  {
    question: '[Maths — PYQ JEE 2014] The area enclosed between y = x² and y = x + 2 is:',
    optA: '9/2', optB: '7/2', optC: '4', optD: '3',
    hint1: 'Find intersection points: x² = x + 2 → x = −1 and x = 2.',
    hint2: 'Area = ∫₋₁² (x + 2 − x²) dx.',
    hint3: '[x²/2 + 2x − x³/3]₋₁² = (2+4−8/3) − (1/2−2+1/3) = 10/3 + 7/6 = 9/2.',
    answer: 'A', level: 2,
  },
  {
    question: '[Chemistry] For the cell Mg(s)|Mg²⁺(0.001M)||Cu²⁺(0.0001M)|Cu(s), given E°cell = 2.71 V at 298 K, the cell potential is: (2.303RT/F = 0.0591)',
    optA: '2.68 V', optB: '2.74 V', optC: '2.71 V', optD: '2.65 V',
    hint1: 'Use Nernst equation: E = E° − (0.0591/n) × log Q.',
    hint2: 'n = 2; Q = [Mg²⁺]/[Cu²⁺] = 0.001/0.0001 = 10.',
    hint3: 'E = 2.71 − (0.0591/2) × log(10) = 2.71 − 0.02955 ≈ 2.68 V.',
    answer: 'A', level: 2,
  },

  // ── Level 3 — JEE Advanced Hard / PYQ ────────────────────
  {
    question: '[Physics — PYQ JEE Adv.] Two blocks (2 kg and 3 kg) connected by a spring (k = 200 N/m) on a frictionless surface. The 2 kg block is given 2 m/s towards the stationary 3 kg block. Maximum compression of the spring is:',
    optA: '0.10 m', optB: '0.15 m', optC: '0.20 m', optD: '0.30 m',
    hint1: 'At maximum compression both blocks move with the same velocity (v_cm).',
    hint2: 'v_cm = (2×2)/(2+3) = 0.8 m/s. Energy: ½×2×4 = ½×5×0.64 + ½×200×x².',
    hint3: '4 − 1.6 = 100x² → x² = 0.024 → x ≈ 0.155 m ≈ 0.15 m.',
    answer: 'B', level: 3,
  },
  {
    question: '[Maths — PYQ JEE Adv. 2012] The value of ∫₀^π [x sinx / (1 + cos²x)] dx is:',
    optA: 'π²/8', optB: 'π²/4', optC: 'π²/2', optD: 'π/4',
    hint1: 'Use King\'s property: replace x with (π−x) to get a second form of I.',
    hint2: 'Adding both forms: 2I = π ∫₀^π [sinx/(1+cos²x)] dx. Substitute t = cos x.',
    hint3: '2I = π × [arctan(t)]₋₁¹ reversed = π × π/2, so I = π²/4.',
    answer: 'B', level: 3,
  },
  {
    question: '[Chemistry — PYQ JEE Adv.] In the nuclear reaction ²³⁵₉₂U + ¹₀n → ¹⁴¹₅₆Ba + ⁹²₃₆Kr + x(¹₀n), the value of x is:',
    optA: '1', optB: '2', optC: '3', optD: '4',
    hint1: 'Apply conservation of mass number: 235 + 1 = 141 + 92 + x.',
    hint2: '236 = 233 + x.',
    hint3: 'x = 3. Also verify atomic numbers: 92 = 56 + 36 ✓.',
    answer: 'C', level: 3,
  },
  {
    question: '[Physics — PYQ JEE Adv.] A photoelectric effect experiment gives stopping potential 1.85 V for light of wavelength 300 nm and 0.82 V for 400 nm. Planck\'s constant from this data is: (e = 1.6×10⁻¹⁹ C, c = 3×10⁸ m/s)',
    optA: '6.57×10⁻³⁴ J·s', optB: '6.0×10⁻³⁴ J·s', optC: '6.63×10⁻³⁴ J·s', optD: '7.0×10⁻³⁴ J·s',
    hint1: 'eV₁ = hc/λ₁ − φ and eV₂ = hc/λ₂ − φ. Subtract to eliminate work function φ.',
    hint2: 'e(V₁−V₂) = hc(1/λ₁ − 1/λ₂). Plug in values.',
    hint3: 'h = e(1.85−0.82) / [c×(1/300nm − 1/400nm)] = 1.6×10⁻¹⁹×1.03 / (3×10⁸×8.33×10⁵) ≈ 6.57×10⁻³⁴ J·s.',
    answer: 'A', level: 3,
  },
  {
    question: '[Maths — PYQ JEE Adv.] The angle between lines with direction ratios (2, 1, 2) and (4, 8, 1) is:',
    optA: 'cos⁻¹(1/3)', optB: 'cos⁻¹(2/3)', optC: '60°', optD: 'cos⁻¹(1/9)',
    hint1: 'Use cos θ = |a₁a₂ + b₁b₂ + c₁c₂| / (|d₁| × |d₂|).',
    hint2: 'Numerator: 2×4 + 1×8 + 2×1 = 18. |d₁| = √(4+1+4) = 3, |d₂| = √(16+64+1) = 9.',
    hint3: 'cos θ = 18/(3×9) = 18/27 = 2/3 → θ = cos⁻¹(2/3).',
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
