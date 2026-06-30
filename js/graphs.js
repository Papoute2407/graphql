// graphs.js

const BLUE      = '#0068c9';
const BLUE_DIM  = '#1a3a5a';
const BLUE_PALE = 'rgba(0,104,201,0.1)';
const TEXT      = '#e0ffe8';
const TEXT_DIM  = '#0068c9';
const FONT      = 'Courier New, monospace';

// ══════════════════════════════════════════════════════════════
// GRAPHIQUE 1 — XP cumulé dans le temps (courbe)
// points : [{ date: Date, xp: Number }, ...]
// ══════════════════════════════════════════════════════════════
function drawXPGraph(points) {
    const svg = document.getElementById('graphXP');
    svg.innerHTML = '';

    if (!points || points.length < 2) {
        _placeholder(svg, 700, 280, 'Pas assez de données');
        return;
    }

    const W = 700, H = 280;
    const PAD = { top: 20, right: 30, bottom: 50, left: 70 };
    const W_inner = W - PAD.left - PAD.right;
    const H_inner = H - PAD.top  - PAD.bottom;

    const minDate = points[0].date.getTime();
    const maxDate = points[points.length - 1].date.getTime();
    const maxXP   = points[points.length - 1].xp;

    // Fonctions de mapping valeur → pixel
    const xScale = d => PAD.left + ((d.getTime() - minDate) / (maxDate - minDate)) * W_inner;
    const yScale = v => PAD.top  + H_inner - (v / maxXP) * H_inner;

    // ── Grille horizontale ──
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
        const y = PAD.top + (H_inner / gridCount) * i;
        const val = Math.round(maxXP - (maxXP / gridCount) * i);
        _line(svg, PAD.left, y, PAD.left + W_inner, y, BLUE_DIM, 1);
        _text(svg, PAD.left - 8, y + 4, _formatXP(val), TEXT_DIM, 10, 'end');
    }

    // ── Axe X : labels de dates ──
    const labelCount = Math.min(6, points.length);
    const step = Math.floor(points.length / labelCount);
    for (let i = 0; i < points.length; i += step) {
        const p = points[i];
        const x = xScale(p.date);
        const label = _formatDate(p.date);
        _text(svg, x, PAD.top + H_inner + 20, label, TEXT_DIM, 10, 'middle');
        _line(svg, x, PAD.top + H_inner, x, PAD.top + H_inner + 6, BLUE_DIM, 1);
    }

    // ── Aire sous la courbe ──
    let areaPath = `M ${xScale(points[0].date)} ${PAD.top + H_inner}`;
    points.forEach(p => {
        areaPath += ` L ${xScale(p.date)} ${yScale(p.xp)}`;
    });
    areaPath += ` L ${xScale(points[points.length - 1].date)} ${PAD.top + H_inner} Z`;
    _path(svg, areaPath, 'none', BLUE_PALE);

    // ── Courbe ──
    let linePath = `M ${xScale(points[0].date)} ${yScale(points[0].xp)}`;
    points.forEach((p, i) => {
        if (i === 0) return;
        linePath += ` L ${xScale(p.date)} ${yScale(p.xp)}`;
    });
    _path(svg, linePath, BLUE, 'none', 2);

    // ── Point final (highlight) ──
    const last = points[points.length - 1];
    _circle(svg, xScale(last.date), yScale(last.xp), 5, BLUE);
    _text(svg, xScale(last.date) + 8, yScale(last.xp) + 4,
          _formatXP(last.xp), TEXT, 11, 'start');

    // ── Axes ──
    _line(svg, PAD.left, PAD.top, PAD.left, PAD.top + H_inner, BLUE, 1);
    _line(svg, PAD.left, PAD.top + H_inner, PAD.left + W_inner, PAD.top + H_inner, BLUE, 1);

    // ── Labels axes ──
    _text(svg, 14, H / 2, 'XP (kB)', TEXT_DIM, 10, 'middle', -90, `translate(14, ${H/2}) rotate(-90)`);
    _text(svg, W / 2, H - 4, 'Temps', TEXT_DIM, 10, 'middle');
}


// ══════════════════════════════════════════════════════════════
// GRAPHIQUE 2 — Ratio audits (jauge demi-cercle)
// totalUp, totalDown : Number (en octets)
// ══════════════════════════════════════════════════════════════
function drawAuditGraph(totalUp, totalDown) {
    const svg = document.getElementById('graphAudits');
    svg.innerHTML = '';

    const W = 400, H = 260;
    const cx = W / 2, cy = 170;
    const R_outer = 110, R_inner = 70;

    const ratio = totalDown > 0 ? totalUp / totalDown : 1;
    const ratioDisplay = Math.round(ratio * 10) / 10;

    // Angle de remplissage (demi-cercle = 180°)
    // ratio >= 2 → plein, ratio 0 → vide
    const fillPct = Math.min(ratio / 2, 1);
    const startAngle = Math.PI;             // gauche
    const endAngle   = Math.PI + fillPct * Math.PI; // vers la droite

    // ── Arc de fond ──
    _arc(svg, cx, cy, R_outer, R_inner, Math.PI, 2 * Math.PI, '#e24b4a');

    // ── Arc de remplissage ──
    const arcColor = ratio >= 1 ? BLUE : BLUE_DIM;
    _arc(svg, cx, cy, R_outer, R_inner, startAngle, endAngle, arcColor);

    // ── Valeur ratio au centre ──
    _text(svg, cx, cy - 18, ratioDisplay.toFixed(1), TEXT, 36, 'middle', 0, '', 'bold');
    _text(svg, cx, cy + 4,  'RATIO', TEXT_DIM, 10, 'middle', 0, '', 'normal', 2);

    // ── Labels gauche / droite ──
    _text(svg, cx - R_outer - 10, cy + 20, '0', TEXT_DIM, 11, 'end');
    _text(svg, cx + R_outer + 10, cy + 20, '2', TEXT_DIM, 11, 'start');

    // ── Légende bas ──
    const legendY = cy + 50;

    // Donné
    _circle(svg, cx - 70, legendY, 5, BLUE);
    _text(svg, cx - 60, legendY + 4, 'Donné', TEXT_DIM, 11, 'start');
    _text(svg, cx - 60, legendY + 17, _formatXP(totalUp), TEXT, 11, 'start');

    // Reçu
    _circle(svg, cx + 20, legendY, 5, '#e24b4a');
    _text(svg, cx + 30, legendY + 4, 'Reçu', TEXT_DIM, 11, 'start');
    _text(svg, cx + 30, legendY + 17, _formatXP(totalDown), TEXT, 11, 'start');
}


// ══════════════════════════════════════════════════════════════
// HELPERS SVG
// ══════════════════════════════════════════════════════════════

function _el(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
}

function _line(svg, x1, y1, x2, y2, stroke, width = 1) {
    svg.appendChild(_el('line', { x1, y1, x2, y2, stroke, 'stroke-width': width }));
}

function _path(svg, d, stroke, fill, width = 1) {
    svg.appendChild(_el('path', {
        d, stroke, fill,
        'stroke-width': width,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round'
    }));
}

function _circle(svg, cx, cy, r, fill) {
    svg.appendChild(_el('circle', { cx, cy, r, fill }));
}

function _text(svg, x, y, content, fill, size, anchor = 'start',
               rotate = 0, transform = '', weight = 'normal', spacing = 0) {
    const el = _el('text', {
        x, y, fill,
        'font-size': size,
        'font-family': FONT,
        'text-anchor': anchor,
        'font-weight': weight,
        'letter-spacing': spacing,
        transform: transform || (rotate ? `rotate(${rotate}, ${x}, ${y})` : '')
    });
    el.textContent = content;
    svg.appendChild(el);
}

function _arc(svg, cx, cy, rOuter, rInner, startAngle, endAngle, fill) {
    const x1o = cx + rOuter * Math.cos(startAngle);
    const y1o = cy + rOuter * Math.sin(startAngle);
    const x2o = cx + rOuter * Math.cos(endAngle);
    const y2o = cy + rOuter * Math.sin(endAngle);

    const x1i = cx + rInner * Math.cos(endAngle);
    const y1i = cy + rInner * Math.sin(endAngle);
    const x2i = cx + rInner * Math.cos(startAngle);
    const y2i = cy + rInner * Math.sin(startAngle);

    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;

    const d = [
        `M ${x1o} ${y1o}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2o} ${y2o}`,
        `L ${x1i} ${y1i}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2i} ${y2i}`,
        'Z'
    ].join(' ');

    svg.appendChild(_el('path', { d, fill, stroke: 'none' }));
}

function _placeholder(svg, w, h, msg) {
    _text(svg, w / 2, h / 2, msg, TEXT_DIM, 13, 'middle');
}

// ── Formatters ────────────────────────────────────────────────
function _formatXP(bytes) {
    if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + ' MB';
    if (bytes >= 1_000)     return Math.round(bytes / 1_000) + ' kB';
    return bytes + ' B';
}

function _formatDate(date) {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}