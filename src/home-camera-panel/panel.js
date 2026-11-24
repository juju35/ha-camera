// ── End of the folded top bar ──
import { HCP_CARD, HCP_HIDE, HCP_TABS, HCP_WALL, hcpCardConfig, hcpEsc, hcpFindCard, hcpFoundEntry, hcpT } from "./core.js";
import { HOME_CAMERA_PANEL_VERSION } from "./version.js";
import { homeCameraPanelFold } from "./fold.js";
import { HomeCameraPanelI18n } from "./i18n/homecamerapaneli18n.js";

export class HomeCameraPanel extends HTMLElement {
  static VERSION = HOME_CAMERA_PANEL_VERSION;

  static STYLE = `
    :host { display:block; min-height:100%; background:var(--primary-background-color); color:var(--primary-text-color); }
    /* The top bar: the card's illustrated header across the page (a camera on a wall, a parquet strip, day and
       night), as on the ENT ONE panel — title and status, how many cameras are live, HD / SD and the integration */
    .toolbar { position:relative; height:90px; overflow:hidden; background:#f2efe9; color:#1f2328; --hcp-muted:#5d6670; }
    .toolbar.night { background:#2a2b33; color:#fff; --hcp-muted:rgba(255,255,255,.78); }
    .toolbar .hc-scene { right:var(--tb-acts, 150px); width:min(200px, 34%); }
    .toolbar .bhead { right:calc(min(200px, 34%) + var(--tb-acts, 150px)); padding:0 8px; }
    .toolbar .bhead ha-menu-button { flex:none; color:inherit; }
    .toolbar .bname { font-size:20px; }
    .toolbar .bicon.motion, .toolbar .stpill.motion { --c:var(--warning-color, #ffa600); }
    .toolbar .bicon.live, .toolbar .stpill.live { --c:#e5484d; }
    .toolbar .bicon.privacy, .toolbar .stpill.privacy { --c:#7a8594; }
    .toolbar .bicon.offline, .toolbar .stpill.offline { --c:var(--error-color, #db4437); }
    .tacts { position:absolute; z-index:2; top:calc((100% - 10px) / 2 - 17px); right:12px; display:flex; align-items:center; gap:6px; }
    .tacts a, .tacts .qseg { color:#33506b; background:rgba(255,255,255,.55); box-shadow:inset 0 0 0 1px rgba(255,255,255,.7); }
    .tacts a { width:34px; height:34px; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:20px; }
    .tacts a:hover { background:rgba(255,255,255,.82); }
    .night .tacts a, .night .tacts .qseg { color:#fff; background:rgba(255,255,255,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.2); }
    .qseg { display:inline-flex; padding:3px; border-radius:17px; gap:2px; }
    .qseg button { border:0; background:none; cursor:pointer; font:inherit; font-size:12px; font-weight:600; padding:4px 10px; border-radius:14px; color:inherit; opacity:.7; }
    .qseg button[aria-checked="true"] { background:#fff; color:var(--primary-color, #03a9f4); opacity:1; }
    .night .qseg button[aria-checked="true"] { background:rgba(255,255,255,.2); color:#fff; }
    .qseg button:focus-visible, .tacts a:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
    @media (max-width:600px) { .toolbar .hc-scene { display:none; } .toolbar .bhead { right:var(--tb-acts, 150px); } }
    /* Tabs under the top bar, on the page background: text, the active one underlined, sticky at the top */
    .tabs { display:flex; align-items:center; gap:4px; padding:0 12px; overflow-x:auto; background:var(--primary-background-color);
            border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12)); position:sticky; top:0; z-index:2; }
    .tabs[hidden] { display:none; }
    .tab { background:none; border:none; border-bottom:2px solid transparent; color:var(--secondary-text-color); padding:12px 12px 10px; font:inherit;
           font-size:14px; font-weight:500; cursor:pointer; white-space:nowrap; }
    .tab:hover { color:var(--primary-text-color); }
    .tab:focus-visible { outline:2px solid var(--primary-color); outline-offset:-2px; }
    .tab.active { color:var(--primary-text-color); border-bottom-color:var(--warning-color, #ffa600); }
    .tab .cnt { display:inline-block; min-width:18px; padding:1px 5px; margin-left:5px; border-radius:9px; font-size:11px; text-align:center; box-sizing:border-box;
                color:color-mix(in srgb, var(--warning-color, #ffa600) 60%, var(--primary-text-color)); background:color-mix(in srgb, var(--warning-color, #ffa600) 18%, transparent); }
    /* Settings: its header card without a picture (the picture is the top bar now) */
    .thead { display:flex; align-items:center; gap:10px; padding:12px 16px; min-width:0; }
    .thead .bicon { background:color-mix(in srgb, var(--c) 14%, transparent); box-shadow:none; }
    .thead .bsub { color:var(--secondary-text-color); }
    .thead .stpill { background:color-mix(in srgb, var(--c) 15%, transparent); color:color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
    main { margin:0 auto; padding:16px; box-sizing:border-box; }
    /* The cameras as a video wall, edge to edge under its header card; the settings at reading width */
    main.settings { max-width:940px; }
    section[hidden] { display:none; }
    .column { display:flex; flex-direction:column; gap:12px; min-width:0; }
    .note { padding:16px; color:var(--secondary-text-color); display:flex; flex-direction:column; gap:10px; align-items:flex-start; }
    .note.error { color:var(--primary-text-color); border-left:3px solid var(--error-color, #db4437); }
    .block { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
    .block h2 { margin:0; font-size:16px; font-weight:500; }
    .ctl { display:flex; flex-direction:column; gap:4px; min-width:0; }
    .ctl > span { font-size:12px; color:var(--secondary-text-color); }
    .ctl small { font-size:11px; color:var(--secondary-text-color); opacity:.85; }
    .box { display:flex; align-items:center; border-radius:8px; border:1px solid var(--divider-color, rgba(127,127,127,.3));
           background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .box:focus-within { border-color:var(--primary-color); }
    .box input { flex:1; min-width:0; border:0; outline:0; background:none; color:inherit; font:inherit; font-size:14px; padding:8px 10px; }
    .bar { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
    .bar .grow { flex:1; }
    .msg { font-size:12px; color:var(--secondary-text-color); overflow-wrap:anywhere; }
    .msg.good { color:color-mix(in srgb, var(--success-color, #43a047) 50%, var(--primary-text-color)); }
    .msg.bad { color:color-mix(in srgb, var(--error-color, #db4437) 50%, var(--primary-text-color)); }
    /* Tinted buttons, never filled (the convention of the ha-* cards) */
    .act { display:inline-flex; align-items:center; gap:6px; border:0; cursor:pointer; font:inherit; font-size:13px; font-weight:500;
           padding:7px 12px; border-radius:8px; --mdc-icon-size:16px; color:var(--primary-color); text-decoration:none;
           background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .act:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color) 22%, transparent); }
    .act.quiet { color:var(--primary-text-color); background:var(--secondary-background-color, rgba(127,127,127,.12)); }
    .act[disabled] { opacity:.5; cursor:default; }
    ha-card { display:block; }
    ha-card[hidden] { display:none; }
    .bar.head h2 { margin:0; }
    /* The charter of the ha-* cards and panels: a header card with its illustrated banner, then lists under an
       uppercase title whose rows are filled and rounded, each with a round tinted icon; pill buttons */
    :host { --hcp-sec: color-mix(in srgb, var(--primary-text-color) 6%, var(--card-background-color, #fff)); }
    .act { min-height:36px; box-sizing:border-box; padding:0 14px; border-radius:18px; }
    .act.quiet { background:var(--hcp-sec); }
    ha-card.list { padding:12px 16px 14px; display:flex; flex-direction:column; gap:6px; }
    ha-card.list[hidden] { display:none; }
    .lhead { display:flex; align-items:center; gap:8px; min-height:36px; padding-bottom:2px; }
    .lname { flex:1; min-width:0; margin:0; font-size:12px; font-weight:500; letter-spacing:.05em; text-transform:uppercase; color:var(--secondary-text-color); }
    .list .msg { margin:0 0 4px; }
    .list .ctl + .ctl { margin-top:12px; }
    .rows { display:flex; flex-direction:column; gap:6px; }
    .item { display:flex; align-items:center; gap:10px; min-height:56px; padding:8px 10px 8px 8px; border-radius:12px; background:var(--hcp-sec);
            border:1px solid transparent; box-sizing:border-box; min-width:0; }
    .item.found { background:color-mix(in srgb, var(--primary-color) 9%, var(--hcp-sec)); border-color:color-mix(in srgb, var(--primary-color) 22%, transparent); }
    .item.open { border-color:color-mix(in srgb, var(--primary-color) 45%, transparent); }
    .item.over { border-color:var(--primary-color); border-style:dashed; }
    .item .act.quiet, .item .round { background:var(--card-background-color, #fff); }
    .ic { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:22px;
          color:var(--primary-text-color); background:color-mix(in srgb, var(--secondary-text-color) 14%, transparent); }
    .ic.info { color:color-mix(in srgb, var(--primary-color) 70%, var(--primary-text-color)); background:color-mix(in srgb, var(--primary-color) 16%, transparent); }
    .ic.good { color:color-mix(in srgb, var(--success-color, #43a047) 70%, var(--primary-text-color)); background:color-mix(in srgb, var(--success-color, #43a047) 16%, transparent); }
    .ic.bad { color:color-mix(in srgb, var(--error-color, #db4437) 70%, var(--primary-text-color)); background:color-mix(in srgb, var(--error-color, #db4437) 16%, transparent); }
    .who { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .who .n { font-size:14px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .who .s { font-size:12px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .tags { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; flex:none; max-width:45%; }
    .tag { padding:2px 9px; border-radius:11px; font-size:11.5px; font-weight:500; line-height:16px; white-space:nowrap;
           background:var(--card-background-color, #fff); color:var(--primary-text-color); }
    .tag.good { background:color-mix(in srgb, var(--success-color, #43a047) 16%, transparent); color:color-mix(in srgb, var(--success-color, #43a047) 55%, var(--primary-text-color)); }
    .round { width:40px; height:40px; flex:none; border-radius:50%; border:0; display:grid; place-items:center; cursor:pointer; color:var(--primary-text-color); --mdc-icon-size:18px; }
    .round:hover { color:var(--primary-color); }
    .round[aria-expanded="true"] { color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .drag { width:24px; height:40px; flex:none; border:0; padding:0; background:none; display:grid; place-items:center; cursor:grab; color:var(--secondary-text-color); --mdc-icon-size:20px; border-radius:6px; }
    .drag:focus-visible, .round:focus-visible, .act:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
    .editbox { margin:0 0 4px 34px; padding:4px 4px 0; display:flex; flex-direction:column; gap:8px; }
    .act.danger { color:var(--error-color, #db4437); }
    .savebar { padding:10px 12px; position:sticky; bottom:12px; z-index:1; }
    .savebar .msg { text-align:right; }
    /* The header card: the 90 px illustrated banner of the ha-* cards, edge to edge */
    ha-card.top { overflow:hidden; }
    .banner { position:relative; height:90px; overflow:hidden; background:#f2efe9; color:#1f2328; --hcp-muted:#5d6670; container-type:inline-size; }
    .banner.night { background:#2a2b33; color:#fff; --hcp-muted:rgba(255,255,255,.78); }
    .bscene { position:absolute; right:16px; bottom:10px; height:80px; width:min(200px, 40%); }
    .bground { position:absolute; left:0; right:0; bottom:0; height:10px; background:repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow:inset 0 2px 0 #a97c50; }
    .night .bground { background:repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow:inset 0 2px 0 #5a4634; }
    .bhead { position:absolute; left:0; top:0; bottom:10px; right:calc(min(200px, 40%) + 20px); padding:0 12px; display:flex; align-items:center; gap:10px; min-width:0; }
    .bicon { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:24px; --c:#7a8594; color:var(--c);
             background:rgba(255,255,255,.62); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
    .bicon.warn { --c:var(--warning-color, #ffa600); }
    .night .bicon { background:rgba(255,255,255,.12); color:color-mix(in srgb, var(--c) 72%, #fff); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); }
    .btitles { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .brow { display:flex; align-items:center; flex-wrap:wrap; gap:4px 8px; min-width:0; }
    .bname { font-size:16px; font-weight:500; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bsub { font-size:13px; line-height:18px; color:var(--hcp-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .stpill { display:inline-flex; align-items:center; gap:4px; padding:1px 8px; border-radius:12px; font-size:11px; font-weight:500; line-height:16px; white-space:nowrap;
              --c:var(--success-color, #43a047); background:color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color:color-mix(in srgb, var(--c) 45%, #0d2a45); }
    .stpill.warn { --c:var(--warning-color, #ffa600); }
    .stpill .sdot { width:7px; height:7px; border-radius:50%; background:var(--c); }
    .night .stpill { background:color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color:color-mix(in srgb, var(--c) 35%, #fff); }
    .bscene .rot { transform-box:fill-box; transform-origin:center; animation:hcp-rot 9s linear infinite; }
    .bscene .rot.rev { animation-duration:6s; animation-direction:reverse; }
    .bscene .leaf { transform-box:fill-box; transform-origin:50% 100%; animation:hcp-sway 4s ease-in-out infinite; }
    @keyframes hcp-rot { to { transform:rotate(360deg); } }
    @keyframes hcp-sway { 0%, 100% { transform:rotate(-4deg); } 50% { transform:rotate(4deg); } }
    @media (prefers-reduced-motion: reduce) { .bscene * { animation:none !important; } }
    @container (max-width:360px) { .bscene { display:none; } .bhead { right:0; } }
    @media (max-width:600px) { .tags { display:none; } .editbox { margin-left:0; } }
    /* Top bar hidden (Settings › Panel): the title bar goes, the tabs stay at the top. The menu button stays where
       Home Assistant shows it (narrow screen or sidebar hidden): at the start of the tabs, or, with no tabs (a user who
       is not an administrator), as a round button at the bottom left */
    .tabmenu { display:none; color:var(--primary-text-color); align-self:center; margin-right:4px; }
    :host([bare][menu]) .tabs .tabmenu { display:flex; }
    :host([bare]) .tabs { top:0; }
    :host([bare][tabs]) .toolbar, :host([bare]:not([menu])) .toolbar { display:none; }
    :host([bare]) .toolbar { display:flex; align-items:center; overflow:visible; position:fixed; top:auto; left:16px; bottom:16px; z-index:3; width:44px; height:44px; padding:0; gap:0;
                             justify-content:center; border-radius:50%; border-bottom:none; color:var(--primary-text-color);
                             background:color-mix(in srgb, var(--card-background-color, #fff) 82%, transparent);
                             -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); box-shadow:0 2px 8px rgba(0,0,0,.25); }
    :host([bare]) .toolbar > :not(.bhead), :host([bare]) .toolbar .bhead > :not(ha-menu-button) { display:none; }
    :host([bare]) .toolbar .bhead { position:static; padding:0; display:contents; }
    :host([bare]) .toolbar .grow { display:none; }
    .seg { display:inline-flex; flex-wrap:wrap; gap:4px; padding:3px; border-radius:20px; background:var(--hcp-sec); align-self:flex-start; }
    .seg button { border:0; background:none; cursor:pointer; font:inherit; font-size:13px; font-weight:500; padding:7px 14px; border-radius:17px; color:var(--secondary-text-color); }
    .seg button[aria-checked="true"] { background:var(--card-background-color, #fff); color:var(--primary-color); box-shadow:0 1px 2px rgba(0,0,0,.14); }
    .seg button:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._tab = 'cameras';
    this._data = null; // the settings pushed by home_camera/subscribe
    this._draft = null; // the Settings tab's edits: { card, title }
    this._shownCard = null; // the card configuration the Cameras tab shows, as JSON
    this._status = null; // { tone, text } under the Settings tab's buttons
  }

  // /cameras/settings opens Settings (administrators); the base address is Cameras
  set route(route) {
    // Kept: before hass (who the user is), Settings cannot be told apart from a tab the user may not open
    this._wanted = (route?.path || '').split('/').filter(Boolean)[0];
    var tab = this._tabs().includes(this._wanted) ? this._wanted : 'cameras';
    if (tab !== this._tab) this._showTab(tab);
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
    if (this._tabMenu) this._tabMenu.narrow = narrow;
    this._syncBare();
  }

  set panel(panel) {
    this._panel = panel;
    this._syncBare();
  }

  set hass(hass) {
    var first = !this._hass;
    var langBefore = this._lang();
    var adminBefore = this._admin();
    this._hass = hass;
    if (this._menu) this._menu.hass = hass;
    if (this._tabMenu) this._tabMenu.hass = hass;
    if (this._card) this._card.hass = hass;
    if (this._editor) this._editor.hass = hass;
    if (this._camEditor) this._camEditor.hass = hass;
    if (this._timeline) this._timeline.hass = hass;
    if (first) this._start();
    else if (this._lang() !== langBefore || this._admin() !== adminBefore) this._render();
    else if (this._tab === 'settings') this._renderBanner();
    // A motion, a privacy switch, a camera going offline: the top bar and the tab's count follow
    if (!first && this._data) {
      var camSig = JSON.stringify((this._camStates() || []).map((c) => [c.hidden, c.up, c.motion]));
      if (camSig !== this._camSig) {
        this._camSig = camSig;
        this._renderCameras();
      } else this._renderTop();
    }
    this._syncBare();
  }

  // Home Assistant may set panel, narrow, route and hass before the element is defined: they land as plain
  // properties hiding the setters, so they are passed through them (hass last: it starts the panel).
  _upgradeProperties() {
    ['panel', 'narrow', 'route', 'hass'].forEach((name) => {
      if (!Object.hasOwn(this, name)) return;
      var value = this[name];
      delete this[name];
      this[name] = value;
    });
  }

  connectedCallback() {
    this._upgradeProperties();
    if (!this._fold && this.shadowRoot?.querySelector?.(".toolbar")) this._attachFold();
    // HD / SD switched on a card of this page: the top bar's switch follows
    this._onQuality = this._onQuality || (() => {
      this._topSig = null;
      this._renderTop();
    });
    window.addEventListener('home-camera-card-quality', this._onQuality);
    if (this._hass && !this._unsub) this._subscribe();
  }

  disconnectedCallback() {
    window.removeEventListener('home-camera-card-quality', this._onQuality);
    this._fold?.detach();
    this._fold = null;
    if (this._unsub) {
      this._unsub.then((off) => off()).catch(() => {});
      this._unsub = null;
    }
  }

  _admin() {
    return !!this._hass?.user?.is_admin;
  }

  // Events when the card shows Frigate cameras (and frigate.events is not off), for every user; Settings is the
  // administrators' only
  _tabs() {
    var tabs = ['cameras'];
    if (this._hasEvents()) tabs.push('events');
    if (this._admin()) tabs.push('settings');
    return tabs;
  }

  _hasEvents() {
    var card = this._data?.card;
    if (!card || card.frigate?.events === false) return false;
    return (card.cameras || []).some((cam) => {
      var id = typeof cam === 'string' ? cam : cam?.camera;
      var platform = this._hass?.entities?.[id]?.platform;
      if (platform) return platform === 'frigate';
      var attrs = this._hass?.states?.[id]?.attributes;
      return !!(attrs?.camera_name && attrs?.client_id);
    });
  }

  // Full code when it has a table (sr-Latn), else its base (de-AT → de), else English
  _lang() {
    var code = this._hass?.language || 'en';
    if (HomeCameraPanelI18n[code]) return code;
    var base = code.split('-')[0];
    return HomeCameraPanelI18n[base] ? base : 'en';
  }

  _t(key, vars) {
    return hcpT(this._lang(), key, vars);
  }

  _start() {
    this._render();
    this._loadCard();
    this._subscribe();
  }

  // The card file is a dashboard resource, loaded on dashboards only: the panel loads it itself (same file, cached)
  // for its video wall element and the camera editor.
  async _loadCard() {
    if (customElements.get(HCP_WALL)) return;
    var url = this._panel?.config?.card_url || '/home_camera/home-camera-card.js';
    try {
      await import(url);
      await customElements.whenDefined(HCP_WALL);
    } catch (err) {
      console.error('Home Camera panel: could not load the card', err);
      this._cardError = true;
    }
    this._renderCameras();
    if (this._tab === 'events') this._renderEvents();
  }

  // The settings at once, then on every change (saved here or on another device). The connection resubscribes
  // by itself after a reconnection.
  _subscribe() {
    if (this._unsub || !this._hass?.connection) return;
    this._unsub = this._hass.connection
      .subscribeMessage((data) => this._onSettings(data), { type: 'home_camera/subscribe' })
      .catch((err) => {
        this._unsub = null;
        this._loadError = String(err?.message || err).replace(/\.\s*$/, '');
        this._renderCameras();
        return () => {};
      });
  }

  _onSettings(data) {
    var dirty = this._dirty();
    var tabsBefore = JSON.stringify(this._tabs());
    this._data = data;
    // Frigate cameras added or removed: the Events tab comes or goes
    if (JSON.stringify(this._tabs()) !== tabsBefore) this._render();
    this._loadError = null;
    // Unsaved edits are kept; otherwise the form follows what was saved (here or elsewhere)
    if (!dirty) this._draft = null;
    this._syncBare();
    this._renderCameras();
    this._renderSettings();
  }

  _dirty() {
    if (!this._draft || !this._data) return false;
    return (
      JSON.stringify(this._draft.card) !== JSON.stringify(this._data.card) ||
      this._draft.title !== this._data.title ||
      this._draft.hide !== (this._data.hide_toolbar || 'never')
    );
  }

  _goTab(tab, focus) {
    if (!this._tabs().includes(tab)) return;
    this._wanted = tab;
    this._showTab(tab, focus);
    var base = (this._panel?.url_path || 'cameras').replace(/^\//, '');
    try {
      history.replaceState(history.state, '', `/${base}${tab === 'cameras' ? '' : `/${tab}`}`);
    } catch (_err) {
      // no history (a test, a sandboxed page): the tab still shows
    }
  }

  _showTab(tab, focus) {
    this._tab = tab;
    var root = this.shadowRoot;
    root.querySelectorAll?.('.tab').forEach((button) => {
      var selected = button.dataset.tab === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    HCP_TABS.forEach((name) => {
      var section = root.getElementById?.(`tab-${name}`);
      if (section) section.hidden = name !== tab;
    });
    var main = root.querySelector?.('main');
    if (main) main.className = tab;
    this._syncBare();
    if (tab === 'settings') this._renderSettings();
    if (tab === 'events') this._renderEvents();
    // The timeline's clip and live stream run only while its tab is shown
    if (this._timeline) this._timeline.active = tab === 'events';
  }

  // ── Events tab: the card's Frigate timeline (hc-frigate-timeline, from the card file) ──
  _renderEvents() {
    var section = this.shadowRoot?.getElementById?.('tab-events');
    if (!section || !this._data || !customElements.get('hc-frigate-timeline')) return;
    if (!this._timeline) {
      this._timeline = document.createElement('hc-frigate-timeline');
      // Today's count on the tab
      this._timeline.addEventListener('hc-events-count', (ev) => {
        this._eventCount = ev.detail?.count || 0;
        this._renderEventCount();
      });
    }
    if (this._timeline.parentNode !== section) section.replaceChildren(this._timeline);
    var json = JSON.stringify(this._data.card || {});
    if (json !== this._timelineConfig) {
      this._timelineConfig = json;
      this._timeline.hass = this._hass;
      this._timeline.config = this._data.card || {};
    }
    this._renderEventCount();
  }

  _renderEventCount() {
    var tab = this.shadowRoot?.getElementById?.('tabbtn-events');
    if (!tab) return;
    var n = this._eventCount || 0;
    var label = `${hcpEsc(this._t('events'))}${n ? `<span class="cnt">${n}</span>` : ''}`;
    if (tab.innerHTML !== label) tab.innerHTML = label;
  }

  // The title bar hidden as saved (never, for the users who are not administrators, or for everyone); the tabs stay.
  // Until the settings arrive, the panel's registration says it: the bar is never shown then hidden while loading.
  _bare() {
    var hide = this._data?.hide_toolbar ?? this._panel?.config?.hide_toolbar;
    return hide === 'everyone' || (hide === 'users' && !this._admin());
  }

  _syncBare() {
    this.toggleAttribute?.('bare', this._bare());
    this.toggleAttribute?.('tabs', this._tabs().length > 1);
    // Where Home Assistant shows the menu button: narrow screen, or the sidebar set to always hidden
    this.toggleAttribute?.('menu', !!this._narrow || this._hass?.dockedSidebar === 'always_hidden');
  }

  /** The top bar folds on scroll into one bar with the tabs as icon pills (see homeCameraPanelFold). */
  _attachFold() {
    this._fold?.detach();
    this._fold = homeCameraPanelFold(this, {
      top: ".toolbar",
      tabs: ".tabs",
      tab: ".tab",
      key: (b) => b.dataset.tab,
      icons: { cameras: "mdi:cctv", settings: "mdi:cog" },
      badge: ".cnt",
      name: ".toolbar .bname",
      sub: ".toolbar .bsub",
      icon: ".toolbar .bicon",
      status: ".toolbar .stpill",
      acts: ".toolbar .tacts > a",
      accent: "#e5484d",
      skip: () => this.hasAttribute("bare"),
      menu: () => ({ hass: this._hass, narrow: this._narrow, show: true }),
    });
  }

  _render() {
    var root = this.shadowRoot;
    var esc = hcpEsc;
    var tabs = this._tabs();
    if (tabs.includes(this._wanted)) this._tab = this._wanted;
    if (!tabs.includes(this._tab)) this._tab = 'cameras';
    var title = this._data?.sidebar_title || this._panel?.title || this._t('cameras');
    root.innerHTML = `
      <style>${HomeCameraPanel.STYLE}</style>
      <div class="toolbar${this._hass?.themes?.darkMode ? ' night' : ''}">
        <div class="tbscene"></div>
        <div class="bhead"><ha-menu-button></ha-menu-button><span class="bicon"><ha-icon icon="mdi:cctv"></ha-icon></span>
          <div class="btitles"><div class="brow"><span class="grow bname">${esc(title)}</span><span class="tpill"></span></div><div class="bsub"></div></div></div>
        <div class="tacts"><span class="tq"></span>${this._admin() ? `<a href="/config/integrations/integration/home_camera" title="${esc(this._t('integration'))}" aria-label="${esc(this._t('integration'))}"><ha-icon icon="mdi:cog"></ha-icon></a>` : ''}</div>
      </div>
      <div class="tabs" role="tablist"${tabs.length < 2 ? ' hidden' : ''}><ha-menu-button class="tabmenu"></ha-menu-button>${tabs.map((tab) => this._tabHtml(tab)).join('')}</div>
      <main class="${this._tab}">
        <section class="column" id="tab-cameras" role="tabpanel" aria-labelledby="tabbtn-cameras"></section>
        <section class="column" id="tab-events" role="tabpanel" aria-labelledby="tabbtn-events"></section>
        <section class="column" id="tab-settings" role="tabpanel" aria-labelledby="tabbtn-settings"></section>
      </main>`;
    this._menu = root.querySelector('.toolbar ha-menu-button');
    this._topSig = null;
    this._menu.hass = this._hass;
    this._menu.narrow = this._narrow;
    this._tabMenu = root.querySelector('.tabmenu');
    this._tabMenu.hass = this._hass;
    this._tabMenu.narrow = this._narrow;
    root.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => this._goTab(button.dataset.tab));
      // Left and right arrows move between the tabs, as in a native tab bar
      button.addEventListener('keydown', (ev) => {
        var step = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        ev.preventDefault();
        var i = tabs.indexOf(this._tab);
        this._goTab(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
    // A new shadow DOM: the card and the editor are drawn again
    this._card = null;
    this._shownCard = null;
    this._editor = null;
    this._camEditor = null;
    this._showTab(this._tab);
    this._renderCameras();
    this._attachFold();
  }

  // The cameras of the panel as the card sees them (window.HomeCameraKit, from the card file), each with what it
  // is doing now: hidden (privacy on or power off), up (its camera entity answers), motion (a motion sensor on)
  _camStates() {
    var kit = window.HomeCameraKit;
    var hass = this._hass;
    var raws = this._data?.card?.cameras || [];
    if (!kit || !hass) return null;
    var st = (id) => hass.states?.[id]?.state;
    var showMotion = this._data?.card?.show_motion !== false;
    return raws
      .map((raw, i) => ({ raw, cam: kit.camera(hass, raw, i) }))
      .filter((x) => x.cam.camera)
      .map(({ raw, cam }) => {
        // The card's own rule (a camera as its own privacy control is hidden while off)
        var hidden = kit.hidden ? kit.hidden(hass, cam) : (cam.privacy && st(cam.privacy) === 'on') || (cam.power && st(cam.power) === 'off');
        var up = !['unavailable', 'unknown', undefined].includes(st(cam.camera));
        var motion = showMotion && !hidden && up && cam.motion.some((id) => st(id) === 'on');
        return { raw, cam, hidden: !!hidden, up, motion };
      });
  }

  // The top bar: the card's picture in the panel's state, the title with its status pill, how many cameras are
  // live and hidden, and the HD / SD switch of the wall (drawn again only when one of them changed)
  _renderTop() {
    var bar = this.shadowRoot?.querySelector?.('.toolbar');
    if (!bar) return;
    var esc = hcpEsc;
    var kit = window.HomeCameraKit;
    var cams = this._camStates() || [];
    var visible = cams.filter((c) => !c.hidden);
    var state = !cams.length ? 'offline' : !visible.length ? 'privacy' : !visible.some((c) => c.up) ? 'offline' : visible.some((c) => c.motion) ? 'motion' : 'live';
    var night = kit ? kit.isNight(this._hass, this._data?.card || {}) : !!this._hass?.themes?.darkMode;
    var hd = this._card?._hd ? this._card._hd() : true;
    var hidden = cams.length - visible.length;
    var sub = cams.length ? this._t(visible.length === 1 ? 'live_one' : 'live_many', { n: visible.length }) : '';
    if (hidden) sub += ` · ${this._t(hidden === 1 ? 'hidden_one' : 'hidden_many', { n: hidden })}`;
    var sig = JSON.stringify([this._lang(), !!kit, state, night, hd, sub, !!this._card]);
    if (sig === this._topSig) return;
    this._topSig = sig;
    bar.classList.toggle('night', night);
    var scene = bar.querySelector('.tbscene');
    // The picture's colours and animations come with the card (its banner styles, added once)
    if (kit && !this.shadowRoot.getElementById('hc-kit')) {
      var css = document.createElement('style');
      css.id = 'hc-kit';
      css.textContent = kit.bannerStyle;
      this.shadowRoot.appendChild(css);
    }
    if (kit && scene) scene.innerHTML = kit.sceneSvg(state, 'panel');
    var icon = bar.querySelector('.bicon');
    if (icon) icon.className = `bicon ${state}`;
    var pill = bar.querySelector('.tpill');
    var label = this._t(`st_${state}`);
    if (pill) pill.innerHTML = cams.length ? `<span class="stpill ${state}" role="status"><span class="sdot"></span>${esc(label)}</span>` : '';
    var line = bar.querySelector('.bsub');
    if (line) line.textContent = sub;
    var q = bar.querySelector('.tq');
    if (q) {
      var opt = (key, on) => `<button role="radio" aria-checked="${on}" data-quality="${key}">${esc(this._t(key))}</button>`;
      q.innerHTML = this._card && visible.length ? `<span class="qseg" role="radiogroup" title="${esc(this._t('quality_hint'))}">${opt('hd', hd)}${opt('sd', !hd)}</span>` : '';
      for (var b of q.querySelectorAll('[data-quality]')) {
        b.addEventListener('click', (ev) => {
          if ((ev.currentTarget.dataset.quality === 'hd') === this._card?._hd?.()) return;
          this._card?._toggleQuality?.();
          this._topSig = null;
          setTimeout(() => this._renderTop(), 50);
        });
      }
    }
  }

  // The motion count of the Cameras tab, drawn again only when it changed
  _renderTabCount(cams) {
    var tab = this.shadowRoot?.getElementById?.('tabbtn-cameras');
    var n = (cams || []).filter((c) => c.motion).length;
    if (tab) {
      var label = `${hcpEsc(this._t('cameras'))}${n ? `<span class="cnt">${n}</span>` : ''}`;
      if (tab.innerHTML !== label) tab.innerHTML = label;
    }
  }

  _tabHtml(tab) {
    var selected = tab === this._tab;
    return `<button class="tab${selected ? ' active' : ''}" role="tab" id="tabbtn-${tab}" data-tab="${tab}" aria-selected="${selected}" aria-controls="tab-${tab}" tabindex="${selected ? 0 : -1}">${hcpEsc(this._t(tab))}</button>`;
  }

  // ── Cameras tab ────────────────────────────────────────────────────────────
  _renderCameras() {
    var tabSection = this.shadowRoot.getElementById?.('tab-cameras');
    if (!tabSection) return;
    var toolbarTitle = this.shadowRoot.querySelector('.toolbar .grow');
    if (toolbarTitle && this._data?.sidebar_title) toolbarTitle.textContent = this._data.sidebar_title;
    // The video wall, on its own under the tabs
    if (!tabSection.querySelector('#wall')) tabSection.innerHTML = '<div id="wall"></div>';
    var section = tabSection.querySelector('#wall');
    var cams = this._camStates();
    this._renderTop();
    var note = (html, error) => {
      this._card = null;
      this._shownCard = null;
      this._renderTabCount(null);
      section.innerHTML = `<ha-card><div class="note${error ? ' error' : ''}">${html}</div></ha-card>`;
    };
    if (this._loadError && !this._data) {
      note(`<span>${hcpEsc(this._t('load_error', { e: this._loadError }))}</span><button class="act quiet" data-retry>${hcpEsc(this._t('retry'))}</button>`, true);
      section.querySelector('[data-retry]').addEventListener('click', () => {
        this._loadError = null;
        this._subscribe();
      });
      return;
    }
    if (this._cardError) {
      note(`<span>${hcpEsc(this._t('card_error'))}</span>`, true);
      return;
    }
    if (!this._data || !customElements.get(HCP_WALL)) {
      if (!section.querySelector('ha-circular-progress')) {
        section.innerHTML = '<div class="note"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>';
      }
      this._card = null;
      this._shownCard = null;
      return;
    }
    var card = this._data.card || {};
    if (!(card.cameras || []).length) {
      if (this._admin()) {
        note(`<span>${hcpEsc(this._t('empty_admin'))}</span><button class="act" data-choose><ha-icon icon="mdi:cctv"></ha-icon>${hcpEsc(this._t('choose'))}</button>`);
        section.querySelector('[data-choose]').addEventListener('click', () => this._goTab('settings'));
      } else note(`<span>${hcpEsc(this._t('empty_user'))}</span>`);
      return;
    }
    this._renderTabCount(cams);
    // The card's own header is left out (its title, status and HD / SD are in the top bar), its privacy badges stay
    card = Object.assign({}, card, { show_header: false });
    // Drawn again only when the configuration changed: a new card would reconnect every stream
    var json = JSON.stringify(card);
    if (this._card && json === this._shownCard) return;
    if (!this._card) {
      section.replaceChildren();
      this._card = document.createElement(HCP_WALL);
    }
    try {
      // The wall element draws the grid alone (no card, no header); the configuration keeps its own layout for dashboards
      this._card.setConfig(card);
    } catch (err) {
      note(`<span>${hcpEsc(String(err?.message || err))}</span>`, true);
      return;
    }
    this._shownCard = json;
    this._card.hass = this._hass;
    if (!this._card.isConnected) section.appendChild(this._card);
    this._topSig = null;
    this._renderTop();
  }

  // ── Settings tab (administrators) ──────────────────────────────────────────
  _formValues() {
    if (!this._draft && this._data) {
      this._draft = {
        card: JSON.parse(JSON.stringify(this._data.card || {})),
        title: this._data.title || '',
        hide: this._data.hide_toolbar || 'never',
      };
    }
    return this._draft;
  }

  async _renderSettings() {
    var section = this.shadowRoot.getElementById?.('tab-settings');
    if (!section || !this._admin() || this._tab !== 'settings' || !this._data) return;
    var values = this._formValues();
    var esc = hcpEsc;
    if (!section.querySelector('.settings-form')) {
      section.innerHTML = `
        <ha-card class="top settings-form"><div class="banner" data-banner></div></ha-card>
        <ha-card class="list">
          <div class="lhead"><h2 class="lname">${esc(this._t('panel_heading'))}</h2></div>
          <label class="ctl"><span>${esc(this._t('sidebar_title'))}</span>
            <div class="box"><input data-title maxlength="50" autocomplete="off"></div>
            <small data-title-helper></small></label>
          <div class="ctl"><span id="hcp-hide">${esc(this._t('toolbar'))}</span>
            <div class="seg" role="radiogroup" aria-labelledby="hcp-hide" data-hide-group>${HCP_HIDE.map(
              (h) => `<button role="radio" data-hide="${h}" aria-checked="false">${esc(this._t(`toolbar_${h}`))}</button>`,
            ).join('')}</div>
            <small>${esc(this._t('toolbar_helper'))}</small></div>
        </ha-card>
        <ha-card class="list" data-found hidden></ha-card>
        <ha-card class="list">
          <div class="lhead"><h2 class="lname" data-shown-head></h2>
            <button class="act quiet" data-import><ha-icon icon="mdi:content-copy"></ha-icon>${esc(this._t('import'))}</button></div>
          <div class="rows" data-shown></div>
        </ha-card>
        <ha-card class="list">
          <div class="lhead"><h2 class="lname">${esc(this._t('display_heading'))}</h2></div>
          <div data-editor></div>
        </ha-card>
        <ha-card class="bar savebar">
          <button class="act" data-save><ha-icon icon="mdi:content-save"></ha-icon>${esc(this._t('save'))}</button>
          <button class="act quiet" data-revert>${esc(this._t('revert'))}</button>
          <span class="grow msg" data-msg aria-live="polite"></span>
        </ha-card>`;
      var field = section.querySelector('[data-title]');
      field.addEventListener('input', () => {
        this._formValues().title = field.value;
        this._status = null;
        this._renderStatus();
      });
      section.querySelector('[data-hide-group]').addEventListener('click', (ev) => {
        var button = ev.composedPath().find((n) => n.dataset?.hide);
        if (!button) return;
        this._formValues().hide = button.dataset.hide;
        this._status = null;
        this._renderHide();
        this._renderStatus();
      });
      section.querySelector('[data-save]').addEventListener('click', () => this._save());
      section.querySelector('[data-revert]').addEventListener('click', () => {
        this._draft = null;
        this._status = null;
        this._editing = null;
        this._renderSettings();
      });
      section.querySelector('[data-import]').addEventListener('click', () => this._import());
      section.querySelector('[data-found]').addEventListener('click', (ev) => {
        var button = ev.composedPath().find((n) => n.dataset?.add !== undefined);
        if (button) this._addFound(button.dataset.add ? [button.dataset.add] : null);
      });
      this._listenShown(section.querySelector('[data-shown]'));
      this._discover();
    }
    var input = section.querySelector('[data-title]');
    if (input.value !== values.title && this.shadowRoot.activeElement !== input) input.value = values.title;
    section.querySelector('[data-title-helper]').textContent = this._t('sidebar_title_helper', { d: this._defaultTitle() });
    this._renderHide();
    this._renderFound();
    this._renderShown();
    await this._renderEditor(section.querySelector('[data-editor]'), values.card);
    this._renderStatus();
  }

  _renderHide() {
    var hide = this._formValues()?.hide || 'never';
    for (var b of this.shadowRoot.getElementById?.('tab-settings')?.querySelectorAll('[data-hide]') || []) {
      var on = b.dataset.hide === hide;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    }
  }

  // The header card of Settings: its banner (a camera on a desk, cogs turning, a plant), the title, a pill saying
  // whether the changes are saved, and how many cameras are shown and found. Drawn again only when it changed.
  _renderBanner() {
    var host = this.shadowRoot.getElementById?.('tab-settings')?.querySelector('[data-banner]');
    if (!host || !this._data) return;
    var esc = hcpEsc;
    var dirty = this._dirty();
    var night = !!this._hass?.themes?.darkMode;
    var shown = (this._formValues()?.card?.cameras || []).length;
    var sub = `${this._t('cameras_heading')}: ${shown}`;
    if (this._found) sub += ` · ${this._t('found_heading')}: ${this._newFound().length}`;
    var sig = JSON.stringify([this._lang(), dirty, night, sub]);
    if (sig === this._bannerSig && host.firstChild) return;
    this._bannerSig = sig;
    // The picture is the panel's top bar: this header keeps the icon, the title, its pill and the counts
    host.className = 'thead';
    host.innerHTML = `
        <span class="bicon${dirty ? ' warn' : ''}"><ha-icon icon="mdi:cog"></ha-icon></span>
        <div class="btitles">
          <div class="brow"><span class="bname">${esc(this._t('settings'))}</span>
            <span class="stpill${dirty ? ' warn' : ''}" role="status"><span class="sdot"></span>${esc(this._t(dirty ? 'unsaved' : 'up_to_date'))}</span></div>
          <div class="bsub">${esc(sub)}</div>
        </div>`;
  }

  // ── The cameras shown, listed by the panel: drag (or arrow keys on the handle) to reorder, the pencil opens the
  // camera's fields under its row (the card editor's own, one camera at a time) ──
  _cams() {
    return this._formValues()?.card?.cameras || [];
  }

  _camEntry(cam) {
    return typeof cam === 'string' ? { camera: cam } : Object.assign({}, cam);
  }

  _rowInner(cam, i) {
    var esc = hcpEsc;
    var c = this._camEntry(cam);
    var st = this._hass?.states?.[c.camera];
    var name = c.name || st?.attributes?.friendly_name || c.camera || '';
    var off = !st || st.state === 'unavailable';
    var tags = [];
    if (c.motion) tags.push(`<span class="tag good">${esc(this._t('tag_motion'))}</span>`);
    if (c.ptz) tags.push('<span class="tag">PTZ</span>');
    if (c.privacy || c.power) tags.push(`<span class="tag">${esc(this._t('tag_privacy'))}</span>`);
    var open = this._editing === i;
    return `<button class="drag" draggable="true" data-move="${i}" aria-label="${esc(this._t('move', { c: name }))}" title="${esc(this._t('move', { c: name }))}"><ha-icon icon="mdi:drag-vertical"></ha-icon></button>
      <span class="ic ${off ? 'bad' : 'good'}"><ha-icon icon="${off ? 'mdi:cctv-off' : 'mdi:cctv'}"></ha-icon></span>
      <div class="who"><div class="n">${esc(name)}</div><div class="s">${esc([c.camera, c.sd ? `SD ${c.sd}` : ''].filter(Boolean).join(' · '))}</div></div>
      ${tags.length ? `<span class="tags">${tags.join('')}</span>` : ''}
      <button class="round" data-edit="${i}" aria-expanded="${open}" aria-label="${esc(this._t('edit', { c: name }))}" title="${esc(this._t('edit', { c: name }))}"><ha-icon icon="mdi:pencil"></ha-icon></button>`;
  }

  _renderShown() {
    var section = this.shadowRoot.getElementById?.('tab-settings');
    var host = section?.querySelector('[data-shown]');
    if (!host) return;
    var cams = this._cams();
    section.querySelector('[data-shown-head]').textContent = `${this._t('cameras_heading')} · ${cams.length}`;
    if (this._editing != null && !cams[this._editing]) this._editing = null;
    if (!cams.length) {
      host.innerHTML = `<div class="msg">${hcpEsc(this._t('none_shown'))}</div>`;
      return;
    }
    host.innerHTML = cams
      .map(
        (cam, i) =>
          `<div class="item${this._editing === i ? ' open' : ''}" data-row="${i}">${this._rowInner(cam, i)}</div>` +
          (this._editing === i
            ? `<div class="editbox"><div data-cam-editor></div><div class="bar"><button class="act quiet danger" data-remove="${i}"><ha-icon icon="mdi:delete-outline"></ha-icon>${hcpEsc(this._t('remove'))}</button></div></div>`
            : ''),
      )
      .join('');
    if (this._editing != null) this._renderCamEditor(host.querySelector('[data-cam-editor]'), this._editing);
  }

  async _renderCamEditor(host, i) {
    await this._ensureForm();
    if (!host?.isConnected || !customElements.get('home-camera-card-editor')) return;
    if (!this._camEditor) {
      this._camEditor = document.createElement('home-camera-card-editor');
      this._camEditor.section = 'camera';
      this._camEditor.addEventListener('config-changed', (ev) => {
        ev.stopPropagation();
        var at = this._editing;
        if (at == null) return;
        var v = ev.detail.config || {};
        this._camEditorConfig = JSON.stringify(v);
        var values = this._formValues();
        var list = this._cams().slice();
        list[at] = Object.keys(v).length === 1 && v.camera ? v.camera : v;
        values.card = Object.assign({}, values.card, { cameras: list });
        this._status = null;
        // Only the row's text: the fields under it keep the typing and the focus
        var row = this.shadowRoot.getElementById('tab-settings')?.querySelector(`[data-row="${at}"]`);
        if (row) row.innerHTML = this._rowInner(list[at], at);
        this._renderStatus();
      });
      this._camEditorConfig = null;
    }
    this._camEditor.hass = this._hass;
    host.replaceChildren(this._camEditor);
    var cam = this._camEntry(this._cams()[i]);
    var json = JSON.stringify([i, cam]);
    if (json !== this._camEditorGiven || this._camEditorConfig !== JSON.stringify(cam)) {
      this._camEditorGiven = json;
      this._camEditorConfig = JSON.stringify(cam);
      this._camEditor.setConfig(cam);
    }
  }

  _moveCam(from, to) {
    var list = this._cams().slice();
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return false;
    list.splice(to, 0, list.splice(from, 1)[0]);
    var values = this._formValues();
    values.card = Object.assign({}, values.card, { cameras: list });
    this._editing = null;
    this._status = null;
    this._renderShown();
    this._renderStatus();
    return true;
  }

  _listenShown(host) {
    host.addEventListener('click', (ev) => {
      var path = ev.composedPath();
      var edit = path.find((n) => n.dataset?.edit !== undefined);
      if (edit) {
        var i = Number(edit.dataset.edit);
        this._editing = this._editing === i ? null : i;
        this._renderShown();
        this.shadowRoot.getElementById('tab-settings')?.querySelector(`[data-edit="${i}"]`)?.focus({ preventScroll: true });
        return;
      }
      var remove = path.find((n) => n.dataset?.remove !== undefined);
      if (remove) {
        var values = this._formValues();
        var list = this._cams().slice();
        list.splice(Number(remove.dataset.remove), 1);
        values.card = Object.assign({}, values.card, { cameras: list });
        this._editing = null;
        this._status = null;
        this._renderSettings();
      }
    });
    // Arrow keys on a handle move its camera up or down, the focus following it
    host.addEventListener('keydown', (ev) => {
      var handle = ev.composedPath().find((n) => n.dataset?.move !== undefined);
      var step = ev.key === 'ArrowUp' ? -1 : ev.key === 'ArrowDown' ? 1 : 0;
      if (!handle || !step) return;
      ev.preventDefault();
      var from = Number(handle.dataset.move);
      if (this._moveCam(from, from + step)) host.querySelector(`[data-move="${from + step}"]`)?.focus({ preventScroll: true });
    });
    var rowOf = (ev) => ev.composedPath().find((n) => n.dataset?.row !== undefined);
    host.addEventListener('dragstart', (ev) => {
      var handle = ev.composedPath().find((n) => n.dataset?.move !== undefined);
      if (!handle) return;
      this._dragFrom = Number(handle.dataset.move);
      ev.dataTransfer?.setData('text/plain', String(this._dragFrom));
      if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
    });
    host.addEventListener('dragover', (ev) => {
      var row = rowOf(ev);
      if (!row || this._dragFrom == null) return;
      ev.preventDefault();
      for (var n of host.querySelectorAll('.over')) if (n !== row) n.classList.remove('over');
      row.classList.add('over');
    });
    host.addEventListener('drop', (ev) => {
      var row = rowOf(ev);
      if (!row || this._dragFrom == null) return;
      ev.preventDefault();
      var from = this._dragFrom;
      this._dragFrom = null;
      this._moveCam(from, Number(row.dataset.row));
    });
    host.addEventListener('dragend', () => {
      this._dragFrom = null;
      for (var n of host.querySelectorAll('.over')) n.classList.remove('over');
    });
  }

  // ── Camera discovery (home_camera/discover): the cameras of Home Assistant the panel does not show yet ──
  async _discover() {
    try {
      // Frigate: which of a Frigate camera and its native camera is listed, as the edited options say
      var duplicates = this._formValues()?.card?.frigate?.duplicates || 'frigate';
      this._foundDuplicates = duplicates;
      this._found = (await this._hass.callWS({ type: 'home_camera/discover', duplicates: duplicates })).cameras || [];
    } catch (err) {
      console.warn('Home Camera panel: camera discovery failed', err);
      this._found = [];
    }
    this._renderFound();
  }

  // Found cameras missing from the edited list: neither the camera nor its SD stream is in it
  _newFound() {
    var listed = new Set();
    for (var cam of this._formValues()?.card?.cameras || []) {
      var id = typeof cam === 'string' ? cam : cam?.camera;
      if (id) listed.add(id);
      if (cam?.sd) listed.add(cam.sd);
    }
    return (this._found || []).filter((cam) => !listed.has(cam.camera) && !(cam.sd && listed.has(cam.sd)));
  }

  _renderFound() {
    var host = this.shadowRoot.getElementById?.('tab-settings')?.querySelector('[data-found]');
    if (!host || !this._found) return;
    var esc = hcpEsc;
    var found = this._newFound();
    host.hidden = false;
    var rows = found
      .map(
        (cam) => `<div class="item found">
          <span class="ic info"><ha-icon icon="mdi:cctv"></ha-icon></span>
          <div class="who"><div class="n">${esc(cam.name)}</div><div class="s">${esc([cam.area, cam.camera, cam.sd ? 'HD + SD' : ''].filter(Boolean).join(' · '))}</div></div>
          <button class="act quiet" data-add="${esc(cam.camera)}"><ha-icon icon="mdi:plus"></ha-icon>${esc(this._t('add'))}</button>
        </div>`,
      )
      .join('');
    host.innerHTML = `<div class="lhead"><h2 class="lname">${esc(this._t('found_heading'))}${found.length ? ` · ${found.length}` : ''}</h2>${
      found.length > 1 ? `<button class="act" data-add=""><ha-icon icon="mdi:plus-box-multiple"></ha-icon>${esc(this._t('add_all'))}</button>` : ''
    }</div>
      <div class="msg">${esc(this._t(found.length ? 'found_hint' : 'found_none'))}</div>
      <div class="rows">${rows}</div>`;
    this._renderBanner();
  }

  // Adds the given found cameras (all the new ones when `ids` is null) to the edited list, named after their device,
  // with their controls
  _addFound(ids) {
    var add = this._newFound().filter((cam) => !ids || ids.includes(cam.camera));
    if (!add.length) return;
    var values = this._formValues();
    values.card = Object.assign({}, values.card, {
      cameras: (values.card.cameras || []).concat(add.map(hcpFoundEntry)),
    });
    this._status = { tone: 'good', text: this._t('added', { n: add.length }) };
    this._renderSettings();
  }

  // The title the server gives the panel when none is set ("Cameras" in the server's language)
  _defaultTitle() {
    return this._data?.default_title || this._t('cameras');
  }

  // The card's own visual editor (cameras, HD / SD, columns…), built on Home Assistant's ha-form
  async _renderEditor(host, card) {
    if (!host) return;
    await this._ensureForm();
    if (!customElements.get('home-camera-card-editor')) return;
    if (!this._editor?.isConnected) {
      this._editor = document.createElement('home-camera-card-editor');
      // Always the wall here: no layout choice; the cameras are the panel's own list
      this._editor.panel = true;
      this._editor.section = 'options';
      this._editor.addEventListener('config-changed', (ev) => {
        ev.stopPropagation();
        var values = this._formValues();
        var options = hcpCardConfig(ev.detail.config);
        delete options.cameras;
        var cams = values.card?.cameras;
        values.card = Object.assign(cams ? { cameras: cams } : {}, options);
        this._editorConfig = JSON.stringify(options);
        // Another Frigate duplicates choice: the cameras found are asked again
        if (this._found && (options.frigate?.duplicates || 'frigate') !== this._foundDuplicates) this._discover();
        this._status = null;
        this._renderStatus();
      });
      host.replaceChildren(this._editor);
      this._editorConfig = null;
    }
    this._editor.hass = this._hass;
    // Given again only when it changed from outside (saved elsewhere, reverted, copied): never under the typing
    var options = hcpCardConfig(card || {});
    delete options.cameras;
    var json = JSON.stringify(options);
    if (json !== this._editorConfig) {
      this._editorConfig = json;
      // As the wall: the editor offers no column count by default and keeps any count chosen
      this._editor.setConfig(Object.assign({ type: `custom:${HCP_CARD}` }, options, { layout: 'wall' }));
    }
  }

  // ha-form is loaded with the dashboard editor, not on a custom panel: a card editor of Home Assistant brings it
  async _ensureForm() {
    if (customElements.get('ha-form')) return;
    try {
      var helpers = await window.loadCardHelpers?.();
      var card = await helpers?.createCardElement({ type: 'entities', entities: [] });
      await card?.constructor?.getConfigElement?.();
      await Promise.race([customElements.whenDefined('ha-form'), new Promise((r) => setTimeout(r, 3000))]);
    } catch (err) {
      console.warn('Home Camera panel: could not load the form elements', err);
    }
  }

  _renderStatus() {
    var section = this.shadowRoot.getElementById?.('tab-settings');
    var msg = section?.querySelector('[data-msg]');
    if (!msg) return;
    var dirty = this._dirty();
    var status = this._status || (dirty ? { tone: '', text: this._t('unsaved') } : null);
    msg.className = `grow msg${status?.tone ? ` ${status.tone}` : ''}`;
    this._renderBanner();
    msg.textContent = status?.text || '';
    section.querySelector('[data-save]').disabled = !dirty || this._saving;
    section.querySelector('[data-revert]').disabled = !dirty || this._saving;
  }

  async _save() {
    var values = this._formValues();
    this._saving = true;
    this._renderStatus();
    try {
      var data = await this._hass.callWS({
        type: 'home_camera/update_settings',
        card: values.card,
        title: values.title.trim(),
        hide_toolbar: values.hide,
      });
      this._draft = null;
      this._status = { tone: 'good', text: this._t('saved') };
      this._onSettings(data);
    } catch (err) {
      this._status = { tone: 'bad', text: this._t('save_error', { e: String(err?.message || err) }) };
    }
    this._saving = false;
    this._renderStatus();
  }

  // The first camera card found on the dashboards (the default one first), as a starting point
  async _import() {
    var found = null;
    try {
      var dashboards = await this._hass.callWS({ type: 'lovelace/dashboards/list' });
      var targets = [{ url_path: null, title: 'Overview' }].concat(
        (dashboards || []).filter((d) => d.mode !== 'yaml' || d.url_path).map((d) => ({ url_path: d.url_path, title: d.title || d.url_path })),
      );
      for (var target of targets) {
        var config = await this._hass.callWS({ type: 'lovelace/config', url_path: target.url_path }).catch(() => null);
        var card = hcpFindCard(config);
        if (card) {
          found = { card: hcpCardConfig(card), title: target.title };
          break;
        }
      }
    } catch (err) {
      console.warn('Home Camera panel: could not read the dashboards', err);
    }
    if (!found) {
      this._status = { tone: 'bad', text: this._t('import_none') };
      this._renderStatus();
      return;
    }
    this._formValues().card = found.card;
    this._status = { tone: 'good', text: this._t('imported', { d: found.title }) };
    this._renderSettings();
  }
}

if (!customElements.get('home-camera-panel')) {
  customElements.define('home-camera-panel', HomeCameraPanel);
}
