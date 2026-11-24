# ha-camera

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HACS Validation](https://github.com/juju35/ha-camera/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-camera/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-camera/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-camera/actions/workflows/validate.yml)
[![Lint](https://github.com/juju35/ha-camera/actions/workflows/lint.yml/badge.svg)](https://github.com/juju35/ha-camera/actions/workflows/lint.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-camera)](https://github.com/juju35/ha-camera/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/juju35/ha-camera/blob/main/LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/julienstep9)

<p align="center"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/custom_components/home_camera/brand/icon.png" alt="Home Camera" width="120"></p>

<p align="center">
  <a href="https://www.tapo.com/"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/tapo.png" alt="Tapo" height="48"></a>
  &nbsp;&nbsp;
  <a href="https://frigate.video/"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/frigate.png" alt="Frigate" height="48"></a>
  &nbsp;&nbsp;
  <a href="https://reolink.com/"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/reolink.png" alt="Reolink" height="48"></a>
  &nbsp;&nbsp;
  <a href="https://ui.com/camera-security"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/unifiprotect.png" alt="UniFi Protect" height="48"></a>
  &nbsp;&nbsp;
  <a href="https://www.onvif.org/"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/onvif.png" alt="ONVIF" height="48"></a>
  &nbsp;&nbsp;
  <a href="https://www.ezviz.com/"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/ezviz.png" alt="EZVIZ" height="48"></a>
  &nbsp;&nbsp;
  <a href="https://www.arlo.com/"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/arlo.png" alt="Arlo" height="48"></a>
  &nbsp;&nbsp;
  <a href="https://www.netatmo.com/"><img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/netatmo.png" alt="Netatmo" height="48"></a>
</p>

Home Assistant integration with a **Cameras sidebar panel for every user** — not only administrators — and the Lovelace cards behind it: **every home camera in one grid**, with a **privacy badge per camera**, an **HD / SD switch** and **PTZ controls**.

List the cameras, the cards find their privacy switch, SD stream and PTZ buttons by themselves — Tapo, Frigate, Reolink, UniFi Protect, ONVIF, EZVIZ, Arlo, Netatmo and any other `camera` entity.

> **Upgrading from ha-home-camera-card 3.x** (a Marketplace *Dashboard* repository): the repository is now an *Integration*. Remove the old Dashboard entry from the Marketplace, add this repository as an **Integration**, then add **Home Camera** in **Settings → Devices & services**. Your dashboards keep working: the cards keep their names (`custom:home-camera-card`, `custom:home-camera-mini-card`) and the integration replaces the old dashboard resource with its own. While the old Dashboard entry is still installed, its updates fail with *"The installed content has no home_camera.zip"* and Home Camera shows a repair in **Settings → Repairs**.

[![Open your Home Assistant instance and open a repository inside the Marketplace.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-camera&category=integration)

| **Cameras panel** | **Cameras panel, dark** |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel.png" alt="Cameras sidebar panel with the camera grid full page" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel-dark.png" alt="Cameras sidebar panel with the camera grid full page, dark theme" width="400"> |
| **Panel settings** | **Panel settings, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel-settings.png" alt="Settings tab of the Cameras panel: header card, cameras found, cameras shown" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel-settings-dark.png" alt="Settings tab of the Cameras panel, dark theme" width="400"> |
| **Panel events (Frigate)** | **Panel events, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel-events.png" alt="Events tab of the Cameras panel: the day's Frigate events as a timeline by hour, filters by camera and object, the player of the selected event" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel-events-dark.png" alt="Events tab of the Cameras panel: the day's Frigate events as a timeline by hour, filters by camera and object, the player of the selected event, dark theme" width="400"> |
| **Panel events on a phone** | **Panel events on a phone, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel-events-mobile.png" alt="Events tab of the Cameras panel on a phone: the player on top of the timeline" width="260"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/panel-events-mobile-dark.png" alt="Events tab of the Cameras panel on a phone: the player on top of the timeline, dark theme" width="260"> |
| **Light** | **Dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card.png" alt="Camera card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-dark.png" alt="Camera card, dark theme" width="400"> |
| **Pan & tilt** | **Pan & tilt, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-ptz.png" alt="Camera card with the pan and tilt arrows" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-ptz-dark.png" alt="Camera card with the pan and tilt arrows, dark theme" width="400"> |
| **Single camera** | **Single camera, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-single.png" alt="Camera card with a single camera" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-single-dark.png" alt="Camera card with a single camera, dark theme" width="400"> |
| **Every camera hidden** | **Every camera hidden, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-hidden-light.png" alt="Camera card with every camera hidden" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-hidden.png" alt="Camera card with every camera hidden, dark theme" width="400"> |
| **Mini card** | **Mini card, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-mini.png" alt="Camera mini card with a snapshot per camera" width="300"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-mini-dark.png" alt="Camera mini card with a snapshot per camera, dark theme" width="300"> |
| **Fullscreen, pan & tilt** | **Fullscreen, pan & tilt, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-fullscreen-light.png" alt="Fullscreen camera with the round pan and tilt pad" width="700"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-fullscreen.png" alt="Fullscreen camera with the round pan and tilt pad, dark theme" width="700"> |
| **Frigate cameras** | **Frigate cameras, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-frigate.png" alt="Camera card with Frigate cameras: detection and recording buttons, Open in Frigate, today's events folded under the grid" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-frigate-dark.png" alt="Camera card with Frigate cameras: detection and recording buttons, Open in Frigate, today's events folded under the grid, dark theme" width="400"> |
| **Frigate events** | **Frigate events, dark** |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-frigate-events.png" alt="Camera card with the Frigate events unfolded: object, camera, time, duration and score, filtered by object" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/card-frigate-events-dark.png" alt="Camera card with the Frigate events unfolded: object, camera, time, duration and score, filtered by object, dark theme" width="400"> |

## Features

### Cameras panel

- **Cameras** in the sidebar for **every user** — family members without administrator rights included: the card's **illustrated header** is the panel's **top bar**, across the page (as on the ENT ONE panel): the camera drawn in the panel's state, the title with its status pill (live, motion detected, private, unavailable), the cameras live and hidden, and **HD / SD** and the integration (administrators) as round buttons. The tabs sit under it, Cameras with the number of cameras in motion. Then a **filter** by state (**All**, **Motion**, **Private** — a chip only for a state some camera is in) and four **tiles** (motion, live, privacy, offline; Motion and Privacy filter too), the privacy badges as pills (amber for a camera in motion), then a **video wall** edge to edge — as many columns as the screen takes, a camera in motion outlined in amber — and everything the card does (live streams, privacy badges, HD / SD, PTZ, fullscreen)
- **Settings** tab, for administrators only: a header card (saved or not, the picture being in the top bar), the sidebar title (left empty: *Cameras* in the server's language), the **top bar** (shown, hidden for non-admins, or hidden for everyone: the title bar goes, the tabs and the menu button stay), the **cameras shown** as a list — drag a camera's handle (or use the arrow keys on it) to reorder, the pencil opens its fields — and the card's display options
- **Camera discovery**: a new entry starts with every camera of Home Assistant, and Settings lists the ones not shown yet, to **Add** one by one or **Add all**, each with the privacy switch, pan and tilt buttons and motion sensors found on its device; the streams of one camera count as one camera, whose SD stream the HD / SD switch picks — a Tapo camera's `*_hd_stream` / `*_sd_stream`, Reolink's Clear / Balanced / Fluent, UniFi Protect's High / Medium / Low, ONVIF's profiles (mainstream / substream) — and Reolink's snapshot cameras are left out
- **Frigate**: a Frigate camera is paired with its native camera (Tapo…) — the only one of its area, else the one of its area with the same name — and takes its privacy switch and PTZ buttons; **Frigate and native camera** in the card's options says which of the two the discovery lists (the Frigate camera, the native camera, or both)
- **Events** tab (when the panel shows Frigate cameras, for every user): the day's Frigate events as a timeline grouped by hour — previous / next day, a filter by camera and by object (person, animal, vehicle) — and a player for the selected event: its clip, its camera live, a download link; side by side on a wide screen, the player on top on a phone. The tab shows today's count. Only the clip chosen is ever downloaded (the newest one, selected on opening, waits for its play button), thumbnails load as they scroll into view, and the clip pauses and the live stream closes when another tab is shown
- **Copy from a dashboard**: takes the first camera card found on your dashboards, to move a cameras dashboard to the panel in one click
- Saved settings reach every open panel at once, on every device; the tab is in the address (`/cameras/settings`)

### Cards

- Header with the number of cameras live and hidden, and an **HD / SD** switch
- **Illustrated header** (90 px, full and mini card): a camera on a wall over a parquet strip, drawn in the cards' state — *live* (red recording light, field of view), *motion detected* (someone framed in the field of view, amber), *privacy* (lens shut) or *offline* (greyed camera, no signal); the header icon's colour follows the same state; night picture with a dark theme, day picture with a light theme; animations stop with *reduce motion*; `illustration: false` brings the classic header back
- One badge per camera: a red live dot while it films, a green lock while it is hidden; tap to toggle its privacy switch (or its smart plug); greyed out, and ignoring taps, while that switch is unavailable (camera offline)
- Each image carries its name with a live dot; when every camera is hidden, a panel says how to bring one back
- **Motion badge**: a pulsing amber sensor icon on the image's name (and on the mini card's snapshot) while a motion, occupancy or person sensor of the camera's device is on
- A single camera: its name is the title, a round *Disable* / *Enable* icon button sits on the right and the HD / SD badge under the title
- Hidden cameras are removed from the grid: a camera is hidden when its **privacy switch is on** or its **power switch is off**
- **HD / SD** switch: from an `input_select` shared by every dashboard, or from the card itself (remembered by the browser); with [Tapo Cameras](https://github.com/juju35/ha-tapo), it sets each camera's own **Stream quality** select, and the player picks the new stream up
- Live grid with low latency: a camera that offers WebRTC (go2rtc) plays it alone, one RTSP session per camera; Home Assistant's own player (HLS or MJPEG) for the others — no other card to install
- **Tap a camera to put it fullscreen**, with a round pan & tilt pad at the bottom right; tap again or press Escape to come back (on iPhone, the card covers the screen itself)
- *Details* button on every tile for Home Assistant's camera dialog; **sound** button on streams that carry sound, for one camera at a time (the grid starts muted)
- **PTZ**: a button on the tile shows a round pad of four arrows in the corner of the image, light enough to see through; hold an arrow to keep moving, or use the arrow keys; arrows whose button is unavailable are greyed out. Step buttons (Tapo `move_*`, EZVIZ) repeat while held; continuous ones move from the press until the release: Reolink's `ptz_*` buttons and their `ptz_stop`, Frigate's `frigate.ptz` (`ptz: frigate`); ONVIF's `onvif.ptz` (`ptz: onvif`) sends short moves repeated while the arrow is held, so a lost release never leaves the camera turning
- **Preset positions**: with the arrows, a list of the camera's saved positions (Reolink's `select.*_ptz_preset`, or the `preset` option)
- **Privacy without a switch**: a camera that can be turned off (Arlo, Netatmo) is its own privacy control — its badge turns it off and on, and it is hidden while off
- Spinner until each camera's first frame; privacy badges spin until their switch answers
- Mouse: tile buttons show on hover; touch: always shown, with larger targets
- Hiding or showing a camera, or switching HD / SD, never reloads the streams of the other cameras
- Streams stop while the page is hidden (other tab, phone locked) or the card is scrolled off screen, and resume when it comes back
- **Mini card** (`home-camera-mini-card`): a snapshot of each camera with its name and status, refreshed every 10 seconds instead of a live stream; its detail button (top right) or a tap on a snapshot shows the full card, a click outside folds it back
- **[Frigate](https://docs.frigate.video/integrations/home-assistant/)** cameras: their privacy switch and PTZ buttons come from their native camera (`controls_from`, found by itself in the same area); SD plays Frigate's go2rtc sub-stream (`{camera}_sub`) through the Frigate integration's proxy, on a path signed by Home Assistant, falling back to Home Assistant's player when it brings no picture; `player: frigate` plays every stream that way; `ptz: frigate` moves an ONVIF camera with `frigate.ptz`, from the press to the release; an **Open in Frigate** button on the tile opens `frigate.url`, or the sidebar panel of a Frigate app (Frigate, Frigate Proxy)
- **Frigate events** under the grid (both cards): folded into one row — today's count, the last event, its thumbnails — or unfolded into the list of the latest events (object, camera, time, duration, score) with a filter by object; a tap on an event plays its clip in its camera's tile (the live stream stops meanwhile, one clip at a time), **Live** goes back; the mini card's row opens the full card with the list. Asked again every 30 seconds and when a motion ends, never while the card is off screen; thumbnails load only once on screen
- **Frigate switches** on the tiles: detection and recording, lit or dimmed by their state, a tap toggles them
- Automatic discovery on the camera's device: `switch.*_privacy` (or `*_privacy_mode`), `button.*_move_*` or `button.*_ptz_*` (with `ptz_stop`), `select.*_ptz_preset`, the motion, occupancy and person `binary_sensor`s, and the SD stream: the `*_sd_stream` camera next to a `*_hd_stream` one, the lightest stream camera of the device (Fluent, Low, substream…) or a `select.*_stream_quality` (see [Supported integrations](#supported-integrations))
- Visual editor in the dashboard UI (no YAML needed)
- English, French, German, Spanish, Serbian (Cyrillic and Latin), Italian, Dutch, European Portuguese, Polish, Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek, follows the Home Assistant language
- Light and dark theme compatible
- Served by the integration and added to the dashboard resources by itself (loaded on every page when the resources are in YAML mode); each language other than English is a small file fetched when needed

## Supported integrations

Any `camera` entity works. These integrations also bring their controls without any configuration:

| Integration | Camera entities | Privacy | HD / SD | PTZ | Motion |
|---|---|---|---|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/tapo.png" alt="" width="20" height="20"> [Tapo Cameras](https://github.com/juju35/ha-tapo) (`tapo_cameras`) | one per camera | `privacy_mode` switch | `stream_quality` select (`hd` / `sd`) of each camera | `move_*` buttons | detection `binary_sensor`s |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/tapo.png" alt="" width="20" height="20"> Tapo: Cameras Control (`tapo_control`) | `*_hd_stream` and `*_sd_stream` | `switch.*_privacy` | the `*_sd_stream` camera | `button.*_move_*` | detection `binary_sensor`s |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/reolink.png" alt="" width="20" height="20"> [Reolink](https://www.home-assistant.io/integrations/reolink/) (`reolink`) | Fluent, Balanced, Clear (snapshot cameras left out) | `privacy_mode` switch | the lightest stream of the device (Fluent) | `ptz_*` buttons, continuous until `ptz_stop`; `ptz_preset` select | motion, person, vehicle… `binary_sensor`s |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/unifiprotect.png" alt="" width="20" height="20"> [UniFi Protect](https://www.home-assistant.io/integrations/unifiprotect/) (`unifiprotect`) | High, Medium, Low resolution channels | `privacy_mode` switch | the lightest channel of the device | — | motion and smart detection `binary_sensor`s |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/onvif.png" alt="" width="20" height="20"> [ONVIF](https://www.home-assistant.io/integrations/onvif/) (`onvif`) | a profile per stream (mainstream, substream…) | — | the lightest profile of the device | `ptz: onvif` (`onvif.ptz`, short moves while held) | ONVIF event `binary_sensor`s |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/ezviz.png" alt="" width="20" height="20"> [EZVIZ](https://www.home-assistant.io/integrations/ezviz/) (`ezviz`) | one per camera | `privacy` switch | — | `ptz_*` buttons, when the integration gives them | motion `binary_sensor` |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/arlo.png" alt="" width="20" height="20"> [Arlo](https://github.com/twrecked/hass-aarlo) (`aarlo`) | one per camera | the camera itself (turned off) | — | — | motion `binary_sensor` |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/netatmo.png" alt="" width="20" height="20"> [Netatmo](https://www.home-assistant.io/integrations/netatmo/) (`netatmo`) | one per camera | the camera itself (monitoring off) | — | — | — |
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/images/frigate.png" alt="" width="20" height="20"> [Frigate](https://github.com/blakeblackshear/frigate-hass-integration) (`frigate`) | one per camera (Birdseye left out) | its native camera's (`controls_from`) | Frigate's go2rtc sub-stream (`frigate.sd_stream`) | its native camera's buttons, or `ptz: frigate` (`frigate.ptz`, ONVIF) | Frigate's motion and occupancy `binary_sensor`s |

With Frigate, the integration must reach Frigate itself, not the Frigate Proxy app; the proxy's sidebar panel is only where **Open in Frigate** goes. Frigate's sub-stream must exist in its go2rtc configuration (`living_room_sub` for the `living_room` camera, or set `frigate.sd_stream`).

Streams that are disabled in Home Assistant (Reolink's Clear and Balanced, UniFi Protect's Medium and Low, by default) are not used: enable the one you want as the SD (or HD) stream in the device's entities. Cameras of one device that the entity ids do not tell apart as streams of one camera (an NVR's channels, whose names differ beyond their stream words) stay separate cameras.

Tapo Cameras names its entities in your language (`button.living_room_left`, `button.salon_gauche`…): the card finds them by their translation key on the camera's device, whatever their entity ids. With Tapo Cameras, the HD / SD switch changes the stream of the camera itself, so every viewer gets the new quality; with a shared `quality_entity`, the switch sets it too.

## Prerequisites

- Home Assistant 2024.12 or later with `camera` entities (on older Home Assistant versions, the **Cameras** list of the visual editor falls back to a YAML editor — the card itself works the same)
- Optional: an `input_select` with the options `HD` and `SD` to share the quality between dashboards and devices

## Installation

### Via the Marketplace (recommended)

Click the button below to add the repository directly:

[![Add to the Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-camera&category=integration)

Or manually:

1. Open **Settings → Marketplace → Add from link** (top right; this needs a GitHub account connected)
2. Add `https://github.com/juju35/ha-camera` — Type: **Integration**
3. Open **Home Camera** and click **Install**, then restart Home Assistant
4. **Settings → Devices & services → Add integration → Home Camera**

[![Add the integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=home_camera)

### Manual

1. Download `home_camera.zip` from the [latest release](https://github.com/juju35/ha-camera/releases/latest)
2. Unzip it into `/config/custom_components/home_camera/`
3. Restart Home Assistant and add **Home Camera** in **Settings → Devices & services**

The integration adds the **Cameras** panel to the sidebar and the cards to the dashboard resources: nothing to add by hand.

## Configuration

### Cameras panel

Open **Cameras** in the sidebar, then its **Settings** tab (administrators): the panel already shows every camera found when the integration was added; **Cameras found** lists the ones added to Home Assistant since (**Add**, **Add all**), **Cameras shown** lists them — drag to reorder, the pencil edits one — or **Copy from a dashboard**, then **Save**. The panel takes the same options as the card below; every user then sees the cameras in the panel.

### Visual editor

Add the card from the dashboard (**Add card → Home Camera Card**) and add the cameras in the **Cameras** list. Options left at their default are not written to the YAML.

### Minimal

```yaml
type: custom:home-camera-card
cameras:
  - camera.living_room_hd_stream
  - camera.bedroom_hd_stream
```

With a Tapo integration ([Supported integrations](#supported-integrations)), each camera brings its HD / SD streams, its privacy switch and its PTZ buttons on its own.

### Full options

```yaml
type: custom:home-camera-card
title: Cameras
icon: mdi:cctv
quality_entity: input_select.camera_quality
hd_option: HD
sd_option: SD
columns: 2
aspect_ratio: "16:9"
cameras:
  - camera: camera.living_room_hd_stream
    name: Living room
    short_name: Living
  - camera: camera.bedroom_parents_hd_stream
    name: Parents' bedroom
    short_name: Parents
    sd: camera.bedroom_parents_sd_stream
    privacy: switch.bedroom_parents_privacy
    ptz: button.bedroom_parents_move
    motion: binary_sensor.bedroom_parents_motion
  - camera: camera.terrace
    name: Terrace
    power: switch.terrace_camera_plug
    ptz: false
  - camera: camera.garden # Frigate
    controls_from: camera.garden_tapo
    ptz: frigate
    player: frigate
frigate:
  player: auto
  sd_stream: "{camera}_sub"
  instance: frigate
  url: https://frigate.example.com
  open_in_frigate: true
  badges: true
  events: true
  events_expanded: false
  events_limit: 5
  events_labels: [person, cat, dog]
```

### Mini card

```yaml
type: custom:home-camera-mini-card
cameras:
  - camera.living_room_hd_stream
  - camera.bedroom_hd_stream
```

The mini card takes the same options as the full card except `layout`, plus `zoom`. Its compact view shows the title with its status and a snapshot of each camera (the SD stream's when there is one; a hidden camera's snapshot is never fetched), refreshed every 10 seconds while the card is on screen in a visible page. The detail button at the top right, or a tap on a snapshot, switches it to the full card (live streams, privacy badges, HD / SD); a click outside the card brings the compact view back.

### Options reference

| Option | Required | Default | Description |
|---|---|---|---|
| `cameras` | ✅ | — | List of cameras, see below; a bare entity id is a camera with every option found automatically |
| `title` | ❌ | `Cameras` | Card title; with a single camera, its name |
| `show_title` | ❌ | `true` | Show the title in the header (e.g. `false` under a section heading of your own) |
| `icon` | ❌ | `mdi:cctv` | Icon next to the title |
| `quality_entity` | ❌ | — | `input_select` (or `select`) holding the quality; without it the card keeps its own choice in the browser |
| `hd_option` | ❌ | `HD` | Option of `quality_entity` meaning HD |
| `sd_option` | ❌ | `SD` | Option of `quality_entity` meaning SD |
| `layout` | ❌ | — | Full card only (also in its visual editor; the mini card ignores it). `wall`: the video wall of the Cameras panel — the header as a card of its own above the grid, no card around the grid, a camera in motion outlined in amber, as many columns as fit (unless `columns` is set) |
| `columns` | ❌ | `2` | Columns of the grid |
| `aspect_ratio` | ❌ | `16:9` | Shape of the tiles (`16:9`, `4:3`, `1:1`…); the image fills the tile |
| `show_summary` | ❌ | `true` | Summary line under the title |
| `show_badges` | ❌ | `true` | Privacy badges under the header |
| `show_header` | ❌ | `true` | Full card, YAML only: `false` leaves out the header (title, status, HD / SD, summary) and keeps the privacy badges — what the Cameras panel uses, its top bar carrying the rest |
| `show_motion` | ❌ | `true` | Motion badge on the images while a camera's motion sensor is on |
| `illustration` | ❌ | `true` | Both cards: the illustrated header (a camera on a wall drawn in the cards' state); `false` for the classic header |
| `illustration_theme` | ❌ | `auto` | Both cards: `auto` (follows the Home Assistant theme: night with a dark theme, day with a light theme), `day` or `night` |
| `zoom` | ❌ | `true` | Mini card only: its detail button to the full card; with `false`, a tap on a snapshot opens the camera's dialog |
| `frigate` | ❌ | — | Frigate cameras, see below |
| `language` | ❌ | Auto | Force language: `en`, `fr`, `de`, `es`, `sr`, `sr-Latn`, `it`, `nl`, `pt`, `pl`, `ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv` or `el` (auto-detects from HA settings) |

**Camera options**

| Option | Description |
|---|---|
| `camera` | Camera entity, shown in HD |
| `name` | Name on the grid; defaults to the entity name |
| `short_name` | Name on the privacy badge; defaults to `name` |
| `sd` | Camera entity shown in SD; defaults to the `*_sd_stream` next to a `*_hd_stream` camera, else the lightest stream camera of the same device (Fluent, Low, substream…), else the HD one |
| `privacy` | Switch hiding the camera when **on**, or a camera entity (the camera itself) hiding it when **off**; defaults to the `switch.*_privacy` / `*_privacy_mode` of the camera's device, else the camera itself when it can be turned off (Arlo, Netatmo), `false` for none |
| `power` | Switch (smart plug) hiding the camera when **off** |
| `ptz` | PTZ buttons: a prefix (`button.x_move` → `button.x_move_left`, `_right`, `_up`, `_down`), an object `{left, right, up, down, stop}` (with `stop`, a move lasts from the press to the release), `onvif` (`onvif.ptz`), `frigate` (a Frigate camera moved by `frigate.ptz`, ONVIF), or `false`; defaults to the `button.*_move_*`, else `button.*_ptz_*` (and `ptz_stop`), of the camera's device (`auto`) |
| `preset` | `select` of the camera's saved positions, shown with the arrows; defaults to the `select.*_ptz_preset` of the camera's device, `false` for none |
| `controls_from` | Camera whose device carries the privacy switch, PTZ buttons (and motion sensors, when the camera has none); a Frigate camera defaults to its native camera (the only one of its area, else the one of its area with its name), `false` for none |
| `player` | Frigate camera: `auto`, `frigate` or `home_assistant`; defaults to `frigate.player` |
| `motion` | Motion sensor(s) behind the camera's motion badge: an entity id, a list, or `false` for none; defaults to the `binary_sensor`s of the camera's device whose device class is `motion`, `occupancy` or `presence`, or whose id contains `motion`, `occupancy` or `person` |

**Frigate options** (`frigate:`, in the visual editor's *Frigate* section)

| Option | Default | Description |
|---|---|---|
| `player` | `auto` | `auto`: Home Assistant's player (the Frigate integration already plays from Frigate's go2rtc), Frigate's sub-stream in SD; `frigate`: always Frigate's go2rtc through the integration's proxy (`/api/frigate/…/webrtc`); `home_assistant`: never |
| `sd_stream` | `{camera}_sub` | Frigate go2rtc stream played in SD, `{camera}` being the Frigate camera name |
| `instance` | — | Client id of the Frigate instance, with several Frigate servers; defaults to the camera's own |
| `url` | — | Address opened by **Open in Frigate**; defaults to the sidebar panel of a Frigate app (Frigate, Frigate Proxy) |
| `open_in_frigate` | `true` | **Open in Frigate** button on the tiles of Frigate cameras |
| `badges` | `true` | Frigate's detection and recording switches (`switch.*_detect`, `switch.*_recordings`) on the tiles |
| `events` | `true` | Today's events of the Frigate cameras under the grid, and the panel's **Events** tab |
| `events_expanded` | `false` | The events listed at once instead of folded into a row (full card) |
| `events_limit` | `5` | Events listed when unfolded |
| `events_labels` | — | YAML only: objects kept (`[person, car]`), for the card and the panel |
| `duplicates` | `frigate` | Cameras panel only: which of a Frigate camera and its native camera the discovery lists — `frigate`, `native` or `both` |

## Screenshots

The card animates in three places (all honour `prefers-reduced-motion`): the two below, and the motion badge, which pulses while a camera detects motion. While a camera is live, the red live dot breathes on the stream; it settles to a still card when the stream stops.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/live.gif" alt="live" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/live-dark.gif" alt="live dark" width="400"> |

While a tile is waiting for its first frame, a spinner turns over the stream.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/loading.gif" alt="loading" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-camera/main/screenshots/loading-dark.gif" alt="loading dark" width="400"> |

The still states (the grid; pan & tilt; a single camera; every camera hidden; the mini card; fullscreen), each in light and dark, are shown at the [top of this page](#ha-camera).

## Known limitations

- **Privacy without a switch**: a camera that can be turned off and has no privacy switch (Arlo, Netatmo…) becomes its own privacy control, so a card that already shows such a camera gets a privacy badge for it; `privacy: false` on the camera removes it.
- **HD / SD pairing** of a device's stream cameras relies on their entity ids (`*_clear` / `*_fluent`, `*_high_…` / `*_low_…`, ONVIF profiles): renamed entities are not paired any more — set `sd` on the camera. Streams disabled in Home Assistant are not used.
- **Frigate events**: today follows the browser's time zone, not Home Assistant's; a card asks for 50 events and its count reads "50+" beyond; an event still in progress has no clip yet (Frigate writes it at the end). Events come from Frigate only: Reolink and UniFi Protect recordings stay in Home Assistant's media browser.
- **Frigate** needs the integration pointed at Frigate itself (not the Frigate Proxy app) and, for SD, the sub-stream in Frigate's go2rtc configuration. Frigate's PTZ presets are not listed.
- **ONVIF PTZ** (`ptz: onvif`) sends short moves repeated while the arrow is held, so the camera moves in small steps on slow connections.
- **Refresh**: events are asked again with Home Assistant's updates (at most every 30 seconds), so a very quiet instance can wait a little longer for new ones.

## How it works

The card draws its own header, badges and tiles. A camera that offers WebRTC (go2rtc) plays it with Home Assistant's `ha-web-rtc-player` alone: Home Assistant's `ha-camera-stream` starts HLS and WebRTC side by side, two RTSP sessions per camera, which cameras that allow few of them (Tapo…) answer by dropping one, and the image lags. The other cameras, the ones without a live stream and a WebRTC session that brings no video use `ha-camera-stream`, the player of the built-in camera cards and dialog (HLS or MJPEG). go2rtc and the camera's own settings apply as everywhere else in Home Assistant. Tiles are kept between updates and only added or removed when a camera is shown or hidden, so the other streams keep playing. When the quality is SD, every camera that has an SD stream uses it.

Discovery looks at the entities of the camera's device in the entity registry, by translation key or by the end of their entity id: privacy switches, PTZ buttons and preset selects, motion sensors, and the stream cameras of the same device, ranked by the words of their entity ids (`clear` / `high` / `main` above `balanced` / `medium` above `fluent` / `low` / `sub`, ONVIF profiles by number). Anything set in the configuration wins over what is found.

## Development

```bash
npm install
npm run build        # assembles the card and the panel from src/, copies them into dist/ and splits the card's translations, as the release does
npm run check        # builds and checks the card and the panel (run in CI)
npm test             # unit tests (assembles the card and the panel first)
npm run test:browser # runs the built card and panel in Chromium with stand-ins for Home Assistant (run in CI)
npm run screenshots  # renders the card and the panel with mock cameras into screenshots/ (and the live/loading gifs, needs ffmpeg)
pip install -r requirements_test.txt && pytest  # the integration's tests
```

The sources of the card and the panel are ES modules under `src/home-camera-card/` and `src/home-camera-panel/` (entry `index.js`, translations one file per language in `i18n/`); `scripts/build-frontend.mjs` (run by `npm run build`) assembles each into the classic script `custom_components/home_camera/frontend/<stem>.js`. The modules share one scope, so top-level names stay unique across them, and a new module must be listed in its `index.js`. Neither the assembled files nor `dist/` are committed.

### Releasing

1. Bump the version in `manifest.json`, `const.py`, the card (`HOME_CAMERA_CARD_VERSION` in `src/home-camera-card/version.js`), the panel (`HOME_CAMERA_PANEL_VERSION` in `src/home-camera-panel/version.js`) and `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](https://github.com/juju35/ha-camera/blob/main/CHANGELOG.md)
3. Push to `main`: the **Release** workflow splits the card's translations, builds `home_camera.zip`, creates the tag and the GitHub release with the changelog section as notes

## Translations

The cards and the panel auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |
| Српски | `sr` |
| Srpski (latinica) | `sr-Latn` |
| Italiano | `it` |
| Nederlands | `nl` |
| Português (Portugal) | `pt` |
| Polski | `pl` |
| Română | `ro` |
| Dansk | `da` |
| Svenska | `sv` |
| Български | `bg` |
| Русский | `ru` |
| Українська | `uk` |
| Magyar | `hu` |
| Slovenčina | `sk` |
| Čeština | `cs` |
| Slovenščina | `sl` |
| Latviešu | `lv` |
| Ελληνικά | `el` |

Contributions for additional languages are welcome!

## License

[MIT](https://github.com/juju35/ha-camera/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
