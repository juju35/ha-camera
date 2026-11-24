// ── home-camera-card ─────────────────────────────────────────────────────────
// A tile's player. Home Assistant's own (ha-camera-stream) starts HLS and WebRTC side by side and keeps the
// one that loads: two RTSP sessions per camera, while Tapo cameras and many others allow very few and drop
// one (go2rtc reconnecting, the image lagging, the player falling back to the slow HLS). A camera that
// offers WebRTC plays it alone here (ha-web-rtc-player: one session in go2rtc, under a second of latency);
// Home Assistant's player is the fallback, for the other cameras, the ones without a live stream (privacy
// mode: their still) and a WebRTC session that brings no video.
import { pickerDefine } from "./card-picker.js";
import { HC_DEFAULTS, HC_PENDING_MS, HC_PTZ_DIRS, HC_PTZ_HOLD_MS, HC_PTZ_ICONS, HC_PTZ_REPEAT_MS, HC_SNAPSHOT_MS, hcEsc, hcLang, hcMorph, hcT, hcTextWidth } from "./i18n-helpers.js";
import { hcHidden, hcLoadStream, hcOwnControl, hcRatio } from "./entity-discovery.js";
import { HC_FRIGATE_DEFAULTS, hcCamera, hcFrigateConf } from "./frigate.js";
import { HC_EVENTS_LIMIT, HC_EVENTS_MS, HC_EVENT_GROUPS, HC_QUALITY_EVENT, HC_QUALITY_KEY, hcClipPath, hcDuration, hcFetchEvents, hcLabelGroup, hcLabelIcon, hcLabelName, hcLazyThumbs, hcScore, hcSigned, hcStartOfDay, hcThumbPath, hcWhen } from "./frigate-events.js";
import { HC_BANNER_STYLE, hcIsNight, hcSceneSvg } from "./illustrated-header.js";

export let hcUid = 0;

export const HC_STREAM_FEATURE = 2;
// A camera without a live stream (HomeKit, a Tapo in privacy mode…): Home Assistant's player shows it as
// MJPEG, a multipart/x-mixed-replace <img> that Safari leaves broken. Its still is refreshed here instead,
// the next one asked once the previous one has loaded, at most one every HC_STILL_MS.
export const HC_STILL_MS = 1000;
export const HC_STILL_RETRY_MS = 5000;
// The card's own players (still, Frigate): fitted in the tile as Home Assistant's player is (fitMode, aspectRatio).
export class HcFittedPlayer extends HTMLElement {
  get fitMode() {
    return this._fit;
  }
  set fitMode(v) {
    this._fit = v;
    this._apply();
  }
  get aspectRatio() {
    return this._ratio;
  }
  set aspectRatio(v) {
    this._ratio = v;
    this._apply();
  }
}
export class HcCameraStill extends HcFittedPlayer {
  constructor() {
    super();
    this._img = document.createElement('img');
    this._img.alt = '';
    this._img.style.cssText = 'display: block; width: 100%; height: 100%; max-height: var(--video-max-height, none);';
    this._timer = null;
    this._next = null;
    this._shown = false;
    this._apply();
  }

  get stateObj() {
    return this._obj;
  }
  set stateObj(v) {
    const was = this._obj?.entity_id;
    this._obj = v;
    if (v?.entity_id !== was) {
      this._shown = false;
      this._img.removeAttribute('src');
      this._stop();
    }
    if (this.isConnected && !this._timer && !this._next) this._fetch();
  }
  get updateComplete() {
    return Promise.resolve(true);
  }

  // Fullscreen (no ratio): the picture at its own height; in a tile: it fills it.
  _apply() {
    this._img.style.objectFit = this._fit || 'contain';
    this._img.style.height = this._ratio ? '100%' : 'auto';
  }

  connectedCallback() {
    if (!this._img.isConnected) this.append(this._img);
    this._fetch();
  }

  disconnectedCallback() {
    this._stop();
  }

  _stop() {
    clearTimeout(this._timer);
    this._timer = null;
    if (this._next) {
      this._next.onload = this._next.onerror = null;
      this._next.src = '';
      this._next = null;
    }
  }

  // Loaded aside, then shown: the tile keeps the last still while the next one comes.
  _fetch() {
    this._timer = null;
    const obj = this._obj;
    if (!obj || !this.isConnected || this._next) return;
    const id = obj.entity_id;
    const pic = obj.attributes?.entity_picture || `/api/camera_proxy/${id}`;
    const url = `${pic}${pic.includes('?') ? '&' : '?'}_t=${Date.now()}`;
    const started = Date.now();
    const next = new Image();
    this._next = next;
    next.onload = () => {
      this._next = null;
      this._img.src = url;
      if (!this._shown) {
        this._shown = true;
        this.dispatchEvent(new Event('load', { bubbles: true, composed: true }));
      }
      this._timer = setTimeout(() => this._fetch(), Math.max(0, HC_STILL_MS - (Date.now() - started)));
    };
    next.onerror = () => {
      this._next = null;
      this._timer = setTimeout(() => this._fetch(), HC_STILL_RETRY_MS);
    };
    next.src = url;
  }
}
if (!customElements.get('hc-camera-still')) pickerDefine('hc-camera-still', HcCameraStill);

// A Frigate camera's stream straight from Frigate's go2rtc: WebRTC negotiated over go2rtc's WebSocket
// (webrtc/offer, webrtc/answer, webrtc/candidate), through the Frigate integration's proxy
// (/api/frigate[/<instance>]/webrtc/api/ws?src=<stream>), on a path signed by Home Assistant (a browser WebSocket
// carries no token). Used for Frigate's sub-stream (SD), or for every stream with `player: frigate`. A session that
// brings no picture within HC_FRIGATE_TIMEOUT_MS says so (hc-frigate-failed): hc-camera-stream falls back to
// Home Assistant's player.
export const HC_FRIGATE_TIMEOUT_MS = 15000;
export class HcFrigatePlayer extends HcFittedPlayer {
  static elementProperties = new Map([['hass', {}]]);

  constructor() {
    super();
    this._video = document.createElement('video');
    this._video.muted = true;
    this._video.autoplay = true;
    this._video.playsInline = true;
    this._video.setAttribute('playsinline', '');
    this._video.style.cssText = 'display: block; width: 100%; height: 100%; max-height: var(--video-max-height, none);';
    this._video.addEventListener('loadeddata', () => this._loaded());
    this._run = 0;
    this._apply();
  }

  get hass() {
    return this._hass;
  }
  set hass(v) {
    this._hass = v;
    if (this.isConnected && !this._pc && !this._starting && !this._failed) this._start();
  }
  get source() {
    return this._source;
  }
  set source(v) {
    this._source = v;
  }
  get muted() {
    return this._video.muted;
  }
  set muted(v) {
    this._video.muted = !!v;
  }
  set posterUrl(v) {
    if (v) this._video.poster = v;
  }
  get updateComplete() {
    return Promise.resolve(true);
  }

  _apply() {
    this._video.style.objectFit = this._fit || 'contain';
    this._video.style.height = this._ratio ? '100%' : 'auto';
  }

  connectedCallback() {
    if (!this._video.isConnected) this.append(this._video);
    this._start();
  }

  disconnectedCallback() {
    this._close();
  }

  _close() {
    this._run++;
    clearTimeout(this._timer);
    this._timer = null;
    if (this._ws) {
      this._ws.onopen = this._ws.onmessage = this._ws.onerror = this._ws.onclose = null;
      try {
        this._ws.close();
      } catch (_e) {
        // already closed
      }
    }
    this._ws = null;
    this._pc?.close();
    this._pc = null;
    this._video.srcObject = null;
  }

  _fail() {
    if (this._failed) return;
    this._failed = true;
    this._close();
    this.dispatchEvent(new Event('hc-frigate-failed', { bubbles: true }));
  }

  _loaded() {
    if (this._shown) return;
    this._shown = true;
    clearTimeout(this._timer);
    const media = this._video.srcObject;
    this.dispatchEvent(new Event('load', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent('streams', {
        detail: { hasAudio: !!media?.getAudioTracks?.().length, hasVideo: true },
        bubbles: true,
        composed: true,
      }),
    );
  }

  async _start() {
    const src = this._source;
    if (!this._hass?.callWS || !src || this._pc || this._starting || this._failed || !this.isConnected) return;
    if (typeof RTCPeerConnection !== 'function' || typeof WebSocket !== 'function') {
      this._fail();
      return;
    }
    this._starting = true;
    const run = ++this._run;
    this._timer = setTimeout(() => this._fail(), HC_FRIGATE_TIMEOUT_MS);
    try {
      const { path } = await this._hass.callWS({
        type: 'auth/sign_path',
        path: `${src.path}?src=${encodeURIComponent(src.stream)}`,
        expires: 300,
      });
      if (run !== this._run) return;
      const http = this._hass.hassUrl ? this._hass.hassUrl(path) : new URL(path, location.href).href;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      this._pc = pc;
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });
      const media = new MediaStream();
      pc.ontrack = (ev) => {
        media.addTrack(ev.track);
        if (this._video.srcObject !== media) this._video.srcObject = media;
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') this._fail();
      };
      const ws = new WebSocket(http.replace(/^http/, 'ws'));
      this._ws = ws;
      const send = (type, value) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type, value }));
      };
      pc.onicecandidate = (ev) => send('webrtc/candidate', ev.candidate ? ev.candidate.candidate : '');
      ws.onopen = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send('webrtc/offer', offer.sdp);
        } catch (_e) {
          this._fail();
        }
      };
      ws.onmessage = (ev) => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch (_e) {
          return;
        }
        if (msg.type === 'webrtc/answer') pc.setRemoteDescription({ type: 'answer', sdp: msg.value }).catch(() => this._fail());
        else if (msg.type === 'webrtc/candidate' && msg.value) pc.addIceCandidate({ candidate: msg.value, sdpMid: '0' }).catch(() => {});
        else if (msg.type === 'error') this._fail();
      };
      ws.onerror = () => this._fail();
      // go2rtc keeps the socket open for the session: closed before the picture, the stream is not there
      ws.onclose = () => {
        if (!this._shown) this._fail();
      };
    } catch (_e) {
      if (run === this._run) this._fail();
    } finally {
      if (run === this._run) this._starting = false;
    }
  }
}
if (!customElements.get('hc-frigate-player')) pickerDefine('hc-frigate-player', HcFrigatePlayer);

export class HcCameraStream extends HTMLElement {
  // The card gives hass only to a player that declares it; passed on to the inner one if it asks.
  static elementProperties = new Map([['hass', {}]]);

  constructor() {
    super();
    this._muted = false;
    this._caps = new Map(); // entity → true (WebRTC), false, or the pending request
    this._failed = new Set(); // entities whose WebRTC session brought no video
    this._frigateFailed = new Set(); // Frigate sources that brought no video: Home Assistant's player instead
    this._frigate = null;
    this._player = null;
    this.addEventListener('hc-frigate-failed', (ev) => {
      ev.stopPropagation();
      if (ev.target !== this._player || !this._frigate) return;
      this._frigateFailed.add(this._frigate.key);
      this._sync();
    });
    this.addEventListener('streams', (ev) => {
      if (ev.target !== this._player || this._player.localName !== 'ha-web-rtc-player' || ev.detail?.hasVideo !== false)
        return;
      this._failed.add(this._player.entityid);
      this._sync();
    });
  }

  get stateObj() {
    return this._obj;
  }
  set stateObj(v) {
    // Emptied (a camera going away, or played again on purpose): its WebRTC gets another chance.
    if (!v && this._obj) {
      this._failed.delete(this._obj.entity_id);
      this._frigateFailed.clear();
    }
    this._obj = v;
    this._sync();
  }
  // A Frigate source ({ key, path, stream }, see HcFrigatePlayer), or null: Home Assistant's player.
  get frigate() {
    return this._frigate;
  }
  set frigate(v) {
    if ((v?.key || null) === (this._frigate?.key || null)) return;
    this._frigate = v || null;
    this._sync();
  }
  get hass() {
    return this._hass;
  }
  set hass(v) {
    this._hass = v;
    this._pass('hass', v);
  }
  get muted() {
    return this._muted;
  }
  set muted(v) {
    this._muted = !!v;
    this._pass('muted', this._muted);
  }
  get fitMode() {
    return this._fit;
  }
  set fitMode(v) {
    this._fit = v;
    this._pass('fitMode', v);
  }
  get aspectRatio() {
    return this._ratio;
  }
  set aspectRatio(v) {
    this._ratio = v;
    this._pass('aspectRatio', v);
  }
  get updateComplete() {
    return this._player?.updateComplete ?? Promise.resolve(true);
  }

  _pass(key, v) {
    const p = this._player;
    if (!p || (key === 'hass' && !p.constructor.elementProperties?.has?.('hass'))) return;
    p[key] = v;
  }

  // WebRTC alone when the camera offers it; asked once per camera.
  _webRtc(id) {
    const known = this._caps.get(id);
    if (typeof known === 'boolean') return known;
    if (known) return undefined; // asking
    if (!this._hass?.callWS || !customElements.get('ha-web-rtc-player')) return false;
    const ask = this._hass
      .callWS({ type: 'camera/capabilities', entity_id: id })
      .then(
        (caps) => {
          this._caps.set(id, !!caps?.frontend_stream_types?.includes('web_rtc'));
          // As Home Assistant's player does: the card shows the sound button from it.
          this.dispatchEvent(
            new CustomEvent('camera-capabilities-changed', { detail: { capabilities: caps }, bubbles: true, composed: true }),
          );
        },
        () => this._caps.set(id, false),
      )
      .then(() => {
        if (this._obj?.entity_id === id) this._sync();
      });
    this._caps.set(id, ask);
    return undefined;
  }

  _sync() {
    const obj = this._obj;
    const id = obj?.entity_id;
    const live = !!id && (obj.attributes?.supported_features & HC_STREAM_FEATURE) !== 0;
    const f = this._frigate;
    if (live && f && !this._frigateFailed.has(f.key)) {
      const p = this._player;
      if (p?.localName !== 'hc-frigate-player' || p.source?.key !== f.key) {
        const player = document.createElement('hc-frigate-player');
        player.source = f;
        const still = obj.attributes?.entity_picture;
        if (still) player.posterUrl = this._hass?.hassUrl ? this._hass.hassUrl(still) : still;
        this._use(player);
      }
      return;
    }
    const rtc = live && !this._failed.has(id) ? this._webRtc(id) : false;
    if (rtc === undefined) {
      this._use(null); // nothing until the camera says what it offers: no HLS session for nothing
      return;
    }
    if (rtc) {
      const p = this._player;
      if (p?.localName !== 'ha-web-rtc-player' || p.entityid !== id) {
        const player = document.createElement('ha-web-rtc-player');
        player.entityid = id;
        // The camera's last still while the session starts (connection, then the first keyframe):
        // the tile shows a picture at once instead of a black frame.
        const still = obj.attributes?.entity_picture;
        if (still) player.posterUrl = this._hass?.hassUrl ? this._hass.hassUrl(still) : still;
        player.setAttribute('autoplay', '');
        player.setAttribute('playsinline', '');
        player.autoplay = true;
        player.playsinline = true;
        this._use(player);
      }
      return;
    }
    if (!id && ['ha-web-rtc-player', 'hc-camera-still', 'hc-frigate-player'].includes(this._player?.localName)) {
      this._use(null);
      return;
    }
    if (id && !live) {
      if (this._player?.localName !== 'hc-camera-still') this._use(document.createElement('hc-camera-still'));
      this._player.stateObj = obj;
      return;
    }
    if (this._player?.localName !== 'ha-camera-stream') this._use(document.createElement('ha-camera-stream'));
    this._player.stateObj = obj;
  }

  _use(player) {
    this._player?.remove();
    this._player = player;
    if (!player) return;
    player.muted = this._muted;
    player.fitMode = this._fit;
    player.aspectRatio = this._ratio;
    this._pass('hass', this._hass);
    this.append(player);
  }
}
if (!customElements.get('hc-camera-stream')) pickerDefine('hc-camera-stream', HcCameraStream);

export class HomeCameraCard extends HTMLElement {
  // What the card is drawn in: Home Assistant's <ha-card> on a dashboard; the panel's wall has a plain element.
  static get shell() {
    return 'ha-card';
  }

  static getConfigElement() {
    return document.createElement('home-camera-card-editor');
  }

  static getStubConfig(hass) {
    const cams = Object.keys(hass?.states || {})
      .filter((id) => id.startsWith('camera.'))
      .slice(0, 2);
    return { cameras: cams };
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    if (config.cameras && !Array.isArray(config.cameras)) throw new Error('cameras must be a list');
    this._config = Object.assign({}, HC_DEFAULTS, config);
    if (!this._uid) this._uid = ++hcUid;
    // show_title: the header's title, hidden by the stylesheet (HD / SD and the summary stay)
    this.toggleAttribute?.('hide-title', config.show_title === false);
    // Video wall (the Cameras panel, or `layout: wall` on a dashboard): no card around the grid, a status bar
    // instead of the header, and as many columns as fit unless `columns` is set.
    this._wall = config.layout === 'wall' && !this.hasAttribute?.('mini');
    this._columnsSet = config.columns != null;
    this.toggleAttribute?.('wall', this._wall);
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      const inner = '<div class="head"></div><div class="view"></div>';
      this.shadowRoot.innerHTML = `${this._styles()}${this.constructor.shell === 'ha-card' ? `<ha-card>${inner}</ha-card>` : `<div class="shell">${inner}</div>`}`;
      this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
      this.shadowRoot.addEventListener('keydown', (ev) => this._onKey(ev));
      this.shadowRoot.addEventListener('pointerdown', (ev) => this._onPointerDown(ev));
      this.shadowRoot.addEventListener('change', (ev) => this._onChange(ev));
    }
    this._headSig = null;
    this._viewSig = null;
    this._update();
  }

  // The header's status pill goes right after the title, on its row, only while the title stays whole and the
  // pill's whole label fits beside it (with the HD / SD switch, which ends the row); otherwise it takes a line of its
  // own under the summary (.below), the title whole on its row (cut only when it does not fit alone). There, in the
  // banner, the summary keeps one line; if the text still does not fit above the floor strip, the pill keeps its dot
  // alone (.dot-only, its label in its tooltip and for screen readers). Measured after each render and on each new
  // width, whatever the language: no fixed width threshold.
  _fitPill() {
    // Home Assistant's <ha-card> (a Lit element) shows its content only from its first update, a microtask after it
    // is connected: measured before, everything is 0 px wide and the pill lands on the wrong line. Fitted then.
    const haCard = this.shadowRoot?.querySelector?.('ha-card');
    if (haCard && haCard.hasUpdated === false) {
      this._pillWait ??= (haCard.updateComplete?.then ? haCard.updateComplete : new Promise((r) => requestAnimationFrame(r))).then(() => {
        this._pillWait = null;
        this._fitPill();
      });
      return;
    }
    if (!this.isConnected) return;
    for (const t of this.shadowRoot?.querySelectorAll?.('.head .titles') || []) {
      const row = t.querySelector('.name-row');
      const pill = row?.querySelector(':scope > .stpill');
      if (!pill?.getBoundingClientRect) continue;
      t.classList.remove('below', 'dot-only');
      const name = row.querySelector(':scope > .name');
      const chips = row.querySelector(':scope > .chips');
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const title = name && getComputedStyle(name).display !== 'none' ? hcTextWidth(name) + gap : 0;
      const tail = chips && chips.children.length ? chips.getBoundingClientRect().width + gap : 0;
      // A card of 200 px or less: the dot alone beside the title (its label in its tooltip), as in the banner.
      if (this.getBoundingClientRect().width <= 200) {
        t.classList.add('dot-only');
        continue;
      }
      if (title + pill.getBoundingClientRect().width + tail > row.getBoundingClientRect().width - 0.5) {
        t.classList.add('below');
        const banner = t.closest('.banner');
        if (banner) {
          const b = banner.getBoundingClientRect();
          // Each element as it shows: its box cut by its ancestors that hide their overflow (a clamped line).
          const out = [...t.querySelectorAll('*')].some((n) => {
            let { top, bottom } = n.getBoundingClientRect();
            for (let p = n.parentElement; p && p !== t; p = p.parentElement) {
              if (getComputedStyle(p).overflowY === 'visible') continue;
              top = Math.max(top, p.getBoundingClientRect().top);
              bottom = Math.min(bottom, p.getBoundingClientRect().bottom);
            }
            return bottom - top > 0.5 && (top < b.top - 0.5 || bottom > b.bottom - 10 + 0.5);
          });
          if (out) t.classList.add('dot-only');
        }
      }
      // A summary cut by its ellipsis keeps its whole text in its tooltip.
      const s = t.querySelector('.summary');
      if (s) {
        const cut = s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1;
        if (cut) s.title = s.textContent.trim();
        else s.removeAttribute('title');
      }
    }
  }

  connectedCallback() {
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === 'function') {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    if (!this._onQuality) {
      this._onQuality = (ev) => {
        if (!ev.key || ev.key === HC_QUALITY_KEY) this._update();
      };
      // The page hidden while an arrow is held (phone locked, other tab): its release will never come
      this._onVisibility = () => {
        if (document.visibilityState === 'hidden') this._stopRepeat();
        this._syncLive();
      };
      // Escape leaves the card's own fullscreen (the browser handles its native one).
      this._onEscape = (ev) => {
        if (ev.key === 'Escape' && this._pseudo) this._setPseudo(this._pseudo, false);
      };
    }
    window.addEventListener('storage', this._onQuality);
    window.addEventListener(HC_QUALITY_EVENT, this._onQuality);
    document.addEventListener('visibilitychange', this._onVisibility);
    window.addEventListener('keydown', this._onEscape);
    // Scrolled out of view (or in a closed view, a collapsed stack): the streams and snapshots stop until
    // the card shows again. Without IntersectionObserver the card counts as always on screen.
    if (!this._observer && window.IntersectionObserver) {
      this._observer = new window.IntersectionObserver((entries) => {
        const off = !entries[entries.length - 1].isIntersecting;
        if (off === this._offscreen) return;
        this._offscreen = off;
        this._syncLive();
      });
    }
    this._observer?.observe(this);
    this._syncLive();
    // The HD/SD choice may have changed while detached (listeners removed): catch up. _update() is
    // a no-op before setConfig/hass, and the signatures skip the render when nothing changed.
    this._update();
  }

  disconnectedCallback() {
    this._resize?.disconnect();
    this._fitWidth = null;
    window.removeEventListener('storage', this._onQuality);
    window.removeEventListener(HC_QUALITY_EVENT, this._onQuality);
    document.removeEventListener('visibilitychange', this._onVisibility);
    window.removeEventListener('keydown', this._onEscape);
    this._observer?.disconnect();
    this._stopSnapshots();
    this._stopRepeat();
    // Privacy badges waiting for their switch: drop their timers so none fires on the detached card.
    for (const p of this._pending?.values() || []) clearTimeout(p.timer);
    this._pending?.clear();
    if (this._pseudo) this._setPseudo(this._pseudo, false);
  }

  set hass(hass) {
    this._hass = hass;
    this._viewRendered = false;
    this._update();
    // _renderView has just synced the tiles it rendered: no second pass over them.
    if (!this._viewRendered) {
      this._syncTiles();
      // A failed player load is retried on every update until it succeeds, not only when the grid changes.
      this._loadStream();
    }
    this._syncSnapshots();
  }

  // The live parts of the card follow the page and the viewport: players and snapshot refresh.
  _syncLive() {
    this._syncTiles();
    this._syncSnapshots();
  }

  // Nothing live while the page is hidden (other tab, phone locked) or the card is off screen. A tile in
  // fullscreen keeps playing when the card itself is scrolled away (the browser's fullscreen may report it so).
  _paused(tile) {
    if (document.visibilityState === 'hidden') return true;
    return !!this._offscreen && !(tile && this._fullscreen(tile));
  }

  // Overridden by the mini card: compact view and its detail button.
  _compact() {
    return false;
  }

  _zoomButton() {
    return '';
  }

  // Home Assistant's player, loaded through the first tile's camera; tiles spin until it is defined.
  _loadStream() {
    if (!this._streamEntity || customElements.get('ha-camera-stream')) return;
    hcLoadStream(this._streamEntity).catch(() => {});
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 'full', min_columns: 6 };
  }

  _lang() {
    return hcLang(this._config?.language || this._hass?.language || document.documentElement.lang || 'en');
  }

  _t(k, vars) {
    let s = hcT(this._lang(), k);
    for (const v of Object.keys(vars || {})) s = s.replace(`{${v}}`, vars[v]);
    return s;
  }

  _state(id) {
    return id ? this._hass.states[id]?.state : undefined;
  }

  // HD unless the quality selector (or the card's own toggle) says SD.
  // The local choice is read from storage each time, so every card of the dashboard agrees.
  _hd() {
    const c = this._config;
    if (c.quality_entity) return this._state(c.quality_entity) !== c.sd_option;
    // Tapo Cameras: what the cameras' own stream quality selects say (the first one; the switch sets them all)
    const select = this._qualitySelects()[0];
    if (select && this._usable(select)) return this._state(select) !== 'sd';
    let quality = this._quality;
    try {
      quality = localStorage.getItem(HC_QUALITY_KEY) || quality;
    } catch (_e) {
      // storage unavailable: the card's own choice
    }
    return quality !== 'sd';
  }

  // A camera is hidden when its privacy switch is on or its power switch is off.
  _hidden(cam) {
    return hcHidden(this._hass, cam);
  }

  // False for a switch that is unavailable, unknown or missing: toggling it would do nothing (Home Assistant
  // skips unavailable entities without an error), so its badge is shown disabled instead.
  _usable(id) {
    const state = this._state(id);
    return state !== undefined && state !== 'unavailable' && state !== 'unknown';
  }

  // The switch a tap on the camera's badge toggles: its power switch while that is off (the privacy
  // switch cannot bring the camera back then, and is usually unavailable with the power cut), else
  // its privacy switch, or its power switch when it has no privacy switch.
  _target(cam) {
    if (cam.power && this._state(cam.power) === 'off') return cam.power;
    return cam.privacy || cam.power;
  }

  // Each camera gets a unique key (the same camera listed twice gets two tiles, not one shared tile).
  // Computed once per hass and config objects: an update asks for them several times (header, view, events)
  _cameras() {
    if (this._camsMemo?.hass === this._hass && this._camsMemo.config === this._config) return this._camsMemo.cams;
    const seen = new Set();
    const cams = (this._config.cameras || [])
      .map((raw, i) => hcCamera(this._hass, raw, i, hcFrigateConf(this._config)))
      .filter((cam) => cam.camera)
      .map((cam, i) => {
        if (seen.has(cam.key)) cam.key = `${cam.key}_${i}`;
        seen.add(cam.key);
        return cam;
      });
    this._camsMemo = { hass: this._hass, config: this._config, cams };
    return cams;
  }

  // Privacy switches toggled from the card, until Home Assistant reports their new state.
  _setPending(id) {
    if (!this._pending) this._pending = new Map();
    clearTimeout(this._pending.get(id)?.timer);
    // A camera that never answers: the badge stops waiting after a while.
    const timer = setTimeout(() => {
      this._pending.delete(id);
      this._headSig = null;
      this._update();
    }, HC_PENDING_MS);
    this._pending.set(id, { from: this._state(id), timer });
    this._headSig = null;
    this._update();
  }

  _isPending(id) {
    return !!id && !!this._pending?.has(id);
  }

  _update() {
    if (!this._config || !this._hass || !this.shadowRoot) return;
    for (const [id, p] of this._pending || []) {
      if (this._state(id) === p.from) continue;
      clearTimeout(p.timer);
      this._pending.delete(id);
    }
    const cams = this._cameras();
    const hd = this._hd();
    const visible = cams.filter((cam) => !this._hidden(cam));
    const compact = this._compact();
    this._shellEl()?.classList.toggle('mini', compact);
    // A lone camera on screen: its image runs edge to edge, under the header and down to the card's edges.
    this._shellEl()?.classList.toggle('solo', !compact && !this._wall && cams.length === 1 && visible.length === 1);

    const banner = this._config.illustration !== false;
    const headSig = JSON.stringify([
      this._lang(),
      compact,
      this._headState(cams, visible),
      banner && hcIsNight(this._hass, this._config),
      this._zoomButton(),
      hd,
      [...(this._pending?.keys() || [])],
      cams.map((cam) => [
        cam.name,
        cam.short,
        cam.privacy,
        cam.power,
        this._hidden(cam),
        this._target(cam),
        this._usable(this._target(cam)),
      ]),
    ]);
    if (headSig !== this._headSig) {
      this._headSig = headSig;
      this._renderHead(cams, visible, hd);
    }

    const viewSig = compact
      ? JSON.stringify([
          this._lang(),
          'compact',
          this._config.aspect_ratio,
          this._config.zoom,
          cams.map((cam) => [cam.key, this._snapEntity(cam), cam.name, cam.short, this._thumbState(cam), cam.motion]),
        ])
      : JSON.stringify([
          this._lang(),
          hd,
          this._config.columns,
          this._config.aspect_ratio,
          cams.length,
          visible.map((cam) => [cam.key, cam.camera, cam.sd, cam.sdStream, cam.player, cam.frigate, cam.name, cam.ptz, cam.motion]),
        ]);
    if (viewSig !== this._viewSig) {
      this._viewSig = viewSig;
      if (compact) this._renderThumbs(cams);
      else this._renderView(visible, hd, cams.length);
    }
    this._syncMotion();
    this._syncEvents();
  }

  // Motion badge of each tile and snapshot: shown while one of its camera's motion sensors is on.
  // Toggled in place, so a motion never reloads a snapshot or a player.
  _syncMotion() {
    const show = this._config.show_motion !== false;
    for (const el of this.shadowRoot.querySelectorAll('[data-motion]')) {
      const ids = el.dataset.motion.split(' ').filter(Boolean);
      el.classList.toggle('motion', show && ids.some((id) => this._state(id) === 'on'));
    }
  }

  // The motion mark of a snapshot label (shown by _syncMotion); a tile has its own, labelled in _fillTile.
  _motionMark() {
    const label = hcEsc(this._t('motion'));
    return `<span class="mot" role="img" aria-label="${label}"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>`;
  }

  // ── Compact view (mini card): a snapshot per camera, refreshed every HC_SNAPSHOT_MS ──
  // The lighter SD stream when the camera has one: a thumbnail needs no more.
  _snapEntity(cam) {
    return cam.sd || cam.camera;
  }

  // live, hidden (privacy: no snapshot is fetched) or off (camera unavailable).
  _thumbState(cam) {
    if (this._hidden(cam)) return 'hidden';
    const st = this._hass.states[this._snapEntity(cam)];
    return st && st.state !== 'unavailable' ? 'live' : 'off';
  }

  _renderThumbs(cams) {
    this._viewRendered = true;
    this._dropTiles();
    const view = this.shadowRoot.querySelector('.view');
    if (!cams.length) {
      view.innerHTML = `<div class="empty"><ha-icon icon="mdi:cctv-off"></ha-icon>${hcEsc(this._t('no_cameras'))}</div>`;
      this._syncSnapshots();
      return;
    }
    // A lone hidden camera: the header says so, no locked thumbnail under it.
    if (cams.length === 1 && this._hidden(cams[0])) {
      view.replaceChildren();
      this._syncSnapshots();
      return;
    }
    const thumbs = cams.map((cam) => {
      const state = this._thumbState(cam);
      const mark =
        state === 'live'
          ? '<span class="dot"></span>'
          : `<ha-icon icon="${state === 'hidden' ? 'mdi:eye-lock' : 'mdi:cctv-off'}"></ha-icon>`;
      // A tap on a thumbnail opens the full card, so a hidden one's tooltip only says it is hidden.
      const title = state === 'hidden' ? this._t('cam_hidden', { c: cam.name }) : state === 'off' ? this._t('unavailable') : cam.name;
      // Screen readers get the state the image shows: hidden or offline, not just the camera's name.
      const label =
        state === 'hidden'
          ? this._t('cam_hidden', { c: cam.name })
          : state === 'off'
            ? this._t('privacy_unavailable', { c: cam.name })
            : cam.name;
      return (
        `<div class="thumb ${state}" data-action="zoom" data-entity="${hcEsc(cam.camera)}"` +
        ` data-motion="${hcEsc(cam.motion.join(' '))}" data-name="${hcEsc(cam.name)}" role="button" tabindex="0"` +
        ` title="${hcEsc(title)}" aria-label="${hcEsc(label)}">` +
        (state === 'live' ? `<img alt="" data-snap="${hcEsc(this._snapEntity(cam))}">` : '') +
        '<div class="na"></div>' +
        `<div class="label">${mark}<span class="text">${hcEsc(cam.short)}</span>${this._motionMark()}</div></div>`
      );
    });
    view.innerHTML =
      `<div class="thumbs" style="--hc-ratio: ${hcRatio(this._config.aspect_ratio)}">${thumbs.join('')}</div>`;
    for (const img of view.querySelectorAll('.thumb img')) {
      img.addEventListener('error', () => this._snapFailed(img, true));
      img.addEventListener('load', () => this._snapFailed(img, false));
    }
    this._syncSnapshots();
  }

  // A snapshot that fails to load shows the offline look instead of a broken image, until one loads again.
  _snapFailed(img, failed) {
    const thumb = img.closest('.thumb');
    if (!thumb || thumb.classList.contains('failed') === failed) return;
    const name = thumb.dataset.name;
    thumb.classList.toggle('failed', failed);
    const mark = failed ? document.createElement('ha-icon') : Object.assign(document.createElement('span'), { className: 'dot' });
    if (failed) mark.setAttribute('icon', 'mdi:cctv-off');
    thumb.querySelector('.label').firstElementChild.replaceWith(mark);
    thumb.title = failed ? this._t('unavailable') : name;
    thumb.setAttribute('aria-label', failed ? this._t('privacy_unavailable', { c: name }) : name);
  }

  // Snapshot of each live thumbnail, with a cache-busting stamp that moves on every refresh. The refresh
  // only runs while thumbnails are shown and the card is on screen in a visible page; it takes a fresh
  // snapshot as soon as it starts again.
  _syncSnapshots() {
    const imgs = this.isConnected && this._hass ? this.shadowRoot?.querySelectorAll('.thumb img') || [] : [];
    if (!imgs.length || this._paused()) {
      this._stopSnapshots();
      return;
    }
    if (!this._snapTimer) {
      this._snapAt = Date.now();
      this._snapTimer = setInterval(() => {
        this._snapAt = Date.now();
        this._syncSnapshots();
      }, HC_SNAPSHOT_MS);
    }
    for (const img of imgs) {
      const id = img.dataset.snap;
      const pic = this._hass.states[id]?.attributes?.entity_picture || `/api/camera_proxy/${id}`;
      const src = `${pic}${pic.includes('?') ? '&' : '?'}_t=${this._snapAt}`;
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    }
  }

  _stopSnapshots() {
    clearInterval(this._snapTimer);
    this._snapTimer = null;
  }

  // A badge: an icon, or the red live dot when icon is null.
  _chip(cls, attrs, icon, label, title) {
    const mark = icon ? `<ha-icon icon="${icon}"></ha-icon>` : '<span class="dot"></span>';
    return (
      `<span class="chip ${cls}" ${attrs} role="button" tabindex="0" title="${hcEsc(title)}">` +
      `${mark}<span>${hcEsc(label)}</span></span>`
    );
  }

  _renderHead(cams, visible, hd) {
    const c = this._config;
    // A single camera: its name is the title, and its badge says what a tap does.
    const single = cams.length === 1;
    let title = c.title;
    if (title == null || title === '') title = single ? cams[0].name : this._t('title');
    const hidden = cams.length - visible.length;

    let summary = '';
    if (c.show_summary && cams.length) {
      if (!visible.length) summary = this._t(single ? 'one_hidden' : 'all_hidden');
      else if (!single) {
        summary = this._t(visible.length > 1 ? 'live_many' : 'live_one', { n: visible.length });
        if (hidden) summary += ` · ${this._t(hidden > 1 ? 'hidden_many' : 'hidden_one', { n: hidden })}`;
      }
    }

    // HD / SD as a two-way switch: both options shown, the current one raised.
    const opt = (q, on) =>
      `<span class="opt${on ? ' on' : ''}" data-quality="${q}" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}">${this._t(q)}</span>`;
    const quality = `<span class="seg" role="radiogroup" title="${hcEsc(this._t('quality_hint'))}">${opt('hd', hd)}${opt('sd', !hd)}</span>`;

    // Lock icon by state; a spinning icon while the switch toggled from the card has not answered yet.
    const lock = (cam) => {
      const target = this._target(cam);
      if (this._isPending(target)) return { cls: 'pending', icon: 'mdi:loading', title: this._t('pending') };
      // Its switch unavailable (camera offline): a tap would do nothing, the badge says so instead of "visible".
      if (!this._usable(target)) return { cls: 'dis', icon: 'mdi:cancel', title: this._t('privacy_unavailable', { c: cam.name }) };
      const off = this._hidden(cam);
      return {
        cls: off ? 'private' : 'exposed',
        icon: off ? 'mdi:eye-lock' : 'mdi:eye-lock-open',
        title: this._t(off ? 'privacy_on' : 'privacy_off', { c: cam.name }),
      };
    };
    // Badges: a live camera shows the red dot, a hidden one its lock.
    const badgeIcon = (l) => (l.cls === 'exposed' ? null : l.icon);

    let badges = '';
    if (c.show_badges) {
      badges = cams
        .filter((cam) => cam.privacy || cam.power)
        .map((cam) => {
          const l = lock(cam);
          const target = this._target(cam);
          const label = single ? this._t(this._hidden(cam) ? 'enable' : 'disable') : cam.short;
          // On the wall, the badge of a camera in motion turns amber (toggled in place by _syncMotion)
          const motion = this._wall && cam.motion.length ? ` data-motion="${hcEsc(cam.motion.join(' '))}"` : '';
          const attrs = `data-toggle="${hcEsc(target)}"${l.cls === 'dis' ? ' aria-disabled="true"' : ''}${motion}`;
          return this._chip(l.cls, attrs, badgeIcon(l), label, l.title);
        })
        .join('');
    }

    // A single camera with a toggle: the toggle sits on the right of the title, the quality under it
    // (only while the camera films: once it is hidden, the line says so instead).
    // No camera on screen: nothing to choose a quality for.
    let right = visible.length ? quality : '';
    let side = '';
    let sub = summary ? `<div class="summary">${hcEsc(summary)}</div>` : '';
    if (single && badges && !this._wall) {
      // Icon only, the size of the header icon; the text stays in the tooltip and for screen readers.
      // Same marks as the badges: the red live dot while the camera films, the lock while it is hidden.
      const cam = cams[0];
      const l = lock(cam);
      const label = l.cls === 'pending' || l.cls === 'dis' ? l.title : this._t(this._hidden(cam) ? 'enable' : 'disable');
      right = '';
      side =
        `<span class="toggle ${l.cls}" data-toggle="${hcEsc(this._target(cam))}" role="button" tabindex="0"` +
        (l.cls === 'dis' ? ' aria-disabled="true"' : '') +
        ` title="${hcEsc(label)}" aria-label="${hcEsc(label)}">` +
        `${badgeIcon(l) ? `<ha-icon icon="${l.icon}"></ha-icon>` : '<span class="dot"></span>'}</span>`;
      if (visible.length) sub = `<div class="chips sub">${quality}</div>`;
      badges = '';
    }
    // Compact view (mini card): the title and its status only; the toggles and HD / SD are in the full view.
    if (this._compact()) {
      right = '';
      side = '';
      badges = '';
      sub = summary ? `<div class="summary">${hcEsc(summary)}</div>` : '';
    }

    // The header's status: its icon's colour, and the illustration's picture.
    const state = this._headState(cams, visible);
    // Every camera on screen unavailable: the pill says so, a count of live cameras would contradict it.
    if (state === 'offline' && sub.startsWith('<div class="summary">')) sub = '';

    const head = this.shadowRoot.querySelector('.head');
    // Replacing the header drops the keyboard focus (HD/SD toggled, a badge tapped): remember which
    // control held it, and give it back to its replacement.
    const focused = this.shadowRoot.activeElement;
    const kind = head.contains(focused) && (focused.dataset?.quality ? 'quality' : focused.dataset?.toggle ? 'toggle' : null);
    // Video wall too: the illustrated header, as a card of its own above the wall (see the styles)
    this._renderHeader(head, { title, right, side, sub, badges, state });
    if (kind) {
      for (const el of head.querySelectorAll(`[data-${kind}]`)) {
        if (el.dataset[kind] !== focused.dataset[kind]) continue;
        el.focus({ preventScroll: true });
        break;
      }
    }
  }

  // What the header shows: offline (no camera, or every camera on screen unavailable), privacy (every camera
  // hidden), motion (a motion sensor of a camera on screen is on) or live.
  _headState(cams, visible) {
    if (cams.length && !visible.length) return 'privacy';
    const up = visible.filter((cam) => this._usable(cam.camera));
    if (!up.length) return 'offline';
    if (this._config.show_motion !== false && up.some((cam) => cam.motion.some((id) => this._state(id) === 'on'))) return 'motion';
    return 'live';
  }

  // The card's own header: icon, title with HD / SD, status line, then the privacy badges. With the illustration
  // (default), the icon and the titles sit on a wall, left of a camera drawn in the header's state.
  _renderHeader(head, { title, right, side, sub, badges, state }) {
    const c = this._config;
    // show_header: false (the Cameras panel, whose top bar carries the title, status and HD / SD): the privacy
    // badges alone
    if (c.show_header === false) {
      hcMorph(head, badges ? `<div class="chips badges">${badges}</div>` : '');
      return;
    }
    const zoom = this._zoomButton();
    // The status pill right after the title, in the icon's colour: live, motion, private (every camera hidden) or
    // unavailable.
    const label = this._t({ live: 'live', motion: 'motion', privacy: 'st_private', offline: 'unavailable' }[state] || 'live');
    const pill = `<span class="stpill ${state}" role="status" title="${hcEsc(label)}" aria-label="${hcEsc(label)}"><span class="sdot"></span><span class="st-text">${hcEsc(label)}</span></span>`;
    const row =
      `<div class="header"><div class="hicon ${state}"><ha-icon icon="${hcEsc(c.icon || 'mdi:cctv')}"></ha-icon></div>` +
      `<div class="titles"><div class="tstack"><div class="name-row"><div class="name">${hcEsc(title)}</div>${pill}<div class="chips">${right}</div></div>` +
      sub +
      `</div></div>${side}`;
    const top =
      c.illustration === false
        ? `${row}${zoom}</div>`
        : `<div class="banner${hcIsNight(this._hass, c) ? ' night' : ''}${zoom ? ' zoomable' : ''}">` +
          `${hcSceneSvg(state, this._uid)}${row}</div>${zoom}</div>`;
    hcMorph(head, top + (badges ? `<div class="chips badges">${badges}</div>` : ''));
    this._fitPill();
  }

  // The grid of tiles, one per visible camera. Tiles are kept across renders and only added or removed
  // where needed: a tile that stays in place keeps its stream running (moving a player reconnects it).
  // count: cameras the card shows (entries without a camera entity are skipped), as in the header.
  _renderView(visible, hd, count) {
    this._viewRendered = true;
    const view = this.shadowRoot.querySelector('.view');
    if (!this._tiles) this._tiles = new Map();
    // Back from the compact view: its thumbnails give way to the grid.
    if (view.querySelector('.thumbs')) view.replaceChildren();
    if (!visible.length) {
      this._dropTiles();
      const n = count;
      // Every camera hidden: what brings one back, where the grid would be. A lone camera needs no hint:
      // the header's toggle already says Enable, so nothing shows under it.
      if (n > 1 && this._config.show_badges) {
        view.innerHTML =
          `<div class="asleep"><ha-icon icon="mdi:eye-lock"></ha-icon>` +
          `<span>${hcEsc(this._t('hint_all'))}</span></div>`;
      } else {
        view.innerHTML = n
          ? ''
          : `<div class="empty"><ha-icon icon="mdi:cctv-off"></ha-icon>${hcEsc(this._t('no_cameras'))}</div>`;
      }
      return;
    }
    this._streamEntity = visible[0].camera;
    this._loadStream();
    let grid = view.querySelector('.grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'grid';
      view.replaceChildren(grid);
    }
    // The wall fits as many tiles of at least 360 px as the width takes (one per row on a phone)
    grid.style.gridTemplateColumns =
      this._wall && !this._columnsSet
        ? 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))'
        : `repeat(${hcColumns(this._config, visible.length)}, minmax(0, 1fr))`;
    grid.style.setProperty('--hc-ratio', String(hcRatio(this._config.aspect_ratio)));

    const keys = new Set(visible.map((cam) => cam.key));
    for (const [key, tile] of this._tiles) {
      if (keys.has(key)) continue;
      this._dropTile(tile);
      tile.remove();
      this._tiles.delete(key);
    }
    visible.forEach((cam, i) => {
      let tile = this._tiles.get(cam.key);
      if (!tile) {
        tile = this._tile();
        this._tiles.set(cam.key, tile);
      }
      this._fillTile(tile, cam, hd, count === 1);
      if (grid.children[i] !== tile) grid.insertBefore(tile, grid.children[i] || null);
    });
    this._syncTiles();
  }

  // Every tile goes (all cameras hidden, or the compact view): their players close with them.
  _dropTiles() {
    for (const tile of this._tiles?.values() || []) this._dropTile(tile);
    this._tiles?.clear();
    this._streamEntity = null;
  }

  // A tile leaving the grid: it gives back the page scroll if it covered the screen, and stops a held arrow.
  _dropTile(tile) {
    this._stopClip(tile, true);
    if (tile === this._pseudo) this._setPseudo(tile, false);
    if (this._repeatBtn && tile.contains(this._repeatBtn)) this._stopRepeat();
  }

  _tile() {
    const tile = document.createElement('div');
    tile.className = 'tile';
    // A group of controls; the image itself is a button (.open) under the other buttons, never around them.
    tile.setAttribute('role', 'group');
    tile.innerHTML =
      '<div class="na"><ha-icon icon="mdi:cctv-off"></ha-icon><span></span></div><div class="spin"></div>' +
      '<div class="label"><span class="dot"></span><span class="text"></span><span class="mot" role="img"><ha-icon icon="mdi:motion-sensor"></ha-icon></span></div>' +
      '<span class="open" data-action="open" role="button" tabindex="0"></span>' +
      '<div class="tools"></div><div class="pad"></div>';
    const stream = document.createElement('hc-camera-stream');
    stream.muted = true;
    stream.fitMode = 'cover';
    tile.prepend(stream);
    tile._stream = stream;
    tile._audio = false;
    tile.addEventListener('fullscreenchange', () => this._fullscreenChanged(tile));
    tile.addEventListener('webkitfullscreenchange', () => this._fullscreenChanged(tile));
    // The players report their first frame (load) and whether the stream carries sound (streams).
    tile.addEventListener('load', () => tile.classList.remove('loading'));
    tile.addEventListener('streams', (ev) => {
      if (!ev.detail?.hasAudio || tile._audio) return;
      tile._audio = true;
      this._renderTools(tile);
    });
    // Home Assistant's WebRTC player drops the sound of a muted session (it never adds its audio track), so
    // a muted WebRTC stream always says it has none: G.711 cameras (Tapo C2xx…), whose sound only WebRTC
    // plays, never got the button. A camera that can play WebRTC gets it, as soon as its capabilities are
    // known (whichever player is shown first); unmuting it plays the stream again (_replay) so that the
    // new session keeps its sound.
    const webRtc = (on) => {
      if (!on || tile._webrtc) return;
      tile._webrtc = true;
      if (tile._audio) return;
      tile._audio = true;
      this._renderTools(tile);
    };
    tile.addEventListener('camera-capabilities-changed', (ev) =>
      webRtc(!!ev.detail?.capabilities?.frontend_stream_types?.includes('web_rtc')),
    );
    tile.addEventListener('stream-type-changed', (ev) => webRtc(ev.detail?.type === 'web_rtc'));
    return tile;
  }

  // Name and buttons of a tile; the stream element itself is left alone.
  _fillTile(tile, cam, hd, single) {
    tile._cam = cam;
    tile._entity = hd || !cam.sd ? cam.camera : cam.sd;
    tile._stream.frigate = this._frigateSource(cam, hd);
    tile.dataset.cam = cam.key;
    tile.setAttribute('aria-label', cam.name);
    tile.querySelector('.open').title = cam.name;
    // A single camera already has its name as the card title: its image just says it is live.
    tile.querySelector('.label .text').textContent = single ? this._t('live') : cam.name;
    tile.querySelector('.na span').textContent = this._t('unavailable');
    tile.dataset.motion = cam.motion.join(' ');
    tile.querySelector('.mot').setAttribute('aria-label', this._t('motion'));
    if (!this._fullscreen(tile)) tile._stream.aspectRatio = hcRatio(this._config.aspect_ratio);
    this._renderTools(tile);
  }

  // Buttons of a tile: pan & tilt, sound (when the stream has some), and the camera dialog. In
  // fullscreen: sound and an exit button; the arrows are always shown there, and the dialog would open
  // behind the fullscreen tile.
  _renderTools(tile) {
    const cam = tile._cam;
    if (!cam) return;
    const full = this._fullscreen(tile);
    const frigateUrl = this._frigateUrl(cam);
    const presets = cam.ptz && cam.preset ? this._hass?.states?.[cam.preset]?.attributes?.options || [] : [];
    const sig = JSON.stringify([this._lang(), cam.ptz, full, tile._audio, frigateUrl, cam.switches, cam.preset, presets]);
    if (sig === tile._toolsSig) return;
    tile._toolsSig = sig;

    tile.querySelector('.open').setAttribute('aria-label', full ? this._t('exit_fullscreen') : this._t('open', { c: cam.name }));
    const btn = (cls, attrs, icon, label) =>
      `<span class="btn ${cls}" ${attrs} role="button" tabindex="0" title="${hcEsc(label)}" aria-label="${hcEsc(label)}">` +
      `<ha-icon icon="${icon}"></ha-icon></span>`;
    let tools = '';
    if (cam.ptz && !full) tools += btn('ptz', 'data-action="ptz"', 'mdi:arrow-all', this._t('ptz'));
    if (tile._audio) tools += btn('sound', 'data-action="sound"', 'mdi:volume-off', this._t('sound_on'));
    if (frigateUrl && !full) tools += btn('frigate', 'data-action="frigate"', 'mdi:open-in-new', this._t('open_frigate'));
    if (full) tools += btn('full', 'data-action="fullscreen"', 'mdi:fullscreen-exit', this._t('exit_fullscreen'));
    else tools += btn('details', 'data-action="details"', 'mdi:information-outline', this._t('details'));
    tile.querySelector('.tools').innerHTML = tools;
    tile.querySelector('.pad').innerHTML = cam.ptz
      ? HC_PTZ_DIRS.filter((d) => cam.ptz[d])
          .map((d) =>
            btn(
              `move ${d}`,
              `data-action="move" data-dir="${d}" data-entity="${hcEsc(cam.ptz[d])}"` +
                (cam.ptz.service ? ` data-service="${cam.ptz.service}"` : '') +
                (cam.ptz.stop ? ` data-stop="${hcEsc(cam.ptz.stop)}"` : '') +
                (cam.ptz.service === 'frigate' || cam.ptz.stop ? ' data-cont="1"' : ''),
              HC_PTZ_ICONS[d],
              this._t(`move_${d}`),
            ),
          )
          .join('')
      : '';
    let frs = tile.querySelector('.frs');
    if (!frs) {
      frs = document.createElement('div');
      frs.className = 'frs';
      tile.querySelector('.pad').before(frs);
    }
    frs.innerHTML = cam.switches
      .map(([action, entity]) =>
        btn(action, `data-action="${action}" data-entity="${hcEsc(entity)}"`, action === 'fdetect' ? 'mdi:motion-sensor' : 'mdi:record-rec', ''),
      )
      .join('');
    tile.classList.toggle('has-frs', cam.switches.length > 0);
    // Preset positions with the arrows (Reolink's PTZ preset select)
    let sel = tile.querySelector('.presetsel');
    if (presets.length) {
      if (!sel) {
        sel = document.createElement('select');
        sel.className = 'presetsel';
        tile.querySelector('.pad').before(sel);
      }
      sel.dataset.preset = cam.preset;
      sel.setAttribute('aria-label', this._t('ptz_preset'));
      sel.innerHTML =
        `<option value="" disabled selected>${hcEsc(this._t('ptz_preset'))}</option>` +
        presets.map((o) => `<option value="${hcEsc(o)}">${hcEsc(o)}</option>`).join('');
    } else sel?.remove();
    tile.classList.toggle('has-ptz', !!cam.ptz);
    if (!cam.ptz) tile.classList.remove('ptz-open');
    this._soundIcon(tile);
    this._syncPtz(tile);
    this._syncFrigate(tile);
  }

  // Live state of every tile: the camera's state object, and which PTZ buttons can be pressed.
  // While the page is hidden (other tab, phone locked) or the card off screen, the players are emptied,
  // which closes the streams; they connect again once it shows.
  _syncTiles() {
    if (!this._tiles || !this._hass) return;
    for (const tile of this._tiles.values()) {
      const paused = this._paused(tile);
      const st = this._hass.states[tile._entity];
      const ok = !!st && st.state !== 'unavailable';
      tile.classList.toggle('off', !ok);
      const stream = tile._stream;
      // Older Home Assistant versions take hass; newer ones read it from the page (Lit context) and
      // do not declare it, so it is only given to a player that asks for it.
      if (stream.constructor.elementProperties?.has?.('hass')) stream.hass = this._hass;
      // A clip playing over the tile: its live stream stops meanwhile; the clip itself pauses off screen
      const obj = ok && !paused && !tile._clip ? st : undefined;
      if (tile._clip && paused) tile.querySelector('.clipv')?.pause();
      // A new camera (or the same one coming back) loads again: spinner until its first frame, and
      // its sound is unknown until its player says. A mere state update keeps both.
      // (Not while a replay has emptied the player on purpose.)
      if (!tile._replaying && obj?.entity_id !== stream.stateObj?.entity_id) {
        tile.classList.toggle('loading', !!obj);
        tile._webrtc = false;
        if (tile._audio) {
          tile._audio = false;
          stream.muted = true;
          this._renderTools(tile);
        }
      }
      // A camera that switched its stream itself (Tapo Cameras: the stream_quality attribute) plays again,
      // so the player negotiates the new stream instead of keeping the old one.
      const q = obj?.attributes?.stream_quality;
      const replay = obj && stream.stateObj && tile._q !== undefined && q !== tile._q;
      if (obj) tile._q = q;
      if (replay) this._replay(tile);
      else if (stream.stateObj !== obj && !tile._replaying) stream.stateObj = obj;
      this._syncPtz(tile);
      this._syncFrigate(tile);
    }
  }

  _syncPtz(tile) {
    if (!tile._cam?.ptz) return;
    for (const b of tile.querySelectorAll('.move')) {
      b.classList.toggle('dis', this._state(b.dataset.entity) === 'unavailable');
    }
  }

  // Fullscreen: the browser's own (the tile is the fullscreen element), or the card's (iPhone).
  _fullscreen(tile) {
    const root = this.shadowRoot;
    return (
      !!tile &&
      (root.fullscreenElement === tile || root.webkitFullscreenElement === tile || tile.classList.contains('pseudo'))
    );
  }

  // The card's own fullscreen, where pages cannot use the browser's (iPhone): the tile covers the
  // screen with position: fixed. It stays where it is in the page, so its stream keeps playing.
  _setPseudo(tile, on) {
    tile.classList.toggle('pseudo', on);
    this._pseudo = on ? tile : null;
    // The tile only covers the page: a drag on the image would still scroll the dashboard behind it.
    // The page's own overflow is put back on the way out, not cleared.
    const html = document.documentElement.style;
    const body = document.body.style;
    if (on) {
      if (!this._overflow) this._overflow = [html.overflow, body.overflow];
      html.overflow = 'hidden';
      body.overflow = 'hidden';
    } else if (this._overflow) {
      [html.overflow, body.overflow] = this._overflow;
      this._overflow = null;
    }
    this._fullscreenChanged(tile);
  }

  _fullscreenChanged(tile) {
    const on = this._fullscreen(tile);
    // The arrows are always shown in fullscreen: the grid's own toggle does not apply.
    tile.classList.remove('ptz-open');
    tile._stream.fitMode = on ? 'contain' : 'cover';
    tile._stream.aspectRatio = on ? undefined : hcRatio(this._config.aspect_ratio);
    this._renderTools(tile);
  }

  // The tile goes fullscreen with its buttons and its pan & tilt arrows. Where the browser cannot put
  // an element fullscreen (iPhone), or refuses, the card covers the screen itself.
  _toggleFullscreen(tile) {
    if (this._fullscreen(tile)) {
      if (tile.classList.contains('pseudo')) this._setPseudo(tile, false);
      else (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      return;
    }
    const fallback = () => this._setPseudo(tile, true);
    const request = tile.requestFullscreen || tile.webkitRequestFullscreen;
    if (!request) {
      fallback();
      return;
    }
    try {
      Promise.resolve(request.call(tile)).catch(fallback);
    } catch (_e) {
      fallback();
    }
  }

  // Sound on one camera at a time: unmuting a tile mutes the others.
  _toggleSound(tile) {
    const on = tile._stream.muted;
    for (const t of this._tiles?.values() || []) {
      if (t === tile || t._stream.muted) continue;
      t._stream.muted = true;
      this._soundIcon(t);
    }
    tile._stream.muted = !on;
    this._soundIcon(tile);
    // A WebRTC session started muted has no sound at all: a new one, unmuted, has.
    if (on && tile._webrtc) this._replay(tile);
  }

  // Plays a tile's stream again with a new session. The player only restarts when its camera changes, and
  // within one update a cleared then restored camera is no change at all: the empty camera is rendered first.
  async _replay(tile) {
    const stream = tile._stream;
    if (!stream.stateObj || tile._replaying) return;
    tile._replaying = true;
    tile.classList.add('loading');
    stream.stateObj = undefined;
    try {
      await stream.updateComplete;
    } finally {
      tile._replaying = false;
      const st = this._hass?.states[tile._entity];
      if (st && st.state !== 'unavailable' && !this._paused(tile)) stream.stateObj = st;
      else tile.classList.remove('loading');
    }
  }

  _soundIcon(tile) {
    const b = tile.querySelector('.sound');
    if (!b) return;
    const on = !tile._stream.muted;
    const label = this._t(on ? 'sound_off' : 'sound_on');
    b.classList.toggle('on', on);
    b.title = label;
    b.setAttribute('aria-label', label);
    b.querySelector('ha-icon').setAttribute('icon', on ? 'mdi:volume-high' : 'mdi:volume-off');
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
  }

  // PTZ: one press per tap, repeated while the arrow is held down.
  _move(b) {
    if (b.classList.contains('dis')) return;
    // Frigate and ONVIF: the camera moves until it is told to stop (_ptzStop)
    if (b.dataset.service === 'frigate') {
      this._call('frigate', 'ptz', { entity_id: b.dataset.entity, action: 'move', argument: b.dataset.dir }).catch(() => {});
      return;
    }
    if (b.dataset.service === 'onvif') {
      const axis = b.dataset.dir === 'left' || b.dataset.dir === 'right' ? 'pan' : 'tilt';
      // A short continuous move, repeated while the arrow is held: a lost release never leaves the camera turning
      this._call('onvif', 'ptz', {
        entity_id: b.dataset.entity,
        [axis]: b.dataset.dir.toUpperCase(),
        move_mode: 'ContinuousMove',
        speed: 0.5,
        continuous_duration: 0.6,
      }).catch(() => {});
      return;
    }
    this._call('button', 'press', { entity_id: b.dataset.entity }).catch(() => {});
  }

  // The end of a continuous move: Frigate's stop, or the stop button (Reolink)
  _ptzStop(b) {
    if (b.dataset.service === 'frigate') this._call('frigate', 'ptz', { entity_id: b.dataset.entity, action: 'stop' }).catch(() => {});
    else if (b.dataset.stop) this._call('button', 'press', { entity_id: b.dataset.stop }).catch(() => {});
  }

  // ── Frigate events (frigate.events) ──
  // The Frigate cameras of the card, as frigate/events/get takes them.
  _eventCams() {
    return this._cameras()
      .filter((cam) => cam.frigate)
      .map((cam) => ({ name: cam.frigate.name, instance: cam.frigate.instance, key: cam.key, title: cam.name }));
  }

  // Asked again at most every HC_EVENTS_MS, soon after a motion of a Frigate camera ends, never while the card is
  // off screen or on the wall (the panel has its own Events tab).
  _syncEvents() {
    const fc = hcFrigateConf(this._config);
    const cams = fc.events === false || this._wall ? [] : this._eventCams();
    if (!cams.length) {
      this._events = null;
      this._evEl?.remove();
      return;
    }
    const motion = this._cameras()
      .filter((cam) => cam.frigate)
      .map((cam) => cam.motion.some((id) => this._state(id) === 'on'))
      .join();
    const ended = this._evMotion !== undefined && motion !== this._evMotion;
    this._evMotion = motion;
    const sig = JSON.stringify([cams.map((c) => [c.name, c.instance]), fc.events_labels || null]);
    const stale = sig !== this._evSig || Date.now() - (this._evAt || 0) > HC_EVENTS_MS;
    if (!this._evBusy && !this._paused() && this._hass?.callWS && (stale || ended)) {
      this._evSig = sig;
      this._evAt = Date.now();
      this._evBusy = true;
      const labels = Array.isArray(fc.events_labels) ? fc.events_labels : fc.events_labels ? [fc.events_labels] : null;
      hcFetchEvents(this._hass, cams, { after: hcStartOfDay(), limit: HC_EVENTS_LIMIT, labels })
        .then((events) => {
          this._events = events;
          this._renderEvents();
        })
        .finally(() => {
          this._evBusy = false;
        });
    }
    this._renderEvents();
  }

  // The events block, last in the view: folded (count, last event, three thumbnails) or the list with its filters.
  _renderEvents() {
    const view = this.shadowRoot?.querySelector('.view');
    if (!view || !this._events) return;
    const fc = hcFrigateConf(this._config);
    const lang = this._lang();
    const compact = this._compact();
    if (this._evOpen === undefined) this._evOpen = !!fc.events_expanded;
    const open = this._evOpen && !compact;
    const cams = this._eventCams();
    const camName = (ev) => cams.find((c) => c.name === ev.camera && c.instance === ev.instance)?.title || ev.camera;
    const groups = HC_EVENT_GROUPS.filter((g) => this._events.some((ev) => hcLabelGroup(ev.label) === g));
    if (this._evFilter && !groups.includes(this._evFilter)) this._evFilter = null;
    const shown = this._events.filter((ev) => !this._evFilter || hcLabelGroup(ev.label) === this._evFilter);
    const limit = Math.max(1, Number(fc.events_limit) || HC_FRIGATE_DEFAULTS.events_limit);
    const single = cams.length === 1;
    const sig = JSON.stringify([lang, open, compact, this._evFilter, limit, this._events.map((ev) => [ev.id, ev.end_time, ev.label]), Math.floor(Date.now() / 60000)]);
    if (!this._evEl) {
      this._evEl = document.createElement('div');
      this._evEl.className = 'events';
    }
    if (this._evEl.parentNode !== view || view.lastElementChild !== this._evEl) view.appendChild(this._evEl);
    if (sig === this._evRendered) return;
    this._evRendered = sig;
    const thumb = (ev, cls) =>
      `<span class="${cls}" data-thumb="${hcEsc(hcThumbPath(ev))}" role="img" aria-label="${hcEsc(hcLabelName(lang, ev.label))}"></span>`;
    if (!open) {
      const last = this._events[0];
      const n = this._events.length;
      const title = this._t(compact ? 'ev_title_short' : 'ev_title', { n: n >= HC_EVENTS_LIMIT ? `${n}+` : n });
      // The mini card: the object, the camera and when, without the "Last:" lead
      const sub = last && compact
        ? [hcLabelName(lang, last.label), single ? '' : camName(last), hcWhen(lang, last.start_time)].filter(Boolean).join(' · ')
        : last
        ? this._t('ev_last', { l: hcLabelName(lang, last.label), c: single ? '' : camName(last), t: hcWhen(lang, last.start_time) })
            .replace(/ · ,/, ',')
            .replace(/ · $/, '')
        : this._t('ev_none');
      this._evEl.innerHTML =
        `<div class="evfold${compact ? ' mini' : ''}" data-ev="toggle" role="button" tabindex="0" aria-expanded="false" title="${hcEsc(this._t('ev_expand'))}">` +
        '<ha-icon icon="mdi:history"></ha-icon>' +
        `<div class="tx"><div class="k">${hcEsc(n ? title : this._t('ev_title_short', { n: 0 }))}</div><div class="s">${hcEsc(sub)}</div></div>` +
        `<div class="stack">${this._events.slice(0, compact ? 1 : 3).map((ev) => thumb(ev, 'th')).join('')}</div>` +
        '<ha-icon class="chev" icon="mdi:chevron-down"></ha-icon></div>';
    } else {
      const chips = groups.length > 1
        ? `<span class="chips">${['all', ...groups]
            .map((g) => {
              const on = (this._evFilter || 'all') === g;
              return `<span class="chip${on ? ' on' : ''}" data-ev="filter" data-group="${g}" role="button" tabindex="0" aria-pressed="${on}">${hcEsc(this._t(g === 'all' ? 'ev_all' : `ev_group_${g}`))}</span>`;
            })
            .join('')}</span>`
        : '';
      const rows = shown.slice(0, limit).map((ev) => {
        const name = hcLabelName(lang, ev.label);
        return (
          `<div class="evrow${ev.has_clip === false || !ev.end_time ? ' noclip' : ''}" data-ev="play" data-id="${hcEsc(ev.id)}" role="button" tabindex="0" title="${hcEsc(ev.has_clip === false ? this._t('ev_no_clip') : name)}">` +
          `${thumb(ev, 'th')}<div class="tx"><div class="k"><ha-icon icon="${hcLabelIcon(ev.label)}" class="g-${hcLabelGroup(ev.label)}"></ha-icon>` +
          `${hcEsc(single ? name : `${name} · ${camName(ev)}`)}</div><div class="s">${hcEsc(`${hcWhen(lang, ev.start_time)} · ${hcDuration(lang, ev)}`)}</div></div>` +
          `<span class="sc">${hcEsc(hcScore(lang, ev))}</span></div>`
        );
      });
      this._evEl.innerHTML =
        `<div class="evlist"><div class="evhead"><span class="t">${hcEsc(this._t('ev_heading'))}</span><small>${hcEsc(this._t('ev_today'))}</small>${chips}` +
        `<span class="chev" data-ev="toggle" role="button" tabindex="0" aria-expanded="true" title="${hcEsc(this._t('ev_collapse'))}" aria-label="${hcEsc(this._t('ev_collapse'))}"><ha-icon icon="mdi:chevron-up"></ha-icon></span></div>` +
        (rows.length ? rows.join('') : `<div class="evnone">${hcEsc(this._t('ev_none'))}</div>`) +
        '</div>';
    }
    // Thumbnails on signed paths, asked once each, only for the rows on screen
    hcLazyThumbs(this._hass, this._evEl);
  }

  _onEvent(el, ev) {
    const what = el.dataset.ev;
    if (what === 'toggle') {
      // The mini card opens its full view with the list
      if (this._compact()) {
        this._evOpen = true;
        this._setZoom?.(true);
        return;
      }
      this._evOpen = !this._evOpen;
      this._evRendered = null;
      this._renderEvents();
      // Keyboard use (no click count) keeps the focus on the toggle
      if (!ev?.detail) this._evEl?.querySelector('[data-ev="toggle"]')?.focus({ preventScroll: true });
    } else if (what === 'filter') {
      this._evFilter = el.dataset.group === 'all' ? null : el.dataset.group;
      this._evRendered = null;
      this._renderEvents();
    } else if (what === 'play') {
      const ev = this._events?.find((e) => e.id === el.dataset.id);
      // Frigate writes the clip once the event ends
      if (ev && ev.has_clip !== false && ev.end_time) this._playClip(ev);
    }
  }

  // An event's clip in its camera's tile, over the live stream (which stops meanwhile), with a Live button back.
  // A camera without a tile here (hidden): the clip opens in a new tab.
  async _playClip(ev) {
    const cam = this._eventCams().find((c) => c.name === ev.camera && c.instance === ev.instance);
    const tile = cam && this._tiles?.get(cam.key);
    let url;
    try {
      url = await hcSigned(this._hass, hcClipPath(ev));
    } catch (_e) {
      return;
    }
    if (!tile?.isConnected) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    // One clip at a time in the card
    for (const t of this._tiles?.values() || []) this._stopClip(t, true);
    tile._clip = ev.id;
    const video = document.createElement('video');
    video.className = 'clipv';
    video.preload = 'metadata';
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    const back = document.createElement('span');
    back.className = 'btn livebtn';
    back.dataset.action = 'live';
    back.setAttribute('role', 'button');
    back.tabIndex = 0;
    back.innerHTML = `<ha-icon icon="mdi:cctv"></ha-icon><span>${hcEsc(this._t('ev_live_btn'))}</span>`;
    tile.append(video, back);
    tile.classList.add('clip');
    this._syncTiles();
    tile.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }

  _stopClip(tile, quiet) {
    if (!tile?._clip) return;
    tile._clip = null;
    const video = tile.querySelector('.clipv');
    if (video) {
      // Stops its download too
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
    }
    tile.querySelector('.livebtn')?.remove();
    tile.classList.remove('clip');
    if (!quiet) this._syncTiles();
  }

  // Frigate's detection and recording switches of a tile: lit while on, dimmed while off, greyed while unavailable.
  _syncFrigate(tile) {
    for (const b of tile.querySelectorAll('.frs .btn')) {
      const state = this._state(b.dataset.entity);
      const on = state === 'on';
      b.classList.toggle('off', !on);
      b.classList.toggle('dis', !this._usable(b.dataset.entity));
      const label = this._t(`${b.dataset.action === 'fdetect' ? 'detect' : 'rec'}_${on ? 'on' : 'off'}`);
      if (b.title !== label) {
        b.title = label;
        b.setAttribute('aria-label', label);
        b.setAttribute('aria-pressed', String(on));
      }
    }
  }

  // A Frigate camera's player source: Frigate's go2rtc through the integration's proxy, for its SD sub-stream (auto),
  // or for every stream (player: frigate). Null: Home Assistant's own player.
  _frigateSource(cam, hd) {
    if (!cam.frigate || cam.player === 'home_assistant') return null;
    let stream = null;
    if (!hd && cam.sdStream) stream = cam.sdStream;
    else if (cam.player === 'frigate') stream = cam.frigate.name;
    if (!stream) return null;
    const path = `/api/frigate/${cam.frigate.instance ? `${encodeURIComponent(cam.frigate.instance)}/` : ''}webrtc/api/ws`;
    return { key: `${path}?src=${stream}`, path: path, stream: stream };
  }

  // Where "Open in Frigate" goes: the `frigate.url` option, else the sidebar panel of a Frigate app (its slug ends
  // with frigate, or has frigate in it: Frigate, Frigate Proxy…). Null: no button.
  _frigateUrl(cam) {
    const fc = hcFrigateConf(this._config);
    if (!cam?.frigate || fc.open_in_frigate === false) return null;
    if (fc.url) return String(fc.url);
    const panels = Object.keys(this._hass?.panels || {}).filter((k) => /frigate/i.test(k));
    const panel = panels.find((k) => /proxy/i.test(k)) || panels[0];
    return panel ? `/${panel}` : null;
  }

  _openFrigate(url) {
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    history.pushState(null, '', url);
    window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
  }

  // A service call as a promise, whether Home Assistant's callService throws, rejects or returns nothing.
  _call(domain, service, data) {
    try {
      return Promise.resolve(this._hass.callService(domain, service, data));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  _onPointerDown(ev) {
    const b = ev.composedPath().find((n) => n.dataset?.action === 'move');
    if (!b || ev.button > 0) return;
    this._stopRepeat();
    this._move(b);
    this._repeatBtn = b;
    // Continuous moves (Frigate, a stop button): one move from the press, a stop at the release, no repeat
    if (!b.dataset.cont) this._repeat = setTimeout(() => {
      this._repeat = setInterval(() => {
        // The arrow was re-rendered or its tile removed while held: its pointerup will never come.
        if (!b.isConnected) this._stopRepeat();
        else this._move(b);
      }, HC_PTZ_REPEAT_MS);
    }, HC_PTZ_HOLD_MS);
    // The release is heard on the window (it still arrives if the arrow is replaced meanwhile); the
    // listeners all go away together, so none piles up on the button.
    this._repeatAbort = new AbortController();
    const opts = { signal: this._repeatAbort.signal };
    const stop = () => this._stopRepeat();
    window.addEventListener('pointerup', stop, opts);
    window.addEventListener('pointercancel', stop, opts);
    b.addEventListener('pointerleave', stop, opts);
  }

  _stopRepeat() {
    if (this._repeatBtn?.dataset.cont && !this._repeatBtn.classList.contains('dis')) this._ptzStop(this._repeatBtn);
    clearTimeout(this._repeat);
    clearInterval(this._repeat);
    this._repeat = null;
    this._repeatBtn = null;
    this._repeatAbort?.abort();
    this._repeatAbort = null;
  }

  _onKey(ev) {
    const path = ev.composedPath();
    // HD / SD radio group: the arrow keys select the other option and move the focus to it.
    const radio = path.find((n) => n.dataset?.quality);
    if (radio && /^Arrow(Left|Right|Up|Down)$/.test(ev.key)) {
      ev.preventDefault();
      const other = radio.parentNode.querySelector(`[data-quality="${radio.dataset.quality === 'hd' ? 'sd' : 'hd'}"]`);
      other?.focus({ preventScroll: true });
      if ((other?.dataset.quality === 'hd') !== this._hd()) this._toggleQuality();
      return;
    }
    // Arrow keys move the camera whose pan & tilt arrows are shown (always, in fullscreen); not in the preset list.
    if (ev.key?.startsWith('Arrow') && !path.some((n) => n.localName === 'select')) {
      const tile = path.find((n) => n.dataset?.cam);
      const shown = tile && (tile.classList.contains('ptz-open') || this._fullscreen(tile));
      const b = shown && tile.querySelector(`.move.${ev.key.slice(5).toLowerCase()}`);
      if (!b) return;
      ev.preventDefault();
      this._move(b);
      if (b.dataset.cont) setTimeout(() => this._ptzStop(b), HC_PTZ_HOLD_MS);
      return;
    }
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    // Only the card's own controls: keys bubbling up from elsewhere keep their behaviour.
    if (!hcOwnControl(path)) return;
    ev.preventDefault();
    this._onClick(ev);
  }

  _shellEl() {
    return this.shadowRoot?.querySelector(this.constructor.shell === 'ha-card' ? 'ha-card' : '.shell');
  }

  // The stylesheet, written for <ha-card>; in a plain shell (the panel's wall) the same rules apply to .shell, which
  // also gets what <ha-card> brings by itself (its text colour, a positioned box).
  _styles() {
    const css = this._cardStyles();
    if (this.constructor.shell === 'ha-card') return css;
    return css.replace(/(^|[^-\w])ha-card(?![-\w])/g, '$1.shell').replace('</style>', '.shell { position: relative; color: var(--primary-text-color); }</style>');
  }

  _cardStyles() {
    return (
      '<style>' +
      // --hc-glass: the smoked glass of everything laid over the images (labels, buttons, arrows).
      // --hc-on-ink: the hidden state's green for text and lone icons, pulled toward the text colour so it
      // stays readable on its tinted badge (darker in a light theme, lighter in a dark one).
      // A one-column grid whose track may shrink to 0: the card takes its width from its parent (its header and tiles
      // never set a minimum width, so in a 1fr 1fr grid it keeps to its half, placed directly or in a <div>), while a
      // parent sized by its content (inline-block, an auto grid column) still gets the card's natural width.
      ':host { display: grid; grid-template-columns: minmax(0, 1fr); --hc-on: var(--success-color, #43a047);' +
      ' --hc-on-ink: color-mix(in srgb, var(--hc-on) 60%, var(--primary-text-color, #212121));' +
      ' --hc-live: var(--error-color, #db4437); --hc-glass: rgba(14, 16, 20, 0.46); --hc-glass-line: rgba(255, 255, 255, 0.14); }' +
      'ha-card { box-sizing: border-box; padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow: hidden; }' +
      // Icon and single-camera toggle at the top of the header row (12 px from the card's edge), the titles
      // centred beside them, even when the HD / SD switch under a single camera's name makes them taller.
      '.header { display: flex; align-items: flex-start; gap: 10px; }' +
      '.hicon { width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;' +
      ' --hc-c: var(--primary-color, #03a9f4); background: color-mix(in srgb, var(--hc-c) 16%, transparent); color: var(--hc-c); }' +
      // The icon's colour says the header's state: live, motion (amber), privacy (grey), offline (red).
      '.hicon.motion { --hc-c: var(--warning-color, #ffa600); }' +
      '.hicon.privacy { --hc-c: var(--secondary-text-color, #727272); }' +
      '.hicon.offline { --hc-c: var(--error-color, #db4437); }' +
      '.hicon ha-icon { --mdc-icon-size: 24px; }' +
      // Narrow card (half a Sections view, or a narrow column): the title shrinks to an ellipsis but keeps a few letters,
      // the HD / SD switch goes under it rather than out of the card, and the round buttons never shrink.
      '.titles { flex: 1 1 auto; min-width: 0; align-self: center; }' +
      ':host([hide-title]) .name-row > .name { display: none; }' +
      '.name-row { display: flex; flex-wrap: wrap; align-items: center; column-gap: 8px; row-gap: 4px; }' +
      '.name-row > .chips { flex: none; margin-left: auto; }' +
      '.chips:empty { display: none; }' +
      '.name { flex: 0 1 auto; min-width: 0; font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.summary { font-size: 12px; line-height: 1.35; margin-top: 2px; color: var(--secondary-text-color); }' +
      // The status pill right after the title, in the header icon's colour, while the title stays whole beside it
      // (measured by the card, see _fitPill). Otherwise it goes on its own line under a one-line summary, the HD / SD
      // switch staying beside the title; with its dot alone when even that does not fit the header, or below 200 px
      // (the text in its tooltip and for screen readers).
      '.stpill { display: inline-flex; align-items: center; gap: 4px; flex: none; max-width: 100%; box-sizing: border-box; padding: 1px 8px; border-radius: 12px;' +
      ' font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; --c: var(--primary-color, #03a9f4);' +
      ' background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }' +
      '.stpill.motion { --c: var(--warning-color, #ffa600); } .stpill.privacy { --c: var(--secondary-text-color, #727272); } .stpill.offline { --c: var(--error-color, #db4437); }' +
      '.stpill .sdot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: var(--c); }' +
      '.stpill .st-text { white-space: nowrap; }' +
      '.titles.below:not(.dot-only) .tstack { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 8px; }' +
      '.titles.below:not(.dot-only) .tstack > .name-row { display: contents; }' +
      '.titles.below:not(.dot-only) .name-row > .name { grid-column: 1; grid-row: 1; justify-self: start; max-width: 100%; }' +
      '.titles.below:not(.dot-only) .name-row > .chips { grid-column: 2; grid-row: 1; margin-left: 0; }' +
      '.titles.below:not(.dot-only) .tstack > .summary, .titles.below:not(.dot-only) .tstack > .chips.sub { grid-column: 1 / -1; }' +
      '.titles.below:not(.dot-only) .stpill { grid-column: 1 / -1; grid-row: 9; justify-self: start; margin-top: 3px; }' +
      '.titles.below .summary { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.titles.below .chips.sub { flex-wrap: nowrap; overflow: hidden; }' +
      '.titles.dot-only .stpill { padding: 4px; } .titles.dot-only .stpill .st-text { display: none; }' +
      '@container hc-card (max-width: 200px) { .stpill { padding: 4px; } .stpill .st-text { display: none; } }' +
      '.chips { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }' +
      '.chips.badges, .chips.sub { justify-content: flex-start; }' +
      '.chips.badges { margin-top: 8px; }' +
      '.chips.sub { margin-top: 4px; }' +
      // HD / SD switch: a track with the current option raised on it.
      '.seg { display: inline-flex; padding: 2px; gap: 2px; border-radius: 12px; background: var(--secondary-background-color, rgba(128,128,128,0.12)); }' +
      '.opt { font-size: 11px; font-weight: 600; letter-spacing: 0.02em; line-height: 18px; padding: 0 8px; border-radius: 10px; cursor: pointer;' +
      ' color: var(--secondary-text-color); user-select: none; transition: background 0.15s, color 0.15s; }' +
      '.opt.on { background: var(--card-background-color, #fff); color: var(--primary-color, #03a9f4); box-shadow: 0 1px 2px rgba(0,0,0,0.18); cursor: default; }' +
      '.opt:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }' +
      // Single camera: its badge as a round button, styled like the badges (neutral with the live dot,
      // green-tinted with the lock).
      '.toggle { width: 40px; height: 40px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; cursor: pointer;' +
      ' background: var(--secondary-background-color, rgba(128,128,128,0.12)); color: var(--primary-text-color); }' +
      '.toggle.private { background: color-mix(in srgb, var(--hc-on) 16%, transparent); color: var(--hc-on-ink); }' +
      '.toggle.pending { color: var(--secondary-text-color); cursor: progress; }' +
      '.toggle ha-icon { --mdc-icon-size: 22px; }' +
      '.toggle .dot { width: 12px; height: 12px; }' +
      // Badges: neutral with a red live dot while the camera films, green-tinted with a lock while hidden.
      '.chip { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; min-width: 0; box-sizing: border-box; font-size: 11px; font-weight: 500; line-height: 18px; padding: 1px 9px 1px 7px; border-radius: 12px;' +
      ' cursor: pointer; white-space: nowrap; user-select: none; background: var(--secondary-background-color, rgba(128,128,128,0.12)); color: var(--primary-text-color); }' +
      '.chip ha-icon { --mdc-icon-size: 13px; flex: none; }' +
      // A long badge name ends with an ellipsis instead of running out of the card (the full name is in the title).
      '.chip > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; }' +
      '.chip.private { background: color-mix(in srgb, var(--hc-on) 16%, transparent); color: var(--hc-on-ink); }' +
      ':is(.chip, .toggle).private:hover { background: color-mix(in srgb, var(--hc-on) 24%, transparent); }' +
      '.chip.pending { cursor: progress; color: var(--secondary-text-color); }' +
      // Switch unavailable: greyed out, and a tap does nothing.
      ':is(.chip, .toggle).dis { opacity: 0.5; cursor: not-allowed; color: var(--secondary-text-color); }' +
      '.chip:focus-visible, .toggle:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }' +
      '.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: var(--hc-live); }' +
      '.pending ha-icon { animation: hc-spin 0.9s linear infinite; }' +
      '@keyframes hc-spin { to { transform: rotate(360deg); } }' +
      // The one moving thing: the live dot on the images breathes, like a recording light.
      '@keyframes hc-live { 50% { opacity: 0.35; } }' +
      '.view:empty { display: none; }' +
      // Video wall: no card around the grid, edge to edge; the header is a card of its own above it (the
      // illustrated banner, then the privacy badges as pills), as the headers of the ha-* panels.
      ':host([wall]) ha-card { background: none; border: none; box-shadow: none; border-radius: 0; padding: 0; gap: 12px; overflow: visible; }' +
      ':host([wall]) .head { padding: 12px; overflow: hidden; background: var(--ha-card-background, var(--card-background-color, #fff));' +
      ' border-radius: var(--ha-card-border-radius, 12px); box-shadow: var(--ha-card-box-shadow, none);' +
      ' border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0)); }' +
      // Nothing under the banner: the header card ends on its parquet strip.
      ':host([wall]) .head:not(:has(> .badges)) .banner { margin-bottom: -12px; }' +
      ':host([wall]) .head > .chips.badges { margin-top: 12px; gap: 8px; }' +
      ':host([wall]) .head > .badges .chip { font-size: 13px; line-height: 20px; padding: 7px 14px 7px 12px; border-radius: 17px; gap: 8px; }' +
      ':host([wall]) .head > .badges .chip ha-icon { --mdc-icon-size: 16px; }' +
      ':host([wall]) .head > .badges .chip .dot { width: 8px; height: 8px; }' +
      // A camera in motion: its badge and its tile in amber.
      ':host([wall]) .chip.motion:not(.private):not(.dis) { background: color-mix(in srgb, var(--warning-color, #ffa600) 16%, transparent);' +
      ' color: color-mix(in srgb, var(--warning-color, #ffa600) 45%, var(--primary-text-color, #212121));' +
      ' box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--warning-color, #ffa600) 35%, transparent); }' +
      ':host([wall]) .grid { gap: 8px; }' +
      ':host([wall]) .tile { border-radius: 12px; }' +
      ':host([wall]) .tile.motion { outline: 2px solid var(--warning-color, #ffa600); outline-offset: -2px; }' +
      '.grid { display: grid; gap: 8px; }' +
      // A lone camera: the image bleeds to the card's sides and bottom (the card's corners round it), right
      // under the illustrated header's ground strip; no hairline ring on the card's edge.
      'ha-card.solo .view { margin: 0 -12px -12px; }' +
      'ha-card.solo .head:has(.banner) + .view { margin-top: -8px; }' +
      'ha-card.solo .tile { border-radius: 0; }' +
      'ha-card.solo .tile::after { display: none; }' +
      // container-type: size gives the tile no width of its own: in a parent sized by its content (inline-block,
      // an auto grid column) the card would fold to its padding. contain-intrinsic-width stands in for the image
      // there, and changes nothing where the card is given its width (the Sections view, a stack).
      '.tile { position: relative; aspect-ratio: var(--hc-ratio, 1.7778); border-radius: 12px; overflow: hidden; background: #0d0f12; container-type: size;' +
      ' contain-intrinsic-width: 240px; }' +
      // A hairline ring over the image, so dark scenes keep their edge on a dark card.
      '.tile::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.07); pointer-events: none; }' +
      ':is(.tile:fullscreen, .tile.pseudo)::after { display: none; }' +
      '.open { position: absolute; inset: 0; outline: none; border-radius: inherit; -webkit-tap-highlight-color: transparent; }' +
      '.open:focus-visible { box-shadow: inset 0 0 0 2px var(--primary-color, #03a9f4); }' +
      // A tap on the image puts it fullscreen, a second tap brings it back.
      '.open { cursor: zoom-in; }' +
      ':is(.tile:fullscreen, .tile.pseudo) .open { cursor: zoom-out; }' +
      '.tile :is(hc-camera-stream, ha-camera-stream, ha-web-rtc-player, hc-camera-still) { display: block; width: 100%; height: 100%; --video-max-height: 100%; }' +
      ':is(.tile:fullscreen, .tile.pseudo) { display: flex; align-items: center; justify-content: center; border-radius: 0; background: #000; }' +
      '.tile.pseudo { position: fixed; inset: 0; z-index: 10000; aspect-ratio: auto; }' +
      ':is(.tile:fullscreen, .tile.pseudo) :is(hc-camera-stream, ha-camera-stream, ha-web-rtc-player, hc-camera-still) { height: auto; --video-max-height: 100vh; }' +
      '.tile.off hc-camera-stream { display: none; }' +
      '.na { position: absolute; inset: 0; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-size: 12px;' +
      ' color: rgba(255,255,255,0.62); background: radial-gradient(circle at 50% 42%, #2a2e35, #121418 72%); }' +
      '.na ha-icon { --mdc-icon-size: 20px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%;' +
      ' background: rgba(255,255,255,0.07); }' +
      '.tile.off .na { display: flex; }' +
      '.tile.off .label .dot { display: none; }' +
      '.spin { position: absolute; inset: 0; margin: auto; width: 24px; height: 24px; box-sizing: border-box; border-radius: 50%; display: none;' +
      ' border: 2px solid rgba(255,255,255,0.18); border-top-color: rgba(255,255,255,0.9); animation: hc-spin 0.8s linear infinite; pointer-events: none; }' +
      '.tile.loading:not(.off) .spin { display: block; }' +
      // Name on the image: a glass pill with the live dot, not a dark gradient over the bottom of the picture.
      '.label { position: absolute; left: 8px; bottom: 8px; max-width: calc(100% - 16px); box-sizing: border-box; display: inline-flex; align-items: center; gap: 6px;' +
      ' padding: 3px 10px 3px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; line-height: 18px; color: #fff; pointer-events: none;' +
      ' background: var(--hc-glass); -webkit-backdrop-filter: blur(10px) saturate(1.3); backdrop-filter: blur(10px) saturate(1.3); }' +
      '.label .dot { animation: hc-live 2.4s ease-in-out infinite; }' +
      '.label .text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      ':is(.tile:fullscreen, .tile.pseudo) .label { font-size: 15px; padding: 5px 14px 5px 12px; left: max(16px, env(safe-area-inset-left));' +
      ' bottom: max(16px, env(safe-area-inset-bottom)); }' +
      // Above the pan & tilt pad: on narrow tiles the pad reaches the corner of the pan & tilt button.
      '.tools { position: absolute; top: 8px; right: 8px; z-index: 1; display: flex; gap: 6px; transition: opacity 0.15s; }' +
      ':is(.tile:fullscreen, .tile.pseudo) .tools { top: max(16px, env(safe-area-inset-top)); right: max(16px, env(safe-area-inset-right)); }' +
      '.btn { width: 30px; height: 30px; box-sizing: border-box; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;' +
      ' color: #fff; background: var(--hc-glass); border: 1px solid var(--hc-glass-line); -webkit-backdrop-filter: blur(10px) saturate(1.3); backdrop-filter: blur(10px) saturate(1.3);' +
      ' -webkit-tap-highlight-color: transparent; user-select: none; transition: background 0.15s, transform 0.1s; }' +
      '.btn:hover { background: rgba(14, 16, 20, 0.66); }' +
      '.btn:active { transform: scale(0.94); }' +
      '.btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }' +
      '.btn ha-icon { --mdc-icon-size: 17px; }' +
      // On: the same glass, the icon in the accent colour (no fill, like the other ha-* cards), and a faint
      // accent ring that keeps the state readable where light scenes turn the glass grey.
      '.tile.ptz-open .btn.ptz, .btn.sound.on, .move:active { color: var(--primary-color, #03a9f4);' +
      ' box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color, #03a9f4) 40%, transparent); }' +
      // Narrow tiles: the up arrow would run into the other buttons.
      '.tile.ptz-open .tools .btn:not(.ptz) { display: none; }' +
      // Pan & tilt: a round pad, its four arrows around a centre dot, in the bottom right corner (under the
      // thumb), sized to the tile (container units). Lightly tinted and not blurred: the image stays visible
      // through it, the arrows keep a shadow to stay readable on any scene.
      '.tile { --pad: min(120px, 58cqh); }' +
      '.pad { display: none; position: absolute; width: var(--pad); height: var(--pad); border-radius: 50%;' +
      ' right: 8px; bottom: 8px; background: rgba(14, 16, 20, 0.26); border: 1px solid rgba(255, 255, 255, 0.2); }' +
      '.tile.ptz-open .pad, :is(.tile:fullscreen, .tile.pseudo).has-ptz .pad { display: block; }' +
      '.pad::after { content: ""; position: absolute; inset: 0; margin: auto; width: calc(var(--pad) * 0.07); height: calc(var(--pad) * 0.07); border-radius: 50%;' +
      ' background: rgba(255,255,255,0.22); pointer-events: none; }' +
      '.move { --s: calc(var(--pad) * 0.32); position: absolute; width: var(--s); height: var(--s); touch-action: none;' +
      ' background: transparent; border-color: transparent; -webkit-backdrop-filter: none; backdrop-filter: none; }' +
      '.move:hover { background: rgba(255,255,255,0.12); }' +
      '.move:active { background: var(--hc-glass); }' +
      '.move ha-icon { --mdc-icon-size: calc(var(--s) * 0.62); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.7)); }' +
      '.move.left { left: 2px; top: calc(50% - var(--s) / 2); }' +
      '.move.right { right: 2px; top: calc(50% - var(--s) / 2); }' +
      '.move.up { top: 2px; left: calc(50% - var(--s) / 2); }' +
      '.move.down { bottom: 2px; left: calc(50% - var(--s) / 2); }' +
      '.move.dis { opacity: 0.35; cursor: default; }' +
      // The name keeps clear of the pad.
      '.tile.ptz-open .label { max-width: calc(100% - var(--pad) - 24px); }' +
      ':is(.tile:fullscreen, .tile.pseudo) { --pad: 164px; }' +
      ':is(.tile:fullscreen, .tile.pseudo) .pad { right: max(24px, env(safe-area-inset-right)); bottom: max(24px, env(safe-area-inset-bottom)); }' +
      ':is(.tile:fullscreen, .tile.pseudo) .btn:not(.move) { width: 40px; height: 40px; }' +
      ':is(.tile:fullscreen, .tile.pseudo) .btn:not(.move) ha-icon { --mdc-icon-size: 20px; }' +
      // Mouse: the buttons show on hover, so the image stays clear. Touch: always shown, and larger.
      '@media (hover: hover) and (pointer: fine) {' +
      ' .tile:not(:hover):not(:focus-within):not(.ptz-open) .tools { opacity: 0; } }' +
      // Touch: buttons larger, and a pad never too small for a finger, even on a narrow tile.
      '@media (pointer: coarse) { .btn:not(.move) { width: 36px; height: 36px; } .btn:not(.move) ha-icon { --mdc-icon-size: 20px; }' +
      ' .tile { --pad: min(120px, max(84px, 58cqh)); } }' +
      // Motion badge on the image's label: an amber sensor icon that pulses while a motion sensor is on.
      '.mot { display: none; flex: none; color: var(--warning-color, #ffa600); animation: hc-motion 1.2s ease-in-out infinite; }' +
      '.label .mot ha-icon { --mdc-icon-size: 14px; }' +
      '.tile.motion .label .mot, .thumb.live.motion .label .mot { display: inline-flex; }' +
      ':is(.tile:fullscreen, .tile.pseudo) .label .mot ha-icon { --mdc-icon-size: 18px; }' +
      '@keyframes hc-motion { 50% { opacity: 0.45; transform: scale(0.82); } }' +
      '@media (prefers-reduced-motion: reduce) { .label .dot, .spin, .pending ha-icon, .mot { animation: none; } }' +
      // Every camera hidden: a quiet panel where the grid would be, saying how to bring one back.
      '.asleep { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 64px; padding: 12px; box-sizing: border-box;' +
      ' border-radius: 12px; border: 1px dashed var(--divider-color, rgba(128,128,128,0.3)); font-size: 12px; color: var(--secondary-text-color); text-align: center; }' +
      '.asleep ha-icon { --mdc-icon-size: 18px; color: var(--hc-on); }' +
      '.empty { display: flex; align-items: center; gap: 10px; color: var(--secondary-text-color); }' +
      HC_BANNER_STYLE +
      // Mini card. Only its compact ha-card is a size container; a size container takes no width from its
      // content, so in a parent sized by its content it would fold to its padding: an empty, zero-height grid
      // before it gives the host up to 240px there, and no minimum. The header icon keeps its 40px.
      ':host([mini]) { display: block; min-width: 0; }' +
      ':host([mini])::before { content: ""; display: grid; grid-template-columns: minmax(0, 240px); height: 0; }' +
      'ha-card.mini { container: hc-card / inline-size; }' +
      // Detail button, top right of the header: the full card and back.
      '.zoom { flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px 0 0; border-radius: 50%; display: grid; place-items: center;' +
      ' color: var(--secondary-text-color); --mdc-icon-size: 16px; -webkit-tap-highlight-color: transparent; }' +
      '.zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 14%, transparent); color: var(--primary-text-color); }' +
      '.zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }' +
      // Compact view: a snapshot per camera, as many per row as fit (one camera takes the whole width).
      '.thumbs { display: grid; gap: 6px; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); }' +
      '.thumb { position: relative; aspect-ratio: var(--hc-ratio, 1.7778); border-radius: 10px; overflow: hidden; background: #0d0f12; cursor: pointer;' +
      ' -webkit-tap-highlight-color: transparent; }' +
      '.thumb::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.07); pointer-events: none; }' +
      '.thumb:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }' +
      '.thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }' +
      '.thumb .na { display: block; }' +
      '.thumb.live:not(.failed) .na, .thumb.failed img { display: none; }' +
      '.thumb .label { left: 4px; bottom: 4px; max-width: calc(100% - 8px); padding: 1px 8px 1px 6px; font-size: 11px; gap: 5px; }' +
      '.thumb .label ha-icon { --mdc-icon-size: 13px; flex: none; }' +
      '.thumb.hidden .label { color: color-mix(in srgb, var(--hc-on) 55%, #fff); }' +
      '.thumb:is(.off, .failed) .label { color: rgba(255,255,255,0.62); }' +
      // Preset positions, with the arrows (top left of the tile)
      '.presetsel { display: none; position: absolute; top: 8px; left: 8px; z-index: 2; max-width: calc(100% - 60px); height: 30px; padding: 0 10px;' +
      ' border-radius: 15px; border: 1px solid var(--hc-glass-line); background: var(--hc-glass); color: #fff; font: inherit; font-size: 13px;' +
      ' -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); cursor: pointer; }' +
      '.presetsel option { color: #000; }' +
      '.tile.ptz-open .presetsel, :is(.tile:fullscreen, .tile.pseudo).has-ptz .presetsel { display: block; }' +
      '.tile.clip .presetsel { display: none !important; }' +
      // Frigate: detection and recording switches in the bottom right corner (hidden with the pan & tilt pad there and
      // in fullscreen); the name stops before them.
      '.frs { position: absolute; right: 8px; bottom: 8px; z-index: 1; display: flex; gap: 6px; }' +
      '.frs .btn:not(.off) { color: #fff; } .frs .btn.frec:not(.off) ha-icon { color: #ff5a52; }' +
      '.frs .btn.off { color: rgba(255,255,255,0.55); } .frs .btn.dis { opacity: 0.45; cursor: default; }' +
      '.tile.ptz-open .frs, :is(.tile:fullscreen, .tile.pseudo) .frs, .tile.clip .frs { display: none; }' +
      '.tile.has-frs:not(.ptz-open) .label { max-width: calc(100% - 96px); }' +
      // An event's clip over the tile, with its Live button back
      '.clipv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; z-index: 2; }' +
      '.livebtn { position: absolute; top: 8px; left: 8px; z-index: 3; width: auto; padding: 0 12px 0 10px; gap: 6px; border-radius: 15px; font-size: 13px; font-weight: 500; }' +
      '.tile.clip .tools, .tile.clip .label { display: none; }' +
      // The events of the Frigate cameras under the grid: folded (a row) or listed
      '.events { margin-top: 12px; min-width: 0; }' +
      'ha-card.solo .events { margin: 12px; }' +
      '.evfold { display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 12px; border-radius: 12px; cursor: pointer;' +
      ' background: var(--secondary-background-color, rgba(127,127,127,0.1)); -webkit-tap-highlight-color: transparent; }' +
      '.evfold:focus-visible, .events [data-ev]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }' +
      '.evfold > ha-icon { --mdc-icon-size: 20px; color: var(--warning-color, #ffa600); flex: none; }' +
      '.evfold .tx, .evrow .tx { flex: 1; min-width: 0; }' +
      '.evfold .k { font-size: 14px; font-weight: 500; }' +
      '.evfold .s, .evrow .s { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.evfold .stack { display: flex; flex: none; padding-left: 12px; }' +
      '.evfold .stack .th { width: 44px; height: 28px; border-radius: 6px; margin-left: -12px; border: 2px solid var(--card-background-color, #fff);' +
      ' background: #20232a center / cover; }' +
      '.evfold.mini { gap: 8px; padding: 6px 8px 6px 10px; margin-top: 10px; } .evfold.mini .k { font-size: 13px; }' +
      '.events .chev { --mdc-icon-size: 22px; color: var(--secondary-text-color); display: inline-flex; cursor: pointer; border-radius: 50%; }' +
      '.evhead { display: flex; align-items: center; gap: 8px; padding: 10px 0 6px; border-top: 1px solid var(--divider-color); }' +
      '.evhead .t { font-size: 14px; font-weight: 500; } .evhead small { font-size: 12px; color: var(--secondary-text-color); }' +
      '.evhead .chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }' +
      '.evhead .chips + .chev { margin-left: 2px; } .evhead small + .chev { margin-left: auto; }' +
      '.events .chip { font-size: 12px; padding: 2px 9px; border-radius: 10px; cursor: pointer; background: var(--secondary-background-color, rgba(127,127,127,0.1)); }' +
      '.events .chip.on { background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, transparent); color: var(--primary-color, #03a9f4); }' +
      '.evrow { display: flex; gap: 10px; align-items: center; padding: 7px 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }' +
      '.evrow + .evrow { border-top: 1px solid var(--divider-color); }' +
      '.evrow .th { flex: none; width: 76px; height: 43px; border-radius: 7px; background: #20232a center / cover; }' +
      '.evrow.noclip { cursor: default; } .evrow:not(.noclip):hover .k { color: var(--primary-color, #03a9f4); }' +
      '.evrow .k { font-size: 13px; font-weight: 500; display: flex; gap: 6px; align-items: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.evrow .k ha-icon { --mdc-icon-size: 16px; flex: none; color: var(--warning-color, #ffa600); } .evrow .k ha-icon.g-animal { color: #26a69a; }' +
      '.evrow .k ha-icon.g-vehicle { color: #5c6bc0; } .evrow .k ha-icon.g-other { color: var(--secondary-text-color); }' +
      '.evrow .sc { font-size: 12px; color: var(--secondary-text-color); flex: none; }' +
      '.evnone { font-size: 13px; color: var(--secondary-text-color); padding: 8px 0; }' +
      '</style>'
    );
  }

  // A preset chosen: the camera goes there; the list shows its placeholder again
  _onChange(ev) {
    const sel = ev.composedPath().find((n) => n.dataset?.preset);
    if (!sel || !sel.value) return;
    this._call('select', 'select_option', { entity_id: sel.dataset.preset, option: sel.value }).catch(() => {});
    sel.selectedIndex = 0;
  }

  _onClick(ev) {
    const path = ev.composedPath();
    // The preset list is a native select: its clicks are its own
    if (path.some((n) => n.localName === 'select')) return;
    // The controls of a clip playing over a tile are the video's own
    if (path.some((n) => n.classList?.contains?.('clipv'))) return;
    const evEl = path.find((n) => n.dataset?.ev);
    if (evEl) {
      this._onEvent(evEl, ev);
      return;
    }
    const q = path.find((n) => n.dataset?.quality)?.dataset.quality;
    if (q) {
      if ((q === 'hd') !== this._hd()) this._toggleQuality();
      return;
    }
    const toggle = path.find((n) => n.dataset?.toggle);
    if (toggle) {
      const id = toggle.dataset.toggle;
      // One toggle at a time: taps while the switch has not answered are ignored, and so are taps on an
      // unavailable switch (its badge is disabled).
      if (this._isPending(id) || !this._usable(id)) return;
      // A camera as its own privacy control: turned on or off (cameras have no toggle action)
      const [domain] = id.split('.');
      const service = domain === 'camera' ? (this._state(id) === 'off' ? 'turn_on' : 'turn_off') : 'toggle';
      this._call(domain, service, { entity_id: id }).catch(() => {
        // Refused (not allowed, entity gone): the badge stops waiting at once instead of spinning for 15 s.
        const p = this._pending?.get(id);
        if (!p) return;
        clearTimeout(p.timer);
        this._pending.delete(id);
        this._headSig = null;
        this._update();
      });
      this._setPending(id);
      return;
    }
    const tile = path.find((n) => n.dataset?.cam);
    if (!tile) return;
    const btn = path.find((n) => n.dataset?.action);
    const action = btn?.dataset.action;
    if (action === 'ptz') tile.classList.toggle('ptz-open');
    else if (action === 'sound') this._toggleSound(tile);
    else if (action === 'fullscreen') this._toggleFullscreen(tile);
    else if (action === 'details') this._moreInfo(tile._cam?.camera || tile._entity);
    else if (action === 'live') this._stopClip(tile);
    else if (action === 'fdetect' || action === 'frec') {
      if (!btn.classList.contains('dis')) this._call('switch', 'toggle', { entity_id: btn.dataset.entity }).catch(() => {});
    } else if (action === 'frigate') {
      const url = this._frigateUrl(tile._cam);
      if (url) this._openFrigate(url);
    }
    else if (action === 'move') {
      // A pointer press already moved the camera (pointerdown); a click without a pointer did not.
      if (ev.type !== 'click' || !ev.detail) {
        this._move(btn);
        if (btn.dataset.cont) setTimeout(() => this._ptzStop(btn), HC_PTZ_HOLD_MS);
      }
    } else if (tile.classList.contains('ptz-open')) tile.classList.remove('ptz-open');
    // A tap on the image: fullscreen, and out of it again (arrows or not).
    else this._toggleFullscreen(tile);
  }

  // The stream quality selects of the cameras that switch their stream themselves (Tapo Cameras)
  _qualitySelects() {
    if (!this._hass || !this._config) return [];
    return this._cameras()
      .map((cam) => cam.quality)
      .filter(Boolean);
  }

  _toggleQuality() {
    const c = this._config;
    const next = !this._hd();
    // Tapo Cameras: each camera's own select switches its stream (for every viewer: it is the camera's stream)
    const option = next ? 'hd' : 'sd';
    for (const select of this._qualitySelects()) {
      if (this._usable(select) && this._state(select) !== option) {
        this._call('select', 'select_option', { entity_id: select, option }).catch(() => {});
      }
    }
    if (c.quality_entity) {
      const domain = c.quality_entity.split('.')[0];
      this._call(domain, 'select_option', {
        entity_id: c.quality_entity,
        option: next ? c.hd_option : c.sd_option,
      }).catch(() => {});
      return;
    }
    this._quality = next ? 'hd' : 'sd';
    try {
      localStorage.setItem(HC_QUALITY_KEY, this._quality);
    } catch (_e) {
      // storage unavailable: the choice lasts until the page reloads
    }
    this._update();
    // The other cards of this page follow (the storage event only reaches the other tabs).
    window.dispatchEvent(new CustomEvent(HC_QUALITY_EVENT));
  }
}

// Grid columns, never more than the cameras shown: one camera takes the full width.
export function hcColumns(config, count) {
  return Math.max(1, Math.min(Number(config.columns) || 2, count));
}
