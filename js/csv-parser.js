/* ============================================================
   csv-parser.js  —  Parses question banks from CSV or XLSX
   ============================================================

   Supports:
   - .csv  files (pure JS, no dependencies)
   - .xlsx files (uses SheetJS loaded in index.html)

   Column matching is FLEXIBLE — works with any of these:
     question / Question
     option a / Option A / optA
     hint 1 / hint-1 / Hint - 1 / hint_1
     answer / Answer
     level / Level

   answer must be A / B / C / D  (case-insensitive)
   level  must be 1 / 2 / 3      (defaults to 1 if missing)
   ============================================================ */

const CSVParser = (() => {

  function norm(str) {
    return String(str).toLowerCase().replace(/[\s\-_]+/g, '');
  }

  function mapHeader(raw) {
    const n = norm(raw);
    const MAP = {
      'question':'question',
      'optiona':'optA','opta':'optA',
      'optionb':'optB','optb':'optB',
      'optionc':'optC','optc':'optC',
      'optiond':'optD','optd':'optD',
      'hint1':'hint1','hint2':'hint2','hint3':'hint3',
      'answer':'answer','level':'level',
    };
    return MAP[n] || null;
  }

  function normaliseAnswer(raw) {
    if (!raw) return 'A';
    const match = String(raw).trim().toUpperCase().match(/[A-D]/);
    return match ? match[0] : 'A';
  }

  function rowToQuestion(rowObj) {
    const q = {};
    for (const [rawKey, value] of Object.entries(rowObj)) {
      const mapped = mapHeader(rawKey);
      if (mapped) q[mapped] = String(value || '').trim();
    }
    if (!q.question || !q.optA || !q.optB || !q.optC || !q.optD) return null;
    q.answer = normaliseAnswer(q.answer);
    const rawLevel = parseInt(q.level, 10);
    q.level  = [1, 2, 3].includes(rawLevel) ? rawLevel : 1;
    q.hint1  = q.hint1 || '';
    q.hint2  = q.hint2 || '';
    q.hint3  = q.hint3 || '';
    return q;
  }

  function splitCSVLine(line) {
    const fields = [];
    let current = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim()); current = '';
      } else { current += ch; }
    }
    fields.push(current.trim());
    return fields;
  }

  function parseCSVText(text) {
    const lines = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n')
      .split('\n').map(l=>l.trim()).filter(l=>l.length>0);
    if (lines.length < 2) return { questions:[], errors:['CSV has no data rows.'] };
    const headers = splitCSVLine(lines[0]);
    const questions=[], errors=[];
    for (let i=1; i<lines.length; i++) {
      const cols = splitCSVLine(lines[i]);
      const rowObj = {};
      headers.forEach((h,idx) => { rowObj[h] = cols[idx] || ''; });
      const q = rowToQuestion(rowObj);
      if (q) questions.push(q);
      else errors.push('Row '+(i+1)+': skipped (missing required fields).');
    }
    return { questions, errors };
  }

  function parseXLSXBuffer(arrayBuffer) {
    if (typeof XLSX === 'undefined') {
      return { questions:[], errors:['SheetJS not loaded — cannot read .xlsx files.'] };
    }
    const wb   = XLSX.read(arrayBuffer, { type:'array' });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval:'' });
    if (!rows.length) return { questions:[], errors:['Excel sheet appears empty.'] };
    const questions=[], errors=[];
    rows.forEach((row,idx) => {
      const q = rowToQuestion(row);
      if (q) questions.push(q);
      else errors.push('Row '+(idx+2)+': skipped (missing required fields).');
    });
    return { questions, errors };
  }

  function parseFile(file) {
    return new Promise((resolve, reject) => {
      const isXLSX = /\.(xlsx|xls)$/i.test(file.name);
      const reader = new FileReader();
      if (isXLSX) {
        reader.onload  = e => resolve(parseXLSXBuffer(e.target.result));
        reader.onerror = () => reject(new Error('Failed to read Excel file.'));
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload  = e => resolve(parseCSVText(e.target.result));
        reader.onerror = () => reject(new Error('Failed to read CSV file.'));
        reader.readAsText(file);
      }
    });
  }

  function parse(csvText) { return parseCSVText(csvText); }

  return { parse, parseFile };
})();
