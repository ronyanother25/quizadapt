/* ============================================================
   pdf-llm.js  —  PDF → Questions using Google Gemini AI
   ============================================================
   Sends a PDF file directly to Gemini 1.5 Flash (supports PDFs
   natively) and gets back a structured JSON array of MCQs.
   No server required — runs entirely in the browser.
   ============================================================ */

const PDFConverter = (() => {

  const MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

  const PROMPT = `You are a question extractor for a JEE / competitive exam quiz app.

Extract ALL single-correct multiple-choice questions from this PDF.
For each question return a JSON object with EXACTLY these fields:
  "question" : full question text (preserve numbers, formulas, units)
  "optA"     : text of option A — do NOT include "(A)" prefix
  "optB"     : text of option B
  "optC"     : text of option C
  "optD"     : text of option D
  "answer"   : one letter — A, B, C, or D
  "level"    : integer 1 (easy/direct recall), 2 (medium/1-2 steps), 3 (hard/multi-step)
  "hint1"    : gentle hint — the concept or approach to use
  "hint2"    : more direct hint — first step worked out
  "hint3"    : near-complete hint — almost gives the answer

SKIP these question types (they are incompatible):
  - Multi-correct (answer contains multiple letters like A,C or A,B,D)
  - Integer / numerical answer (no option choices)
  - Matrix-match / column-matching
  - Assertion-Reason with non-standard answer codes

Return ONLY a raw JSON array. No markdown, no explanation, no code fences.
Start your response with [ and end with ].`;

  async function convertPDF(file, apiKey, onRetry) {
    if (!apiKey) throw new Error('Gemini API key is required.');

    const base64 = await fileToBase64(file);

    const body = {
      contents: [{
        parts: [
          { inline_data: { mime_type: 'application/pdf', data: base64 } },
          { text: PROMPT }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    };

    const RETRY_WAIT = 65000;
    let attempt = 0;
    let res;

    while (true) {
      res = await fetch(`${MODEL_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.status !== 429) break;

      attempt++;
      if (attempt > 2) throw new Error('Rate limit persists after retries. Try again in a few minutes.');

      if (onRetry) onRetry(Math.ceil(RETRY_WAIT / 1000));
      await new Promise(r => setTimeout(r, RETRY_WAIT));
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err?.error?.message) || `HTTP ${res.status}`;
      if (res.status === 400) throw new Error('Bad request / invalid API key: ' + msg);
      if (res.status === 403) throw new Error('API key not authorised. Check your key at aistudio.google.com');
      throw new Error(msg);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[pdf-llm] Raw Gemini response:', rawText);
      throw new Error('AI returned unexpected output — see console for details.');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error('Could not parse AI response as JSON: ' + e.message);
    }

    return validate(parsed);
  }

  function validate(list) {
    const questions = [], errors = [];
    if (!Array.isArray(list)) {
      return { questions, errors: ['Response was not a JSON array.'] };
    }
    list.forEach((q, i) => {
      if (!q.question || !q.optA || !q.optB || !q.optC || !q.optD) {
        errors.push(`Item ${i + 1}: missing required fields — skipped.`);
        return;
      }
      const ans = String(q.answer || '').trim().toUpperCase().match(/[A-D]/);
      const lvl = parseInt(q.level) || 1;
      questions.push({
        question: String(q.question).trim(),
        optA:     String(q.optA).trim(),
        optB:     String(q.optB).trim(),
        optC:     String(q.optC).trim(),
        optD:     String(q.optD).trim(),
        answer:   ans ? ans[0] : 'A',
        level:    [1, 2, 3].includes(lvl) ? lvl : 1,
        hint1:    String(q.hint1 || '').trim(),
        hint2:    String(q.hint2 || '').trim(),
        hint3:    String(q.hint3 || '').trim(),
      });
    });
    return { questions, errors };
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result.split(',')[1]);
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsDataURL(file);
    });
  }

  function toCSV(questions) {
    const esc = s => '"' + String(s).replace(/"/g, '""') + '"';
    const header = 'question,optA,optB,optC,optD,hint1,hint2,hint3,answer,level';
    const rows = questions.map(q =>
      [q.question, q.optA, q.optB, q.optC, q.optD,
       q.hint1, q.hint2, q.hint3, q.answer, q.level].map(esc).join(',')
    );
    return [header, ...rows].join('\n');
  }

  function downloadCSV(questions, filename) {
    const csv  = toCSV(questions);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename || 'questions.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { convertPDF, toCSV, downloadCSV };
})();