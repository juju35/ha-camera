"""Constants for the Home Camera integration."""

DOMAIN = "home_camera"
VERSION = "4.12.3"

# Files served by the integration (their own base, so the panel's route never shadows them)
URL_BASE = f"/{DOMAIN}"
CARD_URL = f"{URL_BASE}/home-camera-card.js"
PANEL_URL = f"{URL_BASE}/home-camera-panel.js"
# Resource of the card installed as a Marketplace dashboard plugin before 4.0, replaced by the integration's
LEGACY_CARD_PATH = "ha-home-camera-card/home-camera-card.js"
# Folders under www/community/ where that dashboard plugin lives (before and after the repository was renamed):
# while one is there, the Marketplace keeps a Dashboard entry whose updates fail, so a repair says to remove it
LEGACY_PLUGIN_DIRS = ("ha-home-camera-card", "ha-camera")
ISSUE_LEGACY_DASHBOARD = "legacy_dashboard_install"
# The Marketplace's records (.storage/marketplace.repositories, keyed by GitHub repository id): a record of this
# repository under another category than integration (the Dashboard one of before 4.0) fails every install and update,
# even with nothing left in www/community/, and uninstalling keeps it under Added from links
MARKETPLACE_STORE = "marketplace.repositories"
REPOSITORY_ID = "1430837094"
REPOSITORY_URL = "https://github.com/juju35/ha-camera"
REPOSITORY_NAMES = ("juju35/ha-camera", "juju35/ha-home-camera-card")

# The sidebar panel: every user sees it, only administrators get its Settings tab
PANEL_PATH = "cameras"
PANEL_ICON = "mdi:cctv"
PANEL_ELEMENT = "home-camera-panel"

# Options of the config entry, edited in the panel's Settings tab
CONF_CARD = "card"  # the home-camera-card configuration the panel shows
CONF_TITLE = "title"  # sidebar title, empty: "Cameras" in the server's language
# The panel's top bar (title, tabs): shown, hidden for the users who are not administrators, or hidden for everyone
CONF_HIDE_TOOLBAR = "hide_toolbar"
HIDE_TOOLBAR_CHOICES = ("never", "users", "everyone")
DEFAULTS = {CONF_CARD: {"cameras": []}, CONF_TITLE: "", CONF_HIDE_TOOLBAR: "never"}
MAX_CAMERAS = 64
MAX_TITLE_LENGTH = 50
MAX_CARD_SIZE = 32_000  # bytes of the card configuration, as JSON

# Sidebar title when none is set, in the server's language (the frontend cannot translate a panel's title)
TITLES = {
    "en": "Cameras",
    "fr": "Caméras",
    "de": "Kameras",
    "es": "Cámaras",
    "sr": "Камере",
    "sr-Latn": "Kamere",
    "it": "Telecamere",
    "nl": "Camera's",
    "pt": "Câmaras",
    "pl": "Kamery",
    "ro": "Camere",
    "da": "Kameraer",
    "sv": "Kameror",
    "bg": "Камери",
    "ru": "Камеры",
    "uk": "Камери",
    "hu": "Kamerák",
    "sk": "Kamery",
    "cs": "Kamery",
    "sl": "Kamere",
    "lv": "Kameras",
    "el": "Κάμερες",
}

# Sent to the panels' subscriptions when the settings change
SIGNAL_UPDATED = f"{DOMAIN}_updated"
