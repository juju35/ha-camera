/**
 * Compact card: the header with its status, and a snapshot of each camera (no stream). Its detail button
 * (top right, `zoom: false` removes it) or a tap on a snapshot switches it to the full card and back; a
 * click outside the card brings the compact view back.
 */
import { hcEsc } from "./i18n-helpers.js";
import { HomeCameraCard } from "./card.js";
import { hcInDialog } from "./mini-helpers.js";

export class HomeCameraMiniCard extends HomeCameraCard {
  constructor() {
    super();
    this._zoomed = false;
    this._onOutside = (ev) => {
      if (this._zoomed && !ev.composedPath().includes(this) && !hcInDialog(ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement('home-camera-mini-card-editor');
  }

  setConfig(config) {
    // The host attribute behind the mini card's styles (its size container); never set in the constructor.
    this.setAttribute?.('mini', '');
    super.setConfig(config);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onOutside, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutside, true);
    // Left the page (another view, a conditional card hidden): back to the compact view.
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6, rows: 'auto' };
  }

  _compact() {
    return !this._zoomed;
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._update();
    this._syncLive();
  }

  _zoomButton() {
    if (this._config?.zoom === false) return '';
    const label = this._t(this._zoomed ? 'zoom_out' : 'zoom_in');
    return (
      `<span class="zoom" data-action="zoom" role="button" tabindex="0" title="${hcEsc(label)}" aria-label="${hcEsc(label)}">` +
      `<ha-icon icon="${this._zoomed ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'}"></ha-icon></span>`
    );
  }

  _onClick(ev) {
    const target = ev.composedPath().find((n) => n.dataset?.action === 'zoom');
    if (!target) {
      super._onClick(ev);
      return;
    }
    ev.stopPropagation?.();
    // Without the detail button, a snapshot opens its camera's dialog instead of the full card.
    if (this._config.zoom === false) {
      if (target.dataset.entity) this._moreInfo(target.dataset.entity);
      return;
    }
    this._setZoom(!this._zoomed);
    // Keyboard use (Enter / Space: no click count) keeps the focus on the button, without scrolling the page.
    if (!ev.detail) this.shadowRoot.querySelector('.zoom')?.focus({ preventScroll: true });
  }
}

// The Cameras panel's video wall: the card's camera grid drawn bare, in a plain element (no <ha-card>, no header).
// An element of the panel's own, like hc-camera-stream: not a dashboard card (not listed in the card picker).
