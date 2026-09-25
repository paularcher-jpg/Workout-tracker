// Reads a plan out of an Excel .xlsx file, with no library.
//
// An .xlsx is a zip of XML. The browser already has everything needed to open
// one — DecompressionStream for the zip entries and DOMParser for the XML — so
// this stays a few hundred lines instead of a megabyte of spreadsheet library.
// The result is CSV text, handed to the same parser a pasted plan uses.

const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

/* -------------------------------------------------------------------- zip */

async function inflateRaw(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function openZip(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  // the central directory's end record sits in the last 22 bytes plus any comment
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error('That file is not an .xlsx spreadsheet.');

  const entries = new Map();
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const decoder = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (view.getUint32(at, true) !== 0x02014b50) throw new Error('That spreadsheet looks damaged.');
    const nameLen = view.getUint16(at + 28, true);
    const extraLen = view.getUint16(at + 30, true);
    const commentLen = view.getUint16(at + 32, true);
    entries.set(decoder.decode(bytes.subarray(at + 46, at + 46 + nameLen)), {
      method: view.getUint16(at + 10, true),
      // sizes come from the central directory: a local header written with a
      // data descriptor carries zeros here instead
      size: view.getUint32(at + 20, true),
      offset: view.getUint32(at + 42, true),
    });
    at += 46 + nameLen + extraLen + commentLen;
  }
  return { bytes, view, entries };
}

async function readText(zip, path) {
  const entry = zip.entries.get(path.replace(/^\//, ''));
  if (!entry) return null;
  const { view, bytes } = zip;
  const start = entry.offset + 30 + view.getUint16(entry.offset + 26, true) + view.getUint16(entry.offset + 28, true);
  const data = bytes.subarray(start, start + entry.size);
  let raw;
  if (entry.method === 0) raw = data;
  else if (entry.method === 8) raw = await inflateRaw(data);
  else throw new Error('That spreadsheet uses a compression this app cannot read. Save it as CSV instead.');
  return new TextDecoder().decode(raw);
}

/* -------------------------------------------------------------------- xml */

const xml = (text) => new DOMParser().parseFromString(text, 'application/xml');
// match on local name so a prefixed writer (x:c, x:row) reads the same
const all = (node, name) => [...node.getElementsByTagNameNS('*', name)];

function relId(el) {
  return el.getAttributeNS(NS_REL, 'id')
    || [...el.attributes].find((a) => a.localName === 'id' && a.prefix)?.value
    || null;
}

/** "B12" -> 1 (zero-based column). */
function columnOf(ref) {
  const letters = String(ref).match(/^[A-Z]+/i)?.[0].toUpperCase() || 'A';
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Text of a shared or inline string, joining rich-text runs, skipping phonetic hints. */
function stringText(node) {
  return all(node, 't')
    .filter((t) => !t.parentNode || t.parentNode.localName !== 'rPh')
    .map((t) => t.textContent)
    .join('');
}

function cellValue(c, shared) {
  const type = c.getAttribute('t');
  const v = all(c, 'v')[0]?.textContent ?? '';
  if (type === 's') return shared[Number(v)] ?? '';
  if (type === 'inlineStr') return stringText(all(c, 'is')[0] || c);
  if (type === 'b') return v === '1' ? 'TRUE' : 'FALSE';
  return v;   // n, str (a formula's text result), d, e — all as written
}

/* ------------------------------------------------------------------ sheets */

/** Every sheet as rows of strings, in workbook order. */
export async function readWorkbook(buffer) {
  const zip = openZip(buffer);
  const workbook = await readText(zip, 'xl/workbook.xml');
  if (!workbook) throw new Error('That file is not an .xlsx spreadsheet.');

  const rels = new Map();
  const relsText = await readText(zip, 'xl/_rels/workbook.xml.rels');
  if (relsText) {
    for (const r of all(xml(relsText), 'Relationship')) {
      const target = r.getAttribute('Target') || '';
      rels.set(r.getAttribute('Id'), target.startsWith('/') ? target.slice(1) : `xl/${target}`);
    }
  }

  const sharedText = await readText(zip, 'xl/sharedStrings.xml');
  const shared = sharedText ? all(xml(sharedText), 'si').map(stringText) : [];

  const sheets = [];
  for (const [i, sheet] of all(xml(workbook), 'sheet').entries()) {
    const path = rels.get(relId(sheet)) || `xl/worksheets/sheet${i + 1}.xml`;
    const text = await readText(zip, path);
    if (!text) continue;
    const rows = [];
    for (const row of all(xml(text), 'row')) {
      const values = [];
      for (const c of all(row, 'c')) {
        values[columnOf(c.getAttribute('r'))] = cellValue(c, shared);
      }
      const filled = Array.from(values, (v) => (v == null ? '' : String(v)));
      if (filled.some((v) => v.trim() !== '')) rows.push(filled);
    }
    sheets.push({ name: sheet.getAttribute('name') || `Sheet ${i + 1}`, rows });
  }
  return sheets;
}

function toCsv(rows) {
  const quote = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const width = Math.max(0, ...rows.map((r) => r.length));
  return rows.map((r) => Array.from({ length: width }, (_, i) => quote(r[i] ?? '')).join(',')).join('\n');
}

/**
 * The plan in a workbook, as CSV. Takes the first sheet whose header row has
 * an Exercise column, so a guide sheet or a list of names ahead of it — as in
 * the template — does not get read as the plan.
 */
export async function planCsvFromXlsx(buffer) {
  const sheets = await readWorkbook(buffer);
  const isPlan = (rows) => {
    const head = (rows[0] || []).map((h) => String(h).trim().toLowerCase());
    return head.some((h) => /^(exercise|movement|lift)/.test(h))
      && head.some((h) => /^(sets?|reps?)/.test(h));
  };
  const sheet = sheets.find((s) => isPlan(s.rows));
  if (!sheet) throw new Error('No sheet in that file has an Exercise column. Check the header row.');
  return { csv: toCsv(sheet.rows), sheet: sheet.name };
}
