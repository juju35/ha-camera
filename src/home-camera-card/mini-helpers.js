// ── home-camera-mini-card ────────────────────────────────────────────────────
// A click in a dialog opened from the card (a camera's more-info) does not fold it back.
export const hcInDialog = (ev) => ev.composedPath().some((n) => ['ha-more-info-dialog', 'ha-dialog', 'dialog'].includes(n.localName));
