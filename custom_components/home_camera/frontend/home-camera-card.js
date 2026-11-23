// ── Card picker: light previews ──────────────────────────────────────────────
// Home Assistant's card picker builds a live preview of every card registered with `preview: true`, all at once and
// with no lazy loading. A preview here is drawn only once it scrolls into view: the picker calls getStubConfig() right
// before it creates the preview, which marks the next instance of that card; once connected under <hui-card-picker>,
// that instance holds Home Assistant's state (no render, no history, no animation) until it is visible. Anywhere else
// (a dashboard, the card editor) the card behaves as before. Editors and other elements are defined unchanged.
function pickerDefine(tag, Card, options) {
  const isCard = !tag.endsWith("-editor") && (typeof Card.getStubConfig === "function" || typeof Card.getConfigElement === "function");
  if (!isCard || typeof IntersectionObserver !== "function") return customElements.define(tag, Card, options);
  let marks = [];
  const lazy = class extends Card {
    static getStubConfig(...args) {
      marks.push(Date.now());
      return Card.getStubConfig ? Card.getStubConfig(...args) : {};
    }

    constructor() {
      super();
      const now = Date.now();
      marks = marks.filter((t) => now - t < 5000);
      if (marks.length) {
        marks.shift();
        this._plHold = true;
      }
    }

    set hass(hass) {
      if (this._plHold) this._plHass = hass;
      else super.hass = hass;
    }

    get hass() {
      return this._plHold ? this._plHass : super.hass;
    }

    connectedCallback() {
      if (!this._plHold) return super.connectedCallback?.();
      if (this.getRootNode()?.host?.localName !== "hui-card-picker") return this._plRelease();
      if (this._plIo) return;
      // A custom element is inline until its styles arrive: a block of a card's height keeps the cells apart, so
      // that only the previews actually on screen intersect.
      this.style.display = "block";
      this.style.minHeight = "120px";
      this._plIo = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && this._plRelease(), {
        rootMargin: "200px",
      });
      this._plIo.observe(this);
    }

    disconnectedCallback() {
      if (this._plHold) return;
      super.disconnectedCallback?.();
    }

    _plRelease() {
      this._plIo?.disconnect();
      this._plIo = null;
      this._plHold = false;
      this.style.display = "";
      this.style.minHeight = "";
      if (this._plHass !== undefined) super.hass = this._plHass;
      this._plHass = undefined;
      if (this.isConnected) super.connectedCallback?.();
    }
  };
  return customElements.define(tag, lazy, options);
}

const HOME_CAMERA_CARD_VERSION = '4.11.0';

// ── i18n ─────────────────────────────────────────────────────────────────────
const HcI18n = {
  fr: {
    title: 'Caméras',
    live_one: '{n} caméra en direct',
    live_many: '{n} caméras en direct',
    hidden_one: '{n} masquée',
    hidden_many: '{n} masquées',
    all_hidden: 'Toutes les caméras sont masquées',
    one_hidden: 'Caméra désactivée',
    no_cameras: 'Aucune caméra configurée',
    hint_all: 'Touchez une pastille pour afficher une caméra',
    live: 'En direct',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Basculer entre HD et SD',
    privacy_on: '{c} : masquée, toucher pour l\'afficher',
    privacy_off: '{c} : visible, toucher pour la masquer',
    privacy_unavailable: '{c} : indisponible',
    enable: 'Activer',
    disable: 'Désactiver',
    unavailable: 'Indisponible',
    ptz: 'Orientation',
    open: 'Afficher {c} en plein écran',
    exit_fullscreen: 'Quitter le plein écran',
    details: 'Détails',
    pending: 'Changement en cours…',
    sound_on: 'Activer le son',
    sound_off: 'Couper le son',
    move_left: 'Gauche',
    move_right: 'Droite',
    move_up: 'Haut',
    move_down: 'Bas',
    ed_title: 'Titre',
    ed_title_helper: 'Laisser vide pour « Caméras »',
    ed_icon: 'Icône',
    ed_quality_entity: 'Sélecteur de qualité',
    ed_quality_entity_helper: 'input_select avec les options HD et SD ; sans lui, la qualité se change sur la carte',
    ed_hd_option: 'Option HD',
    ed_sd_option: 'Option SD',
    ed_columns: 'Colonnes',
    ed_columns_wall_helper: 'Vide : autant que la largeur le permet',
    ed_aspect_ratio: 'Format des vignettes',
    ed_aspect_ratio_helper: 'Par exemple 16:9 (par défaut) ou 4:3',
    ed_show_summary: 'Résumé',
    ed_show_title: 'Afficher le titre',
    ed_show_badges: 'Pastilles de confidentialité',
    ed_language: 'Langue',
    ed_language_helper: 'Laisser vide pour suivre la langue de Home Assistant',
    ed_cameras: 'Caméras',
    cf_name: 'Nom',
    cf_short_name: 'Nom court (pastille)',
    cf_camera: 'Caméra (HD)',
    cf_sd: 'Caméra SD',
    cf_privacy: 'Interrupteur de confidentialité (activé = masquée)',
    cf_power: 'Alimentation (éteinte = masquée)',
    cf_ptz: 'Préfixe PTZ, par exemple button.sejour_move',
    zoom_in: 'Afficher la carte complète',
    zoom_out: 'Revenir à la vue compacte',
    ed_zoom: 'Bouton détail',
    motion: 'Mouvement détecté',
    st_private: 'Privé',
    cam_hidden: '{c} : masquée',
    ed_show_motion: 'Pastille de mouvement',
    cf_motion: 'Capteur de mouvement (pastille sur l\'image)',
    ed_layout: 'Disposition',
    ed_layout_helper: 'Mur vidéo : pas de carte autour de la grille, une barre d\'état à la place de l\'en-tête',
    ed_layout_card: 'Carte',
    ed_layout_wall: 'Mur vidéo',
    ed_illustration: 'Illustration animée',
    ed_illustration_theme: 'Thème de l’illustration',
    ed_theme_auto: 'Automatique (suit le thème)',
    ed_theme_day: 'Jour',
    ed_theme_night: 'Nuit',
    open_frigate: 'Ouvrir dans Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Lecteur',
    ed_player_helper: 'Automatique : lecteur de Home Assistant, sous-flux Frigate en SD ; Frigate : toujours le go2rtc de Frigate',
    ed_player_auto: 'Automatique',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Flux SD',
    ed_sd_stream_helper: 'Flux go2rtc de Frigate lu en SD ; {camera} est le nom de la caméra',
    ed_instance: 'Instance Frigate',
    ed_instance_helper: 'Client id de l\'instance Frigate, avec plusieurs serveurs Frigate',
    ed_url: 'Adresse de Frigate',
    ed_url_helper: 'Ouverte par le bouton Ouvrir dans Frigate ; vide : le panneau de l\'app Frigate',
    ed_open_in_frigate: 'Bouton Ouvrir dans Frigate',
    ed_duplicates: 'Caméra dans Frigate et dans sa propre intégration',
    ed_duplicates_helper: 'Celle que listent les caméras trouvées (interrupteur de confidentialité et boutons PTZ restent à la caméra Frigate)',
    ed_duplicates_frigate: 'La caméra Frigate',
    ed_duplicates_native: 'La caméra native',
    ed_duplicates_both: 'Les deux',
    cf_controls_from: 'Contrôles de (confidentialité, PTZ)',
    cf_player: 'Lecteur',
    ev_title: 'Événements · {n} aujourd’hui',
    ev_title_short: 'Événements · {n}',
    ev_heading: 'Événements',
    ev_today: 'aujourd’hui',
    ev_none: 'Aucun événement aujourd’hui',
    ev_last: 'Dernier : {l} · {c}, {t}',
    ev_all: 'Tous',
    ev_group_person: 'Personne',
    ev_group_animal: 'Animal',
    ev_group_vehicle: 'Véhicule',
    ev_group_other: 'Autre',
    ev_live: 'en cours',
    ev_live_btn: 'Direct',
    ev_no_clip: 'Pas de clip pour cet événement',
    ev_expand: 'Afficher les événements',
    ev_collapse: 'Masquer les événements',
    detect_on: 'Détection active : toucher pour la couper',
    detect_off: 'Détection coupée : toucher pour l’activer',
    rec_on: 'Enregistrement actif : toucher pour le couper',
    rec_off: 'Enregistrement coupé : toucher pour l’activer',
    obj_person: 'Personne',
    obj_car: 'Voiture',
    obj_truck: 'Camion',
    obj_bus: 'Bus',
    obj_motorcycle: 'Moto',
    obj_bicycle: 'Vélo',
    obj_cat: 'Chat',
    obj_dog: 'Chien',
    obj_bird: 'Oiseau',
    obj_horse: 'Cheval',
    obj_package: 'Colis',
    obj_face: 'Visage',
    obj_license_plate: 'Plaque',
    tl_today: 'Aujourd’hui',
    tl_yesterday: 'Hier',
    tl_prev_day: 'Jour précédent',
    tl_next_day: 'Jour suivant',
    tl_all_cameras: 'Toutes les caméras',
    tl_download: 'Télécharger',
    tl_empty: 'Aucun événement ce jour-là',
    tl_select: 'Choisissez un événement pour lire son clip',
    tl_score: 'score {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'Direct · {c}',
    ed_events: 'Événements',
    ed_events_helper: 'Les événements du jour des caméras Frigate, sous la grille',
    ed_events_expanded: 'Événements dépliés',
    ed_events_limit: 'Événements listés',
    ed_badges: 'Boutons détection et enregistrement',
  },
  en: {
    title: 'Cameras',
    live_one: '{n} camera live',
    live_many: '{n} cameras live',
    hidden_one: '{n} hidden',
    hidden_many: '{n} hidden',
    all_hidden: 'All cameras are hidden',
    one_hidden: 'Camera disabled',
    no_cameras: 'No camera configured',
    hint_all: 'Tap a badge to show a camera',
    live: 'Live',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Switch between HD and SD',
    privacy_on: '{c}: hidden, tap to show it',
    privacy_off: '{c}: visible, tap to hide it',
    privacy_unavailable: '{c}: unavailable',
    enable: 'Enable',
    disable: 'Disable',
    unavailable: 'Unavailable',
    ptz: 'Pan & tilt',
    open: 'Show {c} fullscreen',
    exit_fullscreen: 'Exit fullscreen',
    details: 'Details',
    pending: 'Updating…',
    sound_on: 'Unmute',
    sound_off: 'Mute',
    move_left: 'Left',
    move_right: 'Right',
    move_up: 'Up',
    move_down: 'Down',
    ed_title: 'Title',
    ed_title_helper: 'Leave empty for "Cameras"',
    ed_icon: 'Icon',
    ed_quality_entity: 'Quality selector',
    ed_quality_entity_helper: 'input_select with HD and SD options; without it, the quality is switched on the card',
    ed_hd_option: 'HD option',
    ed_sd_option: 'SD option',
    ed_columns: 'Columns',
    ed_columns_wall_helper: 'Empty: as many as the width takes',
    ed_aspect_ratio: 'Tile aspect ratio',
    ed_aspect_ratio_helper: 'For example 16:9 (default) or 4:3',
    ed_show_summary: 'Summary',
    ed_show_title: 'Show title',
    ed_show_badges: 'Privacy badges',
    ed_language: 'Language',
    ed_language_helper: 'Leave empty to follow the Home Assistant language',
    ed_cameras: 'Cameras',
    cf_name: 'Name',
    cf_short_name: 'Short name (badge)',
    cf_camera: 'Camera (HD)',
    cf_sd: 'SD camera',
    cf_privacy: 'Privacy switch (on = hidden)',
    cf_power: 'Power (off = hidden)',
    cf_ptz: 'PTZ prefix, for example button.living_room_move',
    zoom_in: 'Show the full card',
    zoom_out: 'Back to the compact view',
    ed_zoom: 'Detail button',
    motion: 'Motion detected',
    st_private: 'Private',
    cam_hidden: '{c}: hidden',
    ed_show_motion: 'Motion badge',
    cf_motion: 'Motion sensor (badge on the image)',
    ed_layout: 'Layout',
    ed_layout_helper: 'Video wall: no card around the grid, a status bar instead of the header',
    ed_layout_card: 'Card',
    ed_layout_wall: 'Video wall',
    ed_illustration: 'Animated illustration',
    ed_illustration_theme: 'Illustration theme',
    ed_theme_auto: 'Automatic (follows the theme)',
    ed_theme_day: 'Day',
    ed_theme_night: 'Night',
    open_frigate: 'Open in Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Player',
    ed_player_helper: 'Automatic: Home Assistant\'s player, Frigate\'s sub-stream for SD; Frigate: always Frigate\'s go2rtc',
    ed_player_auto: 'Automatic',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD stream',
    ed_sd_stream_helper: 'Frigate go2rtc stream played in SD; {camera} is the camera name',
    ed_instance: 'Frigate instance',
    ed_instance_helper: 'Client id of the Frigate instance, with several Frigate servers',
    ed_url: 'Frigate address',
    ed_url_helper: 'Opened by the Open in Frigate button; empty: the Frigate app\'s sidebar panel',
    ed_open_in_frigate: 'Open in Frigate button',
    ed_duplicates: 'Camera in Frigate and in its own integration',
    ed_duplicates_helper: 'Which one the cameras found list (its privacy switch and PTZ buttons stay with the Frigate camera)',
    ed_duplicates_frigate: 'The Frigate camera',
    ed_duplicates_native: 'The native camera',
    ed_duplicates_both: 'Both',
    cf_controls_from: 'Controls from (privacy, PTZ)',
    cf_player: 'Player',
    ev_title: 'Events · {n} today',
    ev_title_short: 'Events · {n}',
    ev_heading: 'Events',
    ev_today: 'today',
    ev_none: 'No events today',
    ev_last: 'Last: {l} · {c}, {t}',
    ev_all: 'All',
    ev_group_person: 'Person',
    ev_group_animal: 'Animal',
    ev_group_vehicle: 'Vehicle',
    ev_group_other: 'Other',
    ev_live: 'in progress',
    ev_live_btn: 'Live',
    ev_no_clip: 'No clip for this event',
    ev_expand: 'Show the events',
    ev_collapse: 'Hide the events',
    detect_on: 'Detection on: tap to turn it off',
    detect_off: 'Detection off: tap to turn it on',
    rec_on: 'Recording on: tap to turn it off',
    rec_off: 'Recording off: tap to turn it on',
    obj_person: 'Person',
    obj_car: 'Car',
    obj_truck: 'Truck',
    obj_bus: 'Bus',
    obj_motorcycle: 'Motorcycle',
    obj_bicycle: 'Bicycle',
    obj_cat: 'Cat',
    obj_dog: 'Dog',
    obj_bird: 'Bird',
    obj_horse: 'Horse',
    obj_package: 'Package',
    obj_face: 'Face',
    obj_license_plate: 'Licence plate',
    tl_today: 'Today',
    tl_yesterday: 'Yesterday',
    tl_prev_day: 'Previous day',
    tl_next_day: 'Next day',
    tl_all_cameras: 'All cameras',
    tl_download: 'Download',
    tl_empty: 'No events this day',
    tl_select: 'Choose an event to play its clip',
    tl_score: 'score {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'Live · {c}',
    ed_events: 'Events',
    ed_events_helper: 'The day’s events of the Frigate cameras, under the grid',
    ed_events_expanded: 'Events unfolded',
    ed_events_limit: 'Events listed',
    ed_badges: 'Detection and recording buttons',
  },
  de: {
    title: 'Kameras',
    live_one: '{n} Kamera live',
    live_many: '{n} Kameras live',
    hidden_one: '{n} ausgeblendet',
    hidden_many: '{n} ausgeblendet',
    all_hidden: 'Alle Kameras sind ausgeblendet',
    one_hidden: 'Kamera deaktiviert',
    no_cameras: 'Keine Kamera konfiguriert',
    hint_all: 'Tippe auf ein Badge, um eine Kamera anzuzeigen',
    live: 'Live',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Zwischen HD und SD wechseln',
    privacy_on: '{c}: ausgeblendet, tippen zum Anzeigen',
    privacy_off: '{c}: sichtbar, tippen zum Ausblenden',
    privacy_unavailable: '{c}: nicht verfügbar',
    enable: 'Aktivieren',
    disable: 'Deaktivieren',
    unavailable: 'Nicht verfügbar',
    ptz: 'Schwenken & Neigen',
    open: '{c} im Vollbild anzeigen',
    exit_fullscreen: 'Vollbild beenden',
    details: 'Details',
    pending: 'Wird aktualisiert…',
    sound_on: 'Ton einschalten',
    sound_off: 'Ton ausschalten',
    move_left: 'Nach links',
    move_right: 'Nach rechts',
    move_up: 'Nach oben',
    move_down: 'Nach unten',
    ed_title: 'Titel',
    ed_title_helper: 'Leer lassen für „Kameras“',
    ed_icon: 'Symbol',
    ed_quality_entity: 'Qualitätsauswahl',
    ed_quality_entity_helper: 'input_select mit den Optionen HD und SD; ohne sie wird die Qualität auf der Karte umgeschaltet',
    ed_hd_option: 'HD-Option',
    ed_sd_option: 'SD-Option',
    ed_columns: 'Spalten',
    ed_columns_wall_helper: 'Leer: so viele, wie die Breite zulässt',
    ed_aspect_ratio: 'Seitenverhältnis der Kacheln',
    ed_aspect_ratio_helper: 'Zum Beispiel 16:9 (Standard) oder 4:3',
    ed_show_summary: 'Zusammenfassung',
    ed_show_title: 'Titel anzeigen',
    ed_show_badges: 'Privatsphäre-Badges',
    ed_language: 'Sprache',
    ed_language_helper: 'Leer lassen, um der Sprache von Home Assistant zu folgen',
    ed_cameras: 'Kameras',
    cf_name: 'Name',
    cf_short_name: 'Kurzname (Badge)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'SD-Kamera',
    cf_privacy: 'Privatsphäre-Schalter (an = ausgeblendet)',
    cf_power: 'Stromversorgung (aus = ausgeblendet)',
    cf_ptz: 'PTZ-Präfix, zum Beispiel button.wohnzimmer_move',
    zoom_in: 'Vollständige Karte anzeigen',
    zoom_out: 'Zurück zur kompakten Ansicht',
    ed_zoom: 'Detail-Schaltfläche',
    motion: 'Bewegung erkannt',
    st_private: 'Privat',
    cam_hidden: '{c}: ausgeblendet',
    ed_show_motion: 'Bewegungs-Badge',
    cf_motion: 'Bewegungssensor (Badge auf dem Bild)',
    ed_layout: 'Layout',
    ed_layout_helper: 'Videowand: keine Karte um das Raster, eine Statusleiste statt der Kopfzeile',
    ed_layout_card: 'Karte',
    ed_layout_wall: 'Videowand',
    ed_illustration: 'Animierte Illustration',
    ed_illustration_theme: 'Thema der Illustration',
    ed_theme_auto: 'Automatisch (folgt dem Thema)',
    ed_theme_day: 'Tag',
    ed_theme_night: 'Nacht',
    open_frigate: 'In Frigate öffnen',
    ed_frigate: 'Frigate',
    ed_player: 'Player',
    ed_player_helper: 'Automatisch: Player von Home Assistant, Frigate-Substream für SD; Frigate: immer go2rtc von Frigate',
    ed_player_auto: 'Automatisch',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD-Stream',
    ed_sd_stream_helper: 'go2rtc-Stream von Frigate für SD; {camera} ist der Kameraname',
    ed_instance: 'Frigate-Instanz',
    ed_instance_helper: 'Client-ID der Frigate-Instanz, bei mehreren Frigate-Servern',
    ed_url: 'Frigate-Adresse',
    ed_url_helper: 'Vom Button In Frigate öffnen geöffnet; leer: das Seitenleistenpanel der Frigate-App',
    ed_open_in_frigate: 'Button In Frigate öffnen',
    ed_duplicates: 'Kamera in Frigate und in ihrer eigenen Integration',
    ed_duplicates_helper: 'Welche die gefundenen Kameras auflisten (Privatsphäre-Schalter und PTZ-Tasten bleiben bei der Frigate-Kamera)',
    ed_duplicates_frigate: 'Die Frigate-Kamera',
    ed_duplicates_native: 'Die native Kamera',
    ed_duplicates_both: 'Beide',
    cf_controls_from: 'Steuerung von (Privatsphäre, PTZ)',
    cf_player: 'Player',
    ev_title: 'Ereignisse · {n} heute',
    ev_title_short: 'Ereignisse · {n}',
    ev_heading: 'Ereignisse',
    ev_today: 'heute',
    ev_none: 'Heute keine Ereignisse',
    ev_last: 'Zuletzt: {l} · {c}, {t}',
    ev_all: 'Alle',
    ev_group_person: 'Person',
    ev_group_animal: 'Tier',
    ev_group_vehicle: 'Fahrzeug',
    ev_group_other: 'Andere',
    ev_live: 'läuft',
    ev_live_btn: 'Live',
    ev_no_clip: 'Kein Clip für dieses Ereignis',
    ev_expand: 'Ereignisse anzeigen',
    ev_collapse: 'Ereignisse ausblenden',
    detect_on: 'Erkennung an: tippen zum Ausschalten',
    detect_off: 'Erkennung aus: tippen zum Einschalten',
    rec_on: 'Aufnahme an: tippen zum Ausschalten',
    rec_off: 'Aufnahme aus: tippen zum Einschalten',
    obj_person: 'Person',
    obj_car: 'Auto',
    obj_truck: 'Lkw',
    obj_bus: 'Bus',
    obj_motorcycle: 'Motorrad',
    obj_bicycle: 'Fahrrad',
    obj_cat: 'Katze',
    obj_dog: 'Hund',
    obj_bird: 'Vogel',
    obj_horse: 'Pferd',
    obj_package: 'Paket',
    obj_face: 'Gesicht',
    obj_license_plate: 'Kennzeichen',
    tl_today: 'Heute',
    tl_yesterday: 'Gestern',
    tl_prev_day: 'Vorheriger Tag',
    tl_next_day: 'Nächster Tag',
    tl_all_cameras: 'Alle Kameras',
    tl_download: 'Herunterladen',
    tl_empty: 'Keine Ereignisse an diesem Tag',
    tl_select: 'Wähle ein Ereignis, um seinen Clip abzuspielen',
    tl_score: 'Score {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'Live · {c}',
    ed_events: 'Ereignisse',
    ed_events_helper: 'Die Ereignisse des Tages der Frigate-Kameras, unter dem Raster',
    ed_events_expanded: 'Ereignisse ausgeklappt',
    ed_events_limit: 'Angezeigte Ereignisse',
    ed_badges: 'Tasten für Erkennung und Aufnahme',
  },
  es: {
    title: 'Cámaras',
    live_one: '{n} cámara en directo',
    live_many: '{n} cámaras en directo',
    hidden_one: '{n} oculta',
    hidden_many: '{n} ocultas',
    all_hidden: 'Todas las cámaras están ocultas',
    one_hidden: 'Cámara desactivada',
    no_cameras: 'No hay ninguna cámara configurada',
    hint_all: 'Toca una insignia para mostrar una cámara',
    live: 'En directo',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Cambiar entre HD y SD',
    privacy_on: '{c}: oculta, toca para mostrarla',
    privacy_off: '{c}: visible, toca para ocultarla',
    privacy_unavailable: '{c}: no disponible',
    enable: 'Activar',
    disable: 'Desactivar',
    unavailable: 'No disponible',
    ptz: 'Orientación',
    open: 'Mostrar {c} en pantalla completa',
    exit_fullscreen: 'Salir de pantalla completa',
    details: 'Detalles',
    pending: 'Actualizando…',
    sound_on: 'Activar sonido',
    sound_off: 'Silenciar',
    move_left: 'Izquierda',
    move_right: 'Derecha',
    move_up: 'Arriba',
    move_down: 'Abajo',
    ed_title: 'Título',
    ed_title_helper: 'Déjalo vacío para «Cámaras»',
    ed_icon: 'Icono',
    ed_quality_entity: 'Selector de calidad',
    ed_quality_entity_helper: 'input_select con las opciones HD y SD; sin él, la calidad se cambia en la tarjeta',
    ed_hd_option: 'Opción HD',
    ed_sd_option: 'Opción SD',
    ed_columns: 'Columnas',
    ed_columns_wall_helper: 'Vacío: tantas como quepan a lo ancho',
    ed_aspect_ratio: 'Relación de aspecto de las miniaturas',
    ed_aspect_ratio_helper: 'Por ejemplo 16:9 (predeterminado) o 4:3',
    ed_show_summary: 'Resumen',
    ed_show_title: 'Mostrar el título',
    ed_show_badges: 'Insignias de privacidad',
    ed_language: 'Idioma',
    ed_language_helper: 'Déjalo vacío para seguir el idioma de Home Assistant',
    ed_cameras: 'Cámaras',
    cf_name: 'Nombre',
    cf_short_name: 'Nombre corto (insignia)',
    cf_camera: 'Cámara (HD)',
    cf_sd: 'Cámara SD',
    cf_privacy: 'Interruptor de privacidad (encendido = oculta)',
    cf_power: 'Alimentación (apagada = oculta)',
    cf_ptz: 'Prefijo PTZ, por ejemplo button.salon_move',
    zoom_in: 'Mostrar la tarjeta completa',
    zoom_out: 'Volver a la vista compacta',
    ed_zoom: 'Botón de detalle',
    motion: 'Movimiento detectado',
    st_private: 'Privado',
    cam_hidden: '{c}: oculta',
    ed_show_motion: 'Insignia de movimiento',
    cf_motion: 'Sensor de movimiento (insignia en la imagen)',
    ed_layout: 'Disposición',
    ed_layout_helper: 'Videowall: sin tarjeta alrededor de la cuadrícula, una barra de estado en lugar del encabezado',
    ed_layout_card: 'Tarjeta',
    ed_layout_wall: 'Videowall',
    ed_illustration: 'Ilustración animada',
    ed_illustration_theme: 'Tema de la ilustración',
    ed_theme_auto: 'Automático (sigue el tema)',
    ed_theme_day: 'Día',
    ed_theme_night: 'Noche',
    open_frigate: 'Abrir en Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Reproductor',
    ed_player_helper: 'Automático: reproductor de Home Assistant, subflujo de Frigate en SD; Frigate: siempre el go2rtc de Frigate',
    ed_player_auto: 'Automático',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Flujo SD',
    ed_sd_stream_helper: 'Flujo go2rtc de Frigate en SD; {camera} es el nombre de la cámara',
    ed_instance: 'Instancia de Frigate',
    ed_instance_helper: 'Client id de la instancia de Frigate, con varios servidores Frigate',
    ed_url: 'Dirección de Frigate',
    ed_url_helper: 'Abierta por el botón Abrir en Frigate; vacía: el panel de la app Frigate',
    ed_open_in_frigate: 'Botón Abrir en Frigate',
    ed_duplicates: 'Cámara en Frigate y en su propia integración',
    ed_duplicates_helper: 'Cuál listan las cámaras encontradas (el interruptor de privacidad y los botones PTZ quedan en la cámara Frigate)',
    ed_duplicates_frigate: 'La cámara Frigate',
    ed_duplicates_native: 'La cámara nativa',
    ed_duplicates_both: 'Ambas',
    cf_controls_from: 'Controles de (privacidad, PTZ)',
    cf_player: 'Reproductor',
    ev_title: 'Eventos · {n} hoy',
    ev_title_short: 'Eventos · {n}',
    ev_heading: 'Eventos',
    ev_today: 'hoy',
    ev_none: 'Ningún evento hoy',
    ev_last: 'Último: {l} · {c}, {t}',
    ev_all: 'Todos',
    ev_group_person: 'Persona',
    ev_group_animal: 'Animal',
    ev_group_vehicle: 'Vehículo',
    ev_group_other: 'Otro',
    ev_live: 'en curso',
    ev_live_btn: 'En directo',
    ev_no_clip: 'Sin clip para este evento',
    ev_expand: 'Mostrar los eventos',
    ev_collapse: 'Ocultar los eventos',
    detect_on: 'Detección activa: toca para desactivarla',
    detect_off: 'Detección desactivada: toca para activarla',
    rec_on: 'Grabación activa: toca para desactivarla',
    rec_off: 'Grabación desactivada: toca para activarla',
    obj_person: 'Persona',
    obj_car: 'Coche',
    obj_truck: 'Camión',
    obj_bus: 'Autobús',
    obj_motorcycle: 'Moto',
    obj_bicycle: 'Bicicleta',
    obj_cat: 'Gato',
    obj_dog: 'Perro',
    obj_bird: 'Pájaro',
    obj_horse: 'Caballo',
    obj_package: 'Paquete',
    obj_face: 'Cara',
    obj_license_plate: 'Matrícula',
    tl_today: 'Hoy',
    tl_yesterday: 'Ayer',
    tl_prev_day: 'Día anterior',
    tl_next_day: 'Día siguiente',
    tl_all_cameras: 'Todas las cámaras',
    tl_download: 'Descargar',
    tl_empty: 'Ningún evento ese día',
    tl_select: 'Elige un evento para reproducir su clip',
    tl_score: 'puntuación {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'En directo · {c}',
    ed_events: 'Eventos',
    ed_events_helper: 'Los eventos del día de las cámaras Frigate, bajo la cuadrícula',
    ed_events_expanded: 'Eventos desplegados',
    ed_events_limit: 'Eventos mostrados',
    ed_badges: 'Botones de detección y grabación',
  },
  sr: {
    title: 'Камере',
    live_one: '{n} камера уживо',
    live_many: 'Камере уживо: {n}',
    hidden_one: '{n} скривена',
    hidden_many: 'Скривене: {n}',
    all_hidden: 'Све камере су скривене',
    one_hidden: 'Камера је онемогућена',
    no_cameras: 'Нема подешених камера',
    hint_all: 'Додирните значку да прикажете камеру',
    live: 'Уживо',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Пребацивање између HD и SD квалитета',
    privacy_on: '{c}: скривена, додирните да је прикажете',
    privacy_off: '{c}: видљива, додирните да је сакријете',
    privacy_unavailable: '{c}: недоступна',
    enable: 'Омогући',
    disable: 'Онемогући',
    unavailable: 'Недоступно',
    ptz: 'Окретање и нагиб (PTZ)',
    open: 'Прикажи {c} преко целог екрана',
    exit_fullscreen: 'Затвори цео екран',
    details: 'Детаљи',
    pending: 'Ажурирање…',
    sound_on: 'Укључи звук',
    sound_off: 'Искључи звук',
    move_left: 'Лево',
    move_right: 'Десно',
    move_up: 'Горе',
    move_down: 'Доле',
    ed_title: 'Наслов',
    ed_title_helper: 'Остави празно за „Камере“',
    ed_icon: 'Икона',
    ed_quality_entity: 'Бирач квалитета',
    ed_quality_entity_helper: 'input_select са опцијама HD и SD; без овога, квалитет се мења директно на картици',
    ed_hd_option: 'HD опција',
    ed_sd_option: 'SD опција',
    ed_columns: 'Колоне',
    ed_columns_wall_helper: 'Празно: колико стане по ширини',
    ed_aspect_ratio: 'Пропорција плочице (Aspect ratio)',
    ed_aspect_ratio_helper: 'На пример 16:9 (подразумевано) или 4:3',
    ed_show_summary: 'Садржај / Резиме',
    ed_show_title: 'Прикажи наслов',
    ed_show_badges: 'Значке приватности',
    ed_language: 'Језик',
    ed_language_helper: 'Остави празно да прати језик Home Assistant-а',
    ed_cameras: 'Камере',
    cf_name: 'Назив',
    cf_short_name: 'Скраћени назив (значка)',
    cf_camera: 'Камера (HD)',
    cf_sd: 'SD камера',
    cf_privacy: 'Прекидач приватности (укључено = скривено)',
    cf_power: 'Напајање (искључено = скривено)',
    cf_ptz: 'PTZ префикс, на пример button.living_room_move',
    zoom_in: 'Прикажи целу картицу',
    zoom_out: 'Назад на компактни приказ',
    ed_zoom: 'Дугме за детаље',
    motion: 'Откривен покрет',
    st_private: 'Приватно',
    cam_hidden: '{c}: скривена',
    ed_show_motion: 'Значка покрета',
    cf_motion: 'Сензор покрета (значка на слици)',
    ed_layout: 'Распоред',
    ed_layout_helper: 'Видео зид: без картице око мреже, трака стања уместо заглавља',
    ed_layout_card: 'Картица',
    ed_layout_wall: 'Видео зид',
    ed_illustration: 'Анимирана илустрација',
    ed_illustration_theme: 'Тема илустрације',
    ed_theme_auto: 'Аутоматски (прати тему)',
    ed_theme_day: 'Дан',
    ed_theme_night: 'Ноћ',
    open_frigate: 'Отвори у Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Плејер',
    ed_player_helper: 'Аутоматски: плејер Home Assistant, подток Frigate за SD; Frigate: увек go2rtc из Frigate',
    ed_player_auto: 'Аутоматски',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD ток',
    ed_sd_stream_helper: 'go2rtc ток из Frigate за SD; {camera} је назив камере',
    ed_instance: 'Frigate инстанца',
    ed_instance_helper: 'Client id Frigate инстанце, кад има више Frigate сервера',
    ed_url: 'Адреса Frigate',
    ed_url_helper: 'Отвара је дугме Отвори у Frigate; празно: панел Frigate апликације',
    ed_open_in_frigate: 'Дугме Отвори у Frigate',
    ed_duplicates: 'Камера у Frigate и у сопственој интеграцији',
    ed_duplicates_helper: 'Коју приказују пронађене камере (прекидач приватности и PTZ дугмад остају код Frigate камере)',
    ed_duplicates_frigate: 'Frigate камера',
    ed_duplicates_native: 'Изворна камера',
    ed_duplicates_both: 'Обе',
    cf_controls_from: 'Контроле из (приватност, PTZ)',
    cf_player: 'Плејер',
    ev_title: 'Догађаји · {n} данас',
    ev_title_short: 'Догађаји · {n}',
    ev_heading: 'Догађаји',
    ev_today: 'данас',
    ev_none: 'Данас нема догађаја',
    ev_last: 'Последњи: {l} · {c}, {t}',
    ev_all: 'Сви',
    ev_group_person: 'Особа',
    ev_group_animal: 'Животиња',
    ev_group_vehicle: 'Возило',
    ev_group_other: 'Остало',
    ev_live: 'у току',
    ev_live_btn: 'Уживо',
    ev_no_clip: 'Нема снимка за овај догађај',
    ev_expand: 'Прикажи догађаје',
    ev_collapse: 'Сакриј догађаје',
    detect_on: 'Детекција укључена: додирните да је искључите',
    detect_off: 'Детекција искључена: додирните да је укључите',
    rec_on: 'Снимање укључено: додирните да га искључите',
    rec_off: 'Снимање искључено: додирните да га укључите',
    obj_person: 'Особа',
    obj_car: 'Аутомобил',
    obj_truck: 'Камион',
    obj_bus: 'Аутобус',
    obj_motorcycle: 'Мотоцикл',
    obj_bicycle: 'Бицикл',
    obj_cat: 'Мачка',
    obj_dog: 'Пас',
    obj_bird: 'Птица',
    obj_horse: 'Коњ',
    obj_package: 'Пакет',
    obj_face: 'Лице',
    obj_license_plate: 'Регистарска таблица',
    tl_today: 'Данас',
    tl_yesterday: 'Јуче',
    tl_prev_day: 'Претходни дан',
    tl_next_day: 'Следећи дан',
    tl_all_cameras: 'Све камере',
    tl_download: 'Преузми',
    tl_empty: 'Тог дана нема догађаја',
    tl_select: 'Изаберите догађај да пустите његов снимак',
    tl_score: 'оцена {s}',
    tl_clip: 'Снимак',
    tl_live_badge: 'Уживо · {c}',
    ed_events: 'Догађаји',
    ed_events_helper: 'Данашњи догађаји Frigate камера, испод мреже',
    ed_events_expanded: 'Догађаји отворени',
    ed_events_limit: 'Приказани догађаји',
    ed_badges: 'Дугмад за детекцију и снимање',
  },
  'sr-Latn': {
    title: 'Kamere',
    live_one: '{n} kamera uživo',
    live_many: 'Kamere uživo: {n}',
    hidden_one: '{n} skrivena',
    hidden_many: 'Skrivene: {n}',
    all_hidden: 'Sve kamere su skrivene',
    one_hidden: 'Kamera je onemogućena',
    no_cameras: 'Nema podešenih kamera',
    hint_all: 'Dodirnite značku da prikažete kameru',
    live: 'Uživo',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Prebacivanje između HD i SD kvaliteta',
    privacy_on: '{c}: skrivena, dodirnite da je prikažete',
    privacy_off: '{c}: vidljiva, dodirnite da je sakrijete',
    privacy_unavailable: '{c}: nedostupna',
    enable: 'Omogući',
    disable: 'Onemogući',
    unavailable: 'Nedostupno',
    ptz: 'Okretanje i nagib (PTZ)',
    open: 'Prikaži {c} preko celog ekrana',
    exit_fullscreen: 'Zatvori ceo ekran',
    details: 'Detalji',
    pending: 'Ažuriranje…',
    sound_on: 'Uključi zvuk',
    sound_off: 'Isključi zvuk',
    move_left: 'Levo',
    move_right: 'Desno',
    move_up: 'Gore',
    move_down: 'Dole',
    ed_title: 'Naslov',
    ed_title_helper: 'Ostavi prazno za „Kamere“',
    ed_icon: 'Ikona',
    ed_quality_entity: 'Birač kvaliteta',
    ed_quality_entity_helper: 'input_select sa opcijama HD i SD; bez ovoga, kvalitet se menja direktno na kartici',
    ed_hd_option: 'HD opcija',
    ed_sd_option: 'SD opcija',
    ed_columns: 'Kolone',
    ed_columns_wall_helper: 'Prazno: koliko stane po širini',
    ed_aspect_ratio: 'Proporcija pločice (Aspect ratio)',
    ed_aspect_ratio_helper: 'Na primer 16:9 (podrazumevano) ili 4:3',
    ed_show_summary: 'Sadržaj / Rezime',
    ed_show_title: 'Prikaži naslov',
    ed_show_badges: 'Značke privatnosti',
    ed_language: 'Jezik',
    ed_language_helper: 'Ostavi prazno da prati jezik Home Assistant-a',
    ed_cameras: 'Kamere',
    cf_name: 'Naziv',
    cf_short_name: 'Skraćeni naziv (značka)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'SD kamera',
    cf_privacy: 'Prekidač privatnosti (uključeno = skriveno)',
    cf_power: 'Napajanje (isključeno = skriveno)',
    cf_ptz: 'PTZ prefiks, na primer button.living_room_move',
    zoom_in: 'Prikaži celu karticu',
    zoom_out: 'Nazad na kompaktni prikaz',
    ed_zoom: 'Dugme za detalje',
    motion: 'Otkriven pokret',
    st_private: 'Privatno',
    cam_hidden: '{c}: skrivena',
    ed_show_motion: 'Značka pokreta',
    cf_motion: 'Senzor pokreta (značka na slici)',
    ed_layout: 'Raspored',
    ed_layout_helper: 'Video zid: bez kartice oko mreže, traka stanja umesto zaglavlja',
    ed_layout_card: 'Kartica',
    ed_layout_wall: 'Video zid',
    ed_illustration: 'Animirana ilustracija',
    ed_illustration_theme: 'Tema ilustracije',
    ed_theme_auto: 'Automatski (prati temu)',
    ed_theme_day: 'Dan',
    ed_theme_night: 'Noć',
    open_frigate: 'Otvori u Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Plejer',
    ed_player_helper: 'Automatski: plejer Home Assistant, podtok Frigate za SD; Frigate: uvek go2rtc iz Frigate',
    ed_player_auto: 'Automatski',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD tok',
    ed_sd_stream_helper: 'go2rtc tok iz Frigate za SD; {camera} je naziv kamere',
    ed_instance: 'Frigate instanca',
    ed_instance_helper: 'Client id Frigate instance, kad ima više Frigate servera',
    ed_url: 'Adresa Frigate',
    ed_url_helper: 'Otvara je dugme Otvori u Frigate; prazno: panel Frigate aplikacije',
    ed_open_in_frigate: 'Dugme Otvori u Frigate',
    ed_duplicates: 'Kamera u Frigate i u sopstvenoj integraciji',
    ed_duplicates_helper: 'Koju prikazuju pronađene kamere (prekidač privatnosti i PTZ dugmad ostaju kod Frigate kamere)',
    ed_duplicates_frigate: 'Frigate kamera',
    ed_duplicates_native: 'Izvorna kamera',
    ed_duplicates_both: 'Obe',
    cf_controls_from: 'Kontrole iz (privatnost, PTZ)',
    cf_player: 'Plejer',
    ev_title: 'Događaji · {n} danas',
    ev_title_short: 'Događaji · {n}',
    ev_heading: 'Događaji',
    ev_today: 'danas',
    ev_none: 'Danas nema događaja',
    ev_last: 'Poslednji: {l} · {c}, {t}',
    ev_all: 'Svi',
    ev_group_person: 'Osoba',
    ev_group_animal: 'Životinja',
    ev_group_vehicle: 'Vozilo',
    ev_group_other: 'Ostalo',
    ev_live: 'u toku',
    ev_live_btn: 'Uživo',
    ev_no_clip: 'Nema snimka za ovaj događaj',
    ev_expand: 'Prikaži događaje',
    ev_collapse: 'Sakrij događaje',
    detect_on: 'Detekcija uključena: dodirnite da je isključite',
    detect_off: 'Detekcija isključena: dodirnite da je uključite',
    rec_on: 'Snimanje uključeno: dodirnite da ga isključite',
    rec_off: 'Snimanje isključeno: dodirnite da ga uključite',
    obj_person: 'Osoba',
    obj_car: 'Automobil',
    obj_truck: 'Kamion',
    obj_bus: 'Autobus',
    obj_motorcycle: 'Motocikl',
    obj_bicycle: 'Bicikl',
    obj_cat: 'Mačka',
    obj_dog: 'Pas',
    obj_bird: 'Ptica',
    obj_horse: 'Konj',
    obj_package: 'Paket',
    obj_face: 'Lice',
    obj_license_plate: 'Registarska tablica',
    tl_today: 'Danas',
    tl_yesterday: 'Juče',
    tl_prev_day: 'Prethodni dan',
    tl_next_day: 'Sledeći dan',
    tl_all_cameras: 'Sve kamere',
    tl_download: 'Preuzmi',
    tl_empty: 'Tog dana nema događaja',
    tl_select: 'Izaberite događaj da pustite njegov snimak',
    tl_score: 'ocena {s}',
    tl_clip: 'Snimak',
    tl_live_badge: 'Uživo · {c}',
    ed_events: 'Događaji',
    ed_events_helper: 'Današnji događaji Frigate kamera, ispod mreže',
    ed_events_expanded: 'Događaji otvoreni',
    ed_events_limit: 'Prikazani događaji',
    ed_badges: 'Dugmad za detekciju i snimanje',
  },
  it: {
    title: 'Telecamere',
    live_one: '{n} telecamera in diretta',
    live_many: '{n} telecamere in diretta',
    hidden_one: '{n} nascosta',
    hidden_many: '{n} nascoste',
    all_hidden: 'Tutte le telecamere sono nascoste',
    one_hidden: 'Telecamera disattivata',
    no_cameras: 'Nessuna telecamera configurata',
    hint_all: 'Tocca un badge per mostrare una telecamera',
    live: 'In diretta',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Passa da HD a SD e viceversa',
    privacy_on: '{c}: nascosta, tocca per mostrarla',
    privacy_off: '{c}: visibile, tocca per nasconderla',
    privacy_unavailable: '{c}: non disponibile',
    enable: 'Attiva',
    disable: 'Disattiva',
    unavailable: 'Non disponibile',
    ptz: 'Rotazione e inclinazione',
    open: 'Mostra {c} a schermo intero',
    exit_fullscreen: 'Esci da schermo intero',
    details: 'Dettagli',
    pending: 'Aggiornamento…',
    sound_on: 'Attiva audio',
    sound_off: 'Disattiva audio',
    move_left: 'A sinistra',
    move_right: 'A destra',
    move_up: 'In alto',
    move_down: 'In basso',
    ed_title: 'Titolo',
    ed_title_helper: 'Lascia vuoto per «Telecamere»',
    ed_icon: 'Icona',
    ed_quality_entity: 'Selettore di qualità',
    ed_quality_entity_helper: 'input_select con le opzioni HD e SD; senza di esso, la qualità si cambia sulla scheda',
    ed_hd_option: 'Opzione HD',
    ed_sd_option: 'Opzione SD',
    ed_columns: 'Colonne',
    ed_columns_wall_helper: 'Vuoto: quante ne entrano in larghezza',
    ed_aspect_ratio: 'Proporzioni dei riquadri',
    ed_aspect_ratio_helper: 'Ad esempio 16:9 (predefinito) o 4:3',
    ed_show_summary: 'Riepilogo',
    ed_show_title: 'Mostra il titolo',
    ed_show_badges: 'Badge di privacy',
    ed_language: 'Lingua',
    ed_language_helper: 'Lascia vuoto per seguire la lingua di Home Assistant',
    ed_cameras: 'Telecamere',
    cf_name: 'Nome',
    cf_short_name: 'Nome breve (badge)',
    cf_camera: 'Telecamera (HD)',
    cf_sd: 'Telecamera SD',
    cf_privacy: 'Interruttore privacy (attivo = nascosta)',
    cf_power: 'Alimentazione (spenta = nascosta)',
    cf_ptz: 'Prefisso PTZ, ad esempio button.soggiorno_move',
    zoom_in: 'Mostra la scheda completa',
    zoom_out: 'Torna alla vista compatta',
    ed_zoom: 'Pulsante dettagli',
    motion: 'Movimento rilevato',
    st_private: 'Privato',
    cam_hidden: '{c}: nascosta',
    ed_show_motion: 'Badge di movimento',
    cf_motion: 'Sensore di movimento (badge sull\'immagine)',
    ed_layout: 'Disposizione',
    ed_layout_helper: 'Videowall: nessuna scheda attorno alla griglia, una barra di stato al posto dell\'intestazione',
    ed_layout_card: 'Scheda',
    ed_layout_wall: 'Videowall',
    ed_illustration: 'Illustrazione animata',
    ed_illustration_theme: 'Tema dell’illustrazione',
    ed_theme_auto: 'Automatico (segue il tema)',
    ed_theme_day: 'Giorno',
    ed_theme_night: 'Notte',
    open_frigate: 'Apri in Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Lettore',
    ed_player_helper: 'Automatico: lettore di Home Assistant, sottoflusso di Frigate in SD; Frigate: sempre il go2rtc di Frigate',
    ed_player_auto: 'Automatico',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Flusso SD',
    ed_sd_stream_helper: 'Flusso go2rtc di Frigate in SD; {camera} è il nome della telecamera',
    ed_instance: 'Istanza Frigate',
    ed_instance_helper: 'Client id dell\'istanza Frigate, con più server Frigate',
    ed_url: 'Indirizzo di Frigate',
    ed_url_helper: 'Aperto dal pulsante Apri in Frigate; vuoto: il pannello dell\'app Frigate',
    ed_open_in_frigate: 'Pulsante Apri in Frigate',
    ed_duplicates: 'Telecamera in Frigate e nella sua integrazione',
    ed_duplicates_helper: 'Quale elencano le telecamere trovate (interruttore privacy e pulsanti PTZ restano alla telecamera Frigate)',
    ed_duplicates_frigate: 'La telecamera Frigate',
    ed_duplicates_native: 'La telecamera nativa',
    ed_duplicates_both: 'Entrambe',
    cf_controls_from: 'Controlli da (privacy, PTZ)',
    cf_player: 'Lettore',
    ev_title: 'Eventi · {n} oggi',
    ev_title_short: 'Eventi · {n}',
    ev_heading: 'Eventi',
    ev_today: 'oggi',
    ev_none: 'Nessun evento oggi',
    ev_last: 'Ultimo: {l} · {c}, {t}',
    ev_all: 'Tutti',
    ev_group_person: 'Persona',
    ev_group_animal: 'Animale',
    ev_group_vehicle: 'Veicolo',
    ev_group_other: 'Altro',
    ev_live: 'in corso',
    ev_live_btn: 'Diretta',
    ev_no_clip: 'Nessuna clip per questo evento',
    ev_expand: 'Mostra gli eventi',
    ev_collapse: 'Nascondi gli eventi',
    detect_on: 'Rilevamento attivo: tocca per disattivarlo',
    detect_off: 'Rilevamento disattivato: tocca per attivarlo',
    rec_on: 'Registrazione attiva: tocca per disattivarla',
    rec_off: 'Registrazione disattivata: tocca per attivarla',
    obj_person: 'Persona',
    obj_car: 'Auto',
    obj_truck: 'Camion',
    obj_bus: 'Autobus',
    obj_motorcycle: 'Moto',
    obj_bicycle: 'Bicicletta',
    obj_cat: 'Gatto',
    obj_dog: 'Cane',
    obj_bird: 'Uccello',
    obj_horse: 'Cavallo',
    obj_package: 'Pacco',
    obj_face: 'Volto',
    obj_license_plate: 'Targa',
    tl_today: 'Oggi',
    tl_yesterday: 'Ieri',
    tl_prev_day: 'Giorno precedente',
    tl_next_day: 'Giorno successivo',
    tl_all_cameras: 'Tutte le telecamere',
    tl_download: 'Scarica',
    tl_empty: 'Nessun evento in questo giorno',
    tl_select: 'Scegli un evento per riprodurne la clip',
    tl_score: 'punteggio {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'Diretta · {c}',
    ed_events: 'Eventi',
    ed_events_helper: 'Gli eventi del giorno delle telecamere Frigate, sotto la griglia',
    ed_events_expanded: 'Eventi espansi',
    ed_events_limit: 'Eventi elencati',
    ed_badges: 'Pulsanti rilevamento e registrazione',
  },
  nl: {
    title: 'Camera\'s',
    live_one: '{n} camera live',
    live_many: '{n} camera\'s live',
    hidden_one: '{n} verborgen',
    hidden_many: '{n} verborgen',
    all_hidden: 'Alle camera\'s zijn verborgen',
    one_hidden: 'Camera uitgeschakeld',
    no_cameras: 'Geen camera geconfigureerd',
    hint_all: 'Tik op een badge om een camera te tonen',
    live: 'Live',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Wisselen tussen HD en SD',
    privacy_on: '{c}: verborgen, tik om te tonen',
    privacy_off: '{c}: zichtbaar, tik om te verbergen',
    privacy_unavailable: '{c}: niet beschikbaar',
    enable: 'Inschakelen',
    disable: 'Uitschakelen',
    unavailable: 'Niet beschikbaar',
    ptz: 'Pannen & kantelen',
    open: '{c} op volledig scherm tonen',
    exit_fullscreen: 'Volledig scherm afsluiten',
    details: 'Details',
    pending: 'Bijwerken…',
    sound_on: 'Geluid aan',
    sound_off: 'Geluid uit',
    move_left: 'Naar links',
    move_right: 'Naar rechts',
    move_up: 'Omhoog',
    move_down: 'Omlaag',
    ed_title: 'Titel',
    ed_title_helper: 'Leeg laten voor “Camera\'s”',
    ed_icon: 'Pictogram',
    ed_quality_entity: 'Kwaliteitskeuze',
    ed_quality_entity_helper: 'input_select met de opties HD en SD; zonder deze wordt de kwaliteit op de kaart gewisseld',
    ed_hd_option: 'HD-optie',
    ed_sd_option: 'SD-optie',
    ed_columns: 'Kolommen',
    ed_columns_wall_helper: 'Leeg: zoveel als de breedte toelaat',
    ed_aspect_ratio: 'Beeldverhouding van de tegels',
    ed_aspect_ratio_helper: 'Bijvoorbeeld 16:9 (standaard) of 4:3',
    ed_show_summary: 'Samenvatting',
    ed_show_title: 'Titel tonen',
    ed_show_badges: 'Privacybadges',
    ed_language: 'Taal',
    ed_language_helper: 'Leeg laten om de taal van Home Assistant te volgen',
    ed_cameras: 'Camera\'s',
    cf_name: 'Naam',
    cf_short_name: 'Korte naam (badge)',
    cf_camera: 'Camera (HD)',
    cf_sd: 'SD-camera',
    cf_privacy: 'Privacyschakelaar (aan = verborgen)',
    cf_power: 'Voeding (uit = verborgen)',
    cf_ptz: 'PTZ-voorvoegsel, bijvoorbeeld button.woonkamer_move',
    zoom_in: 'Volledige kaart tonen',
    zoom_out: 'Terug naar de compacte weergave',
    ed_zoom: 'Detailknop',
    motion: 'Beweging gedetecteerd',
    st_private: 'Privé',
    cam_hidden: '{c}: verborgen',
    ed_show_motion: 'Bewegingsbadge',
    cf_motion: 'Bewegingssensor (badge op het beeld)',
    ed_layout: 'Indeling',
    ed_layout_helper: 'Videowand: geen kaart rond het raster, een statusbalk in plaats van de koptekst',
    ed_layout_card: 'Kaart',
    ed_layout_wall: 'Videowand',
    ed_illustration: 'Geanimeerde illustratie',
    ed_illustration_theme: 'Thema van de illustratie',
    ed_theme_auto: 'Automatisch (volgt het thema)',
    ed_theme_day: 'Dag',
    ed_theme_night: 'Nacht',
    open_frigate: 'Openen in Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Speler',
    ed_player_helper: 'Automatisch: speler van Home Assistant, substream van Frigate voor SD; Frigate: altijd go2rtc van Frigate',
    ed_player_auto: 'Automatisch',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD-stream',
    ed_sd_stream_helper: 'go2rtc-stream van Frigate voor SD; {camera} is de cameranaam',
    ed_instance: 'Frigate-instantie',
    ed_instance_helper: 'Client-id van de Frigate-instantie, bij meerdere Frigate-servers',
    ed_url: 'Frigate-adres',
    ed_url_helper: 'Geopend door de knop Openen in Frigate; leeg: het zijbalkpaneel van de Frigate-app',
    ed_open_in_frigate: 'Knop Openen in Frigate',
    ed_duplicates: 'Camera in Frigate en in zijn eigen integratie',
    ed_duplicates_helper: 'Welke de gevonden camera\'s tonen (privacyschakelaar en PTZ-knoppen blijven bij de Frigate-camera)',
    ed_duplicates_frigate: 'De Frigate-camera',
    ed_duplicates_native: 'De eigen camera',
    ed_duplicates_both: 'Beide',
    cf_controls_from: 'Bediening van (privacy, PTZ)',
    cf_player: 'Speler',
    ev_title: 'Gebeurtenissen · {n} vandaag',
    ev_title_short: 'Gebeurtenissen · {n}',
    ev_heading: 'Gebeurtenissen',
    ev_today: 'vandaag',
    ev_none: 'Vandaag geen gebeurtenissen',
    ev_last: 'Laatste: {l} · {c}, {t}',
    ev_all: 'Alle',
    ev_group_person: 'Persoon',
    ev_group_animal: 'Dier',
    ev_group_vehicle: 'Voertuig',
    ev_group_other: 'Overig',
    ev_live: 'bezig',
    ev_live_btn: 'Live',
    ev_no_clip: 'Geen clip voor deze gebeurtenis',
    ev_expand: 'Gebeurtenissen tonen',
    ev_collapse: 'Gebeurtenissen verbergen',
    detect_on: 'Detectie aan: tik om uit te zetten',
    detect_off: 'Detectie uit: tik om aan te zetten',
    rec_on: 'Opname aan: tik om uit te zetten',
    rec_off: 'Opname uit: tik om aan te zetten',
    obj_person: 'Persoon',
    obj_car: 'Auto',
    obj_truck: 'Vrachtwagen',
    obj_bus: 'Bus',
    obj_motorcycle: 'Motor',
    obj_bicycle: 'Fiets',
    obj_cat: 'Kat',
    obj_dog: 'Hond',
    obj_bird: 'Vogel',
    obj_horse: 'Paard',
    obj_package: 'Pakket',
    obj_face: 'Gezicht',
    obj_license_plate: 'Kenteken',
    tl_today: 'Vandaag',
    tl_yesterday: 'Gisteren',
    tl_prev_day: 'Vorige dag',
    tl_next_day: 'Volgende dag',
    tl_all_cameras: 'Alle camera’s',
    tl_download: 'Downloaden',
    tl_empty: 'Geen gebeurtenissen op deze dag',
    tl_select: 'Kies een gebeurtenis om de clip af te spelen',
    tl_score: 'score {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'Live · {c}',
    ed_events: 'Gebeurtenissen',
    ed_events_helper: 'De gebeurtenissen van vandaag van de Frigate-camera’s, onder het raster',
    ed_events_expanded: 'Gebeurtenissen uitgeklapt',
    ed_events_limit: 'Getoonde gebeurtenissen',
    ed_badges: 'Knoppen voor detectie en opname',
  },
  pt: {
    title: 'Câmaras',
    live_one: '{n} câmara em direto',
    live_many: '{n} câmaras em direto',
    hidden_one: '{n} oculta',
    hidden_many: '{n} ocultas',
    all_hidden: 'Todas as câmaras estão ocultas',
    one_hidden: 'Câmara desativada',
    no_cameras: 'Nenhuma câmara configurada',
    hint_all: 'Toque num emblema para mostrar uma câmara',
    live: 'Em direto',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Alternar entre HD e SD',
    privacy_on: '{c}: oculta, toque para a mostrar',
    privacy_off: '{c}: visível, toque para a ocultar',
    privacy_unavailable: '{c}: indisponível',
    enable: 'Ativar',
    disable: 'Desativar',
    unavailable: 'Indisponível',
    ptz: 'Rotação e inclinação',
    open: 'Mostrar {c} em ecrã inteiro',
    exit_fullscreen: 'Sair do ecrã inteiro',
    details: 'Detalhes',
    pending: 'A atualizar…',
    sound_on: 'Ativar som',
    sound_off: 'Desativar som',
    move_left: 'Para a esquerda',
    move_right: 'Para a direita',
    move_up: 'Para cima',
    move_down: 'Para baixo',
    ed_title: 'Título',
    ed_title_helper: 'Deixar vazio para «Câmaras»',
    ed_icon: 'Ícone',
    ed_quality_entity: 'Seletor de qualidade',
    ed_quality_entity_helper: 'input_select com as opções HD e SD; sem ele, a qualidade é alterada no cartão',
    ed_hd_option: 'Opção HD',
    ed_sd_option: 'Opção SD',
    ed_columns: 'Colunas',
    ed_columns_wall_helper: 'Vazio: tantas quantas couberem na largura',
    ed_aspect_ratio: 'Proporção das miniaturas',
    ed_aspect_ratio_helper: 'Por exemplo 16:9 (predefinição) ou 4:3',
    ed_show_summary: 'Resumo',
    ed_show_title: 'Mostrar o título',
    ed_show_badges: 'Emblemas de privacidade',
    ed_language: 'Idioma',
    ed_language_helper: 'Deixar vazio para seguir o idioma do Home Assistant',
    ed_cameras: 'Câmaras',
    cf_name: 'Nome',
    cf_short_name: 'Nome curto (emblema)',
    cf_camera: 'Câmara (HD)',
    cf_sd: 'Câmara SD',
    cf_privacy: 'Interruptor de privacidade (ligado = oculta)',
    cf_power: 'Alimentação (desligada = oculta)',
    cf_ptz: 'Prefixo PTZ, por exemplo button.sala_move',
    zoom_in: 'Mostrar o cartão completo',
    zoom_out: 'Voltar à vista compacta',
    ed_zoom: 'Botão de detalhe',
    motion: 'Movimento detetado',
    st_private: 'Privado',
    cam_hidden: '{c}: oculta',
    ed_show_motion: 'Emblema de movimento',
    cf_motion: 'Sensor de movimento (emblema na imagem)',
    ed_layout: 'Disposição',
    ed_layout_helper: 'Videowall: sem cartão à volta da grelha, uma barra de estado em vez do cabeçalho',
    ed_layout_card: 'Cartão',
    ed_layout_wall: 'Videowall',
    ed_illustration: 'Ilustração animada',
    ed_illustration_theme: 'Tema da ilustração',
    ed_theme_auto: 'Automático (segue o tema)',
    ed_theme_day: 'Dia',
    ed_theme_night: 'Noite',
    open_frigate: 'Abrir no Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Leitor',
    ed_player_helper: 'Automático: leitor do Home Assistant, subfluxo do Frigate em SD; Frigate: sempre o go2rtc do Frigate',
    ed_player_auto: 'Automático',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Fluxo SD',
    ed_sd_stream_helper: 'Fluxo go2rtc do Frigate em SD; {camera} é o nome da câmara',
    ed_instance: 'Instância Frigate',
    ed_instance_helper: 'Client id da instância Frigate, com vários servidores Frigate',
    ed_url: 'Endereço do Frigate',
    ed_url_helper: 'Aberto pelo botão Abrir no Frigate; vazio: o painel da app Frigate',
    ed_open_in_frigate: 'Botão Abrir no Frigate',
    ed_duplicates: 'Câmara no Frigate e na sua própria integração',
    ed_duplicates_helper: 'Qual listam as câmaras encontradas (interruptor de privacidade e botões PTZ ficam na câmara Frigate)',
    ed_duplicates_frigate: 'A câmara Frigate',
    ed_duplicates_native: 'A câmara nativa',
    ed_duplicates_both: 'Ambas',
    cf_controls_from: 'Controlos de (privacidade, PTZ)',
    cf_player: 'Leitor',
    ev_title: 'Eventos · {n} hoje',
    ev_title_short: 'Eventos · {n}',
    ev_heading: 'Eventos',
    ev_today: 'hoje',
    ev_none: 'Nenhum evento hoje',
    ev_last: 'Último: {l} · {c}, {t}',
    ev_all: 'Todos',
    ev_group_person: 'Pessoa',
    ev_group_animal: 'Animal',
    ev_group_vehicle: 'Veículo',
    ev_group_other: 'Outro',
    ev_live: 'em curso',
    ev_live_btn: 'Em direto',
    ev_no_clip: 'Sem clip para este evento',
    ev_expand: 'Mostrar os eventos',
    ev_collapse: 'Ocultar os eventos',
    detect_on: 'Deteção ativa: toque para a desligar',
    detect_off: 'Deteção desligada: toque para a ativar',
    rec_on: 'Gravação ativa: toque para a desligar',
    rec_off: 'Gravação desligada: toque para a ativar',
    obj_person: 'Pessoa',
    obj_car: 'Carro',
    obj_truck: 'Camião',
    obj_bus: 'Autocarro',
    obj_motorcycle: 'Mota',
    obj_bicycle: 'Bicicleta',
    obj_cat: 'Gato',
    obj_dog: 'Cão',
    obj_bird: 'Pássaro',
    obj_horse: 'Cavalo',
    obj_package: 'Encomenda',
    obj_face: 'Rosto',
    obj_license_plate: 'Matrícula',
    tl_today: 'Hoje',
    tl_yesterday: 'Ontem',
    tl_prev_day: 'Dia anterior',
    tl_next_day: 'Dia seguinte',
    tl_all_cameras: 'Todas as câmaras',
    tl_download: 'Transferir',
    tl_empty: 'Nenhum evento neste dia',
    tl_select: 'Escolha um evento para reproduzir o clip',
    tl_score: 'pontuação {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'Em direto · {c}',
    ed_events: 'Eventos',
    ed_events_helper: 'Os eventos do dia das câmaras Frigate, por baixo da grelha',
    ed_events_expanded: 'Eventos expandidos',
    ed_events_limit: 'Eventos listados',
    ed_badges: 'Botões de deteção e gravação',
  },
  pl: {
    title: 'Kamery',
    live_one: '{n} kamera na żywo',
    live_many: 'Kamery na żywo: {n}',
    hidden_one: '{n} ukryta',
    hidden_many: 'Ukryte: {n}',
    all_hidden: 'Wszystkie kamery są ukryte',
    one_hidden: 'Kamera wyłączona',
    no_cameras: 'Nie skonfigurowano żadnej kamery',
    hint_all: 'Dotknij plakietki, aby pokazać kamerę',
    live: 'Na żywo',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Przełącz między HD a SD',
    privacy_on: '{c}: ukryta, dotknij, aby pokazać',
    privacy_off: '{c}: widoczna, dotknij, aby ukryć',
    privacy_unavailable: '{c}: niedostępna',
    enable: 'Włącz',
    disable: 'Wyłącz',
    unavailable: 'Niedostępna',
    ptz: 'Obrót i pochylenie',
    open: 'Pokaż {c} na pełnym ekranie',
    exit_fullscreen: 'Zamknij pełny ekran',
    details: 'Szczegóły',
    pending: 'Aktualizowanie…',
    sound_on: 'Włącz dźwięk',
    sound_off: 'Wycisz',
    move_left: 'W lewo',
    move_right: 'W prawo',
    move_up: 'W górę',
    move_down: 'W dół',
    ed_title: 'Tytuł',
    ed_title_helper: 'Pozostaw puste, aby użyć „Kamery”',
    ed_icon: 'Ikona',
    ed_quality_entity: 'Wybór jakości',
    ed_quality_entity_helper: 'input_select z opcjami HD i SD; bez niego jakość przełącza się na karcie',
    ed_hd_option: 'Opcja HD',
    ed_sd_option: 'Opcja SD',
    ed_columns: 'Kolumny',
    ed_columns_wall_helper: 'Puste: tyle, ile zmieści szerokość',
    ed_aspect_ratio: 'Proporcje kafelków',
    ed_aspect_ratio_helper: 'Na przykład 16:9 (domyślnie) lub 4:3',
    ed_show_summary: 'Podsumowanie',
    ed_show_title: 'Pokaż tytuł',
    ed_show_badges: 'Plakietki prywatności',
    ed_language: 'Język',
    ed_language_helper: 'Pozostaw puste, aby używać języka Home Assistanta',
    ed_cameras: 'Kamery',
    cf_name: 'Nazwa',
    cf_short_name: 'Krótka nazwa (plakietka)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'Kamera SD',
    cf_privacy: 'Przełącznik prywatności (włączony = ukryta)',
    cf_power: 'Zasilanie (wyłączone = ukryta)',
    cf_ptz: 'Prefiks PTZ, na przykład button.salon_move',
    zoom_in: 'Pokaż pełną kartę',
    zoom_out: 'Wróć do widoku kompaktowego',
    ed_zoom: 'Przycisk szczegółów',
    motion: 'Wykryto ruch',
    st_private: 'Prywatne',
    cam_hidden: '{c}: ukryta',
    ed_show_motion: 'Plakietka ruchu',
    cf_motion: 'Czujnik ruchu (plakietka na obrazie)',
    ed_layout: 'Układ',
    ed_layout_helper: 'Ściana wideo: bez karty wokół siatki, pasek stanu zamiast nagłówka',
    ed_layout_card: 'Karta',
    ed_layout_wall: 'Ściana wideo',
    ed_illustration: 'Animowana ilustracja',
    ed_illustration_theme: 'Motyw ilustracji',
    ed_theme_auto: 'Automatycznie (według motywu)',
    ed_theme_day: 'Dzień',
    ed_theme_night: 'Noc',
    open_frigate: 'Otwórz we Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Odtwarzacz',
    ed_player_helper: 'Automatycznie: odtwarzacz Home Assistant, podstrumień Frigate dla SD; Frigate: zawsze go2rtc Frigate',
    ed_player_auto: 'Automatycznie',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Strumień SD',
    ed_sd_stream_helper: 'Strumień go2rtc Frigate dla SD; {camera} to nazwa kamery',
    ed_instance: 'Instancja Frigate',
    ed_instance_helper: 'Client id instancji Frigate, przy kilku serwerach Frigate',
    ed_url: 'Adres Frigate',
    ed_url_helper: 'Otwierany przyciskiem Otwórz we Frigate; pusty: panel aplikacji Frigate',
    ed_open_in_frigate: 'Przycisk Otwórz we Frigate',
    ed_duplicates: 'Kamera we Frigate i we własnej integracji',
    ed_duplicates_helper: 'Którą pokazują znalezione kamery (przełącznik prywatności i przyciski PTZ zostają przy kamerze Frigate)',
    ed_duplicates_frigate: 'Kamera Frigate',
    ed_duplicates_native: 'Kamera natywna',
    ed_duplicates_both: 'Obie',
    cf_controls_from: 'Sterowanie z (prywatność, PTZ)',
    cf_player: 'Odtwarzacz',
    ev_title: 'Zdarzenia · {n} dziś',
    ev_title_short: 'Zdarzenia · {n}',
    ev_heading: 'Zdarzenia',
    ev_today: 'dziś',
    ev_none: 'Brak zdarzeń dzisiaj',
    ev_last: 'Ostatnie: {l} · {c}, {t}',
    ev_all: 'Wszystkie',
    ev_group_person: 'Osoba',
    ev_group_animal: 'Zwierzę',
    ev_group_vehicle: 'Pojazd',
    ev_group_other: 'Inne',
    ev_live: 'w toku',
    ev_live_btn: 'Na żywo',
    ev_no_clip: 'Brak klipu dla tego zdarzenia',
    ev_expand: 'Pokaż zdarzenia',
    ev_collapse: 'Ukryj zdarzenia',
    detect_on: 'Wykrywanie włączone: dotknij, aby wyłączyć',
    detect_off: 'Wykrywanie wyłączone: dotknij, aby włączyć',
    rec_on: 'Nagrywanie włączone: dotknij, aby wyłączyć',
    rec_off: 'Nagrywanie wyłączone: dotknij, aby włączyć',
    obj_person: 'Osoba',
    obj_car: 'Samochód',
    obj_truck: 'Ciężarówka',
    obj_bus: 'Autobus',
    obj_motorcycle: 'Motocykl',
    obj_bicycle: 'Rower',
    obj_cat: 'Kot',
    obj_dog: 'Pies',
    obj_bird: 'Ptak',
    obj_horse: 'Koń',
    obj_package: 'Paczka',
    obj_face: 'Twarz',
    obj_license_plate: 'Tablica rejestracyjna',
    tl_today: 'Dziś',
    tl_yesterday: 'Wczoraj',
    tl_prev_day: 'Poprzedni dzień',
    tl_next_day: 'Następny dzień',
    tl_all_cameras: 'Wszystkie kamery',
    tl_download: 'Pobierz',
    tl_empty: 'Brak zdarzeń tego dnia',
    tl_select: 'Wybierz zdarzenie, aby odtworzyć klip',
    tl_score: 'wynik {s}',
    tl_clip: 'Klip',
    tl_live_badge: 'Na żywo · {c}',
    ed_events: 'Zdarzenia',
    ed_events_helper: 'Dzisiejsze zdarzenia kamer Frigate, pod siatką',
    ed_events_expanded: 'Zdarzenia rozwinięte',
    ed_events_limit: 'Wyświetlane zdarzenia',
    ed_badges: 'Przyciski wykrywania i nagrywania',
  },
  ro: {
    title: 'Camere',
    live_one: '{n} cameră în direct',
    live_many: 'Camere în direct: {n}',
    hidden_one: '{n} ascunsă',
    hidden_many: 'Ascunse: {n}',
    all_hidden: 'Toate camerele sunt ascunse',
    one_hidden: 'Cameră dezactivată',
    no_cameras: 'Nicio cameră configurată',
    hint_all: 'Atingeți o insignă pentru a afișa o cameră',
    live: 'În direct',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Comutați între HD și SD',
    privacy_on: '{c}: ascunsă, atingeți pentru a o afișa',
    privacy_off: '{c}: vizibilă, atingeți pentru a o ascunde',
    privacy_unavailable: '{c}: indisponibilă',
    enable: 'Activează',
    disable: 'Dezactivează',
    unavailable: 'Indisponibilă',
    ptz: 'Rotire și înclinare',
    open: 'Afișează {c} pe tot ecranul',
    exit_fullscreen: 'Ieși din modul ecran complet',
    details: 'Detalii',
    pending: 'Se actualizează…',
    sound_on: 'Activează sunetul',
    sound_off: 'Dezactivează sunetul',
    move_left: 'Stânga',
    move_right: 'Dreapta',
    move_up: 'Sus',
    move_down: 'Jos',
    ed_title: 'Titlu',
    ed_title_helper: 'Lăsați gol pentru „Camere”',
    ed_icon: 'Pictogramă',
    ed_quality_entity: 'Selector de calitate',
    ed_quality_entity_helper: 'input_select cu opțiunile HD și SD; fără el, calitatea se comută pe card',
    ed_hd_option: 'Opțiunea HD',
    ed_sd_option: 'Opțiunea SD',
    ed_columns: 'Coloane',
    ed_columns_wall_helper: 'Gol: câte încap pe lățime',
    ed_aspect_ratio: 'Raportul de aspect al plăcilor',
    ed_aspect_ratio_helper: 'De exemplu 16:9 (implicit) sau 4:3',
    ed_show_summary: 'Rezumat',
    ed_show_title: 'Afișează titlul',
    ed_show_badges: 'Insigne de confidențialitate',
    ed_language: 'Limbă',
    ed_language_helper: 'Lăsați gol pentru a urma limba Home Assistant',
    ed_cameras: 'Camere',
    cf_name: 'Nume',
    cf_short_name: 'Nume scurt (insignă)',
    cf_camera: 'Cameră (HD)',
    cf_sd: 'Cameră SD',
    cf_privacy: 'Comutator de confidențialitate (pornit = ascunsă)',
    cf_power: 'Alimentare (oprită = ascunsă)',
    cf_ptz: 'Prefix PTZ, de exemplu button.sufragerie_move',
    zoom_in: 'Afișează cardul complet',
    zoom_out: 'Înapoi la vizualizarea compactă',
    ed_zoom: 'Buton de detalii',
    motion: 'Mișcare detectată',
    st_private: 'Privat',
    cam_hidden: '{c}: ascunsă',
    ed_show_motion: 'Insignă de mișcare',
    cf_motion: 'Senzor de mișcare (insignă pe imagine)',
    ed_layout: 'Aranjament',
    ed_layout_helper: 'Perete video: fără card în jurul grilei, o bară de stare în locul antetului',
    ed_layout_card: 'Card',
    ed_layout_wall: 'Perete video',
    ed_illustration: 'Ilustrație animată',
    ed_illustration_theme: 'Tema ilustrației',
    ed_theme_auto: 'Automat (urmează tema)',
    ed_theme_day: 'Zi',
    ed_theme_night: 'Noapte',
    open_frigate: 'Deschide în Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Player',
    ed_player_helper: 'Automat: playerul Home Assistant, subfluxul Frigate pentru SD; Frigate: mereu go2rtc din Frigate',
    ed_player_auto: 'Automat',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Flux SD',
    ed_sd_stream_helper: 'Flux go2rtc din Frigate pentru SD; {camera} este numele camerei',
    ed_instance: 'Instanță Frigate',
    ed_instance_helper: 'Client id al instanței Frigate, cu mai multe servere Frigate',
    ed_url: 'Adresa Frigate',
    ed_url_helper: 'Deschisă de butonul Deschide în Frigate; gol: panoul aplicației Frigate',
    ed_open_in_frigate: 'Butonul Deschide în Frigate',
    ed_duplicates: 'Cameră în Frigate și în propria integrare',
    ed_duplicates_helper: 'Pe care o listează camerele găsite (comutatorul de confidențialitate și butoanele PTZ rămân la camera Frigate)',
    ed_duplicates_frigate: 'Camera Frigate',
    ed_duplicates_native: 'Camera nativă',
    ed_duplicates_both: 'Ambele',
    cf_controls_from: 'Comenzi de la (confidențialitate, PTZ)',
    cf_player: 'Player',
    ev_title: 'Evenimente · {n} azi',
    ev_title_short: 'Evenimente · {n}',
    ev_heading: 'Evenimente',
    ev_today: 'azi',
    ev_none: 'Niciun eveniment azi',
    ev_last: 'Ultimul: {l} · {c}, {t}',
    ev_all: 'Toate',
    ev_group_person: 'Persoană',
    ev_group_animal: 'Animal',
    ev_group_vehicle: 'Vehicul',
    ev_group_other: 'Altele',
    ev_live: 'în curs',
    ev_live_btn: 'În direct',
    ev_no_clip: 'Niciun clip pentru acest eveniment',
    ev_expand: 'Afișează evenimentele',
    ev_collapse: 'Ascunde evenimentele',
    detect_on: 'Detecție pornită: atingeți pentru a o opri',
    detect_off: 'Detecție oprită: atingeți pentru a o porni',
    rec_on: 'Înregistrare pornită: atingeți pentru a o opri',
    rec_off: 'Înregistrare oprită: atingeți pentru a o porni',
    obj_person: 'Persoană',
    obj_car: 'Mașină',
    obj_truck: 'Camion',
    obj_bus: 'Autobuz',
    obj_motorcycle: 'Motocicletă',
    obj_bicycle: 'Bicicletă',
    obj_cat: 'Pisică',
    obj_dog: 'Câine',
    obj_bird: 'Pasăre',
    obj_horse: 'Cal',
    obj_package: 'Colet',
    obj_face: 'Față',
    obj_license_plate: 'Număr de înmatriculare',
    tl_today: 'Azi',
    tl_yesterday: 'Ieri',
    tl_prev_day: 'Ziua anterioară',
    tl_next_day: 'Ziua următoare',
    tl_all_cameras: 'Toate camerele',
    tl_download: 'Descarcă',
    tl_empty: 'Niciun eveniment în această zi',
    tl_select: 'Alegeți un eveniment pentru a reda clipul',
    tl_score: 'scor {s}',
    tl_clip: 'Clip',
    tl_live_badge: 'În direct · {c}',
    ed_events: 'Evenimente',
    ed_events_helper: 'Evenimentele zilei ale camerelor Frigate, sub grilă',
    ed_events_expanded: 'Evenimente desfășurate',
    ed_events_limit: 'Evenimente afișate',
    ed_badges: 'Butoane de detecție și înregistrare',
  },
  da: {
    title: 'Kameraer',
    live_one: '{n} kamera live',
    live_many: '{n} kameraer live',
    hidden_one: '{n} skjult',
    hidden_many: '{n} skjulte',
    all_hidden: 'Alle kameraer er skjult',
    one_hidden: 'Kamera deaktiveret',
    no_cameras: 'Intet kamera konfigureret',
    hint_all: 'Tryk på et badge for at vise et kamera',
    live: 'Live',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Skift mellem HD og SD',
    privacy_on: '{c}: skjult, tryk for at vise det',
    privacy_off: '{c}: synligt, tryk for at skjule det',
    privacy_unavailable: '{c}: utilgængeligt',
    enable: 'Aktivér',
    disable: 'Deaktivér',
    unavailable: 'Utilgængelig',
    ptz: 'Panorering og vipning',
    open: 'Vis {c} i fuld skærm',
    exit_fullscreen: 'Afslut fuld skærm',
    details: 'Detaljer',
    pending: 'Opdaterer…',
    sound_on: 'Slå lyd til',
    sound_off: 'Slå lyd fra',
    move_left: 'Venstre',
    move_right: 'Højre',
    move_up: 'Op',
    move_down: 'Ned',
    ed_title: 'Titel',
    ed_title_helper: 'Lad stå tomt for »Kameraer«',
    ed_icon: 'Ikon',
    ed_quality_entity: 'Kvalitetsvælger',
    ed_quality_entity_helper: 'input_select med valgmulighederne HD og SD; uden den skiftes kvaliteten på kortet',
    ed_hd_option: 'HD-valgmulighed',
    ed_sd_option: 'SD-valgmulighed',
    ed_columns: 'Kolonner',
    ed_columns_wall_helper: 'Tom: så mange som bredden giver plads til',
    ed_aspect_ratio: 'Billedformat for felterne',
    ed_aspect_ratio_helper: 'For eksempel 16:9 (standard) eller 4:3',
    ed_show_summary: 'Oversigt',
    ed_show_title: 'Vis titel',
    ed_show_badges: 'Privatlivsbadges',
    ed_language: 'Sprog',
    ed_language_helper: 'Lad stå tomt for at følge sproget i Home Assistant',
    ed_cameras: 'Kameraer',
    cf_name: 'Navn',
    cf_short_name: 'Kort navn (badge)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'SD-kamera',
    cf_privacy: 'Privatlivskontakt (til = skjult)',
    cf_power: 'Strøm (fra = skjult)',
    cf_ptz: 'PTZ-præfiks, for eksempel button.stue_move',
    zoom_in: 'Vis hele kortet',
    zoom_out: 'Tilbage til kompakt visning',
    ed_zoom: 'Detaljeknap',
    motion: 'Bevægelse registreret',
    st_private: 'Privat',
    cam_hidden: '{c}: skjult',
    ed_show_motion: 'Bevægelsesbadge',
    cf_motion: 'Bevægelsessensor (badge på billedet)',
    ed_layout: 'Layout',
    ed_layout_helper: 'Videovæg: intet kort om gitteret, en statuslinje i stedet for overskriften',
    ed_layout_card: 'Kort',
    ed_layout_wall: 'Videovæg',
    ed_illustration: 'Animeret illustration',
    ed_illustration_theme: 'Illustrationens tema',
    ed_theme_auto: 'Automatisk (følger temaet)',
    ed_theme_day: 'Dag',
    ed_theme_night: 'Nat',
    open_frigate: 'Åbn i Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Afspiller',
    ed_player_helper: 'Automatisk: Home Assistants afspiller, Frigates understream til SD; Frigate: altid Frigates go2rtc',
    ed_player_auto: 'Automatisk',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD-stream',
    ed_sd_stream_helper: 'Frigates go2rtc-stream til SD; {camera} er kameraets navn',
    ed_instance: 'Frigate-instans',
    ed_instance_helper: 'Client id for Frigate-instansen, med flere Frigate-servere',
    ed_url: 'Frigate-adresse',
    ed_url_helper: 'Åbnes af knappen Åbn i Frigate; tom: Frigate-appens sidepanel',
    ed_open_in_frigate: 'Knappen Åbn i Frigate',
    ed_duplicates: 'Kamera i Frigate og i sin egen integration',
    ed_duplicates_helper: 'Hvilket de fundne kameraer viser (privatlivskontakt og PTZ-knapper bliver hos Frigate-kameraet)',
    ed_duplicates_frigate: 'Frigate-kameraet',
    ed_duplicates_native: 'Det oprindelige kamera',
    ed_duplicates_both: 'Begge',
    cf_controls_from: 'Styring fra (privatliv, PTZ)',
    cf_player: 'Afspiller',
    ev_title: 'Hændelser · {n} i dag',
    ev_title_short: 'Hændelser · {n}',
    ev_heading: 'Hændelser',
    ev_today: 'i dag',
    ev_none: 'Ingen hændelser i dag',
    ev_last: 'Seneste: {l} · {c}, {t}',
    ev_all: 'Alle',
    ev_group_person: 'Person',
    ev_group_animal: 'Dyr',
    ev_group_vehicle: 'Køretøj',
    ev_group_other: 'Andet',
    ev_live: 'i gang',
    ev_live_btn: 'Live',
    ev_no_clip: 'Intet klip til denne hændelse',
    ev_expand: 'Vis hændelserne',
    ev_collapse: 'Skjul hændelserne',
    detect_on: 'Registrering til: tryk for at slå fra',
    detect_off: 'Registrering fra: tryk for at slå til',
    rec_on: 'Optagelse til: tryk for at slå fra',
    rec_off: 'Optagelse fra: tryk for at slå til',
    obj_person: 'Person',
    obj_car: 'Bil',
    obj_truck: 'Lastbil',
    obj_bus: 'Bus',
    obj_motorcycle: 'Motorcykel',
    obj_bicycle: 'Cykel',
    obj_cat: 'Kat',
    obj_dog: 'Hund',
    obj_bird: 'Fugl',
    obj_horse: 'Hest',
    obj_package: 'Pakke',
    obj_face: 'Ansigt',
    obj_license_plate: 'Nummerplade',
    tl_today: 'I dag',
    tl_yesterday: 'I går',
    tl_prev_day: 'Forrige dag',
    tl_next_day: 'Næste dag',
    tl_all_cameras: 'Alle kameraer',
    tl_download: 'Download',
    tl_empty: 'Ingen hændelser denne dag',
    tl_select: 'Vælg en hændelse for at afspille dens klip',
    tl_score: 'score {s}',
    tl_clip: 'Klip',
    tl_live_badge: 'Live · {c}',
    ed_events: 'Hændelser',
    ed_events_helper: 'Dagens hændelser fra Frigate-kameraerne, under gitteret',
    ed_events_expanded: 'Hændelser foldet ud',
    ed_events_limit: 'Viste hændelser',
    ed_badges: 'Knapper til registrering og optagelse',
  },
  sv: {
    title: 'Kameror',
    live_one: '{n} kamera live',
    live_many: '{n} kameror live',
    hidden_one: '{n} dold',
    hidden_many: '{n} dolda',
    all_hidden: 'Alla kameror är dolda',
    one_hidden: 'Kamera inaktiverad',
    no_cameras: 'Ingen kamera konfigurerad',
    hint_all: 'Tryck på en bricka för att visa en kamera',
    live: 'Live',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Växla mellan HD och SD',
    privacy_on: '{c}: dold, tryck för att visa den',
    privacy_off: '{c}: synlig, tryck för att dölja den',
    privacy_unavailable: '{c}: inte tillgänglig',
    enable: 'Aktivera',
    disable: 'Inaktivera',
    unavailable: 'Inte tillgänglig',
    ptz: 'Panorering och lutning',
    open: 'Visa {c} i helskärm',
    exit_fullscreen: 'Avsluta helskärm',
    details: 'Detaljer',
    pending: 'Uppdaterar…',
    sound_on: 'Slå på ljud',
    sound_off: 'Stäng av ljud',
    move_left: 'Vänster',
    move_right: 'Höger',
    move_up: 'Upp',
    move_down: 'Ner',
    ed_title: 'Titel',
    ed_title_helper: 'Lämna tomt för ”Kameror”',
    ed_icon: 'Ikon',
    ed_quality_entity: 'Kvalitetsväljare',
    ed_quality_entity_helper: 'input_select med alternativen HD och SD; utan den byts kvaliteten på kortet',
    ed_hd_option: 'HD-alternativ',
    ed_sd_option: 'SD-alternativ',
    ed_columns: 'Kolumner',
    ed_columns_wall_helper: 'Tomt: så många som får plats på bredden',
    ed_aspect_ratio: 'Bildformat för rutorna',
    ed_aspect_ratio_helper: 'Till exempel 16:9 (standard) eller 4:3',
    ed_show_summary: 'Sammanfattning',
    ed_show_title: 'Visa rubrik',
    ed_show_badges: 'Integritetsbrickor',
    ed_language: 'Språk',
    ed_language_helper: 'Lämna tomt för att följa språket i Home Assistant',
    ed_cameras: 'Kameror',
    cf_name: 'Namn',
    cf_short_name: 'Kort namn (bricka)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'SD-kamera',
    cf_privacy: 'Integritetsbrytare (på = dold)',
    cf_power: 'Ström (av = dold)',
    cf_ptz: 'PTZ-prefix, till exempel button.vardagsrum_move',
    zoom_in: 'Visa hela kortet',
    zoom_out: 'Tillbaka till kompakt vy',
    ed_zoom: 'Detaljknapp',
    motion: 'Rörelse upptäckt',
    st_private: 'Privat',
    cam_hidden: '{c}: dold',
    ed_show_motion: 'Rörelsebricka',
    cf_motion: 'Rörelsesensor (bricka på bilden)',
    ed_layout: 'Layout',
    ed_layout_helper: 'Videovägg: inget kort runt rutnätet, en statusrad i stället för rubriken',
    ed_layout_card: 'Kort',
    ed_layout_wall: 'Videovägg',
    ed_illustration: 'Animerad illustration',
    ed_illustration_theme: 'Illustrationens tema',
    ed_theme_auto: 'Automatiskt (följer temat)',
    ed_theme_day: 'Dag',
    ed_theme_night: 'Natt',
    open_frigate: 'Öppna i Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Spelare',
    ed_player_helper: 'Automatisk: Home Assistants spelare, Frigates underström för SD; Frigate: alltid Frigates go2rtc',
    ed_player_auto: 'Automatisk',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD-ström',
    ed_sd_stream_helper: 'Frigates go2rtc-ström för SD; {camera} är kamerans namn',
    ed_instance: 'Frigate-instans',
    ed_instance_helper: 'Client id för Frigate-instansen, med flera Frigate-servrar',
    ed_url: 'Frigate-adress',
    ed_url_helper: 'Öppnas av knappen Öppna i Frigate; tom: Frigate-appens sidopanel',
    ed_open_in_frigate: 'Knappen Öppna i Frigate',
    ed_duplicates: 'Kamera i Frigate och i sin egen integration',
    ed_duplicates_helper: 'Vilken de hittade kamerorna listar (integritetsbrytare och PTZ-knappar stannar hos Frigate-kameran)',
    ed_duplicates_frigate: 'Frigate-kameran',
    ed_duplicates_native: 'Den egna kameran',
    ed_duplicates_both: 'Båda',
    cf_controls_from: 'Styrning från (integritet, PTZ)',
    cf_player: 'Spelare',
    ev_title: 'Händelser · {n} i dag',
    ev_title_short: 'Händelser · {n}',
    ev_heading: 'Händelser',
    ev_today: 'i dag',
    ev_none: 'Inga händelser i dag',
    ev_last: 'Senaste: {l} · {c}, {t}',
    ev_all: 'Alla',
    ev_group_person: 'Person',
    ev_group_animal: 'Djur',
    ev_group_vehicle: 'Fordon',
    ev_group_other: 'Övrigt',
    ev_live: 'pågår',
    ev_live_btn: 'Live',
    ev_no_clip: 'Inget klipp för den här händelsen',
    ev_expand: 'Visa händelserna',
    ev_collapse: 'Dölj händelserna',
    detect_on: 'Detektering på: tryck för att stänga av',
    detect_off: 'Detektering av: tryck för att slå på',
    rec_on: 'Inspelning på: tryck för att stänga av',
    rec_off: 'Inspelning av: tryck för att slå på',
    obj_person: 'Person',
    obj_car: 'Bil',
    obj_truck: 'Lastbil',
    obj_bus: 'Buss',
    obj_motorcycle: 'Motorcykel',
    obj_bicycle: 'Cykel',
    obj_cat: 'Katt',
    obj_dog: 'Hund',
    obj_bird: 'Fågel',
    obj_horse: 'Häst',
    obj_package: 'Paket',
    obj_face: 'Ansikte',
    obj_license_plate: 'Registreringsskylt',
    tl_today: 'I dag',
    tl_yesterday: 'I går',
    tl_prev_day: 'Föregående dag',
    tl_next_day: 'Nästa dag',
    tl_all_cameras: 'Alla kameror',
    tl_download: 'Ladda ner',
    tl_empty: 'Inga händelser den här dagen',
    tl_select: 'Välj en händelse för att spela upp dess klipp',
    tl_score: 'poäng {s}',
    tl_clip: 'Klipp',
    tl_live_badge: 'Live · {c}',
    ed_events: 'Händelser',
    ed_events_helper: 'Dagens händelser från Frigate-kamerorna, under rutnätet',
    ed_events_expanded: 'Händelser utfällda',
    ed_events_limit: 'Visade händelser',
    ed_badges: 'Knappar för detektering och inspelning',
  },
  bg: {
    title: 'Камери',
    live_one: '{n} камера на живо',
    live_many: '{n} камери на живо',
    hidden_one: '{n} скрита',
    hidden_many: '{n} скрити',
    all_hidden: 'Всички камери са скрити',
    one_hidden: 'Камера изключена',
    no_cameras: 'Няма настроени камери',
    hint_all: 'Докоснете значка, за да покажете камера',
    live: 'На живо',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Превключване между HD и SD',
    privacy_on: '{c}: скрита, докоснете, за да я покажете',
    privacy_off: '{c}: видима, докоснете, за да я скриете',
    privacy_unavailable: '{c}: недостъпна',
    enable: 'Активиране',
    disable: 'Деактивиране',
    unavailable: 'Недостъпна',
    ptz: 'Завъртане и накланяне',
    open: 'Показване на {c} на цял екран',
    exit_fullscreen: 'Изход от цял екран',
    details: 'Подробности',
    pending: 'Актуализиране…',
    sound_on: 'Включване на звука',
    sound_off: 'Изключване на звука',
    move_left: 'Наляво',
    move_right: 'Надясно',
    move_up: 'Нагоре',
    move_down: 'Надолу',
    ed_title: 'Заглавие',
    ed_title_helper: 'Оставете празно за „Камери“',
    ed_icon: 'Икона',
    ed_quality_entity: 'Избор на качество',
    ed_quality_entity_helper: 'input_select с опции HD и SD; без него качеството се превключва от картата',
    ed_hd_option: 'Опция HD',
    ed_sd_option: 'Опция SD',
    ed_columns: 'Колони',
    ed_columns_wall_helper: 'Празно: колкото се събират по ширина',
    ed_aspect_ratio: 'Съотношение на плочките',
    ed_aspect_ratio_helper: 'Например 16:9 (по подразбиране) или 4:3',
    ed_show_summary: 'Обобщение',
    ed_show_title: 'Показване на заглавието',
    ed_show_badges: 'Значки за поверителност',
    ed_language: 'Език',
    ed_language_helper: 'Оставете празно, за да се използва езикът на Home Assistant',
    ed_cameras: 'Камери',
    cf_name: 'Име',
    cf_short_name: 'Кратко име (значка)',
    cf_camera: 'Камера (HD)',
    cf_sd: 'SD камера',
    cf_privacy: 'Превключвател за поверителност (включен = скрита)',
    cf_power: 'Захранване (изключено = скрита)',
    cf_ptz: 'PTZ префикс, например button.vsekidnevna_move',
    zoom_in: 'Покажи цялата карта',
    zoom_out: 'Обратно към компактния изглед',
    ed_zoom: 'Бутон за подробности',
    motion: 'Открито движение',
    st_private: 'Поверително',
    cam_hidden: '{c}: скрита',
    ed_show_motion: 'Значка за движение',
    cf_motion: 'Сензор за движение (значка върху изображението)',
    ed_layout: 'Оформление',
    ed_layout_helper: 'Видеостена: без карта около мрежата, лента за състояние вместо заглавката',
    ed_layout_card: 'Карта',
    ed_layout_wall: 'Видеостена',
    ed_illustration: 'Анимирана илюстрация',
    ed_illustration_theme: 'Тема на илюстрацията',
    ed_theme_auto: 'Автоматично (следва темата)',
    ed_theme_day: 'Ден',
    ed_theme_night: 'Нощ',
    open_frigate: 'Отвори във Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Плейър',
    ed_player_helper: 'Автоматично: плейърът на Home Assistant, подпотокът на Frigate за SD; Frigate: винаги go2rtc на Frigate',
    ed_player_auto: 'Автоматично',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD поток',
    ed_sd_stream_helper: 'go2rtc поток на Frigate за SD; {camera} е името на камерата',
    ed_instance: 'Инстанция на Frigate',
    ed_instance_helper: 'Client id на инстанцията на Frigate, при няколко сървъра Frigate',
    ed_url: 'Адрес на Frigate',
    ed_url_helper: 'Отваря се от бутона Отвори във Frigate; празно: панелът на приложението Frigate',
    ed_open_in_frigate: 'Бутон Отвори във Frigate',
    ed_duplicates: 'Камера във Frigate и в собствената ѝ интеграция',
    ed_duplicates_helper: 'Коя показват намерените камери (превключвателят за поверителност и бутоните PTZ остават при камерата на Frigate)',
    ed_duplicates_frigate: 'Камерата на Frigate',
    ed_duplicates_native: 'Собствената камера',
    ed_duplicates_both: 'И двете',
    cf_controls_from: 'Управление от (поверителност, PTZ)',
    cf_player: 'Плейър',
    ev_title: 'Събития · {n} днес',
    ev_title_short: 'Събития · {n}',
    ev_heading: 'Събития',
    ev_today: 'днес',
    ev_none: 'Няма събития днес',
    ev_last: 'Последно: {l} · {c}, {t}',
    ev_all: 'Всички',
    ev_group_person: 'Човек',
    ev_group_animal: 'Животно',
    ev_group_vehicle: 'Превозно средство',
    ev_group_other: 'Друго',
    ev_live: 'в ход',
    ev_live_btn: 'На живо',
    ev_no_clip: 'Няма клип за това събитие',
    ev_expand: 'Покажи събитията',
    ev_collapse: 'Скрий събитията',
    detect_on: 'Разпознаването е включено: докоснете, за да го изключите',
    detect_off: 'Разпознаването е изключено: докоснете, за да го включите',
    rec_on: 'Записът е включен: докоснете, за да го изключите',
    rec_off: 'Записът е изключен: докоснете, за да го включите',
    obj_person: 'Човек',
    obj_car: 'Кола',
    obj_truck: 'Камион',
    obj_bus: 'Автобус',
    obj_motorcycle: 'Мотор',
    obj_bicycle: 'Велосипед',
    obj_cat: 'Котка',
    obj_dog: 'Куче',
    obj_bird: 'Птица',
    obj_horse: 'Кон',
    obj_package: 'Пратка',
    obj_face: 'Лице',
    obj_license_plate: 'Регистрационен номер',
    tl_today: 'Днес',
    tl_yesterday: 'Вчера',
    tl_prev_day: 'Предишен ден',
    tl_next_day: 'Следващ ден',
    tl_all_cameras: 'Всички камери',
    tl_download: 'Изтегли',
    tl_empty: 'Няма събития в този ден',
    tl_select: 'Изберете събитие, за да пуснете клипа му',
    tl_score: 'резултат {s}',
    tl_clip: 'Клип',
    tl_live_badge: 'На живо · {c}',
    ed_events: 'Събития',
    ed_events_helper: 'Днешните събития на камерите Frigate, под мрежата',
    ed_events_expanded: 'Разгънати събития',
    ed_events_limit: 'Показани събития',
    ed_badges: 'Бутони за разпознаване и запис',
  },
  ru: {
    title: 'Камеры',
    live_one: '{n} камера в эфире',
    live_many: 'Камеры в эфире: {n}',
    hidden_one: '{n} скрыта',
    hidden_many: 'Скрыты: {n}',
    all_hidden: 'Все камеры скрыты',
    one_hidden: 'Камера отключена',
    no_cameras: 'Камеры не настроены',
    hint_all: 'Нажмите на значок, чтобы показать камеру',
    live: 'В эфире',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Переключение между HD и SD',
    privacy_on: '{c}: скрыта, нажмите, чтобы показать',
    privacy_off: '{c}: видна, нажмите, чтобы скрыть',
    privacy_unavailable: '{c}: недоступна',
    enable: 'Включить',
    disable: 'Отключить',
    unavailable: 'Недоступна',
    ptz: 'Поворот и наклон',
    open: 'Показать {c} на весь экран',
    exit_fullscreen: 'Выйти из полноэкранного режима',
    details: 'Подробнее',
    pending: 'Обновление…',
    sound_on: 'Включить звук',
    sound_off: 'Выключить звук',
    move_left: 'Влево',
    move_right: 'Вправо',
    move_up: 'Вверх',
    move_down: 'Вниз',
    ed_title: 'Заголовок',
    ed_title_helper: 'Оставьте пустым для «Камеры»',
    ed_icon: 'Значок',
    ed_quality_entity: 'Выбор качества',
    ed_quality_entity_helper: 'input_select с вариантами HD и SD; без него качество переключается на карточке',
    ed_hd_option: 'Вариант HD',
    ed_sd_option: 'Вариант SD',
    ed_columns: 'Столбцы',
    ed_columns_wall_helper: 'Пусто: сколько поместится по ширине',
    ed_aspect_ratio: 'Соотношение сторон плиток',
    ed_aspect_ratio_helper: 'Например, 16:9 (по умолчанию) или 4:3',
    ed_show_summary: 'Сводка',
    ed_show_title: 'Показывать заголовок',
    ed_show_badges: 'Значки конфиденциальности',
    ed_language: 'Язык',
    ed_language_helper: 'Оставьте пустым, чтобы использовать язык Home Assistant',
    ed_cameras: 'Камеры',
    cf_name: 'Название',
    cf_short_name: 'Краткое название (значок)',
    cf_camera: 'Камера (HD)',
    cf_sd: 'Камера SD',
    cf_privacy: 'Переключатель конфиденциальности (вкл. = скрыта)',
    cf_power: 'Питание (выкл. = скрыта)',
    cf_ptz: 'Префикс PTZ, например button.gostinaya_move',
    zoom_in: 'Показать полную карточку',
    zoom_out: 'Вернуться к компактному виду',
    ed_zoom: 'Кнопка подробностей',
    motion: 'Обнаружено движение',
    st_private: 'Приватно',
    cam_hidden: '{c}: скрыта',
    ed_show_motion: 'Значок движения',
    cf_motion: 'Датчик движения (значок на изображении)',
    ed_layout: 'Макет',
    ed_layout_helper: 'Видеостена: без карточки вокруг сетки, строка состояния вместо заголовка',
    ed_layout_card: 'Карточка',
    ed_layout_wall: 'Видеостена',
    ed_illustration: 'Анимированная иллюстрация',
    ed_illustration_theme: 'Тема иллюстрации',
    ed_theme_auto: 'Автоматически (по теме)',
    ed_theme_day: 'День',
    ed_theme_night: 'Ночь',
    open_frigate: 'Открыть во Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Плеер',
    ed_player_helper: 'Автоматически: плеер Home Assistant, подпоток Frigate для SD; Frigate: всегда go2rtc Frigate',
    ed_player_auto: 'Автоматически',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Поток SD',
    ed_sd_stream_helper: 'Поток go2rtc Frigate для SD; {camera} — имя камеры',
    ed_instance: 'Экземпляр Frigate',
    ed_instance_helper: 'Client id экземпляра Frigate, при нескольких серверах Frigate',
    ed_url: 'Адрес Frigate',
    ed_url_helper: 'Открывается кнопкой «Открыть во Frigate»; пусто: панель приложения Frigate',
    ed_open_in_frigate: 'Кнопка «Открыть во Frigate»',
    ed_duplicates: 'Камера во Frigate и в своей интеграции',
    ed_duplicates_helper: 'Какую показывают найденные камеры (переключатель приватности и кнопки PTZ остаются у камеры Frigate)',
    ed_duplicates_frigate: 'Камера Frigate',
    ed_duplicates_native: 'Собственная камера',
    ed_duplicates_both: 'Обе',
    cf_controls_from: 'Управление от (приватность, PTZ)',
    cf_player: 'Плеер',
    ev_title: 'События · {n} сегодня',
    ev_title_short: 'События · {n}',
    ev_heading: 'События',
    ev_today: 'сегодня',
    ev_none: 'Сегодня событий нет',
    ev_last: 'Последнее: {l} · {c}, {t}',
    ev_all: 'Все',
    ev_group_person: 'Человек',
    ev_group_animal: 'Животное',
    ev_group_vehicle: 'Транспорт',
    ev_group_other: 'Другое',
    ev_live: 'идёт',
    ev_live_btn: 'Прямой эфир',
    ev_no_clip: 'Для этого события нет клипа',
    ev_expand: 'Показать события',
    ev_collapse: 'Скрыть события',
    detect_on: 'Обнаружение включено: нажмите, чтобы выключить',
    detect_off: 'Обнаружение выключено: нажмите, чтобы включить',
    rec_on: 'Запись включена: нажмите, чтобы выключить',
    rec_off: 'Запись выключена: нажмите, чтобы включить',
    obj_person: 'Человек',
    obj_car: 'Автомобиль',
    obj_truck: 'Грузовик',
    obj_bus: 'Автобус',
    obj_motorcycle: 'Мотоцикл',
    obj_bicycle: 'Велосипед',
    obj_cat: 'Кошка',
    obj_dog: 'Собака',
    obj_bird: 'Птица',
    obj_horse: 'Лошадь',
    obj_package: 'Посылка',
    obj_face: 'Лицо',
    obj_license_plate: 'Номерной знак',
    tl_today: 'Сегодня',
    tl_yesterday: 'Вчера',
    tl_prev_day: 'Предыдущий день',
    tl_next_day: 'Следующий день',
    tl_all_cameras: 'Все камеры',
    tl_download: 'Скачать',
    tl_empty: 'В этот день событий нет',
    tl_select: 'Выберите событие, чтобы воспроизвести клип',
    tl_score: 'оценка {s}',
    tl_clip: 'Клип',
    tl_live_badge: 'Прямой эфир · {c}',
    ed_events: 'События',
    ed_events_helper: 'События дня камер Frigate под сеткой',
    ed_events_expanded: 'События развёрнуты',
    ed_events_limit: 'Показываемые события',
    ed_badges: 'Кнопки обнаружения и записи',
  },
  uk: {
    title: 'Камери',
    live_one: '{n} камера в ефірі',
    live_many: 'Камери в ефірі: {n}',
    hidden_one: '{n} прихована',
    hidden_many: 'Приховані: {n}',
    all_hidden: 'Усі камери приховано',
    one_hidden: 'Камеру вимкнено',
    no_cameras: 'Камери не налаштовано',
    hint_all: 'Торкніться значка, щоб показати камеру',
    live: 'В ефірі',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Перемикання між HD і SD',
    privacy_on: '{c}: прихована, торкніться, щоб показати',
    privacy_off: '{c}: видима, торкніться, щоб приховати',
    privacy_unavailable: '{c}: недоступна',
    enable: 'Увімкнути',
    disable: 'Вимкнути',
    unavailable: 'Недоступна',
    ptz: 'Поворот і нахил',
    open: 'Показати {c} на весь екран',
    exit_fullscreen: 'Вийти з повноекранного режиму',
    details: 'Докладніше',
    pending: 'Оновлення…',
    sound_on: 'Увімкнути звук',
    sound_off: 'Вимкнути звук',
    move_left: 'Ліворуч',
    move_right: 'Праворуч',
    move_up: 'Вгору',
    move_down: 'Вниз',
    ed_title: 'Заголовок',
    ed_title_helper: 'Залиште порожнім для «Камери»',
    ed_icon: 'Значок',
    ed_quality_entity: 'Вибір якості',
    ed_quality_entity_helper: 'input_select з варіантами HD і SD; без нього якість перемикається на картці',
    ed_hd_option: 'Варіант HD',
    ed_sd_option: 'Варіант SD',
    ed_columns: 'Стовпці',
    ed_columns_wall_helper: 'Порожньо: скільки вміститься по ширині',
    ed_aspect_ratio: 'Співвідношення сторін плиток',
    ed_aspect_ratio_helper: 'Наприклад, 16:9 (типово) або 4:3',
    ed_show_summary: 'Зведення',
    ed_show_title: 'Показувати заголовок',
    ed_show_badges: 'Значки приватності',
    ed_language: 'Мова',
    ed_language_helper: 'Залиште порожнім, щоб використовувати мову Home Assistant',
    ed_cameras: 'Камери',
    cf_name: 'Назва',
    cf_short_name: 'Коротка назва (значок)',
    cf_camera: 'Камера (HD)',
    cf_sd: 'Камера SD',
    cf_privacy: 'Перемикач приватності (увімк. = прихована)',
    cf_power: 'Живлення (вимк. = прихована)',
    cf_ptz: 'Префікс PTZ, наприклад button.vitalnia_move',
    zoom_in: 'Показати повну картку',
    zoom_out: 'Повернутися до компактного вигляду',
    ed_zoom: 'Кнопка деталей',
    motion: 'Виявлено рух',
    st_private: 'Приватно',
    cam_hidden: '{c}: прихована',
    ed_show_motion: 'Значок руху',
    cf_motion: 'Датчик руху (значок на зображенні)',
    ed_layout: 'Макет',
    ed_layout_helper: 'Відеостіна: без картки навколо сітки, рядок стану замість заголовка',
    ed_layout_card: 'Картка',
    ed_layout_wall: 'Відеостіна',
    ed_illustration: 'Анімована ілюстрація',
    ed_illustration_theme: 'Тема ілюстрації',
    ed_theme_auto: 'Автоматично (за темою)',
    ed_theme_day: 'День',
    ed_theme_night: 'Ніч',
    open_frigate: 'Відкрити у Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Програвач',
    ed_player_helper: 'Автоматично: програвач Home Assistant, підпотік Frigate для SD; Frigate: завжди go2rtc Frigate',
    ed_player_auto: 'Автоматично',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Потік SD',
    ed_sd_stream_helper: 'Потік go2rtc Frigate для SD; {camera} — назва камери',
    ed_instance: 'Екземпляр Frigate',
    ed_instance_helper: 'Client id екземпляра Frigate, якщо серверів Frigate кілька',
    ed_url: 'Адреса Frigate',
    ed_url_helper: 'Відкривається кнопкою «Відкрити у Frigate»; порожньо: панель застосунку Frigate',
    ed_open_in_frigate: 'Кнопка «Відкрити у Frigate»',
    ed_duplicates: 'Камера у Frigate і у власній інтеграції',
    ed_duplicates_helper: 'Яку показують знайдені камери (перемикач приватності й кнопки PTZ лишаються в камери Frigate)',
    ed_duplicates_frigate: 'Камера Frigate',
    ed_duplicates_native: 'Власна камера',
    ed_duplicates_both: 'Обидві',
    cf_controls_from: 'Керування від (приватність, PTZ)',
    cf_player: 'Програвач',
    ev_title: 'Події · {n} сьогодні',
    ev_title_short: 'Події · {n}',
    ev_heading: 'Події',
    ev_today: 'сьогодні',
    ev_none: 'Сьогодні подій немає',
    ev_last: 'Остання: {l} · {c}, {t}',
    ev_all: 'Усі',
    ev_group_person: 'Людина',
    ev_group_animal: 'Тварина',
    ev_group_vehicle: 'Транспорт',
    ev_group_other: 'Інше',
    ev_live: 'триває',
    ev_live_btn: 'Наживо',
    ev_no_clip: 'Для цієї події немає кліпу',
    ev_expand: 'Показати події',
    ev_collapse: 'Сховати події',
    detect_on: 'Виявлення ввімкнено: торкніться, щоб вимкнути',
    detect_off: 'Виявлення вимкнено: торкніться, щоб увімкнути',
    rec_on: 'Запис увімкнено: торкніться, щоб вимкнути',
    rec_off: 'Запис вимкнено: торкніться, щоб увімкнути',
    obj_person: 'Людина',
    obj_car: 'Автомобіль',
    obj_truck: 'Вантажівка',
    obj_bus: 'Автобус',
    obj_motorcycle: 'Мотоцикл',
    obj_bicycle: 'Велосипед',
    obj_cat: 'Кіт',
    obj_dog: 'Собака',
    obj_bird: 'Птах',
    obj_horse: 'Кінь',
    obj_package: 'Посилка',
    obj_face: 'Обличчя',
    obj_license_plate: 'Номерний знак',
    tl_today: 'Сьогодні',
    tl_yesterday: 'Учора',
    tl_prev_day: 'Попередній день',
    tl_next_day: 'Наступний день',
    tl_all_cameras: 'Усі камери',
    tl_download: 'Завантажити',
    tl_empty: 'Цього дня подій немає',
    tl_select: 'Виберіть подію, щоб відтворити кліп',
    tl_score: 'оцінка {s}',
    tl_clip: 'Кліп',
    tl_live_badge: 'Наживо · {c}',
    ed_events: 'Події',
    ed_events_helper: 'Події дня камер Frigate під сіткою',
    ed_events_expanded: 'Події розгорнуто',
    ed_events_limit: 'Показані події',
    ed_badges: 'Кнопки виявлення й запису',
  },
  hu: {
    title: 'Kamerák',
    live_one: '{n} kamera élőben',
    live_many: '{n} kamera élőben',
    hidden_one: '{n} rejtett',
    hidden_many: '{n} rejtett',
    all_hidden: 'Minden kamera rejtve van',
    one_hidden: 'Kamera kikapcsolva',
    no_cameras: 'Nincs beállított kamera',
    hint_all: 'Koppintson egy jelvényre egy kamera megjelenítéséhez',
    live: 'Élő',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Váltás HD és SD között',
    privacy_on: '{c}: rejtett, koppintson a megjelenítéséhez',
    privacy_off: '{c}: látható, koppintson az elrejtéséhez',
    privacy_unavailable: '{c}: nem elérhető',
    enable: 'Engedélyezés',
    disable: 'Letiltás',
    unavailable: 'Nem elérhető',
    ptz: 'Forgatás és döntés',
    open: '{c} megjelenítése teljes képernyőn',
    exit_fullscreen: 'Kilépés a teljes képernyős módból',
    details: 'Részletek',
    pending: 'Frissítés…',
    sound_on: 'Hang bekapcsolása',
    sound_off: 'Némítás',
    move_left: 'Balra',
    move_right: 'Jobbra',
    move_up: 'Fel',
    move_down: 'Le',
    ed_title: 'Cím',
    ed_title_helper: 'Hagyja üresen a „Kamerák” címhez',
    ed_icon: 'Ikon',
    ed_quality_entity: 'Minőségválasztó',
    ed_quality_entity_helper: 'input_select HD és SD opciókkal; nélküle a minőség a kártyán váltható',
    ed_hd_option: 'HD opció',
    ed_sd_option: 'SD opció',
    ed_columns: 'Oszlopok',
    ed_columns_wall_helper: 'Üresen: amennyi a szélességbe belefér',
    ed_aspect_ratio: 'Csempék méretaránya',
    ed_aspect_ratio_helper: 'Például 16:9 (alapértelmezett) vagy 4:3',
    ed_show_summary: 'Összegzés',
    ed_show_title: 'Cím megjelenítése',
    ed_show_badges: 'Adatvédelmi jelvények',
    ed_language: 'Nyelv',
    ed_language_helper: 'Hagyja üresen a Home Assistant nyelvének követéséhez',
    ed_cameras: 'Kamerák',
    cf_name: 'Név',
    cf_short_name: 'Rövid név (jelvény)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'SD kamera',
    cf_privacy: 'Adatvédelmi kapcsoló (be = rejtett)',
    cf_power: 'Tápellátás (ki = rejtett)',
    cf_ptz: 'PTZ előtag, például button.nappali_move',
    zoom_in: 'Teljes kártya megjelenítése',
    zoom_out: 'Vissza a kompakt nézethez',
    ed_zoom: 'Részletek gomb',
    motion: 'Mozgás észlelve',
    st_private: 'Privát',
    cam_hidden: '{c}: rejtett',
    ed_show_motion: 'Mozgásjelvény',
    cf_motion: 'Mozgásérzékelő (jelvény a képen)',
    ed_layout: 'Elrendezés',
    ed_layout_helper: 'Videófal: nincs kártya a rács körül, állapotsor a fejléc helyett',
    ed_layout_card: 'Kártya',
    ed_layout_wall: 'Videófal',
    ed_illustration: 'Animált illusztráció',
    ed_illustration_theme: 'Az illusztráció témája',
    ed_theme_auto: 'Automatikus (a témát követi)',
    ed_theme_day: 'Nappal',
    ed_theme_night: 'Éjszaka',
    open_frigate: 'Megnyitás a Frigate-ben',
    ed_frigate: 'Frigate',
    ed_player: 'Lejátszó',
    ed_player_helper: 'Automatikus: a Home Assistant lejátszója, SD-hez a Frigate alfolyama; Frigate: mindig a Frigate go2rtc-je',
    ed_player_auto: 'Automatikus',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD folyam',
    ed_sd_stream_helper: 'A Frigate go2rtc-folyama SD-hez; {camera} a kamera neve',
    ed_instance: 'Frigate-példány',
    ed_instance_helper: 'A Frigate-példány client id-je, több Frigate-szerver esetén',
    ed_url: 'Frigate címe',
    ed_url_helper: 'A Megnyitás a Frigate-ben gomb nyitja meg; üresen: a Frigate alkalmazás panelje',
    ed_open_in_frigate: 'Megnyitás a Frigate-ben gomb',
    ed_duplicates: 'Kamera a Frigate-ben és a saját integrációjában',
    ed_duplicates_helper: 'Melyiket listázzák a talált kamerák (az adatvédelmi kapcsoló és a PTZ gombok a Frigate-kameránál maradnak)',
    ed_duplicates_frigate: 'A Frigate-kamera',
    ed_duplicates_native: 'A saját kamera',
    ed_duplicates_both: 'Mindkettő',
    cf_controls_from: 'Vezérlés innen (adatvédelem, PTZ)',
    cf_player: 'Lejátszó',
    ev_title: 'Események · {n} ma',
    ev_title_short: 'Események · {n}',
    ev_heading: 'Események',
    ev_today: 'ma',
    ev_none: 'Ma nincs esemény',
    ev_last: 'Utolsó: {l} · {c}, {t}',
    ev_all: 'Mind',
    ev_group_person: 'Személy',
    ev_group_animal: 'Állat',
    ev_group_vehicle: 'Jármű',
    ev_group_other: 'Egyéb',
    ev_live: 'folyamatban',
    ev_live_btn: 'Élő',
    ev_no_clip: 'Ehhez az eseményhez nincs klip',
    ev_expand: 'Események megjelenítése',
    ev_collapse: 'Események elrejtése',
    detect_on: 'Észlelés be: koppintson a kikapcsoláshoz',
    detect_off: 'Észlelés ki: koppintson a bekapcsoláshoz',
    rec_on: 'Felvétel be: koppintson a kikapcsoláshoz',
    rec_off: 'Felvétel ki: koppintson a bekapcsoláshoz',
    obj_person: 'Személy',
    obj_car: 'Autó',
    obj_truck: 'Teherautó',
    obj_bus: 'Busz',
    obj_motorcycle: 'Motor',
    obj_bicycle: 'Kerékpár',
    obj_cat: 'Macska',
    obj_dog: 'Kutya',
    obj_bird: 'Madár',
    obj_horse: 'Ló',
    obj_package: 'Csomag',
    obj_face: 'Arc',
    obj_license_plate: 'Rendszám',
    tl_today: 'Ma',
    tl_yesterday: 'Tegnap',
    tl_prev_day: 'Előző nap',
    tl_next_day: 'Következő nap',
    tl_all_cameras: 'Minden kamera',
    tl_download: 'Letöltés',
    tl_empty: 'Ezen a napon nincs esemény',
    tl_select: 'Válasszon egy eseményt a klip lejátszásához',
    tl_score: 'pontszám {s}',
    tl_clip: 'Klip',
    tl_live_badge: 'Élő · {c}',
    ed_events: 'Események',
    ed_events_helper: 'A Frigate-kamerák napi eseményei a rács alatt',
    ed_events_expanded: 'Események kinyitva',
    ed_events_limit: 'Megjelenített események',
    ed_badges: 'Észlelés és felvétel gombok',
  },
  sk: {
    title: 'Kamery',
    live_one: '{n} kamera naživo',
    live_many: 'Kamery naživo: {n}',
    hidden_one: '{n} skrytá',
    hidden_many: 'Skryté: {n}',
    all_hidden: 'Všetky kamery sú skryté',
    one_hidden: 'Kamera je vypnutá',
    no_cameras: 'Nie je nastavená žiadna kamera',
    hint_all: 'Ťuknutím na odznak zobrazíte kameru',
    live: 'Naživo',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Prepnúť medzi HD a SD',
    privacy_on: '{c}: skrytá, ťuknutím zobrazíte',
    privacy_off: '{c}: viditeľná, ťuknutím skryjete',
    privacy_unavailable: '{c}: nedostupná',
    enable: 'Zapnúť',
    disable: 'Vypnúť',
    unavailable: 'Nedostupná',
    ptz: 'Otáčanie a náklon',
    open: 'Zobraziť {c} na celú obrazovku',
    exit_fullscreen: 'Ukončiť režim celej obrazovky',
    details: 'Podrobnosti',
    pending: 'Aktualizuje sa…',
    sound_on: 'Zapnúť zvuk',
    sound_off: 'Stlmiť',
    move_left: 'Doľava',
    move_right: 'Doprava',
    move_up: 'Hore',
    move_down: 'Dole',
    ed_title: 'Názov',
    ed_title_helper: 'Nechajte prázdne pre „Kamery“',
    ed_icon: 'Ikona',
    ed_quality_entity: 'Výber kvality',
    ed_quality_entity_helper: 'input_select s možnosťami HD a SD; bez neho sa kvalita prepína na karte',
    ed_hd_option: 'Možnosť HD',
    ed_sd_option: 'Možnosť SD',
    ed_columns: 'Stĺpce',
    ed_columns_wall_helper: 'Prázdne: koľko sa zmestí na šírku',
    ed_aspect_ratio: 'Pomer strán dlaždíc',
    ed_aspect_ratio_helper: 'Napríklad 16:9 (predvolené) alebo 4:3',
    ed_show_summary: 'Súhrn',
    ed_show_title: 'Zobraziť názov',
    ed_show_badges: 'Odznaky súkromia',
    ed_language: 'Jazyk',
    ed_language_helper: 'Nechajte prázdne, ak chcete použiť jazyk Home Assistant',
    ed_cameras: 'Kamery',
    cf_name: 'Názov',
    cf_short_name: 'Krátky názov (odznak)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'Kamera SD',
    cf_privacy: 'Prepínač súkromia (zapnutý = skrytá)',
    cf_power: 'Napájanie (vypnuté = skrytá)',
    cf_ptz: 'Predpona PTZ, napríklad button.obyvacka_move',
    zoom_in: 'Zobraziť celú kartu',
    zoom_out: 'Späť na kompaktné zobrazenie',
    ed_zoom: 'Tlačidlo podrobností',
    motion: 'Zistený pohyb',
    st_private: 'Súkromné',
    cam_hidden: '{c}: skrytá',
    ed_show_motion: 'Odznak pohybu',
    cf_motion: 'Senzor pohybu (odznak na obraze)',
    ed_layout: 'Rozloženie',
    ed_layout_helper: 'Videostena: bez karty okolo mriežky, stavový riadok namiesto hlavičky',
    ed_layout_card: 'Karta',
    ed_layout_wall: 'Videostena',
    ed_illustration: 'Animovaná ilustrácia',
    ed_illustration_theme: 'Téma ilustrácie',
    ed_theme_auto: 'Automaticky (podľa témy)',
    ed_theme_day: 'Deň',
    ed_theme_night: 'Noc',
    open_frigate: 'Otvoriť vo Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Prehrávač',
    ed_player_helper: 'Automaticky: prehrávač Home Assistant, podstream Frigate pre SD; Frigate: vždy go2rtc Frigate',
    ed_player_auto: 'Automaticky',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Stream SD',
    ed_sd_stream_helper: 'Stream go2rtc Frigate pre SD; {camera} je názov kamery',
    ed_instance: 'Inštancia Frigate',
    ed_instance_helper: 'Client id inštancie Frigate, pri viacerých serveroch Frigate',
    ed_url: 'Adresa Frigate',
    ed_url_helper: 'Otvorí ju tlačidlo Otvoriť vo Frigate; prázdne: panel aplikácie Frigate',
    ed_open_in_frigate: 'Tlačidlo Otvoriť vo Frigate',
    ed_duplicates: 'Kamera vo Frigate a vo vlastnej integrácii',
    ed_duplicates_helper: 'Ktorú zobrazujú nájdené kamery (prepínač súkromia a tlačidlá PTZ zostávajú pri kamere Frigate)',
    ed_duplicates_frigate: 'Kamera Frigate',
    ed_duplicates_native: 'Natívna kamera',
    ed_duplicates_both: 'Obe',
    cf_controls_from: 'Ovládanie z (súkromie, PTZ)',
    cf_player: 'Prehrávač',
    ev_title: 'Udalosti · {n} dnes',
    ev_title_short: 'Udalosti · {n}',
    ev_heading: 'Udalosti',
    ev_today: 'dnes',
    ev_none: 'Dnes žiadne udalosti',
    ev_last: 'Posledná: {l} · {c}, {t}',
    ev_all: 'Všetky',
    ev_group_person: 'Osoba',
    ev_group_animal: 'Zviera',
    ev_group_vehicle: 'Vozidlo',
    ev_group_other: 'Iné',
    ev_live: 'prebieha',
    ev_live_btn: 'Naživo',
    ev_no_clip: 'Pre túto udalosť nie je klip',
    ev_expand: 'Zobraziť udalosti',
    ev_collapse: 'Skryť udalosti',
    detect_on: 'Detekcia zapnutá: ťuknutím ju vypnete',
    detect_off: 'Detekcia vypnutá: ťuknutím ju zapnete',
    rec_on: 'Nahrávanie zapnuté: ťuknutím ho vypnete',
    rec_off: 'Nahrávanie vypnuté: ťuknutím ho zapnete',
    obj_person: 'Osoba',
    obj_car: 'Auto',
    obj_truck: 'Nákladné auto',
    obj_bus: 'Autobus',
    obj_motorcycle: 'Motocykel',
    obj_bicycle: 'Bicykel',
    obj_cat: 'Mačka',
    obj_dog: 'Pes',
    obj_bird: 'Vták',
    obj_horse: 'Kôň',
    obj_package: 'Balík',
    obj_face: 'Tvár',
    obj_license_plate: 'EČV',
    tl_today: 'Dnes',
    tl_yesterday: 'Včera',
    tl_prev_day: 'Predchádzajúci deň',
    tl_next_day: 'Nasledujúci deň',
    tl_all_cameras: 'Všetky kamery',
    tl_download: 'Stiahnuť',
    tl_empty: 'V tento deň žiadne udalosti',
    tl_select: 'Vyberte udalosť na prehranie klipu',
    tl_score: 'skóre {s}',
    tl_clip: 'Klip',
    tl_live_badge: 'Naživo · {c}',
    ed_events: 'Udalosti',
    ed_events_helper: 'Dnešné udalosti kamier Frigate pod mriežkou',
    ed_events_expanded: 'Udalosti rozbalené',
    ed_events_limit: 'Zobrazené udalosti',
    ed_badges: 'Tlačidlá detekcie a nahrávania',
  },
  cs: {
    title: 'Kamery',
    live_one: '{n} kamera živě',
    live_many: 'Kamery živě: {n}',
    hidden_one: '{n} skrytá',
    hidden_many: 'Skryté: {n}',
    all_hidden: 'Všechny kamery jsou skryté',
    one_hidden: 'Kamera je vypnutá',
    no_cameras: 'Není nastavena žádná kamera',
    hint_all: 'Klepnutím na odznak zobrazíte kameru',
    live: 'Živě',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Přepnout mezi HD a SD',
    privacy_on: '{c}: skrytá, klepnutím zobrazíte',
    privacy_off: '{c}: viditelná, klepnutím skryjete',
    privacy_unavailable: '{c}: nedostupná',
    enable: 'Zapnout',
    disable: 'Vypnout',
    unavailable: 'Nedostupná',
    ptz: 'Otáčení a náklon',
    open: 'Zobrazit {c} na celou obrazovku',
    exit_fullscreen: 'Ukončit režim celé obrazovky',
    details: 'Podrobnosti',
    pending: 'Aktualizace…',
    sound_on: 'Zapnout zvuk',
    sound_off: 'Ztlumit',
    move_left: 'Doleva',
    move_right: 'Doprava',
    move_up: 'Nahoru',
    move_down: 'Dolů',
    ed_title: 'Název',
    ed_title_helper: 'Ponechte prázdné pro „Kamery“',
    ed_icon: 'Ikona',
    ed_quality_entity: 'Výběr kvality',
    ed_quality_entity_helper: 'input_select s možnostmi HD a SD; bez něj se kvalita přepíná na kartě',
    ed_hd_option: 'Možnost HD',
    ed_sd_option: 'Možnost SD',
    ed_columns: 'Sloupce',
    ed_columns_wall_helper: 'Prázdné: kolik se vejde na šířku',
    ed_aspect_ratio: 'Poměr stran dlaždic',
    ed_aspect_ratio_helper: 'Například 16:9 (výchozí) nebo 4:3',
    ed_show_summary: 'Souhrn',
    ed_show_title: 'Zobrazit název',
    ed_show_badges: 'Odznaky soukromí',
    ed_language: 'Jazyk',
    ed_language_helper: 'Ponechte prázdné pro použití jazyka Home Assistant',
    ed_cameras: 'Kamery',
    cf_name: 'Název',
    cf_short_name: 'Krátký název (odznak)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'Kamera SD',
    cf_privacy: 'Přepínač soukromí (zapnuto = skrytá)',
    cf_power: 'Napájení (vypnuto = skrytá)',
    cf_ptz: 'Předpona PTZ, například button.obyvak_move',
    zoom_in: 'Zobrazit celou kartu',
    zoom_out: 'Zpět na kompaktní zobrazení',
    ed_zoom: 'Tlačítko podrobností',
    motion: 'Zjištěn pohyb',
    st_private: 'Soukromé',
    cam_hidden: '{c}: skrytá',
    ed_show_motion: 'Odznak pohybu',
    cf_motion: 'Senzor pohybu (odznak na obraze)',
    ed_layout: 'Rozložení',
    ed_layout_helper: 'Videostěna: bez karty kolem mřížky, stavový řádek místo záhlaví',
    ed_layout_card: 'Karta',
    ed_layout_wall: 'Videostěna',
    ed_illustration: 'Animovaná ilustrace',
    ed_illustration_theme: 'Motiv ilustrace',
    ed_theme_auto: 'Automaticky (podle motivu)',
    ed_theme_day: 'Den',
    ed_theme_night: 'Noc',
    open_frigate: 'Otevřít ve Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Přehrávač',
    ed_player_helper: 'Automaticky: přehrávač Home Assistant, podstream Frigate pro SD; Frigate: vždy go2rtc Frigate',
    ed_player_auto: 'Automaticky',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Stream SD',
    ed_sd_stream_helper: 'Stream go2rtc Frigate pro SD; {camera} je název kamery',
    ed_instance: 'Instance Frigate',
    ed_instance_helper: 'Client id instance Frigate, při více serverech Frigate',
    ed_url: 'Adresa Frigate',
    ed_url_helper: 'Otevře ji tlačítko Otevřít ve Frigate; prázdné: panel aplikace Frigate',
    ed_open_in_frigate: 'Tlačítko Otevřít ve Frigate',
    ed_duplicates: 'Kamera ve Frigate a ve vlastní integraci',
    ed_duplicates_helper: 'Kterou zobrazují nalezené kamery (přepínač soukromí a tlačítka PTZ zůstávají u kamery Frigate)',
    ed_duplicates_frigate: 'Kamera Frigate',
    ed_duplicates_native: 'Nativní kamera',
    ed_duplicates_both: 'Obě',
    cf_controls_from: 'Ovládání z (soukromí, PTZ)',
    cf_player: 'Přehrávač',
    ev_title: 'Události · {n} dnes',
    ev_title_short: 'Události · {n}',
    ev_heading: 'Události',
    ev_today: 'dnes',
    ev_none: 'Dnes žádné události',
    ev_last: 'Poslední: {l} · {c}, {t}',
    ev_all: 'Vše',
    ev_group_person: 'Osoba',
    ev_group_animal: 'Zvíře',
    ev_group_vehicle: 'Vozidlo',
    ev_group_other: 'Jiné',
    ev_live: 'probíhá',
    ev_live_btn: 'Živě',
    ev_no_clip: 'Pro tuto událost není klip',
    ev_expand: 'Zobrazit události',
    ev_collapse: 'Skrýt události',
    detect_on: 'Detekce zapnutá: klepnutím ji vypnete',
    detect_off: 'Detekce vypnutá: klepnutím ji zapnete',
    rec_on: 'Nahrávání zapnuté: klepnutím ho vypnete',
    rec_off: 'Nahrávání vypnuté: klepnutím ho zapnete',
    obj_person: 'Osoba',
    obj_car: 'Auto',
    obj_truck: 'Nákladní auto',
    obj_bus: 'Autobus',
    obj_motorcycle: 'Motocykl',
    obj_bicycle: 'Kolo',
    obj_cat: 'Kočka',
    obj_dog: 'Pes',
    obj_bird: 'Pták',
    obj_horse: 'Kůň',
    obj_package: 'Balík',
    obj_face: 'Obličej',
    obj_license_plate: 'SPZ',
    tl_today: 'Dnes',
    tl_yesterday: 'Včera',
    tl_prev_day: 'Předchozí den',
    tl_next_day: 'Další den',
    tl_all_cameras: 'Všechny kamery',
    tl_download: 'Stáhnout',
    tl_empty: 'V tento den žádné události',
    tl_select: 'Vyberte událost pro přehrání klipu',
    tl_score: 'skóre {s}',
    tl_clip: 'Klip',
    tl_live_badge: 'Živě · {c}',
    ed_events: 'Události',
    ed_events_helper: 'Dnešní události kamer Frigate pod mřížkou',
    ed_events_expanded: 'Události rozbalené',
    ed_events_limit: 'Zobrazené události',
    ed_badges: 'Tlačítka detekce a nahrávání',
  },
  sl: {
    title: 'Kamere',
    live_one: '{n} kamera v živo',
    live_many: 'Kamere v živo: {n}',
    hidden_one: '{n} skrita',
    hidden_many: 'Skrite: {n}',
    all_hidden: 'Vse kamere so skrite',
    one_hidden: 'Kamera je izklopljena',
    no_cameras: 'Nobena kamera ni nastavljena',
    hint_all: 'Tapnite značko, da prikažete kamero',
    live: 'V živo',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Preklopi med HD in SD',
    privacy_on: '{c}: skrita, tapnite za prikaz',
    privacy_off: '{c}: vidna, tapnite, da jo skrijete',
    privacy_unavailable: '{c}: ni na voljo',
    enable: 'Omogoči',
    disable: 'Onemogoči',
    unavailable: 'Ni na voljo',
    ptz: 'Vrtenje in nagib',
    open: 'Prikaži {c} v celozaslonskem načinu',
    exit_fullscreen: 'Izhod iz celozaslonskega načina',
    details: 'Podrobnosti',
    pending: 'Posodabljanje…',
    sound_on: 'Vklopi zvok',
    sound_off: 'Izklopi zvok',
    move_left: 'Levo',
    move_right: 'Desno',
    move_up: 'Gor',
    move_down: 'Dol',
    ed_title: 'Naslov',
    ed_title_helper: 'Pustite prazno za »Kamere«',
    ed_icon: 'Ikona',
    ed_quality_entity: 'Izbirnik kakovosti',
    ed_quality_entity_helper: 'input_select z možnostma HD in SD; brez njega se kakovost preklaplja na kartici',
    ed_hd_option: 'Možnost HD',
    ed_sd_option: 'Možnost SD',
    ed_columns: 'Stolpci',
    ed_columns_wall_helper: 'Prazno: kolikor jih gre v širino',
    ed_aspect_ratio: 'Razmerje stranic ploščic',
    ed_aspect_ratio_helper: 'Na primer 16:9 (privzeto) ali 4:3',
    ed_show_summary: 'Povzetek',
    ed_show_title: 'Prikaži naslov',
    ed_show_badges: 'Značke zasebnosti',
    ed_language: 'Jezik',
    ed_language_helper: 'Pustite prazno, da sledi jeziku Home Assistanta',
    ed_cameras: 'Kamere',
    cf_name: 'Ime',
    cf_short_name: 'Kratko ime (značka)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'Kamera SD',
    cf_privacy: 'Stikalo zasebnosti (vklopljeno = skrita)',
    cf_power: 'Napajanje (izklopljeno = skrita)',
    cf_ptz: 'Predpona PTZ, na primer button.dnevna_soba_move',
    zoom_in: 'Prikaži celotno kartico',
    zoom_out: 'Nazaj na kompaktni pogled',
    ed_zoom: 'Gumb za podrobnosti',
    motion: 'Zaznano gibanje',
    st_private: 'Zasebno',
    cam_hidden: '{c}: skrita',
    ed_show_motion: 'Značka gibanja',
    cf_motion: 'Senzor gibanja (značka na sliki)',
    ed_layout: 'Postavitev',
    ed_layout_helper: 'Video stena: brez kartice okoli mreže, vrstica stanja namesto glave',
    ed_layout_card: 'Kartica',
    ed_layout_wall: 'Video stena',
    ed_illustration: 'Animirana ilustracija',
    ed_illustration_theme: 'Tema ilustracije',
    ed_theme_auto: 'Samodejno (sledi temi)',
    ed_theme_day: 'Dan',
    ed_theme_night: 'Noč',
    open_frigate: 'Odpri v Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Predvajalnik',
    ed_player_helper: 'Samodejno: predvajalnik Home Assistant, podtok Frigate za SD; Frigate: vedno go2rtc Frigate',
    ed_player_auto: 'Samodejno',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Tok SD',
    ed_sd_stream_helper: 'Tok go2rtc Frigate za SD; {camera} je ime kamere',
    ed_instance: 'Primerek Frigate',
    ed_instance_helper: 'Client id primerka Frigate, pri več strežnikih Frigate',
    ed_url: 'Naslov Frigate',
    ed_url_helper: 'Odpre ga gumb Odpri v Frigate; prazno: plošča aplikacije Frigate',
    ed_open_in_frigate: 'Gumb Odpri v Frigate',
    ed_duplicates: 'Kamera v Frigate in v lastni integraciji',
    ed_duplicates_helper: 'Katero prikažejo najdene kamere (stikalo zasebnosti in gumbi PTZ ostanejo pri kameri Frigate)',
    ed_duplicates_frigate: 'Kamera Frigate',
    ed_duplicates_native: 'Izvorna kamera',
    ed_duplicates_both: 'Obe',
    cf_controls_from: 'Upravljanje iz (zasebnost, PTZ)',
    cf_player: 'Predvajalnik',
    ev_title: 'Dogodki · {n} danes',
    ev_title_short: 'Dogodki · {n}',
    ev_heading: 'Dogodki',
    ev_today: 'danes',
    ev_none: 'Danes ni dogodkov',
    ev_last: 'Zadnji: {l} · {c}, {t}',
    ev_all: 'Vsi',
    ev_group_person: 'Oseba',
    ev_group_animal: 'Žival',
    ev_group_vehicle: 'Vozilo',
    ev_group_other: 'Drugo',
    ev_live: 'poteka',
    ev_live_btn: 'V živo',
    ev_no_clip: 'Za ta dogodek ni posnetka',
    ev_expand: 'Pokaži dogodke',
    ev_collapse: 'Skrij dogodke',
    detect_on: 'Zaznavanje vklopljeno: tapnite za izklop',
    detect_off: 'Zaznavanje izklopljeno: tapnite za vklop',
    rec_on: 'Snemanje vklopljeno: tapnite za izklop',
    rec_off: 'Snemanje izklopljeno: tapnite za vklop',
    obj_person: 'Oseba',
    obj_car: 'Avto',
    obj_truck: 'Tovornjak',
    obj_bus: 'Avtobus',
    obj_motorcycle: 'Motor',
    obj_bicycle: 'Kolo',
    obj_cat: 'Mačka',
    obj_dog: 'Pes',
    obj_bird: 'Ptica',
    obj_horse: 'Konj',
    obj_package: 'Paket',
    obj_face: 'Obraz',
    obj_license_plate: 'Registrska tablica',
    tl_today: 'Danes',
    tl_yesterday: 'Včeraj',
    tl_prev_day: 'Prejšnji dan',
    tl_next_day: 'Naslednji dan',
    tl_all_cameras: 'Vse kamere',
    tl_download: 'Prenesi',
    tl_empty: 'Ta dan ni dogodkov',
    tl_select: 'Izberite dogodek za predvajanje posnetka',
    tl_score: 'ocena {s}',
    tl_clip: 'Posnetek',
    tl_live_badge: 'V živo · {c}',
    ed_events: 'Dogodki',
    ed_events_helper: 'Današnji dogodki kamer Frigate pod mrežo',
    ed_events_expanded: 'Dogodki razprti',
    ed_events_limit: 'Prikazani dogodki',
    ed_badges: 'Gumba za zaznavanje in snemanje',
  },
  lv: {
    title: 'Kameras',
    live_one: '{n} kamera tiešraidē',
    live_many: 'Kameras tiešraidē: {n}',
    hidden_one: '{n} paslēpta',
    hidden_many: 'Paslēptas: {n}',
    all_hidden: 'Visas kameras ir paslēptas',
    one_hidden: 'Kamera atspējota',
    no_cameras: 'Nav konfigurēta neviena kamera',
    hint_all: 'Pieskarieties žetonam, lai parādītu kameru',
    live: 'Tiešraide',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Pārslēgt starp HD un SD',
    privacy_on: '{c}: paslēpta, pieskarieties, lai parādītu',
    privacy_off: '{c}: redzama, pieskarieties, lai paslēptu',
    privacy_unavailable: '{c}: nav pieejama',
    enable: 'Iespējot',
    disable: 'Atspējot',
    unavailable: 'Nav pieejama',
    ptz: 'Pagriešana un slīpums',
    open: 'Rādīt {c} pilnekrānā',
    exit_fullscreen: 'Iziet no pilnekrāna',
    details: 'Detaļas',
    pending: 'Atjaunina…',
    sound_on: 'Ieslēgt skaņu',
    sound_off: 'Izslēgt skaņu',
    move_left: 'Pa kreisi',
    move_right: 'Pa labi',
    move_up: 'Uz augšu',
    move_down: 'Uz leju',
    ed_title: 'Virsraksts',
    ed_title_helper: 'Atstājiet tukšu, lai būtu “Kameras”',
    ed_icon: 'Ikona',
    ed_quality_entity: 'Kvalitātes atlasītājs',
    ed_quality_entity_helper: 'input_select ar opcijām HD un SD; bez tā kvalitāti pārslēdz kartītē',
    ed_hd_option: 'HD opcija',
    ed_sd_option: 'SD opcija',
    ed_columns: 'Kolonnas',
    ed_columns_wall_helper: 'Tukšs: cik ietilpst platumā',
    ed_aspect_ratio: 'Flīžu malu attiecība',
    ed_aspect_ratio_helper: 'Piemēram, 16:9 (noklusējums) vai 4:3',
    ed_show_summary: 'Kopsavilkums',
    ed_show_title: 'Rādīt virsrakstu',
    ed_show_badges: 'Privātuma žetoni',
    ed_language: 'Valoda',
    ed_language_helper: 'Atstājiet tukšu, lai izmantotu Home Assistant valodu',
    ed_cameras: 'Kameras',
    cf_name: 'Nosaukums',
    cf_short_name: 'Īsais nosaukums (žetons)',
    cf_camera: 'Kamera (HD)',
    cf_sd: 'SD kamera',
    cf_privacy: 'Privātuma slēdzis (ieslēgts = paslēpta)',
    cf_power: 'Barošana (izslēgta = paslēpta)',
    cf_ptz: 'PTZ prefikss, piemēram, button.dzivojama_istaba_move',
    zoom_in: 'Rādīt pilno karti',
    zoom_out: 'Atpakaļ uz kompakto skatu',
    ed_zoom: 'Detaļu poga',
    motion: 'Konstatēta kustība',
    st_private: 'Privāti',
    cam_hidden: '{c}: paslēpta',
    ed_show_motion: 'Kustības žetons',
    cf_motion: 'Kustības sensors (žetons attēlā)',
    ed_layout: 'Izkārtojums',
    ed_layout_helper: 'Video siena: bez kartītes ap režģi, statusa josla galvenes vietā',
    ed_layout_card: 'Kartīte',
    ed_layout_wall: 'Video siena',
    ed_illustration: 'Animēta ilustrācija',
    ed_illustration_theme: 'Ilustrācijas motīvs',
    ed_theme_auto: 'Automātiski (seko tēmai)',
    ed_theme_day: 'Diena',
    ed_theme_night: 'Nakts',
    open_frigate: 'Atvērt Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Atskaņotājs',
    ed_player_helper: 'Automātiski: Home Assistant atskaņotājs, Frigate apakšplūsma SD; Frigate: vienmēr Frigate go2rtc',
    ed_player_auto: 'Automātiski',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'SD plūsma',
    ed_sd_stream_helper: 'Frigate go2rtc plūsma SD; {camera} ir kameras nosaukums',
    ed_instance: 'Frigate instance',
    ed_instance_helper: 'Frigate instances client id, ja ir vairāki Frigate serveri',
    ed_url: 'Frigate adrese',
    ed_url_helper: 'Atver poga Atvērt Frigate; tukšs: Frigate lietotnes panelis',
    ed_open_in_frigate: 'Poga Atvērt Frigate',
    ed_duplicates: 'Kamera Frigate un savā integrācijā',
    ed_duplicates_helper: 'Kuru rāda atrastās kameras (privātuma slēdzis un PTZ pogas paliek pie Frigate kameras)',
    ed_duplicates_frigate: 'Frigate kamera',
    ed_duplicates_native: 'Vietējā kamera',
    ed_duplicates_both: 'Abas',
    cf_controls_from: 'Vadība no (privātums, PTZ)',
    cf_player: 'Atskaņotājs',
    ev_title: 'Notikumi · {n} šodien',
    ev_title_short: 'Notikumi · {n}',
    ev_heading: 'Notikumi',
    ev_today: 'šodien',
    ev_none: 'Šodien notikumu nav',
    ev_last: 'Pēdējais: {l} · {c}, {t}',
    ev_all: 'Visi',
    ev_group_person: 'Persona',
    ev_group_animal: 'Dzīvnieks',
    ev_group_vehicle: 'Transportlīdzeklis',
    ev_group_other: 'Cits',
    ev_live: 'notiek',
    ev_live_btn: 'Tiešraide',
    ev_no_clip: 'Šim notikumam nav klipa',
    ev_expand: 'Rādīt notikumus',
    ev_collapse: 'Paslēpt notikumus',
    detect_on: 'Noteikšana ieslēgta: pieskarieties, lai izslēgtu',
    detect_off: 'Noteikšana izslēgta: pieskarieties, lai ieslēgtu',
    rec_on: 'Ierakstīšana ieslēgta: pieskarieties, lai izslēgtu',
    rec_off: 'Ierakstīšana izslēgta: pieskarieties, lai ieslēgtu',
    obj_person: 'Persona',
    obj_car: 'Automašīna',
    obj_truck: 'Kravas auto',
    obj_bus: 'Autobuss',
    obj_motorcycle: 'Motocikls',
    obj_bicycle: 'Velosipēds',
    obj_cat: 'Kaķis',
    obj_dog: 'Suns',
    obj_bird: 'Putns',
    obj_horse: 'Zirgs',
    obj_package: 'Paka',
    obj_face: 'Seja',
    obj_license_plate: 'Numura zīme',
    tl_today: 'Šodien',
    tl_yesterday: 'Vakar',
    tl_prev_day: 'Iepriekšējā diena',
    tl_next_day: 'Nākamā diena',
    tl_all_cameras: 'Visas kameras',
    tl_download: 'Lejupielādēt',
    tl_empty: 'Šajā dienā notikumu nav',
    tl_select: 'Izvēlieties notikumu, lai atskaņotu tā klipu',
    tl_score: 'vērtējums {s}',
    tl_clip: 'Klips',
    tl_live_badge: 'Tiešraide · {c}',
    ed_events: 'Notikumi',
    ed_events_helper: 'Frigate kameru šodienas notikumi zem režģa',
    ed_events_expanded: 'Notikumi izvērsti',
    ed_events_limit: 'Rādītie notikumi',
    ed_badges: 'Noteikšanas un ierakstīšanas pogas',
  },
  el: {
    title: 'Κάμερες',
    live_one: '{n} κάμερα ζωντανά',
    live_many: '{n} κάμερες ζωντανά',
    hidden_one: '{n} κρυφή',
    hidden_many: '{n} κρυφές',
    all_hidden: 'Όλες οι κάμερες είναι κρυφές',
    one_hidden: 'Κάμερα ανενεργή',
    no_cameras: 'Δεν έχει ρυθμιστεί καμία κάμερα',
    hint_all: 'Πατήστε ένα σήμα για να εμφανίσετε μια κάμερα',
    live: 'Ζωντανά',
    hd: 'HD',
    sd: 'SD',
    quality_hint: 'Εναλλαγή μεταξύ HD και SD',
    privacy_on: '{c}: κρυφή, πατήστε για εμφάνιση',
    privacy_off: '{c}: ορατή, πατήστε για απόκρυψη',
    privacy_unavailable: '{c}: μη διαθέσιμη',
    enable: 'Ενεργοποίηση',
    disable: 'Απενεργοποίηση',
    unavailable: 'Μη διαθέσιμη',
    ptz: 'Περιστροφή και κλίση',
    open: 'Εμφάνιση {c} σε πλήρη οθόνη',
    exit_fullscreen: 'Έξοδος από πλήρη οθόνη',
    details: 'Λεπτομέρειες',
    pending: 'Ενημέρωση…',
    sound_on: 'Ενεργοποίηση ήχου',
    sound_off: 'Σίγαση',
    move_left: 'Αριστερά',
    move_right: 'Δεξιά',
    move_up: 'Πάνω',
    move_down: 'Κάτω',
    ed_title: 'Τίτλος',
    ed_title_helper: 'Αφήστε κενό για «Κάμερες»',
    ed_icon: 'Εικονίδιο',
    ed_quality_entity: 'Επιλογέας ποιότητας',
    ed_quality_entity_helper: 'input_select με επιλογές HD και SD· χωρίς αυτό, η ποιότητα αλλάζει στην κάρτα',
    ed_hd_option: 'Επιλογή HD',
    ed_sd_option: 'Επιλογή SD',
    ed_columns: 'Στήλες',
    ed_columns_wall_helper: 'Κενό: όσες χωρούν στο πλάτος',
    ed_aspect_ratio: 'Αναλογία πλακιδίων',
    ed_aspect_ratio_helper: 'Για παράδειγμα 16:9 (προεπιλογή) ή 4:3',
    ed_show_summary: 'Σύνοψη',
    ed_show_title: 'Εμφάνιση τίτλου',
    ed_show_badges: 'Σήματα απορρήτου',
    ed_language: 'Γλώσσα',
    ed_language_helper: 'Αφήστε κενό για να ακολουθεί τη γλώσσα του Home Assistant',
    ed_cameras: 'Κάμερες',
    cf_name: 'Όνομα',
    cf_short_name: 'Σύντομο όνομα (σήμα)',
    cf_camera: 'Κάμερα (HD)',
    cf_sd: 'Κάμερα SD',
    cf_privacy: 'Διακόπτης απορρήτου (ενεργός = κρυφή)',
    cf_power: 'Τροφοδοσία (απενεργοποιημένη = κρυφή)',
    cf_ptz: 'Πρόθεμα PTZ, για παράδειγμα button.saloni_move',
    zoom_in: 'Εμφάνιση πλήρους κάρτας',
    zoom_out: 'Επιστροφή στη συμπαγή προβολή',
    ed_zoom: 'Κουμπί λεπτομερειών',
    motion: 'Εντοπίστηκε κίνηση',
    st_private: 'Ιδιωτικό',
    cam_hidden: '{c}: κρυφή',
    ed_show_motion: 'Σήμα κίνησης',
    cf_motion: 'Αισθητήρας κίνησης (σήμα στην εικόνα)',
    ed_layout: 'Διάταξη',
    ed_layout_helper: 'Τοίχος βίντεο: χωρίς κάρτα γύρω από το πλέγμα, γραμμή κατάστασης αντί για την κεφαλίδα',
    ed_layout_card: 'Κάρτα',
    ed_layout_wall: 'Τοίχος βίντεο',
    ed_illustration: 'Κινούμενη εικονογράφηση',
    ed_illustration_theme: 'Θέμα εικονογράφησης',
    ed_theme_auto: 'Αυτόματο (ακολουθεί το θέμα)',
    ed_theme_day: 'Ημέρα',
    ed_theme_night: 'Νύχτα',
    open_frigate: 'Άνοιγμα στο Frigate',
    ed_frigate: 'Frigate',
    ed_player: 'Αναπαραγωγή',
    ed_player_helper: 'Αυτόματα: η αναπαραγωγή του Home Assistant, η δευτερεύουσα ροή του Frigate για SD· Frigate: πάντα το go2rtc του Frigate',
    ed_player_auto: 'Αυτόματα',
    ed_player_frigate: 'Frigate (go2rtc)',
    ed_player_home_assistant: 'Home Assistant',
    ed_sd_stream: 'Ροή SD',
    ed_sd_stream_helper: 'Ροή go2rtc του Frigate για SD· {camera} είναι το όνομα της κάμερας',
    ed_instance: 'Παρουσία Frigate',
    ed_instance_helper: 'Client id της παρουσίας Frigate, με πολλούς διακομιστές Frigate',
    ed_url: 'Διεύθυνση Frigate',
    ed_url_helper: 'Ανοίγει με το κουμπί Άνοιγμα στο Frigate· κενό: ο πίνακας της εφαρμογής Frigate',
    ed_open_in_frigate: 'Κουμπί Άνοιγμα στο Frigate',
    ed_duplicates: 'Κάμερα στο Frigate και στη δική της ενσωμάτωση',
    ed_duplicates_helper: 'Ποια δείχνουν οι κάμερες που βρέθηκαν (ο διακόπτης απορρήτου και τα κουμπιά PTZ μένουν στην κάμερα Frigate)',
    ed_duplicates_frigate: 'Η κάμερα Frigate',
    ed_duplicates_native: 'Η εγγενής κάμερα',
    ed_duplicates_both: 'Και οι δύο',
    cf_controls_from: 'Χειρισμός από (απόρρητο, PTZ)',
    cf_player: 'Αναπαραγωγή',
    ev_title: 'Συμβάντα · {n} σήμερα',
    ev_title_short: 'Συμβάντα · {n}',
    ev_heading: 'Συμβάντα',
    ev_today: 'σήμερα',
    ev_none: 'Κανένα συμβάν σήμερα',
    ev_last: 'Τελευταίο: {l} · {c}, {t}',
    ev_all: 'Όλα',
    ev_group_person: 'Άτομο',
    ev_group_animal: 'Ζώο',
    ev_group_vehicle: 'Όχημα',
    ev_group_other: 'Άλλο',
    ev_live: 'σε εξέλιξη',
    ev_live_btn: 'Ζωντανά',
    ev_no_clip: 'Δεν υπάρχει κλιπ για αυτό το συμβάν',
    ev_expand: 'Εμφάνιση συμβάντων',
    ev_collapse: 'Απόκρυψη συμβάντων',
    detect_on: 'Ανίχνευση ενεργή: πατήστε για απενεργοποίηση',
    detect_off: 'Ανίχνευση ανενεργή: πατήστε για ενεργοποίηση',
    rec_on: 'Εγγραφή ενεργή: πατήστε για απενεργοποίηση',
    rec_off: 'Εγγραφή ανενεργή: πατήστε για ενεργοποίηση',
    obj_person: 'Άτομο',
    obj_car: 'Αυτοκίνητο',
    obj_truck: 'Φορτηγό',
    obj_bus: 'Λεωφορείο',
    obj_motorcycle: 'Μοτοσυκλέτα',
    obj_bicycle: 'Ποδήλατο',
    obj_cat: 'Γάτα',
    obj_dog: 'Σκύλος',
    obj_bird: 'Πουλί',
    obj_horse: 'Άλογο',
    obj_package: 'Δέμα',
    obj_face: 'Πρόσωπο',
    obj_license_plate: 'Πινακίδα',
    tl_today: 'Σήμερα',
    tl_yesterday: 'Χθες',
    tl_prev_day: 'Προηγούμενη μέρα',
    tl_next_day: 'Επόμενη μέρα',
    tl_all_cameras: 'Όλες οι κάμερες',
    tl_download: 'Λήψη',
    tl_empty: 'Κανένα συμβάν αυτή τη μέρα',
    tl_select: 'Επιλέξτε ένα συμβάν για να παίξει το κλιπ του',
    tl_score: 'βαθμολογία {s}',
    tl_clip: 'Κλιπ',
    tl_live_badge: 'Ζωντανά · {c}',
    ed_events: 'Συμβάντα',
    ed_events_helper: 'Τα σημερινά συμβάντα των καμερών Frigate, κάτω από το πλέγμα',
    ed_events_expanded: 'Συμβάντα ανεπτυγμένα',
    ed_events_limit: 'Εμφανιζόμενα συμβάντα',
    ed_badges: 'Κουμπιά ανίχνευσης και εγγραφής',
  },
};

// Full tag when the dictionary has it (sr-Latn), else the part before the dash (fr-FR -> fr, pt-BR -> pt), else English.
function hcLang(raw) {
  const l = String(raw || 'en');
  if (HcI18n[l]) return l;
  const base = l.split('-')[0];
  return HcI18n[base] ? base : 'en';
}

function hcT(lang, key) {
  const strings = HcI18n[lang] || HcI18n.en;
  return strings[key] || HcI18n.en[key] || key;
}

// The width of an element's whole text in fractional pixels, even while an ellipsis cuts it.
const hcTextWidth = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width || el.scrollWidth;
};

// In-place update of a part of the shadow DOM: the nodes that stay keep their place, so a new state (motion, a
// privacy switch) never rebuilds the header's picture, its icons or its pill — the card keeps its height and the
// running animations go on. Nodes are matched by position and tag; attributes and text are patched.
const hcPatchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const hcPatchChildren = (cur, next) => {
  const fresh = [...next.childNodes];
  fresh.forEach((n, i) => {
    const o = cur.childNodes[i];
    if (!o || o.nodeType !== n.nodeType || o.nodeName !== n.nodeName) {
      if (o) cur.replaceChild(n, o);
      else cur.appendChild(n);
      return;
    }
    if (n.nodeType === 1) {
      hcPatchAttrs(o, n);
      hcPatchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
const hcMorph = (root, html) => {
  if (typeof document === 'undefined' || !document.createElement('template').content || !root.childNodes) {
    root.innerHTML = html;
    return;
  }
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  hcPatchChildren(root, tpl.content);
};

function hcEsc(s) {
  return String(s == null ? '' : s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

const HC_DEFAULTS = {
  show_title: true,
  hd_option: 'HD',
  sd_option: 'SD',
  columns: 2,
  show_summary: true,
  show_badges: true,
  show_motion: true,
  illustration: true,
  illustration_theme: 'auto',
};

const HC_PTZ_DIRS = ['left', 'right', 'up', 'down'];
// PTZ arrow held down: first repeat after HC_PTZ_HOLD_MS, then one press every HC_PTZ_REPEAT_MS.
const HC_PTZ_HOLD_MS = 500;
const HC_PTZ_REPEAT_MS = 350;
// How long a privacy badge waits for its switch to answer before giving up.
const HC_PENDING_MS = 15000;
// Mini card: how often the camera snapshots of its compact view are refreshed.
const HC_SNAPSHOT_MS = 10000;
const HC_PTZ_ICONS = { left: 'mdi:chevron-left', right: 'mdi:chevron-right', up: 'mdi:chevron-up', down: 'mdi:chevron-down' };

// ── Entity discovery ─────────────────────────────────────────────────────────
// The registry is indexed by device once per `hass.entities` object (it only changes with the registry).
const hcDeviceIndex = new WeakMap();
function hcDeviceEntities(reg, device) {
  let index = hcDeviceIndex.get(reg);
  if (!index) {
    index = new Map();
    for (const e of Object.values(reg)) {
      if (!e.device_id) continue;
      if (!index.has(e.device_id)) index.set(e.device_id, []);
      index.get(e.device_id).push(e.entity_id);
    }
    hcDeviceIndex.set(reg, index);
  }
  return index.get(device) || [];
}

// An entity of the camera's device whose id ends with `suffix` (Tapo: switch.*_privacy, button.*_move_left), or
// whose translation key is that suffix: integrations that name their entities in the user's language (Tapo Cameras:
// button.salon_gauche is the move_left button) only keep the English key in the registry.
function hcSibling(hass, cameraId, domain, suffix) {
  const reg = hass?.entities;
  const device = reg?.[cameraId]?.device_id;
  if (!device) return undefined;
  const key = suffix.replace(/^_/, '');
  const ids = hcDeviceEntities(reg, device).filter((id) => id.startsWith(`${domain}.`));
  return ids.find((id) => id.endsWith(suffix)) || ids.find((id) => reg[id]?.translation_key === key);
}

// True when an event path goes through one of the card's own controls (privacy toggle, HD/SD switch,
// tile buttons, including the one covering the image that opens the camera).
function hcOwnControl(path) {
  return path.some((n) => n.dataset?.toggle || n.dataset?.quality || n.dataset?.action || n.dataset?.ev);
}

// "16:9", "4/3" or 1.5 as a width / height ratio; 16:9 when missing or invalid.
function hcRatio(value) {
  if (typeof value === 'number' && value > 0) return value;
  const m = /^\s*(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)\s*$/.exec(String(value || ''));
  const r = m ? Number(m[1]) / Number(m[2]) : Number(value);
  return Number.isFinite(r) && r > 0 ? r : 16 / 9;
}

// Home Assistant's own live player (WebRTC through go2rtc, HLS or MJPEG, whichever the camera offers).
// It ships with the picture cards, which are loaded on demand: building one loads it.
let hcStreamLoad = null;
function hcLoadStream(entity) {
  if (customElements.get('ha-camera-stream')) return Promise.resolve();
  if (!hcStreamLoad) {
    hcStreamLoad = (async () => {
      const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
      if (!helpers) throw new Error('loadCardHelpers unavailable');
      helpers.createCardElement({ type: 'picture-entity', entity: entity, camera_view: 'live' });
      // whenDefined never rejects: time out so a failed load rearms hcStreamLoad instead of hanging forever.
      let timer;
      try {
        await Promise.race([
          customElements.whenDefined('ha-camera-stream'),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('ha-camera-stream not loaded')), 15000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    })().catch((err) => {
      hcStreamLoad = null; // the next hass update tries again
      throw err;
    });
  }
  return hcStreamLoad;
}

// PTZ buttons as { left, right, up, down }: a prefix ("button.x_move" + "_left"…), an object, or found on the device
// (`auto`, or `buttons`). `frigate`: Frigate's frigate.ptz action on the Frigate camera `frigateId`, as
// { service: 'frigate', left: frigateId, … } (the camera moves from the press until the release).
function hcPtz(hass, cam, cameraId, frigateId) {
  const ptz = cam.ptz;
  if (ptz === false || ptz === 'none') return null;
  if (ptz === 'frigate') {
    if (!frigateId) return null;
    const out = { service: 'frigate' };
    for (const d of HC_PTZ_DIRS) out[d] = frigateId;
    return out;
  }
  if (!ptz || ptz === 'auto' || ptz === 'buttons') {
    // Each direction on its own: translated entity ids share no prefix (Tapo Cameras: *_gauche, *_monter…)
    const found = {};
    for (const d of HC_PTZ_DIRS) {
      const id = hcSibling(hass, cameraId, 'button', `_move_${d}`);
      if (id) found[d] = id;
    }
    return found.left || found.right || found.up || found.down ? found : null;
  }
  if (typeof ptz === 'string') {
    const out = {};
    for (const d of HC_PTZ_DIRS) out[d] = `${ptz}_${d}`;
    return out;
  }
  return ptz;
}

// Motion sensors of the camera's device: binary sensors whose device class or id says motion, occupancy or person
// (Tapo: binary_sensor.*_motion, *_person_detection). An entity id or a list in the config replaces the lookup.
const HC_MOTION_CLASSES = ['motion', 'occupancy', 'presence'];
const HC_MOTION_KEYS = ['motion', 'person'];
function hcMotion(hass, cam, cameraId) {
  if (cam.motion === false) return [];
  if (cam.motion) return [].concat(cam.motion);
  const reg = hass?.entities;
  const device = reg?.[cameraId]?.device_id;
  if (!device) return [];
  const sensors = hcDeviceEntities(reg, device).filter((id) => id.startsWith('binary_sensor.'));
  // Integrations that give translation keys (Tapo Cameras, whose ids are in the user's language): motion and person
  // only, not its vehicle, pet or line-crossing detections that share the motion device class
  const keyed = sensors.filter((id) => HC_MOTION_KEYS.includes(reg[id]?.translation_key));
  if (keyed.length) return keyed;
  return sensors.filter(
    (id) => HC_MOTION_CLASSES.includes(hass.states?.[id]?.attributes?.device_class) || /(motion|occupancy|person)/.test(id),
  );
}

// ── Frigate ──────────────────────────────────────────────────────────────────
// `frigate:` options of the card. player: auto (Home Assistant's player, which the Frigate integration already
// connects to Frigate's go2rtc; Frigate's own sub-stream, sd_stream, for SD), frigate (always Frigate's go2rtc,
// through the integration's proxy) or home_assistant (never). instance: the Frigate client id, when there are
// several; else the camera's own. url: Frigate's address for the "Open in Frigate" button, else the sidebar panel
// of a Frigate app (Frigate, Frigate Proxy…) when there is one. duplicates: the panel's discovery only.
const HC_FRIGATE_DEFAULTS = {
  player: 'auto',
  sd_stream: '{camera}_sub',
  instance: '',
  url: '',
  open_in_frigate: true,
  duplicates: 'frigate',
  // The events of the Frigate cameras, under the grid: folded unless events_expanded; events_labels (YAML) keeps
  // some objects only. badges: Frigate's detection and recording switches on the tiles.
  events: true,
  events_expanded: false,
  events_limit: 5,
  badges: true,
};
const HC_PLAYERS = ['auto', 'frigate', 'home_assistant'];
const HC_DUPLICATES = ['frigate', 'native', 'both'];
function hcFrigateConf(config) {
  return Object.assign({}, HC_FRIGATE_DEFAULTS, config?.frigate || {});
}

function hcIsFrigate(hass, id) {
  const platform = hass?.entities?.[id]?.platform;
  if (platform) return platform === 'frigate';
  const attrs = hass?.states?.[id]?.attributes;
  return !!(attrs?.camera_name && attrs?.client_id);
}

// A name compared without case, accents nor punctuation: "Séjour cam" and "sejour_cam" match.
const hcKey = (name) =>
  String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

// The native camera (Tapo…) of a Frigate camera, whose privacy switch and PTZ buttons it takes: the only camera
// of its area that does not come from Frigate, else the one of its area (or anywhere, without an area) with its name.
// Indexed once per `hass.entities` object, as the device index.
const hcNativeIndex = new WeakMap();
function hcNative(hass, id) {
  const reg = hass?.entities;
  if (!reg) return null;
  let index = hcNativeIndex.get(reg);
  if (!index) {
    index = new Map();
    hcNativeIndex.set(reg, index);
  }
  if (index.has(id)) return index.get(id);
  const area = (e) => e?.area_id || hass.devices?.[e?.device_id]?.area_id || null;
  const name = (e) => {
    const dev = hass.devices?.[e?.device_id];
    return e?.name || dev?.name_by_user || dev?.name || hass.states?.[e?.entity_id]?.attributes?.friendly_name || e?.entity_id;
  };
  const own = reg[id];
  const natives = Object.values(reg).filter(
    (e) =>
      e.entity_id.startsWith('camera.') &&
      e.platform !== 'frigate' &&
      !e.hidden &&
      !/_sd_stream$/.test(e.entity_id) &&
      hass.states?.[e.entity_id],
  );
  const where = area(own);
  const sameArea = where ? natives.filter((e) => area(e) === where) : [];
  let found = sameArea.length === 1 ? sameArea[0] : null;
  if (!found) {
    const key = hcKey(hass.states?.[id]?.attributes?.camera_name || name(own));
    const named = (sameArea.length ? sameArea : natives).filter((e) => hcKey(name(e)) === key);
    found = named.length === 1 ? named[0] : null;
  }
  const native = found ? found.entity_id : null;
  index.set(id, native);
  return native;
}

// A camera entry, completed from its device: SD stream, privacy switch and PTZ buttons. A Frigate camera takes them
// from its native camera (controls_from, found by hcNative unless set), and its SD stream from Frigate.
function hcCamera(hass, raw, index, fc = HC_FRIGATE_DEFAULTS) {
  const cam = typeof raw === 'string' ? { camera: raw } : Object.assign({}, raw);
  const id = cam.camera || cam.entity || '';
  const st = hass?.states?.[id];
  const frigate = !!id && hcIsFrigate(hass, id);
  // Where the controls are: the camera itself, or (Frigate) its native camera
  const ctl = (cam.controls_from === false ? null : cam.controls_from || (frigate ? hcNative(hass, id) : null)) || id;
  let sd = cam.sd;
  if (sd === undefined && /_hd_stream$/.test(id)) {
    const guess = id.replace(/_hd_stream$/, '_sd_stream');
    if (hass?.states?.[guess]) sd = guess;
  }
  // Tapo Cameras (ha-tapo) names it switch.*_privacy_mode
  const privacy =
    cam.privacy === false
      ? null
      : cam.privacy || hcSibling(hass, ctl, 'switch', '_privacy') || hcSibling(hass, ctl, 'switch', '_privacy_mode') || null;
  // Tapo Cameras (ha-tapo): one camera entity whose stream is chosen by its select.*_stream_quality (hd / sd),
  // instead of an SD camera entity next to the HD one. Not for a Frigate camera: Frigate reads the camera itself.
  const quality = sd || frigate ? null : hcSibling(hass, id, 'select', '_stream_quality') || null;
  const name = cam.name || st?.attributes.friendly_name || id;
  const player = HC_PLAYERS.includes(cam.player) ? cam.player : HC_PLAYERS.includes(fc.player) ? fc.player : 'auto';
  const fname = st?.attributes?.camera_name || id.replace(/^camera\./, '');
  const motion = hcMotion(hass, cam, id);
  return {
    key: cam.id || id.replace(/^camera\./, '') || `camera_${index}`,
    camera: id,
    sd: sd || null,
    name: name,
    short: cam.short_name || name,
    privacy: privacy,
    quality: quality,
    power: cam.power || null,
    ptz: hcPtz(hass, cam, ctl, frigate ? id : null),
    motion: motion.length || ctl === id ? motion : hcMotion(hass, {}, ctl),
    player: player,
    // Frigate: its camera name and instance (the integration's proxy), and its SD stream when there is no SD entity
    frigate: frigate ? { name: fname, instance: fc.instance || st?.attributes?.client_id || '' } : null,
    // Frigate's detection and recording switches of the camera (frigate.badges)
    switches:
      frigate && fc.badges !== false
        ? [
            ['fdetect', hcSibling(hass, id, 'switch', '_detect')],
            ['frec', hcSibling(hass, id, 'switch', '_recordings')],
          ].filter(([, e]) => e)
        : [],
    sdStream: frigate && !sd && player !== 'home_assistant' && fc.sd_stream ? String(fc.sd_stream).replace('{camera}', fname) : null,
  };
}

// ── Frigate events ───────────────────────────────────────────────────────────
// The Frigate integration's own WebSocket command (frigate/events/get) gives a camera's tracked objects; their
// thumbnail and clip come through its proxy (/api/frigate/<instance>/thumbnail/<id>, …/notifications/<id>/clip.mp4),
// on paths signed by Home Assistant (an <img> or a <video> carries no token).
const HC_EVENTS_MS = 30000; // events asked again at most this often, and soon after a motion ends
const HC_LABEL_GROUPS = {
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
const HC_LABEL_ICONS = {
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
const HC_EVENT_GROUPS = ['person', 'animal', 'vehicle', 'other'];
const hcLabelGroup = (label) => HC_LABEL_GROUPS[label] || 'other';
const hcLabelIcon = (label) => HC_LABEL_ICONS[label] || 'mdi:shape-outline';
function hcLabelName(lang, label) {
  const key = `obj_${label}`;
  const txt = hcT(lang, key);
  if (txt !== key) return txt;
  const s = String(label || '').replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// The events of Frigate cameras ({ name, instance }) since `after` (epoch seconds), newest first, one request per
// Frigate instance. A failed instance gives none (the integration missing, an old version).
async function hcFetchEvents(hass, cams, { after, before, limit = 50, labels } = {}) {
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
const hcSignedCache = new Map();
async function hcSigned(hass, path) {
  const hit = hcSignedCache.get(path);
  if (hit && hit.until > Date.now()) return hit.url;
  const { path: signed } = await hass.callWS({ type: 'auth/sign_path', path, expires: 3600 });
  const url = hass.hassUrl ? hass.hassUrl(signed) : signed;
  hcSignedCache.set(path, { url, until: Date.now() + 50 * 60000 });
  return url;
}
// Thumbnails ([data-thumb] elements) signed and loaded only once they come near the screen: a long day of events
// asks for the few shown, not for hundreds.
const hcThumbIo = new WeakMap(); // root → { io, hass }
function hcLazyThumbs(hass, root) {
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
const hcFrigateBase = (instance) => `/api/frigate/${instance ? `${encodeURIComponent(instance)}/` : ''}`;
const hcThumbPath = (ev) => `${hcFrigateBase(ev.instance)}thumbnail/${encodeURIComponent(ev.id)}`;
const hcClipPath = (ev) => `${hcFrigateBase(ev.instance)}notifications/${encodeURIComponent(ev.id)}/clip.mp4`;

const hcStartOfDay = (offset = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.getTime() / 1000;
};

// "4 min ago" within the hour, the time today, else the weekday and time.
function hcWhen(lang, epoch) {
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
function hcTime(lang, epoch) {
  try {
    return new Date(epoch * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  } catch (_e) {
    return new Date(epoch * 1000).toLocaleTimeString();
  }
}
// "18 s", "1 min 12 s"; an event still going on: "in progress".
function hcDuration(lang, ev) {
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
function hcScore(lang, ev) {
  const v = ev.data?.top_score ?? ev.top_score ?? ev.data?.score ?? ev.score;
  if (typeof v !== 'number') return '';
  try {
    return new Intl.NumberFormat(lang, { style: 'percent' }).format(v);
  } catch (_e) {
    return `${Math.round(v * 100)} %`;
  }
}

// HD / SD choice of the cards without quality_entity, shared by every card of the browser.
const HC_QUALITY_KEY = 'home-camera-card-quality';
const HC_QUALITY_EVENT = 'home-camera-card-quality';

// ── Illustrated header ───────────────────────────────────────────────────────
// A camera on a wall, top right of a 200 × 80 picture drawn at the banner's right edge (its left half stays open:
// the card's text sits there), over a 10 px parquet strip that runs the banner's whole width.
// state: live (red recording light, field of view), motion (someone framed in the field of view), privacy (lens
// shut, no field of view) or offline (camera greyed, no signal). `uid` keeps each card's gradient ids apart.
// Night: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day picture
// after sunset).
function hcIsNight(hass, config) {
  const theme = config?.illustration_theme;
  if (theme === 'night') return true;
  if (theme === 'day') return false;
  return !!hass?.themes?.darkMode;
}

function hcSceneSvg(state, uid) {
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
const HC_BANNER_STYLE =
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

let hcUid = 0;

// ── home-camera-card ─────────────────────────────────────────────────────────
// A tile's player. Home Assistant's own (ha-camera-stream) starts HLS and WebRTC side by side and keeps the
// one that loads: two RTSP sessions per camera, while Tapo cameras and many others allow very few and drop
// one (go2rtc reconnecting, the image lagging, the player falling back to the slow HLS). A camera that
// offers WebRTC plays it alone here (ha-web-rtc-player: one session in go2rtc, under a second of latency);
// Home Assistant's player is the fallback, for the other cameras, the ones without a live stream (privacy
// mode: their still) and a WebRTC session that brings no video.
const HC_STREAM_FEATURE = 2;
// A camera without a live stream (HomeKit, a Tapo in privacy mode…): Home Assistant's player shows it as
// MJPEG, a multipart/x-mixed-replace <img> that Safari leaves broken. Its still is refreshed here instead,
// the next one asked once the previous one has loaded, at most one every HC_STILL_MS.
const HC_STILL_MS = 1000;
const HC_STILL_RETRY_MS = 5000;
// The card's own players (still, Frigate): fitted in the tile as Home Assistant's player is (fitMode, aspectRatio).
class HcFittedPlayer extends HTMLElement {
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
class HcCameraStill extends HcFittedPlayer {
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
const HC_FRIGATE_TIMEOUT_MS = 15000;
class HcFrigatePlayer extends HcFittedPlayer {
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

class HcCameraStream extends HTMLElement {
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

class HomeCameraCard extends HTMLElement {
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
      this._onVisibility = () => this._syncLive();
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
    return (cam.privacy && this._state(cam.privacy) === 'on') || (cam.power && this._state(cam.power) === 'off');
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
  _cameras() {
    const seen = new Set();
    return (this._config.cameras || [])
      .map((raw, i) => hcCamera(this._hass, raw, i, hcFrigateConf(this._config)))
      .filter((cam) => cam.camera)
      .map((cam, i) => {
        if (seen.has(cam.key)) cam.key = `${cam.key}_${i}`;
        seen.add(cam.key);
        return cam;
      });
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
    const sig = JSON.stringify([this._lang(), cam.ptz, full, tile._audio, frigateUrl, cam.switches]);
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
                (cam.ptz.service === 'frigate' ? ' data-service="frigate"' : ''),
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
    // Frigate (ONVIF): the camera moves until it is told to stop (_ptzStop)
    if (b.dataset.service === 'frigate') {
      this._call('frigate', 'ptz', { entity_id: b.dataset.entity, action: 'move', argument: b.dataset.dir }).catch(() => {});
      return;
    }
    this._call('button', 'press', { entity_id: b.dataset.entity }).catch(() => {});
  }

  _ptzStop(b) {
    this._call('frigate', 'ptz', { entity_id: b.dataset.entity, action: 'stop' }).catch(() => {});
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
      hcFetchEvents(this._hass, cams, { after: hcStartOfDay(), limit: 50, labels })
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
      const title = this._t(compact ? 'ev_title_short' : 'ev_title', { n });
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
          `<div class="evrow${ev.has_clip === false ? ' noclip' : ''}" data-ev="play" data-id="${hcEsc(ev.id)}" role="button" tabindex="0" title="${hcEsc(ev.has_clip === false ? this._t('ev_no_clip') : name)}">` +
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
      if (ev && ev.has_clip !== false) this._playClip(ev);
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
    // Frigate: one move from the press, a stop at the release (_stopRepeat), no repeat
    if (b.dataset.service !== 'frigate') this._repeat = setTimeout(() => {
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
    if (this._repeatBtn?.dataset.service === 'frigate' && !this._repeatBtn.classList.contains('dis')) this._ptzStop(this._repeatBtn);
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
    // Arrow keys move the camera whose pan & tilt arrows are shown (always, in fullscreen).
    if (ev.key?.startsWith('Arrow')) {
      const tile = path.find((n) => n.dataset?.cam);
      const shown = tile && (tile.classList.contains('ptz-open') || this._fullscreen(tile));
      const b = shown && tile.querySelector(`.move.${ev.key.slice(5).toLowerCase()}`);
      if (!b) return;
      ev.preventDefault();
      this._move(b);
      if (b.dataset.service === 'frigate') setTimeout(() => this._ptzStop(b), HC_PTZ_HOLD_MS);
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

  _onClick(ev) {
    const path = ev.composedPath();
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
      this._call(id.split('.')[0], 'toggle', { entity_id: id }).catch(() => {
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
        if (btn.dataset.service === 'frigate') setTimeout(() => this._ptzStop(btn), HC_PTZ_HOLD_MS);
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
function hcColumns(config, count) {
  return Math.max(1, Math.min(Number(config.columns) || 2, count));
}

// ── home-camera-card-editor (visual editor, built on HA's ha-form) ───────────
const HC_CAMERA_FIELDS = ['name', 'short_name', 'camera', 'sd', 'privacy', 'power', 'ptz', 'motion', 'controls_from', 'player'];

class HomeCameraCardEditor extends HTMLElement {
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
    const fields = {
      name: { selector: { text: {} } },
      short_name: { selector: { text: {} } },
      camera: { selector: camera, required: true },
      sd: { selector: camera },
      privacy: { selector: sw },
      power: { selector: sw },
      ptz: { selector: { text: {} } },
      motion: { selector: { entity: { domain: 'binary_sensor' } } },
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

class HomeCameraMiniCardEditor extends HomeCameraCardEditor {
  static get mini() {
    return true;
  }
}

// ── home-camera-mini-card ────────────────────────────────────────────────────
// A click in a dialog opened from the card (a camera's more-info) does not fold it back.
const hcInDialog = (ev) => ev.composedPath().some((n) => ['ha-more-info-dialog', 'ha-dialog', 'dialog'].includes(n.localName));

/**
 * Compact card: the header with its status, and a snapshot of each camera (no stream). Its detail button
 * (top right, `zoom: false` removes it) or a tap on a snapshot switches it to the full card and back; a
 * click outside the card brings the compact view back.
 */
class HomeCameraMiniCard extends HomeCameraCard {
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
// ── hc-frigate-timeline: the Events tab of the Cameras panel ─────────────────
// The day's events of the Frigate cameras of the panel's card as a timeline, grouped by hour, newest first: the day
// (previous / next), a filter by camera and by object, and a player for the selected event (its clip, or its
// camera live, and a download link). Wide: the timeline on the left, the player on the right; narrow: the player
// on top. It says how many events today has (hc-events-count), for the panel's tab.
const HC_TIMELINE_STYLE = `
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
class HcFrigateTimeline extends HTMLElement {
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
      if (day !== this._day) return;
      this._events = events;
      if (day === 0) this.dispatchEvent(new CustomEvent('hc-events-count', { detail: { count: events.length }, bubbles: true, composed: true }));
    } finally {
      this._busy = false;
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
      (ev.has_clip !== false ? `<a class="act dl" download role="button" tabindex="0"><ha-icon icon="mdi:download"></ha-icon>${hcEsc(this._t('tl_download'))}</a>` : '') +
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
    if (ev.has_clip === false) {
      screen.insertAdjacentHTML('beforeend', `<span class="hint">${hcEsc(this._t('ev_no_clip'))}</span>`);
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

class HcCameraWall extends HomeCameraCard {
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
  window.HomeCameraKit = { sceneSvg: hcSceneSvg, isNight: hcIsNight, camera: hcCamera, bannerStyle: HC_BANNER_STYLE, qualityEvent: HC_QUALITY_EVENT };
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
