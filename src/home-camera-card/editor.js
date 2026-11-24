// ── home-camera-card-editor (visual editor, built on HA's ha-form) ───────────
import { HC_DEFAULTS, hcLang, hcT } from "./i18n-helpers.js";
import { HC_DUPLICATES, HC_FRIGATE_DEFAULTS, HC_PLAYERS, hcFrigateConf } from "./frigate.js";

export const HC_CAMERA_FIELDS = ['name', 'short_name', 'camera', 'sd', 'privacy', 'power', 'ptz', 'preset', 'motion', 'controls_from', 'player'];

export class HomeCameraCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }

  set hass(hass) {
    const prevLang = this._hass?.language;
    this._hass = hass;
    if (this._form && prevLang === hass?.language) this._form.hass = hass;
    else this._render();
  }

  _lang() {
    return hcLang(this._config?.language || this._hass?.language || document.documentElement.lang || 'en');
  }

  _wall() {
    return this._config?.layout === 'wall' && !this.constructor.mini;
  }

  _schema() {
    const t = (k) => hcT(this._lang(), k);
    const camera = { entity: { domain: 'camera' } };
    const players = HC_PLAYERS.map((v) => ({ value: v, label: t(`ed_player_${v}`) }));
    const sw = { entity: { domain: ['switch', 'input_boolean'] } };
    const privacySel = { entity: { domain: ['switch', 'input_boolean', 'camera'] } };
    const fields = {
      name: { selector: { text: {} } },
      short_name: { selector: { text: {} } },
      camera: { selector: camera, required: true },
      sd: { selector: camera },
      privacy: { selector: privacySel },
      power: { selector: sw },
      ptz: { selector: { text: {} } },
      motion: { selector: { entity: { domain: 'binary_sensor' } } },
      preset: { selector: { entity: { domain: 'select' } } },
      controls_from: { selector: camera },
      player: { selector: { select: { mode: 'dropdown', options: players } } },
    };
    for (const k of HC_CAMERA_FIELDS) fields[k].label = t(`cf_${k}`);
    // section 'camera' (the Cameras panel's Settings): one camera's fields, two by two
    if (this.section === 'camera') {
      const pairs = [];
      for (let i = 0; i < HC_CAMERA_FIELDS.length; i += 2) {
        pairs.push({
          type: 'grid',
          name: '',
          schema: HC_CAMERA_FIELDS.slice(i, i + 2).map((k) => ({ name: k, selector: fields[k].selector, required: fields[k].required })),
        });
      }
      return pairs;
    }
    return [
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'title', selector: { text: {} } },
          { name: 'icon', selector: { icon: {} } },
        ],
      },
      // Full card only (the mini card ignores it): the video wall of the Cameras panel, which always shows it
      // (its Settings tab sets `panel`).
      ...(this.constructor.mini || this.panel
        ? []
        : [
            {
              name: 'layout',
              selector: {
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: '', label: t('ed_layout_card') },
                    { value: 'wall', label: t('ed_layout_wall') },
                  ],
                },
              },
            },
          ]),
      { name: 'quality_entity', selector: { entity: { domain: ['input_select', 'select'] } } },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'hd_option', selector: { text: {} } },
          { name: 'sd_option', selector: { text: {} } },
        ],
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'columns', selector: { number: { min: 1, max: 4, step: 1, mode: 'box' } } },
          { name: 'aspect_ratio', selector: { text: {} } },
        ],
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'show_title', selector: { boolean: {} } },
          { name: 'show_summary', selector: { boolean: {} } },
          { name: 'show_badges', selector: { boolean: {} } },
          { name: 'show_motion', selector: { boolean: {} } },
        ],
      },
      // The illustrated header (on the video wall too, as its header card).
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'illustration', selector: { boolean: {} } },
          {
            name: 'illustration_theme',
            selector: {
              select: {
                mode: 'dropdown',
                options: ['auto', 'day', 'night'].map((v) => ({ value: v, label: t(`ed_theme_${v}`) })),
              },
            },
          },
        ],
      },
      // Frigate cameras: the player, the SD sub-stream, the instance and the "Open in Frigate" button; on the panel,
      // which of a Frigate camera and its native camera its discovery lists.
      {
        type: 'expandable',
        name: 'frigate',
        icon: 'mdi:cctv',
        schema: [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'player', selector: { select: { mode: 'dropdown', options: players } } },
              { name: 'sd_stream', selector: { text: {} } },
              { name: 'instance', selector: { text: {} } },
              { name: 'url', selector: { text: {} } },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'open_in_frigate', selector: { boolean: {} } },
              { name: 'badges', selector: { boolean: {} } },
              { name: 'events', selector: { boolean: {} } },
              { name: 'events_expanded', selector: { boolean: {} } },
            ],
          },
          { name: 'events_limit', selector: { number: { min: 1, max: 20, step: 1, mode: 'box' } } },
          ...(this.section === 'options'
            ? [
                {
                  name: 'duplicates',
                  selector: {
                    select: {
                      mode: 'dropdown',
                      options: HC_DUPLICATES.map((v) => ({ value: v, label: t(`ed_duplicates_${v}`) })),
                    },
                  },
                },
              ]
            : []),
        ],
      },
      // Mini card: its detail button (on unless `zoom: false`).
      ...(this.constructor.mini ? [{ name: 'zoom', selector: { boolean: {} } }] : []),
      {
        name: 'language',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' },
              { value: 'de', label: 'Deutsch' },
              { value: 'es', label: 'Español' },
              { value: 'sr', label: 'Српски' },
              { value: 'sr-Latn', label: 'Srpski (latinica)' },
              { value: 'it', label: 'Italiano' },
              { value: 'nl', label: 'Nederlands' },
              { value: 'pt', label: 'Português (Portugal)' },
              { value: 'pl', label: 'Polski' },
              { value: 'ro', label: 'Română' },
              { value: 'da', label: 'Dansk' },
              { value: 'sv', label: 'Svenska' },
              { value: 'bg', label: 'Български' },
              { value: 'ru', label: 'Русский' },
              { value: 'uk', label: 'Українська' },
              { value: 'hu', label: 'Magyar' },
              { value: 'sk', label: 'Slovenčina' },
              { value: 'cs', label: 'Čeština' },
              { value: 'sl', label: 'Slovenščina' },
              { value: 'lv', label: 'Latviešu' },
              { value: 'el', label: 'Ελληνικά' },
            ],
          },
        },
      },
      // section 'options' (the Cameras panel's Settings): the cameras are listed by the panel itself
      ...(this.section === 'options'
        ? []
        : [{ name: 'cameras', selector: { object: { multiple: true, label_field: 'name', fields: fields } } }]),
    ];
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.addEventListener('value-changed', (ev) => this._valueChanged(ev));
      this.appendChild(this._form);
    }
    const lang = this._lang();
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    if (this.section === 'camera') {
      this._form.computeLabel = (s) => hcT(lang, `cf_${s.name}`);
      this._form.computeHelper = () => undefined;
      this._form.data = Object.assign({}, this._config);
      return;
    }
    this._form.computeLabel = (s) => hcT(lang, `ed_${s.name}`);
    this._form.computeHelper = (s) => {
      const key = s.name === 'columns' && this._wall() ? 'ed_columns_wall_helper' : `ed_${s.name}_helper`;
      const txt = hcT(lang, key);
      return txt === key ? undefined : txt;
    };
    // Video wall (the Cameras panel): no column count by default, the wall fits as many as the width takes
    const defaults = this._wall() ? Object.assign({}, HC_DEFAULTS, { columns: undefined }) : HC_DEFAULTS;
    const data = Object.assign({}, defaults, this.constructor.mini ? { zoom: true } : this.panel ? {} : { layout: '' }, this._config);
    data.frigate = hcFrigateConf(this._config);
    // The object selector edits objects: a camera given as a bare entity id becomes { camera }.
    data.cameras = (data.cameras || []).map((cam) => (typeof cam === 'string' ? { camera: cam } : cam));
    this._form.data = data;
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    let value = Object.assign({}, ev.detail.value);
    const lang = this._lang();
    const clean = (o) => {
      for (const k of Object.keys(o)) if (o[k] === '' || o[k] === null || o[k] === undefined) delete o[k];
      return o;
    };
    // Keep the YAML short: drop options left empty or at their default.
    clean(value);
    // One camera: its fields as they are, without the card's defaults
    if (this.section === 'camera') {
      this._config = value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: value }, bubbles: true, composed: true }));
      return;
    }
    // On the wall, any column count is a choice (the default is none): 2 is kept like the others
    for (const key of Object.keys(HC_DEFAULTS)) {
      if (key === 'columns' && this._wall()) continue;
      if (value[key] === HC_DEFAULTS[key]) delete value[key];
    }
    if (value.zoom === true) delete value.zoom;
    // frigate: only what differs from its defaults, and no key at all when nothing does
    if (value.frigate && typeof value.frigate === 'object') {
      const f = clean(Object.assign({}, value.frigate));
      for (const key of Object.keys(HC_FRIGATE_DEFAULTS)) if (f[key] === HC_FRIGATE_DEFAULTS[key]) delete f[key];
      if (Object.keys(f).length) value.frigate = f;
      else delete value.frigate;
    }
    if (Array.isArray(value.cameras)) {
      value.cameras = value.cameras.map((cam) => {
        const out = clean(Object.assign({}, cam));
        return Object.keys(out).length === 1 && out.camera ? out.camera : out;
      });
      if (!value.cameras.length) delete value.cameras;
    }
    if (this._config.type) value = Object.assign({ type: this._config.type }, value);
    const wall = this._wall();
    this._config = value;
    // A new language relabels the form; the wall changes the columns' default and helper.
    if (lang !== this._lang() || wall !== this._wall()) this._render();
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: value }, bubbles: true, composed: true }));
  }
}

export class HomeCameraMiniCardEditor extends HomeCameraCardEditor {
  static get mini() {
    return true;
  }
}
