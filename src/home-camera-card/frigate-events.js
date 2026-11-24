// ── Frigate events ───────────────────────────────────────────────────────────
// The Frigate integration's own WebSocket command (frigate/events/get) gives a camera's tracked objects; their
// thumbnail and clip come through its proxy (/api/frigate/<instance>/thumbnail/<id>, …/notifications/<id>/clip.mp4),
// on paths signed by Home Assistant (an <img> or a <video> carries no token).
import { hcT } from "./i18n-helpers.js";

export const HC_EVENTS_MS = 30000; // events asked again at most this often, and soon after a motion ends
export const HC_EVENTS_LIMIT = 50; // events a card asks for: its count reads "50+" beyond
export const HC_LABEL_GROUPS = {
  person: 'person',
  face: 'person',
  cat: 'animal',
  dog: 'animal',
  bird: 'animal',
  horse: 'animal',
  sheep: 'animal',
  cow: 'animal',
  bear: 'animal',
  deer: 'animal',
  car: 'vehicle',
  truck: 'vehicle',
  bus: 'vehicle',
  motorcycle: 'vehicle',
  bicycle: 'vehicle',
  boat: 'vehicle',
  license_plate: 'vehicle',
};
export const HC_LABEL_ICONS = {
  person: 'mdi:walk',
  face: 'mdi:face-recognition',
  cat: 'mdi:cat',
  dog: 'mdi:dog',
  bird: 'mdi:bird',
  horse: 'mdi:horse',
  car: 'mdi:car',
  truck: 'mdi:truck',
  bus: 'mdi:bus',
  motorcycle: 'mdi:motorbike',
  bicycle: 'mdi:bicycle',
  boat: 'mdi:sail-boat',
  package: 'mdi:package-variant-closed',
};
export const HC_EVENT_GROUPS = ['person', 'animal', 'vehicle', 'other'];
export const hcLabelGroup = (label) => HC_LABEL_GROUPS[label] || 'other';
export const hcLabelIcon = (label) => HC_LABEL_ICONS[label] || 'mdi:shape-outline';
export function hcLabelName(lang, label) {
  const key = `obj_${label}`;
  const txt = hcT(lang, key);
  if (txt !== key) return txt;
  const s = String(label || '').replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// The events of Frigate cameras ({ name, instance }) since `after` (epoch seconds), newest first, one request per
// Frigate instance. A failed instance gives none (the integration missing, an old version).
export async function hcFetchEvents(hass, cams, { after, before, limit = 50, labels } = {}) {
  const byInstance = new Map();
  for (const cam of cams) {
    if (!byInstance.has(cam.instance)) byInstance.set(cam.instance, new Set());
    byInstance.get(cam.instance).add(cam.name);
  }
  const lists = await Promise.all(
    [...byInstance].map(async ([instance, names]) => {
      const msg = { type: 'frigate/events/get', instance_id: instance || 'frigate', cameras: [...names], limit };
      if (after) msg.after = Math.floor(after);
      if (before) msg.before = Math.floor(before);
      if (labels?.length) msg.labels = labels;
      try {
        let res = await hass.callWS(msg);
        if (typeof res === 'string') res = JSON.parse(res);
        return (Array.isArray(res) ? res : []).map((ev) => Object.assign({}, ev, { instance }));
      } catch (_e) {
        return [];
      }
    }),
  );
  return lists.flat().sort((a, b) => (b.start_time || 0) - (a.start_time || 0));
}

// Signed paths, kept until shortly before they expire (an hour), so a redraw never signs again.
export const hcSignedCache = new Map();
export async function hcSigned(hass, path) {
  const hit = hcSignedCache.get(path);
  if (hit && hit.until > Date.now()) return hit.url;
  const { path: signed } = await hass.callWS({ type: 'auth/sign_path', path, expires: 3600 });
  const url = hass.hassUrl ? hass.hassUrl(signed) : signed;
  // A long session asks for many thumbnails: the expired paths go first, then the oldest
  if (hcSignedCache.size >= 500) {
    const now = Date.now();
    for (const [k, v] of hcSignedCache) if (v.until <= now) hcSignedCache.delete(k);
    while (hcSignedCache.size >= 500) hcSignedCache.delete(hcSignedCache.keys().next().value);
  }
  hcSignedCache.set(path, { url, until: Date.now() + 50 * 60000 });
  return url;
}
// Thumbnails ([data-thumb] elements) signed and loaded only once they come near the screen: a long day of events
// asks for the few shown, not for hundreds.
export const hcThumbIo = new WeakMap(); // root → { io, hass }
export function hcLazyThumbs(hass, root) {
  const els = root.querySelectorAll('[data-thumb]');
  let entry = hcThumbIo.get(root);
  const load = (el) => {
    hcSigned(entry?.hass || hass, el.dataset.thumb)
      .then((url) => {
        el.style.backgroundImage = `url("${url}")`;
      })
      .catch(() => {});
  };
  if (typeof IntersectionObserver !== 'function') {
    els.forEach(load);
    return;
  }
  if (!entry) {
    entry = { hass, io: null };
    entry.io = new IntersectionObserver(
      (seen) => {
        for (const s of seen) {
          if (!s.isIntersecting) continue;
          entry.io.unobserve(s.target);
          load(s.target);
        }
      },
      { rootMargin: '300px' },
    );
    hcThumbIo.set(root, entry);
  }
  entry.hass = hass;
  // The rows drawn before are gone: only the new ones are watched
  entry.io.disconnect();
  for (const el of els) entry.io.observe(el);
}
export const hcFrigateBase = (instance) => `/api/frigate/${instance ? `${encodeURIComponent(instance)}/` : ''}`;
export const hcThumbPath = (ev) => `${hcFrigateBase(ev.instance)}thumbnail/${encodeURIComponent(ev.id)}`;
export const hcClipPath = (ev) => `${hcFrigateBase(ev.instance)}notifications/${encodeURIComponent(ev.id)}/clip.mp4`;

export const hcStartOfDay = (offset = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.getTime() / 1000;
};

// "4 min ago" within the hour, the time today, else the weekday and time.
export function hcWhen(lang, epoch) {
  const ms = epoch * 1000;
  const ago = Date.now() - ms;
  try {
    if (ago >= 0 && ago < 3600000) {
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: 'short' });
      return rtf.format(-Math.max(0, Math.round(ago / 60000)), 'minute');
    }
    const opts = ms >= hcStartOfDay() * 1000 ? { hour: '2-digit', minute: '2-digit' } : { weekday: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(ms).toLocaleString(lang, opts);
  } catch (_e) {
    return new Date(ms).toLocaleTimeString();
  }
}
export function hcTime(lang, epoch) {
  try {
    return new Date(epoch * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  } catch (_e) {
    return new Date(epoch * 1000).toLocaleTimeString();
  }
}
// "18 s", "1 min 12 s"; an event still going on: "in progress".
export function hcDuration(lang, ev) {
  if (!ev.end_time) return hcT(lang, 'ev_live');
  const s = Math.max(0, Math.round(ev.end_time - ev.start_time));
  const unit = (n, u) => {
    try {
      return new Intl.NumberFormat(lang, { style: 'unit', unit: u, unitDisplay: 'short' }).format(n);
    } catch (_e) {
      return `${n} ${u === 'minute' ? 'min' : 's'}`;
    }
  };
  if (s < 60) return unit(s, 'second');
  return s % 60 ? `${unit(Math.floor(s / 60), 'minute')} ${unit(s % 60, 'second')}` : unit(s / 60, 'minute');
}
export function hcScore(lang, ev) {
  const v = ev.data?.top_score ?? ev.top_score ?? ev.data?.score ?? ev.score;
  if (typeof v !== 'number') return '';
  try {
    return new Intl.NumberFormat(lang, { style: 'percent' }).format(v);
  } catch (_e) {
    return `${Math.round(v * 100)} %`;
  }
}

// HD / SD choice of the cards without quality_entity, shared by every card of the browser.
export const HC_QUALITY_KEY = 'home-camera-card-quality';
export const HC_QUALITY_EVENT = 'home-camera-card-quality';
