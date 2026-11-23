"""Camera discovery: one entry per camera (Tapo's HD and SD streams paired), named after the device, by area."""

from homeassistant.config_entries import SOURCE_USER
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.home_camera.const import DOMAIN
from custom_components.home_camera.discovery import card_entry, discover

NONE = {"privacy": None, "ptz": None, "motion": []}


def _tapo(hass, key, device_name, area):
    """A Tapo camera: one device, an HD and an SD camera entity."""
    entry = next(iter(hass.config_entries.async_entries("tapo_control")), None)
    if entry is None:
        entry = MockConfigEntry(domain="tapo_control")
        entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("tapo_control", key)}, name=device_name
    )
    dr.async_get(hass).async_update_device(device.id, area_id=ar.async_get(hass).async_get_or_create(area).id)
    for stream in ("hd_stream", "sd_stream"):
        ent = er.async_get(hass).async_get_or_create(
            "camera",
            "tapo_control",
            f"{key}_{stream}",
            config_entry=entry,
            device_id=device.id,
            suggested_object_id=f"{key}_{stream}",
        )
        hass.states.async_set(ent.entity_id, "idle", {"friendly_name": f"{device_name} {stream}"})


async def test_tapo_streams_paired_named_by_device_sorted_by_area(hass):
    _tapo(hass, "living", "Living room camera", "Living room")
    _tapo(hass, "kids", "Kids camera", "Bedroom")
    # A camera without a device or area (YAML), and a hidden one
    hass.states.async_set("camera.terrace", "idle", {"friendly_name": "Terrace"})
    hidden = er.async_get(hass).async_get_or_create("camera", "demo", "attic", suggested_object_id="attic")
    er.async_get(hass).async_update_entity(hidden.entity_id, hidden_by=er.RegistryEntryHider.USER)
    assert discover(hass) == [
        {
            "camera": "camera.kids_hd_stream",
            "name": "Kids camera",
            "area": "Bedroom",
            "sd": "camera.kids_sd_stream",
            **NONE,
        },
        {
            "camera": "camera.living_hd_stream",
            "name": "Living room camera",
            "area": "Living room",
            "sd": "camera.living_sd_stream",
            **NONE,
        },
        {"camera": "camera.terrace", "name": "Terrace", "area": None, "sd": None, **NONE},
    ]


async def test_new_entry_starts_with_the_cameras_found(hass):
    _tapo(hass, "living", "Living room camera", "Living room")
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["options"]["card"] == {
        "cameras": [{"camera": "camera.living_hd_stream", "name": "Living room camera"}]
    }


async def test_discover_command_for_administrators(hass, hass_ws_client, hass_admin_user):
    _tapo(hass, "living", "Living room camera", "Living room")
    entry = MockConfigEntry(domain=DOMAIN, options={"card": {"cameras": []}, "title": ""})
    entry.add_to_hass(hass)
    assert await async_setup_component(hass, "lovelace", {})
    await hass.config_entries.async_setup(entry.entry_id)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/discover"})
    msg = await client.receive_json()
    assert [cam["camera"] for cam in msg["result"]["cameras"]] == ["camera.living_hd_stream"]
    hass_admin_user.groups = []
    await client.send_json_auto_id({"type": f"{DOMAIN}/discover"})
    msg = await client.receive_json()
    assert msg["error"]["code"] == "unauthorized"


def _ha_tapo(hass):
    """A Tapo Cameras camera named in French: one camera entity, translated entity ids, English translation keys."""
    entry = MockConfigEntry(domain="tapo_cameras")
    entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("tapo_cameras", "salon")}, name="Séjour"
    )
    reg = er.async_get(hass)

    def add(domain, key, object_id, device_class=None, **kw):
        ent = reg.async_get_or_create(
            domain,
            "tapo_cameras",
            f"salon_{key}",
            config_entry=entry,
            device_id=device.id,
            suggested_object_id=object_id,
            translation_key=key,
            original_device_class=device_class,
            **kw,
        )
        hass.states.async_set(ent.entity_id, "off", {"device_class": device_class} if device_class else {})
        return ent.entity_id

    add("camera", "camera", "sejour")
    reg.async_update_entity("camera.sejour", translation_key=None)
    add("switch", "privacy_mode", "sejour_mode_prive")
    for key, object_id in (
        ("move_left", "gauche"),
        ("move_right", "droite"),
        ("move_up", "monter"),
        ("move_down", "descendre"),
    ):
        add("button", key, f"sejour_{object_id}")
    add("binary_sensor", "motion", "sejour_mouvement", "motion")
    add("binary_sensor", "person", "sejour_personne", "occupancy")
    add("binary_sensor", "vehicle", "sejour_vehicule", "motion")
    add("binary_sensor", "event_subscription", "sejour_evenements", "connectivity")
    add("binary_sensor", "bark", "sejour_aboiements", "sound")


async def test_tapo_cameras_controls_found_by_translation_key(hass):
    _ha_tapo(hass)
    [cam] = discover(hass)
    assert cam["camera"] == "camera.sejour"
    assert cam["privacy"] == "switch.sejour_mode_prive"
    assert cam["ptz"] == {
        "left": "button.sejour_gauche",
        "right": "button.sejour_droite",
        "up": "button.sejour_monter",
        "down": "button.sejour_descendre",
    }
    # Motion and person, not vehicles, sounds or the subscription's connectivity
    assert cam["motion"] == ["binary_sensor.sejour_mouvement", "binary_sensor.sejour_personne"]
    assert card_entry(cam) == {
        "camera": "camera.sejour",
        "name": "Séjour",
        "privacy": "switch.sejour_mode_prive",
        "ptz": cam["ptz"],
        "motion": ["binary_sensor.sejour_mouvement", "binary_sensor.sejour_personne"],
    }


async def test_tapo_control_controls_found_by_entity_id(hass):
    _tapo(hass, "living", "Living room camera", "Living room")
    device_id = er.async_get(hass).async_get("camera.living_hd_stream").device_id
    entry = hass.config_entries.async_entries("tapo_control")[0]
    reg = er.async_get(hass)
    for object_id in ("living_privacy", "living_move_left", "living_motion"):
        domain = {"privacy": "switch", "left": "button", "motion": "binary_sensor"}[object_id.rsplit("_", 1)[1]]
        ent = reg.async_get_or_create(
            domain, "tapo_control", object_id, config_entry=entry, device_id=device_id, suggested_object_id=object_id
        )
        hass.states.async_set(ent.entity_id, "off", {"device_class": "motion"} if domain == "binary_sensor" else {})
    [cam] = discover(hass)
    assert cam["privacy"] == "switch.living_privacy"
    assert cam["ptz"] == {"left": "button.living_move_left"}
    assert cam["motion"] == ["binary_sensor.living_motion"]


def _frigate(hass, name, area=None, *, motion=True):
    """A Frigate camera: its own device (in ``area``), a camera entity and its motion sensor."""
    entry = next(iter(hass.config_entries.async_entries("frigate")), None)
    if entry is None:
        entry = MockConfigEntry(domain="frigate")
        entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("frigate", name)}, name=name.capitalize()
    )
    if area:
        dr.async_get(hass).async_update_device(device.id, area_id=ar.async_get(hass).async_get_or_create(area).id)
    reg = er.async_get(hass)
    cam = reg.async_get_or_create(
        "camera", "frigate", f"frigate:camera:{name}", config_entry=entry, device_id=device.id, suggested_object_id=name
    )
    hass.states.async_set(cam.entity_id, "streaming", {"camera_name": name, "client_id": "frigate"})
    if motion:
        sensor = reg.async_get_or_create(
            "binary_sensor",
            "frigate",
            f"frigate:motion_sensor:{name}",
            config_entry=entry,
            device_id=device.id,
            suggested_object_id=f"{name}_motion",
            original_device_class="motion",
        )
        hass.states.async_set(sensor.entity_id, "off", {"device_class": "motion"})
    return cam.entity_id


async def test_frigate_camera_takes_the_native_cameras_controls(hass):
    _ha_tapo(hass)
    reg = er.async_get(hass)
    dr.async_get(hass).async_update_device(
        reg.async_get("camera.sejour").device_id, area_id=ar.async_get(hass).async_get_or_create("Living room").id
    )
    _frigate(hass, "salon", "Living room")
    # Birdseye is Frigate's mosaic, not a camera of the home
    birdseye = reg.async_get_or_create(
        "camera", "frigate", "frigate:camera:birdseye", config_entry=hass.config_entries.async_entries("frigate")[0]
    )
    hass.states.async_set(birdseye.entity_id, "streaming")
    [cam] = discover(hass)
    assert cam["camera"] == "camera.salon"
    assert cam["frigate"] is True
    assert cam["controls_from"] == "camera.sejour"
    assert cam["privacy"] == "switch.sejour_mode_prive"
    assert cam["ptz"]["left"] == "button.sejour_gauche"
    # Frigate's own motion sensor, not the native camera's
    assert cam["motion"] == ["binary_sensor.salon_motion"]
    assert card_entry(cam) == {
        "camera": "camera.salon",
        "name": "Salon",
        "controls_from": "camera.sejour",
        "privacy": "switch.sejour_mode_prive",
        "ptz": cam["ptz"],
        "motion": "binary_sensor.salon_motion",
    }

    assert [c["camera"] for c in discover(hass, "native")] == ["camera.sejour"]
    both = discover(hass, "both")
    assert sorted(c["camera"] for c in both) == ["camera.salon", "camera.sejour"]
    assert next(c for c in both if c["camera"] == "camera.salon")["controls_from"] == "camera.sejour"


async def test_frigate_camera_paired_by_name_when_its_area_has_several(hass):
    _tapo(hass, "living", "Living room camera", "Living room")
    _tapo(hass, "garden", "Garden", "Living room")
    _frigate(hass, "garden", "Living room", motion=False)
    _frigate(hass, "attic")  # no area, no native camera of its name: listed alone
    cams = {cam["camera"]: cam for cam in discover(hass)}
    assert set(cams) == {"camera.attic", "camera.garden", "camera.living_hd_stream"}
    assert cams["camera.garden"]["controls_from"] == "camera.garden_hd_stream"
    assert "controls_from" not in cams["camera.attic"]
    assert cams["camera.attic"]["frigate"] is True


async def test_discover_command_takes_duplicates(hass, hass_ws_client):
    _tapo(hass, "living", "Living room camera", "Living room")
    _frigate(hass, "living", "Living room")
    entry = MockConfigEntry(domain=DOMAIN, options={"card": {"cameras": []}, "title": ""})
    entry.add_to_hass(hass)
    assert await async_setup_component(hass, "lovelace", {})
    await hass.config_entries.async_setup(entry.entry_id)
    client = await hass_ws_client(hass)
    for duplicates, expected in (
        (None, ["camera.living"]),
        ("native", ["camera.living_hd_stream"]),
        ("both", ["camera.living", "camera.living_hd_stream"]),
    ):
        msg = {"type": f"{DOMAIN}/discover"} | ({"duplicates": duplicates} if duplicates else {})
        await client.send_json_auto_id(msg)
        result = (await client.receive_json())["result"]
        assert sorted(cam["camera"] for cam in result["cameras"]) == expected


def _device(hass, domain, key, name, cameras, extra=()):
    """A device of `domain` with its camera entities (object ids) and other entities ((domain, object id, key))."""
    entry = next(iter(hass.config_entries.async_entries(domain)), None)
    if entry is None:
        entry = MockConfigEntry(domain=domain)
        entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={(domain, key)}, name=name
    )
    reg = er.async_get(hass)
    for object_id, features in cameras:
        ent = reg.async_get_or_create(
            "camera",
            domain,
            f"{key}_{object_id}",
            config_entry=entry,
            device_id=device.id,
            suggested_object_id=f"{key}_{object_id}",
        )
        hass.states.async_set(ent.entity_id, "idle", {"supported_features": features})
    for ent_domain, object_id, key_ in extra:
        ent = reg.async_get_or_create(
            ent_domain,
            domain,
            f"{key}_{object_id}",
            config_entry=entry,
            device_id=device.id,
            suggested_object_id=f"{key}_{object_id}",
            translation_key=key_,
        )
        hass.states.async_set(ent.entity_id, "off")


async def test_streams_of_one_device_listed_once_with_their_controls(hass):
    # Reolink: Fluent, Clear and a snapshot camera; PTZ buttons with a stop button; a privacy mode switch
    _device(
        hass,
        "reolink",
        "garden",
        "Garden",
        [("fluent", 2), ("clear", 2), ("snapshots_clear", 0)],
        [
            ("switch", "privacy_mode", "privacy_mode"),
            *(("button", f"ptz_{d}", f"ptz_{d}") for d in ("left", "right", "up", "down", "stop")),
        ],
    )
    # UniFi Protect: High and Low channels
    _device(hass, "unifiprotect", "door", "Door", [("high_resolution_channel", 2), ("low_resolution_channel", 2)])
    # ONVIF: two profiles
    _device(hass, "onvif", "attic", "Attic", [("profile000_mainstream", 2), ("profile001_substream", 2)])
    # Arlo: a camera that can be turned off, without a privacy switch
    _device(hass, "aarlo", "porch", "Porch", [("camera", 3)])
    cams = {cam["camera"]: cam for cam in discover(hass)}
    assert set(cams) == {
        "camera.garden_clear",
        "camera.door_high_resolution_channel",
        "camera.attic_profile000_mainstream",
        "camera.porch_camera",
    }
    garden = cams["camera.garden_clear"]
    assert garden["sd"] == "camera.garden_fluent"
    assert garden["privacy"] == "switch.garden_privacy_mode"
    assert garden["ptz"] == {
        "left": "button.garden_ptz_left",
        "right": "button.garden_ptz_right",
        "up": "button.garden_ptz_up",
        "down": "button.garden_ptz_down",
        "stop": "button.garden_ptz_stop",
    }
    assert cams["camera.door_high_resolution_channel"]["sd"] == "camera.door_low_resolution_channel"
    assert cams["camera.attic_profile000_mainstream"]["sd"] == "camera.attic_profile001_substream"
    # The Arlo camera is its own privacy control; the others (no on / off) have none
    assert cams["camera.porch_camera"]["privacy"] == "camera.porch_camera"
    assert cams["camera.door_high_resolution_channel"]["privacy"] is None


async def test_cameras_of_one_device_that_are_not_streams_stay_apart(hass):
    # An NVR's channels: nothing in their ids says they are streams of one camera
    _device(hass, "synology_dsm", "nvr", "NVR", [("garage", 2), ("drive", 2)])
    assert sorted(cam["camera"] for cam in discover(hass)) == ["camera.nvr_drive", "camera.nvr_garage"]
