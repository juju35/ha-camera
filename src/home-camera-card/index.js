// Entry point: the modules in their original order. scripts/build-frontend.mjs (scripts/bundle.mjs) concatenates them
// in this order into the single classic script the integration serves.
import "./card-picker.js";
import "./version.js";
import "./i18n/hci18n.js";
import "./i18n-helpers.js";
import "./entity-discovery.js";
import "./frigate.js";
import "./frigate-events.js";
import "./illustrated-header.js";
import "./card.js";
import "./editor.js";
import "./mini-helpers.js";
import "./mini-card.js";
import "./frigate-timeline.js";
