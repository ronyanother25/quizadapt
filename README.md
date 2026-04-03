# QuizAdapt — Adaptive Question Solver

A fully client-side adaptive quiz app for students.  
No server, no database, no dependencies — just open `index.html` in a browser.

---

## Project Structure

```
quizadapt/
├── index.html          ← Entry point (open this)
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── csv-parser.js   ← CSV parsing utility
│   ├── quiz-engine.js  ← All game logic (timer, hints, scoring, adaptive level)
│   ├── ui.js           ← DOM controller (renders everything, handles clicks)
│   └── app.js          ← Bootstrap + sample question bank
└── data/
    └── questions.csv   ← Sample question bank (use as template)
```

---

## How to Run

1. Download / unzip the project folder.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. Either:
   - Upload your own `.csv` file, **or**
   - Click **Load Sample Question Bank** to test immediately.

> No installation, no npm, no build step required.

---

## CSV Format

The question bank is a plain CSV file with a **header row** followed by one question per row.

### Column Order (exact)

| # | Column     | Description                          |
|---|------------|--------------------------------------|
| 1 | question   | Full question text                   |
| 2 | option A   | Text for option A                    |
| 3 | option B   | Text for option B                    |
| 4 | option C   | Text for option C                    |
| 5 | option D   | Text for option D                    |
| 6 | hint 1     | First hint (shown after 20 s)        |
| 7 | hint 2     | Second hint (shown after 40 s)       |
| 8 | hint 3     | Third hint (shown after 60 s)        |
| 9 | answer     | Correct option: `A`, `B`, `C`, or `D`|
|10 | level      | Difficulty: `1`, `2`, or `3`         |

### Example Row
```
What is the chemical symbol for water?,H2O,CO2,O2,HCl,It contains hydrogen,It also contains oxygen,Two hydrogen atoms bonded to one oxygen,A,1
```

### Notes
- The header row is required (it is skipped during parsing).
- Fields containing commas should be wrapped in double quotes: `"option, with comma"`.
- If `level` is missing or invalid, it defaults to `1`.
- If `answer` is anything other than A/B/C/D, it defaults to `A`.

---

## Game Rules

### Timer
- Each question has a **2-minute (120 second)** countdown.
- Timer ring turns **gold** at 50% remaining, **red** at 25%.
- If time runs out → **0 points**, level decreases by 1.

### Hint System
- Every **20 seconds**, a popup asks: *"Do you want a hint?"*
- Student can accept or decline.
- If declined, the popup reappears 20 seconds later for the next hint.
- Up to **3 hints** are available per question.
- Once a hint is accepted, all previous hints are also shown.

### Scoring
| Condition              | Points |
|------------------------|--------|
| Correct, no hints      | 10     |
| Correct, after hint 1  | 8      |
| Correct, after hint 2  | 5      |
| Correct, after hint 3  | 2      |
| Wrong / timed out      | 0      |

### Adaptive Difficulty
| Outcome   | Level change       |
|-----------|--------------------|
| Correct   | Level + 1 (max 3)  |
| Wrong     | Level − 1 (min 1)  |
| Timeout   | Level − 1 (min 1)  |

---

## Customisation Guide

### Change the number of questions per session
In `js/quiz-engine.js`, line:
```js
const MAX_QUESTIONS = 10;
```
Change `10` to any number you want.

### Change question time limit
In `js/quiz-engine.js`:
```js
const QUESTION_TIME = 120;   // seconds
```

### Change hint interval
In `js/quiz-engine.js`:
```js
const HINT_INTERVAL = 20;    // seconds between hint prompts
```

### Change scoring values
In `js/quiz-engine.js`:
```js
const POINTS_NO_HINT = 10;
const POINTS_HINT_1  = 8;
const POINTS_HINT_2  = 5;
const POINTS_HINT_3  = 2;
```

### Change colours / theme
All CSS custom properties are in `css/style.css` under `:root { … }`.  
Key variables:
- `--accent` / `--accent2` — primary purple tones
- `--gold`    — timer warning / score display
- `--emerald` — correct answers
- `--red`     — wrong answers / time-up

### Add more levels (beyond 3)
1. Update `quiz-engine.js`: change `Math.min(3, ...)` and `Math.max(1, ...)` guards to your new max.
2. Update level badge logic in `ui.js` (`badgeClasses` array).
3. Add questions with the new level number to your CSV.

---

## File Responsibilities (for developers)

| File              | What it does                                                  |
|-------------------|---------------------------------------------------------------|
| `csv-parser.js`   | Parses CSV text → array of question objects. No DOM access.   |
| `quiz-engine.js`  | Pure game logic: timer, hints, scoring, level, events. No DOM.|
| `ui.js`           | Reads engine events, updates DOM. No game logic.              |
| `app.js`          | Wires everything together. Holds sample question bank.        |
| `style.css`       | All visual styles. No logic.                                  |
| `index.html`      | HTML skeleton. No inline scripts.                             |

The engine and UI are fully decoupled — you can swap the UI layer without touching game logic.

---

## Browser Compatibility

Works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

No Internet connection required (fonts load from Google Fonts — app still works offline, just with fallback fonts).

---

## License
Free to use and modify for educational purposes.
