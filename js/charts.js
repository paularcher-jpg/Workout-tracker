// Tiny dependency-free SVG charts. No CDN, no build step — works offline.

const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceCeil(value) {
  if (value <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(value));
  const n = value / mag;
  const step = NICE_STEPS.find((s) => n <= s + 1e-9) ?? 10;
  return step * mag;
}

function shortDate(d) {
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/**
 * points: [{ t:number, value:number }]
 */
export function lineChart(points, { height = 180, unit = '', area = true } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'chart';
  if (!points.length) {
    wrap.innerHTML = '<p class="chart-empty">Not enough data yet.</p>';
    return wrap;
  }

  const W = 320;
  const H = height;
  const pad = { top: 12, right: 8, bottom: 22, left: 34 };
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: 'none',
    role: 'img',
    class: 'chart-svg',
  });

  const values = points.map((p) => p.value);
  const rawMax = Math.max(...values);
  const rawMin = Math.min(...values);
  const max = niceCeil(rawMax * 1.05 || 1);
  const min = points.length > 1 && rawMin > 0 ? Math.max(0, Math.floor((rawMin * 0.9) / (max / 10)) * (max / 10)) : 0;
  const span = max - min || 1;

  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = (i) => pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => pad.top + innerH - ((v - min) / span) * innerH;

  // gridlines + y labels
  for (let i = 0; i <= 3; i++) {
    const v = min + (span * i) / 3;
    const gy = y(v);
    svg.appendChild(el('line', { x1: pad.left, x2: W - pad.right, y1: gy, y2: gy, class: 'chart-grid' }));
    const label = el('text', { x: pad.left - 5, y: gy + 3.5, class: 'chart-label', 'text-anchor': 'end' });
    label.textContent = formatTick(v);
    svg.appendChild(label);
  }

  const coords = points.map((p, i) => [x(i), y(p.value)]);
  const path = coords.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');

  if (area && points.length > 1) {
    const areaPath = `${path} L${coords.at(-1)[0].toFixed(1)},${pad.top + innerH} L${coords[0][0].toFixed(1)},${pad.top + innerH} Z`;
    svg.appendChild(el('path', { d: areaPath, class: 'chart-area' }));
  }
  svg.appendChild(el('path', { d: path, class: 'chart-line' }));

  const showDots = points.length <= 40;
  if (showDots) {
    coords.forEach(([px, py], i) => {
      const dot = el('circle', { cx: px, cy: py, r: 3, class: 'chart-dot' });
      const title = el('title');
      title.textContent = `${shortDate(new Date(points[i].t))} — ${formatTick(points[i].value)}${unit}`;
      dot.appendChild(title);
      svg.appendChild(dot);
    });
  }

  // x labels: first and last only, to stay readable on a phone
  const first = el('text', { x: pad.left, y: H - 6, class: 'chart-label', 'text-anchor': 'start' });
  first.textContent = shortDate(new Date(points[0].t));
  svg.appendChild(first);
  if (points.length > 1) {
    const last = el('text', { x: W - pad.right, y: H - 6, class: 'chart-label', 'text-anchor': 'end' });
    last.textContent = shortDate(new Date(points.at(-1).t));
    svg.appendChild(last);
  }

  wrap.appendChild(svg);
  return wrap;
}

export function barChart(points, { height = 150, unit = '' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'chart';
  if (!points.length) {
    wrap.innerHTML = '<p class="chart-empty">Not enough data yet.</p>';
    return wrap;
  }
  const W = 320;
  const H = height;
  const pad = { top: 10, right: 8, bottom: 20, left: 34 };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', class: 'chart-svg' });

  const max = niceCeil(Math.max(...points.map((p) => p.value)) * 1.05 || 1);
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const bw = (innerW / points.length) * 0.68;
  const gap = (innerW / points.length) * 0.32;

  for (let i = 0; i <= 2; i++) {
    const v = (max * i) / 2;
    const gy = pad.top + innerH - (v / max) * innerH;
    svg.appendChild(el('line', { x1: pad.left, x2: W - pad.right, y1: gy, y2: gy, class: 'chart-grid' }));
    const label = el('text', { x: pad.left - 5, y: gy + 3.5, class: 'chart-label', 'text-anchor': 'end' });
    label.textContent = formatTick(v);
    svg.appendChild(label);
  }

  points.forEach((p, i) => {
    const h = max > 0 ? (p.value / max) * innerH : 0;
    const bx = pad.left + i * (bw + gap) + gap / 2;
    const by = pad.top + innerH - h;
    const rect = el('rect', {
      x: bx.toFixed(1), y: by.toFixed(1),
      width: bw.toFixed(1), height: Math.max(h, p.value > 0 ? 2 : 0).toFixed(1),
      rx: 2, class: 'chart-bar',
    });
    const title = el('title');
    title.textContent = `w/c ${shortDate(new Date(p.t))} — ${formatTick(p.value)}${unit}`;
    rect.appendChild(title);
    svg.appendChild(rect);
  });

  const first = el('text', { x: pad.left, y: H - 5, class: 'chart-label', 'text-anchor': 'start' });
  first.textContent = shortDate(new Date(points[0].t));
  svg.appendChild(first);
  const last = el('text', { x: W - pad.right, y: H - 5, class: 'chart-label', 'text-anchor': 'end' });
  last.textContent = shortDate(new Date(points.at(-1).t));
  svg.appendChild(last);

  wrap.appendChild(svg);
  return wrap;
}

function formatTick(v) {
  if (v >= 10000) return `${Math.round(v / 1000)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  if (v >= 100) return String(Math.round(v));
  return String(Math.round(v * 10) / 10);
}
