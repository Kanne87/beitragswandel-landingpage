// PKV-Verkaufsstory als 9:16-Animation — Classical (Cormorant Garamond / Lora, Gold als Strich)
const { CompositionStage, useComposition, Shot, Captions, Easing, clamp } = window;
const C = { bg:'#f3f2f2', ink:'#201f1d', gold:'#b68235', g700:'#7d5411', g400:'#e1ad66', g200:'#ffe3bf', g100:'#fff3e4',
  n200:'#eae7e7', n400:'#bab6b6', n500:'#9b9797', n600:'#7d7979', n700:'#605d5d', div:'rgba(32,31,29,0.16)' };
const H = '"Cormorant Garamond", Georgia, serif';
const B = '"Lora", Georgia, serif';
const MOTION = {
  enter(T, s, d = 0.8) { const p = clamp((T - s) / d, 0, 1), e = Easing.easeOutCubic(p);
    return { opacity: e, transform: `translateY(${(1 - e) * 44}px)` }; },
  draw(T, s, d = 1.2) { return Easing.easeInOutCubic(clamp((T - s) / d, 0, 1)); },
  pop(T, s, d = 0.55) { const p = clamp((T - s) / d, 0, 1);
    return { opacity: Math.min(1, p * 3), transform: `scale(${0.7 + 0.3 * Easing.easeOutBack(p)})`, transformOrigin: '50% 50%', transformBox: 'fill-box' }; }
};
const fade = (T, s, d = 0.6) => ({ opacity: clamp((T - s) / d, 0, 1) });
const PathDraw = ({ d, stroke, w, p, dash }) => (
  <path d={d} stroke={stroke} strokeWidth={w} fill="none" strokeLinecap="round"
    pathLength="1" strokeDasharray={dash || '1'} strokeDashoffset={dash ? 0 : 1 - p}
    style={dash ? { opacity: p } : null} />
);

function Scene({ T, s, dur, headline, hSize = 44, fact, factAt = 3.4, children, chartZoom = true }) {
  const z = 1 + (chartZoom ? 0.035 * clamp((T - s) / dur, 0, 1) : 0);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      padding: '150px 76px 205px', boxSizing: 'border-box', fontFamily: B, color: C.ink }}>
      <h1 style={{ fontFamily: H, fontWeight: 500, fontSize: hSize, lineHeight: 1.1, margin: 0, textWrap: 'pretty', ...MOTION.enter(T, s + 0.15) }}>{headline}</h1>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: `scale(${z})` }}>{children}</div>
      {fact ? <p style={{ fontSize: 24, lineHeight: 1.5, margin: 0, textWrap: 'pretty', ...MOTION.enter(T, s + factAt) }}>{fact}</p> : null}
    </div>
  );
}

function SceneTitel({ T, s }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '0 84px', boxSizing: 'border-box', color: C.ink }}>
      <div style={{ height: 1, background: C.gold, transform: `scaleX(${MOTION.draw(T, s + 0.2, 0.9)})`, transformOrigin: 'left' }}></div>
      <h1 style={{ fontFamily: H, fontWeight: 500, fontSize: 104, lineHeight: 1.02, margin: '36px 0 0', ...MOTION.enter(T, s + 0.5) }}>
        GKV oder<br />PKV<span style={{ color: C.gold }}>.</span>
      </h1>
      <p style={{ fontFamily: H, fontStyle: 'italic', fontWeight: 500, fontSize: 50, color: C.g700, margin: '22px 0 0', ...MOTION.enter(T, s + 1.0) }}>Die Fakten.</p>
      <p style={{ fontFamily: B, fontSize: 27, color: C.n600, margin: '40px 0 0', ...MOTION.enter(T, s + 1.5) }}>Sieben Grafiken, eine Entscheidung.</p>
      <div style={{ height: 1, background: C.gold, marginTop: 40, transform: `scaleX(${MOTION.draw(T, s + 0.5, 0.9)})`, transformOrigin: 'left' }}></div>
    </div>
  );
}

function SceneDemografie({ T, s, dur }) {
  const cols = [
    { x: 60, year: '1990', acc: 63, mid: 269, low: 88, pct: '15 %', py: 128 },
    { x: 400, year: '2024', acc: 84, mid: 256, low: 80, pct: '20 %', py: 138 },
    { x: 740, year: '2070*', acc: 126, mid: 223, low: 71, pct: '30 %', py: 160 }
  ];
  return (
    <Scene T={T} s={s} dur={dur} headline="Schon 2035 ist jede vierte Person 67 oder älter."
      fact={<span>Die Zahl der Hochaltrigen (80+) steigt von 6,1 Mio. auf bis zu <strong style={{ fontWeight: 600, color: C.g700 }}>9,8 Mio. (2050)</strong>.</span>}>
      <svg viewBox="0 0 960 620" style={{ width: '100%', maxHeight: 500 }}>
        <text x="60" y="52" fontFamily={B} fontSize="27" fill={C.g700} style={fade(T, s + 0.6)}>Anteil der Bevölkerung 67+</text>
        {cols.map((c, i) => {
          const e = fade(T, s + 0.8 + i * 0.6, 0.5);
          const dp = MOTION.draw(T, s + 1.0 + i * 0.6, 0.9);
          return (
            <g key={c.year}>
              <g style={e}>
                <rect x={c.x} y={88 + c.acc} width="160" height={c.mid} fill={C.n200} stroke={C.n400}></rect>
                <rect x={c.x} y={88 + c.acc + c.mid} width="160" height={c.low} fill="none" stroke={C.n400}></rect>
                <text x={c.x + 80} y={88 + c.acc + c.mid / 2 + 10} textAnchor="middle" fontFamily={B} fontSize="24" fill={C.n600}>20–66</text>
                <text x={c.x + 80} y={88 + c.acc + c.mid + c.low / 2 + 8} textAnchor="middle" fontFamily={B} fontSize="22" fill={C.n600}>unter 20</text>
                <text x={c.x + 80} y="612" textAnchor="middle" fontFamily={B} fontSize="26" fill={C.n600}>{c.year}</text>
                <rect x={c.x} y="88" width="160" height={Math.max(0.01, c.acc * dp)} fill={C.g200} stroke={C.gold} strokeWidth="2" opacity={dp > 0 ? 1 : 0}></rect>
              </g>
              <text x={c.x + 80} y={c.py} textAnchor="middle" fontFamily={B} fontSize="30" fontWeight="600" fill={C.g700}
                style={MOTION.pop(T, s + 1.5 + i * 0.6)}>{c.pct}</text>
            </g>
          );
        })}
      </svg>
    </Scene>
  );
}

function SceneQuotient({ T, s, dur }) {
  return (
    <Scene T={T} s={s} dur={dur} hSize={42} headline="Heute tragen drei Erwerbstätige einen Rentner. 2070 vielleicht nur noch 1,6."
      fact={<span>Rentner je 100 Erwerbstätige: <strong style={{ fontWeight: 600 }}>weniger Einzahler, mehr Empfänger</strong> — zugleich.</span>} factAt={3.8}>
      <svg viewBox="0 0 960 600" style={{ width: '100%', maxHeight: 500 }}>
        <g stroke={C.n200} style={fade(T, s + 0.5)}>
          <line x1="60" y1="374" x2="920" y2="374"></line><line x1="60" y1="249" x2="920" y2="249"></line><line x1="60" y1="123" x2="920" y2="123"></line>
        </g>
        <g fontFamily={B} fontSize="22" fill={C.n500} style={fade(T, s + 0.5)}>
          <text x="50" y="381" textAnchor="end">20</text><text x="50" y="256" textAnchor="end">40</text><text x="50" y="130" textAnchor="end">60</text>
          <text x="71" y="588" textAnchor="middle" fontSize="26" fill={C.n600}>1991</text>
          <text x="425" y="588" textAnchor="middle" fontSize="26" fill={C.n600}>2024</text>
          <text x="880" y="588" textAnchor="middle" fontSize="26" fill={C.n600}>2070</text>
        </g>
        <polygon points="425,293 920,230 920,117" fill={C.g100} style={fade(T, s + 2.3, 0.8)}></polygon>
        <PathDraw d="M 425 293 L 920 230" stroke={C.gold} w={3} dash="0.05 0.04" p={MOTION.draw(T, s + 2.2, 0.8)} />
        <PathDraw d="M 425 293 L 920 117" stroke={C.gold} w={3} dash="0.05 0.04" p={MOTION.draw(T, s + 2.2, 0.8)} />
        <PathDraw d="M 71 349 C 200 330, 330 312, 425 293" stroke={C.ink} w={4} p={MOTION.draw(T, s + 0.8, 1.3)} />
        <circle cx="71" cy="349" r="7" fill={C.ink} style={MOTION.pop(T, s + 0.8)}></circle>
        <circle cx="425" cy="293" r="7" fill={C.ink} style={MOTION.pop(T, s + 2.0)}></circle>
        <circle cx="920" cy="230" r="7" fill={C.gold} style={MOTION.pop(T, s + 2.9)}></circle>
        <circle cx="920" cy="117" r="7" fill={C.gold} style={MOTION.pop(T, s + 3.1)}></circle>
        <g fontFamily={B} fontSize="30">
          <text x="80" y="320" fill={C.ink} style={MOTION.pop(T, s + 1.1)}>24</text>
          <text x="396" y="258" fill={C.ink} fontWeight="600" style={MOTION.pop(T, s + 2.1)}>33</text>
          <text x="882" y="272" fill={C.g700} fontWeight="600" style={MOTION.pop(T, s + 3.0)}>43</text>
          <text x="882" y="100" fill={C.g700} fontWeight="600" style={MOTION.pop(T, s + 3.2)}>61</text>
        </g>
        <g fontFamily={B} fontSize="24" fill={C.g700} style={fade(T, s + 3.3)}>
          <text x="640" y="330">günstigster Fall</text>
          <text x="600" y="150">ungünstigster Fall</text>
        </g>
      </svg>
    </Scene>
  );
}

function SceneKVdR({ T, s, dur }) {
  return (
    <Scene T={T} s={s} dur={dur} headline="Rentner decken nur noch rund 40 % ihrer Gesundheitskosten selbst."
      fact={<span>Die Differenz finanzieren die Beiträge der Erwerbstätigen — <strong style={{ fontWeight: 600 }}>Jahr für Jahr, systematisch</strong>.</span>} factAt={3.2}>
      <svg viewBox="0 0 960 560" style={{ width: '100%', maxHeight: 500 }}>
        <g stroke={C.n200} style={fade(T, s + 0.5)}>
          <line x1="60" y1="480" x2="920" y2="480"></line><line x1="60" y1="260" x2="920" y2="260"></line><line x1="60" y1="40" x2="920" y2="40"></line>
        </g>
        <g fontFamily={B} fontSize="22" fill={C.n500} style={fade(T, s + 0.5)}>
          <text x="52" y="47" textAnchor="end" fontSize="19">100 %</text><text x="50" y="267" textAnchor="end">50 %</text><text x="50" y="487" textAnchor="end">0 %</text>
          <text x="70" y="540" textAnchor="middle" fontSize="24" fill={C.n600}>1960</text>
          <text x="590" y="540" textAnchor="middle" fontSize="24" fill={C.n600}>2000</text>
          <text x="890" y="540" textAnchor="middle" fontSize="24" fill={C.n600}>heute</text>
        </g>
        <PathDraw d="M 60 45 C 260 60, 420 160, 590 288 C 700 372, 820 306, 907 304" stroke={C.gold} w={5} p={MOTION.draw(T, s + 0.7, 1.7)} />
        <circle cx="60" cy="45" r="8" fill={C.gold} style={MOTION.pop(T, s + 0.7)}></circle>
        <circle cx="590" cy="288" r="8" fill={C.gold} style={MOTION.pop(T, s + 1.7)}></circle>
        <circle cx="907" cy="304" r="8" fill={C.gold} style={MOTION.pop(T, s + 2.5)}></circle>
        <g fontFamily={B} fontSize="30">
          <text x="86" y="62" fill={C.ink} style={MOTION.pop(T, s + 0.9)}>≈ 100 %</text>
          <text x="560" y="342" fill={C.ink} style={MOTION.pop(T, s + 1.9)}>43,6 %</text>
          <text x="898" y="268" textAnchor="end" fill={C.g700} fontWeight="600" style={MOTION.pop(T, s + 2.7)}>≈ 40 %</text>
        </g>
      </svg>
    </Scene>
  );
}

function SceneBeitrag({ T, s, dur }) {
  const bars = [
    { x: 60, h: 255.6, v: '639 €', yr: '2015' }, { x: 185, h: 294.4, v: '736 €', yr: '2020' },
    { x: 310, h: 323.2, v: '808 €', yr: '2023' }, { x: 435, h: 337.6, v: '844 €', yr: '2024' },
    { x: 560, h: 377.2, v: '943 €', yr: '2025' }, { x: 685, h: 406.9, v: '1.017 €', yr: '2026', hot: true },
    { x: 810, h: 440, v: '~1.100 €', yr: '2027*', hot: true, proj: true }
  ];
  return (
    <Scene T={T} s={s} dur={dur} headline={<span>Der GKV-Höchstbeitrag: <span style={{ color: C.g700 }}>+59 %</span> in elf Jahren.</span>}
      fact={<span>Inklusive Pflegeversicherung 2026 bereits rund <strong style={{ fontWeight: 600 }}>1.261 €/Monat</strong> (kinderlos).</span>} factAt={4.2}>
      <svg viewBox="0 0 960 580" style={{ width: '100%', maxHeight: 500 }}>
        <defs><pattern id="hatchAn" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="12" stroke={C.gold} strokeWidth="3"></line></pattern></defs>
        {bars.map((b, i) => {
          const p = MOTION.draw(T, s + 0.6 + i * 0.35, 0.7);
          const h = b.h * p;
          return (
            <g key={b.yr}>
              <rect x={b.x} y={500 - h} width="90" height={Math.max(0.01, h)}
                fill={b.proj ? 'url(#hatchAn)' : b.hot ? C.g200 : C.n200}
                fillOpacity={b.proj ? 0.35 : 1}
                stroke={b.hot ? C.gold : C.n400} strokeWidth={b.hot ? 2 : 1}
                strokeDasharray={b.proj ? '8 6' : null}></rect>
              <text x={b.x + 45} y={500 - b.h - 14} textAnchor="middle" fontFamily={B} fontSize="27"
                fontWeight={b.hot ? 600 : 400} fill={b.hot ? C.g700 : C.ink}
                style={MOTION.pop(T, s + 1.1 + i * 0.35)}>{b.v}</text>
              <text x={b.x + 45} y="545" textAnchor="middle" fontFamily={B} fontSize="24" fill={C.n600}
                style={fade(T, s + 0.6 + i * 0.35)}>{b.yr}</text>
            </g>
          );
        })}
      </svg>
    </Scene>
  );
}

function SceneProjektion({ T, s, dur }) {
  return (
    <Scene T={T} s={s} dur={dur} headline="Seriöse Projektionen: GKV-Beitrag bis 2050 zwischen 20 und 26 %."
      fact={<span>Der Gesamtsozialbeitrag könnte 2035 <strong style={{ fontWeight: 600 }}>rund 50 %</strong> erreichen.</span>} factAt={3.4}>
      <svg viewBox="0 0 960 600" style={{ width: '100%', maxHeight: 500 }}>
        <g stroke={C.n200} style={fade(T, s + 0.4)}>
          <line x1="60" y1="481" x2="920" y2="481"></line><line x1="60" y1="335" x2="920" y2="335"></line>
          <line x1="60" y1="188" x2="920" y2="188"></line><line x1="60" y1="60" x2="920" y2="60"></line>
        </g>
        <g fontFamily={B} fontSize="22" fill={C.n500} style={fade(T, s + 0.4)}>
          <text x="50" y="488" textAnchor="end">16 %</text><text x="50" y="342" textAnchor="end">20 %</text>
          <text x="50" y="195" textAnchor="end">24 %</text><text x="52" y="67" textAnchor="end" fontSize="19">27,5 %</text>
          <text x="70" y="580" textAnchor="middle" fontSize="26" fill={C.n600}>2026</text>
          <text x="382" y="580" textAnchor="middle" fontSize="26" fill={C.n600}>2035</text>
          <text x="890" y="580" textAnchor="middle" fontSize="26" fill={C.n600}>2050</text>
        </g>
        <polygon points="60,426 382,363 920,327 920,114 382,283 60,426" fill={C.g100} style={fade(T, s + 1.6, 1.0)}></polygon>
        <PathDraw d="M 60 426 L 382 283 L 920 114" stroke={C.gold} w={3} dash="0.05 0.04" p={MOTION.draw(T, s + 1.2, 1.2)} />
        <PathDraw d="M 60 426 L 382 363 L 920 327" stroke={C.gold} w={3} dash="0.05 0.04" p={MOTION.draw(T, s + 1.2, 1.2)} />
        <circle cx="60" cy="426" r="8" fill={C.ink} style={MOTION.pop(T, s + 0.7)}></circle>
        <g fontFamily={B} fontSize="29">
          <text x="82" y="452" fill={C.ink} fontWeight="600" style={MOTION.pop(T, s + 0.9)}>17,5 %</text>
          <text x="910" y="372" textAnchor="end" fill={C.g700} fontWeight="600" style={MOTION.pop(T, s + 2.5)}>20,2 % nur Demografie</text>
          <text x="910" y="90" textAnchor="end" fill={C.g700} fontWeight="600" style={MOTION.pop(T, s + 2.8)}>26 % Kostendruck</text>
        </g>
      </svg>
    </Scene>
  );
}

function SceneSysteme({ T, s, dur }) {
  const box = { border: `1px solid ${C.n400}`, padding: '22px 20px', fontSize: 24, lineHeight: 1.4, textAlign: 'center' };
  const gbox = { ...box, border: `1px solid ${C.gold}` };
  return (
    <Scene T={T} s={s} dur={dur} headline="Zwei Systeme, zwei Logiken." chartZoom={false}
      fact={<span>Die PKV hat dafür <strong style={{ fontWeight: 600, color: C.g700 }}>rund 356 Mrd. €</strong> zurückgelegt — ca. 40.600 € je Versicherten.</span>} factAt={4.4}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0 36px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontFamily: H, fontWeight: 600, fontSize: 36, margin: 0, ...MOTION.enter(T, s + 0.5) }}>GKV — Umlage</h2>
          <div style={{ ...box, ...MOTION.enter(T, s + 0.9) }}>Beiträge der heute Erwerbstätigen</div>
          <div style={{ textAlign: 'center', color: C.n500, fontSize: 30, lineHeight: 1, ...fade(T, s + 1.3) }}>↓</div>
          <div style={{ ...box, ...MOTION.enter(T, s + 1.5) }}>fließen sofort ab an heutige Rentner und Pflegebedürftige</div>
          <p style={{ fontSize: 23, lineHeight: 1.45, color: C.n700, margin: '6px 0 0', textWrap: 'pretty', ...fade(T, s + 2.0) }}>Kein Kapitalstock — das System hängt am Verhältnis Einzahler : Empfänger.</p>
        </div>
        <div style={{ background: C.div, alignSelf: 'stretch', transform: `scaleY(${MOTION.draw(T, s + 0.5, 1.0)})`, transformOrigin: 'top' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontFamily: H, fontWeight: 600, fontSize: 36, margin: 0, color: C.g700, ...MOTION.enter(T, s + 2.3) }}>PKV — Kapitaldeckung</h2>
          <div style={{ ...gbox, ...MOTION.enter(T, s + 2.6) }}>Sie zahlen heute mehr, als Sie kosten</div>
          <div style={{ textAlign: 'center', color: C.g700, fontSize: 30, lineHeight: 1, ...fade(T, s + 3.0) }}>↓</div>
          <div style={{ ...gbox, borderWidth: 2, ...MOTION.enter(T, s + 3.2) }}><strong style={{ fontWeight: 600 }}>Ihre Alterungsrückstellung</strong> wird verzinslich angelegt</div>
          <div style={{ textAlign: 'center', color: C.g700, fontSize: 30, lineHeight: 1, ...fade(T, s + 3.6) }}>↓</div>
          <div style={{ ...gbox, ...MOTION.enter(T, s + 3.8) }}>und dämpft Ihren Beitrag im Alter</div>
        </div>
      </div>
    </Scene>
  );
}

function SceneVergleich({ T, s, dur }) {
  return (
    <Scene T={T} s={s} dur={dur} hSize={42} headline="„Die PKV explodiert im Alter“? Der Durchschnitt sagt etwas anderes."
      fact={<span>Langfristig verliefen beide Systeme <strong style={{ fontWeight: 600 }}>nahezu parallel</strong> — die PKV im Schnitt sogar etwas langsamer.</span>} factAt={3.6}>
      <svg viewBox="0 0 960 560" style={{ width: '100%', maxHeight: 500 }}>
        <g stroke={C.n200} style={fade(T, s + 0.4)}>
          <line x1="60" y1="470" x2="920" y2="470"></line><line x1="60" y1="308" x2="920" y2="308"></line><line x1="60" y1="146" x2="920" y2="146"></line>
        </g>
        <g fontFamily={B} fontSize="22" fill={C.n500} style={fade(T, s + 0.4)}>
          <text x="50" y="477" textAnchor="end">100</text><text x="50" y="315" textAnchor="end">150</text><text x="50" y="153" textAnchor="end">200</text>
          <text x="70" y="520" textAnchor="middle" fontSize="24" fill={C.n600}>2006</text>
          <text x="890" y="520" textAnchor="middle" fontSize="24" fill={C.n600}>2026</text>
        </g>
        <PathDraw d="M 60 470 C 350 440, 650 300, 920 97" stroke={C.n500} w={4} p={MOTION.draw(T, s + 0.8, 1.6)} />
        <PathDraw d="M 60 470 C 350 450, 650 340, 920 162" stroke={C.gold} w={5} p={MOTION.draw(T, s + 1.2, 1.6)} />
        <circle cx="920" cy="97" r="8" fill={C.n500} style={MOTION.pop(T, s + 2.4)}></circle>
        <circle cx="920" cy="162" r="8" fill={C.gold} style={MOTION.pop(T, s + 2.8)}></circle>
        <g fontFamily={B} fontSize="28">
          <text x="60" y="84" fill={C.n600} style={MOTION.pop(T, s + 2.5)}>GKV +3,9 %/Jahr → 215</text>
          <text x="60" y="128" fill={C.g700} fontWeight="600" style={MOTION.pop(T, s + 2.9)}>PKV +3,4 %/Jahr → 195</text>
        </g>
      </svg>
    </Scene>
  );
}

function SceneAbwaegung({ T, s, dur }) {
  const pro = ['Eigene Kapitaldeckung statt Abhängigkeit von schrumpfenden Folgegenerationen',
    'Beitrag nach Tarif und Gesundheit — nicht nach Einkommen',
    'Vertraglich garantierte Leistungen; Ø-Dynamik langfristig unter der GKV'];
  const con = ['Beiträge steigen in Sprüngen — zum 1.1.2026 im Ø ~13 %',
    'Keine beitragsfreie Familienversicherung — jedes Kind kostet eigene Prämie',
    'Rückkehr in die GKV ab 55 praktisch versperrt (§ 6 Abs. 3a SGB V)'];
  const li = { borderBottom: `1px solid ${C.div}`, paddingBottom: 16, fontSize: 24, lineHeight: 1.42 };
  return (
    <Scene T={T} s={s} dur={dur} headline="Fair betrachtet: Was dafür spricht — und was dagegen." chartZoom={false}
      fact={<span>Die Entscheidung ist individuell. <strong style={{ fontWeight: 600 }}>Erst rechnen, dann wechseln.</strong></span>} factAt={3.8}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0 34px', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontFamily: H, fontWeight: 600, fontSize: 34, margin: '0 0 18px', color: C.g700, ...MOTION.enter(T, s + 0.4) }}>Dafür</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pro.map((p, i) => <li key={i} style={{ ...li, ...MOTION.enter(T, s + 0.8 + i * 0.55) }}>{p}</li>)}
          </ul>
        </div>
        <div style={{ background: C.div, alignSelf: 'stretch', transform: `scaleY(${MOTION.draw(T, s + 0.4, 1.0)})`, transformOrigin: 'top' }}></div>
        <div>
          <h2 style={{ fontFamily: H, fontWeight: 600, fontSize: 34, margin: '0 0 18px', ...MOTION.enter(T, s + 0.6) }}>Dagegen</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {con.map((p, i) => <li key={i} style={{ ...li, ...MOTION.enter(T, s + 1.05 + i * 0.55) }}>{p}</li>)}
          </ul>
        </div>
      </div>
    </Scene>
  );
}

function SceneZeitfenster({ T, s, dur }) {
  return (
    <Scene T={T} s={s} dur={dur} headline="2027 schließt sich die Tür ein Stück weiter." chartZoom={false}>
      <p style={{ fontSize: 23, lineHeight: 1.5, margin: '0 0 6px', color: C.n700, textWrap: 'pretty', ...MOTION.enter(T, s + 0.4) }}>
        Die Versicherungspflichtgrenze springt von <strong style={{ fontWeight: 600, color: C.ink }}>77.400 €</strong> auf voraussichtlich <strong style={{ fontWeight: 600, color: C.g700 }}>~84.600 €</strong>.
      </p>
      <svg viewBox="0 0 960 380" style={{ width: '100%', maxHeight: 500 }}>
        <path d="M 60 190 L 920 190" stroke={C.n400} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - MOTION.draw(T, s + 0.7, 1.0)}></path>
        <line x1="740" y1="70" x2="740" y2="310" stroke={C.gold} strokeWidth="2" strokeDasharray="8 6" style={fade(T, s + 2.5)}></line>
        <g fontFamily={B}>
          <circle cx="180" cy="190" r="9" fill={C.ink} style={MOTION.pop(T, s + 1.3)}></circle>
          <g style={fade(T, s + 1.4)}>
            <text x="180" y="140" textAnchor="middle" fontSize="27" fontWeight="600" fill={C.ink}>30.09.2026</text>
            <text x="180" y="246" textAnchor="middle" fontSize="24" fill={C.n600}>letzte GKV-Kündigung</text>
          </g>
          <circle cx="470" cy="190" r="9" fill={C.ink} style={MOTION.pop(T, s + 1.9)}></circle>
          <g style={fade(T, s + 2.0)}>
            <text x="470" y="140" textAnchor="middle" fontSize="27" fontWeight="600" fill={C.ink}>01.12.2026</text>
            <text x="470" y="246" textAnchor="middle" fontSize="24" fill={C.n600}>letzter PKV-Beginn</text>
          </g>
          <circle cx="740" cy="190" r="9" fill={C.gold} style={MOTION.pop(T, s + 2.6)}></circle>
          <g style={fade(T, s + 2.7)}>
            <text x="740" y="52" textAnchor="middle" fontSize="27" fontWeight="600" fill={C.g700}>01.01.2027</text>
            <text x="740" y="344" textAnchor="middle" fontSize="24" fill={C.g700}>neue Grenze ~84.600 €</text>
          </g>
        </g>
      </svg>
      <div style={{ border: `1px solid ${C.gold}`, padding: '22px 28px', marginTop: 6, ...MOTION.enter(T, s + 3.8) }}>
        <p style={{ fontFamily: H, fontSize: 32, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Verdienen Sie zwischen 77.400 € und 84.600 €?</p>
        <p style={{ fontSize: 21, lineHeight: 1.45, margin: '10px 0 0', color: C.n700, textWrap: 'pretty' }}>Dann lohnt jetzt eine ergebnisoffene Beratung — mit dokumentiertem Vergleich beider Seiten.</p>
      </div>
    </Scene>
  );
}

function SceneQuellen({ T, s, total }) {
  const out = 1 - clamp((T - (total - 0.5)) / 0.5, 0, 1);
  const src = ['Destatis, 16. koordinierte Bevölkerungsvorausberechnung (2025)',
    'WIP/WISO 2004 · WIP 2006–2026 (PKV-nahes Institut)',
    'BMAS, BMG, vdek · IGES/DAK 2026',
    'PKV-Verband Rechenschaftsbericht 2026 · BaFin-Studie 2024',
    'GKV-Beitragssatzstabilisierungsgesetz v. 10.07.2026 — 2027-Werte: Hochrechnung',
    'Projektionen sind „Wenn-Dann“-Rechnungen, keine Vorhersagen.'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.ink, color: C.bg, opacity: out * clamp((T - s) / 0.5, 0, 1),
      display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 84px', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: B, fontSize: 20, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.g400, ...fade(T, s + 0.3) }}>Quellen &amp; Hinweise</div>
      <h1 style={{ fontFamily: H, fontWeight: 500, fontSize: 62, lineHeight: 1.06, margin: '24px 0 0', ...MOTION.enter(T, s + 0.5) }}>
        Erst rechnen,<br />dann wechseln<span style={{ color: C.g400 }}>.</span>
      </h1>
      <div style={{ height: 1, background: C.g400, opacity: 0.5, margin: '34px 0', transform: `scaleX(${MOTION.draw(T, s + 0.8, 0.9)})`, transformOrigin: 'left' }}></div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: B, fontSize: 20, lineHeight: 1.4, color: C.n400 }}>
        {src.map((t, i) => <li key={i} style={fade(T, s + 1.0 + i * 0.25)}>{t}</li>)}
      </ul>
    </div>
  );
}

function Chrome({ T, CUES, total }) {
  const order = ['Demografie', 'Quotient', 'KVdR', 'Beitrag', 'Projektion', 'Vergleich', 'Zeitfenster'];
  let num = 0;
  order.forEach((n, i) => { if (T >= CUES[n]) num = i + 1; });
  const dark = T >= CUES.Quellen;
  const showNum = num > 0 && !dark;
  return (
    <div style={{ position: 'absolute', left: 76, right: 76, top: 56 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 16,
        borderBottom: `1px solid ${dark ? 'rgba(243,242,242,0.2)' : C.div}`, opacity: clamp((T - 0.3) / 0.6, 0, 1) }}>
        <span style={{ fontFamily: B, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: dark ? C.g400 : C.g700 }}>GKV oder PKV · Die Fakten</span>
        <span style={{ fontFamily: B, fontSize: 20, color: C.n500, fontVariantNumeric: 'tabular-nums', opacity: showNum ? 1 : 0 }}>{num} / 7</span>
      </div>
      <div style={{ height: 2, background: dark ? C.g400 : C.gold, width: `${(clamp(T / total, 0, 1) * 100).toFixed(2)}%`, marginTop: -1 }}></div>
    </div>
  );
}

function Piece({ captions }) {
  const { T, CUES, authoredTotal } = useComposition();
  const dark = T >= CUES.Quellen;
  const items = [
    { at: CUES.Titel + 1.8, text: 'Was Sie vor der Entscheidung wissen sollten.' },
    { at: CUES.Demografie + 0.5, text: 'Der Anteil der Menschen über 67 steigt von 15 % auf 30 %.' },
    { at: CUES.Demografie + 3.8, text: 'Die 67-Jährigen von 2040 leben heute schon hier.' },
    { at: CUES.Quotient + 0.5, text: 'Der Altenquotient steigt — in jeder Variante der Vorausberechnung.' },
    { at: CUES.Quotient + 3.8, text: 'In der Umlage heißt das: weniger Einzahler, mehr Empfänger.' },
    { at: CUES.KVdR + 0.5, text: 'Anfang der 1960er deckten Rentner ihre Kosten fast vollständig selbst.' },
    { at: CUES.KVdR + 3.0, text: 'Heute trägt die Erwerbsgeneration den Rest.' },
    { at: CUES.Beitrag + 0.5, text: 'Arbeitnehmer- und Arbeitgeberanteil, €/Monat — schneller als die Inflation.' },
    { at: CUES.Beitrag + 3.8, text: '2027 folgt durch die höhere Bemessungsgrenze der nächste Sprung.' },
    { at: CUES.Projektion + 0.5, text: 'Allein die Demografie treibt den Beitragssatz über 20 %.' },
    { at: CUES.Projektion + 3.0, text: 'Mit Kostendruck sind bis zu 26 % möglich.' },
    { at: CUES.Vergleich + 0.5, text: 'Beitragsentwicklung je Versicherten seit 2006, indexiert.' },
    { at: CUES.Vergleich + 3.4, text: 'Aber: PKV-Beiträge steigen in Sprüngen — Treppe statt Rampe.' },
    { at: CUES.Zeitfenster + 0.5, text: 'Die Versicherungspflichtgrenze springt 2027 außerplanmäßig.' },
    { at: CUES.Zeitfenster + 3.8, text: 'Wer dazwischen verdient, kann faktisch nur noch 2026 wechseln.' },
    { at: CUES.Quellen + 0.8, until: authoredTotal - 0.5, text: 'Ergebnisoffen beraten lassen — wie es das Gesetz verlangt.' }
  ];
  return (
    <div data-screen-label={'t=' + Math.floor(T) + 's'} style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden' }}>
      <Shot from={CUES.Titel} to={CUES.Demografie}><SceneTitel T={T} s={CUES.Titel} /></Shot>
      <Shot from={CUES.Demografie} to={CUES.Quotient}><SceneDemografie T={T} s={CUES.Demografie} dur={CUES.Quotient - CUES.Demografie} /></Shot>
      <Shot from={CUES.Quotient} to={CUES.KVdR}><SceneQuotient T={T} s={CUES.Quotient} dur={CUES.KVdR - CUES.Quotient} /></Shot>
      <Shot from={CUES.KVdR} to={CUES.Beitrag}><SceneKVdR T={T} s={CUES.KVdR} dur={CUES.Beitrag - CUES.KVdR} /></Shot>
      <Shot from={CUES.Beitrag} to={CUES.Projektion}><SceneBeitrag T={T} s={CUES.Beitrag} dur={CUES.Projektion - CUES.Beitrag} /></Shot>
      <Shot from={CUES.Projektion} to={CUES.Vergleich}><SceneProjektion T={T} s={CUES.Projektion} dur={CUES.Vergleich - CUES.Projektion} /></Shot>
      <Shot from={CUES.Vergleich} to={CUES.Zeitfenster}><SceneVergleich T={T} s={CUES.Vergleich} dur={CUES.Zeitfenster - CUES.Vergleich} /></Shot>
      <Shot from={CUES.Zeitfenster} to={CUES.Quellen}><SceneZeitfenster T={T} s={CUES.Zeitfenster} dur={CUES.Quellen - CUES.Zeitfenster} /></Shot>
      <Shot from={CUES.Quellen} to={authoredTotal + 1}><SceneQuellen T={T} s={CUES.Quellen} total={authoredTotal} /></Shot>
      <Chrome T={T} CUES={CUES} total={authoredTotal} />
      {captions ? <Captions items={items} style={{ font: '500 26px ' + B, lineHeight: 1.35, color: dark ? C.bg : C.ink, textShadow: 'none', bottom: '4.5%', left: '8%', right: '8%' }} /> : null}
    </div>
  );
}

function PKVEmbed() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CompositionStage width={480} height={480} bg="#f3f2f2" scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        <div style={{ position: 'absolute', width: 1080, height: 1080, transform: 'scale(0.4444444)', transformOrigin: 'top left' }}>
          <Piece captions={true} />
        </div>
      </CompositionStage>
    </div>
  );
}
window.PKVEmbed = PKVEmbed;
