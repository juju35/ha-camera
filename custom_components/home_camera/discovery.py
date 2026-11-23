"""Camera discovery: every camera of Home Assistant, as the card's camera entries.

One entry per camera, not per stream: Tapo has no quality selector but two camera entities per camera, a
``*_hd_stream`` and a ``*_sd_stream``. The SD one is the HD camera's SD stream, which the card pairs by itself
(its HD / SD switch, or a shared ``quality_entity``), so only the HD one is listed. Disabled and hidden cameras
are left out. Each entry is named after its device (the entity's own name when it has one), and the list is
sorted by area, then by name.

Each entry also carries the controls found on the camera's device — privacy switch, pan and tilt buttons, motion
sensors — matched by their translation key (Tapo Cameras names its entities in the user's language:
``button.salon_gauche`` is ``move_left``) or by the end of their entity id (Tapo: Cameras Control), so they show in
the panel's editor instead of being guessed by the card.

Frigate: its cameras (the Frigate integration) carry no privacy switch nor PTZ buttons, which stay on the camera's
own integration (Tapo…). A Frigate camera is paired with that native camera — the only one of its area, else the one
of its area with the same name — and ``duplicates`` says which of the two is listed: ``frigate`` (the default: the
Frigate camera, with the native one's privacy switch and PTZ buttons, ``controls_from`` naming it), ``native`` (the
native camera alone) or ``both``. Frigate's Birdseye view is not a camera of the home and is left out.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

CAMERA = "camera"
HD, SD = "_hd_stream", "_sd_stream"
PRIVACY_KEYS = ("privacy_mode", "privacy")
PTZ_DIRECTIONS = ("left", "right", "up", "down")
# Detections shown as the camera's motion badge: by translation key when the integration gives them (Tapo Cameras:
# motion and person, not vehicles or pets), else by device class
MOTION_KEYS = ("motion", "person")
MOTION_CLASSES = ("motion", "occupancy", "presence")
FRIGATE = "frigate"
BIRDSEYE = "birdseye"
DUPLICATES = ("frigate", "native", "both")


def discover(hass: HomeAssistant, duplicates: str = "frigate") -> list[dict[str, Any]]:
    """The cameras: ``{"camera", "name", "area", "sd", "privacy", "ptz", "motion"}``.

    ``sd``: the SD stream it carries; ``privacy``: switch; ``ptz``: ``{direction: button}``; ``motion``: binary sensors.
    Each is None (or empty) when not found. A Frigate camera also has ``"frigate": True`` and, when paired with its
    native camera, ``controls_from``: that camera (see the module's docstring for ``duplicates``).
    """
    entities = er.async_get(hass)
    devices = dr.async_get(hass)
    areas = ar.async_get(hass)

    ids: set[str] = set()
    for entry in entities.entities.values():
        if entry.domain == CAMERA and not entry.disabled_by and not entry.hidden_by:
            ids.add(entry.entity_id)
    # Cameras without a registry entry (set up in YAML): only their state says they exist
    ids.update(eid for eid in hass.states.async_entity_ids(CAMERA) if entities.async_get(eid) is None)

    found = []
    for eid in ids:
        if eid.endswith(SD) and eid.removesuffix(SD) + HD in ids:
            continue  # the SD stream of a listed HD camera
        entry = entities.async_get(eid)
        frigate = entry is not None and entry.platform == FRIGATE
        if frigate and (eid.endswith(f"_{BIRDSEYE}") or BIRDSEYE in (entry.unique_id or "")):
            continue
        sd = eid.removesuffix(HD) + SD if eid.endswith(HD) else None
        device = devices.async_get(entry.device_id) if entry and entry.device_id else None
        area_id = (entry.area_id if entry else None) or (device.area_id if device else None)
        area = areas.async_get_area(area_id) if area_id else None
        cam = {
            "camera": eid,
            "name": _name(hass, eid, entry, device),
            "area": area.name if area else None,
            "sd": sd if sd in ids else None,
            **_controls(hass, entities, entry.device_id if entry else None),
        }
        if frigate:
            cam["frigate"] = True
        cam["_device"] = entry.device_id if entry else None
        found.append(cam)
    found = _pair_frigate(hass, entities, found, duplicates if duplicates in DUPLICATES else "frigate")
    for cam in found:
        cam.pop("_device", None)
    return sorted(found, key=lambda cam: (cam["area"] is None, (cam["area"] or "").casefold(), cam["name"].casefold()))


def _key(name: str) -> str:
    """A name compared without case, accents nor punctuation: "Séjour cam" and "sejour_cam" match."""
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", plain.casefold())


def _native(cam: dict[str, Any], natives: list[dict[str, Any]]) -> dict[str, Any] | None:
    """The native camera of a Frigate camera: the only one of its area, else the one of its area with its name."""
    same_area = [n for n in natives if n["area"] == cam["area"]] if cam["area"] else []
    if len(same_area) == 1:
        return same_area[0]
    named = [n for n in (same_area or natives) if _key(n["name"]) == _key(cam["name"])]
    return named[0] if len(named) == 1 else None


def _pair_frigate(
    hass: HomeAssistant, entities: er.EntityRegistry, found: list[dict[str, Any]], duplicates: str
) -> list[dict[str, Any]]:
    """Each Frigate camera paired with its native camera; the list kept as ``duplicates`` says."""
    natives = [cam for cam in found if not cam.get("frigate")]
    taken: set[str] = set()
    drop: set[str] = set()
    for cam in found:
        if not cam.get("frigate"):
            continue
        native = _native(cam, [n for n in natives if n["camera"] not in taken])
        if native is None:
            continue
        taken.add(native["camera"])
        if duplicates == "native":
            drop.add(cam["camera"])
            continue
        if duplicates == "frigate":
            drop.add(native["camera"])
        # Privacy and PTZ from the native camera; motion from Frigate's detections, else the native camera's
        controls = _controls(hass, entities, native["_device"])
        cam["controls_from"] = native["camera"]
        cam["privacy"] = controls["privacy"]
        cam["ptz"] = controls["ptz"]
        cam["motion"] = cam["motion"] or controls["motion"]
    return [cam for cam in found if cam["camera"] not in drop]


def _controls(hass: HomeAssistant, entities: er.EntityRegistry, device_id: str | None) -> dict[str, Any]:
    """Privacy switch, pan and tilt buttons and motion sensors of the camera's device."""
    if not device_id:
        return {"privacy": None, "ptz": None, "motion": []}
    siblings = [e for e in er.async_entries_for_device(entities, device_id) if not e.disabled_by and not e.hidden_by]

    def find(domain: str, key: str) -> str | None:
        own = [e for e in siblings if e.domain == domain]
        match = next((e for e in own if e.translation_key == key), None) or next(
            (e for e in own if e.entity_id.endswith(f"_{key}")), None
        )
        return match.entity_id if match else None

    privacy = next((found for key in PRIVACY_KEYS if (found := find("switch", key))), None)
    ptz = {d: found for d in PTZ_DIRECTIONS if (found := find("button", f"move_{d}"))}
    sensors = [e for e in siblings if e.domain == "binary_sensor"]
    motion = [e.entity_id for e in sensors if e.translation_key in MOTION_KEYS]
    if not motion:
        motion = [
            e.entity_id
            for e in sensors
            if (e.device_class or e.original_device_class) in MOTION_CLASSES
            or (not (e.device_class or e.original_device_class) and _state_class(hass, e.entity_id) in MOTION_CLASSES)
        ]
    return {"privacy": privacy, "ptz": ptz or None, "motion": sorted(motion)}


def _state_class(hass: HomeAssistant, entity_id: str) -> str | None:
    state = hass.states.get(entity_id)
    return state.attributes.get("device_class") if state else None


def _name(hass: HomeAssistant, entity_id: str, entry: er.RegistryEntry | None, device: dr.DeviceEntry | None) -> str:
    """The name a person gave (entity, then device), else the device's, else the state's friendly name."""
    if entry and entry.name:
        return entry.name
    if device and (device.name_by_user or device.name):
        return device.name_by_user or device.name
    state = hass.states.get(entity_id)
    if state and state.attributes.get("friendly_name"):
        return state.attributes["friendly_name"]
    return entity_id.split(".", 1)[1].replace("_", " ").capitalize()


def card_entry(cam: dict[str, Any]) -> dict[str, Any]:
    """A discovered camera as a camera entry of the card, with the controls found."""
    entry: dict[str, Any] = {"camera": cam["camera"], "name": cam["name"]}
    for key in ("controls_from", "privacy", "ptz"):
        if cam.get(key):
            entry[key] = cam[key]
    if cam.get("motion"):
        entry["motion"] = cam["motion"][0] if len(cam["motion"]) == 1 else cam["motion"]
    return entry


def card_entries(cameras: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The discovered cameras as camera entries of the card."""
    return [card_entry(cam) for cam in cameras]
