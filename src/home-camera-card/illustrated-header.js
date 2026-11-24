// ── Illustrated header ───────────────────────────────────────────────────────
// A camera on a wall, top right of a 200 × 80 picture drawn at the banner's right edge (its left half stays open:
// the card's text sits there), over a 10 px parquet strip that runs the banner's whole width.
// state: live (red recording light, field of view), motion (someone framed in the field of view), privacy (lens
// shut, no field of view) or offline (camera greyed, no signal). `uid` keeps each card's gradient ids apart.
// Night: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day picture
// after sunset).
export function hcIsNight(hass, config) {
  const theme = config?.illustration_theme;
  if (theme === 'night') return true;
  if (theme === 'day') return false;
  return !!hass?.themes?.darkMode;
}

export function hcSceneSvg(state, uid) {
  const watching = state === 'live' || state === 'motion';
  const lens =
    state === 'privacy'
      ? '<circle class="hc-lens shut" cx="-12" cy="6" r="4.2"/><path class="hc-shutter" d="M-16 6h8"/>'
      : `<circle class="hc-lens" cx="-12" cy="6" r="4.2"/><circle class="hc-glint" cx="-13.4" cy="4.6" r="1.1"/>`;
  const led = watching ? '<circle class="hc-rec" cx="4" cy="3" r="1.2"/>' : '';
  const fov = watching
    ? `<path class="hc-fov" d="M155 25 L92 80 H174Z" fill="url(#hc-fov-${uid})"/>`
    : '';
  const person =
    state === 'motion'
      ? '<g class="hc-walker"><g transform="translate(130 80) scale(1.3)"><circle class="hc-person" cy="-24" r="4"/>' +
        '<path class="hc-person" d="M-5 -19h10l2 12h-3l-1 7h-3l-1 -7h-1l-1 7h-3l-1 -7h-3z"/>' +
        '<rect class="hc-frame" x="-9" y="-30.5" width="18" height="31" rx="1"/></g></g>'
      : '';
  const nosignal =
    state === 'offline'
      ? '<g class="hc-nosig" transform="translate(140 18)"><circle r="5.2"/><path d="M-3.6 3.6 3.6 -3.6"/></g>'
      : '';
  return (
    `<svg class="hc-scene ${state}" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">` +
    `<defs><linearGradient id="hc-fov-${uid}" gradientUnits="userSpaceOnUse" x1="155" y1="25" x2="132" y2="80">` +
    '<stop offset="0" class="hc-fov-a"/><stop offset="1" class="hc-fov-b"/></linearGradient></defs>' +
    fov +
    person +
    '<g transform="translate(173 16) scale(1.4)"><rect class="hc-mount" x="-2" y="-8.6" width="4" height="10" rx=".6"/>' +
    `<g class="hc-head"><rect class="hc-body" x="-15" y="0" width="23" height="12.4" rx="3"/>${lens}${led}</g></g>` +
    nosignal +
    '</svg><div class="hc-ground" aria-hidden="true"></div>'
  );
}

// The banner's colours and animations, day and night. Only added to the card when the illustration is shown.
export const HC_BANNER_STYLE =
  // 90 px, edge to edge at the top of the card: the wall, the camera picture on the right, the parquet strip.
  // Nothing under the header (a lone hidden camera): the banner runs to the card's bottom edge.
  '.head:has(+ .view:empty) .banner { margin-bottom: -12px; }' +
  '.banner { position: relative; height: 90px; margin: -12px -12px 0; overflow: hidden; container: hc-card / inline-size;' +
  ' background: #f2efe9; color: #1f2328; --hc-muted: #5d6670; }' +
  '.banner.night { background: #2a2b33; color: #fff; --hc-muted: rgba(255,255,255,0.78); }' +
  '.hc-scene { position: absolute; right: 0; bottom: 10px; width: min(200px, 62%); height: 80px; }' +
  '.banner.zoomable .hc-scene { right: 26px; }' +
  '.hc-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px;' +
  ' background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }' +
  '.night .hc-ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5a4634; }' +
  // The text row on the wall, left of the camera (whose picture starts halfway across it).
  '.banner .header { position: absolute; left: 12px; top: 0; bottom: 10px; right: calc(min(200px, 62%) / 2 + 4px); align-items: center; }' +
  '.banner.zoomable .header { right: calc(min(200px, 62%) / 2 + 30px); }' +
  '.banner .titles { align-self: center; }' +
  '.banner .name { color: inherit; }' +
  '.banner .summary { color: var(--hc-muted); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }' +
  '.banner .hicon { position: relative; align-self: center; background: rgba(255,255,255,0.62);' +
  ' box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--hc-c) 22%, transparent); }' +
  '.banner.night .hicon { background: rgba(255,255,255,0.12); color: color-mix(in srgb, var(--hc-c) 72%, #fff);' +
  ' box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); }' +
  // Opaque buttons on the wall: their contrast never depends on what is behind them.
  '.banner .toggle { align-self: center; background: #fbfaf7; color: #1f2328; }' +
  '.banner.night .toggle { background: #3d3e46; color: #fff; }' +
  '.banner .toggle.private { background: color-mix(in srgb, var(--hc-on) 22%, #fff); color: color-mix(in srgb, var(--hc-on) 60%, #1f2328); }' +
  '.banner.night .toggle.private { background: color-mix(in srgb, var(--hc-on) 26%, #2a2b33); color: color-mix(in srgb, var(--hc-on) 55%, #fff); }' +
  '.banner .seg { background: rgba(255,255,255,0.6); }' +
  '.banner.night .seg { background: rgba(0,0,0,0.25); }' +
  '.banner .opt { color: var(--hc-muted); }' +
  '.banner .opt.on { background: #fff; color: var(--primary-color, #03a9f4); }' +
  '.banner.night .opt.on { background: rgba(255,255,255,0.2); color: #fff; }' +
  // The status pill on the wall: the state colour on frosted glass.
  '.banner .stpill { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }' +
  '.banner.night .stpill { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }' +
  // The mini card's expand / collapse button: a 24 px frosted disc in the banner's top-right corner.
  '.banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; width: 24px; height: 24px; box-sizing: border-box; color: #33506b;' +
  ' background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }' +
  '.banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }' +
  '.banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }' +
  '.banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }' +
  // Narrow card: no room for the camera beside the text, the wall alone stays.
  '@container (max-width: 279px) { .hc-scene { display: none; } .banner .header { right: 12px; } .banner.zoomable .header { right: 34px; } }' +
  // The camera: white body on its wall mount, dark lens, the red recording light.
  '.hc-mount { fill: #9aa3ae; }' +
  '.hc-body { fill: #fff; stroke: #c9ced6; stroke-width: 0.7; }' +
  '.night .hc-body { fill: #d8dce2; stroke: #aab1bb; }' +
  '.hc-lens { fill: #2a3038; }' +
  '.hc-lens.shut { fill: #9aa3ae; }' +
  '.hc-shutter { stroke: #fff; stroke-width: 1.4; }' +
  '.hc-glint { fill: #6f86a6; }' +
  '.hc-rec { fill: #e5484d; animation: hc-blink 1.2s steps(2) infinite; }' +
  '.hc-head { transform-box: fill-box; transform-origin: 85% 40%; }' +
  '.live .hc-head { animation: hc-pan 6s ease-in-out infinite; }' +
  '.offline .hc-body { fill: #e3e6ea; }' +
  '.night .offline .hc-body { fill: #8c939e; stroke: #6b7280; }' +
  '.offline .hc-lens { fill: #6b7380; }' +
  // Field of view: a soft blue cone from the lens to the floor, breathing.
  '.hc-fov-a { stop-color: #2f80ed; stop-opacity: 0.2; }' +
  '.hc-fov-b { stop-color: #2f80ed; stop-opacity: 0.05; }' +
  '.night .hc-fov-a { stop-color: #6aa8ff; stop-opacity: 0.26; }' +
  '.night .hc-fov-b { stop-color: #6aa8ff; stop-opacity: 0.06; }' +
  '.hc-fov { animation: hc-breathe 3s ease-in-out infinite; }' +
  '.motion .hc-fov-a { stop-color: #f5b400; stop-opacity: 0.24; }' +
  '.motion .hc-fov-b { stop-color: #f5b400; stop-opacity: 0.06; }' +
  // Motion: someone walks in the field of view, framed by an amber detection box.
  '.hc-person { fill: #5f6b7a; }' +
  '.night .hc-person { fill: #8fa3c4; }' +
  '.hc-frame { fill: none; stroke: #f5b400; stroke-width: 1; stroke-dasharray: 3 2; vector-effect: non-scaling-stroke; animation: hc-blink 1s steps(2) infinite; }' +
  '.hc-walker { animation: hc-walk 4s ease-in-out infinite alternate; }' +
  // Offline: a no-signal mark beside the camera.
  '.hc-nosig circle { fill: none; stroke: #e5484d; stroke-width: 1.4; }' +
  '.hc-nosig path { stroke: #e5484d; stroke-width: 1.4; stroke-linecap: round; }' +
  '.hc-nosig { animation: hc-breathe 2s ease-in-out infinite; }' +
  '@keyframes hc-blink { 50% { opacity: 0.2; } }' +
  '@keyframes hc-breathe { 50% { opacity: 0.55; } }' +
  '@keyframes hc-pan { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(5deg); } }' +
  '@keyframes hc-walk { from { transform: translateX(-10px); } to { transform: translateX(8px); } }' +
  '@media (prefers-reduced-motion: reduce) { .hc-scene * { animation: none !important; } }';
