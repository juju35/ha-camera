// ── hc-frigate-timeline: the Events tab of the Cameras panel ─────────────────
// The day's events of the Frigate cameras of the panel's card as a timeline, grouped by hour, newest first: the day
// (previous / next), a filter by camera and by object, and a player for the selected event (its clip, or its
// camera live, and a download link). Wide: the timeline on the left, the player on the right; narrow: the player
// on top. It says how many events today has (hc-events-count), for the panel's tab.
import { pickerDefine } from "./card-picker.js";
import { HOME_CAMERA_CARD_VERSION } from "./version.js";
import { hcEsc, hcLang, hcT } from "./i18n-helpers.js";
import { hcHidden, hcLoadStream } from "./entity-discovery.js";
import { hcCamera, hcFrigateConf } from "./frigate.js";
import { HC_EVENTS_MS, HC_EVENT_GROUPS, HC_QUALITY_EVENT, hcClipPath, hcDuration, hcFetchEvents, hcLabelGroup, hcLabelIcon, hcLabelName, hcLazyThumbs, hcScore, hcSigned, hcStartOfDay, hcThumbPath, hcTime } from "./frigate-events.js";
import { HC_BANNER_STYLE, hcIsNight, hcSceneSvg } from "./illustrated-header.js";
import { HomeCameraCard } from "./card.js";
import { HomeCameraCardEditor, HomeCameraMiniCardEditor } from "./editor.js";
import { HomeCameraMiniCard } from "./mini-card.js";

export const HC_TIMELINE_STYLE = `
  :host { display: block; container-type: inline-size; color: var(--primary-text-color); }
  .bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .day { display: inline-flex; align-items: center; gap: 2px; font-size: 15px; font-weight: 500; margin-right: 6px; }
  .day button { all: unset; display: inline-flex; border-radius: 50%; padding: 2px; cursor: pointer; color: var(--secondary-text-color); }
  .day button[disabled] { opacity: .35; cursor: default; }
  .day button:focus-visible, .chip:focus-visible, .it:focus-visible, .act:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .day ha-icon { --mdc-icon-size: 22px; }
  .chip { font-size: 13px; padding: 4px 11px; border-radius: 14px; cursor: pointer; display: inline-flex; gap: 5px; align-items: center;
    background: var(--card-background-color, #fff); border: 1px solid var(--divider-color); user-select: none; }
  .chip.on { background: color-mix(in srgb, var(--primary-color, #03a9f4) 16%, transparent); border-color: transparent; color: var(--primary-color, #03a9f4); }
  .chip ha-icon { --mdc-icon-size: 15px; }
  .sep { width: 1px; height: 20px; background: var(--divider-color); margin: 0 4px; }
  .body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
  .player { order: -1; }
  @container (min-width: 860px) { .body { grid-template-columns: 400px minmax(0, 1fr); } .player { order: 0; position: sticky; top: 12px; } }
  .lane, .player { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color); border-radius: 12px; overflow: hidden; }
  .lane { padding: 6px 14px 10px; }
  .hr { display: grid; grid-template-columns: 46px 18px minmax(0, 1fr); }
  .hr .h { font-size: 12px; color: var(--secondary-text-color); padding-top: 12px; }
  .hr .ax { position: relative; } .hr .ax::before { content: ""; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: var(--divider-color); }
  .items { padding: 4px 0; min-width: 0; }
  .it { position: relative; display: flex; gap: 10px; align-items: center; padding: 6px 8px 6px 26px; margin-left: -18px; border-radius: 10px; cursor: pointer; }
  .it:hover { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
  .it .dot { position: absolute; left: 3px; top: 50%; margin-top: -6px; width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box;
    background: var(--card-background-color, #fff); border: 2px solid var(--g); }
  .it.sel { background: color-mix(in srgb, var(--primary-color, #03a9f4) 12%, transparent); }
  .it.sel .dot { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); }
  .it .th { flex: none; width: 72px; height: 41px; border-radius: 7px; background: #20232a center / cover; }
  .it .tx { flex: 1; min-width: 0; }
  .it .k { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 5px; min-width: 0; }
  .it .k span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .it .k ha-icon { --mdc-icon-size: 15px; color: var(--g); flex: none; }
  .it .s, .it .tm { font-size: 12px; color: var(--secondary-text-color); } .it .tm { flex: none; }
  .g-person { --g: var(--warning-color, #ffa600); } .g-animal { --g: #26a69a; } .g-vehicle { --g: #5c6bc0; } .g-other { --g: var(--secondary-text-color); }
  .none { padding: 28px 12px; text-align: center; color: var(--secondary-text-color); font-size: 14px; }
  .screen { aspect-ratio: 16 / 9; background: #000; position: relative; display: flex; align-items: center; justify-content: center; }
  .screen video, .screen hc-camera-stream { width: 100%; height: 100%; display: block; object-fit: contain; }
  .screen .badge { position: absolute; left: 12px; top: 12px; z-index: 1; font-size: 12px; font-weight: 500; color: #fff; background: rgba(0,0,0,.55);
    padding: 4px 10px; border-radius: 12px; display: flex; gap: 6px; align-items: center; }
  .screen .badge i { width: 8px; height: 8px; border-radius: 50%; background: var(--warning-color, #ffa600); }
  .screen .badge.live i { background: #e53935; }
  .screen .hint { color: rgba(255,255,255,.7); font-size: 14px; padding: 16px; text-align: center; }
  .meta { display: flex; gap: 12px; align-items: center; padding: 12px 14px; flex-wrap: wrap; }
  .meta .t { font-size: 15px; font-weight: 500; } .meta .s { font-size: 13px; color: var(--secondary-text-color); }
  .meta .acts { margin-left: auto; display: flex; gap: 8px; }
  .act { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; padding: 6px 12px; border-radius: 16px;
    border: 1px solid var(--divider-color); color: var(--primary-text-color); }
  .act ha-icon { --mdc-icon-size: 17px; }
`;
export class HcFrigateTimeline extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._day = 0; // 0: today, -1: yesterday…
    this._cams = null; // camera filter: null for every camera, else a Set of keys
    this._groups = null; // object filter: null for every object, else a Set of groups
    this._events = [];
    this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener('keydown', (ev) => {
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.composedPath().some((n) => n.dataset?.do)) {
        ev.preventDefault();
        this._onClick(ev);
      }
    });
  }

  set config(config) {
    this._config = config || {};
    this._sig = null;
    this._load();
  }
  get config() {
    return this._config;
  }
  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (this._stream) this._stream.hass = hass;
    // Today: asked again every HC_EVENTS_MS while it is shown
    if (first || (this._day === 0 && this.isConnected && this._active !== false && document.visibilityState !== 'hidden' && Date.now() - (this._at || 0) > HC_EVENTS_MS)) this._load();
  }
  get hass() {
    return this._hass;
  }

  // false while its tab is not shown (or the page is hidden): the clip pauses, the live stream closes
  set active(v) {
    this._active = !!v;
    this._applyActive();
    if (this._active) this._load();
  }
  get active() {
    return this._active !== false;
  }

  _applyActive() {
    const on = this._active !== false && document.visibilityState !== 'hidden';
    const video = this.shadowRoot.querySelector('.screen video');
    if (!on) video?.pause();
    if (this._stream) this._stream.stateObj = on ? this._liveObj : undefined;
  }

  // The player's media let go: a clip stops downloading, a live stream closes
  _stopMedia() {
    const video = this.shadowRoot.querySelector('.screen video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (this._stream) this._stream.stateObj = undefined;
    this._stream = null;
    this._liveObj = undefined;
  }

  connectedCallback() {
    this._onVisible = this._onVisible || (() => this._applyActive());
    document.addEventListener('visibilitychange', this._onVisible);
    this._load();
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this._onVisible);
    this._stopMedia();
    this._psig = null;
  }

  _lang() {
    return hcLang(this._config?.language || this._hass?.language || 'en');
  }
  _t(k, vars) {
    let txt = hcT(this._lang(), k);
    for (const [name, v] of Object.entries(vars || {})) txt = txt.replace(`{${name}}`, v);
    return txt;
  }

  // The Frigate cameras of the card
  _frigateCams() {
    const fc = hcFrigateConf(this._config);
    return (this._config?.cameras || [])
      .map((raw, i) => hcCamera(this._hass, raw, i, fc))
      .filter((cam) => cam.frigate)
      .map((cam) => ({ key: cam.key, entity: cam.camera, name: cam.frigate.name, instance: cam.frigate.instance, title: cam.name }));
  }

  async _load() {
    if (!this._hass?.callWS || !this._config || !this.isConnected || this._busy) return;
    const cams = this._frigateCams();
    this._busy = true;
    this._at = Date.now();
    const day = this._day;
    try {
      const fc = hcFrigateConf(this._config);
      const labels = Array.isArray(fc.events_labels) ? fc.events_labels : fc.events_labels ? [fc.events_labels] : null;
      const events = cams.length
        ? await hcFetchEvents(this._hass, cams, { after: hcStartOfDay(day), before: hcStartOfDay(day + 1), limit: 500, labels })
        : [];
      if (day !== this._day) return; // another day asked meanwhile: loaded below
      this._events = events;
      if (day === 0) this.dispatchEvent(new CustomEvent('hc-events-count', { detail: { count: events.length }, bubbles: true, composed: true }));
    } finally {
      this._busy = false;
    }
    if (day !== this._day) {
      this._load();
      return;
    }
    this._render();
  }

  _shown() {
    const cams = this._frigateCams();
    const camOf = (ev) => cams.find((c) => c.name === ev.camera && c.instance === ev.instance);
    return this._events
      .map((ev) => Object.assign({}, ev, { cam: camOf(ev) }))
      .filter((ev) => (!this._cams || (ev.cam && this._cams.has(ev.cam.key))) && (!this._groups || this._groups.has(hcLabelGroup(ev.label))));
  }

  _render() {
    const lang = this._lang();
    const cams = this._frigateCams();
    const shown = this._shown();
    if (this._sel && !shown.some((ev) => ev.id === this._sel)) this._sel = null;
    if (!this._sel && shown.length && !this._liveCam) this._sel = shown[0].id;
    const groups = HC_EVENT_GROUPS.filter((g) => this._events.some((ev) => hcLabelGroup(ev.label) === g));
    const sig = JSON.stringify([lang, this._day, [...(this._cams || [])], [...(this._groups || [])], this._sel, this._liveCam,
      shown.map((ev) => [ev.id, ev.end_time]), cams.map((c) => c.key), Math.floor(Date.now() / 60000)]);
    if (sig === this._sig) return;
    this._sig = sig;
    const dayName = this._day === 0 ? this._t('tl_today') : this._day === -1 ? this._t('tl_yesterday')
      : new Date(hcStartOfDay(this._day) * 1000).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
    const chip = (on, attrs, label, icon) =>
      `<span class="chip${on ? ' on' : ''}" ${attrs} role="button" tabindex="0" aria-pressed="${on}">${icon ? `<ha-icon icon="${icon}"></ha-icon>` : ''}${hcEsc(label)}</span>`;
    const groupIcon = { person: 'mdi:walk', animal: 'mdi:paw', vehicle: 'mdi:car', other: 'mdi:shape-outline' };
    let bar =
      `<span class="day"><button data-do="prev" aria-label="${hcEsc(this._t('tl_prev_day'))}" title="${hcEsc(this._t('tl_prev_day'))}"><ha-icon icon="mdi:chevron-left"></ha-icon></button>` +
      `<span>${hcEsc(dayName.charAt(0).toUpperCase() + dayName.slice(1))}</span>` +
      `<button data-do="next" aria-label="${hcEsc(this._t('tl_next_day'))}" title="${hcEsc(this._t('tl_next_day'))}"${this._day >= 0 ? ' disabled' : ''}><ha-icon icon="mdi:chevron-right"></ha-icon></button></span>`;
    if (cams.length > 1) {
      bar += chip(!this._cams, 'data-do="cam" data-key=""', this._t('tl_all_cameras'));
      bar += cams.map((c) => chip(!!this._cams?.has(c.key), `data-do="cam" data-key="${hcEsc(c.key)}"`, c.title)).join('');
    }
    if (groups.length > 1) {
      if (cams.length > 1) bar += '<span class="sep"></span>';
      bar += groups.map((g) => chip(!this._groups || this._groups.has(g), `data-do="group" data-group="${g}"`, this._t(`ev_group_${g}`), groupIcon[g])).join('');
    }
    // The timeline, by hour
    const hours = [];
    for (const ev of shown) {
      const h = new Date(ev.start_time * 1000).getHours();
      if (!hours.length || hours[hours.length - 1].h !== h) hours.push({ h, items: [] });
      hours[hours.length - 1].items.push(ev);
    }
    const hourLabel = (h) => {
      try {
        return new Date(2000, 0, 1, h).toLocaleTimeString(lang, { hour: 'numeric' });
      } catch (_e) {
        return `${h} h`;
      }
    };
    const lane = hours.length
      ? hours
          .map(
            ({ h, items }) =>
              `<div class="hr"><div class="h">${hcEsc(hourLabel(h))}</div><div class="ax"></div><div class="items">` +
              items
                .map((ev) => {
                  const name = hcLabelName(lang, ev.label);
                  const score = hcScore(lang, ev);
                  return (
                    `<div class="it g-${hcLabelGroup(ev.label)}${ev.id === this._sel && !this._liveCam ? ' sel' : ''}" data-do="sel" data-id="${hcEsc(ev.id)}" role="button" tabindex="0">` +
                    `<span class="dot"></span><span class="th" data-thumb="${hcEsc(hcThumbPath(ev))}"></span>` +
                    `<div class="tx"><div class="k"><ha-icon icon="${hcLabelIcon(ev.label)}"></ha-icon><span>${hcEsc(cams.length > 1 ? `${name} · ${ev.cam?.title || ev.camera}` : name)}</span></div>` +
                    `<div class="s">${hcEsc([hcDuration(lang, ev), score].filter(Boolean).join(' · '))}</div></div>` +
                    `<span class="tm">${hcEsc(hcTime(lang, ev.start_time))}</span></div>`
                  );
                })
                .join('') +
              '</div></div>',
          )
          .join('')
      : `<div class="none">${hcEsc(this._t('tl_empty'))}</div>`;
    // The player stays when the timeline is drawn again (a refresh, a new minute): a clip keeps playing
    if (!this._body) {
      this.shadowRoot.innerHTML = `<style>${HC_TIMELINE_STYLE}</style><div class="bar"></div><div class="body"><div class="lane"></div><div class="player"></div></div>`;
      this._body = true;
    }
    this.shadowRoot.querySelector('.bar').innerHTML = bar;
    this.shadowRoot.querySelector('.lane').innerHTML = lane;
    this._renderPlayer(shown);
    hcLazyThumbs(this._hass, this.shadowRoot);
  }

  // The selected event's clip, or its camera live. Drawn again only when the selection changes. Only the selected
  // clip is ever asked for, and the one selected on opening (the newest) waits for its play button: no download
  // until it is wanted.
  async _renderPlayer(shown) {
    const host = this.shadowRoot.querySelector('.player');
    const lang = this._lang();
    const ev = shown.find((e) => e.id === this._sel);
    const psig = JSON.stringify([lang, this._sel, this._liveCam, ev?.end_time, !!ev, shown.length > 0]);
    if (psig === this._psig && host.childElementCount) return;
    this._psig = psig;
    this._stopMedia();
    if (!ev) {
      host.innerHTML = `<div class="screen"><span class="hint">${hcEsc(this._t(shown.length ? 'tl_select' : 'tl_empty'))}</span></div>`;
      return;
    }
    const title = `${hcLabelName(lang, ev.label)} · ${ev.cam?.title || ev.camera}`;
    const when = this._day === 0 ? hcTime(lang, ev.start_time)
      : new Date(ev.start_time * 1000).toLocaleString(lang, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const score = hcScore(lang, ev);
    const live = this._liveCam && ev.cam && this._liveCam === ev.cam.key;
    host.innerHTML =
      `<div class="screen"><span class="badge${live ? ' live' : ''}"><i></i>${hcEsc(live ? this._t('tl_live_badge', { c: ev.cam.title }) : `${this._t('tl_clip')} · ${ev.cam?.title || ev.camera} · ${hcTime(lang, ev.start_time)}`)}</span></div>` +
      `<div class="meta"><div><div class="t">${hcEsc(title)}</div><div class="s">${hcEsc([when, hcDuration(lang, ev), score && this._t('tl_score', { s: score })].filter(Boolean).join(' · '))}</div></div>` +
      '<div class="acts">' +
      (ev.cam ? `<span class="act" data-do="live" role="button" tabindex="0"><ha-icon icon="${live ? 'mdi:play-box-outline' : 'mdi:cctv'}"></ha-icon>${hcEsc(this._t(live ? 'tl_clip' : 'ev_live_btn'))}</span>` : '') +
      (ev.has_clip !== false && ev.end_time ? `<a class="act dl" download role="button" tabindex="0"><ha-icon icon="mdi:download"></ha-icon>${hcEsc(this._t('tl_download'))}</a>` : '') +
      '</div></div>';
    const screen = host.querySelector('.screen');
    if (live) {
      const st = this._hass?.states?.[ev.cam.entity];
      const stream = document.createElement('hc-camera-stream');
      stream.muted = true;
      stream.fitMode = 'contain';
      stream.aspectRatio = 16 / 9;
      stream.hass = this._hass;
      screen.appendChild(stream);
      this._stream = stream;
      this._liveObj = st && st.state !== 'unavailable' ? st : undefined;
      stream.stateObj = this._active !== false ? this._liveObj : undefined;
      hcLoadStream(ev.cam.entity).catch(() => {});
      return;
    }
    if (ev.has_clip === false || !ev.end_time) {
      screen.insertAdjacentHTML('beforeend', `<span class="hint">${hcEsc(this._t(ev.end_time ? 'ev_no_clip' : 'ev_live'))}</span>`);
      return;
    }
    try {
      const url = await hcSigned(this._hass, hcClipPath(ev));
      if (!screen.isConnected) return;
      const video = document.createElement('video');
      // The poster: the event's thumbnail; the clip itself loads when played (or at once when chosen)
      hcSigned(this._hass, hcThumbPath(ev))
        .then((poster) => {
          video.poster = poster;
        })
        .catch(() => {});
      const chosen = this._chosen;
      video.preload = chosen ? 'auto' : 'none';
      video.src = url;
      video.controls = true;
      video.autoplay = chosen && this._active !== false;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      screen.appendChild(video);
      const dl = host.querySelector('.dl');
      if (dl) {
        dl.href = url;
        dl.setAttribute('download', `${ev.camera}-${ev.id}.mp4`);
      }
    } catch (_e) {
      screen.insertAdjacentHTML('beforeend', `<span class="hint">${hcEsc(this._t('ev_no_clip'))}</span>`);
    }
  }

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset?.do);
    if (!el || el.disabled) return;
    const what = el.dataset.do;
    if (what === 'prev' || what === 'next') {
      this._day = Math.min(0, this._day + (what === 'next' ? 1 : -1));
      this._sel = null;
      this._chosen = false;
      this._liveCam = null;
      this._events = [];
      this._sig = null;
      this._render();
      this._load();
      return;
    }
    if (what === 'cam') {
      const key = el.dataset.key;
      if (!key) this._cams = null;
      else {
        const next = new Set(this._cams || []);
        next.has(key) ? next.delete(key) : next.add(key);
        this._cams = next.size ? next : null;
      }
    } else if (what === 'group') {
      const all = HC_EVENT_GROUPS.filter((g) => this._events.some((e) => hcLabelGroup(e.label) === g));
      const next = new Set(this._groups || all);
      next.has(el.dataset.group) ? next.delete(el.dataset.group) : next.add(el.dataset.group);
      this._groups = next.size && next.size < all.length ? next : null;
    } else if (what === 'sel') {
      this._sel = el.dataset.id;
      this._liveCam = null;
      this._chosen = true;
    } else if (what === 'live') {
      const sel = this._shown().find((e) => e.id === this._sel);
      this._liveCam = this._liveCam ? null : sel?.cam?.key || null;
      this._chosen = true;
    } else return;
    this._render();
  }
}
if (!customElements.get('hc-frigate-timeline')) customElements.define('hc-frigate-timeline', HcFrigateTimeline);

export class HcCameraWall extends HomeCameraCard {
  static get shell() {
    return 'div';
  }

  setConfig(config) {
    super.setConfig(Object.assign({}, config, { layout: 'wall', show_header: false }));
  }
}
if (!customElements.get('hc-camera-wall')) pickerDefine('hc-camera-wall', HcCameraWall);

if (!customElements.get('home-camera-card-editor')) {
  pickerDefine('home-camera-card-editor', HomeCameraCardEditor);
}
if (!customElements.get('home-camera-mini-card-editor')) {
  pickerDefine('home-camera-mini-card-editor', HomeCameraMiniCardEditor);
}

if (!customElements.get('home-camera-card')) {
  pickerDefine('home-camera-card', HomeCameraCard);
  // What the Cameras panel draws its top bar with: the header's picture and its styles, and the camera entries
  window.HomeCameraKit = {
    sceneSvg: hcSceneSvg,
    isNight: hcIsNight,
    camera: hcCamera,
    hidden: hcHidden,
    bannerStyle: HC_BANNER_STYLE,
    qualityEvent: HC_QUALITY_EVENT,
  };
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'home-camera-card',
    name: 'Home Camera Card',
    description: 'Every home camera in one grid, with privacy toggles, HD/SD switching and PTZ',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-camera',
  });
}
if (!customElements.get('home-camera-mini-card')) {
  pickerDefine('home-camera-mini-card', HomeCameraMiniCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'home-camera-mini-card',
    name: 'Home Camera Mini Card',
    description: 'A snapshot of each home camera with its status, and a button to show the full camera card',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-camera',
  });
}

console.info(
  `%c HOME-CAMERA-CARD %c v${HOME_CAMERA_CARD_VERSION} `,
  'color:#fff;background:#03a9f4;font-weight:700',
  'color:#000;background:#fff',
);
