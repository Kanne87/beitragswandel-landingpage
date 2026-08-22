/* Kopie aus dem pkv-animation-Repo (src/animation.js), Stand dc28e97.
 * Nicht hier bearbeiten — Aenderungen dort machen und die Datei neu kopieren,
 * sonst laufen die beiden Staende auseinander.
 */
/*
 * GKV oder PKV · Die Fakten — looping title animation.
 *
 * One authored timeline, nine cues, three output formats. Everything visible is
 * a pure function of T (authored seconds): the DOM is built once at mount, and
 * each frame only writes styles/attributes that actually move. That keeps the
 * piece deterministic — seek to any T and you get exactly that frame — which is
 * what makes it safe to capture with a headless browser.
 *
 * Ported from the Claude Design prototypes (pkv-video*.jsx + animations-v3.jsx).
 * Geometry, timings and copy are carried over verbatim; the React/Babel/CDN
 * scaffolding and the editor chrome are not.
 */
(function (global) {
  'use strict';

  // ── Timeline ──────────────────────────────────────────────────────────────
  // Named slices in order. CUES.Name is the running sum of the durations before
  // it, so every scene keys its choreography to an absolute authored second.

  var SCENES = [
    { name: 'Titel',       dur: 3.5, desc: 'Serientitel blendet auf' },
    { name: 'Demografie',  dur: 8,   desc: 'Balken zeigen den wachsenden 67+-Anteil' },
    { name: 'Quotient',    dur: 8,   desc: 'Altenquotient-Linie zeichnet sich, Fächer öffnet sich' },
    { name: 'KVdR',        dur: 7.5, desc: 'Kurve fällt von 100 auf 40 Prozent' },
    { name: 'Beitrag',     dur: 8,   desc: 'Höchstbeitrag-Balken wachsen bis 2027' },
    { name: 'Projektion',  dur: 7.5, desc: 'Beitragsfächer bis 2050 öffnet sich' },
    { name: 'Vergleich',   dur: 8,   desc: 'GKV- und PKV-Kurven laufen fast parallel' },
    { name: 'Zeitfenster', dur: 9,   desc: 'Zeitachse 2026 bis 2027 mit Handlungsfenster' },
    { name: 'Quellen',     dur: 5,   desc: 'Abbinder mit Quellen' }
  ];

  var CUES = {};
  var TOTAL = 0;
  SCENES.forEach(function (s) { CUES[s.name] = TOTAL; TOTAL = Math.round((TOTAL + s.dur) * 1000) / 1000; });

  // Scene order for the "n / 7" counter in the header (Titel and Quellen don't count).
  var NUMBERED = ['Demografie', 'Quotient', 'KVdR', 'Beitrag', 'Projektion', 'Vergleich', 'Zeitfenster'];

  // ── Palette & type ────────────────────────────────────────────────────────

  var C = {
    bg: '#f3f2f2', ink: '#201f1d', gold: '#b68235', g700: '#7d5411', g400: '#e1ad66',
    g200: '#ffe3bf', g100: '#fff3e4', n200: '#eae7e7', n400: '#bab6b6', n500: '#9b9797',
    n600: '#7d7979', n700: '#605d5d', div: 'rgba(32,31,29,0.16)'
  };
  var H = '"Cormorant Garamond", Georgia, serif';   // display
  var B = '"Lora", Georgia, serif';                 // body

  // ── Easing & motion ───────────────────────────────────────────────────────

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeOutCubic(t) { t -= 1; return t * t * t + 1; }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }
  function easeOutBack(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  // The three motion primitives the whole piece is built from. Each takes an
  // absolute start second and returns a function of T — no easing or transform
  // is written anywhere outside these.
  function enter(s, d) {
    d = d || 0.8;
    return function (T) {
      var e = easeOutCubic(clamp((T - s) / d, 0, 1));
      return { opacity: e, transform: 'translateY(' + (1 - e) * 44 + 'px)' };
    };
  }
  function draw(s, d) {
    d = d || 1.2;
    return function (T) { return easeInOutCubic(clamp((T - s) / d, 0, 1)); };
  }
  function pop(s, d) {
    d = d || 0.55;
    return function (T) {
      var p = clamp((T - s) / d, 0, 1);
      return {
        opacity: Math.min(1, p * 3),
        transform: 'scale(' + (0.7 + 0.3 * easeOutBack(p)) + ')',
        transformOrigin: '50% 50%', transformBox: 'fill-box'
      };
    };
  }
  function fade(s, d) {
    d = d || 0.6;
    return function (T) { return { opacity: clamp((T - s) / d, 0, 1) }; };
  }

  // ── DOM building ──────────────────────────────────────────────────────────
  // Attribute values may be plain (written once) or functions of T (registered
  // as per-frame updaters). `style` takes a camelCase object either way.

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var DYN = null; // collected during build(), then frozen into the render loop

  function apply(node, key, value) {
    if (key === 'style') { Object.assign(node.style, value); return; }
    if (key === 'text') { node.textContent = value; return; }
    if (value == null || value === false) { node.removeAttribute(key); return; }
    node.setAttribute(key, value);
  }

  function build(node, attrs, kids) {
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (typeof value === 'function') {
          DYN.push(function (T) { apply(node, key, value(T)); });
          apply(node, key, value(0));
        } else {
          apply(node, key, value);
        }
      });
    }
    kids.forEach(function add(kid) {
      if (kid == null || kid === false) return;
      if (Array.isArray(kid)) { kid.forEach(add); return; }
      node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    });
    return node;
  }

  function h(tag, attrs) { return build(document.createElement(tag), attrs, [].slice.call(arguments, 2)); }
  function s(tag, attrs) { return build(document.createElementNS(SVG_NS, tag), attrs, [].slice.call(arguments, 2)); }

  // Inline emphasis inside the running text — bold, optionally gold.
  function strong(text, color) {
    var st = { fontWeight: 600 };
    if (color) st.color = color;
    return h('strong', { style: st }, text);
  }

  // A stroke that draws itself on. Solid paths reveal tip-to-tail via
  // stroke-dashoffset; dashed paths can't (the dash pattern is the point), so
  // those fade in instead.
  function pathDraw(d, stroke, width, progress, dash) {
    var attrs = {
      d: d, stroke: stroke, 'stroke-width': width, fill: 'none', 'stroke-linecap': 'round', pathLength: '1',
      'stroke-dasharray': dash || '1'
    };
    if (dash) {
      attrs['stroke-dashoffset'] = 0;
      attrs.style = function (T) { return { opacity: progress(T) }; };
    } else {
      attrs['stroke-dashoffset'] = function (T) { return 1 - progress(T); };
    }
    return s('path', attrs);
  }

  // ── Format configuration ──────────────────────────────────────────────────
  // The story, the chart geometry and the timings are identical across formats.
  // What changes is the frame: type scale, padding, and — for 16:9 — whether the
  // headline sits above the chart or beside it.

  var FORMATS = {
    square: {
      label: 'Quadrat (1:1)', width: 1080, height: 1080, layout: 'stack',
      scene: { pad: '150px 76px 205px', hSize: 44, hLine: 1.1, fact: 24, factMargin: '0', chartMax: 500 },
      hSizeQuotient: 42, hSizeVergleich: 42,
      titel: { pad: '0 84px', h1: 104, h1Margin: '36px 0 0', italic: 50, italicMargin: '22px 0 0', sub: 27, subMargin: '40px 0 0', ruleMargin: 40, wrap: true },
      zeit: { intro: 23, introMargin: '0 0 6px', boxPad: '22px 28px', boxMargin: 6, boxH: 32, boxP: 21, boxPMargin: '10px 0 0' },
      quellen: { pad: '0 84px', label: 20, h1: 62, h1Margin: '24px 0 0', ruleMargin: '34px 0', gap: 10, li: 20, wrap: true },
      chrome: { inset: 76, top: 56, size: 20 },
      caption: { size: 26, bottom: '4.5%', side: '8%' }
    },
    portrait: {
      label: 'Hochkant (9:16)', width: 1080, height: 1920, layout: 'stack',
      scene: { pad: '230px 90px 300px', hSize: 62, hLine: 1.1, fact: 30, factMargin: '0', chartMax: null },
      hSizeQuotient: 58, hSizeVergleich: 56,
      titel: { pad: '0 100px', h1: 148, h1Margin: '48px 0 0', italic: 66, italicMargin: '28px 0 0', sub: 32, subMargin: '56px 0 0', ruleMargin: 56, wrap: true },
      zeit: { intro: 28, introMargin: '0 0 12px', boxPad: '30px 36px', boxMargin: 12, boxH: 42, boxP: 27, boxPMargin: '14px 0 0' },
      quellen: { pad: '0 100px', label: 24, h1: 88, h1Margin: '32px 0 0', ruleMargin: '48px 0', gap: 18, li: 24, wrap: true },
      chrome: { inset: 90, top: 84, size: 23 },
      caption: { size: 33, bottom: '5%', side: '9%' }
    },
    landscape: {
      label: 'Web (16:9)', width: 1920, height: 1080, layout: 'split',
      scene: { pad: '190px 100px 150px', hSize: 54, hLine: 1.12, fact: 26, factMargin: '36px 0 0', chartMax: null },
      hSizeQuotient: 50, hSizeVergleich: 50,
      titel: { pad: '0 100px', h1: 120, h1Margin: '48px 0 0', italic: 56, italicMargin: '24px 0 0', sub: 32, subMargin: '56px 0 0', ruleMargin: 56, wrap: false },
      zeit: { intro: 24, introMargin: '0 0 8px', boxPad: '24px 30px', boxMargin: 8, boxH: 34, boxP: 23, boxPMargin: '12px 0 0' },
      quellen: { pad: '0 100px', label: 24, h1: 72, h1Margin: '32px 0 0', ruleMargin: '36px 0', gap: 12, li: 22, wrap: false },
      chrome: { inset: 90, top: 84, size: 23 },
      caption: { size: 29, bottom: '4.5%', side: '15%' }
    }
  };

  // ── Scene shell ───────────────────────────────────────────────────────────
  // Headline, chart, key fact. In 1:1 and 9:16 they stack; in 16:9 the words sit
  // left and the chart right. The chart creeps up by 3.5% across the scene so a
  // held frame still has life in it.

  function scene(F, opts) {
    var cfg = F.scene;
    var hSize = opts.hSize || cfg.hSize;
    var zoom = opts.chartZoom === false
      ? null
      : function (T) { return { transform: 'scale(' + (1 + 0.035 * clamp((T - opts.s) / opts.dur, 0, 1)) + ')' }; };

    var headline = h('h1', {
      style: { fontFamily: H, fontWeight: 500, fontSize: hSize + 'px', lineHeight: cfg.hLine, margin: 0, textWrap: 'pretty' }
    }, opts.headline);
    DYN.push(styleWriter(headline, enter(opts.s + 0.15)));

    var fact = null;
    if (opts.fact) {
      fact = h('p', {
        style: { fontSize: cfg.fact + 'px', lineHeight: 1.5, margin: cfg.factMargin, textWrap: 'pretty' }
      }, opts.fact);
      DYN.push(styleWriter(fact, enter(opts.s + (opts.factAt == null ? 3.4 : opts.factAt))));
    }

    var chart = h('div', {
      style: { display: 'flex', flexDirection: 'column', justifyContent: 'center' }
    }, opts.children);
    if (zoom) DYN.push(styleWriter(chart, zoom));

    if (F.layout === 'split') {
      return h('div', {
        style: {
          position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '600px 1fr', gap: '0 90px',
          padding: cfg.pad, boxSizing: 'border-box', fontFamily: B, color: C.ink, alignItems: 'center'
        }
      }, h('div', null, headline, fact), chart);
    }

    Object.assign(chart.style, { flex: '1' });
    return h('div', {
      style: {
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        padding: cfg.pad, boxSizing: 'border-box', fontFamily: B, color: C.ink
      }
    }, headline, chart, fact);
  }

  function styleWriter(node, fn) {
    return function (T) { Object.assign(node.style, fn(T)); };
  }

  // A chart canvas sized to the format. The viewBox geometry is shared by all
  // three; only the height cap differs (1:1 has the least room to give).
  function chartSvg(F, viewBox) {
    var style = { width: '100%' };
    if (F.scene.chartMax) style.maxHeight = F.scene.chartMax + 'px';
    return s('svg', { viewBox: viewBox, style: style }, [].slice.call(arguments, 2));
  }

  // ── Scenes ────────────────────────────────────────────────────────────────

  function sceneTitel(F, t) {
    var cfg = F.titel;
    var ruleTop = h('div', { style: { height: '1px', background: C.gold, transformOrigin: 'left' } });
    DYN.push(scaleX(ruleTop, draw(t + 0.2, 0.9)));

    var title = h('h1', { style: { fontFamily: H, fontWeight: 500, fontSize: cfg.h1 + 'px', lineHeight: 1.02, margin: cfg.h1Margin } },
      'GKV oder', cfg.wrap ? h('br') : ' ', 'PKV', h('span', { style: { color: C.gold } }, '.'));
    DYN.push(styleWriter(title, enter(t + 0.5)));

    var kicker = h('p', { style: { fontFamily: H, fontStyle: 'italic', fontWeight: 500, fontSize: cfg.italic + 'px', color: C.g700, margin: cfg.italicMargin } }, 'Die Fakten.');
    DYN.push(styleWriter(kicker, enter(t + 1.0)));

    var sub = h('p', { style: { fontFamily: B, fontSize: cfg.sub + 'px', color: C.n600, margin: cfg.subMargin } }, 'Sieben Grafiken, eine Entscheidung.');
    DYN.push(styleWriter(sub, enter(t + 1.5)));

    var ruleBottom = h('div', { style: { height: '1px', background: C.gold, marginTop: cfg.ruleMargin + 'px', transformOrigin: 'left' } });
    DYN.push(scaleX(ruleBottom, draw(t + 0.5, 0.9)));

    return h('div', {
      style: {
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: cfg.pad, boxSizing: 'border-box', color: C.ink
      }
    }, ruleTop, title, kicker, sub, ruleBottom);
  }

  function scaleX(node, fn) {
    return function (T) { node.style.transform = 'scaleX(' + fn(T) + ')'; };
  }

  function sceneDemografie(F, t, dur) {
    var cols = [
      { x: 60,  year: '1990',  acc: 63,  mid: 269, low: 88, pct: '15 %', py: 128 },
      { x: 400, year: '2024',  acc: 84,  mid: 256, low: 80, pct: '20 %', py: 138 },
      { x: 740, year: '2070*', acc: 126, mid: 223, low: 71, pct: '30 %', py: 160 }
    ];

    var groups = cols.map(function (c, i) {
      var appear = fade(t + 0.8 + i * 0.6, 0.5);
      var grow = draw(t + 1.0 + i * 0.6, 0.9);

      var seniors = s('rect', {
        x: c.x, y: 88, width: 160, fill: C.g200, stroke: C.gold, 'stroke-width': 2,
        height: function (T) { return Math.max(0.01, c.acc * grow(T)); },
        opacity: function (T) { return grow(T) > 0 ? 1 : 0; }
      });

      var body = s('g', { style: appear },
        s('rect', { x: c.x, y: 88 + c.acc, width: 160, height: c.mid, fill: C.n200, stroke: C.n400 }),
        s('rect', { x: c.x, y: 88 + c.acc + c.mid, width: 160, height: c.low, fill: 'none', stroke: C.n400 }),
        s('text', { x: c.x + 80, y: 88 + c.acc + c.mid / 2 + 10, 'text-anchor': 'middle', 'font-family': B, 'font-size': 24, fill: C.n600 }, '20–66'),
        s('text', { x: c.x + 80, y: 88 + c.acc + c.mid + c.low / 2 + 8, 'text-anchor': 'middle', 'font-family': B, 'font-size': 22, fill: C.n600 }, 'unter 20'),
        s('text', { x: c.x + 80, y: 612, 'text-anchor': 'middle', 'font-family': B, 'font-size': 26, fill: C.n600 }, c.year),
        seniors
      );

      var pct = s('text', {
        x: c.x + 80, y: c.py, 'text-anchor': 'middle', 'font-family': B, 'font-size': 30, 'font-weight': 600, fill: C.g700,
        style: pop(t + 1.5 + i * 0.6)
      }, c.pct);

      return s('g', null, body, pct);
    });

    return scene(F, {
      s: t, dur: dur,
      headline: 'Schon 2035 ist jede vierte Person 67 oder älter.',
      fact: [h('span', null, 'Die Zahl der Hochaltrigen (80+) steigt von 6,1 Mio. auf bis zu ', strong('9,8 Mio. (2050)', C.g700), '.')],
      children: chartSvg(F, '0 0 960 620',
        s('text', { x: 60, y: 52, 'font-family': B, 'font-size': 27, fill: C.g700, style: fade(t + 0.6) }, 'Anteil der Bevölkerung 67+'),
        groups
      )
    });
  }

  function sceneQuotient(F, t, dur) {
    return scene(F, {
      s: t, dur: dur, hSize: F.hSizeQuotient, factAt: 3.8,
      headline: 'Heute tragen drei Erwerbstätige einen Rentner. 2070 vielleicht nur noch 1,6.',
      fact: [h('span', null, 'Rentner je 100 Erwerbstätige: ', strong('weniger Einzahler, mehr Empfänger'), ' — zugleich.')],
      children: chartSvg(F, '0 0 960 600',
        s('g', { stroke: C.n200, style: fade(t + 0.5) },
          s('line', { x1: 60, y1: 374, x2: 920, y2: 374 }),
          s('line', { x1: 60, y1: 249, x2: 920, y2: 249 }),
          s('line', { x1: 60, y1: 123, x2: 920, y2: 123 })
        ),
        s('g', { 'font-family': B, 'font-size': 22, fill: C.n500, style: fade(t + 0.5) },
          s('text', { x: 50, y: 381, 'text-anchor': 'end' }, '20'),
          s('text', { x: 50, y: 256, 'text-anchor': 'end' }, '40'),
          s('text', { x: 50, y: 130, 'text-anchor': 'end' }, '60'),
          s('text', { x: 71,  y: 588, 'text-anchor': 'middle', 'font-size': 26, fill: C.n600 }, '1991'),
          s('text', { x: 425, y: 588, 'text-anchor': 'middle', 'font-size': 26, fill: C.n600 }, '2024'),
          s('text', { x: 880, y: 588, 'text-anchor': 'middle', 'font-size': 26, fill: C.n600 }, '2070')
        ),
        s('polygon', { points: '425,293 920,230 920,117', fill: C.g100, style: fade(t + 2.3, 0.8) }),
        pathDraw('M 425 293 L 920 230', C.gold, 3, draw(t + 2.2, 0.8), '0.05 0.04'),
        pathDraw('M 425 293 L 920 117', C.gold, 3, draw(t + 2.2, 0.8), '0.05 0.04'),
        pathDraw('M 71 349 C 200 330, 330 312, 425 293', C.ink, 4, draw(t + 0.8, 1.3)),
        s('circle', { cx: 71,  cy: 349, r: 7, fill: C.ink,  style: pop(t + 0.8) }),
        s('circle', { cx: 425, cy: 293, r: 7, fill: C.ink,  style: pop(t + 2.0) }),
        s('circle', { cx: 920, cy: 230, r: 7, fill: C.gold, style: pop(t + 2.9) }),
        s('circle', { cx: 920, cy: 117, r: 7, fill: C.gold, style: pop(t + 3.1) }),
        s('g', { 'font-family': B, 'font-size': 30 },
          s('text', { x: 80,  y: 320, fill: C.ink,  style: pop(t + 1.1) }, '24'),
          s('text', { x: 396, y: 258, fill: C.ink,  'font-weight': 600, style: pop(t + 2.1) }, '33'),
          s('text', { x: 882, y: 272, fill: C.g700, 'font-weight': 600, style: pop(t + 3.0) }, '43'),
          s('text', { x: 882, y: 100, fill: C.g700, 'font-weight': 600, style: pop(t + 3.2) }, '61')
        ),
        s('g', { 'font-family': B, 'font-size': 24, fill: C.g700, style: fade(t + 3.3) },
          s('text', { x: 640, y: 330 }, 'günstigster Fall'),
          s('text', { x: 600, y: 150 }, 'ungünstigster Fall')
        )
      )
    });
  }

  function sceneKVdR(F, t, dur) {
    return scene(F, {
      s: t, dur: dur, factAt: 3.2,
      headline: 'Rentner decken nur noch rund 40 % ihrer Gesundheitskosten selbst.',
      fact: [h('span', null, 'Die Differenz finanzieren die Beiträge der Erwerbstätigen — ', strong('Jahr für Jahr, systematisch'), '.')],
      children: chartSvg(F, '0 0 960 560',
        s('g', { stroke: C.n200, style: fade(t + 0.5) },
          s('line', { x1: 60, y1: 480, x2: 920, y2: 480 }),
          s('line', { x1: 60, y1: 260, x2: 920, y2: 260 }),
          s('line', { x1: 60, y1: 40,  x2: 920, y2: 40 })
        ),
        s('g', { 'font-family': B, 'font-size': 22, fill: C.n500, style: fade(t + 0.5) },
          s('text', { x: 52, y: 47,  'text-anchor': 'end', 'font-size': 19 }, '100 %'),
          s('text', { x: 50, y: 267, 'text-anchor': 'end' }, '50 %'),
          s('text', { x: 50, y: 487, 'text-anchor': 'end' }, '0 %'),
          s('text', { x: 70,  y: 540, 'text-anchor': 'middle', 'font-size': 24, fill: C.n600 }, '1960'),
          s('text', { x: 590, y: 540, 'text-anchor': 'middle', 'font-size': 24, fill: C.n600 }, '2000'),
          s('text', { x: 890, y: 540, 'text-anchor': 'middle', 'font-size': 24, fill: C.n600 }, 'heute')
        ),
        pathDraw('M 60 45 C 260 60, 420 160, 590 288 C 700 372, 820 306, 907 304', C.gold, 5, draw(t + 0.7, 1.7)),
        s('circle', { cx: 60,  cy: 45,  r: 8, fill: C.gold, style: pop(t + 0.7) }),
        s('circle', { cx: 590, cy: 288, r: 8, fill: C.gold, style: pop(t + 1.7) }),
        s('circle', { cx: 907, cy: 304, r: 8, fill: C.gold, style: pop(t + 2.5) }),
        s('g', { 'font-family': B, 'font-size': 30 },
          s('text', { x: 86,  y: 62,  fill: C.ink, style: pop(t + 0.9) }, '≈ 100 %'),
          s('text', { x: 560, y: 342, fill: C.ink, style: pop(t + 1.9) }, '43,6 %'),
          s('text', { x: 898, y: 268, 'text-anchor': 'end', fill: C.g700, 'font-weight': 600, style: pop(t + 2.7) }, '≈ 40 %')
        )
      )
    });
  }

  function sceneBeitrag(F, t, dur) {
    var bars = [
      { x: 60,  h: 255.6, v: '639 €',    yr: '2015' },
      { x: 185, h: 294.4, v: '736 €',    yr: '2020' },
      { x: 310, h: 323.2, v: '808 €',    yr: '2023' },
      { x: 435, h: 337.6, v: '844 €',    yr: '2024' },
      { x: 560, h: 377.2, v: '943 €',    yr: '2025' },
      { x: 685, h: 406.9, v: '1.017 €',  yr: '2026',  hot: true },
      { x: 810, h: 440,   v: '~1.100 €', yr: '2027*', hot: true, proj: true }
    ];

    var groups = bars.map(function (b, i) {
      var grow = draw(t + 0.6 + i * 0.35, 0.7);
      var rect = s('rect', {
        x: b.x, width: 90,
        fill: b.proj ? 'url(#hatchAn)' : b.hot ? C.g200 : C.n200,
        'fill-opacity': b.proj ? 0.35 : 1,
        stroke: b.hot ? C.gold : C.n400,
        'stroke-width': b.hot ? 2 : 1,
        'stroke-dasharray': b.proj ? '8 6' : null,
        y: function (T) { return 500 - b.h * grow(T); },
        height: function (T) { return Math.max(0.01, b.h * grow(T)); }
      });
      return s('g', null,
        rect,
        s('text', {
          x: b.x + 45, y: 500 - b.h - 14, 'text-anchor': 'middle', 'font-family': B, 'font-size': 27,
          'font-weight': b.hot ? 600 : 400, fill: b.hot ? C.g700 : C.ink, style: pop(t + 1.1 + i * 0.35)
        }, b.v),
        s('text', {
          x: b.x + 45, y: 545, 'text-anchor': 'middle', 'font-family': B, 'font-size': 24, fill: C.n600,
          style: fade(t + 0.6 + i * 0.35)
        }, b.yr)
      );
    });

    return scene(F, {
      s: t, dur: dur, factAt: 4.2,
      headline: [h('span', null, 'Der GKV-Höchstbeitrag: ', h('span', { style: { color: C.g700 } }, '+59 %'), ' in elf Jahren.')],
      fact: [h('span', null, 'Inklusive Pflegeversicherung 2026 bereits rund ', strong('1.261 €/Monat'), ' (kinderlos).')],
      children: chartSvg(F, '0 0 960 580',
        s('defs', null,
          s('pattern', { id: 'hatchAn', width: 12, height: 12, patternTransform: 'rotate(45)', patternUnits: 'userSpaceOnUse' },
            s('line', { x1: 0, y1: 0, x2: 0, y2: 12, stroke: C.gold, 'stroke-width': 3 })
          )
        ),
        groups
      )
    });
  }

  function sceneProjektion(F, t, dur) {
    return scene(F, {
      s: t, dur: dur, factAt: 3.4,
      headline: 'Seriöse Projektionen: GKV-Beitrag bis 2050 zwischen 20 und 26 %.',
      fact: [h('span', null, 'Der Gesamtsozialbeitrag könnte 2035 ', strong('rund 50 %'), ' erreichen.')],
      children: chartSvg(F, '0 0 960 600',
        s('g', { stroke: C.n200, style: fade(t + 0.4) },
          s('line', { x1: 60, y1: 481, x2: 920, y2: 481 }),
          s('line', { x1: 60, y1: 335, x2: 920, y2: 335 }),
          s('line', { x1: 60, y1: 188, x2: 920, y2: 188 }),
          s('line', { x1: 60, y1: 60,  x2: 920, y2: 60 })
        ),
        s('g', { 'font-family': B, 'font-size': 22, fill: C.n500, style: fade(t + 0.4) },
          s('text', { x: 50, y: 488, 'text-anchor': 'end' }, '16 %'),
          s('text', { x: 50, y: 342, 'text-anchor': 'end' }, '20 %'),
          s('text', { x: 50, y: 195, 'text-anchor': 'end' }, '24 %'),
          s('text', { x: 52, y: 67,  'text-anchor': 'end', 'font-size': 19 }, '27,5 %'),
          s('text', { x: 70,  y: 580, 'text-anchor': 'middle', 'font-size': 26, fill: C.n600 }, '2026'),
          s('text', { x: 382, y: 580, 'text-anchor': 'middle', 'font-size': 26, fill: C.n600 }, '2035'),
          s('text', { x: 890, y: 580, 'text-anchor': 'middle', 'font-size': 26, fill: C.n600 }, '2050')
        ),
        s('polygon', { points: '60,426 382,363 920,327 920,114 382,283 60,426', fill: C.g100, style: fade(t + 1.6, 1.0) }),
        pathDraw('M 60 426 L 382 283 L 920 114', C.gold, 3, draw(t + 1.2, 1.2), '0.05 0.04'),
        pathDraw('M 60 426 L 382 363 L 920 327', C.gold, 3, draw(t + 1.2, 1.2), '0.05 0.04'),
        s('circle', { cx: 60, cy: 426, r: 8, fill: C.ink, style: pop(t + 0.7) }),
        s('g', { 'font-family': B, 'font-size': 29 },
          s('text', { x: 82,  y: 452, fill: C.ink, 'font-weight': 600, style: pop(t + 0.9) }, '17,5 %'),
          s('text', { x: 910, y: 372, 'text-anchor': 'end', fill: C.g700, 'font-weight': 600, style: pop(t + 2.5) }, '20,2 % nur Demografie'),
          s('text', { x: 910, y: 90,  'text-anchor': 'end', fill: C.g700, 'font-weight': 600, style: pop(t + 2.8) }, '26 % Kostendruck')
        )
      )
    });
  }

  function sceneVergleich(F, t, dur) {
    return scene(F, {
      s: t, dur: dur, hSize: F.hSizeVergleich, factAt: 3.6,
      headline: '„Die PKV explodiert im Alter“? Der Durchschnitt sagt etwas anderes.',
      fact: [h('span', null, 'Langfristig verliefen beide Systeme ', strong('nahezu parallel'), ' — die PKV im Schnitt sogar etwas langsamer.')],
      children: chartSvg(F, '0 0 960 560',
        s('g', { stroke: C.n200, style: fade(t + 0.4) },
          s('line', { x1: 60, y1: 470, x2: 920, y2: 470 }),
          s('line', { x1: 60, y1: 308, x2: 920, y2: 308 }),
          s('line', { x1: 60, y1: 146, x2: 920, y2: 146 })
        ),
        s('g', { 'font-family': B, 'font-size': 22, fill: C.n500, style: fade(t + 0.4) },
          s('text', { x: 50, y: 477, 'text-anchor': 'end' }, '100'),
          s('text', { x: 50, y: 315, 'text-anchor': 'end' }, '150'),
          s('text', { x: 50, y: 153, 'text-anchor': 'end' }, '200'),
          s('text', { x: 70,  y: 520, 'text-anchor': 'middle', 'font-size': 24, fill: C.n600 }, '2006'),
          s('text', { x: 890, y: 520, 'text-anchor': 'middle', 'font-size': 24, fill: C.n600 }, '2026')
        ),
        pathDraw('M 60 470 C 350 440, 650 300, 920 97',  C.n500, 4, draw(t + 0.8, 1.6)),
        pathDraw('M 60 470 C 350 450, 650 340, 920 162', C.gold, 5, draw(t + 1.2, 1.6)),
        s('circle', { cx: 920, cy: 97,  r: 8, fill: C.n500, style: pop(t + 2.4) }),
        s('circle', { cx: 920, cy: 162, r: 8, fill: C.gold, style: pop(t + 2.8) }),
        s('g', { 'font-family': B, 'font-size': 28 },
          s('text', { x: 60, y: 84,  fill: C.n600, style: pop(t + 2.5) }, 'GKV +3,9 %/Jahr → 215'),
          s('text', { x: 60, y: 128, fill: C.g700, 'font-weight': 600, style: pop(t + 2.9) }, 'PKV +3,4 %/Jahr → 195')
        )
      )
    });
  }

  function sceneZeitfenster(F, t, dur) {
    var cfg = F.zeit;

    var intro = h('p', {
      style: { fontSize: cfg.intro + 'px', lineHeight: 1.5, margin: cfg.introMargin, color: C.n700, textWrap: 'pretty' }
    }, 'Die Versicherungspflichtgrenze springt von ', strong('77.400 €', C.ink), ' auf voraussichtlich ', strong('~84.600 €', C.g700), '.');
    DYN.push(styleWriter(intro, enter(t + 0.4)));

    var box = h('div', {
      style: { border: '1px solid ' + C.gold, padding: cfg.boxPad, marginTop: cfg.boxMargin + 'px' }
    },
      h('p', { style: { fontFamily: H, fontSize: cfg.boxH + 'px', fontWeight: 600, margin: 0, lineHeight: 1.2 } }, 'Verdienen Sie zwischen 77.400 € und 84.600 €?'),
      h('p', { style: { fontSize: cfg.boxP + 'px', lineHeight: 1.45, margin: cfg.boxPMargin, color: C.n700, textWrap: 'pretty' } }, 'Dann lohnt jetzt eine ergebnisoffene Beratung — mit dokumentiertem Vergleich beider Seiten.')
    );
    DYN.push(styleWriter(box, enter(t + 3.8)));

    var timeline = chartSvg(F, '0 0 960 380',
      s('path', {
        d: 'M 60 190 L 920 190', stroke: C.n400, 'stroke-width': 2, pathLength: '1', 'stroke-dasharray': '1',
        'stroke-dashoffset': (function (p) { return function (T) { return 1 - p(T); }; })(draw(t + 0.7, 1.0))
      }),
      s('line', { x1: 740, y1: 70, x2: 740, y2: 310, stroke: C.gold, 'stroke-width': 2, 'stroke-dasharray': '8 6', style: fade(t + 2.5) }),
      s('g', { 'font-family': B },
        s('circle', { cx: 180, cy: 190, r: 9, fill: C.ink, style: pop(t + 1.3) }),
        s('g', { style: fade(t + 1.4) },
          s('text', { x: 180, y: 140, 'text-anchor': 'middle', 'font-size': 27, 'font-weight': 600, fill: C.ink }, '30.09.2026'),
          s('text', { x: 180, y: 246, 'text-anchor': 'middle', 'font-size': 24, fill: C.n600 }, 'letzte GKV-Kündigung')
        ),
        s('circle', { cx: 470, cy: 190, r: 9, fill: C.ink, style: pop(t + 1.9) }),
        s('g', { style: fade(t + 2.0) },
          s('text', { x: 470, y: 140, 'text-anchor': 'middle', 'font-size': 27, 'font-weight': 600, fill: C.ink }, '01.12.2026'),
          s('text', { x: 470, y: 246, 'text-anchor': 'middle', 'font-size': 24, fill: C.n600 }, 'letzter PKV-Beginn')
        ),
        s('circle', { cx: 740, cy: 190, r: 9, fill: C.gold, style: pop(t + 2.6) }),
        s('g', { style: fade(t + 2.7) },
          s('text', { x: 740, y: 52,  'text-anchor': 'middle', 'font-size': 27, 'font-weight': 600, fill: C.g700 }, '01.01.2027'),
          s('text', { x: 740, y: 344, 'text-anchor': 'middle', 'font-size': 24, fill: C.g700 }, 'neue Grenze ~84.600 €')
        )
      )
    );

    return scene(F, {
      s: t, dur: dur, chartZoom: false,
      headline: '2027 schließt sich die Tür ein Stück weiter.',
      children: [intro, timeline, box]
    });
  }

  function sceneQuellen(F, t) {
    var cfg = F.quellen;
    var sources = [
      'Destatis, 16. koordinierte Bevölkerungsvorausberechnung (2025)',
      'WIP/WISO 2004 · WIP 2006–2026 (PKV-nahes Institut)',
      'BMAS, BMG, vdek · IGES/DAK 2026',
      'PKV-Verband Rechenschaftsbericht 2026 · BaFin-Studie 2024',
      'GKV-Beitragssatzstabilisierungsgesetz v. 10.07.2026 — 2027-Werte: Hochrechnung',
      'Projektionen sind „Wenn-Dann“-Rechnungen, keine Vorhersagen.'
    ];

    var label = h('div', { style: { fontFamily: B, fontSize: cfg.label + 'px', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.g400 } }, 'Quellen & Hinweise');
    DYN.push(styleWriter(label, fade(t + 0.3)));

    var title = h('h1', { style: { fontFamily: H, fontWeight: 500, fontSize: cfg.h1 + 'px', lineHeight: 1.06, margin: cfg.h1Margin } },
      'Erst rechnen,', cfg.wrap ? h('br') : ' ', 'dann wechseln', h('span', { style: { color: C.g400 } }, '.'));
    DYN.push(styleWriter(title, enter(t + 0.5)));

    var rule = h('div', { style: { height: '1px', background: C.g400, opacity: 0.5, margin: cfg.ruleMargin, transformOrigin: 'left' } });
    DYN.push(scaleX(rule, draw(t + 0.8, 0.9)));

    var list = h('ul', {
      style: {
        margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column',
        gap: cfg.gap + 'px', fontFamily: B, fontSize: cfg.li + 'px', lineHeight: 1.4, color: C.n400
      }
    }, sources.map(function (text, i) {
      var li = h('li', null, text);
      DYN.push(styleWriter(li, fade(t + 1.0 + i * 0.25)));
      return li;
    }));

    // The outro dips back out just before the loop seam so the last authored
    // frame matches the first.
    var root = h('div', {
      style: {
        position: 'absolute', inset: 0, background: C.ink, color: C.bg,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: cfg.pad, boxSizing: 'border-box'
      }
    }, label, title, rule, list);
    DYN.push(function (T) {
      var out = 1 - clamp((T - (TOTAL - 0.5)) / 0.5, 0, 1);
      root.style.opacity = out * clamp((T - t) / 0.5, 0, 1);
    });

    return root;
  }

  // ── Persistent header ─────────────────────────────────────────────────────
  // Series title, scene counter and a hairline progress bar. Flips to the gold
  // on-dark palette when the sources outro takes over.

  function chrome(F) {
    var cfg = F.chrome;
    var seriesTitle = h('span', { style: { fontFamily: B, fontSize: cfg.size + 'px', letterSpacing: '0.14em', textTransform: 'uppercase' } }, 'GKV oder PKV · Die Fakten');
    var counter = h('span', { style: { fontFamily: B, fontSize: cfg.size + 'px', color: C.n500, fontVariantNumeric: 'tabular-nums' } });
    var row = h('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '16px', borderBottom: '1px solid ' + C.div }
    }, seriesTitle, counter);
    var bar = h('div', { style: { height: '2px', background: C.gold, marginTop: '-1px', width: '0%' } });

    DYN.push(function (T) {
      var dark = T >= CUES.Quellen;
      var num = 0;
      for (var i = 0; i < NUMBERED.length; i++) if (T >= CUES[NUMBERED[i]]) num = i + 1;

      row.style.opacity = clamp((T - 0.3) / 0.6, 0, 1);
      row.style.borderBottomColor = dark ? 'rgba(243,242,242,0.2)' : C.div;
      seriesTitle.style.color = dark ? C.g400 : C.g700;
      counter.style.opacity = num > 0 && !dark ? '1' : '0';
      counter.textContent = num + ' / 7';
      bar.style.background = dark ? C.g400 : C.gold;
      bar.style.width = (clamp(T / TOTAL, 0, 1) * 100).toFixed(2) + '%';
    });

    return h('div', { style: { position: 'absolute', left: cfg.inset + 'px', right: cfg.inset + 'px', top: cfg.top + 'px' } }, row, bar);
  }

  // ── Subtitles ─────────────────────────────────────────────────────────────
  // One element, at most one line at a time. Each item runs until the next one
  // starts unless it names its own `until`.

  var CAPTION_FADE = 0.18;

  function captions(F) {
    var cfg = F.caption;
    var items = [
      { at: CUES.Titel + 1.8,       text: 'Was Sie vor der Entscheidung wissen sollten.' },
      { at: CUES.Demografie + 0.5,  text: 'Der Anteil der Menschen über 67 steigt von 15 % auf 30 %.' },
      { at: CUES.Demografie + 3.8,  text: 'Die 67-Jährigen von 2040 leben heute schon hier.' },
      { at: CUES.Quotient + 0.5,    text: 'Der Altenquotient steigt — in jeder Variante der Vorausberechnung.' },
      { at: CUES.Quotient + 3.8,    text: 'In der Umlage heißt das: weniger Einzahler, mehr Empfänger.' },
      { at: CUES.KVdR + 0.5,        text: 'Anfang der 1960er deckten Rentner ihre Kosten fast vollständig selbst.' },
      { at: CUES.KVdR + 3.0,        text: 'Heute trägt die Erwerbsgeneration den Rest.' },
      { at: CUES.Beitrag + 0.5,     text: 'Arbeitnehmer- und Arbeitgeberanteil, €/Monat — schneller als die Inflation.' },
      { at: CUES.Beitrag + 3.8,     text: '2027 folgt durch die höhere Bemessungsgrenze der nächste Sprung.' },
      { at: CUES.Projektion + 0.5,  text: 'Allein die Demografie treibt den Beitragssatz über 20 %.' },
      { at: CUES.Projektion + 3.0,  text: 'Mit Kostendruck sind bis zu 26 % möglich.' },
      { at: CUES.Vergleich + 0.5,   text: 'Beitragsentwicklung je Versicherten seit 2006, indexiert.' },
      { at: CUES.Vergleich + 3.4,   text: 'Aber: PKV-Beiträge steigen in Sprüngen — Treppe statt Rampe.' },
      { at: CUES.Zeitfenster + 0.5, text: 'Die Versicherungspflichtgrenze springt 2027 außerplanmäßig.' },
      { at: CUES.Zeitfenster + 3.8, text: 'Wer dazwischen verdient, kann faktisch nur noch 2026 wechseln.' },
      { at: CUES.Quellen + 0.8, until: TOTAL - 0.5, text: 'Ergebnisoffen beraten lassen — wie es das Gesetz verlangt.' }
    ].sort(function (a, b) { return a.at - b.at; });

    var node = h('div', {
      style: {
        position: 'absolute', left: cfg.side, right: cfg.side, bottom: cfg.bottom, textAlign: 'center',
        font: '500 ' + cfg.size + 'px ' + B, lineHeight: 1.35, pointerEvents: 'none', opacity: 0
      }
    });

    DYN.push(function (T) {
      var active = null, end = Infinity;
      for (var i = 0; i < items.length; i++) {
        if (T < items[i].at) break;
        active = items[i];
        end = typeof active.until === 'number' ? active.until : (i + 1 < items.length ? items[i + 1].at : Infinity);
      }
      if (!active || T >= end) { node.style.opacity = 0; return; }
      var o = Math.min(1, (T - active.at) / CAPTION_FADE);
      if (isFinite(end)) o = Math.min(o, (end - T) / CAPTION_FADE);
      if (node.textContent !== active.text) node.textContent = active.text;
      node.style.opacity = clamp(o, 0, 1);
      node.style.color = T >= CUES.Quellen ? C.bg : C.ink;
    });

    return node;
  }

  // ── Assembly ──────────────────────────────────────────────────────────────
  // Every scene stays mounted for the whole piece; a shot only toggles
  // visibility at its cues. Nothing re-mounts, so nothing has to warm up again.

  function shot(from, to, child) {
    var node = h('div', { style: { position: 'absolute', inset: 0 } }, child);
    DYN.push(function (T) { node.style.visibility = (T >= from && T < to) ? 'visible' : 'hidden'; });
    return node;
  }

  function buildPiece(F) {
    return h('div', { style: { position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden' } },
      shot(CUES.Titel,       CUES.Demografie,  sceneTitel(F, CUES.Titel)),
      shot(CUES.Demografie,  CUES.Quotient,    sceneDemografie(F, CUES.Demografie,  CUES.Quotient - CUES.Demografie)),
      shot(CUES.Quotient,    CUES.KVdR,        sceneQuotient(F,   CUES.Quotient,    CUES.KVdR - CUES.Quotient)),
      shot(CUES.KVdR,        CUES.Beitrag,     sceneKVdR(F,       CUES.KVdR,        CUES.Beitrag - CUES.KVdR)),
      shot(CUES.Beitrag,     CUES.Projektion,  sceneBeitrag(F,    CUES.Beitrag,     CUES.Projektion - CUES.Beitrag)),
      shot(CUES.Projektion,  CUES.Vergleich,   sceneProjektion(F, CUES.Projektion,  CUES.Vergleich - CUES.Projektion)),
      shot(CUES.Vergleich,   CUES.Zeitfenster, sceneVergleich(F,  CUES.Vergleich,   CUES.Zeitfenster - CUES.Vergleich)),
      shot(CUES.Zeitfenster, CUES.Quellen,     sceneZeitfenster(F, CUES.Zeitfenster, CUES.Quellen - CUES.Zeitfenster)),
      shot(CUES.Quellen,     TOTAL + 1,        sceneQuellen(F, CUES.Quellen)),
      chrome(F),
      captions(F)
    );
  }

  /**
   * Mount the animation into `host`.
   *
   * @param {HTMLElement} host   container; the stage is centred and scaled to fit it
   * @param {string}      format 'square' | 'portrait' | 'landscape'
   * @returns {{seek: function(number): void, play: function(): void, pause: function(): void,
   *            duration: number, width: number, height: number}}
   */
  function mount(host, format) {
    var F = FORMATS[format] || FORMATS.square;
    DYN = [];

    var stage = h('div', {
      style: {
        position: 'relative', width: F.width + 'px', height: F.height + 'px',
        background: C.bg, overflow: 'hidden', transformOrigin: 'center',
        // Never let the flex host resize the stage: its width is the design
        // width, and fitting happens through the transform below. Without this,
        // a host narrower than the design width shrinks the box AND scales it,
        // so the piece renders at the square of the fit factor.
        flexShrink: 0
      }
    }, buildPiece(F));

    // Centre the stage in whatever box the host gives it. Done here rather than
    // in the page stylesheet so the animation can be dropped into an arbitrary
    // container — a section on someone else's page — with no CSS to copy along.
    host.textContent = '';
    Object.assign(host.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' });
    host.appendChild(stage);

    var updaters = DYN;
    DYN = null;

    function seek(T) {
      for (var i = 0; i < updaters.length; i++) updaters[i](T);
    }

    // Scale the fixed-size stage to fill its container. At a viewport of exactly
    // width × height the factor is 1 — which is what a pixel-exact capture wants.
    function fit() {
      var scale = Math.min(host.clientWidth / F.width, host.clientHeight / F.height);
      stage.style.transform = 'scale(' + scale + ')';
    }
    fit();
    if (typeof ResizeObserver === 'function') new ResizeObserver(fit).observe(host);
    window.addEventListener('resize', fit);

    var raf = null, origin = 0, parked = 0;

    function frame(now) {
      parked = ((now - origin) / 1000) % TOTAL;
      seek(parked);
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (raf != null) return;
      raf = requestAnimationFrame(function (now) {
        origin = now - parked * 1000;
        frame(now);
      });
    }
    function pause() {
      if (raf == null) return;
      cancelAnimationFrame(raf);
      raf = null;
    }

    seek(0);

    return {
      play: play,
      pause: pause,
      /** Park on one deterministic frame — what the frame-capture tool drives. */
      seek: function (T) { pause(); parked = clamp(T, 0, TOTAL); seek(parked); },
      duration: TOTAL,
      width: F.width,
      height: F.height,
      format: format,
      scenes: SCENES
    };
  }

  global.PKVAnimation = {
    mount: mount,
    formats: FORMATS,
    scenes: SCENES,
    cues: CUES,
    duration: TOTAL
  };
})(window);
